/**
 * Visitor accounts, as an `@odoro-cli/server` module.
 *
 *   POST   /api/accounts/sign-up        { email, password }   always { ok: true }
 *   POST   /api/accounts/verify         { token }             the verification link
 *   POST   /api/accounts/sign-in        { email, password }   sets the session
 *   POST   /api/accounts/link           { email }             always { ok: true }
 *   POST   /api/accounts/link/open      { token }             sets the session
 *   POST   /api/accounts/reset/request  { email }             always { ok: true }
 *   POST   /api/accounts/reset          { token, password }   closes every session
 *   POST   /api/accounts/sign-out
 *   GET    /api/accounts/me                                   { connecte, compte? }
 *   POST   /api/accounts/delete         { password? }         erases the account
 *
 * The session is an HttpOnly cookie: the page's script never reads it.
 * `whoIsSignedIn` gives other modules (the buyer area) the same answer.
 *
 * @module
 */

import { ApiError, defineModule, route, type Cookies } from '@odoro-cli/server'
import { z } from 'zod'

import {
  AccountError,
  SESSION_MAX_AGE,
  accountOf,
  deleteAccount,
  openLink,
  requestLink,
  requestReset,
  resetPassword,
  signIn,
  signOut,
  signUp,
  verifyEmail,
  type AccountMail,
  type Query,
} from './accounts.js'

/** The session cookie. */
export const ACCOUNT_COOKIE = 'odoro_compte'

export interface AccountsOptions {
  /** The site's database, with the `accounts` capability. */
  readonly db: Query
  /** Where the e-mails leave. */
  readonly mail: AccountMail
  /** `false` only in tests over plain HTTP. */
  readonly secureCookie?: boolean
}

/** The person signed in on this request, for other modules. */
export function whoIsSignedIn(db: Query) {
  return async (cookies: Cookies) => {
    const account = await accountOf(db, cookies.get(ACCOUNT_COOKIE))
    return account === null ? null : { id: account.id, email: account.email }
  }
}

function translate(cause: unknown): never {
  if (cause instanceof AccountError) {
    if (cause.status === 401) {
      throw new ApiError('UNAUTHORIZED', cause.message, {
        extensions: { erreur: cause.message },
      })
    }
    throw new ApiError('VALIDATION', cause.message, {
      extensions: { erreur: cause.message },
    })
  }
  throw cause
}

async function answer<T>(work: () => Promise<T>): Promise<T> {
  try {
    return await work()
  } catch (cause) {
    return translate(cause)
  }
}

const email = z.object({ email: z.string().max(254) })
const credentials = z.object({
  email: z.string().max(254),
  password: z.string().max(1000),
})
const token = z.object({ token: z.string().max(200) })

export function createAccountsModule(options: AccountsOptions) {
  const { db, mail } = options

  function keep(cookies: Cookies, session: string): void {
    cookies.set(ACCOUNT_COOKIE, session, {
      httpOnly: true,
      sameSite: 'lax',
      maxAge: SESSION_MAX_AGE,
      ...(options.secureCookie === false ? { secure: false } : {}),
    })
  }

  const routes = [
    route({
      name: 'accounts.signUp',
      method: 'POST',
      path: '/api/accounts/sign-up',
      auth: 'public',
      input: credentials,
      handler: async ({ input }) =>
        await answer(async () => {
          await signUp(db, mail, input)
          return { ok: true }
        }),
    }),
    route({
      name: 'accounts.verify',
      method: 'POST',
      path: '/api/accounts/verify',
      auth: 'public',
      input: token,
      handler: async ({ input }) => {
        if (!(await verifyEmail(db, input.token))) {
          const message = 'Ce lien est périmé ou a déjà servi.'
          throw new ApiError('VALIDATION', message, { extensions: { erreur: message } })
        }
        return { ok: true }
      },
    }),
    route({
      name: 'accounts.signIn',
      method: 'POST',
      path: '/api/accounts/sign-in',
      auth: 'public',
      input: credentials,
      handler: async ({ input, cookies }) =>
        await answer(async () => {
          keep(cookies, await signIn(db, input))
          return { ok: true }
        }),
    }),
    route({
      name: 'accounts.link',
      method: 'POST',
      path: '/api/accounts/link',
      auth: 'public',
      input: email,
      handler: async ({ input }) =>
        await answer(async () => {
          await requestLink(db, mail, input)
          return { ok: true }
        }),
    }),
    route({
      name: 'accounts.openLink',
      method: 'POST',
      path: '/api/accounts/link/open',
      auth: 'public',
      input: token,
      handler: async ({ input, cookies }) => {
        const session = await openLink(db, input.token)
        if (session === null) {
          const message =
            'Ce lien de connexion est périmé ou a déjà servi. Demandez-en un nouveau.'
          throw new ApiError('UNAUTHORIZED', message, { extensions: { erreur: message } })
        }
        keep(cookies, session)
        return { ok: true }
      },
    }),
    route({
      name: 'accounts.requestReset',
      method: 'POST',
      path: '/api/accounts/reset/request',
      auth: 'public',
      input: email,
      handler: async ({ input }) =>
        await answer(async () => {
          await requestReset(db, mail, input)
          return { ok: true }
        }),
    }),
    route({
      name: 'accounts.reset',
      method: 'POST',
      path: '/api/accounts/reset',
      auth: 'public',
      input: z.object({ token: z.string().max(200), password: z.string().max(1000) }),
      handler: async ({ input, cookies }) =>
        await answer(async () => {
          await resetPassword(db, input)
          cookies.clear(ACCOUNT_COOKIE)
          return { ok: true }
        }),
    }),
    route({
      name: 'accounts.signOut',
      method: 'POST',
      path: '/api/accounts/sign-out',
      auth: 'public',
      handler: async ({ cookies }) => {
        await signOut(db, cookies.get(ACCOUNT_COOKIE))
        cookies.clear(ACCOUNT_COOKIE)
        return { ok: true }
      },
    }),
    route({
      name: 'accounts.me',
      method: 'GET',
      path: '/api/accounts/me',
      auth: 'public',
      handler: async ({ cookies }) => {
        const account = await accountOf(db, cookies.get(ACCOUNT_COOKIE))
        if (account === null) return { connecte: false }
        return {
          connecte: true,
          compte: { email: account.email, verifie: account.verified },
        }
      },
    }),
    route({
      name: 'accounts.delete',
      method: 'POST',
      path: '/api/accounts/delete',
      auth: 'public',
      input: z.object({ password: z.string().max(1000).optional() }),
      handler: async ({ input, cookies }) =>
        await answer(async () => {
          const account = await accountOf(db, cookies.get(ACCOUNT_COOKIE))
          if (account === null) {
            const message = 'Connectez-vous pour supprimer votre compte.'
            throw new ApiError('UNAUTHORIZED', message, {
              extensions: { erreur: message },
            })
          }
          await deleteAccount(db, account, input)
          cookies.clear(ACCOUNT_COOKIE)
          return { ok: true }
        }),
    }),
  ]

  return defineModule({ name: 'accounts', routes: routes as never })
}

/**
 * Authentication module — register, sign in, sign out, read your profile.
 *
 * ## What this demonstration is, and what it is not
 *
 * It is a working account system: a password hashed with `scrypt`, a session
 * in a table, an `httpOnly` cookie. It is the shape to start from, and it is
 * deliberately small enough to be read in full before being trusted.
 *
 * It is not a complete product. There is no email confirmation, no password
 * reset, no rate limit on login, no second factor. Each one is a deliberate
 * addition, and naming them here is more honest than implying they are handled.
 *
 * ## Why the session is a cookie, and not a token in the page
 *
 * A token kept in `localStorage` is readable by any script that manages to run
 * on the page. An `httpOnly` cookie is not: the browser sends it and never
 * hands it over. The cost is a `sameSite` policy to think about, which the
 * kernel sets to `lax` — enough to block the ordinary cross-site form post,
 * while an ordinary link still arrives signed in.
 *
 * ## Why signing in says so little
 *
 * A wrong email and a wrong password give the **same** answer. Distinguishing
 * them turns the login form into a way to ask whether an address has an
 * account here — which is exactly what someone assembling a list wants.
 *
 * @module
 */

import {
  ConflictError,
  UnauthorizedError,
  defineModule,
  route,
} from '@odoro-cli/server'
import type { Request } from 'express'
import { z } from 'zod'

import { hashPassword, verifyPassword } from './password.js'
import { SESSION_TTL, createAuthStore, type Account, type AuthStore } from './store.js'

/** Name of the session cookie. */
export const SESSION_COOKIE = 'odoro_session'

/** What a profile shows. */
const profile = z.object({
  id: z.string(),
  email: z.string(),
  name: z.string(),
  createdAt: z.string(),
})

/** What registering asks for. */
const registration = z.object({
  email: z.string().email().max(320),
  name: z.string().min(1).max(80),
  // Length is the only rule that holds: a composition rule pushes people
  // towards "Password1!" and nothing else.
  password: z.string().min(12).max(200),
})

/** What signing in asks for. */
const credentials = z.object({
  email: z.string().email().max(320),
  password: z.string().min(1).max(200),
})

/** Renders an account as the interface reads it. */
function render(account: Account): z.infer<typeof profile> {
  return {
    id: account.id,
    email: account.email,
    name: account.name,
    createdAt: account.createdAt.toISOString(),
  }
}

/** Reads the session cookie of a request, without a parser dependency. */
export function readSessionCookie(request: Request): string | undefined {
  const header = request.headers.cookie
  if (header === undefined) return undefined

  for (const part of header.split(';')) {
    const cut = part.indexOf('=')
    if (cut === -1) continue
    if (part.slice(0, cut).trim() !== SESSION_COOKIE) continue
    return decodeURIComponent(part.slice(cut + 1).trim())
  }
  return undefined
}

/**
 * Builds the guard the kernel calls on every request.
 *
 * @example
 * createApp({ authenticate: createAuthenticator(store), … })
 */
export function createAuthenticator(store: AuthStore) {
  return async (request: Request) => {
    const sessionId = readSessionCookie(request)
    if (sessionId === undefined) return undefined

    const session = await store.readSession(sessionId)
    if (session === undefined) return undefined

    return { id: session.userId, sessionId, organizationId: undefined }
  }
}

/**
 * The module, and the store it owns.
 *
 * The store comes back out because the guard needs it too, and because whoever
 * closes the server has to close its connections.
 *
 * ## Why the store can be handed in
 *
 * By default the module opens its own, on `DATABASE_URL`. A test hands in a
 * different one and drives the four routes without a database — which is the
 * only way to check the cookie, the guard and the answers without provisioning
 * a server for it.
 *
 * @param store The store to use. Absent, one is opened on `DATABASE_URL`.
 *
 * @example
 * const auth = createAuthModule(config)
 * createApp({ modules: [auth.module], authenticate: auth.authenticate, … })
 */
export function createAuthModule(
  config: { DATABASE_URL: string },
  store: AuthStore = createAuthStore(config.DATABASE_URL),
) {

  const module = defineModule({
    name: 'auth',
    routes: [
      route({
        name: 'auth.register',
        method: 'POST',
        path: '/api/auth/register',
        auth: 'public',
        summary: 'Creates an account and signs it in.',
        input: registration,
        output: profile,
        handler: async ({ input, cookies }) => {
          const email = input.email.trim().toLowerCase()

          if ((await store.byEmail(email)) !== undefined) {
            throw new ConflictError('This address already has an account.')
          }

          const account = await store.create(
            email,
            input.name.trim(),
            await hashPassword(input.password),
          )

          cookies.set(SESSION_COOKIE, await store.openSession(account.id), {
            maxAge: SESSION_TTL,
          })

          return render(account)
        },
      }),

      route({
        name: 'auth.login',
        method: 'POST',
        path: '/api/auth/login',
        auth: 'public',
        summary: 'Signs in.',
        input: credentials,
        output: profile,
        handler: async ({ input, cookies }) => {
          const account = await store.byEmail(input.email.trim().toLowerCase())

          // The same answer in both cases, and the hash is computed even when
          // the account is absent: answering faster for an unknown address
          // would tell, by the delay alone, which addresses exist.
          const stored =
            account?.password ??
            'scrypt$65536$8$1$00000000000000000000000000000000$00'
          const matches = await verifyPassword(input.password, stored)

          if (account === undefined || !matches) {
            throw new UnauthorizedError('Wrong address or password.')
          }

          cookies.set(SESSION_COOKIE, await store.openSession(account.id), {
            maxAge: SESSION_TTL,
          })

          return render(account)
        },
      }),

      route({
        name: 'auth.logout',
        method: 'POST',
        path: '/api/auth/logout',
        auth: 'optional',
        summary: 'Signs out.',
        handler: async ({ user, cookies }) => {
          // The cookie goes in every case: a session already unknown to the
          // table must not leave a cookie behind that the browser keeps
          // sending for a month.
          if (user !== undefined) await store.closeSession(user.sessionId)
          cookies.clear(SESSION_COOKIE)
        },
      }),

      route({
        name: 'auth.me',
        method: 'GET',
        path: '/api/auth/me',
        auth: 'required',
        summary: 'The profile of the signed-in account.',
        output: profile,
        handler: async ({ user, cookies }) => {
          const account = await store.byId(user.id)

          // The session names an account that is gone: the cookie is stale,
          // and keeping it would make every request fail the same way.
          if (account === undefined) {
            await store.closeSession(user.sessionId)
            cookies.clear(SESSION_COOKIE)
            throw new UnauthorizedError('This account no longer exists.')
          }

          return render(account)
        },
      }),
    ] as never,
  })

  return { module, store, authenticate: createAuthenticator(store) }
}

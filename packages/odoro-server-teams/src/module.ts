/**
 * Teams, as an `@odoro-cli/server` module. Who is signed in comes from
 * `@odoro-cli/server-accounts` (its session cookie).
 *
 *   GET  /api/teams                    { connecte, equipes, courante }
 *   POST /api/teams                    { nom }                 create; I am its owner
 *   POST /api/teams/current            { equipe }              work in this team
 *   GET  /api/teams/members?equipe=    { membres, invitations }
 *   POST /api/teams/invite             { equipe, email, role }
 *   POST /api/teams/join               { jeton }               accept: signs in, joins
 *   POST /api/teams/role               { equipe, membre, role }
 *   POST /api/teams/remove             { equipe, membre }      or leave (membre = me)
 *   POST /api/teams/delete             { equipe }
 *
 * The team a request works in is a cookie (`odoro_equipe`), checked against
 * the memberships at every request: a cookie never grants a team. `whichTeam`
 * gives other modules — and the site's typed tables — the same answer.
 *
 * @module
 */

import { ApiError, defineModule, route, type Cookies } from '@odoro-cli/server'
import {
  ACCOUNT_COOKIE,
  AccountError,
  SESSION_MAX_AGE,
  accountOf,
  signInWithProvenAddress,
  type Account,
  type Query,
} from '@odoro-cli/server-accounts'
import { z } from 'zod'

import {
  TeamError,
  addMember,
  consumeInvitation,
  createTeam,
  currentTeam,
  deleteTeam,
  invite,
  membersOf,
  removeMember,
  setRole,
  teamsOf,
  type Team,
  type TeamMail,
} from './teams.js'

/** The cookie that names the team a visitor works in. */
export const TEAM_COOKIE = 'odoro_equipe'

export interface TeamsOptions {
  /** The site's database, with the `accounts` and `teams` capabilities. */
  readonly db: Query
  /** Where invitations leave. */
  readonly mail: TeamMail
  /** `false` only in tests over plain HTTP. */
  readonly secureCookie?: boolean
}

/** The team this request works in, for other modules — null without a session or a team. */
export function whichTeam(db: Query) {
  return async (cookies: Cookies): Promise<Team | null> => {
    const account = await accountOf(db, cookies.get(ACCOUNT_COOKIE))
    if (account === null) return null
    return await currentTeam(db, account.id, cookies.get(TEAM_COOKIE))
  }
}

const STATUS = {
  401: 'UNAUTHORIZED',
  403: 'FORBIDDEN',
  404: 'NOT_FOUND',
  409: 'CONFLICT',
  422: 'VALIDATION',
  429: 'RATE_LIMIT',
} as const

function refuse(status: keyof typeof STATUS, message: string): never {
  throw new ApiError(STATUS[status], message, { extensions: { erreur: message } })
}

async function answer<T>(work: () => Promise<T>): Promise<T> {
  try {
    return await work()
  } catch (cause) {
    if (cause instanceof TeamError) refuse(cause.status, cause.message)
    if (cause instanceof AccountError)
      refuse(cause.status === 401 ? 401 : 422, cause.message)
    throw cause
  }
}

export function createTeamsModule(options: TeamsOptions) {
  const { db, mail } = options
  const cookie = {
    httpOnly: true,
    sameSite: 'lax' as const,
    maxAge: SESSION_MAX_AGE,
    ...(options.secureCookie === false ? { secure: false } : {}),
  }

  async function signedIn(cookies: Cookies): Promise<Account> {
    const account = await accountOf(db, cookies.get(ACCOUNT_COOKIE))
    if (account === null) refuse(401, 'Connectez-vous pour travailler en équipe.')
    return account
  }

  const team = z.object({ equipe: z.string().max(64) })

  const routes = [
    route({
      name: 'teams.list',
      method: 'GET',
      path: '/api/teams',
      auth: 'public',
      handler: async ({ cookies }) => {
        const account = await accountOf(db, cookies.get(ACCOUNT_COOKIE))
        if (account === null) return { connecte: false, equipes: [], courante: null }
        const teams = await teamsOf(db, account.id)
        const current = await currentTeam(db, account.id, cookies.get(TEAM_COOKIE))
        return {
          connecte: true,
          equipes: teams.map((t) => ({ id: t.id, nom: t.name, role: t.role })),
          courante: current?.id ?? null,
        }
      },
    }),
    route({
      name: 'teams.create',
      method: 'POST',
      path: '/api/teams',
      auth: 'public',
      input: z.object({ nom: z.string().max(200) }),
      handler: async ({ input, cookies }) =>
        await answer(async () => {
          const account = await signedIn(cookies)
          const created = await createTeam(db, account.id, input.nom)
          cookies.set(TEAM_COOKIE, created.id, cookie)
          return { equipe: { id: created.id, nom: created.name, role: created.role } }
        }),
    }),
    route({
      name: 'teams.current',
      method: 'POST',
      path: '/api/teams/current',
      auth: 'public',
      input: team,
      handler: async ({ input, cookies }) =>
        await answer(async () => {
          const account = await signedIn(cookies)
          const chosen = await currentTeam(db, account.id, input.equipe)
          if (chosen === null || chosen.id !== input.equipe) {
            throw new TeamError(404, 'Cette équipe est introuvable.')
          }
          cookies.set(TEAM_COOKIE, chosen.id, cookie)
          return { courante: chosen.id }
        }),
    }),
    route({
      name: 'teams.members',
      method: 'GET',
      path: '/api/teams/members',
      auth: 'public',
      input: team,
      handler: async ({ input, cookies }) =>
        await answer(async () => {
          const account = await signedIn(cookies)
          const { members, invitations } = await membersOf(db, input.equipe, account.id)
          return {
            membres: members.map((m) => ({ id: m.id, email: m.email, role: m.role })),
            invitations: invitations.map((i) => ({
              email: i.email,
              role: i.role,
              expire: i.expiresAt,
            })),
          }
        }),
    }),
    route({
      name: 'teams.invite',
      method: 'POST',
      path: '/api/teams/invite',
      auth: 'public',
      input: z.object({
        equipe: z.string().max(64),
        email: z.string().max(254),
        role: z.enum(['admin', 'membre']).optional(),
      }),
      handler: async ({ input, cookies }) =>
        await answer(async () => {
          const account = await signedIn(cookies)
          await invite(db, mail, {
            teamId: input.equipe,
            byUserId: account.id,
            email: input.email,
            role: input.role ?? 'membre',
          })
          return { ok: true }
        }),
    }),
    route({
      name: 'teams.join',
      method: 'POST',
      path: '/api/teams/join',
      auth: 'public',
      input: z.object({ jeton: z.string().max(200) }),
      handler: async ({ input, cookies }) =>
        await answer(async () => {
          const opened = await consumeInvitation(db, input.jeton)
          if (opened === null) {
            throw new TeamError(422, 'Cette invitation est périmée ou a déjà servi.')
          }
          // The link came to this address: opening it proves the address.
          const { session, account } = await signInWithProvenAddress(db, opened.email)
          await addMember(db, opened.teamId, account.id, opened.role)
          cookies.set(ACCOUNT_COOKIE, session, cookie)
          cookies.set(TEAM_COOKIE, opened.teamId, cookie)
          return { equipe: opened.teamId }
        }),
    }),
    route({
      name: 'teams.role',
      method: 'POST',
      path: '/api/teams/role',
      auth: 'public',
      input: z.object({
        equipe: z.string().max(64),
        membre: z.string().max(64),
        role: z.enum(['proprietaire', 'admin', 'membre']),
      }),
      handler: async ({ input, cookies }) =>
        await answer(async () => {
          const account = await signedIn(cookies)
          await setRole(db, {
            teamId: input.equipe,
            byUserId: account.id,
            userId: input.membre,
            role: input.role,
          })
          return { ok: true }
        }),
    }),
    route({
      name: 'teams.remove',
      method: 'POST',
      path: '/api/teams/remove',
      auth: 'public',
      input: z.object({ equipe: z.string().max(64), membre: z.string().max(64) }),
      handler: async ({ input, cookies }) =>
        await answer(async () => {
          const account = await signedIn(cookies)
          await removeMember(db, {
            teamId: input.equipe,
            byUserId: account.id,
            userId: input.membre,
          })
          return { ok: true }
        }),
    }),
    route({
      name: 'teams.delete',
      method: 'POST',
      path: '/api/teams/delete',
      auth: 'public',
      input: team,
      handler: async ({ input, cookies }) =>
        await answer(async () => {
          const account = await signedIn(cookies)
          await deleteTeam(db, { teamId: input.equipe, byUserId: account.id })
          return { ok: true }
        }),
    }),
  ]

  return defineModule({ name: 'teams', routes: routes as never })
}

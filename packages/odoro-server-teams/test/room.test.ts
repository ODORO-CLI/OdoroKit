/**
 * A team bounded by its site: `canAddMember` is asked before inviting and
 * before an invitation is accepted — the seats a team has paid for, in a
 * site that bills its teams.
 *
 * Played on a real PostgreSQL when `COMMERCE_TEST_URL` names one.
 */

import { randomUUID } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import {
  createApp,
  createContainer,
  createLogger,
  loadConfig,
  type KernelConfig,
} from '@odoro-cli/server'
import { createAccountsModule } from '@odoro-cli/server-accounts'
import pg from 'pg'
import request from 'supertest'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import {
  TEAM_FULL,
  acceptInvitation,
  createTeamsModule,
  invite,
  type TeamMail,
} from '../src/index.js'

const HERE = dirname(fileURLToPath(import.meta.url))
const adminUrl = process.env['COMMERCE_TEST_URL']
const gated = adminUrl === undefined || adminUrl === '' ? describe.skip : describe

gated('a team has room, or it does not', () => {
  const name = `places_${randomUUID().replaceAll('-', '').slice(0, 12)}`
  let pool: pg.Pool
  let server: ReturnType<typeof createApp>['express']
  const sent: { email: string; token: string }[] = []
  const mail: TeamMail = {
    send: async (m) => {
      sent.push({ email: m.email, token: m.token })
      await Promise.resolve()
    },
  }
  const invitationFor = (email: string) =>
    [...sent].reverse().find((m) => m.email === email)?.token as string

  /** The places the site gives each team; what the hook answers when it is full. */
  let places = 2
  let refusal: false | string = false
  const asked: string[] = []
  const members = async (team: string) =>
    (
      await pool.query<{ n: number }>(
        'SELECT count(*)::int AS n FROM teams.members WHERE team_id = $1',
        [team],
      )
    ).rows[0]!.n
  const canAddMember = async (team: string) => {
    asked.push(team)
    return (await members(team)) < places ? true : refusal
  }

  beforeAll(async () => {
    const admin = new pg.Client({ connectionString: adminUrl })
    await admin.connect()
    await admin.query(`CREATE DATABASE "${name}"`)
    await admin.end()
    const url = new URL(adminUrl as string)
    url.pathname = `/${name}`
    pool = new pg.Pool({ connectionString: url.toString(), max: 3 })
    await pool.query(readFileSync(join(HERE, 'fixtures', 'accounts-1.0.0.sql'), 'utf8'))
    await pool.query(readFileSync(join(HERE, 'fixtures', 'teams-1.0.0.sql'), 'utf8'))
    const config = { ...loadConfig(undefined, { NODE_ENV: 'test' }) } as KernelConfig
    server = createApp({
      config,
      logger: createLogger({ level: 'silent' }),
      container: createContainer() as never,
      modules: [
        createAccountsModule({
          db: pool,
          mail: { send: async () => {} },
          secureCookie: false,
        }) as never,
        createTeamsModule({ db: pool, mail, secureCookie: false, canAddMember }) as never,
      ],
    }).express
  }, 60_000)

  afterAll(async () => {
    await pool?.end()
    const admin = new pg.Client({ connectionString: adminUrl })
    await admin.connect()
    await admin.query(`DROP DATABASE IF EXISTS "${name}" WITH (FORCE)`)
    await admin.end()
  }, 60_000)

  const cookiesOf = (res: { headers: Record<string, unknown> }) =>
    ((res.headers['set-cookie'] as string[] | undefined) ?? [])
      .map((l) => l.split(';')[0])
      .join('; ')
  const post = (path: string, body: unknown, cookie = '') =>
    request(server)
      .post(path)
      .set('Cookie', cookie)
      .send(body as object)

  let claire = ''
  let team = ''

  it('an owner creates a team: one place taken of two', async () => {
    await post('/api/accounts/sign-up', {
      email: 'claire@exemple.fr',
      password: 'correct cheval batterie',
    })
    claire = cookiesOf(
      await post('/api/accounts/sign-in', {
        email: 'claire@exemple.fr',
        password: 'correct cheval batterie',
      }),
    )
    const res = await post('/api/teams', { nom: 'Atelier' }, claire)
    team = res.body.equipe.id
    claire = `${claire}; ${cookiesOf(res)}`
    expect(await members(team)).toBe(1)
  })

  it('🔴 a full team refuses an invitation, with the site’s sentence or the module’s', async () => {
    const ines = await post(
      '/api/teams/invite',
      { equipe: team, email: 'ines@exemple.fr' },
      claire,
    )
    expect(ines.status).toBe(200)
    // The place is taken when the invitation is ACCEPTED, not when it leaves.
    await post('/api/teams/invite', { equipe: team, email: 'hugo@exemple.fr' }, claire)
    expect(asked).toEqual([team, team])

    const joined = await post('/api/teams/join', {
      jeton: invitationFor('ines@exemple.fr'),
    })
    expect(joined.status).toBe(200)
    expect(await members(team)).toBe(2)

    const full = await post(
      '/api/teams/invite',
      { equipe: team, email: 'zoe@exemple.fr' },
      claire,
    )
    expect(full.status).toBe(409)
    expect(full.body.erreur).toBe(TEAM_FULL)
    refusal = 'Votre formule compte 2 sièges.'
    const said = await post(
      '/api/teams/invite',
      { equipe: team, email: 'zoe@exemple.fr' },
      claire,
    )
    expect(said.status).toBe(409)
    expect(said.body.erreur).toBe('Votre formule compte 2 sièges.')
    expect(sent.map((m) => m.email)).not.toContain('zoe@exemple.fr')
  })

  it('🔴 a full team refuses an acceptance — and the invitation stays for when a place frees up', async () => {
    const token = invitationFor('hugo@exemple.fr')
    const refused = await post('/api/teams/join', { jeton: token })
    expect(refused.status).toBe(409)
    expect(refused.body.erreur).toBe('Votre formule compte 2 sièges.')
    expect(await members(team)).toBe(2)
    // Hugo has no account yet: a refused acceptance does not sign anyone in.
    expect(
      (
        await pool.query('SELECT 1 FROM accounts.users WHERE email = $1', [
          'hugo@exemple.fr',
        ])
      ).rows,
    ).toEqual([])

    places = 3
    const later = await post('/api/teams/join', { jeton: token })
    expect(later.status).toBe(200)
    expect(await members(team)).toBe(3)
    expect((await post('/api/teams/join', { jeton: token })).status).toBe(422)
  })

  it('🔴 a member already in is never refused: a second invitation adds no one', async () => {
    places = 1
    asked.length = 0
    const again = await post(
      '/api/teams/invite',
      { equipe: team, email: 'ines@exemple.fr' },
      claire,
    )
    expect(again.status).toBe(200)
    const res = await acceptInvitation(pool, invitationFor('ines@exemple.fr'), {
      canAddMember,
    })
    expect(res?.teamId).toBe(team)
    expect(asked).toEqual([])
    expect(await members(team)).toBe(3)
  })

  it('without a hook, a team takes anyone — as in 0.1', async () => {
    expect(
      (await post('/api/teams/invite', { equipe: team, email: 'zoe@exemple.fr' }, claire))
        .status,
    ).toBe(409)
    const owner = (
      await pool.query<{ id: string }>(
        `SELECT user_id AS id FROM teams.members WHERE team_id = $1 AND role = 'proprietaire'`,
        [team],
      )
    ).rows[0]!.id
    await invite(pool, mail, { teamId: team, byUserId: owner, email: 'zoe@exemple.fr' })
    const joined = await acceptInvitation(pool, invitationFor('zoe@exemple.fr'))
    expect(joined?.teamId).toBe(team)
    expect(await members(team)).toBe(4)
    expect(await acceptInvitation(pool, 'pas-un-jeton')).toBeNull()
  })
})

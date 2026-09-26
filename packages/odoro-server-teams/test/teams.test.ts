/**
 * Teams, in the site's `teams` database, with the accounts module mounted
 * beside them — as a site mounts both.
 *
 * Played on a real PostgreSQL when `COMMERCE_TEST_URL` names one: each run
 * creates a database, loads `accounts` then `teams` (generated from
 * odoro-cloud), and drops it.
 */

import { createHash, randomUUID } from 'node:crypto'
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
import { ACCOUNT_COOKIE, createAccountsModule } from '@odoro-cli/server-accounts'
import pg from 'pg'
import request from 'supertest'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import {
  INVITATIONS_PER_HOUR,
  TEAM_COOKIE,
  createTeamsModule,
  whichTeam,
  type TeamMail,
} from '../src/index.js'

const HERE = dirname(fileURLToPath(import.meta.url))
const adminUrl = process.env['COMMERCE_TEST_URL']
const gated = adminUrl === undefined || adminUrl === '' ? describe.skip : describe

gated('teams', () => {
  const name = `equipes_${randomUUID().replaceAll('-', '').slice(0, 12)}`
  let pool: pg.Pool
  let server: ReturnType<typeof createApp>['express']
  const sent: { email: string; token: string; team: string }[] = []
  const mail: TeamMail = {
    send: async (m) => {
      sent.push({ email: m.email, token: m.token, team: m.team })
      await Promise.resolve()
    },
  }
  const invitationFor = (email: string) =>
    [...sent].reverse().find((m) => m.email === email)?.token

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
        createTeamsModule({ db: pool, mail, secureCookie: false }) as never,
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

  /** Every cookie a response sets, as one `Cookie` header, merged over the previous ones. */
  const jar = (res: { headers: Record<string, unknown> }, previous = '') => {
    const map = new Map(
      previous
        .split('; ')
        .filter(Boolean)
        .map((c) => [c.split('=')[0], c] as const),
    )
    for (const line of ([] as string[]).concat(
      (res.headers['set-cookie'] as string[] | undefined) ?? [],
    )) {
      const pair = line.split(';')[0] as string
      map.set(pair.split('=')[0], pair)
    }
    return [...map.values()].join('; ')
  }
  const post = (path: string, body: unknown, cookie = '') =>
    request(server)
      .post(path)
      .set('Cookie', cookie)
      .send(body as object)
  const get = (path: string, cookie = '') =>
    request(server).get(path).set('Cookie', cookie)

  async function person(email: string) {
    await post('/api/accounts/sign-up', { email, password: 'correct cheval batterie' })
    const res = await post('/api/accounts/sign-in', {
      email,
      password: 'correct cheval batterie',
    })
    return jar(res)
  }
  const idOf = async (email: string) =>
    (
      await pool.query<{ id: string }>('SELECT id FROM accounts.users WHERE email = $1', [
        email,
      ])
    ).rows[0]!.id

  let claire = ''
  let ines = ''
  let hugo = ''
  let team = ''

  it('a team is created by a signed-in person, who is its owner', async () => {
    expect((await post('/api/teams', { nom: 'Atelier' })).status).toBe(401)
    claire = await person('claire@exemple.fr')
    const res = await post('/api/teams', { nom: 'Atelier' }, claire)
    expect(res.body.equipe).toMatchObject({ nom: 'Atelier', role: 'proprietaire' })
    team = res.body.equipe.id
    claire = jar(res, claire)
    expect((await get('/api/teams', claire)).body).toMatchObject({
      courante: team,
      equipes: [{ role: 'proprietaire' }],
    })
  })

  it('an invitation signs the invitee in and makes them a member — once', async () => {
    expect(
      (
        await post(
          '/api/teams/invite',
          { equipe: team, email: 'Ines@Exemple.fr' },
          claire,
        )
      ).body,
    ).toEqual({ ok: true })
    expect(sent.at(-1)).toMatchObject({ email: 'ines@exemple.fr', team: 'Atelier' })
    const token = invitationFor('ines@exemple.fr')
    const res = await post('/api/teams/join', { jeton: token })
    expect(res.status).toBe(200)
    ines = jar(res)
    expect(ines).toContain(`${ACCOUNT_COOKIE}=`)
    expect((await get('/api/teams', ines)).body).toMatchObject({
      courante: team,
      equipes: [{ role: 'membre' }],
    })
    expect((await post('/api/teams/join', { jeton: token })).status).toBe(422)
  })

  it('the database keeps an invitation as a fingerprint only', async () => {
    const { rows } = await pool.query<{ f: string }>(
      'SELECT fingerprint AS f FROM teams.invitations',
    )
    const tokens = sent.map((m) => m.token)
    for (const r of rows) expect(tokens).not.toContain(r.f)
    expect(rows.map((r) => r.f)).toContain(
      createHash('sha256')
        .update(tokens[0] as string)
        .digest('hex'),
    )
  })

  it('a member neither invites, nor removes, nor changes a role, nor sees the invitations', async () => {
    expect(
      (await post('/api/teams/invite', { equipe: team, email: 'x@exemple.fr' }, ines))
        .status,
    ).toBe(403)
    expect(
      (
        await post(
          '/api/teams/remove',
          { equipe: team, membre: await idOf('claire@exemple.fr') },
          ines,
        )
      ).status,
    ).toBe(403)
    expect(
      (
        await post(
          '/api/teams/role',
          { equipe: team, membre: await idOf('ines@exemple.fr'), role: 'admin' },
          ines,
        )
      ).status,
    ).toBe(403)
    await post(
      '/api/teams/invite',
      { equipe: team, email: 'en-attente@exemple.fr' },
      claire,
    )
    expect(
      (await get(`/api/teams/members?equipe=${team}`, claire)).body.invitations.length,
    ).toBeGreaterThan(0)
    expect(
      (await get(`/api/teams/members?equipe=${team}`, ines)).body.invitations,
    ).toEqual([])
  })

  it('an admin invites and removes a member, but not an owner, and changes no role', async () => {
    await post(
      '/api/teams/invite',
      { equipe: team, email: 'hugo@exemple.fr', role: 'admin' },
      claire,
    )
    await post('/api/teams/invite', { equipe: team, email: 'zoe@exemple.fr' }, claire)
    hugo = jar(await post('/api/teams/join', { jeton: invitationFor('hugo@exemple.fr') }))
    expect(
      (await get(`/api/teams/members?equipe=${team}`, hugo)).body.invitations.map(
        (i: { email: string }) => i.email,
      ),
    ).toContain('zoe@exemple.fr')
    expect((await post('/api/teams/delete', { equipe: team }, hugo)).status).toBe(403)
    // A second invitation, as a member, never demotes an admin.
    await post(
      '/api/teams/invite',
      { equipe: team, email: 'hugo@exemple.fr', role: 'membre' },
      claire,
    )
    hugo = jar(
      await post('/api/teams/join', { jeton: invitationFor('hugo@exemple.fr') }),
      hugo,
    )
    expect((await get('/api/teams', hugo)).body.equipes).toMatchObject([
      { id: team, role: 'admin' },
    ])
    expect(
      (
        await post(
          '/api/teams/remove',
          { equipe: team, membre: await idOf('claire@exemple.fr') },
          hugo,
        )
      ).status,
    ).toBe(403)
    expect(
      (
        await post(
          '/api/teams/role',
          { equipe: team, membre: await idOf('ines@exemple.fr'), role: 'admin' },
          hugo,
        )
      ).status,
    ).toBe(403)
    expect(
      (
        await post(
          '/api/teams/remove',
          { equipe: team, membre: await idOf('ines@exemple.fr') },
          hugo,
        )
      ).status,
    ).toBe(200)
    expect((await get('/api/teams', ines)).body.equipes).toEqual([])
  })

  it('a team always keeps an owner', async () => {
    const moi = await idOf('claire@exemple.fr')
    expect(
      (
        await post(
          '/api/teams/role',
          { equipe: team, membre: moi, role: 'membre' },
          claire,
        )
      ).status,
    ).toBe(409)
    expect(
      (await post('/api/teams/remove', { equipe: team, membre: moi }, claire)).status,
    ).toBe(409)
    expect(
      (
        await post(
          '/api/teams/role',
          { equipe: team, membre: await idOf('hugo@exemple.fr'), role: 'proprietaire' },
          claire,
        )
      ).status,
    ).toBe(200)
    expect(
      (await post('/api/teams/remove', { equipe: team, membre: moi }, claire)).status,
    ).toBe(200)
  })

  it('a cookie never grants a team: the current team is checked against the memberships', async () => {
    const other = (await post('/api/teams', { nom: 'Autre' }, claire)).body.equipe
      .id as string
    const forged = `${ines}; ${TEAM_COOKIE}=${other}`
    const seen = await whichTeam(pool)({
      get: (n: string) =>
        new Map(forged.split('; ').map((c) => c.split('=') as [string, string])).get(n),
    } as never)
    expect(seen).toBeNull()
    expect((await post('/api/teams/current', { equipe: other }, ines)).status).toBe(404)
  })

  it(`at most ${INVITATIONS_PER_HOUR} invitations per team per hour`, async () => {
    const own = jar(await post('/api/teams', { nom: 'Bavarde' }, claire), claire)
    const bavarde = (await get('/api/teams', own)).body.courante as string
    let refused = 0
    for (let i = 0; i < INVITATIONS_PER_HOUR + 2; i++) {
      const r = await post(
        '/api/teams/invite',
        { equipe: bavarde, email: `p${i}@exemple.fr` },
        own,
      )
      if (r.status === 429) refused++
    }
    expect(refused).toBe(2)
  })

  it('deleting a team is for its owners, and takes its memberships', async () => {
    expect((await post('/api/teams/delete', { equipe: team }, claire)).status).toBe(404)
    expect((await post('/api/teams/delete', { equipe: team }, hugo)).status).toBe(200)
    const { rows } = await pool.query<{ n: number }>(
      'SELECT count(*)::int AS n FROM teams.members WHERE team_id = $1',
      [team],
    )
    expect(rows[0]?.n).toBe(0)
  })
})

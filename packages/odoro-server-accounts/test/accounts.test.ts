/**
 * Visitor accounts, in the site's `accounts` database.
 *
 * The password half runs everywhere. The rest runs on a real PostgreSQL when
 * `COMMERCE_TEST_URL` names one: each run creates a database, loads the
 * `accounts` capability (generated from odoro-cloud), and drops it.
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
import pg from 'pg'
import request from 'supertest'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import {
  ACCOUNT_COOKIE,
  acceptablePassword,
  createAccountsModule,
  hashPassword,
  verifyPassword,
  whoIsSignedIn,
  type AccountMail,
} from '../src/index.js'

const HERE = dirname(fileURLToPath(import.meta.url))

describe('passwords', () => {
  it('are stored in the form the database accepts, salted per account', async () => {
    const a = await hashPassword('correct cheval batterie')
    const b = await hashPassword('correct cheval batterie')
    expect(a).toMatch(/^scrypt\$16384\$8\$1\$[A-Za-z0-9_-]{22}\$[A-Za-z0-9_-]{43}$/)
    expect(a).not.toBe(b)
    expect(await verifyPassword('correct cheval batterie', a)).toBe(true)
    expect(await verifyPassword('correct cheval batterie!', a)).toBe(false)
  })

  it('a malformed stored form never matches', async () => {
    expect(await verifyPassword('motdepasse1', 'motdepasse1')).toBe(false)
  })

  it('are between 10 and 200 characters', () => {
    expect(acceptablePassword('court')).toBe(false)
    expect(acceptablePassword('x'.repeat(10))).toBe(true)
    expect(acceptablePassword('x'.repeat(201))).toBe(false)
  })
})

const adminUrl = process.env['COMMERCE_TEST_URL']
const gated = adminUrl === undefined || adminUrl === '' ? describe.skip : describe

gated('visitor accounts', () => {
  const name = `comptes_${randomUUID().replaceAll('-', '').slice(0, 12)}`
  let pool: pg.Pool
  let server: ReturnType<typeof createApp>['express']
  const sent: { email: string; kind: string; token: string }[] = []
  const mail: AccountMail = {
    send: async (m) => {
      sent.push({ ...m })
      await Promise.resolve()
    },
  }
  const last = (email: string, kind: string) =>
    [...sent].reverse().find((m) => m.email === email && m.kind === kind)?.token

  beforeAll(async () => {
    const admin = new pg.Client({ connectionString: adminUrl })
    await admin.connect()
    await admin.query(`CREATE DATABASE "${name}"`)
    await admin.end()
    const url = new URL(adminUrl as string)
    url.pathname = `/${name}`
    pool = new pg.Pool({ connectionString: url.toString(), max: 3 })
    await pool.query(readFileSync(join(HERE, 'fixtures', 'accounts-1.0.0.sql'), 'utf8'))
    const config = { ...loadConfig(undefined, { NODE_ENV: 'test' }) } as KernelConfig
    server = createApp({
      config,
      logger: createLogger({ level: 'silent' }),
      container: createContainer() as never,
      modules: [createAccountsModule({ db: pool, mail, secureCookie: false }) as never],
    }).express
  }, 60_000)

  afterAll(async () => {
    await pool?.end()
    const admin = new pg.Client({ connectionString: adminUrl })
    await admin.connect()
    await admin.query(`DROP DATABASE IF EXISTS "${name}" WITH (FORCE)`)
    await admin.end()
  }, 60_000)

  const post = (path: string, body: unknown, cookie?: string) => {
    const r = request(server)
      .post(path)
      .send(body as object)
    return cookie === undefined ? r : r.set('Cookie', cookie)
  }
  const session = (res: { headers: Record<string, unknown> }) => {
    const raw = ([] as string[]).concat(
      (res.headers['set-cookie'] as string[] | undefined) ?? [],
    )
    const line = raw.find((c) => c.startsWith(`${ACCOUNT_COOKIE}=`))
    return line?.split(';')[0]
  }

  it('sign-up answers the same for a new and a known address, and says nothing else', async () => {
    const neuf = await post('/api/accounts/sign-up', {
      email: 'Claire@Exemple.fr',
      password: 'correct cheval batterie',
    })
    const encore = await post('/api/accounts/sign-up', {
      email: 'claire@exemple.fr',
      password: 'autre mot de passe',
    })
    expect(neuf.status).toBe(encore.status)
    expect(neuf.body).toEqual(encore.body)
    // The new address is asked to verify; the known one receives a sign-in link.
    expect(
      sent.filter((m) => m.email === 'claire@exemple.fr').map((m) => m.kind),
    ).toEqual(['verification', 'lien'])
  })

  it('a verification link serves once', async () => {
    const token = last('claire@exemple.fr', 'verification')
    expect((await post('/api/accounts/verify', { token })).status).toBe(200)
    expect((await post('/api/accounts/verify', { token })).status).toBe(422)
  })

  it('signs in with the password, in an HttpOnly cookie', async () => {
    const res = await post('/api/accounts/sign-in', {
      email: 'claire@exemple.fr',
      password: 'correct cheval batterie',
    })
    expect(res.status).toBe(200)
    const raw = ([] as string[]).concat(res.headers['set-cookie'] ?? []).join(';')
    expect(raw).toMatch(/HttpOnly/i)
    const me = await request(server)
      .get('/api/accounts/me')
      .set('Cookie', session(res) as string)
    expect(me.body).toEqual({
      connecte: true,
      compte: { email: 'claire@exemple.fr', verifie: true },
    })
  })

  it('a wrong password and an unknown address get the same refusal', async () => {
    const faux = await post('/api/accounts/sign-in', {
      email: 'claire@exemple.fr',
      password: 'pas le bon mot',
    })
    const inconnu = await post('/api/accounts/sign-in', {
      email: 'personne@exemple.fr',
      password: 'pas le bon mot',
    })
    expect(faux.status).toBe(401)
    expect(inconnu.status).toBe(401)
    expect(faux.body.extensions?.erreur ?? faux.body.message).toEqual(
      inconnu.body.extensions?.erreur ?? inconnu.body.message,
    )
  })

  it('a link signs in, creates the account when new, verifies it, and serves once', async () => {
    expect((await post('/api/accounts/link', { email: 'ines@exemple.fr' })).body).toEqual(
      { ok: true },
    )
    const token = last('ines@exemple.fr', 'lien')
    const res = await post('/api/accounts/link/open', { token })
    expect(res.status).toBe(200)
    const me = await request(server)
      .get('/api/accounts/me')
      .set('Cookie', session(res) as string)
    expect(me.body.compte).toEqual({ email: 'ines@exemple.fr', verifie: true })
    expect((await post('/api/accounts/link/open', { token })).status).toBe(401)
  })

  it('at most three links of a kind per hour', async () => {
    for (let i = 0; i < 5; i++)
      await post('/api/accounts/link', { email: 'hugo@exemple.fr' })
    expect(
      sent.filter((m) => m.email === 'hugo@exemple.fr' && m.kind === 'lien'),
    ).toHaveLength(3)
  })

  it('the database holds fingerprints, never a token', async () => {
    const tokens = sent.map((m) => m.token)
    const { rows } = await pool.query<{ f: string }>(
      'SELECT fingerprint AS f FROM accounts.tokens UNION ALL SELECT fingerprint FROM accounts.sessions',
    )
    expect(rows.length).toBeGreaterThan(0)
    for (const r of rows) {
      expect(r.f).toMatch(/^[0-9a-f]{64}$/)
      expect(tokens).not.toContain(r.f)
    }
    // Each link is found by the SHA-256 of what the e-mail carried, and by nothing else.
    const empreintes = rows.map((r) => r.f)
    for (const token of tokens) {
      expect(empreintes).toContain(createHash('sha256').update(token).digest('hex'))
    }
  })

  it('an expired session signs nobody in', async () => {
    const cookie = session(
      await post('/api/accounts/sign-in', {
        email: 'claire@exemple.fr',
        password: 'correct cheval batterie',
      }),
    ) as string
    await pool.query(
      `UPDATE accounts.sessions SET expires_at = now() - interval '1 second'`,
    )
    const me = await request(server).get('/api/accounts/me').set('Cookie', cookie)
    expect(me.body).toEqual({ connecte: false })
  })

  it('a reset goes only to a known address, answers the same, and closes every session', async () => {
    const avant = sent.length
    expect(
      (await post('/api/accounts/reset/request', { email: 'personne@exemple.fr' })).body,
    ).toEqual({ ok: true })
    expect(sent.length).toBe(avant)

    const ouverte = session(
      await post('/api/accounts/sign-in', {
        email: 'claire@exemple.fr',
        password: 'correct cheval batterie',
      }),
    )
    await post('/api/accounts/reset/request', { email: 'claire@exemple.fr' })
    const token = last('claire@exemple.fr', 'reinitialisation')
    expect(
      (await post('/api/accounts/reset', { token, password: 'nouveau mot de passe' }))
        .status,
    ).toBe(200)

    const me = await request(server)
      .get('/api/accounts/me')
      .set('Cookie', ouverte as string)
    expect(me.body).toEqual({ connecte: false })
    expect(
      (
        await post('/api/accounts/sign-in', {
          email: 'claire@exemple.fr',
          password: 'correct cheval batterie',
        })
      ).status,
    ).toBe(401)
    expect(
      (
        await post('/api/accounts/sign-in', {
          email: 'claire@exemple.fr',
          password: 'nouveau mot de passe',
        })
      ).status,
    ).toBe(200)
    expect(
      (await post('/api/accounts/reset', { token, password: 'encore un autre' })).status,
    ).toBe(422)
  })

  it('whoIsSignedIn gives other modules the same person', async () => {
    const cookie = session(
      await post('/api/accounts/sign-in', {
        email: 'claire@exemple.fr',
        password: 'nouveau mot de passe',
      }),
    )
    const value = (cookie as string).split('=')[1]
    const who = await whoIsSignedIn(pool)({
      get: (n: string) => (n === ACCOUNT_COOKIE ? value : undefined),
    } as never)
    expect(who?.email).toBe('claire@exemple.fr')
  })

  it('deletion asks for the password again, and erases everything', async () => {
    const cookie = session(
      await post('/api/accounts/sign-in', {
        email: 'claire@exemple.fr',
        password: 'nouveau mot de passe',
      }),
    ) as string
    expect(
      (await post('/api/accounts/delete', { password: 'pas le bon' }, cookie)).status,
    ).toBe(401)
    expect(
      (await post('/api/accounts/delete', { password: 'nouveau mot de passe' }, cookie))
        .status,
    ).toBe(200)
    const { rows } = await pool.query<{ n: number }>(
      `SELECT count(*)::integer AS n FROM accounts.users WHERE email = 'claire@exemple.fr'`,
    )
    expect(rows[0]?.n).toBe(0)
    const me = await request(server).get('/api/accounts/me').set('Cookie', cookie)
    expect(me.body).toEqual({ connecte: false })
  })
})

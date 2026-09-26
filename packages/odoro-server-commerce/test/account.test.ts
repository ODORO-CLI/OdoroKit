/**
 * The customer's account in the shop's own database (shop 1.3.0).
 *
 * Played on a real PostgreSQL when `COMMERCE_TEST_URL` names one: each run
 * creates a database, loads `fixtures/shop-1.3.0.sql`, and drops it. The mail
 * port is replaced: it keeps the tokens a real one would have sent.
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
import pg from 'pg'
import request from 'supertest'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import {
  CUSTOMER_COOKIE,
  LINKS_PER_HOUR,
  baseFromPool,
  createCommerceModule,
  odoroMail,
  openSession,
  signRequest,
  type MailPort,
} from '../src/index.js'

const adminUrl = process.env['COMMERCE_TEST_URL']
const gated = adminUrl === undefined || adminUrl === '' ? describe.skip : describe
const HERE = dirname(fileURLToPath(import.meta.url))

gated('the customer account, in the shop database', () => {
  const name = `comptes_${randomUUID().replaceAll('-', '').slice(0, 12)}`
  let pool: pg.Pool
  let server: ReturnType<typeof createApp>['express']
  const sent: { email: string; token: string }[] = []
  const mail: MailPort = {
    sendLoginLink: async (input) => {
      sent.push({ ...input })
      await Promise.resolve()
    },
  }

  beforeAll(async () => {
    const admin = new pg.Client({ connectionString: adminUrl })
    await admin.connect()
    await admin.query(`CREATE DATABASE "${name}"`)
    await admin.end()
    const url = new URL(adminUrl as string)
    url.pathname = `/${name}`
    pool = new pg.Pool({ connectionString: url.toString(), max: 4 })
    await pool.query(readFileSync(join(HERE, 'fixtures', 'shop-1.3.0.sql'), 'utf8'))
    const config = { ...loadConfig(undefined, { NODE_ENV: 'test' }) } as KernelConfig
    server = createApp({
      config,
      logger: createLogger({ level: 'silent' }),
      container: createContainer() as never,
      modules: [
        createCommerceModule({
          db: baseFromPool(pool),
          payment: { open: async () => await Promise.reject(new Error('unused')) },
          callbackSecret: 'x',
          secureCookie: false,
          mail,
        }) as never,
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

  const post = async (body: Record<string, unknown>, session?: string) => {
    const r = request(server).post('/api/storefront/account')
    if (session !== undefined) r.set('Cookie', `${CUSTOMER_COOKIE}=${session}`)
    return await r.send(body)
  }
  const read = async (session: string) =>
    (
      await request(server)
        .get('/api/storefront/account')
        .set('Cookie', `${CUSTOMER_COOKIE}=${session}`)
    ).body

  it('🔴 a link leaves by mail, the account is one per address, and the database keeps only a fingerprint', async () => {
    const r = await post({
      geste: 'lien',
      email: '  Claire@Exemple.FR ',
      offres: true,
      nom: 'Claire',
    })
    expect(r.status).toBe(200)
    expect(r.body).toEqual({ ok: true })
    expect(sent.at(-1)!.email).toBe('claire@exemple.fr')
    const token = sent.at(-1)!.token
    const { rows } = await pool.query(
      'SELECT c.email, c.name, c.marketing_consent, c.consent_source, c.consent_at IS NOT NULL AS dated, l.fingerprint FROM shop.customers c JOIN shop.customer_links l ON l.customer_id = c.id',
    )
    expect(rows).toHaveLength(1)
    expect(rows[0]).toMatchObject({
      email: 'claire@exemple.fr',
      name: 'Claire',
      marketing_consent: true,
      consent_source: 'compte',
      dated: true,
    })
    expect(rows[0].fingerprint).not.toContain(token)
    expect(rows[0].fingerprint).toMatch(/^[0-9a-f]{64}$/)
  })

  it(`🔴 at most ${LINKS_PER_HOUR} links an hour — and the answer never says so`, async () => {
    const before = sent.length
    for (let i = 0; i < LINKS_PER_HOUR + 1; i += 1) {
      expect((await post({ geste: 'lien', email: 'paul@exemple.fr' })).body).toEqual({
        ok: true,
      })
    }
    expect(sent.length - before).toBe(LINKS_PER_HOUR)
  })

  it('🔴 a link serves once and not after fifteen minutes; the session reads the profile and the orders', async () => {
    await post({ geste: 'lien', email: 'lea@exemple.fr' })
    const token = sent.at(-1)!.token
    await pool.query(
      `INSERT INTO shop.orders (email, customer_name, state, subtotal_cents, total_cents, paid_at, shipping_address)
       VALUES ('Lea@exemple.fr', 'Léa', 'payee', 2400, 2400, now(), '{"ligne1":"3 rue des Lilas","code_postal":"69003","ville":"Lyon","pays":"FR"}'),
              ('lea@exemple.fr', 'Léa', 'ouverte', 900, 900, NULL, '{}'),
              ('autre@exemple.fr', 'Autre', 'payee', 5000, 5000, now(), '{}')`,
    )
    const db = baseFromPool(pool)
    const opened = await openSession(db, token, undefined)
    expect(opened).not.toBeNull()
    expect(await openSession(db, token, undefined)).toBeNull()

    const profil = await read(opened!.session)
    expect(profil.connecte).toBe(true)
    expect(profil.profil.courriel).toBe('lea@exemple.fr')
    // Her paid order — not the abandoned checkout, not somebody else's.
    expect(profil.profil.commandes).toHaveLength(1)
    expect(profil.profil.commandes[0].etat).toBe('payee')
    expect(profil.profil.adresses).toEqual([
      { nom: 'Léa', lignes: ['3 rue des Lilas', '69003 Lyon', 'FR'] },
    ])

    await post({ geste: 'lien', email: 'lea@exemple.fr' })
    const late = sent.at(-1)!.token
    await pool.query(
      `UPDATE shop.customer_links SET expires_at = now() - interval '1 minute' WHERE used_at IS NULL`,
    )
    expect(await openSession(db, late, undefined)).toBeNull()
  })

  it('🔴 the cart follows: this browser s cart becomes hers, or her last one comes back', async () => {
    await post({ geste: 'lien', email: 'marc@exemple.fr' })
    const first = sent.at(-1)!.token
    await pool.query(
      `INSERT INTO shop.carts (token) VALUES ('panier-du-telephone-0000000000000000000000')`,
    )
    const db = baseFromPool(pool)
    const phone = await openSession(
      db,
      first,
      'panier-du-telephone-0000000000000000000000',
    )
    expect(phone!.cart).toBeNull()

    await post({ geste: 'lien', email: 'marc@exemple.fr' })
    const second = sent.at(-1)!.token
    const laptop = await openSession(db, second, undefined)
    expect(laptop!.cart).toBe('panier-du-telephone-0000000000000000000000')
  })

  it('🔴 the profile needs a session; the consent can be withdrawn there; signing out ends the session', async () => {
    const without = await post({ geste: 'profil', nom: 'Intrus' })
    expect(without.status).toBe(401)
    expect(without.body.erreur).toMatch(/périmé ou a déjà servi/)

    await post({ geste: 'lien', email: 'nina@exemple.fr', offres: true })
    const opened = await openSession(baseFromPool(pool), sent.at(-1)!.token, undefined)
    const session = opened!.session
    const changed = await post({ geste: 'profil', nom: 'Nina', offres: false }, session)
    expect(changed.body.profil).toMatchObject({ nom: 'Nina', offres: false })
    const { rows } = await pool.query(
      `SELECT marketing_consent, consent_at FROM shop.customers WHERE email = 'nina@exemple.fr'`,
    )
    expect(rows[0]).toEqual({ marketing_consent: false, consent_at: null })

    expect((await post({ geste: 'deconnexion' }, session)).body).toEqual({ ok: true })
    expect(await read(session)).toEqual({ connecte: false })
  })

  it('🔴 a session ends after its time, and a shop that cannot send links serves no account', async () => {
    await post({ geste: 'lien', email: 'yves@exemple.fr' })
    const session = (await openSession(
      baseFromPool(pool),
      sent.at(-1)!.token,
      undefined,
    ))!.session
    expect((await read(session)).connecte).toBe(true)

    const config = { ...loadConfig(undefined, { NODE_ENV: 'test' }) } as KernelConfig
    const mute = createApp({
      config,
      logger: createLogger({ level: 'silent' }),
      container: createContainer() as never,
      modules: [
        createCommerceModule({
          db: baseFromPool(pool),
          payment: { open: async () => await Promise.reject(new Error('unused')) },
          callbackSecret: 'x',
          secureCookie: false,
        }) as never,
      ],
    }).express
    const seen = await request(mute)
      .get('/api/storefront/account')
      .set('Cookie', `${CUSTOMER_COOKIE}=${session}`)
    expect(seen.body).toEqual({ connecte: false })

    await pool.query(
      `UPDATE shop.customer_sessions SET expires_at = now() - interval '1 second'`,
    )
    expect(await read(session)).toEqual({ connecte: false })
  })

  it('🔴 the newsletter needs the ticked box', async () => {
    const unticked = await post({ geste: 'lettre', email: 'zoe@exemple.fr' })
    expect(unticked.status).toBe(422)
    expect(unticked.body.erreur).toBe('Requête illisible.')
    expect(
      (await post({ geste: 'lettre', email: 'zoe@exemple.fr', offres: true })).body,
    ).toEqual({ ok: true })
    const { rows } = await pool.query(
      `SELECT marketing_consent, consent_source FROM shop.customers WHERE email = 'zoe@exemple.fr'`,
    )
    expect(rows[0]).toEqual({ marketing_consent: true, consent_source: 'lettre' })
  })

  it('an address that is not one is refused', async () => {
    const r = await post({ geste: 'lien', email: 'pas-une-adresse' })
    expect(r.status).toBe(422)
    expect(r.body.erreur).toBe("Cette adresse de courriel n'est pas valable.")
  })
})

gated('a shop before accounts (shop 1.2.0)', () => {
  it('🔴 says the account is not available, by name — even with a way to send links', async () => {
    const name = `sanscompte_${randomUUID().replaceAll('-', '').slice(0, 12)}`
    const admin = new pg.Client({ connectionString: adminUrl })
    await admin.connect()
    await admin.query(`CREATE DATABASE "${name}"`)
    await admin.end()
    const url = new URL(adminUrl as string)
    url.pathname = `/${name}`
    const pool = new pg.Pool({ connectionString: url.toString(), max: 2 })
    try {
      await pool.query(readFileSync(join(HERE, 'fixtures', 'shop-1.3.0.sql'), 'utf8'))
      // What 1.3.0 added, taken away.
      await pool.query(
        `ALTER TABLE shop.carts DROP COLUMN customer_id;
         DROP TABLE shop.customer_sessions; DROP TABLE shop.customer_links; DROP TABLE shop.customers`,
      )
      const sent: string[] = []
      const config = { ...loadConfig(undefined, { NODE_ENV: 'test' }) } as KernelConfig
      const server = createApp({
        config,
        logger: createLogger({ level: 'silent' }),
        container: createContainer() as never,
        modules: [
          createCommerceModule({
            db: baseFromPool(pool),
            payment: { open: async () => await Promise.reject(new Error('unused')) },
            callbackSecret: 'x',
            secureCookie: false,
            mail: {
              sendLoginLink: async ({ token }) => {
                sent.push(token)
                await Promise.resolve()
              },
            },
          }) as never,
        ],
      }).express
      const r = await request(server)
        .post('/api/storefront/account')
        .send({ geste: 'lien', email: 'a@b.fr' })
      expect(r.status).toBe(503)
      expect(r.body.erreur).toMatch(/pas encore disponible/)
      expect(sent).toEqual([])
      const seen = await request(server)
        .get('/api/storefront/account')
        .set('Cookie', `${CUSTOMER_COOKIE}=${'x'.repeat(43)}`)
      expect(seen.body).toEqual({ connecte: false })
    } finally {
      await pool.end()
      const a = new pg.Client({ connectionString: adminUrl })
      await a.connect()
      await a.query(`DROP DATABASE IF EXISTS "${name}" WITH (FORCE)`)
      await a.end()
    }
  }, 60_000)
})

describe('the link, sent by Odoro', () => {
  it('🔴 carries the token only — Odoro writes the address — signed with the site s secret', async () => {
    const calls: { url: string; headers: Record<string, string>; body: string }[] = []
    const port = odoroMail({
      origin: 'https://odoro.test',
      site: 'site-1',
      secret: 'le-secret-du-site',
      now: () => 1_700_000_000,
      fetch: (async (url: string, init: RequestInit) => {
        calls.push({
          url,
          headers: init.headers as Record<string, string>,
          body: String(init.body),
        })
        return new Response('{}', { status: 200 })
      }) as unknown as typeof fetch,
    })
    await port.sendLoginLink({
      email: 'claire@exemple.fr',
      token: 'jeton-de-connexion-assez-long',
    })
    expect(calls[0]!.url).toBe('https://odoro.test/api/hosting/site-login-link')
    expect(JSON.parse(calls[0]!.body)).toEqual({
      site: 'site-1',
      courriel: 'claire@exemple.fr',
      jeton: 'jeton-de-connexion-assez-long',
    })
    expect(calls[0]!.headers['x-odoro-signature']).toBe(
      signRequest('le-secret-du-site', 1_700_000_000, calls[0]!.body),
    )
  })

  it('🔴 a refusal from Odoro is not a success', async () => {
    const port = odoroMail({
      origin: 'https://odoro.test',
      site: 'site-1',
      secret: 's',
      fetch: (async () => new Response('{}', { status: 429 })) as unknown as typeof fetch,
    })
    await expect(
      port.sendLoginLink({ email: 'a@b.c', token: 't'.repeat(30) }),
    ).rejects.toThrow()
  })
})

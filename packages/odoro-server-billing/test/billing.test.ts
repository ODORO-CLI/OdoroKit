/**
 * Billing, in the site's `billing` database, with the accounts and teams
 * modules mounted beside it — as a site mounts all three.
 *
 * Played on a real PostgreSQL when `COMMERCE_TEST_URL` names one: each run
 * creates a database, loads `accounts`, `teams` then `billing` (generated
 * from odoro-cloud), and drops it.
 *
 * The MODULES run under the site's APPLICATION role, with the grants odoro-cloud
 * gives it (`fixtures/application-grants.sql`, generated from odoro-cloud):
 * what works here works with the rights a site really has. What Odoro writes
 * — plans, subscriptions, invoices — is written with the owner, as Odoro does.
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
import { createTeamsModule } from '@odoro-cli/server-teams'
import pg from 'pg'
import request from 'supertest'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import {
  GRACE_HOURS,
  USAGE_EVENTS_PER_MINUTE,
  billingFor,
  createBillingModule,
  entitled,
  limitOf,
  recordUsage,
  seatsOf,
  type OdoroBillingPort,
} from '../src/index.js'

const HERE = dirname(fileURLToPath(import.meta.url))
const adminUrl = process.env['COMMERCE_TEST_URL']
const gated = adminUrl === undefined || adminUrl === '' ? describe.skip : describe
const fixture = (name: string) => readFileSync(join(HERE, 'fixtures', name), 'utf8')

gated('billing', () => {
  const name = `factures_${randomUUID().replaceAll('-', '').slice(0, 12)}`
  const role = `app_${randomUUID().replaceAll('-', '').slice(0, 12)}`
  let owner: pg.Pool
  let app: pg.Pool
  let server: ReturnType<typeof createApp>['express']
  const asked: { kind: string; teamId: string; planId?: string; seats?: number }[] = []
  const odoro: OdoroBillingPort = {
    subscribe: async ({ teamId, planId }) => {
      asked.push({ kind: 'subscribe', teamId, planId })
      return await Promise.resolve({ paymentUrl: `https://paiement.test/${teamId}` })
    },
    startTrial: async ({ teamId, planId }) => {
      asked.push({ kind: 'trial', teamId, planId })
      return await Promise.resolve({ trialEndsAt: '2026-10-10T00:00:00.000Z' })
    },
    changeSeats: async ({ teamId, seats }) => {
      asked.push({ kind: 'seats', teamId, seats })
      return await Promise.resolve({ seats })
    },
  }

  beforeAll(async () => {
    const admin = new pg.Client({ connectionString: adminUrl })
    await admin.connect()
    await admin.query(`CREATE DATABASE "${name}"`)
    await admin.end()
    const url = new URL(adminUrl as string)
    url.pathname = `/${name}`
    owner = new pg.Pool({ connectionString: url.toString(), max: 3 })
    for (const f of ['accounts-1.0.0.sql', 'teams-1.0.0.sql', 'billing-1.0.0.sql']) {
      await owner.query(fixture(f))
    }

    // The application role, as odoro-cloud issues it: a statement naming a
    // schema absent from this database is skipped, as there.
    const proprietor = (await owner.query<{ u: string }>('SELECT current_user AS u'))
      .rows[0]!.u
    const password = randomUUID()
    await owner.query(`CREATE ROLE "${role}" LOGIN PASSWORD '${password}'`)
    await owner.query(`GRANT CONNECT ON DATABASE "${name}" TO "${role}"`)
    const present = new Set(
      (
        await owner.query<{ n: string }>('SELECT nspname AS n FROM pg_namespace')
      ).rows.map((r) => r.n),
    )
    for (const line of fixture('application-grants.sql').split(/\r?\n/)) {
      if (line.trim() === '' || line.startsWith('--')) continue
      const schema =
        /SCHEMA "([^"]+)"/.exec(line)?.[1] ?? /ON "([^"]+)"\./.exec(line)?.[1]
      if (schema !== undefined && !present.has(schema)) continue
      await owner.query(
        line.replaceAll('__ROLE__', role).replaceAll('__PROPRIETAIRE__', proprietor),
      )
    }
    const appUrl = new URL(url.toString())
    appUrl.username = role
    appUrl.password = password
    app = new pg.Pool({ connectionString: appUrl.toString(), max: 3 })

    // The plans, as Odoro transfers them from the canvas.
    await owner.query(
      `INSERT INTO billing.plans (id, name, price_cents, billing_interval, seats_included, seat_price_cents, trial_days, features, limits, position)
       VALUES ('pro', 'Pro', 2900, 'month', 2, 900, 14, '{export,api}', '{"projets": 20}', 1),
              ('solo', 'Solo', 900, 'month', 1, 0, 0, '{}', '{"projets": 3}', 0),
              ('ancienne', 'Ancienne', 500, 'month', 1, 0, 0, '{}', '{}', 2)`,
    )
    await owner.query(`UPDATE billing.plans SET active = false WHERE id = 'ancienne'`)
    await owner.query(
      `INSERT INTO billing.plan_meters (plan_id, metric, included, unit_size, unit_price_cents)
       VALUES ('pro', 'appels', 1000, 100, 7)`,
    )

    const config = { ...loadConfig(undefined, { NODE_ENV: 'test' }) } as KernelConfig
    server = createApp({
      config,
      logger: createLogger({ level: 'silent' }),
      container: createContainer() as never,
      modules: [
        createAccountsModule({
          db: app,
          mail: { send: async () => {} },
          secureCookie: false,
        }) as never,
        createTeamsModule({
          db: app,
          mail: { send: async () => {} },
          secureCookie: false,
        }) as never,
        createBillingModule({ db: app, odoro }) as never,
      ],
    }).express
  }, 60_000)

  afterAll(async () => {
    await app?.end()
    await owner?.end()
    const admin = new pg.Client({ connectionString: adminUrl })
    await admin.connect()
    await admin.query(`DROP DATABASE IF EXISTS "${name}" WITH (FORCE)`)
    await admin.query(`DROP ROLE IF EXISTS "${role}"`)
    await admin.end()
  }, 60_000)

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
    return jar(
      await post('/api/accounts/sign-in', { email, password: 'correct cheval batterie' }),
    )
  }

  let claire = ''
  let hugo = ''
  let team = ''
  let hugoId = ''

  /** What Odoro writes when the money arrives — with the OWNER, never the site. */
  async function odoroWrites(fields: {
    status: string
    seats?: number
    trialEndsAt?: string | null
    periodStart?: string | null
    periodEnd?: string | null
  }) {
    await owner.query(
      `INSERT INTO billing.subscriptions (team_id, plan_id, status, seats, trial_ends_at, current_period_start, current_period_end)
       VALUES ($1, 'pro', $2, $3, $4, $5, $6)
       ON CONFLICT (team_id) DO UPDATE SET status = excluded.status, seats = excluded.seats,
         trial_ends_at = excluded.trial_ends_at, current_period_start = excluded.current_period_start,
         current_period_end = excluded.current_period_end`,
      [
        team,
        fields.status,
        fields.seats ?? 2,
        fields.trialEndsAt ?? null,
        fields.periodStart ?? null,
        fields.periodEnd ?? null,
      ],
    )
  }
  const hoursFromNow = (h: number) => new Date(Date.now() + h * 3_600_000).toISOString()

  it('lists the plans on sale, in order, with their meters — never a withdrawn one', async () => {
    const res = await get('/api/billing/plans')
    expect(res.status).toBe(200)
    expect(res.body.formules.map((p: { id: string }) => p.id)).toEqual(['solo', 'pro'])
    expect(res.body.formules[1]).toMatchObject({
      prixCentimes: 2900,
      siegesInclus: 2,
      prixDuSiegeCentimes: 900,
      essaiJours: 14,
      fonctions: ['export', 'api'],
      limites: { projets: 20 },
      compteurs: [
        { compteur: 'appels', inclus: 1000, paquet: 100, prixDuPaquetCentimes: 7 },
      ],
    })
  })

  it('a team stands nowhere until Odoro writes its subscription', async () => {
    expect((await get('/api/billing')).status).toBe(401)
    claire = await person('claire@exemple.fr')
    expect((await get('/api/billing', claire)).status).toBe(404)
    const created = await post('/api/teams', { nom: 'Atelier' }, claire)
    team = created.body.equipe.id
    claire = jar(created, claire)
    const res = await get('/api/billing', claire)
    expect(res.body).toMatchObject({
      equipe: team,
      actif: false,
      etat: null,
      formule: null,
    })
    expect(await entitled(app, team, 'export')).toBe(false)
    expect(await limitOf(app, team, 'projets')).toBe(0)
  })

  it('🔴 the site cannot write its own subscription, plan or invoice', async () => {
    for (const statement of [
      `INSERT INTO billing.subscriptions (team_id, plan_id, status, seats, current_period_start, current_period_end)
       VALUES ('${team}', 'pro', 'active', 99, now(), now() + interval '1 year')`,
      `UPDATE billing.plans SET price_cents = 0`,
      `INSERT INTO billing.invoices (id, team_id, kind, amount_cents, currency, status)
       VALUES (gen_random_uuid(), '${team}', 'period', 1, 'EUR', 'paid')`,
    ]) {
      await expect(app.query(statement), statement).rejects.toThrow(/permission denied/)
    }
  })

  it('only the owner commits the team to paying; the price is never sent', async () => {
    hugo = await person('hugo@exemple.fr')
    hugoId = (
      await owner.query<{ id: string }>(
        `SELECT id FROM accounts.users WHERE email = 'hugo@exemple.fr'`,
      )
    ).rows[0]!.id
    await owner.query(
      `INSERT INTO teams.members (team_id, user_id, role) VALUES ($1, $2, 'membre')`,
      [team, hugoId],
    )
    expect((await post('/api/billing/checkout', { formule: 'pro' }, hugo)).status).toBe(
      403,
    )
    const res = await post('/api/billing/checkout', { formule: 'pro' }, claire)
    expect(res.body).toEqual({ adresse: `https://paiement.test/${team}` })
    expect(asked.at(-1)).toEqual({ kind: 'subscribe', teamId: team, planId: 'pro' })
    expect((await post('/api/billing/trial', { formule: 'pro' }, claire)).body).toEqual({
      jusqua: '2026-10-10T00:00:00.000Z',
    })
  })

  it('🔴 a trial opens the plan until its end, and not a second after', async () => {
    await odoroWrites({ status: 'trialing', trialEndsAt: hoursFromNow(24) })
    expect(await entitled(app, team, 'export')).toBe(true)
    expect(await entitled(app, team, 'sso')).toBe(false)
    await odoroWrites({ status: 'trialing', trialEndsAt: hoursFromNow(-1) })
    expect(await entitled(app, team, 'export')).toBe(false)
    // A plan that is not live pays for no seat, whatever the row says.
    expect((await seatsOf(app, team)).paid).toBe(0)
  })

  it('🔴 an active period opens the plan, with a grace for a late renewal; an unpaid one does not', async () => {
    await odoroWrites({
      status: 'active',
      periodStart: hoursFromNow(-700),
      periodEnd: hoursFromNow(-1),
    })
    expect(await entitled(app, team, 'export')).toBe(true)
    await odoroWrites({
      status: 'active',
      periodStart: hoursFromNow(-800),
      periodEnd: hoursFromNow(-GRACE_HOURS - 1),
    })
    expect(await entitled(app, team, 'export')).toBe(false)
    await odoroWrites({
      status: 'past_due',
      periodStart: hoursFromNow(-1),
      periodEnd: hoursFromNow(700),
    })
    expect(await entitled(app, team, 'export')).toBe(false)
    await odoroWrites({
      status: 'canceled',
      periodStart: hoursFromNow(-1),
      periodEnd: hoursFromNow(700),
    })
    expect(await entitled(app, team, 'export')).toBe(false)
    await odoroWrites({
      status: 'active',
      periodStart: hoursFromNow(-1),
      periodEnd: hoursFromNow(700),
    })
    expect(await entitled(app, team, 'export')).toBe(true)
  })

  it('limits come from the live plan; a key the plan does not set is not limited', async () => {
    expect(await limitOf(app, team, 'projets')).toBe(20)
    expect(await limitOf(app, team, 'stockage')).toBeNull()
  })

  it('🔴 seats are the members against the seats paid for', async () => {
    expect(await seatsOf(app, team)).toEqual({ used: 2, paid: 2, available: 0 })
    await odoroWrites({
      status: 'active',
      seats: 5,
      periodStart: hoursFromNow(-1),
      periodEnd: hoursFromNow(700),
    })
    expect(await seatsOf(app, team)).toEqual({ used: 2, paid: 5, available: 3 })
    // Fewer seats than members: refused before Odoro is asked.
    const before = asked.length
    expect((await post('/api/billing/seats', { sieges: 1 }, claire)).status).toBe(409)
    expect(asked).toHaveLength(before)
    expect((await post('/api/billing/seats', { sieges: 3 }, claire)).body).toEqual({
      sieges: 3,
    })
    expect((await post('/api/billing/seats', { sieges: 3 }, hugo)).status).toBe(403)
  })

  it('🔴 usage is appended, once per key, and never rewritten', async () => {
    expect(
      await recordUsage(app, {
        teamId: team,
        metric: 'appels',
        quantity: 600,
        key: 'r-1',
        userId: hugoId,
      }),
    ).toEqual({
      recorded: true,
    })
    expect(
      await recordUsage(app, {
        teamId: team,
        metric: 'appels',
        quantity: 600,
        key: 'r-1',
      }),
    ).toEqual({
      recorded: false,
    })
    await billingFor(app, team, hugoId).record('appels', 501)
    const total = await owner.query<{ n: number }>(
      `SELECT sum(quantity)::int AS n FROM billing.usage_events WHERE team_id = $1`,
      [team],
    )
    expect(total.rows[0]?.n).toBe(1101)
    await expect(
      app.query('UPDATE billing.usage_events SET quantity = 1'),
    ).rejects.toThrow(/permission denied/)
    await expect(app.query('DELETE FROM billing.usage_events')).rejects.toThrow(
      /permission denied/,
    )
  })

  it('usage is bounded: whole quantities, a known meter, a readable key', async () => {
    for (const quantity of [0, -1, 1.5, 1_000_001, '3']) {
      await expect(
        recordUsage(app, { teamId: team, metric: 'appels', quantity }),
        String(quantity),
      ).rejects.toMatchObject({ status: 422 })
    }
    await expect(
      recordUsage(app, { teamId: team, metric: 'inconnu', quantity: 1 }),
    ).rejects.toMatchObject({
      status: 422,
    })
    await expect(
      recordUsage(app, {
        teamId: team,
        metric: 'appels',
        quantity: 1,
        key: 'pas une clé',
      }),
    ).rejects.toMatchObject({ status: 422 })
    await expect(billingFor(app, null).record('appels', 1)).rejects.toMatchObject({
      status: 401,
    })
  })

  it('usage is bounded in time: a counter, not a firehose', async () => {
    const other = (
      await owner.query<{ id: string }>(
        `INSERT INTO teams.teams (name) VALUES ('Flot') RETURNING id`,
      )
    ).rows[0]!.id
    await owner.query(
      `INSERT INTO billing.usage_events (team_id, metric, quantity)
       SELECT $1, 'appels', 1 FROM generate_series(1, $2)`,
      [other, USAGE_EVENTS_PER_MINUTE],
    )
    await expect(
      recordUsage(app, { teamId: other, metric: 'appels', quantity: 1 }),
    ).rejects.toMatchObject({
      status: 429,
    })
  })

  it('🔴 where the team stands: its plan, seats, usage estimate, and only OPEN invoices to pay', async () => {
    const paid = randomUUID()
    const open = randomUUID()
    await owner.query(
      `INSERT INTO billing.invoices (id, team_id, kind, amount_cents, currency, status, payment_url, lines)
       VALUES ($1, $3, 'seats', 600, 'EUR', 'paid', 'https://paiement.test/paid', '[]'),
              ($2, $3, 'period', 1234, 'EUR', 'open', 'https://paiement.test/open', '[{"compteur":"appels"}]')`,
      [paid, open, team],
    )
    const res = await get('/api/billing', claire)
    expect(res.body).toMatchObject({
      actif: true,
      etat: 'active',
      role: 'proprietaire',
      formule: { id: 'pro' },
      sieges: { utilises: 2, payes: 5 },
      // 1101 calls, 1000 included, blocks of 100 at 7 cents: 2 blocks.
      usage: [
        { compteur: 'appels', utilise: 1101, inclus: 1000, estimationCentimes: 14 },
      ],
    })
    const byId = Object.fromEntries(
      res.body.factures.map((f: { id: string; adresse: string | null }) => [
        f.id,
        f.adresse,
      ]),
    )
    expect(byId[open]).toBe('https://paiement.test/open')
    expect(byId[paid]).toBeNull()
    expect((await get('/api/billing/entitled?fonction=api', hugo)).body).toEqual({
      droit: true,
    })
  })
})

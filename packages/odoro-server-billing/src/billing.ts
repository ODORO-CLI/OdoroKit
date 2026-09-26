/**
 * Billing, READ from the site's own database (the `billing` capability of
 * odoro-cloud, which needs `teams`).
 *
 * What this module may do, and what it may not:
 *
 * | table                   | this module | written by                       |
 * |-------------------------|-------------|----------------------------------|
 * | `billing.plans`         | reads       | Odoro, from the site's canvas    |
 * | `billing.plan_meters`   | reads       | Odoro, from the site's canvas    |
 * | `billing.subscriptions` | reads       | Odoro, when the money arrives    |
 * | `billing.invoices`      | reads       | Odoro, when it asks for money    |
 * | `billing.usage_events`  | APPENDS     | this module (insert only)        |
 *
 * The site's database role cannot write a subscription, a plan or an
 * invoice — the server refuses it, not this code. A site never grants itself
 * a plan, a seat or a period.
 *
 * @module
 */

import type { Query } from '@odoro-cli/server-accounts'

import { meterAmountCents, type MeterPrice } from './amounts.js'

export type Interval = 'month' | 'year'
export type Status = 'trialing' | 'active' | 'past_due' | 'canceled'

export interface Meter extends MeterPrice {
  readonly metric: string
}

export interface Plan {
  readonly id: string
  readonly name: string
  readonly priceCents: number
  readonly currency: string
  readonly interval: Interval
  readonly seatsIncluded: number
  readonly seatPriceCents: number
  readonly trialDays: number
  readonly features: readonly string[]
  /** Per-plan limits by key; a key absent here is not limited by the plan. */
  readonly limits: Readonly<Record<string, number>>
  readonly meters: readonly Meter[]
}

export interface Subscription {
  readonly teamId: string
  readonly planId: string
  readonly status: Status
  readonly seats: number
  readonly trialEndsAt: Date | null
  readonly periodStart: Date | null
  readonly periodEnd: Date | null
  /**
   * The team has cancelled: it keeps its plan until the end of the paid
   * period, then Odoro writes it `canceled`. Always false on a database
   * whose `billing` capability predates 1.1.0.
   */
  readonly cancelAtPeriodEnd: boolean
}

export interface Invoice {
  readonly id: string
  readonly kind: 'seats' | 'period'
  readonly amountCents: number
  readonly currency: string
  /** `refunded` when all of it was refunded; a partial refund keeps `paid`. */
  readonly status: 'open' | 'paid' | 'void' | 'refunded'
  /** What was refunded, in cents, as Odoro saw it at the payment provider. */
  readonly refundedCents: number
  readonly paymentUrl: string | null
  readonly periodStart: Date | null
  readonly periodEnd: Date | null
  readonly lines: readonly unknown[]
  readonly createdAt: Date
}

export class BillingError extends Error {
  constructor(
    readonly status: 401 | 403 | 404 | 409 | 422 | 429,
    message: string,
  ) {
    super(message)
    this.name = 'BillingError'
  }
}

/**
 * How long an ACTIVE subscription stays live past the end of its paid
 * period. The renewal arrives from the payment provider, then from Odoro:
 * a late webhook must not lock a paying team out.
 */
export const GRACE_HOURS = 48
/** Bounds of one usage record. */
export const USAGE_MAX_QUANTITY = 1_000_000
/** Usage records per team and metric per minute: a counter, not a firehose. */
export const USAGE_EVENTS_PER_MINUTE = 600

const METRIC = /^[a-z][a-z0-9_]{0,39}$/
const KEY = /^[A-Za-z0-9_.:-]{1,100}$/
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/** Is the `billing` capability installed in this database? */
export async function billingInstalled(db: Query): Promise<boolean> {
  try {
    const { rows } = await db.query<{ present: boolean }>(
      `SELECT to_regclass('billing.subscriptions') IS NOT NULL AS present`,
    )
    return rows[0]?.present === true
  } catch {
    return false
  }
}

interface PlanRow {
  id: string
  name: string
  price_cents: number
  currency: string
  billing_interval: Interval
  seats_included: number
  seat_price_cents: number
  trial_days: number
  features: string[]
  limits: Record<string, unknown>
}

async function metersOf(db: Query, planIds: string[]): Promise<Map<string, Meter[]>> {
  const byPlan = new Map<string, Meter[]>()
  if (planIds.length === 0) return byPlan
  const { rows } = await db.query<{
    plan_id: string
    metric: string
    included: number
    unit_size: number
    unit_price_cents: number
  }>(
    `SELECT plan_id, metric, included, unit_size, unit_price_cents FROM billing.plan_meters
      WHERE plan_id = ANY($1::text[]) ORDER BY plan_id, metric`,
    [planIds],
  )
  for (const r of rows) {
    const list = byPlan.get(r.plan_id) ?? []
    list.push({
      metric: r.metric,
      included: Number(r.included),
      unitSize: Number(r.unit_size),
      unitPriceCents: Number(r.unit_price_cents),
    })
    byPlan.set(r.plan_id, list)
  }
  return byPlan
}

function toPlan(r: PlanRow, meters: Meter[]): Plan {
  const limits: Record<string, number> = {}
  for (const [key, value] of Object.entries(r.limits ?? {})) {
    if (typeof value === 'number' && Number.isSafeInteger(value)) limits[key] = value
  }
  return {
    id: r.id,
    name: r.name,
    priceCents: Number(r.price_cents),
    currency: r.currency,
    interval: r.billing_interval,
    seatsIncluded: Number(r.seats_included),
    seatPriceCents: Number(r.seat_price_cents),
    trialDays: Number(r.trial_days),
    features: r.features ?? [],
    limits,
    meters,
  }
}

const PLAN_COLUMNS = `id, name, price_cents, currency, billing_interval, seats_included,
  seat_price_cents, trial_days, features, limits`

/** The plans on sale, in the order the site lists them. */
export async function listPlans(db: Query): Promise<Plan[]> {
  const { rows } = await db.query<PlanRow>(
    `SELECT ${PLAN_COLUMNS} FROM billing.plans WHERE active ORDER BY position, id`,
  )
  const meters = await metersOf(
    db,
    rows.map((r) => r.id),
  )
  return rows.map((r) => toPlan(r, meters.get(r.id) ?? []))
}

/** A plan by its identifier — even one no longer on sale, that a team still holds. */
export async function planById(db: Query, id: string): Promise<Plan | null> {
  const { rows } = await db.query<PlanRow>(
    `SELECT ${PLAN_COLUMNS} FROM billing.plans WHERE id = $1`,
    [id],
  )
  const row = rows[0]
  if (row === undefined) return null
  return toPlan(row, (await metersOf(db, [row.id])).get(row.id) ?? [])
}

/** A team's subscription, as Odoro last wrote it, or null. */
export async function subscriptionOf(
  db: Query,
  teamId: string,
): Promise<Subscription | null> {
  if (!UUID.test(teamId)) return null
  const { rows } = await db.query<{
    team_id: string
    plan_id: string
    status: Status
    seats: number
    trial_ends_at: Date | null
    current_period_start: Date | null
    current_period_end: Date | null
    cancel_at_period_end: boolean | null
  }>(
    // Read through the row as JSON: a database still in billing 1.0.0 has no
    // cancel_at_period_end, and reads it as absent rather than failing.
    `SELECT s.team_id, s.plan_id, s.status, s.seats, s.trial_ends_at, s.current_period_start,
            s.current_period_end, (to_jsonb(s) ->> 'cancel_at_period_end')::boolean AS cancel_at_period_end
       FROM billing.subscriptions s WHERE s.team_id = $1`,
    [teamId],
  )
  const r = rows[0]
  if (r === undefined) return null
  const date = (d: Date | null) => (d === null ? null : new Date(d))
  return {
    teamId: r.team_id,
    planId: r.plan_id,
    status: r.status,
    seats: Number(r.seats),
    trialEndsAt: date(r.trial_ends_at),
    periodStart: date(r.current_period_start),
    periodEnd: date(r.current_period_end),
    cancelAtPeriodEnd: r.cancel_at_period_end === true,
  }
}

/**
 * Does this subscription open its plan NOW? A trial until its end; an active
 * subscription until the end of its paid period, plus a grace for a late
 * renewal. `past_due` and `canceled` open nothing.
 */
export function isLive(sub: Subscription | null, now: Date = new Date()): boolean {
  if (sub === null) return false
  if (sub.status === 'trialing') {
    return sub.trialEndsAt !== null && sub.trialEndsAt.getTime() > now.getTime()
  }
  if (sub.status === 'active') {
    if (sub.periodEnd === null) return false
    return sub.periodEnd.getTime() + GRACE_HOURS * 3_600_000 > now.getTime()
  }
  return false
}

export interface Standing {
  readonly subscription: Subscription | null
  readonly plan: Plan | null
  readonly live: boolean
}

/** Where a team stands: its subscription, its plan, and whether it is live. */
export async function standingOf(
  db: Query,
  teamId: string,
  now: Date = new Date(),
): Promise<Standing> {
  const subscription = await subscriptionOf(db, teamId)
  const plan = subscription === null ? null : await planById(db, subscription.planId)
  return { subscription, plan, live: plan !== null && isLive(subscription, now) }
}

/** May this team use this feature now? Only through a live plan that lists it. */
export async function entitled(
  db: Query,
  teamId: string,
  feature: string,
  now: Date = new Date(),
): Promise<boolean> {
  const { plan, live } = await standingOf(db, teamId, now)
  return live && plan !== null && plan.features.includes(feature)
}

/**
 * A plan's limit for a key: a number, `null` when the plan sets no limit for
 * it, and `0` when the team has no live plan at all.
 */
export async function limitOf(
  db: Query,
  teamId: string,
  key: string,
  now: Date = new Date(),
): Promise<number | null> {
  const { plan, live } = await standingOf(db, teamId, now)
  if (!live || plan === null) return 0
  return Object.hasOwn(plan.limits, key) ? (plan.limits[key] as number) : null
}

/** Seats: the members of the team against the seats paid for. */
export async function seatsOf(
  db: Query,
  teamId: string,
  now: Date = new Date(),
): Promise<{ used: number; paid: number; available: number }> {
  const { subscription, live } = await standingOf(db, teamId, now)
  const { rows } = await db.query<{ n: number }>(
    'SELECT count(*)::integer AS n FROM teams.members WHERE team_id = $1',
    [teamId],
  )
  const used = Number(rows[0]?.n ?? 0)
  const paid = live && subscription !== null ? subscription.seats : 0
  return { used, paid, available: Math.max(0, paid - used) }
}

/**
 * Whether a team has a seat left for one more member — what
 * `@odoro-cli/server-teams` asks before inviting and before an invitation is
 * accepted (`canAddMember`). A team without a live plan pays for no seat: it
 * takes nobody more until its owner chooses a plan.
 */
export function seatsAllowMember(db: Query, now: () => Date = () => new Date()) {
  return async (teamId: string): Promise<true | string> => {
    const { paid, available } = await seatsOf(db, teamId, now())
    if (available > 0) return true
    if (paid === 0) {
      return "Cette équipe n'a pas de formule en cours : son propriétaire en choisit une avant d'inviter."
    }
    return 'Les sièges payés de cette équipe sont tous occupés : son propriétaire peut en ajouter.'
  }
}

/**
 * Appends usage. It never updates nor deletes: the database role cannot.
 * A `key` makes the record idempotent — the same key for the same team counts
 * once. Returns whether a row was written.
 */
export async function recordUsage(
  db: Query,
  input: {
    readonly teamId: string
    readonly metric: unknown
    readonly quantity: unknown
    readonly userId?: string | null
    readonly key?: unknown
  },
): Promise<{ recorded: boolean }> {
  if (!UUID.test(input.teamId))
    throw new BillingError(404, 'Cette équipe est introuvable.')
  const metric = String(input.metric ?? '')
  if (!METRIC.test(metric)) throw new BillingError(422, "Ce compteur n'existe pas.")
  const quantity = input.quantity === undefined ? 1 : input.quantity
  if (
    typeof quantity !== 'number' ||
    !Number.isInteger(quantity) ||
    quantity < 1 ||
    quantity > USAGE_MAX_QUANTITY
  ) {
    throw new BillingError(422, 'Une quantité se compte en entiers, de 1 à un million.')
  }
  const key = input.key === undefined || input.key === null ? null : String(input.key)
  if (key !== null && !KEY.test(key)) {
    throw new BillingError(422, "Cette clé d'idempotence n'est pas lisible.")
  }
  const { rows } = await db.query<{ metered: boolean; recent: number }>(
    `SELECT EXISTS (SELECT 1 FROM billing.plan_meters WHERE metric = $2) AS metered,
            (SELECT count(*)::integer FROM billing.usage_events
              WHERE team_id = $1 AND metric = $2 AND occurred_at > now() - interval '1 minute') AS recent`,
    [input.teamId, metric],
  )
  if (rows[0]?.metered !== true) {
    throw new BillingError(422, 'Aucune formule ne compte ce compteur.')
  }
  if (Number(rows[0]?.recent ?? 0) >= USAGE_EVENTS_PER_MINUTE) {
    throw new BillingError(
      429,
      "Trop d'usage compté en une minute : réessayez plus tard.",
    )
  }
  const userId =
    input.userId !== undefined && input.userId !== null && UUID.test(input.userId)
      ? input.userId
      : null
  const written = await db.query(
    `INSERT INTO billing.usage_events (team_id, metric, quantity, user_id, idempotency_key)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (team_id, idempotency_key) WHERE idempotency_key IS NOT NULL DO NOTHING`,
    [input.teamId, metric, quantity, userId, key],
  )
  return { recorded: (written.rowCount ?? 0) > 0 }
}

/** The usage of one metric over `[from, to)`. */
export async function usageOf(
  db: Query,
  teamId: string,
  metric: string,
  from: Date,
  to: Date,
): Promise<number> {
  const { rows } = await db.query<{ total: string | null }>(
    `SELECT sum(quantity)::text AS total FROM billing.usage_events
      WHERE team_id = $1 AND metric = $2 AND occurred_at >= $3 AND occurred_at < $4`,
    [teamId, metric, from, to],
  )
  const total = Number(rows[0]?.total ?? 0)
  return Number.isSafeInteger(total) ? total : Number.MAX_SAFE_INTEGER
}

export interface MeterUsage {
  readonly metric: string
  readonly used: number
  readonly included: number
  /** What the period would cost so far, in cents — an ESTIMATE: Odoro bills. */
  readonly estimateCents: number
}

/** The usage of the current period, metric by metric, with its estimate. */
export async function currentUsage(
  db: Query,
  teamId: string,
  now: Date = new Date(),
): Promise<MeterUsage[]> {
  const { subscription, plan } = await standingOf(db, teamId, now)
  if (subscription === null || plan === null) return []
  const from = subscription.periodStart ?? subscription.trialEndsAt ?? now
  const out: MeterUsage[] = []
  for (const meter of plan.meters) {
    const used = await usageOf(db, teamId, meter.metric, from, now)
    out.push({
      metric: meter.metric,
      used,
      included: meter.included,
      estimateCents: meterAmountCents(used, meter),
    })
  }
  return out
}

/** What Odoro has asked this team for, newest first. */
export async function invoicesOf(db: Query, teamId: string): Promise<Invoice[]> {
  const { rows } = await db.query<{
    id: string
    kind: 'seats' | 'period'
    amount_cents: number
    currency: string
    status: 'open' | 'paid' | 'void' | 'refunded'
    refunded_cents: string | null
    payment_url: string | null
    period_start: Date | null
    period_end: Date | null
    lines: unknown[]
    created_at: Date
  }>(
    // refunded_cents arrived with billing 1.1.0: read through the row as JSON.
    `SELECT i.id, i.kind, i.amount_cents, i.currency, i.status, i.payment_url, i.period_start,
            i.period_end, i.lines, i.created_at, to_jsonb(i) ->> 'refunded_cents' AS refunded_cents
       FROM billing.invoices i WHERE i.team_id = $1 ORDER BY i.created_at DESC LIMIT 50`,
    [teamId],
  )
  return rows.map((r) => ({
    id: r.id,
    kind: r.kind,
    amountCents: Number(r.amount_cents),
    currency: r.currency,
    status: r.status,
    refundedCents: Number(r.refunded_cents ?? 0),
    // An invoice already paid, voided or refunded is not paid again.
    paymentUrl: r.status === 'open' ? r.payment_url : null,
    periodStart: r.period_start === null ? null : new Date(r.period_start),
    periodEnd: r.period_end === null ? null : new Date(r.period_end),
    lines: r.lines ?? [],
    createdAt: new Date(r.created_at),
  }))
}

/**
 * The billing of ONE team, bound — what a site's own code receives, so that
 * it never chooses the team it bills.
 */
export function billingFor(
  db: Query,
  teamId: string | null,
  userId: string | null = null,
) {
  return {
    entitled: async (feature: string): Promise<boolean> =>
      teamId === null ? false : await entitled(db, teamId, feature),
    limit: async (key: string): Promise<number | null> =>
      teamId === null ? 0 : await limitOf(db, teamId, key),
    record: async (
      metric: string,
      quantity = 1,
      key?: string,
    ): Promise<{ recorded: boolean }> => {
      if (teamId === null)
        throw new BillingError(401, 'Choisissez une équipe pour continuer.')
      return await recordUsage(db, { teamId, metric, quantity, userId, key })
    },
  }
}

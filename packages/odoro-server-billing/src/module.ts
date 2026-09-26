/**
 * Billing, as an `@odoro-cli/server` module. Who is signed in comes from
 * `@odoro-cli/server-accounts`; the team a request works in from
 * `@odoro-cli/server-teams` (`whichTeam`).
 *
 *   GET  /api/billing/plans                 { formules }                  public
 *   GET  /api/billing                       where my team stands          a member
 *   GET  /api/billing/entitled?fonction=    { droit }                     a member
 *   POST /api/billing/checkout  { formule } { adresse }                   the owner
 *   POST /api/billing/trial     { formule } { jusqua }                    the owner
 *   POST /api/billing/seats     { sieges }  { adresse } | { sieges }      the owner
 *
 * Only a team's OWNER (`proprietaire`) commits it to paying. Nothing here
 * writes a subscription: checkout, trial and seats are asked of Odoro, which
 * writes them in the site's database when — and only when — it may.
 *
 * @module
 */

import { ApiError, defineModule, route, type Cookies } from '@odoro-cli/server'
import {
  ACCOUNT_COOKIE,
  accountOf,
  type Account,
  type Query,
} from '@odoro-cli/server-accounts'
import { whichTeam } from '@odoro-cli/server-teams'
import { z } from 'zod'

import {
  BillingError,
  currentUsage,
  entitled,
  invoicesOf,
  listPlans,
  seatsOf,
  standingOf,
  type Plan,
} from './billing.js'
import type { OdoroBillingPort } from './odoro-billing.js'

export interface BillingOptions {
  /** The site's database, with the `accounts`, `teams` and `billing` capabilities. */
  readonly db: Query
  /** Where payments are opened: `odoroBilling({ origin, site, secret })`. */
  readonly odoro: OdoroBillingPort
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
    if (cause instanceof BillingError) refuse(cause.status, cause.message)
    throw cause
  }
}

/** A plan, as the site shows it. Prices in cents, as everywhere. */
function shown(plan: Plan) {
  return {
    id: plan.id,
    nom: plan.name,
    prixCentimes: plan.priceCents,
    devise: plan.currency,
    periode: plan.interval,
    siegesInclus: plan.seatsIncluded,
    prixDuSiegeCentimes: plan.seatPriceCents,
    essaiJours: plan.trialDays,
    fonctions: plan.features,
    limites: plan.limits,
    compteurs: plan.meters.map((m) => ({
      compteur: m.metric,
      inclus: m.included,
      paquet: m.unitSize,
      prixDuPaquetCentimes: m.unitPriceCents,
    })),
  }
}

export function createBillingModule(options: BillingOptions) {
  const { db, odoro } = options
  const teamOf = whichTeam(db)

  /** The signed-in person and the team they work in; refuses otherwise. */
  async function member(cookies: Cookies): Promise<{
    account: Account
    team: NonNullable<Awaited<ReturnType<typeof teamOf>>>
  }> {
    const account = await accountOf(db, cookies.get(ACCOUNT_COOKIE))
    if (account === null) refuse(401, 'Connectez-vous pour voir la facturation.')
    const team = await teamOf(cookies)
    if (team === null) refuse(404, 'Choisissez une équipe pour continuer.')
    return { account, team }
  }

  async function owner(cookies: Cookies) {
    const found = await member(cookies)
    if (found.team.role !== 'proprietaire') {
      refuse(403, "Seul le propriétaire de l'équipe engage ses paiements.")
    }
    return found
  }

  const routes = [
    route({
      name: 'billing.plans',
      method: 'GET',
      path: '/api/billing/plans',
      auth: 'public',
      handler: async () => ({ formules: (await listPlans(db)).map(shown) }),
    }),
    route({
      name: 'billing.standing',
      method: 'GET',
      path: '/api/billing',
      auth: 'public',
      handler: async ({ cookies }) =>
        await answer(async () => {
          const { team } = await member(cookies)
          const { subscription, plan, live } = await standingOf(db, team.id)
          const seats = await seatsOf(db, team.id)
          const iso = (d: Date | null) => (d === null ? null : d.toISOString())
          return {
            equipe: team.id,
            role: team.role,
            actif: live,
            etat: subscription?.status ?? null,
            formule: plan === null ? null : shown(plan),
            sieges: { utilises: seats.used, payes: seats.paid },
            essaiJusqua: iso(subscription?.trialEndsAt ?? null),
            periode:
              subscription?.periodStart && subscription.periodEnd
                ? {
                    debut: iso(subscription.periodStart),
                    fin: iso(subscription.periodEnd),
                  }
                : null,
            usage: (await currentUsage(db, team.id)).map((u) => ({
              compteur: u.metric,
              utilise: u.used,
              inclus: u.included,
              estimationCentimes: u.estimateCents,
            })),
            factures: (await invoicesOf(db, team.id)).map((i) => ({
              id: i.id,
              genre: i.kind,
              montantCentimes: i.amountCents,
              devise: i.currency,
              etat: i.status,
              adresse: i.paymentUrl,
              debut: iso(i.periodStart),
              fin: iso(i.periodEnd),
              lignes: i.lines,
              creeLe: i.createdAt.toISOString(),
            })),
          }
        }),
    }),
    route({
      name: 'billing.entitled',
      method: 'GET',
      path: '/api/billing/entitled',
      auth: 'public',
      input: z.object({ fonction: z.string().min(1).max(80) }),
      handler: async ({ input, cookies }) =>
        await answer(async () => {
          const { team } = await member(cookies)
          return { droit: await entitled(db, team.id, input.fonction) }
        }),
    }),
    route({
      name: 'billing.checkout',
      method: 'POST',
      path: '/api/billing/checkout',
      auth: 'public',
      input: z.object({ formule: z.string().min(1).max(40) }),
      handler: async ({ input, cookies }) =>
        await answer(async () => {
          const { account, team } = await owner(cookies)
          const { paymentUrl } = await odoro.subscribe({
            teamId: team.id,
            planId: input.formule,
            email: account.email,
          })
          return { adresse: paymentUrl }
        }),
    }),
    route({
      name: 'billing.trial',
      method: 'POST',
      path: '/api/billing/trial',
      auth: 'public',
      input: z.object({ formule: z.string().min(1).max(40) }),
      handler: async ({ input, cookies }) =>
        await answer(async () => {
          const { team } = await owner(cookies)
          const { trialEndsAt } = await odoro.startTrial({
            teamId: team.id,
            planId: input.formule,
          })
          return { jusqua: trialEndsAt }
        }),
    }),
    route({
      name: 'billing.seats',
      method: 'POST',
      path: '/api/billing/seats',
      auth: 'public',
      input: z.object({ sieges: z.number().int().min(1).max(10_000) }),
      handler: async ({ input, cookies }) =>
        await answer(async () => {
          const { account, team } = await owner(cookies)
          const { used } = await seatsOf(db, team.id)
          if (input.sieges < used) {
            throw new BillingError(
              409,
              "L'équipe compte plus de membres que ce nombre de sièges : retirez des membres d'abord.",
            )
          }
          const done = await odoro.changeSeats({
            teamId: team.id,
            seats: input.sieges,
            email: account.email,
          })
          return 'paymentUrl' in done
            ? { adresse: done.paymentUrl }
            : { sieges: done.seats }
        }),
    }),
  ]

  return defineModule({ name: 'billing', routes: routes as never })
}

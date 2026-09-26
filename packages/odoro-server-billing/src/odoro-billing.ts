/**
 * Payments, opened at Odoro.
 *
 * A site never holds a payment provider's key, and never writes a
 * subscription: it ASKS Odoro, with a request signed by the site's own
 * secret — exactly like `odoroPayment` in `@odoro-cli/server-commerce`. Odoro
 * reads the plan and its price from the site's database (never from this
 * request), opens the payment, and writes the subscription itself when the
 * money arrives.
 *
 * ## The request's signature
 *
 * `x-odoro-signature` is the hex HMAC-SHA256 of `${timestamp}.${body}`, and
 * `x-odoro-timestamp` the Unix time in seconds. Odoro refuses a signature
 * more than five minutes old.
 *
 * @module
 */

import { createHmac } from 'node:crypto'

import { BillingError } from './billing.js'

export interface OdoroBillingOptions {
  /** Odoro's address, e.g. `https://odoro.ai`. */
  readonly origin: string
  /** This site's identifier at Odoro. */
  readonly site: string
  /** This site's secret, shared with Odoro alone. */
  readonly secret: string
  /** @internal For the tests. */
  readonly fetch?: typeof fetch
  /** @internal For the tests: seconds since the epoch. */
  readonly now?: () => number
}

/** Where Odoro opens a team's subscription, trial or seats. */
export const ODORO_BILLING_PATH = '/api/payment/site-subscription'

export function signRequest(secret: string, timestamp: number, body: string): string {
  return createHmac('sha256', secret).update(`${timestamp}.${body}`).digest('hex')
}

export interface OdoroBillingPort {
  /** A subscription to a plan: returns where to pay. */
  subscribe(input: {
    readonly teamId: string
    readonly planId: string
    readonly email: string
  }): Promise<{ paymentUrl: string }>
  /** A trial of a plan, without payment — once per team. */
  startTrial(input: {
    readonly teamId: string
    readonly planId: string
  }): Promise<{ trialEndsAt: string }>
  /**
   * The paid seats of the team. More seats: returns where to pay for the rest
   * of the period. Fewer: done at once, nothing is refunded.
   */
  changeSeats(input: {
    readonly teamId: string
    readonly seats: number
    readonly email: string
  }): Promise<{ paymentUrl: string } | { seats: number }>
}

const UNAVAILABLE = "Le paiement n'a pas pu s'ouvrir. Réessayez dans un instant."

export function odoroBilling(options: OdoroBillingOptions): OdoroBillingPort {
  const send = options.fetch ?? fetch
  const now = options.now ?? (() => Math.floor(Date.now() / 1000))
  const address = new URL(ODORO_BILLING_PATH, options.origin).toString()

  async function ask(fields: Record<string, unknown>): Promise<Record<string, unknown>> {
    if (options.secret === '') throw new BillingError(409, UNAVAILABLE)
    const body = JSON.stringify({ site: options.site, ...fields })
    const timestamp = now()
    let reply: Response
    try {
      reply = await send(address, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-odoro-timestamp': String(timestamp),
          'x-odoro-signature': signRequest(options.secret, timestamp, body),
        },
        body,
        signal: AbortSignal.timeout(15_000),
      })
    } catch {
      throw new BillingError(409, UNAVAILABLE)
    }
    const payload = (await reply.json().catch(() => ({}))) as Record<string, unknown>
    if (!reply.ok) {
      // Odoro's refusal is written for the visitor: it is passed on as it is.
      const said =
        typeof payload['erreur'] === 'string' && reply.status < 500
          ? payload['erreur']
          : UNAVAILABLE
      throw new BillingError(409, said)
    }
    return payload
  }

  const url = (payload: Record<string, unknown>): string => {
    const at = payload['adresse']
    if (typeof at !== 'string' || !at.startsWith('https://')) {
      throw new BillingError(409, UNAVAILABLE)
    }
    return at
  }

  return {
    subscribe: async ({ teamId, planId, email }) => ({
      paymentUrl: url(
        await ask({
          genre: 'abonnement',
          equipe: teamId,
          formule: planId,
          courriel: email,
        }),
      ),
    }),
    startTrial: async ({ teamId, planId }) => {
      const payload = await ask({ genre: 'essai', equipe: teamId, formule: planId })
      if (typeof payload['jusqua'] !== 'string') throw new BillingError(409, UNAVAILABLE)
      return { trialEndsAt: payload['jusqua'] }
    },
    changeSeats: async ({ teamId, seats, email }) => {
      const payload = await ask({
        genre: 'sieges',
        equipe: teamId,
        sieges: seats,
        courriel: email,
      })
      if (typeof payload['adresse'] === 'string') return { paymentUrl: url(payload) }
      if (typeof payload['sieges'] === 'number') return { seats: payload['sieges'] }
      throw new BillingError(409, UNAVAILABLE)
    },
  }
}

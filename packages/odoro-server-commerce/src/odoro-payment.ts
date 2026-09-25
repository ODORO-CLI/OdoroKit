/**
 * The payment, opened at Odoro.
 *
 * A site that sells never holds a payment provider's key: it asks Odoro to
 * open the payment, and Odoro tells it the outcome through the signed callback
 * (`/api/storefront/payment-callback`). The site's secret is its own — shared
 * with Odoro, with no other site — so a compromised site can open payments
 * for itself and nothing else.
 *
 * ## The request's signature
 *
 * `x-odoro-signature` is the hex HMAC-SHA256 of `${timestamp}.${body}`, and
 * `x-odoro-timestamp` the Unix time in seconds. Odoro refuses a signature more
 * than five minutes old: a request copied from a log cannot be replayed.
 *
 * @module
 */

import { createHmac } from 'node:crypto'

import { CheckoutError, type PaymentPort } from './checkout.js'

export interface OdoroPaymentOptions {
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

/** Where Odoro opens a site's payment. */
export const ODORO_PAYMENT_PATH = '/api/payment/site-order'

export function signRequest(secret: string, timestamp: number, body: string): string {
  return createHmac('sha256', secret).update(`${timestamp}.${body}`).digest('hex')
}

const UNAVAILABLE = "Le paiement n'a pas pu s'ouvrir. Réessayez dans un instant."

export function odoroPayment(options: OdoroPaymentOptions): PaymentPort {
  const send = options.fetch ?? fetch
  const now = options.now ?? (() => Math.floor(Date.now() / 1000))
  const address = new URL(ODORO_PAYMENT_PATH, options.origin).toString()

  return {
    open: async (order) => {
      if (options.secret === '') throw new CheckoutError(409, UNAVAILABLE)
      const body = JSON.stringify({
        site: options.site,
        commande: order.orderId,
        numero: order.number,
        totalCentimes: order.totalCents,
        devise: order.currency,
        courriel: order.email,
      })
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
        throw new CheckoutError(409, UNAVAILABLE)
      }
      const payload = (await reply.json().catch(() => ({}))) as {
        reference?: unknown
        adresse?: unknown
        erreur?: unknown
      }
      if (
        !reply.ok ||
        typeof payload.reference !== 'string' ||
        typeof payload.adresse !== 'string'
      ) {
        // Odoro's refusal is written for the buyer ("the shop is not open yet"):
        // it is passed on as it is. Anything else says to try again.
        const said =
          typeof payload.erreur === 'string' && reply.status < 500
            ? payload.erreur
            : UNAVAILABLE
        throw new CheckoutError(409, said)
      }
      return { reference: payload.reference, paymentUrl: payload.adresse }
    },
  }
}

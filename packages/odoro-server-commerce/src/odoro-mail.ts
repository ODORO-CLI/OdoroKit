/**
 * The sign-in link, sent by Odoro.
 *
 * A shop holds no mail key: it asks Odoro to send the link, signed with the
 * site's secret exactly like a payment (`odoro-payment.ts`). Odoro writes the
 * address of the link itself — the shop's own published address — and only
 * takes the TOKEN from here: a compromised site cannot make Odoro mail a link
 * that leads anywhere else.
 *
 * @module
 */

import type { MailPort } from './account.js'
import { signRequest } from './odoro-payment.js'

export interface OdoroMailOptions {
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

/** Where Odoro sends a site's sign-in link. */
export const ODORO_MAIL_PATH = '/api/hosting/site-login-link'

export function odoroMail(options: OdoroMailOptions): MailPort {
  const send = options.fetch ?? fetch
  const now = options.now ?? (() => Math.floor(Date.now() / 1000))
  const address = new URL(ODORO_MAIL_PATH, options.origin).toString()

  return {
    sendLoginLink: async ({ email, token }) => {
      if (options.secret === '') throw new Error('site secret missing')
      const body = JSON.stringify({ site: options.site, courriel: email, jeton: token })
      const timestamp = now()
      const reply = await send(address, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-odoro-timestamp': String(timestamp),
          'x-odoro-signature': signRequest(options.secret, timestamp, body),
        },
        body,
        signal: AbortSignal.timeout(15_000),
      })
      if (!reply.ok) throw new Error(`Odoro refused the link (${reply.status})`)
    },
  }
}

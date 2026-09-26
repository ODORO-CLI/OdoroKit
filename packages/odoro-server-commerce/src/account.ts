/**
 * The customer's account, in the shop's own database (shop 1.3.0).
 *
 * No password: a fifteen-minute link, sent to the address. The link and the
 * session live in the database as FINGERPRINTS only (SHA-256): a database
 * that is read connects nobody.
 *
 * The same contract as Odoro's central storefront, so the site's account
 * page works unchanged:
 *
 *   POST { geste: 'lien', email, offres? }   create the account / sign in:
 *                                            a link leaves by e-mail;
 *   POST { geste: 'lettre', email, offres }  the newsletter — `offres` MUST be
 *                                            true (the ticked box);
 *   POST { geste: 'profil', nom?, offres? }  the profile (session required);
 *   POST { geste: 'deconnexion' }            closes the session;
 *   GET                                      the profile, the orders, the addresses.
 *
 * `lien` and `lettre` always answer `{ ok: true }`: the form must not become
 * a directory of the shop's customers. At most three links per person per
 * hour: without that bound, the page would fill someone's mailbox.
 *
 * The link itself is opened by `openSession` — mounted by the app on
 * `/api/storefront/account/login`, because it answers with a redirect and
 * cookies, not with JSON.
 *
 * @module
 */

import { createHash, randomBytes } from 'node:crypto'

import type { Base, Query } from './base.js'
import { CheckoutError } from './checkout.js'

/** The session cookie: HttpOnly, the browser's script never reads it. */
export const CUSTOMER_COOKIE = 'odoro_client'
/** How long a session lasts, in seconds. */
export const SESSION_MAX_AGE = 90 * 24 * 3600
/** How long a link in an e-mail stays valid. */
const LINK_MINUTES = 15
/** Links per person per hour. */
export const LINKS_PER_HOUR = 3
/** The shape of a token: what `randomBytes(32).toString('base64url')` gives. */
const TOKEN = /^[A-Za-z0-9_-]{20,80}$/
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/** Where the sign-in link leaves: Odoro sends it, the shop holds no mail key. */
export interface MailPort {
  sendLoginLink(input: { readonly email: string; readonly token: string }): Promise<void>
}

/** Are the accounts installed (shop 1.3.0)? */
export async function accountsInstalled(db: Query): Promise<boolean> {
  try {
    const { rows } = await db.query<{ present: boolean }>(
      `SELECT to_regclass('shop.customers') IS NOT NULL AS present`,
    )
    return rows[0]?.present === true
  } catch {
    return false
  }
}

function fingerprint(token: string): string {
  return createHash('sha256').update(token).digest('hex')
}

function newToken(): string {
  return randomBytes(32).toString('base64url')
}

export interface Customer {
  readonly id: string
  readonly email: string
  readonly name: string
  readonly consent: boolean
}

/**
 * Creates the account if it does not exist, and records the consent when it
 * is GIVEN — an unticked box never withdraws one given before: that is the
 * profile's job, where the person sees what they change.
 */
async function register(
  db: Query,
  email: string,
  input: { name?: string; consent: boolean; source: 'compte' | 'lettre' },
): Promise<string> {
  const { rows } = await db.query<{ id: string }>(
    `INSERT INTO shop.customers (email, name, marketing_consent, consent_source, consent_at)
     VALUES ($1, $2, $3, CASE WHEN $3 THEN $4 END, CASE WHEN $3 THEN now() END)
     ON CONFLICT (email) DO UPDATE SET
       name = CASE WHEN excluded.name <> '' THEN excluded.name ELSE shop.customers.name END,
       marketing_consent = shop.customers.marketing_consent OR excluded.marketing_consent,
       consent_source = CASE WHEN excluded.marketing_consent AND NOT shop.customers.marketing_consent
                             THEN excluded.consent_source ELSE shop.customers.consent_source END,
       consent_at = CASE WHEN excluded.marketing_consent AND NOT shop.customers.marketing_consent
                         THEN now() ELSE shop.customers.consent_at END
     RETURNING id`,
    [email, (input.name ?? '').trim().slice(0, 120), input.consent, input.source],
  )
  return rows[0]!.id
}

function address(raw: string | undefined): string {
  const email = (raw ?? '').trim().toLowerCase().slice(0, 254)
  if (!EMAIL.test(email))
    throw new CheckoutError(400, "Cette adresse de courriel n'est pas valable.")
  return email
}

/** `lien`: the account, and a link by e-mail — unless three already left this hour. */
export async function requestLink(
  db: Query,
  mail: MailPort,
  input: { email?: string; name?: string; consent?: boolean },
): Promise<void> {
  const email = address(input.email)
  const id = await register(db, email, {
    ...(input.name === undefined ? {} : { name: input.name }),
    consent: input.consent === true,
    source: 'compte',
  })
  const { rows } = await db.query<{ n: number }>(
    `SELECT count(*)::integer AS n FROM shop.customer_links
      WHERE customer_id = $1 AND created_at > now() - interval '1 hour'`,
    [id],
  )
  if (Number(rows[0]?.n ?? 0) >= LINKS_PER_HOUR) return
  const token = newToken()
  await db.query(
    `INSERT INTO shop.customer_links (customer_id, fingerprint, expires_at)
     VALUES ($1, $2, now() + make_interval(mins => $3))`,
    [id, fingerprint(token), LINK_MINUTES],
  )
  try {
    await mail.sendLoginLink({ email, token })
  } catch {
    // The answer stays the same: it must teach nothing to whoever tries.
  }
}

/** `lettre`: the newsletter, on the ticked box only. */
export async function subscribe(
  db: Query,
  input: { email?: string; name?: string; consent?: boolean },
): Promise<void> {
  if (input.consent !== true) throw new CheckoutError(400, 'Requête illisible.')
  await register(db, address(input.email), {
    ...(input.name === undefined ? {} : { name: input.name }),
    consent: true,
    source: 'lettre',
  })
}

/**
 * The link from the e-mail, opened: it serves ONCE. Returns the session to
 * set, and the cart to set when the person had one elsewhere — or `null`
 * when the link is unknown, used or expired.
 *
 * The cart follows the person: this browser's cart becomes theirs; if this
 * browser has none, their last open cart comes back.
 */
export async function openSession(
  db: Base,
  token: string,
  cartToken: string | undefined,
): Promise<{ session: string; cart: string | null } | null> {
  if (!TOKEN.test(token)) return null
  return await db.transaction(async (tx) => {
    const { rows } = await tx.query<{ customer_id: string }>(
      `UPDATE shop.customer_links SET used_at = now()
        WHERE fingerprint = $1 AND used_at IS NULL AND expires_at > now()
        RETURNING customer_id`,
      [fingerprint(token)],
    )
    const customer = rows[0]?.customer_id
    if (customer === undefined) return null
    const session = newToken()
    await tx.query(
      `INSERT INTO shop.customer_sessions (customer_id, fingerprint, expires_at)
       VALUES ($1, $2, now() + make_interval(secs => $3))`,
      [customer, fingerprint(session), SESSION_MAX_AGE],
    )
    await tx.query('UPDATE shop.customers SET last_seen_at = now() WHERE id = $1', [
      customer,
    ])

    if (cartToken !== undefined && cartToken !== '') {
      const { rows: mine } = await tx.query<{ id: string }>(
        `UPDATE shop.carts SET customer_id = $2, updated_at = now()
          WHERE token = $1 AND state = 'ouvert' RETURNING id`,
        [cartToken, customer],
      )
      if (mine.length > 0) return { session, cart: null }
    }
    const { rows: last } = await tx.query<{ token: string }>(
      `SELECT token FROM shop.carts
        WHERE customer_id = $1 AND state = 'ouvert'
        ORDER BY updated_at DESC LIMIT 1`,
      [customer],
    )
    return { session, cart: last[0]?.token ?? null }
  })
}

/** The person a session cookie names, or `null`. */
export async function customerOf(
  db: Query,
  session: string | undefined,
): Promise<Customer | null> {
  if (session === undefined || !TOKEN.test(session)) return null
  const { rows } = await db.query<{
    id: string
    email: string
    name: string
    marketing_consent: boolean
  }>(
    `SELECT c.id, c.email, c.name, c.marketing_consent
       FROM shop.customer_sessions s JOIN shop.customers c ON c.id = s.customer_id
      WHERE s.fingerprint = $1 AND s.expires_at > now()`,
    [fingerprint(session)],
  )
  const c = rows[0]
  return c === undefined
    ? null
    : { id: c.id, email: c.email, name: c.name, consent: c.marketing_consent }
}

/** The profile, as the site's account page reads it. */
export async function profile(db: Query, customer: Customer) {
  // The orders are found by ADDRESS: the link proved the person holds it,
  // and orders placed before the account existed are theirs too.
  const { rows: orders } = await db.query<{
    id: string
    state: string
    total_cents: number
    currency: string
    created_at: Date
    paid_at: Date | null
    shipping_address: Record<string, string> | null
    customer_name: string
  }>(
    `SELECT id, state, total_cents, currency, created_at, paid_at, shipping_address, customer_name
       FROM shop.orders
      WHERE lower(email) = $1 AND state IN ('payee', 'remboursee', 'annulee')
      ORDER BY created_at DESC LIMIT 50`,
    [customer.email],
  )
  const seen = new Set<string>()
  const addresses: { nom: string | null; lignes: string[] }[] = []
  for (const o of orders) {
    const a = o.shipping_address ?? {}
    const lignes = [
      a['ligne1'],
      a['ligne2'],
      `${a['code_postal'] ?? ''} ${a['ville'] ?? ''}`.trim(),
      a['pays'],
    ].filter((x): x is string => typeof x === 'string' && x !== '')
    const key = lignes.join('|')
    if (lignes.length === 0 || seen.has(key) || addresses.length >= 5) continue
    seen.add(key)
    addresses.push({ nom: o.customer_name || null, lignes })
  }
  return {
    nom: customer.name === '' ? null : customer.name,
    courriel: customer.email,
    offres: customer.consent,
    commandes: orders.map((o) => ({
      id: o.id,
      etat: o.state,
      total: new Intl.NumberFormat('fr', {
        style: 'currency',
        currency: o.currency,
      }).format(Number(o.total_cents) / 100),
      le: new Date(o.paid_at ?? o.created_at).toISOString(),
    })),
    adresses: addresses,
  }
}

/** `profil`: the name, and the consent — which the person CAN withdraw here. */
export async function updateProfile(
  db: Query,
  customer: Customer,
  input: { name?: string; consent?: boolean },
): Promise<void> {
  await db.query(
    `UPDATE shop.customers SET
       name = coalesce($2, name),
       marketing_consent = coalesce($3, marketing_consent),
       consent_source = CASE WHEN $3 IS TRUE AND NOT marketing_consent THEN 'compte'
                             WHEN $3 IS FALSE THEN NULL ELSE consent_source END,
       consent_at = CASE WHEN $3 IS TRUE AND NOT marketing_consent THEN now()
                         WHEN $3 IS FALSE THEN NULL ELSE consent_at END,
       last_seen_at = now()
     WHERE id = $1`,
    [
      customer.id,
      input.name === undefined ? null : input.name.trim().slice(0, 120),
      input.consent === undefined ? null : input.consent,
    ],
  )
}

/** `deconnexion`: the session ends here, not only in this browser. */
export async function closeSession(
  db: Query,
  session: string | undefined,
): Promise<void> {
  if (session === undefined || !TOKEN.test(session)) return
  await db.query('DELETE FROM shop.customer_sessions WHERE fingerprint = $1', [
    fingerprint(session),
  ])
}

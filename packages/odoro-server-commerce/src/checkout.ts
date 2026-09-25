/**
 * Checkout: the order lives in the site's database, the MONEY does not.
 *
 * Decided with the founder of Odoro (DECISIONS §43 of the main repository):
 * the payment stays with Odoro (Whop), which knows money and its obligations.
 * This module opens the order, reserves the stock, and hands the payment to a
 * PORT the app wires — Odoro's payment API. The order only keeps the opaque
 * reference the payment returned; it learns the outcome through a SIGNED
 * callback (`confirmPayment`), never from the visitor's browser.
 *
 * The three gestures of the storefront contract:
 *
 *   · `ouvrir`  — reprices the cart at today's prices (and says what changed),
 *     checks and reserves the stock for thirty minutes, writes the order;
 *   · `chiffrer` — the total. Discount codes are not served by this module
 *     yet: a code is refused by name, never silently ignored;
 *   · `payer`   — the payment page, from the port.
 *
 * @module
 */

import { createHmac, timingSafeEqual } from 'node:crypto'

import type { Base, Query } from './base.js'
import { CartError } from './cart.js'

/** A refused checkout gesture: `status` and the sentence the visitor reads. */
export class CheckoutError extends Error {
  constructor(
    readonly status: 400 | 404 | 409,
    message: string,
  ) {
    super(message)
  }
}

/** What the visitor typed, under the storefront contract's names. */
export interface CheckoutInput {
  courriel: string
  nom: string
  ligne1: string
  ligne2?: string
  code_postal: string
  ville: string
  pays: string
  telephone?: string
}

/** Where the money goes: Odoro's payment, wired by the app. */
export interface PaymentPort {
  open(input: {
    readonly orderId: string
    readonly number: number
    readonly totalCents: number
    readonly currency: string
    readonly email: string
  }): Promise<{ readonly reference: string; readonly paymentUrl: string }>
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
/** How long a checkout holds the stock. */
const RESERVATION_MINUTES = 30

function need(value: string | undefined, message: string): string {
  const v = (value ?? '').trim()
  if (v === '') throw new CheckoutError(400, message)
  return v
}

interface OrderRow {
  id: string
  number: string | number
  state: string
  email: string
  currency: string
  subtotal_cents: number
  shipping_cents: number
  tax_cents: number
  total_cents: number
  payment_ref: string | null
}

export async function quote(db: Query, orderId: string) {
  const { rows } = await db.query<OrderRow>('SELECT * FROM shop.orders WHERE id = $1', [
    orderId,
  ])
  const order = rows[0]
  if (order === undefined) throw new CheckoutError(404, "Cette caisse n'existe pas.")
  const { rows: lines } = await db.query<{
    variant_id: string | null
    product_id: string | null
    product_name: string
    unit_price_cents: number
    quantity: number
  }>(
    `SELECT l.variant_id, v.product_id, l.product_name, l.unit_price_cents, l.quantity
       FROM shop.order_lines l LEFT JOIN shop.product_variants v ON v.id = l.variant_id
      WHERE l.order_id = $1 ORDER BY l.product_name`,
    [orderId],
  )
  return {
    caisseId: order.id,
    devise: order.currency,
    lignes: lines.map((l) => ({
      varianteId: l.variant_id ?? '',
      produitId: l.product_id ?? '',
      nom: l.product_name,
      genre: 'physique',
      prixUnitaireCentimes: Number(l.unit_price_cents),
      quantite: Number(l.quantity),
      sousTotalCentimes: Number(l.unit_price_cents) * Number(l.quantity),
      taxable: true,
    })),
    remises: [],
    carteCadeau: null,
    methodeDeLivraison: null,
    sousTotalCentimes: Number(order.subtotal_cents),
    remiseCentimes: 0,
    portCentimes: Number(order.shipping_cents),
    taxeCentimes: Number(order.tax_cents),
    carteCadeauCentimes: 0,
    totalCentimes: Number(order.total_cents),
    taxeIncluse: true,
  }
}

export async function openCheckout(
  db: Base,
  cartId: string,
  input: CheckoutInput,
  currency = 'EUR',
): Promise<{
  orderId: string
  repriced: { varianteId: string; ancienCentimes: number; nouveauCentimes: number }[]
}> {
  const email = need(input.courriel, 'Indiquez votre adresse e-mail.')
  if (!EMAIL.test(email))
    throw new CheckoutError(400, "Cette adresse e-mail n'est pas valable.")
  const name = need(input.nom, 'Indiquez votre nom.')
  const address = {
    ligne1: need(input.ligne1, 'Indiquez votre adresse.'),
    ligne2: (input.ligne2 ?? '').trim(),
    code_postal: need(input.code_postal, 'Indiquez votre code postal.'),
    ville: need(input.ville, 'Indiquez votre ville.'),
    pays: need(input.pays, 'Indiquez votre pays.'),
    telephone: (input.telephone ?? '').trim(),
  }

  return await db.transaction(async (tx) => {
    // A checkout reopened on the same cart replaces the previous one: its
    // reservation is released, and only one open order stays.
    await tx.query(
      `UPDATE shop.stock_reservations SET state = 'relachee'
        WHERE cart_id = $1 AND state = 'ouverte'`,
      [cartId],
    )
    await tx.query(
      `UPDATE shop.orders SET state = 'annulee'
        WHERE cart_id = $1 AND state = 'ouverte' AND payment_ref IS NULL`,
      [cartId],
    )

    const { rows: lines } = await tx.query<{
      variant_id: string
      quantity: number
      unit_price_cents: number
      current_cents: number
      stock: number | null
      for_sale: boolean
      name: string
      label: string | null
    }>(
      `SELECT l.variant_id, l.quantity, l.unit_price_cents,
              coalesce(v.price_cents, p.price_cents) AS current_cents,
              v.stock, (p.published AND p.deleted_at IS NULL) AS for_sale, p.name,
              (SELECT string_agg(vv.value, ' / ' ORDER BY o.position)
                 FROM shop.product_variant_values vv JOIN shop.product_options o ON o.id = vv.option_id
                WHERE vv.variant_id = v.id) AS label
         FROM shop.cart_lines l
         JOIN shop.product_variants v ON v.id = l.variant_id
         JOIN shop.products p ON p.id = v.product_id
        WHERE l.cart_id = $1
        ORDER BY l.variant_id
          FOR UPDATE OF v`,
      [cartId],
    )
    if (lines.length === 0) throw new CartError('Votre panier est vide.')
    const gone = lines.find((l) => !l.for_sale)
    if (gone !== undefined) {
      throw new CheckoutError(
        409,
        `« ${gone.name} » n'est plus en vente : retirez-le de votre panier.`,
      )
    }

    for (const l of lines) {
      if (l.stock === null) continue
      const { rows } = await tx.query<{ held: number }>(
        `SELECT coalesce(sum(quantity), 0)::integer AS held FROM shop.stock_reservations
          WHERE variant_id = $1 AND state = 'ouverte' AND expires_at > now()`,
        [l.variant_id],
      )
      if (Number(l.stock) - Number(rows[0]?.held ?? 0) < Number(l.quantity)) {
        throw new CheckoutError(409, `« ${l.name} » : il n'en reste pas assez.`)
      }
    }

    const repriced = lines
      .filter((l) => Number(l.current_cents) !== Number(l.unit_price_cents))
      .map((l) => ({
        varianteId: l.variant_id,
        ancienCentimes: Number(l.unit_price_cents),
        nouveauCentimes: Number(l.current_cents),
      }))
    for (const r of repriced) {
      await tx.query(
        'UPDATE shop.cart_lines SET unit_price_cents = $3 WHERE cart_id = $1 AND variant_id = $2',
        [cartId, r.varianteId, r.nouveauCentimes],
      )
    }

    const subtotal = lines.reduce(
      (n, l) => n + Number(l.current_cents) * Number(l.quantity),
      0,
    )
    const { rows: created } = await tx.query<{ id: string }>(
      `INSERT INTO shop.orders (cart_id, email, customer_name, shipping_address, currency, subtotal_cents, total_cents)
       VALUES ($1, $2, $3, $4, $5, $6, $6) RETURNING id`,
      [cartId, email, name, JSON.stringify(address), currency, subtotal],
    )
    const orderId = created[0]!.id
    for (const l of lines) {
      await tx.query(
        `INSERT INTO shop.order_lines (order_id, variant_id, product_name, variant_label, unit_price_cents, quantity)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [orderId, l.variant_id, l.name, l.label ?? '', l.current_cents, l.quantity],
      )
      if (l.stock !== null) {
        await tx.query(
          `INSERT INTO shop.stock_reservations (variant_id, cart_id, quantity, expires_at)
           VALUES ($1, $2, $3, now() + make_interval(mins => $4))`,
          [l.variant_id, cartId, l.quantity, RESERVATION_MINUTES],
        )
      }
    }
    await tx.query('UPDATE shop.carts SET email = $2, updated_at = now() WHERE id = $1', [
      cartId,
      email,
    ])
    return { orderId, repriced }
  })
}

/** The quote with a code. Codes are not served here yet: refused by name. */
export async function applyCode(db: Query, orderId: string, code: string | undefined) {
  if ((code ?? '').trim() !== '') {
    throw new CheckoutError(409, "Ce code n'est pas reconnu par cette boutique.")
  }
  return await quote(db, orderId)
}

export async function pay(db: Query, orderId: string, port: PaymentPort) {
  const { rows } = await db.query<OrderRow & { expired: boolean }>(
    `SELECT o.*,
            EXISTS (SELECT 1 FROM shop.stock_reservations r
                     WHERE r.cart_id = o.cart_id AND r.state = 'ouverte' AND r.expires_at <= now()) AS expired
       FROM shop.orders o WHERE o.id = $1`,
    [orderId],
  )
  const order = rows[0]
  if (order === undefined) throw new CheckoutError(404, "Cette caisse n'existe pas.")
  if (order.state !== 'ouverte')
    throw new CheckoutError(409, 'Cette commande ne peut plus être payée.')
  if (order.expired)
    throw new CheckoutError(409, 'Votre réservation a expiré : rouvrez la caisse.')

  const opened = await port.open({
    orderId: order.id,
    number: Number(order.number),
    totalCents: Number(order.total_cents),
    currency: order.currency,
    email: order.email,
  })
  await db.query('UPDATE shop.orders SET payment_ref = $2 WHERE id = $1', [
    order.id,
    opened.reference,
  ])
  const total = Number(order.total_cents)
  return {
    commandeId: order.id,
    numero: Number(order.number),
    jetonDeSuivi: order.id,
    totalCentimes: total,
    totalTexte: new Intl.NumberFormat('fr', {
      style: 'currency',
      currency: order.currency,
    }).format(total / 100),
    adresseDePaiement: opened.paymentUrl,
  }
}

/** How long a signed callback stays valid. */
const CALLBACK_WINDOW_S = 300

/** The signature of a payment callback: HMAC-SHA256 of `reference.state.timestamp`. */
export function signCallback(
  secret: string,
  reference: string,
  state: string,
  timestamp: number,
): string {
  return createHmac('sha256', secret)
    .update(`${reference}.${state}.${timestamp}`)
    .digest('hex')
}

export function verifyCallback(
  secret: string,
  input: { reference: string; etat: string; horodatage: number; signature: string },
  now = Date.now(),
): boolean {
  if (secret === '' || Math.abs(now / 1000 - input.horodatage) > CALLBACK_WINDOW_S)
    return false
  const expected = Buffer.from(
    signCallback(secret, input.reference, input.etat, input.horodatage),
  )
  const received = Buffer.from(input.signature)
  return expected.length === received.length && timingSafeEqual(expected, received)
}

/**
 * The payment's outcome, from Odoro. Idempotent: a callback delivered twice
 * changes nothing the second time.
 */
export async function confirmPayment(
  db: Base,
  reference: string,
  state: 'payee' | 'echouee',
): Promise<boolean> {
  return await db.transaction(async (tx) => {
    const { rows } = await tx.query<{
      id: string
      cart_id: string | null
      state: string
    }>('SELECT id, cart_id, state FROM shop.orders WHERE payment_ref = $1 FOR UPDATE', [
      reference,
    ])
    const order = rows[0]
    if (order === undefined) return false
    if (order.state !== 'ouverte') return true

    if (state === 'echouee') {
      await tx.query(`UPDATE shop.orders SET state = 'echouee' WHERE id = $1`, [order.id])
      await tx.query(
        `UPDATE shop.stock_reservations SET state = 'relachee' WHERE cart_id = $1 AND state = 'ouverte'`,
        [order.cart_id],
      )
      return true
    }

    await tx.query(
      `UPDATE shop.orders SET state = 'payee', paid_at = now() WHERE id = $1`,
      [order.id],
    )
    // The stock leaves when the money arrives, not before.
    await tx.query(
      `UPDATE shop.product_variants v
          SET stock = greatest(v.stock - l.quantity, 0)
         FROM shop.order_lines l
        WHERE l.order_id = $1 AND l.variant_id = v.id AND v.stock IS NOT NULL`,
      [order.id],
    )
    await tx.query(
      `UPDATE shop.stock_reservations SET state = 'consommee' WHERE cart_id = $1 AND state = 'ouverte'`,
      [order.cart_id],
    )
    await tx.query(
      `UPDATE shop.carts SET state = 'commande', updated_at = now() WHERE id = $1`,
      [order.cart_id],
    )
    return true
  })
}

/** An order's state, for the tracking link the buyer received. */
export async function orderState(db: Query, orderId: string) {
  if (!/^[0-9a-f-]{36}$/i.test(orderId)) return null
  const { rows } = await db.query<OrderRow & { created_at: Date }>(
    'SELECT * FROM shop.orders WHERE id = $1',
    [orderId],
  )
  const order = rows[0]
  if (order === undefined) return null
  const { rows: lines } = await db.query<{
    product_name: string
    quantity: number
    unit_price_cents: number
  }>(
    'SELECT product_name, quantity, unit_price_cents FROM shop.order_lines WHERE order_id = $1 ORDER BY product_name',
    [orderId],
  )
  return {
    numero: Number(order.number),
    etat: order.state,
    courriel: order.email,
    totalCentimes: Number(order.total_cents),
    passeeLe: new Date(order.created_at).toISOString(),
    lignes: lines.map((l) => ({
      nom: l.product_name,
      quantite: Number(l.quantity),
      sousTotalCentimes: Number(l.unit_price_cents) * Number(l.quantity),
    })),
    livraisons: [],
  }
}

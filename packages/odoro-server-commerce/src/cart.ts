/**
 * The cart, found by its token.
 *
 * The token travels in an `HttpOnly` cookie: no script of the page reads it,
 * so no third-party script injected into a site can copy it elsewhere. It is
 * set on a GESTURE (an add), never on a visit — a site that sets a cookie on
 * every page view would need a consent banner for it.
 *
 * The unit price is recorded at the add: checkout compares it with the price of
 * the day, and says so when it changed.
 *
 * @module
 */

import { randomBytes } from 'node:crypto'

import type { LigneDePanier, PanierEnVitrine } from '@odoro-cli/commerce'

import type { Query } from './base.js'
import { SQL_AVAILABLE } from './catalogue.js'

export const CART_COOKIE = 'odoro_panier'
/** Thirty days: the window of an abandoned-cart reminder, no longer. */
export const CART_MAX_AGE = 60 * 60 * 24 * 30

const TOKEN = /^vitrine-[0-9a-f]{48}$/

export function isCartToken(value: string | undefined): value is string {
  return value !== undefined && TOKEN.test(value)
}

export function newCartToken(): string {
  return `vitrine-${randomBytes(24).toString('hex')}`
}

/** Refused gestures carry the sentence the visitor reads. */
export class CartError extends Error {}

export async function findCart(
  db: Query,
  token: string | undefined,
): Promise<{ id: string; token: string } | null> {
  if (!isCartToken(token)) return null
  const { rows } = await db.query<{ id: string }>(
    `SELECT id FROM shop.carts WHERE token = $1 AND state = 'ouvert' AND NOT preview`,
    [token],
  )
  const row = rows[0]
  return row === undefined ? null : { id: row.id, token }
}

export async function openCart(db: Query): Promise<{ id: string; token: string }> {
  const token = newCartToken()
  const { rows } = await db.query<{ id: string }>(
    `INSERT INTO shop.carts (token) VALUES ($1) RETURNING id`,
    [token],
  )
  return { id: rows[0]!.id, token }
}

async function touch(db: Query, cartId: string): Promise<void> {
  await db.query('UPDATE shop.carts SET updated_at = now() WHERE id = $1', [cartId])
}

/**
 * Adds a variant. The join on a PUBLISHED product is the guard: a guessed
 * variant id of a draft adds nothing.
 */
export async function addToCart(
  db: Query,
  cartId: string,
  variantId: string,
  quantity: number,
): Promise<void> {
  const qty = Math.min(Math.max(Math.trunc(Number(quantity) || 1), 1), 99)
  const { rows } = await db.query<{ variant_id: string }>(
    `INSERT INTO shop.cart_lines (cart_id, variant_id, quantity, unit_price_cents)
     SELECT $1, v.id, $3, coalesce(v.price_cents, p.price_cents)
       FROM shop.product_variants v
       JOIN shop.products p ON p.id = v.product_id
      WHERE v.id = $2 AND p.published AND p.deleted_at IS NULL
     ON CONFLICT (cart_id, variant_id)
     DO UPDATE SET quantity = least(shop.cart_lines.quantity + excluded.quantity, 99)
     RETURNING variant_id`,
    [cartId, variantId, qty],
  )
  if (rows.length === 0) throw new CartError("Cet article n'est plus en vente.")
  await touch(db, cartId)
}

/** A quantity. Zero removes the line — the gesture the screen expects. */
export async function setQuantity(
  db: Query,
  cartId: string,
  variantId: string,
  quantity: number,
): Promise<void> {
  const qty = Math.min(Math.max(Math.trunc(Number(quantity) || 0), 0), 99)
  if (qty === 0) {
    await db.query('DELETE FROM shop.cart_lines WHERE cart_id = $1 AND variant_id = $2', [
      cartId,
      variantId,
    ])
  } else {
    await db.query(
      'UPDATE shop.cart_lines SET quantity = $3 WHERE cart_id = $1 AND variant_id = $2',
      [cartId, variantId, qty],
    )
  }
  await touch(db, cartId)
}

export async function readCart(
  db: Query,
  cart: { id: string; token: string },
  isNew = false,
): Promise<PanierEnVitrine> {
  const { rows } = await db.query<{
    variant_id: string
    product_id: string
    name: string
    label: string | null
    unit_price_cents: number
    quantity: number
    available: boolean
  }>(
    `SELECT l.variant_id, v.product_id, p.name,
            (SELECT string_agg(vv.value, ' / ' ORDER BY o.position)
               FROM shop.product_variant_values vv
               JOIN shop.product_options o ON o.id = vv.option_id
              WHERE vv.variant_id = v.id) AS label,
            l.unit_price_cents, l.quantity,
            (p.published AND p.deleted_at IS NULL AND ${SQL_AVAILABLE}) AS available
       FROM shop.cart_lines l
       JOIN shop.product_variants v ON v.id = l.variant_id
       JOIN shop.products p ON p.id = v.product_id
      WHERE l.cart_id = $1
      ORDER BY l.added_at, l.variant_id`,
    [cart.id],
  )
  const { rows: head } = await db.query<{ email: string | null }>(
    'SELECT email FROM shop.carts WHERE id = $1',
    [cart.id],
  )
  const lignes: LigneDePanier[] = rows.map((l) => ({
    varianteId: l.variant_id,
    produitId: l.product_id,
    nom: l.name,
    declinaison: l.label ?? '',
    prixUnitaireCentimes: Number(l.unit_price_cents),
    quantite: Number(l.quantity),
    sousTotalCentimes: Number(l.unit_price_cents) * Number(l.quantity),
    disponible: l.available === true,
    visuel: null,
  }))
  return {
    panierId: cart.id,
    jeton: cart.token,
    courriel: head[0]?.email ?? null,
    lignes,
    combien: lignes.reduce((n, l) => n + l.quantite, 0),
    sousTotalCentimes: lignes.reduce((n, l) => n + l.sousTotalCentimes, 0),
    neuf: isNew,
  }
}

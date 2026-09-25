/**
 * The storefront contract, as an `@odoro-cli/server` module.
 *
 * A site that sells, running in its own container with its own database,
 * mounts this module and serves `/api/storefront/*` itself — the same answers
 * as Odoro's central storefront, so the V4 script (`odoro-boutique.js`) and
 * `@odoro-cli/commerce` talk to it without knowing which one they reach.
 *
 * ## What it serves, and what it does not yet
 *
 * The catalogue, product pages, collections, the cart, checkout (open, quote,
 * pay through Odoro) and order tracking. Customer accounts and discount codes
 * are not served here yet: they answer so, by name — an account request says
 * the account is not available, a code says it is not recognised. A gesture
 * that silently does nothing is worse than one that says no.
 *
 * ## Errors speak the contract
 *
 * The storefront's clients read `erreur`. Every refusal is a problem document
 * (RFC 9457, like the rest of the kernel) that also carries `erreur`.
 *
 * @module
 */

import {
  ApiError,
  ConflictError,
  NotFoundError,
  ServiceUnavailableError,
  defineModule,
  route,
  type Cookies,
} from '@odoro-cli/server'
import { z } from 'zod'

import { type Base, shopInstalled } from './base.js'
import {
  CART_COOKIE,
  CART_MAX_AGE,
  CartError,
  addToCart,
  findCart,
  openCart,
  readCart,
  setQuantity,
} from './cart.js'
import { readCatalogue, readCollections, readProduct } from './catalogue.js'
import {
  CheckoutError,
  applyCode,
  confirmPayment,
  openCheckout,
  orderState,
  pay,
  quote,
  verifyCallback,
  type PaymentPort,
} from './checkout.js'

export interface CommerceOptions {
  /** The site's shop database (`@odoro-cli/cloud-connect`, or any `Base`). */
  readonly db: Base
  /** Where the money goes: Odoro's payment. */
  readonly payment: PaymentPort
  /** The secret Odoro signs its payment callbacks with. Empty = callbacks refused. */
  readonly callbackSecret: string
  /** The shop's currency. @defaultValue 'EUR' */
  readonly currency?: string
  /** Mark the cart cookie `Secure`. @defaultValue true */
  readonly secureCookie?: boolean
}

function refusal(
  kind: 'VALIDATION' | 'NOT_FOUND' | 'CONFLICT' | 'UNAVAILABLE',
  message: string,
): ApiError {
  const extensions = { extensions: { erreur: message } }
  if (kind === 'NOT_FOUND') return new NotFoundError(message, extensions)
  if (kind === 'CONFLICT') return new ConflictError(message, extensions)
  if (kind === 'UNAVAILABLE')
    return new ServiceUnavailableError(message, undefined, extensions)
  return new ApiError('VALIDATION', message, extensions)
}

/** Domain refusals become contract errors; anything else stays an internal error. */
async function speaking<T>(work: () => Promise<T>): Promise<T> {
  try {
    return await work()
  } catch (cause) {
    if (cause instanceof CheckoutError) {
      throw refusal(
        cause.status === 404
          ? 'NOT_FOUND'
          : cause.status === 409
            ? 'CONFLICT'
            : 'VALIDATION',
        cause.message,
      )
    }
    if (cause instanceof CartError) throw refusal('CONFLICT', cause.message)
    throw cause
  }
}

const text = z.string().max(200).optional()
const count = z.coerce.number().int().min(0).max(100_000).optional()

export function createCommerceModule(options: CommerceOptions) {
  const { db } = options
  const currency = options.currency ?? 'EUR'
  let installed: Promise<boolean> | null = null

  /** Once per process: the `shop` capability, at a version this module reads. */
  async function ready(): Promise<void> {
    installed ??= shopInstalled(db)
    if (!(await installed)) {
      installed = null
      throw refusal('UNAVAILABLE', "La boutique de ce site n'est pas encore installée.")
    }
  }

  async function cartOf(cookies: Cookies) {
    return await findCart(db, cookies.get(CART_COOKIE))
  }

  function keep(cookies: Cookies, token: string): void {
    cookies.set(CART_COOKIE, token, {
      httpOnly: true,
      sameSite: 'lax',
      maxAge: CART_MAX_AGE,
      ...(options.secureCookie === false ? { secure: false } : {}),
    })
  }

  const storefront = route({
    name: 'storefront.read',
    method: 'GET',
    path: '/api/storefront',
    auth: 'public',
    input: z.object({
      geste: z
        .enum(['catalogue', 'fiche', 'collections', 'commande', 'suggestions'])
        .default('catalogue'),
      produit: text,
      jeton: text,
      q: text,
      collection: text,
      genre: text,
      prix_min: count,
      prix_max: count,
      disponibles: z.string().optional(),
      tri: z
        .enum(['nouveautes', 'prix_croissant', 'prix_decroissant', 'nom'])
        .optional()
        .catch(undefined),
      combien: count,
      depuis: count,
    }),
    summary:
      'The catalogue, a product page, the collections or an order, per the storefront contract.',
    handler: async ({ input }) => {
      await ready()
      if (input.geste === 'fiche') {
        const fiche = await readProduct(db, input.produit ?? '')
        if (fiche === null) throw refusal('NOT_FOUND', "Cet article n'est plus en vente.")
        return { fiche }
      }
      if (input.geste === 'collections') return { collections: await readCollections(db) }
      if (input.geste === 'commande') {
        const commande = await orderState(db, input.jeton ?? '')
        if (commande === null) throw refusal('NOT_FOUND', "Cette commande n'existe pas.")
        return { commande }
      }
      if (input.geste === 'suggestions') {
        const { produits } = await readCatalogue(db, { q: input.q ?? '', combien: 6 })
        return { suggestions: produits.map((p) => ({ id: p.id, nom: p.nom })) }
      }
      return await readCatalogue(db, {
        ...(input.q === undefined ? {} : { q: input.q }),
        ...(input.collection === undefined ? {} : { collection: input.collection }),
        ...(input.genre === undefined ? {} : { genre: input.genre }),
        ...(input.prix_min === undefined ? {} : { prixMin: input.prix_min }),
        ...(input.prix_max === undefined ? {} : { prixMax: input.prix_max }),
        disponibles: input.disponibles === '1',
        ...(input.tri === undefined ? {} : { tri: input.tri }),
        ...(input.combien === undefined ? {} : { combien: input.combien }),
        ...(input.depuis === undefined ? {} : { depuis: input.depuis }),
      })
    },
  })

  /** A page view. Nothing is counted or stored here: no tracker on the site. */
  const visit = route({
    name: 'storefront.visit',
    method: 'POST',
    path: '/api/storefront',
    auth: 'public',
    handler: () => ({ ok: true }),
  })

  const readCartRoute = route({
    name: 'storefront.cart.read',
    method: 'GET',
    path: '/api/storefront/cart',
    auth: 'public',
    handler: async ({ cookies }) => {
      await ready()
      const cart = await cartOf(cookies)
      if (cart === null) {
        return {
          panier: {
            panierId: '',
            jeton: '',
            courriel: null,
            lignes: [],
            combien: 0,
            sousTotalCentimes: 0,
            neuf: false,
          },
        }
      }
      return { panier: await readCart(db, cart) }
    },
  })

  const changeCart = route({
    name: 'storefront.cart.change',
    method: 'POST',
    path: '/api/storefront/cart',
    auth: 'public',
    input: z.object({
      geste: z.enum(['ajouter', 'quantite']).default('ajouter'),
      variante: z.string().regex(/^[0-9a-f-]{36}$/i, "Cet article n'est plus en vente."),
      quantite: z.coerce.number().int().min(0).max(99).default(1),
    }),
    handler: async ({ input, cookies }) =>
      await speaking(async () => {
        await ready()
        const existing = await cartOf(cookies)
        const cart = existing ?? (await openCart(db))
        if (input.geste === 'quantite')
          await setQuantity(db, cart.id, input.variante, input.quantite)
        else await addToCart(db, cart.id, input.variante, input.quantite)
        // The cookie is set on a GESTURE, never on a visit.
        if (existing === null) keep(cookies, cart.token)
        return { panier: await readCart(db, cart, existing === null) }
      }),
  })

  const checkout = route({
    name: 'storefront.checkout',
    method: 'POST',
    path: '/api/storefront/checkout',
    auth: 'public',
    input: z.object({
      geste: z.enum(['ouvrir', 'chiffrer', 'payer']),
      caisse: z.string().max(64).optional(),
      code: z.string().max(40).optional(),
      courriel: text,
      nom: text,
      ligne1: text,
      ligne2: text,
      code_postal: z.string().max(20).optional(),
      ville: text,
      pays: z.string().max(40).optional(),
      telephone: z.string().max(30).optional(),
    }),
    handler: async ({ input, cookies }) =>
      await speaking(async () => {
        await ready()
        if (input.geste === 'ouvrir') {
          const cart = await cartOf(cookies)
          if (cart === null) throw new CheckoutError(400, 'Votre panier est vide.')
          const opened = await openCheckout(
            db,
            cart.id,
            {
              courriel: input.courriel ?? '',
              nom: input.nom ?? '',
              ligne1: input.ligne1 ?? '',
              ligne2: input.ligne2 ?? '',
              code_postal: input.code_postal ?? '',
              ville: input.ville ?? '',
              pays: input.pays ?? '',
              telephone: input.telephone ?? '',
            },
            currency,
          )
          return {
            caisse: opened.orderId,
            prixRevalorises: opened.repriced,
            total: await quote(db, opened.orderId),
          }
        }
        const orderId = input.caisse ?? ''
        if (!/^[0-9a-f-]{36}$/i.test(orderId))
          throw new CheckoutError(404, "Cette caisse n'existe pas.")
        if (input.geste === 'chiffrer')
          return { total: await applyCode(db, orderId, input.code) }
        await applyCode(db, orderId, input.code)
        return await pay(db, orderId, options.payment)
      }),
  })

  /** Odoro tells the payment's outcome. Signed: the browser never decides that an order is paid. */
  const callback = route({
    name: 'storefront.payment.callback',
    method: 'POST',
    path: '/api/storefront/payment-callback',
    auth: 'public',
    input: z.object({
      reference: z.string().min(1).max(200),
      etat: z.enum(['payee', 'echouee']),
      horodatage: z.coerce.number().int(),
      signature: z.string().min(1).max(128),
    }),
    handler: async ({ input }) => {
      await ready()
      if (!verifyCallback(options.callbackSecret, input)) {
        throw refusal('NOT_FOUND', 'Rappel de paiement refusé.')
      }
      const known = await confirmPayment(db, input.reference, input.etat)
      if (!known) throw refusal('NOT_FOUND', 'Paiement inconnu.')
      return { ok: true }
    },
  })

  /** Not served by this module yet — said by name, never a dead button. */
  const accountRead = route({
    name: 'storefront.account.read',
    method: 'GET',
    path: '/api/storefront/account',
    auth: 'public',
    handler: () => ({ connecte: false }),
  })
  const accountWrite = route({
    name: 'storefront.account.write',
    method: 'POST',
    path: '/api/storefront/account',
    auth: 'public',
    handler: () => {
      throw refusal(
        'UNAVAILABLE',
        "Le compte client n'est pas encore disponible sur cette boutique.",
      )
    },
  })

  return defineModule({
    name: 'commerce',
    routes: [
      storefront,
      visit,
      readCartRoute,
      changeCart,
      checkout,
      callback,
      accountRead,
      accountWrite,
    ] as never,
  })
}

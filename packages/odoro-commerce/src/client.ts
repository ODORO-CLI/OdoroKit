/**
 * The storefront client.
 *
 * It speaks the commerce contract to `/api/storefront/*` and NEVER throws: a
 * network failure, a 404 or a body that is not JSON become
 * `{ ok: false, status, error }`. A shop page with a broken network must stay
 * readable, with its buy buttons off and a sentence saying why — never a blank
 * screen from an unhandled rejection.
 *
 * Where the storefront is:
 *
 *   · `"self"` — the published site's own origin. Odoro's site server relays
 *     `/api/storefront/*` there, so the cart cookie belongs to the site, even
 *     on a custom domain;
 *   · an absolute `https://` address — the Odoro workshop preview, together
 *     with a signed `preview` token. A preview document has no host and no
 *     cookie: the token opens the project's catalogue (generated drafts
 *     included), the cart token travels in the URL, and checkout and account
 *     stay closed.
 *
 * @module
 */

import type {
  CatalogueQuery,
  CollectionEnVitrine,
  FicheProduit,
  PanierEnVitrine,
  ProduitEnVitrine,
} from './contract.js'

/** Where a site finds its storefront. */
export interface StorefrontOptions {
  /** `"self"`, an absolute `https://` address, or empty (offline). */
  base: string
  /** The signed preview token of the Odoro workshop, when there is one. */
  preview?: string | null
  /** The site host. Defaults to `window.location.hostname`. */
  host?: string
  /** Injected for tests and non-browser runtimes. */
  fetch?: typeof globalThis.fetch
  /** Aborts a request after this many milliseconds. @defaultValue 15000 */
  timeoutMs?: number
}

/** What every call resolves to. It never rejects. */
export type Result<T> =
  { ok: true; data: T } | { ok: false; status: number; error: string }

/** The reason a call did not reach the storefront, readable by a person. */
export const OFFLINE = 'The shop opens when the site goes live.'
export const CHOOSE_AN_OPTION = 'Choose an option.'
export const NO_LONGER_FOR_SALE = 'This item is no longer for sale.'
export const PREVIEW_CLOSED =
  'Preview: checkout and customer accounts open once the site is live.'

const TOKEN = /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/

function resolveBase(base: string): string {
  const trimmed = base.trim().replace(/\/+$/, '')
  if (trimmed === 'self') {
    return typeof window === 'undefined' ? '' : String(window.location.origin)
  }
  return /^https?:\/\/[^\s"'<>]+$/i.test(trimmed) ? trimmed : ''
}

/** The storefront client for one site. */
export interface Storefront {
  /** False when no storefront is declared: every call answers {@link OFFLINE}. */
  readonly online: boolean
  /** True in the workshop preview. */
  readonly preview: boolean
  catalogue(
    query?: CatalogueQuery,
  ): Promise<Result<{ produits: ProduitEnVitrine[]; total: number }>>
  product(id: string): Promise<Result<FicheProduit>>
  collections(): Promise<Result<CollectionEnVitrine[]>>
  /** The address of a product's first photo, served by the storefront. */
  imageUrl(productId: string): string
  cart(): Promise<Result<PanierEnVitrine>>
  addToCart(variantId: string, quantity?: number): Promise<Result<PanierEnVitrine>>
  /**
   * Adds a PRODUCT: its only variant, or its only one still for sale. A
   * product with several choices refuses (`CHOOSE_AN_OPTION`): nobody picks a
   * size for someone else.
   */
  addProduct(productId: string, quantity?: number): Promise<Result<PanierEnVitrine>>
  setQuantity(variantId: string, quantity: number): Promise<Result<PanierEnVitrine>>
  /**
   * Where checkout happens: the storefront's own checkout page, on the site's
   * domain. `null` offline and in preview — nothing is paid on a site that is
   * not live.
   */
  checkoutUrl(): string | null
}

export function createStorefront(options: StorefrontOptions): Storefront {
  const base = resolveBase(options.base)
  const preview =
    options.preview !== undefined &&
    options.preview !== null &&
    TOKEN.test(options.preview)
      ? options.preview
      : ''
  const host = (
    options.host ?? (typeof window === 'undefined' ? '' : window.location.hostname)
  ).toLowerCase()
  const fetcher =
    options.fetch ?? (typeof fetch === 'function' ? fetch.bind(globalThis) : undefined)
  const online = base !== '' && (host !== '' || preview !== '') && fetcher !== undefined
  let cartToken = ''

  async function call<T>(
    path: string,
    params: Record<string, string>,
    body?: unknown,
  ): Promise<Result<T>> {
    if (!online || fetcher === undefined) return { ok: false, status: 0, error: OFFLINE }
    const query = new URLSearchParams({ host, ...params })
    if (preview !== '') {
      query.set('apercu', preview)
      if (cartToken !== '') query.set('panier', cartToken)
    }
    const controller =
      typeof AbortController === 'function' ? new AbortController() : undefined
    const timer =
      controller === undefined
        ? undefined
        : setTimeout(() => controller.abort(), options.timeoutMs ?? 15_000)
    try {
      const response = await fetcher(`${base}${path}?${query.toString()}`, {
        method: body === undefined ? 'GET' : 'POST',
        // No cookie in preview: the cart token travels in the URL instead.
        credentials: preview === '' ? 'include' : 'omit',
        headers:
          body === undefined
            ? { accept: 'application/json' }
            : { accept: 'application/json', 'content-type': 'application/json' },
        ...(body === undefined ? {} : { body: JSON.stringify(body) }),
        ...(controller === undefined ? {} : { signal: controller.signal }),
      })
      let data: unknown = null
      try {
        data = await response.json()
      } catch {
        data = null
      }
      const record = (data ?? {}) as Record<string, unknown>
      if (!response.ok) {
        const error =
          typeof record.erreur === 'string' && record.erreur !== ''
            ? record.erreur
            : 'That did not go through. Try again in a moment.'
        return { ok: false, status: response.status, error }
      }
      return { ok: true, data: data as T }
    } catch {
      return {
        ok: false,
        status: 0,
        error: 'The shop is not responding. Try again in a moment.',
      }
    } finally {
      if (timer !== undefined) clearTimeout(timer)
    }
  }

  function keepCart(
    result: Result<{ panier: PanierEnVitrine }>,
  ): Result<PanierEnVitrine> {
    if (!result.ok) return result
    if (preview !== '' && typeof result.data.panier.jeton === 'string')
      cartToken = result.data.panier.jeton
    return { ok: true, data: result.data.panier }
  }

  function num(value: number | undefined): string | undefined {
    return value === undefined || !Number.isFinite(value)
      ? undefined
      : String(Math.max(0, Math.trunc(value)))
  }

  const api: Storefront = {
    online,
    preview: preview !== '',
    async catalogue(q = {}) {
      const params: Record<string, string> = { geste: 'catalogue' }
      const put = (key: string, value: string | undefined) => {
        if (value !== undefined && value !== '') params[key] = value
      }
      put('q', q.q)
      put('collection', q.collection)
      put('genre', q.genre)
      put('prix_min', num(q.prixMin))
      put('prix_max', num(q.prixMax))
      put('disponibles', q.disponibles === true ? '1' : undefined)
      put('tri', q.tri)
      put('combien', num(q.combien))
      put('depuis', num(q.depuis))
      return call('/api/storefront', params)
    },
    async product(id) {
      const result = await call<{ fiche: FicheProduit }>('/api/storefront', {
        geste: 'fiche',
        produit: id,
      })
      return result.ok ? { ok: true, data: result.data.fiche } : result
    },
    async collections() {
      const result = await call<{ collections: CollectionEnVitrine[] }>(
        '/api/storefront',
        { geste: 'collections' },
      )
      return result.ok ? { ok: true, data: result.data.collections } : result
    },
    imageUrl(productId) {
      const query = new URLSearchParams({ geste: 'image', produit: productId })
      if (preview !== '') query.set('apercu', preview)
      return `${base}/api/storefront?${query.toString()}`
    },
    async cart() {
      return keepCart(await call<{ panier: PanierEnVitrine }>('/api/storefront/cart', {}))
    },
    async addProduct(productId, quantity = 1) {
      const product = await api.product(productId)
      if (!product.ok) return product
      const variants = product.data.variantes ?? []
      const forSale = variants.filter((v) => v.disponible)
      if (forSale.length === 0)
        return { ok: false, status: 409, error: NO_LONGER_FOR_SALE }
      if (variants.length > 1 && forSale.length > 1) {
        return { ok: false, status: 400, error: CHOOSE_AN_OPTION }
      }
      return api.addToCart(forSale[0]!.id, quantity)
    },
    async addToCart(variantId, quantity = 1) {
      return keepCart(
        await call<{ panier: PanierEnVitrine }>(
          '/api/storefront/cart',
          {},
          {
            geste: 'ajouter',
            variante: variantId,
            quantite: quantity,
            chemin: typeof window === 'undefined' ? '/' : window.location.pathname,
          },
        ),
      )
    },
    checkoutUrl() {
      if (!online || preview !== '') return null
      return `${base}/store/checkout?${new URLSearchParams({ host }).toString()}`
    },
    async setQuantity(variantId, quantity) {
      return keepCart(
        await call<{ panier: PanierEnVitrine }>(
          '/api/storefront/cart',
          {},
          {
            geste: 'quantite',
            variante: variantId,
            quantite: quantity,
          },
        ),
      )
    },
  }
  return api
}

/**
 * Reads the storefront the page declares:
 * `<meta name="odoro-vitrine" content="self|https://…" data-apercu="…">`.
 * Odoro writes it at publication (`self`) and in the workshop preview (an
 * address and a token). Absent or empty, the shop is offline.
 */
export function storefrontFromDocument(
  doc: Document | undefined = typeof document === 'undefined' ? undefined : document,
): StorefrontOptions {
  const meta = doc?.querySelector('meta[name="odoro-vitrine"]') ?? null
  return {
    base: meta?.getAttribute('content') ?? '',
    preview: meta?.getAttribute('data-apercu') ?? null,
  }
}

/** A price in cents, written for the page's language and currency. */
export function formatPrice(cents: number, locale = 'fr', currency = 'EUR'): string {
  const amount = Number(cents) / 100
  if (!Number.isFinite(amount)) return ''
  try {
    return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(amount)
  } catch {
    return `${amount.toFixed(2)} ${currency}`
  }
}

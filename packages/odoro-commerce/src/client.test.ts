import { describe, expect, it } from 'vitest'

import {
  OFFLINE,
  createStorefront,
  formatPrice,
  storefrontFromDocument,
} from './client.js'

/**
 * The storefront client keeps four promises; each one breaks a real shop
 * when it falls:
 *
 *   · it NEVER throws — a failed network leaves the page readable;
 *   · offline (no storefront declared) it sends nothing at all;
 *   · in the workshop preview, the signed token goes with every call, no
 *     cookie is sent, and the cart token the storefront returned comes back;
 *   · checkout is closed in preview: nothing is paid on a site not yet live.
 */

interface Seen {
  url: URL
  init: RequestInit
}

function fakeFetch(
  respond: (url: URL, init: RequestInit) => Response | Promise<Response>,
) {
  const seen: Seen[] = []
  const fetcher = (async (input: string | URL | Request, init: RequestInit = {}) => {
    const url = new URL(String(input))
    seen.push({ url, init })
    return respond(url, init)
  }) as typeof fetch
  return { fetcher, seen }
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  })

const cart = (token: string, count: number) => ({
  panier: {
    panierId: 'p',
    jeton: token,
    courriel: null,
    lignes: [],
    combien: count,
    sousTotalCentimes: 0,
    neuf: false,
  },
})

describe('the storefront client', () => {
  it('offline, it sends nothing and says why', async () => {
    const { fetcher, seen } = fakeFetch(() => json({}))
    const client = createStorefront({ base: '', host: 'shop.test', fetch: fetcher })
    expect(client.online).toBe(false)
    expect(await client.catalogue()).toEqual({ ok: false, status: 0, error: OFFLINE })
    expect(seen).toEqual([])
    expect(client.checkoutUrl()).toBeNull()
  })

  it('never throws: a network failure and a non-JSON body become results', async () => {
    const failing = createStorefront({
      base: 'https://shop.test',
      host: 'shop.test',
      fetch: (() => Promise.reject(new Error('down'))) as typeof fetch,
    })
    expect((await failing.cart()).ok).toBe(false)
    const garbage = createStorefront({
      base: 'https://shop.test',
      host: 'shop.test',
      fetch: (async () => new Response('<html>', { status: 502 })) as typeof fetch,
    })
    const result = await garbage.product('x')
    expect(result).toMatchObject({ ok: false, status: 502 })
  })

  it('reads the storefront error message when there is one', async () => {
    const { fetcher } = fakeFetch(() =>
      json({ erreur: "Cet article n'est plus en vente." }, 404),
    )
    const client = createStorefront({
      base: 'https://shop.test',
      host: 'shop.test',
      fetch: fetcher,
    })
    expect(await client.product('x')).toEqual({
      ok: false,
      status: 404,
      error: "Cet article n'est plus en vente.",
    })
  })

  it('🔴 in preview: the token goes everywhere, no cookie, and the cart token comes back', async () => {
    let count = 0
    const { fetcher, seen } = fakeFetch((url) => {
      if (url.pathname === '/api/storefront/cart')
        return json(cart('vitrine-abc', ++count))
      return json({ produits: [], total: 0 })
    })
    const client = createStorefront({
      base: 'https://odoro.test/',
      preview: 'body.sig',
      host: '',
      fetch: fetcher,
    })
    expect(client.online).toBe(true)
    expect(client.preview).toBe(true)

    await client.catalogue({ q: 'carnet', disponibles: true })
    await client.addToCart('v1')
    await client.addToCart('v1', 2)

    expect(seen.every((s) => s.url.searchParams.get('apercu') === 'body.sig')).toBe(true)
    expect(seen.every((s) => s.init.credentials === 'omit')).toBe(true)
    expect(seen[0]!.url.searchParams.get('q')).toBe('carnet')
    expect(seen[0]!.url.searchParams.get('disponibles')).toBe('1')
    expect(seen[1]!.url.searchParams.get('panier')).toBeNull()
    expect(seen[2]!.url.searchParams.get('panier')).toBe('vitrine-abc')
    expect(JSON.parse(String(seen[2]!.init.body))).toMatchObject({
      geste: 'ajouter',
      variante: 'v1',
      quantite: 2,
    })
    expect(client.checkoutUrl()).toBeNull()
    expect(client.imageUrl('p1')).toBe(
      'https://odoro.test/api/storefront?geste=image&produit=p1&apercu=body.sig',
    )
  })

  it('a published site sends its cookie, and pays on its own domain', async () => {
    const { fetcher, seen } = fakeFetch(() => json(cart('t', 1)))
    const client = createStorefront({
      base: 'https://shop.test',
      host: 'shop.test',
      fetch: fetcher,
    })
    await client.cart()
    expect(seen[0]!.init.credentials).toBe('include')
    expect(seen[0]!.url.searchParams.get('host')).toBe('shop.test')
    expect(client.checkoutUrl()).toBe('https://shop.test/store/checkout?host=shop.test')
  })

  it('a token that is not one is ignored', () => {
    const client = createStorefront({
      base: 'https://odoro.test',
      preview: 'not a token',
      host: 'x.test',
      fetch: fetch,
    })
    expect(client.preview).toBe(false)
  })
})

describe('the page declares its storefront', () => {
  it('reads the address and the preview token from the meta tag', () => {
    document.head.innerHTML =
      '<meta name="odoro-vitrine" content="https://odoro.test" data-apercu="a.b" />'
    expect(storefrontFromDocument(document)).toEqual({
      base: 'https://odoro.test',
      preview: 'a.b',
    })
    document.head.innerHTML = ''
    expect(storefrontFromDocument(document)).toEqual({ base: '', preview: null })
  })
})

describe('prices', () => {
  it('are written for the language and the currency', () => {
    expect(formatPrice(2450, 'fr', 'EUR').replace(/\s/g, ' ')).toBe('24,50 €')
    expect(formatPrice(2450, 'en', 'USD')).toBe('$24.50')
    expect(formatPrice(Number.NaN)).toBe('')
  })
})

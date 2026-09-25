import { act, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { createStorefront } from './client.js'
import { CommerceProvider, useCart, useCatalogue } from './react.js'

/**
 * The hooks: ONE cart for the whole site (the header counter and the drawer
 * must agree), a catalogue that keeps its cards when a call fails, and the
 * reason checkout is closed in preview.
 */

function storefront(preview = false) {
  let count = 0
  let failCatalogue = false
  const fetcher = (async (input: string | URL | Request, init: RequestInit = {}) => {
    const url = new URL(String(input))
    const body = (data: unknown, status = 200) =>
      new Response(JSON.stringify(data), { status })
    if (url.pathname === '/api/storefront/cart') {
      if (init.method === 'POST') count += 1
      return body({
        panier: {
          panierId: 'p',
          jeton: 'vitrine-x',
          courriel: null,
          lignes: [],
          combien: count,
          sousTotalCentimes: 0,
          neuf: false,
        },
      })
    }
    if (failCatalogue) return body({ erreur: 'down' }, 503)
    return body({
      total: 1,
      produits: [
        {
          id: 'p1',
          nom: 'Carnet en lin',
          description: '',
          genre: 'physique',
          prixCentimes: 2400,
          prixBarreCentimes: null,
          disponible: true,
          visuel: null,
          etiquettes: [],
          prixUnitaire: null,
        },
      ],
    })
  }) as typeof fetch
  return {
    client: createStorefront({
      base: 'https://shop.test',
      host: 'shop.test',
      ...(preview ? { preview: 'a.b' } : {}),
      fetch: fetcher,
    }),
    breakCatalogue: () => {
      failCatalogue = true
    },
  }
}

function Counter() {
  const cart = useCart()
  return <span data-testid="counter">{cart.count}</span>
}

function AddButton() {
  const cart = useCart()
  return (
    <button
      onClick={() => {
        void cart.add('v1')
      }}
    >
      Add
    </button>
  )
}

function Grid({ q }: { q: string }) {
  const { data, status } = useCatalogue({ q })
  return (
    <p data-testid="grid">
      {status}:{data.produits.map((p) => p.nom).join(',')}
    </p>
  )
}

function Checkout() {
  const cart = useCart()
  return <p data-testid="checkout">{cart.checkoutUrl ?? cart.checkoutClosed}</p>
}

describe('the commerce hooks', () => {
  it('🔴 every component shares ONE cart', async () => {
    const { client } = storefront()
    render(
      <CommerceProvider storefront={client}>
        <Counter />
        <AddButton />
      </CommerceProvider>,
    )
    await waitFor(() => expect(screen.getByTestId('counter').textContent).toBe('0'))
    await act(async () => {
      screen.getByText('Add').click()
    })
    await waitFor(() => expect(screen.getByTestId('counter').textContent).toBe('1'))
  })

  it('a failed read keeps the cards it had', async () => {
    const { client, breakCatalogue } = storefront()
    const { rerender } = render(
      <CommerceProvider storefront={client}>
        <Grid q="a" />
      </CommerceProvider>,
    )
    await waitFor(() =>
      expect(screen.getByTestId('grid').textContent).toBe('ready:Carnet en lin'),
    )
    breakCatalogue()
    rerender(
      <CommerceProvider storefront={client}>
        <Grid q="b" />
      </CommerceProvider>,
    )
    await waitFor(() =>
      expect(screen.getByTestId('grid').textContent).toBe('error:Carnet en lin'),
    )
  })

  it('says why checkout is closed in preview, and where to pay once live', async () => {
    const preview = storefront(true)
    const { unmount } = render(
      <CommerceProvider storefront={preview.client}>
        <Checkout />
      </CommerceProvider>,
    )
    expect(screen.getByTestId('checkout').textContent).toMatch(/^Preview/)
    unmount()
    const live = storefront(false)
    render(
      <CommerceProvider storefront={live.client}>
        <Checkout />
      </CommerceProvider>,
    )
    expect(screen.getByTestId('checkout').textContent).toBe(
      'https://shop.test/store/checkout?host=shop.test',
    )
  })
})

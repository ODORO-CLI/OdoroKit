import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { CartDrawer, ProductCard, ProductGrid, formatPrice } from './Commerce.js'

/**
 * The shop components keep the attribute contract Odoro's storefront script
 * and its publication read — `data-produit`, `data-acheter`, the name in the
 * `h3`, the price in `[data-prix]` — and they never sell what is sold out or
 * pay where checkout is closed.
 */

const carnet = {
  id: 'p1',
  name: 'Carnet en lin',
  priceCents: 2400,
  compareAtCents: 2900,
  description: 'Cousu main.',
}

describe('ProductCard', () => {
  it('🔴 carries the contract the storefront script reads', () => {
    const { container } = render(<ProductCard product={carnet} onAdd={() => undefined} />)
    const card = container.querySelector('[data-produit="p1"]')
    expect(card).not.toBeNull()
    expect(card!.querySelector('h3')!.textContent).toBe('Carnet en lin')
    expect(card!.querySelector('[data-prix]')!.textContent!.replace(/\s/g, ' ')).toBe(
      '24,00 €',
    )
    expect(card!.querySelector('[data-prix-barre]')).not.toBeNull()
    expect(card!.querySelector('[data-acheter="p1"]')).not.toBeNull()
  })

  it('does not strike a former price that is not above the price', () => {
    const { container } = render(
      <ProductCard product={{ ...carnet, compareAtCents: 2000 }} />,
    )
    expect(container.querySelector('[data-prix-barre]')).toBeNull()
  })

  it('🔴 a sold-out product says so, and cannot be added', () => {
    const onAdd = vi.fn()
    render(
      <ProductCard
        product={{ ...carnet, available: false }}
        onAdd={onAdd}
        soldOutLabel="Épuisé"
      />,
    )
    const button = screen.getByText('Épuisé').closest('button')!
    // The library blocks with aria-disabled, which keeps the button focusable and announced.
    expect(button.getAttribute('aria-disabled')).toBe('true')
    fireEvent.click(button)
    expect(onAdd).not.toHaveBeenCalled()
  })

  it('calls back with the product id', () => {
    const onAdd = vi.fn()
    render(<ProductCard product={carnet} onAdd={onAdd} addLabel="Ajouter" />)
    fireEvent.click(screen.getByText('Ajouter'))
    expect(onAdd).toHaveBeenCalledWith('p1')
  })
})

describe('ProductGrid', () => {
  it('one card per product, and the empty state when there is none', () => {
    const { container, rerender } = render(
      <ProductGrid products={[carnet, { ...carnet, id: 'p2' }]} />,
    )
    expect(container.querySelectorAll('[data-produit]')).toHaveLength(2)
    rerender(<ProductGrid products={[]} empty={<p>Rien pour l’instant.</p>} />)
    expect(screen.getByText('Rien pour l’instant.')).toBeTruthy()
  })
})

describe('CartDrawer', () => {
  const lines = [{ variantId: 'v1', name: 'Carnet en lin', unitCents: 2400, quantity: 2 }]

  it('🔴 with checkout closed, no way to pay — and the reason is said', () => {
    render(
      <CartDrawer
        open
        onClose={() => undefined}
        lines={lines}
        subtotalCents={4800}
        checkoutHref={null}
        closedReason="Aperçu : la caisse s'ouvre à la mise en ligne."
      />,
    )
    expect(document.querySelector('[data-panier-caisse]')).toBeNull()
    expect(
      screen.getByText("Aperçu : la caisse s'ouvre à la mise en ligne."),
    ).toBeTruthy()
  })

  it('changes quantities, removes with zero, and totals', () => {
    const onQuantity = vi.fn()
    render(
      <CartDrawer
        open
        onClose={() => undefined}
        lines={lines}
        subtotalCents={4800}
        onQuantity={onQuantity}
        checkoutHref="/store/checkout"
        labels={{ remove: 'Retirer' }}
      />,
    )
    fireEvent.click(screen.getByLabelText('Add one : Carnet en lin'))
    fireEvent.click(screen.getByText('Retirer'))
    expect(onQuantity.mock.calls).toEqual([
      ['v1', 3],
      ['v1', 0],
    ])
    expect(
      document.querySelector('[data-panier-total]')!.textContent!.replace(/\s/g, ' '),
    ).toBe('48,00 €')
    expect(document.querySelector('[data-panier-caisse]')!.getAttribute('href')).toBe(
      '/store/checkout',
    )
  })
})

describe('formatPrice', () => {
  it('writes cents for the language and the currency', () => {
    expect(formatPrice(129000, 'fr').replace(/\s/g, ' ')).toBe('1 290,00 €')
    expect(formatPrice(999, 'en', 'GBP')).toBe('£9.99')
  })
})

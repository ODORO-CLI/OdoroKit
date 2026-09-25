/**
 * Shop components: a product card, a product grid, and a cart drawer.
 *
 * Presentational, like the rest of the library: they receive their data in
 * props and call back on gestures. The data layer is `@odoro-cli/commerce`,
 * which reads the storefront; keeping it out of here means a site that sells
 * nothing never pulls a network client.
 *
 * Two rules the markup keeps, because Odoro's storefront script and its
 * publication read them on every shop page, whatever wrote it:
 *
 *   · the card root carries `data-produit="<id>"` and the buy button
 *     `data-acheter="<id>"`;
 *   · the product name is in the card's `h3`, the price in `[data-prix]`.
 *
 * @module
 */

import { type ReactElement, type ReactNode } from 'react'

import { cx } from '../styles/cx.js'
import { Button } from './Button.jsx'
import { Drawer } from './Drawer.jsx'

/**
 * A price in cents, written for the page's language and currency.
 *
 * @example
 * formatPrice(2450) // « 24,50 € »
 * formatPrice(2450, 'en', 'USD') // « $24.50 »
 */
export function formatPrice(cents: number, locale = 'fr', currency = 'EUR'): string {
  const amount = Number(cents) / 100
  if (!Number.isFinite(amount)) return ''
  try {
    return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(amount)
  } catch {
    return `${amount.toFixed(2)} ${currency}`
  }
}

/** A product, as a card shows it. */
export interface ProductCardProduct {
  id: string
  name: string
  /** Price in cents. */
  priceCents: number
  /** Former price in cents, shown struck through when above the price. */
  compareAtCents?: number | null
  description?: string
  image?: { src: string; alt?: string } | null
  href?: string
  /** False = sold out: the buy button says so and stays off. */
  available?: boolean
}

/** Properties of {@link ProductCard}. */
export interface ProductCardProps {
  product: ProductCardProduct
  /** Called with the product id. Absent, the card has no buy button. */
  onAdd?: (id: string) => void
  /** Label of the buy button. @defaultValue 'Add to cart' */
  addLabel?: ReactNode
  /** Label shown instead when sold out. @defaultValue 'Sold out' */
  soldOutLabel?: ReactNode
  /** True while the add is on its way. */
  adding?: boolean
  locale?: string
  currency?: string
  className?: string
}

export function ProductCard({
  product,
  onAdd,
  addLabel = 'Add to cart',
  soldOutLabel = 'Sold out',
  adding = false,
  locale = 'fr',
  currency = 'EUR',
  className,
}: ProductCardProps): ReactElement {
  const available = product.available !== false
  const struck =
    product.compareAtCents !== undefined &&
    product.compareAtCents !== null &&
    product.compareAtCents > product.priceCents
  const name =
    product.href === undefined ? (
      product.name
    ) : (
      <a href={product.href} className="o-text-zinc-900 dark:o-text-zinc-50">
        {product.name}
      </a>
    )

  return (
    <article
      data-produit={product.id}
      className={cx('o-flex o-flex-col o-gap-2 o-min-w-0', className)}
    >
      {product.image ? (
        <img
          src={product.image.src}
          alt={product.image.alt ?? product.name}
          loading="lazy"
          decoding="async"
          className="o-w-full o-aspect-square o-object-cover o-rounded-md"
        />
      ) : null}
      <h3 className="o-m-0 o-text-base o-font-semibold o-leading-snug">{name}</h3>
      <p className="o-m-0 o-flex o-items-center o-gap-2 o-tabular-nums">
        <span data-prix>{formatPrice(product.priceCents, locale, currency)}</span>
        {struck ? (
          <span data-prix-barre className="o-text-sm o-text-zinc-500 o-line-through">
            {formatPrice(product.compareAtCents ?? 0, locale, currency)}
          </span>
        ) : null}
      </p>
      {product.description ? (
        <p className="o-m-0 o-text-sm o-text-zinc-600 dark:o-text-zinc-400">
          {product.description}
        </p>
      ) : null}
      {onAdd === undefined ? null : (
        <Button
          size="sm"
          data-acheter={product.id}
          disabled={!available}
          loading={adding}
          onClick={() => onAdd(product.id)}
          className="o-mt-auto"
        >
          {available ? addLabel : soldOutLabel}
        </Button>
      )}
    </article>
  )
}

/** Properties of {@link ProductGrid}. */
export interface ProductGridProps {
  products: readonly ProductCardProduct[]
  onAdd?: (id: string) => void
  /** The product whose add is on its way. */
  addingId?: string | null
  addLabel?: ReactNode
  soldOutLabel?: ReactNode
  /** Shown when there is nothing to list. */
  empty?: ReactNode
  locale?: string
  currency?: string
  className?: string
}

/** A responsive grid of product cards: one column, two, then three. */
export function ProductGrid({
  products,
  onAdd,
  addingId = null,
  addLabel,
  soldOutLabel,
  empty = null,
  locale,
  currency,
  className,
}: ProductGridProps): ReactElement {
  if (products.length === 0) return <>{empty}</>
  return (
    <div className={cx('o-grid o-gap-6 sm:o-grid-cols-2 lg:o-grid-cols-3', className)}>
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          {...(onAdd === undefined ? {} : { onAdd })}
          adding={addingId === product.id}
          {...(addLabel === undefined ? {} : { addLabel })}
          {...(soldOutLabel === undefined ? {} : { soldOutLabel })}
          {...(locale === undefined ? {} : { locale })}
          {...(currency === undefined ? {} : { currency })}
        />
      ))}
    </div>
  )
}

/** One line of a cart. */
export interface CartLine {
  variantId: string
  name: string
  /** « Size: M », or empty. */
  variant?: string
  unitCents: number
  quantity: number
  /** False = no longer for sale: the line says so. */
  available?: boolean
  image?: string | null
}

/** Properties of {@link CartDrawer}. */
export interface CartDrawerProps {
  open: boolean
  onClose: () => void
  lines: readonly CartLine[]
  subtotalCents: number
  /** Called with the new quantity; 0 removes the line. */
  onQuantity?: (variantId: string, quantity: number) => void
  /** Where to pay. `null` = checkout closed, and `closedReason` says why. */
  checkoutHref: string | null
  closedReason?: ReactNode
  labels?: Partial<{
    title: ReactNode
    empty: ReactNode
    subtotal: ReactNode
    checkout: ReactNode
    remove: string
    less: string
    more: string
    unavailable: ReactNode
  }>
  locale?: string
  currency?: string
}

const CART_LABELS = {
  title: 'Cart',
  empty: 'Your cart is empty.',
  subtotal: 'Subtotal',
  checkout: 'Checkout',
  remove: 'Remove',
  less: 'Remove one',
  more: 'Add one',
  unavailable: 'This item is no longer available.',
}

/** The cart, in a side drawer: lines, quantities, subtotal and the way to pay. */
export function CartDrawer({
  open,
  onClose,
  lines,
  subtotalCents,
  onQuantity,
  checkoutHref,
  closedReason = null,
  labels = {},
  locale = 'fr',
  currency = 'EUR',
}: CartDrawerProps): ReactElement | null {
  const t = { ...CART_LABELS, ...labels }
  const price = (cents: number) => formatPrice(cents, locale, currency)

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={t.title}
      data-panier="tiroir"
      footer={
        <div className="o-flex o-flex-col o-gap-2 o-w-full">
          <p className="o-m-0 o-flex o-justify-between o-font-semibold o-tabular-nums">
            <span>{t.subtotal}</span>
            <span data-panier-total>{price(subtotalCents)}</span>
          </p>
          {checkoutHref === null ? (
            <p className="o-m-0 o-text-sm o-text-zinc-600 dark:o-text-zinc-400">
              {closedReason}
            </p>
          ) : (
            <a
              href={checkoutHref}
              data-panier-caisse
              aria-disabled={lines.length === 0}
              className="o-inline-flex o-items-center o-justify-center o-h-10 o-px-4 o-rounded-md o-font-medium o-bg-zinc-950 o-text-zinc-50 dark:o-bg-zinc-50 dark:o-text-zinc-950"
            >
              {t.checkout}
            </a>
          )}
        </div>
      }
    >
      {lines.length === 0 ? (
        <p className="o-m-0 o-py-3 o-text-zinc-600 dark:o-text-zinc-400">{t.empty}</p>
      ) : (
        <ul data-panier-lignes className="o-list-none o-p-0 o-m-0">
          {lines.map((line) => (
            <li
              key={line.variantId}
              data-variante={line.variantId}
              className="o-flex o-items-start o-gap-3 o-py-3 o-border-b o-border-zinc-200 dark:o-border-zinc-800"
            >
              {line.image ? (
                <img
                  src={line.image}
                  alt=""
                  className="o-w-16 o-h-16 o-object-cover o-rounded-sm"
                />
              ) : null}
              <div className="o-flex o-flex-col o-gap-1 o-flex-1 o-min-w-0">
                <p className="o-m-0 o-font-semibold o-truncate">{line.name}</p>
                {line.variant ? (
                  <p className="o-m-0 o-text-sm o-text-zinc-500">{line.variant}</p>
                ) : null}
                {line.available === false ? (
                  <p className="o-m-0 o-text-sm o-text-zinc-600" role="status">
                    {t.unavailable}
                  </p>
                ) : null}
                {onQuantity === undefined ? (
                  <p className="o-m-0 o-text-sm o-tabular-nums">× {line.quantity}</p>
                ) : (
                  <div className="o-flex o-items-center o-gap-2">
                    <Button
                      size="sm"
                      tone="secondary"
                      aria-label={`${t.less} : ${line.name}`}
                      onClick={() => onQuantity(line.variantId, line.quantity - 1)}
                    >
                      −
                    </Button>
                    <span className="o-tabular-nums" aria-live="polite">
                      {line.quantity}
                    </span>
                    <Button
                      size="sm"
                      tone="secondary"
                      aria-label={`${t.more} : ${line.name}`}
                      disabled={line.quantity >= 99}
                      onClick={() => onQuantity(line.variantId, line.quantity + 1)}
                    >
                      +
                    </Button>
                    <Button
                      size="sm"
                      tone="ghost"
                      className="o-ml-auto"
                      onClick={() => onQuantity(line.variantId, 0)}
                    >
                      {t.remove}
                    </Button>
                  </div>
                )}
              </div>
              <p className="o-m-0 o-text-right o-tabular-nums">
                {price(line.unitCents * line.quantity)}
              </p>
            </li>
          ))}
        </ul>
      )}
    </Drawer>
  )
}

# @odoro-cli/commerce

The storefront client for sites built with Odoro: the commerce contract, a
typed client that never throws, and React hooks for the catalogue and the cart.

```sh
npm i @odoro-cli/commerce
```

## Where the storefront is

A selling site declares its storefront in one tag, which Odoro writes:

```html
<!-- on the published site: the storefront answers on the site's own domain -->
<meta name="odoro-vitrine" content="self" />
<!-- in the Odoro workshop preview: an address and a signed token -->
<meta name="odoro-vitrine" content="https://odoro.ai" data-apercu="…" />
```

Absent or empty, the shop is offline: nothing is sent, and every call says so.

## React

```tsx
import { CommerceProvider, useCart, useCatalogue } from '@odoro-cli/commerce/react'
import { CartDrawer, ProductGrid } from '@odoro-cli/libs/ui'

function Shop() {
  const { data } = useCatalogue()
  const cart = useCart()
  return (
    <ProductGrid
      products={data.produits.map((p) => ({
        id: p.id,
        name: p.nom,
        priceCents: p.prixCentimes,
        compareAtCents: p.prixBarreCentimes,
        available: p.disponible,
      }))}
      onAdd={(id) => void cart.addProduct(id)}
    />
  )
}

export function App() {
  return (
    <CommerceProvider>
      <Shop />
    </CommerceProvider>
  )
}
```

`useCart()` is shared: every component inside one `CommerceProvider` reads the
same cart, so the header counter and the drawer always agree.
`cart.addProduct(productId)` adds a product's only variant — or its only one
still for sale — and refuses a product with several choices (`Choose an
option.`): pick the variant on the product page with `useProduct(id)`, then
`cart.add(variantId)`.

## Without React

```ts
import { createStorefront, storefrontFromDocument } from '@odoro-cli/commerce'

const shop = createStorefront(storefrontFromDocument())
const result = await shop.catalogue({ q: 'carnet', disponibles: true })
if (result.ok) console.log(result.data.produits)
else console.log(result.error)
```

Every call resolves to `{ ok: true, data }` or `{ ok: false, status, error }`.
None rejects: a broken network leaves the page readable.

## The preview

In the Odoro workshop the page is a document without a host or cookies. The
signed token opens the project's catalogue — generated drafts included — and
the cart token travels in the URL. Checkout and customer accounts stay closed:
`cart.checkoutUrl` is `null` and `cart.checkoutClosed` says why.

## The contract

JSON keys are French because they are the Odoro storefront's own response
keys. `CONTRACT_VERSION` follows `VERSION_DU_CONTRAT` in Odoro
(`lib/shop/contrat-de-la-vitrine.ts`); it rises only when a response loses a
field or changes its meaning.

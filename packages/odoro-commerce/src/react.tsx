/**
 * React bindings for the storefront.
 *
 * `<CommerceProvider>` holds ONE client for the whole site — the cart token of
 * a preview lives in it, and two clients would hold two carts. Without a
 * `storefront` prop it reads the page's declaration
 * (`<meta name="odoro-vitrine">`), which Odoro writes at publication and in the
 * workshop preview.
 *
 * The hooks never throw: a failed call leaves `error` set and the data as it
 * was, so a grid keeps its cards and only the buy buttons go off.
 *
 * @module
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactElement,
  type ReactNode,
} from 'react'

import {
  OFFLINE,
  PREVIEW_CLOSED,
  createStorefront,
  storefrontFromDocument,
  type Result,
  type Storefront,
} from './client.js'
import type {
  CatalogueQuery,
  FicheProduit,
  PanierEnVitrine,
  ProduitEnVitrine,
} from './contract.js'

const StorefrontContext = createContext<Storefront | null>(null)
const CartContext = createContext<CartState | null>(null)

/** Properties of {@link CommerceProvider}. */
export interface CommerceProviderProps {
  /** A client built elsewhere. Defaults to the page's declaration. */
  storefront?: Storefront
  children?: ReactNode
}

export function CommerceProvider({
  storefront,
  children,
}: CommerceProviderProps): ReactElement {
  const client = useMemo(
    () => storefront ?? createStorefront(storefrontFromDocument()),
    [storefront],
  )
  // ONE cart for the whole site: the header counter and the drawer read the same.
  const cart = useCartState(client, true)
  return (
    <StorefrontContext.Provider value={client}>
      <CartContext.Provider value={cart}>{children}</CartContext.Provider>
    </StorefrontContext.Provider>
  )
}

/** The site's storefront client. Outside a provider, an offline one. */
export function useStorefront(): Storefront {
  const client = useContext(StorefrontContext)
  return useMemo(() => client ?? createStorefront({ base: '' }), [client])
}

/** State of a read: `loading` first, then `ready` or `error`. */
export interface Loaded<T> {
  data: T
  status: 'loading' | 'ready' | 'error' | 'offline'
  error: string | null
}

function settle<T>(result: Result<T>, previous: T, online: boolean): Loaded<T> {
  if (result.ok) return { data: result.data, status: 'ready', error: null }
  return { data: previous, status: online ? 'error' : 'offline', error: result.error }
}

/** The catalogue, filtered. Re-reads when the query changes. */
export function useCatalogue(
  query: CatalogueQuery = {},
): Loaded<{ produits: ProduitEnVitrine[]; total: number }> {
  const client = useStorefront()
  const key = JSON.stringify(query)
  const empty = { produits: [] as ProduitEnVitrine[], total: 0 }
  const [state, setState] = useState<Loaded<typeof empty>>({
    data: empty,
    status: client.online ? 'loading' : 'offline',
    error: client.online ? null : OFFLINE,
  })
  useEffect(() => {
    let alive = true
    void client.catalogue(JSON.parse(key) as CatalogueQuery).then((result) => {
      if (alive) setState((previous) => settle(result, previous.data, client.online))
    })
    return () => {
      alive = false
    }
  }, [client, key])
  return state
}

/** One product page, with its variants. */
export function useProduct(id: string): Loaded<FicheProduit | null> {
  const client = useStorefront()
  const [state, setState] = useState<Loaded<FicheProduit | null>>({
    data: null,
    status: client.online ? 'loading' : 'offline',
    error: client.online ? null : OFFLINE,
  })
  useEffect(() => {
    let alive = true
    void client.product(id).then((result) => {
      if (alive) setState((previous) => settle(result, previous.data, client.online))
    })
    return () => {
      alive = false
    }
  }, [client, id])
  return state
}

/** The cart, and the gestures that change it. */
export interface CartState extends Loaded<PanierEnVitrine | null> {
  /** Number of items, 0 while unknown. */
  count: number
  /** True while a gesture is on its way. */
  busy: boolean
  add(variantId: string, quantity?: number): Promise<boolean>
  /** Adds a product by its id: see {@link Storefront.addProduct}. */
  addProduct(productId: string, quantity?: number): Promise<boolean>
  setQuantity(variantId: string, quantity: number): Promise<boolean>
  /** Where to pay, or `null` offline and in preview (see {@link PREVIEW_CLOSED}). */
  checkoutUrl: string | null
  /** Why checkout is closed, when it is. */
  checkoutClosed: string | null
}

/**
 * The site's cart. Inside a {@link CommerceProvider}, every caller shares the
 * same one; outside, the component gets an offline cart of its own.
 */
export function useCart(): CartState {
  const shared = useContext(CartContext)
  const client = useStorefront()
  const local = useCartState(client, shared === null)
  return shared ?? local
}

function useCartState(client: Storefront, enabled: boolean): CartState {
  const [state, setState] = useState<Loaded<PanierEnVitrine | null>>({
    data: null,
    status: client.online ? 'loading' : 'offline',
    error: client.online ? null : OFFLINE,
  })
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!enabled) return undefined
    let alive = true
    void client.cart().then((result) => {
      if (alive) setState((previous) => settle(result, previous.data, client.online))
    })
    return () => {
      alive = false
    }
  }, [client, enabled])

  const apply = useCallback(
    async (gesture: () => Promise<Result<PanierEnVitrine>>) => {
      setBusy(true)
      const result = await gesture()
      setState((previous) => settle(result, previous.data, client.online))
      setBusy(false)
      return result.ok
    },
    [client],
  )

  const checkoutUrl = client.checkoutUrl()
  return {
    ...state,
    count: state.data?.combien ?? 0,
    busy,
    add: (variantId, quantity = 1) => apply(() => client.addToCart(variantId, quantity)),
    addProduct: (productId, quantity = 1) =>
      apply(() => client.addProduct(productId, quantity)),
    setQuantity: (variantId, quantity) =>
      apply(() => client.setQuantity(variantId, quantity)),
    checkoutUrl,
    checkoutClosed:
      checkoutUrl !== null ? null : client.preview ? PREVIEW_CLOSED : OFFLINE,
  }
}

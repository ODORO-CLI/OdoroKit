/**
 * Odoro storefront client.
 *
 * The contract, a client that never throws, and the reader of the page's
 * storefront declaration. React hooks live in `@odoro-cli/commerce/react`.
 *
 * @module
 */

export {
  CONTRACT_VERSION,
  type CatalogueQuery,
  type CollectionEnVitrine,
  type FicheProduit,
  type LigneDePanier,
  type PanierEnVitrine,
  type PrixUnitaire,
  type ProduitEnVitrine,
  type VarianteEnVitrine,
  type Visuel,
} from './contract.js'

export {
  OFFLINE,
  PREVIEW_CLOSED,
  createStorefront,
  formatPrice,
  storefrontFromDocument,
  type Result,
  type Storefront,
  type StorefrontOptions,
} from './client.js'

/**
 * The commerce contract — the one API shape a selling site knows.
 *
 * A site built by Odoro, whether the V4 engine wrote it in HTML or the stack
 * wrote it in React, only talks to `/api/storefront/*`. Today those routes
 * live in ODORO and read its central database; tomorrow a commerce module of
 * `@odoro-cli/server` may serve them from a shop's own database. The site must
 * not see the difference: this file is the copy it relies on.
 *
 * The source of truth is `lib/shop/contrat-de-la-vitrine.ts` in the ODORO
 * repository. JSON keys are French because they are ODORO's response keys:
 * translating them here would break every response.
 *
 * Bump {@link CONTRACT_VERSION} together with ODORO's `VERSION_DU_CONTRAT`
 * when a response loses a field or changes its type or meaning. Adding a
 * field is not a break.
 *
 * @module
 */

/** The contract version this package speaks. */
export const CONTRACT_VERSION = 1

/** A product image, as the storefront returns it: base64 content and its type. */
export interface Visuel {
  contenu: string
  type: string
  texte: string
}

/** A unit price per measure (« 13,20 €/L »), computed by the storefront. */
export interface PrixUnitaire {
  centimes: number
  unite: string
}

/** A purchasable variant. `disponible` never says how many are left. */
export interface VarianteEnVitrine {
  id: string
  libelle: string
  choix: { option: string; valeur: string }[]
  prixCentimes: number
  prixBarreCentimes: number | null
  disponible: boolean
  visuelRang: number | null
  prixUnitaire: PrixUnitaire | null
}

/** A product in a catalogue listing. */
export interface ProduitEnVitrine {
  id: string
  nom: string
  description: string
  genre: string
  prixCentimes: number
  prixBarreCentimes: number | null
  /** True as soon as ONE variant can be bought. */
  disponible: boolean
  visuel: Visuel | null
  etiquettes: string[]
  prixUnitaire: PrixUnitaire | null
}

/** A product page: the listing, plus images, options and variants. */
export interface FicheProduit extends ProduitEnVitrine {
  seoTitre: string
  seoResume: string
  visuels: Visuel[]
  options: { id: string; nom: string; valeurs: string[] }[]
  variantes: VarianteEnVitrine[]
}

export interface CollectionEnVitrine {
  id: string
  nom: string
  description: string
  combien: number
}

/** One cart line. `disponible: false` must be SAID on screen. */
export interface LigneDePanier {
  varianteId: string
  produitId: string
  nom: string
  declinaison: string
  prixUnitaireCentimes: number
  quantite: number
  sousTotalCentimes: number
  disponible: boolean
  visuel: Visuel | null
}

export interface PanierEnVitrine {
  panierId: string
  /** The cart token. In preview it travels in the URL, since there is no cookie. */
  jeton: string
  courriel: string | null
  lignes: LigneDePanier[]
  combien: number
  sousTotalCentimes: number
  neuf: boolean
}

/** Filters a buyer can apply to the catalogue. */
export interface CatalogueQuery {
  q?: string
  collection?: string
  genre?: string
  prixMin?: number
  prixMax?: number
  disponibles?: boolean
  tri?: 'nouveautes' | 'prix_croissant' | 'prix_decroissant' | 'nom'
  combien?: number
  depuis?: number
}

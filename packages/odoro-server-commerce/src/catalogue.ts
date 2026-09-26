/**
 * The catalogue, read from the `shop` schema in the storefront's shapes.
 *
 * Only what is FOR SALE: published, not deleted. A draft is the merchant's
 * business; a visitor who guesses its id gets the same 404 as for a product
 * that never existed.
 *
 * Availability is per VARIANT — the stock lives there — minus the open,
 * unexpired reservations of carts being paid. An expired reservation holds
 * nothing: an abandoned checkout must not take an item off sale forever.
 *
 * Images: `shop.product_images` names objects of the site's `storage`
 * capability (see `images.ts`). They come inline, base64, as in Odoro's
 * central storefront. A database without `storage` keeps `visuel: null`.
 *
 * @module
 */

import type {
  CatalogueQuery,
  CollectionEnVitrine,
  FicheProduit,
  ProduitEnVitrine,
  VarianteEnVitrine,
} from '@odoro-cli/commerce'

import type { Query } from './base.js'
import { SQL_IMAGES, storageInstalled } from './images.js'

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/** A variant is available when its stock, minus what is being paid, covers one. */
export const SQL_AVAILABLE = `
  (v.stock IS NULL OR v.stock - coalesce((
     SELECT sum(r.quantity)::integer FROM shop.stock_reservations r
      WHERE r.variant_id = v.id AND r.state = 'ouverte' AND r.expires_at > now()
   ), 0) >= 1)`

/** The sort orders a visitor may ask for: a closed list, never a concatenated `ORDER BY`. */
const ORDERS: Readonly<Record<NonNullable<CatalogueQuery['tri']>, string>> = {
  nouveautes: 'p.created_at DESC, p.name',
  prix_croissant: 'p.price_cents ASC, p.name',
  prix_decroissant: 'p.price_cents DESC, p.name',
  nom: 'p.name ASC',
}

interface ProductRow {
  id: string
  name: string
  description: string
  kind: string
  price_cents: number
  compare_at_cents: number | null
  available: boolean
  /** The first image, when the database has `storage`. */
  visuel?: { contenu: string; type: string; texte: string } | null
}

/** The first image of each product, as a SELECT column — or a plain null. */
function colonneDuVisuel(avecStockage: boolean): string {
  return avecStockage
    ? `(SELECT json_build_object('contenu', im.contenu, 'type', im.type, 'texte', im.texte)
          FROM (${SQL_IMAGES} LIMIT 1) im) AS visuel`
    : 'NULL::json AS visuel'
}

function toProduct(r: ProductRow): ProduitEnVitrine {
  return {
    id: r.id,
    nom: r.name,
    description: r.description,
    genre: r.kind,
    prixCentimes: Number(r.price_cents),
    prixBarreCentimes: r.compare_at_cents === null ? null : Number(r.compare_at_cents),
    disponible: r.available === true,
    visuel: r.visuel ?? null,
    etiquettes: [],
    prixUnitaire: null,
  }
}

export async function readCatalogue(
  db: Query,
  q: CatalogueQuery = {},
): Promise<{ produits: ProduitEnVitrine[]; total: number }> {
  const text = (q.q ?? '').trim()
  const values: unknown[] = [
    text === '' ? null : `%${text.toLowerCase()}%`,
    q.collection !== undefined && UUID.test(q.collection) ? q.collection : null,
    q.genre ?? null,
    q.prixMin ?? null,
    q.prixMax ?? null,
    q.disponibles === true,
  ]
  const where = `
      FROM shop.products p
     WHERE p.published AND p.deleted_at IS NULL
       AND ($1::text IS NULL OR lower(p.name) LIKE $1 OR lower(p.description) LIKE $1)
       AND ($2::uuid IS NULL OR EXISTS (
             SELECT 1 FROM shop.collection_products cp
               JOIN shop.collections c ON c.id = cp.collection_id AND c.published
              WHERE cp.collection_id = $2 AND cp.product_id = p.id))
       AND ($3::text IS NULL OR p.kind = $3)
       AND ($4::integer IS NULL OR p.price_cents >= $4)
       AND ($5::integer IS NULL OR p.price_cents <= $5)
       AND (NOT $6::boolean OR EXISTS (
             SELECT 1 FROM shop.product_variants v WHERE v.product_id = p.id AND ${SQL_AVAILABLE}))`
  // An unknown order falls back to the merchant's, silently: it is a sort, not an error.
  const order = (q.tri === undefined ? undefined : ORDERS[q.tri]) ?? 'p.position, p.name'
  const limit = Math.min(Math.max(q.combien ?? 24, 1), 60)
  const offset = Math.max(q.depuis ?? 0, 0)

  const avecStockage = await storageInstalled(db)
  const { rows } = await db.query<ProductRow>(
    `SELECT p.id, p.name, p.description, p.kind, p.price_cents, p.compare_at_cents,
            EXISTS (SELECT 1 FROM shop.product_variants v WHERE v.product_id = p.id AND ${SQL_AVAILABLE}) AS available,
            ${colonneDuVisuel(avecStockage)}
       ${where}
      ORDER BY ${order}
      LIMIT $7 OFFSET $8`,
    [...values, limit, offset],
  )
  const { rows: count } = await db.query<{ n: number }>(
    `SELECT count(*)::integer AS n ${where}`,
    values,
  )
  return { produits: rows.map(toProduct), total: Number(count[0]?.n ?? 0) }
}

export async function readProduct(db: Query, id: string): Promise<FicheProduit | null> {
  if (!UUID.test(id)) return null
  const avecStockage = await storageInstalled(db)
  const { rows } = await db.query<ProductRow>(
    `SELECT p.id, p.name, p.description, p.kind, p.price_cents, p.compare_at_cents,
            EXISTS (SELECT 1 FROM shop.product_variants v WHERE v.product_id = p.id AND ${SQL_AVAILABLE}) AS available,
            ${colonneDuVisuel(avecStockage)}
       FROM shop.products p
      WHERE p.id = $1 AND p.published AND p.deleted_at IS NULL`,
    [id],
  )
  const row = rows[0]
  if (row === undefined) return null

  const { rows: options } = await db.query<{
    id: string
    name: string
    values: string[] | null
  }>(
    `SELECT o.id, o.name,
            array_agg(DISTINCT vv.value) FILTER (WHERE vv.value IS NOT NULL) AS values
       FROM shop.product_options o
       LEFT JOIN shop.product_variant_values vv ON vv.option_id = o.id
      WHERE o.product_id = $1
      GROUP BY o.id, o.name, o.position
      ORDER BY o.position, o.name`,
    [id],
  )
  const { rows: variants } = await db.query<{
    id: string
    price_cents: number
    available: boolean
    choices: { option: string; valeur: string }[] | null
  }>(
    `SELECT v.id,
            coalesce(v.price_cents, p.price_cents) AS price_cents,
            ${SQL_AVAILABLE} AS available,
            (SELECT json_agg(json_build_object('option', o.name, 'valeur', vv.value) ORDER BY o.position, o.name)
               FROM shop.product_variant_values vv
               JOIN shop.product_options o ON o.id = vv.option_id
              WHERE vv.variant_id = v.id) AS choices
       FROM shop.product_variants v
       JOIN shop.products p ON p.id = v.product_id
      WHERE v.product_id = $1
      ORDER BY v.position, v.created_at`,
    [id],
  )
  // Every image of the product, in order, for the product page.
  const visuels = avecStockage
    ? (
        await db.query<{ contenu: string; type: string; texte: string }>(
          `SELECT im.contenu, im.type, im.texte FROM (${SQL_IMAGES}) im`.replace(
            'p.id',
            '$1',
          ),
          [id],
        )
      ).rows.map((v) => ({ contenu: v.contenu, type: v.type, texte: v.texte }))
    : []
  const product = toProduct(row)
  const variantes: VarianteEnVitrine[] = variants.map((v) => {
    const choix = v.choices ?? []
    const price = Number(v.price_cents)
    return {
      id: v.id,
      libelle:
        choix.length === 0
          ? row.name
          : choix.map((c) => `${c.option} : ${c.valeur}`).join(' / '),
      choix,
      prixCentimes: price,
      prixBarreCentimes:
        row.compare_at_cents !== null && row.compare_at_cents > price
          ? Number(row.compare_at_cents)
          : null,
      disponible: v.available === true,
      visuelRang: null,
      prixUnitaire: null,
    }
  })
  return {
    ...product,
    seoTitre: row.name,
    seoResume: row.description,
    visuels,
    options: options.map((o) => ({ id: o.id, nom: o.name, valeurs: o.values ?? [] })),
    variantes,
  }
}

export async function readCollections(db: Query): Promise<CollectionEnVitrine[]> {
  const { rows } = await db.query<{
    id: string
    name: string
    description: string
    n: number
  }>(
    `SELECT c.id, c.name, c.description,
            (SELECT count(*)::integer FROM shop.collection_products cp
               JOIN shop.products p ON p.id = cp.product_id
              WHERE cp.collection_id = c.id AND p.published AND p.deleted_at IS NULL) AS n
       FROM shop.collections c
      WHERE c.published
      ORDER BY c.name`,
  )
  return rows.map((c) => ({
    id: c.id,
    nom: c.name,
    description: c.description,
    combien: Number(c.n),
  }))
}

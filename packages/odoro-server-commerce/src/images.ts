/**
 * Product images, read from the site's own storage (capability `storage`,
 * DECISIONS §44 of the Odoro repository).
 *
 * `shop.product_images.storage_key` names an object of `storage.objects`. The
 * storefront gives an image two ways, as Odoro's central storefront does:
 * inline in `visuel` (base64, so a card renders without a second request),
 * and as bytes for `geste=image` (so a page points at a URL that follows the
 * merchant's latest photo without republishing).
 *
 * A site whose database has no `storage` capability yet keeps working: its
 * images are `null`, as before. That is checked once per process — a
 * capability is not uninstalled under a running site.
 *
 * @module
 */

import type { Query } from './base.js'

/** SVG can carry script: it is never served, whatever the database says. */
const SERVED_TYPES = new Set([
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/avif',
  'image/gif',
])

export async function storageInstalled(db: Query): Promise<boolean> {
  try {
    const { rows } = await db.query<{ present: boolean }>(
      `SELECT to_regclass('storage.objects') IS NOT NULL AS present`,
    )
    return rows[0]?.present === true
  } catch {
    return false
  }
}

export interface StoredImage {
  readonly bytes: Buffer
  readonly type: string
}

/**
 * The first image of a product FOR SALE, as bytes. `null` for a draft, an
 * unknown id, a product without image, or a type that is never served.
 */
export async function productImage(
  db: Query,
  productId: string,
): Promise<StoredImage | null> {
  if (!/^[0-9a-f-]{36}$/i.test(productId)) return null
  if (!(await storageInstalled(db))) return null
  const { rows } = await db.query<{ bytes: Buffer; mime_type: string }>(
    `SELECT o.bytes, o.mime_type
       FROM shop.product_images i
       JOIN shop.products p ON p.id = i.product_id
       JOIN storage.objects o ON o.key = i.storage_key
      WHERE p.id = $1 AND p.published AND p.deleted_at IS NULL
      ORDER BY i.position, i.id
      LIMIT 1`,
    [productId],
  )
  const row = rows[0]
  if (row === undefined || !SERVED_TYPES.has(row.mime_type)) return null
  return { bytes: row.bytes, type: row.mime_type }
}

/** The SQL that yields a product's images as base64, when storage exists. */
export const SQL_IMAGES = `
  SELECT encode(o.bytes, 'base64') AS contenu, o.mime_type AS type, i.alt_text AS texte
    FROM shop.product_images i
    JOIN storage.objects o ON o.key = i.storage_key
   WHERE i.product_id = p.id AND o.mime_type <> 'image/svg+xml'
   ORDER BY i.position, i.id`

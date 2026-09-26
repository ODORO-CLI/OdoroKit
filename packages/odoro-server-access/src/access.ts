/**
 * Who may see what, until when — read from the site's `access` database.
 *
 * The rights are WRITTEN by Odoro (a purchase, a renewal, a refund, a gift
 * from the seller's dashboard); this module only READS them. A site never
 * grants access to itself: that is the whole point of keeping entitlements
 * out of generated code.
 *
 * A right is active when it is not revoked, has started, and has not ended.
 * `ends_at` NULL means for good (a purchase); a subscription carries the end
 * of its paid period, and Odoro moves it forward at each renewal.
 *
 * @module
 */

/** Something that runs SQL: a connection, or a transaction. */
export interface Query {
  query<Row extends object = Record<string, unknown>>(
    text: string,
    values?: readonly unknown[],
  ): Promise<{ readonly rows: readonly Row[] }>
}

/** The condition every read goes through: ONE place says what "active" means. */
const ACTIVE = `e.revoked_at IS NULL AND e.starts_at <= now() AND (e.ends_at IS NULL OR e.ends_at > now())`

/** Is the `access` capability installed? */
export async function accessInstalled(db: Query): Promise<boolean> {
  try {
    const { rows } = await db.query<{ present: boolean }>(
      `SELECT to_regclass('access.entitlements') IS NOT NULL AS present`,
    )
    return rows[0]?.present === true
  } catch {
    return false
  }
}

/**
 * THE check: may this address see this product now? The route policy of any
 * generated route that serves reserved content calls this — never its own SQL.
 */
export async function entitled(
  db: Query,
  email: string,
  productRef: string,
): Promise<boolean> {
  const { rows } = await db.query<{ ok: boolean }>(
    `SELECT EXISTS (
       SELECT 1 FROM access.entitlements e
        WHERE e.email = lower($1) AND e.product_ref = $2 AND ${ACTIVE}
     ) AS ok`,
    [email, productRef],
  )
  return rows[0]?.ok === true
}

export interface AreaProduct {
  produit: string
  /** The end of the paid period, or `null` for good. */
  jusqua: string | null
  contenus: {
    id: string
    parent: string | null
    genre: string
    titre: string
    vu: boolean
  }[]
}

/** The buyer area: every product this address may open now, with its contents and what was seen. */
export async function area(db: Query, email: string): Promise<AreaProduct[]> {
  const { rows: rights } = await db.query<{ product_ref: string; ends_at: Date | null }>(
    `SELECT e.product_ref,
            CASE WHEN bool_or(e.ends_at IS NULL) THEN NULL ELSE max(e.ends_at) END AS ends_at
       FROM access.entitlements e
      WHERE e.email = lower($1) AND ${ACTIVE}
      GROUP BY e.product_ref
      ORDER BY e.product_ref`,
    [email],
  )
  const products: AreaProduct[] = []
  for (const r of rights) {
    const { rows: contents } = await db.query<{
      id: string
      parent_id: string | null
      kind: string
      title: string
      seen: boolean
    }>(
      `SELECT c.id, c.parent_id, c.kind, c.title,
              EXISTS (SELECT 1 FROM access.progress p WHERE p.content_id = c.id AND p.email = lower($2)) AS seen
         FROM access.contents c
        WHERE c.product_ref = $1 AND c.published
        ORDER BY c.position, c.title`,
      [r.product_ref, email],
    )
    products.push({
      produit: r.product_ref,
      jusqua: r.ends_at === null ? null : new Date(r.ends_at).toISOString(),
      contenus: contents.map((c) => ({
        id: c.id,
        parent: c.parent_id,
        genre: c.kind,
        titre: c.title,
        vu: c.seen,
      })),
    })
  }
  return products
}

export type ContentReading =
  | { readonly kind: 'unknown' }
  | { readonly kind: 'locked'; readonly product: string }
  | {
      readonly kind: 'open'
      readonly content: {
        id: string
        produit: string
        genre: string
        titre: string
        texte: string
        video: string | null
        fichier: boolean
      }
    }

/**
 * One content, if this address may open it. An unknown or unpublished
 * content and a locked one are told apart: the first does not exist for
 * anyone, the second says which product opens it.
 */
export async function readContent(
  db: Query,
  email: string | null,
  id: string,
): Promise<ContentReading> {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return { kind: 'unknown' }
  const { rows } = await db.query<{
    id: string
    product_ref: string
    kind: string
    title: string
    body: string
    video_url: string | null
    storage_key: string | null
  }>(
    `SELECT id, product_ref, kind, title, body, video_url, storage_key
       FROM access.contents WHERE id = $1 AND published`,
    [id],
  )
  const c = rows[0]
  if (c === undefined) return { kind: 'unknown' }
  if (email === null || !(await entitled(db, email, c.product_ref)))
    return { kind: 'locked', product: c.product_ref }
  return {
    kind: 'open',
    content: {
      id: c.id,
      produit: c.product_ref,
      genre: c.kind,
      titre: c.title,
      texte: c.body,
      video: c.video_url,
      fichier: c.storage_key !== null,
    },
  }
}

/** Seen: once per person and per content. Only what the person may open. */
export async function markSeen(db: Query, email: string, id: string): Promise<boolean> {
  const reading = await readContent(db, email, id)
  if (reading.kind !== 'open') return false
  await db.query(
    `INSERT INTO access.progress (email, content_id) VALUES (lower($1), $2)
     ON CONFLICT (email, content_id) DO NOTHING`,
    [email, id],
  )
  return true
}

/** Types a reserved file may be served as — never HTML, never SVG. */
const SERVED = new Set([
  'application/pdf',
  'text/plain',
  'audio/mpeg',
  'image/png',
  'image/jpeg',
  'image/webp',
])

/**
 * A reserved file, as bytes, if this address may open it. It lives in the
 * `storage` capability, under the key its content cites. The app mounts this
 * on a raw route (bytes, not JSON), like the product images.
 */
export async function contentFile(
  db: Query,
  email: string | null,
  id: string,
): Promise<{ readonly bytes: Buffer; readonly type: string } | null> {
  const reading = await readContent(db, email, id)
  if (reading.kind !== 'open') return null
  // A content without a file finds no row here: the join is the only check.
  const { rows } = await db.query<{ bytes: Buffer; mime_type: string }>(
    `SELECT o.bytes, o.mime_type FROM access.contents c
       JOIN storage.objects o ON o.key = c.storage_key
      WHERE c.id = $1`,
    [id],
  )
  const file = rows[0]
  if (file === undefined || !SERVED.has(file.mime_type)) return null
  return { bytes: file.bytes, type: file.mime_type }
}

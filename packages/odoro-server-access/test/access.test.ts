/**
 * Gated content, read from the site's `access` database.
 *
 * Played on a real PostgreSQL when `COMMERCE_TEST_URL` names one (the same
 * variable as the commerce module): each run creates a database, loads the
 * `access` and `storage` capabilities, and drops it. The person is named by
 * a header here — the app wires its own session.
 */

import { randomUUID } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import {
  createApp,
  createContainer,
  createLogger,
  loadConfig,
  type KernelConfig,
} from '@odoro-cli/server'
import pg from 'pg'
import request from 'supertest'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import { contentFile, createAccessModule, entitled, type Query } from '../src/index.js'

const adminUrl = process.env['COMMERCE_TEST_URL']
const gated = adminUrl === undefined || adminUrl === '' ? describe.skip : describe
const HERE = dirname(fileURLToPath(import.meta.url))

function serve(db: Query) {
  const config = { ...loadConfig(undefined, { NODE_ENV: 'test' }) } as KernelConfig
  return createApp({
    config,
    logger: createLogger({ level: 'silent' }),
    container: createContainer() as never,
    modules: [
      createAccessModule({
        db,
        // The session, simplified: a cookie that names the address.
        who: async (cookies) => {
          const email = cookies.get('qui')
          return await Promise.resolve(email === undefined ? null : { email })
        },
      }) as never,
    ],
  }).express
}

async function database(withAccess: boolean) {
  const name = `acces_${randomUUID().replaceAll('-', '').slice(0, 12)}`
  const admin = new pg.Client({ connectionString: adminUrl })
  await admin.connect()
  await admin.query(`CREATE DATABASE "${name}"`)
  await admin.end()
  const url = new URL(adminUrl as string)
  url.pathname = `/${name}`
  const pool = new pg.Pool({ connectionString: url.toString(), max: 3 })
  if (withAccess) {
    await pool.query(readFileSync(join(HERE, 'fixtures', 'storage-1.0.0.sql'), 'utf8'))
    await pool.query(readFileSync(join(HERE, 'fixtures', 'access-1.0.0.sql'), 'utf8'))
  }
  return {
    pool,
    drop: async () => {
      await pool.end()
      const a = new pg.Client({ connectionString: adminUrl })
      await a.connect()
      await a.query(`DROP DATABASE IF EXISTS "${name}" WITH (FORCE)`)
      await a.end()
    },
  }
}

gated('who may see what, until when', () => {
  let shop: Awaited<ReturnType<typeof database>>
  let server: ReturnType<typeof serve>
  const ids = {
    module: randomUUID(),
    lecon: randomUUID(),
    brouillon: randomUUID(),
    guide: randomUUID(),
    dessin: randomUUID(),
    autre: randomUUID(),
  }

  beforeAll(async () => {
    shop = await database(true)
    const q = async (text: string, values: unknown[] = []) =>
      await shop.pool.query(text, values)
    await q(
      `INSERT INTO access.contents (id, product_ref, parent_id, kind, title, position, body, video_url, published) VALUES
         ($1, 'cours', NULL, 'module', 'Les bases', 0, '', NULL, true),
         ($2, 'cours', $1, 'lecon', 'Tenir le pinceau', 1, 'Le texte de la leçon.', 'https://video.test/1', true),
         ($3, 'cours', $1, 'lecon', 'Pas encore prête', 2, '', NULL, false),
         ($4, 'cours', NULL, 'fichier', 'Le guide', 3, '', NULL, true),
         ($5, 'cours', NULL, 'fichier', 'Un dessin', 4, '', NULL, true),
         ($6, 'club', NULL, 'page', 'Le club', 0, 'Réservé au club.', NULL, true)`,
      [ids.module, ids.lecon, ids.brouillon, ids.guide, ids.dessin, ids.autre],
    )
    const pdf = Buffer.from('%PDF-1.4 le guide')
    const svg = Buffer.from('<svg onload="alert(1)"/>')
    const { createHash } = await import('node:crypto')
    await q(
      `INSERT INTO storage.objects (key, mime_type, size_bytes, sha256, bytes) VALUES
         ('cours/guide.pdf', 'application/pdf', $1, $2, $3)`,
      [pdf.length, createHash('sha256').update(pdf).digest('hex'), pdf],
    )
    // A type storage refuses cannot be put there — the module's own list is
    // proven on a type storage accepts but that is never served as a file.
    await q(
      `INSERT INTO storage.objects (key, mime_type, size_bytes, sha256, bytes) VALUES
         ('cours/dessin.gif', 'image/gif', $1, $2, $3)`,
      [svg.length, createHash('sha256').update(svg).digest('hex'), svg],
    )
    await q(`UPDATE access.contents SET storage_key = 'cours/guide.pdf' WHERE id = $1`, [
      ids.guide,
    ])
    await q(`UPDATE access.contents SET storage_key = 'cours/dessin.gif' WHERE id = $1`, [
      ids.dessin,
    ])
    await q(
      `INSERT INTO access.entitlements (email, product_ref, source, reference, starts_at, ends_at, revoked_at) VALUES
         ('claire@exemple.fr', 'cours', 'achat', 'pay_1', now() - interval '1 day', NULL, NULL),
         ('claire@exemple.fr', 'club', 'abonnement', 'mem_1', now() - interval '1 day', now() + interval '20 days', NULL),
         ('paul@exemple.fr', 'cours', 'achat', 'pay_2', now() - interval '1 day', NULL, now()),
         ('lea@exemple.fr', 'club', 'abonnement', 'mem_2', now() - interval '40 days', now() - interval '10 days', NULL),
         ('zoe@exemple.fr', 'cours', 'offert', 'don_1', now() + interval '1 day', NULL, NULL)`,
    )
    server = serve({
      query: async (t, v) => await shop.pool.query(t, v as unknown[]),
    } as Query)
  }, 60_000)

  afterAll(async () => {
    await shop?.drop()
  }, 60_000)

  const db = (): Query =>
    ({ query: async (t, v) => await shop.pool.query(t, v as unknown[]) }) as Query

  it('🔴 a right is active only while it is not revoked, has started and has not ended', async () => {
    expect(await entitled(db(), 'Claire@Exemple.fr', 'cours')).toBe(true)
    expect(await entitled(db(), 'claire@exemple.fr', 'club')).toBe(true)
    expect(await entitled(db(), 'paul@exemple.fr', 'cours')).toBe(false)
    expect(await entitled(db(), 'lea@exemple.fr', 'club')).toBe(false)
    expect(await entitled(db(), 'zoe@exemple.fr', 'cours')).toBe(false)
    expect(await entitled(db(), 'claire@exemple.fr', 'autre-chose')).toBe(false)
  })

  it('🔴 the area lists what she may open now, published contents only, with what she saw', async () => {
    await request(server)
      .post('/api/access/progress')
      .set('Cookie', 'qui=claire@exemple.fr')
      .send({ contenu: ids.lecon })
    const r = await request(server)
      .get('/api/access')
      .set('Cookie', 'qui=claire@exemple.fr')
    expect(r.body.connecte).toBe(true)
    const produits = r.body.produits as {
      produit: string
      jusqua: string | null
      contenus: { id: string; vu: boolean }[]
    }[]
    expect(produits.map((p) => p.produit)).toEqual(['club', 'cours'])
    expect(produits.find((p) => p.produit === 'cours')!.jusqua).toBeNull()
    expect(produits.find((p) => p.produit === 'club')!.jusqua).not.toBeNull()
    const cours = produits.find((p) => p.produit === 'cours')!.contenus
    expect(cours.map((c) => c.id)).toEqual([ids.module, ids.lecon, ids.guide, ids.dessin])
    expect(cours.find((c) => c.id === ids.lecon)!.vu).toBe(true)
    expect(cours.find((c) => c.id === ids.module)!.vu).toBe(false)

    const lea = await request(server)
      .get('/api/access')
      .set('Cookie', 'qui=lea@exemple.fr')
    expect(lea.body).toEqual({ connecte: true, produits: [] })
    expect((await request(server).get('/api/access')).body).toEqual({
      connecte: false,
      produits: [],
    })
  })

  it('🔴 a content opens for who has it; otherwise it says which product opens it', async () => {
    const open = await request(server)
      .get(`/api/access/content?id=${ids.lecon}`)
      .set('Cookie', 'qui=claire@exemple.fr')
    expect(open.status).toBe(200)
    expect(open.body.contenu).toMatchObject({
      titre: 'Tenir le pinceau',
      texte: 'Le texte de la leçon.',
      video: 'https://video.test/1',
    })

    const anonymous = await request(server).get(`/api/access/content?id=${ids.lecon}`)
    expect(anonymous.status).toBe(401)
    expect(anonymous.body.produit).toBe('cours')
    expect(anonymous.body.texte).toBeUndefined()

    const revoked = await request(server)
      .get(`/api/access/content?id=${ids.lecon}`)
      .set('Cookie', 'qui=paul@exemple.fr')
    expect(revoked.status).toBe(403)
    expect(revoked.body.erreur).toMatch(/que vous n'avez pas/)

    const draft = await request(server)
      .get(`/api/access/content?id=${ids.brouillon}`)
      .set('Cookie', 'qui=claire@exemple.fr')
    expect(draft.status).toBe(404)
  })

  it('🔴 seen: only what she may open, once', async () => {
    const locked = await request(server)
      .post('/api/access/progress')
      .set('Cookie', 'qui=paul@exemple.fr')
      .send({ contenu: ids.lecon })
    expect(locked.status).toBe(403)
    for (let i = 0; i < 2; i += 1) {
      expect(
        (
          await request(server)
            .post('/api/access/progress')
            .set('Cookie', 'qui=claire@exemple.fr')
            .send({ contenu: ids.guide })
        ).status,
      ).toBe(200)
    }
    const { rows } = await shop.pool.query(
      'SELECT count(*)::int AS n FROM access.progress WHERE content_id = $1',
      [ids.guide],
    )
    expect(rows[0].n).toBe(1)
    const { rows: paul } = await shop.pool.query(
      `SELECT count(*)::int AS n FROM access.progress WHERE email = 'paul@exemple.fr'`,
    )
    expect(paul[0].n).toBe(0)
  })

  it('🔴 a reserved file comes as bytes for who has it — and only in a type that is served', async () => {
    const guide = await contentFile(db(), 'claire@exemple.fr', ids.guide)
    expect(guide?.type).toBe('application/pdf')
    expect(guide?.bytes.toString()).toContain('le guide')
    expect(await contentFile(db(), 'paul@exemple.fr', ids.guide)).toBeNull()
    expect(await contentFile(db(), null, ids.guide)).toBeNull()
    expect(await contentFile(db(), 'claire@exemple.fr', ids.dessin)).toBeNull()
    expect(await contentFile(db(), 'claire@exemple.fr', ids.lecon)).toBeNull()
  })
})

gated('a site without the access capability', () => {
  it('🔴 opens nothing, and says there is nothing', async () => {
    const empty = await database(false)
    try {
      const server = serve({
        query: async (t, v) => await empty.pool.query(t, v as unknown[]),
      } as Query)
      expect(
        (await request(server).get('/api/access').set('Cookie', 'qui=claire@exemple.fr'))
          .body,
      ).toEqual({
        connecte: false,
        produits: [],
      })
      expect(
        (await request(server).get(`/api/access/content?id=${randomUUID()}`)).status,
      ).toBe(404)
    } finally {
      await empty.drop()
    }
  }, 60_000)
})

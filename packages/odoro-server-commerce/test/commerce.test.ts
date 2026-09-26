/**
 * The storefront contract, served by a real `@odoro-cli/server` app from a real
 * `shop` database — the capability `shop` 1.0.0 of odoro-cloud, loaded from
 * `fixtures/shop-1.2.0.sql`.
 *
 * Runs when `COMMERCE_TEST_URL` names a PostgreSQL server where databases can
 * be created (`postgres://user@host:port/postgres`); silent otherwise.
 *
 * What each promise protects:
 *
 *   · nothing is served before the capability is installed;
 *   · only what is for sale is shown, bought, or reachable by its id;
 *   · the cart cookie is set on a GESTURE, HttpOnly, and finds the same cart;
 *   · checkout reprices, refuses what is not in stock, and hands the money to
 *     the port — the order is PAID only by a signed, fresh callback, once;
 *   · every refusal carries `erreur`, the field the storefront's clients read;
 *   · what is not served yet (accounts, codes) says so.
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

import {
  baseFromPool,
  createCommerceModule,
  discountFor,
  signCallback,
  type Base,
  type PaymentPort,
} from '../src/index.js'

const adminUrl = process.env['COMMERCE_TEST_URL']
const gated = adminUrl === undefined || adminUrl === '' ? describe.skip : describe
const HERE = dirname(fileURLToPath(import.meta.url))
const SECRET = 'un-secret-de-rappel-assez-long-pour-l-essai'

async function database(withShop: boolean) {
  const name = `commerce_${randomUUID().replaceAll('-', '').slice(0, 12)}`
  const admin = new pg.Client({ connectionString: adminUrl })
  await admin.connect()
  await admin.query(`CREATE DATABASE "${name}"`)
  await admin.end()
  const url = new URL(adminUrl as string)
  url.pathname = `/${name}`
  const pool = new pg.Pool({ connectionString: url.toString(), max: 4 })
  if (withShop)
    await pool.query(readFileSync(join(HERE, 'fixtures', 'shop-1.2.0.sql'), 'utf8'))
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

function app(db: Base, payment: PaymentPort) {
  const config = { ...loadConfig(undefined, { NODE_ENV: 'test' }) } as KernelConfig
  return createApp({
    config,
    logger: createLogger({ level: 'silent' }),
    container: createContainer() as never,
    modules: [
      createCommerceModule({
        db,
        payment,
        callbackSecret: SECRET,
        secureCookie: false,
      }) as never,
    ],
  }).express
}

gated('the storefront contract, served from the shop database', () => {
  let shop: Awaited<ReturnType<typeof database>>
  let server: ReturnType<typeof app>
  const opened: { orderId: string; totalCents: number }[] = []
  const ids: Record<string, string> = {}

  beforeAll(async () => {
    shop = await database(true)
    const q = async (text: string, values: unknown[] = []) =>
      (await shop.pool.query(text, values)).rows
    const carnet = (
      await q(
        `INSERT INTO shop.products (name, description, price_cents, published) VALUES ('Carnet en lin', 'Cousu main.', 2400, true) RETURNING id`,
      )
    )[0].id
    const stylo = (
      await q(
        `INSERT INTO shop.products (name, price_cents, compare_at_cents, published) VALUES ('Stylo en laiton', 5900, 6900, true) RETURNING id`,
      )
    )[0].id
    const brouillon = (
      await q(
        `INSERT INTO shop.products (name, price_cents) VALUES ('Brouillon', 100) RETURNING id`,
      )
    )[0].id
    ids['carnet'] = carnet
    ids['stylo'] = stylo
    ids['brouillon'] = brouillon
    ids['vCarnet'] = (
      await q('SELECT id FROM shop.product_variants WHERE product_id = $1', [carnet])
    )[0].id
    ids['vStylo'] = (
      await q('SELECT id FROM shop.product_variants WHERE product_id = $1', [stylo])
    )[0].id
    ids['vBrouillon'] = (
      await q('SELECT id FROM shop.product_variants WHERE product_id = $1', [brouillon])
    )[0].id
    // The pen is tracked: three in stock — a double decrement of two would show.
    await q('UPDATE shop.product_variants SET stock = 3 WHERE id = $1', [ids['vStylo']])

    server = app(baseFromPool(shop.pool), {
      open: async (input) => {
        opened.push({ orderId: input.orderId, totalCents: input.totalCents })
        return await Promise.resolve({
          reference: `whop-${input.orderId}`,
          paymentUrl: 'https://paiement.odoro.test/p/1',
        })
      },
    })
  }, 60_000)

  afterAll(async () => {
    await shop?.drop()
  }, 60_000)

  it('serves only what is for sale, and a draft is unknown by its id', async () => {
    const catalogue = await request(server).get('/api/storefront')
    expect(catalogue.status).toBe(200)
    expect(catalogue.body.produits.map((p: { nom: string }) => p.nom).sort()).toEqual([
      'Carnet en lin',
      'Stylo en laiton',
    ])
    expect(catalogue.body.total).toBe(2)

    const cherche = await request(server).get('/api/storefront?q=laiton&tri=inconnu')
    expect(cherche.body.produits.map((p: { nom: string }) => p.nom)).toEqual([
      'Stylo en laiton',
    ])

    const fiche = await request(server).get(
      `/api/storefront?geste=fiche&produit=${ids['stylo']}`,
    )
    expect(fiche.body.fiche).toMatchObject({
      nom: 'Stylo en laiton',
      prixBarreCentimes: 6900,
    })
    expect(fiche.body.fiche.variantes).toHaveLength(1)

    const brouillon = await request(server).get(
      `/api/storefront?geste=fiche&produit=${ids['brouillon']}`,
    )
    expect(brouillon.status).toBe(404)
    expect(brouillon.body.erreur).toBe("Cet article n'est plus en vente.")
  })

  it('🔴 the cart cookie is set on a gesture, HttpOnly, and finds the same cart', async () => {
    const lecture = await request(server).get('/api/storefront/cart')
    expect(lecture.headers['set-cookie']).toBeUndefined()
    expect(lecture.body.panier.combien).toBe(0)

    const ajout = await request(server)
      .post('/api/storefront/cart')
      .send({ variante: ids['vCarnet'], quantite: 2 })
    expect(ajout.status).toBe(200)
    const cookie = String(ajout.headers['set-cookie'])
    expect(cookie).toMatch(/odoro_panier=vitrine-[0-9a-f]{48}/)
    expect(cookie).toMatch(/HttpOnly/i)

    const encore = await request(server)
      .post('/api/storefront/cart')
      .set('Cookie', cookie.split(';')[0]!)
      .send({ variante: ids['vCarnet'], quantite: 1 })
    expect(encore.body.panier.combien).toBe(3)
    expect(encore.headers['set-cookie']).toBeUndefined()

    const retire = await request(server)
      .post('/api/storefront/cart')
      .set('Cookie', cookie.split(';')[0]!)
      .send({ geste: 'quantite', variante: ids['vCarnet'], quantite: 0 })
    expect(retire.body.panier.combien).toBe(0)
  })

  it('🔴 a draft cannot be put in a cart, and the refusal says why', async () => {
    const r = await request(server)
      .post('/api/storefront/cart')
      .send({ variante: ids['vBrouillon'] })
    expect(r.status).toBe(409)
    expect(r.body.erreur).toBe("Cet article n'est plus en vente.")
  })

  async function cartWith(variant: string, quantity: number): Promise<string> {
    const r = await request(server)
      .post('/api/storefront/cart')
      .send({ variante: variant, quantite: quantity })
    return String(r.headers['set-cookie']).split(';')[0]!
  }

  const address = {
    courriel: 'claire@exemple.fr',
    nom: 'Claire',
    ligne1: '3 rue des Lilas',
    code_postal: '69003',
    ville: 'Lyon',
    pays: 'FR',
  }

  it('🔴 checkout refuses what is not in stock, and what is incomplete', async () => {
    const trop = await cartWith(ids['vStylo']!, 4)
    const r = await request(server)
      .post('/api/storefront/checkout')
      .set('Cookie', trop)
      .send({ geste: 'ouvrir', ...address })
    expect(r.status).toBe(409)
    expect(r.body.erreur).toMatch(/il n'en reste pas assez/)

    const incomplet = await cartWith(ids['vCarnet']!, 1)
    const sans = await request(server)
      .post('/api/storefront/checkout')
      .set('Cookie', incomplet)
      .send({ geste: 'ouvrir', nom: 'Claire' })
    expect(sans.body.erreur).toBe('Indiquez votre adresse e-mail.')
  })

  it('🔴 checkout reprices at today s price, and says what changed', async () => {
    const panier = await cartWith(ids['vCarnet']!, 1)
    await shop.pool.query('UPDATE shop.products SET price_cents = 2600 WHERE id = $1', [
      ids['carnet'],
    ])
    try {
      const r = await request(server)
        .post('/api/storefront/checkout')
        .set('Cookie', panier)
        .send({ geste: 'ouvrir', ...address })
      expect(r.status).toBe(200)
      expect(r.body.prixRevalorises).toEqual([
        { varianteId: ids['vCarnet'], ancienCentimes: 2400, nouveauCentimes: 2600 },
      ])
      expect(r.body.total.totalCentimes).toBe(2600)
    } finally {
      await shop.pool.query('UPDATE shop.products SET price_cents = 2400 WHERE id = $1', [
        ids['carnet'],
      ])
    }
  })

  it('🔴 the order is paid only by a signed, fresh callback — once, and the stock leaves then', async () => {
    const panier = await cartWith(ids['vStylo']!, 2)
    const ouvert = await request(server)
      .post('/api/storefront/checkout')
      .set('Cookie', panier)
      .send({ geste: 'ouvrir', ...address })
    const caisse = ouvert.body.caisse as string

    const code = await request(server)
      .post('/api/storefront/checkout')
      .send({ geste: 'chiffrer', caisse, code: 'BIENVENUE' })
    expect(code.status).toBe(409)
    expect(code.body.erreur).toBe("Ce code n'est pas reconnu par cette boutique.")

    const paye = await request(server)
      .post('/api/storefront/checkout')
      .send({ geste: 'payer', caisse })
    expect(paye.status).toBe(200)
    expect(paye.body.adresseDePaiement).toBe('https://paiement.odoro.test/p/1')
    expect(opened.at(-1)).toEqual({ orderId: caisse, totalCents: 11800 })

    const reference = `whop-${caisse}`
    const maintenant = Math.floor(Date.now() / 1000)
    const faux = await request(server)
      .post('/api/storefront/payment-callback')
      .send({
        reference,
        etat: 'payee',
        horodatage: maintenant,
        signature: 'a'.repeat(64),
      })
    expect(faux.status).toBe(404)
    const vieux = maintenant - 3600
    const perime = await request(server)
      .post('/api/storefront/payment-callback')
      .send({
        reference,
        etat: 'payee',
        horodatage: vieux,
        signature: signCallback(SECRET, reference, 'payee', vieux),
      })
    expect(perime.status).toBe(404)

    const stock = async () =>
      (
        await shop.pool.query('SELECT stock FROM shop.product_variants WHERE id = $1', [
          ids['vStylo'],
        ])
      ).rows[0].stock
    expect(await stock()).toBe(3)
    const bon = {
      reference,
      etat: 'payee',
      horodatage: maintenant,
      signature: signCallback(SECRET, reference, 'payee', maintenant),
    }
    expect(
      (await request(server).post('/api/storefront/payment-callback').send(bon)).status,
    ).toBe(200)
    expect(
      (await request(server).post('/api/storefront/payment-callback').send(bon)).status,
    ).toBe(200)
    expect(await stock()).toBe(1)

    const suivi = await request(server).get(
      `/api/storefront?geste=commande&jeton=${caisse}`,
    )
    expect(suivi.body.commande).toMatchObject({ etat: 'payee', totalCentimes: 11800 })
  })

  it('🔴 a code is priced by the shop, counted once paid, and frozen once the payment is open', async () => {
    await shop.pool.query(
      `INSERT INTO shop.discount_codes (code, kind, value, min_subtotal_cents, max_uses, starts_at) VALUES
         ('DIX', 'pourcentage', 10000, 0, NULL, NULL),
         ('CINQ', 'montant', 500, 0, 1, NULL),
         ('FUTUR', 'montant', 500, 0, NULL, now() + interval '1 day'),
         ('GROS', 'montant', 500, 100000, NULL, NULL),
         ('TOUT', 'montant', 999999, 0, NULL, NULL)`,
    )
    await shop.pool.query(
      `INSERT INTO shop.discount_codes (code, kind, value, ends_at, active) VALUES
         ('PASSE', 'montant', 500, now() - interval '1 day', true),
         ('ETEINT', 'montant', 500, NULL, false)`,
    )
    const chiffrer = async (caisse: string, code: string) =>
      await request(server)
        .post('/api/storefront/checkout')
        .send({ geste: 'chiffrer', caisse, code })

    const panier = await cartWith(ids['vCarnet']!, 1)
    const caisse = (
      await request(server)
        .post('/api/storefront/checkout')
        .set('Cookie', panier)
        .send({ geste: 'ouvrir', ...address })
    ).body.caisse as string

    // Typed in lower case, priced by the shop: 10 % of 24,00.
    const dix = await chiffrer(caisse, 'dix')
    expect(dix.status).toBe(200)
    expect(dix.body.total).toMatchObject({ remiseCentimes: 240, totalCentimes: 2160 })
    expect(dix.body.total.remises).toEqual([
      { remiseId: null, code: 'DIX', libelle: 'DIX', montantCentimes: 240 },
    ])

    expect((await chiffrer(caisse, 'FUTUR')).body.erreur).toBe(
      "Ce code n'est pas reconnu par cette boutique.",
    )
    for (const mort of ['PASSE', 'ETEINT'])
      expect((await chiffrer(caisse, mort)).body.erreur).toBe(
        "Ce code n'est pas reconnu par cette boutique.",
      )
    expect((await chiffrer(caisse, 'GROS')).body.erreur).toMatch(
      /demande un panier d'au moins/,
    )
    expect((await chiffrer(caisse, 'TOUT')).body.erreur).toBe(
      'Ce code ne peut pas rendre la commande gratuite.',
    )
    // An empty field takes the code off.
    expect((await chiffrer(caisse, '')).body.total).toMatchObject({
      remiseCentimes: 0,
      totalCentimes: 2400,
    })

    const paye = await request(server)
      .post('/api/storefront/checkout')
      .send({ geste: 'payer', caisse, code: 'CINQ' })
    expect(paye.status).toBe(200)
    expect(opened.at(-1)).toEqual({ orderId: caisse, totalCents: 1900 })

    // The payment is open: the same code is fine, another one is refused.
    expect((await chiffrer(caisse, 'cinq')).status).toBe(200)
    expect((await chiffrer(caisse, 'DIX')).body.erreur).toMatch(/déjà ouvert/)

    const reference = `whop-${caisse}`
    const maintenant = Math.floor(Date.now() / 1000)
    await request(server)
      .post('/api/storefront/payment-callback')
      .send({
        reference,
        etat: 'payee',
        horodatage: maintenant,
        signature: signCallback(SECRET, reference, 'payee', maintenant),
      })
    const usages = await shop.pool.query(
      `SELECT count(*)::int AS n FROM shop.discount_uses u JOIN shop.discount_codes c ON c.id = u.discount_id WHERE c.code = 'CINQ'`,
    )
    expect(usages.rows[0].n).toBe(1)

    // CINQ served once, as planned.
    const autre = await cartWith(ids['vCarnet']!, 1)
    const seconde = (
      await request(server)
        .post('/api/storefront/checkout')
        .set('Cookie', autre)
        .send({ geste: 'ouvrir', ...address })
    ).body.caisse as string
    expect((await chiffrer(seconde, 'CINQ')).body.erreur).toBe(
      'Ce code a déjà servi autant de fois que prévu.',
    )
  })

  it('what is not served yet says so', async () => {
    const compte = await request(server)
      .post('/api/storefront/account')
      .send({ geste: 'lien', email: 'a@b.c' })
    expect(compte.status).toBe(503)
    expect(compte.body.erreur).toMatch(/pas encore disponible/)
    expect((await request(server).get('/api/storefront/account')).body).toEqual({
      connecte: false,
    })
  })
})

gated('a shop still in 1.1.0', () => {
  it('🔴 sells as before: a code is refused by name, and the payment is confirmed', async () => {
    const shop = await database(true)
    try {
      // What 1.2.0 added, taken away: the shop as the first ones were installed.
      await shop.pool.query(
        `DROP TABLE shop.discount_uses; DROP TABLE shop.discount_codes;
         ALTER TABLE shop.orders DROP COLUMN discount_code, DROP COLUMN discount_cents`,
      )
      const produit = (
        await shop.pool.query(
          `INSERT INTO shop.products (name, price_cents, published) VALUES ('Carnet', 2400, true) RETURNING id`,
        )
      ).rows[0].id
      const variante = (
        await shop.pool.query(
          'SELECT id FROM shop.product_variants WHERE product_id = $1',
          [produit],
        )
      ).rows[0].id
      const opened: number[] = []
      const server = app(baseFromPool(shop.pool), {
        open: async (input) => {
          opened.push(input.totalCents)
          return await Promise.resolve({
            reference: `whop-${input.orderId}`,
            paymentUrl: 'https://p.test',
          })
        },
      })
      const cookie = String(
        (
          await request(server)
            .post('/api/storefront/cart')
            .send({ variante, quantite: 1 })
        ).headers['set-cookie'],
      ).split(';')[0]!
      const caisse = (
        await request(server)
          .post('/api/storefront/checkout')
          .set('Cookie', cookie)
          .send({
            geste: 'ouvrir',
            courriel: 'claire@exemple.fr',
            nom: 'Claire',
            ligne1: '3 rue des Lilas',
            code_postal: '69003',
            ville: 'Lyon',
            pays: 'FR',
          })
      ).body.caisse as string
      const code = await request(server)
        .post('/api/storefront/checkout')
        .send({ geste: 'chiffrer', caisse, code: 'DIX' })
      expect(code.body.erreur).toBe("Ce code n'est pas reconnu par cette boutique.")
      const sans = await request(server)
        .post('/api/storefront/checkout')
        .send({ geste: 'chiffrer', caisse })
      expect(sans.body.total).toMatchObject({
        remises: [],
        remiseCentimes: 0,
        totalCentimes: 2400,
      })
      expect(
        (
          await request(server)
            .post('/api/storefront/checkout')
            .send({ geste: 'payer', caisse })
        ).status,
      ).toBe(200)

      const reference = `whop-${caisse}`
      const maintenant = Math.floor(Date.now() / 1000)
      const rappel = await request(server)
        .post('/api/storefront/payment-callback')
        .send({
          reference,
          etat: 'payee',
          horodatage: maintenant,
          signature: signCallback(SECRET, reference, 'payee', maintenant),
        })
      expect(rappel.status).toBe(200)
      const etat = await shop.pool.query('SELECT state FROM shop.orders WHERE id = $1', [
        caisse,
      ])
      expect(etat.rows[0].state).toBe('payee')
    } finally {
      await shop.drop()
    }
  }, 60_000)
})

describe('what a code takes off', () => {
  it('🔴 rounded down, never more than the basket', () => {
    // 15 % of 9,99 is 1,4985: the buyer gets 1,49, not 1,50.
    expect(discountFor('pourcentage', 15_000, 999)).toBe(149)
    expect(discountFor('montant', 5000, 2400)).toBe(2400)
  })
})

gated('before the capability is installed', () => {
  it('🔴 serves nothing, and says why', async () => {
    const vide = await database(false)
    try {
      const server = app(baseFromPool(vide.pool), {
        open: async () => await Promise.reject(new Error('jamais')),
      })
      const r = await request(server).get('/api/storefront')
      expect(r.status).toBe(503)
      expect(r.body.erreur).toBe("La boutique de ce site n'est pas encore installée.")
    } finally {
      await vide.drop()
    }
  }, 60_000)
})

gated('baseFromPool', () => {
  it('🔴 a transaction that fails leaves nothing behind — its queries ran on ONE connection', async () => {
    const shop = await database(true)
    try {
      const base = baseFromPool(shop.pool)
      await expect(
        base.transaction(async (tx) => {
          await tx.query(
            `INSERT INTO shop.products (name, price_cents, published) VALUES ('Fantome', 100, true)`,
          )
          throw new Error('interrompue')
        }),
      ).rejects.toThrow('interrompue')
      const { rows } = await base.query<{ n: number }>(
        `SELECT count(*)::integer AS n FROM shop.products WHERE name = 'Fantome'`,
      )
      expect(rows[0]?.n).toBe(0)
    } finally {
      await shop.drop()
    }
  }, 60_000)
})

gated('product images, from the site storage', () => {
  it('🔴 come inline in the catalogue and the product page, and as bytes — for a product for sale only', async () => {
    const shop = await database(true)
    try {
      await shop.pool.query(
        readFileSync(join(HERE, 'fixtures', 'storage-1.0.0.sql'), 'utf8'),
      )
      const q = async (text: string, values: unknown[] = []) =>
        (await shop.pool.query(text, values)).rows
      const vendu = (
        await q(
          `INSERT INTO shop.products (name, price_cents, published) VALUES ('Bol', 2800, true) RETURNING id`,
        )
      )[0].id
      const brouillon = (
        await q(
          `INSERT INTO shop.products (name, price_cents) VALUES ('Brouillon', 100) RETURNING id`,
        )
      )[0].id
      const octets = Buffer.from('une-photo-webp')
      const empreinte = (await import('node:crypto'))
        .createHash('sha256')
        .update(octets)
        .digest('hex')
      for (const [produit, cle] of [
        [vendu, `products/${vendu}/1.webp`],
        [brouillon, `products/${brouillon}/1.webp`],
      ] as const) {
        await q(
          `INSERT INTO storage.objects (key, mime_type, size_bytes, sha256, bytes) VALUES ($1, 'image/webp', $2, $3, $4)`,
          [cle, octets.length, empreinte, octets],
        )
        await q(
          `INSERT INTO shop.product_images (product_id, storage_key, mime_type, alt_text) VALUES ($1, $2, 'image/webp', 'Un bol')`,
          [produit, cle],
        )
      }
      const { productImage, readCatalogue, readProduct } =
        await import('../src/index.js').then(async (m) => ({
          ...m,
          ...(await import('../src/catalogue.js')),
        }))
      const base = baseFromPool(shop.pool)
      const catalogue = await readCatalogue(base, {})
      expect(catalogue.produits[0]!.visuel).toEqual({
        contenu: octets.toString('base64'),
        type: 'image/webp',
        texte: 'Un bol',
      })
      expect((await readProduct(base, vendu))!.visuels).toHaveLength(1)
      expect((await productImage(base, vendu))!.bytes.equals(octets)).toBe(true)
      expect(await productImage(base, brouillon)).toBeNull()
    } finally {
      await shop.drop()
    }
  }, 60_000)

  it('🔴 a database without storage keeps working, with no image', async () => {
    const shop = await database(true)
    try {
      await shop.pool.query(
        `INSERT INTO shop.products (name, price_cents, published) VALUES ('Bol', 2800, true)`,
      )
      const { readCatalogue } = await import('../src/catalogue.js')
      const catalogue = await readCatalogue(baseFromPool(shop.pool), {})
      expect(catalogue.produits[0]!.visuel).toBeNull()
    } finally {
      await shop.drop()
    }
  }, 60_000)
})

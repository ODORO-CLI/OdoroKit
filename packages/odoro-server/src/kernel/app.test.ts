/**
 * L'application assemblee, sur de vraies requetes HTTP.
 *
 * ## Ce que ces tests couvrent que les autres ne peuvent pas
 *
 * Le conteneur, la configuration et l'ordre des modules se testent isolement.
 * Trois choses ne le peuvent pas, et ce sont celles qui font mal en
 * production :
 *
 * 1. **Une erreur imprevue ne doit rien divulguer.** Un message de pilote SQL
 *    cite la requete, donc la structure des tables. Un nom de contrainte dit
 *    qu'une adresse existe deja. Le seul moyen de le verifier est de lever une
 *    telle erreur et de lire ce qui sort.
 *
 * 2. **Express 5 doit transmettre les promesses rejetees.** C'est la raison
 *    d'exiger cette version ; si l'hypothese est fausse, la requete reste
 *    suspendue et aucun test unitaire ne le montre.
 *
 * 3. **La portee de requete doit se refermer**, y compris quand la requete
 *    echoue. Une portee qui fuit ne se voit qu'a la millieme requete, en
 *    memoire qui ne redescend pas.
 *
 * @module
 */

import request from 'supertest'
import { describe, expect, it, vi } from 'vitest'
import { z } from 'zod'

import { createApp } from './app.js'
import { loadConfig, type KernelConfig } from './config.js'
import { createContainer } from './container.js'
import { ConflictError } from './http/errors.js'
import { route } from './http/route.js'
import { defineModule } from './module.js'
import { createLogger } from './logger.js'

/** Un journal muet : ces tests lisent des reponses, pas des lignes. */
const logger = createLogger({ level: 'silent' })

/** Assemble une application d'essai. */
function build(
  routes: readonly ReturnType<typeof route>[],
  overrides: Partial<KernelConfig> = {},
  authenticate?: Parameters<typeof createApp>[0]['authenticate'],
) {
  const config = {
    ...loadConfig(undefined, { NODE_ENV: 'test' }),
    ...overrides,
  } as KernelConfig

  return createApp({
    config,
    logger,
    container: createContainer() as never,
    modules: [defineModule({ name: 'essai', routes: routes as never }) as never],
    ...(authenticate === undefined ? {} : { authenticate }),
  })
}

describe('reponses', () => {
  it('rend la sortie validee', async () => {
    const app = build([
      route({
        name: 'essai.lire',
        method: 'GET',
        path: '/essai',
        auth: 'public',
        output: z.object({ valeur: z.number() }),
        handler: () => ({ valeur: 42 }),
      }),
    ])

    const response = await request(app.express).get('/essai')
    expect(response.status).toBe(200)
    expect(response.body).toEqual({ valeur: 42 })
  })

  it('retient les champs non declares par le schema de sortie', async () => {
    // La regle « aucune entite de base n'est renvoyee directement » devient
    // verifiable plutot que seulement ecrite : un objet Zod ne conserve que ce
    // qu'il declare, hachage de mot de passe compris.
    const app = build(
      [
        route({
          name: 'essai.utilisateur',
          method: 'GET',
          path: '/utilisateur',
          auth: 'public',
          output: z.object({ id: z.string() }),
          handler: () =>
            ({ id: 'u1', passwordHash: '$argon2id$…', resetToken: 'secret' }) as never,
        }),
      ],
      // En production, une sortie non conforme n'echoue pas : elle est
      // reduite. C'est ce comportement-la qu'on verifie ici.
      { NODE_ENV: 'production' },
    )

    const response = await request(app.express).get('/utilisateur')
    expect(response.body).toEqual({ id: 'u1' })
    expect(response.text).not.toContain('argon2')
    expect(response.text).not.toContain('secret')
  })

  it('rend 204 quand la route ne declare aucune sortie', async () => {
    const app = build([
      route({
        name: 'essai.vide',
        method: 'DELETE',
        path: '/essai',
        auth: 'public',
        handler: () => undefined,
      }),
    ])

    const response = await request(app.express).delete('/essai')
    expect(response.status).toBe(204)
  })
})

describe('validation des entrees', () => {
  const app = build([
    route({
      name: 'essai.ecrire',
      method: 'POST',
      path: '/essai/:id',
      auth: 'public',
      input: z.object({ id: z.string(), nom: z.string().min(2), age: z.coerce.number() }),
      output: z.object({ id: z.string(), nom: z.string(), age: z.number() }),
      handler: ({ input }) => input,
    }),
  ])

  it('fusionne corps, chaine de requete et parametres d URL', async () => {
    const response = await request(app.express)
      .post('/essai/u1?age=30')
      .send({ nom: 'Lea' })

    expect(response.status).toBe(200)
    expect(response.body).toEqual({ id: 'u1', nom: 'Lea', age: 30 })
  })

  it('fait gagner le parametre d URL sur le corps', async () => {
    // Elevation de privilege classique : on lit l'identite dans le chemin pour
    // autoriser, puis on agit sur celle du corps.
    const response = await request(app.express)
      .post('/essai/u1?age=30')
      .send({ nom: 'Lea', id: 'u2' })

    expect(response.body.id).toBe('u1')
  })

  it('detaille les champs fautifs', async () => {
    const response = await request(app.express).post('/essai/u1').send({ nom: 'L' })

    expect(response.status).toBe(422)
    expect(response.type).toBe('application/problem+json')
    expect(response.body.kind).toBe('VALIDATION')

    const champs = response.body.errors.map((e: { field: string }) => e.field)
    expect(champs).toContain('nom')
    expect(champs).toContain('age')
  })
})

describe('erreurs', () => {
  it('laisse passer le message d une erreur prevue', async () => {
    const app = build([
      route({
        name: 'essai.conflit',
        method: 'POST',
        path: '/conflit',
        auth: 'public',
        handler: () => {
          throw new ConflictError('Cette adresse est deja prise.')
        },
      }),
    ])

    const response = await request(app.express).post('/conflit')
    expect(response.status).toBe(409)
    expect(response.body.kind).toBe('CONFLICT')
    expect(response.body.detail).toBe('Cette adresse est deja prise.')
  })

  it('ne divulgue rien d une erreur imprevue en production', async () => {
    const app = build(
      [
        route({
          name: 'essai.panne',
          method: 'GET',
          path: '/panne',
          auth: 'public',
          handler: () => {
            // Ce qu'un pilote SQL rendrait vraiment : la requete, donc la
            // structure des tables, et le nom d'une contrainte violee.
            throw new Error(
              'duplicate key value violates unique constraint "users_email_key" ' +
                'DETAIL: Key (email)=(lea@exemple.fr) already exists.',
            )
          },
        }),
      ],
      { NODE_ENV: 'production' },
    )

    const response = await request(app.express).get('/panne')

    expect(response.status).toBe(500)
    expect(response.body.kind).toBe('INTERNAL')
    expect(response.text).not.toContain('users_email_key')
    expect(response.text).not.toContain('lea@exemple.fr')
    expect(response.text).not.toContain('unique constraint')
    expect(response.body.correlationId).toEqual(expect.any(String))
  })

  it('transmet une promesse rejetee sans enveloppe', async () => {
    // L'hypothese qui justifie Express 5. Fausse, la requete resterait
    // suspendue jusqu'au delai d'expiration du client.
    const app = build(
      [
        route({
          name: 'essai.async',
          method: 'GET',
          path: '/async',
          auth: 'public',
          handler: async () => {
            await Promise.resolve()
            throw new ConflictError('rejet asynchrone')
          },
        }),
      ],
      { NODE_ENV: 'production' },
    )

    const response = await request(app.express).get('/async')
    expect(response.status).toBe(409)
  })

  it('rend un problem+json sur une route absente', async () => {
    const app = build([])
    const response = await request(app.express).get('/nulle-part')

    expect(response.status).toBe(404)
    expect(response.type).toBe('application/problem+json')
    expect(response.body.kind).toBe('NOT_FOUND')
  })

  it('porte l identifiant de correlation en en-tete et dans le corps', async () => {
    const app = build(
      [
        route({
          name: 'essai.panne',
          method: 'GET',
          path: '/panne',
          auth: 'public',
          handler: () => {
            throw new Error('interne')
          },
        }),
      ],
      { NODE_ENV: 'production' },
    )

    const response = await request(app.express).get('/panne')
    expect(response.headers['x-request-id']).toBe(response.body.correlationId)
  })

  it('conserve un identifiant venu de l amont', async () => {
    // Derriere une passerelle, c'est lui qui relie notre trace a la sienne.
    const app = build([])
    const response = await request(app.express)
      .get('/nulle-part')
      .set('x-request-id', 'trace-amont')

    expect(response.body.correlationId).toBe('trace-amont')
  })
})

describe('garde d authentification', () => {
  it('refuse une route privee sans identite', async () => {
    const app = build([
      route({
        name: 'essai.prive',
        method: 'GET',
        path: '/prive',
        auth: 'required',
        handler: () => undefined,
      }),
    ])

    const response = await request(app.express).get('/prive')
    expect(response.status).toBe(401)
    expect(response.body.kind).toBe('UNAUTHORIZED')
  })

  it('refuse aussi quand aucun module d authentification n est monte', async () => {
    // Le bon defaut : un serveur sans authentification ne sert pas ses routes
    // privees comme si elles etaient publiques.
    const app = build([
      route({
        name: 'essai.prive',
        method: 'GET',
        path: '/prive',
        auth: 'required',
        handler: () => undefined,
      }),
    ])

    expect((await request(app.express).get('/prive')).status).toBe(401)
  })

  it('transmet l identite au handler', async () => {
    const app = build(
      [
        route({
          name: 'essai.moi',
          method: 'GET',
          path: '/moi',
          auth: 'required',
          output: z.object({ id: z.string() }),
          handler: ({ user }) => ({ id: user.id }),
        }),
      ],
      {},
      () => Promise.resolve({ id: 'u1', sessionId: 's1', organizationId: undefined }),
    )

    const response = await request(app.express).get('/moi')
    expect(response.body).toEqual({ id: 'u1' })
  })
})

describe('portee de requete', () => {
  it('la referme meme quand la requete echoue', async () => {
    // Une portee qui fuit ne se voit qu'a la millieme requete, en memoire qui
    // ne redescend pas.
    const libere = vi.fn()
    const container = createContainer().register(
      'ressource',
      () => ({ dispose: libere }),
      'request',
    )

    const app = createApp({
      config: { ...loadConfig(undefined, { NODE_ENV: 'test' }), NODE_ENV: 'production' },
      logger,
      container: container as never,
      modules: [
        defineModule({
          name: 'essai',
          routes: [
            route({
              name: 'essai.panne',
              method: 'GET',
              path: '/panne',
              auth: 'public',
              handler: ({ c }) => {
                ;(c as unknown as { get: (k: string) => unknown }).get('ressource')
                throw new Error('interne')
              },
            }),
          ] as never,
        }) as never,
      ],
    })

    await request(app.express).get('/panne')
    expect(libere).toHaveBeenCalledTimes(1)
  })
})

describe('inventaire', () => {
  it('expose les routes montees', async () => {
    const app = build([
      route({
        name: 'essai.lire',
        method: 'GET',
        path: '/essai',
        auth: 'public',
        handler: () => undefined,
      }),
    ])

    expect(app.routes.map((r) => r.name)).toEqual(['essai.lire'])
    await Promise.resolve()
  })
})

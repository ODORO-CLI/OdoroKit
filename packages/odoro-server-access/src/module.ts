/**
 * The buyer area, as an `@odoro-cli/server` module.
 *
 *   GET  /api/access                 the products this person may open, with
 *                                    their contents and what was seen;
 *   GET  /api/access/content?id=     one content, if the person may open it —
 *                                    403 says which product opens it;
 *   POST /api/access/progress        { contenu } : seen.
 *
 * WHO the person is comes from the app (`who`): the shop's customer session,
 * or any other account module. This module never signs anyone in, and never
 * grants a right — Odoro writes them.
 *
 * @module
 */

import {
  ApiError,
  NotFoundError,
  defineModule,
  route,
  type Cookies,
} from '@odoro-cli/server'
import { z } from 'zod'

import { accessInstalled, area, markSeen, readContent, type Query } from './access.js'

export interface AccessOptions {
  /** The site's database, with the `access` capability. */
  readonly db: Query
  /** The person signed in on this request, or `null`. */
  readonly who: (cookies: Cookies) => Promise<{ readonly email: string } | null>
}

function refusal(
  status: 'UNAUTHORIZED' | 'FORBIDDEN',
  message: string,
  extra: Record<string, unknown> = {},
): ApiError {
  return new ApiError(status, message, { extensions: { erreur: message, ...extra } })
}

export function createAccessModule(options: AccessOptions) {
  const { db } = options

  const read = route({
    name: 'access.area',
    method: 'GET',
    path: '/api/access',
    auth: 'public',
    handler: async ({ cookies }) => {
      if (!(await accessInstalled(db))) return { connecte: false, produits: [] }
      const person = await options.who(cookies)
      if (person === null) return { connecte: false, produits: [] }
      return { connecte: true, produits: await area(db, person.email) }
    },
  })

  const content = route({
    name: 'access.content',
    method: 'GET',
    path: '/api/access/content',
    auth: 'public',
    input: z.object({ id: z.string().max(64) }),
    handler: async ({ input, cookies }) => {
      if (!(await accessInstalled(db)))
        throw new NotFoundError('Ce contenu est introuvable.', {
          extensions: { erreur: 'Ce contenu est introuvable.' },
        })
      const person = await options.who(cookies)
      const reading = await readContent(db, person?.email ?? null, input.id)
      if (reading.kind === 'unknown') {
        throw new NotFoundError('Ce contenu est introuvable.', {
          extensions: { erreur: 'Ce contenu est introuvable.' },
        })
      }
      if (reading.kind === 'locked') {
        if (person === null)
          throw refusal('UNAUTHORIZED', 'Connectez-vous pour ouvrir ce contenu.', {
            produit: reading.product,
          })
        throw refusal(
          'FORBIDDEN',
          "Ce contenu fait partie d'un produit que vous n'avez pas.",
          { produit: reading.product },
        )
      }
      return { contenu: reading.content }
    },
  })

  const progress = route({
    name: 'access.progress',
    method: 'POST',
    path: '/api/access/progress',
    auth: 'public',
    input: z.object({ contenu: z.string().max(64) }),
    handler: async ({ input, cookies }) => {
      const person = await options.who(cookies)
      if (person === null)
        throw refusal('UNAUTHORIZED', 'Connectez-vous pour ouvrir ce contenu.')
      if (
        !(await accessInstalled(db)) ||
        !(await markSeen(db, person.email, input.contenu))
      ) {
        throw refusal(
          'FORBIDDEN',
          "Ce contenu fait partie d'un produit que vous n'avez pas.",
        )
      }
      return { ok: true }
    },
  })

  return defineModule({
    name: 'access',
    routes: [read, content, progress] as never,
  })
}

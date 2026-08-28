/**
 * Chargement paresseux des composants de route.
 *
 * Chaque chargeur est associe, une fois pour toutes, a un composant
 * `React.lazy` et a une promesse de prechargement memorisee. Le prechargement
 * permet au routeur de garantir que le module est disponible **avant** de
 * declencher une View Transition : sans cela, la transition capturerait le
 * fallback de Suspense au lieu de la page.
 *
 * @module
 */

import { type ComponentType, type LazyExoticComponent, lazy } from 'react'

import { matchRoutes } from './matchRoutes.js'
import type { RouteLazyLoader, RouteObject } from './types.js'

/** Entree du registre pour un chargeur donne. */
interface LazyEntry {
  /** Composant `React.lazy` stable, utilisable dans un arbre Suspense. */
  readonly Component: LazyExoticComponent<ComponentType>
  /** Declenche (ou reutilise) le chargement du module. */
  readonly preload: () => Promise<unknown>
  /** `true` une fois le module resolu. */
  isLoaded: boolean
}

const REGISTRY = new WeakMap<RouteLazyLoader, LazyEntry>()

/**
 * Retourne l'entree de registre d'un chargeur, en la creant au besoin.
 *
 * @example
 * const { Component, preload } = getLazyEntry(() => import('./About'))
 */
export function getLazyEntry(loader: RouteLazyLoader): LazyEntry {
  const existing = REGISTRY.get(loader)
  if (existing) return existing

  let pending: Promise<unknown> | undefined

  const entry: LazyEntry = {
    Component: lazy(loader),
    isLoaded: false,
    preload() {
      pending ??= loader().then((module) => {
        entry.isLoaded = true
        return module
      })
      return pending
    },
  }

  REGISTRY.set(loader, entry)
  return entry
}

/**
 * Precharge tous les modules paresseux necessaires a l'affichage d'un chemin.
 *
 * @returns `null` si tout est deja charge — le cas courant, qui permet a
 *   l'appelant de rester entierement synchrone — sinon une promesse resolue
 *   quand tous les modules manquants sont disponibles.
 *
 * @example
 * const pending = preloadRoutes(routes, '/about')
 * if (pending === null) commit()
 * else void pending.then(commit)
 */
export function preloadRoutes(
  routes: readonly RouteObject[],
  pathname: string,
): Promise<unknown> | null {
  const matches = matchRoutes(routes, pathname)
  if (matches === null) return null

  const pending: Promise<unknown>[] = []
  for (const { route } of matches) {
    if (!route.lazy) continue
    const entry = getLazyEntry(route.lazy)
    if (!entry.isLoaded) pending.push(entry.preload())
  }

  return pending.length === 0 ? null : Promise.all(pending)
}

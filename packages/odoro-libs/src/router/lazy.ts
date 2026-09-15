/**
 * Lazy loading of the route components.
 *
 * Each loader is tied, once and for all, to a `React.lazy` component and to a
 * memoized preloading promise. Preloading lets the router guarantee that the
 * module is available **before** starting a View Transition: without that,
 * the transition would capture the Suspense fallback instead of the page.
 *
 * @module
 */

import { type ComponentType, type LazyExoticComponent, lazy } from 'react'

import { matchRoutes } from './matchRoutes.js'
import type { RouteLazyLoader, RouteObject } from './types.js'

/** Registry entry for a given loader. */
interface LazyEntry {
  /** Stable `React.lazy` component, usable inside a Suspense tree. */
  readonly Component: LazyExoticComponent<ComponentType>
  /** Starts (or reuses) the loading of the module. */
  readonly preload: () => Promise<unknown>
  /** `true` once the module has resolved. */
  isLoaded: boolean
}

const REGISTRY = new WeakMap<RouteLazyLoader, LazyEntry>()

/**
 * Returns the registry entry of a loader, creating it when needed.
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
 * Preloads every lazy module needed to display a path.
 *
 * @returns `null` when everything is already loaded — the common case, which
 *   lets the caller stay entirely synchronous — otherwise a promise resolved
 *   when all the missing modules are available.
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

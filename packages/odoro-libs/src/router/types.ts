/**
 * Shared router types.
 *
 * @module
 */

import type { ComponentType, ReactNode } from 'react'

/**
 * Loader of a lazy route. The module must export the page component as
 * `default`.
 */
export type RouteLazyLoader = () => Promise<{ default: ComponentType }>

/**
 * Declarative description of a route.
 *
 * This is the normalized shape produced from `<Route>` elements; it can also
 * be supplied directly to {@link matchRoutes} for tests or for server-side
 * rendering.
 */
export interface RouteObject {
  /**
   * Path of the route, **relative to its parent**. A leading `/` is tolerated
   * and ignored: there is no absolute path inside a nested tree.
   */
  path?: string
  /**
   * Index route: rendered when the parent path is reached exactly.
   * An index route can have neither `path` nor `children`.
   */
  index?: boolean
  /**
   * Element rendered for this route. A route without `element` nor `lazy` is a
   * transparent layout: it renders its `<Outlet />` directly.
   */
  element?: ReactNode
  /**
   * Lazy loading of the page component. The module is only requested on the
   * first resolution of the route, then kept.
   *
   * Prefer `lazy` over an `element` holding a hand-built `React.lazy`: the
   * router can preload the module before starting a View Transition, which
   * avoids capturing the Suspense fallback.
   */
  lazy?: RouteLazyLoader
  /** Child routes, rendered at the location of `<Outlet />`. */
  children?: RouteObject[]
}

/** Parameters extracted from the URL. */
export type RouteParams = Readonly<Record<string, string | undefined>>

/** A route of the tree successfully matched against the current pathname. */
export interface RouteMatch {
  /** Route concerned. */
  readonly route: RouteObject
  /** Pattern accumulated from the root, for example `/users/:id`. */
  readonly pattern: string
  /** Portion of the pathname consumed up to and including this route. */
  readonly pathname: string
  /**
   * Like `pathname`, but without the portion captured by a catch-all. This is
   * the base to use when resolving relative links.
   */
  readonly pathnameBase: string
  /** Parameters accumulated from the root. */
  readonly params: RouteParams
}

/** Current location, minimal equivalent of `window.location`. */
export interface Location {
  /** Path, always prefixed by `/`. */
  readonly pathname: string
  /** Query string, prefixed by `?` when not empty. */
  readonly search: string
  /** Fragment, prefixed by `#` when not empty. */
  readonly hash: string
  /** Arbitrary data attached to the history entry. */
  readonly state: unknown
  /** Unique key of the history entry, stable when going back. */
  readonly key: string
}

/** Navigation target: a relative URL, or a history delta. */
export type To = string | Partial<Pick<Location, 'pathname' | 'search' | 'hash'>>

/** Options of a programmatic navigation. */
export interface NavigateOptions {
  /** Replaces the current entry instead of pushing a new one. */
  replace?: boolean
  /** Data attached to the history entry. */
  state?: unknown
  /** Forces or disables the View Transition for this navigation. */
  viewTransition?: boolean
  /** Prevents the scroll restoration/reset for this navigation. */
  preventScrollReset?: boolean
}

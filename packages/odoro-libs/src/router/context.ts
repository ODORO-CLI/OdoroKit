/**
 * React contexts of the router.
 *
 * They are deliberately split: a component that only needs `navigate` must
 * not re-render on every location change.
 *
 * @module
 */

import { createContext } from 'react'

import type { RouterHistory } from './history.js'
import type { Location, NavigateOptions, RouteMatch, RouteObject, To } from './types.js'

/** Signature of the programmatic navigation function. */
export interface NavigateFunction {
  /** Navigates to a target. */
  (to: To, options?: NavigateOptions): void
  /** Moves the cursor inside the history (`navigate(-1)` to go back). */
  (delta: number): void
}

/** Value of the navigation context, stable for the lifetime of the `<Router>`. */
export interface NavigationContextValue {
  /** Underlying history. */
  readonly history: RouterHistory
  /** Navigation function exposed by `useNavigate`. */
  readonly navigate: NavigateFunction
  /**
   * Route tree published by the current `<Routes>`. Used to preload lazy
   * routes before a View Transition.
   *
   * @internal
   */
  readonly routesRef: { current: readonly RouteObject[] | null }
  /** Default value of the `viewTransition` option of navigations. */
  readonly viewTransition: boolean
}

/** Navigation context. `null` outside of a `<Router>`. */
export const NavigationContext = createContext<NavigationContextValue | null>(null)
NavigationContext.displayName = 'OdoroNavigation'

/** Location context. `null` outside of a `<Router>`. */
export const LocationContext = createContext<Location | null>(null)
LocationContext.displayName = 'OdoroLocation'

/** Value of the route context: the chain of matches and the depth. */
export interface RouteContextValue {
  /** Root -> leaf chain of the routes matching the current path. */
  readonly matches: readonly RouteMatch[]
  /** Index, within `matches`, of the route rendered by the current component. */
  readonly depth: number
}

/** Route context, fed by `<Routes>` then by each `<Outlet />`. */
export const RouteContext = createContext<RouteContextValue>({ matches: [], depth: 0 })
RouteContext.displayName = 'OdoroRoute'

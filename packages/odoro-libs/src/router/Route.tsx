/**
 * Declarative route element.
 *
 * @module
 */

import type { ReactNode } from 'react'

import type { RouteLazyLoader } from './types.js'

/** Props of {@link Route}. */
export interface RouteProps {
  /** Path relative to the parent. */
  path?: string
  /** Index route of the parent. */
  index?: boolean
  /** Element rendered for this route. */
  element?: ReactNode
  /** Lazy loading of the page component. */
  lazy?: RouteLazyLoader
  /** Child routes, rendered at the location of `<Outlet />`. */
  children?: ReactNode
}

/**
 * Declares a route. This element is never rendered: `<Routes>` reads its
 * props to build the tree.
 *
 * @throws {Error} When it is rendered outside of a `<Routes>`.
 *
 * @example
 * <Route path="users" element={<Layout />}>
 *   <Route index element={<UserList />} />
 *   <Route path=":id" element={<UserDetail />} />
 * </Route>
 */
export function Route(_props: RouteProps): never {
  throw new Error(
    '[odoro/router] <Route> can only be used as a direct child of <Routes> or of another <Route>.',
  )
}

/**
 * Element declaratif de route.
 *
 * @module
 */

import type { ReactNode } from 'react'

import type { RouteLazyLoader } from './types.js'

/** Proprietes de {@link Route}. */
export interface RouteProps {
  /** Chemin relatif au parent. */
  path?: string
  /** Route index du parent. */
  index?: boolean
  /** Element rendu pour cette route. */
  element?: ReactNode
  /** Chargement paresseux du composant de page. */
  lazy?: RouteLazyLoader
  /** Routes filles, rendues a l'emplacement de `<Outlet />`. */
  children?: ReactNode
}

/**
 * Declare une route. Cet element n'est jamais rendu : `<Routes>` lit ses
 * proprietes pour construire l'arbre.
 *
 * @throws {Error} S'il est rendu hors d'un `<Routes>`.
 *
 * @example
 * <Route path="users" element={<Layout />}>
 *   <Route index element={<UserList />} />
 *   <Route path=":id" element={<UserDetail />} />
 * </Route>
 */
export function Route(_props: RouteProps): never {
  throw new Error(
    '[odoro/router] <Route> ne peut etre utilise que comme enfant direct de <Routes> ou d un autre <Route>.',
  )
}

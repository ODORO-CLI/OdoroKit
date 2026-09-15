/**
 * Insertion point of the child routes.
 *
 * @module
 */

import { type ReactElement, useContext } from 'react'

import { RouteContext } from './context.js'
import { RenderMatches } from './render.jsx'

/**
 * Renders the child route matching the current path.
 *
 * @returns `null` when the current route is a leaf.
 *
 * @example
 * function Layout() {
 *   return (
 *     <>
 *       <Nav />
 *       <Outlet />
 *     </>
 *   )
 * }
 */
export function Outlet(): ReactElement | null {
  const { matches, depth } = useContext(RouteContext)
  return <RenderMatches matches={matches} depth={depth + 1} />
}

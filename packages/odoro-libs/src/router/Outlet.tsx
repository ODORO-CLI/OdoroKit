/**
 * Point d'insertion des routes filles.
 *
 * @module
 */

import { type ReactElement, useContext } from 'react'

import { RouteContext } from './context.js'
import { RenderMatches } from './render.jsx'

/**
 * Rend la route fille correspondant au chemin courant.
 *
 * @returns `null` lorsque la route courante est une feuille.
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

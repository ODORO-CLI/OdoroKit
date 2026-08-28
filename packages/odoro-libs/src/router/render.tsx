/**
 * Rendu recursif d'une chaine de correspondances de routes.
 *
 * Chaque niveau publie sa profondeur dans `RouteContext` ; `<Outlet />` se
 * contente de rendre le niveau suivant.
 *
 * @module
 */

import { type ReactElement, type ReactNode, useMemo } from 'react'

import { RouteContext } from './context.js'
import { getLazyEntry } from './lazy.js'
import type { RouteMatch } from './types.js'

/** Proprietes de {@link RenderMatches}. */
export interface RenderMatchesProps {
  /** Chaine complete des correspondances. */
  matches: readonly RouteMatch[]
  /** Niveau a rendre. */
  depth: number
}

/**
 * Rend la route situee a `depth` dans la chaine de correspondances.
 *
 * @returns `null` quand la profondeur depasse la chaine — cas d'un `<Outlet />`
 *   place dans une route feuille.
 */
export function RenderMatches({
  matches,
  depth,
}: RenderMatchesProps): ReactElement | null {
  const value = useMemo(() => ({ matches, depth }), [matches, depth])

  const match = matches[depth]
  if (match === undefined) return null

  const { route } = match

  let content: ReactNode
  if (route.lazy) {
    const { Component } = getLazyEntry(route.lazy)
    content = <Component />
  } else if (route.element !== undefined) {
    content = route.element
  } else {
    // Route sans element : layout transparent, on descend directement.
    content = <RenderMatches matches={matches} depth={depth + 1} />
  }

  return <RouteContext.Provider value={value}>{content}</RouteContext.Provider>
}

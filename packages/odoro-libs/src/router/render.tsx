/**
 * Recursive rendering of a chain of route matches.
 *
 * Each level publishes its depth in `RouteContext`; `<Outlet />` simply
 * renders the next level.
 *
 * @module
 */

import { type ReactElement, type ReactNode, useMemo } from 'react'

import { RouteContext } from './context.js'
import { getLazyEntry } from './lazy.js'
import type { RouteMatch } from './types.js'

/** Props of {@link RenderMatches}. */
export interface RenderMatchesProps {
  /** Complete chain of the matches. */
  matches: readonly RouteMatch[]
  /** Level to render. */
  depth: number
}

/**
 * Renders the route located at `depth` in the chain of matches.
 *
 * @returns `null` when the depth goes past the chain — the case of an
 *   `<Outlet />` placed in a leaf route.
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
    // Route without an element: transparent layout, we go straight down.
    content = <RenderMatches matches={matches} depth={depth + 1} />
  }

  return <RouteContext.Provider value={value}>{content}</RouteContext.Provider>
}

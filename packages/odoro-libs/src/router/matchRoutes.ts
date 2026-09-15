/**
 * Flattening of a route tree into ranked branches, then matching against the
 * current pathname.
 *
 * Flattening and sorting are memoized by identity of the route array: a
 * render that reuses the same tree pays neither the walk nor the sort again.
 *
 * @module
 */

import { compilePattern, compareRanks, matchPattern } from './matcher.js'
import { joinPaths, normalizePathname } from './path.js'
import type { RouteMatch, RouteObject, RouteParams } from './types.js'

/**
 * A root -> leaf chain of the route tree, with its complete pattern.
 *
 * @internal
 */
export interface RouteBranch {
  /** Complete pattern of the leaf, for example `/users/:id/settings`. */
  readonly pattern: string
  /** Chain of the routes traversed, from the root to the leaf. */
  readonly routes: readonly RouteObject[]
  /** Pattern accumulated at each level of the chain, same length as `routes`. */
  readonly patterns: readonly string[]
  /** Specificity vector used for the ranking. */
  readonly rank: readonly number[]
}

const BRANCH_CACHE = new WeakMap<readonly RouteObject[], readonly RouteBranch[]>()

/**
 * Flattens a route tree into branches, sorted by decreasing specificity.
 *
 * The sort is stable: two branches of identical specificity keep their
 * declaration order, which makes the result entirely deterministic.
 *
 * @throws {Error} When an index route declares a `path` or `children`.
 *
 * @internal
 */
export function flattenRoutes(routes: readonly RouteObject[]): readonly RouteBranch[] {
  const cached = BRANCH_CACHE.get(routes)
  if (cached) return cached

  const branches: RouteBranch[] = []

  const walk = (
    nodes: readonly RouteObject[],
    parentPattern: string,
    parentChain: readonly RouteObject[],
    parentPatterns: readonly string[],
  ): void => {
    for (const route of nodes) {
      if (route.index && (route.path !== undefined || route.children !== undefined)) {
        throw new Error(
          '[odoro/router] An index route can declare neither "path" nor "children".',
        )
      }

      const pattern = route.index ? parentPattern : joinPaths(parentPattern, route.path)
      const chain = [...parentChain, route]
      const patterns = [...parentPatterns, pattern]

      if (route.children && route.children.length > 0) {
        walk(route.children, pattern, chain, patterns)
        // A parent route without an index child cannot be a leaf: rendering a
        // layout with no content would be a silently empty page.
        continue
      }

      branches.push({
        pattern,
        routes: chain,
        patterns,
        // An index route is more specific than its parent alone: it describes
        // the same path but in a terminal way.
        rank: route.index
          ? [...compilePattern(pattern).rank, Number.MAX_SAFE_INTEGER]
          : compilePattern(pattern).rank,
      })
    }
  }

  walk(routes, '/', [], [])
  branches.sort((a, b) => compareRanks(a.rank, b.rank))

  BRANCH_CACHE.set(routes, branches)
  return branches
}

/**
 * Removes from a pathname the portion captured by a catch-all.
 *
 * @internal
 */
function stripSplat(pathname: string, splat: string | undefined): string {
  if (!splat) return pathname
  const base = pathname.slice(0, Math.max(0, pathname.length - splat.length))
  return normalizePathname(base)
}

/**
 * Matches a route tree against a pathname and returns the corresponding chain
 * of routes, from the root to the leaf.
 *
 * @param routes Route tree.
 * @param pathname Path to resolve.
 * @returns The chain of the routes traversed, or `null` when no branch
 *   matches.
 *
 * @example
 * const routes = [
 *   { path: '/', children: [{ index: true }, { path: 'users/:id' }] },
 * ]
 * matchRoutes(routes, '/users/42')?.at(-1)?.params // { id: '42' }
 */
export function matchRoutes(
  routes: readonly RouteObject[],
  pathname: string,
): RouteMatch[] | null {
  const target = normalizePathname(pathname)

  for (const branch of flattenRoutes(routes)) {
    const leaf = matchPattern(branch.pattern, target, true)
    if (leaf === null) continue

    const matches: RouteMatch[] = []
    let params: RouteParams = {}

    for (const [index, route] of branch.routes.entries()) {
      const isLeaf = index === branch.routes.length - 1
      const pattern = branch.patterns[index] ?? '/'
      // Intermediate levels only consume a prefix of the pathname.
      const match = isLeaf ? leaf : matchPattern(pattern, target, false)

      // The pattern of an ancestor is by construction a prefix of the one of
      // the leaf: if the leaf matches, the ancestor matches too.
      /* c8 ignore next */
      if (match === null) break

      params = { ...params, ...match.params }
      matches.push({
        route,
        pattern,
        pathname: match.pathname,
        pathnameBase: stripSplat(match.pathname, match.params['*']),
        params,
      })
    }

    return matches
  }

  return null
}

/**
 * Aplatissement d'un arbre de routes en branches classees, puis confrontation
 * au pathname courant.
 *
 * L'aplatissement et le tri sont memorises par identite du tableau de routes :
 * un rendu qui reutilise le meme arbre ne repaie ni le parcours ni le tri.
 *
 * @module
 */

import { compilePattern, compareRanks, matchPattern } from './matcher.js'
import { joinPaths, normalizePathname } from './path.js'
import type { RouteMatch, RouteObject, RouteParams } from './types.js'

/**
 * Une chaine racine -> feuille de l'arbre de routes, avec son pattern complet.
 *
 * @internal
 */
export interface RouteBranch {
  /** Pattern complet de la feuille, par exemple `/users/:id/settings`. */
  readonly pattern: string
  /** Chaine des routes traversees, de la racine a la feuille. */
  readonly routes: readonly RouteObject[]
  /** Pattern cumule a chaque niveau de la chaine, meme longueur que `routes`. */
  readonly patterns: readonly string[]
  /** Vecteur de specificite servant au classement. */
  readonly rank: readonly number[]
}

const BRANCH_CACHE = new WeakMap<readonly RouteObject[], readonly RouteBranch[]>()

/**
 * Aplatit un arbre de routes en branches, triees par specificite decroissante.
 *
 * Le tri est stable : deux branches de specificite identique conservent leur
 * ordre de declaration, ce qui rend le resultat entierement deterministe.
 *
 * @throws {Error} Si une route index declare un `path` ou des `children`.
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
          '[odoro/router] Une route index ne peut declarer ni "path" ni "children".',
        )
      }

      const pattern = route.index ? parentPattern : joinPaths(parentPattern, route.path)
      const chain = [...parentChain, route]
      const patterns = [...parentPatterns, pattern]

      if (route.children && route.children.length > 0) {
        walk(route.children, pattern, chain, patterns)
        // Une route parente sans enfant index ne peut pas etre une feuille :
        // rendre un layout sans contenu serait une page vide silencieuse.
        continue
      }

      branches.push({
        pattern,
        routes: chain,
        patterns,
        // Une route index est plus specifique que son parent seul : elle
        // decrit le meme chemin mais de facon terminale.
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
 * Retire d'un pathname la portion capturee par un catch-all.
 *
 * @internal
 */
function stripSplat(pathname: string, splat: string | undefined): string {
  if (!splat) return pathname
  const base = pathname.slice(0, Math.max(0, pathname.length - splat.length))
  return normalizePathname(base)
}

/**
 * Confronte un arbre de routes a un pathname et retourne la chaine de routes
 * correspondante, de la racine a la feuille.
 *
 * @param routes Arbre de routes.
 * @param pathname Chemin a resoudre.
 * @returns La chaine des routes traversees, ou `null` si aucune branche ne
 *   correspond.
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
      // Les niveaux intermediaires ne consomment qu'un prefixe du pathname.
      const match = isLeaf ? leaf : matchPattern(pattern, target, false)

      // Le pattern d'un ancetre est par construction un prefixe de celui de la
      // feuille : si la feuille matche, l'ancetre matche aussi.
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

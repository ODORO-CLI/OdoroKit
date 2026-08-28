/**
 * Compilation et evaluation des patterns de route.
 *
 * Chaque pattern est compile en expression reguliere **une seule fois** puis
 * conserve dans un cache module. Le rendu d'un composant ne recompile jamais :
 * il ne fait qu'executer une `RegExp` deja construite.
 *
 * @module
 */

import { normalizePathname } from './path.js'

/** Nature d'un segment de pattern, du plus specifique au moins specifique. */
export type SegmentKind = 'static' | 'dynamic' | 'optional' | 'catchAll'

/**
 * Poids de specificite d'un segment. `RANK_ABSENT` represente l'absence de
 * segment a une position donnee : un pattern qui s'arrete est plus specifique
 * qu'un pattern qui continue avec un segment optionnel ou un catch-all,
 * puisqu'il decrit exactement le chemin teste.
 */
const RANK_ABSENT = 5
const RANK_BY_KIND: Readonly<Record<SegmentKind, number>> = {
  static: 4,
  dynamic: 3,
  optional: 2,
  catchAll: 1,
}

/** Nom du parametre expose pour un segment catch-all. */
export const CATCH_ALL_PARAM = '*'

/** Un pattern analyse, pret a etre confronte a un pathname. */
export interface CompiledPattern {
  /** Pattern d'origine, tel qu'ecrit par le developpeur. */
  readonly pattern: string
  /** Expression reguliere compilee, insensible a la casse. */
  readonly regex: RegExp
  /** Noms des parametres, dans l'ordre des groupes capturants. */
  readonly paramNames: readonly string[]
  /** Poids de specificite, compares position par position. */
  readonly rank: readonly number[]
  /** `true` si le dernier segment est un catch-all. */
  readonly hasCatchAll: boolean
  /** `true` si le pattern doit consommer le pathname en entier. */
  readonly end: boolean
}

/** Resultat d'une confrontation reussie entre un pattern et un pathname. */
export interface PathMatch {
  /** Pattern ayant produit la correspondance. */
  readonly pattern: string
  /** Portion du pathname effectivement consommee. */
  readonly pathname: string
  /**
   * Parametres extraits. Un segment optionnel absent vaut `undefined`, ce que
   * `noUncheckedIndexedAccess` rend explicite cote consommateur.
   */
  readonly params: Readonly<Record<string, string | undefined>>
}

const CACHE = new Map<string, CompiledPattern>()

/** Caracteres a neutraliser dans un segment statique. */
const REGEX_SPECIALS = /[.*+?^${}()|[\]\\]/g

function escapeRegex(value: string): string {
  return value.replace(REGEX_SPECIALS, '\\$&')
}

/**
 * Decode un segment d'URL sans jamais lever : un `%` isole dans une URL
 * malformee ne doit pas faire tomber l'application entiere.
 */
function safeDecode(value: string): string {
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}

/**
 * Compile un pattern de route en expression reguliere, avec mise en cache.
 *
 * Syntaxe supportee :
 * - `/users` — segment statique
 * - `/users/:id` — segment dynamique obligatoire
 * - `/blog/:slug?` — segment dynamique optionnel
 * - `/docs/*` — catch-all, expose le parametre `*`
 *
 * @param pattern Pattern de route, avec ou sans `/` initial.
 * @param end Si `false`, le pattern peut ne consommer qu'un prefixe du
 *   pathname : c'est le mode utilise pour les routes parentes imbriquees.
 * @throws {Error} Si un segment catch-all n'est pas en derniere position, si un
 *   parametre n'a pas de nom, ou si un parametre est declare deux fois.
 *
 * @example
 * const compiled = compilePattern('/users/:id')
 * compiled.paramNames // ['id']
 */
export function compilePattern(pattern: string, end = true): CompiledPattern {
  const key = `${end ? '1' : '0'} ${pattern}`
  const cached = CACHE.get(key)
  if (cached) return cached

  const normalized = normalizePathname(pattern)
  const segments = normalized === '/' ? [] : normalized.slice(1).split('/')

  const paramNames: string[] = []
  const rank: number[] = []
  let source = ''
  let hasCatchAll = false

  for (const [index, segment] of segments.entries()) {
    if (hasCatchAll) {
      throw new Error(
        `[odoro/router] Le segment catch-all "*" doit etre le dernier segment du pattern "${pattern}".`,
      )
    }

    if (segment === '*') {
      hasCatchAll = true
      paramNames.push(CATCH_ALL_PARAM)
      rank.push(RANK_BY_KIND.catchAll)
      // Un catch-all accepte l'absence totale de suite : `/docs/*` matche
      // aussi bien `/docs` que `/docs/a/b`.
      source += '(?:/(.*))?'
      continue
    }

    if (segment.startsWith(':')) {
      const optional = segment.endsWith('?')
      const name = segment.slice(1, optional ? -1 : undefined)
      if (name === '') {
        throw new Error(
          `[odoro/router] Parametre sans nom a la position ${index} du pattern "${pattern}".`,
        )
      }
      if (paramNames.includes(name)) {
        throw new Error(
          `[odoro/router] Le parametre ":${name}" est declare plusieurs fois dans le pattern "${pattern}".`,
        )
      }
      paramNames.push(name)
      rank.push(optional ? RANK_BY_KIND.optional : RANK_BY_KIND.dynamic)
      source += optional ? '(?:/([^/]+))?' : '/([^/]+)'
      continue
    }

    rank.push(RANK_BY_KIND.static)
    source += `/${escapeRegex(segment)}`
  }

  // Sans le `/?` final, `/users` ne matcherait pas `/users/` ; sans le
  // lookahead en mode prefixe, `/user` matcherait le debut de `/users`.
  const suffix = end ? '/?$' : '(?=/|$)'
  const regex = new RegExp(`^${source}${suffix}`, 'i')

  const compiled: CompiledPattern = {
    pattern,
    regex,
    paramNames,
    rank,
    hasCatchAll,
    end,
  }
  CACHE.set(key, compiled)
  return compiled
}

/**
 * Confronte un pattern a un pathname.
 *
 * @param pattern Pattern de route.
 * @param pathname Chemin a tester.
 * @param end Voir {@link compilePattern}.
 * @returns Le detail de la correspondance, ou `null` si le pattern ne
 *   s'applique pas.
 *
 * @example
 * matchPattern('/users/:id', '/users/42')?.params // { id: '42' }
 * matchPattern('/docs/*', '/docs/a/b')?.params    // { '*': 'a/b' }
 */
export function matchPattern(
  pattern: string,
  pathname: string,
  end = true,
): PathMatch | null {
  const compiled = compilePattern(pattern, end)
  const result = compiled.regex.exec(normalizePathname(pathname))
  if (result === null) return null

  const params: Record<string, string | undefined> = {}
  for (const [index, name] of compiled.paramNames.entries()) {
    const raw = result[index + 1]
    params[name] = raw === undefined ? undefined : safeDecode(raw)
  }

  // `result[0]` peut inclure un `/` final que l'on ne veut pas propager aux
  // routes enfants.
  const consumed = result[0] ?? ''
  return {
    pattern,
    pathname: consumed === '' ? '/' : normalizePathname(consumed),
    params,
  }
}

/**
 * Compare deux vecteurs de specificite, position par position.
 *
 * @internal
 */
export function compareRanks(a: readonly number[], b: readonly number[]): number {
  const length = Math.max(a.length, b.length)
  for (let index = 0; index < length; index += 1) {
    const left = a[index] ?? RANK_ABSENT
    const right = b[index] ?? RANK_ABSENT
    if (left !== right) return right - left
  }
  return 0
}

/**
 * Compare deux patterns par specificite decroissante : statique avant
 * dynamique, dynamique avant optionnel, optionnel avant catch-all, position
 * par position et de gauche a droite.
 *
 * Destinee a `Array.prototype.sort` : un resultat negatif place `a` en
 * premier. En cas d'egalite stricte, retourne `0` — le tri de JavaScript etant
 * stable, l'ordre de declaration est alors conserve.
 *
 * @example
 * ['/users/*', '/users/:id', '/users/me'].sort(comparePatternSpecificity)
 * // ['/users/me', '/users/:id', '/users/*']
 */
export function comparePatternSpecificity(a: string, b: string): number {
  return compareRanks(compilePattern(a).rank, compilePattern(b).rank)
}

/**
 * Vide le cache de compilation. Reserve aux tests : en production le cache est
 * borne par le nombre de patterns declares dans l'application.
 *
 * @internal
 */
export function clearPatternCache(): void {
  CACHE.clear()
}

/**
 * Nombre de patterns actuellement en cache. Reserve aux tests.
 *
 * @internal
 */
export function patternCacheSize(): number {
  return CACHE.size
}

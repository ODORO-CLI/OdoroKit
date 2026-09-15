/**
 * Compilation and evaluation of route patterns.
 *
 * Each pattern is compiled into a regular expression **only once** then kept
 * in a module cache. Rendering a component never recompiles: it only runs an
 * already built `RegExp`.
 *
 * @module
 */

import { normalizePathname } from './path.js'

/** Nature of a pattern segment, from the most to the least specific. */
export type SegmentKind = 'static' | 'dynamic' | 'optional' | 'catchAll'

/**
 * Specificity weight of a segment. `RANK_ABSENT` represents the absence of a
 * segment at a given position: a pattern that stops is more specific than a
 * pattern that carries on with an optional segment or a catch-all, since it
 * describes exactly the path being tested.
 */
const RANK_ABSENT = 5
const RANK_BY_KIND: Readonly<Record<SegmentKind, number>> = {
  static: 4,
  dynamic: 3,
  optional: 2,
  catchAll: 1,
}

/** Name of the parameter exposed for a catch-all segment. */
export const CATCH_ALL_PARAM = '*'

/** A parsed pattern, ready to be matched against a pathname. */
export interface CompiledPattern {
  /** Original pattern, as written by the developer. */
  readonly pattern: string
  /** Compiled regular expression, case insensitive. */
  readonly regex: RegExp
  /** Names of the parameters, in the order of the capturing groups. */
  readonly paramNames: readonly string[]
  /** Specificity weights, compared position by position. */
  readonly rank: readonly number[]
  /** `true` when the last segment is a catch-all. */
  readonly hasCatchAll: boolean
  /** `true` when the pattern must consume the whole pathname. */
  readonly end: boolean
}

/** Result of a successful match between a pattern and a pathname. */
export interface PathMatch {
  /** Pattern that produced the match. */
  readonly pattern: string
  /** Portion of the pathname effectively consumed. */
  readonly pathname: string
  /**
   * Extracted parameters. A missing optional segment is `undefined`, which
   * `noUncheckedIndexedAccess` makes explicit on the consumer side.
   */
  readonly params: Readonly<Record<string, string | undefined>>
}

const CACHE = new Map<string, CompiledPattern>()

/** Characters to neutralize inside a static segment. */
const REGEX_SPECIALS = /[.*+?^${}()|[\]\\]/g

function escapeRegex(value: string): string {
  return value.replace(REGEX_SPECIALS, '\\$&')
}

/**
 * Decodes a URL segment without ever throwing: a lone `%` in a malformed URL
 * must not bring the whole application down.
 */
function safeDecode(value: string): string {
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}

/**
 * Compiles a route pattern into a regular expression, with caching.
 *
 * Supported syntax:
 * - `/users` — static segment
 * - `/users/:id` — required dynamic segment
 * - `/blog/:slug?` — optional dynamic segment
 * - `/docs/*` — catch-all, exposes the `*` parameter
 *
 * @param pattern Route pattern, with or without a leading `/`.
 * @param end When `false`, the pattern may consume only a prefix of the
 *   pathname: this is the mode used for nested parent routes.
 * @throws {Error} When a catch-all segment is not in last position, when a
 *   parameter has no name, or when a parameter is declared twice.
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
        `[odoro/router] The catch-all segment "*" must be the last segment of the pattern "${pattern}".`,
      )
    }

    if (segment === '*') {
      hasCatchAll = true
      paramNames.push(CATCH_ALL_PARAM)
      rank.push(RANK_BY_KIND.catchAll)
      // A catch-all accepts a completely missing remainder: `/docs/*` matches
      // `/docs` just as well as `/docs/a/b`.
      source += '(?:/(.*))?'
      continue
    }

    if (segment.startsWith(':')) {
      const optional = segment.endsWith('?')
      const name = segment.slice(1, optional ? -1 : undefined)
      if (name === '') {
        throw new Error(
          `[odoro/router] Parameter without a name at position ${index} of the pattern "${pattern}".`,
        )
      }
      if (paramNames.includes(name)) {
        throw new Error(
          `[odoro/router] The parameter ":${name}" is declared several times in the pattern "${pattern}".`,
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

  // Without the trailing `/?`, `/users` would not match `/users/`; without
  // the lookahead in prefix mode, `/user` would match the start of `/users`.
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
 * Matches a pattern against a pathname.
 *
 * @param pattern Route pattern.
 * @param pathname Path to test.
 * @param end See {@link compilePattern}.
 * @returns The details of the match, or `null` when the pattern does not
 *   apply.
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

  // `result[0]` may include a trailing `/` that we do not want to propagate to
  // the child routes.
  const consumed = result[0] ?? ''
  return {
    pattern,
    pathname: consumed === '' ? '/' : normalizePathname(consumed),
    params,
  }
}

/**
 * Compares two specificity vectors, position by position.
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
 * Compares two patterns by decreasing specificity: static before dynamic,
 * dynamic before optional, optional before catch-all, position by position and
 * from left to right.
 *
 * Meant for `Array.prototype.sort`: a negative result puts `a` first. On a
 * strict tie, returns `0` — JavaScript sorting being stable, the declaration
 * order is then preserved.
 *
 * @example
 * ['/users/*', '/users/:id', '/users/me'].sort(comparePatternSpecificity)
 * // ['/users/me', '/users/:id', '/users/*']
 */
export function comparePatternSpecificity(a: string, b: string): number {
  return compareRanks(compilePattern(a).rank, compilePattern(b).rank)
}

/**
 * Clears the compilation cache. Reserved for tests: in production the cache
 * is bounded by the number of patterns declared in the application.
 *
 * @internal
 */
export function clearPatternCache(): void {
  CACHE.clear()
}

/**
 * Number of patterns currently cached. Reserved for tests.
 *
 * @internal
 */
export function patternCacheSize(): number {
  return CACHE.size
}

/**
 * Utilities for handling URL paths.
 *
 * These functions are pure and have no DOM dependency: they are testable in
 * isolation and reusable on the server side.
 *
 * @module
 */

/** Breakdown of a relative URL into its three parts. */
export interface ParsedPath {
  /** Path, always prefixed by `/`. */
  pathname: string
  /** Query string, prefixed by `?` when not empty. */
  search: string
  /** Fragment, prefixed by `#` when not empty. */
  hash: string
}

/**
 * Normalizes a pathname: guarantees a leading `/` and removes the trailing
 * `/` as well as the empty segments caused by consecutive `//`.
 *
 * @example
 * normalizePathname('users//42/') // '/users/42'
 * normalizePathname('')           // '/'
 */
export function normalizePathname(pathname: string): string {
  const segments = pathname.split('/').filter(Boolean)
  return segments.length === 0 ? '/' : `/${segments.join('/')}`
}

/**
 * Concatenates path fragments into a normalized pathname.
 *
 * @example
 * joinPaths('/app', 'users', ':id') // '/app/users/:id'
 */
export function joinPaths(...parts: readonly (string | undefined)[]): string {
  return normalizePathname(
    parts.filter((part): part is string => Boolean(part)).join('/'),
  )
}

/**
 * Splits a relative URL into pathname / search / hash.
 *
 * @example
 * parsePath('/blog?page=2#top')
 * // { pathname: '/blog', search: '?page=2', hash: '#top' }
 */
export function parsePath(to: string): ParsedPath {
  let rest = to
  let hash = ''
  let search = ''

  const hashIndex = rest.indexOf('#')
  if (hashIndex >= 0) {
    hash = rest.slice(hashIndex)
    rest = rest.slice(0, hashIndex)
  }

  const searchIndex = rest.indexOf('?')
  if (searchIndex >= 0) {
    search = rest.slice(searchIndex)
    rest = rest.slice(0, searchIndex)
  }

  return {
    pathname: rest === '' ? '/' : rest,
    search: search === '?' ? '' : search,
    hash: hash === '#' ? '' : hash,
  }
}

/**
 * Rebuilds a relative URL from its parts.
 *
 * @example
 * createPath({ pathname: '/blog', search: '?page=2', hash: '' }) // '/blog?page=2'
 */
export function createPath({ pathname, search, hash }: Partial<ParsedPath>): string {
  let result = pathname ?? '/'
  if (search && search !== '?') result += search.startsWith('?') ? search : `?${search}`
  if (hash && hash !== '#') result += hash.startsWith('#') ? hash : `#${hash}`
  return result
}

/**
 * Resolves a navigation target, possibly relative, against the current path.
 * Handles `/absolute`, `relative`, `./relative` and `../parent`.
 *
 * @param to Navigation target.
 * @param fromPathname Pathname used as the base for relative targets.
 *
 * @example
 * resolvePath('../settings', '/users/42/profile') // pathname '/users/42/settings'
 */
export function resolvePath(to: string, fromPathname = '/'): ParsedPath {
  const parsed = parsePath(to)

  if (parsed.pathname.startsWith('/')) {
    return { ...parsed, pathname: normalizePathname(parsed.pathname) }
  }

  const base = normalizePathname(fromPathname).split('/').filter(Boolean)
  for (const segment of parsed.pathname.split('/')) {
    if (segment === '' || segment === '.') continue
    if (segment === '..') base.pop()
    else base.push(segment)
  }

  return { ...parsed, pathname: normalizePathname(base.join('/')) }
}

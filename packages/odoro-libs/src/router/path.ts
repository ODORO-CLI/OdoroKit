/**
 * Utilitaires de manipulation de chemins d'URL.
 *
 * Ces fonctions sont pures et sans dependance au DOM : elles sont testables
 * isolement et reutilisables cote serveur.
 *
 * @module
 */

/** Decomposition d'une URL relative en ses trois parties. */
export interface ParsedPath {
  /** Chemin, toujours prefixe par `/`. */
  pathname: string
  /** Chaine de requete, prefixee par `?` si non vide. */
  search: string
  /** Fragment, prefixe par `#` si non vide. */
  hash: string
}

/**
 * Normalise un pathname : garantit un `/` initial et supprime le `/` final
 * ainsi que les segments vides dus a des `//` consecutifs.
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
 * Concatene des fragments de chemin en un pathname normalise.
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
 * Decoupe une URL relative en pathname / search / hash.
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
 * Recompose une URL relative a partir de ses parties.
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
 * Resout une cible de navigation, potentiellement relative, contre le chemin
 * courant. Gere `/absolu`, `relatif`, `./relatif` et `../parent`.
 *
 * @param to Cible de navigation.
 * @param fromPathname Pathname servant de base aux cibles relatives.
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

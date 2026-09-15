/**
 * Public hooks of the router.
 *
 * @module
 */

import { useCallback, useContext, useMemo } from 'react'

import {
  LocationContext,
  type NavigateFunction,
  NavigationContext,
  type NavigationContextValue,
  RouteContext,
} from './context.js'
import type { Location, NavigateOptions, RouteMatch, RouteParams } from './types.js'

/** Reads the navigation context or fails with an actionable message. */
function useNavigation(hook: string): NavigationContextValue {
  const value = useContext(NavigationContext)
  if (value === null) {
    throw new Error(`[odoro/router] ${hook}() must be called inside a <Router>.`)
  }
  return value
}

/**
 * Returns the current location.
 *
 * @throws {Error} Outside of a `<Router>`.
 *
 * @example
 * const { pathname, search } = useLocation()
 */
export function useLocation(): Location {
  const location = useContext(LocationContext)
  if (location === null) {
    throw new Error('[odoro/router] useLocation() must be called inside a <Router>.')
  }
  return location
}

/**
 * Returns the programmatic navigation function.
 *
 * @throws {Error} Outside of a `<Router>`.
 *
 * @example
 * const navigate = useNavigate()
 * navigate('/users/42')                    // pushes an entry
 * navigate('/login', { replace: true })    // replaces the current entry
 * navigate(-1)                             // goes back
 */
export function useNavigate(): NavigateFunction {
  return useNavigation('useNavigate').navigate
}

/**
 * Returns the parameters extracted from the URL for the current route.
 *
 * The values are `string | undefined`: a missing optional segment is
 * `undefined`, and the type recalls it at the call site.
 *
 * @example
 * const { id } = useParams()
 */
export function useParams(): RouteParams {
  const { matches, depth } = useContext(RouteContext)
  return matches[depth]?.params ?? {}
}

/**
 * Returns the chain of the routes matching the current path, from the root to
 * the leaf. Useful to build a breadcrumb.
 *
 * @example
 * const crumbs = useMatches().map((match) => match.pathnameBase)
 */
export function useMatches(): readonly RouteMatch[] {
  return useContext(RouteContext).matches
}

/** Value accepted to replace the query string. */
export type SearchParamsInit =
  | URLSearchParams
  | string
  | Record<string, string>
  | readonly (readonly [string, string])[]

/** Signature of the setter returned by {@link useSearchParams}. */
export type SetSearchParams = (
  next: SearchParamsInit | ((current: URLSearchParams) => SearchParamsInit),
  options?: NavigateOptions,
) => void

/**
 * Reads and updates the query string.
 *
 * The returned object is a `URLSearchParams` rebuilt on every change of
 * `location.search`: mutating it has no effect, the setter must be used.
 *
 * @example
 * const [params, setParams] = useSearchParams()
 * const page = params.get('page') ?? '1'
 * setParams((current) => {
 *   current.set('page', '2')
 *   return current
 * })
 */
export function useSearchParams(): [URLSearchParams, SetSearchParams] {
  const location = useLocation()
  const navigate = useNavigate()

  const searchParams = useMemo(
    () => new URLSearchParams(location.search),
    [location.search],
  )

  const setSearchParams = useCallback<SetSearchParams>(
    (next, options) => {
      const resolved =
        typeof next === 'function' ? next(new URLSearchParams(location.search)) : next
      const params = new URLSearchParams(
        resolved as ConstructorParameters<typeof URLSearchParams>[0],
      )
      const search = params.toString()
      navigate(
        {
          pathname: location.pathname,
          search: search === '' ? '' : `?${search}`,
          hash: '',
        },
        options,
      )
    },
    [location.pathname, location.search, navigate],
  )

  return [searchParams, setSearchParams]
}

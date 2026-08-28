/**
 * Hooks publics du routeur.
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

/** Lit le contexte de navigation ou echoue avec un message exploitable. */
function useNavigation(hook: string): NavigationContextValue {
  const value = useContext(NavigationContext)
  if (value === null) {
    throw new Error(
      `[odoro/router] ${hook}() doit etre appele a l'interieur d'un <Router>.`,
    )
  }
  return value
}

/**
 * Retourne l'emplacement courant.
 *
 * @throws {Error} Hors d'un `<Router>`.
 *
 * @example
 * const { pathname, search } = useLocation()
 */
export function useLocation(): Location {
  const location = useContext(LocationContext)
  if (location === null) {
    throw new Error(
      "[odoro/router] useLocation() doit etre appele a l'interieur d'un <Router>.",
    )
  }
  return location
}

/**
 * Retourne la fonction de navigation programmatique.
 *
 * @throws {Error} Hors d'un `<Router>`.
 *
 * @example
 * const navigate = useNavigate()
 * navigate('/users/42')                    // empile une entree
 * navigate('/login', { replace: true })    // remplace l'entree courante
 * navigate(-1)                             // retour arriere
 */
export function useNavigate(): NavigateFunction {
  return useNavigation('useNavigate').navigate
}

/**
 * Retourne les parametres extraits de l'URL pour la route courante.
 *
 * Les valeurs sont `string | undefined` : un segment optionnel absent vaut
 * `undefined`, et le type le rappelle a l'appel.
 *
 * @example
 * const { id } = useParams()
 */
export function useParams(): RouteParams {
  const { matches, depth } = useContext(RouteContext)
  return matches[depth]?.params ?? {}
}

/**
 * Retourne la chaine des routes correspondant au chemin courant, de la racine
 * a la feuille. Utile pour construire un fil d'Ariane.
 *
 * @example
 * const crumbs = useMatches().map((match) => match.pathnameBase)
 */
export function useMatches(): readonly RouteMatch[] {
  return useContext(RouteContext).matches
}

/** Valeur acceptee pour remplacer la chaine de requete. */
export type SearchParamsInit =
  | URLSearchParams
  | string
  | Record<string, string>
  | readonly (readonly [string, string])[]

/** Signature du setter retourne par {@link useSearchParams}. */
export type SetSearchParams = (
  next: SearchParamsInit | ((current: URLSearchParams) => SearchParamsInit),
  options?: NavigateOptions,
) => void

/**
 * Lit et met a jour la chaine de requete.
 *
 * L'objet retourne est une `URLSearchParams` reconstruite a chaque changement
 * de `location.search` : le muter n'a aucun effet, il faut passer par le
 * setter.
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

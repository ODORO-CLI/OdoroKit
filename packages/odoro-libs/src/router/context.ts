/**
 * Contextes React du routeur.
 *
 * Ils sont separes volontairement : un composant qui n'a besoin que de
 * `navigate` ne doit pas se re-rendre a chaque changement d'emplacement.
 *
 * @module
 */

import { createContext } from 'react'

import type { RouterHistory } from './history.js'
import type { Location, NavigateOptions, RouteMatch, RouteObject, To } from './types.js'

/** Signature de la fonction de navigation programmatique. */
export interface NavigateFunction {
  /** Navigue vers une cible. */
  (to: To, options?: NavigateOptions): void
  /** Deplace le curseur dans l'historique (`navigate(-1)` pour revenir). */
  (delta: number): void
}

/** Valeur du contexte de navigation, stable pour la duree du `<Router>`. */
export interface NavigationContextValue {
  /** Historique sous-jacent. */
  readonly history: RouterHistory
  /** Fonction de navigation exposee par `useNavigate`. */
  readonly navigate: NavigateFunction
  /**
   * Arbre de routes publie par le `<Routes>` courant. Sert au prechargement
   * des routes paresseuses avant une View Transition.
   *
   * @internal
   */
  readonly routesRef: { current: readonly RouteObject[] | null }
  /** Valeur par defaut de l'option `viewTransition` des navigations. */
  readonly viewTransition: boolean
}

/** Contexte de navigation. `null` hors d'un `<Router>`. */
export const NavigationContext = createContext<NavigationContextValue | null>(null)
NavigationContext.displayName = 'OdoroNavigation'

/** Contexte d'emplacement. `null` hors d'un `<Router>`. */
export const LocationContext = createContext<Location | null>(null)
LocationContext.displayName = 'OdoroLocation'

/** Valeur du contexte de route : la chaine de correspondances et la profondeur. */
export interface RouteContextValue {
  /** Chaine racine -> feuille des routes correspondant au chemin courant. */
  readonly matches: readonly RouteMatch[]
  /** Index, dans `matches`, de la route rendue par le composant courant. */
  readonly depth: number
}

/** Contexte de route, alimente par `<Routes>` puis par chaque `<Outlet />`. */
export const RouteContext = createContext<RouteContextValue>({ matches: [], depth: 0 })
RouteContext.displayName = 'OdoroRoute'

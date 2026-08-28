/**
 * Types partages du routeur.
 *
 * @module
 */

import type { ComponentType, ReactNode } from 'react'

/**
 * Chargeur d'une route paresseuse. Le module doit exporter le composant de
 * page en `default`.
 */
export type RouteLazyLoader = () => Promise<{ default: ComponentType }>

/**
 * Description declarative d'une route.
 *
 * C'est la forme normalisee produite a partir des elements `<Route>` ; elle
 * peut aussi etre fournie directement a {@link matchRoutes} pour des tests ou
 * un rendu serveur.
 */
export interface RouteObject {
  /**
   * Chemin de la route, **relatif a son parent**. Un `/` initial est tolere et
   * ignore : il n'y a pas de chemin absolu dans un arbre imbrique.
   */
  path?: string
  /**
   * Route index : rendue lorsque le chemin du parent est atteint exactement.
   * Une route index ne peut avoir ni `path` ni `children`.
   */
  index?: boolean
  /**
   * Element rendu pour cette route. Une route sans `element` ni `lazy` est un
   * layout transparent : elle rend directement son `<Outlet />`.
   */
  element?: ReactNode
  /**
   * Chargement paresseux du composant de page. Le module n'est demande qu'a la
   * premiere resolution de la route, puis conserve.
   *
   * Prefere `lazy` a un `element` contenant un `React.lazy` construit a la
   * main : le routeur peut precharger le module avant de declencher une View
   * Transition, ce qui evite de capturer le fallback de Suspense.
   */
  lazy?: RouteLazyLoader
  /** Routes filles, rendues a l'emplacement de `<Outlet />`. */
  children?: RouteObject[]
}

/** Parametres extraits de l'URL. */
export type RouteParams = Readonly<Record<string, string | undefined>>

/** Une route de l'arbre confrontee avec succes au pathname courant. */
export interface RouteMatch {
  /** Route concernee. */
  readonly route: RouteObject
  /** Pattern cumule depuis la racine, par exemple `/users/:id`. */
  readonly pattern: string
  /** Portion du pathname consommee jusqu'a cette route incluse. */
  readonly pathname: string
  /**
   * Comme `pathname`, mais sans la portion capturee par un catch-all. C'est la
   * base a utiliser pour resoudre les liens relatifs.
   */
  readonly pathnameBase: string
  /** Parametres accumules depuis la racine. */
  readonly params: RouteParams
}

/** Emplacement courant, equivalent minimal de `window.location`. */
export interface Location {
  /** Chemin, toujours prefixe par `/`. */
  readonly pathname: string
  /** Chaine de requete, prefixee par `?` si non vide. */
  readonly search: string
  /** Fragment, prefixe par `#` si non vide. */
  readonly hash: string
  /** Donnees arbitraires attachees a l'entree d'historique. */
  readonly state: unknown
  /** Cle unique de l'entree d'historique, stable au retour arriere. */
  readonly key: string
}

/** Cible de navigation : une URL relative, ou un delta d'historique. */
export type To = string | Partial<Pick<Location, 'pathname' | 'search' | 'hash'>>

/** Options de navigation programmatique. */
export interface NavigateOptions {
  /** Remplace l'entree courante au lieu d'en empiler une nouvelle. */
  replace?: boolean
  /** Donnees attachees a l'entree d'historique. */
  state?: unknown
  /** Force ou desactive la View Transition pour cette navigation. */
  viewTransition?: boolean
  /** Empeche la restauration/reinitialisation du scroll pour cette navigation. */
  preventScrollReset?: boolean
}

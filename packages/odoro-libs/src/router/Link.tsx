/**
 * Lien de navigation interne.
 *
 * @module
 */

import {
  type AnchorHTMLAttributes,
  type MouseEvent,
  type PointerEvent,
  type ReactElement,
  useCallback,
  useContext,
} from 'react'

import { NavigationContext } from './context.js'
import { useLocation, useNavigate } from './hooks.js'
import { preloadRoutes } from './lazy.js'
import { createPath, resolvePath } from './path.js'
import type { To } from './types.js'

/** Proprietes de {@link Link}. */
export interface LinkProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> {
  /** Cible de navigation, absolue (`/about`) ou relative (`../list`). */
  to: To
  /** Remplace l'entree d'historique courante au lieu d'en empiler une. */
  replace?: boolean
  /** Donnees attachees a l'entree d'historique. */
  state?: unknown
  /** Force ou desactive la View Transition pour ce lien. */
  viewTransition?: boolean
  /** Conserve la position de defilement apres la navigation. */
  preventScrollReset?: boolean
  /**
   * Precharge les modules de la route cible au survol. Sans cout reseau
   * supplementaire pour une route deja chargee.
   *
   * @defaultValue true
   */
  prefetch?: boolean
}

/**
 * Determine si un clic doit etre pris en charge par le routeur plutot que par
 * le navigateur : clic gauche, sans modificateur, sans cible externe.
 */
function isInternalClick(event: MouseEvent<HTMLAnchorElement>, target?: string): boolean {
  return (
    !event.defaultPrevented &&
    event.button === 0 &&
    !event.metaKey &&
    !event.altKey &&
    !event.ctrlKey &&
    !event.shiftKey &&
    (target === undefined || target === '' || target === '_self')
  )
}

/**
 * Lien vers une route de l'application. Rend un `<a>` avec un `href` reel :
 * l'ouverture dans un nouvel onglet, le clic milieu et le survol de la barre
 * d'etat continuent de fonctionner.
 *
 * @example
 * <Link to="/users/42">Profil</Link>
 * <Link to=".." replace>Retour</Link>
 */
export function Link({
  to,
  replace = false,
  state,
  viewTransition,
  preventScrollReset,
  prefetch = true,
  onClick,
  onPointerEnter,
  target,
  ...rest
}: LinkProps): ReactElement {
  const navigate = useNavigate()
  const location = useLocation()
  const navigation = useContext(NavigationContext)
  const href = navigation?.history.createHref(to) ?? '/'

  const handleClick = useCallback(
    (event: MouseEvent<HTMLAnchorElement>) => {
      onClick?.(event)
      if (!isInternalClick(event, target)) return
      event.preventDefault()
      navigate(to, { replace, state, viewTransition, preventScrollReset })
    },
    [navigate, onClick, preventScrollReset, replace, state, target, to, viewTransition],
  )

  const handlePointerEnter = useCallback(
    (event: PointerEvent<HTMLAnchorElement>) => {
      onPointerEnter?.(event)
      if (!prefetch) return
      const routes = navigation?.routesRef.current
      if (!routes) return
      const pathname = resolvePath(
        typeof to === 'string' ? to : createPath(to),
        location.pathname,
      ).pathname
      // Le resultat est volontairement ignore : un echec de prechargement
      // sera simplement retente au moment de la navigation.
      void preloadRoutes(routes, pathname)?.catch(() => undefined)
    },
    [location.pathname, navigation, onPointerEnter, prefetch, to],
  )

  return (
    <a
      {...rest}
      href={href}
      target={target}
      onClick={handleClick}
      onPointerEnter={handlePointerEnter}
    />
  )
}

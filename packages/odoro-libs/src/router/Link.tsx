/**
 * Internal navigation link.
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

/** Props of {@link Link}. */
export interface LinkProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> {
  /** Navigation target, absolute (`/about`) or relative (`../list`). */
  to: To
  /** Replaces the current history entry instead of pushing one. */
  replace?: boolean
  /** Data attached to the history entry. */
  state?: unknown
  /** Forces or disables the View Transition for this link. */
  viewTransition?: boolean
  /** Keeps the scroll position after the navigation. */
  preventScrollReset?: boolean
  /**
   * Preloads the modules of the target route on hover. Without any extra
   * network cost for a route that is already loaded.
   *
   * @defaultValue true
   */
  prefetch?: boolean
}

/**
 * Determines whether a click must be handled by the router rather than by the
 * browser: left click, without modifier, without an external target.
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
 * Link to a route of the application. Renders an `<a>` with a real `href`:
 * opening in a new tab, the middle click and the status bar on hover keep
 * working.
 *
 * @example
 * <Link to="/users/42">Profile</Link>
 * <Link to=".." replace>Back</Link>
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
      // The result is deliberately ignored: a preloading failure will simply
      // be retried at the moment of the navigation.
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

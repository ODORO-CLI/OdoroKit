/**
 * Integration of the View Transitions API.
 *
 * The hard part is not calling `document.startViewTransition`: it is
 * guaranteeing that the DOM really did change **during** the callback. React
 * commits asynchronously by default; a state update started inside the
 * callback would resolve the transition on an unchanged DOM, producing either
 * no animation at all, or a flash.
 *
 * The chosen sequence is therefore:
 * 1. preload the route modules of the target (see `preloadRoutes`), so that no
 *    component suspends during the commit;
 * 2. call `document.startViewTransition`;
 * 3. commit with `flushSync` inside the callback, which forces React to apply
 *    the update synchronously.
 *
 * Any lack of support — browser without the API, `prefers-reduced-motion`
 * active — falls back silently on an ordinary navigation.
 *
 * @module
 */

import { prefersReducedMotion } from '../shared/motionPreference.js'

export { prefersReducedMotion }

/**
 * Tells whether the current document exposes the View Transitions API.
 *
 * @example
 * if (supportsViewTransitions()) { ... }
 */
export function supportsViewTransitions(): boolean {
  return typeof document !== 'undefined' && 'startViewTransition' in document
}

/**
 * Runs `commit` inside a View Transition when possible, and directly
 * otherwise.
 *
 * @param commit DOM update. Must be **synchronous** : it is up to the caller
 *   to use `flushSync` when the update goes through React.
 * @param enabled Allows disabling the transition without duplicating the
 *   condition on the caller side.
 *
 * @example
 * runViewTransition(() => flushSync(() => history.push('/about')), true)
 */
export function runViewTransition(commit: () => void, enabled = true): void {
  if (!enabled || !supportsViewTransitions() || prefersReducedMotion()) {
    commit()
    return
  }

  // `finished` rejects when a transition is interrupted by another one: this
  // is a nominal case during fast navigation, not an application error.
  document.startViewTransition(commit).finished.catch(() => undefined)
}

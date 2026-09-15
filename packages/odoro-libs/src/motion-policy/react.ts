/**
 * The React bridge of the motion policy.
 *
 * It lives apart from the policy module, which depends on nothing: `@odoro-cli/engine`
 * consults the policy without going through React, and a project that animates nothing
 * does not have to load a hook to know a system preference.
 *
 * @module
 */

import { useSyncExternalStore } from 'react'

import { prefersReducedMotion, subscribeMotion } from './index.js'

/**
 * Reactive version of {@link prefersReducedMotion}.
 *
 * The component re-renders if the preference changes during the session — whether the
 * change comes from the system or from a `setReducedMotion`.
 *
 * @example
 * const reduced = usePrefersReducedMotion()
 * return <Reveal disabled={reduced}>...</Reveal>
 */
export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(subscribeMotion, prefersReducedMotion, () => false)
}

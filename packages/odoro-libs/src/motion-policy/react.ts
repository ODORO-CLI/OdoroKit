/**
 * Le pont React de la politique de mouvement.
 *
 * Il vit a part du module de politique, qui ne depend de rien : `@odoro-cli/engine`
 * consulte la politique sans passer par React, et un projet qui n'anime rien
 * n'a pas a charger un hook pour connaitre une preference systeme.
 *
 * @module
 */

import { useSyncExternalStore } from 'react'

import { prefersReducedMotion, subscribeMotion } from './index.js'

/**
 * Version reactive de {@link prefersReducedMotion}.
 *
 * Le composant se re-rend si la preference change en cours de session — que le
 * changement vienne du systeme ou d'un `setReducedMotion`.
 *
 * @example
 * const reduced = usePrefersReducedMotion()
 * return <Reveal disabled={reduced}>…</Reveal>
 */
export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(subscribeMotion, prefersReducedMotion, () => false)
}

/**
 * Preference d'animation reduite.
 *
 * Toute la librairie consulte ce module : aucun composant n'a a se souvenir de
 * tester `prefers-reduced-motion`, et aucune animation ne peut y echapper par
 * oubli.
 *
 * @module
 */

import { useSyncExternalStore } from 'react'

/** Media query interrogee. */
const QUERY = '(prefers-reduced-motion: reduce)'

/** Recupere la MediaQueryList, ou `null` hors navigateur. */
function mediaQuery(): MediaQueryList | null {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function')
    return null
  return window.matchMedia(QUERY)
}

/**
 * Indique si l'utilisateur a demande a reduire les animations.
 *
 * Utilisable hors composant. Retourne `false` cote serveur, ou l'animation
 * n'a de toute facon pas lieu.
 *
 * @example
 * const duration = prefersReducedMotion() ? 0 : 300
 */
export function prefersReducedMotion(): boolean {
  return mediaQuery()?.matches ?? false
}

/** Abonne un ecouteur aux changements de la preference. */
function subscribe(onChange: () => void): () => void {
  const query = mediaQuery()
  if (query === null) return () => undefined
  query.addEventListener('change', onChange)
  return () => query.removeEventListener('change', onChange)
}

/**
 * Version reactive de {@link prefersReducedMotion} : le composant se re-rend
 * si l'utilisateur change son reglage systeme en cours de session.
 *
 * @example
 * const reduced = usePrefersReducedMotion()
 * return <Reveal disabled={reduced}>...</Reveal>
 */
export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, prefersReducedMotion, () => false)
}

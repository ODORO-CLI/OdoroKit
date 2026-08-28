/**
 * Integration de l'API View Transitions.
 *
 * La difficulte n'est pas d'appeler `document.startViewTransition` : c'est de
 * garantir que le DOM a bel et bien change **pendant** le callback. React
 * commite de facon asynchrone par defaut ; une mise a jour d'etat lancee dans
 * le callback resoudrait la transition sur un DOM inchange, produisant soit
 * aucune animation, soit un flash.
 *
 * La sequence retenue est donc :
 * 1. precharger les modules de route de la cible (voir `preloadRoutes`), pour
 *    qu'aucun composant ne suspende pendant le commit ;
 * 2. appeler `document.startViewTransition` ;
 * 3. commiter avec `flushSync` a l'interieur du callback, ce qui force React a
 *    appliquer la mise a jour de maniere synchrone.
 *
 * Toute absence de support — navigateur sans l'API, `prefers-reduced-motion`
 * actif — retombe silencieusement sur une navigation ordinaire.
 *
 * @module
 */

import { prefersReducedMotion } from '../shared/motionPreference.js'

export { prefersReducedMotion }

/**
 * Indique si le document courant expose l'API View Transitions.
 *
 * @example
 * if (supportsViewTransitions()) { ... }
 */
export function supportsViewTransitions(): boolean {
  return typeof document !== 'undefined' && 'startViewTransition' in document
}

/**
 * Execute `commit` a l'interieur d'une View Transition quand c'est possible,
 * et directement sinon.
 *
 * @param commit Mise a jour du DOM. Doit etre **synchrone** : c'est a
 *   l'appelant d'utiliser `flushSync` si la mise a jour passe par React.
 * @param enabled Permet de desactiver la transition sans dupliquer la
 *   condition cote appelant.
 *
 * @example
 * runViewTransition(() => flushSync(() => history.push('/about')), true)
 */
export function runViewTransition(commit: () => void, enabled = true): void {
  if (!enabled || !supportsViewTransitions() || prefersReducedMotion()) {
    commit()
    return
  }

  // `finished` rejette lorsqu'une transition est interrompue par une autre :
  // c'est un cas nominal en navigation rapide, pas une erreur applicative.
  document.startViewTransition(commit).finished.catch(() => undefined)
}

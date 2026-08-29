/**
 * Le point d'abonnement aux changements de route.
 *
 * ## Pourquoi le router expose un evenement plutot qu'une integration
 *
 * `@odoro-cli/engine` doit detruire les declencheurs de defilement de la page qui
 * part, et rafraichir les positions **apres** que la nouvelle page a rendu.
 * Sans cela, les declencheurs gardent les positions de l'ancienne page : les
 * animations liees au defilement se declenchent trop tot ou trop tard, et le
 * defaut disparait au rechargement — ce qui le rend presque impossible a
 * attribuer a la navigation.
 *
 * Le router ne connait pas le moteur, et ne doit pas le connaitre. Il annonce
 * seulement qu'une navigation a lieu, avant et apres. Le branchement se fait
 * de l'autre cote.
 *
 * ## Pourquoi deux moments et pas un
 *
 * `before` arrive pendant que l'ancienne page est encore montee : c'est le
 * seul instant ou l'on peut liberer ce qui lui appartient. `after` arrive une
 * fois la nouvelle page rendue : c'est le seul instant ou mesurer a un sens.
 *
 * Un evenement unique obligerait l'abonne a deviner dans quel etat se trouve
 * le document, et il devinerait mal.
 *
 * ## Ce que `after` ne garantit pas
 *
 * Il est emis apres le rendu, pas apres le chargement des images et des
 * polices. Une image qui arrive ensuite deplace la mise en page et invalide
 * les positions mesurees. C'est a l'abonne d'attendre ce qu'il doit attendre —
 * `@odoro-cli/engine` le fait dans `onRouteChange`, et c'est pour cela que cette
 * fonction existe de son cote plutot qu'ici.
 *
 * @module
 */

/** Le moment d'une navigation. */
export type NavigationPhase =
  /** L'ancienne page est encore montee. */
  | 'before'
  /** La nouvelle page a rendu. */
  | 'after'

/** Ce qu'un abonne recoit. */
export interface NavigationEvent {
  readonly phase: NavigationPhase
  /** Chemin quitte. Vaut le chemin courant au tout premier rendu. */
  readonly from: string
  /** Chemin atteint. */
  readonly to: string
}

/** Un abonne. */
export type NavigationListener = (event: NavigationEvent) => void

const listeners = new Set<NavigationListener>()

/**
 * Abonne un ecouteur aux changements de route.
 *
 * @returns De quoi se desabonner.
 *
 * @example
 * // Cote moteur, au montage du fournisseur :
 * const off = onNavigation((event) => {
 *   if (event.phase === 'before') killScrollTriggers()
 *   else void onRouteChange()
 * })
 */
export function onNavigation(listener: NavigationListener): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

/**
 * Emet un evenement de navigation.
 *
 * Appele par le router. Un abonne qui echoue ne doit pas empecher les autres
 * d'etre prevenus, ni interrompre la navigation : l'erreur est signalee et le
 * parcours continue.
 */
export function emitNavigation(event: NavigationEvent): void {
  for (const listener of listeners) {
    try {
      listener(event)
    } catch (cause) {
      console.error('[odoro] un abonne a la navigation a echoue', cause)
    }
  }
}

/** Vide les abonnements. Reserve aux tests. */
export function resetNavigationListeners(): void {
  listeners.clear()
}

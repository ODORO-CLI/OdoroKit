/**
 * `onReady` : niveau 5 du contrat, l'echappatoire.
 *
 * ## Ce qu'elle donne
 *
 * L'objet imperatif que le composant a construit — une timeline, une scene,
 * une surface — au moment ou il devient utilisable, et pas avant. Ce qui suit
 * n'a plus besoin de passer par une propriete : on tient la chose elle-meme.
 *
 * ## Le piege qu'elle evite
 *
 * Une echappatoire ecrite naivement se declenche a chaque rendu du parent.
 * L'appelant ecrit presque toujours une fonction en ligne :
 *
 * ```tsx
 * <Molten onReady={({ handle }) => handle.timeScale(0.5)} />
 * ```
 *
 * Cette fonction est **une nouvelle valeur a chaque rendu**. Un effet qui
 * l'aurait dans ses dependances rejouerait l'echappatoire des que le parent
 * se rerend — pour une raison sans rapport, comme un survol ailleurs dans la
 * page. Selon ce que fait le rappel, cela va du gaspillage a la fuite : un
 * abonnement pose a chaque rendu et libere une seule fois.
 *
 * La fonction est donc gardee dans une reference, et l'effet ne depend que de
 * ce qui compte reellement : l'objet, et l'element. On ne demande pas a
 * l'appelant de memoriser son rappel — il l'oublierait, et le defaut serait
 * invisible jusqu'au profil memoire.
 *
 * @module
 */

import { useEffect, useRef } from 'react'

import { motionPolicy, type MotionState } from '../core/motion-policy.js'

/** Ce que l'echappatoire recoit. */
export interface ReadyContext<Handle> {
  /** L'objet imperatif construit par le composant. */
  readonly handle: Handle
  /** L'element racine, deja dans le document. */
  readonly element: HTMLElement
  /**
   * Etat du mouvement au moment de l'appel. Un rappel qui ajoute une animation
   * doit le consulter : l'echappatoire contourne l'API du composant, pas la
   * preference de l'utilisateur.
   */
  readonly motion: MotionState
}

/**
 * Rappel d'echappatoire.
 *
 * Ce qu'il rend, s'il rend quelque chose, est appele au demontage — ou avant
 * de rejouer le rappel. Une echappatoire qui pose un abonnement sans pouvoir
 * le retirer serait une fuite offerte par l'API elle-meme.
 */
export type ReadyCallback<Handle> = (context: ReadyContext<Handle>) => void | (() => void)

/**
 * Declenche l'echappatoire une fois l'objet pret.
 *
 * @param callback Rappel fourni par l'appelant. Peut etre une fonction en
 * ligne : sa reidentite n'a aucun effet.
 * @param handle Objet imperatif, ou `null` tant qu'il n'existe pas.
 * @param element Element racine, ou `null` tant qu'il n'est pas monte.
 *
 * @example
 * const timeline = useTimeline(…)
 * useOnReady(onReady, timeline.instance, host.current)
 */
export function useOnReady<Handle>(
  callback: ReadyCallback<Handle> | undefined,
  handle: Handle | null | undefined,
  element: HTMLElement | null | undefined,
): void {
  const latest = useRef(callback)
  latest.current = callback

  useEffect(() => {
    const run = latest.current
    if (run === undefined) return
    if (handle === null || handle === undefined) return
    if (element === null || element === undefined) return

    return run({ handle, element, motion: motionPolicy.state })
    // La fonction est volontairement absente des dependances : elle est lue
    // dans la reference, ce que l'analyse des dependances reconnait. Voir
    // l'explication en tete de module.
  }, [handle, element])
}

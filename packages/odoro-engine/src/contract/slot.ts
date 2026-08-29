/**
 * Le slot de rendu : niveau 4 du contrat.
 *
 * ## Ce qu'un slot separe
 *
 * Un composant du registre fait deux choses tres differentes : il **calcule**
 * — mesures, abonnements a la boucle, progression, cycle de vie — et il
 * **affiche**. La premiere partie est ce qu'on vient chercher ; la seconde est
 * presque toujours a refaire, parce qu'un balisage convient rarement a deux
 * maquettes.
 *
 * Le slot rend la seconde partie remplacable sans toucher a la premiere. Sans
 * lui, il ne reste qu'a copier le composant entier pour changer une balise —
 * et l'on herite alors de la maintenance de tout le calcul.
 *
 * ## Pourquoi une fonction plutot que `children`
 *
 * Le slot recoit ce que le composant a calcule. Des `children` ordinaires
 * seraient rendus une fois, en dehors de ce contexte, et n'auraient acces a
 * rien. La fonction est ce qui transporte l'etat vers le balisage.
 *
 * @module
 */

import type { ReactNode } from 'react'

/**
 * Un slot de rendu : recoit l'etat calcule, rend le balisage.
 *
 * @typeParam Args Ce que le composant transmet a son slot.
 */
export type Slot<Args> = (args: Args) => ReactNode

/**
 * Rend le slot s'il est fourni, le balisage par defaut sinon.
 *
 * Le defaut est une **fonction**, pas une valeur : le calculer a chaque rendu
 * pour le jeter aussitot quand un slot est fourni serait du travail perdu, et
 * ce travail contient souvent des elements React entiers.
 *
 * @example
 * return (
 *   <div ref={ref}>
 *     {fromSlot(children, { progress, ready }, () => (
 *       <span style={{ width: `${progress * 100}%` }} />
 *     ))}
 *   </div>
 * )
 */
export function fromSlot<Args>(
  slot: Slot<Args> | undefined,
  args: Args,
  fallback: () => ReactNode,
): ReactNode {
  return slot === undefined ? fallback() : slot(args)
}

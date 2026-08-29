/**
 * Preference d'animation reduite.
 *
 * ## Ce module n'est plus qu'une redirection
 *
 * La decision a ete extraite dans `@odoro/libs/motion-policy`, pour qu'un seul
 * endroit reponde a la question « faut-il animer ? », quel que soit le systeme
 * qui anime — la librairie, ou le moteur quand il est present.
 *
 * Ce fichier reste parce que toute la librairie l'importe : le supprimer
 * ferait un diff de vingt fichiers pour un deplacement de deux fonctions.
 *
 * @module
 */

export { prefersReducedMotion } from '../motion-policy/index.js'
export { usePrefersReducedMotion } from '../motion-policy/react.js'

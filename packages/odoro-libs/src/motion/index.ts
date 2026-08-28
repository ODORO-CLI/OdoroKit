/**
 * Moteur d'animation d'Odoro.
 *
 * ## Principe
 *
 * L'interpolation est confiee au moteur d'animation du navigateur
 * (`Element.animate`), qui s'execute sur le fil de composition. Aucune boucle
 * `requestAnimationFrame` n'est ouverte en JavaScript : une animation en cours
 * ne ralentit pas si le fil principal est occupe, et ne consomme rien quand
 * l'onglet est masque.
 *
 * ## Ressorts physiques
 *
 * Cette version n'implemente **que des courbes de Bezier**, issues des design
 * tokens. Un ressort physique ne s'exprime pas comme une courbe de Bezier : il
 * faudrait echantillonner la solution de l'oscillateur amorti en une centaine
 * d'etapes, ou revenir a une boucle JavaScript — ce qui annulerait le benefice
 * de l'approche. Les deux voies restent ouvertes pour une version ulterieure ;
 * l'echantillonnage se brancherait derriere un `easing: 'spring(...)'` sans
 * changer l'API publique.
 *
 * ## Animations reduites
 *
 * `prefers-reduced-motion` est consulte par tous les composants et hooks du
 * module. L'animation est neutralisee, jamais l'etat final : un contenu revele
 * reste visible, un element sortant est bien demonte.
 *
 * @example
 * import { Reveal, Stagger, useAnimate, usePresence } from 'odoro-libs/motion'
 *
 * @module
 */

export { Animate, type AnimateProps } from './Animate.jsx'
export { Reveal, type RevealProps, type RevealTiming } from './Reveal.jsx'
export { Stagger, type StaggerProps } from './Stagger.jsx'

export { useAnimate, type AnimateControls, type MotionOptions } from './useAnimate.js'
export {
  usePresence,
  type Presence,
  type PresenceOptions,
  type PresenceStatus,
} from './usePresence.js'

export {
  REVEAL_FROM,
  VISIBLE,
  applyStyles,
  clearStyles,
  type MotionKeyframe,
} from './keyframes.js'

export {
  motionDuration,
  motionEasing,
  resolveDuration,
  resolveEasing,
  type DurationInput,
  type EasingInput,
  type MotionDuration,
  type MotionEasing,
} from './tokens.js'

export {
  prefersReducedMotion,
  usePrefersReducedMotion,
} from '../shared/motionPreference.js'

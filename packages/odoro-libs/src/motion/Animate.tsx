/**
 * Animation declarative d'un element.
 *
 * @module
 */

import {
  type ComponentPropsWithoutRef,
  type ElementType,
  type ReactElement,
  type ReactNode,
  createElement,
  useEffect,
} from 'react'

import { type MotionKeyframe, VISIBLE } from './keyframes.js'
import { type DurationInput, type EasingInput } from './tokens.js'
import { useAnimate } from './useAnimate.js'

/** Proprietes de {@link Animate}. */
export interface AnimateProps extends ComponentPropsWithoutRef<'div'> {
  /** Element rendu. @defaultValue 'div' */
  as?: ElementType
  /** Contenu anime. */
  children?: ReactNode
  /**
   * Etapes de l'animation. Prioritaire sur `from` / `to` lorsque les deux sont
   * fournis.
   */
  keyframes?: Keyframe[]
  /** Etat de depart, si `keyframes` n'est pas fourni. */
  from?: MotionKeyframe
  /** Etat d'arrivee, si `keyframes` n'est pas fourni. @defaultValue etat naturel */
  to?: MotionKeyframe
  /** Duree : nom de token ou millisecondes. @defaultValue 'base' */
  duration?: DurationInput
  /** Courbe : nom de token ou valeur CSS. @defaultValue 'standard' */
  easing?: EasingInput
  /** Retard avant demarrage, en millisecondes. @defaultValue 0 */
  delay?: number
  /** Nombre de repetitions. @defaultValue 1 */
  iterations?: number
  /**
   * Rejoue l'animation a chaque changement de cette valeur. Laisser
   * `undefined` ne la joue qu'au montage.
   */
  trigger?: unknown
  /** Suspend le declenchement. @defaultValue true */
  play?: boolean
}

/**
 * Joue une animation au montage, puis a chaque changement de `trigger`.
 *
 * C'est l'equivalent declaratif de {@link useAnimate}, pour les cas ou aucun
 * controle imperatif n'est necessaire. La neutralisation sous
 * `prefers-reduced-motion` est heritee du hook.
 *
 * @example
 * <Animate from={{ opacity: 0 }} duration="slow" trigger={page}>
 *   <Article />
 * </Animate>
 */
export function Animate({
  as = 'div',
  children,
  keyframes,
  from,
  to = VISIBLE,
  duration = 'base',
  easing = 'standard',
  delay = 0,
  iterations = 1,
  trigger,
  play = true,
  ...rest
}: AnimateProps): ReactElement {
  const [ref, controls] = useAnimate<HTMLElement>()

  useEffect(() => {
    if (!play) return
    const steps = keyframes ?? (from === undefined ? null : [{ ...from }, { ...to }])
    if (steps === null) return
    void controls.play(steps, { duration, easing, delay, iterations })
    // `keyframes`, `from` et `to` sont des litteraux cote appelant : les
    // comparer par identite rejouerait l'animation a chaque rendu. C'est
    // `trigger` qui commande les rejeux.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [controls, play, trigger, duration, easing, delay, iterations])

  return createElement(as, { ...rest, ref }, children)
}

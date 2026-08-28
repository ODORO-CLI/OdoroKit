/**
 * Pilotage imperatif d'une animation.
 *
 * Couche mince au-dessus de `Element.animate()` : c'est le navigateur qui
 * interpole, sur son propre fil de composition. Aucune boucle
 * `requestAnimationFrame` n'est ouverte cote JavaScript, ce qui rend les
 * animations insensibles a la charge du fil principal.
 *
 * @module
 */

import { type RefObject, useCallback, useEffect, useMemo, useRef } from 'react'

import { usePrefersReducedMotion } from '../shared/motionPreference.js'
import {
  type DurationInput,
  type EasingInput,
  resolveDuration,
  resolveEasing,
} from './tokens.js'

/** Options d'animation, exprimees avec les tokens d'Odoro. */
export interface MotionOptions extends Omit<
  KeyframeAnimationOptions,
  'duration' | 'easing' | 'delay' | 'endDelay'
> {
  /** Duree : nom de token ou millisecondes. */
  duration?: DurationInput
  /** Courbe : nom de token ou valeur CSS. */
  easing?: EasingInput
  /** Retard avant demarrage, en millisecondes. */
  delay?: number
  /** Retard apres la fin, en millisecondes. */
  endDelay?: number
}

/** Controles retournes par {@link useAnimate}. */
export interface AnimateControls {
  /**
   * Lance une animation sur l'element reference.
   *
   * @returns Une promesse resolue a la fin de l'animation. Elle se resout
   *   aussi — immediatement — si l'animation est annulee : un appelant n'a
   *   jamais a gerer de rejet.
   */
  play(
    keyframes: Keyframe[] | PropertyIndexedKeyframes,
    options?: MotionOptions,
  ): Promise<void>
  /** Interrompt l'animation en cours et revient a l'etat initial. */
  cancel(): void
  /** Saute a l'etat final. */
  finish(): void
  /** Suspend l'animation en cours. */
  pause(): void
  /** Reprend une animation suspendue. */
  resume(): void
  /** Animation en cours, ou `null`. */
  readonly animation: Animation | null
}

/**
 * Retourne une ref a poser sur un element, et des controles pour l'animer.
 *
 * Sous `prefers-reduced-motion`, la duree est ramenee a zero : l'animation est
 * neutralisee mais **l'etat final est bien applique**. Une revelation ne doit
 * jamais laisser un contenu invisible.
 *
 * @example
 * const [ref, controls] = useAnimate<HTMLDivElement>()
 *
 * return (
 *   <div ref={ref} onClick={() => void controls.play(
 *     [{ transform: 'scale(1)' }, { transform: 'scale(1.1)' }, { transform: 'scale(1)' }],
 *     { duration: 'fast', easing: 'emphasized' },
 *   )} />
 * )
 */
export function useAnimate<T extends Element = HTMLElement>(): [
  RefObject<T | null>,
  AnimateControls,
] {
  const ref = useRef<T | null>(null)
  const animationRef = useRef<Animation | null>(null)
  const reduced = usePrefersReducedMotion()
  const reducedRef = useRef(reduced)
  reducedRef.current = reduced

  const play = useCallback<AnimateControls['play']>((keyframes, options) => {
    const element = ref.current
    if (element === null || typeof element.animate !== 'function')
      return Promise.resolve()

    animationRef.current?.cancel()

    const { duration = 'base', easing = 'standard', ...rest } = options ?? {}
    const animation = element.animate(keyframes, {
      ...rest,
      duration: reducedRef.current ? 0 : resolveDuration(duration),
      easing: resolveEasing(easing),
      // Sans cela, l'element revient a son style calcule des la fin de
      // l'animation : ce n'est presque jamais ce que l'on veut.
      fill: rest.fill ?? 'both',
    })

    animationRef.current = animation

    return animation.finished.then(
      () => undefined,
      // `finished` rejette sur `cancel()`, cas nominal et non une erreur.
      () => undefined,
    )
  }, [])

  const controls = useMemo<AnimateControls>(
    () => ({
      play,
      cancel: () => animationRef.current?.cancel(),
      finish: () => animationRef.current?.finish(),
      pause: () => animationRef.current?.pause(),
      resume: () => animationRef.current?.play(),
      get animation() {
        return animationRef.current
      },
    }),
    [play],
  )

  useEffect(
    () => () => {
      animationRef.current?.cancel()
      animationRef.current = null
    },
    [],
  )

  return [ref, controls]
}

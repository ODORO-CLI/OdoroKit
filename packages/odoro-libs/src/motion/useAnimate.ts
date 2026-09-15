/**
 * Imperative control of an animation.
 *
 * Thin layer on top of `Element.animate()`: the browser is the one that
 * interpolates, on its own compositor thread. No
 * `requestAnimationFrame` loop is opened on the JavaScript side, which makes
 * animations insensitive to the load of the main thread.
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

/** Animation options, expressed with the Odoro tokens. */
export interface MotionOptions extends Omit<
  KeyframeAnimationOptions,
  'duration' | 'easing' | 'delay' | 'endDelay'
> {
  /** Duration: token name or milliseconds. */
  duration?: DurationInput
  /** Curve: token name or CSS value. */
  easing?: EasingInput
  /** Delay before start, in milliseconds. */
  delay?: number
  /** Delay after the end, in milliseconds. */
  endDelay?: number
}

/** Controls returned by {@link useAnimate}. */
export interface AnimateControls {
  /**
   * Starts an animation on the referenced element.
   *
   * @returns A promise resolved at the end of the animation. It also resolves
   *   — immediately — if the animation is cancelled: a caller never
   *   has to handle a rejection.
   */
  play(
    keyframes: Keyframe[] | PropertyIndexedKeyframes,
    options?: MotionOptions,
  ): Promise<void>
  /** Interrupts the running animation and returns to the initial state. */
  cancel(): void
  /** Jumps to the final state. */
  finish(): void
  /** Suspends the running animation. */
  pause(): void
  /** Resumes a suspended animation. */
  resume(): void
  /** Running animation, or `null`. */
  readonly animation: Animation | null
}

/**
 * Returns a ref to place on an element, and controls to animate it.
 *
 * Under `prefers-reduced-motion`, the duration is brought down to zero: the animation is
 * neutralized but **the final state is indeed applied**. A reveal must
 * never leave content invisible.
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
      // Without this, the element goes back to its computed style as soon as the
      // animation ends: that is almost never what one wants.
      fill: rest.fill ?? 'both',
    })

    animationRef.current = animation

    return animation.finished.then(
      () => undefined,
      // `finished` rejects on `cancel()`, a nominal case and not an error.
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

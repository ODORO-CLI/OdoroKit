/**
 * Declarative animation of an element.
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
import { type MotionPresetName, getMotionPreset } from './presets.js'
import { type DurationInput, type EasingInput } from './tokens.js'
import { useAnimate } from './useAnimate.js'

/** Properties of {@link Animate}. */
export interface AnimateProps extends ComponentPropsWithoutRef<'div'> {
  /** Rendered element. @defaultValue 'div' */
  as?: ElementType
  /** Animated content. */
  children?: ReactNode
  /**
   * Preset played. `keyframes`, `from` and `to` stay prioritary; `duration`
   * and `easing`, when provided, override those of the preset.
   */
  preset?: MotionPresetName
  /**
   * Steps of the animation. Prioritary over `from` / `to` when both are
   * provided.
   */
  keyframes?: Keyframe[]
  /** Starting state, if `keyframes` is not provided. */
  from?: MotionKeyframe
  /** End state, if `keyframes` is not provided. @defaultValue natural state */
  to?: MotionKeyframe
  /** Duration: token name or milliseconds. @defaultValue that of the preset, otherwise 'base' */
  duration?: DurationInput
  /** Curve: token name or CSS value. @defaultValue that of the preset, otherwise 'standard' */
  easing?: EasingInput
  /** Delay before start, in milliseconds. @defaultValue 0 */
  delay?: number
  /** Number of repetitions. @defaultValue 1 */
  iterations?: number
  /**
   * Replays the animation on every change of this value. Leaving it
   * `undefined` plays it only on mount.
   */
  trigger?: unknown
  /** Suspends the triggering. @defaultValue true */
  play?: boolean
}

/**
 * Plays an animation on mount, then on every change of `trigger`.
 *
 * This is the declarative equivalent of {@link useAnimate}, for the cases where no
 * imperative control is needed. The neutralization under
 * `prefers-reduced-motion` is inherited from the hook.
 *
 * @example
 * <Animate preset="tada" trigger={errorCount} />
 * <Animate from={{ opacity: 0 }} duration="slow" trigger={page}>
 *   <Article />
 * </Animate>
 */
export function Animate({
  as = 'div',
  children,
  preset,
  keyframes,
  from,
  to = VISIBLE,
  duration,
  easing,
  delay = 0,
  iterations = 1,
  trigger,
  play = true,
  ...rest
}: AnimateProps): ReactElement {
  const [ref, controls] = useAnimate<HTMLElement>()

  useEffect(() => {
    if (!play) return
    const resolved = preset === undefined ? undefined : getMotionPreset(preset)
    const steps =
      keyframes ??
      (from === undefined
        ? resolved === undefined
          ? null
          : [...resolved.keyframes]
        : [{ ...from }, { ...to }])
    if (steps === null) return
    void controls.play(steps, {
      duration: duration ?? resolved?.duration ?? 'base',
      easing: easing ?? resolved?.easing ?? 'standard',
      delay,
      iterations,
    })
    // `keyframes`, `from` and `to` are literals on the caller side: comparing
    // them by identity would replay the animation on every render. It is
    // `trigger` that commands the replays.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [controls, play, trigger, preset, duration, easing, delay, iterations])

  return createElement(as, { ...rest, ref }, children)
}

/**
 * Reveal of an element on its entry into the viewport.
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
  useLayoutEffect,
  useRef,
} from 'react'

import { usePrefersReducedMotion } from '../shared/motionPreference.js'
import {
  type MotionKeyframe,
  REVEAL_FROM,
  VISIBLE,
  applyStyles,
  clearStyles,
} from './keyframes.js'
import { type RevealPresetName, revealPresets } from './presets.js'
import {
  type DurationInput,
  type EasingInput,
  resolveDuration,
  resolveEasing,
} from './tokens.js'

/** Properties common to the entrance animation components. */
export interface RevealTiming {
  /** Duration: token name or milliseconds. @defaultValue 'slow' */
  duration?: DurationInput
  /** Curve: token name or CSS value. @defaultValue 'entrance' */
  easing?: EasingInput
  /** Delay before start, in milliseconds. @defaultValue 0 */
  delay?: number
  /** Starting state. @defaultValue zero opacity and vertical offset */
  from?: MotionKeyframe
  /** End state. @defaultValue natural state of the element */
  to?: MotionKeyframe
}

/** Properties of {@link Reveal}. */
export interface RevealProps extends RevealTiming, ComponentPropsWithoutRef<'div'> {
  /** Rendered element. @defaultValue 'div' */
  as?: ElementType
  /** Revealed content. */
  children?: ReactNode
  /**
   * Named starting state, chosen from {@link revealPresets}. An explicit
   * `from` stays prioritary.
   */
  preset?: RevealPresetName
  /**
   * Proportion of the element that must be visible to trigger.
   * @defaultValue 0.15
   */
  threshold?: number
  /** Margin applied to the observation viewport. @defaultValue '0px' */
  rootMargin?: string
  /** Plays the animation only once. @defaultValue true */
  once?: boolean
  /** Disables the animation: the content is rendered as is. */
  disabled?: boolean
}

/**
 * Animates an element when it enters the viewport.
 *
 * Server rendering — and rendering without JavaScript — produces the **final** state:
 * the starting state is applied only in the layout layer, just before the
 * first paint. Content can therefore never stay invisible because
 * a script has failed.
 *
 * Under `prefers-reduced-motion`, the animation is entirely neutralized and the
 * content stays visible.
 *
 * @example
 * <Reveal duration="slow" delay={100}>
 *   <h2>Title revealed on scroll</h2>
 * </Reveal>
 */
export function Reveal({
  as = 'div',
  children,
  preset,
  duration = 'slow',
  easing = 'entrance',
  delay = 0,
  from = preset === undefined ? REVEAL_FROM : revealPresets[preset],
  to = VISIBLE,
  threshold = 0.15,
  rootMargin = '0px',
  once = true,
  disabled = false,
  ...rest
}: RevealProps): ReactElement {
  const ref = useRef<HTMLElement | null>(null)
  const reduced = usePrefersReducedMotion()
  const inactive = disabled || reduced

  // Layout layer: the starting state is set before the first paint, so
  // without flicker, but after the server rendering, which stays final.
  useLayoutEffect(() => {
    const element = ref.current
    if (element === null || inactive) return
    applyStyles(element, from)
    return () => clearStyles(element, from)
    // `from` is a literal on the caller side: comparing it by identity
    // would restart the effect on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inactive])

  useEffect(() => {
    const element = ref.current
    if (element === null || inactive) return
    if (typeof IntersectionObserver === 'undefined') {
      clearStyles(element, from)
      return
    }

    let animation: Animation | null = null

    const reveal = (): void => {
      animation?.cancel()
      animation = element.animate([{ ...from }, { ...to }], {
        duration: resolveDuration(duration),
        easing: resolveEasing(easing),
        delay,
        fill: 'both',
      })
      void animation.finished.then(
        () => {
          // The end state is the natural state of the element: we remove the
          // inline starting style and the animation, rather than letting a
          // frozen animation hold a composition layer.
          clearStyles(element, from)
          animation?.cancel()
          animation = null
        },
        () => undefined,
      )
    }

    const hide = (): void => {
      animation?.cancel()
      animation = null
      applyStyles(element, from)
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            reveal()
            if (once) observer.disconnect()
          } else if (!once) {
            hide()
          }
        }
      },
      { threshold, rootMargin },
    )

    observer.observe(element)

    return () => {
      observer.disconnect()
      animation?.cancel()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inactive, once, threshold, rootMargin, delay, duration, easing])

  return createElement(as, { ...rest, ref }, children)
}

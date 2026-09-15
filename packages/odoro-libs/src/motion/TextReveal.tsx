/**
 * Reveal of a text word by word or letter by letter.
 *
 * @module
 */

import {
  type ComponentPropsWithoutRef,
  type ElementType,
  type ReactElement,
  createElement,
  useEffect,
  useMemo,
  useRef,
} from 'react'

import { usePrefersReducedMotion } from '../shared/motionPreference.js'
import { type MotionKeyframe, applyStyles, clearStyles } from './keyframes.js'
import {
  type DurationInput,
  type EasingInput,
  resolveDuration,
  resolveEasing,
} from './tokens.js'

/** Properties of {@link TextReveal}. */
export interface TextRevealProps extends Omit<
  ComponentPropsWithoutRef<'span'>,
  'children'
> {
  /** Rendered container element. @defaultValue 'span' */
  as?: ElementType
  /** Revealed text. A string, not a tree: the splitting requires it. */
  children: string
  /** Splitting unit. @defaultValue 'word' */
  by?: 'word' | 'char'
  /** Gap between two units, in milliseconds. @defaultValue 40 */
  step?: number
  /** Delay before the first unit, in milliseconds. @defaultValue 0 */
  delay?: number
  /** Duration of each unit: token name or milliseconds. @defaultValue 'slow' */
  duration?: DurationInput
  /** Curve. @defaultValue 'entrance' */
  easing?: EasingInput
  /** Starting state of each unit. @defaultValue zero opacity and upward shift */
  from?: MotionKeyframe
  /** Visible proportion triggering the reveal. @defaultValue 0.3 */
  threshold?: number
  /** Plays the animation only once. @defaultValue true */
  once?: boolean
}

const DEFAULT_FROM: MotionKeyframe = { opacity: 0, transform: 'translateY(0.4em)' }

/** Splits a text into units, preserving the original spaces. */
function split(text: string, by: 'word' | 'char'): string[] {
  if (by === 'word') return text.split(/(\s+)/).filter((part) => part !== '')
  return [...text]
}

/**
 * Reveals a text in waves, word by word or letter by letter.
 *
 * Each unit is rendered in an inline-block `span` and animated with an
 * increasing delay when the text enters the viewport. Screen readers
 * receive the whole text in one block: the visual splitting is hidden by
 * `aria-hidden`, the complete text stays present for accessibility.
 *
 * Under `prefers-reduced-motion`, the text is rendered as is, without splitting.
 *
 * @example
 * <h1 className="o-text-5xl o-font-bold">
 *   <TextReveal by="word" step={60}>Build living interfaces</TextReveal>
 * </h1>
 */
export function TextReveal({
  as = 'span',
  children,
  by = 'word',
  step = 40,
  delay = 0,
  duration = 'slow',
  easing = 'entrance',
  from = DEFAULT_FROM,
  threshold = 0.3,
  once = true,
  ...rest
}: TextRevealProps): ReactElement {
  const ref = useRef<HTMLElement | null>(null)
  const reduced = usePrefersReducedMotion()
  const parts = useMemo(() => split(children, by), [children, by])

  useEffect(() => {
    const container = ref.current
    if (container === null || reduced) return

    const targets = Array.from(
      container.querySelectorAll<HTMLElement>('[data-o-text-part]'),
    )
    if (targets.length === 0) return

    for (const target of targets) applyStyles(target, from)

    const show = (): void => {
      for (const target of targets) clearStyles(target, from)
    }

    if (typeof IntersectionObserver === 'undefined') {
      show()
      return
    }

    const animations: Animation[] = []

    const reveal = (): void => {
      let index = 0
      for (const target of targets) {
        const animation = target.animate(
          [{ ...from }, { opacity: 1, transform: 'none', filter: 'none' }],
          {
            duration: resolveDuration(duration),
            easing: resolveEasing(easing),
            delay: delay + index * step,
            fill: 'both',
          },
        )
        animations.push(animation)
        index += 1
      }
      // Once the wave is over, the natural state is released: no
      // frozen animation holds a composition layer.
      void Promise.allSettled(animations.map((animation) => animation.finished)).then(
        () => {
          show()
          for (const animation of animations) animation.cancel()
          animations.length = 0
        },
      )
    }

    const hide = (): void => {
      for (const animation of animations) animation.cancel()
      animations.length = 0
      for (const target of targets) applyStyles(target, from)
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
      { threshold },
    )

    observer.observe(container)

    return () => {
      observer.disconnect()
      for (const animation of animations) animation.cancel()
      show()
    }
    // `from` is a literal on the caller side: comparing it by identity
    // would restart the effect on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced, parts, by, step, delay, duration, easing, threshold, once])

  if (reduced) {
    return createElement(as, { ...rest, ref }, children)
  }

  return createElement(
    as,
    { ...rest, ref },
    <>
      <span className="o-sr-only">{children}</span>
      <span aria-hidden="true">
        {parts.map((part, index) =>
          /^\s+$/.test(part) ? (
            part
          ) : (
            <span
              key={index}
              data-o-text-part=""
              className="o-inline-block o-whitespace-pre"
            >
              {part}
            </span>
          ),
        )}
      </span>
    </>,
  )
}

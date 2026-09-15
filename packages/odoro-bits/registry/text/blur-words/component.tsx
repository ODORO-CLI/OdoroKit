/**
 * Clearing up: the block is blurred, and its words become crisp again one by
 * one, in a random order, until everything reads.
 *
 * ## What this component does that `blur-reveal` does not
 *
 * `blur-reveal` goes from blurred to crisp in reading order, once, on entering
 * the viewport: it is an arrival. Here the order is drawn at random and the
 * cycle plays again, so that one never guesses which word will come out of the
 * blur. The effect does not tell of a text arriving, it tells of a text one is
 * trying to decipher.
 *
 * ## A whole cycle fits into a single animation per word
 *
 * The order of the draw is not played by a series of timers: it is baked into
 * the keyframes. Each word is given an animation lasting the whole cycle,
 * whose instants are computed from its rank in the draw — blurred until its
 * turn, crisp afterwards, and the return to blur for everybody at the end.
 *
 * The cycle then repeats on its own, without a line of JavaScript while it
 * runs, and the compositor holds the opacities and the blurs. The draw is made
 * once at the start: replaying it on every turn would require rebuilding every
 * animation, and the cost of the randomness would far exceed what it brings.
 *
 * ## Every animation starts at the same instant
 *
 * Their start time is set by hand to the same timeline value. Without that,
 * two words created in the same frame can begin at different instants, and the
 * draw drifts from one cycle to the next.
 *
 * ## The blur is only applied if the clearing will happen
 *
 * The trap of every reveal: hide in CSS, show in JavaScript. The starting blur
 * is carried by the first keyframe of the animation itself — without it, the
 * text is simply there, crisp.
 *
 * ## The split is a display device
 *
 * The complete text appears once, in one piece; the words are removed from the
 * accessibility tree. The spaces stay spaces, outside the inline blocks: that
 * is what lets the paragraph wrap.
 *
 * ## Reduced motion
 *
 * No split, no blur: the text is rendered as it is. It is the state where
 * everything reads, and that is indeed the end of every cycle.
 *
 * @module
 */

import { mergePresentation, useMotionState, type Customisable } from '@odoro-cli/engine'
import { useEffect, type ElementType, type ReactElement } from 'react'

import { useInView } from '@registre/hooks/useInView'

/** Properties specific to the component. */
export interface BlurWordsOwnProps {
  /** Text to clear up. A string: it is split into words. */
  children: string
  /** Rendered tag. @defaultValue 'p' */
  as?: ElementType
  /** Blur of a word not yet cleared, in pixels. @defaultValue 6 */
  blur?: number
  /** Opacity of a word not yet cleared, from 0 to 1. @defaultValue 0.25 */
  dim?: number
  /** Duration of the clearing of one word, in milliseconds. @defaultValue 520 */
  duration?: number
  /** Delay between two words of the draw, in milliseconds. @defaultValue 200 */
  step?: number
  /** Reading time before everything blurs again, in milliseconds. @defaultValue 1600 */
  pause?: number
  /** Replay the cycle endlessly. @defaultValue true */
  loop?: boolean
}

/** All properties. */
export type BlurWordsProps = Customisable<BlurWordsOwnProps, 'p'>

/** Identifier of the injected stylesheet. */
const STYLE_ID = 'o-blur-words'

/** Share of the pause devoted to reading; the rest goes back to blur. */
const READING = 0.6

/** Sets the clearing rules, once per document. */
function ensureBlurWordsRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = ['[data-o-blur-words-word]{display:inline-block}'].join('')
  document.head.append(style)
}

/**
 * Returns a permutation of the indices, by a Fisher-Yates shuffle.
 *
 * Any permutation: two neighbouring words coming out one after the other does
 * happen, and that is what makes the draw credible.
 */
function permutation(size: number): number[] {
  const order = Array.from({ length: size }, (_, index) => index)
  for (let index = size - 1; index > 0; index -= 1) {
    const pick = Math.floor(Math.random() * (index + 1))
    const kept = order[index] ?? index
    order[index] = order[pick] ?? pick
    order[pick] = kept
  }
  return order
}

/**
 * Clears the words of a text one by one, in a random order.
 *
 * @example
 * <BlurWords as="p" className="o-text-2xl">
 *   A component you cannot modify is not yours.
 * </BlurWords>
 *
 * @example
 * // A single pass, heavily blurred, with no going back.
 * <BlurWords loop={false} blur={12} step={90}>Only once</BlurWords>
 */
export function BlurWords({
  children,
  as: Tag = 'p',
  blur = 6,
  dim = 0.25,
  duration = 520,
  step = 200,
  pause = 1600,
  loop = true,
  ...rest
}: BlurWordsProps): ReactElement {
  const { reduced } = useMotionState()
  const { ref, inView } = useInView<HTMLElement>()

  ensureBlurWordsRule()

  useEffect(() => {
    const element = ref.current
    if (element === null || reduced || !inView) return

    const words = [...element.querySelectorAll<HTMLElement>('[data-o-blur-words-word]')]
    if (words.length === 0) return

    const total = words.length
    const order = permutation(total)
    const cycle = total * step + duration + pause

    const murky = {
      opacity: Math.min(1, Math.max(0, dim)),
      filter: `blur(${String(blur)}px)`,
    }
    const clear = { opacity: 1, filter: 'blur(0px)' }

    const animations = words.map((word, index) => {
      const rank = order[index] ?? index
      const start = (rank * step) / cycle
      const end = (rank * step + duration) / cycle
      const reading = (total * step + duration + pause * READING) / cycle

      const frames = loop
        ? [
            { ...murky, offset: 0 },
            { ...murky, offset: start },
            { ...clear, offset: end },
            { ...clear, offset: Math.max(end, reading) },
            // Everybody goes back to blur together: it is the end of the
            // cycle, and the next turn starts again from the same point.
            { ...murky, offset: 1 },
          ]
        : [
            { ...murky, offset: 0 },
            { ...murky, offset: start },
            { ...clear, offset: end },
            { ...clear, offset: 1 },
          ]

      return word.animate(frames, {
        duration: cycle,
        iterations: loop ? Number.POSITIVE_INFINITY : 1,
        easing: 'linear',
        fill: 'both',
      })
    })

    // The same start instant for everybody: without that, the draw drifts from
    // one cycle to the next. See the module header.
    const startAt = document.timeline.currentTime
    for (const animation of animations) animation.startTime = startAt

    return () => {
      for (const animation of animations) animation.cancel()
    }
  }, [ref, reduced, inView, children, blur, dim, duration, step, pause, loop])

  const { className, style } = mergePresentation({}, rest)

  // Reduced motion: the text is there, crisp, with no split.
  if (reduced) {
    return (
      <Tag {...rest} className={className} style={style}>
        {children}
      </Tag>
    )
  }

  const words = children.split(' ').filter((word) => word.length > 0)

  return (
    <Tag {...rest} ref={ref} className={className} style={style}>
      {/* The complete text, in one piece, for screen readers. */}
      <span className="o-sr-only">{children}</span>
      <span aria-hidden>
        {words.map((word, index) => (
          <span key={`${word}-${String(index)}`}>
            <span data-o-blur-words-word="">{word}</span>
            {index < words.length - 1 ? ' ' : null}
          </span>
        ))}
      </span>
    </Tag>
  )
}

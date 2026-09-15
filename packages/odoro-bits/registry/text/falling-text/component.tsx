/**
 * Fall: each letter drops into place from above, with a slight bounce.
 *
 * ## An overshoot, not a full bounce
 *
 * A letter that falls and stops dead looks placed; a letter that bounces
 * several times looks like it is putting on a show. Between the two, a curve
 * that crosses the baseline once before settling onto it — the "emphasised"
 * profile of motion systems, obtained here by a `cubic-bezier` whose output
 * goes past 1.
 *
 * ## `element.animate`, armed by the observer
 *
 * The effect plays only on entering the viewport. The hidden state — the
 * letters at zero opacity — is applied by the very code that schedules the
 * fall: if that code never runs, the text is simply there. See blur-reveal,
 * which took the brunt of this trap.
 *
 * ## The split is a display device
 *
 * The text is broken into letters so that each receives its own delay. The
 * container therefore carries the complete text for screen readers, and the
 * letters are removed from the accessibility tree.
 *
 * @module
 */

import { mergePresentation, useMotionState, type Customisable } from '@odoro-cli/engine'
import { useEffect, useRef, type ElementType, type ReactElement } from 'react'

/** Properties specific to the component. */
export interface FallingTextOwnProps {
  /** Text to drop. */
  children: string
  /** Rendered tag. @defaultValue 'span' */
  as?: ElementType
  /** Delay between two letters, in milliseconds. @defaultValue 45 */
  step?: number
  /** Height of the fall, in em. @defaultValue 1.2 */
  drop?: number
  /**
   * Play only once.
   *
   * At `false`, the fall replays on every return into the viewport — to be
   * reserved for texts one does not come across by chance.
   *
   * @defaultValue true
   */
  once?: boolean
}

/** All properties. */
export type FallingTextProps = Customisable<FallingTextOwnProps, 'span'>

/** No-break space: an ordinary space collapses inside an inline block. */
const NBSP = '\u00A0'

/** Duration of the fall of one letter, in milliseconds. */
const FALL_MS = 550

/**
 * Ease out with overshoot: the letter crosses its finishing line by a hair,
 * then settles onto it. It is the overshoot that gives the weight.
 */
const OVERSHOOT = 'cubic-bezier(0.34, 1.56, 0.64, 1)'

/**
 * Drops a text into place, letter by letter, on entering the viewport.
 *
 * @example
 * <FallingText as="h1" className="o-text-5xl o-font-extrabold">
 *   Right on cue
 * </FallingText>
 *
 * @example
 * // A higher fall, replayed on every pass.
 * <FallingText drop={2.5} once={false}>Again</FallingText>
 */
export function FallingText({
  children,
  as: Tag = 'span',
  step = 45,
  drop = 1.2,
  once = true,
  ...rest
}: FallingTextProps): ReactElement {
  const { reduced } = useMotionState()
  const host = useRef<HTMLElement | null>(null)

  useEffect(() => {
    const element = host.current
    if (element === null || reduced) return

    const letters = element.querySelectorAll<HTMLElement>('[data-o-fall-letter]')
    if (letters.length === 0) return

    // The hidden state is applied here, not in the render: without this code,
    // the text stays visible. See the module header.
    for (const letter of letters) {
      letter.style.opacity = '0'
    }

    let animations: Animation[] = []

    const play = (): void => {
      for (const animation of animations) animation.cancel()
      animations = []

      letters.forEach((letter, index) => {
        letter.style.opacity = ''
        animations.push(
          letter.animate(
            [
              { transform: `translateY(${String(-drop)}em)`, opacity: 0 },
              { transform: 'translateY(0)', opacity: 1 },
            ],
            {
              duration: FALL_MS,
              delay: index * step,
              easing: OVERSHOOT,
              fill: 'both',
            },
          ),
        )
      })
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.every((entry) => !entry.isIntersecting)) return
        play()
        if (once) observer.disconnect()
      },
      { threshold: 0.4 },
    )

    observer.observe(element)
    return () => {
      observer.disconnect()
      for (const animation of animations) animation.cancel()
      for (const letter of letters) {
        letter.style.opacity = ''
      }
    }
  }, [reduced, children, step, drop, once])

  const { className, style } = mergePresentation({}, rest)

  // Reduced motion: the text is there, whole, with no split.
  if (reduced) {
    return (
      <Tag {...rest} className={className} style={style}>
        {children}
      </Tag>
    )
  }

  const letters = [...children]

  return (
    <Tag {...rest} ref={host} className={className} style={style}>
      {/* The complete text, in one piece, for screen readers. */}
      <span className="o-sr-only">{children}</span>
      <span aria-hidden>
        {letters.map((letter, index) => (
          <span
            key={`${letter}-${String(index)}`}
            data-o-fall-letter=""
            style={{ display: 'inline-block' }}
          >
            {/* An ordinary space collapses inside an inline block: the
                no-break one keeps its width. */}
            {letter === ' ' ? NBSP : letter}
          </span>
        ))}
      </span>
    </Tag>
  )
}

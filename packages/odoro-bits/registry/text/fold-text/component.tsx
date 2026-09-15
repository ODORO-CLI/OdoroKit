/**
 * Fold: each letter tips forward, hinged at the top.
 *
 * ## A hinge, not a fall
 *
 * `falling-text` translates the letters from above: they arrive from outside.
 * Here nothing moves — each letter is a flap hinged on its top edge, which
 * starts almost flat and swings down. Under a short perspective, the letter
 * shortens then recovers its height, like a panel being unfolded.
 *
 * It is the perspective of the container that does everything: without it, a
 * rotation about the X axis is nothing but a vertical squash.
 *
 * ## The folded state is only applied if the effect will happen
 *
 * The trap of reveals: hide in CSS, show in JavaScript. If the JavaScript
 * never comes, the heading stays invisible. The folded state is therefore
 * written by the very code that schedules the unfolding — and, on hover, it is
 * not even written at all: the animation itself carries it, for the length of
 * its delay.
 *
 * ## The split is a display device
 *
 * The letters are elements so that each can receive its own delay. The
 * complete text appears once, in one piece, and the letters are removed from
 * the accessibility tree.
 *
 * ## Reduced motion
 *
 * No split, no animation: the heading is rendered as it is, unfolded. That is
 * the arrival state.
 *
 * @module
 */

import { mergePresentation, useMotionState, type Customisable } from '@odoro-cli/engine'
import { useEffect, type CSSProperties, type ElementType, type ReactElement } from 'react'

import { useInView } from '@registre/hooks/useInView'

/** What triggers the unfolding. */
export type FoldTextTrigger = 'mount' | 'view' | 'hover'

/** Properties specific to the component. */
export interface FoldTextOwnProps {
  /** Text to fold. */
  children: string
  /** Rendered tag. @defaultValue 'span' */
  as?: ElementType
  /** Duration of the unfolding of one letter, in milliseconds. @defaultValue 620 */
  duration?: number
  /** Delay between two letters, in milliseconds. @defaultValue 40 */
  step?: number
  /** Vanishing distance, in pixels. The lower, the more pronounced. @defaultValue 420 */
  perspective?: number
  /**
   * When to fold.
   *
   * `view` waits for the entry into the viewport, `mount` starts right away,
   * `hover` replays on every entry of the pointer.
   *
   * @defaultValue 'view'
   */
  trigger?: FoldTextTrigger
}

/** All properties. */
export type FoldTextProps = Customisable<FoldTextOwnProps, 'span'>

/** No-break space: an ordinary space collapses inside an inline block. */
const NBSP = '\u00A0'

/** Identifier of the injected stylesheet. */
const STYLE_ID = 'o-fold-text'

/**
 * Starting slightly past the vertical: a flap that starts at exactly ninety
 * degrees is invisible, and the unfolding seems to begin out of nowhere. Two
 * extra degrees are enough to make it exist.
 */
const FOLDED = 'rotateX(-98deg)'

/** Sharp then damped ease out: the flap arrives, it does not stop dead. */
const CURVE = 'cubic-bezier(0.22, 1, 0.36, 1)'

/** Sets the fold rules, once per document. */
function ensureFoldRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-fold]{display:inline-block;perspective:var(--o-fold-vanish)}',
    // The hinge is the top edge of the letter.
    '[data-o-fold-letter]{display:inline-block;transform-origin:50% 0%}',
  ].join('')
  document.head.append(style)
}

/**
 * Unfolds a text letter by letter, like a series of flaps.
 *
 * @example
 * <FoldText as="h1" className="o-text-5xl o-font-bold">
 *   It unfolds
 * </FoldText>
 *
 * @example
 * // Replayed on every hover, in a slow cascade.
 * <FoldText trigger="hover" step={90} duration={900}>Again</FoldText>
 */
export function FoldText({
  children,
  as: Tag = 'span',
  duration = 620,
  step = 40,
  perspective = 420,
  trigger = 'view',
  ...rest
}: FoldTextProps): ReactElement {
  const { reduced } = useMotionState()
  const { ref, inView } = useInView<HTMLElement>({
    immediate: trigger === 'mount',
  })

  ensureFoldRule()

  useEffect(() => {
    const element = ref.current
    if (element === null || reduced) return

    const letters = [...element.querySelectorAll<HTMLElement>('[data-o-fold-letter]')]
    if (letters.length === 0) return

    let animations: Animation[] = []

    const stop = (): void => {
      for (const animation of animations) animation.cancel()
      animations = []
    }

    const play = (): void => {
      stop()
      letters.forEach((letter, index) => {
        letter.style.opacity = ''
        animations.push(
          letter.animate(
            [
              { transform: FOLDED, opacity: 0 },
              { transform: 'rotateX(0deg)', opacity: 1 },
            ],
            { duration, delay: index * step, easing: CURVE, fill: 'both' },
          ),
        )
      })
    }

    if (trigger === 'hover') {
      // Nothing is hidden in advance: the delay of each animation carries the
      // folded state itself, and a heading that is never hovered therefore
      // stays perfectly readable.
      const onEnter = (): void => {
        play()
      }
      element.addEventListener('pointerenter', onEnter)
      return () => {
        element.removeEventListener('pointerenter', onEnter)
        stop()
      }
    }

    if (!inView) {
      // The folded state is written here, not in the render: see the header.
      for (const letter of letters) letter.style.opacity = '0'
      return
    }

    play()
    return () => {
      stop()
      for (const letter of letters) letter.style.opacity = ''
    }
  }, [ref, reduced, inView, children, duration, step, trigger])

  const { className, style } = mergePresentation({}, rest)

  // Reduced motion: the text is there, unfolded, with no split.
  if (reduced) {
    return (
      <Tag {...rest} className={className} style={style}>
        {children}
      </Tag>
    )
  }

  const rootStyle = {
    ...style,
    '--o-fold-vanish': `${String(perspective)}px`,
  } as CSSProperties

  const letters = [...children]

  return (
    <Tag {...rest} ref={ref} className={className} style={rootStyle} data-o-fold="">
      {/* The complete text, in one piece, for screen readers. */}
      <span className="o-sr-only">{children}</span>
      <span aria-hidden>
        {letters.map((letter, index) => (
          <span key={`${letter}-${String(index)}`} data-o-fold-letter="">
            {/* An ordinary space collapses inside an inline block: the
                no-break one keeps its width. */}
            {letter === ' ' ? NBSP : letter}
          </span>
        ))}
      </span>
    </Tag>
  )
}

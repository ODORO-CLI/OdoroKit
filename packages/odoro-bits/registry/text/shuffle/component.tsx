/**
 * Shuffle: the letters start from one another's places, then come home.
 *
 * ## It is the places that are shuffled, not the characters
 *
 * `decode-text` replaces characters with others: the word is wrong, its
 * letters are in their place. Here it is the reverse — the letters are the
 * right ones, but each starts in the place of another, then joins its own. One
 * never reads a wrong word: one watches a deck of cards being sorted.
 *
 * ## The places are measured, never computed
 *
 * An offset guessed from the average width of a character shows immediately:
 * `i` and `m` do not occupy the same place, and the letters do not land. The
 * rendered positions are therefore read just before starting, and the initial
 * offset is the difference between two of them. The shuffle stays correct
 * whatever the font, the case or the line break.
 *
 * ## The shuffled state is only applied if the effect will happen
 *
 * As for every reveal in this registry: hiding in CSS and showing in
 * JavaScript would leave an absent heading the day the JavaScript does not
 * come. The starting state is written by the very code that schedules the
 * return — and, on hover, it is carried by the delay of the animation itself.
 *
 * ## The split is a display device
 *
 * The complete text appears once, in one piece; the letters are removed from
 * the accessibility tree.
 *
 * @module
 */

import { mergePresentation, useMotionState, type Customisable } from '@odoro-cli/engine'
import { useEffect, type ElementType, type ReactElement } from 'react'

import { useInView } from '@registre/hooks/useInView'

/** What triggers the shuffle. */
export type ShuffleTrigger = 'mount' | 'view' | 'hover'

/** Properties specific to the component. */
export interface ShuffleOwnProps {
  /** Text to shuffle. */
  children: string
  /** Rendered tag. @defaultValue 'span' */
  as?: ElementType
  /** Duration of the return of one letter, in milliseconds. @defaultValue 800 */
  duration?: number
  /** Delay between two letters, in milliseconds. @defaultValue 35 */
  step?: number
  /** Maximum tilt at the start, in degrees. @defaultValue 20 */
  tilt?: number
  /**
   * When to shuffle.
   *
   * @defaultValue 'view'
   */
  trigger?: ShuffleTrigger
}

/** All properties. */
export type ShuffleProps = Customisable<ShuffleOwnProps, 'span'>

/** No-break space: an ordinary space collapses inside an inline block. */
const NBSP = '\u00A0'

/** Identifier of the injected stylesheet. */
const STYLE_ID = 'o-shuffle'

/** Sharp then damped ease out: the letter files in, it does not brake. */
const CURVE = 'cubic-bezier(0.16, 1, 0.3, 1)'

/** Sets the shuffle rules, once per document. */
function ensureShuffleRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-shuffle]{display:inline-block}',
    '[data-o-shuffle-letter]{display:inline-block}',
  ].join('')
  document.head.append(style)
}

/**
 * Returns a permutation of the indices, by a Fisher-Yates shuffle.
 *
 * Any permutation, not a derangement: having one or two letters stay in place
 * makes the shuffle more credible than forcing every one of them to move.
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
 * Brings the letters of a text home from one another's places.
 *
 * @example
 * <Shuffle as="h1" className="o-text-5xl o-font-bold">
 *   Everything falls into place
 * </Shuffle>
 *
 * @example
 * // Replayed on every hover, with no tilt.
 * <Shuffle trigger="hover" tilt={0} duration={520}>Again</Shuffle>
 */
export function Shuffle({
  children,
  as: Tag = 'span',
  duration = 800,
  step = 35,
  tilt = 20,
  trigger = 'view',
  ...rest
}: ShuffleProps): ReactElement {
  const { reduced } = useMotionState()
  const { ref, inView } = useInView<HTMLElement>({
    immediate: trigger === 'mount',
  })

  ensureShuffleRule()

  useEffect(() => {
    const element = ref.current
    if (element === null || reduced) return

    const letters = [...element.querySelectorAll<HTMLElement>('[data-o-shuffle-letter]')]
    if (letters.length === 0) return

    let animations: Animation[] = []

    const stop = (): void => {
      for (const animation of animations) animation.cancel()
      animations = []
    }

    const play = (): void => {
      stop()

      // The places are read now: a font loaded in the meantime, a width that
      // has changed, and the old ones would be wrong.
      const places = letters.map((letter) => ({
        x: letter.offsetLeft,
        y: letter.offsetTop,
      }))
      const order = permutation(letters.length)

      letters.forEach((letter, index) => {
        const here = places[index]
        const elsewhere = places[order[index] ?? index]
        if (here === undefined || elsewhere === undefined) return

        const angle = (Math.random() * 2 - 1) * tilt

        letter.style.opacity = ''
        animations.push(
          letter.animate(
            [
              {
                transform: `translate(${String(elsewhere.x - here.x)}px, ${String(elsewhere.y - here.y)}px) rotate(${String(angle)}deg)`,
                opacity: 0.25,
              },
              { transform: 'translate(0px, 0px) rotate(0deg)', opacity: 1 },
            ],
            { duration, delay: index * step, easing: CURVE, fill: 'both' },
          ),
        )
      })
    }

    if (trigger === 'hover') {
      // Nothing is hidden in advance: the delay of each animation carries the
      // shuffled state, and a heading that is never hovered stays readable.
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
      // The starting state is written here, not in the render: see the header.
      for (const letter of letters) letter.style.opacity = '0'
      return
    }

    play()
    return () => {
      stop()
      for (const letter of letters) letter.style.opacity = ''
    }
  }, [ref, reduced, inView, children, duration, step, tilt, trigger])

  const { className, style } = mergePresentation({}, rest)

  // Reduced motion: the text is there, in order, with no split.
  if (reduced) {
    return (
      <Tag {...rest} className={className} style={style}>
        {children}
      </Tag>
    )
  }

  const letters = [...children]

  return (
    <Tag {...rest} ref={ref} className={className} style={style} data-o-shuffle="">
      {/* The complete text, in one piece, for screen readers. */}
      <span className="o-sr-only">{children}</span>
      <span aria-hidden>
        {letters.map((letter, index) => (
          <span key={`${letter}-${String(index)}`} data-o-shuffle-letter="">
            {/* An ordinary space collapses inside an inline block: the
                no-break one keeps its width. */}
            {letter === ' ' ? NBSP : letter}
          </span>
        ))}
      </span>
    </Tag>
  )
}

/**
 * Trailing text: the letters chase the pointer, in a chain.
 *
 * ## A chain, not a block that moves
 *
 * `echo-text` makes copies of the text and has them trail behind the pointer;
 * the original does not move. Here there is no copy: it is the text itself
 * that leaves. The first letter aims at the pointer, the second aims at the
 * first, the third at the second — each letter knows only the one before it.
 *
 * Out of that very simple rule comes a behaviour that nobody wrote: the word
 * curves like a whip in the corners, stretches when the pointer flies, and
 * lines itself up again as soon as it stops. No trajectory is computed, no
 * curve is laid down.
 *
 * ## The chain is walked from the tail
 *
 * The letters are traversed from the last to the first. Each therefore reads
 * the position its neighbour had on the previous frame, and not the one it has
 * just taken: it is that one-frame lag per link that makes the trail. The
 * other way round, the information would travel up the whole chain within the
 * same frame and the word would move as one block.
 *
 * ## Nothing is written when nothing moves
 *
 * As long as the total displacement of a frame stays under a threshold, the
 * loop touches no style. A heading left alone therefore costs nothing but the
 * comparison, not the writes.
 *
 * ## The split is a display device
 *
 * The complete text appears once, in one piece; the letters are removed from
 * the accessibility tree.
 *
 * ## Reduced motion
 *
 * Following the pointer is an embellishment, not a content: the text is
 * rendered as it is, in line, with no split.
 *
 * @module
 */

import {
  CLOCK_PRIORITY,
  clock,
  mergePresentation,
  useMotionState,
  type Customisable,
} from '@odoro-cli/engine'
import { useRef, useEffect, type ElementType, type ReactElement } from 'react'

import { usePointerDamped } from '@registre/hooks/usePointerDamped'

/** Properties specific to the component. */
export interface TextCursorOwnProps {
  /** Text to trail. */
  children: string
  /** Rendered tag. @defaultValue 'span' */
  as?: ElementType
  /** Maximum run of a letter, in pixels. @defaultValue 26 */
  amplitude?: number
  /** Stiffness of the chain. The higher, the more the word stays grouped. @defaultValue 9 */
  stiffness?: number
  /** Tilt taken in the corners, in degrees per pixel of gap. @defaultValue 0.4 */
  tilt?: number
  /** Catch-up speed of the pointer. The higher, the snappier. @defaultValue 4 */
  speed?: number
}

/** All properties. */
export type TextCursorProps = Customisable<TextCursorOwnProps, 'span'>

/** No-break space: an ordinary space collapses inside an inline block. */
const NBSP = '\u00A0'

/** Identifier of the injected stylesheet. */
const STYLE_ID = 'o-text-cursor'

/**
 * Total displacement of a frame below which nothing is written any more.
 *
 * A tenth of a pixel accumulated over the whole word does not show; measuring
 * it costs a subtraction, writing it costs a string and an invalidation per
 * letter.
 */
const THRESHOLD = 0.1

/** A position in the plane. */
interface Point {
  x: number
  y: number
}

/** Sets the chain rules, once per document. */
function ensureCursorRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-text-cursor]{display:inline-block}',
    '[data-o-text-cursor-letter]{display:inline-block;will-change:transform}',
  ].join('')
  document.head.append(style)
}

/**
 * Runs the letters of a text after the pointer.
 *
 * @example
 * <TextCursor as="h1" className="o-text-5xl o-font-bold">
 *   Catch me
 * </TextCursor>
 *
 * @example
 * // Soft chain and long trail, with no tilt.
 * <TextCursor amplitude={48} stiffness={3} tilt={0}>Elastic</TextCursor>
 */
export function TextCursor({
  children,
  as: Tag = 'span',
  amplitude = 26,
  stiffness = 9,
  tilt = 0.4,
  speed = 4,
  ...rest
}: TextCursorProps): ReactElement {
  const { reduced } = useMotionState()
  const host = useRef<HTMLElement | null>(null)

  // The whole window, not the heading: a word that only answered above itself
  // would never be seen to move.
  const pointer = usePointerDamped({ speed, name: 'trailing text' })

  ensureCursorRule()

  useEffect(() => {
    const element = host.current
    if (element === null || reduced) return

    const letters = [
      ...element.querySelectorAll<HTMLElement>('[data-o-text-cursor-letter]'),
    ]
    if (letters.length === 0) return

    // The positions live here, never in React state: they change on every
    // frame and React draws none of it.
    const places: Point[] = letters.map(() => ({ x: 0, y: 0 }))

    const subscription = clock.subscribe(
      ({ delta }) => {
        const targetX = pointer.current.x * amplitude
        const targetY = pointer.current.y * amplitude

        // Frame-rate independent damping: see usePointerDamped.
        const factor = 1 - Math.exp(-stiffness * delta)
        let travel = 0

        // From the tail to the head: each link reads the position its
        // neighbour had on the previous frame. See the module header.
        for (let index = places.length - 1; index >= 0; index -= 1) {
          const place = places[index]
          const ahead = index === 0 ? null : (places[index - 1] ?? null)
          if (place === undefined) continue

          const aimX = ahead === null ? targetX : ahead.x
          const aimY = ahead === null ? targetY : ahead.y

          const stepX = (aimX - place.x) * factor
          const stepY = (aimY - place.y) * factor
          place.x += stepX
          place.y += stepY
          travel += Math.abs(stepX) + Math.abs(stepY)
        }

        if (travel < THRESHOLD) return

        for (let index = 0; index < places.length; index += 1) {
          const place = places[index]
          const letter = letters[index]
          if (place === undefined || letter === undefined) continue

          const ahead = index === 0 ? null : (places[index - 1] ?? null)
          // The gap with the link ahead says which way the chain is pulling:
          // the letter lies down into the corner.
          const gap = (ahead === null ? targetX : ahead.x) - place.x

          letter.style.transform = `translate(${place.x.toFixed(2)}px, ${place.y.toFixed(2)}px) rotate(${(gap * tilt).toFixed(2)}deg)`
        }
      },
      { name: 'trailing text', priority: CLOCK_PRIORITY.default },
    )

    return () => {
      subscription.unsubscribe()
      for (const letter of letters) letter.style.removeProperty('transform')
    }
  }, [reduced, pointer, children, amplitude, stiffness, tilt])

  const { className, style } = mergePresentation({}, rest)

  // Reduced motion: the text is there, in line, with no split.
  if (reduced) {
    return (
      <Tag {...rest} className={className} style={style}>
        {children}
      </Tag>
    )
  }

  const letters = [...children]

  return (
    <Tag {...rest} ref={host} className={className} style={style} data-o-text-cursor="">
      {/* The complete text, in one piece, for screen readers. */}
      <span className="o-sr-only">{children}</span>
      <span aria-hidden>
        {letters.map((letter, index) => (
          <span key={`${letter}-${String(index)}`} data-o-text-cursor-letter="">
            {/* An ordinary space collapses inside an inline block: the
                no-break one keeps its width. */}
            {letter === ' ' ? NBSP : letter}
          </span>
        ))}
      </span>
    </Tag>
  )
}

/**
 * Loop of sentences: each fades away upwards, the next rises.
 *
 * ## Three states, not two
 *
 * A sentence is not merely "shown" or "hidden": it has **already passed** or
 * is **not yet due**. With two states, the leaving and the entering one would
 * start from the same side, and the movement would read as a bounce instead of
 * a scroll.
 *
 * The relative position is computed modulo the number of sentences: the one
 * that precedes the current sentence is "before", all the others are "after".
 * The wrap of the loop is therefore no exception — the last sentence leaves
 * through the top like the others.
 *
 * ## Everything is declarative
 *
 * No style is written by hand, no animation is scheduled: an attribute
 * changes, and the browser interpolates. The only work JavaScript does is
 * advancing a counter every few seconds.
 *
 * The "after" sentences have no transition: they are invisible, and sliding
 * them from top to bottom at the moment they leave the "before" state would be
 * compositor work for a movement nobody sees.
 *
 * ## Why a timer rather than the loop
 *
 * The sentence changes every two or three seconds, that is once every hundred
 * and fifty frames. Subscribing to the engine loop would amount to waking it a
 * hundred and forty-nine times to do nothing. This effect does not own the
 * frame, it owns a clock.
 *
 * ## The reserved space
 *
 * The sentences are stacked in the same grid cell: the box takes the size of
 * the longest, rendered as a reserve, invisible. Without it, the layout would
 * jump on every change.
 *
 * ## Reduced motion
 *
 * The first sentence, motionless. A loop has no arrival state: its rest is its
 * starting point.
 *
 * @module
 */

import { mergePresentation, useMotionState, type Customisable } from '@odoro-cli/engine'
import { useEffect, useState, type CSSProperties, type ReactElement } from 'react'

/** Properties specific to the component. */
export interface TextLoopOwnProps {
  /** Sentences played on a loop. */
  phrases: readonly string[]
  /** Time a sentence stays readable, in milliseconds. @defaultValue 2400 */
  hold?: number
  /** Duration of the fade from one sentence to the next, in milliseconds. @defaultValue 600 */
  fade?: number
  /** Vertical run of a sentence entering or leaving, in pixels. @defaultValue 14 */
  lift?: number
}

/** All properties. */
export type TextLoopProps = Customisable<TextLoopOwnProps, 'span'>

/** Identifier of the injected stylesheet. */
const STYLE_ID = 'o-text-loop'

/** Sets the three states of a sentence, once per document. */
function ensureLoopRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-loop-phrase]{',
    'grid-area:1/1;',
    'transition:opacity var(--o-loop-fade) ease,transform var(--o-loop-fade) ease;',
    '}',
    '[data-o-loop-phrase="active"]{opacity:1;transform:translateY(0)}',
    '[data-o-loop-phrase="before"]{',
    'opacity:0;transform:translateY(calc(var(--o-loop-lift) * -1));',
    '}',
    // Not yet due: it waits at the bottom, and gets there with no transition.
    '[data-o-loop-phrase="after"]{',
    'opacity:0;transform:translateY(var(--o-loop-lift));transition:none;',
    '}',
    '@media (prefers-reduced-motion:reduce){',
    '[data-o-loop-phrase]{transition:none}',
    '}',
  ].join('')
  document.head.append(style)
}

/**
 * Scrolls a series of sentences inside a box that does not move.
 *
 * @example
 * <TextLoop
 *   phrases={['living interfaces', 'with no external dependency']}
 *   className="o-text-3xl o-font-bold"
 * />
 *
 * @example
 * // Long fade, with no vertical movement.
 * <TextLoop phrases={['here', 'there', 'elsewhere']} fade={1200} lift={0} />
 */
export function TextLoop({
  phrases,
  hold = 2400,
  fade = 600,
  lift = 14,
  ...rest
}: TextLoopProps): ReactElement {
  const { reduced } = useMotionState()
  const [index, setIndex] = useState(0)

  ensureLoopRule()

  const total = phrases.length

  useEffect(() => {
    if (reduced || total < 2) return

    // The delay counts the reading time **plus** the fade: `hold` is therefore
    // really the time during which the sentence is fully readable, not the
    // period of the cycle.
    const timer = setTimeout(() => {
      setIndex((previous) => (previous + 1) % total)
    }, hold + fade)

    return () => clearTimeout(timer)
  }, [reduced, total, index, hold, fade])

  const { className, style } = mergePresentation({ className: 'o-inline-grid' }, rest)

  const rootStyle = {
    ...style,
    '--o-loop-fade': `${String(fade)}ms`,
    '--o-loop-lift': `${String(lift)}px`,
  } as CSSProperties

  // The longest one sets the box. The measurement is made on the number of
  // characters: it is slightly off on a proportional font, and it is the same
  // trade-off as the typewriter.
  const reserved = phrases.reduce(
    (best, phrase) => (phrase.length > best.length ? phrase : best),
    '',
  )

  const current = total === 0 ? 0 : index % total

  return (
    <span {...rest} className={className} style={rootStyle}>
      {/* Space reserve: without it, whatever surrounds the loop shifts on
          every sentence. */}
      <span aria-hidden className="o-invisible o-col-start-1 o-row-start-1">
        {reserved}
      </span>

      {phrases.map((phrase, position) => {
        const rank = total === 0 ? 0 : (position - current + total) % total
        // Reduced motion: the first sentence, and it alone.
        const state = reduced
          ? position === 0
            ? 'active'
            : 'after'
          : rank === 0
            ? 'active'
            : rank === total - 1
              ? 'before'
              : 'after'

        return (
          <span
            key={`${phrase}-${String(position)}`}
            data-o-loop-phrase={state}
            aria-hidden={state !== 'active'}
          >
            {phrase}
          </span>
        )
      })}
    </span>
  )
}

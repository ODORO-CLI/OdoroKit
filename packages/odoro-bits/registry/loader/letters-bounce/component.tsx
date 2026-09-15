/**
 * Bouncing letters: each letter squashes, jumps and lands in turn, from left
 * to right, then the whole word settles before the next jump.
 *
 * ## A jump, not a wave
 *
 * A wave makes the letters rise and fall on a sine, without stopping: that is
 * a heading rippling. A jump has a wind-up, an apex and a landing. Here each
 * letter first squashes onto its baseline, leaves, stretches at the top, then
 * falls back flattening. It is that sequence which makes the movement read as
 * a bounce, and not as a drift.
 *
 * The jump only takes a third of each letter's cycle; the rest is a pose. The
 * letters are offset by a small step, in negative delays, and the whole thing
 * fits in the first two thirds of the cycle: the entire word is therefore
 * still for a moment before the first letter sets off again. Without that
 * breathing, a run of continuous jumps would read as a wave once more.
 *
 * The step adapts to the length of the text: a long word does not overflow its
 * window, it tightens the jumps.
 *
 * ## A status, not a drawing
 *
 * The element carries `role="status"` and a label for screen readers. The
 * letters, cut into separate elements, are removed from the accessibility
 * tree: a screen reader would spell them out.
 *
 * Under reduced motion, the word stays settled on its line: it still reads as
 * a wait, only the jump stops.
 *
 * @module
 */

import { mergePresentation, type Customisable } from '@odoro-cli/engine'
import type { CSSProperties, ReactElement } from 'react'

/** Identifier of the injected stylesheet. */
const STYLE_ID = 'o-letters-bounce'

/** Share of the cycle taken by the sequence of jumps, the pause being the rest. */
const SEQUENCE_SHARE = 0.62

/** Largest step between two letters, as a share of the cycle. */
const MAX_STEP_SHARE = 0.07

/** Sets up the letters and their jump, once per document. */
function ensureLettersBounceRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-lb]{',
    'display:inline-block;white-space:nowrap;font-weight:600;',
    'font-size:var(--o-lb-size);color:var(--o-lb-color);',
    '}',
    '[data-o-lb-letter]{',
    'display:inline-block;transform-origin:50% 100%;',
    'animation:o-lb-jump var(--o-lb-speed) ease-in-out infinite;',
    'animation-delay:var(--o-lb-delay);',
    '}',
    // Squash, take-off, stretch at the top, landing: the jump fits in the
    // first third, the letter settles for the rest.
    '@keyframes o-lb-jump{',
    '0%,34%,100%{transform:translateY(0) scale(1,1)}',
    '6%{transform:translateY(0) scale(1.15,0.8)}',
    '18%{transform:translateY(-0.5em) scale(0.94,1.08)}',
    '28%{transform:translateY(0) scale(1.08,0.9)}',
    '}',
    '@media (prefers-reduced-motion:reduce){',
    '[data-o-lb-letter]{animation:none;transform:none}',
    '}',
  ].join('')
  document.head.append(style)
}

/** Props of the component itself. */
export interface LettersBounceOwnProps {
  /** The displayed text, letter by letter. @defaultValue 'Loading' */
  text?: string
  /** Size of the text, in pixels. @defaultValue 18 */
  size?: number
  /** Duration of one cycle, the pause included, in milliseconds. @defaultValue 2000 */
  speed?: number
  /** Colour of the text. @defaultValue the text colour */
  color?: string
  /** Label announced to screen readers. @defaultValue 'Loading' */
  label?: string
}

/** All the props. */
export type LettersBounceProps = Customisable<LettersBounceOwnProps, 'span'>

/**
 * Signals a wait through a word whose letters jump in turn.
 *
 * @example
 * <LettersBounce />
 *
 * @example
 * // Another word, brisker, in the brand hue.
 * <LettersBounce text="Envoi" speed={1400} color="var(--o-palette-brand-500)" />
 */
export function LettersBounce({
  text = 'Loading',
  size = 18,
  speed = 2000,
  color = 'currentColor',
  label = 'Loading',
  ...rest
}: LettersBounceProps): ReactElement {
  ensureLettersBounceRule()

  const { className, style } = mergePresentation({}, rest)
  const letters = Array.from(text)

  // The step tightens as the word gets longer, so that the whole sequence fits
  // in its share of the cycle and leaves the pause untouched.
  const stepShare = Math.min(MAX_STEP_SHARE, SEQUENCE_SHARE / Math.max(1, letters.length))

  const loaderStyle = {
    ...style,
    '--o-lb-size': `${String(size)}px`,
    '--o-lb-speed': `${String(speed)}ms`,
    '--o-lb-color': color,
  } as CSSProperties

  return (
    <span {...rest} className={className} style={loaderStyle} data-o-lb="" role="status">
      <span className="o-sr-only">{label}</span>
      <span aria-hidden>
        {letters.map((letter, index) => (
          <span
            key={index}
            data-o-lb-letter=""
            style={
              {
                // Negative, so that the canon is in place from the first
                // frame: a letter lags behind the first one in proportion to
                // how far from it it sits.
                '--o-lb-delay': `${String(Math.round(index * stepShare * speed - speed))}ms`,
              } as CSSProperties
            }
          >
            {/* A non-breaking space: an ordinary space in an inline block would collapse. */}
            {letter === ' ' ? '\u00A0' : letter}
          </span>
        ))}
      </span>
    </span>
  )
}

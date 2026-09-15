/**
 * Square that rounds off: a solid square makes a half turn while becoming
 * round, then finds its corners again as it completes the turn.
 *
 * ## The round hides the middle of the turn
 *
 * A square spinning on itself looks like itself every quarter turn: a
 * rotation alone would read as a tremble. Here the rotation is coupled to
 * the radius of the corners. At the start, a square; halfway, a round; at
 * the end, the square again. The moment when one could not say whether the
 * square has turned is exactly the moment when there are no corners left to
 * follow. What the eye keeps is a shape that gathers into a circle and
 * unfolds back into a square, one turn out of two in each direction of
 * reading.
 *
 * The shape contracts a little as it passes through round: a round of the
 * same size as a square looks smaller, and the contraction emphasizes the
 * movement instead of compensating for it. It is a pulse, not an optical
 * correction.
 *
 * A single element, a single animation, no JavaScript after the first
 * render. The border radius is not held by the compositor, but on an element
 * of this size the repaint is negligible.
 *
 * ## A status, not a drawing
 *
 * The element carries `role="status"` and a label for screen readers: the
 * wait is information, not decoration. The shape itself is removed from the
 * accessibility tree.
 *
 * Under reduced motion, the square stays upright and solid: the figure
 * still reads as a loader, only the movement stops.
 *
 * @module
 */

import { mergePresentation, type Customisable } from '@odoro-cli/engine'
import type { CSSProperties, ReactElement } from 'react'

/** Id of the injected stylesheet. */
const STYLE_ID = 'o-square-morph'

/** Sets the shape and its turn, once per document. */
function ensureSquareMorphRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-square-morph]{display:inline-block;line-height:0}',
    '[data-o-square-morph-shape]{',
    'display:block;',
    'width:var(--o-square-size);height:var(--o-square-size);',
    'background:var(--o-square-color);border-radius:12%;',
    'animation:o-square-morph-turn var(--o-square-speed) ease-in-out infinite;',
    '}',
    // Half a turn to become round, half a turn to become square again: the
    // rotation never stops, only the corners come and go.
    '@keyframes o-square-morph-turn{',
    '0%{transform:rotate(0deg) scale(1);border-radius:12%}',
    '50%{transform:rotate(180deg) scale(0.78);border-radius:50%}',
    '100%{transform:rotate(360deg) scale(1);border-radius:12%}',
    '}',
    '@media (prefers-reduced-motion:reduce){',
    '[data-o-square-morph-shape]{animation:none;transform:none}',
    '}',
  ].join('')
  document.head.append(style)
}

/** The component's own props. */
export interface SquareMorphOwnProps {
  /** Side of the square, in pixels. @defaultValue 32 */
  size?: number
  /** Duration of one complete turn, in milliseconds. @defaultValue 1800 */
  speed?: number
  /** Color of the shape. @defaultValue the text color */
  color?: string
  /** Label announced to screen readers. @defaultValue 'Loading' */
  label?: string
}

/** All props. */
export type SquareMorphProps = Customisable<SquareMorphOwnProps, 'span'>

/**
 * Signals a wait with a square that turns as it rounds off.
 *
 * @example
 * <SquareMorph />
 *
 * @example
 * // Smaller, brisker, in the brand hue.
 * <SquareMorph size={20} speed={1200} color="var(--o-palette-brand-500)" />
 */
export function SquareMorph({
  size = 32,
  speed = 1800,
  color = 'currentColor',
  label = 'Loading',
  ...rest
}: SquareMorphProps): ReactElement {
  ensureSquareMorphRule()

  const { className, style } = mergePresentation({}, rest)

  const loaderStyle = {
    ...style,
    '--o-square-size': `${String(size)}px`,
    '--o-square-speed': `${String(speed)}ms`,
    '--o-square-color': color,
  } as CSSProperties

  return (
    <span
      {...rest}
      className={className}
      style={loaderStyle}
      data-o-square-morph=""
      role="status"
    >
      <span className="o-sr-only">{label}</span>
      <span aria-hidden data-o-square-morph-shape="" />
    </span>
  )
}

/**
 * Typing cursor: a word types itself character by character behind a cursor
 * that blinks, holds, then erases itself.
 *
 * ## Typing without a timer
 *
 * The typewriter of the text category plays whole sentences with a timer,
 * because it has a rhythm and steps. A loader needs neither: a single word, on
 * a loop, whose only information is "work is happening". So it fits in CSS.
 *
 * The mechanism is a width growing in steps, as many steps as there are
 * characters, on a text that does not wrap and overflows hidden. That requires
 * a fixed-pitch font: it is what makes one step worth exactly one character,
 * and the final width computable in `ch` without measuring anything. The
 * system mono font is used for that.
 *
 * The cursor is the right border of the same element: it follows the typing
 * without being positioned. It blinks on its own animation, shorter than the
 * cycle, and carries on during the hold — that is what says nothing is frozen.
 *
 * The erasing happens through the same steps, in reverse: the line goes back
 * in the way it came out, and the cycle closes on a lone cursor.
 *
 * ## A status, not a drawing
 *
 * The element carries `role="status"` and a label for screen readers. The
 * painted text is removed from the accessibility tree: masked by its width, it
 * would be read truncated or complete depending on the moment.
 *
 * Under reduced motion, the word is complete and the cursor fixed: the line
 * still reads as an entry in progress, only the typing stops.
 *
 * @module
 */

import { mergePresentation, type Customisable } from '@odoro-cli/engine'
import type { CSSProperties, ReactElement } from 'react'

/** Identifier of the injected stylesheet. */
const STYLE_ID = 'o-typing-cursor'

/** Sets up the line, its typing and its cursor, once per document. */
function ensureTypingCursorRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-tc]{',
    'display:inline-block;line-height:1.3;',
    'font-family:var(--o-font-mono);font-size:var(--o-tc-size);color:var(--o-tc-color);',
    '}',
    '[data-o-tc-line]{',
    'display:inline-block;overflow:hidden;white-space:nowrap;vertical-align:bottom;',
    'box-sizing:content-box;width:var(--o-tc-width);padding-right:0.1em;',
    'border-right:0.09em solid currentColor;',
    'animation-name:o-tc-type,o-tc-blink;',
    'animation-duration:var(--o-tc-speed),800ms;',
    // One step per character for the typing; a single notch for the cursor,
    // which is on or off, never in between.
    'animation-timing-function:steps(var(--o-tc-steps),end),steps(1,end);',
    'animation-iteration-count:infinite,infinite;',
    '}',
    // Typing over the first third and a half, hold, then erasing in reverse.
    '@keyframes o-tc-type{0%{width:0}45%,72%{width:var(--o-tc-width)}100%{width:0}}',
    '@keyframes o-tc-blink{0%,100%{border-color:currentColor}50%{border-color:transparent}}',
    '@media (prefers-reduced-motion:reduce){',
    '[data-o-tc-line]{animation:none;width:var(--o-tc-width)}',
    '}',
  ].join('')
  document.head.append(style)
}

/** Props of the component itself. */
export interface TypingCursorOwnProps {
  /** The typed text. @defaultValue 'Loading' */
  text?: string
  /** Size of the text, in pixels. @defaultValue 16 */
  size?: number
  /** Duration of one cycle — typing, hold and erasing — in milliseconds. @defaultValue 3200 */
  speed?: number
  /** Colour of the text and of the cursor. @defaultValue the text colour */
  color?: string
  /** Label announced to screen readers. @defaultValue 'Loading' */
  label?: string
}

/** All the props. */
export type TypingCursorProps = Customisable<TypingCursorOwnProps, 'span'>

/**
 * Signals a wait through a word typing itself behind a cursor.
 *
 * @example
 * <TypingCursor />
 *
 * @example
 * // Another word, slower, in the brand hue.
 * <TypingCursor text="Connexion" speed={4200} color="var(--o-palette-brand-500)" />
 */
export function TypingCursor({
  text = 'Loading',
  size = 16,
  speed = 3200,
  color = 'currentColor',
  label = 'Loading',
  ...rest
}: TypingCursorProps): ReactElement {
  ensureTypingCursorRule()

  const { className, style } = mergePresentation({}, rest)
  const count = Math.max(1, Array.from(text).length)

  const loaderStyle = {
    ...style,
    '--o-tc-size': `${String(size)}px`,
    '--o-tc-speed': `${String(speed)}ms`,
    '--o-tc-width': `${String(count)}ch`,
    '--o-tc-steps': String(count),
    '--o-tc-color': color,
  } as CSSProperties

  return (
    <span {...rest} className={className} style={loaderStyle} data-o-tc="" role="status">
      <span className="o-sr-only">{label}</span>
      <span aria-hidden data-o-tc-line="">
        {text}
      </span>
    </span>
  )
}

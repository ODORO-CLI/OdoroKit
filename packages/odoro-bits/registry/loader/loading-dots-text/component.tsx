/**
 * A word, then dots: the word stays, three dots are added one after the
 * other, then disappear together.
 *
 * ## The dots are added, they do not blink
 *
 * The naive version blinks each dot at its own rate: three independent
 * glimmers, which tell nothing. Here the sequence is the one you would write
 * by hand — "Loading", "Chargement.", "Chargement..", "Chargement..." —
 * then the line comes back to the word alone. It is a sentence completing
 * itself, not a signal beating.
 *
 * Each dot carries its own step animation: the first lights up at a quarter
 * of the cycle, the second at half, the third at three quarters, and they all
 * go out at the end. Three sets of keyframes rather than a single offset one:
 * a delay would not do, because the lit duration differs from one dot to the
 * next.
 *
 * The dots are in the flow, at their real width, even when invisible: the
 * line does not change length, and what follows does not move.
 *
 * ## A status, not a drawing
 *
 * The element carries `role="status"` and a label for screen readers. The
 * painted text is removed from the accessibility tree: a screen reader
 * following the dots would announce the line on every change.
 *
 * Under reduced motion, the three dots stay shown: "Chargement..." still
 * reads as a wait, only the rhythm stops.
 *
 * @module
 */

import { mergePresentation, type Customisable } from '@odoro-cli/engine'
import type { CSSProperties, ReactElement } from 'react'

/** Identifier of the injected stylesheet. */
const STYLE_ID = 'o-loading-dots-text'

/** Applies the line and its three steps, once per document. */
function ensureLoadingDotsTextRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-ldt]{',
    'display:inline-block;white-space:nowrap;',
    'font-size:var(--o-ldt-size);color:var(--o-ldt-color);',
    '}',
    '[data-o-ldt-dot]{',
    'display:inline-block;',
    'animation-duration:var(--o-ldt-speed);',
    'animation-timing-function:steps(1,end);',
    'animation-iteration-count:infinite;',
    '}',
    // Three sets of keyframes: each dot lights up at its quarter and stays lit
    // until the end of the cycle. A single offset set will not do, the lit
    // duration is not the same for all three.
    '[data-o-ldt-dot="1"]{animation-name:o-ldt-dot-1}',
    '[data-o-ldt-dot="2"]{animation-name:o-ldt-dot-2}',
    '[data-o-ldt-dot="3"]{animation-name:o-ldt-dot-3}',
    '@keyframes o-ldt-dot-1{0%{opacity:0}25%,100%{opacity:1}}',
    '@keyframes o-ldt-dot-2{0%,25%{opacity:0}50%,100%{opacity:1}}',
    '@keyframes o-ldt-dot-3{0%,50%{opacity:0}75%,100%{opacity:1}}',
    '@media (prefers-reduced-motion:reduce){',
    '[data-o-ldt-dot]{animation:none;opacity:1}',
    '}',
  ].join('')
  document.head.append(style)
}

/** Properties specific to the component. */
export interface LoadingDotsTextOwnProps {
  /** The word shown, before the dots. @defaultValue 'Loading' */
  text?: string
  /** Text body size, in pixels. @defaultValue 16 */
  size?: number
  /** Duration of one cycle, in milliseconds. @defaultValue 1600 */
  speed?: number
  /** Colour of the text. @defaultValue the text colour */
  color?: string
  /** Label announced to screen readers. @defaultValue 'Loading' */
  label?: string
}

/** All the properties. */
export type LoadingDotsTextProps = Customisable<LoadingDotsTextOwnProps, 'span'>

/**
 * Signals a wait with a word that dots come to complete.
 *
 * @example
 * <LoadingDotsText />
 *
 * @example
 * // Another word, slower, in the brand hue.
 * <LoadingDotsText text="Envoi" speed={2400} color="var(--o-palette-brand-500)" />
 */
export function LoadingDotsText({
  text = 'Loading',
  size = 16,
  speed = 1600,
  color = 'currentColor',
  label = 'Loading',
  ...rest
}: LoadingDotsTextProps): ReactElement {
  ensureLoadingDotsTextRule()

  const { className, style } = mergePresentation({}, rest)

  const loaderStyle = {
    ...style,
    '--o-ldt-size': `${String(size)}px`,
    '--o-ldt-speed': `${String(speed)}ms`,
    '--o-ldt-color': color,
  } as CSSProperties

  return (
    <span {...rest} className={className} style={loaderStyle} data-o-ldt="" role="status">
      <span className="o-sr-only">{label}</span>
      <span aria-hidden>
        {text}
        <span data-o-ldt-dot="1">.</span>
        <span data-o-ldt-dot="2">.</span>
        <span data-o-ldt-dot="3">.</span>
      </span>
    </span>
  )
}

/**
 * Digit drums: columns that roll endlessly, one notch at a time, each with
 * its own phase, like a counter that never stops.
 *
 * ## A notch, then a stop: that is what makes the drum
 *
 * A column that slides continuously is a ribbon, not a counter: no digit
 * can be read. The drum advances by one digit in a brief movement, then
 * stops on it, ten times per turn. The keyframes therefore number twenty,
 * two per digit — the start and the arrival of the notch — and every notch
 * has its own acceleration. A single `steps(10)` would give the stops, but
 * dry jumps between them; it is the movement between two stops that makes
 * the mechanism.
 *
 * Every drum carries eleven digits, from 0 to 9 then 0 again: the last
 * frame of the turn shows the same digit as the first, and the loop cannot
 * be seen.
 *
 * The drums are not synchronous: a negative delay, different per column,
 * offsets them by a fraction of a turn. Three columns rolling together
 * would look like a single block jumping.
 *
 * The odometer of the text category rolls up to a value and stops; this one
 * never stops, and that is the point.
 *
 * ## A status, not a drawing
 *
 * The element carries `role="status"` and a label for screen readers. The
 * drums are removed from the accessibility tree: a screen reader would find
 * eleven digits per column in them.
 *
 * Under reduced motion, every drum is stopped on a digit, not all of them
 * on the same one: the figure still reads as a counter, only the rolling
 * stops.
 *
 * @module
 */

import { mergePresentation, type Customisable } from '@odoro-cli/engine'
import type { CSSProperties, ReactElement } from 'react'

/** Identifier of the injected stylesheet. */
const STYLE_ID = 'o-counter-roll-loader'

/** Height of one drum line, in em. */
const LINE = 1.3

/** Share of every notch spent in movement, the rest being the stop. */
const MOVE_SHARE = 0.55

/** The eleven digits of a drum: the last one repeats the first. */
const STRIP = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0] as const

/** The twenty keyframes of a turn: start and arrival of every notch. */
function rollKeyframes(): string {
  const stops: string[] = []
  for (let digit = 0; digit < 10; digit += 1) {
    const start = digit * 10
    const end = start + MOVE_SHARE * 10
    stops.push(`${String(start)}%{transform:translateY(${(-digit * LINE).toFixed(2)}em)}`)
    stops.push(
      `${end.toFixed(1)}%{transform:translateY(${(-(digit + 1) * LINE).toFixed(2)}em)}`,
    )
  }
  stops.push(`100%{transform:translateY(${(-10 * LINE).toFixed(2)}em)}`)
  return `@keyframes o-crl-roll{${stops.join('')}}`
}

/** Applies the drums and their turn, once per document. */
function ensureCounterRollLoaderRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-crl]{',
    'display:inline-flex;flex-direction:column;align-items:center;gap:0.5em;',
    'line-height:1;font-size:var(--o-crl-size);color:var(--o-crl-color);',
    '}',
    '[data-o-crl-drum]{',
    'display:inline-flex;gap:0.15em;font-family:var(--o-font-mono);font-size:1.5em;font-weight:600;',
    '}',
    // The window is one line high: it shows only one digit, and the
    // neighbours appear only during the notch.
    '[data-o-crl-col]{',
    `display:block;height:${String(LINE)}em;overflow:hidden;padding:0 0.14em;border-radius:0.15em;`,
    'background:color-mix(in oklab,currentColor 10%,transparent);',
    '}',
    '[data-o-crl-strip]{',
    'display:block;',
    'animation:o-crl-roll var(--o-crl-speed) cubic-bezier(0.4,0,0.2,1) infinite;',
    'animation-delay:var(--o-crl-delay);',
    '}',
    `[data-o-crl-strip]>span{display:block;height:${String(LINE)}em;line-height:${String(LINE)}em;text-align:center}`,
    rollKeyframes(),
    '[data-o-crl-text]{font-size:0.7em;letter-spacing:0.18em;text-transform:uppercase;opacity:0.6}',
    '@media (prefers-reduced-motion:reduce){',
    `[data-o-crl-strip]{animation:none;transform:translateY(calc(var(--o-crl-rest) * ${String(-LINE)}em))}`,
    '}',
  ].join('')
  document.head.append(style)
}

/** Properties specific to the component. */
export interface CounterRollLoaderOwnProps {
  /** The caption under the drums. Empty string to keep only the drums. @defaultValue 'Loading' */
  text?: string
  /** Number of drums. @defaultValue 3 */
  digits?: number
  /** Reference body size, in pixels; the digits are one and a half times it. @defaultValue 16 */
  size?: number
  /** Duration of a full turn of a drum, in milliseconds. @defaultValue 2000 */
  speed?: number
  /** Color of the digits and of the caption. @defaultValue the text color */
  color?: string
  /** Label announced to screen readers. @defaultValue 'Loading' */
  label?: string
}

/** All the properties. */
export type CounterRollLoaderProps = Customisable<CounterRollLoaderOwnProps, 'span'>

/**
 * Signals a wait with digit drums that turn endlessly.
 *
 * @example
 * <CounterRollLoader />
 *
 * @example
 * // Five drums, slower, in the brand hue.
 * <CounterRollLoader digits={5} speed={3000} color="var(--o-palette-brand-500)" />
 */
export function CounterRollLoader({
  text = 'Loading',
  digits = 3,
  size = 16,
  speed = 2000,
  color = 'currentColor',
  label = 'Loading',
  ...rest
}: CounterRollLoaderProps): ReactElement {
  ensureCounterRollLoaderRule()

  const { className, style } = mergePresentation({}, rest)
  const count = Math.max(1, Math.round(digits))

  const loaderStyle = {
    ...style,
    '--o-crl-size': `${String(size)}px`,
    '--o-crl-speed': `${String(speed)}ms`,
    '--o-crl-color': color,
  } as CSSProperties

  return (
    <span {...rest} className={className} style={loaderStyle} data-o-crl="" role="status">
      <span className="o-sr-only">{label}</span>
      <span aria-hidden data-o-crl-drum="">
        {Array.from({ length: count }, (_, column) => (
          <span key={column} data-o-crl-col="">
            <span
              data-o-crl-strip=""
              style={
                {
                  // An irrational fraction of a turn per column: the drums
                  // never fall back into phase.
                  '--o-crl-delay': `${String(-Math.round(speed * ((column * 0.37) % 1)))}ms`,
                  // At rest, every drum shows a different digit.
                  '--o-crl-rest': String((column * 3) % 10),
                } as CSSProperties
              }
            >
              {STRIP.map((digit, index) => (
                <span key={index}>{digit}</span>
              ))}
            </span>
          </span>
        ))}
      </span>
      {text.length > 0 && (
        <span aria-hidden data-o-crl-text="">
          {text}
        </span>
      )}
    </span>
  )
}

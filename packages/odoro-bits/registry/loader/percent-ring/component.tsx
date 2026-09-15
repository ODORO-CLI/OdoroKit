/**
 * Progress ring: a complete ring that fills from the top, the percentage in
 * the centre.
 *
 * ## The fill is an offset
 *
 * The track and the fill are the same circle. The dash of the second is as
 * long as the circumference, and its offset holds back the share not yet
 * reached: going from 40 to 60 changes only a number, which the browser
 * slides without recomputing layout. The circle starts at three o'clock; a
 * quarter turn backwards makes it start at the top, where one expects the
 * zero of a clock.
 *
 * ## Two modes, two kinds of honesty
 *
 * The determinate mode receives `value` and shows it as is: the ring is a
 * complete `role="progressbar"`, value included, and the figure in the centre
 * is real text. The `indeterminate` mode claims to measure nothing: a
 * quarter-turn arc turns endlessly, the centre stays empty, and the
 * `progressbar` is declared **without** a value — that is how the
 * specification describes unknown progress. Showing an invented percentage
 * would be the classic lie of loaders.
 *
 * Under reduced motion, the value jumps without transition, and the
 * indeterminate arc stays at the top: the figure still reads, only the
 * movement stops.
 *
 * @module
 */

import { mergePresentation, type Customisable } from '@odoro-cli/engine'
import type { CSSProperties, ReactElement } from 'react'

/** Id of the injected stylesheet. */
const STYLE_ID = 'o-percent-ring'

/** Sets the ring, its transition and its rotation, once per document. */
function ensurePercentRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-percent-ring]{position:relative;display:inline-block;line-height:0}',
    '[data-o-percent-ring] svg{display:block}',
    // The circle starts at the top: the rotation is set in CSS so that the
    // animated version can replace it without fighting an attribute.
    '[data-o-pct-fill]{',
    'transform-box:view-box;transform-origin:50% 50%;transform:rotate(-90deg);',
    'transition:stroke-dashoffset var(--o-duration-base) var(--o-ease-standard);',
    '}',
    '[data-o-pct-indeterminate] [data-o-pct-fill]{',
    'transition:none;',
    'animation:o-percent-ring-spin var(--o-pct-speed) linear infinite;',
    '}',
    '@keyframes o-percent-ring-spin{from{transform:rotate(-90deg)}to{transform:rotate(270deg)}}',
    '[data-o-pct-value]{',
    'position:absolute;inset:0;',
    'display:flex;align-items:center;justify-content:center;',
    'line-height:1;font-weight:600;font-variant-numeric:tabular-nums;',
    'font-size:var(--o-pct-font);',
    '}',
    '[data-o-pct-unit]{font-size:0.55em;font-weight:500;opacity:0.6;margin-left:0.1em}',
    '@media (prefers-reduced-motion:reduce){',
    '[data-o-pct-fill]{transition:none}',
    '[data-o-pct-indeterminate] [data-o-pct-fill]{animation:none;transform:rotate(-90deg)}',
    '}',
  ].join('')
  document.head.append(style)
}

/** Props specific to the component. */
export interface PercentRingOwnProps {
  /** Progress, from 0 to 100. Ignored in indeterminate mode. @defaultValue 42 */
  value?: number
  /** Turning arc without a value, when nothing is measurable. @defaultValue false */
  indeterminate?: boolean
  /** Diameter of the ring, in pixels. @defaultValue 80 */
  size?: number
  /** Thickness of the ring, in pixels. @defaultValue 5 */
  thickness?: number
  /** Duration of one turn of the indeterminate arc, in milliseconds. @defaultValue 1000 */
  speed?: number
  /** Colour of the fill. @defaultValue the text colour */
  color?: string
  /** Label announced to screen readers. @defaultValue 'Loading' */
  label?: string
}

/** All props. */
export type PercentRingProps = Customisable<PercentRingOwnProps, 'span'>

/**
 * Progress ring, determinate or turning.
 *
 * @example
 * // Real progress.
 * <PercentRing value={sent / total * 100} />
 *
 * @example
 * // A wait without measure, in the brand hue.
 * <PercentRing indeterminate color="var(--o-palette-brand-500)" />
 */
export function PercentRing({
  value = 42,
  indeterminate = false,
  size = 80,
  thickness = 5,
  speed = 1000,
  color = 'currentColor',
  label = 'Loading',
  ...rest
}: PercentRingProps): ReactElement {
  ensurePercentRule()

  const clamped = Math.min(100, Math.max(0, value))

  // The drawing lives in a 100-unit view: the thickness asked for in pixels
  // is converted so that the stroke keeps its measure at any size.
  const stroke = Math.min((thickness / size) * 100, 25)
  const radius = 50 - stroke / 2
  const circumference = 2 * Math.PI * radius

  const { className, style } = mergePresentation({}, rest)

  const hostStyle = {
    ...style,
    width: `${String(size)}px`,
    height: `${String(size)}px`,
    color,
    '--o-pct-speed': `${String(speed)}ms`,
    '--o-pct-font': `${String(Math.round(size * 0.26))}px`,
  } as CSSProperties

  return (
    <span
      {...rest}
      className={className}
      style={hostStyle}
      data-o-percent-ring=""
      data-o-pct-indeterminate={indeterminate ? '' : undefined}
      role="progressbar"
      aria-label={label}
      // A progressbar without aria-valuenow is indeterminate: it is the
      // normative way of saying "I am advancing, but I do not know by how
      // much".
      aria-valuemin={indeterminate ? undefined : 0}
      aria-valuemax={indeterminate ? undefined : 100}
      aria-valuenow={indeterminate ? undefined : Math.round(clamped)}
    >
      <svg aria-hidden viewBox="0 0 100 100" width="100%" height="100%">
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          opacity={0.15}
        />
        <circle
          data-o-pct-fill=""
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          // At zero, a round cap would still draw a dot.
          strokeLinecap={indeterminate || clamped > 0 ? 'round' : 'butt'}
          strokeDasharray={
            indeterminate
              ? `${String(circumference * 0.25)} ${String(circumference)}`
              : `${String(circumference)} ${String(circumference)}`
          }
          strokeDashoffset={
            indeterminate ? undefined : circumference * (1 - clamped / 100)
          }
        />
      </svg>
      {indeterminate ? null : (
        <span aria-hidden data-o-pct-value="">
          {Math.round(clamped)}
          <span data-o-pct-unit="">%</span>
        </span>
      )}
    </span>
  )
}

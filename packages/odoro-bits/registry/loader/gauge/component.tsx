/**
 * Gauge: a three-quarter-turn arc, graduated, that fills up to the value.
 *
 * ## A dial, not a ring
 *
 * The arc is open at the bottom, like a speedometer: the opening gives the
 * travel a beginning and an end, and the five tick marks make it legible
 * without the figure — one can tell at a glance whether the gauge is at a
 * quarter or at three quarters. The figure, below, confirms it.
 *
 * The filling arc is the same circle as the track, with its dash offset:
 * the visible length is proportional to the value, and changing value only
 * moves the offset. That is a property the browser can slide without
 * recomputing layout.
 *
 * ## Two modes, two kinds of honesty
 *
 * The determinate mode receives `value` and shows it as is: the gauge is a
 * complete `role="progressbar"`, value included. The `indeterminate` mode
 * claims to measure nothing: a short segment sweeps the arc from end to end,
 * the figure disappears, and the `progressbar` is declared **without** a
 * value — that is how the specification describes unknown progress.
 *
 * Under reduced motion, the value jumps without transition, and the
 * indeterminate sweep stops halfway: the gauge still reads, only the
 * movement stops.
 *
 * @module
 */

import { mergePresentation, type Customisable } from '@odoro-cli/engine'
import type { CSSProperties, ReactElement } from 'react'

/** Id of the injected stylesheet. */
const STYLE_ID = 'o-gauge'

/** Share of the turn covered by the arc. */
const SWEEP = 0.75

/** Angle, in degrees from three o'clock, where the arc starts. */
const START = 135

/** Sets the gauge, its transition and its sweep, once per document. */
function ensureGaugeRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-gauge]{position:relative;display:inline-block;line-height:0}',
    '[data-o-gauge] svg{display:block}',
    '[data-o-gauge-fill]{',
    'transition:stroke-dashoffset var(--o-duration-base) var(--o-ease-standard);',
    '}',
    // The sweep: a short segment travels back and forth along the arc.
    '[data-o-gauge-indeterminate] [data-o-gauge-fill]{',
    'transition:none;',
    'animation:o-gauge-sweep var(--o-gauge-speed) ease-in-out infinite alternate;',
    '}',
    '@keyframes o-gauge-sweep{',
    'from{stroke-dashoffset:0}',
    'to{stroke-dashoffset:var(--o-gauge-far)}',
    '}',
    '[data-o-gauge-value]{',
    'position:absolute;left:0;right:0;top:50%;',
    'transform:translateY(-30%);',
    'text-align:center;line-height:1;font-weight:600;',
    'font-variant-numeric:tabular-nums;',
    'font-size:var(--o-gauge-font);',
    '}',
    '@media (prefers-reduced-motion:reduce){',
    '[data-o-gauge-fill]{transition:none}',
    '[data-o-gauge-indeterminate] [data-o-gauge-fill]{animation:none;stroke-dashoffset:var(--o-gauge-rest)}',
    '}',
  ].join('')
  document.head.append(style)
}

/** Props specific to the component. */
export interface GaugeOwnProps {
  /** Value, from 0 to 100. Ignored in indeterminate mode. @defaultValue 64 */
  value?: number
  /** Sweep without a value, when nothing is measurable. @defaultValue false */
  indeterminate?: boolean
  /** Width of the gauge, in pixels. @defaultValue 96 */
  size?: number
  /** Thickness of the arc, in pixels. @defaultValue 8 */
  thickness?: number
  /** Duration of one pass of the indeterminate sweep, in milliseconds. @defaultValue 1600 */
  speed?: number
  /** Colour of the fill. @defaultValue the text colour */
  color?: string
  /** Label announced to screen readers. @defaultValue 'Loading' */
  label?: string
}

/** All props. */
export type GaugeProps = Customisable<GaugeOwnProps, 'span'>

/**
 * Arc gauge, determinate or sweeping.
 *
 * @example
 * // Real progress.
 * <Gauge value={sent / total * 100} />
 *
 * @example
 * // A wait without measure, in the brand hue.
 * <Gauge indeterminate color="var(--o-palette-brand-500)" />
 */
export function Gauge({
  value = 64,
  indeterminate = false,
  size = 96,
  thickness = 8,
  speed = 1600,
  color = 'currentColor',
  label = 'Loading',
  ...rest
}: GaugeProps): ReactElement {
  ensureGaugeRule()

  const clamped = Math.min(100, Math.max(0, value))

  // The drawing lives in a 100-unit view. The tick marks sit outside the
  // arc: the radius leaves them the room.
  const stroke = Math.min((thickness / size) * 100, 20)
  const radius = 50 - stroke / 2 - 7
  const circumference = 2 * Math.PI * radius
  const arc = circumference * SWEEP

  // In indeterminate mode the segment is a fifth of the arc; its travel runs
  // from the start of the arc to its end, minus its own length.
  const sweep = arc * 0.2
  const far = -(arc - sweep)

  const { className, style } = mergePresentation({}, rest)

  const hostStyle = {
    ...style,
    width: `${String(size)}px`,
    height: `${String(size)}px`,
    color,
    '--o-gauge-speed': `${String(speed)}ms`,
    '--o-gauge-far': String(far),
    '--o-gauge-rest': String(far / 2),
    '--o-gauge-font': `${String(Math.round(size * 0.24))}px`,
  } as CSSProperties

  const tickOuter = 50 - (radius + stroke / 2 + 2)
  const tickInner = tickOuter - 4

  return (
    <span
      {...rest}
      className={className}
      style={hostStyle}
      data-o-gauge=""
      data-o-gauge-indeterminate={indeterminate ? '' : undefined}
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
        {[0, 1, 2, 3, 4].map((tick) => (
          <line
            key={tick}
            x1="50"
            y1={tickOuter}
            x2="50"
            y2={tickInner}
            stroke="currentColor"
            strokeWidth={1.5}
            strokeLinecap="round"
            opacity={0.4}
            // A tick mark placed at the top, then turned to its place on the
            // arc: the quarter turn brings the top back to three o'clock.
            transform={`rotate(${String(START + 90 + (tick * (SWEEP * 360)) / 4)} 50 50)`}
          />
        ))}
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${String(arc)} ${String(circumference)}`}
          opacity={0.15}
          transform={`rotate(${String(START)} 50 50)`}
        />
        <circle
          data-o-gauge-fill=""
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
              ? `${String(sweep)} ${String(circumference)}`
              : `${String(arc)} ${String(circumference)}`
          }
          strokeDashoffset={indeterminate ? undefined : arc * (1 - clamped / 100)}
          transform={`rotate(${String(START)} 50 50)`}
        />
      </svg>
      {indeterminate ? null : (
        <span aria-hidden data-o-gauge-value="">
          {Math.round(clamped)}
        </span>
      )}
    </span>
  )
}

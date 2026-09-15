/**
 * Progress ring: an arc that reaches its value by sliding.
 *
 * ## The stroke is an offset perimeter
 *
 * The arc is an SVG circle whose dash is exactly the perimeter: offsetting the
 * dash uncovers the wanted fraction. It is a single property,
 * `stroke-dashoffset`, and a CSS transition makes the trip — changing the
 * value along the way restarts from the current position, with no jump and no
 * JavaScript loop.
 *
 * ## The percentage is in tabular figures
 *
 * While the arc slides, the number at the center does not move by a pixel:
 * tabular figures all have the same advance width, "9" and "1" included.
 * Without that, going from 99 to 100 would make the whole center breathe.
 *
 * ## A progress bar for the accessibility tree
 *
 * `role="progressbar"` and `aria-valuenow`: a screen reader announces the
 * value, not a drawing. The displayed percentage is removed from the tree so
 * as not to be read twice.
 *
 * @module
 */

import { mergePresentation, useMotionState, type Customisable } from '@odoro-cli/engine'
import { type CSSProperties, type ReactElement } from 'react'

/** Props specific to the component. */
export interface ProgressRingOwnProps {
  /** Progress, from zero to a hundred. @defaultValue 65 */
  value?: number
  /** Diameter of the ring, in pixels. @defaultValue 96 */
  size?: number
  /** Thickness of the stroke, in pixels. @defaultValue 8 */
  thickness?: number
  /** Name of the measure for screen readers. @defaultValue 'Progress' */
  label?: string
}

/** All props. */
export type ProgressRingProps = Customisable<ProgressRingOwnProps>

/** Id of the injected stylesheet. */
const STYLE_ID = 'o-progress-ring'

/** Applies the transition of the arc, once per document. */
function ensureRingRules(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-ring]{position:relative;display:inline-grid;place-items:center}',
    '[data-o-ring] svg{transform:rotate(-90deg)}',
    '[data-o-ring-arc]{',
    'stroke:var(--o-ring-tint);',
    'transition:stroke-dashoffset var(--o-duration-slower) var(--o-ease-standard);',
    '}',
    '[data-o-ring-track]{stroke:color-mix(in oklch,currentColor 15%,transparent)}',
    '[data-o-ring-value]{position:absolute}',
    // Reduced motion: the arc jumps straight to its value.
    '@media (prefers-reduced-motion:reduce){',
    '[data-o-ring-arc]{transition:none}',
    '}',
  ].join('')
  document.head.append(style)
}

/**
 * SVG progress ring, with the percentage at the center.
 *
 * @example
 * <ProgressRing value={72} />
 *
 * @example
 * // A large thin ring, named for screen readers.
 * <ProgressRing value={progress} size={160} thickness={4} label="Upload" />
 */
export function ProgressRing({
  value = 65,
  size = 96,
  thickness = 8,
  label = 'Progress',
  ...rest
}: ProgressRingProps): ReactElement {
  const { reduced } = useMotionState()
  ensureRingRules()

  const clamped = Math.max(0, Math.min(100, Math.round(value)))
  const radius = (size - thickness) / 2
  const circumference = 2 * Math.PI * radius

  const { className, style } = mergePresentation({}, rest)

  return (
    <div
      {...rest}
      role="progressbar"
      aria-label={label}
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
      data-o-ring=""
      className={className}
      style={
        {
          ...style,
          '--o-ring-tint': 'var(--o-palette-brand-500)',
          ...(reduced ? { '--o-duration-slower': '0ms' } : {}),
        } as CSSProperties
      }
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${String(size)} ${String(size)}`}
        aria-hidden="true"
      >
        <circle
          data-o-ring-track=""
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={thickness}
        />
        <circle
          data-o-ring-arc=""
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={thickness}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - clamped / 100)}
        />
      </svg>
      <span
        data-o-ring-value=""
        aria-hidden="true"
        className="o-tabular-nums o-font-semibold"
        style={{ fontSize: `${String(Math.max(12, size / 4.5))}px` }}
      >
        {clamped}
        <span className="o-text-xs o-opacity-70">%</span>
      </span>
    </div>
  )
}

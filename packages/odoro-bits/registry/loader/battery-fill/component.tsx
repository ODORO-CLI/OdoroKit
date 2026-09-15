/**
 * Battery charging: a cased cell with a terminal, whose level fills from the
 * left.
 *
 * ## A scale, not a bar
 *
 * The level is a single rectangle scaled horizontally, anchored on the left
 * edge of the case. An animated width would force the browser to redraw the
 * geometry on every frame; a scale is a transform, which the compositor
 * applies without recomputing anything.
 *
 * The case is an outline, the terminal a solid shape: it is the silhouette
 * that says "battery", not the colour. Nothing is hard coded, everything
 * follows `currentColor` — a red battery running out is a decision of the
 * page, not of the component.
 *
 * ## Two modes, two kinds of honesty
 *
 * The determinate mode receives `value` and shows it as is: the battery is a
 * complete `role="progressbar"`, value included. The level slides from one
 * value to the next through a transition, never through a jump.
 *
 * The `indeterminate` mode is charging in progress: the level sweeps the case
 * endlessly, the bolt appears, and the `progressbar` is declared **without** a
 * value — that is how the specification describes an unknown progression. The
 * level is half opaque there so that the bolt, itself solid, stays legible
 * whether it sits over the empty or over the full: two shapes of the same
 * colour are told apart only by their density.
 *
 * Under reduced motion, the value jumps with no transition and the charge
 * stops at mid-course: the battery still reads, only the movement stops.
 *
 * @module
 */

import { mergePresentation, type Customisable } from '@odoro-cli/engine'
import type { CSSProperties, ReactElement } from 'react'

/** Identifier of the injected stylesheet. */
const STYLE_ID = 'o-battery-fill'

/** Left edge of the fillable area, in view units. */
const LEFT = 8

/** Charging bolt, centred in the case. */
const BOLT = 'M 52 11 L 38 27 L 46 27 L 42 37 L 56 21 L 48 21 Z'

/** Applies the case, its transition and its charge, once per document. */
function ensureBatteryRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-battery-fill]{display:inline-block;line-height:0}',
    '[data-o-battery-fill] svg{display:block}',
    // The scale starts from the left edge of the case, in view units.
    '[data-o-battery-level]{',
    `transform-box:view-box;transform-origin:${String(LEFT)}px 24px;`,
    'transition:transform var(--o-duration-base) var(--o-ease-standard);',
    '}',
    '[data-o-battery-charging] [data-o-battery-level]{',
    'transition:none;',
    'animation:o-battery-fill-charge var(--o-battery-speed) ease-in-out infinite;',
    '}',
    // The level restarts from almost nothing: a charge that begins again full
    // would look like a blink, not like a rise.
    '@keyframes o-battery-fill-charge{',
    '0%{transform:scaleX(0.04)}',
    '80%,100%{transform:scaleX(1)}',
    '}',
    '[data-o-battery-bolt]{',
    'transform-box:view-box;transform-origin:47px 24px;',
    'animation:o-battery-fill-spark var(--o-battery-speed) ease-in-out infinite;',
    '}',
    '@keyframes o-battery-fill-spark{',
    '0%,100%{transform:scale(0.88);opacity:0.55}',
    '80%{transform:scale(1);opacity:1}',
    '}',
    '@media (prefers-reduced-motion:reduce){',
    '[data-o-battery-level]{transition:none}',
    '[data-o-battery-charging] [data-o-battery-level]{animation:none;transform:scaleX(0.5)}',
    '[data-o-battery-bolt]{animation:none;transform:none;opacity:1}',
    '}',
  ].join('')
  document.head.append(style)
}

/** Properties specific to the component. */
export interface BatteryFillOwnProps {
  /** Charge, from 0 to 100. Ignored in indeterminate mode. @defaultValue 58 */
  value?: number
  /** Charging in progress, with no measurable value. @defaultValue false */
  indeterminate?: boolean
  /** Width of the battery, in pixels. @defaultValue 96 */
  size?: number
  /** Duration of a full charge, in milliseconds. @defaultValue 2400 */
  speed?: number
  /** Colour of the case and of the level. @defaultValue the text colour */
  color?: string
  /** Label announced to screen readers. @defaultValue 'Loading' */
  label?: string
}

/** All the properties. */
export type BatteryFillProps = Customisable<BatteryFillOwnProps, 'span'>

/**
 * Battery whose level tells the charge, or fills endlessly.
 *
 * @example
 * // Real charge.
 * <BatteryFill value={battery.level * 100} />
 *
 * @example
 * // Charging in progress, in the brand hue.
 * <BatteryFill indeterminate color="var(--o-palette-brand-500)" />
 */
export function BatteryFill({
  value = 58,
  indeterminate = false,
  size = 96,
  speed = 2400,
  color = 'currentColor',
  label = 'Loading',
  ...rest
}: BatteryFillProps): ReactElement {
  ensureBatteryRule()

  const clamped = Math.min(100, Math.max(0, value))

  const { className, style } = mergePresentation({}, rest)

  const hostStyle = {
    ...style,
    width: `${String(size)}px`,
    // The view is 100 by 48: the height follows, otherwise the case would
    // stretch.
    height: `${String(Math.round(size * 0.48))}px`,
    color,
    '--o-battery-speed': `${String(speed)}ms`,
  } as CSSProperties

  return (
    <span
      {...rest}
      className={className}
      style={hostStyle}
      data-o-battery-fill=""
      data-o-battery-charging={indeterminate ? '' : undefined}
      role="progressbar"
      aria-label={label}
      // A progressbar with no aria-valuenow is indeterminate: it is the
      // normative way to say "I am moving, but I do not know by how much".
      aria-valuemin={indeterminate ? undefined : 0}
      aria-valuemax={indeterminate ? undefined : 100}
      aria-valuenow={indeterminate ? undefined : Math.round(clamped)}
    >
      <svg aria-hidden viewBox="0 0 100 48" width="100%" height="100%">
        <rect
          x="1.5"
          y="1.5"
          width="86"
          height="45"
          rx="9"
          fill="none"
          stroke="currentColor"
          strokeWidth={3}
          opacity={0.5}
        />
        <rect
          x="91"
          y="15"
          width="7.5"
          height="18"
          rx="3"
          fill="currentColor"
          opacity={0.5}
        />
        <rect
          data-o-battery-level=""
          x={LEFT}
          y="8"
          width="73"
          height="32"
          rx="4"
          fill="currentColor"
          fillOpacity={indeterminate ? 0.45 : 1}
          style={
            indeterminate
              ? undefined
              : { transform: `scaleX(${(clamped / 100).toFixed(4)})` }
          }
        />
        {indeterminate ? (
          <path data-o-battery-bolt="" d={BOLT} fill="currentColor" />
        ) : null}
      </svg>
    </span>
  )
}

/**
 * Dashed ring: the pattern slides along the circle, nothing rotates.
 *
 * ## An offset, not a rotation
 *
 * The circle is complete and still. What moves is the offset of its dash
 * pattern: on every frame, the pattern is picked up a little further along the
 * path, and the dashes seem to flow around the ring. The difference from a
 * rotation is plain to the eye: no dash has a head or a tail, the movement is
 * that of a chain, not of a needle.
 *
 * The pitch of the pattern is an exact fraction of the circumference — that is
 * the only way to get a seamless loop: an offset of one full circumference
 * puts the pattern exactly back onto itself.
 *
 * The dash offset is not a property the compositor holds: the ring is
 * repainted on every frame. At the size of a loader, that is an invisible
 * cost; it is the price of a movement a rotation cannot produce.
 *
 * ## A status, not a drawing
 *
 * The element carries `role="status"` and a label for screen readers: waiting
 * is information, not decoration. The drawing itself is removed from the
 * accessibility tree.
 *
 * Under reduced motion, the dash pattern stays put: a dashed ring still reads
 * as a loader, only the movement stops.
 *
 * @module
 */

import { mergePresentation, type Customisable } from '@odoro-cli/engine'
import type { CSSProperties, ReactElement } from 'react'

/** Identifier of the injected stylesheet. */
const STYLE_ID = 'o-dash-ring'

/** Sets up the gliding of the dash pattern, once per document. */
function ensureDashRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-dash-ring]{display:inline-block;line-height:0}',
    '[data-o-dash-ring] svg{display:block}',
    '[data-o-dash-path]{',
    'animation:o-dash-ring-glide var(--o-dash-speed) linear infinite;',
    '}',
    // The end of the run is a whole circumference, negative: the pattern moves
    // clockwise and falls back onto itself.
    '@keyframes o-dash-ring-glide{',
    'from{stroke-dashoffset:0}',
    'to{stroke-dashoffset:var(--o-dash-loop)}',
    '}',
    '@media (prefers-reduced-motion:reduce){',
    '[data-o-dash-path]{animation:none}',
    '}',
  ].join('')
  document.head.append(style)
}

/** Props of the component itself. */
export interface DashRingOwnProps {
  /** Diameter of the ring, in pixels. @defaultValue 48 */
  size?: number
  /** Thickness of the dashes, in pixels. @defaultValue 4 */
  thickness?: number
  /** Number of dashes around the turn. @defaultValue 12 */
  dashes?: number
  /** Time for one dash to go all the way round, in milliseconds. @defaultValue 2400 */
  speed?: number
  /** Colour of the dashes. @defaultValue the text colour */
  color?: string
  /** Label announced to screen readers. @defaultValue 'Loading' */
  label?: string
}

/** All the props. */
export type DashRingProps = Customisable<DashRingOwnProps, 'span'>

/**
 * Signals a wait through a dash pattern flowing around a ring.
 *
 * @example
 * <DashRing />
 *
 * @example
 * // More dashes, thinner, in the brand hue.
 * <DashRing dashes={24} thickness={2} color="var(--o-palette-brand-500)" />
 */
export function DashRing({
  size = 48,
  thickness = 4,
  dashes = 12,
  speed = 2400,
  color = 'currentColor',
  label = 'Loading',
  ...rest
}: DashRingProps): ReactElement {
  ensureDashRule()

  const { className, style } = mergePresentation({}, rest)

  // The drawing lives in a view of 100 units: the thickness asked for in
  // pixels is converted so that the stroke keeps its measure at any size.
  const stroke = Math.min((thickness / size) * 100, 25)
  const radius = 50 - stroke / 2
  const circumference = 2 * Math.PI * radius

  // The pitch divides the circumference exactly: the loop is seamless.
  const count = Math.max(1, Math.round(dashes))
  const period = circumference / count
  const dash = period * 0.55

  const loaderStyle = {
    ...style,
    width: `${String(size)}px`,
    height: `${String(size)}px`,
    color,
    '--o-dash-speed': `${String(speed)}ms`,
    '--o-dash-loop': String(-circumference),
  } as CSSProperties

  return (
    <span
      {...rest}
      className={className}
      style={loaderStyle}
      data-o-dash-ring=""
      role="status"
    >
      <span className="o-sr-only">{label}</span>
      <svg aria-hidden viewBox="0 0 100 100" width="100%" height="100%">
        <circle
          data-o-dash-path=""
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          strokeDasharray={`${String(dash)} ${String(period - dash)}`}
        />
      </svg>
    </span>
  )
}

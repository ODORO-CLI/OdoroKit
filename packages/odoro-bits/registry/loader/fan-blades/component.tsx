/**
 * Fan blades: curved blades turn at a constant speed inside a circular guard,
 * around a hub.
 *
 * ## One blade, drawn once
 *
 * The blade is a single path: it leaves the hub, flares out in a curve towards
 * the guard and comes back on a tighter curve. That sickle drawing is what
 * tells it apart from a petal or a triangle: a blade has a leading edge and a
 * trailing edge, and the eye reads the direction of rotation before it even
 * moves. The other blades are copies turned by an equal angle around the hub.
 *
 * The rotation is linear, on purpose. A running fan does not run out of
 * breath; it is `pinwheel` that turns in gusts. The guard and the hub do not
 * move: they give the frame within which the rotation is measured.
 *
 * A single animation, on the group of blades, held by the compositor. No
 * JavaScript after the first render.
 *
 * ## A status, not a drawing
 *
 * The element carries `role="status"` and a label for screen readers: the wait
 * is information, not decoration. The drawing is removed from the
 * accessibility tree.
 *
 * Under reduced motion, the blades stay still inside their guard: the figure
 * still reads as a loader, only the motion stops.
 *
 * @module
 */

import { mergePresentation, type Customisable } from '@odoro-cli/engine'
import type { CSSProperties, ReactElement } from 'react'

/** Identifier of the injected stylesheet. */
const STYLE_ID = 'o-fan-blades'

/**
 * A blade pointing upwards, from the hub (50, 50) to the guard, in a view of
 * 100 units. The leading edge is the wide curve, the trailing edge the tight
 * curve that comes back to the hub.
 */
const BLADE = 'M 50 50 C 36 30 52 6 72 16 C 82 24 76 44 50 50 Z'

/** Sets the fan and its rotation, once per document. */
function ensureFanRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-fan-blades]{display:inline-block;line-height:0}',
    '[data-o-fan-blades] svg{display:block}',
    '[data-o-fan-rotor]{',
    'transform-box:view-box;transform-origin:50px 50px;',
    'animation:o-fan-blades-spin var(--o-fan-speed) linear infinite;',
    '}',
    '[data-o-fan-guard]{opacity:0.25}',
    '@keyframes o-fan-blades-spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}',
    '@media (prefers-reduced-motion:reduce){',
    '[data-o-fan-rotor]{animation:none;transform:none}',
    '}',
  ].join('')
  document.head.append(style)
}

/** Properties specific to the component. */
export interface FanBladesOwnProps {
  /** Diameter of the guard, in pixels. @defaultValue 48 */
  size?: number
  /** Number of blades. @defaultValue 3 */
  blades?: number
  /** Duration of one turn, in milliseconds. @defaultValue 1400 */
  speed?: number
  /** Colour of the blades, the hub and the guard. @defaultValue the text colour */
  color?: string
  /** Label announced to screen readers. @defaultValue 'Loading' */
  label?: string
}

/** All the properties. */
export type FanBladesProps = Customisable<FanBladesOwnProps, 'span'>

/**
 * Signals a wait with blades turning inside their guard.
 *
 * @example
 * <FanBlades />
 *
 * @example
 * // Five blades, faster, in the brand hue.
 * <FanBlades blades={5} speed={900} color="var(--o-palette-brand-500)" />
 */
export function FanBlades({
  size = 48,
  blades = 3,
  speed = 1400,
  color = 'currentColor',
  label = 'Loading',
  ...rest
}: FanBladesProps): ReactElement {
  ensureFanRule()

  const { className, style } = mergePresentation({}, rest)

  const count = Math.max(2, Math.round(blades))

  const loaderStyle = {
    ...style,
    width: `${String(size)}px`,
    height: `${String(size)}px`,
    color,
    '--o-fan-speed': `${String(speed)}ms`,
  } as CSSProperties

  return (
    <span
      {...rest}
      className={className}
      style={loaderStyle}
      data-o-fan-blades=""
      role="status"
    >
      <span className="o-sr-only">{label}</span>
      <svg aria-hidden viewBox="0 0 100 100" width="100%" height="100%">
        <circle
          data-o-fan-guard=""
          cx="50"
          cy="50"
          r="47"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
        />
        <g data-o-fan-rotor="">
          {Array.from({ length: count }, (_, index) => (
            <path
              key={index}
              d={BLADE}
              fill="currentColor"
              transform={`rotate(${String((index * 360) / count)} 50 50)`}
            />
          ))}
          <circle cx="50" cy="50" r="9" fill="currentColor" />
        </g>
      </svg>
    </span>
  )
}

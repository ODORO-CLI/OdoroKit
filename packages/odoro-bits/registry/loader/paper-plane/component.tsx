/**
 * Paper plane: a plane crosses the view diving then climbing back up, and
 * leaves behind it the exact trace of its passage.
 *
 * ## One single curve, two animations that cannot drift apart
 *
 * The plane follows a curve; the trail is that same curve drawing itself.
 * The trap is a classic one: the plane advances in parameter — in equal
 * steps of `t` — while a dashed stroke advances in arc length. On a curve
 * that changes speed, the two drift apart, and the plane ends up flying
 * ahead of or behind its own trace.
 *
 * The curve is therefore sampled once, when the module loads, and both
 * animations are written from **the same table**: at each sample, the
 * position and the angle of the plane on one side, the length already
 * covered on the other. Both sets of keyframes land on the same
 * percentages; there is nothing left that could drift.
 *
 * The angle comes from the derivative of the curve, not from a value picked
 * by hand: the nose of the plane always points exactly where it is going,
 * the bottom of the dive included.
 *
 * The path declares a length of a hundred, which lets the dash offsets be
 * written as a percentage of the run, without measuring anything at all in
 * the document.
 *
 * Three CSS animations on SVG elements, held by the compositor, no
 * JavaScript after the first render.
 *
 * ## A status, not a drawing
 *
 * The element carries `role="status"` and a label for screen readers: the
 * wait is information, not decoration. The drawing is removed from the
 * accessibility tree.
 *
 * Under reduced motion, the plane is set at the end of its run, trail
 * complete: the journey is told by its result.
 *
 * @module
 */

import { mergePresentation, type Customisable } from '@odoro-cli/engine'
import type { CSSProperties, ReactElement } from 'react'

/** Id of the injected stylesheet. */
const STYLE_ID = 'o-paper-plane'

/**
 * The flight curve, in a view of 100 units: start at the bottom left,
 * trough in the middle, exit at the top right.
 */
const P0 = { x: 10, y: 82 }
const P1 = { x: 34, y: 90 }
const P2 = { x: 54, y: 14 }
const P3 = { x: 90, y: 30 }

/** The same stroke, for the trail: both come from the same points. */
const TRAIL = `M ${String(P0.x)} ${String(P0.y)} C ${String(P1.x)} ${String(P1.y)}, ${String(P2.x)} ${String(P2.y)}, ${String(P3.x)} ${String(P3.y)}`

/**
 * The plane, drawn around the origin, nose to the right, in two half
 * wings: the central fold is not a stroke, it is the boundary between a full
 * wing and a wing set back, as on a folded sheet seen at an angle.
 */
const WING_NEAR = 'M 12 0 L -12 -8.5 L -6 0 Z'

/** The far wing, in the shadow of the fold. */
const WING_FAR = 'M 12 0 L -12 8.5 L -6 0 Z'

/** Number of samples of the curve. Enough that the eye does not see the segments. */
const SAMPLES = 24

/** Share of the cycle taken by the flight, in per cent. The rest is the fade. */
const FLIGHT = 76

/** One point of the flight: where the plane is, how it is oriented, where the trail stands. */
interface Sample {
  /** Moment in the cycle, in per cent. */
  readonly at: number
  /** Abscissa, in view units. */
  readonly x: number
  /** Ordinate, in view units. */
  readonly y: number
  /** Heading, in degrees. */
  readonly angle: number
  /** Share of the stroke still to draw, in per cent. */
  readonly left: number
}

/** Position and heading on the curve, at a given parameter. */
function sampleAt(t: number): { x: number; y: number; angle: number } {
  const u = 1 - t
  const x =
    u * u * u * P0.x + 3 * u * u * t * P1.x + 3 * u * t * t * P2.x + t * t * t * P3.x
  const y =
    u * u * u * P0.y + 3 * u * u * t * P1.y + 3 * u * t * t * P2.y + t * t * t * P3.y

  // The derivative of a cubic Bezier: it is what gives the heading, and
  // not an orientation set by eye, frame after frame.
  const dx =
    3 * u * u * (P1.x - P0.x) + 6 * u * t * (P2.x - P1.x) + 3 * t * t * (P3.x - P2.x)
  const dy =
    3 * u * u * (P1.y - P0.y) + 6 * u * t * (P2.y - P1.y) + 3 * t * t * (P3.y - P2.y)

  return { x, y, angle: (Math.atan2(dy, dx) * 180) / Math.PI }
}

/**
 * Samples the curve once and for all.
 *
 * The length is accumulated along the polyline of the samples: it is the
 * same approximation as the one the eye sees, so the error between the plane
 * and its trail is that of the drawing itself, not one error more.
 */
function buildFlight(): readonly Sample[] {
  const points: { x: number; y: number; angle: number }[] = []
  for (let index = 0; index <= SAMPLES; index += 1) points.push(sampleAt(index / SAMPLES))

  const walked: number[] = []
  let total = 0
  let previous: { x: number; y: number } | undefined
  for (const point of points) {
    if (previous !== undefined)
      total += Math.hypot(point.x - previous.x, point.y - previous.y)
    walked.push(total)
    previous = point
  }

  return points.map((point, index) => ({
    at: (index / SAMPLES) * FLIGHT,
    x: point.x,
    y: point.y,
    angle: point.angle,
    left: 100 * (1 - (walked[index] ?? 0) / total),
  }))
}

/** The flight, computed once when the module loads. */
const FLIGHT_PATH = buildFlight()

/** Sets the plane, its trail and their fade, once per document. */
function ensurePlaneRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const last = FLIGHT_PATH[FLIGHT_PATH.length - 1]
  const end = last ?? { at: FLIGHT, x: P3.x, y: P3.y, angle: 0, left: 0 }

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-paper-plane]{display:inline-block;line-height:0}',
    '[data-o-paper-plane] svg{display:block}',
    '[data-o-plane-fade]{animation:o-paper-plane-fade var(--o-plane-speed) infinite}',
    '[data-o-plane-body],[data-o-plane-trail]{',
    'transform-box:view-box;',
    'animation-duration:var(--o-plane-speed);animation-iteration-count:infinite;',
    'animation-timing-function:linear;',
    '}',
    '[data-o-plane-body]{animation-name:o-paper-plane-fly}',
    '[data-o-plane-trail]{',
    'stroke-dasharray:100 100;stroke-dashoffset:100;animation-name:o-paper-plane-trail;',
    '}',
    '@keyframes o-paper-plane-fly{',
    ...FLIGHT_PATH.map(
      (point) =>
        `${point.at.toFixed(2)}%{transform:translate(${point.x.toFixed(2)}px,${point.y.toFixed(2)}px) rotate(${point.angle.toFixed(1)}deg)}`,
    ),
    // The plane holds its last pose while everything fades out: without this
    // keyframe, it would drift gently back to its starting point.
    `100%{transform:translate(${end.x.toFixed(2)}px,${end.y.toFixed(2)}px) rotate(${end.angle.toFixed(1)}deg)}`,
    '}',
    '@keyframes o-paper-plane-trail{',
    ...FLIGHT_PATH.map(
      (point) => `${point.at.toFixed(2)}%{stroke-dashoffset:${point.left.toFixed(2)}}`,
    ),
    '100%{stroke-dashoffset:0}',
    '}',
    // The fade covers the whole: the plane and its trail disappear together,
    // and the cycle starts again from an empty view rather than from a jump.
    '@keyframes o-paper-plane-fade{',
    '0%{opacity:0;animation-timing-function:ease-out}',
    `6%,${String(FLIGHT)}%{opacity:1;animation-timing-function:ease-in}`,
    '92%,100%{opacity:0}',
    '}',
    // Plane set at the end of its run, trail complete: the journey told by
    // its result.
    '@media (prefers-reduced-motion:reduce){',
    '[data-o-plane-fade]{animation:none;opacity:1}',
    '[data-o-plane-trail]{animation:none;stroke-dashoffset:0}',
    `[data-o-plane-body]{animation:none;transform:translate(${end.x.toFixed(2)}px,${end.y.toFixed(2)}px) rotate(${end.angle.toFixed(1)}deg)}`,
    '}',
  ].join('')
  document.head.append(style)
}

/** The component's own props. */
export interface PaperPlaneOwnProps {
  /** Side of the drawing, in pixels. @defaultValue 80 */
  size?: number
  /** Duration of one complete flight, fade included, in milliseconds. @defaultValue 2600 */
  speed?: number
  /** Color of the plane and its trail. @defaultValue the text color */
  color?: string
  /** Label announced to screen readers. @defaultValue 'Loading' */
  label?: string
}

/** All props. */
export type PaperPlaneProps = Customisable<PaperPlaneOwnProps, 'span'>

/**
 * Signals a wait with a paper plane that traces its passage.
 *
 * @example
 * <PaperPlane />
 *
 * @example
 * // Bigger, slower, in the brand hue.
 * <PaperPlane size={120} speed={3600} color="var(--o-palette-brand-500)" />
 */
export function PaperPlane({
  size = 80,
  speed = 2600,
  color = 'currentColor',
  label = 'Loading',
  ...rest
}: PaperPlaneProps): ReactElement {
  ensurePlaneRule()

  const { className, style } = mergePresentation({}, rest)

  const loaderStyle = {
    ...style,
    width: `${String(size)}px`,
    height: `${String(size)}px`,
    color,
    '--o-plane-speed': `${String(speed)}ms`,
  } as CSSProperties

  return (
    <span
      {...rest}
      className={className}
      style={loaderStyle}
      data-o-paper-plane=""
      role="status"
    >
      <span className="o-sr-only">{label}</span>
      <svg aria-hidden viewBox="0 0 100 100" width="100%" height="100%">
        <g data-o-plane-fade="">
          <path
            data-o-plane-trail=""
            d={TRAIL}
            pathLength={100}
            fill="none"
            stroke="currentColor"
            strokeWidth={2.5}
            strokeOpacity={0.35}
            strokeLinecap="round"
            strokeDasharray="100 100"
          />
          <g data-o-plane-body="">
            <path d={WING_FAR} fill="currentColor" fillOpacity={0.55} />
            <path d={WING_NEAR} fill="currentColor" />
          </g>
        </g>
      </svg>
    </span>
  )
}

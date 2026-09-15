/**
 * Comet: a dot runs around a circle, a trail fading out behind it.
 *
 * ## The trail is a stack of arcs
 *
 * An SVG stroke cannot fade out along its own run: a gradient does not follow
 * a curve. The trail is therefore made of five arcs of decreasing lengths, all
 * ending under the head, each of them barely opaque. Where they overlap — near
 * the head — the opacities add up; far behind, only the longest and palest one
 * is left. Five steps are enough: at the size of a loader, the eye blends them
 * into a single gradient.
 *
 * The head is a disc wider than the trail: it is the thing the eye follows,
 * and it is what says which way the movement goes — a trail on its own could
 * run in either direction.
 *
 * A dimmed orbit stays visible under the comet: without it, the dot would
 * float and the circle would only read after a complete turn.
 *
 * A single group turns, through a CSS animation. No JavaScript after the first
 * render.
 *
 * ## A status, not a drawing
 *
 * The element carries `role="status"` and a label for screen readers: waiting
 * is information, not decoration. The drawing itself is removed from the
 * accessibility tree.
 *
 * Under reduced motion, the comet stays at the top of its orbit: a dot and its
 * trail still read as a loader, only the movement stops.
 *
 * @module
 */

import { mergePresentation, type Customisable } from '@odoro-cli/engine'
import type { CSSProperties, ReactElement } from 'react'

/** Identifier of the injected stylesheet. */
const STYLE_ID = 'o-comet-ring'

/** Sets up the rotation of the comet, once per document. */
function ensureCometRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-comet-ring]{display:inline-block;line-height:0}',
    '[data-o-comet-ring] svg{display:block}',
    '[data-o-comet-body]{',
    'transform-box:view-box;transform-origin:50% 50%;',
    'animation:o-comet-ring-spin var(--o-comet-speed) linear infinite;',
    '}',
    '@keyframes o-comet-ring-spin{from{transform:rotate(0turn)}to{transform:rotate(1turn)}}',
    '@media (prefers-reduced-motion:reduce){',
    '[data-o-comet-body]{animation:none;transform:none}',
    '}',
  ].join('')
  document.head.append(style)
}

/** Props of the component itself. */
export interface CometRingOwnProps {
  /** Diameter of the orbit, in pixels. @defaultValue 48 */
  size?: number
  /** Thickness of the trail, in pixels; the head is close to twice that. @defaultValue 3 */
  thickness?: number
  /** Length of the trail, in degrees of orbit. @defaultValue 150 */
  tail?: number
  /** Duration of one turn, in milliseconds. @defaultValue 1100 */
  speed?: number
  /** Colour of the comet. @defaultValue the text colour */
  color?: string
  /** Label announced to screen readers. @defaultValue 'Loading' */
  label?: string
}

/** All the props. */
export type CometRingProps = Customisable<CometRingOwnProps, 'span'>

/**
 * The steps of the trail: share of the total length, opacity.
 *
 * From the longest and palest to the shortest and boldest. The opacities are
 * chosen so that the stack, under the head, comes close to solid without
 * reaching it: the head has to stay the densest point.
 */
const TRAIL = [
  { share: 1, opacity: 0.1 },
  { share: 0.66, opacity: 0.14 },
  { share: 0.4, opacity: 0.2 },
  { share: 0.2, opacity: 0.3 },
  { share: 0.08, opacity: 0.5 },
] as const

/**
 * Signals a wait through a comet running along its orbit.
 *
 * @example
 * <CometRing />
 *
 * @example
 * // A long trail, slow, in the brand hue.
 * <CometRing size={80} tail={240} speed={2000} color="var(--o-palette-brand-500)" />
 */
export function CometRing({
  size = 48,
  thickness = 3,
  tail = 150,
  speed = 1100,
  color = 'currentColor',
  label = 'Loading',
  ...rest
}: CometRingProps): ReactElement {
  ensureCometRule()

  const { className, style } = mergePresentation({}, rest)

  // The drawing lives in a view of 100 units. The head sticks out past the
  // stroke: the radius leaves room for its diameter, not just the thickness.
  const stroke = Math.min((thickness / size) * 100, 20)
  const head = stroke * 0.9
  const radius = 50 - head
  const circumference = 2 * Math.PI * radius
  const tailLength = Math.min(Math.max(tail, 0), 340)

  const loaderStyle = {
    ...style,
    width: `${String(size)}px`,
    height: `${String(size)}px`,
    color,
    '--o-comet-speed': `${String(speed)}ms`,
  } as CSSProperties

  return (
    <span
      {...rest}
      className={className}
      style={loaderStyle}
      data-o-comet-ring=""
      role="status"
    >
      <span className="o-sr-only">{label}</span>
      <svg aria-hidden viewBox="0 0 100 100" width="100%" height="100%">
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          opacity={0.12}
        />
        <g data-o-comet-body="">
          {TRAIL.map((layer, index) => {
            // Each arc starts `angle` degrees before the top and ends there:
            // the dash pattern of a circle begins at three o'clock, hence the
            // quarter turn subtracted.
            const angle = tailLength * layer.share
            return (
              <circle
                key={index}
                cx="50"
                cy="50"
                r={radius}
                fill="none"
                stroke="currentColor"
                strokeWidth={stroke}
                strokeLinecap="round"
                strokeDasharray={`${String((circumference * angle) / 360)} ${String(circumference)}`}
                opacity={layer.opacity}
                transform={`rotate(${String(-90 - angle)} 50 50)`}
              />
            )
          })}
          <circle cx="50" cy={50 - radius} r={head} fill="currentColor" />
        </g>
      </svg>
    </span>
  )
}

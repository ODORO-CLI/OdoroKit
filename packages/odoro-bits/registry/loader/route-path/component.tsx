/**
 * Route: a road draws itself from the starting point all the way to the
 * destination, which lights up on arrival.
 *
 * ## A route is travelled, it does not blink
 *
 * The stroke is a dash as long as the whole path: sliding it by its offset
 * amounts to moving a head forward, from the start toward the destination,
 * without the tail moving at all. It is the gesture of a finger on a map,
 * not a fill.
 *
 * The path declares a length of a hundred: the dash and its offset then read
 * as a percentage of the stroke, whatever its real length. The keyframes
 * fall right without any measurement being read from the document.
 *
 * Under the stroke, the dotted road stays visible at all times: without it,
 * a half-travelled route is only a curve that stops, and the eye does not
 * know where it goes. The destination, on the other hand, only appears on
 * arrival — that is what makes the difference between "on the way" and
 * "arrived".
 *
 * The loop does not rewind: once the destination is reached, the stroke
 * fades out, and the cycle starts again from an empty path. Going backwards
 * would give a route being undone, which means nothing.
 *
 * Two CSS animations on SVG elements, held by the compositor, no JavaScript
 * after the first render.
 *
 * ## A status, not a drawing
 *
 * The element carries `role="status"` and a label for screen readers: the
 * wait is information, not decoration. The drawing is removed from the
 * accessibility tree.
 *
 * Under reduced motion, the road is drawn in full and the destination lit:
 * it is the arrival state, the one that says the most.
 *
 * @module
 */

import { mergePresentation, type Customisable } from '@odoro-cli/engine'
import type { CSSProperties, ReactElement } from 'react'

/** Id of the injected stylesheet. */
const STYLE_ID = 'o-route-path'

/**
 * The route, in a view of 100 units.
 *
 * Two cubic curves joined together: the road winds instead of running
 * straight, which gives the journey a readable duration.
 */
const ROUTE = 'M 14 82 C 34 82, 28 58, 46 54 C 64 50, 58 32, 76 28'

/** Start of the road. */
const FROM = { x: 14, y: 82 }

/** Destination. */
const TO = { x: 76, y: 28 }

/** Sets the road, its stroke and the arrival, once per document. */
function ensureRouteRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-route-path]{display:inline-block;line-height:0}',
    '[data-o-route-path] svg{display:block}',
    '[data-o-route-line]{',
    'stroke-dasharray:100 100;stroke-dashoffset:100;',
    'animation:o-route-path-draw var(--o-route-speed) infinite;',
    '}',
    '[data-o-route-goal]{',
    'transform-box:view-box;opacity:0;',
    `transform-origin:${String(TO.x)}px ${String(TO.y)}px;`,
    'animation:o-route-path-land var(--o-route-speed) infinite;',
    '}',
    // The head moves from the start to the destination, holds a beat, then
    // the stroke fades out: the cycle starts again from an empty path, never
    // from a step backwards.
    '@keyframes o-route-path-draw{',
    '0%{stroke-dashoffset:100;opacity:1;animation-timing-function:ease-in-out}',
    '62%{stroke-dashoffset:0;opacity:1}',
    '84%{stroke-dashoffset:0;opacity:1;animation-timing-function:ease-in}',
    '100%{stroke-dashoffset:0;opacity:0}',
    '}',
    // The destination lands with a slight overshoot, like a pin being stuck
    // in, just as the head reaches it.
    '@keyframes o-route-path-land{',
    '0%,54%{transform:scale(0.3);opacity:0;animation-timing-function:cubic-bezier(0.34,1.56,0.64,1)}',
    '70%{transform:scale(1);opacity:1}',
    '84%{transform:scale(1);opacity:1;animation-timing-function:ease-in}',
    '100%{transform:scale(1);opacity:0}',
    '}',
    // Road travelled, destination lit: the arrival state, still.
    '@media (prefers-reduced-motion:reduce){',
    '[data-o-route-line]{animation:none;stroke-dashoffset:0}',
    '[data-o-route-goal]{animation:none;opacity:1;transform:none}',
    '}',
  ].join('')
  document.head.append(style)
}

/** The component's own props. */
export interface RoutePathOwnProps {
  /** Side of the drawing, in pixels. @defaultValue 72 */
  size?: number
  /** Thickness of the road, in pixels. @defaultValue 4 */
  thickness?: number
  /** Duration of one complete journey, in milliseconds. @defaultValue 2400 */
  speed?: number
  /** Color of the road and the markers. @defaultValue the text color */
  color?: string
  /** Label announced to screen readers. @defaultValue 'Loading' */
  label?: string
}

/** All props. */
export type RoutePathProps = Customisable<RoutePathOwnProps, 'span'>

/**
 * Signals a wait with a route that draws itself to its destination.
 *
 * @example
 * <RoutePath />
 *
 * @example
 * // Bigger, slower, in the brand hue.
 * <RoutePath size={112} speed={3200} color="var(--o-palette-brand-500)" />
 */
export function RoutePath({
  size = 72,
  thickness = 4,
  speed = 2400,
  color = 'currentColor',
  label = 'Loading',
  ...rest
}: RoutePathProps): ReactElement {
  ensureRouteRule()

  const { className, style } = mergePresentation({}, rest)

  // The drawing lives in a view of 100 units: the thickness asked for in
  // pixels is converted so the road keeps its measure at any size.
  const stroke = Math.min((thickness / size) * 100, 12)

  const loaderStyle = {
    ...style,
    width: `${String(size)}px`,
    height: `${String(size)}px`,
    color,
    '--o-route-speed': `${String(speed)}ms`,
  } as CSSProperties

  return (
    <span
      {...rest}
      className={className}
      style={loaderStyle}
      data-o-route-path=""
      role="status"
    >
      <span className="o-sr-only">{label}</span>
      <svg aria-hidden viewBox="0 0 100 100" width="100%" height="100%">
        <path
          d={ROUTE}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          strokeOpacity={0.32}
          strokeLinecap="round"
          strokeDasharray={`${(stroke * 0.35).toFixed(2)} ${(stroke * 1.15).toFixed(2)}`}
        />
        <path
          data-o-route-line=""
          d={ROUTE}
          pathLength={100}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          strokeLinecap="round"
        />
        <circle cx={FROM.x} cy={FROM.y} r={stroke * 1.1} fill="currentColor" />
        <g data-o-route-goal="">
          <circle
            cx={TO.x}
            cy={TO.y}
            r={stroke * 2.1}
            fill="none"
            stroke="currentColor"
            strokeWidth={stroke * 0.7}
          />
          <circle cx={TO.x} cy={TO.y} r={stroke * 0.8} fill="currentColor" />
        </g>
      </svg>
    </span>
  )
}

/**
 * Windmill: four latticed sails turn on their tower, to the rhythm of a
 * wind that blows in gusts.
 *
 * ## The wind is not constant, the tower does not move
 *
 * A fan turns at constant speed because a motor drives it. A windmill
 * depends on the wind, and the wind comes in puffs: the sails gather
 * momentum, hold for a moment, then lose their speed until they nearly
 * stop, and the next gust sets them going again. That is what the keyframes
 * of one turn lay down: an `ease-in` pickup, a linear plateau, an
 * `ease-out` ending. The loop closes at zero speed on both sides, without a
 * jolt. The sails turn counter-clockwise, like those of the mills one sees
 * head-on.
 *
 * Each sail is a latticed blade on one side of its arm: it is that drawing,
 * and not a plain cross, that makes a windmill recognizable at this size.
 * Only one sail is described, the other three are its copies turned a
 * quarter turn around the hub.
 *
 * A rotation animation on an SVG group, held by the compositor, no
 * JavaScript after the first render.
 *
 * ## A status, not a drawing
 *
 * The element carries `role="status"` and a label for screen readers: the
 * wait is information, not decoration. The windmill is removed from the
 * accessibility tree.
 *
 * Under reduced motion, the sails are at a standstill, in an upright cross:
 * it is a windmill in calm weather, and the figure is still recognizable.
 *
 * @module
 */

import { mergePresentation, type Customisable } from '@odoro-cli/engine'
import type { CSSProperties, ReactElement } from 'react'

/** Id of the injected stylesheet. */
const STYLE_ID = 'o-windmill'

/** The hub, where the sails attach, in a view of 100. */
const HUB = { x: 50, y: 42 }

/** Length of one arm, from the hub to its tip. */
const ARM = 36

/** The tower, a trapezoid under the hub. */
const TOWER = `M 41 96 L 59 96 L 55 ${String(HUB.y)} L 45 ${String(HUB.y)} Z`

/** The four orientations of the sails, in degrees. */
const SAILS = [0, 90, 180, 270] as const

/** Sets the windmill and its gusting rotation, once per document. */
function ensureWindmillRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-windmill]{display:inline-block;line-height:0}',
    '[data-o-windmill] svg{display:block}',
    '[data-o-windmill-sails]{',
    `transform-box:view-box;transform-origin:${String(HUB.x)}px ${String(HUB.y)}px;`,
    'animation:o-windmill-gust var(--o-windmill-speed) infinite;',
    '}',
    // One gust per turn: momentum, plateau, then the sails die down.
    '@keyframes o-windmill-gust{',
    '0%{transform:rotate(0deg);animation-timing-function:ease-in}',
    '35%{transform:rotate(-150deg);animation-timing-function:linear}',
    '65%{transform:rotate(-270deg);animation-timing-function:ease-out}',
    '100%{transform:rotate(-360deg)}',
    '}',
    // The sails in an upright cross: a windmill in calm weather.
    '@media (prefers-reduced-motion:reduce){',
    '[data-o-windmill-sails]{animation:none;transform:none}',
    '}',
  ].join('')
  document.head.append(style)
}

/** The component's own props. */
export interface WindmillOwnProps {
  /** Height of the windmill, in pixels. @defaultValue 56 */
  size?: number
  /** Duration of one turn of the sails, gust included, in milliseconds. @defaultValue 2400 */
  speed?: number
  /** Color of the tower and the sails. @defaultValue the text color */
  color?: string
  /** Label announced to screen readers. @defaultValue 'Loading' */
  label?: string
}

/** All props. */
export type WindmillProps = Customisable<WindmillOwnProps, 'span'>

/**
 * Signals a wait with a windmill whose sails turn in gusts.
 *
 * @example
 * <Windmill />
 *
 * @example
 * // Bigger, slower, in the brand hue.
 * <Windmill size={96} speed={4000} color="var(--o-palette-brand-500)" />
 */
export function Windmill({
  size = 56,
  speed = 2400,
  color = 'currentColor',
  label = 'Loading',
  ...rest
}: WindmillProps): ReactElement {
  ensureWindmillRule()

  const { className, style } = mergePresentation({}, rest)

  const loaderStyle = {
    ...style,
    width: `${String(size)}px`,
    height: `${String(size)}px`,
    color,
    '--o-windmill-speed': `${String(speed)}ms`,
  } as CSSProperties

  const tip = HUB.y - ARM

  return (
    <span
      {...rest}
      className={className}
      style={loaderStyle}
      data-o-windmill=""
      role="status"
    >
      <span className="o-sr-only">{label}</span>
      <svg aria-hidden viewBox="0 0 100 100" width="100%" height="100%">
        <path d={TOWER} fill="currentColor" fillOpacity={0.75} />
        <g data-o-windmill-sails="">
          {SAILS.map((angle) => (
            <g
              key={angle}
              transform={`rotate(${String(angle)} ${String(HUB.x)} ${String(HUB.y)})`}
            >
              {/* The arm, from the hub to the tip. */}
              <line
                x1={HUB.x}
                y1={HUB.y}
                x2={HUB.x}
                y2={tip}
                stroke="currentColor"
                strokeWidth={2.5}
                strokeLinecap="round"
              />
              {/* The latticed blade, on one side of the arm only. */}
              <rect
                x={HUB.x + 1.5}
                y={tip + 1}
                width={8}
                height={ARM * 0.68}
                fill="currentColor"
                fillOpacity={0.3}
                stroke="currentColor"
                strokeWidth={1.5}
              />
              {[0.25, 0.5, 0.75].map((fraction) => (
                <line
                  key={fraction}
                  x1={HUB.x + 1.5}
                  y1={tip + 1 + ARM * 0.68 * fraction}
                  x2={HUB.x + 9.5}
                  y2={tip + 1 + ARM * 0.68 * fraction}
                  stroke="currentColor"
                  strokeWidth={1}
                />
              ))}
            </g>
          ))}
        </g>
        <circle cx={HUB.x} cy={HUB.y} r={3.5} fill="currentColor" />
      </svg>
    </span>
  )
}

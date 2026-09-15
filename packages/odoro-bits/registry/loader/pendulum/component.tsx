/**
 * Pendulum: a bob at the end of a rod swings around a pivot, along an arc
 * drawn as a dashed line.
 *
 * ## A single curve, because it is the right one
 *
 * A pendulum at small amplitudes is harmonic motion par excellence: its
 * position is a sine of time, slow at the extremes, fast as it passes through
 * the vertical. The `ease-in-out` curve is a very close approximation of that
 * over a half period, and it is the only place where it is right — a fall, a
 * bounce, an impact call for other curves. Here, two half periods, one per
 * direction, and nothing else.
 *
 * The dashed arc is what tells this pendulum apart from a swinging bead: it
 * shows the amplitude, and the bob walks it exactly, because its radius is the
 * length of the rod. It is cut out by a wedge `clip-path`, opened by the angle
 * of the swing on either side of the vertical.
 *
 * One rotation animation, held by the compositor, no JavaScript after the
 * first render. The rod and the bob turn together: it is the whole arm that
 * pivots, around the attachment point.
 *
 * ## A status, not a drawing
 *
 * The element carries `role="status"` and a label for screen readers: waiting
 * is information, not decoration. The pendulum is removed from the
 * accessibility tree.
 *
 * Under reduced motion, the bob hangs vertically under its arc: that is the
 * state every pendulum eventually returns to, and the figure is still
 * recognisable.
 *
 * @module
 */

import { mergePresentation, type Customisable } from '@odoro-cli/engine'
import type { CSSProperties, ReactElement } from 'react'

/** Identifier of the injected stylesheet. */
const STYLE_ID = 'o-pendulum'

/** Length of the rod, in bob diameters. */
const ROD = 3.5

/** Diameter of the pivot, in bob diameters. */
const PIVOT = 0.5

/** Amplitude on either side of the vertical, in degrees. */
const ANGLE = 32

/**
 * Half opening of the wedge that cuts out the arc, in per cent of the box.
 *
 * The wedge starts from the centre of the box and opens downwards: at the
 * height of the bottom edge, it spreads by `tan(ANGLE)` times the radius on
 * either side of the middle.
 */
const WEDGE = Number((50 * Math.tan((ANGLE * Math.PI) / 180)).toFixed(1))

/** Sets up the pivot, the arc, the arm and its swing, once per document. */
function ensurePendulumRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    // The box is wide enough for the bob at its furthest point, and tall
    // enough for the pivot, the rod and half the bob.
    '[data-o-pendulum]{',
    'position:relative;display:inline-block;',
    `width:calc(var(--o-pendulum-size) * ${String((2 * ROD * Math.sin((ANGLE * Math.PI) / 180) + 1.3).toFixed(2))});`,
    `height:calc(var(--o-pendulum-size) * ${String(PIVOT / 2 + ROD + 0.5 + 0.2)});`,
    '}',
    '[data-o-pendulum-pivot]{',
    'position:absolute;top:0;left:50%;',
    `width:calc(var(--o-pendulum-size) * ${String(PIVOT)});height:calc(var(--o-pendulum-size) * ${String(PIVOT)});`,
    `margin-left:calc(var(--o-pendulum-size) * ${String(-PIVOT / 2)});`,
    'border-radius:50%;background:var(--o-pendulum-color);',
    '}',
    // A dashed circle centred on the pivot, of the radius of the rod, of which
    // only a downward wedge is kept.
    '[data-o-pendulum-arc]{',
    'position:absolute;left:50%;',
    `top:calc(var(--o-pendulum-size) * ${String(PIVOT / 2 - ROD)});`,
    `margin-left:calc(var(--o-pendulum-size) * ${String(-ROD)});`,
    `width:calc(var(--o-pendulum-size) * ${String(2 * ROD)});height:calc(var(--o-pendulum-size) * ${String(2 * ROD)});`,
    'border-radius:50%;border:1px dashed var(--o-pendulum-color);opacity:0.35;',
    `clip-path:polygon(50% 50%,${String(50 - WEDGE)}% 100%,${String(50 + WEDGE)}% 100%);`,
    '}',
    // The arm is a point with no size at the pivot: the rod and the bob hang
    // from it, and turn with it.
    '[data-o-pendulum-arm]{',
    'position:absolute;left:50%;width:0;height:0;',
    `top:calc(var(--o-pendulum-size) * ${String(PIVOT / 2)});`,
    'transform-origin:0 0;',
    'animation:o-pendulum-swing var(--o-pendulum-speed) infinite;',
    '}',
    '[data-o-pendulum-rod]{',
    'position:absolute;top:0;left:-0.5px;width:1px;',
    `height:calc(var(--o-pendulum-size) * ${String(ROD)});`,
    'background:var(--o-pendulum-color);opacity:0.6;',
    '}',
    '[data-o-pendulum-bob]{',
    'position:absolute;',
    `top:calc(var(--o-pendulum-size) * ${String(ROD - 0.5)});`,
    'left:calc(var(--o-pendulum-size) * -0.5);',
    'width:var(--o-pendulum-size);height:var(--o-pendulum-size);',
    'border-radius:50%;background:var(--o-pendulum-color);',
    '}',
    // Slow at the extremes, fast at the vertical: a sine, in two halves.
    '@keyframes o-pendulum-swing{',
    `0%{transform:rotate(${String(ANGLE)}deg);animation-timing-function:ease-in-out}`,
    `50%{transform:rotate(${String(-ANGLE)}deg);animation-timing-function:ease-in-out}`,
    `100%{transform:rotate(${String(ANGLE)}deg)}`,
    '}',
    // A bob vertical under its arc: the figure is stated, at rest.
    '@media (prefers-reduced-motion:reduce){',
    '[data-o-pendulum-arm]{animation:none;transform:none}',
    '}',
  ].join('')
  document.head.append(style)
}

/** Props of the component itself. */
export interface PendulumOwnProps {
  /** Diameter of the bob, in pixels. @defaultValue 12 */
  size?: number
  /** Duration of one round trip, in milliseconds. @defaultValue 1600 */
  speed?: number
  /** Colour of the bob, the rod, the pivot and the arc. @defaultValue the text colour */
  color?: string
  /** Label announced to screen readers. @defaultValue 'Loading' */
  label?: string
}

/** All the props. */
export type PendulumProps = Customisable<PendulumOwnProps, 'span'>

/**
 * Signals a wait through a pendulum swinging along its arc.
 *
 * @example
 * <Pendulum />
 *
 * @example
 * // Bigger, slower, in the brand hue.
 * <Pendulum size={16} speed={2400} color="var(--o-palette-brand-500)" />
 */
export function Pendulum({
  size = 12,
  speed = 1600,
  color = 'currentColor',
  label = 'Loading',
  ...rest
}: PendulumProps): ReactElement {
  ensurePendulumRule()

  const { className, style } = mergePresentation({}, rest)

  const loaderStyle = {
    ...style,
    '--o-pendulum-size': `${String(size)}px`,
    '--o-pendulum-speed': `${String(speed)}ms`,
    '--o-pendulum-color': color,
  } as CSSProperties

  return (
    <span
      {...rest}
      className={className}
      style={loaderStyle}
      data-o-pendulum=""
      role="status"
    >
      <span className="o-sr-only">{label}</span>
      <span aria-hidden data-o-pendulum-arc="" />
      <span aria-hidden data-o-pendulum-pivot="" />
      <span aria-hidden data-o-pendulum-arm="">
        <span data-o-pendulum-rod="" />
        <span data-o-pendulum-bob="" />
      </span>
    </span>
  )
}

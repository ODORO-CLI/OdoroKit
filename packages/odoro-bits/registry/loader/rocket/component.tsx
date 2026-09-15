/**
 * Rocket: a rocket sets down on the launch pad, lights its thrust, then leaves
 * the view through the top. The next one arrives from the bottom.
 *
 * ## An acceleration, not a round trip
 *
 * A lift-off has no constant speed and never comes back. The climb therefore
 * starts slowly and finishes fast — `ease-in` at full throttle — and the
 * rocket exits the frame instead of stopping at the top. The frame of the SVG
 * cuts it off: there is nothing to mask, it is simply outside.
 *
 * The loop does not rewind the same rocket: it brings another one up from the
 * bottom, which rises while braking to its stopping point — the exact
 * opposite of the lift-off curve. One reads two distinct gestures, an arrival
 * and a departure, where a single symmetric curve would give a yo-yo.
 *
 * Just before leaving, the rocket sinks by a few units: that is the crouch
 * that announces the movement, the same reason one bends the knees before
 * jumping.
 *
 * ## Two time scales for the flame
 *
 * The flame does two things at once, at rates that have nothing to do with
 * each other: it stretches as the thrust rises — at the rate of the cycle —
 * and it flickers — ten times faster. Mixing them in a single animation would
 * force repeating the flicker keyframes at every stage of the thrust. So they
 * live on two nested groups, each with its own duration: their scales
 * multiply on their own.
 *
 * Three CSS animations on SVG elements, held by the compositor, no JavaScript
 * after the first render.
 *
 * ## A status, not a drawing
 *
 * The element carries `role="status"` and a label for screen readers: the
 * wait is information, not decoration. The drawing is removed from the
 * accessibility tree.
 *
 * Under reduced motion, the rocket sits at the centre, flame lit and steady:
 * the figure reads, only the flight stops.
 *
 * @module
 */

import { mergePresentation, type Customisable } from '@odoro-cli/engine'
import type { CSSProperties, ReactElement } from 'react'

/** Identifier of the injected stylesheet. */
const STYLE_ID = 'o-rocket'

/** The fuselage, nose cone included. */
const BODY = 'M 50 8 C 62 24, 68 40, 68 56 L 32 56 C 32 40, 38 24, 50 8 Z'

/** The left fin. */
const FIN_LEFT = 'M 32 38 L 19 62 L 32 57 Z'

/** The right fin. */
const FIN_RIGHT = 'M 68 38 L 81 62 L 68 57 Z'

/** The nozzle, under the fuselage. */
const NOZZLE = 'M 37 56 L 63 56 L 59 65 L 41 65 Z'

/** The flame, hooked to the lip of the nozzle. */
const FLAME = 'M 41 65 Q 50 96 59 65 Z'

/** Applies the rocket, its lift-off and its flame, once per document. */
function ensureRocketRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-rocket]{display:inline-block;line-height:0}',
    '[data-o-rocket] svg{display:block}',
    '[data-o-rocket-body],[data-o-rocket-thrust],[data-o-rocket-flicker]{',
    'transform-box:view-box;',
    'animation-iteration-count:infinite;',
    '}',
    '[data-o-rocket-body]{',
    'transform-origin:50px 50px;',
    'animation-name:o-rocket-launch;animation-duration:var(--o-rocket-speed);',
    '}',
    // Both groups of the flame share the lip of the nozzle as their origin:
    // it stretches and flickers from the bottom, never from the middle.
    '[data-o-rocket-thrust],[data-o-rocket-flicker]{transform-origin:50px 65px}',
    '[data-o-rocket-thrust]{',
    'animation-name:o-rocket-thrust;animation-duration:var(--o-rocket-speed);',
    '}',
    '[data-o-rocket-flicker]{',
    'animation-name:o-rocket-flicker;',
    'animation-duration:calc(var(--o-rocket-speed) / 14);',
    '}',
    // Braking arrival from the bottom, crouch, then departure accelerating
    // until it leaves the frame.
    '@keyframes o-rocket-launch{',
    '0%{transform:translateY(130px);animation-timing-function:cubic-bezier(0.2,0.8,0.3,1)}',
    '24%{transform:translateY(0)}',
    '42%{transform:translateY(8px);animation-timing-function:cubic-bezier(0.6,0,0.9,0.2)}',
    '100%{transform:translateY(-150px)}',
    '}',
    // The thrust dips during the crouch, then stretches for the departure.
    '@keyframes o-rocket-thrust{',
    '0%,24%{transform:scaleY(0.8);animation-timing-function:ease-in-out}',
    '42%{transform:scaleY(0.5);animation-timing-function:ease-out}',
    '56%,100%{transform:scaleY(1.35)}',
    '}',
    '@keyframes o-rocket-flicker{',
    '0%,100%{transform:scaleY(1) scaleX(1)}',
    '50%{transform:scaleY(0.72) scaleX(1.1)}',
    '}',
    // Rocket set down, flame lit and steady: the figure is stated, on the ground.
    '@media (prefers-reduced-motion:reduce){',
    '[data-o-rocket-body],[data-o-rocket-thrust],[data-o-rocket-flicker]{',
    'animation:none;transform:none;',
    '}',
    '}',
  ].join('')
  document.head.append(style)
}

/** Properties specific to the component. */
export interface RocketOwnProps {
  /** Side of the drawing, in pixels. @defaultValue 72 */
  size?: number
  /** Duration of one complete lift-off, in milliseconds. @defaultValue 2200 */
  speed?: number
  /** Colour of the rocket and of its flame. @defaultValue the text colour */
  color?: string
  /** Label announced to screen readers. @defaultValue 'Loading' */
  label?: string
}

/** All the properties. */
export type RocketProps = Customisable<RocketOwnProps, 'span'>

/**
 * Signals a wait with a rocket taking off, endlessly.
 *
 * @example
 * <Rocket />
 *
 * @example
 * // Bigger, slower, in the brand hue.
 * <Rocket size={112} speed={3200} color="var(--o-palette-brand-500)" />
 */
export function Rocket({
  size = 72,
  speed = 2200,
  color = 'currentColor',
  label = 'Loading',
  ...rest
}: RocketProps): ReactElement {
  ensureRocketRule()

  const { className, style } = mergePresentation({}, rest)

  const loaderStyle = {
    ...style,
    width: `${String(size)}px`,
    height: `${String(size)}px`,
    color,
    '--o-rocket-speed': `${String(speed)}ms`,
  } as CSSProperties

  return (
    <span
      {...rest}
      className={className}
      style={loaderStyle}
      data-o-rocket=""
      role="status"
    >
      <span className="o-sr-only">{label}</span>
      <svg aria-hidden viewBox="0 0 100 100" width="100%" height="100%">
        <g data-o-rocket-body="">
          <g data-o-rocket-thrust="">
            <g data-o-rocket-flicker="">
              <path d={FLAME} fill="currentColor" fillOpacity={0.45} />
            </g>
          </g>
          <path d={FIN_LEFT} fill="currentColor" fillOpacity={0.7} />
          <path d={FIN_RIGHT} fill="currentColor" fillOpacity={0.7} />
          <path d={NOZZLE} fill="currentColor" fillOpacity={0.7} />
          <path d={BODY} fill="currentColor" />
          {/* The porthole is a hole in the fuselage, not a dot laid on top
              of it is the background that shows through. */}
          <circle cx={50} cy={34} r={8} fill="var(--o-theme-bg)" />
        </g>
      </svg>
    </span>
  )
}

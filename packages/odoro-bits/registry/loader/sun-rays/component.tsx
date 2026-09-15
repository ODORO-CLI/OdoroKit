/**
 * Sun whose rays turn: a fixed disc, twelve rays that lengthen in turn, and a
 * very slow rotation of the whole.
 *
 * ## Two rhythms, not one
 *
 * A sun whose rays all pulse together blinks; a sun whose rays pulse in
 * cascade is already turning, and the overall rotation adds nothing. By making
 * them breathe alternately — every other ray half a period ahead — the crown
 * reads neither as a blink nor as a rotation: it twinkles. The slow rotation,
 * eight times longer than one breath, then sits on top of it without competing.
 *
 * The rays also alternate in length at rest, long and short: that is what
 * tells a solar crown apart from a spoked wheel.
 *
 * ## One ray, one variable
 *
 * Each ray is the same segment, turned into its place. The angle is a CSS
 * variable read **inside** the steps of the animation: without that, the
 * rotation set as an attribute would be overwritten by the animated transform,
 * and the twelve rays would stack onto a single one. One animation, twelve
 * elements, no duplicated rule.
 *
 * The central disc does not move: it is the visual anchor. A heart that also
 * breathed would blur the reading — nothing would stay fixed.
 *
 * ## A status, not a drawing
 *
 * The element carries `role="status"` and a label for screen readers: the wait
 * is information, not decoration. The drawing is removed from the
 * accessibility tree.
 *
 * Under reduced motion, the rays stay at their resting length and the crown no
 * longer turns: the figure still reads as a sun, only the motion stops.
 *
 * @module
 */

import { mergePresentation, type Customisable } from '@odoro-cli/engine'
import type { CSSProperties, ReactElement } from 'react'

/** Identifier of the injected stylesheet. */
const STYLE_ID = 'o-sun-rays'

/** Number of rays. Twelve: a dial, and an alternation that closes on itself. */
const RAYS = 12

/** Sets the sun, its rays and its rotation, once per document. */
function ensureSunRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-sun-rays]{display:inline-block;line-height:0}',
    '[data-o-sun-rays] svg{display:block}',
    '[data-o-sun-crown],[data-o-sun-ray]{',
    'transform-box:view-box;transform-origin:50px 50px;',
    '}',
    '[data-o-sun-crown]{',
    'animation:o-sun-rays-turn var(--o-sun-turn) linear infinite;',
    '}',
    '@keyframes o-sun-rays-turn{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}',
    '[data-o-sun-ray]{',
    'transform:rotate(var(--o-sun-angle));',
    'animation:o-sun-rays-reach var(--o-sun-speed) ease-in-out infinite;',
    'animation-delay:var(--o-sun-delay);',
    '}',
    // The angle is repeated in every step: a transform animation replaces the
    // whole value, not only the function it animates.
    '@keyframes o-sun-rays-reach{',
    '0%,100%{transform:rotate(var(--o-sun-angle)) translateY(0);opacity:0.55}',
    '50%{transform:rotate(var(--o-sun-angle)) translateY(-5px);opacity:1}',
    '}',
    '@media (prefers-reduced-motion:reduce){',
    '[data-o-sun-crown]{animation:none;transform:none}',
    '[data-o-sun-ray]{animation:none;transform:rotate(var(--o-sun-angle));opacity:0.8}',
    '}',
  ].join('')
  document.head.append(style)
}

/** Properties specific to the component. */
export interface SunRaysOwnProps {
  /** Side of the drawing area, in pixels. @defaultValue 56 */
  size?: number
  /** Duration of one ray breath, in milliseconds. @defaultValue 1800 */
  speed?: number
  /** Colour of the sun. @defaultValue the text colour */
  color?: string
  /** Label announced to screen readers. @defaultValue 'Loading' */
  label?: string
}

/** All the properties. */
export type SunRaysProps = Customisable<SunRaysOwnProps, 'span'>

/**
 * Signals a wait with a sun whose crown twinkles and turns.
 *
 * @example
 * <SunRays />
 *
 * @example
 * // Bigger, slower, in the brand hue.
 * <SunRays size={88} speed={2600} color="var(--o-palette-brand-500)" />
 */
export function SunRays({
  size = 56,
  speed = 1800,
  color = 'currentColor',
  label = 'Loading',
  ...rest
}: SunRaysProps): ReactElement {
  ensureSunRule()

  const { className, style } = mergePresentation({}, rest)

  const loaderStyle = {
    ...style,
    width: `${String(size)}px`,
    height: `${String(size)}px`,
    color,
    '--o-sun-speed': `${String(speed)}ms`,
    // The turn is eight times longer than one breath: slow enough not to
    // compete with the twinkle.
    '--o-sun-turn': `${String(speed * 8)}ms`,
  } as CSSProperties

  return (
    <span
      {...rest}
      className={className}
      style={loaderStyle}
      data-o-sun-rays=""
      role="status"
    >
      <span className="o-sr-only">{label}</span>
      <svg aria-hidden viewBox="0 0 100 100" width="100%" height="100%">
        <circle cx="50" cy="50" r="16" fill="currentColor" />
        <g data-o-sun-crown="">
          {Array.from({ length: RAYS }, (_, index) => {
            const long = index % 2 === 0
            return (
              <line
                key={index}
                data-o-sun-ray=""
                x1="50"
                y1={long ? 26 : 28}
                x2="50"
                y2={long ? 8 : 16}
                stroke="currentColor"
                strokeWidth={long ? 4 : 3}
                strokeLinecap="round"
                style={
                  {
                    '--o-sun-angle': `${String((360 / RAYS) * index)}deg`,
                    // Every other ray is half a period ahead. The delay is
                    // negative: the crown twinkles from the very first frame,
                    // instead of waiting its turn.
                    '--o-sun-delay': long ? '0ms' : `${String(Math.round(-speed / 2))}ms`,
                  } as CSSProperties
                }
              />
            )
          })}
        </g>
      </svg>
    </span>
  )
}

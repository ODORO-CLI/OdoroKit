/**
 * Radar sweep: a beam turns over a graduated dial and lights two echoes back
 * up on each pass.
 *
 * ## A trail made of layers, for want of an angular gradient
 *
 * SVG knows nothing of the conic gradient: a colour cannot be asked to fade
 * along an angle. The trail is therefore made of eight stacked sectors, all
 * at the same very low opacity, each covering a longer arc than the previous
 * one from the leading edge. Where all eight overlap — just behind the beam —
 * the ink is at its strongest; further back, seven are left, then six, and so
 * on down to nothing. The decay is therefore even, and above all seamless:
 * each boundary brings exactly one layer in or out.
 *
 * Eight layers of a little over eleven degrees give a trail a quarter of a
 * turn long, which leaves three quarters of the dial dark — enough for the
 * beam to read as an object going past, not as a sector turning.
 *
 * ## The dial and the echoes
 *
 * Three range circles and a cross stay visible at all times, very quietly:
 * they give the beam something to cross. Without them, the rotation would
 * have no landmark and the eye would no longer gauge its speed.
 *
 * The two echoes are not decorative: their delay is computed from their own
 * angle, so that they light up exactly when the beam reaches them, then fade
 * slowly — the persistence of a watch screen. That is what separates this
 * loader from concentric waves: here something is searching, and finding.
 *
 * ## A status, not a drawing
 *
 * The element carries `role="status"` and a label for screen readers: the
 * wait is information, not decoration. The drawing is removed from the
 * accessibility tree.
 *
 * Under reduced motion, the beam stays stopped across the dial and the echoes
 * stay lit: the figure still reads as a radar, only the sweep stops.
 *
 * @module
 */

import { mergePresentation, type Customisable } from '@odoro-cli/engine'
import type { CSSProperties, ReactElement } from 'react'

/** Identifier of the injected stylesheet. */
const STYLE_ID = 'o-sonar-loader'

/** Range of the dial, in view units. */
const REACH = 46

/** Number of layers in the trail. */
const LAYERS = 8

/** Total spread of the trail, in degrees. */
const TAIL = 90

/** Resting angle under reduced motion, in degrees. */
const RESTING = 40

/** The two echoes: an angle from the top, a distance, a radius. */
const ECHOES = [
  { angle: 58, distance: 32, radius: 3.4 },
  { angle: 214, distance: 21, radius: 2.6 },
] as const

/** A point on the dial, the angle counted in degrees from the top. */
function point(angle: number, distance: number): { x: number; y: number } {
  const radians = ((angle - 90) * Math.PI) / 180
  return {
    x: 50 + distance * Math.cos(radians),
    y: 50 + distance * Math.sin(radians),
  }
}

/** The same point, written out for a path. */
function pen(angle: number, distance: number): string {
  const { x, y } = point(angle, distance)
  return `${x.toFixed(2)} ${y.toFixed(2)}`
}

/**
 * Sector running from the leading edge back to an arc behind it.
 *
 * The leading edge is at the top, at zero degrees; the trail extends towards
 * the negative angles, that is, behind the beam since the beam turns
 * clockwise.
 */
function sector(span: number): string {
  return [
    'M 50 50',
    `L ${pen(0, REACH)}`,
    // The arc comes back towards the rear: counter-clockwise on screen, hence
    // a zero sweep flag, and less than half a turn.
    `A ${String(REACH)} ${String(REACH)} 0 0 0 ${pen(-span, REACH)}`,
    'Z',
  ].join(' ')
}

/** Sets the dial, the trail and the echoes, once per document. */
function ensureSonarRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-sonar-loader]{display:inline-block;line-height:0}',
    '[data-o-sonar-loader] svg{display:block}',
    '[data-o-sonar-sweep]{',
    'transform-box:view-box;transform-origin:50px 50px;',
    'animation:o-sonar-loader-turn var(--o-sonar-speed) linear infinite;',
    '}',
    '@keyframes o-sonar-loader-turn{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}',
    '[data-o-sonar-echo]{',
    'animation:o-sonar-loader-fade var(--o-sonar-speed) linear infinite;',
    'animation-delay:var(--o-sonar-delay);',
    '}',
    // The echo lights up at once as the beam goes past, then fades over two
    // thirds of the turn: beyond that, there is nothing left to see before
    // the beam comes back.
    '@keyframes o-sonar-loader-fade{',
    '0%{opacity:1}',
    '65%,100%{opacity:0}',
    '}',
    '@media (prefers-reduced-motion:reduce){',
    `[data-o-sonar-sweep]{animation:none;transform:rotate(${String(RESTING)}deg)}`,
    '[data-o-sonar-echo]{animation:none;opacity:0.85}',
    '}',
  ].join('')
  document.head.append(style)
}

/** Properties specific to the component. */
export interface SonarLoaderOwnProps {
  /** Side of the dial, in pixels. @defaultValue 72 */
  size?: number
  /** Duration of one beam turn, in milliseconds. @defaultValue 2400 */
  speed?: number
  /** Colour of the dial, the beam and the echoes. @defaultValue the text colour */
  color?: string
  /** Label announced to screen readers. @defaultValue 'Loading' */
  label?: string
}

/** All the properties. */
export type SonarLoaderProps = Customisable<SonarLoaderOwnProps, 'span'>

/**
 * Signals a wait with a radar beam sweeping a dial.
 *
 * @example
 * <SonarLoader />
 *
 * @example
 * // Bigger, slower, in the brand hue.
 * <SonarLoader size={112} speed={3600} color="var(--o-palette-brand-500)" />
 */
export function SonarLoader({
  size = 72,
  speed = 2400,
  color = 'currentColor',
  label = 'Loading',
  ...rest
}: SonarLoaderProps): ReactElement {
  ensureSonarRule()

  const { className, style } = mergePresentation({}, rest)

  const loaderStyle = {
    ...style,
    width: `${String(size)}px`,
    height: `${String(size)}px`,
    color,
    '--o-sonar-speed': `${String(speed)}ms`,
  } as CSSProperties

  return (
    <span
      {...rest}
      className={className}
      style={loaderStyle}
      data-o-sonar-loader=""
      role="status"
    >
      <span className="o-sr-only">{label}</span>
      <svg aria-hidden viewBox="0 0 100 100" width="100%" height="100%">
        <g stroke="currentColor" strokeWidth={1} opacity={0.2} fill="none">
          {[REACH, REACH * 0.66, REACH * 0.33].map((radius) => (
            <circle key={radius} cx="50" cy="50" r={radius.toFixed(2)} />
          ))}
          <line x1={50 - REACH} y1="50" x2={50 + REACH} y2="50" />
          <line x1="50" y1={50 - REACH} x2="50" y2={50 + REACH} />
        </g>
        {ECHOES.map((echo) => (
          <circle
            key={echo.angle}
            data-o-sonar-echo=""
            cx={point(echo.angle, echo.distance).x.toFixed(2)}
            cy={point(echo.angle, echo.distance).y.toFixed(2)}
            r={echo.radius}
            fill="currentColor"
            style={
              {
                // The echo lights up when the beam reaches it: its delay is
                // its share of the turn, negative so that the persistence is
                // already in place on the first frame.
                '--o-sonar-delay': `${String(Math.round((echo.angle / 360 - 1) * speed))}ms`,
              } as CSSProperties
            }
          />
        ))}
        <g data-o-sonar-sweep="">
          {Array.from({ length: LAYERS }, (_, index) => (
            <path
              key={index}
              d={sector(((index + 1) * TAIL) / LAYERS)}
              fill="currentColor"
              fillOpacity={0.07}
            />
          ))}
          <line
            x1="50"
            y1="50"
            x2="50"
            y2={50 - REACH}
            stroke="currentColor"
            strokeWidth={1.6}
            strokeLinecap="round"
            opacity={0.9}
          />
        </g>
      </svg>
    </span>
  )
}

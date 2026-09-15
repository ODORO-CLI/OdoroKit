/**
 * Orbiting dots: three dots each turn on their own concentric orbit, the inner
 * one faster than the outer one.
 *
 * ## Drawn orbits, not just dots
 *
 * Three dots turning with nothing around them read badly: nothing says they
 * are related, nor that they follow a circle. The orbits are therefore drawn,
 * as a faint rule — they are what makes the system, and what stays readable
 * when it stops.
 *
 * The periods follow Kepler's idea without doing his arithmetic: the further
 * from the centre, the slower. The inner dot makes almost three turns while
 * the outer one makes one. Equal periods would make a wheel; periods that were
 * multiples of one another would make a pattern repeating too fast to look
 * alive.
 *
 * ## Why an SVG
 *
 * Three concentric circles and three dots at an angular position: in CSS that
 * would take borders for the orbits and computed translations for the dots. In
 * a `viewBox`, each dot is a circle placed at the top of its orbit, and a
 * group that turns around the centre.
 *
 * ## A status, not a drawing
 *
 * The element carries `role="status"` and a label for screen readers: the wait
 * is information, not decoration. The drawing is removed from the
 * accessibility tree.
 *
 * Under reduced motion, the three dots stop at distinct angles, a third of a
 * turn apart: the drawn orbits and their dots still read as a loader, only the
 * rotation stops.
 *
 * @module
 */

import { mergePresentation, type Customisable } from '@odoro-cli/engine'
import type { CSSProperties, ReactElement } from 'react'

/** Identifier of the injected stylesheet. */
const STYLE_ID = 'o-dots-orbit'

/** Sets the orbits and their rotation, once per document. */
function ensureOrbitRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-dots-orbit]{display:inline-block;line-height:0}',
    '[data-o-dots-orbit-track]{',
    'fill:none;stroke:var(--o-dorbit-color);stroke-width:1.5;opacity:0.2;',
    '}',
    '[data-o-dots-orbit-dot]{fill:var(--o-dorbit-color)}',
    // The group turns around the centre of the drawing, not of its own box.
    '[data-o-dots-orbit-spin]{',
    'transform-box:view-box;transform-origin:50% 50%;',
    'animation:o-dots-orbit-turn var(--o-dorbit-speed) linear infinite;',
    '}',
    '@keyframes o-dots-orbit-turn{from{transform:rotate(0turn)}to{transform:rotate(1turn)}}',
    // Three dots a third of a turn from each other: the figure still reads as
    // a loader.
    '@media (prefers-reduced-motion:reduce){',
    '[data-o-dots-orbit-spin]{animation:none;transform:rotate(var(--o-dorbit-rest))}',
    '}',
  ].join('')
  document.head.append(style)
}

/** Properties specific to the component. */
export interface DotsOrbitOwnProps {
  /** Diameter of the outer orbit, in pixels. @defaultValue 48 */
  size?: number
  /** Duration of one turn of the inner orbit, in milliseconds. @defaultValue 1000 */
  speed?: number
  /** Colour of the dots and the orbits. @defaultValue the text colour */
  color?: string
  /** Label announced to screen readers. @defaultValue 'Loading' */
  label?: string
}

/** All the properties. */
export type DotsOrbitProps = Customisable<DotsOrbitOwnProps, 'span'>

/**
 * The three orbits, in units of the hundred by hundred `viewBox`.
 *
 * The dot radius shrinks with the distance: a far dot that was large would
 * crush the centre. The period factor is irrational on purpose, so that the
 * pattern does not visibly close on itself.
 */
const ORBITS = [
  { radius: 14, dot: 5, factor: 1, rest: 0 },
  { radius: 29, dot: 4, factor: 1.85, rest: 120 },
  { radius: 44, dot: 3.2, factor: 2.9, rest: 240 },
] as const

/**
 * Signals a wait with three orbiting dots.
 *
 * @example
 * <DotsOrbit />
 *
 * @example
 * // Bigger, slower, in the brand hue.
 * <DotsOrbit size={96} speed={1800} color="var(--o-palette-brand-500)" />
 */
export function DotsOrbit({
  size = 48,
  speed = 1000,
  color = 'currentColor',
  label = 'Loading',
  ...rest
}: DotsOrbitProps): ReactElement {
  ensureOrbitRule()

  const { className, style } = mergePresentation({}, rest)

  const loaderStyle = {
    ...style,
    '--o-dorbit-color': color,
  } as CSSProperties

  return (
    <span
      {...rest}
      className={className}
      style={loaderStyle}
      data-o-dots-orbit=""
      role="status"
    >
      <span className="o-sr-only">{label}</span>
      <svg aria-hidden width={size} height={size} viewBox="0 0 100 100">
        {ORBITS.map((orbit) => (
          <circle
            key={orbit.radius}
            data-o-dots-orbit-track=""
            cx="50"
            cy="50"
            r={orbit.radius}
          />
        ))}
        {ORBITS.map((orbit) => (
          <g
            key={orbit.radius}
            data-o-dots-orbit-spin=""
            style={
              {
                '--o-dorbit-speed': `${String(Math.round(speed * orbit.factor))}ms`,
                '--o-dorbit-rest': `${String(orbit.rest)}deg`,
              } as CSSProperties
            }
          >
            <circle
              data-o-dots-orbit-dot=""
              cx="50"
              cy={50 - orbit.radius}
              r={orbit.dot}
            />
          </g>
        ))}
      </svg>
    </span>
  )
}

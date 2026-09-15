/**
 * Orbit loader: three concentric arcs turning in alternating directions.
 *
 * ## Three borders, no JavaScript
 *
 * Each arc is a ring of which only one portion of the border is painted — the
 * rest is transparent — and which the compositor spins. Three rotations
 * declared once, at alternating speeds and directions: the crossing of the
 * arcs is enough to say "something is working", without a line of JavaScript
 * after the first render.
 *
 * This loader counts nothing, and does not claim to count: it is a sign of
 * waiting, not a measurement. When there is real progress to show,
 * `counter-gate` is the right tool.
 *
 * ## A status, not a drawing
 *
 * The element carries `role="status"` and a label for screen readers: waiting
 * is information, not decoration. The arcs themselves are removed from the
 * accessibility tree.
 *
 * Under reduced motion, the arcs stay put: the figure — three offset portions
 * of rings — still reads as a loader, only the movement stops.
 *
 * @module
 */

import { mergePresentation, type Customisable } from '@odoro-cli/engine'
import { type CSSProperties, type ReactElement } from 'react'

/** Props of the component itself. */
export interface OrbitLoaderOwnProps {
  /** Diameter of the outer ring, in pixels. @defaultValue 48 */
  size?: number
  /** Duration of one turn of the outer ring, in milliseconds. @defaultValue 1200 */
  speed?: number
  /** Colour of the arcs. @defaultValue the text colour */
  color?: string
  /** Label announced to screen readers. @defaultValue 'Loading' */
  label?: string
}

/** All the props. */
export type OrbitLoaderProps = Customisable<OrbitLoaderOwnProps, 'span'>

/** Identifier of the injected stylesheet. */
const STYLE_ID = 'o-orbit-loader'

/** Sets up the rings and their rotation, once per document. */
function ensureLoaderRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-orbit-loader]{position:relative;display:inline-block}',
    '[data-o-orbit-ring]{',
    'position:absolute;inset:var(--o-loader-inset);',
    'border-radius:50%;',
    'border:2px solid transparent;',
    'border-top-color:var(--o-loader-color);',
    'opacity:var(--o-loader-opacity);',
    'animation:o-orbit-loader-spin var(--o-loader-speed) linear infinite;',
    'animation-direction:var(--o-loader-direction);',
    '}',
    '@keyframes o-orbit-loader-spin{from{transform:rotate(0turn)}to{transform:rotate(1turn)}}',
    // The frozen arcs stay a third of a turn apart: the figure still reads as a
    // loader.
    '@media (prefers-reduced-motion:reduce){',
    '[data-o-orbit-ring]{animation:none;transform:rotate(var(--o-loader-rest))}',
    '}',
  ].join('')
  document.head.append(style)
}

/**
 * Signals a wait through three arcs turning in alternating directions.
 *
 * @example
 * <OrbitLoader />
 *
 * @example
 * // Bigger, slower, in the brand hue.
 * <OrbitLoader size={72} speed={2000} color="var(--o-palette-brand-500)" />
 */
export function OrbitLoader({
  size = 48,
  speed = 1200,
  color = 'currentColor',
  label = 'Loading',
  ...rest
}: OrbitLoaderProps): ReactElement {
  ensureLoaderRule()

  const { className, style } = mergePresentation({}, rest)

  const loaderStyle = {
    ...style,
    width: `${String(size)}px`,
    height: `${String(size)}px`,
    '--o-loader-color': color,
  } as CSSProperties

  // Three rings: each one smaller, faster, and turning against the previous
  // one. The visual inertia comes from the crossing, not from the speed.
  const rings = [0, 1, 2].map((ring) => ({
    inset: `${String(ring * 16)}%`,
    speed: Math.round(speed * (1 + ring * 0.5)),
    direction: ring % 2 === 1 ? 'reverse' : 'normal',
    opacity: 1 - ring * 0.25,
    rest: `${String(ring * 120)}deg`,
  }))

  return (
    <span
      {...rest}
      className={className}
      style={loaderStyle}
      data-o-orbit-loader=""
      role="status"
    >
      <span className="o-sr-only">{label}</span>
      {rings.map((ring, index) => (
        <span
          key={index}
          aria-hidden
          data-o-orbit-ring=""
          style={
            {
              '--o-loader-inset': ring.inset,
              '--o-loader-speed': `${String(ring.speed)}ms`,
              '--o-loader-direction': ring.direction,
              '--o-loader-opacity': String(ring.opacity),
              '--o-loader-rest': ring.rest,
            } as CSSProperties
          }
        />
      ))}
    </span>
  )
}

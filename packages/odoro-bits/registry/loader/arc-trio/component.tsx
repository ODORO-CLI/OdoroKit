/**
 * Arc trio: three arcs of different lengths on one and the same circle.
 *
 * ## A single circle, three speeds
 *
 * The three arcs share the same radius — this is not a concentric loader. They
 * have neither the same length nor the same speed: the long one is slow, the
 * short one is brisk. At unequal speeds, they catch up with one another,
 * overlap for a moment — the opacity adds up, the arc seems to thicken — then
 * part again. It is that irregular breathing which makes the loader: three
 * arcs at the same speed would be nothing but a spinning ring with gaps.
 *
 * Each arc is an SVG circle whose dash pattern paints only a portion. The
 * starting point of each is fixed by an SVG attribute on an outer group, and
 * the rotation by a CSS animation on an inner group: the two transforms do not
 * fight over the same property, otherwise the animation would wipe out the
 * offset.
 *
 * ## A status, not a drawing
 *
 * The element carries `role="status"` and a label for screen readers: waiting
 * is information, not decoration. The drawing itself is removed from the
 * accessibility tree.
 *
 * Under reduced motion, the arcs stay a third of a turn apart from one
 * another: the figure still reads as a loader, only the movement stops.
 *
 * @module
 */

import { mergePresentation, type Customisable } from '@odoro-cli/engine'
import type { CSSProperties, ReactElement } from 'react'

/** Identifier of the injected stylesheet. */
const STYLE_ID = 'o-arc-trio'

/** Sets up the rotation of the arcs, once per document. */
function ensureTrioRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-arc-trio]{display:inline-block;line-height:0}',
    '[data-o-arc-trio] svg{display:block}',
    // The reference box is the SVG view box: the origin of the rotation is the
    // centre of the drawing, not that of the painted arc alone.
    '[data-o-trio-arc]{',
    'transform-box:view-box;transform-origin:50% 50%;',
    'animation:o-arc-trio-spin var(--o-trio-speed) linear infinite;',
    '}',
    '@keyframes o-arc-trio-spin{from{transform:rotate(0turn)}to{transform:rotate(1turn)}}',
    '@media (prefers-reduced-motion:reduce){',
    '[data-o-trio-arc]{animation:none;transform:none}',
    '}',
  ].join('')
  document.head.append(style)
}

/** Props of the component itself. */
export interface ArcTrioOwnProps {
  /** Diameter of the circle, in pixels. @defaultValue 48 */
  size?: number
  /** Thickness of the arcs, in pixels. @defaultValue 4 */
  thickness?: number
  /** Duration of one turn of the longest arc, in milliseconds. @defaultValue 1400 */
  speed?: number
  /** Colour of the arcs. @defaultValue the text colour */
  color?: string
  /** Label announced to screen readers. @defaultValue 'Loading' */
  label?: string
}

/** All the props. */
export type ArcTrioProps = Customisable<ArcTrioOwnProps, 'span'>

/**
 * The three arcs: share of the circle, duration multiplier, opacity.
 *
 * The long one is slow and solid; the short one is brisk and light. The order
 * of the speeds is the reverse of the order of the lengths, so that the eye
 * always follows a crisp, fast arc in front of a slower mass.
 */
const ARCS = [
  { share: 0.3, tempo: 1, opacity: 1 },
  { share: 0.17, tempo: 0.62, opacity: 0.7 },
  { share: 0.08, tempo: 0.4, opacity: 0.45 },
] as const

/**
 * Signals a wait through three arcs catching up with one another on a single
 * circle.
 *
 * @example
 * <ArcTrio />
 *
 * @example
 * // Bigger, slower, in the brand hue.
 * <ArcTrio size={80} thickness={6} speed={2200} color="var(--o-palette-brand-500)" />
 */
export function ArcTrio({
  size = 48,
  thickness = 4,
  speed = 1400,
  color = 'currentColor',
  label = 'Loading',
  ...rest
}: ArcTrioProps): ReactElement {
  ensureTrioRule()

  const { className, style } = mergePresentation({}, rest)

  // The drawing lives in a view of 100 units: the thickness asked for in
  // pixels is converted so that the stroke keeps its measure at any size.
  const stroke = Math.min((thickness / size) * 100, 25)
  const radius = 50 - stroke / 2
  const circumference = 2 * Math.PI * radius

  const loaderStyle = {
    ...style,
    width: `${String(size)}px`,
    height: `${String(size)}px`,
    color,
  } as CSSProperties

  return (
    <span
      {...rest}
      className={className}
      style={loaderStyle}
      data-o-arc-trio=""
      role="status"
    >
      <span className="o-sr-only">{label}</span>
      <svg aria-hidden viewBox="0 0 100 100" width="100%" height="100%">
        {ARCS.map((arc, index) => (
          <g key={index} transform={`rotate(${String(index * 120 - 90)} 50 50)`}>
            <g
              data-o-trio-arc=""
              style={
                {
                  '--o-trio-speed': `${String(Math.round(speed * arc.tempo))}ms`,
                } as CSSProperties
              }
            >
              <circle
                cx="50"
                cy="50"
                r={radius}
                fill="none"
                stroke="currentColor"
                strokeWidth={stroke}
                strokeLinecap="round"
                strokeDasharray={`${String(circumference * arc.share)} ${String(circumference)}`}
                opacity={arc.opacity}
              />
            </g>
          </g>
        ))}
      </svg>
    </span>
  )
}

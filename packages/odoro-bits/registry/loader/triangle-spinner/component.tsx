/**
 * Self-drawing triangle: an outlined triangle draws itself along its track
 * from the apex, then erases itself in the same direction.
 *
 * ## A dash as long as the perimeter
 *
 * The stroke is a single dash, of exactly the length of the perimeter,
 * followed by a gap of the same length. Sliding that pattern along the path —
 * through the dash offset — amounts to making the stroke appear from the apex,
 * then making it disappear through the same apex once complete. The pencil
 * never goes back: the end of the stroke catches up with its start. That is
 * what tells this loader apart from a spinning ring: here, nothing spins, a
 * line draws itself.
 *
 * The perimeter is computed from the vertices, not measured on the path: there
 * is therefore nothing to read from the DOM after the first render, and the
 * dash is exact from the first frame.
 *
 * The dimmed track under the stroke is not an ornament: without it, a
 * half-drawn triangle is nothing but an angle, and the eye does not know what
 * is coming.
 *
 * ## A status, not a drawing
 *
 * The element carries `role="status"` and a label for screen readers: waiting
 * is information, not decoration. The drawing is removed from the
 * accessibility tree.
 *
 * Under reduced motion, the triangle stays fully drawn: the figure still reads
 * as a loader, only the movement stops.
 *
 * @module
 */

import { mergePresentation, type Customisable } from '@odoro-cli/engine'
import type { CSSProperties, ReactElement } from 'react'

/** Identifier of the injected stylesheet. */
const STYLE_ID = 'o-triangle-spinner'

/**
 * Vertices of the equilateral triangle, apex up, in a view of 100 units. The
 * centre is that of the circumscribed circle, slightly below the middle of the
 * view so that the figure looks centred.
 */
const RADIUS = 42
const VERTICES: ReadonlyArray<readonly [number, number]> = [0, 1, 2].map((index) => {
  const angle = ((2 * Math.PI) / 3) * index - Math.PI / 2
  return [50 + RADIUS * Math.cos(angle), 54 + RADIUS * Math.sin(angle)] as const
})

/** The path, from the apex clockwise. */
const PATH = `M ${VERTICES.map(([x, y]) => `${x.toFixed(2)} ${y.toFixed(2)}`).join(' L ')} Z`

/** The perimeter: three times the side. */
const PERIMETER = 3 * RADIUS * Math.sqrt(3)

/** Sets up the triangle and its drawing, once per document. */
function ensureTriangleRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-triangle-spinner]{display:inline-block;line-height:0}',
    '[data-o-triangle-spinner] svg{display:block}',
    '[data-o-triangle-track]{opacity:0.18}',
    '[data-o-triangle-stroke]{',
    'animation:o-triangle-spinner-draw var(--o-tri-speed) ease-in-out infinite;',
    '}',
    // From "all empty" to "all full" to "all empty", in the same direction:
    // the offset runs through two perimeters and never goes back.
    '@keyframes o-triangle-spinner-draw{',
    '0%{stroke-dashoffset:var(--o-tri-perimeter)}',
    '50%{stroke-dashoffset:0}',
    '100%{stroke-dashoffset:calc(var(--o-tri-perimeter) * -1)}',
    '}',
    '@media (prefers-reduced-motion:reduce){',
    '[data-o-triangle-stroke]{animation:none;stroke-dashoffset:0}',
    '}',
  ].join('')
  document.head.append(style)
}

/** Props of the component itself. */
export interface TriangleSpinnerOwnProps {
  /** Width of the triangle, in pixels. @defaultValue 44 */
  size?: number
  /** Thickness of the stroke, in pixels. @defaultValue 4 */
  thickness?: number
  /** Duration of one draw and erase cycle, in milliseconds. @defaultValue 1800 */
  speed?: number
  /** Colour of the stroke. @defaultValue the text colour */
  color?: string
  /** Label announced to screen readers. @defaultValue 'Loading' */
  label?: string
}

/** All the props. */
export type TriangleSpinnerProps = Customisable<TriangleSpinnerOwnProps, 'span'>

/**
 * Signals a wait through a triangle that draws then erases itself.
 *
 * @example
 * <TriangleSpinner />
 *
 * @example
 * // A thin stroke, slower, in the brand hue.
 * <TriangleSpinner thickness={2} speed={2600} color="var(--o-palette-brand-500)" />
 */
export function TriangleSpinner({
  size = 44,
  thickness = 4,
  speed = 1800,
  color = 'currentColor',
  label = 'Loading',
  ...rest
}: TriangleSpinnerProps): ReactElement {
  ensureTriangleRule()

  const { className, style } = mergePresentation({}, rest)

  // The drawing lives in a view of 100 units: the thickness asked for in
  // pixels is converted so that the stroke keeps its measure at any size.
  const stroke = Math.min((thickness / size) * 100, 20)

  const loaderStyle = {
    ...style,
    width: `${String(size)}px`,
    height: `${String(size)}px`,
    color,
    '--o-tri-speed': `${String(speed)}ms`,
    '--o-tri-perimeter': PERIMETER.toFixed(2),
  } as CSSProperties

  return (
    <span
      {...rest}
      className={className}
      style={loaderStyle}
      data-o-triangle-spinner=""
      role="status"
    >
      <span className="o-sr-only">{label}</span>
      <svg aria-hidden viewBox="0 0 100 100" width="100%" height="100%">
        <path
          data-o-triangle-track=""
          d={PATH}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          strokeLinejoin="round"
        />
        <path
          data-o-triangle-stroke=""
          d={PATH}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          strokeLinejoin="round"
          strokeLinecap="round"
          strokeDasharray={`${PERIMETER.toFixed(2)} ${PERIMETER.toFixed(2)}`}
        />
      </svg>
    </span>
  )
}

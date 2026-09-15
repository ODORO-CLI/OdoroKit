/**
 * Polygon gaining sides: an outlined polygon goes from triangle to hexagon one
 * side at a time, then loses them again.
 *
 * ## Sixty points for four polygons
 *
 * A browser only interpolates two paths if they have the same number of
 * points. A triangle has three, a hexagon six: to go from one to the other,
 * each polygon is rewritten with sixty points spread at equal distance along
 * its perimeter. Sixty because it is the lowest common multiple of three,
 * four, five and six: every real vertex then falls exactly on a point, and the
 * sides stay straight at every plateau instead of bulging.
 *
 * Between two plateaus, the points each slide towards their new place and a
 * vertex is born in the middle of a side. That is what the eye follows: not a
 * shape turning, but a shape growing more complex, then simpler again. The
 * round trip avoids the jump from hexagon to triangle a one-way loop would
 * impose.
 *
 * The interpolation is handed to SMIL, native in SVG: no JavaScript after the
 * first render, and no filter. The points are computed once when the module
 * loads.
 *
 * ## A status, not a drawing
 *
 * The element carries `role="status"` and a label for screen readers: waiting
 * is information, not decoration. The drawing is removed from the
 * accessibility tree.
 *
 * SMIL ignores the reduced motion preference: so it is the component that
 * reads it, and that does not insert the animation when it is on. What remains
 * is the hexagon, the most complete shape of the cycle.
 *
 * @module
 */

import { mergePresentation, useMotionState, type Customisable } from '@odoro-cli/engine'
import type { CSSProperties, ReactElement } from 'react'

/** Identifier of the injected stylesheet. */
const STYLE_ID = 'o-polygon-morph'

/** Points per path: the lowest common multiple of 3, 4, 5 and 6. */
const SAMPLES = 60

/** Radius of the circumscribed circle, in a view of 100 units. */
const RADIUS = 42

/**
 * Path of a regular polygon with `sides` sides, apex up, written with
 * `SAMPLES` points spread along its perimeter.
 */
function polygon(sides: number): string {
  const vertices = Array.from({ length: sides }, (_, index) => {
    const angle = ((2 * Math.PI) / sides) * index - Math.PI / 2
    return [50 + RADIUS * Math.cos(angle), 50 + RADIUS * Math.sin(angle)] as const
  })
  const perSide = SAMPLES / sides

  const points = Array.from({ length: SAMPLES }, (_, index) => {
    const side = Math.floor(index / perSide)
    const along = (index % perSide) / perSide
    const [ax, ay] = vertices[side] ?? [50, 50]
    const [bx, by] = vertices[(side + 1) % sides] ?? [50, 50]
    return `${(ax + (bx - ax) * along).toFixed(2)} ${(ay + (by - ay) * along).toFixed(2)}`
  })

  return `M ${points.join(' L ')} Z`
}

const TRIANGLE = polygon(3)
const SQUARE = polygon(4)
const PENTAGON = polygon(5)
const HEXAGON = polygon(6)

/** The round trip, with a plateau on every shape. */
const SEQUENCE = [TRIANGLE, SQUARE, PENTAGON, HEXAGON, PENTAGON, SQUARE]
const VALUES = [...SEQUENCE.flatMap((shape) => [shape, shape]), TRIANGLE].join(';')
const KEY_TIMES = Array.from({ length: SEQUENCE.length * 2 + 1 }, (_, index) => {
  // Each shape holds a little longer than it takes to change: the plateaus are
  // what one recognises, the transitions what moves.
  const step = Math.floor(index / 2)
  const hold = index % 2 === 1 ? 0.55 : 0
  return ((step + hold) / SEQUENCE.length).toFixed(4)
}).join(';')
const KEY_SPLINES = Array.from({ length: SEQUENCE.length * 2 }, () => '0.4 0 0.2 1').join(
  ';',
)

/** Sets up the frame, once per document. */
function ensurePolygonMorphRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-polygon-morph]{display:inline-block;line-height:0}',
    '[data-o-polygon-morph] svg{display:block}',
  ].join('')
  document.head.append(style)
}

/** Props of the component itself. */
export interface PolygonMorphOwnProps {
  /** Side of the drawing area, in pixels. @defaultValue 44 */
  size?: number
  /** Thickness of the stroke, in pixels. @defaultValue 3 */
  thickness?: number
  /** Duration of a complete round trip, in milliseconds. @defaultValue 3000 */
  speed?: number
  /** Colour of the stroke. @defaultValue the text colour */
  color?: string
  /** Label announced to screen readers. @defaultValue 'Loading' */
  label?: string
}

/** All the props. */
export type PolygonMorphProps = Customisable<PolygonMorphOwnProps, 'span'>

/**
 * Signals a wait through a polygon gaining and losing sides.
 *
 * @example
 * <PolygonMorph />
 *
 * @example
 * // Bigger, slower, in the brand hue.
 * <PolygonMorph size={72} speed={4800} color="var(--o-palette-brand-500)" />
 */
export function PolygonMorph({
  size = 44,
  thickness = 3,
  speed = 3000,
  color = 'currentColor',
  label = 'Loading',
  ...rest
}: PolygonMorphProps): ReactElement {
  ensurePolygonMorphRule()
  const { reduced } = useMotionState()

  const { className, style } = mergePresentation({}, rest)

  // The drawing lives in a view of 100 units: the thickness asked for in
  // pixels is converted so that the stroke keeps its measure at any size.
  const stroke = Math.min((thickness / size) * 100, 16)

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
      data-o-polygon-morph=""
      role="status"
    >
      <span className="o-sr-only">{label}</span>
      <svg aria-hidden viewBox="0 0 100 100" width="100%" height="100%">
        <path
          d={reduced ? HEXAGON : TRIANGLE}
          fill="currentColor"
          fillOpacity={0.12}
          stroke="currentColor"
          strokeWidth={stroke}
          strokeLinejoin="round"
        >
          {reduced ? null : (
            <animate
              attributeName="d"
              values={VALUES}
              keyTimes={KEY_TIMES}
              keySplines={KEY_SPLINES}
              calcMode="spline"
              dur={`${String(speed)}ms`}
              repeatCount="indefinite"
            />
          )}
        </path>
      </svg>
    </span>
  )
}

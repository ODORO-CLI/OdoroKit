/**
 * Circle, square, triangle: a solid shape goes from one to the next and back,
 * by interpolating a single SVG path.
 *
 * ## Three shapes, a single grammar
 *
 * A browser can only interpolate two paths if they have exactly the same
 * sequence of commands. The three shapes are therefore written with four cubic
 * curves each, even when the shape does not need them. The square is four
 * curves whose control points are aligned on the sides; the triangle has one
 * too many, laid on its left side like a flat vertex. The circle is the only
 * one to really use them all.
 *
 * That is what lets the shape flow from one state to the next instead of
 * jumping: the corners of the square are born from the tangents of the circle,
 * the fourth vertex of the triangle flattens into its side.
 *
 * The interpolation is handed to SMIL, native in SVG: no JavaScript after the
 * first render, and no filter. Each shape holds for a while before the next
 * transition: without the plateaus, the eye would never see a crisp shape.
 *
 * ## A status, not a drawing
 *
 * The element carries `role="status"` and a label for screen readers: waiting
 * is information, not decoration. The drawing is removed from the
 * accessibility tree.
 *
 * SMIL ignores the reduced motion preference: so it is the component that
 * reads it, and that does not insert the animation when it is on. What remains
 * is a solid circle, the first shape of the cycle.
 *
 * @module
 */

import { mergePresentation, useMotionState, type Customisable } from '@odoro-cli/engine'
import type { CSSProperties, ReactElement } from 'react'

/** Identifier of the injected stylesheet. */
const STYLE_ID = 'o-shape-morph'

/**
 * The three paths, in a view of 100 units.
 *
 * All of them start from the top right corner and turn clockwise, with four
 * cubic curves: that is the condition for the interpolation.
 */
const CIRCLE =
  'M 78.28 21.72 C 93.9 37.34 93.9 62.66 78.28 78.28 C 62.66 93.9 37.34 93.9 21.72 78.28 C 6.1 62.66 6.1 37.34 21.72 21.72 C 37.34 6.1 62.66 6.1 78.28 21.72 Z'
const SQUARE =
  'M 82 18 C 82 39.33 82 60.67 82 82 C 60.67 82 39.33 82 18 82 C 18 60.67 18 39.33 18 18 C 39.33 18 60.67 18 82 18 Z'
const TRIANGLE =
  'M 50 20 C 62 40.67 74 61.33 86 82 C 62 82 38 82 14 82 C 20 71.67 26 61.33 32 51 C 38 40.67 44 30.33 50 20 Z'

/** The sequence of shapes and plateaus, from 0 to 1 over the cycle. */
const VALUES = [CIRCLE, CIRCLE, SQUARE, SQUARE, TRIANGLE, TRIANGLE, CIRCLE].join(';')
const KEY_TIMES = '0;0.22;0.33;0.55;0.66;0.88;1'
/** A gentle easing on every transition, plateaus included. */
const KEY_SPLINES = Array.from({ length: 6 }, () => '0.4 0 0.2 1').join(';')

/** Sets up the frame, once per document. */
function ensureShapeMorphRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-shape-morph]{display:inline-block;line-height:0}',
    '[data-o-shape-morph] svg{display:block}',
  ].join('')
  document.head.append(style)
}

/** Props of the component itself. */
export interface ShapeMorphOwnProps {
  /** Side of the drawing area, in pixels. @defaultValue 40 */
  size?: number
  /** Duration of a complete cycle, in milliseconds. @defaultValue 2400 */
  speed?: number
  /** Colour of the shape. @defaultValue the text colour */
  color?: string
  /** Label announced to screen readers. @defaultValue 'Loading' */
  label?: string
}

/** All the props. */
export type ShapeMorphProps = Customisable<ShapeMorphOwnProps, 'span'>

/**
 * Signals a wait through a shape going from circle to square to triangle.
 *
 * @example
 * <ShapeMorph />
 *
 * @example
 * // Bigger, slower, in the brand hue.
 * <ShapeMorph size={64} speed={3600} color="var(--o-palette-brand-500)" />
 */
export function ShapeMorph({
  size = 40,
  speed = 2400,
  color = 'currentColor',
  label = 'Loading',
  ...rest
}: ShapeMorphProps): ReactElement {
  ensureShapeMorphRule()
  const { reduced } = useMotionState()

  const { className, style } = mergePresentation({}, rest)

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
      data-o-shape-morph=""
      role="status"
    >
      <span className="o-sr-only">{label}</span>
      <svg aria-hidden viewBox="0 0 100 100" width="100%" height="100%">
        <path d={CIRCLE} fill="currentColor">
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

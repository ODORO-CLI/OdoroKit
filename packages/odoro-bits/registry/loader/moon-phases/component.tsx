/**
 * Moon phases: an unlit disc on which the lit share grows until the full moon,
 * then wanes from the other edge.
 *
 * ## The terminator is a half ellipse
 *
 * The boundary between shadow and light is not a straight line: it is the edge
 * of a hemisphere seen at an angle, and therefore a half ellipse whose width
 * varies from the radius to minus the radius. At a positive width it bulges to
 * the right and carves out a crescent; at zero it is straight and gives the
 * first quarter; negative, it bulges to the left and the moon is gibbous.
 *
 * The path of the lit share is made of four cubics: two for the outer half
 * circle, two for the terminator. Arcs could have been used, but an arc
 * carries a sweep flag that flips at the quarter, and a flag does not
 * interpolate. A cubic, on the other hand, has only points: the path stays
 * affine in the width of the terminator, and the browser can go from one phase
 * to the next by simply interpolating three paths — new moon, full moon, new
 * moon.
 *
 * ## The invisible flip
 *
 * This path always lights the right edge. A waning moon, however, is lit on
 * the left. Rather than draw a second set of shapes, the group is flipped all
 * at once in the middle of the cycle — that is to say exactly at the full
 * moon, when the figure is a perfect, symmetrical disc, and the flip cannot be
 * seen. The second half of the cycle therefore replays the first in reverse,
 * in the right astronomical direction.
 *
 * The unlit disc stays underneath at all times, at low opacity: without it,
 * the new moon would be a void, and the loader would disappear.
 *
 * ## A status, not a drawing
 *
 * The element carries `role="status"` and a label for screen readers: waiting
 * is information, not decoration. The drawing is removed from the
 * accessibility tree.
 *
 * SMIL ignores the reduced motion preference: so it is the component that
 * reads it, and that does not insert the animations when it is on. What
 * remains is a first quarter, the most recognisable phase.
 *
 * @module
 */

import { mergePresentation, useMotionState, type Customisable } from '@odoro-cli/engine'
import type { CSSProperties, ReactElement } from 'react'

/** Identifier of the injected stylesheet. */
const STYLE_ID = 'o-moon-phases'

/** Radius of the moon, in view units. */
const RADIUS = 40

/**
 * Constant of the approximation of a quarter ellipse by a cubic.
 *
 * Four cubics whose tangents are at this fraction of the radius stray from the
 * circle by less than a thousandth: at this size, the gap is a hundred times
 * smaller than a pixel.
 */
const KAPPA = 0.5522847498

/**
 * Path of the lit share, for a given terminator width.
 *
 * At `+RADIUS` the terminator hugs the right edge and the lit share is empty:
 * new moon. At zero it is straight: first quarter. At `-RADIUS` it hugs the
 * left edge and the disc is full moon.
 */
function litPath(width: number): string {
  const r = RADIUS.toFixed(3)
  const negR = (-RADIUS).toFixed(3)
  const k = (KAPPA * RADIUS).toFixed(3)
  const negK = (-KAPPA * RADIUS).toFixed(3)
  const w = width.toFixed(3)
  const wk = (KAPPA * width).toFixed(3)

  return [
    `M 0 ${negR}`,
    // The outer edge, always the same: two quarter circles on the right.
    `C ${k} ${negR} ${r} ${negK} ${r} 0`,
    `C ${r} ${k} ${k} ${r} 0 ${r}`,
    // The terminator, going back up: two quarter ellipses of half width w.
    `C ${wk} ${r} ${w} ${k} ${w} 0`,
    `C ${w} ${negK} ${wk} ${negR} 0 ${negR}`,
    'Z',
  ].join(' ')
}

/** The three paths of the cycle: new, full, new. */
const PHASES = [litPath(RADIUS), litPath(-RADIUS), litPath(RADIUS)].join(';')

/** The first quarter: the terminator is straight. */
const QUARTER = litPath(0)

/**
 * A gentle easing on each half of the cycle.
 *
 * The width of the terminator then follows a curve close to a cosine, which is
 * the real law: the phase changes slowly near the new and the full moon, fast
 * at the quarters.
 */
const KEY_SPLINES = '0.4 0 0.6 1;0.4 0 0.6 1'

/** Sets up the frame, once per document. */
function ensureMoonRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-moon-phases]{display:inline-block;line-height:0}',
    '[data-o-moon-phases] svg{display:block}',
  ].join('')
  document.head.append(style)
}

/** Props of the component itself. */
export interface MoonPhasesOwnProps {
  /** Diameter of the moon, in pixels. @defaultValue 48 */
  size?: number
  /** Duration of a complete lunation, in milliseconds. @defaultValue 3600 */
  speed?: number
  /** Colour of the moon. @defaultValue the text colour */
  color?: string
  /** Label announced to screen readers. @defaultValue 'Loading' */
  label?: string
}

/** All the props. */
export type MoonPhasesProps = Customisable<MoonPhasesOwnProps, 'span'>

/**
 * Signals a wait through a moon walking its phases.
 *
 * @example
 * <MoonPhases />
 *
 * @example
 * // Bigger, slower, in the brand hue.
 * <MoonPhases size={80} speed={6000} color="var(--o-palette-brand-500)" />
 */
export function MoonPhases({
  size = 48,
  speed = 3600,
  color = 'currentColor',
  label = 'Loading',
  ...rest
}: MoonPhasesProps): ReactElement {
  ensureMoonRule()
  const { reduced } = useMotionState()

  const { className, style } = mergePresentation({}, rest)

  const loaderStyle = {
    ...style,
    width: `${String(size)}px`,
    height: `${String(size)}px`,
    color,
  } as CSSProperties

  const duration = `${String(speed)}ms`

  return (
    <span
      {...rest}
      className={className}
      style={loaderStyle}
      data-o-moon-phases=""
      role="status"
    >
      <span className="o-sr-only">{label}</span>
      <svg aria-hidden viewBox="0 0 100 100" width="100%" height="100%">
        <g transform="translate(50 50)">
          <circle cx="0" cy="0" r={RADIUS} fill="currentColor" opacity={0.16} />
          <g>
            {reduced ? null : (
              <animateTransform
                attributeName="transform"
                type="scale"
                values="1 1;-1 1"
                keyTimes="0;0.5"
                calcMode="discrete"
                dur={duration}
                repeatCount="indefinite"
              />
            )}
            <path d={reduced ? QUARTER : litPath(RADIUS)} fill="currentColor">
              {reduced ? null : (
                <animate
                  attributeName="d"
                  values={PHASES}
                  keyTimes="0;0.5;1"
                  keySplines={KEY_SPLINES}
                  calcMode="spline"
                  dur={duration}
                  repeatCount="indefinite"
                />
              )}
            </path>
          </g>
        </g>
      </svg>
    </span>
  )
}

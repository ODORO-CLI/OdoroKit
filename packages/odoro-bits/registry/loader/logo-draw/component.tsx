/**
 * A logo that draws itself: the outline of a brand is traced, filled in, then
 * emptied and erased, endlessly.
 *
 * ## A stroke, then a matter
 *
 * A logo that fades in tells no story. Here it is made in the order a hand
 * would make it: first the stroke, in a single gesture, from the start of the
 * path to its end; then the matter, which comes to take its place in the
 * shape once the shape is closed. The fill arrives after the tracing, never
 * during: it is that offset which makes the two beats read.
 *
 * The tracing is a dash as long as the whole path, moved by its offset. The
 * path declares a length of a hundred: the dash reads as a percentage, and
 * the keyframes hold for any logo, whatever the real length of its outline.
 * That is what lets one pass one's own brand in as a prop without touching
 * the stylesheet.
 *
 * The erasing follows the same direction as the tracing — the offset keeps
 * going down instead of coming back up — so the pencil never retraces its
 * steps: the tail catches up with the head, and the cycle closes on an empty
 * shape, exactly its starting point.
 *
 * Two CSS animations on SVG elements, held by the compositor, no JavaScript
 * after the first render.
 *
 * ## A status, not a drawing
 *
 * The element carries `role="status"` and a label for screen readers: the
 * wait is information, not decoration. The logo is removed from the
 * accessibility tree — it is a brand image, not content.
 *
 * Under reduced motion, the logo is fully traced and filled: the brand reads,
 * only its drawing stops.
 *
 * @module
 */

import { mergePresentation, type Customisable } from '@odoro-cli/engine'
import type { CSSProperties, ReactElement } from 'react'

/** Id of the injected stylesheet. */
const STYLE_ID = 'o-logo-draw'

/**
 * The odoro mark, in a 100-unit view: a quarter disc closed by its two
 * radii.
 */
const ODORO_MARK = 'M20.25 20.25H50a29.75 29.75 0 1 1-29.75 29.75Z'

/** Default view of the tracing. */
const ODORO_VIEW = '0 0 100 100'

/** Sets the tracing, the fill and their sequence, once per document. */
function ensureLogoRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-logo-draw]{display:inline-block;line-height:0}',
    '[data-o-logo-draw] svg{display:block}',
    '[data-o-logo-line]{',
    'stroke-dasharray:100 100;stroke-dashoffset:100;',
    'animation:o-logo-draw-line var(--o-logo-speed) infinite;',
    '}',
    '[data-o-logo-fill]{opacity:0;animation:o-logo-draw-fill var(--o-logo-speed) infinite}',
    // The stroke lands, holds, then erases in the same direction: the offset
    // goes down to minus a hundred instead of coming back up to a hundred.
    '@keyframes o-logo-draw-line{',
    '0%{stroke-dashoffset:100;animation-timing-function:ease-in-out}',
    '40%,84%{stroke-dashoffset:0;animation-timing-function:ease-in-out}',
    '100%{stroke-dashoffset:-100}',
    '}',
    // The matter only comes in once the shape is closed, and leaves before
    // the stroke starts to erase.
    '@keyframes o-logo-draw-fill{',
    '0%,40%{opacity:0;animation-timing-function:ease-out}',
    '56%,72%{opacity:1;animation-timing-function:ease-in}',
    '84%,100%{opacity:0}',
    '}',
    // Mark traced and full: the figure is said, standing still.
    '@media (prefers-reduced-motion:reduce){',
    '[data-o-logo-line]{animation:none;stroke-dashoffset:0}',
    '[data-o-logo-fill]{animation:none;opacity:1}',
    '}',
  ].join('')
  document.head.append(style)
}

/** Props specific to the component. */
export interface LogoDrawOwnProps {
  /** Side of the drawing, in pixels. @defaultValue 64 */
  size?: number
  /**
   * Outline of the logo, as SVG path data. A single closed path, so that the
   * fill makes sense.
   * @defaultValue the odoro mark
   */
  path?: string
  /** View of the tracing. To be changed along with the path. @defaultValue '0 0 100 100' */
  viewBox?: string
  /** Thickness of the stroke, in units of the view. @defaultValue 4 */
  thickness?: number
  /** Duration of one complete cycle, in milliseconds. @defaultValue 2800 */
  speed?: number
  /** Colour of the stroke and of the fill. @defaultValue the text colour */
  color?: string
  /** Label announced to screen readers. @defaultValue 'Loading' */
  label?: string
}

/** All props. */
export type LogoDrawProps = Customisable<LogoDrawOwnProps, 'span'>

/**
 * Signals a wait with a logo that traces itself then fills in.
 *
 * @example
 * <LogoDraw />
 *
 * @example
 * // One's own brand, in one's own view.
 * <LogoDraw path="M8 8 H56 V56 H8 Z" viewBox="0 0 64 64" size={80} />
 */
export function LogoDraw({
  size = 64,
  path = ODORO_MARK,
  viewBox = ODORO_VIEW,
  thickness = 4,
  speed = 2800,
  color = 'currentColor',
  label = 'Loading',
  ...rest
}: LogoDrawProps): ReactElement {
  ensureLogoRule()

  const { className, style } = mergePresentation({}, rest)

  const loaderStyle = {
    ...style,
    width: `${String(size)}px`,
    height: `${String(size)}px`,
    color,
    '--o-logo-speed': `${String(speed)}ms`,
  } as CSSProperties

  return (
    <span
      {...rest}
      className={className}
      style={loaderStyle}
      data-o-logo-draw=""
      role="status"
    >
      <span className="o-sr-only">{label}</span>
      <svg aria-hidden viewBox={viewBox} width="100%" height="100%">
        {/* The hollow shape: without it, a half-traced logo is only a
            fragment, and the eye does not know what is missing. */}
        <path
          d={path}
          fill="none"
          stroke="currentColor"
          strokeWidth={thickness}
          strokeOpacity={0.16}
          strokeLinejoin="round"
        />
        <path data-o-logo-fill="" d={path} fill="currentColor" />
        <path
          data-o-logo-line=""
          d={path}
          pathLength={100}
          fill="none"
          stroke="currentColor"
          strokeWidth={thickness}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      </svg>
    </span>
  )
}

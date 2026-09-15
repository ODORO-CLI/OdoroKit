/**
 * Turning hexagon: an outlined hexagon turns by notches of a sixth of a turn
 * while a solid hexagon pulses at its centre.
 *
 * ## Turning by notches
 *
 * A hexagon turning continuously looks like a round turning: nothing lets the
 * eye follow the motion. By notches, each sixth of a turn brings the figure
 * back onto itself and the eye sees a click, then a pause, then another click.
 * It is the motion of a nut being tightened, not that of a wheel.
 *
 * Two notches per cycle, and the cycle covers a third of a turn: a hexagon is
 * identical to itself every sixth of a turn, so the loop is invisible whatever
 * the number of notches. Two are enough to keep the cycle short and the delays
 * readable.
 *
 * The solid core pulses off the beat: it swells while the frame rests and
 * shrinks during the notch. Without it, the figure is a plain outline; with
 * it, it has a beating heart.
 *
 * Both animations are transforms on SVG groups, held by the compositor. No
 * JavaScript after the first render.
 *
 * ## A status, not a drawing
 *
 * The element carries `role="status"` and a label for screen readers: the wait
 * is information, not decoration. The drawing is removed from the
 * accessibility tree.
 *
 * Under reduced motion, the two hexagons stay aligned, point up: the figure
 * still reads as a loader, only the motion stops.
 *
 * @module
 */

import { mergePresentation, type Customisable } from '@odoro-cli/engine'
import type { CSSProperties, ReactElement } from 'react'

/** Identifier of the injected stylesheet. */
const STYLE_ID = 'o-hex-spinner'

/**
 * Vertices of a point-up hexagon of the given radius, around (50, 50).
 *
 * Computed once per radius: the outline and the core each have their own.
 */
function hexagon(radius: number): string {
  return Array.from({ length: 6 }, (_, index) => {
    const angle = (Math.PI / 3) * index - Math.PI / 2
    const x = 50 + radius * Math.cos(angle)
    const y = 50 + radius * Math.sin(angle)
    return `${x.toFixed(2)},${y.toFixed(2)}`
  }).join(' ')
}

/** The solid core takes a little less than half of the outline. */
const CORE = hexagon(21)

/** Sets the hexagons, their notches and their pulse, once per document. */
function ensureHexRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-hex-spinner]{display:inline-block;line-height:0}',
    '[data-o-hex-spinner] svg{display:block}',
    // The origin is the centre of the view, in view units: that is what
    // `transform-box:view-box` guarantees whatever the rendered size.
    '[data-o-hex-frame],[data-o-hex-core]{',
    'transform-box:view-box;transform-origin:50px 50px;',
    '}',
    '[data-o-hex-frame]{',
    'animation:o-hex-spinner-notch var(--o-hex-speed) ease-in-out infinite;',
    '}',
    '[data-o-hex-core]{',
    'animation:o-hex-spinner-beat var(--o-hex-speed) ease-in-out infinite;',
    '}',
    // Two notches, two rests. A notch lasts a little less than the rest that
    // follows it: the click is sharp, the pause is readable.
    '@keyframes o-hex-spinner-notch{',
    '0%,12%{transform:rotate(0deg)}',
    '40%,62%{transform:rotate(60deg)}',
    '90%,100%{transform:rotate(120deg)}',
    '}',
    // The core swells while the frame rests and shrinks during the notches:
    // the two motions take turns instead of piling up.
    '@keyframes o-hex-spinner-beat{',
    '0%,12%{transform:scale(1);opacity:1}',
    '26%{transform:scale(0.55);opacity:0.5}',
    '40%,62%{transform:scale(1);opacity:1}',
    '76%{transform:scale(0.55);opacity:0.5}',
    '90%,100%{transform:scale(1);opacity:1}',
    '}',
    '@media (prefers-reduced-motion:reduce){',
    '[data-o-hex-frame],[data-o-hex-core]{animation:none;transform:none;opacity:1}',
    '}',
  ].join('')
  document.head.append(style)
}

/** Properties specific to the component. */
export interface HexSpinnerOwnProps {
  /** Width of the hexagon, in pixels. @defaultValue 44 */
  size?: number
  /** Thickness of the outer stroke, in pixels. @defaultValue 3 */
  thickness?: number
  /** Duration of two notches, in milliseconds. @defaultValue 1600 */
  speed?: number
  /** Colour of the two hexagons. @defaultValue the text colour */
  color?: string
  /** Label announced to screen readers. @defaultValue 'Loading' */
  label?: string
}

/** All the properties. */
export type HexSpinnerProps = Customisable<HexSpinnerOwnProps, 'span'>

/**
 * Signals a wait with a hexagon that turns by notches.
 *
 * @example
 * <HexSpinner />
 *
 * @example
 * // A thin stroke, slower, in the brand hue.
 * <HexSpinner thickness={2} speed={2400} color="var(--o-palette-brand-500)" />
 */
export function HexSpinner({
  size = 44,
  thickness = 3,
  speed = 1600,
  color = 'currentColor',
  label = 'Loading',
  ...rest
}: HexSpinnerProps): ReactElement {
  ensureHexRule()

  const { className, style } = mergePresentation({}, rest)

  // The drawing lives in a view of 100 units: the thickness asked for in
  // pixels is converted so that the stroke keeps its measure at any size, and
  // the outline pulls back by half a thickness so as not to be clipped.
  const stroke = Math.min((thickness / size) * 100, 20)
  const frame = hexagon(48 - stroke / 2)

  const loaderStyle = {
    ...style,
    width: `${String(size)}px`,
    height: `${String(size)}px`,
    color,
    '--o-hex-speed': `${String(speed)}ms`,
  } as CSSProperties

  return (
    <span
      {...rest}
      className={className}
      style={loaderStyle}
      data-o-hex-spinner=""
      role="status"
    >
      <span className="o-sr-only">{label}</span>
      <svg aria-hidden viewBox="0 0 100 100" width="100%" height="100%">
        <g data-o-hex-frame="">
          <polygon
            points={frame}
            fill="none"
            stroke="currentColor"
            strokeWidth={stroke}
            strokeLinejoin="round"
          />
        </g>
        <g data-o-hex-core="">
          <polygon points={CORE} fill="currentColor" />
        </g>
      </svg>
    </span>
  )
}

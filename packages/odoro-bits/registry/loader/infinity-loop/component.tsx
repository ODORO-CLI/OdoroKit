/**
 * Infinite loop: a short stroke travels a lying figure eight, slow at the
 * ends of the loops, fast at the crossing.
 *
 * ## A figure eight that crosses, not two rings that touch
 *
 * The path is a single closed curve, in four cubic segments, whose tangents
 * join at the centre: the stroke passes through it in a straight line from
 * one loop to the other, as on a real infinity symbol. Two circles set side
 * by side would give an angular point in the middle, where the stroke would
 * turn back on itself.
 *
 * The stroke is a dash on that path, moved by its offset. The path declares a
 * length of a hundred: the dash and its offset then read as a percentage of
 * the path, whatever its real length, and the keyframes land right. The
 * offset advances by half turns in `ease-in-out`, timed so that the slow
 * moment falls at the end of each loop and the peak of speed at the crossing:
 * it is the movement of a bead on a figure-eight rail, which climbs while
 * braking and comes down accelerating. A linear offset — the default choice —
 * would give a stroke with no weight.
 *
 * One animation on an SVG element, held by the compositor, no JavaScript
 * after the first render.
 *
 * ## A status, not a drawing
 *
 * The element carries `role="status"` and a label for screen readers: the
 * wait is information, not decoration. The path is removed from the
 * accessibility tree.
 *
 * Under reduced motion, the stroke is set at the end of a loop, on its rail
 * in a light stroke: the figure still reads, only the travel stops.
 *
 * @module
 */

import { mergePresentation, type Customisable } from '@odoro-cli/engine'
import type { CSSProperties, ReactElement } from 'react'

/** Id of the injected stylesheet. */
const STYLE_ID = 'o-infinity-loop'

/**
 * The figure eight, in a 100 by 56 view.
 *
 * It leaves the centre towards the right loop, travels it, passes the centre
 * again in the same direction, travels the left loop, and comes back.
 */
const EIGHT =
  'M 50 28 C 64 0, 92 0, 92 28 C 92 56, 64 56, 50 28 C 36 0, 8 0, 8 28 C 8 56, 36 56, 50 28'

/** Length of the dash, as a percentage of the path. */
const DASH = 24

/**
 * Starting offset, as a percentage of the path.
 *
 * The end of the right loop is at a quarter of the path; the dash is centred
 * there at the slowest moment, and the centre of the dash is half its length
 * behind its head.
 */
const START = 25 - DASH / 2

/** Sets the rail, the dash and its travel, once per document. */
function ensureInfinityRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-infinity-loop]{display:inline-block;line-height:0}',
    '[data-o-infinity-loop] svg{display:block}',
    '[data-o-infinity-dash]{',
    `stroke-dasharray:${String(DASH)} ${String(100 - DASH)};`,
    `stroke-dashoffset:${String(-START)};`,
    'animation:o-infinity-loop-run var(--o-infinity-speed) infinite;',
    '}',
    // Two half turns per cycle: slow at the end of each loop, peak of speed
    // at the crossing.
    '@keyframes o-infinity-loop-run{',
    `0%{stroke-dashoffset:${String(-START)};animation-timing-function:ease-in-out}`,
    `50%{stroke-dashoffset:${String(-START - 50)};animation-timing-function:ease-in-out}`,
    `100%{stroke-dashoffset:${String(-START - 100)}}`,
    '}',
    // The dash set at the end of a loop: the figure is said, standing still.
    '@media (prefers-reduced-motion:reduce){',
    '[data-o-infinity-dash]{animation:none}',
    '}',
  ].join('')
  document.head.append(style)
}

/** Props specific to the component. */
export interface InfinityLoopOwnProps {
  /** Width of the figure eight, in pixels. @defaultValue 64 */
  size?: number
  /** Thickness of the stroke, in pixels. @defaultValue 4 */
  thickness?: number
  /** Duration of one complete turn of the figure eight, in milliseconds. @defaultValue 2000 */
  speed?: number
  /** Colour of the stroke and of the rail. @defaultValue the text colour */
  color?: string
  /** Label announced to screen readers. @defaultValue 'Loading' */
  label?: string
}

/** All props. */
export type InfinityLoopProps = Customisable<InfinityLoopOwnProps, 'span'>

/**
 * Signals a wait with a stroke travelling a lying figure eight.
 *
 * @example
 * <InfinityLoop />
 *
 * @example
 * // Wider, thinner, slower, in the brand hue.
 * <InfinityLoop size={96} thickness={3} speed={3000} color="var(--o-palette-brand-500)" />
 */
export function InfinityLoop({
  size = 64,
  thickness = 4,
  speed = 2000,
  color = 'currentColor',
  label = 'Loading',
  ...rest
}: InfinityLoopProps): ReactElement {
  ensureInfinityRule()

  const { className, style } = mergePresentation({}, rest)

  // The drawing lives in a view 100 units wide: the thickness asked for in
  // pixels is converted so that the stroke keeps its measure at any size.
  // The figure eight leaves eight units of margin on the sides, which bounds
  // the thickness.
  const stroke = Math.min((thickness / size) * 100, 14)

  const loaderStyle = {
    ...style,
    width: `${String(size)}px`,
    height: `${String(size * 0.56)}px`,
    color,
    '--o-infinity-speed': `${String(speed)}ms`,
  } as CSSProperties

  return (
    <span
      {...rest}
      className={className}
      style={loaderStyle}
      data-o-infinity-loop=""
      role="status"
    >
      <span className="o-sr-only">{label}</span>
      <svg aria-hidden viewBox="0 0 100 56" width="100%" height="100%">
        <path
          d={EIGHT}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          strokeOpacity={0.2}
          strokeLinecap="round"
        />
        <path
          data-o-infinity-dash=""
          d={EIGHT}
          pathLength={100}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          strokeLinecap="round"
        />
      </svg>
    </span>
  )
}

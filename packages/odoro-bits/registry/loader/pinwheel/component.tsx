/**
 * Pinwheel: four triangular blades in two shades turn in gusts, one
 * acceleration and one slowdown per half turn.
 *
 * ## Turning as if under the wind
 *
 * A pinwheel does not turn at constant speed: it starts under a gust, slows
 * down, starts again. The rotation is therefore cut into two half turns,
 * each with its own acceleration and its own slowdown. A pinwheel with four
 * blades in two shades is identical to itself every half turn: the loop is
 * invisible, and the eye sees nothing but gusts.
 *
 * ## One blade, four times
 *
 * Each blade is a square cut into a triangle by a `clip-path`, one vertex of
 * which is the center of the pinwheel. The four blades are the same element,
 * turned a quarter turn each time around that vertex. Every other blade is
 * dimmed: without that alternation, four triangles of the same color form a
 * solid square and nothing turns.
 *
 * The hub is a round dot at the center: it hides the junction of the four
 * vertices, which never falls exactly right to the pixel.
 *
 * A single animation, on the container of the blades, held by the
 * compositor. No JavaScript after the first render.
 *
 * ## A status, not a drawing
 *
 * The element carries `role="status"` and a label for screen readers: the
 * wait is information, not decoration. The pinwheel itself is removed from
 * the accessibility tree.
 *
 * Under reduced motion, the pinwheel stays still: four blades in two shades
 * still read as a loader, only the wind drops.
 *
 * @module
 */

import { mergePresentation, type Customisable } from '@odoro-cli/engine'
import type { CSSProperties, ReactElement } from 'react'

/** Id of the injected stylesheet. */
const STYLE_ID = 'o-pinwheel'

/** Sets the blades and their gusts, once per document. */
function ensurePinwheelRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-pinwheel]{display:inline-block;line-height:0}',
    '[data-o-pinwheel-wheel]{',
    'display:block;position:relative;',
    'width:var(--o-pinwheel-size);height:var(--o-pinwheel-size);',
    'animation:o-pinwheel-gust var(--o-pinwheel-speed) infinite;',
    '}',
    // One blade takes the top right quarter; its bottom left vertex is the
    // center of the pinwheel, and it is around it that the copies turn.
    '[data-o-pinwheel-blade]{',
    'position:absolute;top:0;left:50%;width:50%;height:50%;',
    'background:color-mix(in oklab, var(--o-pinwheel-color) var(--o-pinwheel-shade), transparent);',
    'clip-path:polygon(0 100%, 0 0, 100% 100%);',
    'transform-origin:0 100%;transform:rotate(var(--o-pinwheel-angle));',
    '}',
    '[data-o-pinwheel-hub]{',
    'position:absolute;top:50%;left:50%;width:22%;height:22%;',
    'border-radius:50%;background:var(--o-pinwheel-color);',
    'transform:translate(-50%,-50%);',
    '}',
    // Two gusts per turn, each with its momentum and its slowdown: one
    // `ease-in-out` per half turn, not a linear over the whole turn.
    '@keyframes o-pinwheel-gust{',
    '0%{transform:rotate(0deg);animation-timing-function:cubic-bezier(0.55,0,0.3,1)}',
    '50%{transform:rotate(180deg);animation-timing-function:cubic-bezier(0.55,0,0.3,1)}',
    '100%{transform:rotate(360deg)}',
    '}',
    '@media (prefers-reduced-motion:reduce){',
    '[data-o-pinwheel-wheel]{animation:none;transform:none}',
    '}',
  ].join('')
  document.head.append(style)
}

/** The component's own props. */
export interface PinwheelOwnProps {
  /** Diameter of the pinwheel, in pixels. @defaultValue 40 */
  size?: number
  /** Duration of one turn, that is two gusts, in milliseconds. @defaultValue 1600 */
  speed?: number
  /** Color of the blades. @defaultValue the text color */
  color?: string
  /** Label announced to screen readers. @defaultValue 'Loading' */
  label?: string
}

/** All props. */
export type PinwheelProps = Customisable<PinwheelOwnProps, 'span'>

/**
 * Signals a wait with a pinwheel that turns in gusts.
 *
 * @example
 * <Pinwheel />
 *
 * @example
 * // Bigger, slower, in the brand hue.
 * <Pinwheel size={64} speed={2400} color="var(--o-palette-brand-500)" />
 */
export function Pinwheel({
  size = 40,
  speed = 1600,
  color = 'currentColor',
  label = 'Loading',
  ...rest
}: PinwheelProps): ReactElement {
  ensurePinwheelRule()

  const { className, style } = mergePresentation({}, rest)

  const loaderStyle = {
    ...style,
    '--o-pinwheel-size': `${String(size)}px`,
    '--o-pinwheel-speed': `${String(speed)}ms`,
    '--o-pinwheel-color': color,
  } as CSSProperties

  return (
    <span
      {...rest}
      className={className}
      style={loaderStyle}
      data-o-pinwheel=""
      role="status"
    >
      <span className="o-sr-only">{label}</span>
      <span aria-hidden data-o-pinwheel-wheel="">
        {[0, 1, 2, 3].map((blade) => (
          <span
            key={blade}
            data-o-pinwheel-blade=""
            style={
              {
                '--o-pinwheel-angle': `${String(blade * 90)}deg`,
                // Every other blade is dimmed: it is the alternation that
                // makes the rotation visible.
                '--o-pinwheel-shade': blade % 2 === 0 ? '100%' : '45%',
              } as CSSProperties
            }
          />
        ))}
        <span data-o-pinwheel-hub="" />
      </span>
    </span>
  )
}

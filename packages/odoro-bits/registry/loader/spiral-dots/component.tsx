/**
 * Spiral dots: fourteen dots laid along a spiral light up in turn, from the
 * center outwards.
 *
 * ## Why an SVG
 *
 * A spiral is a curve: placing its dots in CSS would mean positioning them
 * one by one in absolute pixels, and the figure would no longer follow the
 * size asked for. In a `viewBox`, the positions are computed once in
 * drawing units, and the browser scales the whole thing.
 *
 * The spiral is an Archimedean one: the radius grows with the angle, at a
 * constant pitch. The dots grow bigger as they move away from the center,
 * because the space between them grows too — dots of the same size would
 * let the spiral fall apart towards the outside.
 *
 * ## A single animation, fourteen phases
 *
 * Every dot plays the same rise and the same fade, with its own lead: the
 * center has the greatest, the periphery starts from zero. The signal seems
 * to run along the thread, while no dot moves at all.
 *
 * ## A status, not a drawing
 *
 * The element carries `role="status"` and a label for screen readers: the
 * wait is information, not decoration. The drawing is removed from the
 * accessibility tree.
 *
 * Under reduced motion, the spiral stays drawn, in a fixed gradient from a
 * pale center to a solid periphery: the figure still reads as a loader,
 * only the run stops.
 *
 * @module
 */

import { mergePresentation, type Customisable } from '@odoro-cli/engine'
import type { CSSProperties, ReactElement } from 'react'

/** Identifier of the injected stylesheet. */
const STYLE_ID = 'o-spiral-dots'

/** Number of dots on the spiral. */
const COUNT = 14

/** Applies the lighting of the dots, once per document. */
function ensureSpiralRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-spiral-dots]{display:inline-block;line-height:0}',
    '[data-o-spiral-dot]{',
    'fill:var(--o-spiral-color);',
    // The scaling happens around the dot itself, not the drawing origin.
    'transform-box:fill-box;transform-origin:center;',
    'animation:o-spiral-dots-light var(--o-spiral-speed) ease-in-out infinite;',
    'animation-delay:var(--o-spiral-delay);',
    '}',
    // A dot is lit for a fifth of the cycle: short enough for the signal to
    // be seen running, long enough for three dots to overlap.
    '@keyframes o-spiral-dots-light{',
    '0%,20%,100%{opacity:0.2;transform:scale(0.7)}',
    '10%{opacity:1;transform:scale(1.3)}',
    '}',
    // The whole spiral, in a fixed gradient: it still says "waiting".
    '@media (prefers-reduced-motion:reduce){',
    '[data-o-spiral-dot]{animation:none;transform:none;opacity:var(--o-spiral-rest)}',
    '}',
  ].join('')
  document.head.append(style)
}

/** Properties specific to the component. */
export interface SpiralDotsOwnProps {
  /** Side of the drawing, in pixels. @defaultValue 48 */
  size?: number
  /** Duration of a complete run, in milliseconds. @defaultValue 1600 */
  speed?: number
  /** Color of the dots. @defaultValue the text color */
  color?: string
  /** Label announced to screen readers. @defaultValue 'Loading' */
  label?: string
}

/** All the properties. */
export type SpiralDotsProps = Customisable<SpiralDotsOwnProps, 'span'>

/**
 * Dots of the spiral, in units of the hundred by hundred `viewBox`.
 *
 * One turn and a half, from the center to a few units from the edge.
 * Computed once: they depend neither on the size nor on the speed.
 */
const DOTS = Array.from({ length: COUNT }, (_, index) => {
  const t = index / (COUNT - 1)
  const angle = t * 3 * Math.PI - Math.PI / 2
  const radius = 4 + t * 40
  return {
    x: 50 + Math.cos(angle) * radius,
    y: 50 + Math.sin(angle) * radius,
    r: 1.8 + t * 3.2,
    rest: 0.3 + t * 0.7,
  }
})

/**
 * Signals a wait with a signal running along a spiral.
 *
 * @example
 * <SpiralDots />
 *
 * @example
 * // Bigger, slower, in the brand hue.
 * <SpiralDots size={96} speed={2600} color="var(--o-palette-brand-500)" />
 */
export function SpiralDots({
  size = 48,
  speed = 1600,
  color = 'currentColor',
  label = 'Loading',
  ...rest
}: SpiralDotsProps): ReactElement {
  ensureSpiralRule()

  const { className, style } = mergePresentation({}, rest)

  const loaderStyle = {
    ...style,
    '--o-spiral-speed': `${String(speed)}ms`,
    '--o-spiral-color': color,
  } as CSSProperties

  return (
    <span
      {...rest}
      className={className}
      style={loaderStyle}
      data-o-spiral-dots=""
      role="status"
    >
      <span className="o-sr-only">{label}</span>
      <svg aria-hidden width={size} height={size} viewBox="0 0 100 100">
        {DOTS.map((dot, index) => (
          <circle
            key={index}
            data-o-spiral-dot=""
            cx={dot.x.toFixed(2)}
            cy={dot.y.toFixed(2)}
            r={dot.r.toFixed(2)}
            style={
              {
                // The center has the greatest lead, the periphery starts
                // from zero: the signal runs outwards, negative so that it
                // is already under way on the first frame.
                '--o-spiral-delay': `${String(Math.round((-speed * (COUNT - 1 - index)) / COUNT))}ms`,
                '--o-spiral-rest': dot.rest.toFixed(2),
              } as CSSProperties
            }
          />
        ))}
      </svg>
    </span>
  )
}

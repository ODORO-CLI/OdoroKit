/**
 * Rings: concentric circles, as one repeating radial gradient.
 *
 * ## Why the centre is adjustable
 *
 * Centred rings read as a target; offset towards a corner, they become a wave
 * crossing the page and they leave the optical centre free for the content. The
 * emission point is therefore two settings, not a constant — it is what decides
 * what the pattern tells.
 *
 * ## Why no script
 *
 * A `repeating-radial-gradient` describes the entire series: one stroke, one
 * gap, and repeating to the edge is free. The compositor draws it all; adding a
 * canvas or a graphics surface would not change a pixel of the result, but
 * would reserve a context that the browser only hands out in limited numbers.
 *
 * @module
 */

import { mergePresentation, type Customisable } from '@odoro-cli/engine'
import { type CSSProperties, type ReactElement } from 'react'

/** Props specific to this component. */
export interface RingsOwnProps {
  /** Gap between two rings, in pixels. @defaultValue 32 */
  spacing?: number
  /** Thickness of the stroke, in pixels. @defaultValue 1 */
  thickness?: number
  /** Horizontal position of the centre, between 0 and 1. @defaultValue 0.5 */
  x?: number
  /** Vertical position of the centre, between 0 and 1. @defaultValue 0.5 */
  y?: number
  /** Colour of the rings. */
  color?: string
}

/** All props. */
export type RingsProps = Customisable<RingsOwnProps>

/**
 * Background rings.
 *
 * @example
 * <div className="o-relative o-min-h-screen">
 *   <Rings className="o-absolute o-inset-0" x={0.8} y={0.2} />
 *   <main className="o-relative">…</main>
 * </div>
 */
export function Rings({
  spacing = 32,
  thickness = 1,
  x = 0.5,
  y = 0.5,
  color = 'color-mix(in oklab, var(--o-palette-cyan-500, oklch(71.5% 0.143 215.221)) 18%, transparent)',
  ...rest
}: RingsProps): ReactElement {
  const line = `${String(thickness)}px`
  const period = `${String(spacing)}px`
  const centre = `${String(Math.round(x * 100))}% ${String(Math.round(y * 100))}%`

  const { className, style } = mergePresentation({}, rest)

  return (
    <div
      {...rest}
      className={className}
      style={
        {
          ...style,
          backgroundImage: `repeating-radial-gradient(circle at ${centre}, ${color} 0 ${line}, transparent ${line} ${period})`,
        } as CSSProperties
      }
      aria-hidden
    />
  )
}

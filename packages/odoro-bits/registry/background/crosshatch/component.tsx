/**
 * Crosshatch: two crossed diagonal patterns, from repeated gradients.
 *
 * ## Why two patterns and not one rotated grid
 *
 * Rotating a grid by 45 degrees with `transform` would mean oversizing the
 * element to cover the corners, then masking the overflow. Two
 * `repeating-linear-gradient`s tilted at plus and minus 45 degrees draw the
 * same crosshatch without rotation, without surplus and without a mask: the
 * tilt is carried by the gradient itself.
 *
 * ## Where the strokes cross
 *
 * At the crossings the two patterns overlap and the colour accumulates there
 * naturally — that slight reinforcement of the knots is what gives the
 * pattern its substance, and it is free: no dedicated layer draws it.
 *
 * @module
 */

import { mergePresentation, type Customisable } from '@odoro-cli/engine'
import { type CSSProperties, type ReactElement } from 'react'

/** Properties specific to this component. */
export interface CrosshatchOwnProps {
  /** Gap between two strokes of the same pattern, in pixels. @defaultValue 14 */
  spacing?: number
  /** Opacity of the strokes, between 0 and 1. @defaultValue 0.12 */
  strength?: number
  /** Stroke colour. */
  color?: string
}

/** Every property. */
export type CrosshatchProps = Customisable<CrosshatchOwnProps>

/**
 * Background crosshatch.
 *
 * @example
 * <div className="o-relative o-min-h-screen">
 *   <Crosshatch className="o-absolute o-inset-0" spacing={18} />
 *   <main className="o-relative">…</main>
 * </div>
 */
export function Crosshatch({
  spacing = 14,
  strength = 0.12,
  color = 'var(--o-palette-zinc-500, oklch(55.2% 0.016 285.938))',
  ...rest
}: CrosshatchProps): ReactElement {
  const line = `color-mix(in oklab, ${color} ${String(Math.round(strength * 100))}%, transparent)`
  const period = `${String(spacing)}px`

  const { className, style } = mergePresentation({}, rest)

  return (
    <div
      {...rest}
      className={className}
      style={
        {
          ...style,
          backgroundImage: [
            `repeating-linear-gradient(45deg, ${line} 0 1px, transparent 1px ${period})`,
            `repeating-linear-gradient(-45deg, ${line} 0 1px, transparent 1px ${period})`,
          ].join(','),
        } as CSSProperties
      }
      aria-hidden
    />
  )
}

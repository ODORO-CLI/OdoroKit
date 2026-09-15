/**
 * Masked dots: a grid of dots faded towards the edges by a mask.
 *
 * ## Why a mask rather than one more gradient
 *
 * Fading the pattern with a gradient laid over it would mean knowing the
 * background colour in order to paint on top of it — the component would stop
 * being placeable anywhere. A `mask-image` takes opacity away instead of adding
 * paint: the vignette works over any background, light or dark, without knowing
 * anything about it.
 *
 * ## Why the vignette is a continuous setting
 *
 * At zero the mask disappears entirely — not a transparent mask, no mask at
 * all, the compositor then having nothing to compose. In between, the value
 * simply moves the start of the fade closer to the centre.
 *
 * @module
 */

import { mergePresentation, type Customisable } from '@odoro-cli/engine'
import { type CSSProperties, type ReactElement } from 'react'

/** Props specific to this component. */
export interface SpotGridOwnProps {
  /** Pitch of the grid, in pixels. @defaultValue 24 */
  gap?: number
  /** Radius of a dot, in pixels. @defaultValue 2 */
  dot?: number
  /** Strength of the vignette, between 0 and 1. Zero removes it. @defaultValue 0.6 */
  vignette?: number
  /** Colour of the dots. */
  color?: string
}

/** All props. */
export type SpotGridProps = Customisable<SpotGridOwnProps>

/**
 * Background dot grid.
 *
 * @example
 * <div className="o-relative o-min-h-screen">
 *   <SpotGrid className="o-absolute o-inset-0" gap={32} />
 *   <main className="o-relative">…</main>
 * </div>
 */
export function SpotGrid({
  gap = 24,
  dot = 2,
  vignette = 0.6,
  color = 'color-mix(in oklab, var(--o-theme-muted, oklch(55.2% 0.016 285.938)) 35%, transparent)',
  ...rest
}: SpotGridProps): ReactElement {
  const radius = `${String(dot)}px`
  const period = `${String(gap)}px`

  const mask =
    vignette > 0
      ? `radial-gradient(ellipse at center, black ${String(Math.round(75 - vignette * 55))}%, transparent 100%)`
      : undefined

  const { className, style } = mergePresentation({}, rest)

  return (
    <div
      {...rest}
      className={className}
      style={
        {
          ...style,
          backgroundImage: `radial-gradient(circle, ${color} ${radius}, transparent ${radius})`,
          backgroundSize: `${period} ${period}`,
          ...(mask === undefined ? {} : { WebkitMaskImage: mask, maskImage: mask }),
        } as CSSProperties
      }
      aria-hidden
    />
  )
}

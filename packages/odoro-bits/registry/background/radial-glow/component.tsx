/**
 * Halo: two glows layered to settle a hero.
 *
 * ## Why two glows and not one
 *
 * A single radial blob reads as a spotlight: clean, but flat. The second glow,
 * offset and in a neighbouring hue, breaks the symmetry and gives the
 * background a depth the eye credits to a lighting rig rather than to a
 * pattern. The offset is fixed relative to the main centre: moving the halo
 * moves the whole thing, with no extra setting to maintain.
 *
 * ## Why no script
 *
 * Two `radial-gradient`s over a solid background describe the entire scene, and
 * the compositor paints them once and for all. It is the cheapest hero
 * background there is: no graphics context, no ceiling to share, and it can be
 * placed as many times as one likes.
 *
 * @module
 */

import { mergePresentation, type Customisable } from '@odoro-cli/engine'
import { type CSSProperties, type ReactElement } from 'react'

/** Props specific to this component. */
export interface RadialGlowOwnProps {
  /** Extent of the halo, as a fraction of the frame. @defaultValue 0.9 */
  size?: number
  /** Horizontal position of the halo, between 0 and 1. @defaultValue 0.5 */
  x?: number
  /** Vertical position of the halo, between 0 and 1. @defaultValue 0.3 */
  y?: number
  /** Intensity of the glows, between 0 and 1. @defaultValue 0.5 */
  strength?: number
  /** Colour of the main glow. */
  color?: string
  /** Colour of the accent glow. */
  accent?: string
  /** Colour of the background. */
  background?: string
}

/** All props. */
export type RadialGlowProps = Customisable<RadialGlowOwnProps>

/**
 * Background halo.
 *
 * @example
 * <div className="o-relative o-min-h-screen">
 *   <RadialGlow className="o-absolute o-inset-0" y={0.15} />
 *   <main className="o-relative">…</main>
 * </div>
 */
export function RadialGlow({
  size = 0.9,
  x = 0.5,
  y = 0.3,
  strength = 0.5,
  color = 'var(--o-palette-brand-500, oklch(59.8% 0.198 275))',
  accent = 'var(--o-palette-fuchsia-500, oklch(66.7% 0.295 322.15))',
  background = 'var(--o-theme-bg, oklch(98.5% 0 0))',
  ...rest
}: RadialGlowProps): ReactElement {
  const halo = `color-mix(in oklab, ${color} ${String(Math.round(strength * 100))}%, transparent)`
  const glint = `color-mix(in oklab, ${accent} ${String(Math.round(strength * 70))}%, transparent)`

  const pct = (value: number): string => `${String(Math.round(value * 100))}%`

  const { className, style } = mergePresentation({}, rest)

  return (
    <div
      {...rest}
      className={className}
      style={
        {
          ...style,
          backgroundColor: background,
          backgroundImage: [
            `radial-gradient(ellipse ${pct(size * 0.75)} ${pct(size * 0.6)} at ${pct(x)} ${pct(y)}, ${halo}, transparent 70%)`,
            `radial-gradient(ellipse ${pct(size * 0.55)} ${pct(size * 0.45)} at ${pct(x + 0.22)} ${pct(y + 0.24)}, ${glint}, transparent 70%)`,
          ].join(','),
        } as CSSProperties
      }
      aria-hidden
    />
  )
}

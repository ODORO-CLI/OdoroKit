/**
 * Stripes: diagonal bands, from a single repeated gradient.
 *
 * ## Why a single gradient is enough
 *
 * A stripe is an alternation between two states along an axis. That is the
 * very definition of a `repeating-linear-gradient`: a band of colour, a gap,
 * and the repetition comes for free. Drawing this with a script or a graphics
 * surface would mean paying for what the compositor already does.
 *
 * ## Why the width and the gap are two settings
 *
 * A single density says nothing: wide, tight bands make a blind, thin, widely
 * spaced ones make a watermark. Separating the width of the band from that of
 * the gap covers both, where a single "pitch" would conflate them.
 *
 * @module
 */

import { mergePresentation, type Customisable } from '@odoro-cli/engine'
import { type CSSProperties, type ReactElement } from 'react'

/** Props specific to this component. */
export interface StripesOwnProps {
  /** Width of a band, in pixels. @defaultValue 10 */
  width?: number
  /** Gap between two bands, in pixels. @defaultValue 22 */
  gap?: number
  /** Tilt of the bands, in degrees. @defaultValue 45 */
  angle?: number
  /** Colour of the bands. */
  color?: string
  /** Colour of the background. */
  background?: string
}

/** All props. */
export type StripesProps = Customisable<StripesOwnProps>

/**
 * Background stripes.
 *
 * @example
 * <div className="o-relative o-min-h-screen">
 *   <Stripes className="o-absolute o-inset-0" angle={-30} />
 *   <main className="o-relative">…</main>
 * </div>
 */
export function Stripes({
  width = 10,
  gap = 22,
  angle = 45,
  color = 'color-mix(in oklab, var(--o-palette-brand-500, oklch(59.8% 0.198 275)) 14%, transparent)',
  background = 'var(--o-theme-bg, oklch(98.5% 0 0))',
  ...rest
}: StripesProps): ReactElement {
  const band = `${String(width)}px`
  const period = `${String(width + gap)}px`

  const { className, style } = mergePresentation({}, rest)

  return (
    <div
      {...rest}
      className={className}
      style={
        {
          ...style,
          backgroundColor: background,
          backgroundImage: `repeating-linear-gradient(${String(angle)}deg, ${color} 0 ${band}, transparent ${band} ${period})`,
        } as CSSProperties
      }
      aria-hidden
    />
  )
}

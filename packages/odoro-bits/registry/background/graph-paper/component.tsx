/**
 * Graph paper: two nested grids, as repeated gradients.
 *
 * ## Why two meshes rather than one
 *
 * A plain grid gives a texture; graph paper gives a scale. It is the thick
 * mesh, laid down every five fine meshes, that produces that reading: the eye
 * groups the small cells into packs and the surface becomes measurable
 * instead of merely regular.
 *
 * ## Why no script
 *
 * Four repeated linear gradients describe the pattern exactly, and the
 * browser compositor draws them on its own. A graphics surface or a canvas
 * will always cost more for an identical result — and the arbiter grants
 * only one surface per backend, whereas this one can be placed as many
 * times as one likes.
 *
 * @module
 */

import { mergePresentation, type Customisable } from '@odoro-cli/engine'
import { type CSSProperties, type ReactElement } from 'react'

/** Properties specific to this component. */
export interface GraphPaperOwnProps {
  /** Fine mesh pitch, in pixels. The thick mesh is worth five of them. @defaultValue 8 */
  size?: number
  /** Stroke opacity, between 0 and 1. @defaultValue 0.4 */
  strength?: number
  /** Stroke colour. */
  color?: string
  /** Background colour. */
  background?: string
}

/** Every property. */
export type GraphPaperProps = Customisable<GraphPaperOwnProps>

/**
 * Background graph paper.
 *
 * @example
 * <div className="o-relative o-min-h-screen">
 *   <GraphPaper className="o-absolute o-inset-0" size={10} />
 *   <main className="o-relative">…</main>
 * </div>
 */
export function GraphPaper({
  size = 8,
  strength = 0.4,
  color = 'var(--o-palette-sky-500, oklch(68.5% 0.169 237.323))',
  background = 'var(--o-theme-bg, oklch(98.5% 0 0))',
  ...rest
}: GraphPaperProps): ReactElement {
  // The fine mesh is deliberately paler than the thick one: it is that gap,
  // not the colour, that makes the packs of five readable.
  const fine = `color-mix(in oklab, ${color} ${String(Math.round(strength * 45))}%, transparent)`
  const bold = `color-mix(in oklab, ${color} ${String(Math.round(strength * 100))}%, transparent)`
  const step = `${String(size)}px`
  const major = `${String(size * 5)}px`

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
            `linear-gradient(to right, ${bold} 1px, transparent 1px)`,
            `linear-gradient(to bottom, ${bold} 1px, transparent 1px)`,
            `linear-gradient(to right, ${fine} 1px, transparent 1px)`,
            `linear-gradient(to bottom, ${fine} 1px, transparent 1px)`,
          ].join(','),
          backgroundSize: `${major} ${major}, ${major} ${major}, ${step} ${step}, ${step} ${step}`,
        } as CSSProperties
      }
      aria-hidden
    />
  )
}

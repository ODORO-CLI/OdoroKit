/**
 * Blueprint: a light grid over a deep background, with crosses at the main
 * intersections.
 *
 * ## How the crosses are drawn without a script
 *
 * A cross is not a pattern that gradients hand over directly: a linear
 * gradient fills its whole tile along the perpendicular axis, and two
 * layers stack instead of intersecting. The answer lies in two layers piled
 * in the right order: a conic gradient draws a four-branch star per large
 * tile, and a radial gradient the colour of the background, laid over it,
 * covers that star beyond a small radius. All that stays visible is the
 * core of the star — a cross — and the grid, placed higher in the stack, is
 * left untouched.
 *
 * ## Why the crosses land on one intersection in four
 *
 * Marking every node would turn the blueprint into fabric. One cross every
 * four cells gives the bearings without the clutter — that is the role of
 * the reference marks on a real drawing, not their decoration.
 *
 * @module
 */

import { mergePresentation, type Customisable } from '@odoro-cli/engine'
import { type CSSProperties, type ReactElement } from 'react'

/** Props belonging to the component itself. */
export interface BlueprintOwnProps {
  /** Pitch of the cell, in pixels. The crosses land every four cells. @defaultValue 24 */
  cell?: number
  /** Opacity of the lines, between 0 and 1. @defaultValue 0.4 */
  strength?: number
  /** Colour of the lines and of the crosses. */
  color?: string
  /** Colour of the background. */
  background?: string
}

/** All the props. */
export type BlueprintProps = Customisable<BlueprintOwnProps>

/**
 * Blueprint background.
 *
 * @example
 * <div className="o-relative o-min-h-screen">
 *   <Blueprint className="o-absolute o-inset-0" cell={32} />
 *   <main className="o-relative">…</main>
 * </div>
 */
export function Blueprint({
  cell = 24,
  strength = 0.4,
  color = 'var(--o-palette-sky-200, oklch(90.1% 0.058 230.902))',
  background = 'var(--o-theme-bg, oklch(98.5% 0 0))',
  ...rest
}: BlueprintProps): ReactElement {
  // The crosses are stated more firmly than the cell: they are reference
  // marks, not a texture, and at equal strength they would vanish into the
  // grid.
  const line = `color-mix(in oklab, ${color} ${String(Math.round(strength * 55))}%, transparent)`
  const cross = `color-mix(in oklab, ${color} ${String(Math.min(100, Math.round(strength * 150)))}%, transparent)`

  const step = `${String(cell)}px`
  const major = cell * 4
  const wide = `${String(major)}px`
  const offset = `${String(major / 2)}px`
  const radius = `${String(Math.round(cell / 3))}px`

  // The four-branch star: sectors of 12 degrees centred on the four cardinal
  // points of every large tile.
  const star = `conic-gradient(from -6deg, ${cross} 0 12deg, transparent 0 90deg, ${cross} 0 102deg, transparent 0 180deg, ${cross} 0 192deg, transparent 0 270deg, ${cross} 0 282deg, transparent 0)`

  // The mask: the background colour everywhere save in a small central disc.
  // It covers the star that lies below, not the cell grid that lies above.
  const cutter = `radial-gradient(circle, transparent ${radius}, ${background} ${radius})`

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
            `linear-gradient(to right, ${line} 1px, transparent 1px)`,
            `linear-gradient(to bottom, ${line} 1px, transparent 1px)`,
            cutter,
            star,
          ].join(','),
          backgroundSize: `${step} ${step}, ${step} ${step}, ${wide} ${wide}, ${wide} ${wide}`,
          backgroundPosition: `0 0, 0 0, ${offset} ${offset}, ${offset} ${offset}`,
        } as CSSProperties
      }
      aria-hidden
    />
  )
}

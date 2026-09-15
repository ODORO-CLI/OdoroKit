/**
 * Cells: an animated cellular tiling whose edges come from the second distance.
 *
 * ## The principle
 *
 * Each cell of a grid carries a seed. Nine tests are enough to find the nearest one, whatever the density.
 *
 * The difference between the first and the second distance vanishes on the edges: that is how the web is obtained without building a single one.
 *
 * ## What this component delegates
 *
 * It carries only what sets it apart: its shader, its settings and its fallback.
 * Reading the tokens, converting them to floats and re-reading them when the
 * theme changes all come from the engine — copying them here would leave as
 * many versions to maintain as there are backgrounds.
 *
 * The fallback is not a precaution: it is shown while the backend loads, when
 * WebGL is missing, when the arbiter refuses the surface — it grants only one
 * per backend — and under reduced motion.
 *
 * @module
 */

import {
  CELLS_FRAGMENT,
  mergePresentation,
  useOnReady,
  useTokenShader,
  type Customisable,
  type ReadyCallback,
  type ShaderColour,
} from '@odoro-cli/engine'
import { type ReactElement } from 'react'

/** What the escape hatch receives. */
export interface CellsControls {
  /** Colours actually handed to the shader. */
  readonly colours: readonly ShaderColour[]
  /** Reason for the refusal, if there is one. */
  readonly refused: string | undefined
}

/** Properties specific to this component. */
export interface CellsOwnProps {
  /** Drift speed of the seeds. @defaultValue 0.35 */
  speed?: number
  /** Number of cells per side. @defaultValue 7 */
  density?: number
  /** Edge width. @defaultValue 0.06 */
  edge?: number
  /** Tokens whose colours are read. */
  colors?: readonly string[]
  /** Fallback classes. */
  fallback?: string
  /** Escape hatch. */
  onReady?: ReadyCallback<CellsControls>
}

/** Every property. */
export type CellsProps = Customisable<CellsOwnProps>

/** Tokens used by default. */
const DEFAULT_TOKENS = [
  '--o-theme-bg',
  '--o-palette-emerald-700',
  '--o-palette-emerald-300',
] as const

/** Default fallback: a frozen hue, in the same tones. */
const DEFAULT_FALLBACK =
  'o-bg-gradient-to-b o-from-zinc-50 dark:o-from-zinc-950 o-to-emerald-950'

/**
 * Cells.
 *
 * @example
 * <div className="o-relative o-min-h-screen">
 *   <Cells className="o-absolute o-inset-0" />
 *   <main className="o-relative">…</main>
 * </div>
 */
export function Cells({
  speed = 0.35,
  density = 7,
  edge = 0.06,
  colors = DEFAULT_TOKENS,
  fallback = DEFAULT_FALLBACK,
  onReady,
  ...rest
}: CellsProps): ReactElement {
  const { ref, setHost, ready, refused, colours } = useTokenShader<HTMLDivElement>({
    fragment: CELLS_FRAGMENT,
    colors,
    uniforms: { uSpeed: speed, uScale: density, uEdge: edge },
    name: 'cells',
    // At low quality the setting that weighs is capped: the pattern stays
    // recognisable once reduced.
    degrade: (quality) => ({
      uScale: quality === 'low' ? Math.min(density, 5) : density,
    }),
  })

  useOnReady(onReady, ready ? { colours, refused } : null, ref.current)

  const { className, style } = mergePresentation(
    { className: 'o-relative o-overflow-hidden' },
    rest,
  )

  return (
    <div
      {...rest}
      ref={(element) => {
        setHost(element)
        ref.current = element
      }}
      className={className}
      style={style}
      aria-hidden
    >
      {ready && refused === undefined ? null : (
        <div className={`o-absolute o-inset-0 ${fallback}`} />
      )}
    </div>
  )
}

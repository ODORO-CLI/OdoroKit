/**
 * Sine grid: a grid whose every node oscillates, and a light moire.
 *
 * ## The principle
 *
 * The nodes are not moved: the domain is warped by a sine before the grid is
 * read in it, and each node traces a small loop with the lines joining it. A
 * second grid, a little finer and turned by a few degrees, is superimposed in
 * counter-phase: its moire fringes move far more slowly than the nodes.
 *
 * ## What this component delegates
 *
 * It carries only what sets it apart: its shader, its settings and its
 * fallback. Reading the tokens, converting them to floats and re-reading them
 * when the theme changes all come from the engine — copying that here would
 * leave as many versions to maintain as there are backgrounds.
 *
 * The fallback is not a precaution: it is shown while the backend loads, when
 * WebGL is missing, when the arbiter refuses the surface — it grants only one
 * per backend — and under reduced motion.
 *
 * @module
 */

import {
  mergePresentation,
  useOnReady,
  useTokenShader,
  type Customisable,
  type ReadyCallback,
  type ShaderColour,
} from '@odoro-cli/engine'
import { type ReactElement } from 'react'

import { SINE_GRID_FRAGMENT } from './sine-grid.shader.js'

/** What the escape hatch receives. */
export interface SineGridControls {
  /** Colours actually handed to the shader. */
  readonly colours: readonly ShaderColour[]
  /** Reason for the refusal, if there is one. */
  readonly refused: string | undefined
}

/** Props specific to this component. */
export interface SineGridOwnProps {
  /** Number of cells across the height. Clamped to forty by the shader. @defaultValue 12 */
  cells?: number
  /** Travel of the oscillation, in cells. @defaultValue 0.18 */
  amplitude?: number
  /** Speed of the oscillation. @defaultValue 0.8 */
  speed?: number
  /** Weight of the second grid, the moire one. Zero puts it out. @defaultValue 0.6 */
  moire?: number
  /** Tokens whose colours are read. */
  colors?: readonly string[]
  /** Fallback classes. */
  fallback?: string
  /** Escape hatch. */
  onReady?: ReadyCallback<SineGridControls>
}

/** All props. */
export type SineGridProps = Customisable<SineGridOwnProps>

/** Tokens used by default: the background, the lines, the nodes. */
const DEFAULT_TOKENS = [
  '--o-theme-bg',
  '--o-theme-line',
  '--o-palette-brand-500',
] as const

/** Default fallback: a frozen tint, in the same tones. */
const DEFAULT_FALLBACK = 'o-bg-zinc-50 dark:o-bg-zinc-950'

/**
 * Sine grid.
 *
 * @example
 * <div className="o-relative o-min-h-screen">
 *   <SineGrid className="o-absolute o-inset-0" />
 *   <main className="o-relative">…</main>
 * </div>
 */
export function SineGrid({
  cells = 12,
  amplitude = 0.18,
  speed = 0.8,
  moire = 0.6,
  colors = DEFAULT_TOKENS,
  fallback = DEFAULT_FALLBACK,
  onReady,
  ...rest
}: SineGridProps): ReactElement {
  const { ref, setHost, ready, refused, colours } = useTokenShader<HTMLDivElement>({
    fragment: SINE_GRID_FRAGMENT,
    colors,
    uniforms: { uCells: cells, uAmplitude: amplitude, uSpeed: speed, uMoire: moire },
    name: 'sine-grid',
    // The second grid doubles the reads and, at a reduced pixel density, its
    // fringes shimmer: at low quality it is put out.
    degrade: (quality) => ({ uMoire: quality === 'low' ? 0 : moire }),
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

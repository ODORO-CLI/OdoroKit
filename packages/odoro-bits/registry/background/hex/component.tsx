/**
 * Honeycomb: a hexagonal tiling in which every cell pulses at its own rhythm.
 *
 * ## The principle
 *
 * A hexagonal grid is the superposition of two rectangular grids offset by half a mesh: both are evaluated and the nearer one is kept.
 *
 * The distance used is hexagonal, not euclidean — it is what gives straight edges rather than discs.
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
  HEX_FRAGMENT,
  mergePresentation,
  useOnReady,
  useTokenShader,
  type Customisable,
  type ReadyCallback,
  type ShaderColour,
} from '@odoro-cli/engine'
import { type ReactElement } from 'react'

/** What the escape hatch receives. */
export interface HexControls {
  /** Colours actually handed to the shader. */
  readonly colours: readonly ShaderColour[]
  /** Reason for the refusal, if there is one. */
  readonly refused: string | undefined
}

/** Properties specific to this component. */
export interface HexOwnProps {
  /** Speed of the pulse. @defaultValue 0.6 */
  speed?: number
  /** Number of cells per side. @defaultValue 9 */
  density?: number
  /** Softening of the edge. @defaultValue 0.04 */
  edge?: number
  /** Tokens whose colours are read. */
  colors?: readonly string[]
  /** Fallback classes. */
  fallback?: string
  /** Escape hatch. */
  onReady?: ReadyCallback<HexControls>
}

/** Every property. */
export type HexProps = Customisable<HexOwnProps>

/** Tokens used by default. */
const DEFAULT_TOKENS = ['--o-theme-bg', '--o-palette-brand-900'] as const

/** Default fallback: a frozen hue, in the same tones. */
const DEFAULT_FALLBACK =
  'o-bg-gradient-to-b o-from-zinc-50 dark:o-from-zinc-950 o-to-brand-100 dark:o-to-brand-950'

/**
 * Honeycomb.
 *
 * @example
 * <div className="o-relative o-min-h-screen">
 *   <Hex className="o-absolute o-inset-0" />
 *   <main className="o-relative">…</main>
 * </div>
 */
export function Hex({
  speed = 0.6,
  density = 9,
  edge = 0.04,
  colors = DEFAULT_TOKENS,
  fallback = DEFAULT_FALLBACK,
  onReady,
  ...rest
}: HexProps): ReactElement {
  const { ref, setHost, ready, refused, colours } = useTokenShader<HTMLDivElement>({
    fragment: HEX_FRAGMENT,
    colors,
    uniforms: { uSpeed: speed, uScale: density, uEdge: edge },
    name: 'hex',
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

/**
 * Voronoi: cells whose exact edges are drawn in neon.
 *
 * ## What sets it apart from the cellular tiling
 *
 * The cellular tiling approximates its edges by the second distance; here the
 * edge is computed exactly, through the perpendicular bisectors, and that is
 * what makes it possible to hang a thin stroke and a glow of constant width
 * onto it. Each cell carries its own shade on top of that, and shows its seed.
 *
 * ## What this component delegates
 *
 * It carries only what sets it apart: its shader, its settings and its
 * fallback. Reading the tokens, converting them to floats and re-reading them
 * when the theme changes all come from the engine.
 *
 * The fallback is not a precaution: it is shown while the backend loads, when
 * WebGL is missing, when the arbiter refuses the surface and under reduced
 * motion.
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

import { VORONOI_FRAGMENT } from './voronoi.shader.js'

/** What the escape hatch receives. */
export interface VoronoiControls {
  /** Colours actually handed to the shader. */
  readonly colours: readonly ShaderColour[]
  /** Reason for the refusal, if there is one. */
  readonly refused: string | undefined
}

/** Props specific to this component. */
export interface VoronoiOwnProps {
  /** Drift speed of the seeds. @defaultValue 0.4 */
  speed?: number
  /** Number of cells over the height. @defaultValue 5 */
  density?: number
  /** Reach of the edge glow, in cells. @defaultValue 0.08 */
  glow?: number
  /** Tokens whose colours are read. */
  colors?: readonly string[]
  /** Fallback classes. */
  fallback?: string
  /** Escape hatch. */
  onReady?: ReadyCallback<VoronoiControls>
}

/** All props. */
export type VoronoiProps = Customisable<VoronoiOwnProps>

/** Tokens used by default: the background, the edges, the tint of the cells. */
const DEFAULT_TOKENS = [
  '--o-theme-bg',
  '--o-palette-cyan-400',
  '--o-palette-violet-500',
] as const

/** Default fallback: a frozen gradient, in the same tones. */
const DEFAULT_FALLBACK =
  'o-bg-gradient-to-br o-from-zinc-50 dark:o-from-zinc-950 o-to-violet-100 dark:o-to-violet-950'

/**
 * Radius of the second pass outside low quality.
 *
 * Two gives twenty-five cells, and an exact edge everywhere; one gives nine,
 * exact almost everywhere. It is the shader's only cost lever.
 */
const RANGE = 2

/** Radius of the second pass at low quality. */
const LOW_RANGE = 1

/**
 * Voronoi.
 *
 * @example
 * <div className="o-relative o-min-h-screen">
 *   <Voronoi className="o-absolute o-inset-0" />
 *   <main className="o-relative">…</main>
 * </div>
 */
export function Voronoi({
  speed = 0.4,
  density = 5,
  glow = 0.08,
  colors = DEFAULT_TOKENS,
  fallback = DEFAULT_FALLBACK,
  onReady,
  ...rest
}: VoronoiProps): ReactElement {
  const { ref, setHost, ready, refused, colours } = useTokenShader<HTMLDivElement>({
    fragment: VORONOI_FRAGMENT,
    colors,
    uniforms: { uSpeed: speed, uDensity: density, uGlow: glow, uRange: RANGE },
    name: 'voronoi',
    degrade: (quality) => ({ uRange: quality === 'low' ? LOW_RANGE : RANGE }),
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

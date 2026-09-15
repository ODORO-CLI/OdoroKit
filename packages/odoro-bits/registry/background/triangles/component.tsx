/**
 * Triangulation: a tiling of triangular facets whose lighting moves, like a
 * light sliding over a crystal.
 *
 * ## The principle
 *
 * Every cell of the grid is cut by a diagonal, alternating in a chequerboard
 * so that the tiling has no dominant direction. The lighting of a facet
 * combines a breathing of its own and a diagonal sweep that crosses the whole
 * tiling; the brightest ones take on a tint.
 *
 * What sets this entry apart from `mosaic` and from `cells`: the facets are
 * fixed triangles, and it is the light that moves, not the tiling.
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

import { TRIANGLES_FRAGMENT } from './triangles.shader.js'

/** What the escape hatch receives. */
export interface TrianglesControls {
  /** Colours actually handed to the shader. */
  readonly colours: readonly ShaderColour[]
  /** Reason for the refusal, if there is one. */
  readonly refused: string | undefined
}

/** Props specific to this component. */
export interface TrianglesOwnProps {
  /** Number of cells over the height. Capped at forty by the shader. @defaultValue 7 */
  size?: number
  /** Speed of the lighting. @defaultValue 0.5 */
  speed?: number
  /** Gap between dark and light facets. @defaultValue 0.8 */
  contrast?: number
  /** Weight of the tint on the brightest facets. @defaultValue 0.6 */
  tint?: number
  /** Tokens whose colours are read. */
  colors?: readonly string[]
  /** Fallback classes. */
  fallback?: string
  /** Escape hatch. */
  onReady?: ReadyCallback<TrianglesControls>
}

/** All props. */
export type TrianglesProps = Customisable<TrianglesOwnProps>

/** Tokens used by default: the background, the facets, the tint of the brightest. */
const DEFAULT_TOKENS = [
  '--o-theme-bg',
  '--o-theme-line',
  '--o-palette-violet-500',
] as const

/** Default fallback: a frozen tint, in the same tones. */
const DEFAULT_FALLBACK = 'o-bg-zinc-50 dark:o-bg-zinc-950'

/**
 * Triangulation.
 *
 * @example
 * <div className="o-relative o-min-h-screen">
 *   <Triangles className="o-absolute o-inset-0" />
 *   <main className="o-relative">…</main>
 * </div>
 */
export function Triangles({
  size = 7,
  speed = 0.5,
  contrast = 0.8,
  tint = 0.6,
  colors = DEFAULT_TOKENS,
  fallback = DEFAULT_FALLBACK,
  onReady,
  ...rest
}: TrianglesProps): ReactElement {
  const { ref, setHost, ready, refused, colours } = useTokenShader<HTMLDivElement>({
    fragment: TRIANGLES_FRAGMENT,
    colors,
    uniforms: { uSize: size, uSpeed: speed, uContrast: contrast, uTint: tint },
    name: 'triangles',
    // Thin joints between small facets shimmer at a reduced pixel density: at
    // low quality, the cells widen.
    degrade: (quality) => ({
      uSize: quality === 'low' ? Math.min(size, 6) : size,
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

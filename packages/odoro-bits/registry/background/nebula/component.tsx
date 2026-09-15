/**
 * Nebula: deep clouds, in two coupled layers of noise.
 *
 * ## The principle
 *
 * Two layers of fractal noise at different speeds, the second read at a point already displaced by the first: the coupling makes the swirls.
 *
 * A vignette darkens the edges — it is what gives the depth, not the noise.
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

import { NEBULA_FRAGMENT } from './nebula.shader.js'

/** What the escape hatch receives. */
export interface NebulaControls {
  /** Colours actually handed to the shader. */
  readonly colours: readonly ShaderColour[]
  /** Reason for the refusal, if there is one. */
  readonly refused: string | undefined
}

/** Props specific to this component. */
export interface NebulaOwnProps {
  /** Speed at which the layers drift. @defaultValue 0.1 */
  speed?: number
  /** Scale of the noise. Higher is finer. @defaultValue 2.2 */
  scale?: number
  /** Number of octaves of the two layers. @defaultValue 4 */
  depth?: number
  /** Tokens whose colours are read. */
  colors?: readonly string[]
  /** Fallback classes. */
  fallback?: string
  /** Escape hatch. */
  onReady?: ReadyCallback<NebulaControls>
}

/** All props. */
export type NebulaProps = Customisable<NebulaOwnProps>

/** Tokens used by default: the background, the clouds, the bright cores. */
const DEFAULT_TOKENS = [
  '--o-theme-bg',
  '--o-palette-violet-500',
  '--o-palette-rose-300',
] as const

/** Default fallback: a frozen gradient, in the same tones. */
const DEFAULT_FALLBACK =
  'o-bg-gradient-to-b o-from-zinc-50 dark:o-from-zinc-950 o-to-violet-950'

/**
 * Nebula.
 *
 * @example
 * <div className="o-relative o-min-h-screen">
 *   <Nebula className="o-absolute o-inset-0" />
 *   <main className="o-relative">…</main>
 * </div>
 */
export function Nebula({
  speed = 0.1,
  scale = 2.2,
  depth = 4,
  colors = DEFAULT_TOKENS,
  fallback = DEFAULT_FALLBACK,
  onReady,
  ...rest
}: NebulaProps): ReactElement {
  const { ref, setHost, ready, refused, colours } = useTokenShader<HTMLDivElement>({
    fragment: NEBULA_FRAGMENT,
    colors,
    uniforms: { uSpeed: speed, uScale: scale, uDepth: depth },
    name: 'nebula',
    // Every octave is one more noise evaluation per pixel, and there are two
    // layers: it is the setting that weighs, hence the one that is bounded.
    degrade: (quality) => ({
      uDepth: quality === 'low' ? Math.min(depth, 2) : depth,
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

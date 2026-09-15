/**
 * Cloud layers: stacked masses of fractal noise, drifting in
 * parallax.
 *
 * ## The principle
 *
 * Three layers thresholded by the coverage, each at its own speed and its
 * own scale; a second lookup into the noise, shifted towards the light,
 * lights the tops and leaves the undersides in shadow. Distinct from smoke
 * and from the nebula: opaque masses, lit, in depth.
 *
 * ## What this component delegates
 *
 * It carries only what sets it apart: its shader, its settings and its fallback.
 * Reading the tokens, converting them to floats and re-reading them when the
 * theme changes all come from the engine.
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

import { CLOUD_LAYER_FRAGMENT } from './cloud-layer.shader.js'

/** What the escape hatch receives. */
export interface CloudLayerControls {
  /** Colours actually handed to the shader. */
  readonly colours: readonly ShaderColour[]
  /** Reason for the refusal, if there is one. */
  readonly refused: string | undefined
}

/** Properties specific to this component. */
export interface CloudLayerOwnProps {
  /** Drift speed of the near layer. @defaultValue 0.08 */
  speed?: number
  /** Scale of the masses. Higher is finer. @defaultValue 2 */
  scale?: number
  /** Sky coverage, from zero to one. @defaultValue 0.55 */
  coverage?: number
  /** Tokens whose colours are read. */
  colors?: readonly string[]
  /** Fallback classes. */
  fallback?: string
  /** Escape hatch. */
  onReady?: ReadyCallback<CloudLayerControls>
}

/** Every property. */
export type CloudLayerProps = Customisable<CloudLayerOwnProps>

/** Tokens used by default: the background, the clouds' shadow, their tops. */
const DEFAULT_TOKENS = [
  '--o-theme-bg',
  '--o-palette-slate-400',
  '--o-palette-sky-100',
] as const

/** Default fallback: a frozen gradient, in the same tones. */
const DEFAULT_FALLBACK =
  'o-bg-gradient-to-t o-from-slate-100 dark:o-from-slate-900 o-to-zinc-50 dark:o-to-zinc-950'

/**
 * Noise detail outside low quality.
 *
 * Each layer reads the noise twice — the mass and its light — and there are
 * three layers: every octave is paid for six times over. It is the shader's
 * only lever on cost.
 */
const OCTAVES = 5

/** Noise detail at low quality. */
const LOW_OCTAVES = 3

/**
 * Cloud layers.
 *
 * @example
 * <div className="o-relative o-min-h-screen">
 *   <CloudLayer className="o-absolute o-inset-0" />
 *   <main className="o-relative">…</main>
 * </div>
 */
export function CloudLayer({
  speed = 0.08,
  scale = 2,
  coverage = 0.55,
  colors = DEFAULT_TOKENS,
  fallback = DEFAULT_FALLBACK,
  onReady,
  ...rest
}: CloudLayerProps): ReactElement {
  const { ref, setHost, ready, refused, colours } = useTokenShader<HTMLDivElement>({
    fragment: CLOUD_LAYER_FRAGMENT,
    colors,
    uniforms: { uSpeed: speed, uScale: scale, uCoverage: coverage, uOctaves: OCTAVES },
    name: 'cloud-layer',
    degrade: (quality) => ({
      uOctaves: quality === 'low' ? LOW_OCTAVES : OCTAVES,
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

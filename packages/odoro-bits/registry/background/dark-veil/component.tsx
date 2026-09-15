/**
 * Dark veil: a cloth of noise rippling above a glow.
 *
 * ## The principle
 *
 * Two slow sources make a glow at the bottom of the frame; a fractal noise
 * warped by itself draws a veil whose folds drift, and the glow comes
 * through only by its gaps. The veil is laid down by a capped mix towards
 * its deep hue, not by darkening: it stays legible on a light background.
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

import { DARK_VEIL_FRAGMENT } from './dark-veil.shader.js'

/** What the escape hatch receives. */
export interface DarkVeilControls {
  /** Colours actually handed to the shader. */
  readonly colours: readonly ShaderColour[]
  /** Reason for the refusal, if there is one. */
  readonly refused: string | undefined
}

/** Properties specific to this component. */
export interface DarkVeilOwnProps {
  /** Drift speed of the veil. @defaultValue 0.5 */
  speed?: number
  /** Scale of the folds. Higher is finer. @defaultValue 1.8 */
  scale?: number
  /** Thickness of the veil. At zero, only the glow remains. @defaultValue 0.8 */
  opacity?: number
  /** Tokens whose colours are read. */
  colors?: readonly string[]
  /** Fallback classes. */
  fallback?: string
  /** Escape hatch. */
  onReady?: ReadyCallback<DarkVeilControls>
}

/** Every property. */
export type DarkVeilProps = Customisable<DarkVeilOwnProps>

/** Tokens used by default: the background, the glow, the veil's hue. */
const DEFAULT_TOKENS = [
  '--o-theme-bg',
  '--o-palette-violet-500',
  '--o-palette-indigo-950',
] as const

/** Default fallback: a frozen gradient, in the same tones. */
const DEFAULT_FALLBACK =
  'o-bg-gradient-to-t o-from-violet-100 dark:o-from-violet-950 o-to-zinc-50 dark:o-to-zinc-950'

/**
 * Noise detail outside low quality.
 *
 * The veil demands three sums of octaves — two for the warp, one for the
 * substance — so every octave is paid for three times over. It is the
 * shader's only lever on cost.
 */
const OCTAVES = 4

/** Noise detail at low quality. */
const LOW_OCTAVES = 2

/**
 * Dark veil.
 *
 * @example
 * <div className="o-relative o-min-h-screen">
 *   <DarkVeil className="o-absolute o-inset-0" />
 *   <main className="o-relative">…</main>
 * </div>
 */
export function DarkVeil({
  speed = 0.5,
  scale = 1.8,
  opacity = 0.8,
  colors = DEFAULT_TOKENS,
  fallback = DEFAULT_FALLBACK,
  onReady,
  ...rest
}: DarkVeilProps): ReactElement {
  const { ref, setHost, ready, refused, colours } = useTokenShader<HTMLDivElement>({
    fragment: DARK_VEIL_FRAGMENT,
    colors,
    uniforms: { uSpeed: speed, uScale: scale, uOpacity: opacity, uOctaves: OCTAVES },
    name: 'dark-veil',
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

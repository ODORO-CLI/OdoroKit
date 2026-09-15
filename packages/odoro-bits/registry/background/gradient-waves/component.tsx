/**
 * Gradient waves: bands of a repeated gradient, with neither stroke nor step, displaced by a swell that never closes back on itself.
 *
 * ## The principle
 *
 * A gradient repeated in horizontal bands — background, first hue, second
 * hue, background — whose height is displaced by a sum of sines at
 * non-multiple frequencies and opposite speeds. Neither stroke nor step:
 * sheets sliding over one another, and a softness that goes from clean
 * bands to a single rippling gradient.
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
  mergePresentation,
  useOnReady,
  useTokenShader,
  type Customisable,
  type ReadyCallback,
  type ShaderColour,
} from '@odoro-cli/engine'
import { type ReactElement } from 'react'

import { GRADIENT_WAVES_FRAGMENT } from './gradient-waves.shader.js'

/** What the escape hatch receives. */
export interface GradientWavesControls {
  /** Colours actually handed to the shader. */
  readonly colours: readonly ShaderColour[]
  /** Reason for the refusal, if there is one. */
  readonly refused: string | undefined
}

/** Properties specific to this component. */
export interface GradientWavesOwnProps {
  /** Number of bands across the height. @defaultValue 4 */
  bands?: number
  /** Height of the swell, as a fraction of the frame. @defaultValue 0.12 */
  amplitude?: number
  /** Speed of the swell. @defaultValue 0.4 */
  speed?: number
  /** Width of the transitions. Low, the bands are clean. @defaultValue 0.6 */
  softness?: number
  /** Tokens whose colours are read. */
  colors?: readonly string[]
  /** Fallback classes. */
  fallback?: string
  /** Escape hatch. */
  onReady?: ReadyCallback<GradientWavesControls>
}

/** Every property. */
export type GradientWavesProps = Customisable<GradientWavesOwnProps>

/** Tokens used by default: the background, the two hues of the bands. */
const DEFAULT_TOKENS = [
  '--o-theme-bg',
  '--o-palette-indigo-400',
  '--o-palette-cyan-300',
] as const

/** Default fallback: a frozen gradient, in the same tones. */
const DEFAULT_FALLBACK =
  'o-bg-gradient-to-b o-from-zinc-50 dark:o-from-zinc-950 o-via-indigo-200 dark:o-via-indigo-900 o-to-cyan-200 dark:o-to-cyan-900'

/**
 * Detail outside low quality.
 *
 * The number of bands is a frequency, not a loop. It is the harmonics of
 * the swell that are capped.
 */
const DETAIL = 3

/** Detail at low quality. */
const LOW_DETAIL = 1

/**
 * Gradient waves.
 *
 * @example
 * <div className="o-relative o-min-h-screen">
 *   <GradientWaves className="o-absolute o-inset-0" />
 *   <main className="o-relative">…</main>
 * </div>
 */
export function GradientWaves({
  bands = 4,
  amplitude = 0.12,
  speed = 0.4,
  softness = 0.6,
  colors = DEFAULT_TOKENS,
  fallback = DEFAULT_FALLBACK,
  onReady,
  ...rest
}: GradientWavesProps): ReactElement {
  const { ref, setHost, ready, refused, colours } = useTokenShader<HTMLDivElement>({
    fragment: GRADIENT_WAVES_FRAGMENT,
    colors,
    uniforms: {
      uBands: bands,
      uAmplitude: amplitude,
      uSpeed: speed,
      uSoftness: softness,
      uDetail: DETAIL,
    },
    name: 'gradient-waves',
    degrade: (quality) => ({
      uDetail: quality === 'low' ? LOW_DETAIL : DETAIL,
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

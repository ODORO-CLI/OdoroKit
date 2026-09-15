/**
 * Sliced waves: a thick band read by columns, rippling in a staircase.
 *
 * ## The principle
 *
 * The frame is cut into vertical slices; in each of them, the height of the
 * band is evaluated at the centre of the column, never at the fragment. The
 * wave therefore jumps from one step to the next, and each column additionally
 * beats to a rhythm of its own.
 *
 * What sets this entry apart from its cousins: the band is thick, the motion is
 * vertical — the columns rise and fall — and the rhythm is brisk, with a twitch
 * of its own in every slice.
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

import { SLICED_WAVES_FRAGMENT } from './sliced-waves.shader.js'

/** What the escape hatch receives. */
export interface SlicedWavesControls {
  /** Colours actually handed to the shader. */
  readonly colours: readonly ShaderColour[]
  /** Reason for the refusal, if there is one. */
  readonly refused: string | undefined
}

/** Props specific to this component. */
export interface SlicedWavesOwnProps {
  /** Number of slices. Clamped to a hundred and twenty by the shader. @defaultValue 40 */
  slices?: number
  /** Height of the wave, as a fraction of the frame. @defaultValue 0.22 */
  amplitude?: number
  /** Speed of the wave. @defaultValue 0.9 */
  speed?: number
  /** Thickness of the band, as a fraction of the frame. @defaultValue 0.28 */
  height?: number
  /** Tokens whose colours are read. */
  colors?: readonly string[]
  /** Fallback classes. */
  fallback?: string
  /** Escape hatch. */
  onReady?: ReadyCallback<SlicedWavesControls>
}

/** All props. */
export type SlicedWavesProps = Customisable<SlicedWavesOwnProps>

/** Tokens used by default: the background, the body of the band, its edge. */
const DEFAULT_TOKENS = [
  '--o-theme-bg',
  '--o-palette-violet-500',
  '--o-palette-violet-200',
] as const

/** Default fallback: a frozen gradient, in the same tones. */
const DEFAULT_FALLBACK =
  'o-bg-gradient-to-b o-from-zinc-50 dark:o-from-zinc-950 o-to-violet-950'

/**
 * Number of slices at low quality.
 *
 * The shader evaluates one slice per fragment, so the number costs nothing in
 * computation. But a one-pixel groove between narrow slices, at a reduced pixel
 * density, starts to shimmer: fewer slices, wider, and the staircase stays
 * crisp.
 */
const LOW_SLICES = 20

/**
 * Sliced waves.
 *
 * @example
 * <div className="o-relative o-min-h-screen">
 *   <SlicedWaves className="o-absolute o-inset-0" />
 *   <main className="o-relative">…</main>
 * </div>
 */
export function SlicedWaves({
  slices = 40,
  amplitude = 0.22,
  speed = 0.9,
  height = 0.28,
  colors = DEFAULT_TOKENS,
  fallback = DEFAULT_FALLBACK,
  onReady,
  ...rest
}: SlicedWavesProps): ReactElement {
  const { ref, setHost, ready, refused, colours } = useTokenShader<HTMLDivElement>({
    fragment: SLICED_WAVES_FRAGMENT,
    colors,
    uniforms: {
      uSlices: slices,
      uAmplitude: amplitude,
      uSpeed: speed,
      uHeight: height,
    },
    name: 'sliced-waves',
    degrade: (quality) => ({
      uSlices: quality === 'low' ? Math.min(slices, LOW_SLICES) : slices,
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

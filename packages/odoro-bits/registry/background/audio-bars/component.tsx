/**
 * Audio bars: vertical bars pulsing like a spectrum analyser.
 *
 * ## The principle
 *
 * No sound is listened to: every bar reads a value noise, smooth in time
 * and independent from its neighbours, under an envelope that favours the
 * low end and a shared beat that stands in for a bar of music. A peak
 * indicator, read more slowly, falls back after the bar.
 *
 * ## What this component delegates
 *
 * It carries only what sets it apart: its shader, its settings and its
 * fallback. Reading the tokens, turning them into floats and reading them
 * again when the theme changes all come from the engine — copying them out
 * here would make as many versions to maintain as there are backgrounds.
 *
 * The fallback is not a precaution: it is shown while the backend loads,
 * when WebGL is missing, when the arbiter refuses the surface — it grants
 * only one per backend — and under reduced motion.
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

import { AUDIO_BARS_FRAGMENT } from './audio-bars.shader.js'

/** What the escape hatch receives. */
export interface AudioBarsControls {
  /** Colours actually handed to the shader. */
  readonly colours: readonly ShaderColour[]
  /** Reason for the refusal, if there is one. */
  readonly refused: string | undefined
}

/** Props belonging to the component itself. */
export interface AudioBarsOwnProps {
  /** Number of bars. Capped at ninety-six by the shader. @defaultValue 48 */
  bars?: number
  /** Speed of the spectrum. @defaultValue 1 */
  speed?: number
  /** Space between bars, as a fraction of their pitch. @defaultValue 0.35 */
  gap?: number
  /** Segments per bar. Zero gives solid bars. @defaultValue 24 */
  segments?: number
  /** Spectrum mirrored around the middle. @defaultValue false */
  mirror?: boolean
  /** Tokens whose colours are read. */
  colors?: readonly string[]
  /** Classes of the fallback. */
  fallback?: string
  /** Escape hatch. */
  onReady?: ReadyCallback<AudioBarsControls>
}

/** All the props. */
export type AudioBarsProps = Customisable<AudioBarsOwnProps>

/** Tokens used by default: the background, the foot of the bars, their top. */
const DEFAULT_TOKENS = [
  '--o-theme-bg',
  '--o-palette-brand-500',
  '--o-palette-amber-300',
] as const

/** Default fallback: a frozen gradient, in the same tones. */
const DEFAULT_FALLBACK =
  'o-bg-gradient-to-t o-from-brand-950 o-to-zinc-50 dark:o-to-zinc-950'

/**
 * Number of bars at low quality.
 *
 * The cost per fragment does not move with the number of bars. What does
 * move is the width of the segments and of the gaps: below two pixels,
 * they shimmer. Fewer bars, wider ones, and the pattern holds.
 */
const LOW_BARS = 24

/**
 * Audio bars.
 *
 * @example
 * <div className="o-relative o-min-h-screen">
 *   <AudioBars className="o-absolute o-inset-0" />
 *   <main className="o-relative">…</main>
 * </div>
 */
export function AudioBars({
  bars = 48,
  speed = 1,
  gap = 0.35,
  segments = 24,
  mirror = false,
  colors = DEFAULT_TOKENS,
  fallback = DEFAULT_FALLBACK,
  onReady,
  ...rest
}: AudioBarsProps): ReactElement {
  const { ref, setHost, ready, refused, colours } = useTokenShader<HTMLDivElement>({
    fragment: AUDIO_BARS_FRAGMENT,
    colors,
    uniforms: {
      uBars: bars,
      uSpeed: speed,
      uGap: gap,
      uSegments: segments,
      uMirror: mirror ? 1 : 0,
    },
    name: 'audio-bars',
    degrade: (quality) => ({
      uBars: quality === 'low' ? Math.min(bars, LOW_BARS) : bars,
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

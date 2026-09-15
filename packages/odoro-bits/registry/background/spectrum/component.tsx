/**
 * Spectrum: an angular sweep of hues, which modulates the palette without replacing it.
 *
 * ## The principle
 *
 * Three cosines offset by a third of a turn: they never all meet at the same place, so the turn never passes through grey.
 *
 * The computed hue tints the colours it receives rather than standing in for them: the background stays in the theme's tones.
 *
 * ## What this component delegates
 *
 * It carries only what sets it apart: its shader, its settings and its fallback.
 * Reading the tokens, converting them to floats and re-reading them when the
 * theme changes all come from the engine — copying that here would leave as many
 * versions to maintain as there are backgrounds.
 *
 * The fallback is not a precaution: it is shown while the backend loads, when
 * WebGL is missing, when the arbiter refuses the surface — it grants only one per
 * backend — and under reduced motion.
 *
 * @module
 */

import {
  SPECTRUM_FRAGMENT,
  mergePresentation,
  useOnReady,
  useTokenShader,
  type Customisable,
  type ReadyCallback,
  type ShaderColour,
} from '@odoro-cli/engine'
import { type ReactElement } from 'react'

/** What the escape hatch receives. */
export interface SpectrumControls {
  /** Colours actually handed to the shader. */
  readonly colours: readonly ShaderColour[]
  /** Reason for the refusal, if there is one. */
  readonly refused: string | undefined
}

/** Props specific to this component. */
export interface SpectrumOwnProps {
  /** Speed of the sweep. @defaultValue 0.08 */
  speed?: number
  /** Number of turns of the wheel. @defaultValue 1 */
  turns?: number
  /** Share of hue mixed into the palette. @defaultValue 0.5 */
  saturation?: number
  /** Tokens whose colours are read. */
  colors?: readonly string[]
  /** Fallback classes. */
  fallback?: string
  /** Escape hatch. */
  onReady?: ReadyCallback<SpectrumControls>
}

/** All props. */
export type SpectrumProps = Customisable<SpectrumOwnProps>

/** Tokens used by default. */
const DEFAULT_TOKENS = ['--o-theme-bg', '--o-palette-brand-400'] as const

/** Default fallback: a frozen tint, in the same tones. */
const DEFAULT_FALLBACK =
  'o-bg-gradient-to-br o-from-zinc-50 dark:o-from-zinc-950 o-to-brand-100 dark:o-to-brand-950'

/**
 * Spectrum.
 *
 * @example
 * <div className="o-relative o-min-h-screen">
 *   <Spectrum className="o-absolute o-inset-0" />
 *   <main className="o-relative">…</main>
 * </div>
 */
export function Spectrum({
  speed = 0.08,
  turns = 1,
  saturation = 0.5,
  colors = DEFAULT_TOKENS,
  fallback = DEFAULT_FALLBACK,
  onReady,
  ...rest
}: SpectrumProps): ReactElement {
  const { ref, setHost, ready, refused, colours } = useTokenShader<HTMLDivElement>({
    fragment: SPECTRUM_FRAGMENT,
    colors,
    uniforms: { uSpeed: speed, uScale: turns, uSaturation: saturation },
    name: 'spectrum',
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

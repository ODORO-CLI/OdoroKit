/**
 * Waves: bands that ripple and fold back on themselves.
 *
 * ## What this component brings, and what it delegates
 *
 * It carries only what sets it apart: its shader, its settings and its
 * fallback. Reading the tokens, converting them to floats and re-reading them
 * when the theme changes all come from the engine — copying that here would
 * leave as many versions to maintain as there are backgrounds.
 *
 * ## The fallback is not a precaution
 *
 * It is half the component. It is shown while the backend loads, when WebGL
 * is missing, when the arbiter refuses the surface — it grants only one per
 * backend — and under reduced motion, where an animated background brings
 * nothing but its motion.
 *
 * @module
 */

import {
  WAVES_FRAGMENT,
  mergePresentation,
  useOnReady,
  useTokenShader,
  type Customisable,
  type ReadyCallback,
  type ShaderColour,
} from '@odoro-cli/engine'
import { type ReactElement } from 'react'

/** What the escape hatch receives. */
export interface WavesControls {
  /** Colours actually handed to the shader. */
  readonly colours: readonly ShaderColour[]
  /** Reason for the refusal, if there is one. */
  readonly refused: string | undefined
}

/** Props specific to this component. */
export interface WavesOwnProps {
  /** Speed of the ripple. @defaultValue 0.25 */
  speed?: number
  /** Number of bands. Capped at eight by the shader. @defaultValue 5 */
  bands?: number
  /** Height of the ripple. @defaultValue 0.12 */
  amplitude?: number
  /** Tokens whose colours are read. */
  colors?: readonly string[]
  /** Fallback classes. */
  fallback?: string
  /** Escape hatch. */
  onReady?: ReadyCallback<WavesControls>
}

/** All props. */
export type WavesProps = Customisable<WavesOwnProps>

/** Tokens used by default. */
const DEFAULT_TOKENS = [
  '--o-theme-bg',
  '--o-palette-brand-500',
  '--o-palette-fuchsia-500',
] as const

/** Default fallback: a frozen gradient, in the same tones. */
const DEFAULT_FALLBACK =
  'o-bg-gradient-to-b o-from-zinc-50 dark:o-from-zinc-950 o-to-brand-900'

/**
 * Waves: bands that ripple and fold back on themselves.
 *
 * @example
 * <div className="o-relative o-min-h-screen">
 *   <Waves className="o-absolute o-inset-0" />
 *   <main className="o-relative">…</main>
 * </div>
 */
export function Waves({
  speed = 0.25,
  bands = 5,
  amplitude = 0.12,
  colors = DEFAULT_TOKENS,
  fallback = DEFAULT_FALLBACK,
  onReady,
  ...rest
}: WavesProps): ReactElement {
  const { ref, setHost, ready, refused, colours } = useTokenShader<HTMLDivElement>({
    fragment: WAVES_FRAGMENT,
    colors,
    uniforms: { uSpeed: speed, uScale: bands, uAmplitude: amplitude },
    name: 'waves',
    // At low quality the density is capped: it is the only setting that
    // really weighs, and the pattern stays recognisable once reduced.
    degrade: (quality) => ({ uScale: quality === 'low' ? Math.min(bands, 3) : bands }),
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

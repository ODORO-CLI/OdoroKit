/**
 * Soap film: a thin iridescent film draining downwards.
 *
 * ## The principle
 *
 * The thickness of the film is a fractal noise; the hue depends on it as in a
 * real interference — one full turn per band — but it is two tokens turning
 * towards each other, not a spectrum written in hard. The domain slides, the
 * fringes descend; where the film thins out, the background shows through.
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

import { SOAP_FILM_FRAGMENT } from './soap-film.shader.js'

/** What the escape hatch receives. */
export interface SoapFilmControls {
  /** Colours actually handed to the shader. */
  readonly colours: readonly ShaderColour[]
  /** Reason for the refusal, if there is one. */
  readonly refused: string | undefined
}

/** Props specific to this component. */
export interface SoapFilmOwnProps {
  /** Speed at which the thicknesses drift. @defaultValue 0.15 */
  speed?: number
  /** Drainage downwards. @defaultValue 0.4 */
  drain?: number
  /** Scale of the thickness field. @defaultValue 1.5 */
  scale?: number
  /** Turns of hue over the whole thickness. @defaultValue 4 */
  bands?: number
  /** Tokens whose colours are read. */
  colors?: readonly string[]
  /** Fallback classes. */
  fallback?: string
  /** Escape hatch. */
  onReady?: ReadyCallback<SoapFilmControls>
}

/** All props. */
export type SoapFilmProps = Customisable<SoapFilmOwnProps>

/** Tokens used by default: the background, the two hues of the film. */
const DEFAULT_TOKENS = [
  '--o-theme-bg',
  '--o-palette-cyan-400',
  '--o-palette-fuchsia-400',
] as const

/** Default fallback: a frozen gradient, in the same tones. */
const DEFAULT_FALLBACK =
  'o-bg-gradient-to-b o-from-zinc-50 dark:o-from-zinc-950 o-via-cyan-300 dark:o-via-cyan-900 o-to-fuchsia-300 dark:o-to-fuchsia-900'

/**
 * Noise detail outside low quality.
 *
 * The thickness is the only summed noise of the shader: it is the only cost
 * lever, and it does not need to be a prop to be degraded.
 */
const OCTAVES = 4

/** Noise detail at low quality. */
const LOW_OCTAVES = 2

/**
 * Soap film.
 *
 * @example
 * <div className="o-relative o-min-h-screen">
 *   <SoapFilm className="o-absolute o-inset-0" />
 *   <main className="o-relative">…</main>
 * </div>
 */
export function SoapFilm({
  speed = 0.15,
  drain = 0.4,
  scale = 1.5,
  bands = 4,
  colors = DEFAULT_TOKENS,
  fallback = DEFAULT_FALLBACK,
  onReady,
  ...rest
}: SoapFilmProps): ReactElement {
  const { ref, setHost, ready, refused, colours } = useTokenShader<HTMLDivElement>({
    fragment: SOAP_FILM_FRAGMENT,
    colors,
    uniforms: {
      uSpeed: speed,
      uDrain: drain,
      uScale: scale,
      uBands: bands,
      uOctaves: OCTAVES,
    },
    name: 'soap-film',
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

/**
 * Prism: a white beam enters from the left, crosses a prism and comes back out as a fan, dispersed between two hues of the project.
 *
 * ## The principle
 *
 * Three pieces, in the order in which the light crosses them: a beam,
 * distance to a segment; a prism, signed distance to a triangle of which
 * only the edge shines; a dispersion, a fan of angles at the exit where the
 * hue turns from one token to the other — a spectrum between two colours of
 * the project, not a hard-coded rainbow.
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
  mergePresentation,
  useOnReady,
  useTokenShader,
  type Customisable,
  type ReadyCallback,
  type ShaderColour,
} from '@odoro-cli/engine'
import { type ReactElement } from 'react'

import { PRISM_FRAGMENT } from './prism.shader.js'

/** What the escape hatch receives. */
export interface PrismControls {
  /** Colours actually handed to the shader. */
  readonly colours: readonly ShaderColour[]
  /** Reason for the refusal, if there is one. */
  readonly refused: string | undefined
}

/** Props specific to this component. */
export interface PrismOwnProps {
  /** Horizontal position of the prism, as a fraction of the frame. @defaultValue 0.42 */
  x?: number
  /** Vertical position of the prism, as a fraction of the frame. @defaultValue 0.5 */
  y?: number
  /** Aperture of the fan, in radians. @defaultValue 0.6 */
  spread?: number
  /** Number of lines in the spectrum. @defaultValue 6 */
  bands?: number
  /** Speed of the breathing and of the shimmer. @defaultValue 0.5 */
  speed?: number
  /** Tokens whose colours are read. */
  colors?: readonly string[]
  /** Fallback classes. */
  fallback?: string
  /** Escape hatch. */
  onReady?: ReadyCallback<PrismControls>
}

/** All props. */
export type PrismProps = Customisable<PrismOwnProps>

/** Tokens used by default: the background, the start and the end of the spectrum. */
const DEFAULT_TOKENS = [
  '--o-theme-bg',
  '--o-palette-violet-500',
  '--o-palette-amber-400',
] as const

/** Default fallback: a frozen gradient, in the same tones. */
const DEFAULT_FALLBACK =
  'o-bg-gradient-to-br o-from-zinc-50 dark:o-from-zinc-950 o-via-violet-200 dark:o-via-violet-900 o-to-amber-200 dark:o-to-amber-900'

/**
 * Detail outside low quality.
 *
 * The fan is the essential part; the beam and the prism are two further
 * distances, and they are the ones that go at low quality.
 */
const DETAIL = 3

/** Detail at low quality. */
const LOW_DETAIL = 1

/**
 * Prism.
 *
 * @example
 * <div className="o-relative o-min-h-screen">
 *   <Prism className="o-absolute o-inset-0" />
 *   <main className="o-relative">…</main>
 * </div>
 */
export function Prism({
  x = 0.42,
  y = 0.5,
  spread = 0.6,
  bands = 6,
  speed = 0.5,
  colors = DEFAULT_TOKENS,
  fallback = DEFAULT_FALLBACK,
  onReady,
  ...rest
}: PrismProps): ReactElement {
  const { ref, setHost, ready, refused, colours } = useTokenShader<HTMLDivElement>({
    fragment: PRISM_FRAGMENT,
    colors,
    uniforms: {
      uX: x,
      uY: y,
      uSpread: spread,
      uBands: bands,
      uSpeed: speed,
      uDetail: DETAIL,
    },
    name: 'prism',
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

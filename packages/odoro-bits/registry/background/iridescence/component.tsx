/**
 * Iridescence: a mother-of-pearl that ripples gently: the hue turns with the
 * tilt of the surface, two highlights land by addition.
 *
 * ## The principle
 *
 * A surface of directional sines with a long wavelength, whose gradient
 * is computed by hand and gives a normal. The tilt and the height make a
 * phase, and the phase turns the hue between two tokens without hollowing
 * out a fringe: everything is soft, and that is what makes mother-of-pearl
 * rather than a soap film.
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

import { IRIDESCENCE_FRAGMENT } from './iridescence.shader.js'

/** What the escape hatch receives. */
export interface IridescenceControls {
  /** Colours actually handed to the shader. */
  readonly colours: readonly ShaderColour[]
  /** Reason for the refusal, if there is one. */
  readonly refused: string | undefined
}

/** Properties specific to this component. */
export interface IridescenceOwnProps {
  /** Speed of the ripple. @defaultValue 0.3 */
  speed?: number
  /** Scale of the waves. Higher is tighter. @defaultValue 1.4 */
  scale?: number
  /** Strength of the highlights. @defaultValue 0.7 */
  shimmer?: number
  /** Hue turns over the height of the surface. @defaultValue 2.5 */
  bands?: number
  /** Tokens whose colours are read. */
  colors?: readonly string[]
  /** Fallback classes. */
  fallback?: string
  /** Escape hatch. */
  onReady?: ReadyCallback<IridescenceControls>
}

/** Every property. */
export type IridescenceProps = Customisable<IridescenceOwnProps>

/** Tokens used by default: the background, the two hues of the pearl. */
const DEFAULT_TOKENS = [
  '--o-theme-bg',
  '--o-palette-pink-300',
  '--o-palette-teal-300',
] as const

/** Default fallback: a frozen gradient, in the same tones. */
const DEFAULT_FALLBACK =
  'o-bg-gradient-to-tr o-from-pink-100 dark:o-from-pink-950 o-via-zinc-50 dark:o-via-zinc-950 o-to-teal-100 dark:o-to-teal-950'

/**
 * Detail outside low quality.
 *
 * Each wave is a sine and its gradient: it is the only cost lever, and it
 * drops to two waves on low quality.
 */
const DETAIL = 4

/** Detail at low quality. */
const LOW_DETAIL = 2

/**
 * Iridescence.
 *
 * @example
 * <div className="o-relative o-min-h-screen">
 *   <Iridescence className="o-absolute o-inset-0" />
 *   <main className="o-relative">…</main>
 * </div>
 */
export function Iridescence({
  speed = 0.3,
  scale = 1.4,
  shimmer = 0.7,
  bands = 2.5,
  colors = DEFAULT_TOKENS,
  fallback = DEFAULT_FALLBACK,
  onReady,
  ...rest
}: IridescenceProps): ReactElement {
  const { ref, setHost, ready, refused, colours } = useTokenShader<HTMLDivElement>({
    fragment: IRIDESCENCE_FRAGMENT,
    colors,
    uniforms: {
      uSpeed: speed,
      uScale: scale,
      uShimmer: shimmer,
      uBands: bands,
      uDetail: DETAIL,
    },
    name: 'iridescence',
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

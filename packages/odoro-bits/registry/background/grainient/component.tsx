/**
 * Grainient: blobs of colour drifting slowly, whose transitions dissolve into grain instead of spreading.
 *
 * ## The principle
 *
 * Gaussians around centres tracing Lissajous curves, the even ones in one
 * hue and the odd ones in the other. The grain is not laid over the image:
 * one draw per pixel, renewed twelve times a second, shifts the weights
 * before the mix. The bare background stays intact — the grain lives only
 * where there is colour.
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

import { GRAINIENT_FRAGMENT } from './grainient.shader.js'

/** What the escape hatch receives. */
export interface GrainientControls {
  /** Colours actually handed to the shader. */
  readonly colours: readonly ShaderColour[]
  /** Reason for the refusal, if there is one. */
  readonly refused: string | undefined
}

/** Properties specific to this component. */
export interface GrainientOwnProps {
  /** Drift speed of the blobs. @defaultValue 0.15 */
  speed?: number
  /** Strength of the grain. @defaultValue 0.6 */
  grain?: number
  /** Size of the blobs. @defaultValue 1.2 */
  scale?: number
  /** Tokens whose colours are read. */
  colors?: readonly string[]
  /** Fallback classes. */
  fallback?: string
  /** Escape hatch. */
  onReady?: ReadyCallback<GrainientControls>
}

/** Every property. */
export type GrainientProps = Customisable<GrainientOwnProps>

/** Tokens used by default: the background, the two hues of the blobs. */
const DEFAULT_TOKENS = [
  '--o-theme-bg',
  '--o-palette-violet-400',
  '--o-palette-orange-300',
] as const

/** Default fallback: a frozen gradient, in the same tones. */
const DEFAULT_FALLBACK =
  'o-bg-gradient-to-br o-from-violet-200 dark:o-from-violet-900 o-via-zinc-50 dark:o-via-zinc-950 o-to-orange-200 dark:o-to-orange-900'

/**
 * Detail outside low quality.
 *
 * The grain is a draw, it costs nothing; it is the blobs, one exponential
 * each, that drop to two at low quality.
 */
const DETAIL = 4

/** Detail at low quality. */
const LOW_DETAIL = 2

/**
 * Grainient.
 *
 * @example
 * <div className="o-relative o-min-h-screen">
 *   <Grainient className="o-absolute o-inset-0" />
 *   <main className="o-relative">…</main>
 * </div>
 */
export function Grainient({
  speed = 0.15,
  grain = 0.6,
  scale = 1.2,
  colors = DEFAULT_TOKENS,
  fallback = DEFAULT_FALLBACK,
  onReady,
  ...rest
}: GrainientProps): ReactElement {
  const { ref, setHost, ready, refused, colours } = useTokenShader<HTMLDivElement>({
    fragment: GRAINIENT_FRAGMENT,
    colors,
    uniforms: {
      uSpeed: speed,
      uGrain: grain,
      uScale: scale,
      uBlobs: DETAIL,
    },
    name: 'grainient',
    degrade: (quality) => ({
      uBlobs: quality === 'low' ? LOW_DETAIL : DETAIL,
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

/**
 * Organic shape: a single form breathing at the centre, with a fringed edge.
 *
 * ## The principle
 *
 * A radius modulated by three odd harmonics of the angle, each one turning
 * at its own speed: the shape never repeats itself and never looks
 * geometric. The edge is disturbed by a fine noise before the threshold,
 * and a halo escapes from it.
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

import { BLOB_MORPH_FRAGMENT } from './blob-morph.shader.js'

/** What the escape hatch receives. */
export interface BlobMorphControls {
  /** Colours actually handed to the shader. */
  readonly colours: readonly ShaderColour[]
  /** Reason for the refusal, if there is one. */
  readonly refused: string | undefined
}

/** Props belonging to the component itself. */
export interface BlobMorphOwnProps {
  /** Mean radius, in frame heights. @defaultValue 0.28 */
  size?: number
  /** Speed of the breathing. @defaultValue 0.4 */
  speed?: number
  /** Amplitude of the harmonics of the outline. @defaultValue 0.35 */
  wobble?: number
  /** Width of the fringe, strength of the halo. @defaultValue 0.5 */
  fringe?: number
  /** Tokens whose colours are read. */
  colors?: readonly string[]
  /** Classes of the fallback. */
  fallback?: string
  /** Escape hatch. */
  onReady?: ReadyCallback<BlobMorphControls>
}

/** All the props. */
export type BlobMorphProps = Customisable<BlobMorphOwnProps>

/** Tokens used by default: the background, the body, the fringe. */
const DEFAULT_TOKENS = [
  '--o-theme-bg',
  '--o-palette-brand-500',
  '--o-palette-fuchsia-300',
] as const

/** Default fallback: a halo frozen at the centre, in the same tones. */
const DEFAULT_FALLBACK =
  'o-bg-gradient-to-br o-from-zinc-50 dark:o-from-zinc-950 o-via-brand-400 o-to-zinc-50 dark:o-to-zinc-950'

/**
 * Octaves of the fringe outside low quality.
 *
 * The fringe is the only summed noise in the shader: it is the only cost
 * lever, and it does not need to be a prop in order to be stepped down.
 */
const DETAIL = 2

/** Octaves of the fringe at low quality. */
const LOW_DETAIL = 1

/**
 * Organic shape.
 *
 * @example
 * <div className="o-relative o-min-h-screen">
 *   <BlobMorph className="o-absolute o-inset-0" />
 *   <main className="o-relative">…</main>
 * </div>
 */
export function BlobMorph({
  size = 0.28,
  speed = 0.4,
  wobble = 0.35,
  fringe = 0.5,
  colors = DEFAULT_TOKENS,
  fallback = DEFAULT_FALLBACK,
  onReady,
  ...rest
}: BlobMorphProps): ReactElement {
  const { ref, setHost, ready, refused, colours } = useTokenShader<HTMLDivElement>({
    fragment: BLOB_MORPH_FRAGMENT,
    colors,
    uniforms: {
      uSize: size,
      uSpeed: speed,
      uWobble: wobble,
      uFringe: fringe,
      uDetail: DETAIL,
    },
    name: 'blob-morph',
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

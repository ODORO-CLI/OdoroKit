/**
 * Lava: hot blobs that drift and merge.
 *
 * ## The principle
 *
 * Metaballs: every centre emits a 1/d2 field, the sum of the fields is
 * thresholded in two soft steps — dark edge, bright core — and two blobs
 * drawing near merge of their own accord, without any code gluing them back
 * together.
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

import { LAVA_FRAGMENT } from './lava.shader.js'

/** What the escape hatch receives. */
export interface LavaControls {
  /** Colours actually handed to the shader. */
  readonly colours: readonly ShaderColour[]
  /** Reason for the refusal, if there is one. */
  readonly refused: string | undefined
}

/** Properties specific to this component. */
export interface LavaOwnProps {
  /** Drift speed of the centres. @defaultValue 0.3 */
  speed?: number
  /** Number of blobs. @defaultValue 5 */
  blobs?: number
  /** Field threshold. Lower means more matter. @defaultValue 1.2 */
  threshold?: number
  /** Tokens whose colours are read. */
  colors?: readonly string[]
  /** Fallback classes. */
  fallback?: string
  /** Escape hatch. */
  onReady?: ReadyCallback<LavaControls>
}

/** Every property. */
export type LavaProps = Customisable<LavaOwnProps>

/** Tokens used by default: the cold rock, the edge, the molten core. */
const DEFAULT_TOKENS = [
  '--o-theme-bg',
  '--o-palette-red-600',
  '--o-palette-amber-400',
] as const

/** Default fallback: a frozen gradient, in the same tones. */
const DEFAULT_FALLBACK =
  'o-bg-gradient-to-t o-from-red-950 o-to-zinc-50 dark:o-to-zinc-950'

/**
 * Lava.
 *
 * @example
 * <div className="o-relative o-min-h-screen">
 *   <Lava className="o-absolute o-inset-0" />
 *   <main className="o-relative">…</main>
 * </div>
 */
export function Lava({
  speed = 0.3,
  blobs = 5,
  threshold = 1.2,
  colors = DEFAULT_TOKENS,
  fallback = DEFAULT_FALLBACK,
  onReady,
  ...rest
}: LavaProps): ReactElement {
  const { ref, setHost, ready, refused, colours } = useTokenShader<HTMLDivElement>({
    fragment: LAVA_FRAGMENT,
    colors,
    uniforms: { uSpeed: speed, uBlobs: blobs, uThreshold: threshold },
    name: 'lava',
    // Every blob is one more field to sum per pixel: that is the setting
    // which weighs, so that is the one which gets capped.
    degrade: (quality) => ({
      uBlobs: quality === 'low' ? Math.min(blobs, 3) : blobs,
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

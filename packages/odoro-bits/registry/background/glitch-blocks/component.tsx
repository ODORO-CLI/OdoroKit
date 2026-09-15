/**
 * Glitch blocks: a picture whose blocks jolt out of place, their hues
 * inverted or pulled apart.
 *
 * ## The principle
 *
 * Everything is chopped into ticks of time: between two ticks nothing moves.
 * At each tick, a draw per block decides whether it jumps; a block that
 * jumps reads the image elsewhere and writes it the other way round. Whole
 * bands jump more rarely, in a single piece.
 *
 * What sets this entry apart from `tv-static`: there is a picture, and it
 * breaks; and from `vhs-tracking`: here the jumps are crisp rectangles, not
 * bands that roll.
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

import { GLITCH_BLOCKS_FRAGMENT } from './glitch-blocks.shader.js'

/** What the escape hatch receives. */
export interface GlitchBlocksControls {
  /** Colours actually handed to the shader. */
  readonly colours: readonly ShaderColour[]
  /** Reason for the refusal, if there is one. */
  readonly refused: string | undefined
}

/** Properties specific to this component. */
export interface GlitchBlocksOwnProps {
  /** Number of rows of blocks across the height. Capped at forty by the shader. @defaultValue 12 */
  blocks?: number
  /** Ticks per second. @defaultValue 6 */
  rate?: number
  /** Share of the blocks that jump at each tick. Zero freezes the picture. @defaultValue 0.5 */
  amount?: number
  /** Speed of the background gradient. @defaultValue 0.3 */
  speed?: number
  /** Tokens whose colours are read. */
  colors?: readonly string[]
  /** Fallback classes. */
  fallback?: string
  /** Escape hatch. */
  onReady?: ReadyCallback<GlitchBlocksControls>
}

/** Every property. */
export type GlitchBlocksProps = Customisable<GlitchBlocksOwnProps>

/** Tokens used by default: the background, the two hues of the gradient. */
const DEFAULT_TOKENS = [
  '--o-theme-bg',
  '--o-palette-violet-500',
  '--o-palette-cyan-400',
] as const

/** Default fallback: a frozen gradient, in the same tones. */
const DEFAULT_FALLBACK =
  'o-bg-gradient-to-br o-from-zinc-50 dark:o-from-zinc-950 o-via-violet-100 dark:o-via-violet-950 o-to-cyan-100 dark:o-to-cyan-950'

/**
 * Glitch blocks.
 *
 * @example
 * <div className="o-relative o-min-h-screen">
 *   <GlitchBlocks className="o-absolute o-inset-0" />
 *   <main className="o-relative">…</main>
 * </div>
 */
export function GlitchBlocks({
  blocks = 12,
  rate = 6,
  amount = 0.5,
  speed = 0.3,
  colors = DEFAULT_TOKENS,
  fallback = DEFAULT_FALLBACK,
  onReady,
  ...rest
}: GlitchBlocksProps): ReactElement {
  const { ref, setHost, ready, refused, colours } = useTokenShader<HTMLDivElement>({
    fragment: GLITCH_BLOCKS_FRAGMENT,
    colors,
    uniforms: { uBlocks: blocks, uRate: rate, uAmount: amount, uSpeed: speed },
    name: 'glitch-blocks',
    // The fragment costs the same on every frame; what weighs is the rate of
    // genuinely different frames, so that is what is capped.
    degrade: (quality) => ({
      uRate: quality === 'low' ? Math.min(rate, 3) : rate,
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

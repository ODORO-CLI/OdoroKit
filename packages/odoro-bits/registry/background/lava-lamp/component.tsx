/**
 * Lava lamp: stretched wax drops that rise and sink back down.
 *
 * ## The principle
 *
 * Implicit surfaces constrained by the lamp: distance stretched vertically,
 * slow vertical motion, a reserve of wax at the bottom in which the drops are
 * born and into which they melt. Every drop carries its own colour, drawn from
 * its height, and where two drops meet they blend theirs inside the matter
 * itself.
 *
 * ## What sets it apart from lava
 *
 * Lava is a free field, hot, thresholded in two steps. Here everything is
 * vertical and slow, the drops are ovals, and the colour is a property of each
 * drop — not a step of the field. The two have nothing in common on screen.
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

import { LAVA_LAMP_FRAGMENT } from './lava-lamp.shader.js'

/** What the escape hatch receives. */
export interface LavaLampControls {
  /** Colours actually handed to the shader. */
  readonly colours: readonly ShaderColour[]
  /** Reason for the refusal, if there is one. */
  readonly refused: string | undefined
}

/** Properties specific to this component. */
export interface LavaLampOwnProps {
  /** Speed of the rise. @defaultValue 0.08 */
  speed?: number
  /** Number of drops. @defaultValue 5 */
  drops?: number
  /** Vertical stretch of the drops. @defaultValue 1.6 */
  stretch?: number
  /** Glow of the heater, at the bottom. @defaultValue 0.5 */
  glow?: number
  /** Tokens whose colours are read. */
  colors?: readonly string[]
  /** Fallback classes. */
  fallback?: string
  /** Escape hatch. */
  onReady?: ReadyCallback<LavaLampControls>
}

/** Every property. */
export type LavaLampProps = Customisable<LavaLampOwnProps>

/** Tokens used by default: the glass, the hot wax, the cooled wax. */
const DEFAULT_TOKENS = [
  '--o-theme-bg',
  '--o-palette-brand-500',
  '--o-palette-fuchsia-400',
] as const

/** Default fallback: the frozen heater, in the same tones. */
const DEFAULT_FALLBACK =
  'o-bg-gradient-to-t o-from-brand-300 dark:o-from-brand-900 o-via-zinc-50 dark:o-via-zinc-950 o-to-zinc-50 dark:o-to-zinc-950'

/**
 * Number of drops at low quality.
 *
 * Every drop is one more field to sum and to weight: it is the shader's only
 * lever on cost.
 */
const LOW_DROPS = 3

/**
 * Lava lamp.
 *
 * @example
 * <div className="o-relative o-min-h-screen">
 *   <LavaLamp className="o-absolute o-inset-0" />
 *   <main className="o-relative">…</main>
 * </div>
 */
export function LavaLamp({
  speed = 0.08,
  drops = 5,
  stretch = 1.6,
  glow = 0.5,
  colors = DEFAULT_TOKENS,
  fallback = DEFAULT_FALLBACK,
  onReady,
  ...rest
}: LavaLampProps): ReactElement {
  const { ref, setHost, ready, refused, colours } = useTokenShader<HTMLDivElement>({
    fragment: LAVA_LAMP_FRAGMENT,
    colors,
    uniforms: { uSpeed: speed, uDrops: drops, uStretch: stretch, uGlow: glow },
    name: 'lava-lamp',
    // The drop count is the only setting which weighs: the only one capped.
    degrade: (quality) => ({
      uDrops: quality === 'low' ? Math.min(drops, LOW_DROPS) : drops,
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

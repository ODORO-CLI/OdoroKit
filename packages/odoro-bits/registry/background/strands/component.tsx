/**
 * Strands: filaments anchored at the bottom of the frame, waving like seaweed.
 *
 * ## The principle
 *
 * One strand per column, an x = f(y) whose sway grows with height: the root
 * holds, the tip follows the current with a lag. Each strand has its own
 * height, its own thickness that tapers, its own phase.
 *
 * What sets this entry apart from its cousins: the filaments are vertical
 * and anchored, the motion is a sideways sway, and the thickness varies
 * along the filament.
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

import { STRANDS_FRAGMENT } from './strands.shader.js'

/** What the escape hatch receives. */
export interface StrandsControls {
  /** Colours actually handed to the shader. */
  readonly colours: readonly ShaderColour[]
  /** Reason for the refusal, if there is one. */
  readonly refused: string | undefined
}

/** Props specific to this component. */
export interface StrandsOwnProps {
  /** Number of strands. Capped at forty by the shader. @defaultValue 18 */
  count?: number
  /** Amplitude of the sway, in column widths. @defaultValue 0.7 */
  sway?: number
  /** Speed of the current. @defaultValue 0.6 */
  speed?: number
  /** Thickness at the root, as a fraction of the width. @defaultValue 0.006 */
  thickness?: number
  /** Tokens whose colours are read. */
  colors?: readonly string[]
  /** Fallback classes. */
  fallback?: string
  /** Escape hatch. */
  onReady?: ReadyCallback<StrandsControls>
}

/** All props. */
export type StrandsProps = Customisable<StrandsOwnProps>

/** Tokens used by default: the background, the body of the strands, their tip. */
const DEFAULT_TOKENS = [
  '--o-theme-bg',
  '--o-palette-teal-700',
  '--o-palette-teal-300',
] as const

/** Default fallback: a frozen gradient, in the same tones. */
const DEFAULT_FALLBACK =
  'o-bg-gradient-to-t o-from-teal-950 o-to-zinc-50 dark:o-to-zinc-950'

/**
 * Number of strands at low quality.
 *
 * Three columns are evaluated per fragment whatever their number. What costs
 * is a one-pixel stroke at reduced density, which shimmers when the strands
 * are tightly packed: fewer strands, more room, and the stroke holds.
 */
const LOW_COUNT = 10

/**
 * Strands.
 *
 * @example
 * <div className="o-relative o-min-h-screen">
 *   <Strands className="o-absolute o-inset-0" />
 *   <main className="o-relative">…</main>
 * </div>
 */
export function Strands({
  count = 18,
  sway = 0.7,
  speed = 0.6,
  thickness = 0.006,
  colors = DEFAULT_TOKENS,
  fallback = DEFAULT_FALLBACK,
  onReady,
  ...rest
}: StrandsProps): ReactElement {
  const { ref, setHost, ready, refused, colours } = useTokenShader<HTMLDivElement>({
    fragment: STRANDS_FRAGMENT,
    colors,
    uniforms: { uCount: count, uSway: sway, uSpeed: speed, uThickness: thickness },
    name: 'strands',
    degrade: (quality) => ({
      uCount: quality === 'low' ? Math.min(count, LOW_COUNT) : count,
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

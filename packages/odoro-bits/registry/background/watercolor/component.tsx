/**
 * Watercolour: blots that spread, dry and fade away.
 *
 * ## The principle
 *
 * Each blot lives through a cycle with a phase of its own: it spreads fast
 * then slows down, its pigment migrates towards the edge as it dries — the
 * dark rim of a watercolour — then it fades away and is born again
 * elsewhere. The edge follows a noise fixed in the plane, the way water
 * follows the fibres of the paper.
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

import { WATERCOLOR_FRAGMENT } from './watercolor.shader.js'

/** What the escape hatch receives. */
export interface WatercolorControls {
  /** Colours actually handed to the shader. */
  readonly colours: readonly ShaderColour[]
  /** Reason for the refusal, if there is one. */
  readonly refused: string | undefined
}

/** Props specific to this component. */
export interface WatercolorOwnProps {
  /** Speed of the cycle. @defaultValue 0.25 */
  speed?: number
  /** Number of living blots. @defaultValue 6 */
  blots?: number
  /** Fringe of the edge. @defaultValue 0.5 */
  bleed?: number
  /** Grain of the paper. @defaultValue 0.3 */
  grain?: number
  /** Tokens whose colours are read. */
  colors?: readonly string[]
  /** Fallback classes. */
  fallback?: string
  /** Escape hatch. */
  onReady?: ReadyCallback<WatercolorControls>
}

/** All props. */
export type WatercolorProps = Customisable<WatercolorOwnProps>

/** Tokens used by default: the paper, the two pigments. */
const DEFAULT_TOKENS = [
  '--o-theme-bg',
  '--o-palette-brand-500',
  '--o-palette-sky-400',
] as const

/** Default fallback: a frozen wash, in the same tones. */
const DEFAULT_FALLBACK =
  'o-bg-gradient-to-br o-from-zinc-50 dark:o-from-zinc-950 o-via-brand-200 dark:o-via-brand-900 o-to-sky-200 dark:o-to-sky-900'

/**
 * Number of blots at low quality.
 *
 * Each blot reads a sum of octaves for its fringe: it is the shader's only
 * cost lever.
 */
const LOW_BLOTS = 3

/**
 * Watercolour.
 *
 * @example
 * <div className="o-relative o-min-h-screen">
 *   <Watercolor className="o-absolute o-inset-0" />
 *   <main className="o-relative">…</main>
 * </div>
 */
export function Watercolor({
  speed = 0.25,
  blots = 6,
  bleed = 0.5,
  grain = 0.3,
  colors = DEFAULT_TOKENS,
  fallback = DEFAULT_FALLBACK,
  onReady,
  ...rest
}: WatercolorProps): ReactElement {
  const { ref, setHost, ready, refused, colours } = useTokenShader<HTMLDivElement>({
    fragment: WATERCOLOR_FRAGMENT,
    colors,
    uniforms: { uSpeed: speed, uBlots: blots, uBleed: bleed, uGrain: grain },
    name: 'watercolor',
    // The number of blots is the only setting that weighs: the only one capped.
    degrade: (quality) => ({
      uBlots: quality === 'low' ? Math.min(blots, LOW_BLOTS) : blots,
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

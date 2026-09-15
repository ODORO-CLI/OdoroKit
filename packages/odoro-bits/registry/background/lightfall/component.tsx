/**
 * Lightfall: luminous drops falling in columns.
 *
 * ## The principle
 *
 * One drop per column, each at its own cadence: a sharp head and an
 * exponential trail above it. Three depths are stacked, finer and paler as
 * they recede, over a curtain coming down from the top. Distinct from rain:
 * wide luminous drops that trail, not thin streaks.
 *
 * ## What this component delegates
 *
 * It carries only what sets it apart: its shader, its settings and its fallback.
 * Reading the tokens, converting them to floats and re-reading them when the
 * theme changes all come from the engine.
 *
 * The fallback is not a precaution: it is shown while the backend loads, when
 * WebGL is missing, when the arbiter refuses the surface and under reduced
 * motion.
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

import { LIGHTFALL_FRAGMENT } from './lightfall.shader.js'

/** What the escape hatch receives. */
export interface LightfallControls {
  /** Colours actually handed to the shader. */
  readonly colours: readonly ShaderColour[]
  /** Reason for the refusal, if there is one. */
  readonly refused: string | undefined
}

/** Properties specific to this component. */
export interface LightfallOwnProps {
  /** Falling speed. @defaultValue 1 */
  speed?: number
  /** Number of columns across the height of the frame. @defaultValue 9 */
  density?: number
  /** Length of the trails, in frame heights. @defaultValue 0.25 */
  length?: number
  /** Tokens whose colours are read. */
  colors?: readonly string[]
  /** Fallback classes. */
  fallback?: string
  /** Escape hatch. */
  onReady?: ReadyCallback<LightfallControls>
}

/** Every property. */
export type LightfallProps = Customisable<LightfallOwnProps>

/** Tokens used by default: the background, the curtain, the drops. */
const DEFAULT_TOKENS = [
  '--o-theme-bg',
  '--o-palette-sky-500',
  '--o-palette-cyan-300',
] as const

/** Default fallback: a frozen gradient, in the same tones. */
const DEFAULT_FALLBACK =
  'o-bg-gradient-to-b o-from-sky-100 dark:o-from-sky-900 o-to-zinc-50 dark:o-to-zinc-950'

/**
 * Depths stacked outside low quality.
 *
 * Every depth is a whole layer of drops: it is the shader's only lever on
 * cost, and the furthest one is also the palest — the one least missed.
 */
const LAYERS = 3

/** Depths at low quality. */
const LOW_LAYERS = 1

/**
 * Lightfall.
 *
 * @example
 * <div className="o-relative o-min-h-screen">
 *   <Lightfall className="o-absolute o-inset-0" />
 *   <main className="o-relative">…</main>
 * </div>
 */
export function Lightfall({
  speed = 1,
  density = 9,
  length = 0.25,
  colors = DEFAULT_TOKENS,
  fallback = DEFAULT_FALLBACK,
  onReady,
  ...rest
}: LightfallProps): ReactElement {
  const { ref, setHost, ready, refused, colours } = useTokenShader<HTMLDivElement>({
    fragment: LIGHTFALL_FRAGMENT,
    colors,
    uniforms: { uSpeed: speed, uDensity: density, uLength: length, uLayers: LAYERS },
    name: 'lightfall',
    degrade: (quality) => ({
      uLayers: quality === 'low' ? LOW_LAYERS : LAYERS,
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

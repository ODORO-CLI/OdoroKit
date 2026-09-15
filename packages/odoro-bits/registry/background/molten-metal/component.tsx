/**
 * Molten metal: a bath of hot metal: a crust cracking into veins, a slow flow in a domain-warped noise, a radiating core.
 *
 * ## The principle
 *
 * A heat field in a fractal noise with domain warping, two passes so that the
 * flows coil. The colour is a ramp with three stops — the crust is the
 * background itself, then the metal, then the core — and the veins are the
 * level lines of the field. Two offset reads give a relief lit at a grazing
 * angle.
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

import { MOLTEN_METAL_FRAGMENT } from './molten-metal.shader.js'

/** What the escape hatch receives. */
export interface MoltenMetalControls {
  /** Colours actually handed to the shader. */
  readonly colours: readonly ShaderColour[]
  /** Reason for the refusal, if there is one. */
  readonly refused: string | undefined
}

/** Props specific to this component. */
export interface MoltenMetalOwnProps {
  /** Speed of the flow. @defaultValue 0.08 */
  speed?: number
  /** Scale of the field. Higher is finer. @defaultValue 1.8 */
  scale?: number
  /** Share of the bath that is molten. @defaultValue 0.6 */
  heat?: number
  /** Tokens whose colours are read. */
  colors?: readonly string[]
  /** Fallback classes. */
  fallback?: string
  /** Escape hatch. */
  onReady?: ReadyCallback<MoltenMetalControls>
}

/** All props. */
export type MoltenMetalProps = Customisable<MoltenMetalOwnProps>

/** Tokens used by default: the crust, the metal, the core. */
const DEFAULT_TOKENS = [
  '--o-theme-bg',
  '--o-palette-red-600',
  '--o-palette-amber-300',
] as const

/** Default fallback: a frozen gradient, in the same tones. */
const DEFAULT_FALLBACK =
  'o-bg-gradient-to-t o-from-amber-300 dark:o-from-amber-700 o-via-red-300 dark:o-via-red-900 o-to-zinc-50 dark:o-to-zinc-950'

/**
 * Detail outside low quality.
 *
 * The field is read three times, and every read is seven octave sums: it is the
 * only cost lever, and it drops to two octaves.
 */
const DETAIL = 4

/** Detail at low quality. */
const LOW_DETAIL = 2

/**
 * Molten metal.
 *
 * @example
 * <div className="o-relative o-min-h-screen">
 *   <MoltenMetal className="o-absolute o-inset-0" />
 *   <main className="o-relative">…</main>
 * </div>
 */
export function MoltenMetal({
  speed = 0.08,
  scale = 1.8,
  heat = 0.6,
  colors = DEFAULT_TOKENS,
  fallback = DEFAULT_FALLBACK,
  onReady,
  ...rest
}: MoltenMetalProps): ReactElement {
  const { ref, setHost, ready, refused, colours } = useTokenShader<HTMLDivElement>({
    fragment: MOLTEN_METAL_FRAGMENT,
    colors,
    uniforms: {
      uSpeed: speed,
      uScale: scale,
      uHeat: heat,
      uOctaves: DETAIL,
    },
    name: 'molten-metal',
    degrade: (quality) => ({
      uOctaves: quality === 'low' ? LOW_DETAIL : DETAIL,
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

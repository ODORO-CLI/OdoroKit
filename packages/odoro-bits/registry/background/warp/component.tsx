/**
 * Hyperspace: stars stretched radially, over three depths.
 *
 * ## The principle
 *
 * In polar coordinates, a rushing star only moves along the radius: the grid is laid on (angle, 1/r), and time does nothing but slide the radial coordinate.
 *
 * Three offset grids, at distinct speeds, make the three depths — that is the whole parallax.
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

import { WARP_FRAGMENT } from './warp.shader.js'

/** What the escape hatch receives. */
export interface WarpControls {
  /** Colours actually handed to the shader. */
  readonly colours: readonly ShaderColour[]
  /** Reason for the refusal, if there is one. */
  readonly refused: string | undefined
}

/** Props specific to this component. */
export interface WarpOwnProps {
  /** Speed of the radial scroll. @defaultValue 0.8 */
  speed?: number
  /** Number of angular lanes in the first layer. @defaultValue 24 */
  density?: number
  /** Length of the trails, from 0 to 1. @defaultValue 0.35 */
  stretch?: number
  /** Tokens whose colours are read. */
  colors?: readonly string[]
  /** Fallback classes. */
  fallback?: string
  /** Escape hatch. */
  onReady?: ReadyCallback<WarpControls>
}

/** All props. */
export type WarpProps = Customisable<WarpOwnProps>

/** Tokens used by default: the background, the near stars, the distant ones. */
const DEFAULT_TOKENS = [
  '--o-theme-bg',
  '--o-palette-blue-300',
  '--o-palette-violet-400',
] as const

/** Default fallback: a frozen tint, in the same tones. */
const DEFAULT_FALLBACK = 'o-bg-zinc-50 dark:o-bg-zinc-950'

/** Depth layers outside low quality. */
const LAYERS = 3

/** Layers at low quality. */
const LOW_LAYERS = 2

/**
 * Hyperspace.
 *
 * @example
 * <div className="o-relative o-min-h-screen">
 *   <Warp className="o-absolute o-inset-0" />
 *   <main className="o-relative">…</main>
 * </div>
 */
export function Warp({
  speed = 0.8,
  density = 24,
  stretch = 0.35,
  colors = DEFAULT_TOKENS,
  fallback = DEFAULT_FALLBACK,
  onReady,
  ...rest
}: WarpProps): ReactElement {
  const { ref, setHost, ready, refused, colours } = useTokenShader<HTMLDivElement>({
    fragment: WARP_FRAGMENT,
    colors,
    uniforms: { uSpeed: speed, uDensity: density, uStretch: stretch, uLayers: LAYERS },
    name: 'warp',
    // Each layer redoes all the work — hash, stroke, trail — per fragment:
    // it is the setting that weighs, so it is the one that is taken away. The
    // distant layer goes first, it is the least legible.
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

/**
 * Truchet: two-arc tiles that pivot in a cascade.
 *
 * ## Why a quarter turn, and not a half
 *
 * A half turn brings a Truchet tile back onto itself: nothing would change.
 * The quarter turn is the smallest rotation that recomposes the tiling, and
 * animating it is enough to show where the new drawing comes from.
 *
 * ## What this component delegates
 *
 * It carries only what sets it apart: its shader, its settings and its
 * fallback. Reading the tokens, converting them to floats and re-reading them
 * when the theme changes all come from the engine.
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

import { TRUCHET_FRAGMENT } from './truchet.shader.js'

/** What the escape hatch receives. */
export interface TruchetControls {
  /** Colours actually handed to the shader. */
  readonly colours: readonly ShaderColour[]
  /** Reason for the refusal, if there is one. */
  readonly refused: string | undefined
}

/** Props specific to this component. */
export interface TruchetOwnProps {
  /** Rate of the pivots, in periods per second. @defaultValue 0.35 */
  speed?: number
  /** Number of tiles over the height. @defaultValue 8 */
  density?: number
  /** Thickness of the arcs, as a fraction of the tile. @defaultValue 0.09 */
  thickness?: number
  /** Diagonal delay between two neighbouring tiles, in periods. @defaultValue 0.12 */
  stagger?: number
  /** Tokens whose colours are read. */
  colors?: readonly string[]
  /** Fallback classes. */
  fallback?: string
  /** Escape hatch. */
  onReady?: ReadyCallback<TruchetControls>
}

/** All props. */
export type TruchetProps = Customisable<TruchetOwnProps>

/** Tokens used by default: the background, the first arc, the second arc. */
const DEFAULT_TOKENS = [
  '--o-theme-bg',
  '--o-palette-brand-500',
  '--o-palette-teal-400',
] as const

/** Default fallback: a frozen tint, in the same tones. */
const DEFAULT_FALLBACK = 'o-bg-zinc-50 dark:o-bg-zinc-950'

/**
 * Truchet.
 *
 * @example
 * <div className="o-relative o-min-h-screen">
 *   <Truchet className="o-absolute o-inset-0" />
 *   <main className="o-relative">…</main>
 * </div>
 */
export function Truchet({
  speed = 0.35,
  density = 8,
  thickness = 0.09,
  stagger = 0.12,
  colors = DEFAULT_TOKENS,
  fallback = DEFAULT_FALLBACK,
  onReady,
  ...rest
}: TruchetProps): ReactElement {
  const { ref, setHost, ready, refused, colours } = useTokenShader<HTMLDivElement>({
    fragment: TRUCHET_FRAGMENT,
    colors,
    uniforms: {
      uSpeed: speed,
      uDensity: density,
      uThickness: thickness,
      uStagger: stagger,
    },
    name: 'truchet',
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

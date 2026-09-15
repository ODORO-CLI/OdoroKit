/**
 * Gradient blinds: slats in front of a gradient, whose opening follows a wave that crosses the blind from one edge to the other.
 *
 * ## The principle
 *
 * Each slat is a cell of a grid in x; its opening is a fraction of the cell
 * that follows a wave crossing the slats, tilted by a second wave in y.
 * Behind, a gradient between two tokens along a diagonal that drifts; in
 * front, the closed slat is the background itself, barely
 * tinted.
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

import { GRADIENT_BLINDS_FRAGMENT } from './gradient-blinds.shader.js'

/** What the escape hatch receives. */
export interface GradientBlindsControls {
  /** Colours actually handed to the shader. */
  readonly colours: readonly ShaderColour[]
  /** Reason for the refusal, if there is one. */
  readonly refused: string | undefined
}

/** Properties specific to this component. */
export interface GradientBlindsOwnProps {
  /** Number of slats across the width. @defaultValue 14 */
  count?: number
  /** Speed of the opening wave. @defaultValue 0.5 */
  speed?: number
  /** Average opening, between shut and open. @defaultValue 0.55 */
  open?: number
  /** Tilt of the slats. @defaultValue 0.3 */
  tilt?: number
  /** Tokens whose colours are read. */
  colors?: readonly string[]
  /** Fallback classes. */
  fallback?: string
  /** Escape hatch. */
  onReady?: ReadyCallback<GradientBlindsControls>
}

/** Every property. */
export type GradientBlindsProps = Customisable<GradientBlindsOwnProps>

/** Tokens used by default: the slats, the two hues of the gradient. */
const DEFAULT_TOKENS = [
  '--o-theme-bg',
  '--o-palette-orange-400',
  '--o-palette-rose-500',
] as const

/** Default fallback: a frozen gradient, in the same tones. */
const DEFAULT_FALLBACK =
  'o-bg-gradient-to-r o-from-orange-200 dark:o-from-orange-900 o-to-rose-200 dark:o-to-rose-900'

/**
 * Detail outside low quality.
 *
 * The blind itself is a fractional part; it is the edging and the shadow,
 * two exponentials, that drop out at low quality.
 */
const DETAIL = 1

/** Detail at low quality. */
const LOW_DETAIL = 0

/**
 * Gradient blinds.
 *
 * @example
 * <div className="o-relative o-min-h-screen">
 *   <GradientBlinds className="o-absolute o-inset-0" />
 *   <main className="o-relative">…</main>
 * </div>
 */
export function GradientBlinds({
  count = 14,
  speed = 0.5,
  open = 0.55,
  tilt = 0.3,
  colors = DEFAULT_TOKENS,
  fallback = DEFAULT_FALLBACK,
  onReady,
  ...rest
}: GradientBlindsProps): ReactElement {
  const { ref, setHost, ready, refused, colours } = useTokenShader<HTMLDivElement>({
    fragment: GRADIENT_BLINDS_FRAGMENT,
    colors,
    uniforms: {
      uCount: count,
      uSpeed: speed,
      uOpen: open,
      uTilt: tilt,
      uDetail: DETAIL,
    },
    name: 'gradient-blinds',
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

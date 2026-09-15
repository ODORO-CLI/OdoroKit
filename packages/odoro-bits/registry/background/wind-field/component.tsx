/**
 * Wind field: short strokes oriented by the wind, crossed by gusts.
 *
 * ## The principle
 *
 * A grid of cells, one stroke per cell: its direction is that of the wind,
 * its length the strength of the wind. The wind is a prevailing bearing
 * deflected by a slow noise, and gusts — bands advancing along the bearing —
 * lengthen the strokes and change their hue as they pass. It is a weather
 * station reading, set in motion.
 *
 * What sets this entry apart from `flow-field`: over there particles run
 * along the field; here nothing travels, the strokes stay where they are and
 * only turn and lengthen.
 *
 * ## What this component delegates
 *
 * It carries only what sets it apart: its shader, its settings and its
 * fallback. Reading the tokens, converting them to floats and re-reading them
 * when the theme changes all come from the engine.
 *
 * The fallback is shown while the backend loads, when WebGL is missing, when
 * the arbiter refuses the surface and under reduced motion.
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

import { WIND_FIELD_FRAGMENT } from './wind-field.shader.js'

/** What the escape hatch receives. */
export interface WindFieldControls {
  /** Colours actually handed to the shader. */
  readonly colours: readonly ShaderColour[]
  /** Reason for the refusal, if there is one. */
  readonly refused: string | undefined
}

/** Props specific to this component. */
export interface WindFieldOwnProps {
  /** Number of cells per frame height. @defaultValue 22 */
  cells?: number
  /** Frequency of the noise, hence the size of the eddies. @defaultValue 1.6 */
  scale?: number
  /** How fast the wind evolves and the gusts sweep past. @defaultValue 1 */
  speed?: number
  /** Strength of the gusts. @defaultValue 0.7 */
  gusts?: number
  /** Tokens whose colours are read. */
  colors?: readonly string[]
  /** Fallback classes. */
  fallback?: string
  /** Escape hatch. */
  onReady?: ReadyCallback<WindFieldControls>
}

/** All props. */
export type WindFieldProps = Customisable<WindFieldOwnProps>

/** Tokens used by default: the background, the calm strokes, the gust. */
const DEFAULT_TOKENS = [
  '--o-theme-bg',
  '--o-theme-muted',
  '--o-palette-emerald-400',
] as const

/** Default fallback: a frozen tint, in the same tones. */
const DEFAULT_FALLBACK = 'o-bg-zinc-50 dark:o-bg-zinc-950'

/**
 * Wind field.
 *
 * @example
 * <div className="o-relative o-min-h-screen">
 *   <WindField className="o-absolute o-inset-0" gusts={1} />
 *   <main className="o-relative">…</main>
 * </div>
 */
export function WindField({
  cells = 22,
  scale = 1.6,
  speed = 1,
  gusts = 0.7,
  colors = DEFAULT_TOKENS,
  fallback = DEFAULT_FALLBACK,
  onReady,
  ...rest
}: WindFieldProps): ReactElement {
  const { ref, setHost, ready, refused, colours } = useTokenShader<HTMLDivElement>({
    fragment: WIND_FIELD_FRAGMENT,
    colors,
    uniforms: { uCells: cells, uScale: scale, uSpeed: speed, uGusts: gusts },
    name: 'wind-field',
    // Nine cells per pixel whatever the setting: it is not the loop that
    // weighs but the thin strokes, which shimmer at a reduced pixel density.
    // At low quality, the cells widen.
    degrade: (quality) => ({
      uCells: quality === 'low' ? Math.min(cells, 14) : cells,
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

/**
 * Data stream: segments scrolling in lanes, each with its own direction
 * and speed, the head raised.
 *
 * ## The principle
 *
 * The screen is cut into independent lanes; each draws its direction, its
 * speed and its start, and numbers slots, each of which carries a segment
 * or nothing. The leading end is raised: that is what gives the direction
 * of travel, without an arrow.
 *
 * What sets this entry apart from `rain` and `code-rain`: the stream is
 * horizontal, running both ways, and made of solid segments; and from
 * `hyperspace`: no perspective, flat lanes.
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

import { DATA_STREAM_FRAGMENT } from './data-stream.shader.js'

/** What the escape hatch receives. */
export interface DataStreamControls {
  /** Colours actually handed to the shader. */
  readonly colours: readonly ShaderColour[]
  /** Reason for the refusal, if there is one. */
  readonly refused: string | undefined
}

/** Properties specific to this component. */
export interface DataStreamOwnProps {
  /** Number of lanes across the height. Capped at eighty by the shader. @defaultValue 24 */
  lanes?: number
  /** Average scrolling speed. @defaultValue 1 */
  speed?: number
  /** Number of slots per unit of width. @defaultValue 6 */
  density?: number
  /** Thickness of the segments, as a fraction of a lane. @defaultValue 0.35 */
  thickness?: number
  /** Tokens whose colours are read. */
  colors?: readonly string[]
  /** Fallback classes. */
  fallback?: string
  /** Escape hatch. */
  onReady?: ReadyCallback<DataStreamControls>
}

/** Every property. */
export type DataStreamProps = Customisable<DataStreamOwnProps>

/** Tokens used by default: the background, the segments, their head. */
const DEFAULT_TOKENS = ['--o-theme-bg', '--o-palette-blue-500', '--o-theme-fg'] as const

/** Default fallback: a frozen hue, in the same tones. */
const DEFAULT_FALLBACK = 'o-bg-zinc-50 dark:o-bg-zinc-950'

/**
 * Data stream.
 *
 * @example
 * <div className="o-relative o-min-h-screen">
 *   <DataStream className="o-absolute o-inset-0" />
 *   <main className="o-relative">…</main>
 * </div>
 */
export function DataStream({
  lanes = 24,
  speed = 1,
  density = 6,
  thickness = 0.35,
  colors = DEFAULT_TOKENS,
  fallback = DEFAULT_FALLBACK,
  onReady,
  ...rest
}: DataStreamProps): ReactElement {
  const { ref, setHost, ready, refused, colours } = useTokenShader<HTMLDivElement>({
    fragment: DATA_STREAM_FRAGMENT,
    colors,
    uniforms: {
      uLanes: lanes,
      uSpeed: speed,
      uDensity: density,
      uThickness: thickness,
    },
    name: 'data-stream',
    // Tight lanes shimmer on their edges at reduced pixel density: at low
    // quality they grow wider.
    degrade: (quality) => ({
      uLanes: quality === 'low' ? Math.min(lanes, 14) : lanes,
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

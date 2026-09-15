/**
 * Radar: a circular sweep, graduations, echoes that decay.
 *
 * ## The principle
 *
 * The difference between the pixel's angle and the time's angle, folded modulo
 * 2pi, gives the age of the last pass: an exponential of that age makes the
 * trail. The rings are the fractional part of the radius, thresholded, and the
 * echoes light up as the beam sweeps past, then decay.
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

import { RADAR_FRAGMENT } from './radar.shader.js'

/** What the escape hatch receives. */
export interface RadarControls {
  /** Colours actually handed to the shader. */
  readonly colours: readonly ShaderColour[]
  /** Reason for the refusal, if there is one. */
  readonly refused: string | undefined
}

/** Props specific to this component. */
export interface RadarOwnProps {
  /** Speed of the sweep's rotation. @defaultValue 0.5 */
  speed?: number
  /** Number of graduation rings. @defaultValue 4 */
  rings?: number
  /** Persistence of the trail and of the echoes. @defaultValue 0.7 */
  fade?: number
  /** Tokens whose colours are read. */
  colors?: readonly string[]
  /** Fallback classes. */
  fallback?: string
  /** Escape hatch. */
  onReady?: ReadyCallback<RadarControls>
}

/** All props. */
export type RadarProps = Customisable<RadarOwnProps>

/** Tokens used by default: the screen, the graduations, the beam. */
const DEFAULT_TOKENS = [
  '--o-theme-bg',
  '--o-palette-green-500',
  '--o-palette-green-200',
] as const

/** Default fallback: a frozen tint, in the same tones. */
const DEFAULT_FALLBACK = 'o-bg-zinc-50 dark:o-bg-zinc-950'

/**
 * Radar.
 *
 * @example
 * <div className="o-relative o-min-h-screen">
 *   <Radar className="o-absolute o-inset-0" />
 *   <main className="o-relative">…</main>
 * </div>
 */
export function Radar({
  speed = 0.5,
  rings = 4,
  fade = 0.7,
  colors = DEFAULT_TOKENS,
  fallback = DEFAULT_FALLBACK,
  onReady,
  ...rest
}: RadarProps): ReactElement {
  const { ref, setHost, ready, refused, colours } = useTokenShader<HTMLDivElement>({
    fragment: RADAR_FRAGMENT,
    colors,
    uniforms: { uSpeed: speed, uRings: rings, uFade: fade, uEchos: 3 },
    name: 'radar',
    // The sweep and the rings are subtractions; it is the echoes — one
    // exponential and one blob each — that weigh, so they are the bounded ones.
    degrade: (quality) => ({
      uEchos: quality === 'low' ? 1 : 3,
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

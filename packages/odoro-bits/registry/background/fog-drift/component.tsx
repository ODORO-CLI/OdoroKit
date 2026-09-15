/**
 * Low fog: two sheets sliding in opposite directions at the bottom of the frame.
 *
 * ## The principle
 *
 * Each sheet is a fractal noise stretched across the width, dense at the
 * bottom and dissolved above a crest the noise draws. The far plane climbs
 * higher, cold and fine; the near one stays low, dense, in the theme's
 * neutral. Their parallax makes the depth. Distinct from smoke, which rises
 * in curls: here the fog spreads and keeps to the ground.
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

import { FOG_DRIFT_FRAGMENT } from './fog-drift.shader.js'

/** What the escape hatch receives. */
export interface FogDriftControls {
  /** Colours actually handed to the shader. */
  readonly colours: readonly ShaderColour[]
  /** Reason for the refusal, if there is one. */
  readonly refused: string | undefined
}

/** Properties specific to this component. */
export interface FogDriftOwnProps {
  /** Sliding speed. @defaultValue 0.5 */
  speed?: number
  /** Height of the fog, as a fraction of the frame. @defaultValue 0.45 */
  height?: number
  /** Maximum opacity of the sheets. @defaultValue 0.8 */
  density?: number
  /** Tokens whose colours are read. */
  colors?: readonly string[]
  /** Fallback classes. */
  fallback?: string
  /** Escape hatch. */
  onReady?: ReadyCallback<FogDriftControls>
}

/** Every property. */
export type FogDriftProps = Customisable<FogDriftOwnProps>

/**
 * Tokens used by default: the background, the near sheet, the far sheet.
 *
 * The theme's neutral makes the near sheet: it greys a light background and
 * lightens a dark one, which is exactly what a fog does.
 */
const DEFAULT_TOKENS = ['--o-theme-bg', '--o-theme-muted', '--o-palette-sky-300'] as const

/** Default fallback: a frozen gradient, in the same tones. */
const DEFAULT_FALLBACK =
  'o-bg-gradient-to-t o-from-zinc-200 dark:o-from-zinc-800 o-to-zinc-50 dark:o-to-zinc-950'

/**
 * Noise detail outside low quality.
 *
 * Two sheets, one sum of octaves each: every octave is paid for twice. It
 * is the shader's only lever on cost.
 */
const OCTAVES = 4

/** Noise detail at low quality. */
const LOW_OCTAVES = 2

/**
 * Low fog.
 *
 * @example
 * <div className="o-relative o-min-h-screen">
 *   <FogDrift className="o-absolute o-inset-0" />
 *   <main className="o-relative">…</main>
 * </div>
 */
export function FogDrift({
  speed = 0.5,
  height = 0.45,
  density = 0.8,
  colors = DEFAULT_TOKENS,
  fallback = DEFAULT_FALLBACK,
  onReady,
  ...rest
}: FogDriftProps): ReactElement {
  const { ref, setHost, ready, refused, colours } = useTokenShader<HTMLDivElement>({
    fragment: FOG_DRIFT_FRAGMENT,
    colors,
    uniforms: { uSpeed: speed, uHeight: height, uDensity: density, uOctaves: OCTAVES },
    name: 'fog-drift',
    degrade: (quality) => ({
      uOctaves: quality === 'low' ? LOW_OCTAVES : OCTAVES,
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

/**
 * Snow: three layers of flakes falling in parallax.
 *
 * ## The principle
 *
 * One flake per hashed cell, as a halo exponential in the distance. The fall is
 * a vertical translation of the grid — the near layers fall faster and bigger —
 * and every flake sways on a sine with a hashed phase: two neighbours never
 * drift in unison.
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

import { SNOW_FRAGMENT } from './snow.shader.js'

/** What the escape hatch receives. */
export interface SnowControls {
  /** Colours actually handed to the shader. */
  readonly colours: readonly ShaderColour[]
  /** Reason for the refusal, if there is one. */
  readonly refused: string | undefined
}

/** Props specific to this component. */
export interface SnowOwnProps {
  /** Speed of the fall. @defaultValue 0.5 */
  speed?: number
  /** Number of cells across the shorter side. @defaultValue 12 */
  density?: number
  /** Amplitude of the sideways sway. @defaultValue 0.3 */
  drift?: number
  /** Tokens whose colours are read. */
  colors?: readonly string[]
  /** Fallback classes. */
  fallback?: string
  /** Escape hatch. */
  onReady?: ReadyCallback<SnowControls>
}

/** All props. */
export type SnowProps = Customisable<SnowOwnProps>

/** Tokens used by default: the winter night, the distant flakes, the near ones. */
const DEFAULT_TOKENS = ['--o-theme-bg', '--o-palette-sky-300', '--o-theme-fg'] as const

/** Default fallback: a frozen tint, in the same tones. */
const DEFAULT_FALLBACK = 'o-bg-zinc-50 dark:o-bg-slate-950'

/**
 * Snow.
 *
 * @example
 * <div className="o-relative o-min-h-screen">
 *   <Snow className="o-absolute o-inset-0" />
 *   <main className="o-relative">…</main>
 * </div>
 */
export function Snow({
  speed = 0.5,
  density = 12,
  drift = 0.3,
  colors = DEFAULT_TOKENS,
  fallback = DEFAULT_FALLBACK,
  onReady,
  ...rest
}: SnowProps): ReactElement {
  const { ref, setHost, ready, refused, colours } = useTokenShader<HTMLDivElement>({
    fragment: SNOW_FRAGMENT,
    colors,
    uniforms: { uSpeed: speed, uDensity: density, uDrift: drift },
    name: 'snow',
    // Three layers of nine cells each: a wider cell makes fewer overlapping
    // halos, it is the setting that weighs, hence the one that is bounded.
    degrade: (quality) => ({
      uDensity: quality === 'low' ? Math.min(density, 8) : density,
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

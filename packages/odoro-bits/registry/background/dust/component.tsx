/**
 * Dust: motes in suspension, visible inside a slanted shaft of light.
 *
 * ## The principle
 *
 * A shaft is a soft band around an oblique line, which widens and weakens as
 * it moves away from its source. The motes drift along an approximated
 * Brownian walk — sines, no state — and are only visible inside the shaft:
 * their light is that of the beam at their position.
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

import { DUST_FRAGMENT } from './dust.shader.js'

/** What the escape hatch receives. */
export interface DustControls {
  /** Colours actually handed to the shader. */
  readonly colours: readonly ShaderColour[]
  /** Reason for the refusal, if there is one. */
  readonly refused: string | undefined
}

/** Properties specific to this component. */
export interface DustOwnProps {
  /** Drift speed of the motes. @defaultValue 0.3 */
  speed?: number
  /** Density of the scatter. @defaultValue 12 */
  density?: number
  /** Tilt of the shaft, in degrees. @defaultValue -55 */
  angle?: number
  /** Half-width of the shaft, in frame heights. @defaultValue 0.22 */
  width?: number
  /** Tokens whose colours are read. */
  colors?: readonly string[]
  /** Fallback classes. */
  fallback?: string
  /** Escape hatch. */
  onReady?: ReadyCallback<DustControls>
}

/** Every property. */
export type DustProps = Customisable<DustOwnProps>

/** Tokens used by default: the shadow, the shaft, the motes. */
const DEFAULT_TOKENS = [
  '--o-theme-bg',
  '--o-palette-amber-300',
  '--o-palette-amber-100',
] as const

/** Default fallback: the frozen shaft, in the same tones. */
const DEFAULT_FALLBACK =
  'o-bg-gradient-to-br o-from-zinc-50 dark:o-from-zinc-950 o-via-amber-100 dark:o-via-amber-950 o-to-zinc-50 dark:o-to-zinc-950'

/**
 * Layers outside low quality.
 *
 * Every layer walks nine cells per fragment, with one read of the shaft per
 * cell: it is the shader's only cost lever.
 */
const LAYERS = 3

/** Layers at low quality. */
const LOW_LAYERS = 2

/**
 * Dust.
 *
 * @example
 * <div className="o-relative o-min-h-screen">
 *   <Dust className="o-absolute o-inset-0" />
 *   <main className="o-relative">…</main>
 * </div>
 */
export function Dust({
  speed = 0.3,
  density = 12,
  angle = -55,
  width = 0.22,
  colors = DEFAULT_TOKENS,
  fallback = DEFAULT_FALLBACK,
  onReady,
  ...rest
}: DustProps): ReactElement {
  const { ref, setHost, ready, refused, colours } = useTokenShader<HTMLDivElement>({
    fragment: DUST_FRAGMENT,
    colors,
    uniforms: {
      uSpeed: speed,
      uDensity: density,
      uAngle: angle,
      uWidth: width,
      uLayers: LAYERS,
    },
    name: 'dust',
    degrade: (quality) => ({ uLayers: quality === 'low' ? LOW_LAYERS : LAYERS }),
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

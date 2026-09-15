/**
 * Neon grid: a gridded ground receding towards the horizon, under a striped sun.
 *
 * ## The principle
 *
 * The ground is projected by setting the depth equal to the inverse of the
 * distance to the horizon; an offset of the domain makes it scroll towards the
 * viewer. Above it, a disc cut by horizontal bands that slide, and a neon
 * horizon line. Distinct from the flat grid and from the radial tunnel: here
 * the grid converges towards a vanishing point.
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

import { NEON_GRID_FRAGMENT } from './neon-grid.shader.js'

/** What the escape hatch receives. */
export interface NeonGridControls {
  /** Colours actually handed to the shader. */
  readonly colours: readonly ShaderColour[]
  /** Reason for the refusal, if there is one. */
  readonly refused: string | undefined
}

/** Props specific to this component. */
export interface NeonGridOwnProps {
  /** Speed at which the ground scrolls. @defaultValue 1 */
  speed?: number
  /** Height of the horizon, as a fraction of the frame. @defaultValue 0.5 */
  horizon?: number
  /** Number of visible depth lines. @defaultValue 8 */
  density?: number
  /** Reach of the halo of the strokes, in ground cells. @defaultValue 0.06 */
  glow?: number
  /** Tokens whose colours are read. */
  colors?: readonly string[]
  /** Fallback classes. */
  fallback?: string
  /** Escape hatch. */
  onReady?: ReadyCallback<NeonGridControls>
}

/** All props. */
export type NeonGridProps = Customisable<NeonGridOwnProps>

/** Tokens used by default: the background, the neon, the sun. */
const DEFAULT_TOKENS = [
  '--o-theme-bg',
  '--o-palette-fuchsia-500',
  '--o-palette-amber-400',
] as const

/** Default fallback: a frozen gradient, in the same tones. */
const DEFAULT_FALLBACK =
  'o-bg-gradient-to-t o-from-fuchsia-100 dark:o-from-fuchsia-950 o-to-zinc-50 dark:o-to-zinc-950'

/**
 * Neon grid.
 *
 * @example
 * <div className="o-relative o-min-h-screen">
 *   <NeonGrid className="o-absolute o-inset-0" />
 *   <main className="o-relative">…</main>
 * </div>
 */
export function NeonGrid({
  speed = 1,
  horizon = 0.5,
  density = 8,
  glow = 0.06,
  colors = DEFAULT_TOKENS,
  fallback = DEFAULT_FALLBACK,
  onReady,
  ...rest
}: NeonGridProps): ReactElement {
  const { ref, setHost, ready, refused, colours } = useTokenShader<HTMLDivElement>({
    fragment: NEON_GRID_FRAGMENT,
    colors,
    uniforms: { uSpeed: speed, uHorizon: horizon, uDensity: density, uGlow: glow },
    name: 'neon-grid',
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

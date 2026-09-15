/**
 * Fireflies: points blinking each at its own phase, in a soft halo.
 *
 * ## The principle
 *
 * One firefly per cell of a grid, its position drawn from the cell's hash; the blinking is a sine of its own phase, never a draw per frame.
 *
 * The halo is an exponential of the distance, summed over the nine neighbouring cells so as to cross the mesh edges.
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

import { FIREFLIES_FRAGMENT } from './fireflies.shader.js'

/** What the escape hatch receives. */
export interface FirefliesControls {
  /** Colours actually handed to the shader. */
  readonly colours: readonly ShaderColour[]
  /** Reason for the refusal, if there is one. */
  readonly refused: string | undefined
}

/** Properties specific to this component. */
export interface FirefliesOwnProps {
  /** Rate of the blinking and of the drift. @defaultValue 0.8 */
  speed?: number
  /** Number of cells across the shorter side. @defaultValue 16 */
  density?: number
  /** Reach of the halo. @defaultValue 0.6 */
  glow?: number
  /** Tokens whose colours are read. */
  colors?: readonly string[]
  /** Fallback classes. */
  fallback?: string
  /** Escape hatch. */
  onReady?: ReadyCallback<FirefliesControls>
}

/** Every property. */
export type FirefliesProps = Customisable<FirefliesOwnProps>

/** Tokens used by default: the night, then the two firefly hues. */
const DEFAULT_TOKENS = [
  '--o-theme-bg',
  '--o-palette-amber-300',
  '--o-palette-lime-300',
] as const

/** Default fallback: a frozen hue, in the same tones. */
const DEFAULT_FALLBACK = 'o-bg-zinc-50 dark:o-bg-zinc-950'

/**
 * Fireflies.
 *
 * @example
 * <div className="o-relative o-min-h-screen">
 *   <Fireflies className="o-absolute o-inset-0" />
 *   <main className="o-relative">…</main>
 * </div>
 */
export function Fireflies({
  speed = 0.8,
  density = 16,
  glow = 0.6,
  colors = DEFAULT_TOKENS,
  fallback = DEFAULT_FALLBACK,
  onReady,
  ...rest
}: FirefliesProps): ReactElement {
  const { ref, setHost, ready, refused, colours } = useTokenShader<HTMLDivElement>({
    fragment: FIREFLIES_FRAGMENT,
    colors,
    uniforms: { uSpeed: speed, uDensity: density, uGlow: glow },
    name: 'fireflies',
    // A wider mesh puts fewer fireflies on screen, hence fewer overlapping
    // halos: it is the setting that weighs, so it is the one that is capped.
    degrade: (quality) => ({
      uDensity: quality === 'low' ? Math.min(density, 10) : density,
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

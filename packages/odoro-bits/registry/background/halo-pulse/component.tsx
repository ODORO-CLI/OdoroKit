/**
 * Pulsing halo: a core that breathes and rings emitted at a slow rhythm.
 *
 * ## The principle
 *
 * Gaussian rings whose radius grows with their phase, spread evenly over the
 * period for a steady emission; they widen and pale as they move away. The
 * core swells at every emission. Distinct from the sonar, with its steep
 * fronts and its pointer: here everything is soft and unhurried.
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

import { HALO_PULSE_FRAGMENT } from './halo-pulse.shader.js'

/** What the escape hatch receives. */
export interface HaloPulseControls {
  /** Colours actually handed to the shader. */
  readonly colours: readonly ShaderColour[]
  /** Reason for the refusal, if there is one. */
  readonly refused: string | undefined
}

/** Properties specific to this component. */
export interface HaloPulseOwnProps {
  /** Period of the rhythm, in milliseconds. @defaultValue 4000 */
  period?: number
  /** Number of rings in flight. @defaultValue 3 */
  rings?: number
  /** Reach of the rings, in frame heights. @defaultValue 0.8 */
  size?: number
  /** Horizontal position of the centre, as a fraction of the frame. @defaultValue 0.5 */
  x?: number
  /** Vertical position of the centre, as a fraction of the frame. @defaultValue 0.5 */
  y?: number
  /** Tokens whose colours are read. */
  colors?: readonly string[]
  /** Fallback classes. */
  fallback?: string
  /** Escape hatch. */
  onReady?: ReadyCallback<HaloPulseControls>
}

/** Every property. */
export type HaloPulseProps = Customisable<HaloPulseOwnProps>

/** Tokens used by default: the background, the rings, the core. */
const DEFAULT_TOKENS = [
  '--o-theme-bg',
  '--o-palette-teal-400',
  '--o-palette-brand-500',
] as const

/** Default fallback: a frozen gradient, in the same tones. */
const DEFAULT_FALLBACK =
  'o-bg-gradient-to-br o-from-zinc-50 dark:o-from-zinc-950 o-to-teal-100 dark:o-to-teal-950'

/**
 * Pulsing halo.
 *
 * @example
 * <div className="o-relative o-min-h-screen">
 *   <HaloPulse className="o-absolute o-inset-0" />
 *   <main className="o-relative">…</main>
 * </div>
 */
export function HaloPulse({
  period = 4000,
  rings = 3,
  size = 0.8,
  x = 0.5,
  y = 0.5,
  colors = DEFAULT_TOKENS,
  fallback = DEFAULT_FALLBACK,
  onReady,
  ...rest
}: HaloPulseProps): ReactElement {
  const { ref, setHost, ready, refused, colours } = useTokenShader<HTMLDivElement>({
    fragment: HALO_PULSE_FRAGMENT,
    colors,
    // The registry speaks in milliseconds, the shader in seconds.
    uniforms: { uPeriod: period / 1000, uRings: rings, uSize: size, uX: x, uY: y },
    name: 'halo-pulse',
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

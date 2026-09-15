/**
 * Flow field: particles that follow a field of noise, with their
 * trail.
 *
 * ## The principle
 *
 * A divergence-free field, drawn from the gradient of a noise turned by a
 * quarter turn, and particles that follow it. Nothing is simulated or
 * stored: each fragment walks back up the field over a bounded number of
 * steps, and lights up if it meets the trace of a live particle upstream.
 * The head is one colour, the tail another, and the field drifts slowly.
 *
 * What sets this entry apart from `currents`: that one warps a continuous
 * sheet; here they are discrete particles, which are born, run and fade
 * out.
 *
 * ## What this component delegates
 *
 * It carries only what sets it apart: its shader, its settings and its fallback.
 * Reading the tokens, converting them to floats and re-reading them when the
 * theme changes all come from the engine.
 *
 * The fallback is shown while the backend loads, when WebGL is missing,
 * when the arbiter refuses the surface and under reduced motion.
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

import { FLOW_FIELD_FRAGMENT } from './flow-field.shader.js'

/** What the escape hatch receives. */
export interface FlowFieldControls {
  /** Colours actually handed to the shader. */
  readonly colours: readonly ShaderColour[]
  /** Reason for the refusal, if there is one. */
  readonly refused: string | undefined
}

/** Properties specific to this component. */
export interface FlowFieldOwnProps {
  /** Frequency of the noise, hence the size of the eddies. @defaultValue 2.5 */
  scale?: number
  /** Speed of the particles. @defaultValue 1 */
  speed?: number
  /** Share of the cells that carry a particle. @defaultValue 0.25 */
  density?: number
  /** Length of the tail, in steps. @defaultValue 8 */
  trail?: number
  /** Tokens whose colours are read. */
  colors?: readonly string[]
  /** Fallback classes. */
  fallback?: string
  /** Escape hatch. */
  onReady?: ReadyCallback<FlowFieldControls>
}

/** Every property. */
export type FlowFieldProps = Customisable<FlowFieldOwnProps>

/** Tokens used by default: the background, the trail, the head. */
const DEFAULT_TOKENS = [
  '--o-theme-bg',
  '--o-palette-sky-400',
  '--o-palette-amber-300',
] as const

/** Default fallback: a frozen hue, in the same tones. */
const DEFAULT_FALLBACK = 'o-bg-zinc-50 dark:o-bg-zinc-950'

/** Steps walked back per fragment: a particle's reach. */
const STEPS = 24

/** Steps walked back at low quality. */
const LOW_STEPS = 10

/**
 * Flow field.
 *
 * @example
 * <div className="o-relative o-min-h-screen">
 *   <FlowField className="o-absolute o-inset-0" />
 *   <main className="o-relative">…</main>
 * </div>
 */
export function FlowField({
  scale = 2.5,
  speed = 1,
  density = 0.25,
  trail = 8,
  colors = DEFAULT_TOKENS,
  fallback = DEFAULT_FALLBACK,
  onReady,
  ...rest
}: FlowFieldProps): ReactElement {
  const { ref, setHost, ready, refused, colours } = useTokenShader<HTMLDivElement>({
    fragment: FLOW_FIELD_FRAGMENT,
    colors,
    uniforms: {
      uScale: scale,
      uSpeed: speed,
      uDensity: density,
      uTrail: trail,
      uSteps: STEPS,
    },
    name: 'flow-field',
    // Each step walked back costs three noise lookups per pixel: it is the
    // setting that weighs, so it is the one that is capped. The particles
    // become shorter, not fewer.
    degrade: (quality) => ({
      uSteps: quality === 'low' ? LOW_STEPS : STEPS,
      uTrail: quality === 'low' ? Math.min(trail, 5) : trail,
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

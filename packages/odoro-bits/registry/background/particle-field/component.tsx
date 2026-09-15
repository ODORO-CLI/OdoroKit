/**
 * Field of particles: a scatter that drifts slowly, lit as the pointer goes
 * past.
 *
 * ## What this background reacts to
 *
 * To pointer movement, with damping: the particles it covers light up and
 * take on the sparkle hue, then die away as it moves off. On leaving the
 * frame, the hook brings the target back to the centre. The field itself
 * drifts continuously, pointer or no pointer.
 *
 * ## The pointer -> shader bridge
 *
 * No React render per frame: a stable array of two floats is mutated in place
 * in the engine loop, at input priority, and the surface re-reads it every
 * frame.
 *
 * ## Under reduced motion
 *
 * The surface is refused by the engine and the static fallback is shown.
 *
 * @module
 */

import {
  CLOCK_PRIORITY,
  clock,
  mergePresentation,
  useOnReady,
  useTokenShader,
  type Customisable,
  type ReadyCallback,
  type ShaderColour,
} from '@odoro-cli/engine'
import { useEffect, useRef, useState, type ReactElement } from 'react'

import { usePointerDamped } from '@registre/hooks/usePointerDamped'

import { PARTICLE_FIELD_FRAGMENT } from './particle-field.shader.js'

/** What the escape hatch receives. */
export interface ParticleFieldControls {
  /** Colours actually handed to the shader. */
  readonly colours: readonly ShaderColour[]
  /** Reason for the refusal, if there is one. */
  readonly refused: string | undefined
}

/** Props specific to this component. */
export interface ParticleFieldOwnProps {
  /** Speed of the drift. @defaultValue 0.4 */
  speed?: number
  /** Density of the scatter. @defaultValue 10 */
  density?: number
  /** Radius of the sparkle around the pointer, in frame heights. @defaultValue 0.22 */
  radius?: number
  /** Tokens whose colours are read. */
  colors?: readonly string[]
  /** Fallback classes. */
  fallback?: string
  /** Escape hatch. */
  onReady?: ReadyCallback<ParticleFieldControls>
}

/** All props. */
export type ParticleFieldProps = Customisable<ParticleFieldOwnProps>

/** Tokens used by default: the background, the particles at rest, the sparkle. */
const DEFAULT_TOKENS = [
  '--o-theme-bg',
  '--o-theme-muted',
  '--o-palette-brand-500',
] as const

/** Default fallback: a frozen tint, in the same tones. */
const DEFAULT_FALLBACK = 'o-bg-zinc-50 dark:o-bg-zinc-950'

/**
 * Layers outside low quality.
 *
 * Every layer walks nine cells per fragment: it is the only cost lever the
 * shader has, and the far layer is the one that shows the least.
 */
const LAYERS = 2

/** Layers at low quality. */
const LOW_LAYERS = 1

/**
 * Field of particles.
 *
 * @example
 * <div className="o-relative o-min-h-screen">
 *   <ParticleField className="o-absolute o-inset-0" />
 *   <main className="o-relative">…</main>
 * </div>
 */
export function ParticleField({
  speed = 0.4,
  density = 10,
  radius = 0.22,
  colors = DEFAULT_TOKENS,
  fallback = DEFAULT_FALLBACK,
  onReady,
  ...rest
}: ParticleFieldProps): ReactElement {
  const [host, setHost] = useState<HTMLDivElement | null>(null)

  // Stable array, mutated in place: the surface re-reads the uniforms every
  // frame, the identity does not change, the mutation is enough — no setState.
  const uPointer = useRef<number[]>([0.5, 0.5]).current

  const pointer = usePointerDamped({ host, speed: 4, name: 'champ : pointer' })

  useEffect(() => {
    const subscription = clock.subscribe(
      () => {
        // From the hook's frame (centred, y downwards) to the texture's
        // (bottom-left corner, y upwards).
        uPointer[0] = (pointer.current.x + 1) / 2
        uPointer[1] = 1 - (pointer.current.y + 1) / 2
      },
      { priority: CLOCK_PRIORITY.input, name: 'champ : bridge' },
    )
    return () => subscription.unsubscribe()
  }, [pointer, uPointer])

  const {
    ref,
    setHost: setShaderHost,
    ready,
    refused,
    colours,
  } = useTokenShader<HTMLDivElement>({
    fragment: PARTICLE_FIELD_FRAGMENT,
    colors,
    uniforms: {
      uPointer,
      uSpeed: speed,
      uDensity: density,
      uRadius: radius,
      uLayers: LAYERS,
    },
    name: 'particle-field',
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
        setShaderHost(element)
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

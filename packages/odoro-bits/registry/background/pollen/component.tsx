/**
 * Pollen: slow grains on two planes, depth blur and parallax under the
 * pointer.
 *
 * ## What this background reacts to
 *
 * To pointer movement, with damping: the two planes shift against its motion,
 * the near one more than the far one. It is the parallax that makes the eye
 * read two distances rather than two sizes. On leaving the frame, the hook
 * brings the target back to the centre.
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

import { POLLEN_FRAGMENT } from './pollen.shader.js'

/** What the escape hatch receives. */
export interface PollenControls {
  /** Colours actually handed to the shader. */
  readonly colours: readonly ShaderColour[]
  /** Reason for the refusal, if there is one. */
  readonly refused: string | undefined
}

/** Props specific to this component. */
export interface PollenOwnProps {
  /** Speed of the drift. @defaultValue 0.35 */
  speed?: number
  /** Density of the far plane. @defaultValue 11 */
  density?: number
  /** Blur of the near plane. @defaultValue 0.6 */
  blur?: number
  /** Amplitude of the parallax under the pointer. @defaultValue 1 */
  parallax?: number
  /** Tokens whose colours are read. */
  colors?: readonly string[]
  /** Fallback classes. */
  fallback?: string
  /** Escape hatch. */
  onReady?: ReadyCallback<PollenControls>
}

/** All props. */
export type PollenProps = Customisable<PollenOwnProps>

/** Tokens used by default: the background, the far grains, the near ones. */
const DEFAULT_TOKENS = [
  '--o-theme-bg',
  '--o-palette-lime-400',
  '--o-palette-amber-300',
] as const

/** Default fallback: a frozen tint, in the same tones. */
const DEFAULT_FALLBACK =
  'o-bg-gradient-to-br o-from-zinc-50 dark:o-from-zinc-950 o-to-lime-200 dark:o-to-lime-950'

/**
 * Radius in cells walked outside low quality.
 *
 * A radius of one reads nine cells per plane; a radius of zero reads only
 * one, and a grain no longer spills out of its cell. It is the only cost
 * lever the shader has, and it shows only at the edges of the near grains.
 */
const SPREAD = 1

/** Radius in cells at low quality. */
const LOW_SPREAD = 0

/**
 * Pollen.
 *
 * @example
 * <div className="o-relative o-min-h-screen">
 *   <Pollen className="o-absolute o-inset-0" />
 *   <main className="o-relative">…</main>
 * </div>
 */
export function Pollen({
  speed = 0.35,
  density = 11,
  blur = 0.6,
  parallax = 1,
  colors = DEFAULT_TOKENS,
  fallback = DEFAULT_FALLBACK,
  onReady,
  ...rest
}: PollenProps): ReactElement {
  const [host, setHost] = useState<HTMLDivElement | null>(null)

  // Stable array, mutated in place: the surface re-reads the uniforms every
  // frame, the identity does not change, the mutation is enough — no setState.
  const uPointer = useRef<number[]>([0, 0]).current

  const pointer = usePointerDamped({ host, speed: 2.5, name: 'pollen : pointer' })

  useEffect(() => {
    const subscription = clock.subscribe(
      () => {
        // The hook's frame is centred, y downwards; the shader works centred
        // too, but with y upwards.
        uPointer[0] = pointer.current.x
        uPointer[1] = -pointer.current.y
      },
      { priority: CLOCK_PRIORITY.input, name: 'pollen : bridge' },
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
    fragment: POLLEN_FRAGMENT,
    colors,
    uniforms: {
      uPointer,
      uSpeed: speed,
      uDensity: density,
      uBlur: blur,
      uParallax: parallax,
      uSpread: SPREAD,
    },
    name: 'pollen',
    degrade: (quality) => ({ uSpread: quality === 'low' ? LOW_SPREAD : SPREAD }),
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

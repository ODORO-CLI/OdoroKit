/**
 * Parallax veils: three sheets of noise that slide with the cursor.
 *
 * ## What this background reacts to
 *
 * Pointer movement, damped: every veil slides by a different factor — the
 * finest one moves the most — and it is that gap which makes the depth
 * readable. With no pointer, a slow automatic drift keeps the veils alive:
 * the background is never dead.
 *
 * ## The pointer → shader bridge
 *
 * No React render per frame: the damped position is copied into a stable
 * array by a subscription to the engine clock, and the surface re-reads its
 * uniforms every frame — the mutation is enough.
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

import { VEIL_PARALLAX_FRAGMENT } from './veil-parallax.shader.js'

/** What the escape hatch receives. */
export interface VeilParallaxControls {
  /** Colours actually handed to the shader. */
  readonly colours: readonly ShaderColour[]
  /** Reason for the refusal, if there is one. */
  readonly refused: string | undefined
}

/** Props specific to this component. */
export interface VeilParallaxOwnProps {
  /** Amplitude of the parallax. @defaultValue 0.25 */
  depth?: number
  /** Speed of the automatic drift. @defaultValue 0.08 */
  speed?: number
  /** Scale of the noise. The higher, the finer. @defaultValue 2.5 */
  scale?: number
  /** Tokens whose colours are read. */
  colors?: readonly string[]
  /** Fallback classes. */
  fallback?: string
  /** Escape hatch. */
  onReady?: ReadyCallback<VeilParallaxControls>
}

/** All props. */
export type VeilParallaxProps = Customisable<VeilParallaxOwnProps>

/** Tokens used by default: the background, the veils, the surface. */
const DEFAULT_TOKENS = [
  '--o-theme-bg',
  '--o-palette-purple-400',
  '--o-palette-pink-300',
] as const

/** Default fallback: a frozen gradient, in the same tones. */
const DEFAULT_FALLBACK =
  'o-bg-gradient-to-b o-from-zinc-50 dark:o-from-stone-950 o-to-purple-950'

/**
 * Parallax veils.
 *
 * @example
 * <div className="o-relative o-min-h-screen">
 *   <VeilParallax className="o-absolute o-inset-0" />
 *   <main className="o-relative">…</main>
 * </div>
 */
export function VeilParallax({
  depth = 0.25,
  speed = 0.08,
  scale = 2.5,
  colors = DEFAULT_TOKENS,
  fallback = DEFAULT_FALLBACK,
  onReady,
  ...rest
}: VeilParallaxProps): ReactElement {
  const [host, setHost] = useState<HTMLDivElement | null>(null)

  // Stable array, mutated in place in the loop: no setState per frame.
  const uPointer = useRef<number[]>([0.5, 0.5]).current

  // Gentle damping: a dry parallax would bring on seasickness.
  const pointer = usePointerDamped({ host, speed: 2, name: 'veil-parallax : pointer' })

  useEffect(() => {
    const subscription = clock.subscribe(
      () => {
        // From the hook's frame of reference (centred, y downwards) to the
        // texture's.
        uPointer[0] = (pointer.current.x + 1) / 2
        uPointer[1] = 1 - (pointer.current.y + 1) / 2
      },
      { priority: CLOCK_PRIORITY.input, name: 'veil-parallax : bridge' },
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
    fragment: VEIL_PARALLAX_FRAGMENT,
    colors,
    uniforms: { uPointer, uDepth: depth, uSpeed: speed, uScale: scale },
    name: 'veil-parallax',
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

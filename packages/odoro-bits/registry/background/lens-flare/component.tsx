/**
 * Lens flare: a source, its streak and its ghosts following the
 * pointer.
 *
 * ## What this background reacts to
 *
 * To the pointer moving, with damping: the source catches up with it
 * gently, and the chain of ghosts reorders itself along the axis joining the
 * source to the centre of the frame. On leaving the frame, the hook brings
 * the target back to the centre — the flare recentres itself there.
 *
 * ## The pointer -> shader bridge
 *
 * No React render per frame: a stable array of two floats is mutated in
 * place inside the engine loop, at input priority, and the surface reads it
 * again every frame.
 *
 * ## Under reduced motion
 *
 * The surface is refused by the engine and the static fallback shows: the
 * pointer tracking is a nicety, not content.
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

import { LENS_FLARE_FRAGMENT } from './lens-flare.shader.js'

/** What the escape hatch receives. */
export interface LensFlareControls {
  /** Colours actually handed to the shader. */
  readonly colours: readonly ShaderColour[]
  /** Reason for the refusal, if there is one. */
  readonly refused: string | undefined
}

/** Properties specific to this component. */
export interface LensFlareOwnProps {
  /** Overall intensity of the flare. @defaultValue 1 */
  intensity?: number
  /** Number of ghosts along the axis. @defaultValue 4 */
  ghosts?: number
  /** Length of the anamorphic streak, in frame heights. @defaultValue 0.5 */
  streak?: number
  /** Tokens whose colours are read. */
  colors?: readonly string[]
  /** Fallback classes. */
  fallback?: string
  /** Escape hatch. */
  onReady?: ReadyCallback<LensFlareControls>
}

/** Every property. */
export type LensFlareProps = Customisable<LensFlareOwnProps>

/** Tokens used by default: the background, the warm hue, the cool hue. */
const DEFAULT_TOKENS = [
  '--o-theme-bg',
  '--o-palette-amber-400',
  '--o-palette-sky-400',
] as const

/** Default fallback: a frozen gradient, in the same tones. */
const DEFAULT_FALLBACK =
  'o-bg-gradient-to-br o-from-amber-100 dark:o-from-amber-900 o-to-zinc-50 dark:o-to-zinc-950'

/**
 * Lens flare.
 *
 * @example
 * <div className="o-relative o-min-h-screen">
 *   <LensFlare className="o-absolute o-inset-0" />
 *   <main className="o-relative">…</main>
 * </div>
 */
export function LensFlare({
  intensity = 1,
  ghosts = 4,
  streak = 0.5,
  colors = DEFAULT_TOKENS,
  fallback = DEFAULT_FALLBACK,
  onReady,
  ...rest
}: LensFlareProps): ReactElement {
  const [host, setHost] = useState<HTMLDivElement | null>(null)

  // Stable array, mutated in place: the surface re-reads the uniforms every
  // frame, the identity never changes, mutating is enough — no setState.
  const uPointer = useRef<number[]>([0.5, 0.5]).current

  // A slower catch-up than the torch: a lens flare is heavy, it slides
  // behind the cursor instead of sticking to it.
  const pointer = usePointerDamped({ host, speed: 2.5, name: 'sheen : pointer' })

  useEffect(() => {
    const subscription = clock.subscribe(
      () => {
        // From the hook's frame (centred, y downwards) to the texture's frame
        // (bottom-left corner, y upwards).
        uPointer[0] = (pointer.current.x + 1) / 2
        uPointer[1] = 1 - (pointer.current.y + 1) / 2
      },
      { priority: CLOCK_PRIORITY.input, name: 'sheen : bridge' },
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
    fragment: LENS_FLARE_FRAGMENT,
    colors,
    uniforms: { uPointer, uIntensity: intensity, uGhosts: ghosts, uStreak: streak },
    name: 'lens-flare',
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

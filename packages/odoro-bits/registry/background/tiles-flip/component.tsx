/**
 * Flipping tiles: waves of flipping around the pointer.
 *
 * ## What this background reacts to
 *
 * To the movement of the pointer, with damping: the nearby tiles flip in
 * concentric waves and reveal their back face; the ones it leaves fall back
 * flat. On leaving the frame, the hook brings the target back to the centre,
 * and the waves carry on gently there.
 *
 * ## The pointer -> shader bridge
 *
 * No React render per frame: a stable array of two floats is mutated in place
 * inside the engine loop, at input priority, and the surface re-reads it every
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

import { TILES_FLIP_FRAGMENT } from './tiles-flip.shader.js'

/** What the escape hatch receives. */
export interface TilesFlipControls {
  /** Colours actually handed to the shader. */
  readonly colours: readonly ShaderColour[]
  /** Reason for the refusal, if there is one. */
  readonly refused: string | undefined
}

/** Props specific to this component. */
export interface TilesFlipOwnProps {
  /** Speed at which the waves travel. @defaultValue 1 */
  speed?: number
  /** Number of tiles over the height. @defaultValue 12 */
  density?: number
  /** Reach of the waves around the pointer, in frame heights. @defaultValue 0.4 */
  radius?: number
  /** Tokens whose colours are read. */
  colors?: readonly string[]
  /** Fallback classes. */
  fallback?: string
  /** Escape hatch. */
  onReady?: ReadyCallback<TilesFlipControls>
}

/** All props. */
export type TilesFlipProps = Customisable<TilesFlipOwnProps>

/** Tokens used by default: the background, the front face, the back face. */
const DEFAULT_TOKENS = [
  '--o-theme-bg',
  '--o-palette-brand-500',
  '--o-palette-teal-400',
] as const

/** Default fallback: a frozen tint, in the same tones. */
const DEFAULT_FALLBACK = 'o-bg-zinc-50 dark:o-bg-zinc-950'

/**
 * Flipping tiles.
 *
 * @example
 * <div className="o-relative o-min-h-screen">
 *   <TilesFlip className="o-absolute o-inset-0" />
 *   <main className="o-relative">…</main>
 * </div>
 */
export function TilesFlip({
  speed = 1,
  density = 12,
  radius = 0.4,
  colors = DEFAULT_TOKENS,
  fallback = DEFAULT_FALLBACK,
  onReady,
  ...rest
}: TilesFlipProps): ReactElement {
  const [host, setHost] = useState<HTMLDivElement | null>(null)

  // Stable array, mutated in place: the surface re-reads the uniforms every
  // frame, the identity never changes, mutating is enough — no setState.
  const uPointer = useRef<number[]>([0.5, 0.5]).current

  const pointer = usePointerDamped({ host, speed: 3, name: 'tiles : pointer' })

  useEffect(() => {
    const subscription = clock.subscribe(
      () => {
        // From the hook's frame (centred, y downwards) to the texture's frame
        // (bottom-left corner, y upwards).
        uPointer[0] = (pointer.current.x + 1) / 2
        uPointer[1] = 1 - (pointer.current.y + 1) / 2
      },
      { priority: CLOCK_PRIORITY.input, name: 'tiles : bridge' },
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
    fragment: TILES_FLIP_FRAGMENT,
    colors,
    uniforms: { uPointer, uSpeed: speed, uDensity: density, uRadius: radius },
    name: 'tiles-flip',
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

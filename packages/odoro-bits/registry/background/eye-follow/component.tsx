/**
 * Eyes that follow: a grid of line-drawn eyes whose irises turn towards the
 * cursor and which blink each at its own pace.
 *
 * ## What this background reacts to
 *
 * To the pointer's movement, with damping: every eye computes the direction
 * from its cell towards the cursor and places its iris there, the farther from
 * the centre the farther the cursor is, up to a bounded amplitude. On leaving
 * the frame, the hook brings the target back to the centre — every eye returns
 * to the middle.
 *
 * ## Why this background can stand as content
 *
 * It is the only one of the set that is not a texture: a page that places it
 * behind a title gains a gaze, not a material. Few and large eyes are
 * therefore worth more than many and small ones — the default setting takes
 * the first side.
 *
 * ## The pointer → shader bridge
 *
 * No React render per frame: the component mutates a stable array in place
 * passed as a uniform, and the surface re-reads its uniforms every frame. The
 * copy happens inside the engine loop, at input priority.
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

import { EYE_FOLLOW_FRAGMENT } from './eye-follow.shader.js'

/** What the escape hatch receives. */
export interface EyeFollowControls {
  /** Colours actually handed to the shader. */
  readonly colours: readonly ShaderColour[]
  /** Reason for the refusal, if there is one. */
  readonly refused: string | undefined
}

/** Properties specific to this component. */
export interface EyeFollowOwnProps {
  /** Number of eyes over the height. Capped at ten by the shader. @defaultValue 3 */
  eyes?: number
  /** Amplitude of the gaze, between zero and one. @defaultValue 0.9 */
  gaze?: number
  /** Frequency of the blinks. Zero cuts them. @defaultValue 1 */
  blink?: number
  /** Tokens whose colours are read. */
  colors?: readonly string[]
  /** Fallback classes. */
  fallback?: string
  /** Escape hatch. */
  onReady?: ReadyCallback<EyeFollowControls>
}

/** Every property. */
export type EyeFollowProps = Customisable<EyeFollowOwnProps>

/** Tokens used by default: the background, the line and the pupil, the iris. */
const DEFAULT_TOKENS = ['--o-theme-bg', '--o-theme-fg', '--o-palette-brand-500'] as const

/** Default fallback: a frozen hue, in the same tones. */
const DEFAULT_FALLBACK = 'o-bg-zinc-50 dark:o-bg-zinc-950'

/**
 * Eyes that follow.
 *
 * @example
 * <div className="o-relative o-min-h-screen">
 *   <EyeFollow className="o-absolute o-inset-0" />
 *   <main className="o-relative">…</main>
 * </div>
 */
export function EyeFollow({
  eyes = 3,
  gaze = 0.9,
  blink = 1,
  colors = DEFAULT_TOKENS,
  fallback = DEFAULT_FALLBACK,
  onReady,
  ...rest
}: EyeFollowProps): ReactElement {
  const [host, setHost] = useState<HTMLDivElement | null>(null)

  // Stable array, mutated in place: the surface re-reads the uniforms every
  // frame, the identity never changes, mutating is enough — no setState.
  const uPointer = useRef<number[]>([0.5, 0.5]).current

  // Speed 5: an eye catches up fast, but not instantly.
  const pointer = usePointerDamped({ host, speed: 5, name: 'eye-follow : pointer' })

  useEffect(() => {
    const subscription = clock.subscribe(
      () => {
        // From the hook's frame (centred, y downwards) to the texture's frame
        // (bottom-left corner, y upwards).
        uPointer[0] = (pointer.current.x + 1) / 2
        uPointer[1] = 1 - (pointer.current.y + 1) / 2
      },
      { priority: CLOCK_PRIORITY.input, name: 'eye-follow : bridge' },
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
    fragment: EYE_FOLLOW_FRAGMENT,
    colors,
    uniforms: { uPointer, uEyes: eyes, uGaze: gaze, uBlink: blink },
    name: 'eye-follow',
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

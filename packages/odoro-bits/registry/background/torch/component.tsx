/**
 * Torch: a dark veil pierced by a glow that follows the cursor.
 *
 * ## What this background reacts to
 *
 * Pointer movement, damped: the glow catches up with the cursor gently and
 * reveals the pattern under the veil. When the pointer leaves the frame, the
 * hook brings the target back to the centre — the glow returns there on its
 * own.
 *
 * ## The pointer → shader bridge
 *
 * No React render per frame: the component mutates in place a stable array
 * passed as a uniform, and the surface re-reads its uniforms every frame. The
 * copy happens in the engine loop, at input priority.
 *
 * ## Under reduced motion
 *
 * The surface is refused by the engine and the static fallback is shown:
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

import { TORCH_FRAGMENT } from './torch.shader.js'

/** What the escape hatch receives. */
export interface TorchControls {
  /** Colours actually handed to the shader. */
  readonly colours: readonly ShaderColour[]
  /** Reason for the refusal, if there is one. */
  readonly refused: string | undefined
}

/** Props specific to this component. */
export interface TorchOwnProps {
  /** Radius of the glow, in frame heights. @defaultValue 0.3 */
  radius?: number
  /** Softness of the edge of the glow. @defaultValue 0.6 */
  softness?: number
  /** Opacity of the veil outside the beam. @defaultValue 0.85 */
  dim?: number
  /** Tokens whose colours are read. */
  colors?: readonly string[]
  /** Fallback classes. */
  fallback?: string
  /** Escape hatch. */
  onReady?: ReadyCallback<TorchControls>
}

/** All props. */
export type TorchProps = Customisable<TorchOwnProps>

/** Tokens used by default: the background, the pattern, the warmth of the beam. */
const DEFAULT_TOKENS = [
  '--o-theme-bg',
  '--o-palette-amber-400',
  '--o-palette-orange-200',
] as const

/** Default fallback: a frozen gradient, in the same tones. */
const DEFAULT_FALLBACK =
  'o-bg-gradient-to-br o-from-zinc-50 dark:o-from-zinc-950 o-to-amber-950'

/**
 * Torch.
 *
 * @example
 * <div className="o-relative o-min-h-screen">
 *   <Torch className="o-absolute o-inset-0" />
 *   <main className="o-relative">…</main>
 * </div>
 */
export function Torch({
  radius = 0.3,
  softness = 0.6,
  dim = 0.85,
  colors = DEFAULT_TOKENS,
  fallback = DEFAULT_FALLBACK,
  onReady,
  ...rest
}: TorchProps): ReactElement {
  const [host, setHost] = useState<HTMLDivElement | null>(null)

  // Stable array, mutated in place: the surface re-reads its uniforms every
  // frame, the identity does not change — the mutation is enough, no setState.
  const uPointer = useRef<number[]>([0.5, 0.5]).current

  const pointer = usePointerDamped({ host, speed: 4, name: 'torch : pointer' })

  useEffect(() => {
    const subscription = clock.subscribe(
      () => {
        // From the hook's frame of reference (centred, y downwards) to the
        // texture's (bottom-left corner, y upwards).
        uPointer[0] = (pointer.current.x + 1) / 2
        uPointer[1] = 1 - (pointer.current.y + 1) / 2
      },
      { priority: CLOCK_PRIORITY.input, name: 'torch : bridge' },
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
    fragment: TORCH_FRAGMENT,
    colors,
    uniforms: { uPointer, uRadius: radius, uSoftness: softness, uDim: dim },
    name: 'torch',
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

/**
 * Metallic paint: a brushed and flaked plate whose highlight follows the
 * cursor.
 *
 * ## What this background reacts to
 *
 * To the pointer moving, with damping: the lamp lighting the plate is placed at
 * the cursor, a little above the plane. Moving the pointer therefore amounts to
 * tilting the plate, and the highlight sweeps the brushing streaks. On leaving
 * the frame, the hook brings the target back to the centre.
 *
 * What sets this entry apart from `liquid-chrome`: chrome there reflects a
 * fixed studio, with no pointer, and its surface ripples; here the surface is
 * flat, matte, streaked, and it is the lamp that moves. From `molten-metal`:
 * the bath there is hot and flows. And from `ferrofluid`, which deforms its
 * matter under the pointer instead of lighting it.
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

import { METALLIC_PAINT_FRAGMENT } from './metallic-paint.shader.js'

/** What the escape hatch receives. */
export interface MetallicPaintControls {
  /** Colours actually handed to the shader. */
  readonly colours: readonly ShaderColour[]
  /** Reason for the refusal, if there is one. */
  readonly refused: string | undefined
}

/** Props specific to this component. */
export interface MetallicPaintOwnProps {
  /** Depth of the brushing streaks. @defaultValue 8 */
  relief?: number
  /** Hardness of the highlight, between zero and one. @defaultValue 0.55 */
  sheen?: number
  /** Density of the flakes, between zero and one. @defaultValue 0.5 */
  flakes?: number
  /** Tokens whose colours are read. */
  colors?: readonly string[]
  /** Fallback classes. */
  fallback?: string
  /** Escape hatch. */
  onReady?: ReadyCallback<MetallicPaintControls>
}

/** All props. */
export type MetallicPaintProps = Customisable<MetallicPaintOwnProps>

/** Tokens used by default: the background, the metal, the highlight. */
const DEFAULT_TOKENS = [
  '--o-theme-bg',
  '--o-theme-muted',
  '--o-palette-amber-200',
] as const

/** Default fallback: a frozen gradient, in the same tones. */
const DEFAULT_FALLBACK =
  'o-bg-gradient-to-tr o-from-zinc-50 dark:o-from-zinc-950 o-to-amber-100 dark:o-to-amber-950'

/**
 * Metallic paint.
 *
 * @example
 * <div className="o-relative o-min-h-screen">
 *   <MetallicPaint className="o-absolute o-inset-0" />
 *   <main className="o-relative">…</main>
 * </div>
 */
export function MetallicPaint({
  relief = 8,
  sheen = 0.55,
  flakes = 0.5,
  colors = DEFAULT_TOKENS,
  fallback = DEFAULT_FALLBACK,
  onReady,
  ...rest
}: MetallicPaintProps): ReactElement {
  const [host, setHost] = useState<HTMLDivElement | null>(null)

  // Stable array, mutated in place: the surface re-reads the uniforms every
  // frame, the identity does not change, the mutation is enough — no setState.
  const uPointer = useRef<number[]>([0.5, 0.5]).current

  // Speed 3: a plate has inertia, the highlight does not jump.
  const pointer = usePointerDamped({ host, speed: 3, name: 'metallic-paint : pointer' })

  useEffect(() => {
    const subscription = clock.subscribe(
      () => {
        // From the hook's frame (centred, y downwards) to the texture's
        // (bottom-left corner, y upwards).
        uPointer[0] = (pointer.current.x + 1) / 2
        uPointer[1] = 1 - (pointer.current.y + 1) / 2
      },
      { priority: CLOCK_PRIORITY.input, name: 'metallic-paint : bridge' },
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
    fragment: METALLIC_PAINT_FRAGMENT,
    colors,
    uniforms: { uPointer, uRelief: relief, uSheen: sheen, uFlakes: flakes },
    name: 'metallic-paint',
    // The streaks and the flakes live below the pixel at a reduced density:
    // there they read as a swarming. The relief is softened and the flakes cut
    // rather than letting the noise win.
    degrade: (quality) =>
      quality === 'low'
        ? { uRelief: relief * 0.5, uFlakes: 0 }
        : { uRelief: relief, uFlakes: flakes },
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

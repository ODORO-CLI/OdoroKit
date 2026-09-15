/**
 * Hexagonal wave: a honeycomb whose cells light up in a wave spreading from
 * the pointer.
 *
 * ## What this background reacts to
 *
 * To pointer movement, with damping: the source of the wave catches up with
 * the cursor gently, and the cells light up in circles moving away from it.
 * When the pointer leaves the frame, the hook brings the target back to the
 * centre and the wave returns there.
 *
 * What sets this entry apart from `hex`: there, each cell pulses at its own
 * rhythm, with no direction and no pointer; here they all obey a single
 * wave, and each one lights up as a single block because the wave is
 * evaluated at its centre.
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

import { HEX_WAVE_FRAGMENT } from './hex-wave.shader.js'

/** What the escape hatch receives. */
export interface HexWaveControls {
  /** Colours actually handed to the shader. */
  readonly colours: readonly ShaderColour[]
  /** Reason for the refusal, if there is one. */
  readonly refused: string | undefined
}

/** Properties specific to this component. */
export interface HexWaveOwnProps {
  /** Cells per frame height. Capped at forty by the shader. @defaultValue 9 */
  size?: number
  /** Wave speed. @defaultValue 0.6 */
  speed?: number
  /** Waves per frame height. @defaultValue 3 */
  spacing?: number
  /** Fade-out speed with distance. @defaultValue 2.5 */
  fade?: number
  /** Tokens whose colours are read. */
  colors?: readonly string[]
  /** Fallback classes. */
  fallback?: string
  /** Escape hatch. */
  onReady?: ReadyCallback<HexWaveControls>
}

/** Every property. */
export type HexWaveProps = Customisable<HexWaveOwnProps>

/** Tokens used by default: the background, the edges, the lit cells. */
const DEFAULT_TOKENS = [
  '--o-theme-bg',
  '--o-theme-line',
  '--o-palette-amber-400',
] as const

/** Default fallback: a frozen hue, in the same tones. */
const DEFAULT_FALLBACK = 'o-bg-zinc-50 dark:o-bg-zinc-950'

/**
 * Hexagonal wave.
 *
 * @example
 * <div className="o-relative o-min-h-screen">
 *   <HexWave className="o-absolute o-inset-0" />
 *   <main className="o-relative">…</main>
 * </div>
 */
export function HexWave({
  size = 9,
  speed = 0.6,
  spacing = 3,
  fade = 2.5,
  colors = DEFAULT_TOKENS,
  fallback = DEFAULT_FALLBACK,
  onReady,
  ...rest
}: HexWaveProps): ReactElement {
  const [host, setHost] = useState<HTMLDivElement | null>(null)

  // Stable array, mutated in place: the surface re-reads the uniforms every
  // frame, the identity never changes, mutating is enough — no setState.
  const uPointer = useRef<number[]>([0.5, 0.5]).current

  const pointer = usePointerDamped({
    host,
    speed: 3,
    name: 'hex wave : pointer',
  })

  useEffect(() => {
    const subscription = clock.subscribe(
      () => {
        // From the hook's frame (centred, y downwards) to the texture's frame
        // (bottom-left corner, y upwards).
        uPointer[0] = (pointer.current.x + 1) / 2
        uPointer[1] = 1 - (pointer.current.y + 1) / 2
      },
      { priority: CLOCK_PRIORITY.input, name: 'hex wave : bridge' },
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
    fragment: HEX_WAVE_FRAGMENT,
    colors,
    uniforms: { uPointer, uSize: size, uSpeed: speed, uSpacing: spacing, uFade: fade },
    name: 'hex-wave',
    // Small cells shimmer along their edges at reduced pixel density: on
    // low quality, they widen.
    degrade: (quality) => ({
      uSize: quality === 'low' ? Math.min(size, 6) : size,
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

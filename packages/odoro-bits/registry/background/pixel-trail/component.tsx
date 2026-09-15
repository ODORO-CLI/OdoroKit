/**
 * Pixel trail: the cursor lights up the pixels of a coarse grid, which then
 * go out in steps.
 *
 * ## What this background reacts to
 *
 * To pointer movement: the engine loop samples its position — one sample
 * every 35 ms or so, and only if it has moved — into a ring buffer of
 * fourteen stamped deposits. The shader tests the centre of every pixel
 * against those deposits, which gives a stepped trail and not a halo.
 *
 * What sets this entry apart from `wake`: the trail there is continuous and
 * gaussian, here it is made of solid squares that come down one notch at a
 * time. And from `led-wall` or `mosaic`, which quantise an image without
 * owing anything to the pointer.
 *
 * ## The pointer → shader bridge
 *
 * No React render per frame: the buffer is a stable array of forty-two floats
 * (fourteen times x, y, deposit time), mutated in place inside the clock
 * subscription. The deposits are stamped with the time of the engine clock,
 * the same as the shader's `uTime`.
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

import { PIXEL_TRAIL_FRAGMENT } from './pixel-trail.shader.js'

/** What the escape hatch receives. */
export interface PixelTrailControls {
  /** Colours actually handed to the shader. */
  readonly colours: readonly ShaderColour[]
  /** Reason for the refusal, if there is one. */
  readonly refused: string | undefined
}

/** Props specific to this component. */
export interface PixelTrailOwnProps {
  /** Number of pixels over the height. Capped at ninety by the shader. @defaultValue 26 */
  pixel?: number
  /** Lifetime of a lit pixel, in seconds. @defaultValue 1 */
  life?: number
  /** Number of decay steps. @defaultValue 4 */
  levels?: number
  /** Tokens whose colours are read. */
  colors?: readonly string[]
  /** Fallback classes. */
  fallback?: string
  /** Escape hatch. */
  onReady?: ReadyCallback<PixelTrailControls>
}

/** All props. */
export type PixelTrailProps = Customisable<PixelTrailOwnProps>

/** Tokens used by default: the background, the cold pixels, the fresh pixels. */
const DEFAULT_TOKENS = [
  '--o-theme-bg',
  '--o-palette-indigo-400',
  '--o-palette-pink-300',
] as const

/** Default fallback: a frozen tint, in the same tones. */
const DEFAULT_FALLBACK =
  'o-bg-gradient-to-b o-from-zinc-50 dark:o-from-zinc-950 o-to-indigo-100 dark:o-to-indigo-950'

/** Number of deposits alive at a time. The shader expects exactly as many. */
const SLOTS = 14

/** Minimum interval between two deposits, in seconds. */
const DEPOSIT_EVERY = 0.035

/** Minimum movement between two deposits, in texture coordinates. */
const DEPOSIT_THRESHOLD = 0.006

/**
 * Pixel trail.
 *
 * @example
 * <div className="o-relative o-min-h-screen">
 *   <PixelTrail className="o-absolute o-inset-0" />
 *   <main className="o-relative">…</main>
 * </div>
 */
export function PixelTrail({
  pixel = 26,
  life = 1,
  levels = 4,
  colors = DEFAULT_TOKENS,
  fallback = DEFAULT_FALLBACK,
  onReady,
  ...rest
}: PixelTrailProps): ReactElement {
  const [host, setHost] = useState<HTMLDivElement | null>(null)

  // Stable buffer, mutated in place: fourteen times (x, y, deposit time). A
  // deposit at -1000 gives an enormous age, hence a pixel dark from the outset.
  const uTrail = useRef<number[]>(Array.from({ length: SLOTS * 3 }, () => -1000)).current

  // Speed 10: nearly the raw pointer. The grid is already a filter; damping
  // on top of that would make the trail lag behind itself.
  const pointer = usePointerDamped({ host, speed: 10, name: 'pixel-trail : pointer' })

  useEffect(() => {
    let lastDeposit = -1000
    let lastX = 0.5
    let lastY = 0.5

    const subscription = clock.subscribe(
      ({ time }) => {
        const x = (pointer.current.x + 1) / 2
        const y = 1 - (pointer.current.y + 1) / 2

        if (time - lastDeposit < DEPOSIT_EVERY) return
        const moved = Math.hypot(x - lastX, y - lastY)
        if (moved < DEPOSIT_THRESHOLD) return

        for (let i = SLOTS - 1; i > 0; i -= 1) {
          uTrail[i * 3] = uTrail[(i - 1) * 3] ?? -1000
          uTrail[i * 3 + 1] = uTrail[(i - 1) * 3 + 1] ?? -1000
          uTrail[i * 3 + 2] = uTrail[(i - 1) * 3 + 2] ?? -1000
        }
        uTrail[0] = x
        uTrail[1] = y
        uTrail[2] = time

        lastDeposit = time
        lastX = x
        lastY = y
      },
      { priority: CLOCK_PRIORITY.input, name: 'pixel-trail : deposits' },
    )
    return () => subscription.unsubscribe()
  }, [pointer, uTrail])

  const {
    ref,
    setHost: setShaderHost,
    ready,
    refused,
    colours,
  } = useTokenShader<HTMLDivElement>({
    fragment: PIXEL_TRAIL_FRAGMENT,
    colors,
    uniforms: { uTrail, uPixel: pixel, uLife: life, uLevels: levels },
    name: 'pixel-trail',
    // A fine grid costs as much as a coarse one, but its separating gap
    // disappears at reduced pixel density.
    degrade: (quality) => ({
      uPixel: quality === 'low' ? Math.min(pixel, 18) : pixel,
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

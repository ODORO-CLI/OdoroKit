/**
 * Pixel blast: every click throws out a burst of square pixels that fall back
 * down.
 *
 * ## What this background reacts to
 *
 * To a click — or a touch — on the frame: every press stamps a burst into a
 * ring buffer of five slots, and the pixels leave from the grid cell of the
 * press. Moving the pointer changes nothing.
 *
 * An automatic burst also goes off on its own, at a set interval: a
 * background that exists only on click would stay empty on most pages. Zero
 * switches it off.
 *
 * ## What sets it apart from the fireworks
 *
 * Everything is aligned on a grid: the pixels are squares that hop from cell
 * to cell, with no halo and no trail, and the blast is a square that widens.
 * The fireworks draw round, blurred sparks in a continuous space.
 *
 * ## The click -> shader bridge
 *
 * No React render per frame: the buffer is a stable array of fifteen floats
 * (five times x, y, start time), mutated in place on every click. The surface
 * re-reads its uniforms every frame, the identity of the array does not
 * change — the mutation is enough.
 *
 * The time written into the buffer is the engine clock's, kept by a
 * subscription at input priority: it is the same time as the shader's
 * `uTime`, without which the age of the bursts would be wrong.
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

import { PIXEL_BLAST_FRAGMENT } from './pixel-blast.shader.js'

/** What the escape hatch receives. */
export interface PixelBlastControls {
  /** Colours actually handed to the shader. */
  readonly colours: readonly ShaderColour[]
  /** Reason for the refusal, if there is one. */
  readonly refused: string | undefined
}

/** Props specific to this component. */
export interface PixelBlastOwnProps {
  /** Pixels of the grid over the height of the frame. @defaultValue 40 */
  pixels?: number
  /** Pixels thrown out per burst. @defaultValue 24 */
  count?: number
  /** Strength of the fall. @defaultValue 0.5 */
  gravity?: number
  /** Period of the automatic bursts, in seconds. Zero switches them off. @defaultValue 2.2 */
  auto?: number
  /** Tokens whose colours are read. */
  colors?: readonly string[]
  /** Fallback classes. */
  fallback?: string
  /** Escape hatch. */
  onReady?: ReadyCallback<PixelBlastControls>
}

/** All props. */
export type PixelBlastProps = Customisable<PixelBlastOwnProps>

/** Tokens used by default: the background, the two pixel hues. */
const DEFAULT_TOKENS = [
  '--o-theme-bg',
  '--o-palette-brand-500',
  '--o-palette-yellow-300',
] as const

/** Default fallback: a frozen tint, in the same tones. */
const DEFAULT_FALLBACK = 'o-bg-zinc-50 dark:o-bg-zinc-950'

/** Number of bursts alive at a time. */
const SLOTS = 5

/**
 * Pixels per burst at low quality.
 *
 * Every pixel is one position and one cell comparison per fragment, for each
 * of the six possible bursts: it is the only cost lever there is.
 */
const LOW_COUNT = 12

/**
 * Pixel blast.
 *
 * @example
 * <div className="o-relative o-min-h-screen">
 *   <PixelBlast className="o-absolute o-inset-0" />
 *   <main className="o-relative">…</main>
 * </div>
 */
export function PixelBlast({
  pixels = 40,
  count = 24,
  gravity = 0.5,
  auto = 2.2,
  colors = DEFAULT_TOKENS,
  fallback = DEFAULT_FALLBACK,
  onReady,
  ...rest
}: PixelBlastProps): ReactElement {
  const [host, setHost] = useState<HTMLDivElement | null>(null)

  // Stable buffer, mutated in place: five times (x, y, start time). A start
  // at -1000 gives an enormous age, hence a burst inert from the outset.
  const uClicks = useRef<number[]>(Array.from({ length: SLOTS * 3 }, () => -1000)).current

  // The time of the engine clock — the same as the shader's uTime. It is what
  // stamps the bursts; performance.now() would give a different origin.
  const lastTime = useRef(0)

  useEffect(() => {
    const subscription = clock.subscribe(
      ({ time }) => {
        lastTime.current = time
      },
      { priority: CLOCK_PRIORITY.input, name: 'pixel-blast : clock' },
    )
    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (host === null) return

    const onDown = (event: PointerEvent): void => {
      const bounds = host.getBoundingClientRect()
      const x = (event.clientX - bounds.left) / Math.max(bounds.width, 1)
      // vUv has its origin at the bottom: the screen's vertical axis is flipped.
      const y = 1 - (event.clientY - bounds.top) / Math.max(bounds.height, 1)

      // Ring buffer: everything shifts by one notch, the new burst at the head.
      for (let i = SLOTS - 1; i > 0; i -= 1) {
        uClicks[i * 3] = uClicks[(i - 1) * 3] ?? -1000
        uClicks[i * 3 + 1] = uClicks[(i - 1) * 3 + 1] ?? -1000
        uClicks[i * 3 + 2] = uClicks[(i - 1) * 3 + 2] ?? -1000
      }
      uClicks[0] = x
      uClicks[1] = y
      uClicks[2] = lastTime.current
    }

    host.addEventListener('pointerdown', onDown)
    return () => host.removeEventListener('pointerdown', onDown)
  }, [host, uClicks])

  const {
    ref,
    setHost: setShaderHost,
    ready,
    refused,
    colours,
  } = useTokenShader<HTMLDivElement>({
    fragment: PIXEL_BLAST_FRAGMENT,
    colors,
    uniforms: {
      uClicks,
      uPixels: pixels,
      uCount: count,
      uGravity: gravity,
      uAuto: auto,
    },
    name: 'pixel-blast',
    degrade: (quality) => ({
      uCount: quality === 'low' ? Math.min(count, LOW_COUNT) : count,
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

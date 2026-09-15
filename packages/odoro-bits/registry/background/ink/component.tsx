/**
 * Ink: each click spreads a disc of the next colour over the whole frame.
 *
 * ## What this background reacts to
 *
 * To a click — or a touch — on the frame: a disc of the next colour spreads
 * from the exact point of the press until it covers the frame, edge softened,
 * the most recent one on top. The background thus changes colour in waves,
 * cycling through the three colours. Pointer movement, on the other hand,
 * changes nothing.
 *
 * ## The click → shader bridge
 *
 * No React render per frame: the buffer is a stable array of sixteen floats
 * (four times x, y, start time, colour index), mutated in place on every
 * click. The surface re-reads its uniforms every frame — mutating is
 * enough.
 *
 * The time written into the buffer is the engine clock's, recorded by a
 * subscription at input priority: it is the same time as the shader's `uTime`,
 * without which the radius of the discs would be wrong.
 *
 * ## Under reduced motion
 *
 * The surface is refused by the engine and the static fallback shows.
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

import { INK_FRAGMENT } from './ink.shader.js'

/** What the escape hatch receives. */
export interface InkControls {
  /** Colours actually handed to the shader. */
  readonly colours: readonly ShaderColour[]
  /** Reason for the refusal, if there is one. */
  readonly refused: string | undefined
}

/** Properties specific to this component. */
export interface InkOwnProps {
  /** Speed at which the discs spread. @defaultValue 0.7 */
  speed?: number
  /** Width of the softened edge. @defaultValue 0.12 */
  feather?: number
  /** Tokens whose colours are read. */
  colors?: readonly string[]
  /** Fallback classes. */
  fallback?: string
  /** Escape hatch. */
  onReady?: ReadyCallback<InkControls>
}

/** Every property. */
export type InkProps = Customisable<InkOwnProps>

/** Tokens used by default: the three inks, cycled through. */
const DEFAULT_TOKENS = [
  '--o-theme-bg',
  '--o-palette-fuchsia-500',
  '--o-palette-cyan-400',
] as const

/** Default fallback: a frozen gradient, in the same tones. */
const DEFAULT_FALLBACK =
  'o-bg-gradient-to-br o-from-zinc-50 dark:o-from-zinc-950 o-to-fuchsia-950'

/** Number of waves alive at once. */
const SLOTS = 4

/**
 * Ink.
 *
 * @example
 * <div className="o-relative o-min-h-screen">
 *   <Ink className="o-absolute o-inset-0" />
 *   <main className="o-relative">…</main>
 * </div>
 */
export function Ink({
  speed = 0.7,
  feather = 0.12,
  colors = DEFAULT_TOKENS,
  fallback = DEFAULT_FALLBACK,
  onReady,
  ...rest
}: InkProps): ReactElement {
  const [host, setHost] = useState<HTMLDivElement | null>(null)

  // Stable buffer, mutated in place: four times (x, y, start time, colour
  // index). A start at -1000 is discarded outright by the shader.
  const uClicks = useRef<number[]>(Array.from({ length: SLOTS * 4 }, () => -1000)).current

  // The next ink in the cycle: each click takes the following colour.
  const nextColour = useRef(1)

  // The engine clock's time — the same as the shader's uTime.
  const lastTime = useRef(0)

  useEffect(() => {
    const subscription = clock.subscribe(
      ({ time }) => {
        lastTime.current = time
      },
      { priority: CLOCK_PRIORITY.input, name: 'ink : clock' },
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

      // Circular buffer: everything shifts by one, the new click at the head.
      for (let i = SLOTS - 1; i > 0; i -= 1) {
        uClicks[i * 4] = uClicks[(i - 1) * 4] ?? -1000
        uClicks[i * 4 + 1] = uClicks[(i - 1) * 4 + 1] ?? -1000
        uClicks[i * 4 + 2] = uClicks[(i - 1) * 4 + 2] ?? -1000
        uClicks[i * 4 + 3] = uClicks[(i - 1) * 4 + 3] ?? -1000
      }
      uClicks[0] = x
      uClicks[1] = y
      uClicks[2] = lastTime.current
      uClicks[3] = nextColour.current

      nextColour.current = (nextColour.current + 1) % 3
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
    fragment: INK_FRAGMENT,
    colors,
    uniforms: { uClicks, uSpeed: speed, uFeather: feather },
    name: 'ink',
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

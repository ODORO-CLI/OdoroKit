/**
 * Seismograph: horizontal traces on a scrolling paper, twitching on a click.
 *
 * ## What this background reacts to
 *
 * To a click — or a touch — on the frame: every press places a stylus at its
 * abscissa and dates a shake in a ring buffer of eight slots. The shake is
 * written on the paper as the stylus passes and moves away with it to the left,
 * stronger on the traces at the height of the click. The pointer moving, on the
 * other hand, changes nothing.
 *
 * ## The click → shader bridge
 *
 * No React render per frame: the buffer is a stable array of twenty-four floats
 * (eight times x, y, start time), mutated in place on every click. The surface
 * re-reads its uniforms every frame, the identity of the array does not change
 * — the mutation is enough.
 *
 * The time written into the buffer is the engine clock's, kept by a
 * subscription at input priority: it is the same time as the shader's `uTime`,
 * without which the position of the shake on the paper would be wrong.
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

import { SEISMOGRAPH_FRAGMENT } from './seismograph.shader.js'

/** What the escape hatch receives. */
export interface SeismographControls {
  /** Colours actually handed to the shader. */
  readonly colours: readonly ShaderColour[]
  /** Reason for the refusal, if there is one. */
  readonly refused: string | undefined
}

/** Props specific to this component. */
export interface SeismographOwnProps {
  /** Number of traces. Clamped to eight by the shader. @defaultValue 5 */
  traces?: number
  /** Speed of the paper, in frame widths per second. @defaultValue 0.12 */
  scroll?: number
  /** Rate at which the shakes are damped. @defaultValue 1.5 */
  decay?: number
  /** Strength of the shakes. @defaultValue 1 */
  amplitude?: number
  /** Tokens whose colours are read. */
  colors?: readonly string[]
  /** Fallback classes. */
  fallback?: string
  /** Escape hatch. */
  onReady?: ReadyCallback<SeismographControls>
}

/** All props. */
export type SeismographProps = Customisable<SeismographOwnProps>

/** Tokens used by default: the paper, the ink, the fresh ink. */
const DEFAULT_TOKENS = ['--o-theme-bg', '--o-theme-fg', '--o-palette-brand-500'] as const

/** Default fallback: a frozen tint, in the same tones. */
const DEFAULT_FALLBACK = 'o-bg-zinc-50 dark:o-bg-zinc-950'

/** Number of shakes live at once. */
const SLOTS = 8

/**
 * Number of traces at low quality.
 *
 * Every fragment evaluates its trace three times — the slope comes from a
 * finite difference — and every evaluation walks the eight clicks. The number
 * of traces changes nothing to that count; but tightly packed traces, at a
 * reduced pixel density, shimmer. Fewer traces, more space.
 */
const LOW_TRACES = 3

/**
 * Seismograph.
 *
 * @example
 * <div className="o-relative o-min-h-screen">
 *   <Seismograph className="o-absolute o-inset-0" />
 *   <main className="o-relative">…</main>
 * </div>
 */
export function Seismograph({
  traces = 5,
  scroll = 0.12,
  decay = 1.5,
  amplitude = 1,
  colors = DEFAULT_TOKENS,
  fallback = DEFAULT_FALLBACK,
  onReady,
  ...rest
}: SeismographProps): ReactElement {
  const [host, setHost] = useState<HTMLDivElement | null>(null)

  // Stable buffer, mutated in place: eight times (x, y, start time). A start at
  // -1000 gives a huge age, hence a shake that is out from the start.
  const uClicks = useRef<number[]>(Array.from({ length: SLOTS * 3 }, () => -1000)).current

  // The time of the engine clock — the same as the shader's uTime. It is what
  // dates the clicks; performance.now() would give a different origin.
  const lastTime = useRef(0)

  useEffect(() => {
    const subscription = clock.subscribe(
      ({ time }) => {
        lastTime.current = time
      },
      { priority: CLOCK_PRIORITY.input, name: 'seismograph : clock' },
    )
    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (host === null) return

    const onDown = (event: PointerEvent): void => {
      const bounds = host.getBoundingClientRect()
      const x = (event.clientX - bounds.left) / Math.max(bounds.width, 1)
      // vUv has its origin at the bottom: the vertical screen axis is flipped.
      const y = 1 - (event.clientY - bounds.top) / Math.max(bounds.height, 1)

      // Ring buffer: everything shifts by one slot, the new click at the head.
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
    fragment: SEISMOGRAPH_FRAGMENT,
    colors,
    uniforms: {
      uClicks,
      uTraces: traces,
      uScroll: scroll,
      uDecay: decay,
      uAmplitude: amplitude,
    },
    name: 'seismograph',
    degrade: (quality) => ({
      uTraces: quality === 'low' ? Math.min(traces, LOW_TRACES) : traces,
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

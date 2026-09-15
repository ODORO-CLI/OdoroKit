/**
 * Click waves: each click emits a ring that spreads and damps out.
 *
 * ## What this background reacts to
 *
 * On a click — or a touch — on the frame: each press timestamps a wave in a
 * circular buffer of eight slots, and the ring spreads from the exact point
 * of the press. Moving the pointer, on the other hand, changes nothing.
 *
 * ## The click → shader bridge
 *
 * No React render per frame: the buffer is a stable array of twenty-four
 * floats (eight times x, y, start time), mutated in place on every click.
 * The surface re-reads its uniforms every frame, the array's identity never
 * changes — mutating is enough.
 *
 * The time written into the buffer is the engine clock's, recorded by a
 * subscription at input priority: it is the same time as the shader's `uTime`,
 * without which the age of the clicks would be wrong.
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

import { CLICK_WAVES_FRAGMENT } from './click-waves.shader.js'

/** What the escape hatch receives. */
export interface ClickWavesControls {
  /** Colours actually handed to the shader. */
  readonly colours: readonly ShaderColour[]
  /** Reason for the refusal, if there is one. */
  readonly refused: string | undefined
}

/** Properties specific to this component. */
export interface ClickWavesOwnProps {
  /** Propagation speed of the rings. @defaultValue 0.45 */
  speed?: number
  /** Wavelength of the rings. @defaultValue 0.09 */
  width?: number
  /** Rate at which the waves fade out. @defaultValue 1.2 */
  decay?: number
  /** Tokens whose colours are read. */
  colors?: readonly string[]
  /** Fallback classes. */
  fallback?: string
  /** Escape hatch. */
  onReady?: ReadyCallback<ClickWavesControls>
}

/** Every property. */
export type ClickWavesProps = Customisable<ClickWavesOwnProps>

/** Tokens used by default: the background, the surface, the glint on the crests. */
const DEFAULT_TOKENS = [
  '--o-theme-bg',
  '--o-palette-cyan-400',
  '--o-palette-sky-200',
] as const

/** Default fallback: a frozen gradient, in the same tones. */
const DEFAULT_FALLBACK =
  'o-bg-gradient-to-b o-from-zinc-50 dark:o-from-sky-950 o-to-cyan-950'

/** Number of clicks live at once. */
const SLOTS = 8

/**
 * Click waves.
 *
 * @example
 * <div className="o-relative o-min-h-screen">
 *   <ClickWaves className="o-absolute o-inset-0" />
 *   <main className="o-relative">…</main>
 * </div>
 */
export function ClickWaves({
  speed = 0.45,
  width = 0.09,
  decay = 1.2,
  colors = DEFAULT_TOKENS,
  fallback = DEFAULT_FALLBACK,
  onReady,
  ...rest
}: ClickWavesProps): ReactElement {
  const [host, setHost] = useState<HTMLDivElement | null>(null)

  // Stable buffer, mutated in place: eight times (x, y, start time). A start
  // at -1000 gives an enormous age, hence a wave inert by default.
  const uClicks = useRef<number[]>(Array.from({ length: SLOTS * 3 }, () => -1000)).current

  // The engine clock's time — the same as the shader's uTime. It is what
  // timestamps the clicks; performance.now() would give another origin.
  const lastTime = useRef(0)

  useEffect(() => {
    const subscription = clock.subscribe(
      ({ time }) => {
        lastTime.current = time
      },
      { priority: CLOCK_PRIORITY.input, name: 'click-waves : clock' },
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
    fragment: CLICK_WAVES_FRAGMENT,
    colors,
    uniforms: { uClicks, uSpeed: speed, uWidth: width, uDecay: decay },
    name: 'click-waves',
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

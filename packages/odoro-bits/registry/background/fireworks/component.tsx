/**
 * Fireworks: a burst breaks open at every click and falls back under
 * gravity.
 *
 * ## What this background reacts to
 *
 * On a click — or a touch — on the frame: each press timestamps a burst in
 * a circular buffer of six slots, and the sparks leave from the exact point
 * of the press. Moving the pointer changes nothing.
 *
 * An automatic burst also goes off on its own, at a set interval: a sky
 * that exists only on a click would stay empty on most pages. Zero cuts
 * it.
 *
 * ## The click -> shader bridge
 *
 * No React render per frame: the buffer is a stable array of eighteen
 * floats (six times x, y, start time), mutated in place on every click.
 * The surface re-reads its uniforms every frame, the array's identity never
 * changes — mutating is enough.
 *
 * The time written into the buffer is the engine clock's, recorded by a
 * subscription at input priority: it is the same time as the shader's `uTime`,
 * without which the age of the bursts would be wrong.
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

import { FIREWORKS_FRAGMENT } from './fireworks.shader.js'

/** What the escape hatch receives. */
export interface FireworksControls {
  /** Colours actually handed to the shader. */
  readonly colours: readonly ShaderColour[]
  /** Reason for the refusal, if there is one. */
  readonly refused: string | undefined
}

/** Properties specific to this component. */
export interface FireworksOwnProps {
  /** Sparks per burst. @defaultValue 32 */
  sparks?: number
  /** Strength of the fall-back. @defaultValue 0.25 */
  gravity?: number
  /** Rate at which the sparks fade out. @defaultValue 1.1 */
  decay?: number
  /** Period of the automatic bursts, in seconds. Zero cuts them. @defaultValue 2.6 */
  auto?: number
  /** Tokens whose colours are read. */
  colors?: readonly string[]
  /** Fallback classes. */
  fallback?: string
  /** Escape hatch. */
  onReady?: ReadyCallback<FireworksControls>
}

/** Every property. */
export type FireworksProps = Customisable<FireworksOwnProps>

/** Tokens used by default: the sky, the two spark hues. */
const DEFAULT_TOKENS = [
  '--o-theme-bg',
  '--o-palette-brand-500',
  '--o-palette-amber-200',
] as const

/** Default fallback: a frozen sky, in the same tones. */
const DEFAULT_FALLBACK =
  'o-bg-gradient-to-t o-from-zinc-50 dark:o-from-zinc-950 o-to-brand-200 dark:o-to-brand-950'

/** Number of bursts live at once. */
const SLOTS = 6

/**
 * Sparks per burst at low quality.
 *
 * Each spark is an exponential and a sine per fragment, for each of the
 * seven possible bursts: it is the only lever on cost, and it does not need
 * to be a prop in order to be degraded.
 */
const LOW_SPARKS = 14

/**
 * Fireworks.
 *
 * @example
 * <div className="o-relative o-min-h-screen">
 *   <Fireworks className="o-absolute o-inset-0" />
 *   <main className="o-relative">…</main>
 * </div>
 */
export function Fireworks({
  sparks = 32,
  gravity = 0.25,
  decay = 1.1,
  auto = 2.6,
  colors = DEFAULT_TOKENS,
  fallback = DEFAULT_FALLBACK,
  onReady,
  ...rest
}: FireworksProps): ReactElement {
  const [host, setHost] = useState<HTMLDivElement | null>(null)

  // Stable buffer, mutated in place: six times (x, y, start time). A start
  // at -1000 gives an enormous age, hence a burst inert by default.
  const uClicks = useRef<number[]>(Array.from({ length: SLOTS * 3 }, () => -1000)).current

  // The engine clock's time — the same as the shader's uTime. It is what
  // timestamps the bursts; performance.now() would give another origin.
  const lastTime = useRef(0)

  useEffect(() => {
    const subscription = clock.subscribe(
      ({ time }) => {
        lastTime.current = time
      },
      { priority: CLOCK_PRIORITY.input, name: 'fireworks : clock' },
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

      // Circular buffer: everything shifts by one, the new burst at the head.
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
    fragment: FIREWORKS_FRAGMENT,
    colors,
    uniforms: {
      uClicks,
      uSparks: sparks,
      uGravity: gravity,
      uDecay: decay,
      uAuto: auto,
    },
    name: 'fireworks',
    degrade: (quality) => ({
      uSparks: quality === 'low' ? Math.min(sparks, LOW_SPARKS) : sparks,
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

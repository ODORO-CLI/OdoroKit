/**
 * Liquid ether: a vaporous fluid the pointer pushes.
 *
 * ## Why an analytic field, and not a texture ping-pong
 *
 * A real fluid is written with two render targets swapped every frame: the
 * velocity of the previous frame is read back to advect the next one. The
 * engine's arbitrated surface only lends one program and one quad, with no
 * render target and no frame feedback — that is what makes it light, and what
 * every background of this family shares.
 *
 * Rather than working around the engine with a raw program and two targets to
 * manage, the background keeps a short memory in its place: twelve dated drops,
 * each a position and a velocity, summed at each fragment into a displacement
 * field that advects the noise. Nothing is conserved from one frame to the
 * next, but a gesture of the hand lasts less than twelve drops, and the eye
 * only ever sees the vapour that follows.
 *
 * ## The pointer → shader bridge
 *
 * No React render per frame: two stable arrays — forty-eight floats for the
 * drops, twelve for their dates — are mutated in place on every move, and the
 * surface re-reads its uniforms every frame.
 *
 * The velocity is that of the gesture, measured between two samples in the time
 * of the engine clock — the same as the shader's `uTime`, without which the age
 * of the drops would be wrong. A move that is too short is not dropped: it
 * would only wear out the buffer.
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

import { LIQUID_ETHER_FRAGMENT } from './liquid-ether.shader.js'

/** What the escape hatch receives. */
export interface LiquidEtherControls {
  /** Colours actually handed to the shader. */
  readonly colours: readonly ShaderColour[]
  /** Reason for the refusal, if there is one. */
  readonly refused: string | undefined
}

/** Props specific to this component. */
export interface LiquidEtherOwnProps {
  /** Speed of the drift without a pointer. @defaultValue 0.1 */
  speed?: number
  /** Radius of a drop, in frame heights. @defaultValue 0.22 */
  radius?: number
  /** Strength of the push on the noise. @defaultValue 0.8 */
  strength?: number
  /** Lifetime of a drop, in seconds. @defaultValue 2.5 */
  life?: number
  /** Tokens whose colours are read. */
  colors?: readonly string[]
  /** Fallback classes. */
  fallback?: string
  /** Escape hatch. */
  onReady?: ReadyCallback<LiquidEtherControls>
}

/** All props. */
export type LiquidEtherProps = Customisable<LiquidEtherOwnProps>

/** Tokens used by default: the background, the vapour, the trail. */
const DEFAULT_TOKENS = [
  '--o-theme-bg',
  '--o-palette-violet-500',
  '--o-palette-cyan-300',
] as const

/** Default fallback: a frozen gradient, in the same tones. */
const DEFAULT_FALLBACK =
  'o-bg-gradient-to-tr o-from-zinc-50 dark:o-from-zinc-950 o-via-violet-300 dark:o-via-violet-900 o-to-zinc-50 dark:o-to-zinc-950'

/** Number of drops live at once. */
const SLOTS = 12

/** Minimal move, as a fraction of the frame, before dropping. */
const MIN_STEP = 0.012

/** Maximum velocity kept, in frames per second: a sharp gesture saturates. */
const MAX_VELOCITY = 3

/**
 * Noise detail outside low quality.
 *
 * Two octave sums per fragment, after the twelve drops: the octaves are the
 * only cost lever left, and it does not need to be a prop to be degraded.
 */
const OCTAVES = 4

/** Noise detail at low quality. */
const LOW_OCTAVES = 2

/**
 * Liquid ether.
 *
 * @example
 * <div className="o-relative o-min-h-screen">
 *   <LiquidEther className="o-absolute o-inset-0" />
 *   <main className="o-relative">…</main>
 * </div>
 */
export function LiquidEther({
  speed = 0.1,
  radius = 0.22,
  strength = 0.8,
  life = 2.5,
  colors = DEFAULT_TOKENS,
  fallback = DEFAULT_FALLBACK,
  onReady,
  ...rest
}: LiquidEtherProps): ReactElement {
  const [host, setHost] = useState<HTMLDivElement | null>(null)

  // Stable buffers, mutated in place: twelve times (x, y, vx, vy), and twelve
  // dates. A date at -1000 gives a huge age, hence an inert drop.
  const uTrail = useRef<number[]>(Array.from({ length: SLOTS * 4 }, () => 0)).current
  const uStamps = useRef<number[]>(Array.from({ length: SLOTS }, () => -1000)).current

  // The time of the engine clock — the same as the shader's uTime.
  const lastTime = useRef(0)
  // The last sample, to measure the speed of the gesture.
  const last = useRef<{ x: number; y: number; time: number } | null>(null)

  useEffect(() => {
    const subscription = clock.subscribe(
      ({ time }) => {
        lastTime.current = time
      },
      { priority: CLOCK_PRIORITY.input, name: 'liquid-ether : clock' },
    )
    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (host === null) return

    const onMove = (event: PointerEvent): void => {
      const bounds = host.getBoundingClientRect()
      const x = (event.clientX - bounds.left) / Math.max(bounds.width, 1)
      // vUv has its origin at the bottom: the vertical screen axis is flipped.
      const y = 1 - (event.clientY - bounds.top) / Math.max(bounds.height, 1)
      const time = lastTime.current

      const previous = last.current
      // First sample, or resuming after a pause: nothing to drop, the velocity
      // would make no sense.
      if (previous === null || time - previous.time > 0.5) {
        last.current = { x, y, time }
        return
      }

      const dx = x - previous.x
      const dy = y - previous.y
      if (Math.hypot(dx, dy) < MIN_STEP) return

      const dt = Math.max(time - previous.time, 1 / 120)
      let vx = dx / dt
      let vy = dy / dt
      const magnitude = Math.hypot(vx, vy)
      if (magnitude > MAX_VELOCITY) {
        vx = (vx / magnitude) * MAX_VELOCITY
        vy = (vy / magnitude) * MAX_VELOCITY
      }

      // Ring buffer: everything shifts by one slot, the new drop at the head.
      for (let i = SLOTS - 1; i > 0; i -= 1) {
        uTrail[i * 4] = uTrail[(i - 1) * 4] ?? 0
        uTrail[i * 4 + 1] = uTrail[(i - 1) * 4 + 1] ?? 0
        uTrail[i * 4 + 2] = uTrail[(i - 1) * 4 + 2] ?? 0
        uTrail[i * 4 + 3] = uTrail[(i - 1) * 4 + 3] ?? 0
        uStamps[i] = uStamps[i - 1] ?? -1000
      }
      uTrail[0] = x
      uTrail[1] = y
      uTrail[2] = vx
      uTrail[3] = vy
      uStamps[0] = time

      last.current = { x, y, time }
    }

    const onLeave = (): void => {
      last.current = null
    }

    host.addEventListener('pointermove', onMove, { passive: true })
    host.addEventListener('pointerleave', onLeave)
    return () => {
      host.removeEventListener('pointermove', onMove)
      host.removeEventListener('pointerleave', onLeave)
    }
  }, [host, uTrail, uStamps])

  const {
    ref,
    setHost: setShaderHost,
    ready,
    refused,
    colours,
  } = useTokenShader<HTMLDivElement>({
    fragment: LIQUID_ETHER_FRAGMENT,
    colors,
    uniforms: {
      uTrail,
      uStamps,
      uSpeed: speed,
      uRadius: radius,
      uStrength: strength,
      uLife: life,
      uOctaves: OCTAVES,
    },
    name: 'liquid-ether',
    degrade: (quality) => ({
      uOctaves: quality === 'low' ? LOW_OCTAVES : OCTAVES,
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

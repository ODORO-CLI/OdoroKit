/**
 * Comet: a bright head trailing the cursor at a lag, tail to the wind.
 *
 * ## What this background reacts to
 *
 * To pointer movement, with a deliberately slow damping: the comet catches
 * up with the cursor, and its tail points opposite the catch-up velocity —
 * the component derives that velocity from the damped point and hands it
 * over as a uniform. Comet arrived, velocity zero, tail out: nothing is
 * left but the flickering head.
 *
 * ## The pointer → shader bridge
 *
 * No React render per frame: position and velocity are copied into two
 * stable arrays by a subscription to the engine clock, and the surface
 * re-reads its uniforms every frame — mutating is enough. The velocity is
 * itself smoothed by one notch, without which the tail would shiver at the
 * least sampling noise.
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

import { usePointerDamped } from '@registre/hooks/usePointerDamped'

import { COMET_FRAGMENT } from './comet.shader.js'

/** What the escape hatch receives. */
export interface CometControls {
  /** Colours actually handed to the shader. */
  readonly colours: readonly ShaderColour[]
  /** Reason for the refusal, if there is one. */
  readonly refused: string | undefined
}

/** Properties specific to this component. */
export interface CometOwnProps {
  /** Radius of the head. @defaultValue 0.07 */
  size?: number
  /** Length of the tail. @defaultValue 0.45 */
  tail?: number
  /** Lag of the comet: higher means more trailing. @defaultValue 1 */
  lag?: number
  /** Tokens whose colours are read. */
  colors?: readonly string[]
  /** Fallback classes. */
  fallback?: string
  /** Escape hatch. */
  onReady?: ReadyCallback<CometControls>
}

/** Every property. */
export type CometProps = Customisable<CometOwnProps>

/** Tokens used by default: the sky, the tail, the head. */
const DEFAULT_TOKENS = [
  '--o-theme-bg',
  '--o-palette-violet-400',
  '--o-palette-amber-200',
] as const

/** Default fallback: a frozen gradient, in the same tones. */
const DEFAULT_FALLBACK =
  'o-bg-gradient-to-b o-from-zinc-50 dark:o-from-indigo-950 o-to-violet-950'

/**
 * Comet.
 *
 * @example
 * <div className="o-relative o-min-h-screen">
 *   <Comet className="o-absolute o-inset-0" />
 *   <main className="o-relative">…</main>
 * </div>
 */
export function Comet({
  size = 0.07,
  tail = 0.45,
  lag = 1,
  colors = DEFAULT_TOKENS,
  fallback = DEFAULT_FALLBACK,
  onReady,
  ...rest
}: CometProps): ReactElement {
  const [host, setHost] = useState<HTMLDivElement | null>(null)

  // Stable arrays, mutated in place in the loop: no setState per frame.
  const uPointer = useRef<number[]>([0.5, 0.5]).current
  const uVelocity = useRef<number[]>([0, 0]).current

  // The lag is an inverted damping speed: lag 1 gives the slow catch-up
  // (speed 2) that makes the tail exist at all.
  const pointer = usePointerDamped({
    host,
    speed: 2 / Math.max(lag, 0.1),
    name: 'comet : pointer',
  })

  useEffect(() => {
    let previousX = 0.5
    let previousY = 0.5

    const subscription = clock.subscribe(
      ({ delta }) => {
        // From the hook's frame (centred, y downwards) to the texture's frame.
        const x = (pointer.current.x + 1) / 2
        const y = 1 - (pointer.current.y + 1) / 2

        // Velocity of the damped point, smoothed by one notch: raw, it would
        // carry the sampling noise and the tail would shiver.
        const dt = Math.max(delta, 1 / 240)
        const vx = uVelocity[0] ?? 0
        const vy = uVelocity[1] ?? 0
        uVelocity[0] = vx + ((x - previousX) / dt - vx) * 0.25
        uVelocity[1] = vy + ((y - previousY) / dt - vy) * 0.25

        uPointer[0] = x
        uPointer[1] = y
        previousX = x
        previousY = y
      },
      { priority: CLOCK_PRIORITY.input, name: 'comet : bridge' },
    )
    return () => subscription.unsubscribe()
  }, [pointer, uPointer, uVelocity])

  const {
    ref,
    setHost: setShaderHost,
    ready,
    refused,
    colours,
  } = useTokenShader<HTMLDivElement>({
    fragment: COMET_FRAGMENT,
    colors,
    uniforms: { uPointer, uVelocity, uSize: size, uTail: tail },
    name: 'comet',
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

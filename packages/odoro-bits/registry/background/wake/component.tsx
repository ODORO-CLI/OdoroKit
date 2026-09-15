/**
 * Wake: the cursor leaves a bright trail that dies out.
 *
 * ## What this background reacts to
 *
 * To the pointer moving: the engine loop samples its position — one sample
 * every 40 ms or so, and only if it has moved past a threshold — into a
 * circular buffer of sixteen dated deposits. Each deposit is a glow that dies
 * out with age: the trail follows the gesture and fades behind it.
 *
 * The pointer damping is deliberately dry (speed 9): too damped, the wake
 * would draw the smoothed version of the gesture, not the gesture.
 *
 * ## The pointer → shader bridge
 *
 * No React render per frame: the buffer is a stable array of forty-eight
 * floats (sixteen times x, y, deposit time), mutated in place in the clock
 * subscription. The surface re-reads its uniforms every frame — the mutation
 * is enough. The deposits are dated with the engine clock's time, the same as
 * the shader's `uTime`.
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

import { usePointerDamped } from '@registre/hooks/usePointerDamped'

import { WAKE_FRAGMENT } from './wake.shader.js'

/** What the escape hatch receives. */
export interface WakeControls {
  /** Colours actually handed to the shader. */
  readonly colours: readonly ShaderColour[]
  /** Reason for the refusal, if there is one. */
  readonly refused: string | undefined
}

/** Props specific to this component. */
export interface WakeOwnProps {
  /** Lifetime of a deposit, in seconds. @defaultValue 1.2 */
  life?: number
  /** Radius of the trail glows. @defaultValue 0.08 */
  size?: number
  /** Tokens whose colours are read. */
  colors?: readonly string[]
  /** Fallback classes. */
  fallback?: string
  /** Escape hatch. */
  onReady?: ReadyCallback<WakeControls>
}

/** All props. */
export type WakeProps = Customisable<WakeOwnProps>

/** Tokens used by default: the background, the trail, its fresh core. */
const DEFAULT_TOKENS = [
  '--o-theme-bg',
  '--o-palette-teal-400',
  '--o-palette-emerald-200',
] as const

/** Default fallback: a frozen gradient, in the same tones. */
const DEFAULT_FALLBACK =
  'o-bg-gradient-to-b o-from-zinc-50 dark:o-from-zinc-950 o-to-teal-950'

/** Number of deposits alive at any one time. */
const SLOTS = 16

/** Minimum interval between two deposits, in seconds. */
const DEPOSIT_EVERY = 0.04

/** Minimum travel between two deposits, in texture coordinates. */
const DEPOSIT_THRESHOLD = 0.012

/**
 * Wake.
 *
 * @example
 * <div className="o-relative o-min-h-screen">
 *   <Wake className="o-absolute o-inset-0" />
 *   <main className="o-relative">…</main>
 * </div>
 */
export function Wake({
  life = 1.2,
  size = 0.08,
  colors = DEFAULT_TOKENS,
  fallback = DEFAULT_FALLBACK,
  onReady,
  ...rest
}: WakeProps): ReactElement {
  const [host, setHost] = useState<HTMLDivElement | null>(null)

  // Stable buffer, mutated in place: sixteen times (x, y, deposit time). A
  // deposit at -1000 gives an enormous age, hence a glow inert from the start.
  const uTrail = useRef<number[]>(Array.from({ length: SLOTS * 3 }, () => -1000)).current

  // Speed 9: almost the raw pointer. Slow damping would draw the smoothed
  // version of the gesture, and the wake would not really follow.
  const pointer = usePointerDamped({ host, speed: 9, name: 'wake : pointer' })

  useEffect(() => {
    let lastDeposit = -1000
    let lastX = 0.5
    let lastY = 0.5

    const subscription = clock.subscribe(
      ({ time }) => {
        const x = (pointer.current.x + 1) / 2
        const y = 1 - (pointer.current.y + 1) / 2

        // One deposit per interval, and only if the pointer has moved: at
        // rest, the trail dies out instead of piling up in place.
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
      { priority: CLOCK_PRIORITY.input, name: 'wake : deposits' },
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
    fragment: WAKE_FRAGMENT,
    colors,
    uniforms: { uTrail, uLife: life, uSize: size },
    name: 'wake',
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

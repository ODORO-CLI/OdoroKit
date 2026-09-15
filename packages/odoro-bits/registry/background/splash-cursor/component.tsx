/**
 * Splashes: the pointer sows blots of paint that open out
 * then fade away.
 *
 * ## What this background reacts to
 *
 * To the movement of the pointer: the engine loop samples its position
 * — one sample every 90 ms or so, and only if it has moved by a clear
 * threshold — into a ring buffer of ten dated blots. A blot opens out
 * quickly, settles, then dies away with age.
 *
 * What sets this entry apart from `wake`: there the trail is a run of
 * gaussian glows that blend into a continuous stroke; here each deposit is
 * a blot with a lumpy outline, larger, more widely spaced, and its hue is
 * drawn between two colours — the gesture leaves marks, not a thread. And
 * from `ink`, which answers only to the click and covers the whole frame.
 *
 * ## The pointer → shader bridge
 *
 * No React render per frame: the buffer is a stable array of thirty
 * floats (ten times x, y, deposit time), mutated in place inside the
 * clock subscription. The surface re-reads its uniforms every frame — the
 * mutation is enough. The deposits are dated with the engine clock's time,
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

import { SPLASH_CURSOR_FRAGMENT } from './splash-cursor.shader.js'

/** What the escape hatch receives. */
export interface SplashCursorControls {
  /** Colours actually handed to the shader. */
  readonly colours: readonly ShaderColour[]
  /** Reason for the refusal, if there is one. */
  readonly refused: string | undefined
}

/** Props specific to this component. */
export interface SplashCursorOwnProps {
  /** Lifetime of a blot, in seconds. @defaultValue 1.8 */
  life?: number
  /** Radius of a blot, in frame heights. @defaultValue 0.16 */
  size?: number
  /** Irregularity of the outline, between zero and one. @defaultValue 0.6 */
  lobes?: number
  /** Tokens whose colours are read. */
  colors?: readonly string[]
  /** Fallback classes. */
  fallback?: string
  /** Escape hatch. */
  onReady?: ReadyCallback<SplashCursorControls>
}

/** All props. */
export type SplashCursorProps = Customisable<SplashCursorOwnProps>

/** Tokens used by default: the background, and the two paint hues. */
const DEFAULT_TOKENS = [
  '--o-theme-bg',
  '--o-palette-rose-500',
  '--o-palette-amber-400',
] as const

/** Default fallback: a frozen gradient, in the same tones. */
const DEFAULT_FALLBACK =
  'o-bg-gradient-to-br o-from-zinc-50 dark:o-from-zinc-950 o-to-rose-100 dark:o-to-rose-950'

/** Number of blots alive at once. The shader expects exactly that many. */
const SLOTS = 10

/** Minimum interval between two deposits, in seconds. */
const DEPOSIT_EVERY = 0.09

/**
 * Minimum movement between two deposits, in texture coordinates.
 *
 * Clearer-cut than that of a continuous trail: two blots stuck together
 * would read as a single puddle.
 */
const DEPOSIT_THRESHOLD = 0.05

/**
 * Splashes.
 *
 * @example
 * <div className="o-relative o-min-h-screen">
 *   <SplashCursor className="o-absolute o-inset-0" />
 *   <main className="o-relative">…</main>
 * </div>
 */
export function SplashCursor({
  life = 1.8,
  size = 0.16,
  lobes = 0.6,
  colors = DEFAULT_TOKENS,
  fallback = DEFAULT_FALLBACK,
  onReady,
  ...rest
}: SplashCursorProps): ReactElement {
  const [host, setHost] = useState<HTMLDivElement | null>(null)

  // Stable buffer, mutated in place: ten times (x, y, deposit time). A deposit
  // at -1000 gives a huge age, hence a blot that is dead from the start.
  const uSplash = useRef<number[]>(Array.from({ length: SLOTS * 3 }, () => -1000)).current

  // Speed 8: almost the raw pointer. A blot has to land where the gesture
  // goes, not where its smoothed version will go.
  const pointer = usePointerDamped({ host, speed: 8, name: 'splash-cursor : pointer' })

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
          uSplash[i * 3] = uSplash[(i - 1) * 3] ?? -1000
          uSplash[i * 3 + 1] = uSplash[(i - 1) * 3 + 1] ?? -1000
          uSplash[i * 3 + 2] = uSplash[(i - 1) * 3 + 2] ?? -1000
        }
        uSplash[0] = x
        uSplash[1] = y
        uSplash[2] = time

        lastDeposit = time
        lastX = x
        lastY = y
      },
      { priority: CLOCK_PRIORITY.input, name: 'splash-cursor : deposits' },
    )
    return () => subscription.unsubscribe()
  }, [pointer, uSplash])

  const {
    ref,
    setHost: setShaderHost,
    ready,
    refused,
    colours,
  } = useTokenShader<HTMLDivElement>({
    fragment: SPLASH_CURSOR_FRAGMENT,
    colors,
    uniforms: { uSplash, uLife: life, uSize: size, uLobes: lobes },
    name: 'splash-cursor',
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

/**
 * Plasma ball: filaments that snake from the electrode to the glass, and that
 * a finger on the globe draws in.
 *
 * ## What this background reacts to
 *
 * To pointer movement, with damping: as it comes near the globe, the main
 * filament reaches towards it as towards a finger laid on the glass, and the
 * others pale. On leaving the frame, the hook brings the target back to the
 * centre — the centre is the electrode, where a touch does not show — and the
 * filaments take up their drift again.
 *
 * What sets this entry apart from `plasma`: that one is a sheet of sines
 * covering the whole frame; here there is an object, a globe with its glass,
 * its electrode and its filaments.
 *
 * ## The pointer → shader bridge
 *
 * No React render per frame: the damped position is copied into a stable array
 * by a subscription to the engine clock, and the surface re-reads its uniforms
 * every frame — the mutation is enough.
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

import { PLASMA_BALL_FRAGMENT } from './plasma-ball.shader.js'

/** What the escape hatch receives. */
export interface PlasmaBallControls {
  /** Colours actually handed to the shader. */
  readonly colours: readonly ShaderColour[]
  /** Reason for the refusal, if there is one. */
  readonly refused: string | undefined
}

/** Props specific to this component. */
export interface PlasmaBallOwnProps {
  /** Number of filaments. Capped at ten by the shader. @defaultValue 7 */
  filaments?: number
  /** Radius of the globe, in frame heights. @defaultValue 0.38 */
  radius?: number
  /** Speed of the drift and of the rippling. @defaultValue 1 */
  speed?: number
  /** Strength with which the pointer draws in the main filament. @defaultValue 0.8 */
  pull?: number
  /** Tokens whose colours are read. */
  colors?: readonly string[]
  /** Fallback classes. */
  fallback?: string
  /** Escape hatch. */
  onReady?: ReadyCallback<PlasmaBallControls>
}

/** All props. */
export type PlasmaBallProps = Customisable<PlasmaBallOwnProps>

/** Tokens used by default: the background, the glow, the core. */
const DEFAULT_TOKENS = [
  '--o-theme-bg',
  '--o-palette-purple-500',
  '--o-palette-pink-300',
] as const

/** Default fallback: a frozen halo, in the same tones. */
const DEFAULT_FALLBACK =
  'o-bg-gradient-to-t o-from-zinc-50 dark:o-from-zinc-950 o-via-purple-200 dark:o-via-purple-950 o-to-zinc-50 dark:o-to-zinc-950'

/**
 * Plasma ball.
 *
 * @example
 * <div className="o-relative o-min-h-screen">
 *   <PlasmaBall className="o-absolute o-inset-0" filaments={9} />
 *   <main className="o-relative">…</main>
 * </div>
 */
export function PlasmaBall({
  filaments = 7,
  radius = 0.38,
  speed = 1,
  pull = 0.8,
  colors = DEFAULT_TOKENS,
  fallback = DEFAULT_FALLBACK,
  onReady,
  ...rest
}: PlasmaBallProps): ReactElement {
  const [host, setHost] = useState<HTMLDivElement | null>(null)

  // Stable array, mutated in place in the loop: no setState per frame.
  const uPointer = useRef<number[]>([0, 0]).current

  const pointer = usePointerDamped({ host, speed: 5, name: 'plasma-ball : pointer' })

  useEffect(() => {
    const subscription = clock.subscribe(
      () => {
        // The shader receives the hook's frame as it is: centred, y downwards.
        uPointer[0] = pointer.current.x
        uPointer[1] = pointer.current.y
      },
      { priority: CLOCK_PRIORITY.input, name: 'plasma-ball : bridge' },
    )
    return () => subscription.unsubscribe()
  }, [pointer, uPointer])

  const {
    ref,
    setHost: setShaderHost,
    ready,
    refused,
    colours,
  } = useTokenShader<HTMLDivElement>({
    fragment: PLASMA_BALL_FRAGMENT,
    colors,
    uniforms: {
      uPointer,
      uFilaments: filaments,
      uRadius: radius,
      uSpeed: speed,
      uPull: pull,
    },
    name: 'plasma-ball',
    // Every filament costs two noise reads and three exponentials per pixel:
    // at low quality, there are fewer of them.
    degrade: (quality) => ({
      uFilaments: quality === 'low' ? Math.min(filaments, 4) : filaments,
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

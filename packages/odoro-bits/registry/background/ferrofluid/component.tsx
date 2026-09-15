/**
 * Ferrofluid: a magnetic pool whose spikes rise under the
 * pointer.
 *
 * ## The principle
 *
 * A hexagonal lattice of cones, drawn from three cosines at a hundred and
 * twenty degrees, whose exponent grows with the nearness of the magnet:
 * soft mounds far off, needles beneath. The relief is evaluated three times
 * and its gradient serves as the normal — a black fluid is seen only by its highlights.
 *
 * ## What this background reacts to
 *
 * To pointer movement, with damping: the magnet follows it, the pool moves
 * with it and the spikes rise under it. On leaving the frame, the hook
 * brings the target back to the centre — the fluid returns there on its own.
 *
 * ## The pointer → shader bridge
 *
 * No React render per frame: the component mutates a stable array in place
 * passed as a uniform, and the surface re-reads its uniforms every frame. The
 * copy happens inside the engine loop, at input priority.
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

import { FERROFLUID_FRAGMENT } from './ferrofluid.shader.js'

/** What the escape hatch receives. */
export interface FerrofluidControls {
  /** Colours actually handed to the shader. */
  readonly colours: readonly ShaderColour[]
  /** Reason for the refusal, if there is one. */
  readonly refused: string | undefined
}

/** Properties specific to this component. */
export interface FerrofluidOwnProps {
  /** Number of spikes per frame height. @defaultValue 14 */
  spikes?: number
  /** Reach of the magnet, in frame heights. @defaultValue 0.35 */
  reach?: number
  /** Height of the spikes under the magnet. @defaultValue 0.8 */
  height?: number
  /** Strength of the highlight. @defaultValue 0.7 */
  gloss?: number
  /** Tokens whose colours are read. */
  colors?: readonly string[]
  /** Fallback classes. */
  fallback?: string
  /** Escape hatch. */
  onReady?: ReadyCallback<FerrofluidControls>
}

/** Every property. */
export type FerrofluidProps = Customisable<FerrofluidOwnProps>

/**
 * Tokens used by default: the tray, the fluid, the highlight.
 *
 * The fluid takes the theme's ink: dark on a light background, light on a
 * dark one. It is the contrast that counts, not the black.
 */
const DEFAULT_TOKENS = ['--o-theme-bg', '--o-theme-fg', '--o-palette-brand-500'] as const

/** Default fallback: a pool frozen at the centre, in the same tones. */
const DEFAULT_FALLBACK =
  'o-bg-gradient-to-br o-from-zinc-50 dark:o-from-zinc-950 o-via-zinc-800 dark:o-via-zinc-200 o-to-zinc-50 dark:o-to-zinc-950'

/**
 * Noise on the pool's edge, removed at low quality.
 *
 * The edge is the shader's only noise, and it is read three times — once
 * per evaluation of the relief. Removing it makes the edge circular, which
 * barely shows; keeping it costs three noises per fragment.
 */
const DETAIL = 1

/** Edge noise at low quality. */
const LOW_DETAIL = 0

/**
 * Ferrofluid.
 *
 * @example
 * <div className="o-relative o-min-h-screen">
 *   <Ferrofluid className="o-absolute o-inset-0" />
 *   <main className="o-relative">…</main>
 * </div>
 */
export function Ferrofluid({
  spikes = 14,
  reach = 0.35,
  height = 0.8,
  gloss = 0.7,
  colors = DEFAULT_TOKENS,
  fallback = DEFAULT_FALLBACK,
  onReady,
  ...rest
}: FerrofluidProps): ReactElement {
  const [host, setHost] = useState<HTMLDivElement | null>(null)

  // Stable array, mutated in place: the surface re-reads the uniforms every
  // frame, the identity never changes, mutating is enough — no setState.
  const uPointer = useRef<number[]>([0.5, 0.5]).current

  // A slow catch-up: the fluid has inertia, it does not jump.
  const pointer = usePointerDamped({ host, speed: 2.5, name: 'ferrofluid : pointer' })

  useEffect(() => {
    const subscription = clock.subscribe(
      () => {
        // From the hook's frame (centred, y downwards) to the texture's frame
        // (bottom-left corner, y upwards).
        uPointer[0] = (pointer.current.x + 1) / 2
        uPointer[1] = 1 - (pointer.current.y + 1) / 2
      },
      { priority: CLOCK_PRIORITY.input, name: 'ferrofluid : bridge' },
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
    fragment: FERROFLUID_FRAGMENT,
    colors,
    uniforms: {
      uPointer,
      uSpikes: spikes,
      uReach: reach,
      uHeight: height,
      uGloss: gloss,
      uDetail: DETAIL,
    },
    name: 'ferrofluid',
    degrade: (quality) => ({
      uDetail: quality === 'low' ? LOW_DETAIL : DETAIL,
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

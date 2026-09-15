/**
 * Prismatic burst: rays that turn around a focus and shift their hue around the turn, crossed by rings that travel away.
 *
 * ## The principle
 *
 * Radial rays like crepuscular rays, but they turn, their hue rotates
 * between two tokens according to the angle, and rings leave the focus
 * lifting the rays they cross on their way. The angular noise stays a
 * sum of sines at integer frequencies, so that the turn closes back on
 * itself with no seam.
 *
 * ## What this component delegates
 *
 * It carries only what sets it apart: its shader, its settings and its fallback.
 * Reading the tokens, converting them to floats and re-reading them when the
 * theme changes all come from the engine — copying that here would leave as many
 * versions to maintain as there are backgrounds.
 *
 * The fallback is not a precaution: it is shown while the backend loads, when
 * WebGL is missing, when the arbiter refuses the surface — it grants only one per
 * backend — and under reduced motion.
 *
 * @module
 */

import {
  mergePresentation,
  useOnReady,
  useTokenShader,
  type Customisable,
  type ReadyCallback,
  type ShaderColour,
} from '@odoro-cli/engine'
import { type ReactElement } from 'react'

import { PRISMATIC_BURST_FRAGMENT } from './prismatic-burst.shader.js'

/** What the escape hatch receives. */
export interface PrismaticBurstControls {
  /** Colours actually handed to the shader. */
  readonly colours: readonly ShaderColour[]
  /** Reason for the refusal, if there is one. */
  readonly refused: string | undefined
}

/** Props specific to this component. */
export interface PrismaticBurstOwnProps {
  /** Horizontal position of the focus, as a fraction of the frame. @defaultValue 0.5 */
  x?: number
  /** Vertical position of the focus, as a fraction of the frame. @defaultValue 0.5 */
  y?: number
  /** Number of rays around the turn. @defaultValue 10 */
  spokes?: number
  /** Speed of the rotation and of the pulses. @defaultValue 0.5 */
  speed?: number
  /** Strength of the rings leaving the focus. @defaultValue 0.6 */
  burst?: number
  /** Tokens whose colours are read. */
  colors?: readonly string[]
  /** Fallback classes. */
  fallback?: string
  /** Escape hatch. */
  onReady?: ReadyCallback<PrismaticBurstControls>
}

/** All props. */
export type PrismaticBurstProps = Customisable<PrismaticBurstOwnProps>

/** Tokens used by default: the background, the two hues of the rays. */
const DEFAULT_TOKENS = [
  '--o-theme-bg',
  '--o-palette-fuchsia-500',
  '--o-palette-cyan-400',
] as const

/** Default fallback: a frozen gradient, in the same tones. */
const DEFAULT_FALLBACK =
  'o-bg-gradient-to-br o-from-fuchsia-200 dark:o-from-fuchsia-900 o-via-zinc-50 dark:o-via-zinc-950 o-to-cyan-200 dark:o-to-cyan-900'

/**
 * Detail outside low quality.
 *
 * The number of rays is a frequency, not a loop: it costs nothing at
 * all. It is the harmonics of the angular noise that are bounded.
 */
const DETAIL = 3

/** Detail at low quality. */
const LOW_DETAIL = 1

/**
 * Prismatic burst.
 *
 * @example
 * <div className="o-relative o-min-h-screen">
 *   <PrismaticBurst className="o-absolute o-inset-0" />
 *   <main className="o-relative">…</main>
 * </div>
 */
export function PrismaticBurst({
  x = 0.5,
  y = 0.5,
  spokes = 10,
  speed = 0.5,
  burst = 0.6,
  colors = DEFAULT_TOKENS,
  fallback = DEFAULT_FALLBACK,
  onReady,
  ...rest
}: PrismaticBurstProps): ReactElement {
  const { ref, setHost, ready, refused, colours } = useTokenShader<HTMLDivElement>({
    fragment: PRISMATIC_BURST_FRAGMENT,
    colors,
    uniforms: {
      uX: x,
      uY: y,
      uSpokes: spokes,
      uSpeed: speed,
      uBurst: burst,
      uDetail: DETAIL,
    },
    name: 'prismatic-burst',
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

/**
 * Floating lines: thin curved segments that drift and cross.
 *
 * ## The principle
 *
 * Each line is a segment of finite length, laid in a frame of its own: a
 * centre that drifts in a Lissajous figure, a tilt that oscillates around a
 * diagonal, ends that fade out. Nothing is traced: the fragment projects
 * onto the axis and the normal of each segment.
 *
 * What sets this entry apart from its cousins: the lines are diagonal and of
 * finite length, they drift freely instead of rippling in place, and the
 * rhythm is very slow — it is the crossing of two halos that makes the
 * event, not the movement.
 *
 * ## What this component delegates
 *
 * It carries only what sets it apart: its shader, its settings and its fallback.
 * Reading the tokens, converting them to floats and re-reading them when the
 * theme changes all come from the engine — copying them here would leave as
 * many versions to maintain as there are backgrounds.
 *
 * The fallback is not a precaution: it is shown while the backend loads, when
 * WebGL is missing, when the arbiter refuses the surface — it grants only one
 * per backend — and under reduced motion.
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

import { FLOATING_LINES_FRAGMENT } from './floating-lines.shader.js'

/** What the escape hatch receives. */
export interface FloatingLinesControls {
  /** Colours actually handed to the shader. */
  readonly colours: readonly ShaderColour[]
  /** Reason for the refusal, if there is one. */
  readonly refused: string | undefined
}

/** Properties specific to this component. */
export interface FloatingLinesOwnProps {
  /** Number of lines. Capped at ten by the shader. @defaultValue 7 */
  count?: number
  /** Speed of the drift. @defaultValue 0.3 */
  speed?: number
  /** Length of the segments, in frame heights. @defaultValue 0.6 */
  length?: number
  /** Width of the halo around the stroke. @defaultValue 0.03 */
  glow?: number
  /** Tokens whose colours are read. */
  colors?: readonly string[]
  /** Fallback classes. */
  fallback?: string
  /** Escape hatch. */
  onReady?: ReadyCallback<FloatingLinesControls>
}

/** Every property. */
export type FloatingLinesProps = Customisable<FloatingLinesOwnProps>

/** Tokens used by default: the background, the halo, the core of the stroke. */
const DEFAULT_TOKENS = ['--o-theme-bg', '--o-theme-muted', '--o-palette-sky-400'] as const

/** Default fallback: a frozen hue, in the same tones. */
const DEFAULT_FALLBACK = 'o-bg-zinc-50 dark:o-bg-zinc-950'

/**
 * Number of lines at low quality.
 *
 * Each line costs a projection, a sine and an exponential per fragment: it
 * is the only lever on cost, and it degrades without touching the
 * shader.
 */
const LOW_COUNT = 4

/**
 * Floating lines.
 *
 * @example
 * <div className="o-relative o-min-h-screen">
 *   <FloatingLines className="o-absolute o-inset-0" />
 *   <main className="o-relative">…</main>
 * </div>
 */
export function FloatingLines({
  count = 7,
  speed = 0.3,
  length = 0.6,
  glow = 0.03,
  colors = DEFAULT_TOKENS,
  fallback = DEFAULT_FALLBACK,
  onReady,
  ...rest
}: FloatingLinesProps): ReactElement {
  const { ref, setHost, ready, refused, colours } = useTokenShader<HTMLDivElement>({
    fragment: FLOATING_LINES_FRAGMENT,
    colors,
    uniforms: { uCount: count, uSpeed: speed, uLength: length, uGlow: glow },
    name: 'floating-lines',
    degrade: (quality) => ({
      uCount: quality === 'low' ? Math.min(count, LOW_COUNT) : count,
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

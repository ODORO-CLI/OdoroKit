/**
 * Threads: a bundle of thin curves, of constant thickness along their whole length.
 *
 * ## The principle
 *
 * Each thread is a y = f(x); the fragment compares its own y with the thread's. No stroke exists at all.
 *
 * Dividing by the slope is not a detail: without it, the thread looks thick where it is flat and thin where it climbs.
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
  THREADS_FRAGMENT,
  mergePresentation,
  useOnReady,
  useTokenShader,
  type Customisable,
  type ReadyCallback,
  type ShaderColour,
} from '@odoro-cli/engine'
import { type ReactElement } from 'react'

/** What the escape hatch receives. */
export interface ThreadsControls {
  /** Colours actually handed to the shader. */
  readonly colours: readonly ShaderColour[]
  /** Reason for the refusal, if there is one. */
  readonly refused: string | undefined
}

/** Props specific to this component. */
export interface ThreadsOwnProps {
  /** Speed of the undulation. @defaultValue 0.3 */
  speed?: number
  /** Number of threads. Capped at twelve by the shader. @defaultValue 7 */
  count?: number
  /** Thickness of the threads. @defaultValue 0.004 */
  thickness?: number
  /** Tokens whose colours are read. */
  colors?: readonly string[]
  /** Fallback classes. */
  fallback?: string
  /** Escape hatch. */
  onReady?: ReadyCallback<ThreadsControls>
}

/** All props. */
export type ThreadsProps = Customisable<ThreadsOwnProps>

/** Tokens used by default. */
const DEFAULT_TOKENS = ['--o-theme-bg', '--o-palette-emerald-300'] as const

/** Default fallback: a frozen tint, in the same tones. */
const DEFAULT_FALLBACK = 'o-bg-zinc-50 dark:o-bg-zinc-950'

/**
 * Threads.
 *
 * @example
 * <div className="o-relative o-min-h-screen">
 *   <Threads className="o-absolute o-inset-0" />
 *   <main className="o-relative">…</main>
 * </div>
 */
export function Threads({
  speed = 0.3,
  count = 7,
  thickness = 0.004,
  colors = DEFAULT_TOKENS,
  fallback = DEFAULT_FALLBACK,
  onReady,
  ...rest
}: ThreadsProps): ReactElement {
  const { ref, setHost, ready, refused, colours } = useTokenShader<HTMLDivElement>({
    fragment: THREADS_FRAGMENT,
    colors,
    uniforms: { uSpeed: speed, uScale: count, uThickness: thickness },
    name: 'threads',
    // At low quality the setting that weighs is capped: the pattern stays
    // recognisable once reduced.
    degrade: (quality) => ({
      uScale: quality === 'low' ? Math.min(count, 4) : count,
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

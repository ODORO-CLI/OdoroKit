/**
 * Flowing sand: streams of grains falling onto a heap.
 *
 * ## The principle
 *
 * No sheet: a fine grid whose every cell draws a grain by lot. A stream is
 * that grid scrolling downwards, at its own speed, with a density that frays
 * out far from the axis; the heap, at the bottom, is the same grid held
 * still, under a profile of mounds raised by each stream. The grains vanish
 * at the surface of the heap, and a little dust rises there.
 *
 * What sets this entry apart from `dunes`: that one is a lit relief, a
 * continuous surface; here everything is grain, and everything falls.
 *
 * ## What this component delegates
 *
 * It carries only what sets it apart: its shader, its settings and its fallback.
 * Reading the tokens, converting them to floats and re-reading them when the
 * theme changes all come from the engine.
 *
 * The fallback is shown while the backend loads, when WebGL is missing, when
 * the arbiter refuses the surface and under reduced motion.
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

import { SAND_FLOW_FRAGMENT } from './sand-flow.shader.js'

/** What the escape hatch receives. */
export interface SandFlowControls {
  /** Colours actually handed to the shader. */
  readonly colours: readonly ShaderColour[]
  /** Reason for the refusal, if there is one. */
  readonly refused: string | undefined
}

/** Props specific to this component. */
export interface SandFlowOwnProps {
  /** Number of streams. Bounded at six by the shader. @defaultValue 3 */
  streams?: number
  /** Number of grains per frame height. @defaultValue 110 */
  grain?: number
  /** Falling speed. @defaultValue 1 */
  speed?: number
  /** Height of the heap, in frame heights. @defaultValue 0.22 */
  heap?: number
  /** Tokens whose colours are read. */
  colors?: readonly string[]
  /** Fallback classes. */
  fallback?: string
  /** Escape hatch. */
  onReady?: ReadyCallback<SandFlowControls>
}

/** All props. */
export type SandFlowProps = Customisable<SandFlowOwnProps>

/** Tokens used by default: the background, the sand, the bright grains. */
const DEFAULT_TOKENS = [
  '--o-theme-bg',
  '--o-palette-amber-500',
  '--o-palette-yellow-200',
] as const

/** Default fallback: the heap frozen into a gradient, in the same tones. */
const DEFAULT_FALLBACK =
  'o-bg-gradient-to-t o-from-amber-300 dark:o-from-amber-900 o-via-zinc-50 dark:o-via-zinc-950 o-to-zinc-50 dark:o-to-zinc-950'

/**
 * Flowing sand.
 *
 * @example
 * <div className="o-relative o-min-h-screen">
 *   <SandFlow className="o-absolute o-inset-0" streams={4} />
 *   <main className="o-relative">…</main>
 * </div>
 */
export function SandFlow({
  streams = 3,
  grain = 110,
  speed = 1,
  heap = 0.22,
  colors = DEFAULT_TOKENS,
  fallback = DEFAULT_FALLBACK,
  onReady,
  ...rest
}: SandFlowProps): ReactElement {
  const { ref, setHost, ready, refused, colours } = useTokenShader<HTMLDivElement>({
    fragment: SAND_FLOW_FRAGMENT,
    colors,
    uniforms: { uStreams: streams, uGrain: grain, uSpeed: speed, uHeap: heap },
    name: 'sand-flow',
    // A grain finer than the pixel shimmers at a reduced density: at low
    // quality, the grains grow rather than disappear.
    degrade: (quality) => ({
      uGrain: quality === 'low' ? Math.min(grain, 70) : grain,
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

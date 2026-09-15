/**
 * Printed circuit: traces drawn tile by tile, pads at their ends, and
 * pulses running along them.
 *
 * ## The principle
 *
 * Each tile draws a straight stroke or an elbow; two neighbours that open
 * towards each other join up on their own, and an edge open on one side
 * only carries a pad. No path is built. The pulses run along the axis of
 * each trace, with one seed per row or column so that they do not pulse
 * in chorus.
 *
 * What sets this entry apart from `maze`: pads at the ends, right-angled
 * elbows, and pulses rather than a head that draws; and from `truchet`:
 * nothing pivots, the traces are fixed and travelled along.
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

import { CIRCUIT_FRAGMENT } from './circuit.shader.js'

/** What the escape hatch receives. */
export interface CircuitControls {
  /** Colours actually handed to the shader. */
  readonly colours: readonly ShaderColour[]
  /** Reason for the refusal, if there is one. */
  readonly refused: string | undefined
}

/** Properties specific to this component. */
export interface CircuitOwnProps {
  /** Number of tiles across the height. Capped at forty by the shader. @defaultValue 10 */
  cells?: number
  /** Trace thickness, as a fraction of a tile. @defaultValue 0.08 */
  width?: number
  /** Pulse speed. @defaultValue 1 */
  speed?: number
  /** Share of the traces lit at any given instant. Zero puts them out. @defaultValue 0.5 */
  pulses?: number
  /** Tokens whose colours are read. */
  colors?: readonly string[]
  /** Fallback classes. */
  fallback?: string
  /** Escape hatch. */
  onReady?: ReadyCallback<CircuitControls>
}

/** Every property. */
export type CircuitProps = Customisable<CircuitOwnProps>

/** Tokens used by default: the substrate, the traces, the pulses. */
const DEFAULT_TOKENS = [
  '--o-theme-bg',
  '--o-theme-line',
  '--o-palette-emerald-400',
] as const

/** Default fallback: a frozen hue, in the same tones. */
const DEFAULT_FALLBACK = 'o-bg-zinc-50 dark:o-bg-zinc-950'

/**
 * Printed circuit.
 *
 * @example
 * <div className="o-relative o-min-h-screen">
 *   <Circuit className="o-absolute o-inset-0" />
 *   <main className="o-relative">…</main>
 * </div>
 */
export function Circuit({
  cells = 10,
  width = 0.08,
  speed = 1,
  pulses = 0.5,
  colors = DEFAULT_TOKENS,
  fallback = DEFAULT_FALLBACK,
  onReady,
  ...rest
}: CircuitProps): ReactElement {
  const { ref, setHost, ready, refused, colours } = useTokenShader<HTMLDivElement>({
    fragment: CIRCUIT_FRAGMENT,
    colors,
    uniforms: { uCells: cells, uWidth: width, uSpeed: speed, uPulses: pulses },
    name: 'circuit',
    // Thin traces on small tiles shimmer at reduced pixel density: at low
    // quality the tiles grow wider.
    degrade: (quality) => ({
      uCells: quality === 'low' ? Math.min(cells, 6) : cells,
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

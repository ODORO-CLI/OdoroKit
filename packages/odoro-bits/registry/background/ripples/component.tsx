/**
 * Drops: trains of damped rings that interfere.
 *
 * ## The principle
 *
 * Each drop is a sine of the distance to its centre, faded out by an exponential of that same distance; the waves sum together and interfere.
 *
 * The centres are drawn from the rank of the drop, never from the time: the pattern is stable, only the wave travels.
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

import { RIPPLES_FRAGMENT } from './ripples.shader.js'

/** What the escape hatch receives. */
export interface RipplesControls {
  /** Colours actually handed to the shader. */
  readonly colours: readonly ShaderColour[]
  /** Reason for the refusal, if there is one. */
  readonly refused: string | undefined
}

/** Props specific to this component. */
export interface RipplesOwnProps {
  /** Speed at which the rings propagate. @defaultValue 1 */
  speed?: number
  /** Number of drops. @defaultValue 6 */
  drops?: number
  /** Damping: the higher it is, the closer the rings stay to the centre. @defaultValue 2.5 */
  decay?: number
  /** Tokens whose colours are read. */
  colors?: readonly string[]
  /** Fallback classes. */
  fallback?: string
  /** Escape hatch. */
  onReady?: ReadyCallback<RipplesControls>
}

/** All props. */
export type RipplesProps = Customisable<RipplesOwnProps>

/** Tokens used by default: the water at rest, the crests, the troughs. */
const DEFAULT_TOKENS = [
  '--o-theme-bg',
  '--o-palette-cyan-400',
  '--o-palette-teal-300',
] as const

/** Default fallback: a frozen gradient, in the same tones. */
const DEFAULT_FALLBACK =
  'o-bg-gradient-to-b o-from-zinc-50 dark:o-from-sky-950 o-to-zinc-50 dark:o-to-zinc-950'

/**
 * Drops.
 *
 * @example
 * <div className="o-relative o-min-h-screen">
 *   <Ripples className="o-absolute o-inset-0" />
 *   <main className="o-relative">…</main>
 * </div>
 */
export function Ripples({
  speed = 1,
  drops = 6,
  decay = 2.5,
  colors = DEFAULT_TOKENS,
  fallback = DEFAULT_FALLBACK,
  onReady,
  ...rest
}: RipplesProps): ReactElement {
  const { ref, setHost, ready, refused, colours } = useTokenShader<HTMLDivElement>({
    fragment: RIPPLES_FRAGMENT,
    colors,
    uniforms: { uSpeed: speed, uDrops: drops, uDecay: decay },
    name: 'ripples',
    // Each drop adds one sine and one exponential per fragment: it is the
    // setting that weighs, so it is the one that is bounded.
    degrade: (quality) => ({
      uDrops: quality === 'low' ? Math.min(drops, 3) : drops,
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

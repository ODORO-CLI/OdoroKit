/**
 * Dot field: a grid of breathing discs.
 *
 * ## What this component brings, and what it delegates
 *
 * It carries only what sets it apart: its shader, its settings and its fallback.
 * Reading the tokens, converting them to floats and re-reading them when the
 * theme changes all come from the engine — copying them here would leave as
 * many versions to maintain as there are backgrounds.
 *
 * ## The fallback is not a precaution
 *
 * It is half the component. It is shown while the backend loads, when WebGL is
 * missing, when the arbiter refuses the surface — it grants only one per
 * backend — and under reduced motion, where an animated background brings
 * nothing but its motion.
 *
 * @module
 */

import {
  DOTS_FRAGMENT,
  mergePresentation,
  useOnReady,
  useTokenShader,
  type Customisable,
  type ReadyCallback,
  type ShaderColour,
} from '@odoro-cli/engine'
import { type ReactElement } from 'react'

/** What the escape hatch receives. */
export interface DotsControls {
  /** Colours actually handed to the shader. */
  readonly colours: readonly ShaderColour[]
  /** Reason for the refusal, if there is one. */
  readonly refused: string | undefined
}

/** Properties specific to this component. */
export interface DotsOwnProps {
  /** Speed of the breathing. @defaultValue 1.2 */
  speed?: number
  /** Number of dots across the width. @defaultValue 14 */
  density?: number
  /** Dot size, as a fraction of the cell. @defaultValue 0.18 */
  radius?: number
  /** Tokens whose colours are read. */
  colors?: readonly string[]
  /** Fallback classes. */
  fallback?: string
  /** Escape hatch. */
  onReady?: ReadyCallback<DotsControls>
}

/** Every property. */
export type DotsProps = Customisable<DotsOwnProps>

/** Tokens used by default. */
const DEFAULT_TOKENS = [
  '--o-theme-bg',
  '--o-palette-brand-500',
  '--o-palette-fuchsia-500',
] as const

/** Default fallback: a frozen gradient, in the same tones. */
const DEFAULT_FALLBACK = 'o-bg-zinc-50 dark:o-bg-zinc-950'

/**
 * Dot field: a grid of breathing discs.
 *
 * @example
 * <div className="o-relative o-min-h-screen">
 *   <Dots className="o-absolute o-inset-0" />
 *   <main className="o-relative">…</main>
 * </div>
 */
export function Dots({
  speed = 1.2,
  density = 14,
  radius = 0.18,
  colors = DEFAULT_TOKENS,
  fallback = DEFAULT_FALLBACK,
  onReady,
  ...rest
}: DotsProps): ReactElement {
  const { ref, setHost, ready, refused, colours } = useTokenShader<HTMLDivElement>({
    fragment: DOTS_FRAGMENT,
    colors,
    uniforms: { uSpeed: speed, uScale: density, uRadius: radius },
    name: 'dots',
    // At low quality the density is capped: it is the only setting that really
    // weighs, and the pattern stays recognisable once reduced.
    degrade: (quality) => ({
      uScale: quality === 'low' ? Math.min(density, 8) : density,
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

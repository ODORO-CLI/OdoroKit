/**
 * Bubbles: discs that rise and merge into a neck as they draw close.
 *
 * ## The principle
 *
 * Adding fields that fall off with distance, then thresholding the sum: that is the principle of implicit surfaces.
 *
 * The field equals one on the disc's edge, so an isolated bubble recovers exactly its nominal size.
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
  BUBBLES_FRAGMENT,
  mergePresentation,
  useOnReady,
  useTokenShader,
  type Customisable,
  type ReadyCallback,
  type ShaderColour,
} from '@odoro-cli/engine'
import { type ReactElement } from 'react'

/** What the escape hatch receives. */
export interface BubblesControls {
  /** Colours actually handed to the shader. */
  readonly colours: readonly ShaderColour[]
  /** Reason for the refusal, if there is one. */
  readonly refused: string | undefined
}

/** Properties specific to this component. */
export interface BubblesOwnProps {
  /** Rising speed. @defaultValue 0.25 */
  speed?: number
  /** Number of bubbles. Capped at sixteen by the shader. @defaultValue 9 */
  count?: number
  /** Reference radius. @defaultValue 0.09 */
  radius?: number
  /** Tokens whose colours are read. */
  colors?: readonly string[]
  /** Fallback classes. */
  fallback?: string
  /** Escape hatch. */
  onReady?: ReadyCallback<BubblesControls>
}

/** Every property. */
export type BubblesProps = Customisable<BubblesOwnProps>

/** Tokens used by default. */
const DEFAULT_TOKENS = ['--o-theme-bg', '--o-palette-fuchsia-600'] as const

/** Default fallback: a frozen hue, in the same tones. */
const DEFAULT_FALLBACK =
  'o-bg-gradient-to-t o-from-fuchsia-950 o-to-zinc-50 dark:o-to-zinc-950'

/**
 * Bubbles.
 *
 * @example
 * <div className="o-relative o-min-h-screen">
 *   <Bubbles className="o-absolute o-inset-0" />
 *   <main className="o-relative">…</main>
 * </div>
 */
export function Bubbles({
  speed = 0.25,
  count = 9,
  radius = 0.09,
  colors = DEFAULT_TOKENS,
  fallback = DEFAULT_FALLBACK,
  onReady,
  ...rest
}: BubblesProps): ReactElement {
  const { ref, setHost, ready, refused, colours } = useTokenShader<HTMLDivElement>({
    fragment: BUBBLES_FRAGMENT,
    colors,
    uniforms: { uSpeed: speed, uScale: count, uRadius: radius },
    name: 'bubbles',
    // At low quality the setting that weighs is capped: the pattern stays
    // recognisable once reduced.
    degrade: (quality) => ({
      uScale: quality === 'low' ? Math.min(count, 6) : count,
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

/**
 * Rain: vertical trails, one speed per column.
 *
 * ## The principle
 *
 * Space is cut into columns that scroll independently. A drop is not an object: it is an attenuation as a function of the distance to its head.
 *
 * The coordinate is folded onto the whole column: a drop that leaves through the bottom comes back in at the top without anyone having to create it.
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
  RAIN_FRAGMENT,
  mergePresentation,
  useOnReady,
  useTokenShader,
  type Customisable,
  type ReadyCallback,
  type ShaderColour,
} from '@odoro-cli/engine'
import { type ReactElement } from 'react'

/** What the escape hatch receives. */
export interface RainControls {
  /** Colours actually handed to the shader. */
  readonly colours: readonly ShaderColour[]
  /** Reason for the refusal, if there is one. */
  readonly refused: string | undefined
}

/** Props specific to this component. */
export interface RainOwnProps {
  /** Falling speed. @defaultValue 0.6 */
  speed?: number
  /** Number of columns. @defaultValue 60 */
  columns?: number
  /** Length of the trails. @defaultValue 0.35 */
  length?: number
  /** Tokens whose colours are read. */
  colors?: readonly string[]
  /** Fallback classes. */
  fallback?: string
  /** Escape hatch. */
  onReady?: ReadyCallback<RainControls>
}

/** All props. */
export type RainProps = Customisable<RainOwnProps>

/** Tokens used by default. */
const DEFAULT_TOKENS = ['--o-theme-bg', '--o-palette-sky-300'] as const

/** Default fallback: a frozen tint, in the same tones. */
const DEFAULT_FALLBACK =
  'o-bg-gradient-to-b o-from-zinc-50 dark:o-from-zinc-950 o-to-zinc-50 dark:o-to-sky-950'

/**
 * Rain.
 *
 * @example
 * <div className="o-relative o-min-h-screen">
 *   <Rain className="o-absolute o-inset-0" />
 *   <main className="o-relative">…</main>
 * </div>
 */
export function Rain({
  speed = 0.6,
  columns = 60,
  length = 0.35,
  colors = DEFAULT_TOKENS,
  fallback = DEFAULT_FALLBACK,
  onReady,
  ...rest
}: RainProps): ReactElement {
  const { ref, setHost, ready, refused, colours } = useTokenShader<HTMLDivElement>({
    fragment: RAIN_FRAGMENT,
    colors,
    uniforms: { uSpeed: speed, uScale: columns, uLength: length },
    name: 'rain',
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

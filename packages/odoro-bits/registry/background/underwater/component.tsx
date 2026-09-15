/**
 * Underwater: rays of light that sway, and bubbles that rise.
 *
 * ## The principle
 *
 * The rays converge towards a point above the frame — nearly parallel, they
 * open out on the way down — and die away with depth. The bubbles rise in
 * columns, a thin ring and a highlight dot, over two depths. Distinct from
 * the caustics, which are the net on the floor of the pool, and from the
 * bubbles on their own, which merge at the neck.
 *
 * ## What this component delegates
 *
 * It carries only what sets it apart: its shader, its settings and its
 * fallback. Reading the tokens, converting them to floats and re-reading them
 * when the theme changes all come from the engine.
 *
 * The fallback is not a precaution: it is shown while the backend loads, when
 * WebGL is missing, when the arbiter refuses the surface and under reduced
 * motion.
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

import { UNDERWATER_FRAGMENT } from './underwater.shader.js'

/** What the escape hatch receives. */
export interface UnderwaterControls {
  /** Colours actually handed to the shader. */
  readonly colours: readonly ShaderColour[]
  /** Reason for the refusal, if there is one. */
  readonly refused: string | undefined
}

/** Props specific to this component. */
export interface UnderwaterOwnProps {
  /** Speed of the sway and of the rise. @defaultValue 1 */
  speed?: number
  /** Number of rays over the width. @defaultValue 6 */
  rays?: number
  /** Number of bubble columns over the height. Zero removes them. @defaultValue 8 */
  bubbles?: number
  /** Tokens whose colours are read. */
  colors?: readonly string[]
  /** Fallback classes. */
  fallback?: string
  /** Escape hatch. */
  onReady?: ReadyCallback<UnderwaterControls>
}

/** All props. */
export type UnderwaterProps = Customisable<UnderwaterOwnProps>

/** Tokens used by default: the background, the light, the depth. */
const DEFAULT_TOKENS = [
  '--o-theme-bg',
  '--o-palette-cyan-300',
  '--o-palette-sky-600',
] as const

/** Default fallback: a frozen gradient, in the same tones. */
const DEFAULT_FALLBACK =
  'o-bg-gradient-to-b o-from-zinc-50 dark:o-from-zinc-950 o-to-sky-200 dark:o-to-sky-900'

/**
 * Underwater.
 *
 * @example
 * <div className="o-relative o-min-h-screen">
 *   <Underwater className="o-absolute o-inset-0" />
 *   <main className="o-relative">…</main>
 * </div>
 */
export function Underwater({
  speed = 1,
  rays = 6,
  bubbles = 8,
  colors = DEFAULT_TOKENS,
  fallback = DEFAULT_FALLBACK,
  onReady,
  ...rest
}: UnderwaterProps): ReactElement {
  const { ref, setHost, ready, refused, colours } = useTokenShader<HTMLDivElement>({
    fragment: UNDERWATER_FRAGMENT,
    colors,
    uniforms: { uSpeed: speed, uRays: rays, uBubbles: bubbles },
    name: 'underwater',
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

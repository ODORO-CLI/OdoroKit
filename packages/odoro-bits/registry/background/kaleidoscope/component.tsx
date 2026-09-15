/**
 * Kaleidoscope: an animated noise folded into symmetrical sectors.
 *
 * ## The principle
 *
 * The pixel's angle is brought back modulo 2pi/n then mirrored about the
 * middle of the sector: every sector reads the same domain, and a plain
 * fractal noise becomes symmetrical without any symmetry being drawn. A slow
 * rotation turns the whole thing.
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

import { KALEIDOSCOPE_FRAGMENT } from './kaleidoscope.shader.js'

/** What the escape hatch receives. */
export interface KaleidoscopeControls {
  /** Colours actually handed to the shader. */
  readonly colours: readonly ShaderColour[]
  /** Reason for the refusal, if there is one. */
  readonly refused: string | undefined
}

/** Properties specific to this component. */
export interface KaleidoscopeOwnProps {
  /** Rotation and noise drift speed. @defaultValue 0.15 */
  speed?: number
  /** Number of sectors in the fold. @defaultValue 6 */
  segments?: number
  /** Noise scale. Higher is finer. @defaultValue 2.5 */
  scale?: number
  /** Tokens whose colours are read. */
  colors?: readonly string[]
  /** Fallback classes. */
  fallback?: string
  /** Escape hatch. */
  onReady?: ReadyCallback<KaleidoscopeControls>
}

/** Every property. */
export type KaleidoscopeProps = Customisable<KaleidoscopeOwnProps>

/** Tokens used by default: the background, the sheets, the highlights. */
const DEFAULT_TOKENS = [
  '--o-theme-bg',
  '--o-palette-purple-500',
  '--o-palette-pink-300',
] as const

/** Default fallback: a frozen gradient, in the same tones. */
const DEFAULT_FALLBACK =
  'o-bg-gradient-to-br o-from-zinc-50 dark:o-from-zinc-950 o-to-purple-950'

/**
 * Kaleidoscope.
 *
 * @example
 * <div className="o-relative o-min-h-screen">
 *   <Kaleidoscope className="o-absolute o-inset-0" />
 *   <main className="o-relative">…</main>
 * </div>
 */
export function Kaleidoscope({
  speed = 0.15,
  segments = 6,
  scale = 2.5,
  colors = DEFAULT_TOKENS,
  fallback = DEFAULT_FALLBACK,
  onReady,
  ...rest
}: KaleidoscopeProps): ReactElement {
  const { ref, setHost, ready, refused, colours } = useTokenShader<HTMLDivElement>({
    fragment: KALEIDOSCOPE_FRAGMENT,
    colors,
    uniforms: { uSpeed: speed, uSegments: segments, uScale: scale, uDetail: 4 },
    name: 'kaleidoscope',
    // The fold costs nothing, and neither do the sectors: the weight sits in
    // the octaves of the two noise reads, so those are what gets capped.
    degrade: (quality) => ({
      uDetail: quality === 'low' ? 2 : 4,
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

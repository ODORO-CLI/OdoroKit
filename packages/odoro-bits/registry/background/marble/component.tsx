/**
 * Marble: fine veins in a thrice-warped noise, almost motionless.
 *
 * ## The principle
 *
 * Three chained noises, each displacing the domain of the next: the tight folds
 * of a stone that flowed before it set. The veins are the zeros of a sine of
 * the result, thinned by a power — fine and continuous, not blotches. Time
 * enters only the first storey, very slowly.
 *
 * ## What this component delegates
 *
 * It carries only what sets it apart: its shader, its settings and its
 * fallback. Reading the tokens, converting them to floats and re-reading them
 * when the theme changes all come from the engine — copying that here would
 * leave as many versions to maintain as there are backgrounds.
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

import { MARBLE_FRAGMENT } from './marble.shader.js'

/** What the escape hatch receives. */
export interface MarbleControls {
  /** Colours actually handed to the shader. */
  readonly colours: readonly ShaderColour[]
  /** Reason for the refusal, if there is one. */
  readonly refused: string | undefined
}

/** Props specific to this component. */
export interface MarbleOwnProps {
  /** Speed of the warp. @defaultValue 0.03 */
  speed?: number
  /** Scale of the pattern. Higher is finer. @defaultValue 1.2 */
  scale?: number
  /** Fineness of the veins. @defaultValue 0.6 */
  veins?: number
  /** Octaves of each noise. @defaultValue 4 */
  octaves?: number
  /** Tokens whose colours are read. */
  colors?: readonly string[]
  /** Fallback classes. */
  fallback?: string
  /** Escape hatch. */
  onReady?: ReadyCallback<MarbleControls>
}

/** All props. */
export type MarbleProps = Customisable<MarbleOwnProps>

/** Tokens used by default: the stone, the veins, the accent. */
const DEFAULT_TOKENS = [
  '--o-theme-bg',
  '--o-theme-muted',
  '--o-palette-amber-400',
] as const

/** Default fallback: a frozen tint, in the same tones. */
const DEFAULT_FALLBACK =
  'o-bg-gradient-to-br o-from-zinc-50 dark:o-from-zinc-950 o-via-zinc-200 dark:o-via-zinc-800 o-to-zinc-50 dark:o-to-zinc-950'

/**
 * Octaves at low quality.
 *
 * Five octave sums per fragment — two per warp storey, one for the matter — so
 * every octave is paid five times over. It is the only cost lever of the
 * shader.
 */
const LOW_OCTAVES = 2

/**
 * Marble.
 *
 * @example
 * <div className="o-relative o-min-h-screen">
 *   <Marble className="o-absolute o-inset-0" />
 *   <main className="o-relative">…</main>
 * </div>
 */
export function Marble({
  speed = 0.03,
  scale = 1.2,
  veins = 0.6,
  octaves = 4,
  colors = DEFAULT_TOKENS,
  fallback = DEFAULT_FALLBACK,
  onReady,
  ...rest
}: MarbleProps): ReactElement {
  const { ref, setHost, ready, refused, colours } = useTokenShader<HTMLDivElement>({
    fragment: MARBLE_FRAGMENT,
    colors,
    uniforms: { uSpeed: speed, uScale: scale, uVeins: veins, uOctaves: octaves },
    name: 'marble',
    degrade: (quality) => ({
      uOctaves: quality === 'low' ? Math.min(octaves, LOW_OCTAVES) : octaves,
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

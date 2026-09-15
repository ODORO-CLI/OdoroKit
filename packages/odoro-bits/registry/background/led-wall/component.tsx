/**
 * LED wall: a matrix of rounded dots displaying a slow gradient, one colour
 * per dot.
 *
 * ## The principle
 *
 * The displayed image is sampled at the centre of every dot: a diode has a
 * single colour. Around it the casing stays visible; a short halo spills out
 * without reaching the neighbours, and every dot has a slightly uneven
 * luminance, as on a real wall.
 *
 * What sets this entry apart from `dot-matrix` and `halftone`: here the size
 * of the dots does not vary, it is their colour which carries the image; and
 * from `dots`: the dots are tight rounded squares, not a scattering.
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

import { LED_WALL_FRAGMENT } from './led-wall.shader.js'

/** What the escape hatch receives. */
export interface LedWallControls {
  /** Colours actually handed to the shader. */
  readonly colours: readonly ShaderColour[]
  /** Reason for the refusal, if there is one. */
  readonly refused: string | undefined
}

/** Properties specific to this component. */
export interface LedWallOwnProps {
  /** Number of dots across the height. Capped at one hundred and twenty by the shader. @defaultValue 32 */
  pixels?: number
  /** Speed of the gradient. @defaultValue 0.4 */
  speed?: number
  /** Gap between the dots, as a fraction of a dot. @defaultValue 0.25 */
  gap?: number
  /** Weight of the halo around every dot. Zero puts it out. @defaultValue 0.5 */
  bloom?: number
  /** Tokens whose colours are read. */
  colors?: readonly string[]
  /** Fallback classes. */
  fallback?: string
  /** Escape hatch. */
  onReady?: ReadyCallback<LedWallControls>
}

/** Every property. */
export type LedWallProps = Customisable<LedWallOwnProps>

/** Tokens used by default: the casing, the two colours of the gradient. */
const DEFAULT_TOKENS = [
  '--o-theme-bg',
  '--o-palette-rose-500',
  '--o-palette-amber-300',
] as const

/** Default fallback: a frozen gradient, in the same tones. */
const DEFAULT_FALLBACK =
  'o-bg-gradient-to-br o-from-zinc-50 dark:o-from-zinc-950 o-to-rose-100 dark:o-to-rose-950'

/**
 * LED wall.
 *
 * @example
 * <div className="o-relative o-min-h-screen">
 *   <LedWall className="o-absolute o-inset-0" />
 *   <main className="o-relative">…</main>
 * </div>
 */
export function LedWall({
  pixels = 32,
  speed = 0.4,
  gap = 0.25,
  bloom = 0.5,
  colors = DEFAULT_TOKENS,
  fallback = DEFAULT_FALLBACK,
  onReady,
  ...rest
}: LedWallProps): ReactElement {
  const { ref, setHost, ready, refused, colours } = useTokenShader<HTMLDivElement>({
    fragment: LED_WALL_FRAGMENT,
    colors,
    uniforms: { uPixels: pixels, uSpeed: speed, uGap: gap, uBloom: bloom },
    name: 'led-wall',
    // Small dots shimmer on their corners at a reduced pixel density, and
    // their halo adds nothing there: at low quality they widen and the halo
    // goes out.
    degrade: (quality) => ({
      uPixels: quality === 'low' ? Math.min(pixels, 20) : pixels,
      uBloom: quality === 'low' ? 0 : bloom,
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

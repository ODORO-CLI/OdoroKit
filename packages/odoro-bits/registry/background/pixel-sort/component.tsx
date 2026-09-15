/**
 * Pixel sort: bands of sorted pixels that come out of the light areas of an
 * image and flow.
 *
 * ## The principle
 *
 * The real effect sorts every column of the image wherever the luminance
 * passes a threshold; here it is simulated without reading the column. Every
 * column carries segments drawn from their rank, whose luminance grows from
 * top to bottom — the gradient a sort would produce — and which appear only
 * where the background image is light enough. They scroll at unequal speeds.
 *
 * What sets this entry apart from `dither`: no dither grid, continuous
 * columns; and from `glitch-blocks`: nothing jumps, everything flows.
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

import { PIXEL_SORT_FRAGMENT } from './pixel-sort.shader.js'

/** What the escape hatch receives. */
export interface PixelSortControls {
  /** Colours actually handed to the shader. */
  readonly colours: readonly ShaderColour[]
  /** Reason for the refusal, if there is one. */
  readonly refused: string | undefined
}

/** Props specific to this component. */
export interface PixelSortOwnProps {
  /** Width of a column, in physical pixels. @defaultValue 3 */
  pixel?: number
  /** Number of segments over the height of a column. @defaultValue 5 */
  density?: number
  /** Luminance threshold above which a band comes out. @defaultValue 0.45 */
  threshold?: number
  /** Speed of the flow. @defaultValue 0.3 */
  speed?: number
  /** Tokens whose colours are read. */
  colors?: readonly string[]
  /** Fallback classes. */
  fallback?: string
  /** Escape hatch. */
  onReady?: ReadyCallback<PixelSortControls>
}

/** All props. */
export type PixelSortProps = Customisable<PixelSortOwnProps>

/** Tokens used by default: the background, the image, the top of the bands. */
const DEFAULT_TOKENS = [
  '--o-theme-bg',
  '--o-palette-sky-500',
  '--o-palette-rose-400',
] as const

/** Default fallback: a frozen gradient, in the same tones. */
const DEFAULT_FALLBACK =
  'o-bg-gradient-to-b o-from-rose-100 dark:o-from-rose-950 o-via-sky-100 dark:o-via-sky-950 o-to-zinc-50 dark:o-to-zinc-950'

/**
 * Pixel sort.
 *
 * @example
 * <div className="o-relative o-min-h-screen">
 *   <PixelSort className="o-absolute o-inset-0" />
 *   <main className="o-relative">…</main>
 * </div>
 */
export function PixelSort({
  pixel = 3,
  density = 5,
  threshold = 0.45,
  speed = 0.3,
  colors = DEFAULT_TOKENS,
  fallback = DEFAULT_FALLBACK,
  onReady,
  ...rest
}: PixelSortProps): ReactElement {
  const { ref, setHost, ready, refused, colours } = useTokenShader<HTMLDivElement>({
    fragment: PIXEL_SORT_FRAGMENT,
    colors,
    uniforms: {
      uPixel: pixel,
      uDensity: density,
      uThreshold: threshold,
      uSpeed: speed,
    },
    name: 'pixel-sort',
    // Columns one or two pixels wide crawl at reduced pixel density: at low
    // quality, they widen.
    degrade: (quality) => ({
      uPixel: quality === 'low' ? Math.max(pixel, 6) : pixel,
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

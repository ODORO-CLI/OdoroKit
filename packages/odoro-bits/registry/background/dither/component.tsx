/**
 * Dither: an animated gradient rendered as an ordered dither.
 *
 * ## Why three hues, and not a gradient
 *
 * Dithering is only of interest when the hues are few: it is the density of
 * the dots that makes the gradient, not their colour. With three hues, the
 * background keeps its grain and its flats; beyond that, it would become an
 * ordinary gradient again, slightly noisy.
 *
 * ## What this component delegates
 *
 * It carries only what sets it apart: its shader, its settings and its fallback.
 * Reading the tokens, converting them to floats and re-reading them when the
 * theme changes all come from the engine.
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

import { DITHER_FRAGMENT } from './dither.shader.js'

/** What the escape hatch receives. */
export interface DitherControls {
  /** Colours actually handed to the shader. */
  readonly colours: readonly ShaderColour[]
  /** Reason for the refusal, if there is one. */
  readonly refused: string | undefined
}

/** Properties specific to this component. */
export interface DitherOwnProps {
  /** Speed of the gradient. @defaultValue 0.3 */
  speed?: number
  /** Side of one dither pixel, in physical pixels. @defaultValue 4 */
  pixel?: number
  /** Scale of the gradient. @defaultValue 2.2 */
  scale?: number
  /** Tokens whose colours are read. */
  colors?: readonly string[]
  /** Fallback classes. */
  fallback?: string
  /** Escape hatch. */
  onReady?: ReadyCallback<DitherControls>
}

/** Every property. */
export type DitherProps = Customisable<DitherOwnProps>

/** Tokens used by default: the three hues, from the background to the lightest. */
const DEFAULT_TOKENS = [
  '--o-theme-bg',
  '--o-palette-brand-500',
  '--o-palette-indigo-500',
] as const

/** Default fallback: a frozen gradient, in the same tones. */
const DEFAULT_FALLBACK =
  'o-bg-gradient-to-br o-from-zinc-50 dark:o-from-zinc-950 o-via-brand-100 dark:o-via-brand-950 o-to-indigo-100 dark:o-to-indigo-950'

/**
 * Dither.
 *
 * @example
 * <div className="o-relative o-min-h-screen">
 *   <Dither className="o-absolute o-inset-0" />
 *   <main className="o-relative">…</main>
 * </div>
 */
export function Dither({
  speed = 0.3,
  pixel = 4,
  scale = 2.2,
  colors = DEFAULT_TOKENS,
  fallback = DEFAULT_FALLBACK,
  onReady,
  ...rest
}: DitherProps): ReactElement {
  const { ref, setHost, ready, refused, colours } = useTokenShader<HTMLDivElement>({
    fragment: DITHER_FRAGMENT,
    colors,
    uniforms: { uSpeed: speed, uPixel: pixel, uScale: scale },
    name: 'dither',
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

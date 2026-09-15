/**
 * ASCII field: a noise field rendered as characters, by ink density.
 *
 * ## The principle
 *
 * The field is sampled at the centre of every cell, quantised into ten
 * levels, and each level picks a character from the classic ramp of the
 * image-to-text converters. From afar a gradient, from up close text. The
 * glyphs are bit masks over five by seven drawn by the shader: no font, no
 * texture.
 *
 * What sets this entry apart from `dither`: the density is carried by
 * characters, not by a dither pattern; and from `code-rain`: nothing
 * falls, it is a continuous field that drifts.
 *
 * ## What this component delegates
 *
 * It carries only what sets it apart: its shader, its settings and its
 * fallback. Reading the tokens, turning them into floats and reading them
 * again when the theme changes all come from the engine — copying them out
 * here would make as many versions to maintain as there are backgrounds.
 *
 * The fallback is not a precaution: it is shown while the backend loads,
 * when WebGL is missing, when the arbiter refuses the surface — it grants
 * only one per backend — and under reduced motion.
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

import { ASCII_FIELD_FRAGMENT } from './ascii-field.shader.js'

/** What the escape hatch receives. */
export interface AsciiFieldControls {
  /** Colours actually handed to the shader. */
  readonly colours: readonly ShaderColour[]
  /** Reason for the refusal, if there is one. */
  readonly refused: string | undefined
}

/** Props belonging to the component itself. */
export interface AsciiFieldOwnProps {
  /** Number of characters across the width. Capped at two hundred by the shader. @defaultValue 80 */
  cells?: number
  /** Drift speed of the field. @defaultValue 0.25 */
  speed?: number
  /** Scale of the field. Higher means more detail. @defaultValue 3 */
  scale?: number
  /** Contrast of the field before quantisation. @defaultValue 1.4 */
  contrast?: number
  /** Tokens whose colours are read. */
  colors?: readonly string[]
  /** Classes of the fallback. */
  fallback?: string
  /** Escape hatch. */
  onReady?: ReadyCallback<AsciiFieldControls>
}

/** All the props. */
export type AsciiFieldProps = Customisable<AsciiFieldOwnProps>

/** Tokens used by default: the background, the ink, the ink of the high levels. */
const DEFAULT_TOKENS = [
  '--o-theme-bg',
  '--o-theme-muted',
  '--o-palette-brand-500',
] as const

/** Default fallback: a frozen tint, in the same tones. */
const DEFAULT_FALLBACK = 'o-bg-zinc-50 dark:o-bg-zinc-950'

/**
 * ASCII field.
 *
 * @example
 * <div className="o-relative o-min-h-screen">
 *   <AsciiField className="o-absolute o-inset-0" />
 *   <main className="o-relative">…</main>
 * </div>
 */
export function AsciiField({
  cells = 80,
  speed = 0.25,
  scale = 3,
  contrast = 1.4,
  colors = DEFAULT_TOKENS,
  fallback = DEFAULT_FALLBACK,
  onReady,
  ...rest
}: AsciiFieldProps): ReactElement {
  const { ref, setHost, ready, refused, colours } = useTokenShader<HTMLDivElement>({
    fragment: ASCII_FIELD_FRAGMENT,
    colors,
    uniforms: { uCells: cells, uSpeed: speed, uScale: scale, uContrast: contrast },
    name: 'ascii-field',
    // Glyphs five pixels wide shimmer at a reduced pixel density: at low
    // quality, the cells get wider.
    degrade: (quality) => ({
      uCells: quality === 'low' ? Math.min(cells, 48) : cells,
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

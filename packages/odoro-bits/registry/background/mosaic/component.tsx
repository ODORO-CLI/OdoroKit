/**
 * Mosaic: a noise read at the centre of each cell, and therefore quantised into tiles.
 *
 * ## The principle
 *
 * The tile exists nowhere in the computation: it appears because the field is sampled coarsely, on purpose.
 *
 * The grout between tiles is not decorative — without it, two neighbouring values blend and the grid disappears.
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
  MOSAIC_FRAGMENT,
  mergePresentation,
  useOnReady,
  useTokenShader,
  type Customisable,
  type ReadyCallback,
  type ShaderColour,
} from '@odoro-cli/engine'
import { type ReactElement } from 'react'

/** What the escape hatch receives. */
export interface MosaicControls {
  /** Colours actually handed to the shader. */
  readonly colours: readonly ShaderColour[]
  /** Reason for the refusal, if there is one. */
  readonly refused: string | undefined
}

/** Props specific to this component. */
export interface MosaicOwnProps {
  /** Speed of the field. @defaultValue 0.05 */
  speed?: number
  /** Number of tiles per side. @defaultValue 16 */
  density?: number
  /** Width of the grout. @defaultValue 0.06 */
  gap?: number
  /** Tokens whose colours are read. */
  colors?: readonly string[]
  /** Fallback classes. */
  fallback?: string
  /** Escape hatch. */
  onReady?: ReadyCallback<MosaicControls>
}

/** All props. */
export type MosaicProps = Customisable<MosaicOwnProps>

/** Tokens used by default. */
const DEFAULT_TOKENS = [
  '--o-theme-surface',
  '--o-palette-brand-600',
  '--o-palette-fuchsia-500',
] as const

/** Default fallback: a frozen tint, in the same tones. */
const DEFAULT_FALLBACK =
  'o-bg-gradient-to-br o-from-zinc-100 dark:o-from-zinc-900 o-to-brand-900'

/**
 * Mosaic.
 *
 * @example
 * <div className="o-relative o-min-h-screen">
 *   <Mosaic className="o-absolute o-inset-0" />
 *   <main className="o-relative">…</main>
 * </div>
 */
export function Mosaic({
  speed = 0.05,
  density = 16,
  gap = 0.06,
  colors = DEFAULT_TOKENS,
  fallback = DEFAULT_FALLBACK,
  onReady,
  ...rest
}: MosaicProps): ReactElement {
  const { ref, setHost, ready, refused, colours } = useTokenShader<HTMLDivElement>({
    fragment: MOSAIC_FRAGMENT,
    colors,
    uniforms: { uSpeed: speed, uScale: density, uGap: gap },
    name: 'mosaic',
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

/**
 * Bending sheets: thick sheets of colour, each in its own rotated frame, bending and crossing and brightening where they overlap.
 *
 * ## The principle
 *
 * Each sheet is a thick band around a curve of two sines, in a rotated
 * frame of its own: that is why the sheets cross instead of staying
 * parallel. Where they overlap, the sum of the coverages exceeds one, and
 * that excess becomes an added, capped glint — the sheets are translucent,
 * not cut out.
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

import { COLOR_BENDS_FRAGMENT } from './color-bends.shader.js'

/** What the escape hatch receives. */
export interface ColorBendsControls {
  /** Colours actually handed to the shader. */
  readonly colours: readonly ShaderColour[]
  /** Reason for the refusal, if there is one. */
  readonly refused: string | undefined
}

/** Properties specific to this component. */
export interface ColorBendsOwnProps {
  /** Number of sheets. @defaultValue 3 */
  sheets?: number
  /** Thickness of the sheets, as a fraction of the frame. @defaultValue 0.16 */
  thickness?: number
  /** Amplitude of the bends. @defaultValue 0.7 */
  bend?: number
  /** Speed of the movement. @defaultValue 0.3 */
  speed?: number
  /** Tokens whose colours are read. */
  colors?: readonly string[]
  /** Fallback classes. */
  fallback?: string
  /** Escape hatch. */
  onReady?: ReadyCallback<ColorBendsControls>
}

/** Every property. */
export type ColorBendsProps = Customisable<ColorBendsOwnProps>

/** Tokens used by default: the background, the first and the last sheet. */
const DEFAULT_TOKENS = [
  '--o-theme-bg',
  '--o-palette-brand-500',
  '--o-palette-violet-500',
] as const

/** Default fallback: a frozen gradient, in the same tones. */
const DEFAULT_FALLBACK =
  'o-bg-gradient-to-tr o-from-brand-200 dark:o-from-brand-900 o-via-zinc-50 dark:o-via-zinc-950 o-to-violet-200 dark:o-to-violet-900'

/**
 * Ceiling at low quality.
 *
 * Each sheet is a rotation and two sines: that is the only lever on cost.
 * At low quality, two sheets at most, whatever the setting.
 */
const LOW_CAP = 2

/**
 * Bending sheets.
 *
 * @example
 * <div className="o-relative o-min-h-screen">
 *   <ColorBends className="o-absolute o-inset-0" />
 *   <main className="o-relative">…</main>
 * </div>
 */
export function ColorBends({
  sheets = 3,
  thickness = 0.16,
  bend = 0.7,
  speed = 0.3,
  colors = DEFAULT_TOKENS,
  fallback = DEFAULT_FALLBACK,
  onReady,
  ...rest
}: ColorBendsProps): ReactElement {
  const { ref, setHost, ready, refused, colours } = useTokenShader<HTMLDivElement>({
    fragment: COLOR_BENDS_FRAGMENT,
    colors,
    uniforms: {
      uSheets: sheets,
      uThickness: thickness,
      uBend: bend,
      uSpeed: speed,
    },
    name: 'color-bends',
    degrade: (quality) => ({
      uSheets: quality === 'low' ? Math.min(sheets, LOW_CAP) : sheets,
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

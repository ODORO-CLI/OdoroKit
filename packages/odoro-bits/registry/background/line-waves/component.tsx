/**
 * Line waves: thin horizontal lines rippling with an offset phase.
 *
 * ## The principle
 *
 * One line per horizontal band, each displaced by the same swell with a phase
 * offset of its own rank. No line is ever stroked: the fragment measures its
 * distance to the curve of its own band and of its two neighbours.
 *
 * What sets this entry apart from its cousins: the stroke is thin, the rhythm
 * is slow, and the motion is horizontal — the swell runs from left to right,
 * and the phase offset between lines draws a diagonal sheet.
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

import { LINE_WAVES_FRAGMENT } from './line-waves.shader.js'

/** What the escape hatch receives. */
export interface LineWavesControls {
  /** Colours actually handed to the shader. */
  readonly colours: readonly ShaderColour[]
  /** Reason for the refusal, if there is one. */
  readonly refused: string | undefined
}

/** Props specific to this component. */
export interface LineWavesOwnProps {
  /** Number of lines. Clamped to forty-eight by the shader. @defaultValue 24 */
  count?: number
  /** Height of the swell, in band heights. @defaultValue 0.6 */
  amplitude?: number
  /** Speed of the swell. @defaultValue 0.4 */
  speed?: number
  /** Thickness of the stroke, as a fraction of the height. @defaultValue 0.0025 */
  thickness?: number
  /** Tokens whose colours are read. */
  colors?: readonly string[]
  /** Fallback classes. */
  fallback?: string
  /** Escape hatch. */
  onReady?: ReadyCallback<LineWavesControls>
}

/** All props. */
export type LineWavesProps = Customisable<LineWavesOwnProps>

/** Tokens used by default: the background, the ink, the glint of the crests. */
const DEFAULT_TOKENS = ['--o-theme-bg', '--o-theme-fg', '--o-palette-brand-500'] as const

/** Default fallback: a frozen tint, in the same tones. */
const DEFAULT_FALLBACK = 'o-bg-zinc-50 dark:o-bg-zinc-950'

/**
 * Number of lines at low quality.
 *
 * The per-fragment cost does not depend on the number of lines — three bands
 * are evaluated whatever happens. What costs is aliasing: tightly packed lines
 * at a reduced pixel density shimmer. Fewer lines, more space between them, and
 * the stroke stays crisp.
 */
const LOW_COUNT = 12

/**
 * Line waves.
 *
 * @example
 * <div className="o-relative o-min-h-screen">
 *   <LineWaves className="o-absolute o-inset-0" />
 *   <main className="o-relative">…</main>
 * </div>
 */
export function LineWaves({
  count = 24,
  amplitude = 0.6,
  speed = 0.4,
  thickness = 0.0025,
  colors = DEFAULT_TOKENS,
  fallback = DEFAULT_FALLBACK,
  onReady,
  ...rest
}: LineWavesProps): ReactElement {
  const { ref, setHost, ready, refused, colours } = useTokenShader<HTMLDivElement>({
    fragment: LINE_WAVES_FRAGMENT,
    colors,
    uniforms: {
      uCount: count,
      uAmplitude: amplitude,
      uSpeed: speed,
      uThickness: thickness,
    },
    name: 'line-waves',
    degrade: (quality) => ({
      uCount: quality === 'low' ? Math.min(count, LOW_COUNT) : count,
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

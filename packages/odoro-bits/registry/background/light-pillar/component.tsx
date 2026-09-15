/**
 * Light pillar: a vertical column that breathes: a sharp gaussian core, an endless exponential halo, streaks that climb.
 *
 * ## The principle
 *
 * A column is a distance to an axis: a narrow gaussian for the core, a
 * wide exponential for the halo, because a single curve cannot give both
 * the sharp centre and the endless trail of light. The width breathes on
 * two periods that are not multiples, and a 1D noise of the height makes
 * the light flow inside the column.
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

import { LIGHT_PILLAR_FRAGMENT } from './light-pillar.shader.js'

/** What the escape hatch receives. */
export interface LightPillarControls {
  /** Colours actually handed to the shader. */
  readonly colours: readonly ShaderColour[]
  /** Reason for the refusal, if there is one. */
  readonly refused: string | undefined
}

/** Properties specific to this component. */
export interface LightPillarOwnProps {
  /** Horizontal position of the axis, as a fraction of the frame. @defaultValue 0.5 */
  x?: number
  /** Width of the core, as a fraction of the height. @defaultValue 0.12 */
  width?: number
  /** Speed of the breathing. @defaultValue 0.6 */
  breath?: number
  /** Extent of the halo. @defaultValue 0.8 */
  glow?: number
  /** Tokens whose colours are read. */
  colors?: readonly string[]
  /** Fallback classes. */
  fallback?: string
  /** Escape hatch. */
  onReady?: ReadyCallback<LightPillarControls>
}

/** Every property. */
export type LightPillarProps = Customisable<LightPillarOwnProps>

/** Tokens used by default: the background, the halo, the core. */
const DEFAULT_TOKENS = [
  '--o-theme-bg',
  '--o-palette-sky-400',
  '--o-palette-amber-200',
] as const

/** Default fallback: a frozen gradient, in the same tones. */
const DEFAULT_FALLBACK =
  'o-bg-gradient-to-r o-from-zinc-50 dark:o-from-zinc-950 o-via-sky-200 dark:o-via-sky-900 o-to-zinc-50 dark:o-to-zinc-950'

/**
 * Detail outside low quality.
 *
 * The column costs nothing; it is the harmonics of the streaks which
 * weigh, so those are what gets capped.
 */
const DETAIL = 3

/** Detail at low quality. */
const LOW_DETAIL = 1

/**
 * Light pillar.
 *
 * @example
 * <div className="o-relative o-min-h-screen">
 *   <LightPillar className="o-absolute o-inset-0" />
 *   <main className="o-relative">…</main>
 * </div>
 */
export function LightPillar({
  x = 0.5,
  width = 0.12,
  breath = 0.6,
  glow = 0.8,
  colors = DEFAULT_TOKENS,
  fallback = DEFAULT_FALLBACK,
  onReady,
  ...rest
}: LightPillarProps): ReactElement {
  const { ref, setHost, ready, refused, colours } = useTokenShader<HTMLDivElement>({
    fragment: LIGHT_PILLAR_FRAGMENT,
    colors,
    uniforms: {
      uX: x,
      uWidth: width,
      uBreath: breath,
      uGlow: glow,
      uDetail: DETAIL,
    },
    name: 'light-pillar',
    degrade: (quality) => ({
      uDetail: quality === 'low' ? LOW_DETAIL : DETAIL,
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

/**
 * Embers: hot points that rise, twinkle and go out.
 *
 * ## The principle
 *
 * One ember per cell of a hashed grid, across three depths. The grid descends
 * column by column, so the embers each rise at their own pace. What sets them
 * apart from inverted snow: their light depends on their height in the frame —
 * full at the bottom, out before the top.
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

import { EMBERS_FRAGMENT } from './embers.shader.js'

/** What the escape hatch receives. */
export interface EmbersControls {
  /** Colours actually handed to the shader. */
  readonly colours: readonly ShaderColour[]
  /** Reason for the refusal, if there is one. */
  readonly refused: string | undefined
}

/** Properties specific to this component. */
export interface EmbersOwnProps {
  /** Speed of the rise. @defaultValue 0.5 */
  speed?: number
  /** Density of the scatter. @defaultValue 9 */
  density?: number
  /** Reach of the soft halo around each ember. @defaultValue 1 */
  glow?: number
  /** Tokens whose colours are read. */
  colors?: readonly string[]
  /** Fallback classes. */
  fallback?: string
  /** Escape hatch. */
  onReady?: ReadyCallback<EmbersControls>
}

/** Every property. */
export type EmbersProps = Customisable<EmbersOwnProps>

/** Tokens used by default: the background, the body of the embers, their tip. */
const DEFAULT_TOKENS = [
  '--o-theme-bg',
  '--o-palette-orange-500',
  '--o-palette-amber-200',
] as const

/** Default fallback: the frozen glow of the hearth, in the same tones. */
const DEFAULT_FALLBACK =
  'o-bg-gradient-to-t o-from-orange-200 dark:o-from-orange-950 o-to-zinc-50 dark:o-to-zinc-950'

/**
 * Layers outside low quality.
 *
 * Every layer walks nine cells per fragment: it is the shader's only cost
 * lever, and the farthest layer is the faintest.
 */
const LAYERS = 3

/** Layers at low quality. */
const LOW_LAYERS = 2

/**
 * Embers.
 *
 * @example
 * <div className="o-relative o-min-h-screen">
 *   <Embers className="o-absolute o-inset-0" />
 *   <main className="o-relative">…</main>
 * </div>
 */
export function Embers({
  speed = 0.5,
  density = 9,
  glow = 1,
  colors = DEFAULT_TOKENS,
  fallback = DEFAULT_FALLBACK,
  onReady,
  ...rest
}: EmbersProps): ReactElement {
  const { ref, setHost, ready, refused, colours } = useTokenShader<HTMLDivElement>({
    fragment: EMBERS_FRAGMENT,
    colors,
    uniforms: { uSpeed: speed, uDensity: density, uGlow: glow, uLayers: LAYERS },
    name: 'embers',
    degrade: (quality) => ({ uLayers: quality === 'low' ? LOW_LAYERS : LAYERS }),
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

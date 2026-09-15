/**
 * Silk: a flow obtained by displacing the domain twice over.
 *
 * ## The principle
 *
 * A fractal noise on its own gives blotches; the same noise read at a point already displaced gives swirls. Here the displacement is applied twice.
 *
 * It is the costliest of the backgrounds: every pass evaluates the noise three times. The octaves are the setting to lower.
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
  SILK_FRAGMENT,
  mergePresentation,
  useOnReady,
  useTokenShader,
  type Customisable,
  type ReadyCallback,
  type ShaderColour,
} from '@odoro-cli/engine'
import { type ReactElement } from 'react'

/** What the escape hatch receives. */
export interface SilkControls {
  /** Colours actually handed to the shader. */
  readonly colours: readonly ShaderColour[]
  /** Reason for the refusal, if there is one. */
  readonly refused: string | undefined
}

/** Props specific to this component. */
export interface SilkOwnProps {
  /** Speed of the flow. @defaultValue 0.08 */
  speed?: number
  /** Scale of the pattern. @defaultValue 1.6 */
  scale?: number
  /** Number of octaves of the noise. @defaultValue 4 */
  octaves?: number
  /** Tokens whose colours are read. */
  colors?: readonly string[]
  /** Fallback classes. */
  fallback?: string
  /** Escape hatch. */
  onReady?: ReadyCallback<SilkControls>
}

/** All props. */
export type SilkProps = Customisable<SilkOwnProps>

/** Tokens used by default. */
const DEFAULT_TOKENS = [
  '--o-theme-bg',
  '--o-palette-brand-500',
  '--o-palette-sky-300',
] as const

/** Default fallback: a frozen tint, in the same tones. */
const DEFAULT_FALLBACK =
  'o-bg-gradient-to-b o-from-zinc-50 dark:o-from-zinc-950 o-to-brand-900'

/**
 * Silk.
 *
 * @example
 * <div className="o-relative o-min-h-screen">
 *   <Silk className="o-absolute o-inset-0" />
 *   <main className="o-relative">…</main>
 * </div>
 */
export function Silk({
  speed = 0.08,
  scale = 1.6,
  octaves = 4,
  colors = DEFAULT_TOKENS,
  fallback = DEFAULT_FALLBACK,
  onReady,
  ...rest
}: SilkProps): ReactElement {
  const { ref, setHost, ready, refused, colours } = useTokenShader<HTMLDivElement>({
    fragment: SILK_FRAGMENT,
    colors,
    uniforms: { uSpeed: speed, uScale: scale, uOctaves: octaves },
    name: 'silk',
    // At low quality, the setting that weighs is bounded: the pattern stays
    // recognisable once reduced.
    degrade: (quality) => ({
      uOctaves: quality === 'low' ? Math.min(octaves, 2) : octaves,
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

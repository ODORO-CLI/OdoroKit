/**
 * Vortex: a spiral obtained by adding to the angle a quantity that decays with the radius.
 *
 * ## The principle
 *
 * In polar coordinates, a swirl is not a motion but an addition. The wound pattern is deliberately trivial: the richness comes from the twist.
 *
 * The twist is bounded at the centre; without that the central pixel would flicker on every frame.
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
  VORTEX_FRAGMENT,
  mergePresentation,
  useOnReady,
  useTokenShader,
  type Customisable,
  type ReadyCallback,
  type ShaderColour,
} from '@odoro-cli/engine'
import { type ReactElement } from 'react'

/** What the escape hatch receives. */
export interface VortexControls {
  /** Colours actually handed to the shader. */
  readonly colours: readonly ShaderColour[]
  /** Reason for the refusal, if there is one. */
  readonly refused: string | undefined
}

/** Props specific to this component. */
export interface VortexOwnProps {
  /** Rotation speed. @defaultValue 0.25 */
  speed?: number
  /** Number of arms. @defaultValue 6 */
  arms?: number
  /** Strength of the winding. @defaultValue 2.5 */
  twist?: number
  /** Tokens whose colours are read. */
  colors?: readonly string[]
  /** Fallback classes. */
  fallback?: string
  /** Escape hatch. */
  onReady?: ReadyCallback<VortexControls>
}

/** All props. */
export type VortexProps = Customisable<VortexOwnProps>

/** Tokens used by default. */
const DEFAULT_TOKENS = [
  '--o-theme-bg',
  '--o-palette-brand-600',
  '--o-palette-amber-300',
] as const

/** Default fallback: a frozen tint, in the same tones. */
const DEFAULT_FALLBACK =
  'o-bg-gradient-to-br o-from-zinc-50 dark:o-from-zinc-950 o-to-brand-900'

/**
 * Vortex.
 *
 * @example
 * <div className="o-relative o-min-h-screen">
 *   <Vortex className="o-absolute o-inset-0" />
 *   <main className="o-relative">…</main>
 * </div>
 */
export function Vortex({
  speed = 0.25,
  arms = 6,
  twist = 2.5,
  colors = DEFAULT_TOKENS,
  fallback = DEFAULT_FALLBACK,
  onReady,
  ...rest
}: VortexProps): ReactElement {
  const { ref, setHost, ready, refused, colours } = useTokenShader<HTMLDivElement>({
    fragment: VORTEX_FRAGMENT,
    colors,
    uniforms: { uSpeed: speed, uScale: arms, uTwist: twist },
    name: 'vortex',
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

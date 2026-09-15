/**
 * Beams: oblique shafts of light.
 *
 * ## What this component brings, and what it delegates
 *
 * It carries only what sets it apart: its shader, its settings and its
 * fallback. Reading the tokens, turning them into floats and reading them
 * again when the theme changes all come from the engine — copying them out
 * here would make as many versions to maintain as there are backgrounds.
 *
 * ## The fallback is not a precaution
 *
 * It is half of the component. It is shown while the backend loads, when
 * WebGL is missing, when the arbiter refuses the surface — it grants only
 * one per backend — and under reduced motion, where an animated background
 * brings nothing beyond its movement.
 *
 * @module
 */

import {
  BEAMS_FRAGMENT,
  mergePresentation,
  useOnReady,
  useTokenShader,
  type Customisable,
  type ReadyCallback,
  type ShaderColour,
} from '@odoro-cli/engine'
import { type ReactElement } from 'react'

/** What the escape hatch receives. */
export interface BeamsControls {
  /** Colours actually handed to the shader. */
  readonly colours: readonly ShaderColour[]
  /** Reason for the refusal, if there is one. */
  readonly refused: string | undefined
}

/** Props belonging to the component itself. */
export interface BeamsOwnProps {
  /** Drift speed. @defaultValue 0.35 */
  speed?: number
  /** Number of shafts. @defaultValue 9 */
  count?: number
  /** Tilt, in radians. @defaultValue 0.35 */
  angle?: number
  /** Tokens whose colours are read. */
  colors?: readonly string[]
  /** Classes of the fallback. */
  fallback?: string
  /** Escape hatch. */
  onReady?: ReadyCallback<BeamsControls>
}

/** All the props. */
export type BeamsProps = Customisable<BeamsOwnProps>

/** Tokens used by default. */
const DEFAULT_TOKENS = [
  '--o-theme-bg',
  '--o-palette-brand-500',
  '--o-palette-fuchsia-500',
] as const

/** Default fallback: a frozen gradient, in the same tones. */
const DEFAULT_FALLBACK =
  'o-bg-gradient-to-b o-from-brand-900 o-to-zinc-50 dark:o-to-zinc-950'

/**
 * Beams: oblique shafts of light.
 *
 * @example
 * <div className="o-relative o-min-h-screen">
 *   <Beams className="o-absolute o-inset-0" />
 *   <main className="o-relative">…</main>
 * </div>
 */
export function Beams({
  speed = 0.35,
  count = 9,
  angle = 0.35,
  colors = DEFAULT_TOKENS,
  fallback = DEFAULT_FALLBACK,
  onReady,
  ...rest
}: BeamsProps): ReactElement {
  const { ref, setHost, ready, refused, colours } = useTokenShader<HTMLDivElement>({
    fragment: BEAMS_FRAGMENT,
    colors,
    uniforms: { uSpeed: speed, uScale: count, uAngle: angle },
    name: 'beams',
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

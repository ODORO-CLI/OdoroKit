/**
 * Currents: filaments of noise stretched along a flow field.
 *
 * ## The principle
 *
 * A first noise at large scale gives, at every point, a flow angle; the
 * lookup point is advected along that angle, rotated into the local frame
 * and stretched — the fine noise, read in that anisotropic frame, stretches
 * into filaments that follow the field without a single line being
 * drawn.
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

import { CURRENTS_FRAGMENT } from './currents.shader.js'

/** What the escape hatch receives. */
export interface CurrentsControls {
  /** Colours actually handed to the shader. */
  readonly colours: readonly ShaderColour[]
  /** Reason for the refusal, if there is one. */
  readonly refused: string | undefined
}

/** Properties specific to this component. */
export interface CurrentsOwnProps {
  /** Advection speed. @defaultValue 0.2 */
  speed?: number
  /** Noise scale. Higher is finer. @defaultValue 3 */
  scale?: number
  /** Anisotropy. Higher means longer filaments. @defaultValue 6 */
  stretch?: number
  /** Tokens whose colours are read. */
  colors?: readonly string[]
  /** Fallback classes. */
  fallback?: string
  /** Escape hatch. */
  onReady?: ReadyCallback<CurrentsControls>
}

/** Every property. */
export type CurrentsProps = Customisable<CurrentsOwnProps>

/** Tokens used by default: the deep water, the currents, the filaments. */
const DEFAULT_TOKENS = [
  '--o-theme-bg',
  '--o-palette-teal-400',
  '--o-palette-cyan-200',
] as const

/** Default fallback: a frozen gradient, in the same tones. */
const DEFAULT_FALLBACK =
  'o-bg-gradient-to-b o-from-zinc-50 dark:o-from-blue-950 o-to-teal-950'

/**
 * Currents.
 *
 * @example
 * <div className="o-relative o-min-h-screen">
 *   <Currents className="o-absolute o-inset-0" />
 *   <main className="o-relative">…</main>
 * </div>
 */
export function Currents({
  speed = 0.2,
  scale = 3,
  stretch = 6,
  colors = DEFAULT_TOKENS,
  fallback = DEFAULT_FALLBACK,
  onReady,
  ...rest
}: CurrentsProps): ReactElement {
  const { ref, setHost, ready, refused, colours } = useTokenShader<HTMLDivElement>({
    fragment: CURRENTS_FRAGMENT,
    colors,
    uniforms: { uSpeed: speed, uScale: scale, uStretch: stretch, uDetail: 4 },
    name: 'currents',
    // The flow field keeps its three octaves — without it, no current at all.
    // It is the octaves of the fine noise that weigh, so those are the ones
    // that are capped.
    degrade: (quality) => ({
      uDetail: quality === 'low' ? 2 : 4,
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

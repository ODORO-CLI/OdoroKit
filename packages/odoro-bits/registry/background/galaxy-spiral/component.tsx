/**
 * Spiral galaxy: arms of points turning slowly around a bright
 * core.
 *
 * ## The principle
 *
 * The plane is read in polar form and twisted by the logarithm of the
 * radius: in that domain, a straight line becomes a logarithmic spiral, and
 * a cosine of the twisted angle gives the arms. The points are hashed there
 * per cell, but their halo is measured in real distance: a disc stays a disc.
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

import { GALAXY_SPIRAL_FRAGMENT } from './galaxy-spiral.shader.js'

/** What the escape hatch receives. */
export interface GalaxySpiralControls {
  /** Colours actually handed to the shader. */
  readonly colours: readonly ShaderColour[]
  /** Reason for the refusal, if there is one. */
  readonly refused: string | undefined
}

/** Properties specific to this component. */
export interface GalaxySpiralOwnProps {
  /** Speed of the rotation. @defaultValue 0.5 */
  speed?: number
  /** Number of arms. @defaultValue 2 */
  arms?: number
  /** Twist of the arms. Higher means more tightly wound. @defaultValue 3 */
  twist?: number
  /** Number of radial cells. @defaultValue 18 */
  density?: number
  /** Tokens whose colours are read. */
  colors?: readonly string[]
  /** Fallback classes. */
  fallback?: string
  /** Escape hatch. */
  onReady?: ReadyCallback<GalaxySpiralControls>
}

/** Every property. */
export type GalaxySpiralProps = Customisable<GalaxySpiralOwnProps>

/** Tokens used by default: the background, the arms, the core. */
const DEFAULT_TOKENS = [
  '--o-theme-bg',
  '--o-palette-violet-400',
  '--o-palette-amber-200',
] as const

/** Default fallback: a frozen halo, in the same tones. */
const DEFAULT_FALLBACK =
  'o-bg-gradient-to-br o-from-zinc-50 dark:o-from-zinc-950 o-via-violet-200 dark:o-via-violet-950 o-to-zinc-50 dark:o-to-zinc-950'

/**
 * Layers outside low quality.
 *
 * Each layer sweeps nine cells per fragment, with a logarithm and a cosine
 * per cell: it is the shader's only lever on cost.
 */
const LAYERS = 2

/** Layers at low quality. */
const LOW_LAYERS = 1

/**
 * Spiral galaxy.
 *
 * @example
 * <div className="o-relative o-min-h-screen">
 *   <GalaxySpiral className="o-absolute o-inset-0" />
 *   <main className="o-relative">…</main>
 * </div>
 */
export function GalaxySpiral({
  speed = 0.5,
  arms = 2,
  twist = 3,
  density = 18,
  colors = DEFAULT_TOKENS,
  fallback = DEFAULT_FALLBACK,
  onReady,
  ...rest
}: GalaxySpiralProps): ReactElement {
  const { ref, setHost, ready, refused, colours } = useTokenShader<HTMLDivElement>({
    fragment: GALAXY_SPIRAL_FRAGMENT,
    colors,
    uniforms: {
      uSpeed: speed,
      uArms: arms,
      uTwist: twist,
      uDensity: density,
      uLayers: LAYERS,
    },
    name: 'galaxy-spiral',
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

/**
 * Volumetric rays of light integrated through a haze.
 *
 * ## The principle
 *
 * The mask of the rays is a noise of the angle around the focus, but the
 * light that reaches a fragment is integrated along the ray by a march
 * towards the focus, through a haze that drifts. A thick bank puts the ray
 * out, the local haze scatters it. Distinct from the flat rays: these rays
 * have a volume and cut out behind the haze.
 *
 * ## What this component delegates
 *
 * It carries only what sets it apart: its shader, its settings and its
 * fallback. Reading the tokens, converting them to floats and re-reading them
 * when the theme changes all come from the engine.
 *
 * The fallback is not a precaution: it is shown while the backend loads, when
 * WebGL is missing, when the arbiter refuses the surface and under reduced
 * motion.
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

import { VOLUMETRIC_RAYS_FRAGMENT } from './volumetric-rays.shader.js'

/** What the escape hatch receives. */
export interface VolumetricRaysControls {
  /** Colours actually handed to the shader. */
  readonly colours: readonly ShaderColour[]
  /** Reason for the refusal, if there is one. */
  readonly refused: string | undefined
}

/** Props specific to this component. */
export interface VolumetricRaysOwnProps {
  /** Horizontal position of the focus, as a fraction of the frame. @defaultValue 0.5 */
  x?: number
  /** Vertical position of the focus, as a fraction of the frame. @defaultValue 1 */
  y?: number
  /** Number of rays around the turn. @defaultValue 10 */
  count?: number
  /** Intensity of the light. @defaultValue 1 */
  strength?: number
  /** Tokens whose colours are read. */
  colors?: readonly string[]
  /** Fallback classes. */
  fallback?: string
  /** Escape hatch. */
  onReady?: ReadyCallback<VolumetricRaysControls>
}

/** All props. */
export type VolumetricRaysProps = Customisable<VolumetricRaysOwnProps>

/** Tokens used by default: the background, the light, the haze. */
const DEFAULT_TOKENS = [
  '--o-theme-bg',
  '--o-palette-amber-300',
  '--o-palette-orange-500',
] as const

/** Default fallback: a frozen gradient, in the same tones. */
const DEFAULT_FALLBACK =
  'o-bg-gradient-to-b o-from-amber-100 dark:o-from-amber-900 o-to-zinc-50 dark:o-to-zinc-950'

/**
 * Steps of the march outside low quality.
 *
 * Every step reads the haze once: this is the only cost lever of the shader.
 * Twelve steps are enough to integrate without banding; below five, the banks
 * of haze break up.
 */
const SAMPLES = 12

/** Steps of the march at low quality. */
const LOW_SAMPLES = 5

/**
 * Volumetric rays.
 *
 * @example
 * <div className="o-relative o-min-h-screen">
 *   <VolumetricRays className="o-absolute o-inset-0" />
 *   <main className="o-relative">…</main>
 * </div>
 */
export function VolumetricRays({
  x = 0.5,
  y = 1,
  count = 10,
  strength = 1,
  colors = DEFAULT_TOKENS,
  fallback = DEFAULT_FALLBACK,
  onReady,
  ...rest
}: VolumetricRaysProps): ReactElement {
  const { ref, setHost, ready, refused, colours } = useTokenShader<HTMLDivElement>({
    fragment: VOLUMETRIC_RAYS_FRAGMENT,
    colors,
    uniforms: { uX: x, uY: y, uCount: count, uStrength: strength, uSamples: SAMPLES },
    name: 'volumetric-rays',
    degrade: (quality) => ({
      uSamples: quality === 'low' ? LOW_SAMPLES : SAMPLES,
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

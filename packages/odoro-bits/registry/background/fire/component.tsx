/**
 * Fire: continuous vertical flames, from noise that rises.
 *
 * ## The principle
 *
 * A fractal noise whose domain descends with time, stretched in height and
 * swayed sideways; the heat is that noise minus a ramp of the height, full
 * at ground level and dissolved on the way up. Two soft thresholds give the
 * body and the core. Time enters only through the displacement: the flames
 * rise, they do not flicker. Distinct from lava and from embers.
 *
 * ## What this component delegates
 *
 * It carries only what sets it apart: its shader, its settings and its fallback.
 * Reading the tokens, converting them to floats and re-reading them when the
 * theme changes all come from the engine.
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

import { FIRE_FRAGMENT } from './fire.shader.js'

/** What the escape hatch receives. */
export interface FireControls {
  /** Colours actually handed to the shader. */
  readonly colours: readonly ShaderColour[]
  /** Reason for the refusal, if there is one. */
  readonly refused: string | undefined
}

/** Properties specific to this component. */
export interface FireOwnProps {
  /** Rising speed. @defaultValue 1 */
  speed?: number
  /** Height of the flames, as a fraction of the frame. @defaultValue 0.5 */
  height?: number
  /** Fineness of the tongues. Higher is finer. @defaultValue 3 */
  scale?: number
  /** Tokens whose colours are read. */
  colors?: readonly string[]
  /** Fallback classes. */
  fallback?: string
  /** Escape hatch. */
  onReady?: ReadyCallback<FireControls>
}

/** Every property. */
export type FireProps = Customisable<FireOwnProps>

/** Tokens used by default: the background, the body of the flames, their core. */
const DEFAULT_TOKENS = [
  '--o-theme-bg',
  '--o-palette-orange-500',
  '--o-palette-yellow-300',
] as const

/** Default fallback: a frozen gradient, in the same tones. */
const DEFAULT_FALLBACK =
  'o-bg-gradient-to-t o-from-orange-100 dark:o-from-orange-950 o-to-zinc-50 dark:o-to-zinc-950'

/**
 * Noise detail outside low quality.
 *
 * Two sums of octaves per fragment, the coarse and the fine: every octave
 * is paid for twice. It is the shader's only lever on cost.
 */
const OCTAVES = 4

/** Noise detail at low quality. */
const LOW_OCTAVES = 2

/**
 * Fire.
 *
 * @example
 * <div className="o-relative o-min-h-screen">
 *   <Fire className="o-absolute o-inset-0" />
 *   <main className="o-relative">…</main>
 * </div>
 */
export function Fire({
  speed = 1,
  height = 0.5,
  scale = 3,
  colors = DEFAULT_TOKENS,
  fallback = DEFAULT_FALLBACK,
  onReady,
  ...rest
}: FireProps): ReactElement {
  const { ref, setHost, ready, refused, colours } = useTokenShader<HTMLDivElement>({
    fragment: FIRE_FRAGMENT,
    colors,
    uniforms: { uSpeed: speed, uHeight: height, uScale: scale, uOctaves: OCTAVES },
    name: 'fire',
    degrade: (quality) => ({
      uOctaves: quality === 'low' ? LOW_OCTAVES : OCTAVES,
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

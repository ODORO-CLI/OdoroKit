/**
 * Oil slick: tight iridescent fringes on a dark water.
 *
 * ## The principle
 *
 * A colour by interference, as with the soap film, but thin, twisted and laid
 * on water: the fringes are tight and separated by dark bands, coiled into
 * swirls by a noise warping the domain, and cut into lobes by a third noise —
 * between the lobes, the water ripples.
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

import { OIL_SLICK_FRAGMENT } from './oil-slick.shader.js'

/** What the escape hatch receives. */
export interface OilSlickControls {
  /** Colours actually handed to the shader. */
  readonly colours: readonly ShaderColour[]
  /** Reason for the refusal, if there is one. */
  readonly refused: string | undefined
}

/** Props specific to this component. */
export interface OilSlickOwnProps {
  /** Speed at which the slick drifts. @defaultValue 0.12 */
  speed?: number
  /** Scale of the noise. Higher is finer. @defaultValue 2.2 */
  scale?: number
  /** Density of the fringes. @defaultValue 6 */
  fringes?: number
  /** Strength of the reflections on the water. @defaultValue 0.3 */
  ripple?: number
  /** Tokens whose colours are read. */
  colors?: readonly string[]
  /** Fallback classes. */
  fallback?: string
  /** Escape hatch. */
  onReady?: ReadyCallback<OilSlickControls>
}

/** All props. */
export type OilSlickProps = Customisable<OilSlickOwnProps>

/** Tokens used by default: the water, the two hues of the fringes. */
const DEFAULT_TOKENS = [
  '--o-theme-bg',
  '--o-palette-fuchsia-500',
  '--o-palette-cyan-400',
] as const

/** Default fallback: a frozen gradient, in the same tones. */
const DEFAULT_FALLBACK =
  'o-bg-gradient-to-bl o-from-zinc-50 dark:o-from-zinc-950 o-via-fuchsia-300 dark:o-via-fuchsia-900 o-to-cyan-300 dark:o-to-cyan-900'

/**
 * Noise detail outside low quality.
 *
 * Four octave sums per fragment — two for the twist, one for the thickness, one
 * for the extent — so every octave is paid four times over. It is the only cost
 * lever, and it does not need to be a prop.
 */
const OCTAVES = 4

/** Noise detail at low quality. */
const LOW_OCTAVES = 2

/**
 * Oil slick.
 *
 * @example
 * <div className="o-relative o-min-h-screen">
 *   <OilSlick className="o-absolute o-inset-0" />
 *   <main className="o-relative">…</main>
 * </div>
 */
export function OilSlick({
  speed = 0.12,
  scale = 2.2,
  fringes = 6,
  ripple = 0.3,
  colors = DEFAULT_TOKENS,
  fallback = DEFAULT_FALLBACK,
  onReady,
  ...rest
}: OilSlickProps): ReactElement {
  const { ref, setHost, ready, refused, colours } = useTokenShader<HTMLDivElement>({
    fragment: OIL_SLICK_FRAGMENT,
    colors,
    uniforms: {
      uSpeed: speed,
      uScale: scale,
      uFringes: fringes,
      uRipple: ripple,
      uOctaves: OCTAVES,
    },
    name: 'oil-slick',
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

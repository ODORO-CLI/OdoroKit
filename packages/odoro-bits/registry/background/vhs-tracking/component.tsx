/**
 * VHS tracking: a tracking band that rolls, offset lines, streaks, and colour
 * jumps in bursts.
 *
 * ## The principle
 *
 * The picture is a gentle signal; everything else is what the tape does to
 * it. The tracking band rolls slowly, offsets every screen line and sows
 * streaks in it, drawn per line and chopped into steps. The two hues are read
 * at two spread-apart positions, far more so during the bursts; the bottom of
 * the picture carries the head switching.
 *
 * What sets this entry apart from `tv-static`: there is a picture, and a band
 * that crosses it; and from `glitch-blocks`: lines and bands that roll, not
 * rectangles that jump.
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

import { VHS_TRACKING_FRAGMENT } from './vhs-tracking.shader.js'

/** What the escape hatch receives. */
export interface VhsTrackingControls {
  /** Colours actually handed to the shader. */
  readonly colours: readonly ShaderColour[]
  /** Reason for the refusal, if there is one. */
  readonly refused: string | undefined
}

/** Props specific to this component. */
export interface VhsTrackingOwnProps {
  /** Speed of the tracking band. @defaultValue 1 */
  speed?: number
  /** Height of the band, as a fraction of the picture. @defaultValue 0.14 */
  band?: number
  /** Spread of the hues. Zero switches it off. @defaultValue 0.6 */
  split?: number
  /** Amount of streaks in the band. @defaultValue 0.5 */
  noise?: number
  /** Tokens whose colours are read. */
  colors?: readonly string[]
  /** Fallback classes. */
  fallback?: string
  /** Escape hatch. */
  onReady?: ReadyCallback<VhsTrackingControls>
}

/** All props. */
export type VhsTrackingProps = Customisable<VhsTrackingOwnProps>

/** Tokens used by default: the background, the two hues of the signal. */
const DEFAULT_TOKENS = [
  '--o-theme-bg',
  '--o-palette-fuchsia-500',
  '--o-palette-cyan-400',
] as const

/** Default fallback: a frozen gradient, in the same tones. */
const DEFAULT_FALLBACK =
  'o-bg-gradient-to-br o-from-fuchsia-100 dark:o-from-fuchsia-950 o-via-zinc-50 dark:o-via-zinc-950 o-to-cyan-100 dark:o-to-cyan-950'

/**
 * VHS tracking.
 *
 * @example
 * <div className="o-relative o-min-h-screen">
 *   <VhsTracking className="o-absolute o-inset-0" />
 *   <main className="o-relative">…</main>
 * </div>
 */
export function VhsTracking({
  speed = 1,
  band = 0.14,
  split = 0.6,
  noise = 0.5,
  colors = DEFAULT_TOKENS,
  fallback = DEFAULT_FALLBACK,
  onReady,
  ...rest
}: VhsTrackingProps): ReactElement {
  const { ref, setHost, ready, refused, colours } = useTokenShader<HTMLDivElement>({
    fragment: VHS_TRACKING_FRAGMENT,
    colors,
    uniforms: { uSpeed: speed, uBand: band, uSplit: split, uNoise: noise },
    name: 'vhs-tracking',
    // The spread of the hues costs a second read of the signal, and turns
    // into plain blur at a reduced pixel density: at low quality, it is off.
    degrade: (quality) => ({
      uSplit: quality === 'low' ? 0 : split,
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

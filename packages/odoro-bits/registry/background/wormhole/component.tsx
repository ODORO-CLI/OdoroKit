/**
 * Twisted vortex: a corridor whose ribs wind into a helix, which pivots, and
 * whose hue turns around the wall.
 *
 * ## The principle
 *
 * Depth is the inverse of the radius, as in the tunnel; but the angle is
 * twisted with depth, the whole thing pivots with time and the vanishing
 * point wanders. The walls carry six helical ribs, bands that advance, and a
 * hue that slides from one colour to the other.
 *
 * What sets this entry apart from `tunnel`: the twist, the rotation, the
 * moving vanishing point, and two hues instead of one. The tunnel is a
 * straight, monochrome corridor; this is a vortex.
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

import { WORMHOLE_FRAGMENT } from './wormhole.shader.js'

/** What the escape hatch receives. */
export interface WormholeControls {
  /** Colours actually handed to the shader. */
  readonly colours: readonly ShaderColour[]
  /** Reason for the refusal, if there is one. */
  readonly refused: string | undefined
}

/** Props specific to this component. */
export interface WormholeOwnProps {
  /** Speed of travel. @defaultValue 0.5 */
  speed?: number
  /** Twist of the ribs with depth. @defaultValue 1 */
  twist?: number
  /** Rotation speed of the whole. @defaultValue 0.3 */
  spin?: number
  /** Density of the depth bands. @defaultValue 8 */
  rings?: number
  /** Tokens whose colours are read. */
  colors?: readonly string[]
  /** Fallback classes. */
  fallback?: string
  /** Escape hatch. */
  onReady?: ReadyCallback<WormholeControls>
}

/** All props. */
export type WormholeProps = Customisable<WormholeOwnProps>

/** Tokens used by default: the background, the two hues of the walls. */
const DEFAULT_TOKENS = [
  '--o-theme-bg',
  '--o-palette-fuchsia-500',
  '--o-palette-cyan-400',
] as const

/** Default fallback: a frozen gradient, in the same tones. */
const DEFAULT_FALLBACK =
  'o-bg-gradient-to-br o-from-zinc-50 dark:o-from-zinc-950 o-to-fuchsia-100 dark:o-to-fuchsia-950'

/**
 * Twisted vortex.
 *
 * @example
 * <div className="o-relative o-min-h-screen">
 *   <Wormhole className="o-absolute o-inset-0" />
 *   <main className="o-relative">…</main>
 * </div>
 */
export function Wormhole({
  speed = 0.5,
  twist = 1,
  spin = 0.3,
  rings = 8,
  colors = DEFAULT_TOKENS,
  fallback = DEFAULT_FALLBACK,
  onReady,
  ...rest
}: WormholeProps): ReactElement {
  const { ref, setHost, ready, refused, colours } = useTokenShader<HTMLDivElement>({
    fragment: WORMHOLE_FRAGMENT,
    colors,
    uniforms: { uSpeed: speed, uTwist: twist, uSpin: spin, uRings: rings },
    name: 'wormhole',
    // Tight bands in the distance beat against the pixel grid at a reduced
    // density: at low quality, they spread apart.
    degrade: (quality) => ({
      uRings: quality === 'low' ? Math.min(rings, 5) : rings,
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

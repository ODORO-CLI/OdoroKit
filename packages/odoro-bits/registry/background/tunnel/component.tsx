/**
 * Tunnel: a perspective obtained by setting z = 1/r, with no camera and no
 * matrix.
 *
 * ## The principle
 *
 * In a cylindrical corridor, the distance along the axis is inversely
 * proportional to the apparent radius. The division is enough.
 *
 * The attenuation into the distance is not decorative: it puts out the
 * vanishing point before it beats against the pixel grid.
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
  TUNNEL_FRAGMENT,
  mergePresentation,
  useOnReady,
  useTokenShader,
  type Customisable,
  type ReadyCallback,
  type ShaderColour,
} from '@odoro-cli/engine'
import { type ReactElement } from 'react'

/** What the escape hatch receives. */
export interface TunnelControls {
  /** Colours actually handed to the shader. */
  readonly colours: readonly ShaderColour[]
  /** Reason for the refusal, if there is one. */
  readonly refused: string | undefined
}

/** Props specific to this component. */
export interface TunnelOwnProps {
  /** Speed of the advance. @defaultValue 0.25 */
  speed?: number
  /** Spacing of the rings. @defaultValue 0.6 */
  rings?: number
  /** Number of sectors. @defaultValue 12 */
  segments?: number
  /** Tokens whose colours are read. */
  colors?: readonly string[]
  /** Fallback classes. */
  fallback?: string
  /** Escape hatch. */
  onReady?: ReadyCallback<TunnelControls>
}

/** All props. */
export type TunnelProps = Customisable<TunnelOwnProps>

/** Tokens used by default. */
const DEFAULT_TOKENS = ['--o-theme-bg', '--o-palette-sky-400'] as const

/** Default fallback: a frozen tint, in the same tones. */
const DEFAULT_FALLBACK = 'o-bg-zinc-50 dark:o-bg-zinc-950'

/**
 * Tunnel.
 *
 * @example
 * <div className="o-relative o-min-h-screen">
 *   <Tunnel className="o-absolute o-inset-0" />
 *   <main className="o-relative">…</main>
 * </div>
 */
export function Tunnel({
  speed = 0.25,
  rings = 0.6,
  segments = 12,
  colors = DEFAULT_TOKENS,
  fallback = DEFAULT_FALLBACK,
  onReady,
  ...rest
}: TunnelProps): ReactElement {
  const { ref, setHost, ready, refused, colours } = useTokenShader<HTMLDivElement>({
    fragment: TUNNEL_FRAGMENT,
    colors,
    uniforms: { uSpeed: speed, uScale: rings, uSegments: segments },
    name: 'tunnel',
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

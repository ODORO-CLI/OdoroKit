/**
 * Night drive: two lines converging towards the horizon, a dashed centre line
 * scrolling past, and street lamps approaching and going by.
 *
 * ## The principle
 *
 * The ground is projected with no camera: the depth is the inverse of the
 * distance to the horizon. The street lamps are a bounded queue, each member of
 * which advances along the road; their halo, their pole and their pool on the
 * ground are projected the same way. The lamps are mixed towards their colour,
 * never added: they stay visible on a light background.
 *
 * What sets this entry apart from `tunnel` and from `hyperspace`: you are not
 * flying towards a point, you are driving on a ground, with a horizon and a
 * sky.
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

import { NIGHT_DRIVE_FRAGMENT } from './night-drive.shader.js'

/** What the escape hatch receives. */
export interface NightDriveControls {
  /** Colours actually handed to the shader. */
  readonly colours: readonly ShaderColour[]
  /** Reason for the refusal, if there is one. */
  readonly refused: string | undefined
}

/** Props specific to this component. */
export interface NightDriveOwnProps {
  /** Speed of the road. @defaultValue 1 */
  speed?: number
  /** Half-width of the road, in world units. @defaultValue 1 */
  width?: number
  /** Number of street lamps per side. Clamped to twelve by the shader. @defaultValue 8 */
  lamps?: number
  /** Height of the street lamps, in world units. @defaultValue 0.8 */
  height?: number
  /** Tokens whose colours are read. */
  colors?: readonly string[]
  /** Fallback classes. */
  fallback?: string
  /** Escape hatch. */
  onReady?: ReadyCallback<NightDriveControls>
}

/** All props. */
export type NightDriveProps = Customisable<NightDriveOwnProps>

/** Tokens used by default: the background, the lines and the poles, the lamps. */
const DEFAULT_TOKENS = [
  '--o-theme-bg',
  '--o-theme-muted',
  '--o-palette-amber-400',
] as const

/** Default fallback: a frozen gradient, in the same tones. */
const DEFAULT_FALLBACK =
  'o-bg-gradient-to-t o-from-zinc-50 dark:o-from-zinc-950 o-to-amber-100 dark:o-to-amber-950'

/** Street lamps per side at low quality: the queue is the only cost that counts. */
const LOW_LAMPS = 5

/**
 * Night drive.
 *
 * @example
 * <div className="o-relative o-min-h-screen">
 *   <NightDrive className="o-absolute o-inset-0" />
 *   <main className="o-relative">…</main>
 * </div>
 */
export function NightDrive({
  speed = 1,
  width = 1,
  lamps = 8,
  height = 0.8,
  colors = DEFAULT_TOKENS,
  fallback = DEFAULT_FALLBACK,
  onReady,
  ...rest
}: NightDriveProps): ReactElement {
  const { ref, setHost, ready, refused, colours } = useTokenShader<HTMLDivElement>({
    fragment: NIGHT_DRIVE_FRAGMENT,
    colors,
    uniforms: { uSpeed: speed, uWidth: width, uLamps: lamps, uHeight: height },
    name: 'night-drive',
    // Every street lamp costs two halos and one pool per fragment: the queue is
    // the only lever, and it is shortened at low quality.
    degrade: (quality) => ({
      uLamps: quality === 'low' ? Math.min(lamps, LOW_LAMPS) : lamps,
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

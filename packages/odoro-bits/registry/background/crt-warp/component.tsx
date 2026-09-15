/**
 * Cathode-ray warp: a bulged tube, its glass splitting the light, its
 * aperture grille and its breathing vignette.
 *
 * ## The principle
 *
 * The bulge is read backwards, through a single formula: the centred
 * coordinates, stretched with the square of their distance to the centre.
 * The image's corners leave the frame and the silhouette becomes a
 * pincushion. Near the edges, the signal's two hues are read apart.
 *
 * What sets this entry apart from `scanlines`: no horizontal lines, no
 * rolling bar, no grain — a tube geometry, a vertical grille and a pane of
 * glass. The vignette pulls back towards the background, never towards
 * black: a tube that is off takes the colour of the theme.
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

import { CRT_WARP_FRAGMENT } from './crt-warp.shader.js'

/** What the escape hatch receives. */
export interface CrtWarpControls {
  /** Colours actually handed to the shader. */
  readonly colours: readonly ShaderColour[]
  /** Reason for the refusal, if there is one. */
  readonly refused: string | undefined
}

/** Properties specific to this component. */
export interface CrtWarpOwnProps {
  /** Bulge of the tube. Zero makes it flat. @defaultValue 0.25 */
  curve?: number
  /** Number of aperture-grille columns across the width. @defaultValue 160 */
  lines?: number
  /** Separation of the hues near the edges. @defaultValue 0.6 */
  aberration?: number
  /** Speed of the signal. @defaultValue 0.5 */
  speed?: number
  /** Tokens whose colours are read. */
  colors?: readonly string[]
  /** Fallback classes. */
  fallback?: string
  /** Escape hatch. */
  onReady?: ReadyCallback<CrtWarpControls>
}

/** Every property. */
export type CrtWarpProps = Customisable<CrtWarpOwnProps>

/** Tokens used by default: the tube switched off, the signal's two hues. */
const DEFAULT_TOKENS = [
  '--o-theme-bg',
  '--o-palette-teal-500',
  '--o-palette-orange-400',
] as const

/** Default fallback: a frozen gradient, in the same tones. */
const DEFAULT_FALLBACK =
  'o-bg-gradient-to-b o-from-zinc-50 dark:o-from-zinc-950 o-via-teal-100 dark:o-via-teal-950 o-to-zinc-50 dark:o-to-zinc-950'

/**
 * Cathode-ray warp.
 *
 * @example
 * <div className="o-relative o-min-h-screen">
 *   <CrtWarp className="o-absolute o-inset-0" />
 *   <main className="o-relative">…</main>
 * </div>
 */
export function CrtWarp({
  curve = 0.25,
  lines = 160,
  aberration = 0.6,
  speed = 0.5,
  colors = DEFAULT_TOKENS,
  fallback = DEFAULT_FALLBACK,
  onReady,
  ...rest
}: CrtWarpProps): ReactElement {
  const { ref, setHost, ready, refused, colours } = useTokenShader<HTMLDivElement>({
    fragment: CRT_WARP_FRAGMENT,
    colors,
    uniforms: { uCurve: curve, uLines: lines, uAberration: aberration, uSpeed: speed },
    name: 'crt-warp',
    // A tight grille shimmers at reduced pixel density, and the separation of
    // the hues becomes plain blur there: at low quality the grille spreads out
    // and the separation is cut.
    degrade: (quality) => ({
      uLines: quality === 'low' ? Math.min(lines, 80) : lines,
      uAberration: quality === 'low' ? 0 : aberration,
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

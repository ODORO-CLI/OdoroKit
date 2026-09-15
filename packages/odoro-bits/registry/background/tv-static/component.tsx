/**
 * Static: the snow of a television set, chopped into steps.
 *
 * ## The principle
 *
 * A white noise per screen cell, drawn again at each time step — one draw per
 * step and not per frame, which would shimmer far too much. Dark bands scroll
 * slowly downwards, and a measure of tint pulls the grey towards the colour of
 * the tube.
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

import { TV_STATIC_FRAGMENT } from './tv-static.shader.js'

/** What the escape hatch receives. */
export interface TvStaticControls {
  /** Colours actually handed to the shader. */
  readonly colours: readonly ShaderColour[]
  /** Reason for the refusal, if there is one. */
  readonly refused: string | undefined
}

/** Props specific to this component. */
export interface TvStaticOwnProps {
  /** Rate of the draw steps. @defaultValue 12 */
  fps?: number
  /** Depth of the dark bands. @defaultValue 0.3 */
  banding?: number
  /** Measure of the tint. At zero, the image stays grey. @defaultValue 0.4 */
  tint?: number
  /** Tokens whose colours are read. */
  colors?: readonly string[]
  /** Fallback classes. */
  fallback?: string
  /** Escape hatch. */
  onReady?: ReadyCallback<TvStaticControls>
}

/** All props. */
export type TvStaticProps = Customisable<TvStaticOwnProps>

/** Tokens used by default: the black of the tube, the tint, the light grain. */
const DEFAULT_TOKENS = ['--o-theme-bg', '--o-palette-indigo-300', '--o-theme-fg'] as const

/** Default fallback: a frozen tint, in the same tones. */
const DEFAULT_FALLBACK = 'o-bg-zinc-100 dark:o-bg-zinc-900'

/**
 * Static.
 *
 * @example
 * <div className="o-relative o-min-h-screen">
 *   <TvStatic className="o-absolute o-inset-0" />
 *   <main className="o-relative">…</main>
 * </div>
 */
export function TvStatic({
  fps = 12,
  banding = 0.3,
  tint = 0.4,
  colors = DEFAULT_TOKENS,
  fallback = DEFAULT_FALLBACK,
  onReady,
  ...rest
}: TvStaticProps): ReactElement {
  const { ref, setHost, ready, refused, colours } = useTokenShader<HTMLDivElement>({
    fragment: TV_STATIC_FRAGMENT,
    colors,
    uniforms: { uFps: fps, uBanding: banding, uTint: tint },
    name: 'tv-static',
    // The fragment costs one hash whatever the rate; what weighs is the pace
    // of the genuinely different frames, so it is capped.
    degrade: (quality) => ({
      uFps: quality === 'low' ? Math.min(fps, 8) : fps,
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

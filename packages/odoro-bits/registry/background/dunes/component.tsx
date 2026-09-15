/**
 * Dunes: stacked crests drifting in parallax.
 *
 * ## The principle
 *
 * Horizon curves — a load-bearing sine plus noise — stacked from top to
 * bottom, each one filled beneath itself by vertical thresholding. Every layer
 * is lighter and slower than the one before: it is the mismatch of speeds that
 * makes the depth, not a gradient.
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

import { DUNES_FRAGMENT } from './dunes.shader.js'

/** What the escape hatch receives. */
export interface DunesControls {
  /** Colours actually handed to the shader. */
  readonly colours: readonly ShaderColour[]
  /** Reason for the refusal, if there is one. */
  readonly refused: string | undefined
}

/** Properties specific to this component. */
export interface DunesOwnProps {
  /** Drift speed of the layers. @defaultValue 0.1 */
  speed?: number
  /** Number of stacked crests. @defaultValue 4 */
  layers?: number
  /** Height of the undulations. @defaultValue 0.12 */
  amplitude?: number
  /** Tokens whose colours are read. */
  colors?: readonly string[]
  /** Fallback classes. */
  fallback?: string
  /** Escape hatch. */
  onReady?: ReadyCallback<DunesControls>
}

/** Every property. */
export type DunesProps = Customisable<DunesOwnProps>

/** Tokens used by default: the sky, the far crest, the grazing crest. */
const DEFAULT_TOKENS = [
  '--o-theme-bg',
  '--o-palette-orange-600',
  '--o-palette-amber-300',
] as const

/** Default fallback: a frozen gradient, in the same tones. */
const DEFAULT_FALLBACK =
  'o-bg-gradient-to-b o-from-amber-100 dark:o-from-amber-950 o-to-orange-200 dark:o-to-orange-950'

/**
 * Dunes.
 *
 * @example
 * <div className="o-relative o-min-h-screen">
 *   <Dunes className="o-absolute o-inset-0" />
 *   <main className="o-relative">…</main>
 * </div>
 */
export function Dunes({
  speed = 0.1,
  layers = 4,
  amplitude = 0.12,
  colors = DEFAULT_TOKENS,
  fallback = DEFAULT_FALLBACK,
  onReady,
  ...rest
}: DunesProps): ReactElement {
  const { ref, setHost, ready, refused, colours } = useTokenShader<HTMLDivElement>({
    fragment: DUNES_FRAGMENT,
    colors,
    uniforms: { uSpeed: speed, uLayers: layers, uAmplitude: amplitude },
    name: 'dunes',
    // Every crest is one more sine and one more noise per pixel: it is the
    // setting that weighs, and so the one that is capped.
    degrade: (quality) => ({
      uLayers: quality === 'low' ? Math.min(layers, 3) : layers,
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

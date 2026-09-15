/**
 * Smoke: swirls advected by an approximate curl, rising.
 *
 * ## The principle
 *
 * The gradient of the noise, obtained from offset reads, is turned by a quarter turn: the resulting field swirls without ever compressing.
 *
 * Time enters only the displacement, never the colour: the smoke deforms instead of flickering.
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

import { SMOKE_FRAGMENT } from './smoke.shader.js'

/** What the escape hatch receives. */
export interface SmokeControls {
  /** Colours actually handed to the shader. */
  readonly colours: readonly ShaderColour[]
  /** Reason for the refusal, if there is one. */
  readonly refused: string | undefined
}

/** Props specific to this component. */
export interface SmokeOwnProps {
  /** Speed of the swirl. @defaultValue 0.15 */
  speed?: number
  /** Scale of the pattern. Higher is finer. @defaultValue 2 */
  scale?: number
  /** Speed of the rise. @defaultValue 0.35 */
  lift?: number
  /** Tokens whose colours are read. */
  colors?: readonly string[]
  /** Fallback classes. */
  fallback?: string
  /** Escape hatch. */
  onReady?: ReadyCallback<SmokeControls>
}

/** All props. */
export type SmokeProps = Customisable<SmokeOwnProps>

/** Tokens used by default: the background, the body of the smoke, its crests. */
const DEFAULT_TOKENS = ['--o-theme-bg', '--o-theme-muted', '--o-theme-fg'] as const

/** Default fallback: a frozen tint, in the same tones. */
const DEFAULT_FALLBACK = 'o-bg-zinc-50 dark:o-bg-zinc-950'

/**
 * Noise detail outside low quality.
 *
 * The curl asks for four reads of the noise, plus one for the matter: every
 * octave is therefore paid five times over. It is the only cost lever of the
 * shader, and it does not need to be a prop to be degraded.
 */
const OCTAVES = 4

/** Noise detail at low quality. */
const LOW_OCTAVES = 2

/**
 * Smoke.
 *
 * @example
 * <div className="o-relative o-min-h-screen">
 *   <Smoke className="o-absolute o-inset-0" />
 *   <main className="o-relative">…</main>
 * </div>
 */
export function Smoke({
  speed = 0.15,
  scale = 2,
  lift = 0.35,
  colors = DEFAULT_TOKENS,
  fallback = DEFAULT_FALLBACK,
  onReady,
  ...rest
}: SmokeProps): ReactElement {
  const { ref, setHost, ready, refused, colours } = useTokenShader<HTMLDivElement>({
    fragment: SMOKE_FRAGMENT,
    colors,
    uniforms: { uSpeed: speed, uScale: scale, uLift: lift, uOctaves: OCTAVES },
    name: 'smoke',
    // The octaves are the setting that weighs — every octave is paid five times
    // over, four for the curl and one for the matter — hence the only bound one.
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

/**
 * Lightning: intermittent arcs over a night sky.
 *
 * ## The principle
 *
 * A vertical path displaced by a multi-octave noise, a stroke exponential in
 * the horizontal distance to that path, and a time chopped into slots whose
 * hash decides the bursts: the bolt lives two or three frames, then leaves a
 * residual glow.
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

import { LIGHTNING_FRAGMENT } from './lightning.shader.js'

/** What the escape hatch receives. */
export interface LightningControls {
  /** Colours actually handed to the shader. */
  readonly colours: readonly ShaderColour[]
  /** Reason for the refusal, if there is one. */
  readonly refused: string | undefined
}

/** Properties specific to this component. */
export interface LightningOwnProps {
  /** Cadence of the slots, and so of the possible bursts. @defaultValue 0.6 */
  frequency?: number
  /** Octaves of the path displacement, and so the branching. @defaultValue 4 */
  branches?: number
  /** Reach of the glow around the stroke. @defaultValue 0.5 */
  glow?: number
  /** Tokens whose colours are read. */
  colors?: readonly string[]
  /** Fallback classes. */
  fallback?: string
  /** Escape hatch. */
  onReady?: ReadyCallback<LightningControls>
}

/** Every property. */
export type LightningProps = Customisable<LightningOwnProps>

/** Tokens used by default: the night sky, the glow, the arc. */
const DEFAULT_TOKENS = ['--o-theme-bg', '--o-palette-indigo-400', '--o-theme-fg'] as const

/** Default fallback: a frozen hue, in the same tones. */
const DEFAULT_FALLBACK = 'o-bg-zinc-50 dark:o-bg-zinc-950'

/**
 * Lightning.
 *
 * @example
 * <div className="o-relative o-min-h-screen">
 *   <Lightning className="o-absolute o-inset-0" />
 *   <main className="o-relative">…</main>
 * </div>
 */
export function Lightning({
  frequency = 0.6,
  branches = 4,
  glow = 0.5,
  colors = DEFAULT_TOKENS,
  fallback = DEFAULT_FALLBACK,
  onReady,
  ...rest
}: LightningProps): ReactElement {
  const { ref, setHost, ready, refused, colours } = useTokenShader<HTMLDivElement>({
    fragment: LIGHTNING_FRAGMENT,
    colors,
    uniforms: { uFrequency: frequency, uBranches: branches, uGlow: glow },
    name: 'lightning',
    // Every octave of the displacement is one more noise evaluation per
    // pixel: that is the setting which weighs, so that is the one capped.
    degrade: (quality) => ({
      uBranches: quality === 'low' ? Math.min(branches, 2) : branches,
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

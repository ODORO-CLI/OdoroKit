/**
 * Electric field: a Jacob's ladder, the arc that climbs between two electrodes
 * and breaks.
 *
 * ## The principle
 *
 * Two diverging electrodes, an arc that strikes at the bottom and climbs,
 * carried by the air it heats, until the gap breaks it. Its path is re-hashed
 * some thirty times a second: it is that re-hashing that crackles. Two ghosts
 * follow it a little lower, the trace of the ionised air it has just left.
 *
 * What sets this entry apart from `lightning`: lightning is a blow, once in a
 * while, falling from the sky; the arc, by contrast, is continuous, held
 * between two visible electrodes, and it climbs.
 *
 * ## What this component delegates
 *
 * It carries only what sets it apart: its shader, its settings and its fallback.
 * Reading the tokens, converting them to floats and re-reading them when the
 * theme changes all come from the engine.
 *
 * The fallback is shown while the backend loads, when WebGL is missing, when
 * the arbiter refuses the surface and under reduced motion.
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

import { ELECTRIC_FIELD_FRAGMENT } from './electric-field.shader.js'

/** What the escape hatch receives. */
export interface ElectricFieldControls {
  /** Colours actually handed to the shader. */
  readonly colours: readonly ShaderColour[]
  /** Reason for the refusal, if there is one. */
  readonly refused: string | undefined
}

/** Properties specific to this component. */
export interface ElectricFieldOwnProps {
  /** Climbs of the arc per second. @defaultValue 0.35 */
  speed?: number
  /** Amplitude of the path's displacement. @defaultValue 0.5 */
  jitter?: number
  /** Reach of the glow around the line. @defaultValue 0.5 */
  glow?: number
  /** Octaves of the displacement, and so the break-up of the path. @defaultValue 3 */
  branches?: number
  /** Tokens whose colours are read. */
  colors?: readonly string[]
  /** Fallback classes. */
  fallback?: string
  /** Escape hatch. */
  onReady?: ReadyCallback<ElectricFieldControls>
}

/** Every property. */
export type ElectricFieldProps = Customisable<ElectricFieldOwnProps>

/** Tokens used by default: the background, the glow, the line. */
const DEFAULT_TOKENS = ['--o-theme-bg', '--o-palette-cyan-400', '--o-theme-fg'] as const

/** Default fallback: a frozen hue, in the same tones. */
const DEFAULT_FALLBACK = 'o-bg-zinc-50 dark:o-bg-zinc-950'

/**
 * Electric field.
 *
 * @example
 * <div className="o-relative o-min-h-screen">
 *   <ElectricField className="o-absolute o-inset-0" />
 *   <main className="o-relative">…</main>
 * </div>
 */
export function ElectricField({
  speed = 0.35,
  jitter = 0.5,
  glow = 0.5,
  branches = 3,
  colors = DEFAULT_TOKENS,
  fallback = DEFAULT_FALLBACK,
  onReady,
  ...rest
}: ElectricFieldProps): ReactElement {
  const { ref, setHost, ready, refused, colours } = useTokenShader<HTMLDivElement>({
    fragment: ELECTRIC_FIELD_FRAGMENT,
    colors,
    uniforms: { uSpeed: speed, uJitter: jitter, uGlow: glow, uBranches: branches },
    name: 'electric-field',
    // Every octave is one more noise read, for the arc and for each of its
    // ghosts: it is the setting that weighs, and so the capped one.
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

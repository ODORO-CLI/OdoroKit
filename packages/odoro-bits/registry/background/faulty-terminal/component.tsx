/**
 * Faulty terminal: a screen of characters typing itself line by line, and
 * flickering, tearing and corrupting in fits and starts.
 *
 * ## The principle
 *
 * A typing front advances down the lines, a cursor blinks after it, the
 * screen clears when it is full. The failures are chopped into steps: they
 * occur, hold for a few frames, stop. The glyphs are bit masks on three by
 * five drawn by the shader: no font, no
 * texture.
 *
 * What sets this entry apart from `code-rain`: nothing falls, everything is
 * typed; and from `scanlines`: no cathode lines, no rolling bar — characters,
 * and their failures.
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

import { FAULTY_TERMINAL_FRAGMENT } from './faulty-terminal.shader.js'

/** What the escape hatch receives. */
export interface FaultyTerminalControls {
  /** Colours actually handed to the shader. */
  readonly colours: readonly ShaderColour[]
  /** Reason for the refusal, if there is one. */
  readonly refused: string | undefined
}

/** Properties specific to this component. */
export interface FaultyTerminalOwnProps {
  /** Number of columns across the width. Capped at a hundred and twenty by the shader. @defaultValue 48 */
  columns?: number
  /** Typing speed, in lines per second. @defaultValue 1.5 */
  speed?: number
  /** Strength of the flicker. Zero cuts it. @defaultValue 0.5 */
  flicker?: number
  /** Frequency and amplitude of the tearing. Zero cuts it. @defaultValue 0.5 */
  tearing?: number
  /** Tokens whose colours are read. */
  colors?: readonly string[]
  /** Fallback classes. */
  fallback?: string
  /** Escape hatch. */
  onReady?: ReadyCallback<FaultyTerminalControls>
}

/** Every property. */
export type FaultyTerminalProps = Customisable<FaultyTerminalOwnProps>

/** Tokens used by default: the background, the phosphor, the cursor. */
const DEFAULT_TOKENS = ['--o-theme-bg', '--o-palette-amber-500', '--o-theme-fg'] as const

/** Default fallback: a frozen hue, in the same tones. */
const DEFAULT_FALLBACK = 'o-bg-zinc-50 dark:o-bg-zinc-950'

/**
 * Faulty terminal.
 *
 * @example
 * <div className="o-relative o-min-h-screen">
 *   <FaultyTerminal className="o-absolute o-inset-0" />
 *   <main className="o-relative">…</main>
 * </div>
 */
export function FaultyTerminal({
  columns = 48,
  speed = 1.5,
  flicker = 0.5,
  tearing = 0.5,
  colors = DEFAULT_TOKENS,
  fallback = DEFAULT_FALLBACK,
  onReady,
  ...rest
}: FaultyTerminalProps): ReactElement {
  const { ref, setHost, ready, refused, colours } = useTokenShader<HTMLDivElement>({
    fragment: FAULTY_TERMINAL_FRAGMENT,
    colors,
    uniforms: {
      uColumns: columns,
      uSpeed: speed,
      uFlicker: flicker,
      uTearing: tearing,
    },
    name: 'faulty-terminal',
    // Glyphs three pixels wide shimmer at reduced pixel density: at low
    // quality the columns grow wider.
    degrade: (quality) => ({
      uColumns: quality === 'low' ? Math.min(columns, 32) : columns,
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

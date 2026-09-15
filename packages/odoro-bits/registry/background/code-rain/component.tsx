/**
 * Code rain: columns of falling glyphs, a bright head and a trail that
 * fades out.
 *
 * ## The principle
 *
 * Each column carries a drop at its own speed; a row's age behind the head
 * gives its intensity. The glyphs are bit masks on three by five, drawn by
 * the shader: no font, no texture, and a cell changes character at its own
 * rhythm.
 *
 * What sets this entry apart from `rain`: characters, not drops of water;
 * and from `faulty-terminal`: here everything falls, nothing is typed.
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

import { CODE_RAIN_FRAGMENT } from './code-rain.shader.js'

/** What the escape hatch receives. */
export interface CodeRainControls {
  /** Colours actually handed to the shader. */
  readonly colours: readonly ShaderColour[]
  /** Reason for the refusal, if there is one. */
  readonly refused: string | undefined
}

/** Properties specific to this component. */
export interface CodeRainOwnProps {
  /** Number of columns across the width. Capped at a hundred and twenty by the shader. @defaultValue 40 */
  columns?: number
  /** Falling speed. @defaultValue 1 */
  speed?: number
  /** Length of the trail, in rows. @defaultValue 8 */
  trail?: number
  /** Rate of glyph changes, per second. @defaultValue 3 */
  mutate?: number
  /** Tokens whose colours are read. */
  colors?: readonly string[]
  /** Fallback classes. */
  fallback?: string
  /** Escape hatch. */
  onReady?: ReadyCallback<CodeRainControls>
}

/** Every property. */
export type CodeRainProps = Customisable<CodeRainOwnProps>

/** Tokens used by default: the background, the trail, the head. */
const DEFAULT_TOKENS = ['--o-theme-bg', '--o-palette-green-500', '--o-theme-fg'] as const

/** Default fallback: a frozen hue, in the same tones. */
const DEFAULT_FALLBACK = 'o-bg-zinc-50 dark:o-bg-zinc-950'

/**
 * Code rain.
 *
 * @example
 * <div className="o-relative o-min-h-screen">
 *   <CodeRain className="o-absolute o-inset-0" />
 *   <main className="o-relative">…</main>
 * </div>
 */
export function CodeRain({
  columns = 40,
  speed = 1,
  trail = 8,
  mutate = 3,
  colors = DEFAULT_TOKENS,
  fallback = DEFAULT_FALLBACK,
  onReady,
  ...rest
}: CodeRainProps): ReactElement {
  const { ref, setHost, ready, refused, colours } = useTokenShader<HTMLDivElement>({
    fragment: CODE_RAIN_FRAGMENT,
    colors,
    uniforms: { uColumns: columns, uSpeed: speed, uTrail: trail, uMutate: mutate },
    name: 'code-rain',
    // Glyphs three pixels wide shimmer at reduced pixel density: at low
    // quality the columns grow wider.
    degrade: (quality) => ({
      uColumns: quality === 'low' ? Math.min(columns, 24) : columns,
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

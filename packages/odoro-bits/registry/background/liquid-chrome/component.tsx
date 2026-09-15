/**
 * Liquid chrome: a chromed liquid reflecting a studio: light sky, dark floor, hard horizon, in ink over a light background and as a glow over a dark one.
 *
 * ## The principle
 *
 * Chrome is not painted, it reflects: the reflected direction of a surface of
 * soft waves looks either at the sky or at the floor, and that abrupt step
 * makes the chrome. The sky and the floor are the background and the ink of
 * the theme, ordered by luminance: in light the chrome draws itself in ink, in
 * dark it glows, without ever multiplying the background towards black.
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

import { LIQUID_CHROME_FRAGMENT } from './liquid-chrome.shader.js'

/** What the escape hatch receives. */
export interface LiquidChromeControls {
  /** Colours actually handed to the shader. */
  readonly colours: readonly ShaderColour[]
  /** Reason for the refusal, if there is one. */
  readonly refused: string | undefined
}

/** Props specific to this component. */
export interface LiquidChromeOwnProps {
  /** Speed of the liquid. @defaultValue 0.35 */
  speed?: number
  /** Scale of the waves. @defaultValue 1.6 */
  scale?: number
  /** Depth of the floor in the reflection. @defaultValue 0.8 */
  contrast?: number
  /** Strength of the hue at the horizon. @defaultValue 0.5 */
  sheen?: number
  /** Tokens whose colours are read. */
  colors?: readonly string[]
  /** Fallback classes. */
  fallback?: string
  /** Escape hatch. */
  onReady?: ReadyCallback<LiquidChromeControls>
}

/** All props. */
export type LiquidChromeProps = Customisable<LiquidChromeOwnProps>

/** Tokens used by default: the background, the ink, the hue of the horizon. */
const DEFAULT_TOKENS = ['--o-theme-bg', '--o-theme-fg', '--o-palette-sky-400'] as const

/** Default fallback: a frozen gradient, in the same tones. */
const DEFAULT_FALLBACK =
  'o-bg-gradient-to-b o-from-zinc-50 dark:o-from-zinc-950 o-via-sky-200 dark:o-via-sky-900 o-to-zinc-400 dark:o-to-zinc-700'

/**
 * Detail outside low quality.
 *
 * The fine waves do not change the nature of the reflection, only its grain:
 * they are the ones that drop at low quality.
 */
const DETAIL = 5

/** Detail at low quality. */
const LOW_DETAIL = 3

/**
 * Liquid chrome.
 *
 * @example
 * <div className="o-relative o-min-h-screen">
 *   <LiquidChrome className="o-absolute o-inset-0" />
 *   <main className="o-relative">…</main>
 * </div>
 */
export function LiquidChrome({
  speed = 0.35,
  scale = 1.6,
  contrast = 0.8,
  sheen = 0.5,
  colors = DEFAULT_TOKENS,
  fallback = DEFAULT_FALLBACK,
  onReady,
  ...rest
}: LiquidChromeProps): ReactElement {
  const { ref, setHost, ready, refused, colours } = useTokenShader<HTMLDivElement>({
    fragment: LIQUID_CHROME_FRAGMENT,
    colors,
    uniforms: {
      uSpeed: speed,
      uScale: scale,
      uContrast: contrast,
      uSheen: sheen,
      uDetail: DETAIL,
    },
    name: 'liquid-chrome',
    degrade: (quality) => ({
      uDetail: quality === 'low' ? LOW_DETAIL : DETAIL,
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

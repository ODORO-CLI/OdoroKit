/**
 * Glass surface: a frosted panel set on the page, through which the background
 * can be guessed.
 *
 * ## Glass needs something behind it
 *
 * `backdrop-filter` blurs what is **under** the element. On a plain
 * background, blurring a flat fill gives a flat fill: the panel looks
 * expensive to display and shows nothing. A glass surface is set on an image,
 * a gradient, an animated background — otherwise an ordinary card does the job
 * better, for nothing.
 *
 * ## The thickness reads on the edges, not in the blur
 *
 * A blurry rectangle is not glass: it is a badly taken photo. What makes the
 * plate is the light on its edges — a bright line at the top where it strikes,
 * a tinted line at the bottom where the thickness holds the color, a halo cast
 * underneath, and a frozen diagonal sheen. Four shadows and a gradient, all
 * drawn from the same two tokens: changing the hue changes the whole thing at
 * once.
 *
 * ## The fallback is not a degradation, it is the other state of the surface
 *
 * Without backdrop blur — a browser that does not implement it, a saving
 * setting, a screenshot — translucent glass becomes a veil that lets the text
 * underneath through, and the content of the panel becomes illegible. The
 * fallback rule therefore makes the surface **opaque**: the contrast is
 * restored, the edges stay, and what is lost is the glimpsed background — the
 * only element that was not carrying information.
 *
 * ## This is not the liquid glass button
 *
 * The button is a tile that reacts: a sheen that flows on hover, a press that
 * squashes it. The panel reacts to nothing — it carries content, and a
 * container that animates under the text it carries becomes a distraction.
 * Nothing to animate, hence nothing to remove under reduced motion.
 *
 * @module
 */

import { mergePresentation, type Customisable } from '@odoro-cli/engine'
import { type CSSProperties, type ReactElement, type ReactNode } from 'react'

/** Properties owned by the component. */
export interface GlassSurfaceOwnProps {
  /** The content set on the glass. */
  children: ReactNode
  /**
   * Tokens of the hue of the glass and of its light.
   *
   * Two, in this order. The hue colors the mass and the halo; the light makes
   * the edges and the sheen.
   */
  colors?: readonly [string, string]
  /** Blur of the background seen through the glass, in pixels. @defaultValue 16 */
  blur?: number
  /** Share of hue in the mass, from zero to one. @defaultValue 0.14 */
  tint?: number
  /** Strength of the edges and of the halo. @defaultValue 1 */
  thickness?: number
  /** Adds the frozen diagonal sheen. @defaultValue true */
  sheen?: boolean
}

/** All the properties. */
export type GlassSurfaceProps = Customisable<GlassSurfaceOwnProps>

/** Tokens used by default. */
const DEFAULT_TOKENS = ['--o-palette-brand-500', '--o-palette-white'] as const

/** Identifier of the injected stylesheet. */
const STYLE_ID = 'o-glass-surface'

/** Sets the plate, its edges, its sheen and its fallback, once per document. */
function ensureSurfaceRules(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-gsurf]{',
    'position:relative;isolation:isolate;overflow:hidden;',
    'border:1px solid color-mix(in oklab,var(--o-gsurf-light) 30%,var(--o-theme-line));',
    'background:color-mix(in oklab,var(--o-gsurf-tint) calc(var(--o-gsurf-part) * 100%),transparent);',
    '-webkit-backdrop-filter:blur(var(--o-gsurf-blur)) saturate(170%);',
    'backdrop-filter:blur(var(--o-gsurf-blur)) saturate(170%);',
    // Light at the top, tinted thickness at the bottom, a lateral line, halo underneath.
    'box-shadow:inset 0 1px 0 color-mix(in oklab,var(--o-gsurf-light) calc(var(--o-gsurf-epaisseur) * 55%),transparent),',
    'inset 0 -1px 0 color-mix(in oklab,var(--o-gsurf-tint) calc(var(--o-gsurf-epaisseur) * 40%),transparent),',
    'inset 1px 0 0 color-mix(in oklab,var(--o-gsurf-light) calc(var(--o-gsurf-epaisseur) * 18%),transparent),',
    '0 18px 40px -24px color-mix(in oklab,var(--o-gsurf-tint) calc(var(--o-gsurf-epaisseur) * 60%),transparent);',
    '}',
    // The sheen: a frozen diagonal band, set under the content.
    '[data-o-gsurf-sheen]::before{',
    'content:"";position:absolute;inset:0;z-index:-1;pointer-events:none;',
    'background:linear-gradient(112deg,',
    'color-mix(in oklab,var(--o-gsurf-light) 22%,transparent) 0%,',
    'transparent 38%,transparent 62%,',
    'color-mix(in oklab,var(--o-gsurf-light) 10%,transparent) 100%);',
    '}',
    // Without backdrop blur, the translucency becomes illegible: the plate
    // closes. See the module header.
    '@supports not ((backdrop-filter:blur(2px)) or (-webkit-backdrop-filter:blur(2px))){',
    '[data-o-gsurf]{',
    'background:var(--o-theme-surface);',
    'border-color:var(--o-theme-line);',
    '}',
    '}',
  ].join('')
  document.head.append(style)
}

/**
 * Frosted glass panel.
 *
 * @example
 * <GlassSurface className="o-rounded-2xl o-p-6">
 *   <h2>Next session</h2>
 *   <p>Thursday 12 March, eight in the evening.</p>
 * </GlassSurface>
 *
 * @example
 * // Thicker glass, sky hue, on a poster.
 * <GlassSurface
 *   colors={['--o-palette-sky-400', '--o-palette-white']}
 *   blur={26}
 *   tint={0.3}
 *   thickness={1.4}
 *   className="o-rounded-2xl o-p-8"
 * >
 *   {details}
 * </GlassSurface>
 */
export function GlassSurface({
  children,
  colors = DEFAULT_TOKENS,
  blur = 16,
  tint = 0.14,
  thickness = 1,
  sheen = true,
  ...rest
}: GlassSurfaceProps): ReactElement {
  ensureSurfaceRules()

  const { className, style } = mergePresentation(
    { className: 'o-rounded-2xl o-p-6' },
    rest,
  )

  return (
    <div
      {...rest}
      data-o-gsurf=""
      data-o-gsurf-sheen={sheen ? '' : undefined}
      className={className}
      style={
        {
          '--o-gsurf-tint': `var(${colors[0]})`,
          '--o-gsurf-light': `var(${colors[1]})`,
          '--o-gsurf-blur': `${String(blur)}px`,
          '--o-gsurf-part': String(tint),
          '--o-gsurf-epaisseur': String(thickness),
          ...style,
        } as CSSProperties
      }
    >
      {children}
    </div>
  )
}

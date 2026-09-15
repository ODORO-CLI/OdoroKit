/**
 * Liquid glass button: a pill of frosted glass, a highlight that flows on
 * hover, a press that squashes it before the elastic return.
 *
 * ## This is not the tide button
 *
 * The tide button is opaque, and its movement is a layer that rises behind
 * the label. Here the surface is translucent — the background of the page
 * shows through, blurred and saturated — and the movement is that of a soft
 * matter: the highlight slides from one edge to the other like a drop, and
 * the press deforms the pill instead of colouring it.
 *
 * ## The glass is a sum of edges, not an image
 *
 * A `backdrop-filter` alone gives a blurred rectangle. What makes the glass
 * is the light on its edges: a bright rule at the top, where the light
 * strikes, a tinted rule at the bottom, where the thickness holds the colour,
 * and a halo cast in the hue under the pill. Three inner shadows and one
 * outer, all drawn from two tokens.
 *
 * ## The return is slower than the way out
 *
 * The press is immediate: the finger pushes, the glass gives way. The return
 * takes its duration and overshoots its target before settling on it — it is
 * that asymmetry which makes the matter liquid rather than a mechanical
 * spring.
 *
 * ## Under reduced motion
 *
 * The highlight is already at its arrival place, and the press no longer has
 * a bounce. The glass stays glass: the information — translucent, in relief
 * — does not depend on the movement.
 *
 * @module
 */

import { mergePresentation, useMotionState, type Customisable } from '@odoro-cli/engine'
import {
  type CSSProperties,
  type ElementType,
  type ReactElement,
  type ReactNode,
} from 'react'

/** Props specific to the component. */
export interface LiquidGlassButtonOwnProps {
  /** Label of the button. */
  children: ReactNode
  /** Target of the link. With it, the button is rendered as a link. */
  href?: string
  /**
   * Tokens of the hue of the glass and of its light.
   *
   * Two, in this order. The hue colours the glass and its halo; the light
   * makes the edges and the highlight.
   */
  colors?: readonly [string, string]
  /** Blur of the background seen through the glass, in pixels. @defaultValue 14 */
  blur?: number
  /** Share of hue in the glass, from zero to one. @defaultValue 0.18 */
  tint?: number
  /** Duration of the elastic return after the press, in milliseconds. @defaultValue 600 */
  spring?: number
}

/** All the props. */
export type LiquidGlassButtonProps = Customisable<LiquidGlassButtonOwnProps, 'button'>

/** Tokens used by default. */
const DEFAULT_TOKENS = ['--o-palette-brand-500', '--o-palette-white'] as const

/** Id of the injected stylesheet. */
const STYLE_ID = 'o-liquid-glass-button'

/** Sets the glass, its edges and its highlight, once per document. */
function ensureGlassRules(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-lglass]{',
    'position:relative;isolation:isolate;overflow:hidden;cursor:pointer;',
    'display:inline-flex;align-items:center;justify-content:center;gap:0.5em;',
    'border:1px solid color-mix(in oklab,var(--o-lglass-light) 35%,transparent);',
    'font:inherit;color:inherit;text-decoration:none;',
    'background:color-mix(in oklab,var(--o-lglass-tint) calc(var(--o-lglass-part) * 100%),transparent);',
    '-webkit-backdrop-filter:blur(var(--o-lglass-blur)) saturate(160%);',
    'backdrop-filter:blur(var(--o-lglass-blur)) saturate(160%);',
    // The edges: light at the top, tinted thickness at the bottom, halo under.
    'box-shadow:inset 0 1px 0 color-mix(in oklab,var(--o-lglass-light) 60%,transparent),',
    'inset 0 -1px 0 color-mix(in oklab,var(--o-lglass-tint) 40%,transparent),',
    'inset 1px 0 0 color-mix(in oklab,var(--o-lglass-light) 20%,transparent),',
    '0 10px 30px -12px color-mix(in oklab,var(--o-lglass-tint) 55%,transparent);',
    // Dry on the way out, slow and overshooting on the way back: see the module header.
    'transition:transform var(--o-lglass-spring) cubic-bezier(0.34,1.56,0.64,1),',
    'background-color var(--o-duration-slow) linear;',
    '}',
    '[data-o-lglass]:is(:hover,:focus-visible){',
    'background:color-mix(in oklab,var(--o-lglass-tint) calc(var(--o-lglass-part) * 100% + 8%),transparent)}',
    '[data-o-lglass]:focus-visible{outline:2px solid currentColor;outline-offset:3px}',
    '[data-o-lglass]:active{transform:scale(0.94,0.9);transition-duration:80ms}',
    '[data-o-lglass]:disabled,[data-o-lglass][aria-disabled="true"]{',
    'opacity:0.5;cursor:not-allowed;pointer-events:none}',

    // The highlight: a drop of light, parked at the top left, that flows down
    // to the right on hover.
    '[data-o-lglass]::before{',
    'content:"";position:absolute;z-index:-1;pointer-events:none;',
    'inset:-40% auto auto -20%;width:80%;height:90%;border-radius:50%;',
    'background:radial-gradient(closest-side,color-mix(in oklab,var(--o-lglass-light) 55%,transparent),transparent);',
    'transition:translate var(--o-lglass-spring) cubic-bezier(0.34,1.3,0.64,1),',
    'scale var(--o-lglass-spring) cubic-bezier(0.34,1.3,0.64,1);',
    '}',
    '[data-o-lglass]:is(:hover,:focus-visible)::before{translate:70% 55%;scale:1.3 0.8}',
    '[data-o-lglass]>span{position:relative;z-index:1}',

    '@media (prefers-reduced-motion:reduce){',
    '[data-o-lglass],[data-o-lglass]::before{transition:none}',
    '[data-o-lglass]:active{transform:none}',
    '[data-o-lglass]::before{translate:70% 55%;scale:1.3 0.8}',
    '}',
  ].join('')
  document.head.append(style)
}

/**
 * Button of frosted glass, tinted and in relief.
 *
 * @example
 * <LiquidGlassButton onClick={book}>Book a seat</LiquidGlassButton>
 *
 * @example
 * // Thicker glass, sky hue, over a background image.
 * <LiquidGlassButton
 *   href="/gallery"
 *   colors={['--o-palette-sky-400', '--o-palette-white']}
 *   blur={24}
 *   tint={0.3}
 * >
 *   Open the gallery
 * </LiquidGlassButton>
 */
export function LiquidGlassButton({
  children,
  href,
  colors = DEFAULT_TOKENS,
  blur = 14,
  tint = 0.18,
  spring = 600,
  ...rest
}: LiquidGlassButtonProps): ReactElement {
  const { reduced } = useMotionState()
  ensureGlassRules()

  const { className, style } = mergePresentation(
    { className: 'o-rounded-full o-px-6 o-py-3 o-font-medium' },
    rest,
  )

  const Tag = (href === undefined ? 'button' : 'a') as ElementType
  const { disabled, type, ...attributes } = rest

  return (
    <Tag
      {...(href === undefined
        ? { type: type ?? 'button', disabled }
        : { href, 'aria-disabled': disabled === true ? 'true' : undefined })}
      {...attributes}
      data-o-lglass=""
      className={className}
      style={
        {
          '--o-lglass-tint': `var(${colors[0]})`,
          '--o-lglass-light': `var(${colors[1]})`,
          '--o-lglass-blur': `${String(blur)}px`,
          '--o-lglass-part': String(tint),
          '--o-lglass-spring': `${String(reduced ? 0 : spring)}ms`,
          ...style,
        } as CSSProperties
      }
    >
      <span>{children}</span>
    </Tag>
  )
}

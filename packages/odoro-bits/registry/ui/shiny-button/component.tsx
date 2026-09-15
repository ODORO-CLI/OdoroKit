/**
 * Button with a turning edge light, in CSS alone.
 *
 * ## No JavaScript animates anything
 *
 * The edge light is a conic gradient whose angle is a property registered by
 * `@property`. Without that registration, `--gradient-angle` would be a
 * string for the browser, and a string does not interpolate: the animation
 * would jump from zero to three hundred and sixty degrees at once. Declared
 * as an `<angle>`, it becomes an animatable value, and the compositor takes
 * care of it.
 *
 * This is the only reason why this button opens no loop.
 *
 * ## What was removed from the original implementation
 *
 * An `@import` of Google Fonts, laid in the stylesheet of the component. It
 * cost a blocking request on the first paint, to impose a font that the
 * project has not necessarily chosen. The font therefore comes from the token
 * `--o-font-sans`.
 *
 * And the colours, hard-coded — a black, a white, a named blue. They are now
 * read from the palette, which makes them follow the theme.
 *
 * ## The animation is paused at rest
 *
 * The three layers turn, but `animation-play-state: paused` freezes them as
 * long as the button is neither hovered nor focused. An edge light turning
 * permanently on a page that holds five of them keeps the compositor busy
 * without anyone watching it.
 *
 * @module
 */

import { mergePresentation, type Customisable } from '@odoro-cli/engine'
import { type ReactElement, type ReactNode } from 'react'

/** Properties specific to the component. */
export interface ShinyButtonOwnProps {
  /** Content of the button. */
  children: ReactNode
  /**
   * Tokens of the background, the text, the edge light and its glow on hover.
   *
   * Four, in that order. The third one carries the colour that turns; the
   * fourth one that which replaces it when the button wakes up.
   */
  colors?: readonly [string, string, string, string]
  /** Duration of one turn of the edge light, in milliseconds. @defaultValue 3000 */
  spin?: number
}

/** All properties. */
export type ShinyButtonProps = Customisable<ShinyButtonOwnProps, 'button'>

/** Tokens used by default. */
const DEFAULT_TOKENS = [
  '--o-palette-zinc-950',
  '--o-palette-zinc-50',
  '--o-palette-brand-500',
  '--o-palette-brand-300',
] as const

/** Identifier of the injected stylesheet. */
const STYLE_ID = 'o-shiny-button'

/**
 * Applies the rules of the button, once per document.
 *
 * ## Why `@property` is indispensable here
 *
 * An ordinary CSS variable has no type: the browser treats it as text, and two
 * texts do not interpolate. The animation would exist, but it would go from
 * one value to the other without transition — an edge light that snaps instead
 * of turning.
 *
 * `@property` gives a type, an initial value and an inheritance rule. That is
 * what makes `--gradient-angle` animatable, and therefore this whole file
 * possible.
 *
 * The initial value of the glow is `transparent` and not a named colour:
 * `initial-value` does not accept `var()`, and writing a white there would
 * freeze a colour outside the palette. The element replaces it immediately
 * with its token.
 */
function ensureShinyRules(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '@property --o-shiny-angle{syntax:"<angle>";initial-value:0deg;inherits:false}',
    '@property --o-shiny-offset{syntax:"<angle>";initial-value:0deg;inherits:false}',
    '@property --o-shiny-percent{syntax:"<percentage>";initial-value:5%;inherits:false}',
    '@property --o-shiny-shine{syntax:"<color>";initial-value:transparent;inherits:false}',

    '[data-o-shiny]{',
    '--o-shiny-spin:3000ms;',
    'isolation:isolate;position:relative;overflow:hidden;cursor:pointer;',
    'outline-offset:4px;border:1px solid transparent;border-radius:360px;',
    'font-family:var(--o-font-sans);font-size:1.125rem;line-height:1.2;font-weight:500;',
    'color:var(--o-shiny-fg);',
    'background:linear-gradient(var(--o-shiny-bg),var(--o-shiny-bg)) padding-box,',
    'conic-gradient(from calc(var(--o-shiny-angle) - var(--o-shiny-offset)),transparent,',
    'var(--o-shiny-edge) var(--o-shiny-percent),',
    'var(--o-shiny-shine) calc(var(--o-shiny-percent) * 2),',
    'var(--o-shiny-edge) calc(var(--o-shiny-percent) * 3),',
    'transparent calc(var(--o-shiny-percent) * 4)) border-box;',
    'box-shadow:inset 0 0 0 1px color-mix(in oklch,var(--o-shiny-fg) 10%,transparent);',
    'transition:--o-shiny-offset var(--o-duration-slower) var(--o-ease-standard),',
    '--o-shiny-percent var(--o-duration-slower) var(--o-ease-standard),',
    '--o-shiny-shine var(--o-duration-slower) var(--o-ease-standard)}',

    '[data-o-shiny]::before,[data-o-shiny]::after,[data-o-shiny]>span::before{',
    'content:"";pointer-events:none;position:absolute;',
    'inset-inline-start:50%;inset-block-start:50%;translate:-50% -50%;z-index:-1}',

    '[data-o-shiny]:active{translate:0 1px}',

    // Scattering of dots, masked by a turning sector.
    '[data-o-shiny]::before{--size:calc(100% - 6px);width:var(--size);height:var(--size);',
    'background:radial-gradient(circle at 2px 2px,var(--o-shiny-fg) 0.5px,transparent 0) padding-box;',
    'background-size:4px 4px;background-repeat:space;',
    '-webkit-mask-image:conic-gradient(from calc(var(--o-shiny-angle) + 45deg),black,transparent 10% 90%,black);',
    'mask-image:conic-gradient(from calc(var(--o-shiny-angle) + 45deg),black,transparent 10% 90%,black);',
    'border-radius:inherit;opacity:0.4;z-index:-1}',

    // Internal reflection, turning the other way.
    '[data-o-shiny]::after{width:100%;aspect-ratio:1;',
    'background:linear-gradient(-50deg,transparent,var(--o-shiny-edge),transparent);',
    '-webkit-mask-image:radial-gradient(circle at bottom,transparent 40%,black);',
    'mask-image:radial-gradient(circle at bottom,transparent 40%,black);opacity:0.6}',

    '[data-o-shiny]>span{position:relative;z-index:1}',
    '[data-o-shiny]>span::before{--size:calc(100% + 1rem);width:var(--size);height:var(--size);',
    'box-shadow:inset 0 -1ex 2rem 4px var(--o-shiny-edge);opacity:0;',
    'transition:opacity var(--o-duration-slower) var(--o-ease-standard);',
    'animation:calc(var(--o-shiny-spin) * 1.5) o-shiny-breathe linear infinite}',

    // The three layers turn, and stay paused as long as nobody looks at them.
    '[data-o-shiny],[data-o-shiny]::before,[data-o-shiny]::after{',
    'animation:o-shiny-turn linear infinite var(--o-shiny-spin),',
    'o-shiny-turn linear infinite calc(var(--o-shiny-spin) / 0.4) reverse paused;',
    'animation-composition:add}',

    '[data-o-shiny]:is(:hover,:focus-visible){',
    '--o-shiny-percent:20%;--o-shiny-offset:95deg;--o-shiny-shine:var(--o-shiny-glow)}',
    '[data-o-shiny]:is(:hover,:focus-visible),',
    '[data-o-shiny]:is(:hover,:focus-visible)::before,',
    '[data-o-shiny]:is(:hover,:focus-visible)::after{animation-play-state:running}',
    '[data-o-shiny]:is(:hover,:focus-visible)>span::before{opacity:1}',

    '@keyframes o-shiny-turn{to{--o-shiny-angle:360deg}}',
    '@keyframes o-shiny-breathe{from,to{scale:1}50%{scale:1.2}}',

    // The edge light is an ornament: under reduced motion it no longer turns,
    // and the button keeps its final state — visible, legible, clickable.
    '@media (prefers-reduced-motion:reduce){',
    '[data-o-shiny],[data-o-shiny]::before,[data-o-shiny]::after,',
    '[data-o-shiny]>span::before{animation:none}}',
  ].join('')
  document.head.append(style)
}

/**
 * Button whose edge light turns on hover.
 *
 * @example
 * <ShinyButton onClick={subscribe}>Unlimited access</ShinyButton>
 *
 * @example
 * // The four colours come from the palette: background, text, edge, glow.
 * <ShinyButton colors={[
 *   '--o-palette-zinc-950',
 *   '--o-palette-zinc-50',
 *   '--o-palette-emerald-500',
 *   '--o-palette-emerald-300',
 * ]}>
 *   Publish
 * </ShinyButton>
 */
export function ShinyButton({
  children,
  colors = DEFAULT_TOKENS,
  spin = 3000,
  ...rest
}: ShinyButtonProps): ReactElement {
  ensureShinyRules()

  const { className, style } = mergePresentation({ className: 'o-px-10 o-py-5' }, rest)

  return (
    <button
      type="button"
      {...rest}
      data-o-shiny
      className={className}
      style={{
        // The four tokens become the variables that the stylesheet consumes.
        // They are set inline because they depend on the props, and a single
        // stylesheet per document cannot carry them.
        ['--o-shiny-bg' as string]: `var(${colors[0]})`,
        ['--o-shiny-fg' as string]: `var(${colors[1]})`,
        ['--o-shiny-edge' as string]: `var(${colors[2]})`,
        ['--o-shiny-glow' as string]: `var(${colors[3]})`,
        ['--o-shiny-spin' as string]: `${String(spin)}ms`,
        ...style,
      }}
    >
      <span>{children}</span>
    </button>
  )
}

/**
 * Pearl button: a volume obtained by stacking shadows.
 *
 * ## What the five shadows do
 *
 * There is no image, no background gradient, no filter. The relief comes from
 * five stacked shadows, and each one plays a role that cannot be removed
 * without flattening the object:
 *
 * 1. an upper inner glow — the light coming in from above;
 * 2. a lower inner shadow, short and dark — the thickness of the edge;
 * 3. a second lower inner glow, wide — the light bouncing back from the bottom;
 * 4. a wide and distant drop shadow — the distance to the ground;
 * 5. a short and tight drop shadow — the contact.
 *
 * Removing the fourth glues the button to the page; removing the third makes
 * it hollow instead of domed.
 *
 * ## The colors come from the palette
 *
 * The original implementation hardcoded ten colors, alpha channel included.
 * Each one is
 * now a mix of the light or shadow token, which makes them follow the theme —
 * and makes the button usable on a light background, which it was not.
 *
 * ## The glyph changes on hover
 *
 * Two characters are rendered, only one is displayed. It is shorter than a
 * React state, and above all it triggers no render: the toggle is a CSS rule.
 *
 * @module
 */

import { mergePresentation, type Customisable } from '@odoro-cli/engine'
import { type ReactElement, type ReactNode } from 'react'

/** Props specific to the component. */
export interface PearlButtonOwnProps {
  /** Button label. */
  children: ReactNode
  /** Glyph at rest. @defaultValue '✧' */
  glyph?: string
  /** Glyph on hover. @defaultValue '✦' */
  glyphHover?: string
  /**
   * Body, light and shadow tokens.
   *
   * Three of them, in that order. The light serves the inner reflections and
   * the text; the shadow serves the inner and drop shadows.
   */
  colors?: readonly [string, string, string]
}

/** All props. */
export type PearlButtonProps = Customisable<PearlButtonOwnProps, 'button'>

/** Tokens used by default. */
const DEFAULT_TOKENS = [
  '--o-palette-zinc-950',
  '--o-palette-zinc-50',
  '--o-palette-zinc-900',
] as const

/** Id of the injected stylesheet. */
const STYLE_ID = 'o-pearl-button'

/** Applies the button rules, once per document. */
function ensurePearlRules(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  /** A mix of the light token, at the requested opacity. */
  const light = (percent: number): string =>
    `color-mix(in oklch,var(--o-pearl-light) ${String(percent)}%,transparent)`

  /** A mix of the shadow token. */
  const dark = (percent: number): string =>
    `color-mix(in oklch,var(--o-pearl-dark) ${String(percent)}%,transparent)`

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-pearl]{outline:none;cursor:pointer;border:0;position:relative;',
    'border-radius:360px;background-color:var(--o-pearl-body);',
    'transition:box-shadow var(--o-duration-base) var(--o-ease-standard),',
    'transform var(--o-duration-base) var(--o-ease-standard);',
    `box-shadow:inset 0 0.3rem 0.9rem ${light(30)},`,
    `inset 0 -0.1rem 0.3rem ${dark(70)},`,
    `inset 0 -0.4rem 0.9rem ${light(50)},`,
    `0 3rem 3rem ${dark(30)},`,
    `0 1rem 1rem -0.6rem ${dark(80)}}`,

    '[data-o-pearl] [data-o-pearl-wrap]{display:block;font-size:1.5rem;font-weight:500;',
    `color:${light(70)};padding:2rem 2.8rem;border-radius:inherit;`,
    'position:relative;overflow:hidden}',

    '[data-o-pearl] [data-o-pearl-line]{display:flex;align-items:center;gap:0.75rem;margin:0;',
    'transform:translateY(2%);',
    'transition:transform var(--o-duration-base) var(--o-ease-standard);',
    '-webkit-mask-image:linear-gradient(to bottom,black 40%,transparent);',
    'mask-image:linear-gradient(to bottom,black 40%,transparent)}',

    '[data-o-pearl] [data-o-pearl-wrap]::before,[data-o-pearl] [data-o-pearl-wrap]::after{',
    'content:"";position:absolute;',
    'transition:transform var(--o-duration-slow) var(--o-ease-standard),',
    'opacity var(--o-duration-slow) var(--o-ease-standard)}',

    // The large patch of light, which spills well past the top.
    `[data-o-pearl] [data-o-pearl-wrap]::before{left:-15%;right:-15%;bottom:25%;top:-100%;`,
    `border-radius:50%;background-color:${light(12)}}`,

    // The upper reflection, a rectangle with rounded top corners.
    '[data-o-pearl] [data-o-pearl-wrap]::after{left:6%;right:6%;top:12%;bottom:40%;',
    `border-radius:22px 22px 0 0;box-shadow:inset 0 10px 8px -10px ${light(80)};`,
    `background:linear-gradient(180deg,${light(30)} 0%,transparent 50%,transparent 100%)}`,

    '[data-o-pearl] [data-o-pearl-glyph="hover"]{display:none}',
    '[data-o-pearl]:hover [data-o-pearl-glyph="rest"]{display:none}',
    '[data-o-pearl]:hover [data-o-pearl-glyph="hover"]{display:inline-block}',

    `[data-o-pearl]:hover{box-shadow:inset 0 0.3rem 0.5rem ${light(40)},`,
    `inset 0 -0.1rem 0.3rem ${dark(70)},`,
    `inset 0 -0.4rem 0.9rem ${light(70)},`,
    `0 3rem 3rem ${dark(30)},`,
    `0 1rem 1rem -0.6rem ${dark(80)}}`,
    '[data-o-pearl]:hover [data-o-pearl-wrap]::before{transform:translateY(-5%)}',
    '[data-o-pearl]:hover [data-o-pearl-wrap]::after{opacity:0.4;transform:translateY(5%)}',
    '[data-o-pearl]:hover [data-o-pearl-line]{transform:translateY(-4%)}',

    '[data-o-pearl]:active{transform:translateY(4px);',
    `box-shadow:inset 0 0.3rem 0.5rem ${light(50)},`,
    `inset 0 -0.1rem 0.3rem ${dark(80)},`,
    `inset 0 -0.4rem 0.9rem ${light(40)},`,
    `0 3rem 3rem ${dark(30)},`,
    `0 1rem 1rem -0.6rem ${dark(80)}}`,

    // The movements are an embellishment; the press on click, a feedback.
    // Only the first one is neutralized: without feedback, there is no telling
    // whether the click was taken.
    '@media (prefers-reduced-motion:reduce){',
    '[data-o-pearl],[data-o-pearl] [data-o-pearl-line],',
    '[data-o-pearl] [data-o-pearl-wrap]::before,[data-o-pearl] [data-o-pearl-wrap]::after{',
    'transition:none}',
    '[data-o-pearl]:hover [data-o-pearl-wrap]::before,',
    '[data-o-pearl]:hover [data-o-pearl-wrap]::after,',
    '[data-o-pearl]:hover [data-o-pearl-line]{transform:none}}',
  ].join('')
  document.head.append(style)
}

/**
 * Pearl button.
 *
 * @example
 * <PearlButton>Get started</PearlButton>
 *
 * @example
 * // On a light background, light and shadow swap roles.
 * <PearlButton colors={[
 *   '--o-palette-zinc-100',
 *   '--o-palette-zinc-950',
 *   '--o-palette-zinc-400',
 * ]}>
 *   Get started
 * </PearlButton>
 */
export function PearlButton({
  children,
  glyph = '✧',
  glyphHover = '✦',
  colors = DEFAULT_TOKENS,
  ...rest
}: PearlButtonProps): ReactElement {
  ensurePearlRules()

  const { className, style } = mergePresentation({ className: '' }, rest)

  return (
    <button
      type="button"
      {...rest}
      data-o-pearl
      className={className}
      style={{
        ['--o-pearl-body' as string]: `var(${colors[0]})`,
        ['--o-pearl-light' as string]: `var(${colors[1]})`,
        ['--o-pearl-dark' as string]: `var(${colors[2]})`,
        ...style,
      }}
    >
      <span data-o-pearl-wrap>
        {/* Two `span` and not a `div` holding a `p`: the content of a button
            is phrasing content, and the original markup was invalid. The
            `display` comes from the stylesheet. */}
        <span data-o-pearl-line>
          {/* Both glyphs are rendered, only one is displayed: the toggle is a
              CSS rule, so it triggers no React render. */}
          <span aria-hidden data-o-pearl-glyph="rest">
            {glyph}
          </span>
          <span aria-hidden data-o-pearl-glyph="hover">
            {glyphHover}
          </span>
          {children}
        </span>
      </span>
    </button>
  )
}

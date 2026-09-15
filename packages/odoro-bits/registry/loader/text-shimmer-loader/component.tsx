/**
 * Waiting text, swept: a dimmed word crossed in a loop by a band of full ink.
 *
 * ## The text is dimmed, not the reflection
 *
 * A reflection on a heading adds a glow to text that is already solid: that is
 * an ornament. Here it is the reverse, and that is what makes it a waiting
 * state: the text is painted at a third of its ink, and the only solid thing
 * is the band crossing it. As long as it passes, the word is not "there". The
 * same mechanism, read backwards, says something else.
 *
 * The gradient is the background of the element, clipped by its glyphs; only
 * its position moves. The band is narrow and its edges are soft: a hard-edged
 * band would read as a cursor, and a cursor promises a position.
 *
 * ## A status, not a drawing
 *
 * The element carries `role="status"` and a label for screen readers. The
 * painted text is removed from the accessibility tree, because its colour is
 * transparent: it would only be announced as a duplicate of the label.
 *
 * Under reduced motion, the text returns to its full ink, with no band: a
 * dimmed and frozen word would no longer say waiting, it would say "disabled".
 *
 * @module
 */

import { mergePresentation, type Customisable } from '@odoro-cli/engine'
import type { CSSProperties, ReactElement } from 'react'

/** Identifier of the injected stylesheet. */
const STYLE_ID = 'o-text-shimmer-loader'

/** Sets up the dimmed text and its band, once per document. */
function ensureTextShimmerLoaderRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-tsl]{',
    'display:inline-block;white-space:nowrap;font-weight:600;',
    'font-size:var(--o-tsl-size);color:var(--o-tsl-color);',
    '}',
    '[data-o-tsl-text]{',
    'display:inline-block;',
    // The background carries the ink: the text itself is transparent and only
    // serves as a stencil. The band sits at 50 % of the image, its edges at
    // 12 % on either side.
    '--o-tsl-dim:color-mix(in oklab,var(--o-tsl-color) 32%,transparent);',
    'background-image:linear-gradient(100deg,var(--o-tsl-dim) 0 38%,var(--o-tsl-color) 50%,var(--o-tsl-dim) 62% 100%);',
    'background-size:250% 100%;background-repeat:no-repeat;',
    '-webkit-background-clip:text;background-clip:text;',
    'color:transparent;',
    'animation:o-tsl-sweep var(--o-tsl-speed) linear infinite;',
    '}',
    // From 100 % to 0 %: the image slides to the right, the band crosses the
    // word from left to right.
    '@keyframes o-tsl-sweep{from{background-position:100% 0}to{background-position:0% 0}}',
    '@media (prefers-reduced-motion:reduce){',
    '[data-o-tsl-text]{animation:none;background-image:none;color:var(--o-tsl-color)}',
    '}',
  ].join('')
  document.head.append(style)
}

/** Props of the component itself. */
export interface TextShimmerLoaderOwnProps {
  /** The displayed text. @defaultValue 'Loading' */
  text?: string
  /** Size of the text, in pixels. @defaultValue 16 */
  size?: number
  /** Duration of one pass of the band, in milliseconds. @defaultValue 1800 */
  speed?: number
  /** Colour of the text and of the band. @defaultValue the text colour */
  color?: string
  /** Label announced to screen readers. @defaultValue 'Loading' */
  label?: string
}

/** All the props. */
export type TextShimmerLoaderProps = Customisable<TextShimmerLoaderOwnProps, 'span'>

/**
 * Signals a wait through a dimmed text crossed by a band of ink.
 *
 * @example
 * <TextShimmerLoader />
 *
 * @example
 * // Bigger, slower, in the brand hue.
 * <TextShimmerLoader size={24} speed={2600} color="var(--o-palette-brand-500)" />
 */
export function TextShimmerLoader({
  text = 'Loading',
  size = 16,
  speed = 1800,
  color = 'currentColor',
  label = 'Loading',
  ...rest
}: TextShimmerLoaderProps): ReactElement {
  ensureTextShimmerLoaderRule()

  const { className, style } = mergePresentation({}, rest)

  const loaderStyle = {
    ...style,
    '--o-tsl-size': `${String(size)}px`,
    '--o-tsl-speed': `${String(speed)}ms`,
    '--o-tsl-color': color,
  } as CSSProperties

  return (
    <span {...rest} className={className} style={loaderStyle} data-o-tsl="" role="status">
      <span className="o-sr-only">{label}</span>
      <span aria-hidden data-o-tsl-text="">
        {text}
      </span>
    </span>
  )
}

/**
 * Shine: a bright band crosses the text, on a loop.
 *
 * ## Zero JavaScript at runtime
 *
 * The effect fits into a gradient clipped to the shape of the letters, whose
 * position is animated. The browser's compositor handles it alone: no loop, no
 * subscription, no React render after the first.
 *
 * It is the demonstration of the boundary drawn by the engine. This effect is
 * visually close to what a shader would do, and it does not ask for a single
 * line of engine — because it recomputes nothing: it describes an animation
 * once, then falls silent.
 *
 * ## The trade-off of the clipping
 *
 * `background-clip: text` paints the text with the background, which requires
 * making the text colour transparent. A browser that could not do it would
 * therefore show invisible text — not "without a shine", **invisible**.
 *
 * The rule is therefore placed behind a support query. Without it, the text
 * keeps its colour and only loses its shine, which is the right way round for
 * degradation.
 *
 * @module
 */

import { mergePresentation, useMotionState, type Customisable } from '@odoro-cli/engine'
import { useId, type CSSProperties, type ElementType, type ReactElement } from 'react'

/** Properties specific to the component. */
export interface ShineTextOwnProps {
  /** Text to dress. */
  children: string
  /** Rendered tag. @defaultValue 'span' */
  as?: ElementType
  /** Colour of the text at rest. By default, the inherited one. */
  from?: string
  /** Colour of the shine. @defaultValue white */
  shine?: string
  /** Duration of one pass, in milliseconds. @defaultValue 3000 */
  duration?: number
  /** Width of the shine, as a percentage of the width of the text. @defaultValue 30 */
  width?: number
}

/** All properties. */
export type ShineTextProps = Customisable<ShineTextOwnProps, 'span'>

/** Identifier of the injected stylesheet. */
const STYLE_ID = 'o-shine-text'

/**
 * Sets the animation, once per document.
 *
 * The clipping is shut inside a support query: where it is not understood, the
 * text keeps its colour and only loses its shine.
 */
function ensureShineRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '@keyframes o-shine{from{background-position:200% 0}to{background-position:-200% 0}}',
    '@supports (background-clip:text) or (-webkit-background-clip:text){',
    '[data-o-shine]{',
    'background-image:linear-gradient(100deg,var(--o-shine-from) 40%,var(--o-shine-color) 50%,var(--o-shine-from) 60%);',
    'background-size:300% 100%;',
    '-webkit-background-clip:text;background-clip:text;',
    'color:transparent;-webkit-text-fill-color:transparent;',
    'animation:o-shine var(--o-shine-duration) linear infinite;',
    '}}',
    '@media (prefers-reduced-motion:reduce){[data-o-shine]{animation:none;background-position:50% 0}}',
  ].join('')
  document.head.append(style)
}

/**
 * Sends a shine across a text.
 *
 * @example
 * <ShineText as="h1" className="o-text-5xl o-font-extrabold">
 *   Odoro
 * </ShineText>
 *
 * @example
 * // The colours are free: they are values, not roles.
 * <ShineText from="var(--o-palette-zinc-500)" shine="var(--o-palette-amber-300)">
 *   New
 * </ShineText>
 */
export function ShineText({
  children,
  as: Tag = 'span',
  from = 'currentColor',
  shine = 'oklch(100% 0 0)',
  duration = 3000,
  width = 30,
  ...rest
}: ShineTextProps): ReactElement {
  const { reduced } = useMotionState()
  useId()
  ensureShineRule()

  const { className, style } = mergePresentation({}, rest)

  const shineStyle = {
    ...style,
    '--o-shine-from': from,
    '--o-shine-color': shine,
    '--o-shine-duration': `${String(duration)}ms`,
    // The width of the shine plays on the gap between the two dark stops of
    // the gradient: the closer they come, the narrower the band.
    '--o-shine-width': `${String(width)}%`,
  } as CSSProperties

  return (
    <Tag
      {...rest}
      className={className}
      style={shineStyle}
      data-o-shine={reduced ? undefined : ''}
    >
      {children}
    </Tag>
  )
}

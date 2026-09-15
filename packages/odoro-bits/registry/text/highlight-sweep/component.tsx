/**
 * Highlighter: a stroke is drawn behind the text, as with a marker pen.
 *
 * ## It splits nothing
 *
 * That is what sets it apart from the other text animations of this registry:
 * no fragment, no layer, no measurement. The text stays exactly the node it
 * was — a link stays a link, an emphasis stays an emphasis, and the selection
 * behaves normally.
 *
 * What moves is a background, behind the letters. It is also why it works
 * across several lines with nothing special: the background follows the line
 * boxes, which the browser already knows how to compose.
 *
 * ## Why `background-size` and not `width`
 *
 * Animating the width of an element would trigger a layout on every frame.
 * `background-size` affects only the painting — the compositor takes care of
 * it, and nothing is recomputed.
 *
 * ## It sits behind, never in front
 *
 * `background-image` paints under the text by construction. A superimposed
 * pseudo-element would need a negative `z-index` and a stacking context, which
 * breaks as soon as the parent creates one. The background does not have that
 * problem.
 *
 * ## Under reduced motion, the stroke stays
 *
 * It does not animate, but it shows: it is an emphasis, not a decoration.
 * Removing it would change the meaning of the sentence, where removing a
 * movement takes nothing away.
 *
 * @module
 */

import { mergePresentation, useMotionState, type Customisable } from '@odoro-cli/engine'
import { type CSSProperties, type ElementType, type ReactElement } from 'react'

import { useInView } from '@registre/hooks/useInView'

/** Properties specific to the component. */
export interface HighlightSweepOwnProps {
  /** Text to highlight. */
  children: React.ReactNode
  /** Rendered tag. @defaultValue 'span' */
  as?: ElementType
  /**
   * Colour of the stroke.
   *
   * A value, not a role: highlighting is a layout decision, and imposing it
   * from the theme tokens would rule out half of its uses.
   *
   * @defaultValue a hue from the brand palette
   */
  colour?: string
  /**
   * Thickness of the stroke, as a share of the line height.
   *
   * @defaultValue 0.35
   */
  thickness?: number
  /** Duration of the drawing, in milliseconds. @defaultValue 600 */
  duration?: number
  /** Delay before the drawing, in milliseconds. @defaultValue 0 */
  delay?: number
  /**
   * When to start.
   *
   * @defaultValue 'view'
   */
  trigger?: 'view' | 'mount'
}

/** All properties. */
export type HighlightSweepProps = Customisable<HighlightSweepOwnProps, 'span'>

/** Identifier of the injected stylesheet. */
const STYLE_ID = 'o-highlight-sweep'

/** Sets the highlighter rules, once per document. */
function ensureHighlightRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-highlight]{',
    'background-image:linear-gradient(var(--o-highlight-colour),var(--o-highlight-colour));',
    'background-repeat:no-repeat;',
    // Anchored bottom left: the stroke pushes to the right, like a hand.
    'background-position:0 88%;',
    'background-size:0% var(--o-highlight-thickness);',
    'transition:background-size var(--o-highlight-duration) cubic-bezier(0.65,0,0.35,1) var(--o-highlight-delay);',
    // The negative margin lets the stroke overrun the text a little, which
    // makes the gesture less mechanical.
    'padding:0 0.08em;margin:0 -0.08em;',
    '}',
    '[data-o-highlight-trace]{background-size:100% var(--o-highlight-thickness)}',
    // With no motion, the stroke is simply there: it is an emphasis, not a
    // decoration, and removing it would change the meaning of the sentence.
    '@media (prefers-reduced-motion:reduce){[data-o-highlight]{transition:none}}',
  ].join('')
  document.head.append(style)
}

/**
 * Draws a highlighter behind a text.
 *
 * @example
 * <p>
 *   An engine <HighlightSweep>built entirely in house</HighlightSweep>, and
 *   nothing that is not yours.
 * </p>
 *
 * @example
 * // A thin and light stroke, drawn from mount.
 * <HighlightSweep colour="var(--o-palette-amber-200)" thickness={0.2} trigger="mount">
 *   new
 * </HighlightSweep>
 */
export function HighlightSweep({
  children,
  as: Tag = 'span',
  colour = 'var(--o-palette-brand-200)',
  thickness = 0.35,
  duration = 600,
  delay = 0,
  trigger = 'view',
  ...rest
}: HighlightSweepProps): ReactElement {
  const { reduced } = useMotionState()
  const { ref: viewRef, inView } = useInView<HTMLElement>({
    immediate: trigger === 'mount',
  })

  ensureHighlightRule()

  const { className, style } = mergePresentation({}, rest)

  const strokeStyle = {
    ...style,
    '--o-highlight-colour': colour,
    '--o-highlight-thickness': `${String(Math.round(thickness * 100))}%`,
    '--o-highlight-duration': `${String(duration)}ms`,
    '--o-highlight-delay': `${String(delay)}ms`,
  } as CSSProperties

  // Under reduced motion, the stroke is laid down right away: the transition
  // is neutralised by the stylesheet, so there is nothing to wait for.
  const drawn = reduced || inView

  return (
    <Tag
      {...rest}
      ref={viewRef}
      className={className}
      style={strokeStyle}
      data-o-highlight=""
      {...(drawn ? { 'data-o-highlight-trace': '' } : {})}
    >
      {children}
    </Tag>
  )
}

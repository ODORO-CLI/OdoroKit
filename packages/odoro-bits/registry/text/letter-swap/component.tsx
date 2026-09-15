/**
 * Swapped letters: on hover, each letter slides up and its understudy takes
 * its place — the effect of studio menus.
 *
 * ## Two copies in a mask, one transition, nothing else
 *
 * Each letter lives in a cell with `overflow: hidden`: the original in place,
 * the understudy just below, outside the mask. The hover translates the column
 * by one letter height — the understudy rises, the original leaves. It is all
 * CSS transition; withdrawing the pointer replays the journey backwards, for
 * free. The delay growing from left to right runs a wave along the word.
 *
 * ## The hover of the link, not only of the text
 *
 * The effect lives in menus: what is hovered is the link, whose text occupies
 * only part of it. The rules therefore also listen to the `:hover` and the
 * `:focus-visible` of the interactive element that wraps the component — a
 * keyboard triggers the same wave as a mouse.
 *
 * ## The split is a display device
 *
 * The text is broken into letters, and each letter exists twice. The container
 * therefore carries the complete text as an `aria-label`, and the cells are
 * removed from the accessibility tree.
 *
 * @module
 */

import { mergePresentation, useMotionState, type Customisable } from '@odoro-cli/engine'
import { type CSSProperties, type ElementType, type ReactElement } from 'react'

/** Properties specific to the component. */
export interface LetterSwapOwnProps {
  /** Text to swap. */
  children: string
  /** Rendered tag. @defaultValue 'span' */
  as?: ElementType
  /** Delay between two letters, in milliseconds. @defaultValue 25 */
  step?: number
  /** Duration of the slide of one letter, in milliseconds. @defaultValue 350 */
  duration?: number
}

/** All properties. */
export type LetterSwapProps = Customisable<LetterSwapOwnProps, 'span'>

/** No-break space: an ordinary space collapses inside an inline block. */
const NBSP = '\u00A0'

/** Identifier of the injected stylesheet. */
const STYLE_ID = 'o-letter-swap'

/** Sets the swap rules, once per document. */
function ensureSwapRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-swap]{display:inline-block}',
    '[data-o-swap-cell]{display:inline-block;overflow:hidden;vertical-align:top}',
    '[data-o-swap-col]{',
    'display:block;position:relative;',
    'transition:transform var(--o-swap-duration) cubic-bezier(0.2,0,0,1);',
    'transition-delay:var(--o-swap-delay);',
    '}',
    '[data-o-swap-double]{position:absolute;top:100%;left:0}',
    // The hover of the component, or that of the link wrapping it. A keyboard
    // goes through focus and gets the same wave.
    '[data-o-swap]:hover [data-o-swap-col],',
    '[data-o-swap]:focus-visible [data-o-swap-col],',
    ':where(a,button):hover [data-o-swap] [data-o-swap-col],',
    ':where(a,button):focus-visible [data-o-swap] [data-o-swap-col]{',
    'transform:translateY(-100%);',
    '}',
  ].join('')
  document.head.append(style)
}

/**
 * Swaps the letters of a text on hover or on focus.
 *
 * @example
 * <a href="/work" className="o-text-2xl o-font-bold">
 *   <LetterSwap>Work</LetterSwap>
 * </a>
 *
 * @example
 * // A slower, more pronounced wave.
 * <LetterSwap step={60} duration={500}>Studio</LetterSwap>
 */
export function LetterSwap({
  children,
  as: Tag = 'span',
  step = 25,
  duration = 350,
  ...rest
}: LetterSwapProps): ReactElement {
  const { reduced } = useMotionState()
  ensureSwapRule()

  const { className, style } = mergePresentation({}, rest)

  // Reduced motion: the text is rendered as it is, with no split — the swap
  // brought nothing but the gesture.
  if (reduced) {
    return (
      <Tag {...rest} className={className} style={style}>
        {children}
      </Tag>
    )
  }

  const letters = [...children]

  const swapStyle = {
    ...style,
    '--o-swap-duration': `${String(duration)}ms`,
  } as CSSProperties

  return (
    <Tag
      {...rest}
      className={className}
      style={swapStyle}
      role="text"
      aria-label={children}
      data-o-swap=""
    >
      {letters.map((letter, index) => {
        const shown = letter === ' ' ? NBSP : letter
        return (
          <span
            key={`${letter}-${String(index)}`}
            aria-hidden
            data-o-swap-cell=""
            style={
              {
                '--o-swap-delay': `${String(index * step)}ms`,
              } as CSSProperties
            }
          >
            <span data-o-swap-col="">
              {shown}
              <span data-o-swap-double="">{shown}</span>
            </span>
          </span>
        )
      })}
    </Tag>
  )
}

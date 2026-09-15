/**
 * Fanned cards: a stacked deck that opens on hover.
 *
 * ## The first card gives the deck its size
 *
 * As with the flip card, a single card stays in the flow: the first one.
 * The others sit on top of it in absolute position. The deck therefore takes
 * exactly the room of one card, and the fan overflows around it — that is the
 * expected behavior of a deck, not that of a grid.
 *
 * ## Two transforms per card, computed once
 *
 * Each card receives its rest position and its fanned position as CSS
 * variables, computed at render time from its rank. The transition travels
 * between the two: interrupting the gesture midway resumes from the current
 * angle, without a jump. No loop, no per-frame computation.
 *
 * ## `focus-within` opens the fan from the keyboard
 *
 * The deck is focusable, and a card that contains a link or a button opens the
 * fan as soon as that link takes focus: the content tucked under the stack
 * stays reachable without a mouse.
 *
 * @module
 */

import { mergePresentation, useMotionState, type Customisable } from '@odoro-cli/engine'
import { Children, type CSSProperties, type ReactElement, type ReactNode } from 'react'

/** Properties specific to the component. */
export interface StackedCardsOwnProps {
  /** The cards, up to four. The first gives the deck its size. */
  children: ReactNode
  /** Angle between two cards once fanned, in degrees. @defaultValue 10 */
  spread?: number
  /** Horizontal gap between two cards once fanned, in pixels. @defaultValue 36 */
  lift?: number
}

/** All properties. */
export type StackedCardsProps = Customisable<StackedCardsOwnProps>

/** Id of the injected stylesheet. */
const STYLE_ID = 'o-stacked-cards'

/** Sets up the deck and its two states, once per document. */
function ensureStackedRules(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-stacked]{position:relative;display:inline-block}',
    '[data-o-stacked-item]{',
    'position:absolute;inset:0;',
    'transform:var(--o-stacked-rest);',
    'transform-origin:50% 120%;',
    'transition:transform var(--o-duration-slow) var(--o-ease-emphasized);',
    '}',
    // The first card stays in the flow: it gives the deck its size.
    '[data-o-stacked-item]:first-child{position:relative}',
    '[data-o-stacked]:is(:hover,:focus-visible,:focus-within) [data-o-stacked-item]{',
    'transform:var(--o-stacked-fan);',
    '}',
    // Reduced motion: the fan opens, with no travel.
    '@media (prefers-reduced-motion:reduce){',
    '[data-o-stacked-item]{transition:none}',
    '}',
  ].join('')
  document.head.append(style)
}

/**
 * Stacks up to four cards and fans them out on hover or focus.
 *
 * @example
 * <StackedCards>
 *   <article className="o-rounded-xl o-border-w-1 o-p-6">One</article>
 *   <article className="o-rounded-xl o-border-w-1 o-p-6">Two</article>
 *   <article className="o-rounded-xl o-border-w-1 o-p-6">Three</article>
 * </StackedCards>
 *
 * @example
 * // A wider, more spread out fan.
 * <StackedCards spread={18} lift={64}>{cards}</StackedCards>
 */
export function StackedCards({
  children,
  spread = 10,
  lift = 36,
  ...rest
}: StackedCardsProps): ReactElement {
  const { reduced } = useMotionState()
  ensureStackedRules()

  const cards = Children.toArray(children).slice(0, 4)
  const middle = (cards.length - 1) / 2

  const { className, style } = mergePresentation({}, rest)

  return (
    <div
      {...rest}
      tabIndex={0}
      data-o-stacked=""
      className={className}
      style={
        {
          ...style,
          ...(reduced ? { '--o-duration-slow': '0ms' } : {}),
        } as CSSProperties
      }
    >
      {cards.map((card, index) => {
        // At rest, each card slides and tilts a little more than the previous
        // one; fanned out, it takes its place around the center.
        const rest_ = `translateY(${String(index * -6)}px) rotate(${String(index * 2)}deg)`
        const fan = [
          `translateX(${String((index - middle) * lift)}px)`,
          `translateY(${String(-Math.abs(index - middle) * 8)}px)`,
          `rotate(${String((index - middle) * spread)}deg)`,
        ].join(' ')

        return (
          <div
            key={index}
            data-o-stacked-item=""
            style={
              {
                '--o-stacked-rest': rest_,
                '--o-stacked-fan': fan,
                zIndex: cards.length - index,
              } as CSSProperties
            }
          >
            {card}
          </div>
        )
      })}
    </div>
  )
}

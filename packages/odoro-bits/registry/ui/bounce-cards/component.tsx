/**
 * Bouncing cards: a fan already open, whose cards arrive bouncing one by one,
 * and part for the one being hovered.
 *
 * ## What sets them apart from fanned cards
 *
 * Fanned cards are a closed deck that opens on hover. Here the fan is the
 * **rest state**: it is open from the moment it arrives, and the arrival is
 * the event. Each card falls into place with an overshoot — it passes its
 * position, comes back, settles — offset from the previous one. After that,
 * hovering a card lifts it and straightens it, and its neighbours part to
 * make room, like a deck spread out from which one card is pulled.
 *
 * ## The bounce is a curve, not a simulation
 *
 * A Bezier curve whose ordinate goes past one — `1.56` at the second control
 * point — produces exactly one overshoot then a return. The compositor holds
 * it, without a line of JavaScript per frame, and interrupting the gesture
 * restarts from the current position.
 *
 * ## The neighbours part without JavaScript
 *
 * The `~` combinator designates the cards following the hovered card;
 * `:has(~ :hover)` designates those preceding it. Two rules, and the whole
 * row reacts, with no listener and no state.
 *
 * ## The arrival offset must not delay the hover
 *
 * The per-card delay is set on the transform transition. Left as is, it would
 * also delay the lift when hovering the last card. Once the arrival is over,
 * the host switches to a "settled" state and the delays drop to zero.
 *
 * ## Under reduced motion
 *
 * The fan is open, with no travel and no bounce; hover changes state without
 * a transition. This is the final state.
 *
 * @module
 */

import { mergePresentation, useMotionState, type Customisable } from '@odoro-cli/engine'
import {
  Children,
  useEffect,
  useState,
  type CSSProperties,
  type ReactElement,
  type ReactNode,
} from 'react'

import { useInView } from '@registre/hooks/useInView'

/** Properties specific to the component. */
export interface BounceCardsOwnProps {
  /** The cards, from two to six. The first one gives the row its size. */
  children: ReactNode
  /** Angle between two neighbouring cards, in degrees. @defaultValue 6 */
  spread?: number
  /** Horizontal gap between two cards, in pixels. @defaultValue 56 */
  gap?: number
  /** Arrival offset between two cards, in milliseconds. @defaultValue 90 */
  delay?: number
}

/** All properties. */
export type BounceCardsProps = Customisable<BounceCardsOwnProps>

/** Identifier of the injected stylesheet. */
const STYLE_ID = 'o-bounce-cards'

/** Duration of one card's travel, in milliseconds. */
const TRAVEL = 640

/** Applies the row, the arrival and the hover, once per document. */
function ensureBounceRules(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-bounce]{position:relative;display:inline-block}',
    '[data-o-bounce-item]{',
    'position:absolute;inset:0;',
    'transform:var(--o-bounce-rest);transform-origin:50% 110%;',
    // The second control point goes past one: that is the bounce.
    `transition:transform ${String(TRAVEL)}ms cubic-bezier(0.34,1.56,0.64,1) var(--o-bounce-delay),`,
    'opacity 320ms ease var(--o-bounce-delay);',
    '}',
    '[data-o-bounce-item]:first-child{position:relative}',
    // Before the arrival: lower, smaller, invisible.
    '[data-o-bounce]:not([data-o-bounce-in]) [data-o-bounce-item]{',
    'opacity:0;transform:translateY(72px) scale(0.6);',
    '}',
    // Settled: the arrival delays no longer hold back the hover.
    '[data-o-bounce-settled] [data-o-bounce-item]{--o-bounce-delay:0ms}',
    '[data-o-bounce-in] [data-o-bounce-item]:hover{transform:var(--o-bounce-up);z-index:10}',
    '[data-o-bounce-in] [data-o-bounce-item]:hover ~ [data-o-bounce-item]{transform:var(--o-bounce-right)}',
    '[data-o-bounce-in] [data-o-bounce-item]:has(~ [data-o-bounce-item]:hover){transform:var(--o-bounce-left)}',
    '@media (prefers-reduced-motion:reduce){',
    '[data-o-bounce-item]{transition:none}',
    '}',
  ].join('')
  document.head.append(style)
}

/**
 * Spreads cards into a fan, with an arrival that bounces.
 *
 * @example
 * <BounceCards>
 *   <article className="o-w-40 o-rounded-xl o-p-4">One</article>
 *   <article className="o-w-40 o-rounded-xl o-p-4">Two</article>
 *   <article className="o-w-40 o-rounded-xl o-p-4">Three</article>
 * </BounceCards>
 *
 * @example
 * // Tighter, faster arrival.
 * <BounceCards spread={4} gap={40} delay={50}>{cards}</BounceCards>
 */
export function BounceCards({
  children,
  spread = 6,
  gap = 56,
  delay = 90,
  ...rest
}: BounceCardsProps): ReactElement {
  const { reduced } = useMotionState()
  const { ref, inView } = useInView<HTMLDivElement>({ amount: 0.4 })
  const [settled, setSettled] = useState(false)
  ensureBounceRules()

  const cards = Children.toArray(children).slice(0, 6)
  const middle = (cards.length - 1) / 2

  useEffect(() => {
    if (!inView) return
    if (reduced) {
      setSettled(true)
      return
    }
    const timer = window.setTimeout(
      () => setSettled(true),
      TRAVEL + delay * Math.max(cards.length - 1, 0),
    )
    return () => window.clearTimeout(timer)
  }, [inView, reduced, delay, cards.length])

  const { className, style } = mergePresentation({}, rest)

  return (
    <div
      {...rest}
      ref={ref}
      className={className}
      style={style}
      data-o-bounce=""
      {...(inView ? { 'data-o-bounce-in': '' } : {})}
      {...(settled ? { 'data-o-bounce-settled': '' } : {})}
    >
      {cards.map((card, index) => {
        const offset = index - middle
        const x = offset * gap
        const angle = offset * spread
        const push = gap * 0.45

        return (
          <div
            key={index}
            data-o-bounce-item=""
            style={
              {
                '--o-bounce-delay': `${String(index * delay)}ms`,
                '--o-bounce-rest': `translateX(${String(x)}px) rotate(${String(angle)}deg)`,
                '--o-bounce-up': `translateX(${String(x)}px) translateY(-20px) scale(1.06)`,
                '--o-bounce-right': `translateX(${String(x + push)}px) rotate(${String(angle)}deg)`,
                '--o-bounce-left': `translateX(${String(x - push)}px) rotate(${String(angle)}deg)`,
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

/**
 * Card swap: a stack whose front card hops to the back at a regular interval,
 * and the others move up one rank.
 *
 * ## The rank is a state, the position follows from it
 *
 * Every card knows its rank — zero at the front, then one, two — and the rank
 * yields a transform: slightly higher, slightly further right, slightly
 * smaller at each notch. The swap is nothing but a shift of the head index, a
 * React render every few seconds, never per frame. The transitions make the
 * travel between two ranks.
 *
 * ## The leaving card hops, the others slide
 *
 * A plain exchange of transforms would send the front card straight through
 * the stack. It therefore gets a three-beat animation: it drops out of the
 * stack, passes underneath it, and rises back at the rear. The keyframes read
 * its two positions from variables, so the same animation serves whatever the
 * number of cards. Its layer moves to the back from the very start: by the
 * time it rises, it is already under the others.
 *
 * ## The stack freezes under the pointer
 *
 * A stack that swaps its cards while one is reading the front one is a stack
 * that cannot be read. Hover, and focus on an element of the card, suspend
 * the interval.
 *
 * ## Under reduced motion
 *
 * The stack is laid out and no longer turns. A swap that loops forever has no
 * final state; the rest state is the stack itself.
 *
 * @module
 */

import { mergePresentation, useMotionState, type Customisable } from '@odoro-cli/engine'
import {
  Children,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactElement,
  type ReactNode,
} from 'react'

/** Properties specific to the component. */
export interface CardSwapOwnProps {
  /** The cards, from two to five. The first one gives the stack its size. */
  children: ReactNode
  /** Time between two swaps, in milliseconds. @defaultValue 3000 */
  interval?: number
  /** Duration of one swap, in milliseconds. @defaultValue 700 */
  duration?: number
  /** Offset between two ranks, in pixels. @defaultValue 16 */
  offset?: number
}

/** All properties. */
export type CardSwapProps = Customisable<CardSwapOwnProps>

/** Identifier of the injected stylesheet. */
const STYLE_ID = 'o-card-swap'

/** Applies the stack and the hop, once per document. */
function ensureSwapRules(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-swap]{position:relative;display:inline-block}',
    '[data-o-swap-item]{',
    'position:absolute;inset:0;',
    'transform:var(--o-swap-to);transform-origin:50% 100%;',
    'transition:transform var(--o-swap-duration) cubic-bezier(0.2,0,0,1),',
    'opacity var(--o-swap-duration) linear;',
    '}',
    '[data-o-swap-item]:first-child{position:relative}',
    // The leaving card: three beats, read from its two variables.
    '[data-o-swap-item][data-o-swap-out]{',
    'transition:none;',
    'animation:o-card-swap-hop var(--o-swap-duration) cubic-bezier(0.2,0,0,1) both;',
    '}',
    '@keyframes o-card-swap-hop{',
    '0%{transform:var(--o-swap-from)}',
    '45%{transform:translateY(var(--o-swap-drop)) scale(0.96)}',
    '100%{transform:var(--o-swap-to)}',
    '}',
    '@media (prefers-reduced-motion:reduce){',
    '[data-o-swap-item]{transition:none;animation:none}',
    '}',
  ].join('')
  document.head.append(style)
}

/**
 * Turns a stack of cards, the first one moving to the back.
 *
 * @example
 * <CardSwap>
 *   <article className="o-w-64 o-rounded-xl o-p-6">One</article>
 *   <article className="o-w-64 o-rounded-xl o-p-6">Two</article>
 *   <article className="o-w-64 o-rounded-xl o-p-6">Three</article>
 * </CardSwap>
 *
 * @example
 * // Slower, with a more spread-out stack.
 * <CardSwap interval={5000} offset={24}>{cards}</CardSwap>
 */
export function CardSwap({
  children,
  interval = 3000,
  duration = 700,
  offset = 16,
  ...rest
}: CardSwapProps): ReactElement {
  const { reduced } = useMotionState()
  const [head, setHead] = useState(0)
  const [leaving, setLeaving] = useState<number | null>(null)
  const previous = useRef(0)
  const paused = useRef(false)
  ensureSwapRules()

  const cards = Children.toArray(children).slice(0, 5)
  const count = cards.length

  useEffect(() => {
    if (reduced || count < 2) return

    const timer = window.setInterval(
      () => {
        if (paused.current) return
        setHead((value) => (value + 1) % count)
      },
      Math.max(interval, duration + 100),
    )

    return () => window.clearInterval(timer)
  }, [reduced, count, interval, duration])

  // The card that has just left the head makes its hop, then becomes an
  // ordinary card of the stack again once the travel is over.
  useEffect(() => {
    if (head === previous.current) return
    setLeaving(previous.current)
    previous.current = head
    const timer = window.setTimeout(() => setLeaving(null), duration)
    return () => window.clearTimeout(timer)
  }, [head, duration])

  const { className, style } = mergePresentation({}, rest)

  const place = (rank: number): string =>
    [
      `translateX(${String(rank * offset * 0.8)}px)`,
      `translateY(${String(rank * -offset)}px)`,
      `scale(${(1 - rank * 0.05).toFixed(3)})`,
    ].join(' ')

  return (
    <div
      {...rest}
      className={className}
      style={
        {
          ...style,
          '--o-swap-duration': `${String(reduced ? 0 : duration)}ms`,
        } as CSSProperties
      }
      data-o-swap=""
      onPointerEnter={(event) => {
        paused.current = true
        rest.onPointerEnter?.(event)
      }}
      onPointerLeave={(event) => {
        paused.current = false
        rest.onPointerLeave?.(event)
      }}
      onFocus={(event) => {
        paused.current = true
        rest.onFocus?.(event)
      }}
      onBlur={(event) => {
        paused.current = false
        rest.onBlur?.(event)
      }}
    >
      {cards.map((card, index) => {
        const rank = (index - head + count) % count
        const out = leaving === index

        return (
          <div
            key={index}
            data-o-swap-item=""
            {...(out ? { 'data-o-swap-out': '' } : {})}
            {...(rank === 0 ? {} : { 'aria-hidden': true })}
            style={
              {
                '--o-swap-from': place(0),
                '--o-swap-to': place(rank),
                '--o-swap-drop': `${String(offset * 4 + 40)}px`,
                zIndex: count - rank,
                opacity: 1 - rank * 0.12,
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

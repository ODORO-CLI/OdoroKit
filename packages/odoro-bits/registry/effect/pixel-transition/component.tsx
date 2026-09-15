/**
 * Checkerboard transition between two contents.
 *
 * ## Cover, swap, uncover
 *
 * Moving from one content to another through a mask of squares would require
 * cutting the second into as many pieces — impossible as soon as it is text,
 * buttons or a whole card.
 *
 * The checkerboard is therefore **opaque** and plays in three beats: it covers
 * the first content, the swap happens behind it, then it withdraws. That is
 * two React renders per passage, and nothing in between: the delays of each
 * square live in the stylesheet, not in a loop.
 *
 * ## Why a checkerboard and not a sweep
 *
 * The squares light up along diagonals, but in two passes: first every other
 * square, then the rest. The covering is thus done in two interleaved waves,
 * which avoids the straight front of a plain sweep — one recognises a screen
 * pixelating, not a curtain closing.
 *
 * ## Both contents stay in the document
 *
 * The resting content occupies the flow and gives the area its size; the other
 * is superimposed. The one that is not shown is hidden by `visibility`, which
 * removes it from the tab order and from speech output without taking away its
 * place — an absent content would make the layout jump on every passage.
 *
 * Under reduced motion, the swap is immediate: it is the final state, without
 * the squares.
 *
 * @module
 */

import { mergePresentation, useMotionState, type Customisable } from '@odoro-cli/engine'
import {
  useEffect,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type ReactElement,
  type ReactNode,
} from 'react'

import { useInView } from '@registre/hooks/useInView'

/** What triggers the passage to the second content. */
export type PixelTrigger = 'hover' | 'click' | 'view'

/** Properties specific to the component. */
export interface PixelTransitionOwnProps {
  /** Resting content. It gives the area its size. */
  from: ReactNode
  /** Content shown after the passage. */
  to: ReactNode
  /** Number of columns. The rows follow the proportions. @defaultValue 12 */
  cells?: number
  /** Duration of the covering, in milliseconds. @defaultValue 520 */
  duration?: number
  /** What triggers the passage. @defaultValue 'hover' */
  trigger?: PixelTrigger
  /** Colour of the squares. @defaultValue the theme ink */
  color?: string
}

/** All properties. */
export type PixelTransitionProps = Customisable<PixelTransitionOwnProps>

/** Duration of the fade of a single square, in milliseconds. */
const CELL_FADE = 140

/**
 * Swaps two contents behind a checkerboard.
 *
 * @example
 * <PixelTransition
 *   from={<img src="/sleeve.jpg" alt="Album sleeve" />}
 *   to={<img src="/back.jpg" alt="Track listing" />}
 *   className="o-w-64 o-rounded-xl"
 * />
 *
 * @example
 * // On click, in coarse pixels, in the brand hue.
 * <PixelTransition
 *   trigger="click"
 *   cells={6}
 *   color="var(--o-palette-brand-500)"
 *   from={<p>The price</p>}
 *   to={<p>39 EUR per month</p>}
 * />
 */
export function PixelTransition({
  from,
  to,
  cells = 12,
  duration = 520,
  trigger = 'hover',
  color = 'var(--o-theme-fg)',
  ...rest
}: PixelTransitionProps): ReactElement {
  const { reduced } = useMotionState()
  const { ref, inView } = useInView<HTMLDivElement>({
    immediate: trigger !== 'view',
  })

  const [ratio, setRatio] = useState(0.6)
  const [target, setTarget] = useState<'from' | 'to'>('from')
  const [shown, setShown] = useState<'from' | 'to'>('from')
  const [covered, setCovered] = useState(false)

  // Entering the viewport is a trigger like any other: it sets the same target
  // as the hover or the click.
  useEffect(() => {
    if (trigger === 'view' && inView) setTarget('to')
  }, [trigger, inView])

  // The proportions of the area give the number of rows: without that
  // measurement, the squares would be rectangles stretched over a wide area,
  // and the checkerboard would no longer read as a checkerboard.
  useEffect(() => {
    const host = ref.current
    if (host === null) return

    const observer = new ResizeObserver(() => {
      const rect = host.getBoundingClientRect()
      if (rect.width > 0) setRatio(rect.height / rect.width)
    })
    observer.observe(host)
    return () => observer.disconnect()
  }, [ref])

  const cover = Math.max(duration, 0) + CELL_FADE

  useEffect(() => {
    if (target === shown) return

    // With no motion, there is nothing to cover: the final state is applied
    // right away.
    if (reduced) {
      setShown(target)
      return
    }

    setCovered(true)
    const timer = setTimeout(() => {
      // The swap happens behind the full checkerboard, then the squares
      // withdraw in the reverse order.
      setShown(target)
      setCovered(false)
    }, cover)

    return () => clearTimeout(timer)
  }, [target, shown, reduced, cover])

  const columns = Math.max(2, Math.round(cells))
  const rows = Math.max(2, Math.round(columns * ratio))
  const total = columns * rows
  const steps = columns + rows

  const { className, style } = mergePresentation(
    { className: 'o-relative o-overflow-hidden' },
    rest,
  )

  const layer = (visible: boolean): CSSProperties => ({
    visibility: visible ? 'visible' : 'hidden',
  })

  const toggle = (): void => setTarget((value) => (value === 'from' ? 'to' : 'from'))

  // A click trigger must answer the keyboard: without that, the second content
  // would be out of reach for anyone without a mouse.
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>): void => {
    if (event.key !== 'Enter' && event.key !== ' ') return
    event.preventDefault()
    toggle()
  }

  return (
    <div
      {...rest}
      ref={ref}
      className={className}
      style={style}
      role={trigger === 'click' ? 'button' : undefined}
      tabIndex={trigger === 'click' ? 0 : undefined}
      onPointerEnter={trigger === 'hover' ? () => setTarget('to') : undefined}
      onPointerLeave={trigger === 'hover' ? () => setTarget('from') : undefined}
      onClick={trigger === 'click' ? toggle : undefined}
      onKeyDown={trigger === 'click' ? onKeyDown : undefined}
    >
      <div style={layer(shown === 'from')}>{from}</div>
      <div className="o-absolute o-inset-0" style={layer(shown === 'to')}>
        {to}
      </div>

      {reduced ? null : (
        <div
          aria-hidden
          className="o-absolute o-inset-0 o-grid o-pointer-events-none"
          style={{
            gridTemplateColumns: `repeat(${String(columns)}, 1fr)`,
            gridTemplateRows: `repeat(${String(rows)}, 1fr)`,
          }}
        >
          {Array.from({ length: total }, (_, index) => {
            const column = index % columns
            const row = Math.floor(index / columns)
            // Every other square first, the rest afterwards, each pass along a
            // diagonal: two interleaved waves rather than a straight front.
            const pass = (column + row) % 2
            const rank = (pass * steps + column + row) / (2 * steps)
            const delay = (covered ? rank : 1 - rank) * duration

            return (
              <span
                key={index}
                style={{
                  backgroundColor: color,
                  opacity: covered ? 1 : 0,
                  transition: `opacity ${String(CELL_FADE)}ms linear ${delay.toFixed(0)}ms`,
                }}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}

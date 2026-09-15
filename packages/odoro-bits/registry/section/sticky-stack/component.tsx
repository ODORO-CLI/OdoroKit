/**
 * Cards that pin and stack as the page scrolls.
 *
 * ## Pinning is native, and it must stay that way
 *
 * `position: sticky` does all the positioning work: the card follows the
 * scroll up to its anchor point, then pins there while the next one rises.
 * Reproducing that by hand would mean measuring, computing, and rewriting one
 * transform per frame — for a result that trails a frame behind the content.
 *
 * The only setting the native behaviour does not give is the **shrinking** of
 * the pinned card when the next one covers it. That is what the loop writes,
 * and nothing else.
 *
 * ## Every card has its own anchor
 *
 * Stacking cards at the same spot would make them disappear one under another.
 * Each one therefore anchors a few pixels lower than the previous one: the
 * edge of those underneath stays visible, and the stack reads.
 *
 * @module
 */

import {
  mergePresentation,
  useMotionState,
  useScrollScrub,
  type Customisable,
} from '@odoro-cli/engine'
import {
  Children,
  useCallback,
  useRef,
  type CSSProperties,
  type ReactElement,
  type ReactNode,
} from 'react'

/** Props specific to the component. */
export interface StickyStackOwnProps {
  /** The cards. */
  children: ReactNode
  /** Distance to the top of the viewport, in pixels. @defaultValue 96 */
  offset?: number
  /** Visible offset between two stacked cards, in pixels. @defaultValue 24 */
  gap?: number
  /** Shrink of the card when the next one arrives, from 0 to 0.3. @defaultValue 0.05 */
  shrink?: number
}

/** Every prop. */
export type StickyStackProps = Customisable<StickyStackOwnProps>

/** A pinned card, which shrinks when the next one covers it. */
function Card({
  index,
  offset,
  gap,
  shrink,
  reduced,
  children,
}: {
  index: number
  offset: number
  gap: number
  shrink: number
  reduced: boolean
  children: ReactNode
}): ReactElement {
  const inner = useRef<HTMLDivElement | null>(null)

  const onProgress = useCallback(
    (progress: number) => {
      const target = inner.current
      if (target === null) return
      // The shrinking only starts at the second half of the crossing: before
      // that, the card is not covered yet, and seeing it shrink for no reason
      // reads as a defect.
      const started = Math.max(0, progress * 2 - 1)
      target.style.transform = `scale(${(1 - started * shrink).toFixed(4)})`
    },
    [shrink],
  )

  const { ref } = useScrollScrub<HTMLDivElement>(onProgress, {
    name: 'sticky stack',
  })

  return (
    <div
      ref={ref}
      className="o-sticky"
      style={{ top: `${String(offset + index * gap)}px` }}
    >
      <div
        ref={inner}
        className={reduced ? undefined : 'o-will-change-transform o-origin-top'}
      >
        {children}
      </div>
    </div>
  )
}

/**
 * Stacks cards as the page scrolls.
 *
 * @example
 * <StickyStack offset={120} shrink={0.06}>
 *   {steps.map((step) => (
 *     <article key={step.id} className="o-rounded-xl o-border-w-1 o-p-8">
 *       {step.title}
 *     </article>
 *   ))}
 * </StickyStack>
 */
export function StickyStack({
  children,
  offset = 96,
  gap = 24,
  shrink = 0.05,
  ...rest
}: StickyStackProps): ReactElement {
  const { reduced } = useMotionState()
  const cards = Children.toArray(children)

  const { className, style } = mergePresentation(
    { className: 'o-flex o-flex-col o-gap-8' },
    rest,
  )

  return (
    <div {...rest} className={className} style={style as CSSProperties}>
      {cards.map((card, index) => (
        <Card
          key={index}
          index={index}
          offset={offset}
          gap={gap}
          shrink={reduced ? 0 : shrink}
          reduced={reduced}
        >
          {card}
        </Card>
      ))}
    </div>
  )
}

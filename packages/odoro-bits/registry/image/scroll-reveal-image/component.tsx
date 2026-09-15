/**
 * Image uncovered by scrolling: the curtain follows the position of the page,
 * not a timer. It can be stopped midway, reversed, closed again.
 *
 * ## What sets it apart from the revealed image
 *
 * The revealed image is a trigger: it enters the viewport, it plays its
 * opening once, and that is that. Here the progress **is** the scroll position
 * — a "scrub". Scrolling back up closes the curtain again. It is the effect
 * one wants on a long page where the image is uncovered at the pace of the
 * reading, and it cannot be simulated with a transition.
 *
 * ## A single number crosses the boundary
 *
 * The measurement writes a CSS variable on the frame, between zero and one.
 * Everything else — the clipping of the curtain, the counter-zoom of the
 * image, the position of the edging — follows from it in the stylesheet, in
 * `calc`. No React render, and a single write per frame, skipped when the
 * value has not moved.
 *
 * ## Why the engine loop and not a scroll listener
 *
 * A `scroll` listener fires at a rhythm decided by the browser, which is not
 * that of the refresh: the value would arrive one frame late on one frame in
 * three, which shows as a judder on a crisp edge. The measurement therefore
 * goes through the engine clock, before the render of the same frame.
 *
 * The progress is measured against the first ancestor that really scrolls, and
 * not against the window: laid inside a panel with internal scrolling, the
 * image is uncovered when that panel moves.
 *
 * ## Under reduced motion
 *
 * The curtain is wide open from the first render and nothing subscribes: the
 * final state, never the waiting state.
 *
 * @module
 */

import {
  CLOCK_PRIORITY,
  clock,
  mergePresentation,
  useMotionState,
  type Customisable,
} from '@odoro-cli/engine'
import { useEffect, useRef, type CSSProperties, type ReactElement } from 'react'

/** Identifier of the injected stylesheet. */
const STYLE_ID = 'o-scroll-reveal-image'

/** Share of the crossing covered before the curtain starts to open. */
const START = 0.12

/** Sets the curtain rules, once per document. */
function ensureScrollRevealRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  /** The complement of the progress, as a percentage: the thickness of the curtain. */
  const thick = 'calc((1 - var(--o-sr-p)) * 100%)'

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    // The clipping: a single side moves, the one the opening comes from.
    `[data-o-sr-veil="up"]{clip-path:inset(${thick} 0 0 0)}`,
    `[data-o-sr-veil="down"]{clip-path:inset(0 0 ${thick} 0)}`,
    `[data-o-sr-veil="left"]{clip-path:inset(0 ${thick} 0 0)}`,
    `[data-o-sr-veil="right"]{clip-path:inset(0 0 0 ${thick})}`,
    // The counter-zoom: the image finishes settling at the moment the curtain
    // finishes opening. Without it, the image would already have arrived
    // before being seen.
    '[data-o-sr-image]{transform:scale(calc(1.06 - var(--o-sr-p) * 0.06))}',
    // The edging marks the edge that advances, and fades out with the end of
    // the run: the opacity goes past one at the start, and the browser clamps
    // it.
    '[data-o-sr-edge]{',
    'position:absolute;pointer-events:none;',
    'background:var(--o-palette-brand-500);',
    'opacity:calc((1 - var(--o-sr-p)) * 4);',
    '}',
    `[data-o-sr-edge="up"]{left:0;right:0;height:2px;top:${thick}}`,
    `[data-o-sr-edge="down"]{left:0;right:0;height:2px;bottom:${thick}}`,
    `[data-o-sr-edge="left"]{top:0;bottom:0;width:2px;right:${thick}}`,
    `[data-o-sr-edge="right"]{top:0;bottom:0;width:2px;left:${thick}}`,
  ].join('')
  document.head.append(style)
}

/** First ancestor whose content really scrolls. */
function scrollParentOf(element: HTMLElement): HTMLElement | null {
  let node = element.parentElement
  while (node !== null) {
    const overflow = getComputedStyle(node).overflowY
    if (overflow === 'auto' || overflow === 'scroll') return node
    node = node.parentElement
  }
  return null
}

/** Direction in which the curtain opens. */
export type ScrollRevealDirection = 'up' | 'down' | 'left' | 'right'

/** Properties specific to the component. */
export interface ScrollRevealImageOwnProps {
  /** Source of the image. */
  src: string
  /** Alternative text. Empty string if the image is purely decorative. */
  alt: string
  /** Width to height ratio of the frame. @defaultValue 1.777 */
  ratio?: number
  /** Direction in which the curtain opens. @defaultValue 'up' */
  direction?: ScrollRevealDirection
  /**
   * Share of the crossing of the viewport during which the curtain opens.
   *
   * At one, the image is only fully uncovered as it leaves through the top; at
   * a quarter, it is uncovered as soon as it has properly entered.
   *
   * @defaultValue 0.55
   */
  span?: number
  /** Mark the advancing edge with an edging. @defaultValue true */
  edge?: boolean
}

/** All properties: its own, plus those of an image. */
export type ScrollRevealImageProps = Customisable<ScrollRevealImageOwnProps, 'img'>

/**
 * Uncovers an image at the pace of the scroll.
 *
 * @example
 * <ScrollRevealImage src="/photo.jpg" alt="View of the workshop" />
 *
 * @example
 * // Lateral opening, short, with no edging.
 * <ScrollRevealImage src="/photo.jpg" alt="" direction="right" span={0.3} edge={false} />
 */
export function ScrollRevealImage({
  src,
  alt,
  ratio = 1.777,
  direction = 'up',
  span = 0.55,
  edge = true,
  ...rest
}: ScrollRevealImageProps): ReactElement {
  const { reduced } = useMotionState()
  const host = useRef<HTMLDivElement | null>(null)
  ensureScrollRevealRule()

  const run = Math.min(1, Math.max(0.1, span))

  useEffect(() => {
    if (reduced) return

    const frame = host.current
    if (frame === null) return

    // The scrolling parent is looked up once: it does not change during the
    // life of the component.
    const scroller = scrollParentOf(frame)
    let last = -1

    const subscription = clock.subscribe(
      () => {
        const box = frame.getBoundingClientRect()
        const viewTop = scroller === null ? 0 : scroller.getBoundingClientRect().top
        const viewHeight = scroller === null ? window.innerHeight : scroller.clientHeight

        // Crossing: zero when the frame enters from the bottom, one when it
        // leaves through the top.
        const total = viewHeight + box.height
        const crossing = Math.min(
          1,
          Math.max(0, (viewTop + viewHeight - box.top) / Math.max(total, 1)),
        )

        // The opening occupies only a share of the crossing, after a dead
        // time: an image that starts being uncovered before it has entered
        // does not look uncovered at all.
        const value = Math.min(1, Math.max(0, (crossing - START) / run))

        // Two hundredths are enough for the eye: below that, the write would
        // only trigger a style recalculation for nothing.
        const rounded = Math.round(value * 100) / 100
        if (rounded === last) return
        last = rounded
        frame.style.setProperty('--o-sr-p', String(rounded))
      },
      { priority: CLOCK_PRIORITY.input, name: 'image uncovered by scrolling' },
    )

    return () => subscription.unsubscribe()
  }, [reduced, run])

  const { className, style } = mergePresentation(
    { className: 'o-relative o-overflow-hidden' },
    rest,
  )

  const hostStyle = {
    ...style,
    aspectRatio: String(ratio),
    // Under reduced motion, the only state is the final state.
    '--o-sr-p': reduced ? '1' : '0',
  } as CSSProperties

  return (
    <div ref={host} className={className} style={hostStyle}>
      <div data-o-sr-veil={direction} className="o-absolute o-inset-0">
        <img
          loading="lazy"
          decoding="async"
          {...rest}
          data-o-sr-image=""
          src={src}
          alt={alt}
          className="o-size-full o-object-cover o-will-change-transform"
        />
      </div>

      {/* The edging is decorative: it marks a progress that the image already
          tells. */}
      {edge && !reduced ? <div aria-hidden data-o-sr-edge={direction} /> : null}
    </div>
  )
}

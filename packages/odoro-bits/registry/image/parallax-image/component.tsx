/**
 * Parallax image: it slides inside its frame while the page scrolls.
 *
 * ## The image is taller than the frame
 *
 * That is the whole mechanism: the image overflows its frame by a margin
 * proportional to the requested strength, and a vertical translation walks
 * that margin around during the crossing of the viewport. The frame, for its
 * part, keeps its fixed ratio and never uncovers the background — the geometry
 * guarantees it, not a computation.
 *
 * ## Why the single loop and not a scroll listener
 *
 * A `scroll` listener fires at a rhythm decided by the browser, which is not
 * that of the refresh. Writing a transform from that listener produces the
 * characteristic judder of hand-made parallaxes. The measurement therefore
 * goes through the engine clock, before the render of the same frame: one
 * rectangle read, one transform written, no React render.
 *
 * The progress is measured against the first ancestor that really scrolls, and
 * not against the window: laid inside a panel with internal scrolling, the
 * image moves when that panel moves.
 *
 * ## Under reduced motion
 *
 * The image stays motionless, framed edge to edge: a parallax has no final
 * state to preserve, it brings nothing other than its movement.
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

/** Share of the frame height reserved for the overflow, at strength 1. */
const OVERSCAN = 0.15

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

/** Properties specific to the component. */
export interface ParallaxImageOwnProps {
  /** Source of the image. */
  src: string
  /** Alternative text. Empty string if the image is purely decorative. */
  alt: string
  /** Width to height ratio of the frame. @defaultValue 1.777 */
  ratio?: number
  /** Strength of the slide, from 0 to 1. @defaultValue 0.35 */
  strength?: number
}

/** All properties: its own, plus those of an image. */
export type ParallaxImageProps = Customisable<ParallaxImageOwnProps, 'img'>

/**
 * Slides an image inside its frame along with the scroll.
 *
 * @example
 * <ParallaxImage src="/photo.jpg" alt="View of the workshop" strength={0.5} />
 */
export function ParallaxImage({
  src,
  alt,
  ratio = 1.777,
  strength = 0.35,
  ...rest
}: ParallaxImageProps): ReactElement {
  const { reduced } = useMotionState()
  const host = useRef<HTMLDivElement | null>(null)
  const image = useRef<HTMLImageElement | null>(null)

  const amount = Math.min(1, Math.max(0, strength))

  useEffect(() => {
    if (reduced || amount === 0) return

    const frame = host.current
    if (frame === null) return

    // The scrolling parent is looked up once: it does not change during the
    // life of the component, and looking it up on every frame would cost for
    // nothing.
    const scroller = scrollParentOf(frame)

    const subscription = clock.subscribe(
      () => {
        const target = image.current
        if (target === null) return

        const box = frame.getBoundingClientRect()
        const viewTop = scroller === null ? 0 : scroller.getBoundingClientRect().top
        const viewHeight = scroller === null ? window.innerHeight : scroller.clientHeight

        // Progress of the crossing: 0 when the frame enters from the bottom,
        // 1 when it leaves through the top, brought back to [-1, 1] so that
        // the image is centred in the middle of the viewport.
        const total = viewHeight + box.height
        const progress = Math.min(
          1,
          Math.max(0, (viewTop + viewHeight - box.top) / Math.max(total, 1)),
        )
        const centred = progress * 2 - 1

        const shift = -centred * box.height * amount * OVERSCAN
        target.style.transform = `translate3d(0,${shift.toFixed(2)}px,0)`
      },
      { priority: CLOCK_PRIORITY.input, name: 'parallax image' },
    )

    return () => subscription.unsubscribe()
  }, [reduced, amount])

  const { className, style } = mergePresentation(
    { className: 'o-relative o-overflow-hidden' },
    rest,
  )

  // The image overflows the frame by exactly the margin the translation walks
  // around: at strength 1, fifteen percent above and below.
  const imageStyle: CSSProperties =
    reduced || amount === 0
      ? {}
      : {
          top: `${String(-amount * OVERSCAN * 100)}%`,
          height: `${String(100 + amount * OVERSCAN * 200)}%`,
        }

  return (
    <div
      ref={host}
      className={className}
      style={{ ...style, aspectRatio: String(ratio) }}
    >
      <img
        {...rest}
        ref={image}
        src={src}
        alt={alt}
        className="o-absolute o-inset-0 o-size-full o-object-cover o-will-change-transform"
        style={imageStyle}
      />
    </div>
  )
}

/**
 * Parallax: an element that moves more slowly than the page.
 *
 * ## Why the single loop and not a scroll listener
 *
 * A `scroll` listener fires at a rhythm decided by the browser, which is not
 * that of the screen refresh. Writing a transform from that listener produces
 * a one-frame-in-two lag: the element trails behind the content, then catches
 * up with it. This is the characteristic judder of hand-made parallaxes.
 *
 * The read therefore goes through the engine's single loop, which places it
 * before the render of the same frame.
 *
 * ## Under reduced motion
 *
 * The element stays where it is. A parallax has no final state to preserve:
 * it brings nothing other than its movement.
 *
 * @module
 */

import {
  mergePresentation,
  useMotionState,
  useScrollScrub,
  type Customisable,
} from '@odoro-cli/engine'
import { useCallback, useRef, type ReactElement, type ReactNode } from 'react'

/** Properties specific to the component. */
export interface ParallaxOwnProps {
  /** Moved content. */
  children: ReactNode
  /** Amplitude of the movement over the whole crossing, in pixels. @defaultValue 80 */
  distance?: number
  /** Axis of the movement. @defaultValue 'y' */
  axis?: 'x' | 'y'
  /** Additional enlargement, from 0 to 1. @defaultValue 0 */
  scale?: number
}

/** All properties. */
export type ParallaxProps = Customisable<ParallaxOwnProps>

/**
 * Moves a content along with the scroll.
 *
 * @example
 * <div className="o-relative o-h-96 o-overflow-hidden">
 *   <Parallax distance={120} scale={0.15} className="o-absolute o-inset-0">
 *     <img src="/photo.jpg" alt="" className="o-size-full o-object-cover" />
 *   </Parallax>
 * </div>
 */
export function Parallax({
  children,
  distance = 80,
  axis = 'y',
  scale = 0,
  ...rest
}: ParallaxProps): ReactElement {
  const { reduced } = useMotionState()
  const inner = useRef<HTMLDivElement | null>(null)

  const onProgress = useCallback(
    (progress: number) => {
      const target = inner.current
      if (target === null) return

      // The progress goes from 0 to 1 over the crossing; we bring it back to
      // [-1, 1] so that the element is in place when it sits at the centre of
      // the viewport.
      const centred = progress * 2 - 1
      const shift = (-centred * distance) / 2
      const zoom = 1 + scale * (1 - Math.abs(centred))

      target.style.transform =
        axis === 'y'
          ? `translate3d(0,${shift.toFixed(2)}px,0) scale(${zoom.toFixed(3)})`
          : `translate3d(${shift.toFixed(2)}px,0,0) scale(${zoom.toFixed(3)})`
    },
    [distance, axis, scale],
  )

  const { ref } = useScrollScrub<HTMLDivElement>(onProgress, {
    name: 'parallax',
  })

  const { className, style } = mergePresentation(
    { className: 'o-will-change-transform' },
    rest,
  )

  return (
    <div {...rest} ref={ref} className={className} style={style}>
      <div ref={inner} className={reduced ? undefined : 'o-will-change-transform'}>
        {children}
      </div>
    </div>
  )
}

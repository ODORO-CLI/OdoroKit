/**
 * Image trail: the movement of the pointer sows thumbnails that appear at the
 * point of passage then dissolve.
 *
 * ## The thumbnails do not go through React
 *
 * Each thumbnail lives less than a second. Mounting it as a component would
 * require a list state, one render per sowing and another per removal — for
 * elements that nothing ever reads back. They are therefore created
 * imperatively, animated by `element.animate`, and removed from the document
 * at the end of their run. The component only keeps track of them to clean up
 * on unmount.
 *
 * ## The distance threshold is what makes the trail
 *
 * Sowing on every pointer event would give a continuous carpet — dozens of
 * thumbnails per gesture, all in the same place. A thumbnail is only born when
 * the pointer has moved a given distance away from the last sowing: it is what
 * spaces the trail out, and what bounds the cost.
 *
 * ## Under reduced motion
 *
 * The area is inert and the first image is displayed, centred and still: the
 * content — showing these images — remains, only the play disappears.
 *
 * @module
 */

import { mergePresentation, useMotionState, type Customisable } from '@odoro-cli/engine'
import { useEffect, useRef, type ReactElement, type ReactNode } from 'react'

/** One image of the trail. */
export interface TrailImage {
  /** Source. */
  readonly src: string
  /** Alternative text, for the fallback image under reduced motion. */
  readonly alt: string
}

/** Properties specific to the component. */
export interface ImageTrailOwnProps {
  /** The sown images, cycled through. */
  sources: readonly TrailImage[]
  /** Distance between two sowings, in pixels. @defaultValue 80 */
  threshold?: number
  /** Lifetime of a thumbnail, in milliseconds. @defaultValue 700 */
  life?: number
  /** Side of a thumbnail, in pixels. @defaultValue 140 */
  size?: number
  /** Content displayed under the trail. */
  children?: ReactNode
}

/** All properties. */
export type ImageTrailProps = Customisable<ImageTrailOwnProps>

/**
 * Sows thumbnails along the path of the pointer.
 *
 * @example
 * <ImageTrail
 *   sources={[
 *     { src: '/one.jpg', alt: 'First plate' },
 *     { src: '/two.jpg', alt: 'Second plate' },
 *     { src: '/three.jpg', alt: 'Third plate' },
 *   ]}
 *   className="o-h-96"
 * >
 *   <h2>Our latest plates</h2>
 * </ImageTrail>
 */
export function ImageTrail({
  sources,
  threshold = 80,
  life = 700,
  size = 140,
  children,
  ...rest
}: ImageTrailProps): ReactElement {
  const { reduced } = useMotionState()
  const host = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (reduced || sources.length === 0) return

    const zone = host.current
    if (zone === null) return

    // The living thumbnails, so that nothing is left behind on unmount.
    const alive = new Set<HTMLImageElement>()
    let lastX: number | null = null
    let lastY: number | null = null
    let cursor = 0

    const sow = (x: number, y: number): void => {
      const source = sources[cursor % sources.length]
      if (source === undefined) return
      cursor += 1

      const thumb = document.createElement('img')
      thumb.src = source.src
      // The thumbnail is a decorative flash: the content is already carried by
      // the fallback image and by what the area displays.
      thumb.alt = ''
      thumb.setAttribute('aria-hidden', 'true')
      thumb.className =
        'o-absolute o-object-cover o-rounded-lg o-pointer-events-none o-select-none'
      thumb.style.width = `${String(size)}px`
      thumb.style.height = `${String(size)}px`
      thumb.style.left = `${String(x)}px`
      thumb.style.top = `${String(y)}px`

      zone.append(thumb)
      alive.add(thumb)

      const animation = thumb.animate(
        [
          { opacity: 0, transform: 'translate(-50%, -50%) scale(0.5)' },
          {
            opacity: 1,
            transform: 'translate(-50%, -50%) scale(1)',
            offset: 0.25,
          },
          { opacity: 0, transform: 'translate(-50%, -50%) scale(1.06)' },
        ],
        { duration: life, easing: 'cubic-bezier(0.2, 0, 0, 1)' },
      )

      // The animation ends at zero opacity: the removal is not seen, it only
      // gives the memory back.
      animation.onfinish = () => {
        alive.delete(thumb)
        thumb.remove()
      }
    }

    const onMove = (event: PointerEvent): void => {
      const box = zone.getBoundingClientRect()
      const x = event.clientX - box.left
      const y = event.clientY - box.top

      if (lastX !== null && lastY !== null) {
        // The threshold spaces the trail out and bounds the cost: see the
        // header.
        if (Math.hypot(x - lastX, y - lastY) < threshold) return
      }

      lastX = x
      lastY = y
      sow(x, y)
    }

    const onLeave = (): void => {
      // The next pass will sow again right on entry, without waiting for the
      // threshold.
      lastX = null
      lastY = null
    }

    zone.addEventListener('pointermove', onMove, { passive: true })
    zone.addEventListener('pointerleave', onLeave, { passive: true })

    return () => {
      zone.removeEventListener('pointermove', onMove)
      zone.removeEventListener('pointerleave', onLeave)
      for (const thumb of alive) thumb.remove()
      alive.clear()
    }
  }, [reduced, sources, threshold, life, size])

  const { className, style } = mergePresentation(
    { className: 'o-relative o-overflow-hidden' },
    rest,
  )

  const first = sources[0]

  return (
    <div {...rest} ref={host} className={className} style={style}>
      {children}

      {/* Under reduced motion, the area is inert: the first image, centred and
          still, carries the content the trail would have shown. */}
      {reduced && first !== undefined ? (
        <div className="o-absolute o-inset-0 o-flex o-items-center o-justify-center o-pointer-events-none">
          <img
            src={first.src}
            alt={first.alt}
            className="o-object-cover o-rounded-lg"
            style={{ width: `${String(size)}px`, height: `${String(size)}px` }}
          />
        </div>
      ) : null}
    </div>
  )
}

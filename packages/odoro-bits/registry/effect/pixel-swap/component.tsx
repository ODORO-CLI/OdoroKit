/**
 * Cell swap between two images.
 *
 * ## A swap, not a transition
 *
 * The pixel transition goes from one content to another and stops once it has
 * arrived. Here nothing arrives: a set share of the grid permanently shows the
 * second image, and it is never the same cells. The result is a mosaic
 * shimmer, not a passage — two photographs fighting over the same frame.
 *
 * That is why the base image is a real `img` in the document: it remains the
 * content, with its alternative text, and the cells are only an ornament laid
 * over it.
 *
 * ## The cutting must land right
 *
 * Each cell paints the second image as a background, offset by its own
 * position. The cover computation — the scaling and the centring that
 * `object-fit: cover` would do — is redone by hand, because a background knows
 * nothing but its own box: without it, each cell would reframe the whole image
 * inside its square, and the mosaic would show two hundred thumbnails instead
 * of a piece of an image.
 *
 * ## No React render during the swaps
 *
 * The engine loop lights and extinguishes cells at the set rate, by writing
 * their opacity. The component renders on three occasions only: at mount, when
 * the second image has delivered its dimensions, and when the area changes
 * size.
 *
 * Under reduced motion, the grid is not mounted: what remains is the base
 * image, alone and crisp.
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
import { useEffect, useRef, useState, type ReactElement } from 'react'

/** Properties specific to the component. */
export interface PixelSwapOwnProps {
  /** Base image, the one that stays in the flow. */
  from: string
  /** Image whose cells come to be swapped in. */
  to: string
  /** Alternative text of the base image. */
  alt: string
  /** Number of columns. The rows follow the proportions. @defaultValue 14 */
  cells?: number
  /** Swaps per second. @defaultValue 12 */
  rate?: number
  /** Maximum share of cells showing the second image. @defaultValue 0.16 */
  mix?: number
  /** Duration of the fade of one cell, in milliseconds. @defaultValue 240 */
  fade?: number
}

/** All properties. */
export type PixelSwapProps = Customisable<PixelSwapOwnProps>

/** Size of a box, in pixels. */
interface Size {
  readonly width: number
  readonly height: number
}

/**
 * Cover of an image inside a box, in the manner of `object-fit: cover`.
 *
 * @param box Box to cover.
 * @param natural Natural dimensions of the image.
 */
function coverFit(
  box: Size,
  natural: Size,
): { width: number; height: number; left: number; top: number } {
  const scale = Math.max(box.width / natural.width, box.height / natural.height)
  const width = natural.width * scale
  const height = natural.height * scale
  return { width, height, left: (box.width - width) / 2, top: (box.height - height) / 2 }
}

/**
 * Swaps cells between two images.
 *
 * @example
 * <PixelSwap
 *   from="/before.jpg"
 *   to="/after.jpg"
 *   alt="The square, before the works"
 *   className="o-aspect-video o-w-full o-rounded-xl"
 * />
 *
 * @example
 * // A coarse and slow mosaic, heavily mixed.
 * <PixelSwap from="/a.jpg" to="/b.jpg" alt="The square" cells={8} rate={4} mix={0.45} />
 */
export function PixelSwap({
  from,
  to,
  alt,
  cells = 14,
  rate = 12,
  mix = 0.16,
  fade = 240,
  ...rest
}: PixelSwapProps): ReactElement {
  const { reduced } = useMotionState()
  const [host, setHost] = useState<HTMLDivElement | null>(null)
  const [box, setBox] = useState<Size | null>(null)
  const [natural, setNatural] = useState<Size | null>(null)
  const grid = useRef<HTMLDivElement | null>(null)

  // The size of the area commands the cutting: it is measured, not guessed.
  useEffect(() => {
    if (host === null) return

    const observer = new ResizeObserver(() => {
      const rect = host.getBoundingClientRect()
      setBox({ width: Math.max(1, rect.width), height: Math.max(1, rect.height) })
    })
    observer.observe(host)
    return () => observer.disconnect()
  }, [host])

  // The second image is never displayed in full; its natural dimensions are
  // nevertheless needed for the cover, hence this load.
  useEffect(() => {
    setNatural(null)
    if (typeof Image === 'undefined') return

    const probe = new Image()
    let alive = true
    probe.addEventListener('load', () => {
      if (alive) setNatural({ width: probe.naturalWidth, height: probe.naturalHeight })
    })
    probe.src = to

    return () => {
      alive = false
    }
  }, [to])

  const columns = Math.max(2, Math.round(cells))
  const rows =
    box === null ? 0 : Math.max(2, Math.round((columns * box.height) / box.width))
  const total = columns * rows

  useEffect(() => {
    const container = grid.current
    if (container === null || reduced || total === 0) return

    const ceiling = Math.max(1, Math.floor(total * Math.min(Math.max(mix, 0), 1)))
    const period = 1 / Math.max(rate, 0.1)
    const queue: number[] = []
    const on = new Set<number>()
    let elapsed = 0

    const paint = (index: number, visible: boolean): void => {
      const cell = container.children[index]
      if (cell instanceof HTMLElement) cell.style.opacity = visible ? '1' : '0'
    }

    const subscription = clock.subscribe(
      ({ delta }) => {
        elapsed += delta
        if (elapsed < period) return
        elapsed = 0

        // Ceiling reached: the oldest cell gives up its place. The queue keeps
        // the order of arrival, the set keeps the membership.
        if (queue.length >= ceiling) {
          const oldest = queue.shift()
          if (oldest !== undefined) {
            on.delete(oldest)
            paint(oldest, false)
          }
        }

        // A random draw, a few attempts at most: walking the grid to find a
        // free cell for certain would cost a whole sweep, for a swap that has
        // no reason to be exact.
        for (let attempt = 0; attempt < 8; attempt += 1) {
          const index = Math.floor(Math.random() * total)
          if (on.has(index)) continue
          on.add(index)
          queue.push(index)
          paint(index, true)
          return
        }
      },
      { priority: CLOCK_PRIORITY.default, name: 'cell swap' },
    )

    return () => {
      subscription.unsubscribe()
      for (const index of on) paint(index, false)
    }
  }, [reduced, total, mix, rate])

  const fit = box !== null && natural !== null ? coverFit(box, natural) : null

  const { className, style } = mergePresentation(
    { className: 'o-relative o-overflow-hidden' },
    rest,
  )

  return (
    <div {...rest} ref={setHost} className={className} style={style}>
      <img src={from} alt={alt} className="o-size-full o-object-cover" />

      {reduced || fit === null || box === null ? null : (
        <div
          aria-hidden
          ref={grid}
          className="o-absolute o-inset-0 o-grid o-pointer-events-none"
          style={{
            gridTemplateColumns: `repeat(${String(columns)}, 1fr)`,
            gridTemplateRows: `repeat(${String(rows)}, 1fr)`,
          }}
        >
          {Array.from({ length: total }, (_, index) => {
            const left = ((index % columns) * box.width) / columns
            const top = (Math.floor(index / columns) * box.height) / rows
            return (
              <span
                key={index}
                style={{
                  opacity: 0,
                  transition: `opacity ${String(fade)}ms linear`,
                  backgroundImage: `url(${to})`,
                  backgroundSize: `${fit.width.toFixed(1)}px ${fit.height.toFixed(1)}px`,
                  backgroundPosition: `${(fit.left - left).toFixed(1)}px ${(fit.top - top).toFixed(1)}px`,
                }}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}

/**
 * Gradual blur at the edge of a scrolling area.
 *
 * ## Why several layers
 *
 * A `backdrop-filter` takes a value, not a ramp: a single layer gives a
 * uniform blur whose inner edge shows as a line, and hiding that line with an
 * opacity gradient only makes the blur transparent — it stays just as blurred
 * where it is still visible.
 *
 * The ramp is therefore built by stacking layers: each one blurs a little more
 * than the previous, and is only unmasked from its own slice onwards. The blur
 * accumulates towards the edge, without any ridge.
 *
 * ## Fading out at the end of the run
 *
 * A veil at the bottom of an area says "there is something else below".
 * Leaving it in place once the bottom is reached is a lie, and it is the most
 * common flaw of these bands: one believes there is still text left when one
 * has in fact arrived.
 *
 * The opacity of the veil therefore follows the remaining run. It is written
 * into a CSS variable from the engine's single loop, never by a React render:
 * a scroll listener that set a state would render the whole page on every
 * notch of the wheel.
 *
 * ## Under reduced motion
 *
 * Nothing changes: the veil is not movement, and its disappearance follows a
 * position that the person commands themselves.
 *
 * @module
 */

import {
  CLOCK_PRIORITY,
  clock,
  mergePresentation,
  type Customisable,
} from '@odoro-cli/engine'
import {
  useEffect,
  useState,
  type CSSProperties,
  type ReactElement,
  type ReactNode,
} from 'react'

/** Veiled edge. */
export type BlurSide = 'bottom' | 'top' | 'left' | 'right'

/** Properties specific to the component. */
export interface GradualBlurOwnProps {
  /** Content of the area. */
  children: ReactNode
  /** Veiled edge. @defaultValue 'bottom' */
  side?: BlurSide
  /** Depth of the veiled band, in pixels. @defaultValue 96 */
  size?: number
  /** Blur reached right at the edge, in pixels. @defaultValue 10 */
  strength?: number
  /** Number of layers. @defaultValue 5 */
  layers?: number
  /** Tint laid over the band, above the blur. */
  tint?: string
  /**
   * Makes the area a scrolling container, and fades the veil out when the edge
   * in question is reached.
   *
   * @defaultValue true
   */
  scrollable?: boolean
}

/** All properties. */
export type GradualBlurProps = Customisable<GradualBlurOwnProps>

/** Direction of the mask gradient, for each edge. */
const MASK_DIRECTION: Readonly<Record<BlurSide, string>> = {
  bottom: 'to bottom',
  top: 'to top',
  left: 'to left',
  right: 'to right',
}

/** Position of the band inside the area, for each edge. */
function bandBox(side: BlurSide, size: number): CSSProperties {
  const thickness = `${String(size)}px`
  if (side === 'bottom') return { left: 0, right: 0, bottom: 0, height: thickness }
  if (side === 'top') return { left: 0, right: 0, top: 0, height: thickness }
  if (side === 'left') return { top: 0, bottom: 0, left: 0, width: thickness }
  return { top: 0, bottom: 0, right: 0, width: thickness }
}

/**
 * Veils the edge of an area with a gradual blur.
 *
 * @example
 * <GradualBlur className="o-h-64 o-rounded-xl">
 *   <article className="o-p-6">…</article>
 * </GradualBlur>
 *
 * @example
 * // A lateral blur on a rail of images, with no vertical scrolling container.
 * <GradualBlur side="right" size={140} strength={16} className="o-h-40">
 *   <div className="o-flex o-gap-4">…</div>
 * </GradualBlur>
 */
export function GradualBlur({
  children,
  side = 'bottom',
  size = 96,
  strength = 10,
  layers = 5,
  tint = 'color-mix(in oklab, var(--o-theme-bg) 35%, transparent)',
  scrollable = true,
  ...rest
}: GradualBlurProps): ReactElement {
  const [scroller, setScroller] = useState<HTMLDivElement | null>(null)
  const [veil, setVeil] = useState<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!scrollable || scroller === null || veil === null) return

    const vertical = side === 'bottom' || side === 'top'
    let last = -1

    const subscription = clock.subscribe(
      () => {
        const travel = vertical
          ? scroller.scrollHeight - scroller.clientHeight
          : scroller.scrollWidth - scroller.clientWidth
        const position = vertical ? scroller.scrollTop : scroller.scrollLeft

        // The remaining run on the veiled side: at the top and on the left,
        // that is the path already travelled.
        const remaining =
          side === 'bottom' || side === 'right' ? travel - position : position

        // The veil fades out over the last band depth: beyond that it is
        // full, and there is nothing left to announce once the edge is
        // reached.
        const next = travel <= 0 ? 0 : Math.min(1, Math.max(0, remaining / size))
        if (Math.abs(next - last) < 0.01) return
        last = next
        veil.style.setProperty('--o-blur-veil', next.toFixed(2))
      },
      // A layout measurement, before the render of the same frame.
      { priority: CLOCK_PRIORITY.layout, name: 'edge blur' },
    )

    return () => subscription.unsubscribe()
  }, [scrollable, scroller, veil, side, size])

  const count = Math.max(2, Math.round(layers))
  const direction = MASK_DIRECTION[side]

  const { className, style } = mergePresentation(
    { className: 'o-relative o-overflow-hidden' },
    rest,
  )

  return (
    <div {...rest} className={className} style={style}>
      <div
        ref={setScroller}
        className={scrollable ? 'o-size-full o-overflow-auto' : 'o-size-full'}
      >
        {children}
      </div>

      <div
        aria-hidden
        ref={setVeil}
        style={{
          position: 'absolute',
          pointerEvents: 'none',
          opacity: 'var(--o-blur-veil, 1)',
          ...bandBox(side, size),
        }}
      >
        {Array.from({ length: count }, (_, index) => {
          const start = (index / count) * 100
          const end = ((index + 1) / count) * 100
          return (
            <div
              key={index}
              style={{
                position: 'absolute',
                inset: 0,
                backdropFilter: `blur(${(((index + 1) / count) * strength).toFixed(2)}px)`,
                // Each layer only appears from its own slice onwards: the
                // blurs add up towards the edge instead of replacing one
                // another.
                maskImage: `linear-gradient(${direction}, transparent ${start.toFixed(1)}%, black ${end.toFixed(1)}%)`,
                WebkitMaskImage: `linear-gradient(${direction}, transparent ${start.toFixed(1)}%, black ${end.toFixed(1)}%)`,
              }}
            />
          )
        })}

        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: `linear-gradient(${direction}, transparent, ${tint})`,
          }}
        />
      </div>
    </div>
  )
}

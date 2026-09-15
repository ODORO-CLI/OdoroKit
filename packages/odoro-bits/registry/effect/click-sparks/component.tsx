/**
 * Sparks: small strokes burst from the press point on every click.
 *
 * ## The sparks live in the DOM, not in state
 *
 * Like the click ripple, each burst creates its elements, launches them with
 * the Web Animations API, and removes them when the animation ends. Carrying
 * a burst in React state would impose two renders per click for strokes that
 * nobody reads: they are decorative, ephemeral, and their lifecycle is exactly
 * that of their animation. `onfinish` is their only contract.
 *
 * ## An even wheel, slightly scrambled
 *
 * The angles start from an even distribution — the burst covers the whole
 * turn, no side is forgotten — then each stroke gets a random offset and a
 * random reach. A perfect wheel would read as a mechanism; the scrambling
 * makes it organic. The draw happens at click time, client side only: it
 * cannot create a hydration mismatch.
 *
 * Under reduced motion, no element is created: the spark is only a gesture,
 * and the gesture is what we are asked to leave out.
 *
 * @module
 */

import { mergePresentation, useMotionState, type Customisable } from '@odoro-cli/engine'
import { useEffect, useState, type ReactElement, type ReactNode } from 'react'

/** Properties specific to the component. */
export interface ClickSparksOwnProps {
  /** Content of the clickable area. */
  children: ReactNode
  /** Number of strokes per click. @defaultValue 8 */
  count?: number
  /** Reach of the burst, in pixels. @defaultValue 48 */
  distance?: number
  /** Duration of the burst, in milliseconds. @defaultValue 500 */
  duration?: number
  /** Colour of the strokes. @defaultValue the text colour */
  color?: string
}

/** All properties. */
export type ClickSparksProps = Customisable<ClickSparksOwnProps>

/**
 * Makes sparks burst from every click on its area.
 *
 * The wrapper is transparent: it goes around a button, a card, a whole area,
 * without changing anything to their layout.
 *
 * @example
 * <ClickSparks className="o-rounded-xl">
 *   <button type="button" className="o-px-6 o-py-3">Confirm</button>
 * </ClickSparks>
 *
 * @example
 * // A tinted spray, wider.
 * <ClickSparks color="var(--o-palette-brand-500)" count={10} distance={64}>
 *   <div className="o-p-8">The whole card responds</div>
 * </ClickSparks>
 */
export function ClickSparks({
  children,
  count = 8,
  distance = 48,
  duration = 500,
  color = 'currentColor',
  ...rest
}: ClickSparksProps): ReactElement {
  const { reduced } = useMotionState()
  const [host, setHost] = useState<HTMLElement | null>(null)

  useEffect(() => {
    if (host === null || reduced) return

    const onPointerDown = (event: PointerEvent): void => {
      const box = host.getBoundingClientRect()
      const x = event.clientX - box.left
      const y = event.clientY - box.top

      for (let index = 0; index < count; index += 1) {
        // Even distribution over the turn, then a random offset: see the
        // module header.
        const angle = (index / count) * 360 + Math.random() * (180 / count)
        const reach = distance * (0.7 + Math.random() * 0.6)

        const spark = document.createElement('span')
        spark.style.position = 'absolute'
        spark.style.left = `${String(x)}px`
        spark.style.top = `${String(y)}px`
        spark.style.width = `${String(Math.max(6, Math.round(reach * 0.2)))}px`
        spark.style.height = '2px'
        spark.style.borderRadius = '1px'
        spark.style.background = color
        // The stroke pivots around the press point, not around its own centre:
        // every spark starts from exactly the same place.
        spark.style.transformOrigin = 'left center'
        spark.style.pointerEvents = 'none'
        spark.setAttribute('aria-hidden', 'true')
        spark.setAttribute('data-o-spark', '')
        host.append(spark)

        const animation = spark.animate(
          [
            {
              transform: `rotate(${String(angle)}deg) translateX(0) scaleX(1)`,
              opacity: 1,
            },
            {
              transform: `rotate(${String(angle)}deg) translateX(${String(Math.round(reach))}px) scaleX(0.4)`,
              opacity: 0,
            },
          ],
          { duration, easing: 'cubic-bezier(0, 0, 0.2, 1)', fill: 'forwards' },
        )
        animation.onfinish = () => spark.remove()
      }
    }

    host.addEventListener('pointerdown', onPointerDown)
    return () => {
      host.removeEventListener('pointerdown', onPointerDown)
      // The sparks still in flight belong to this instance: they leave with
      // it.
      for (const orphan of host.querySelectorAll('[data-o-spark]')) {
        orphan.remove()
      }
    }
  }, [host, reduced, count, distance, duration, color])

  const { className, style } = mergePresentation({}, rest)

  return (
    <div
      {...rest}
      ref={setHost}
      className={className}
      // The strokes are absolute inside the area, and clipped at its edges:
      // without the hidden overflow, a spray near the edge would spill over
      // the page.
      style={{ position: 'relative', overflow: 'hidden', ...style }}
    >
      {children}
    </div>
  )
}

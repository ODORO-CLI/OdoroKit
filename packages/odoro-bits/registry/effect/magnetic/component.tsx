/**
 * Attraction: an element pulled by the pointer.
 *
 * ## Why the loop rather than the event
 *
 * Reacting directly to pointer events would give a harsh movement: the element
 * would jump from one position to the next at the irregular rhythm at which
 * the system delivers them. The event therefore only moves a **target**, and
 * the loop brings the current position closer to that target on every frame.
 *
 * The catch-up is exponential and expressed in terms of the elapsed time:
 * `1 - exp(-speed x dt)`. A constant fraction would make the speed of the
 * movement vary with the refresh rate of the screen — twice as fast at a
 * hundred and twenty frames per second as at sixty — and the same setting
 * would not give the same result for two different people.
 *
 * ## The radius
 *
 * Without it, every magnetic element on the page would react to a pointer at
 * the other end of it. Beyond the radius, the target comes back to rest.
 *
 * @module
 */

import {
  CLOCK_PRIORITY,
  clock,
  mergePresentation,
  motionPolicy,
  type Customisable,
} from '@odoro-cli/engine'
import { useEffect, useRef, useState, type ReactElement, type ReactNode } from 'react'

/** Properties specific to the component. */
export interface MagneticOwnProps {
  /** What is attracted. */
  children: ReactNode
  /** Fraction of the distance travelled towards the pointer. @defaultValue 0.35 */
  strength?: number
  /** Distance beyond which the attraction stops, in pixels. @defaultValue 120 */
  radius?: number
  /** Catch-up speed. The higher, the snappier. @defaultValue 8 */
  ease?: number
}

/** All properties. */
export type MagneticProps = Customisable<MagneticOwnProps>

/**
 * Makes an element magnetic.
 *
 * @example
 * <Magnetic strength={0.4}>
 *   <button className="o-rounded-full o-px-6 o-py-3">Contact us</button>
 * </Magnetic>
 */
export function Magnetic({
  children,
  strength = 0.35,
  radius = 120,
  ease = 8,
  ...rest
}: MagneticProps): ReactElement {
  const [host, setHost] = useState<HTMLElement | null>(null)
  const target = useRef({ x: 0, y: 0 })
  const current = useRef({ x: 0, y: 0 })

  useEffect(() => {
    if (host === null) return
    // The attraction is an embellishment: it has no final state to preserve.
    if (motionPolicy.state.reduced) return

    const onMove = (event: PointerEvent): void => {
      const box = host.getBoundingClientRect()
      const dx = event.clientX - (box.left + box.width / 2)
      const dy = event.clientY - (box.top + box.height / 2)

      target.current =
        Math.hypot(dx, dy) > radius
          ? { x: 0, y: 0 }
          : { x: dx * strength, y: dy * strength }
    }

    const onLeave = (): void => {
      target.current = { x: 0, y: 0 }
    }

    // The listener sits on the window: the attraction must begin before the
    // pointer reaches the element, otherwise it does not show.
    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('pointerleave', onLeave)

    const subscription = clock.subscribe(
      ({ delta }) => {
        const factor = 1 - Math.exp(-ease * delta)
        current.current.x += (target.current.x - current.current.x) * factor
        current.current.y += (target.current.y - current.current.y) * factor
        host.style.transform = `translate3d(${current.current.x.toFixed(2)}px,${current.current.y.toFixed(2)}px,0)`
      },
      { name: 'magnetic', priority: CLOCK_PRIORITY.default },
    )

    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerleave', onLeave)
      subscription.unsubscribe()
      host.style.transform = ''
    }
  }, [host, strength, radius, ease])

  const { className, style } = mergePresentation(
    { className: 'o-inline-block o-will-change-transform' },
    rest,
  )

  return (
    <div {...rest} ref={setHost} className={className} style={style}>
      {children}
    </div>
  )
}

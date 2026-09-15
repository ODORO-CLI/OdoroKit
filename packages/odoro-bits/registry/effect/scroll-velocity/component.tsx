/**
 * Scroll tilt: the container leans with the speed, not with the position.
 *
 * ## The speed is measured in the loop, not in the event
 *
 * The `scroll` event arrives in irregular batches; deriving a speed from it
 * would give a value that jumps. The position is therefore read on every frame
 * of the engine loop, and the speed is the delta divided by the elapsed time —
 * then smoothed by exponential damping, as a function of time
 * (`1 - exp(-damping x dt)`), so that the same setting gives the same movement
 * at sixty as at a hundred and twenty frames per second. At a standstill, the
 * smoothed speed falls back on its own: the damped return is not a second
 * mechanism, it is the same one.
 *
 * ## Two CSS variables, one transform applied once
 *
 * The loop writes nothing but `--o-sv-skew` and `--o-sv-shift`; the transform
 * that consumes them is applied at render, once. The tilt and the offset are
 * clamped: a scroll speed has no ceiling, a readable tilt does.
 *
 * Under reduced motion, no subscription: the container is motionless.
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
import { useEffect, useState, type ReactElement, type ReactNode } from 'react'

/** Properties specific to the component. */
export interface ScrollVelocityOwnProps {
  /** Content that leans. */
  children: ReactNode
  /** Amplitude of the tilt and of the offset. @defaultValue 1 */
  strength?: number
  /** Speed of the smoothing and of the return. The higher, the snappier. @defaultValue 8 */
  damping?: number
}

/** All properties. */
export type ScrollVelocityProps = Customisable<ScrollVelocityOwnProps>

/** Clamps a value inside a symmetric interval. */
function clamp(value: number, limit: number): number {
  return Math.min(limit, Math.max(-limit, value))
}

/**
 * First ancestor that really scrolls, or nothing: the page will do.
 *
 * Without this walk up, a container placed inside an area with internal
 * scrolling — a preview, a panel — would never lean: `window.scrollY` does not
 * move there.
 */
function findScroller(start: HTMLElement): HTMLElement | null {
  let node = start.parentElement
  while (node !== null) {
    const overflow = getComputedStyle(node).overflowY
    if (
      (overflow === 'auto' || overflow === 'scroll') &&
      node.scrollHeight > node.clientHeight
    ) {
      return node
    }
    node = node.parentElement
  }
  return null
}

/**
 * Leans its content in proportion to the scroll speed.
 *
 * @example
 * <ScrollVelocity className="o-space-y-8">
 *   {cards.map((card) => <Card key={card.id} {...card} />)}
 * </ScrollVelocity>
 *
 * @example
 * // A discreet tilt, with a very soft return.
 * <ScrollVelocity strength={0.5} damping={4}>
 *   <img src={poster} alt="Festival poster" />
 * </ScrollVelocity>
 */
export function ScrollVelocity({
  children,
  strength = 1,
  damping = 8,
  ...rest
}: ScrollVelocityProps): ReactElement {
  const { reduced } = useMotionState()
  const [host, setHost] = useState<HTMLElement | null>(null)

  useEffect(() => {
    if (host === null || reduced) return

    const scroller = findScroller(host)
    const read = (): number => (scroller === null ? window.scrollY : scroller.scrollTop)

    let previous = read()
    let velocity = 0

    const subscription = clock.subscribe(
      ({ delta }) => {
        const dt = Math.max(delta, 1 / 240)
        const position = read()
        // Instantaneous speed in pixels per second, then time-dependent
        // smoothing: see the module header.
        const instant = (position - previous) / dt
        previous = position
        velocity += (instant - velocity) * (1 - Math.exp(-damping * dt))

        const skew = clamp(velocity * 0.004 * strength, 6)
        const shift = clamp(velocity * 0.015 * strength, 24)
        host.style.setProperty('--o-sv-skew', `${skew.toFixed(3)}deg`)
        host.style.setProperty('--o-sv-shift', `${shift.toFixed(2)}px`)
      },
      { name: 'scroll-velocity', priority: CLOCK_PRIORITY.default },
    )

    return () => {
      subscription.unsubscribe()
      host.style.removeProperty('--o-sv-skew')
      host.style.removeProperty('--o-sv-shift')
    }
  }, [host, reduced, strength, damping])

  const { className, style } = mergePresentation(
    { className: 'o-will-change-transform' },
    rest,
  )

  return (
    <div
      {...rest}
      ref={setHost}
      className={className}
      // The transform is applied once; the loop writes nothing but the two
      // variables. With no subscription, the fallbacks are zero: motionless.
      style={{
        transform: 'translateY(var(--o-sv-shift, 0px)) skewY(var(--o-sv-skew, 0deg))',
        ...style,
      }}
    >
      {children}
    </div>
  )
}

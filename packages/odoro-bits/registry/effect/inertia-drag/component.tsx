/**
 * Drag with inertia: the element lets itself be dragged, flies on its own
 * momentum, then springs back into place.
 *
 * ## A single integration, two regimes
 *
 * During the grab, the pointer writes the position directly — a held object
 * must stick to the hand, any damping would feel like rubber — and the loop
 * derives the velocity from it, smoothed by one notch so as not to keep the
 * sampling noise of the last event.
 *
 * On release, the same loop changes regime: the acquired velocity carries the
 * element, and a damped spring pulls it back to the origin
 * (`a = -spring x position - friction x velocity`). It is the simplest physics
 * that gives at once the momentum, the elastic overshoot and the return. The
 * time step is clamped: one long frame — a tab brought back to the foreground
 * — would blow the integration up.
 *
 * ## What the component does not do
 *
 * No keyboard: dragging is an embellishment, the element has no final state to
 * reach — it always comes back to its place. Under reduced motion, nothing
 * listens and nothing moves: the position is fixed.
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
export interface InertiaDragOwnProps {
  /** What lets itself be dragged. */
  children: ReactNode
  /** Braking of the momentum. The higher, the shorter. @defaultValue 8 */
  friction?: number
  /** Stiffness of the pull back to the original place. @defaultValue 120 */
  spring?: number
}

/** All properties. */
export type InertiaDragProps = Customisable<InertiaDragOwnProps>

/**
 * Makes an element draggable, with inertia and elastic return.
 *
 * @example
 * <InertiaDrag>
 *   <span className="o-inline-flex o-h-16 o-w-16 o-items-center o-justify-center o-rounded-full o-border-w-1 o-border-current">
 *     Me
 *   </span>
 * </InertiaDrag>
 *
 * @example
 * // A stiff return, with almost no overshoot.
 * <InertiaDrag friction={20} spring={300}>
 *   <Badge>Sale</Badge>
 * </InertiaDrag>
 */
export function InertiaDrag({
  children,
  friction = 8,
  spring = 120,
  ...rest
}: InertiaDragProps): ReactElement {
  const { reduced } = useMotionState()
  const [host, setHost] = useState<HTMLElement | null>(null)

  useEffect(() => {
    if (host === null || reduced) return

    const position = { x: 0, y: 0 }
    const previous = { x: 0, y: 0 }
    const velocity = { x: 0, y: 0 }
    const grip = { x: 0, y: 0 }
    let dragging = false

    const onDown = (event: PointerEvent): void => {
      dragging = true
      grip.x = event.clientX - position.x
      grip.y = event.clientY - position.y
      // The capture keeps the tracking even when the pointer leaves the
      // element: without it, a sharp gesture drops the grab mid-run.
      host.setPointerCapture(event.pointerId)
      host.style.cursor = 'grabbing'
      event.preventDefault()
    }

    const onMove = (event: PointerEvent): void => {
      if (!dragging) return
      position.x = event.clientX - grip.x
      position.y = event.clientY - grip.y
    }

    const onUp = (): void => {
      dragging = false
      host.style.cursor = ''
    }

    host.addEventListener('pointerdown', onDown)
    host.addEventListener('pointermove', onMove)
    host.addEventListener('pointerup', onUp)
    host.addEventListener('pointercancel', onUp)

    const subscription = clock.subscribe(
      ({ delta }) => {
        // Clamped time step: see the module header.
        const dt = Math.min(Math.max(delta, 1 / 240), 1 / 30)

        if (dragging) {
          // The velocity is derived from the distance travelled, smoothed by
          // one notch so that the momentum reflects the gesture and not the
          // last jitter.
          velocity.x += ((position.x - previous.x) / dt - velocity.x) * 0.5
          velocity.y += ((position.y - previous.y) / dt - velocity.y) * 0.5
        } else {
          velocity.x += (-spring * position.x - friction * velocity.x) * dt
          velocity.y += (-spring * position.y - friction * velocity.y) * dt
          position.x += velocity.x * dt
          position.y += velocity.y * dt

          // In the neighbourhood of rest, we are there: letting fractions of a
          // pixel oscillate would keep the loop busy showing nothing.
          if (
            Math.abs(position.x) < 0.1 &&
            Math.abs(position.y) < 0.1 &&
            Math.abs(velocity.x) < 1 &&
            Math.abs(velocity.y) < 1
          ) {
            position.x = 0
            position.y = 0
            velocity.x = 0
            velocity.y = 0
          }
        }

        previous.x = position.x
        previous.y = position.y
        host.style.transform = `translate3d(${position.x.toFixed(2)}px,${position.y.toFixed(2)}px,0)`
      },
      { name: 'inertia-drag', priority: CLOCK_PRIORITY.default },
    )

    return () => {
      host.removeEventListener('pointerdown', onDown)
      host.removeEventListener('pointermove', onMove)
      host.removeEventListener('pointerup', onUp)
      host.removeEventListener('pointercancel', onUp)
      subscription.unsubscribe()
      host.style.transform = ''
      host.style.cursor = ''
    }
  }, [host, reduced, friction, spring])

  // Under reduced motion, the element is not draggable: leaving it the grab
  // cursor would promise a gesture that does not answer.
  const { className, style } = mergePresentation(
    {
      className: reduced
        ? 'o-inline-block'
        : 'o-inline-block o-cursor-grab o-select-none o-touch-none o-will-change-transform',
    },
    rest,
  )

  return (
    <div {...rest} ref={setHost} className={className} style={style}>
      {children}
    </div>
  )
}

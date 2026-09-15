/**
 * Click ripple: a circle leaves the touched point and spreads to the edges.
 *
 * ## The ripple lives in the DOM, not in state
 *
 * Each click creates an element, launches it with the Web Animations API, and
 * removes it when the animation ends. Carrying the ripples in React state
 * would impose one render per click and another per disappearance, for
 * elements that nobody reads: they are decorative, ephemeral, and their
 * lifecycle is exactly that of their animation. `onfinish` is their only
 * contract.
 *
 * ## The radius is computed, not guessed
 *
 * The ripple must reach the furthest corner of the area, wherever the click
 * lands. The final radius is therefore the distance to the furthest corner — a
 * fixed-size circle would look short near the edges and oversized at the
 * centre.
 *
 * Under reduced motion, no element is created: the ripple is only a gesture,
 * and the gesture is what we are asked to leave out.
 *
 * @module
 */

import { mergePresentation, useMotionState, type Customisable } from '@odoro-cli/engine'
import { useEffect, useState, type ReactElement, type ReactNode } from 'react'

/** Properties specific to the component. */
export interface RippleClickOwnProps {
  /** Content of the clickable area. */
  children: ReactNode
  /** Duration of the expansion, in milliseconds. @defaultValue 600 */
  duration?: number
  /** Starting opacity of the ripple. @defaultValue 0.25 */
  opacity?: number
  /** Colour of the ripple. @defaultValue the text colour */
  color?: string
}

/** All properties. */
export type RippleClickProps = Customisable<RippleClickOwnProps>

/**
 * Sends a ripple out of every click on its area.
 *
 * The wrapper is transparent: it goes around a button, a card, a table row,
 * without changing anything to their layout.
 *
 * @example
 * <RippleClick className="o-rounded-xl">
 *   <button type="button" className="o-px-6 o-py-3">Confirm</button>
 * </RippleClick>
 *
 * @example
 * // A tinted ripple, slower.
 * <RippleClick color="var(--o-palette-brand-500)" duration={900} opacity={0.2}>
 *   <div className="o-p-8">The whole card responds</div>
 * </RippleClick>
 */
export function RippleClick({
  children,
  duration = 600,
  opacity = 0.25,
  color = 'currentColor',
  ...rest
}: RippleClickProps): ReactElement {
  const { reduced } = useMotionState()
  const [host, setHost] = useState<HTMLElement | null>(null)

  useEffect(() => {
    if (host === null || reduced) return

    const onPointerDown = (event: PointerEvent): void => {
      const box = host.getBoundingClientRect()
      const x = event.clientX - box.left
      const y = event.clientY - box.top

      // Distance to the furthest corner: the ripple covers the whole area,
      // wherever the click comes from.
      const radius = Math.hypot(Math.max(x, box.width - x), Math.max(y, box.height - y))

      const ripple = document.createElement('span')
      ripple.style.position = 'absolute'
      ripple.style.left = `${String(x - radius)}px`
      ripple.style.top = `${String(y - radius)}px`
      ripple.style.width = `${String(radius * 2)}px`
      ripple.style.height = `${String(radius * 2)}px`
      ripple.style.borderRadius = '50%'
      ripple.style.background = color
      ripple.style.pointerEvents = 'none'
      ripple.setAttribute('aria-hidden', 'true')
      ripple.setAttribute('data-o-ripple', '')
      host.append(ripple)

      const animation = ripple.animate(
        [
          { transform: 'scale(0)', opacity },
          { transform: 'scale(1)', opacity: 0 },
        ],
        { duration, easing: 'ease-out', fill: 'forwards' },
      )
      animation.onfinish = () => ripple.remove()
    }

    host.addEventListener('pointerdown', onPointerDown)
    return () => {
      host.removeEventListener('pointerdown', onPointerDown)
      // The ripples still in flight belong to this instance: they leave with
      // it.
      for (const orphan of host.querySelectorAll('[data-o-ripple]')) {
        orphan.remove()
      }
    }
  }, [host, reduced, duration, opacity, color])

  const { className, style } = mergePresentation({}, rest)

  return (
    <div
      {...rest}
      ref={setHost}
      className={className}
      // The ripple is absolute inside the area, and clipped at its edges:
      // without the hidden overflow, it would spread over the whole page.
      style={{ position: 'relative', overflow: 'hidden', ...style }}
    >
      {children}
    </div>
  )
}

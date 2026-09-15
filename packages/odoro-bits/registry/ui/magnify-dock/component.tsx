/**
 * Magnifying dock: the items grow as the pointer comes near.
 *
 * ## What the distance decides
 *
 * Each item looks at the gap between its centre and the pointer, on the
 * horizontal axis only. Below a radius, it grows; beyond it, it stays at its
 * own size. The profile is a raised cosine rather than a linear ramp: the
 * bump is rounded at its top and joins flat at the edges, so that the
 * neighbour of the neighbour does not jump when the pointer crosses its
 * limit.
 *
 * ## The magnification pushes its neighbours upwards, never sideways
 *
 * Growing an item in a horizontal flow moves every item after it, and the
 * whole dock starts to breathe — which makes the hover unpredictable: the
 * target moves while one aims at it.
 *
 * The scale is therefore applied **from the bottom** (`transform-origin: bottom`),
 * and the width of the box never changes. The item grows upwards, its
 * neighbours stay where they are, and one clicks where one thought one was
 * clicking.
 *
 * ## No React render during the movement
 *
 * The scales are written straight into the style of each item from the loop.
 * Passing them through state would cause a render of the whole dock at every
 * pixel travelled by the mouse.
 *
 * ## What is left when the movement is taken away
 *
 * A dock. Under `prefers-reduced-motion`, nothing grows any more — and
 * nothing is lost, because the magnification never carried information: the
 * labels are there, the targets are at their rest size, which is a real
 * clickable size.
 *
 * With a finger, same thing: there is no hover on a touch screen, and a dock
 * whose items never grow is exactly what is needed.
 *
 * @module
 */

import { mergePresentation, useMotionState, type Customisable } from '@odoro-cli/engine'
import {
  useEffect,
  useRef,
  type CSSProperties,
  type ReactElement,
  type ReactNode,
} from 'react'

/** Props specific to the component. */
export interface MagnifyDockOwnProps {
  /** The items of the dock. Each one must stay clickable at rest. */
  children: ReactNode
  /**
   * Maximum scale, reached when the pointer is over the item.
   *
   * @defaultValue 1.6
   */
  scale?: number
  /**
   * Radius of influence, in pixels.
   *
   * Beyond it, an item no longer moves. Too wide, the whole dock swells and
   * the effect is lost; too narrow, it turns jumpy.
   *
   * @defaultValue 130
   */
  radius?: number
}

/** All the props. */
export type MagnifyDockProps = Customisable<MagnifyDockOwnProps, 'div'>

/** Id of the injected stylesheet. */
const STYLE_ID = 'o-magnify-dock'

/** Sets the rules of the dock, once per document. */
function ensureDockRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-dock]{display:flex;align-items:flex-end;gap:0.5rem}',
    '[data-o-dock]>*{',
    // From the bottom: that is what makes it grow upwards without pushing the
    // neighbours sideways.
    'transform-origin:bottom center;',
    'will-change:transform;',
    // The transition only serves the return to rest, when the pointer leaves
    // the dock: during the hover, the loop writes, frame by frame.
    'transition:transform 260ms cubic-bezier(0.22,1,0.36,1);',
    '}',
    '[data-o-dock-active]>*{transition:none}',
  ].join('')
  document.head.append(style)
}

/**
 * A dock whose items grow as the pointer comes near.
 *
 * @example
 * <MagnifyDock>
 *   <button type="button">Home</button>
 *   <button type="button">Work</button>
 *   <button type="button">Contact</button>
 * </MagnifyDock>
 *
 * @example
 * // Wider, and on a narrower radius.
 * <MagnifyDock scale={2} radius={90}>…</MagnifyDock>
 */
export function MagnifyDock({
  children,
  scale = 1.6,
  radius = 130,
  ...rest
}: MagnifyDockProps): ReactElement {
  const { reduced } = useMotionState()
  const dock = useRef<HTMLDivElement | null>(null)

  ensureDockRule()

  useEffect(() => {
    // Nothing to do without a fine pointer: no hover on a touch screen, and a
    // loop that runs for an effect that cannot happen.
    if (reduced || typeof window === 'undefined') return
    if (window.matchMedia('(pointer: coarse)').matches) return

    const host = dock.current
    if (host === null) return

    let x: number | undefined
    let frame = 0

    const onEnter = (event: PointerEvent) => {
      x = event.clientX
      host.setAttribute('data-o-dock-active', '')
    }

    const onLeave = () => {
      x = undefined
      host.removeAttribute('data-o-dock-active')

      // Rest is written once, and the CSS transition takes it over: going back
      // frame by frame would make a return one cannot curve.
      for (const child of host.children) {
        if (child instanceof HTMLElement) child.style.transform = ''
      }
    }

    const step = () => {
      if (x !== undefined) {
        for (const child of host.children) {
          if (!(child instanceof HTMLElement)) continue

          const box = child.getBoundingClientRect()
          const center = box.left + box.width / 2
          const distance = Math.abs(x - center)

          // Raised cosine: flat at the edges, rounded at the top. A linear
          // ramp would produce a visible break at the moment an item enters
          // the radius.
          const t = Math.min(1, distance / radius)
          const factor = (Math.cos(t * Math.PI) + 1) / 2
          const k = 1 + (scale - 1) * factor

          child.style.transform = `scale(${String(k)})`
        }
      }

      frame = requestAnimationFrame(step)
    }

    host.addEventListener('pointermove', onEnter, { passive: true })
    host.addEventListener('pointerleave', onLeave, { passive: true })
    frame = requestAnimationFrame(step)

    return () => {
      host.removeEventListener('pointermove', onEnter)
      host.removeEventListener('pointerleave', onLeave)
      cancelAnimationFrame(frame)
      onLeave()
    }
  }, [reduced, scale, radius])

  const { className, style } = mergePresentation({}, rest)

  return (
    <div
      {...rest}
      ref={dock}
      className={className}
      style={style as CSSProperties}
      data-o-dock=""
    >
      {children}
    </div>
  )
}

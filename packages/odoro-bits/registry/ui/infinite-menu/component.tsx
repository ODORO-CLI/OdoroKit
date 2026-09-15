/**
 * Infinite menu: the links sit on a wheel that turns with the scroll wheel and
 * with a drag, endlessly, and always settles on a notch.
 *
 * ## A wheel, not a list that loops
 *
 * Each link takes a fixed angle on a lying cylinder, `rotateX` then
 * `translateZ`, and the whole wheel has a single rotation. Turning one full
 * turn brings back exactly the first link: the infinity is not simulated with
 * copies, it is the geometry. What sits behind the wheel is hidden by its
 * opacity — the cosine of its angle — and pulled out of the click targets.
 *
 * ## The wheel has a mass, and a notch
 *
 * Three states follow one another. During the drag, the rotation follows the
 * hand. On release, it keeps the speed measured over the last moves and loses
 * it to friction. Once slow, it aims at the nearest notch and joins it by
 * exponential damping — the same formula as the damped pointer, for the same
 * reason: an identical motion whatever the display rate. The scroll wheel, for
 * its part, does not push the wheel: it moves the aimed notch, one link per
 * scroll step. That is what makes it precise on the scroll wheel and alive in
 * the hand.
 *
 * ## Nothing is written when nothing moves
 *
 * The engine loop reads the angle and writes one transform per link; as soon
 * as the wheel has settled, it stops writing. React renders on mount and on a
 * props change only.
 *
 * ## The front link is the only one in the tab order
 *
 * Tab enters on the front link; the arrows turn the wheel and follow the
 * focus; Home and End go to the ends; Enter follows the link. A link at the
 * back that takes focus — through Shift+Tab for instance — turns the wheel up
 * to itself.
 *
 * ## Under reduced motion
 *
 * No momentum, no smoothing: the wheel jumps from notch to notch. Turning
 * stays possible, because turning is the only way to reach the links.
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
import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type ReactElement,
  type ReactNode,
} from 'react'

/** A navigation item. */
export interface NavItem {
  /** Displayed label. */
  readonly label: string
  /** Target of the link. Without a target, the item is a button. */
  readonly href?: string
  /** Icon placed before the label. */
  readonly icon?: ReactNode
}

/** Props specific to the component. */
export interface InfiniteMenuOwnProps {
  /** The links, in wheel order. Three at least for the wheel to mean anything. */
  items: readonly NavItem[]
  /** Radius of the wheel, in pixels. @defaultValue 140 */
  radius?: number
  /** Speed at which the wheel joins its notch. Higher is drier. @defaultValue 8 */
  speed?: number
  /** Index of the current page. */
  active?: number
  /** Called when the user picks a link. */
  onActiveChange?: (index: number) => void
  /** Name of the block for screen readers. @defaultValue 'Navigation' */
  label?: string
}

/** All the props. */
export type InfiniteMenuProps = Customisable<InfiniteMenuOwnProps, 'nav'>

/** Id of the injected stylesheet. */
const STYLE_ID = 'o-infinite-menu'

/** Sets the scene, the wheel and its links, once per document. */
function ensureWheelRules(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-wheel]{',
    'position:relative;display:block;min-height:14rem;overflow:hidden;',
    'perspective:900px;touch-action:none;cursor:grab;user-select:none;',
    '}',
    '[data-o-wheel][data-o-wheel-drag]{cursor:grabbing}',
    // Two rules marking the front notch: this is where the wheel settles, and
    // the only place where a link is entirely legible.
    '[data-o-wheel]::before,[data-o-wheel]::after{',
    'content:"";position:absolute;left:50%;width:min(60%,18rem);height:1px;',
    'background:var(--o-theme-line);transform:translateX(-50%);pointer-events:none;',
    '}',
    '[data-o-wheel]::before{top:calc(50% - var(--o-wheel-slot))}',
    '[data-o-wheel]::after{top:calc(50% + var(--o-wheel-slot))}',
    '[data-o-wheel] ul{',
    'position:absolute;top:50%;left:50%;width:0;height:0;margin:0;padding:0;list-style:none;',
    'transform-style:preserve-3d;',
    '}',
    '[data-o-wheel] li{position:absolute;top:0;left:0;transform-style:preserve-3d}',
    '[data-o-wheel-item]{',
    'position:absolute;top:0;left:0;',
    'display:inline-flex;align-items:center;gap:0.5em;white-space:nowrap;',
    'font-size:1.5rem;font-weight:600;letter-spacing:-0.01em;',
    'color:inherit;text-decoration:none;background:none;border:0;padding:0.25em 0.5em;font-family:inherit;cursor:pointer;',
    'backface-visibility:hidden;',
    '}',
    '[data-o-wheel-item]:focus-visible{outline:2px solid currentColor;outline-offset:2px}',
    '[data-o-wheel-item][aria-current]{color:var(--o-palette-brand-500)}',
  ].join('')
  document.head.append(style)
}

/** Brings an angle back into ]-180, 180]. */
function wrap(angle: number): number {
  let value = angle % 360
  if (value > 180) value -= 360
  if (value <= -180) value += 360
  return value
}

/**
 * Infinite wheel of links, driven by the scroll wheel and by dragging.
 *
 * @example
 * <InfiniteMenu
 *   className="o-h-72"
 *   items={[
 *     { label: 'Exhibitions', href: '/exhibitions' },
 *     { label: 'Collections', href: '/collections' },
 *     { label: 'Tours', href: '/tours' },
 *     { label: 'Shop', href: '/shop' },
 *   ]}
 * />
 *
 * @example
 * // A wider wheel, that settles more drily.
 * <InfiniteMenu items={links} radius={220} speed={14} />
 */
export function InfiniteMenu({
  items,
  radius = 140,
  speed = 8,
  active,
  onActiveChange,
  label = 'Navigation',
  ...rest
}: InfiniteMenuProps): ReactElement {
  const { reduced } = useMotionState()
  const [host, setHost] = useState<HTMLElement | null>(null)
  const angle = useRef(0)
  const target = useRef(0)
  const velocity = useRef(0)
  const dragging = useRef(false)
  const moved = useRef(false)
  const front = useRef(0)
  ensureWheelRules()

  const count = Math.max(items.length, 1)
  const step = 360 / count

  const links = (): HTMLElement[] =>
    Array.from(host?.querySelectorAll<HTMLElement>('[data-o-wheel-item]') ?? [])

  /** Aims at the notch of a link, by the shortest path. */
  const aim = (index: number): void => {
    const wanted = index * step
    const delta = wrap(wanted - (target.current % 360))
    target.current += delta
    velocity.current = 0
  }

  useEffect(() => {
    if (host === null) return

    let last = Number.NaN
    let accumulated = 0
    // React may just have reset the tabindex values: the front notch has to be
    // marked again, whichever it is.
    front.current = -1
    let dragStartY = 0
    let dragStartAngle = 0
    let lastY = 0
    let lastTime = 0
    const pxPerStep = Math.max(40, 2 * radius * Math.sin((step * Math.PI) / 360))

    /** Writes one transform per link, and marks the front one. */
    const paint = (): void => {
      const elements = links()
      let nearest = 0
      let best = Number.POSITIVE_INFINITY
      elements.forEach((element, index) => {
        const phi = wrap(angle.current - index * step)
        const depth = Math.cos((phi * Math.PI) / 180)
        const distance = Math.abs(phi)
        if (distance < best) {
          best = distance
          nearest = index
        }
        element.style.transform = `translate(-50%,-50%) rotateX(${phi.toFixed(3)}deg) translateZ(${String(radius)}px)`
        element.style.opacity = Math.max(0, depth).toFixed(3)
        element.style.visibility = depth > 0.05 ? 'visible' : 'hidden'
        element.style.pointerEvents = depth > 0.5 ? 'auto' : 'none'
      })
      if (nearest !== front.current) {
        front.current = nearest
        elements.forEach((element, index) => {
          element.tabIndex = index === nearest ? 0 : -1
        })
      }
    }

    const subscription = clock.subscribe(
      ({ delta }) => {
        if (!dragging.current) {
          if (Math.abs(velocity.current) > 2) {
            // Momentum: the wheel keeps its speed and loses it to friction.
            angle.current += velocity.current * delta
            velocity.current *= Math.exp(-3 * delta)
            target.current = Math.round(angle.current / step) * step
          } else if (reduced) {
            velocity.current = 0
            angle.current = target.current
          } else {
            velocity.current = 0
            const factor = 1 - Math.exp(-speed * delta)
            angle.current += (target.current - angle.current) * factor
          }
        }
        if (Math.abs(angle.current - last) < 0.005) return
        last = angle.current
        paint()
      },
      { priority: CLOCK_PRIORITY.render, name: 'infinite menu' },
    )

    // The scroll wheel moves the aimed notch, never the wheel itself. It is
    // listened to without passivity: without that, the page would scroll under
    // the wheel at every notch.
    const onWheel = (event: WheelEvent): void => {
      event.preventDefault()
      accumulated += event.deltaY
      if (Math.abs(accumulated) < 40) return
      target.current += Math.sign(accumulated) * step
      velocity.current = 0
      accumulated = 0
    }

    const onDown = (event: PointerEvent): void => {
      if (event.button !== 0) return
      dragging.current = true
      moved.current = false
      dragStartY = event.clientY
      lastY = event.clientY
      lastTime = event.timeStamp
      dragStartAngle = angle.current
      velocity.current = 0
      host.setAttribute('data-o-wheel-drag', '')
      host.setPointerCapture(event.pointerId)
    }

    const onMove = (event: PointerEvent): void => {
      if (!dragging.current) return
      const dy = event.clientY - dragStartY
      if (Math.abs(dy) > 4) moved.current = true
      angle.current = dragStartAngle - (dy / pxPerStep) * step
      const dt = Math.max(event.timeStamp - lastTime, 1) / 1000
      // Speed in degrees per second, smoothed over the last moves.
      const instant = ((-(event.clientY - lastY) / pxPerStep) * step) / dt
      velocity.current = velocity.current * 0.6 + instant * 0.4
      lastY = event.clientY
      lastTime = event.timeStamp
    }

    const onUp = (event: PointerEvent): void => {
      if (!dragging.current) return
      dragging.current = false
      host.removeAttribute('data-o-wheel-drag')
      if (host.hasPointerCapture(event.pointerId))
        host.releasePointerCapture(event.pointerId)
      // A release without momentum, or under reduced motion: nearest notch.
      if (reduced || Math.abs(velocity.current) < 60) {
        velocity.current = 0
        target.current = Math.round(angle.current / step) * step
      }
    }

    host.addEventListener('wheel', onWheel, { passive: false })
    host.addEventListener('pointerdown', onDown, { passive: true })
    host.addEventListener('pointermove', onMove, { passive: true })
    host.addEventListener('pointerup', onUp, { passive: true })
    host.addEventListener('pointercancel', onUp, { passive: true })
    paint()

    return () => {
      host.removeEventListener('wheel', onWheel)
      host.removeEventListener('pointerdown', onDown)
      host.removeEventListener('pointermove', onMove)
      host.removeEventListener('pointerup', onUp)
      host.removeEventListener('pointercancel', onUp)
      subscription.unsubscribe()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [host, radius, speed, step, reduced, items])

  const onKeyDown = (event: KeyboardEvent<HTMLElement>): void => {
    const all = links()
    const focused = all.findIndex((link) => link === document.activeElement)
    if (focused < 0) return
    const last = all.length - 1
    const moves: Readonly<Record<string, number | undefined>> = {
      ArrowDown: focused >= last ? 0 : focused + 1,
      ArrowUp: focused <= 0 ? last : focused - 1,
      Home: 0,
      End: last,
    }
    const next = moves[event.key]
    if (next === undefined) return
    event.preventDefault()
    aim(next)
    all[next]?.focus({ preventScroll: true })
  }

  const { className, style } = mergePresentation({}, rest)
  const slot = `${String(Math.round(radius * Math.sin((step * Math.PI) / 360)))}px`

  return (
    <nav
      {...rest}
      ref={setHost}
      aria-label={label}
      data-o-wheel=""
      className={className}
      style={{ ...style, '--o-wheel-slot': slot } as CSSProperties}
      onKeyDown={(event) => {
        onKeyDown(event)
        rest.onKeyDown?.(event)
      }}
    >
      <ul>
        {items.map((item, index) => {
          const isCurrent = index === active
          const content = (
            <>
              {item.icon !== undefined && <span aria-hidden="true">{item.icon}</span>}
              {item.label}
            </>
          )
          // A click that follows a drag is not a choice; a click on a link at
          // the side brings that link to the front, without following it.
          const onClick = (event: { preventDefault: () => void }): void => {
            if (moved.current) {
              moved.current = false
              event.preventDefault()
              return
            }
            if (index !== front.current) {
              event.preventDefault()
              aim(index)
              return
            }
            onActiveChange?.(index)
          }
          const onFocus = (): void => {
            if (index !== front.current) aim(index)
          }
          return (
            <li key={`${item.label}-${String(index)}`}>
              {item.href !== undefined ? (
                <a
                  href={item.href}
                  data-o-wheel-item=""
                  aria-current={isCurrent ? 'page' : undefined}
                  tabIndex={index === 0 ? 0 : -1}
                  onClick={onClick}
                  onFocus={onFocus}
                >
                  {content}
                </a>
              ) : (
                <button
                  type="button"
                  data-o-wheel-item=""
                  aria-current={isCurrent ? 'page' : undefined}
                  tabIndex={index === 0 ? 0 : -1}
                  onClick={onClick}
                  onFocus={onFocus}
                >
                  {content}
                </button>
              )}
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

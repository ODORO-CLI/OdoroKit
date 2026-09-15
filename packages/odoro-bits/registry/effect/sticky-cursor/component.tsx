/**
 * Sticky cursor: a pad that hugs the button it hovers.
 *
 * ## Sticking is not framing
 *
 * The sight lays four brackets around a target: it designates it, from the
 * outside. This one takes its place — it becomes the background of the button,
 * with its size and its corner radius, and the label reads over it. It is the
 * cursor of navigation bars, the one that gives the impression that a single
 * token slides from one tab to the next.
 *
 * ## The corner radius is read on the target, once
 *
 * There is no point guessing: at the moment the pad latches on, the computed
 * radius of the element is copied, and a CSS transition takes care of the
 * passage. Reading it again on every frame would require a computed style per
 * frame — the most expensive measurement in the browser — for a value that
 * never changes during a hover.
 *
 * ## Why the size is written, and not scaled
 *
 * A scale would distort the corner radius and the thickness of the hairline: a
 * wide button would become an oval capsule. The width and the height are
 * therefore damped then written as they are. It is one layout per frame, but
 * on a single out-of-flow element, in a layer that carries `contain` — the
 * cost stays local, and it is the price of a correct shape.
 *
 * ## The stretch only lives between two targets
 *
 * In flight, the pad lengthens along the direction of travel: that is what
 * makes it read as a substance rather than a teleported rectangle. Once
 * latched on, the stretch falls back to zero — a button highlighted by a
 * slanted background would be a fault, not an effect.
 *
 * ## Where it does not show itself
 *
 * Without a fine pointer, no element is created. Nor under reduced motion: the
 * pad is a continuous embellishment, with no final state to apply. The system
 * cursor stays visible.
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
  useState,
  type CSSProperties,
  type ReactElement,
  type ReactNode,
} from 'react'

/** Properties specific to the component. */
export interface StickyCursorOwnProps {
  /**
   * Area where the pad lives.
   *
   * Provided, it listens only to that area and is clipped to it. Absent, it
   * takes the whole page, as a fixed layer that intercepts nothing.
   */
  children?: ReactNode
  /** Diameter of the pad at rest, in pixels. @defaultValue 20 */
  size?: number
  /**
   * How much the pad still follows the pointer once latched on, from zero to
   * one. At zero it centres exactly on the target.
   *
   * @defaultValue 0.3
   */
  stick?: number
  /** Margin added around the target, in pixels. @defaultValue 6 */
  padding?: number
  /** Catch-up speed. The higher, the snappier. @defaultValue 16 */
  speed?: number
  /** Stretch in flight, from zero to one. @defaultValue 0.45 */
  stretch?: number
  /**
   * What the pad sticks to.
   *
   * @defaultValue 'a, button, [role="button"], [data-o-sticky]'
   */
  targets?: string
  /** Colour of the pad. A value, not a role. @defaultValue the text colour */
  color?: string
}

/** All properties. */
export type StickyCursorProps = Customisable<StickyCursorOwnProps>

/** Identifier of the injected stylesheet. */
const STYLE_ID = 'o-sticky-cursor'

/** Maximum lengthening, as a fraction of the size. */
const MAX_STRETCH = 0.6

/** Sets the pad rules, once per document. */
function ensureStickyCursorRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    // The positioning of the area lives in a rule with no specificity: a
    // class from the caller — `o-absolute` to place it inside a frame —
    // must be able to replace it, which an inline style would forbid.
    ':where([data-o-sticky-host="zone"]){position:relative;overflow:hidden}',
    ':where([data-o-sticky-host="page"]){position:fixed;inset:0;z-index:9998;pointer-events:none}',
    '[data-o-sticky-layer]{',
    'position:absolute;inset:0;overflow:hidden;pointer-events:none;',
    // The layout of the pad must not travel back up the page: see the module
    // header.
    'contain:layout style;',
    'opacity:0;transition:opacity 160ms linear;',
    '}',
    '[data-o-sticky-pad]{',
    'position:absolute;left:0;top:0;will-change:transform;',
    'transition:border-radius 220ms ease;',
    '}',
  ].join('')
  document.head.append(style)
}

/**
 * Sticks a pad to the hovered elements.
 *
 * @example
 * // A navigation bar where a single token slides from one tab to the next.
 * <StickyCursor>
 *   <nav className="o-flex o-gap-2">…</nav>
 * </StickyCursor>
 *
 * @example
 * // Over the whole page, bigger and perfectly centred on its targets.
 * <StickyCursor size={28} stick={0} padding={10} />
 */
export function StickyCursor({
  children,
  size = 20,
  stick = 0.3,
  padding = 6,
  speed = 16,
  stretch = 0.45,
  targets = 'a, button, [role="button"], [data-o-sticky]',
  color = 'currentColor',
  ...rest
}: StickyCursorProps): ReactElement {
  const { reduced } = useMotionState()
  const [host, setHost] = useState<HTMLElement | null>(null)
  const wrapping = children !== undefined

  ensureStickyCursorRule()

  useEffect(() => {
    if (host === null || reduced) return
    if (typeof window === 'undefined') return
    // Coarse pointer: nothing to stick to, nothing is created.
    if (!window.matchMedia('(pointer: fine)').matches) return

    const layer = document.createElement('div')
    layer.setAttribute('data-o-sticky-layer', '')
    layer.setAttribute('aria-hidden', 'true')
    host.append(layer)

    const pad = document.createElement('span')
    pad.setAttribute('data-o-sticky-pad', '')
    // A tint, not a flat fill: the pad passes under the label of the button,
    // which must stay readable.
    pad.style.background = `color-mix(in oklab, ${color} 16%, transparent)`
    pad.style.border = `1px solid color-mix(in oklab, ${color} 45%, transparent)`
    pad.style.borderRadius = '9999px'
    pad.style.width = `${String(size)}px`
    pad.style.height = `${String(size)}px`
    layer.append(pad)

    let box = host.getBoundingClientRect()
    let locked: Element | null = null
    let seen = false
    let radius = '9999px'

    let wantX = -size * 6
    let wantY = -size * 6
    let wantW = size
    let wantH = size

    let centreX = wantX
    let centreY = wantY
    let width = size
    let height = size
    let grip = 0

    let pointerX = wantX
    let pointerY = wantY

    /** Recomputes the target: the latched box, or the pad at the pointer. */
    const aim = (): void => {
      if (locked === null) {
        wantX = pointerX
        wantY = pointerY
        wantW = size
        wantH = size
        return
      }
      const rect = locked.getBoundingClientRect()
      const cx = rect.left - box.left + rect.width / 2
      const cy = rect.top - box.top + rect.height / 2
      // `stick` is a fraction of the journey: at zero the pad centres itself,
      // at one it stays under the finger while having taken the shape of the
      // target.
      wantX = cx + (pointerX - cx) * stick
      wantY = cy + (pointerY - cy) * stick
      wantW = rect.width + padding * 2
      wantH = rect.height + padding * 2
    }

    const onFrameChange = (): void => {
      box = host.getBoundingClientRect()
      aim()
    }

    const onMove = (event: Event): void => {
      const pointer = event as PointerEvent
      if (pointer.pointerType === 'touch') return
      pointerX = pointer.clientX - box.left
      pointerY = pointer.clientY - box.top
      if (!seen) {
        centreX = pointerX
        centreY = pointerY
        seen = true
        layer.style.opacity = '1'
      }
      aim()
    }

    const onOver = (event: Event): void => {
      const node = event.target
      const found = node instanceof Element ? node.closest(targets) : null
      if (found !== locked) {
        locked = found
        // The corner radius is read at latch time, never inside the loop.
        radius = found === null ? '9999px' : window.getComputedStyle(found).borderRadius
        pad.style.borderRadius = radius
      }
      aim()
    }

    const onLeave = (): void => {
      layer.style.opacity = '0'
      locked = null
      seen = false
    }

    const surface: HTMLElement | Window = wrapping ? host : window
    surface.addEventListener('pointermove', onMove, { passive: true })
    surface.addEventListener('pointerover', onOver, { passive: true })
    surface.addEventListener('pointerleave', onLeave)
    window.addEventListener('resize', onFrameChange, { passive: true })
    window.addEventListener('scroll', onFrameChange, { passive: true, capture: true })

    const subscription = clock.subscribe(
      ({ delta }) => {
        if (!seen) return
        const factor = 1 - Math.exp(-speed * delta)
        const stepX = (wantX - centreX) * factor
        const stepY = (wantY - centreY) * factor
        centreX += stepX
        centreY += stepY
        width += (wantW - width) * factor
        height += (wantH - height) * factor
        grip += ((locked === null ? 0 : 1) - grip) * factor

        pad.style.width = `${width.toFixed(1)}px`
        pad.style.height = `${height.toFixed(1)}px`

        const travelled = Math.hypot(stepX, stepY)
        // The stretch dies out as the pad latches on.
        const pull =
          Math.min(MAX_STRETCH, (travelled / Math.max(size, 1)) * stretch) * (1 - grip)
        const angle = (Math.atan2(stepY, stepX) * 180) / Math.PI

        pad.style.transform = [
          `translate3d(${(centreX - width / 2).toFixed(1)}px,${(centreY - height / 2).toFixed(1)}px,0)`,
          `rotate(${angle.toFixed(1)}deg)`,
          `scale(${(1 + pull).toFixed(3)},${(1 - pull * 0.5).toFixed(3)})`,
          `rotate(${(-angle).toFixed(1)}deg)`,
        ].join(' ')
      },
      { name: 'sticky-cursor : pad', priority: CLOCK_PRIORITY.default },
    )

    return () => {
      surface.removeEventListener('pointermove', onMove)
      surface.removeEventListener('pointerover', onOver)
      surface.removeEventListener('pointerleave', onLeave)
      window.removeEventListener('resize', onFrameChange)
      window.removeEventListener('scroll', onFrameChange, { capture: true })
      subscription.unsubscribe()
      layer.remove()
    }
  }, [host, reduced, size, stick, padding, speed, stretch, targets, color, wrapping])

  const { className, style } = mergePresentation({}, rest)

  return (
    <div
      {...rest}
      ref={setHost}
      className={className}
      style={style as CSSProperties}
      data-o-sticky-host={wrapping ? 'zone' : 'page'}
    >
      {children}
    </div>
  )
}

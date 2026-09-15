/**
 * Sight: four brackets that lock onto whatever the pointer hovers.
 *
 * ## The cursor becomes a measurement
 *
 * At rest, the four brackets form a small square around the pointer and turn
 * slowly: a sight looking for something. As soon as the pointer enters a
 * target, they spread out to the corners of its box, the rotation cancels, and
 * the element finds itself framed. The cursor no longer says "I am here" but
 * "it is this" — and that is what sets it apart from cursors that grow on
 * hover without ever designating anything.
 *
 * ## A single group, four derived corners
 *
 * The centre, the width and the height are damped; the brackets merely apply
 * the half-width and the half-height of the moment. Animating four independent
 * positions would have let the frame deform during the transition — one corner
 * arriving before the other — instead of staying a rectangle.
 *
 * The rotation is carried by the group, never by the brackets: otherwise each
 * would turn on itself and the frame would come apart.
 *
 * ## The box of the target is measured when it changes, not per frame
 *
 * `getBoundingClientRect` forces a layout. It is called on entering a target,
 * then only if the page scrolls or resizes. Between those moments, the box
 * does not move.
 *
 * ## Where it does not show itself
 *
 * Without a fine pointer, no bracket is created. Nor under reduced motion: the
 * sight is a continuous movement, and no final state is left to apply. The
 * system cursor stays visible — it is the one that still carries the sign of
 * the link.
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
export interface TargetCursorOwnProps {
  /**
   * Area under the sight.
   *
   * Provided, the sight listens only to it and is clipped to it. Absent, it
   * takes the whole page, as a fixed layer that intercepts nothing.
   */
  children?: ReactNode
  /** Side of the square at rest, in pixels. @defaultValue 32 */
  size?: number
  /** Length of a bracket, in pixels. @defaultValue 12 */
  corner?: number
  /** Margin left around the framed target, in pixels. @defaultValue 8 */
  padding?: number
  /** Catch-up speed. The higher, the snappier. @defaultValue 14 */
  speed?: number
  /** Rotation at rest, in turns per second. @defaultValue 0.12 */
  spin?: number
  /**
   * What the sight frames.
   *
   * @defaultValue 'a, button, [role="button"], [data-o-target]'
   */
  targets?: string
  /** Colour of the brackets. A value, not a role. @defaultValue the text colour */
  color?: string
}

/** All properties. */
export type TargetCursorProps = Customisable<TargetCursorOwnProps>

/** Identifier of the injected stylesheet. */
const STYLE_ID = 'o-target-cursor'

/** Sets the sight rules, once per document. */
function ensureTargetCursorRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    // The positioning of the area lives in a rule with no specificity: a
    // class from the caller — `o-absolute` to place it inside a frame —
    // must be able to replace it, which an inline style would forbid.
    ':where([data-o-target-host="zone"]){position:relative;overflow:hidden}',
    ':where([data-o-target-host="page"]){position:fixed;inset:0;z-index:9998;pointer-events:none}',
    '[data-o-target-layer]{',
    'position:absolute;inset:0;overflow:hidden;pointer-events:none;',
    'opacity:0;transition:opacity 160ms linear;',
    '}',
    '[data-o-target-group]{position:absolute;left:0;top:0;will-change:transform}',
    '[data-o-target-corner]{position:absolute;left:0;top:0;will-change:transform}',
  ].join('')
  document.head.append(style)
}

/**
 * Lays a sight that locks onto the hovered elements.
 *
 * @example
 * // Over the whole page.
 * <TargetCursor />
 *
 * @example
 * // On a gallery, where only the thumbnails are targets.
 * <TargetCursor targets="[data-o-target]" padding={14} spin={0}>
 *   <ul className="o-grid o-grid-cols-3 o-gap-4">…</ul>
 * </TargetCursor>
 */
export function TargetCursor({
  children,
  size = 32,
  corner = 12,
  padding = 8,
  speed = 14,
  spin = 0.12,
  targets = 'a, button, [role="button"], [data-o-target]',
  color = 'currentColor',
  ...rest
}: TargetCursorProps): ReactElement {
  const { reduced } = useMotionState()
  const [host, setHost] = useState<HTMLElement | null>(null)
  const wrapping = children !== undefined

  ensureTargetCursorRule()

  useEffect(() => {
    if (host === null || reduced) return
    if (typeof window === 'undefined') return
    // Coarse pointer: there is nothing to aim at, and nothing is created.
    if (!window.matchMedia('(pointer: fine)').matches) return

    const layer = document.createElement('div')
    layer.setAttribute('data-o-target-layer', '')
    layer.setAttribute('aria-hidden', 'true')
    host.append(layer)

    const group = document.createElement('span')
    group.setAttribute('data-o-target-group', '')
    layer.append(group)

    const corners: HTMLElement[] = []
    for (let index = 0; index < 4; index += 1) {
      const node = document.createElement('span')
      node.setAttribute('data-o-target-corner', '')
      node.style.width = `${String(corner)}px`
      node.style.height = `${String(corner)}px`
      node.style.margin = `${String(-corner / 2)}px`
      // A single drawing — two edges — that the rotation alone is enough to
      // decline at all four corners.
      node.style.borderTop = `2px solid ${color}`
      node.style.borderLeft = `2px solid ${color}`
      group.append(node)
      corners.push(node)
    }

    let box = host.getBoundingClientRect()
    let locked: Element | null = null
    let seen = false

    // Target of the frame, in coordinates of the area.
    let wantX = -size * 4
    let wantY = -size * 4
    let wantW = size
    let wantH = size

    let centreX = wantX
    let centreY = wantY
    let width = size
    let height = size
    let angle = 0

    let pointerX = wantX
    let pointerY = wantY

    /** Recomputes the target: the locked box, or the square at the pointer. */
    const aim = (): void => {
      if (locked === null) {
        wantX = pointerX
        wantY = pointerY
        wantW = size
        wantH = size
        return
      }
      const rect = locked.getBoundingClientRect()
      wantX = rect.left - box.left + rect.width / 2
      wantY = rect.top - box.top + rect.height / 2
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
      if (locked === null) aim()
    }

    const onOver = (event: Event): void => {
      const node = event.target
      // `closest` rather than the element itself: the pointer often hovers the
      // text of a button, not the button.
      locked = node instanceof Element ? node.closest(targets) : null
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
        centreX += (wantX - centreX) * factor
        centreY += (wantY - centreY) * factor
        width += (wantW - width) * factor
        height += (wantH - height) * factor

        // The rotation only lives at rest: on a target, a slanted frame would
        // no longer designate anything.
        const wanted = locked === null ? angle + spin * 360 * delta : 0
        angle += (wanted - angle) * factor

        group.style.transform = `translate3d(${centreX.toFixed(1)}px,${centreY.toFixed(1)}px,0) rotate(${angle.toFixed(2)}deg)`

        const halfW = width / 2
        const halfH = height / 2
        let index = 0
        for (const node of corners) {
          const signX = index === 0 || index === 3 ? -1 : 1
          const signY = index < 2 ? -1 : 1
          node.style.transform = `translate(${(signX * halfW).toFixed(1)}px,${(signY * halfH).toFixed(1)}px) rotate(${String(index * 90)}deg)`
          index += 1
        }
      },
      { name: 'target-cursor : sight', priority: CLOCK_PRIORITY.default },
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
  }, [host, reduced, size, corner, padding, speed, spin, targets, color, wrapping])

  const { className, style } = mergePresentation({}, rest)

  return (
    <div
      {...rest}
      ref={setHost}
      className={className}
      style={style as CSSProperties}
      data-o-target-host={wrapping ? 'zone' : 'page'}
    >
      {children}
    </div>
  )
}

/**
 * Crosshair: two strokes that cross the area and meet at the pointer.
 *
 * ## An instrument, not an ornament
 *
 * The other cursors of the family follow with a lag, and the lag is what makes
 * the effect. This one aims for the opposite: it must give the feeling of a
 * sight, so it sticks. The default catch-up speed is high, and the setting
 * goes low enough for those who want some float anyway.
 *
 * ## Why four segments and not two strokes
 *
 * A real crosshair leaves a void at the crossing: without it, the intersection
 * hides exactly what is being aimed at. Each axis is therefore cut into two
 * segments, on either side of the gap.
 *
 * The segments span the full width — or the full height — of the area once and
 * for all, and only change scale. Resizing in pixels on every frame would ask
 * for a layout per frame; a scale composes, it measures nothing.
 *
 * ## The coordinates do not re-render either
 *
 * The numeric readout is written into the text node directly, and only when
 * the rounding to the pixel has changed: moving the pointer by a tenth of a
 * pixel must rewrite nothing at all.
 *
 * ## Where it does not show itself
 *
 * Without a fine pointer, no element is created. Nor under reduced motion: two
 * strokes that follow the mouse are a continuous movement, and no final state
 * is left to apply. The system cursor always stays visible.
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
export interface CrosshairOwnProps {
  /**
   * Area under the sight.
   *
   * Provided, the crosshair listens only to it and stops at its edges. Absent,
   * it takes the whole page, as a fixed layer that intercepts nothing.
   */
  children?: ReactNode
  /** Thickness of the strokes, in pixels. @defaultValue 1 */
  thickness?: number
  /** Catch-up speed. Higher sticks closer. @defaultValue 20 */
  speed?: number
  /** Void left at the crossing, in pixels. @defaultValue 16 */
  gap?: number
  /** Shows the coordinates of the crossing. @defaultValue true */
  coords?: boolean
  /** Colour of the strokes. A value, not a role. @defaultValue the text colour */
  color?: string
}

/** All properties. */
export type CrosshairProps = Customisable<CrosshairOwnProps>

/** Identifier of the injected stylesheet. */
const STYLE_ID = 'o-crosshair'

/** Sets the crosshair rules, once per document. */
function ensureCrosshairRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    // The positioning of the area lives in a rule with no specificity: a
    // class from the caller — `o-absolute` to place it inside a frame —
    // must be able to replace it, which an inline style would forbid.
    ':where([data-o-cross-host="zone"]){position:relative;overflow:hidden}',
    ':where([data-o-cross-host="page"]){position:fixed;inset:0;z-index:9998;pointer-events:none}',
    '[data-o-cross-layer]{',
    'position:absolute;inset:0;overflow:hidden;pointer-events:none;',
    'opacity:0;transition:opacity 120ms linear;',
    '}',
    '[data-o-cross-seg]{position:absolute;left:0;top:0;will-change:transform}',
    '[data-o-cross-seg="h"]{width:100%}',
    '[data-o-cross-seg="v"]{height:100%}',
    '[data-o-cross-label]{',
    'position:absolute;left:0;top:0;will-change:transform;',
    'font-size:10px;line-height:1;letter-spacing:0.08em;',
    'font-variant-numeric:tabular-nums;white-space:nowrap;',
    '}',
  ].join('')
  document.head.append(style)
}

/**
 * Lays a crosshair over its area.
 *
 * @example
 * // Over the whole page, very thin.
 * <Crosshair thickness={1} gap={24} />
 *
 * @example
 * // On a card, with some float and no numeric readout.
 * <Crosshair speed={6} coords={false} className="o-rounded-xl o-p-10">
 *   <img src="/plan.png" alt="Site plan" />
 * </Crosshair>
 */
export function Crosshair({
  children,
  thickness = 1,
  speed = 20,
  gap = 16,
  coords = true,
  color = 'currentColor',
  ...rest
}: CrosshairProps): ReactElement {
  const { reduced } = useMotionState()
  const [host, setHost] = useState<HTMLElement | null>(null)
  const wrapping = children !== undefined

  ensureCrosshairRule()

  useEffect(() => {
    if (host === null || reduced) return
    if (typeof window === 'undefined') return
    // Coarse pointer: there is nothing to aim at, and nothing is created.
    if (!window.matchMedia('(pointer: fine)').matches) return

    const layer = document.createElement('div')
    layer.setAttribute('data-o-cross-layer', '')
    layer.setAttribute('aria-hidden', 'true')
    host.append(layer)

    /** Builds one of the four segments. */
    const makeSegment = (axis: 'h' | 'v', origin: string): HTMLElement => {
      const node = document.createElement('span')
      node.setAttribute('data-o-cross-seg', axis)
      node.style.background = color
      node.style.transformOrigin = origin
      if (axis === 'h') node.style.height = `${String(thickness)}px`
      else node.style.width = `${String(thickness)}px`
      layer.append(node)
      return node
    }

    const left = makeSegment('h', '0% 50%')
    const right = makeSegment('h', '100% 50%')
    const top = makeSegment('v', '50% 0%')
    const bottom = makeSegment('v', '50% 100%')

    const label = coords ? document.createElement('span') : null
    if (label !== null) {
      label.setAttribute('data-o-cross-label', '')
      label.style.color = color
      layer.append(label)
    }

    let box = host.getBoundingClientRect()
    const onFrameChange = (): void => {
      box = host.getBoundingClientRect()
    }

    let targetX = -1000
    let targetY = -1000
    let x = -1000
    let y = -1000
    let seen = false
    let written = ''

    const onMove = (event: Event): void => {
      const pointer = event as PointerEvent
      if (pointer.pointerType === 'touch') return
      targetX = pointer.clientX - box.left
      targetY = pointer.clientY - box.top
      if (!seen) {
        x = targetX
        y = targetY
        seen = true
        layer.style.opacity = '1'
      }
    }

    const onLeave = (): void => {
      layer.style.opacity = '0'
      seen = false
    }

    const surface: HTMLElement | Window = wrapping ? host : window
    surface.addEventListener('pointermove', onMove, { passive: true })
    surface.addEventListener('pointerleave', onLeave)
    window.addEventListener('resize', onFrameChange, { passive: true })
    window.addEventListener('scroll', onFrameChange, { passive: true, capture: true })

    const half = gap / 2

    const subscription = clock.subscribe(
      ({ delta }) => {
        if (!seen) return
        const factor = 1 - Math.exp(-speed * delta)
        x += (targetX - x) * factor
        y += (targetY - y) * factor

        const width = Math.max(box.width, 1)
        const height = Math.max(box.height, 1)
        // The fractions are clamped at zero: near an edge, a negative segment
        // would flip over to the other side of the crossing.
        const toLeft = Math.max(0, x - half) / width
        const toRight = Math.max(0, width - x - half) / width
        const toTop = Math.max(0, y - half) / height
        const toBottom = Math.max(0, height - y - half) / height

        left.style.transform = `translate3d(0,${y.toFixed(1)}px,0) scaleX(${toLeft.toFixed(4)})`
        right.style.transform = `translate3d(0,${y.toFixed(1)}px,0) scaleX(${toRight.toFixed(4)})`
        top.style.transform = `translate3d(${x.toFixed(1)}px,0,0) scaleY(${toTop.toFixed(4)})`
        bottom.style.transform = `translate3d(${x.toFixed(1)}px,0,0) scaleY(${toBottom.toFixed(4)})`

        if (label !== null) {
          label.style.transform = `translate3d(${(x + half).toFixed(1)}px,${(y + half).toFixed(1)}px,0)`
          const reading = `${String(Math.round(x))} : ${String(Math.round(y))}`
          // Only when the pixel has changed: see the module header.
          if (reading !== written) {
            label.textContent = reading
            written = reading
          }
        }
      },
      { name: 'crosshair : sight', priority: CLOCK_PRIORITY.default },
    )

    return () => {
      surface.removeEventListener('pointermove', onMove)
      surface.removeEventListener('pointerleave', onLeave)
      window.removeEventListener('resize', onFrameChange)
      window.removeEventListener('scroll', onFrameChange, { capture: true })
      subscription.unsubscribe()
      layer.remove()
    }
  }, [host, reduced, thickness, speed, gap, coords, color, wrapping])

  const { className, style } = mergePresentation({}, rest)

  return (
    <div
      {...rest}
      ref={setHost}
      className={className}
      style={style as CSSProperties}
      data-o-cross-host={wrapping ? 'zone' : 'page'}
    >
      {children}
    </div>
  )
}

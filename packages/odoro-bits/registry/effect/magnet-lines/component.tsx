/**
 * Magnetic lines: a field of needles that turn towards the pointer.
 *
 * ## One compass per cell
 *
 * Each needle knows its position in the frame and computes the angle that
 * separates it from the pointer. Nothing more: no vector field, no noise. The
 * overall drawing — the concentric circles of orientation around the hand —
 * comes out of the geometry alone, and that is what makes it readable.
 *
 * ## Why the centres are computed, never measured
 *
 * A CSS grid would have required reading `offsetLeft` on every cell to know
 * where it is. Here the centres are derived from the size of the frame and the
 * number of rows: one division, no layout. They are recomputed when the frame
 * changes size, never between two frames.
 *
 * ## The angle is damped, and by the shortest path
 *
 * Without damping, the needles snap from one orientation to the next. With
 * naive damping, those that pass through the half-turn make a full turn
 * backwards — the raw gap between 179 and -179 degrees is 358. The gap is
 * therefore brought back into a half-turn interval before being travelled,
 * which always takes the shortest path.
 *
 * ## The reach
 *
 * Beyond `reach`, the needle returns to its resting angle. Without that limit,
 * the whole field points at the hand and the pattern flattens: the contrast
 * between the governed area and the resting area is what gives the relief.
 *
 * ## Under reduced motion
 *
 * The field is rendered, frozen at its resting angle: this really is a final
 * state, and a pattern of lines stands on its own. It is the only entry of the
 * family that leaves something to see, because it is the only one whose
 * drawing does not depend on movement.
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
import { useEffect, useState, type CSSProperties, type ReactElement } from 'react'

import { usePointerDamped } from '@registre/hooks/usePointerDamped'

/** Properties specific to the component. */
export interface MagnetLinesOwnProps {
  /** Number of rows. @defaultValue 9 */
  rows?: number
  /** Number of columns. @defaultValue 9 */
  columns?: number
  /** Length of a needle, in pixels. @defaultValue 26 */
  length?: number
  /** Thickness of a needle, in pixels. @defaultValue 2 */
  thickness?: number
  /** Reach of the magnet, in pixels. @defaultValue 260 */
  reach?: number
  /** Rotation speed of the needles. The higher, the snappier. @defaultValue 10 */
  speed?: number
  /** Resting angle, in degrees. @defaultValue 0 */
  idle?: number
  /** Colour of the needles. A value, not a role. @defaultValue the text colour */
  color?: string
}

/** All properties. */
export type MagnetLinesProps = Customisable<MagnetLinesOwnProps>

/** Identifier of the injected stylesheet. */
const STYLE_ID = 'o-magnet-lines'

/** Beyond this, the field no longer reads and every frame costs for nothing. */
const MAX_NEEDLES = 400

/** Sets the field rules, once per document. */
function ensureMagnetLinesRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-magnet-layer]{position:absolute;inset:0;overflow:hidden;pointer-events:none}',
    '[data-o-magnet-line]{position:absolute;left:0;top:0;border-radius:9999px;will-change:transform}',
  ].join('')
  document.head.append(style)
}

/**
 * Lays a field of needles oriented by the pointer.
 *
 * The component fills the box it is given: sizing it is up to the caller, as
 * for a background.
 *
 * @example
 * <div className="o-relative o-h-96">
 *   <MagnetLines className="o-absolute o-inset-0" />
 * </div>
 *
 * @example
 * // Dense field, short needles, reduced reach.
 * <MagnetLines rows={16} columns={16} length={16} reach={160} />
 */
export function MagnetLines({
  rows = 9,
  columns = 9,
  length = 26,
  thickness = 2,
  reach = 260,
  speed = 10,
  idle: restAngle = 0,
  color = 'currentColor',
  ...rest
}: MagnetLinesProps): ReactElement {
  const { reduced } = useMotionState()
  const [host, setHost] = useState<HTMLElement | null>(null)

  ensureMagnetLinesRule()

  // The pointer is damped by the registry hook, in the frame of reference of
  // the frame: the field needs nothing else.
  const pointer = usePointerDamped({ host, speed: 12, name: 'magnet-lines : pointer' })

  useEffect(() => {
    if (host === null) return
    if (typeof window === 'undefined') return

    const lines = Math.max(2, Math.round(rows))
    const cols = Math.max(2, Math.round(columns))
    // The product is capped, not each side: a very wide and low grid stays
    // legitimate.
    const step = Math.max(1, Math.ceil((lines * cols) / MAX_NEEDLES))

    const layer = document.createElement('div')
    layer.setAttribute('data-o-magnet-layer', '')
    layer.setAttribute('aria-hidden', 'true')
    host.append(layer)

    const needles: { node: HTMLElement; u: number; v: number; angle: number }[] = []
    for (let row = 0; row < lines; row += step) {
      for (let col = 0; col < cols; col += 1) {
        const node = document.createElement('span')
        node.setAttribute('data-o-magnet-line', '')
        node.style.width = `${String(length)}px`
        node.style.height = `${String(thickness)}px`
        node.style.margin = `${String(-thickness / 2)}px 0 0 ${String(-length / 2)}px`
        node.style.background = color
        layer.append(node)
        needles.push({
          // Relative position in the frame: it does not depend on its size,
          // and therefore survives a resize.
          u: (col + 0.5) / cols,
          v: (row + 0.5) / lines,
          node,
          angle: restAngle,
        })
      }
    }

    let width = host.clientWidth
    let height = host.clientHeight

    /** Writes every needle at its current angle. */
    const paint = (): void => {
      for (const needle of needles) {
        const x = needle.u * width
        const y = needle.v * height
        needle.node.style.transform = `translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,0) rotate(${needle.angle.toFixed(1)}deg)`
      }
    }

    // An observer rather than the window event: the frame can change size
    // without the window moving — a column folding away is enough.
    const observer = new ResizeObserver(() => {
      width = host.clientWidth
      height = host.clientHeight
      paint()
    })
    observer.observe(host)
    paint()

    // Under reduced motion, the field stays at its resting angle: nothing
    // subscribes to the loop. See the module header.
    if (reduced) {
      return () => {
        observer.disconnect()
        layer.remove()
      }
    }

    const subscription = clock.subscribe(
      ({ delta }) => {
        const factor = 1 - Math.exp(-speed * delta)
        // From the hook's frame of reference (centred, [-1, 1]) to the pixels
        // of the frame.
        const pointerX = ((pointer.current.x + 1) / 2) * width
        const pointerY = ((pointer.current.y + 1) / 2) * height

        for (const needle of needles) {
          const x = needle.u * width
          const y = needle.v * height
          const dx = pointerX - x
          const dy = pointerY - y
          const distance = Math.hypot(dx, dy)
          const pull = distance > reach ? 0 : 1 - distance / Math.max(reach, 1)
          const aimed = (Math.atan2(dy, dx) * 180) / Math.PI

          // Blend between the resting angle and the aimed angle, by the reach.
          let wanted = restAngle + shortest(aimed - restAngle) * pull
          wanted = needle.angle + shortest(wanted - needle.angle)
          needle.angle += (wanted - needle.angle) * factor

          needle.node.style.transform = `translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,0) rotate(${needle.angle.toFixed(1)}deg)`
        }
      },
      { name: 'magnet-lines : field', priority: CLOCK_PRIORITY.default },
    )

    return () => {
      observer.disconnect()
      subscription.unsubscribe()
      layer.remove()
    }
  }, [
    host,
    reduced,
    rows,
    columns,
    length,
    thickness,
    reach,
    speed,
    restAngle,
    color,
    pointer,
  ])

  const { className, style } = mergePresentation(
    { className: 'o-relative o-overflow-hidden' },
    rest,
  )

  return (
    <div
      {...rest}
      ref={setHost}
      className={className}
      style={style as CSSProperties}
      aria-hidden
    />
  )
}

/** Brings an angle gap back into a half-turn, to always take the shortest path. */
function shortest(delta: number): number {
  return ((((delta + 180) % 360) + 360) % 360) - 180
}

/**
 * Pointer grid, made of document elements.
 *
 * ## Why a DOM version of a background already written as a shader
 *
 * `background/magnet-grid` makes the same gesture on the graphics processor,
 * and makes it better: thousands of dots, no elements. But it requires WebGL,
 * it occupies a whole surface, and its dots are not objects — they cannot be
 * measured, hooked onto, or left to inherit a text colour. This entry is made
 * for the cases where the pattern is wanted inside a card, a sidebar or a
 * header, without waking a graphics surface for a hundred dots.
 *
 * It is a choice of cost, not of rendering: beyond a few hundred dots, the
 * shader takes the lead again, and it is the one to reach for.
 *
 * ## The step commands the count, not the other way round
 *
 * A spacing is set in pixels, and the number of dots follows from it. A grid
 * with a fixed count stretches when the frame grows: the pattern changes
 * density depending on the room, which is never what one wants from a pattern.
 * A resize observer therefore rebuilds the dots when the frame changes, and
 * only then.
 *
 * ## What each dot does
 *
 * It moves away from the pointer — or towards it — by a strength that decays
 * with distance, and it lights up in the same movement. Both come from the
 * same measurement: a displaced dot that stayed pale would read as a
 * misalignment.
 *
 * ## Under reduced motion
 *
 * The pattern is rendered, at rest, with no subscription to the loop. A grid
 * of dots is a pattern that stands on its own: this really is the final state,
 * not the initial one.
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
export interface CursorGridDomOwnProps {
  /** Spacing of the dots, in pixels. @defaultValue 28 */
  spacing?: number
  /** Reach of the magnet, in pixels. @defaultValue 140 */
  radius?: number
  /** Maximum offset of a dot, in pixels. @defaultValue 12 */
  force?: number
  /** Attracts the dots instead of pushing them away. @defaultValue false */
  attract?: boolean
  /** Diameter of a dot, in pixels. @defaultValue 3 */
  dotSize?: number
  /** Colour of the dots. A value, not a role. @defaultValue the text colour */
  color?: string
}

/** All properties. */
export type CursorGridDomProps = Customisable<CursorGridDomOwnProps>

/** Identifier of the injected stylesheet. */
const STYLE_ID = 'o-cursor-grid-dom'

/**
 * Ceiling on the number of dots.
 *
 * Beyond it, the shader background is the one to reach for: see the module
 * header. The ceiling is not a precaution, it is the border between the two
 * entries.
 */
const MAX_DOTS = 900

/** Opacity of a dot at rest. */
const IDLE_OPACITY = 0.25

/** Sets the pattern rules, once per document. */
function ensureCursorGridDomRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-grid-layer]{position:absolute;inset:0;overflow:hidden;pointer-events:none}',
    '[data-o-grid-dot]{position:absolute;left:0;top:0;border-radius:50%;will-change:transform}',
  ].join('')
  document.head.append(style)
}

/**
 * Lays a pattern of dots that reacts to the pointer.
 *
 * The component fills the box it is given: sizing it is up to the caller.
 *
 * @example
 * <div className="o-relative o-h-64 o-rounded-xl">
 *   <CursorGridDom className="o-absolute o-inset-0" />
 * </div>
 *
 * @example
 * // Tight pattern that sucks the dots in instead of chasing them away.
 * <CursorGridDom spacing={18} radius={200} force={18} attract />
 */
export function CursorGridDom({
  spacing = 28,
  radius = 140,
  force = 12,
  attract = false,
  dotSize = 3,
  color = 'currentColor',
  ...rest
}: CursorGridDomProps): ReactElement {
  const { reduced } = useMotionState()
  const [host, setHost] = useState<HTMLElement | null>(null)

  ensureCursorGridDomRule()

  const pointer = usePointerDamped({ host, speed: 8, name: 'cursor-grid-dom : pointer' })

  useEffect(() => {
    if (host === null) return
    if (typeof window === 'undefined') return

    const layer = document.createElement('div')
    layer.setAttribute('data-o-grid-layer', '')
    layer.setAttribute('aria-hidden', 'true')
    host.append(layer)

    let dots: { node: HTMLElement; x: number; y: number }[] = []
    // The size is read at build time, never in the loop: reading `clientWidth`
    // per frame would force a layout per frame.
    let width = 0
    let height = 0

    /** Rebuilds the pattern for the current size of the frame. */
    const build = (): void => {
      layer.replaceChildren()
      dots = []
      width = host.clientWidth
      height = host.clientHeight
      const step = Math.max(6, spacing)
      const cols = Math.max(1, Math.floor(width / step))
      const lines = Math.max(1, Math.floor(height / step))
      if (cols * lines > MAX_DOTS) return

      // The leftovers are shared left and right: the pattern stays centred in
      // its frame instead of sticking to one edge.
      const offsetX = (width - (cols - 1) * step) / 2
      const offsetY = (height - (lines - 1) * step) / 2

      const fragment = document.createDocumentFragment()
      for (let row = 0; row < lines; row += 1) {
        for (let col = 0; col < cols; col += 1) {
          const node = document.createElement('span')
          node.setAttribute('data-o-grid-dot', '')
          node.style.width = `${String(dotSize)}px`
          node.style.height = `${String(dotSize)}px`
          node.style.margin = `${String(-dotSize / 2)}px`
          node.style.background = color
          node.style.opacity = String(IDLE_OPACITY)
          const x = offsetX + col * step
          const y = offsetY + row * step
          node.style.transform = `translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,0)`
          fragment.append(node)
          dots.push({ node, x, y })
        }
      }
      layer.append(fragment)
    }

    build()

    // The frame can change size without the window moving: it is the element
    // that is observed, not `window`.
    const observer = new ResizeObserver(build)
    observer.observe(host)

    // Under reduced motion, the pattern stays as it is: nothing subscribes.
    if (reduced) {
      return () => {
        observer.disconnect()
        layer.remove()
      }
    }

    const pull = attract ? -1 : 1

    const subscription = clock.subscribe(
      () => {
        // From the hook's frame of reference (centred, [-1, 1]) to the pixels
        // of the frame.
        const pointerX = ((pointer.current.x + 1) / 2) * Math.max(width, 1)
        const pointerY = ((pointer.current.y + 1) / 2) * Math.max(height, 1)

        for (const dot of dots) {
          const dx = dot.x - pointerX
          const dy = dot.y - pointerY
          const distance = Math.hypot(dx, dy)
          if (distance > radius) {
            dot.node.style.transform = `translate3d(${dot.x.toFixed(1)}px,${dot.y.toFixed(1)}px,0)`
            dot.node.style.opacity = String(IDLE_OPACITY)
            continue
          }
          // Soft decay towards the edge of the reach: a linear decay would
          // leave a sharp circle around the hand.
          const weight = 1 - distance / Math.max(radius, 1)
          const eased = weight * weight
          const reach = (force * eased * pull) / Math.max(distance, 1)
          const x = dot.x + dx * reach
          const y = dot.y + dy * reach
          dot.node.style.transform = `translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,0) scale(${(1 + eased).toFixed(2)})`
          dot.node.style.opacity = (IDLE_OPACITY + (1 - IDLE_OPACITY) * eased).toFixed(3)
        }
      },
      { name: 'cursor-grid-dom : pattern', priority: CLOCK_PRIORITY.default },
    )

    return () => {
      observer.disconnect()
      subscription.unsubscribe()
      layer.remove()
    }
  }, [host, reduced, spacing, radius, force, attract, dotSize, color, pointer])

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

/**
 * Ghost trail: the path travelled, kept a few frames longer.
 *
 * ## A memory, not a chain of springs
 *
 * The gooey cursor hooks each ball to the one before it: the trail cuts the
 * corners, because a spring always pulls in a straight line. Here nothing
 * pulls: the raw position of the pointer is **recorded** on every frame into a
 * ring, and each ghost reads back an older slot. The trail therefore hugs the
 * exact path, loops included.
 *
 * The ring has a fixed length — `count x gap + 1` slots — and writing
 * overwrites the oldest. No allocation per frame, no array that grows: the
 * memory of the component is known from its creation.
 *
 * ## The spacing is set in frames, not in seconds
 *
 * `gap` is a number of frames between two ghosts. This is deliberate: the
 * trail is a sampling of the gesture, and what one wants to set is the density
 * of the samples. A duration would give a shorter trail on a fast screen, for
 * the same setting.
 *
 * ## Only the transform changes
 *
 * The opacity and the size of each ghost are applied once, at creation: they
 * depend only on its rank. The loop writes nothing but a `translate3d` per
 * ghost — nothing that triggers a layout.
 *
 * ## Where it does not show itself
 *
 * Without a fine pointer, no ghost exists. Nor under reduced motion: a trail
 * is pure movement, with no final state to apply. The system cursor stays in
 * place.
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

/** Shape of a ghost. */
export type GhostShape = 'point' | 'ring' | 'square'

/** Properties specific to the component. */
export interface GhostCursorOwnProps {
  /**
   * Area where the trail lives.
   *
   * Provided, it listens only to that area and is clipped to it. Absent, it
   * takes the whole page, as a fixed layer that intercepts nothing.
   */
  children?: ReactNode
  /** Number of ghosts. @defaultValue 10 */
  count?: number
  /** Size of the first ghost, in pixels. @defaultValue 14 */
  size?: number
  /** Frames of spacing between two ghosts. @defaultValue 3 */
  gap?: number
  /** Shape of the ghosts. @defaultValue 'point' */
  shape?: GhostShape
  /** Colour of the ghosts. A value, not a role. @defaultValue the text colour */
  color?: string
}

/** All properties. */
export type GhostCursorProps = Customisable<GhostCursorOwnProps>

/** Identifier of the injected stylesheet. */
const STYLE_ID = 'o-ghost-cursor'

/** Beyond this, the trail becomes a puddle and the ring weighs for nothing. */
const MAX_GHOSTS = 24

/** Sets the trail rules, once per document. */
function ensureGhostCursorRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    // The positioning of the area lives in a rule with no specificity: a
    // class from the caller — `o-absolute` to place it inside a frame —
    // must be able to replace it, which an inline style would forbid.
    ':where([data-o-ghost-host="zone"]){position:relative;overflow:hidden}',
    ':where([data-o-ghost-host="page"]){position:fixed;inset:0;z-index:9998;pointer-events:none}',
    '[data-o-ghost-layer]{',
    'position:absolute;inset:0;overflow:hidden;pointer-events:none;',
    'opacity:0;transition:opacity 180ms linear;',
    '}',
    '[data-o-ghost]{position:absolute;left:0;top:0;will-change:transform}',
  ].join('')
  document.head.append(style)
}

/**
 * Leaves a trail of ghosts behind the pointer.
 *
 * @example
 * // Over the whole page.
 * <GhostCursor />
 *
 * @example
 * // Long and sparse trail, made of rings.
 * <GhostCursor count={16} gap={4} shape="ring">
 *   <section className="o-p-16">…</section>
 * </GhostCursor>
 */
export function GhostCursor({
  children,
  count = 10,
  size = 14,
  gap = 3,
  shape = 'point',
  color = 'currentColor',
  ...rest
}: GhostCursorProps): ReactElement {
  const { reduced } = useMotionState()
  const [host, setHost] = useState<HTMLElement | null>(null)
  const wrapping = children !== undefined

  ensureGhostCursorRule()

  useEffect(() => {
    if (host === null || reduced) return
    if (typeof window === 'undefined') return
    // Coarse pointer: no path to keep, nothing is created.
    if (!window.matchMedia('(pointer: fine)').matches) return

    const total = Math.max(2, Math.min(MAX_GHOSTS, Math.round(count)))
    const stride = Math.max(1, Math.round(gap))
    const away = -size * 4

    const layer = document.createElement('div')
    layer.setAttribute('data-o-ghost-layer', '')
    layer.setAttribute('aria-hidden', 'true')
    host.append(layer)

    const ghosts: { node: HTMLElement; back: number }[] = []
    for (let index = 0; index < total; index += 1) {
      const rank = index / total
      const node = document.createElement('span')
      const side = size * (1 - rank * 0.7)
      node.setAttribute('data-o-ghost', '')
      node.style.width = `${side.toFixed(1)}px`
      node.style.height = `${side.toFixed(1)}px`
      node.style.margin = `${(-side / 2).toFixed(1)}px`
      node.style.opacity = (0.85 * (1 - rank)).toFixed(3)
      if (shape === 'square') node.style.borderRadius = '2px'
      else node.style.borderRadius = '50%'
      if (shape === 'ring') {
        node.style.border = `1.5px solid ${color}`
      } else {
        node.style.background = color
      }
      layer.append(node)
      ghosts.push({ node, back: index * stride })
    }

    // The ring: one slot per kept frame, the oldest overwritten.
    const length = total * stride + 1
    const trail: { x: number; y: number }[] = []
    for (let index = 0; index < length; index += 1) trail.push({ x: away, y: away })
    let head = 0

    let box = host.getBoundingClientRect()
    const onFrameChange = (): void => {
      box = host.getBoundingClientRect()
    }

    let x = away
    let y = away
    let seen = false

    const onMove = (event: Event): void => {
      const pointer = event as PointerEvent
      if (pointer.pointerType === 'touch') return
      x = pointer.clientX - box.left
      y = pointer.clientY - box.top
      if (!seen) {
        // Without this filling, the trail unrolls from the corner on the first
        // movement, as if the pointer came from there.
        for (const slot of trail) {
          slot.x = x
          slot.y = y
        }
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

    const subscription = clock.subscribe(
      () => {
        if (!seen) return
        head = (head + 1) % length
        const slot = trail[head]
        if (slot === undefined) return
        slot.x = x
        slot.y = y

        for (const ghost of ghosts) {
          const past = trail[(head - ghost.back + length) % length]
          if (past === undefined) continue
          ghost.node.style.transform = `translate3d(${past.x.toFixed(1)}px,${past.y.toFixed(1)}px,0)`
        }
      },
      { name: 'ghost-cursor : trail', priority: CLOCK_PRIORITY.default },
    )

    return () => {
      surface.removeEventListener('pointermove', onMove)
      surface.removeEventListener('pointerleave', onLeave)
      window.removeEventListener('resize', onFrameChange)
      window.removeEventListener('scroll', onFrameChange, { capture: true })
      subscription.unsubscribe()
      layer.remove()
    }
  }, [host, reduced, count, size, gap, shape, color, wrapping])

  const { className, style } = mergePresentation({}, rest)

  return (
    <div
      {...rest}
      ref={setHost}
      className={className}
      style={style as CSSProperties}
      data-o-ghost-host={wrapping ? 'zone' : 'page'}
    >
      {children}
    </div>
  )
}

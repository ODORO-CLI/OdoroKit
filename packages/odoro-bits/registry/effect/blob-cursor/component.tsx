/**
 * Gooey blob: a few balls that read as one.
 *
 * ## What sets this cursor apart from a dot that follows
 *
 * A single damped ball gives a lagging dot — that is already the halo cursor.
 * Here there are several, each hooked to the one before it, and an SVG filter
 * glues them back together: the trail pinches, stretches, then melts into the
 * head as soon as the pointer stops. The substance does not come from the
 * balls, it comes from the filter.
 *
 * The filter is a blur followed by a violent contrast on the alpha channel:
 * anything half transparent tips one way or the other, and two neighbouring
 * blurred edges weld together. This is the so-called "gooey" trick, and it
 * costs only a filter, never a computation per frame.
 *
 * ## A chain, not a single spring
 *
 * Each ball aims at the position of the one before it, and the first aims at
 * the pointer. The catch-up speed decreases along the chain: the tail trails
 * more than the head, which is enough to produce the stretch without
 * simulating anything.
 *
 * The damping is exponential in the elapsed time — the same substance at
 * sixty and at a hundred and twenty frames per second.
 *
 * ## Where it does not show itself
 *
 * Without a fine pointer, there is nothing to follow: the component creates no
 * element and subscribes to nothing. Nor under reduced motion — a trail is an
 * entirely decorative movement, no final state is left to apply. The system
 * cursor is never hidden: it carries signals — text, link, resize — that this
 * blob does not take over.
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
  useId,
  useState,
  type CSSProperties,
  type ReactElement,
  type ReactNode,
} from 'react'

/** Properties specific to the component. */
export interface BlobCursorOwnProps {
  /**
   * Area where the blob lives.
   *
   * Provided, the blob listens only to that area and is clipped to it.
   * Absent, it lies over the whole page, as a fixed layer that intercepts
   * nothing.
   */
  children?: ReactNode
  /** Number of balls in the chain. @defaultValue 4 */
  count?: number
  /** Diameter of the head, in pixels. @defaultValue 48 */
  size?: number
  /** Catch-up speed of the head. Higher is snappier. @defaultValue 14 */
  speed?: number
  /** Colour of the substance. A value, not a role. @defaultValue the text colour */
  color?: string
}

/** All properties. */
export type BlobCursorProps = Customisable<BlobCursorOwnProps>

/** Identifier of the injected stylesheet. */
const STYLE_ID = 'o-blob-cursor'

/** Beyond this, the chain no longer reads and the filter costs for nothing. */
const MAX_BLOBS = 8

/** Sets the blob rules, once per document. */
function ensureBlobCursorRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    // The positioning of the area lives in a rule with no specificity: a
    // class from the caller — `o-absolute` to place it inside a frame —
    // must be able to replace it, which an inline style would forbid.
    ':where([data-o-blob-host="zone"]){position:relative;overflow:hidden}',
    ':where([data-o-blob-host="page"]){position:fixed;inset:0;z-index:9998;pointer-events:none}',
    '[data-o-blob-layer]{',
    'position:absolute;inset:0;overflow:hidden;pointer-events:none;',
    'opacity:0;transition:opacity 200ms linear;',
    '}',
    '[data-o-blob]{',
    'position:absolute;left:0;top:0;border-radius:50%;',
    // The balls move on every frame: without this hint, the browser
    // re-promotes them each time instead of keeping them on their layer.
    'will-change:transform;',
    '}',
  ].join('')
  document.head.append(style)
}

/**
 * Follows the pointer with a gooey substance.
 *
 * @example
 * // Over the whole page.
 * <BlobCursor />
 *
 * @example
 * // Confined to a hero, longer and slower.
 * <BlobCursor count={6} speed={9}>
 *   <section className="o-p-16">…</section>
 * </BlobCursor>
 */
export function BlobCursor({
  children,
  count = 4,
  size = 48,
  speed = 14,
  color = 'currentColor',
  ...rest
}: BlobCursorProps): ReactElement {
  const { reduced } = useMotionState()
  const [host, setHost] = useState<HTMLElement | null>(null)

  // The filter carries the size of the blob: two instances of different sizes
  // cannot share the same one, hence one identifier per instance. The colons
  // of `useId` do not survive inside a `url(#…)` reference.
  const gooId = `o-blob-goo-${useId().replaceAll(':', '')}`
  const wrapping = children !== undefined

  ensureBlobCursorRule()

  useEffect(() => {
    if (host === null || reduced) return
    if (typeof window === 'undefined') return
    // Coarse pointer: nothing to follow, and nothing will be created. See the
    // module header.
    if (!window.matchMedia('(pointer: fine)').matches) return

    const total = Math.max(2, Math.min(MAX_BLOBS, Math.round(count)))
    const away = -size * 3

    const layer = document.createElement('div')
    layer.setAttribute('data-o-blob-layer', '')
    layer.setAttribute('aria-hidden', 'true')
    layer.style.filter = `url(#${gooId})`
    host.append(layer)

    const chain: { node: HTMLElement; x: number; y: number; grip: number }[] = []
    for (let index = 0; index < total; index += 1) {
      const node = document.createElement('span')
      const diameter = size * (1 - (index / total) * 0.5)
      node.setAttribute('data-o-blob', '')
      node.style.width = `${diameter.toFixed(1)}px`
      node.style.height = `${diameter.toFixed(1)}px`
      node.style.margin = `${(-diameter / 2).toFixed(1)}px`
      node.style.background = color
      layer.append(node)
      // The grip loosens along the chain: the tail trails, the head sticks.
      // That is the whole stretch.
      chain.push({ node, x: away, y: away, grip: speed * (1 - (index / total) * 0.6) })
    }

    // The frame is read at install time, then only on the events that move it.
    // Reading it again on every movement would force a layout dozens of times
    // per second for a value that has not changed.
    let box = host.getBoundingClientRect()
    const onFrameChange = (): void => {
      box = host.getBoundingClientRect()
    }

    let targetX = away
    let targetY = away
    let seen = false

    const onMove = (event: Event): void => {
      const pointer = event as PointerEvent
      if (pointer.pointerType === 'touch') return
      targetX = pointer.clientX - box.left
      targetY = pointer.clientY - box.top
      if (!seen) {
        // Without this reset, the chain would cross the area diagonally from
        // its starting position on the first movement.
        for (const link of chain) {
          link.x = targetX
          link.y = targetY
        }
        seen = true
        layer.style.opacity = '1'
      }
    }

    const onLeave = (): void => {
      layer.style.opacity = '0'
      seen = false
      targetX = away
      targetY = away
    }

    const surface: HTMLElement | Window = wrapping ? host : window
    surface.addEventListener('pointermove', onMove, { passive: true })
    surface.addEventListener('pointerleave', onLeave)
    window.addEventListener('resize', onFrameChange, { passive: true })
    window.addEventListener('scroll', onFrameChange, { passive: true, capture: true })

    const subscription = clock.subscribe(
      ({ delta }) => {
        let aheadX = targetX
        let aheadY = targetY
        for (const link of chain) {
          const factor = 1 - Math.exp(-link.grip * delta)
          link.x += (aheadX - link.x) * factor
          link.y += (aheadY - link.y) * factor
          link.node.style.transform = `translate3d(${link.x.toFixed(1)}px,${link.y.toFixed(1)}px,0)`
          aheadX = link.x
          aheadY = link.y
        }
      },
      { name: 'blob-cursor : chain', priority: CLOCK_PRIORITY.default },
    )

    return () => {
      surface.removeEventListener('pointermove', onMove)
      surface.removeEventListener('pointerleave', onLeave)
      window.removeEventListener('resize', onFrameChange)
      window.removeEventListener('scroll', onFrameChange, { capture: true })
      subscription.unsubscribe()
      layer.remove()
    }
  }, [host, reduced, count, size, speed, color, gooId, wrapping])

  const { className, style } = mergePresentation({}, rest)

  return (
    <div
      {...rest}
      ref={setHost}
      className={className}
      style={style as CSSProperties}
      data-o-blob-host={wrapping ? 'zone' : 'page'}
    >
      {children}
      {/* The gooey filter. Zero surface: it is only there to be referenced by
          the layer, never to be seen. */}
      <svg
        aria-hidden
        width="0"
        height="0"
        focusable="false"
        style={{ position: 'absolute' }}
      >
        <defs>
          <filter id={gooId}>
            <feGaussianBlur
              in="SourceGraphic"
              stdDeviation={Math.max(4, size * 0.16)}
              result="blur"
            />
            <feColorMatrix
              in="blur"
              type="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 22 -11"
            />
          </filter>
        </defs>
      </svg>
    </div>
  )
}

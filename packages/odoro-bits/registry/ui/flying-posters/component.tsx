/**
 * Flying posters: a column of posters that come from the back, settle face-on
 * in the middle of the screen, then rush toward the viewer.
 *
 * ## The position in the frame is the only variable
 *
 * Each poster measures the distance from its center to the center of the
 * frame, brought back between minus one and one. Below the middle, it is
 * arriving: it is far, tilted, offset to the side. At the middle, it is
 * face-on, whole, in place. Above, it leaves toward the front and fades out.
 *
 * The reference frame is the scrolling port if there is one above the column,
 * and the window otherwise. The distinction matters: inside a frame three
 * hundred pixels tall, measuring against the whole window would give every
 * poster almost the same distance, and the column would stay inert. The
 * listening, for its part, happens in the capture phase on the document — the
 * scroll event does not bubble, and the component should not have to be handed
 * its container.
 *
 * ## All the measurements, then all the writes
 *
 * Reading a box after writing a transform forces the browser to recompute the
 * layout, and doing it alternately makes it recompute as many times as there
 * are posters. The boxes are therefore read first, in one pass, and the
 * transforms written afterwards, in another.
 *
 * ## One poster per vanishing plane
 *
 * The perspective is set on the cell, not on the column. A perspective shared
 * by the whole column would give a single vanishing point, very high or very
 * low depending on the poster, and the posters at the ends would look skewed.
 * Each one therefore has its own vanishing plane, centered on it.
 *
 * ## This is not parallax
 *
 * Parallax offsets along the vertical axis, within the plane. Here the poster
 * crosses depth: it changes size through the perspective, pivots, and passes
 * in front of the screen plane before disappearing. It is a move in Z, not an
 * offset in Y.
 *
 * ## Reduced motion
 *
 * No listener, no transform: a flat column of posters, legible, at their final
 * state.
 *
 * @module
 */

import { mergePresentation, useMotionState, type Customisable } from '@odoro-cli/engine'
import { useEffect, useRef, type CSSProperties, type ReactElement } from 'react'

/** One poster of the column. */
export interface FlyingPostersItem {
  /** Source of the image. */
  readonly src: string
  /** Alternative text, required: this is the content, not a decoration. */
  readonly alt: string
  /** Caption displayed under the poster. */
  readonly caption?: string
}

/** Properties owned by the component. */
export interface FlyingPostersOwnProps {
  /** The posters, in scrolling order. */
  items: readonly FlyingPostersItem[]
  /** Name of the series for screen readers. */
  label: string
  /** Distance at which the poster waits its turn, in pixels. @defaultValue 420 */
  depth?: number
  /** Tilt taken away from the middle, in degrees. @defaultValue 22 */
  tilt?: number
  /** Lateral offset taken on arrival, in pixels. @defaultValue 60 */
  drift?: number
  /** Space between two posters, in pixels. @defaultValue 96 */
  gap?: number
  /** Width of a poster, in pixels. @defaultValue 400 */
  width?: number
}

/** All the properties. */
export type FlyingPostersProps = Customisable<FlyingPostersOwnProps, 'ul'>

/** Identifier of the injected stylesheet. */
const STYLE_ID = 'o-flying-posters'

/**
 * The first ancestor that really scrolls, or `null` if that is the page.
 *
 * "Able to scroll" is not enough: a container in `overflow: auto` whose content
 * fits entirely does not scroll, and taking it as the reference would freeze
 * the column. The scroll height is therefore checked as well.
 */
function scrollingAncestor(start: HTMLElement): HTMLElement | null {
  let node = start.parentElement
  while (node !== null) {
    const overflow = getComputedStyle(node).overflowY
    if (
      (overflow === 'auto' || overflow === 'scroll') &&
      node.scrollHeight > node.clientHeight
    ) {
      return node
    }
    node = node.parentElement
  }
  return null
}

/** Sets the column, the stage of each poster and its frame, once per document. */
function ensurePostersRules(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-fly]{',
    'display:flex;flex-direction:column;align-items:center;gap:var(--o-fly-gap);',
    'margin:0;padding:0;list-style:none;',
    '}',
    // One vanishing plane per poster: see the module header.
    '[data-o-fly-case]{width:100%;perspective:var(--o-fly-view);perspective-origin:50% 50%}',
    '[data-o-fly-affiche]{',
    'margin:0 auto;width:min(100%,var(--o-fly-width));',
    'transform-origin:50% 50%;backface-visibility:hidden;',
    '}',
    '[data-o-fly-affiche] img{',
    'display:block;width:100%;aspect-ratio:3 / 4;object-fit:cover;',
    'border-radius:1rem;background:var(--o-theme-surface);',
    'box-shadow:0 0 0 1px var(--o-theme-line),0 30px 60px -40px currentColor;',
    '}',
    '[data-o-fly-affiche] figcaption{',
    'margin-top:0.7rem;text-align:center;font-size:0.8125em;color:var(--o-theme-muted);',
    '}',
    '@media (prefers-reduced-motion:reduce){',
    '[data-o-fly-affiche]{transform:none;opacity:1}',
    '}',
  ].join('')
  document.head.append(style)
}

/**
 * Column of posters that cross depth on scroll.
 *
 * @example
 * <FlyingPosters
 *   label="Season 2026"
 *   items={[
 *     { src: '/season/january.jpg', alt: 'January poster, silhouette at the piano', caption: 'January' },
 *     { src: '/season/march.jpg', alt: 'March poster, dancer seen from behind', caption: 'March' },
 *   ]}
 * />
 *
 * @example
 * // Arrival from further away, without lateral offset.
 * <FlyingPosters label="Series" items={posters} depth={700} drift={0} tilt={34} />
 */
export function FlyingPosters({
  items,
  label,
  depth = 420,
  tilt = 22,
  drift = 60,
  gap = 96,
  width = 400,
  ...rest
}: FlyingPostersProps): ReactElement {
  const { reduced } = useMotionState()
  const column = useRef<HTMLUListElement | null>(null)
  ensurePostersRules()

  useEffect(() => {
    // Flat, there is nothing to follow: no listener, no loop.
    if (reduced || typeof window === 'undefined') return
    const host = column.current
    if (host === null) return

    const posters = Array.from(host.querySelectorAll<HTMLElement>('[data-o-fly-affiche]'))
    const port = scrollingAncestor(host)
    let frameId = 0

    const paint = (): void => {
      frameId = 0
      // The scrolling port has authority when there is one: inside a frame
      // three hundred pixels tall, measuring against the whole window would
      // give every poster almost the same distance, and nothing would move.
      const frame =
        port === null
          ? { top: 0, height: window.innerHeight }
          : (() => {
              const box = port.getBoundingClientRect()
              return { top: box.top, height: box.height }
            })()
      const middle = frame.top + frame.height / 2
      const half = Math.max(1, frame.height / 2)

      // One read pass, then one write pass: see the module header.
      const offsets = posters.map((poster) => {
        const box = poster.getBoundingClientRect()
        const center = box.top + box.height / 2
        return Math.min(1, Math.max(-1, (center - middle) / half))
      })

      for (const [index, poster] of posters.entries()) {
        const d = offsets[index] ?? 0
        // Far behind as long as it is rising; in front of the screen plane
        // once it has crossed it, and half as far: passing too close would
        // stretch the poster beyond legibility.
        const z = d >= 0 ? -d * depth : -d * depth * 0.45
        const side = index % 2 === 0 ? 1 : -1
        const fade = d >= 0 ? 0.5 : 0.75

        poster.style.transform = [
          `translateX(${(d * drift * side).toFixed(1)}px)`,
          `translateZ(${z.toFixed(1)}px)`,
          `rotateX(${(-d * tilt).toFixed(2)}deg)`,
        ].join(' ')
        poster.style.opacity = Math.max(0, 1 - Math.abs(d) * fade).toFixed(3)
      }
    }

    const request = (): void => {
      if (frameId !== 0) return
      frameId = requestAnimationFrame(paint)
    }

    paint()
    // In the capture phase: the scroll event does not bubble, and we do not
    // know in advance which of the ancestors scrolls.
    document.addEventListener('scroll', request, { passive: true, capture: true })
    window.addEventListener('resize', request, { passive: true })

    return () => {
      document.removeEventListener('scroll', request, { capture: true })
      window.removeEventListener('resize', request)
      if (frameId !== 0) cancelAnimationFrame(frameId)
    }
  }, [reduced, depth, tilt, drift, items])

  const { className, style } = mergePresentation({}, rest)

  return (
    <ul
      {...rest}
      ref={column}
      aria-label={label}
      data-o-fly=""
      className={className}
      style={
        {
          '--o-fly-gap': `${String(gap)}px`,
          '--o-fly-width': `${String(width)}px`,
          '--o-fly-view': `${String(Math.max(600, depth * 2))}px`,
          ...style,
        } as CSSProperties
      }
    >
      {items.map((item) => (
        <li key={item.src} data-o-fly-case="">
          <figure data-o-fly-affiche="">
            <img src={item.src} alt={item.alt} loading="lazy" decoding="async" />
            {item.caption === undefined ? null : <figcaption>{item.caption}</figcaption>}
          </figure>
        </li>
      ))}
    </ul>
  )
}

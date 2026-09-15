/**
 * Circular gallery: a ribbon of images laid on a lying cylinder, turned by
 * finger, by wheel or with the arrows.
 *
 * ## The gesture is the browser's, the curve is ours
 *
 * The ribbon is an area that scrolls horizontally with `scroll-snap-type`.
 * The drag, the system's inertia, a trackpad's lateral scroll, the scrollbar
 * and the snap onto the centre image all come from the browser. Rewriting
 * them would give an approximate inertia, different on every device, and a
 * ribbon deaf to the wheel.
 *
 * What the browser does not give is the cylinder: on each useful frame, every
 * thumbnail receives a rotation and a setback proportional to its distance
 * from the centre of the viewport. Written straight onto the element, never
 * through state: on a ribbon of twenty images, one React render per pixel
 * travelled would cost more than all the rest of the component.
 *
 * ## The positions are measured once
 *
 * Reading each thumbnail's box on every frame would mix layout reads and
 * writes, and force it to be recomputed twenty times per frame. The centres
 * are therefore taken after render and on resize; the loop itself reads a
 * single value — the scroll position.
 *
 * ## This is not the carousel
 *
 * The carousel is a flat rail, moved page by page by two buttons. Here there
 * is neither page nor button: a continuous ribbon that one pushes, whose
 * centre image is the one being looked at, and whose neighbours flee into
 * depth. The two answer different wishes, and say so by their shape.
 *
 * ## Reduced motion
 *
 * The cylinder flattens — no more rotation, no more setback — and the snap on
 * the arrows happens without a glide. The ribbon stays a ribbon: it scrolls,
 * it snaps, nothing is lost.
 *
 * @module
 */

import { mergePresentation, useMotionState, type Customisable } from '@odoro-cli/engine'
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  type CSSProperties,
  type KeyboardEvent,
  type ReactElement,
} from 'react'

/** One image of the ribbon. */
export interface CircularGalleryItem {
  /** Source of the image. */
  readonly src: string
  /** Alternative text, required: this is the content, not a decoration. */
  readonly alt: string
  /** Caption shown under the image. */
  readonly caption?: string
}

/** Properties specific to the component. */
export interface CircularGalleryOwnProps {
  /** The images of the ribbon, in order. */
  items: readonly CircularGalleryItem[]
  /** Name of the gallery, announced to assistive technologies. */
  label: string
  /** Width of one image, in pixels. @defaultValue 260 */
  width?: number
  /** Height of one image, in pixels. @defaultValue 320 */
  height?: number
  /** Gap between two images, in pixels. @defaultValue 24 */
  gap?: number
  /** Tilt added per image away from the centre, in degrees. @defaultValue 26 */
  curve?: number
  /** Setback added per image away from the centre, in pixels. @defaultValue 120 */
  depth?: number
}

/** All properties. */
export type CircularGalleryProps = Customisable<CircularGalleryOwnProps>

/** Identifier of the injected stylesheet. */
const STYLE_ID = 'o-circular-gallery'

/** Applies the ribbon, its thumbnails and its cylinder, once per document. */
function ensureGalleryRules(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-cgal]{',
    // `overflow-y` must be stated. The cascade rule has it that one axis at
    // `auto` forces the other to `auto` as soon as it is `visible`: the ribbon
    // then became a VERTICAL scroll container, invisible because the bar is
    // hidden, and it swallowed the wheel — the whole page froze under the
    // pointer. The cylinder overflows in height by construction, so the
    // vertical overflow must be clipped, never travelled.
    'position:relative;overflow-x:auto;overflow-y:hidden;overscroll-behavior-x:contain;',
    'scroll-snap-type:x mandatory;scrollbar-width:none;',
    // The ends fade out: the ribbon has no hard edge.
    '-webkit-mask-image:linear-gradient(to right,transparent,currentColor 12%,currentColor 88%,transparent);',
    'mask-image:linear-gradient(to right,transparent,currentColor 12%,currentColor 88%,transparent);',
    '}',
    '[data-o-cgal]::-webkit-scrollbar{display:none}',
    '[data-o-cgal]:focus-visible{outline:2px solid var(--o-cgal-accent);outline-offset:3px;border-radius:1rem}',
    '[data-o-cgal-piste]{',
    'display:flex;align-items:center;gap:var(--o-cgal-gap);',
    'margin:0;padding-block:1.5rem;list-style:none;',
    // Half a frame on each side: without it, the first and the last image
    // could never reach the centre.
    'padding-inline:calc(50% - var(--o-cgal-width) / 2);',
    'perspective:900px;',
    '}',
    '[data-o-cgal-vignette]{',
    'flex:0 0 var(--o-cgal-width);scroll-snap-align:center;',
    'transform-style:preserve-3d;backface-visibility:hidden;',
    '}',
    '[data-o-cgal-vignette]>figure{margin:0}',
    '[data-o-cgal-vignette] img{',
    'display:block;width:100%;height:var(--o-cgal-height);object-fit:cover;',
    'border-radius:1rem;background:var(--o-theme-surface);',
    '}',
    '[data-o-cgal-vignette] figcaption{',
    'margin-top:0.7rem;text-align:center;font-size:0.8125em;color:var(--o-theme-muted);',
    'opacity:0;transition:opacity var(--o-duration-base) linear;',
    '}',
    // Only the image snapped at the centre carries its caption: three readable
    // captions at once would be three titles fighting over the eye.
    '[data-o-cgal-vignette][data-o-cgal-active] figcaption{opacity:1}',
    '@media (prefers-reduced-motion:reduce){',
    '[data-o-cgal-vignette]{transform:none}',
    '[data-o-cgal-vignette] figcaption{transition:none}',
    '}',
  ].join('')
  document.head.append(style)
}

/**
 * Ribbon of images on a cylinder, by gesture as much as by keyboard.
 *
 * @example
 * <CircularGallery
 *   label="Spring collection"
 *   items={[
 *     { src: '/looks/one.jpg', alt: 'Undyed wool coat', caption: 'Ostend coat' },
 *     { src: '/looks/two.jpg', alt: 'Long linen dress', caption: 'Sands dress' },
 *   ]}
 * />
 *
 * @example
 * // A flat ribbon, in smaller thumbnails.
 * <CircularGallery label="Thumbnails" items={photos} width={160} height={200} curve={0} depth={0} />
 */
export function CircularGallery({
  items,
  label,
  width = 260,
  height = 320,
  gap = 24,
  curve = 26,
  depth = 120,
  ...rest
}: CircularGalleryProps): ReactElement {
  const { reduced } = useMotionState()
  const rail = useRef<HTMLDivElement | null>(null)
  /** Centres of the thumbnails within the track, taken after render. */
  const centers = useRef<number[]>([])
  const frame = useRef(0)
  ensureGalleryRules()

  /** Tilts and sets back each thumbnail by its distance from the centre of the frame. */
  const paint = useCallback((): void => {
    frame.current = 0
    const host = rail.current
    if (host === null) return

    const middle = host.scrollLeft + host.clientWidth / 2
    const step = width + gap
    const thumbs = host.querySelectorAll<HTMLElement>('[data-o-cgal-vignette]')

    for (const [index, thumb] of Array.from(thumbs).entries()) {
      const center = centers.current[index]
      if (center === undefined) continue
      const offset = (center - middle) / step
      const bound = Math.min(1, Math.abs(offset) / 2.5)

      thumb.style.transform = reduced
        ? ''
        : [
            `rotateY(${(-offset * curve).toFixed(2)}deg)`,
            `translateZ(${(-Math.abs(offset) * depth).toFixed(1)}px)`,
          ].join(' ')
      thumb.style.opacity = (1 - bound * 0.55).toFixed(3)
      // The attribute carries the visual state of the snapped image. Passing it
      // through React would rerender the whole ribbon on every pixel travelled.
      if (Math.abs(offset) < 0.5) thumb.setAttribute('data-o-cgal-active', '')
      else thumb.removeAttribute('data-o-cgal-active')
    }
  }, [curve, depth, gap, reduced, width])

  /** Takes the centres, then repaints. To redo as soon as the width changes. */
  const measure = useCallback((): void => {
    const host = rail.current
    if (host === null) return
    centers.current = Array.from(
      host.querySelectorAll<HTMLElement>('[data-o-cgal-vignette]'),
    ).map((thumb) => thumb.offsetLeft + thumb.offsetWidth / 2)
    paint()
  }, [paint])

  useLayoutEffect(() => {
    measure()
  }, [measure, items, height])

  useEffect(() => {
    const host = rail.current
    if (host === null || typeof ResizeObserver === 'undefined') return
    const observer = new ResizeObserver(measure)
    observer.observe(host)
    return () => {
      observer.disconnect()
    }
  }, [measure])

  useEffect(
    () => () => {
      if (frame.current !== 0) cancelAnimationFrame(frame.current)
    },
    [],
  )

  const onScroll = (): void => {
    if (frame.current !== 0 || typeof requestAnimationFrame !== 'function') return
    frame.current = requestAnimationFrame(paint)
  }

  /** The arrows push the ribbon by one image; Home and End to the ends. */
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>): void => {
    const host = rail.current
    if (host === null) return
    const step = width + gap
    const targets: Readonly<Record<string, number | undefined>> = {
      ArrowRight: host.scrollLeft + step,
      ArrowLeft: host.scrollLeft - step,
      Home: 0,
      End: host.scrollWidth,
    }
    const target = targets[event.key]
    if (target === undefined) return
    event.preventDefault()
    host.scrollTo({ left: target, behavior: reduced ? 'auto' : 'smooth' })
  }

  const { className, style } = mergePresentation({}, rest)

  return (
    <div
      {...rest}
      ref={rail}
      role="group"
      aria-roledescription="gallery"
      aria-label={label}
      tabIndex={0}
      data-o-cgal=""
      className={className}
      style={
        {
          '--o-cgal-accent': 'var(--o-palette-brand-500)',
          '--o-cgal-width': `${String(width)}px`,
          '--o-cgal-height': `${String(height)}px`,
          '--o-cgal-gap': `${String(gap)}px`,
          ...style,
        } as CSSProperties
      }
      onScroll={(event) => {
        onScroll()
        rest.onScroll?.(event)
      }}
      onKeyDown={(event) => {
        onKeyDown(event)
        rest.onKeyDown?.(event)
      }}
    >
      <ul data-o-cgal-piste="">
        {items.map((item) => (
          <li key={item.src} data-o-cgal-vignette="">
            <figure>
              <img src={item.src} alt={item.alt} loading="lazy" decoding="async" />
              {item.caption === undefined ? null : (
                <figcaption>{item.caption}</figcaption>
              )}
            </figure>
          </li>
        ))}
      </ul>
    </div>
  )
}

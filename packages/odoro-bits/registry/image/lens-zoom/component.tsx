/**
 * Magnifier: a disc follows the pointer and shows the image enlarged at the
 * hovered spot, the rest of the frame staying intact.
 *
 * ## What sets it apart from the zoom on hover
 *
 * The zoom on hover enlarges the whole image inside its frame: one loses the
 * overview to gain detail. The magnifier does the opposite — the frame keeps
 * its overview, and the detail exists only inside the disc. It is the tool of
 * a plate, of a map, of a product photograph: one inspects without losing the
 * context.
 *
 * ## The disc shows the same image, not a copy
 *
 * The background of the disc is the same source as the `img` element: the
 * browser downloads nothing more, both layers share the cache entry. What
 * changes is the scale and the origin of the background, written into CSS
 * variables from the pointer event — no React render during the gesture.
 *
 * ## Why the natural size is read again on every movement
 *
 * The image is framed as `cover`: its on-screen scale depends on its natural
 * proportions as much as on those of the frame. Without them, the disc would
 * show a stretched image, offset from the real one as soon as the two ratios
 * differ. Two property reads per event cost less than a React state, and stay
 * correct after a change of source.
 *
 * ## Under a finger, and under reduced motion
 *
 * On a touch screen there is no hover: a magnifier that only appears on touch,
 * under the finger that hides it, serves nobody — touch events are therefore
 * ignored. Under reduced motion, the image stays crisp and whole, with neither
 * disc nor listener.
 *
 * @module
 */

import { mergePresentation, useMotionState, type Customisable } from '@odoro-cli/engine'
import {
  useRef,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  type ReactElement,
} from 'react'

/** Identifier of the injected stylesheet. */
const STYLE_ID = 'o-lens-zoom'

/**
 * Sets the magnifier rules, once per document.
 *
 * They cannot be inline styles: the appearance of the disc depends on the
 * hover of the frame, not on that of the disc itself.
 */
function ensureLensRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-lz-glass]{',
    'position:absolute;left:0;top:0;box-sizing:border-box;pointer-events:none;',
    'width:var(--o-lz-size);height:var(--o-lz-size);border-radius:9999px;',
    // The disc is placed by a transform: it triggers neither reflow nor
    // repaint of the frame, unlike `left` and `top`.
    'transform:translate3d(var(--o-lz-x),var(--o-lz-y),0);',
    'background-image:var(--o-lz-src);background-repeat:no-repeat;',
    'background-size:var(--o-lz-bs);background-position:var(--o-lz-bx) var(--o-lz-by);',
    'border:1px solid var(--o-theme-line);box-shadow:var(--o-shadow-lg);',
    'opacity:0;transition:opacity var(--o-duration-base) var(--o-ease-standard);',
    '}',
    '[data-o-lens-active] [data-o-lz-glass]{opacity:1}',
  ].join('')
  document.head.append(style)
}

/** Properties specific to the component. */
export interface LensZoomOwnProps {
  /** Source of the image. */
  src: string
  /** Alternative text. Empty string if the image is purely decorative. */
  alt: string
  /** Width to height ratio of the frame. @defaultValue 1.777 */
  ratio?: number
  /**
   * Magnification inside the disc.
   *
   * Beyond four, an ordinary photograph shows mostly its pixels.
   *
   * @defaultValue 2.5
   */
  zoom?: number
  /** Diameter of the disc, in pixels. @defaultValue 180 */
  size?: number
}

/** All properties: its own, plus those of an image. */
export type LensZoomProps = Customisable<LensZoomOwnProps, 'img'>

/**
 * Walks a magnifier over an image.
 *
 * @example
 * <LensZoom src="/plate.jpg" alt="Detail plate" />
 *
 * @example
 * // A smaller and stronger disc, for a map.
 * <LensZoom src="/map.png" alt="Network map" zoom={4} size={140} />
 */
export function LensZoom({
  src,
  alt,
  ratio = 1.777,
  zoom = 2.5,
  size = 180,
  ...rest
}: LensZoomProps): ReactElement {
  const { reduced } = useMotionState()
  const picture = useRef<HTMLImageElement | null>(null)
  ensureLensRule()

  const magnification = Math.min(6, Math.max(1.2, zoom))
  const diameter = Math.max(60, size)

  const { className, style } = mergePresentation(
    { className: 'o-relative o-overflow-hidden' },
    rest,
  )

  const hostStyle = {
    ...style,
    aspectRatio: String(ratio),
    // The quotes of the source are neutralised: a double quote in a file name
    // would close the `url` function.
    '--o-lz-src': `url("${src.replaceAll('"', '%22')}")`,
    '--o-lz-size': `${String(diameter)}px`,
    '--o-lz-x': '0px',
    '--o-lz-y': '0px',
    '--o-lz-bs': 'auto',
    '--o-lz-bx': '0px',
    '--o-lz-by': '0px',
  } as CSSProperties

  /** Places the disc and its background under the pointer. */
  const follow = (event: ReactPointerEvent<HTMLDivElement>): void => {
    // See the header: the finger would hide what the magnifier shows.
    if (event.pointerType !== 'mouse' && event.pointerType !== 'pen') return

    const frame = event.currentTarget
    const box = frame.getBoundingClientRect()
    const x = event.clientX - box.left
    const y = event.clientY - box.top

    const image = picture.current
    // As long as the image has no natural size, the frame itself serves as the
    // reference: the disc is then slightly stretched, never absent.
    const nw = image !== null && image.naturalWidth > 0 ? image.naturalWidth : box.width
    const nh =
      image !== null && image.naturalHeight > 0 ? image.naturalHeight : box.height

    // Scale of the `cover` framing, then origin of the displayed image: these
    // are exactly the numbers the browser applies to the `img` element.
    const cover = Math.max(box.width / Math.max(nw, 1), box.height / Math.max(nh, 1))
    const ox = (box.width - nw * cover) / 2
    const oy = (box.height - nh * cover) / 2

    // Point of the image, in natural pixels, under the pointer.
    const u = (x - ox) / Math.max(cover, 0.0001)
    const v = (y - oy) / Math.max(cover, 0.0001)

    const scale = cover * magnification
    frame.style.setProperty('--o-lz-x', `${(x - diameter / 2).toFixed(1)}px`)
    frame.style.setProperty('--o-lz-y', `${(y - diameter / 2).toFixed(1)}px`)
    frame.style.setProperty(
      '--o-lz-bs',
      `${(nw * scale).toFixed(1)}px ${(nh * scale).toFixed(1)}px`,
    )
    frame.style.setProperty('--o-lz-bx', `${(diameter / 2 - u * scale).toFixed(1)}px`)
    frame.style.setProperty('--o-lz-by', `${(diameter / 2 - v * scale).toFixed(1)}px`)
    frame.setAttribute('data-o-lens-active', '')
  }

  return (
    <div
      className={className}
      style={hostStyle}
      onPointerMove={reduced ? undefined : follow}
      onPointerLeave={
        reduced
          ? undefined
          : (event) => {
              event.currentTarget.removeAttribute('data-o-lens-active')
            }
      }
    >
      <img
        loading="lazy"
        decoding="async"
        {...rest}
        ref={picture}
        src={src}
        alt={alt}
        className="o-size-full o-object-cover"
      />

      {/* The disc is decorative: what it shows is already in the image. */}
      {reduced ? null : <div aria-hidden data-o-lz-glass="" />}
    </div>
  )
}

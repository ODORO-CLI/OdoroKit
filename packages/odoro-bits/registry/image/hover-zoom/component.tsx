/**
 * Zoom on hover: the image grows inside its frame and looks towards the pointer.
 *
 * ## The frame never moves
 *
 * The zoom applies to the image, not to its frame: the ratio is fixed by
 * `aspect-ratio` and the overflow is clipped. Enlarging the frame itself would
 * push the layout on every hover, which turns a caress into a jolt.
 *
 * ## Following the pointer goes through the transform origin
 *
 * Moving the image by `translate` would require computing an amplitude that
 * depends on the zoom so as never to uncover the background. Moving the
 * **origin** of the transform gives the same effect — the hovered region comes
 * towards the pointer — and the geometry alone guarantees that the image
 * always covers its frame. The origin is written into CSS variables from the
 * event, with no React render: the browser interpolates the rest.
 *
 * ## Under reduced motion
 *
 * The image stays at scale one and the origin does not move: the component
 * sets neither attribute nor listener. A decorative zoom has no information to
 * preserve.
 *
 * @module
 */

import { mergePresentation, useMotionState, type Customisable } from '@odoro-cli/engine'
import { useRef, type CSSProperties, type ReactElement } from 'react'

/** Identifier of the injected stylesheet. */
const STYLE_ID = 'o-hover-zoom'

/**
 * Sets the zoom rules, once per document.
 *
 * They cannot be inline styles: the enlargement depends on the hover of the
 * frame, not on that of the image.
 */
function ensureHoverZoomRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-hover-zoom] img{',
    'transform-origin:var(--o-hz-x) var(--o-hz-y);',
    // The origin is smoothed one notch shorter than the zoom: raw, every
    // pointer event would make the enlarged region jump.
    'transition:transform var(--o-hz-duration) var(--o-ease-standard),',
    'transform-origin var(--o-duration-base) linear;',
    '}',
    '[data-o-hover-zoom]:hover img,[data-o-hover-zoom]:focus-within img{',
    'transform:scale(var(--o-hz-zoom));',
    '}',
  ].join('')
  document.head.append(style)
}

/** Properties specific to the component. */
export interface HoverZoomOwnProps {
  /** Source of the image. */
  src: string
  /** Alternative text. Empty string if the image is purely decorative. */
  alt: string
  /** Width to height ratio. @defaultValue 1.777 */
  ratio?: number
  /** Scale reached on hover, from 1.05 to 1.6. @defaultValue 1.15 */
  zoom?: number
  /** Duration of the enlargement, in milliseconds. @defaultValue 480 */
  duration?: number
}

/** All properties: its own, plus those of an image. */
export type HoverZoomProps = Customisable<HoverZoomOwnProps, 'img'>

/**
 * Zooms an image on hover, towards the pointer.
 *
 * @example
 * <HoverZoom src="/photo.jpg" alt="View of the workshop" zoom={1.2} />
 *
 * @example
 * // Inside a clickable card: the focus of the link triggers the zoom too.
 * <a href="/project">
 *   <HoverZoom src="/photo.jpg" alt="" className="o-rounded-lg" />
 * </a>
 */
export function HoverZoom({
  src,
  alt,
  ratio = 1.777,
  zoom = 1.15,
  duration = 480,
  ...rest
}: HoverZoomProps): ReactElement {
  const { reduced } = useMotionState()
  const host = useRef<HTMLDivElement | null>(null)
  ensureHoverZoomRule()

  const { className, style } = mergePresentation(
    { className: 'o-relative o-overflow-hidden' },
    rest,
  )

  const hostStyle = {
    ...style,
    aspectRatio: String(ratio),
    '--o-hz-zoom': String(Math.min(1.6, Math.max(1.05, zoom))),
    '--o-hz-duration': `${String(duration)}ms`,
    '--o-hz-x': '50%',
    '--o-hz-y': '50%',
  } as CSSProperties

  return (
    <div
      ref={host}
      className={className}
      style={hostStyle}
      data-o-hover-zoom={reduced ? undefined : ''}
      onPointerMove={
        reduced
          ? undefined
          : (event) => {
              // The origin follows the pointer as a percentage of the frame:
              // no React state, the browser interpolates between two writes.
              const box = event.currentTarget.getBoundingClientRect()
              const x = ((event.clientX - box.left) / Math.max(box.width, 1)) * 100
              const y = ((event.clientY - box.top) / Math.max(box.height, 1)) * 100
              event.currentTarget.style.setProperty('--o-hz-x', `${x.toFixed(1)}%`)
              event.currentTarget.style.setProperty('--o-hz-y', `${y.toFixed(1)}%`)
            }
      }
      onPointerLeave={
        reduced
          ? undefined
          : (event) => {
              // Back to the centre: without this, the next hover would start
              // from the last known position, a random edge.
              event.currentTarget.style.setProperty('--o-hz-x', '50%')
              event.currentTarget.style.setProperty('--o-hz-y', '50%')
            }
      }
    >
      <img
        {...rest}
        src={src}
        alt={alt}
        className="o-size-full o-object-cover o-will-change-transform"
      />
    </div>
  )
}

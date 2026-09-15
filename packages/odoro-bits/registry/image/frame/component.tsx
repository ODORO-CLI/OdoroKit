/**
 * Image frame: fixed ratio, covered loading, gentle reveal.
 *
 * ## The ratio is set before the image
 *
 * An image with no declared dimensions occupies zero pixels until it loads,
 * then brutally pushes everything that follows it. It is the most common
 * layout shift on the web, and it is entirely avoidable: the frame reserves
 * the space from the first render, from the ratio alone.
 *
 * ## The reveal is not an ornament
 *
 * Between the moment the space is reserved and the moment the image arrives,
 * there is an empty rectangle. Leaving it as it is gives a page full of holes;
 * putting a silhouette in it says that something is happening. The fade, for
 * its part, avoids the flicker of a blunt appearance.
 *
 * ## What is not done here
 *
 * Neither a blurred thumbnail nor a set of sources: that requires an image
 * processing pipeline that this component has no business deciding. `srcSet`
 * and `sizes` go through the pass-through and land as they are on the tag.
 *
 * @module
 */

import { mergePresentation, useMotionState, type Customisable } from '@odoro-cli/engine'
import { useState, type CSSProperties, type ReactElement } from 'react'

/** Identifier of the injected stylesheet. */
const STYLE_ID = 'o-frame'

/**
 * Sets the enlargement rule, once per document.
 *
 * It cannot be an inline style: it depends on the hover of the frame, not on
 * that of the image.
 */
function ensureFrameRule() {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent =
    '[data-o-frame-zoom]:hover img{transform:scale(var(--o-frame-zoom))}'
  document.head.append(style)
}

/** Properties specific to the component. */
export interface FrameOwnProps {
  /** Source of the image. */
  src: string
  /** Alternative text. Empty string if the image is purely decorative. */
  alt: string
  /** Width to height ratio. @defaultValue 1.777 */
  ratio?: number
  /** Fit inside the frame. @defaultValue 'cover' */
  fit?: 'cover' | 'contain'
  /** Enlargement on hover, from 0 to 0.3. @defaultValue 0 */
  zoom?: number
}

/** All properties: its own, plus those of an image. */
export type FrameProps = Customisable<FrameOwnProps, 'img'>

/**
 * Frames an image.
 *
 * @example
 * <Frame src="/photo.jpg" alt="View of the workshop" ratio={16 / 9} zoom={0.06} />
 *
 * @example
 * // The pass-through carries what the component has no business deciding.
 * <Frame
 *   src="/photo.jpg"
 *   alt=""
 *   srcSet="/photo-800.jpg 800w, /photo-1600.jpg 1600w"
 *   sizes="(min-width: 60rem) 50vw, 100vw"
 *   loading="lazy"
 * />
 */
export function Frame({
  src,
  alt,
  ratio = 1.777,
  fit = 'cover',
  zoom = 0,
  ...rest
}: FrameProps): ReactElement {
  const { reduced } = useMotionState()
  const [loaded, setLoaded] = useState(false)
  ensureFrameRule()

  const { className, style } = mergePresentation(
    { className: 'o-relative o-overflow-hidden' },
    rest,
  )

  const image: CSSProperties = {
    objectFit: fit,
    opacity: loaded ? 1 : 0,
    transform: loaded || reduced ? undefined : 'scale(1.02)',
    transition: reduced
      ? undefined
      : 'opacity var(--o-duration-slow) var(--o-ease-entrance), transform var(--o-duration-slow) var(--o-ease-entrance)',
  }

  return (
    <div
      className={className}
      style={{ ...style, aspectRatio: String(ratio) }}
      // The hover enlarges the image, not the frame: otherwise the layout
      // would move, which the fixed ratio exists precisely to prevent.
      data-o-frame-zoom={zoom > 0 && !reduced ? '' : undefined}
    >
      {loaded ? null : (
        <div
          className="o-absolute o-inset-0 o-bg-zinc-100 dark:o-bg-zinc-900 o-animate-shimmer"
          aria-hidden
        />
      )}

      <img
        {...rest}
        src={src}
        alt={alt}
        onLoad={() => setLoaded(true)}
        className="o-size-full o-transition-transform"
        style={{
          ...image,
          ...(zoom > 0 && !reduced ? { '--o-frame-zoom': String(1 + zoom) } : {}),
        }}
      />
    </div>
  )
}

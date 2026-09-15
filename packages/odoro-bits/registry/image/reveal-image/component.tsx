/**
 * Revealed image: a curtain opens on entering the viewport, while the image
 * comes back from a slight zoom.
 *
 * ## Two movements, two layers
 *
 * The curtain is a `clip-path` on an intermediate veil; the zoom is a
 * transform on the image itself. Putting them on the same element would force
 * them into a single property, and one of the two would disappear. Separated,
 * each has its transition, and the browser composites.
 *
 * Clipping rather than an opacity: an image that opens has an edge, an image
 * that fades has none. It is the edge that gives the impression that one is
 * uncovering something that was already there — reinforced by the reverse
 * zoom, which starts closer and settles.
 *
 * ## The trigger opens when in doubt
 *
 * The observation comes from the `useInView` hook, which returns "seen"
 * immediately when observation is impossible. The opposite default would be
 * the worst: an image never revealed is an absent image.
 *
 * ## Under reduced motion
 *
 * The image is visible from the start, with neither curtain nor zoom: the
 * reveal is an entrance gesture, not a content.
 *
 * @module
 */

import { mergePresentation, useMotionState, type Customisable } from '@odoro-cli/engine'
import type { CSSProperties, ReactElement } from 'react'

import { useInView } from '@registre/hooks/useInView'

/** Properties specific to the component. */
export interface RevealImageOwnProps {
  /** Source of the image. */
  src: string
  /** Alternative text. Empty string if the image is purely decorative. */
  alt: string
  /** Width to height ratio. @defaultValue 1.777 */
  ratio?: number
  /** Direction in which the curtain opens. @defaultValue 'up' */
  direction?: 'up' | 'left'
  /** Duration of the reveal, in milliseconds. @defaultValue 900 */
  duration?: number
}

/** All properties: its own, plus those of an image. */
export type RevealImageProps = Customisable<RevealImageOwnProps, 'img'>

/**
 * Reveals an image on its entry into the viewport.
 *
 * @example
 * <RevealImage src="/photo.jpg" alt="View of the workshop" />
 *
 * @example
 * // Lateral opening, slower.
 * <RevealImage src="/photo.jpg" alt="" direction="left" duration={1200} />
 */
export function RevealImage({
  src,
  alt,
  ratio = 1.777,
  direction = 'up',
  duration = 900,
  ...rest
}: RevealImageProps): ReactElement {
  const { reduced } = useMotionState()
  const { ref, inView } = useInView<HTMLDivElement>({ amount: 0.35 })

  // Under reduced motion, the final state is the only state.
  const shown = inView || reduced

  const { className, style } = mergePresentation(
    { className: 'o-relative o-overflow-hidden' },
    rest,
  )

  // The curtain starts from the edge opposite the direction of the opening:
  // "up" uncovers from the bottom upwards, "left" from the left rightwards.
  const closed = direction === 'up' ? 'inset(100% 0 0 0)' : 'inset(0 100% 0 0)'

  const veil: CSSProperties = {
    clipPath: shown ? 'inset(0 0 0 0)' : closed,
    transition: reduced
      ? undefined
      : `clip-path ${String(duration)}ms var(--o-ease-entrance)`,
  }

  const image: CSSProperties = {
    transform: shown ? 'scale(1)' : 'scale(1.15)',
    transition: reduced
      ? undefined
      : `transform ${String(duration)}ms var(--o-ease-entrance)`,
  }

  return (
    <div ref={ref} className={className} style={{ ...style, aspectRatio: String(ratio) }}>
      <div className="o-absolute o-inset-0" style={veil}>
        <img
          {...rest}
          src={src}
          alt={alt}
          className="o-size-full o-object-cover o-will-change-transform"
          style={image}
        />
      </div>
    </div>
  )
}

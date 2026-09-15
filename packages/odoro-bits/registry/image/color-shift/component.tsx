/**
 * Hue drift: the frame is a control desk. The horizontal position of the
 * pointer rotates the hues, the vertical one raises or lowers the saturation.
 *
 * ## Two axes, not a switch
 *
 * An image that changes colour on hover changes once: that is a state. Here
 * the hover triggers nothing, it **doses**. One walks the pointer around and
 * looks for the tone, as on a colour grading desk. That is what sets this
 * entry apart from the duotone, which imposes two tones chosen in advance, and
 * from the glitch, which separates the channels without tinting them.
 *
 * ## A single animated property, two variables
 *
 * The filter is written once, inline, and contains nothing but variables:
 * `hue-rotate(var(...)) saturate(var(...))`. The gesture therefore writes only
 * two numbers on the host element, which the image inherits. No React render,
 * a single recomputed property, and a short transition that is enough to
 * smooth the irregular pace at which the system delivers pointer events.
 *
 * ## Under reduced motion
 *
 * The filter is not applied at all and nothing listens: the image stays in its
 * original colours, crisp. A hue drift is an embellishment, not information —
 * there is no final state to preserve.
 *
 * @module
 */

import { mergePresentation, useMotionState, type Customisable } from '@odoro-cli/engine'
import type { CSSProperties, ReactElement } from 'react'

/** Properties specific to the component. */
export interface ColorShiftOwnProps {
  /** Source of the image. */
  src: string
  /** Alternative text. Empty string if the image is purely decorative. */
  alt: string
  /** Width to height ratio of the frame. @defaultValue 1.777 */
  ratio?: number
  /**
   * Hue rotation reached at the edges of the frame, in degrees.
   *
   * The rotation is symmetric: on the left it is negative, on the right
   * positive, and zero in the middle — the centre gives the image as it is.
   *
   * @defaultValue 140
   */
  shift?: number
  /** Saturation reached at the top of the frame. At the bottom, the image is desaturated. @defaultValue 1.6 */
  saturate?: number
  /** Duration of the smoothing between two positions, in milliseconds. @defaultValue 220 */
  duration?: number
}

/** All properties: its own, plus those of an image. */
export type ColorShiftProps = Customisable<ColorShiftOwnProps, 'img'>

/**
 * Drifts the hues of an image under the pointer.
 *
 * @example
 * <ColorShift src="/photo.jpg" alt="View of the workshop" />
 *
 * @example
 * // Short drift, contained saturation: a mere shiver of colour.
 * <ColorShift src="/photo.jpg" alt="" shift={40} saturate={1.2} />
 */
export function ColorShift({
  src,
  alt,
  ratio = 1.777,
  shift = 140,
  saturate = 1.6,
  duration = 220,
  ...rest
}: ColorShiftProps): ReactElement {
  const { reduced } = useMotionState()

  const amplitude = Math.max(0, shift)
  const top = Math.max(0, saturate)

  const { className, style } = mergePresentation(
    { className: 'o-relative o-overflow-hidden' },
    rest,
  )

  const hostStyle = {
    ...style,
    aspectRatio: String(ratio),
    '--o-cs-hue': '0deg',
    '--o-cs-sat': '1',
  } as CSSProperties

  /** Brings the values back to rest: the image exactly as it was supplied. */
  const resetFilter = (frame: HTMLElement): void => {
    frame.style.setProperty('--o-cs-hue', '0deg')
    frame.style.setProperty('--o-cs-sat', '1')
  }

  return (
    <div
      className={className}
      style={hostStyle}
      onPointerMove={
        reduced
          ? undefined
          : (event) => {
              const frame = event.currentTarget
              const box = frame.getBoundingClientRect()

              // Horizontal brought back to [-1, 1]: the middle of the frame
              // does not touch the hues.
              const x = ((event.clientX - box.left) / Math.max(box.width, 1)) * 2 - 1
              // Vertical brought back to [0, 1], then flipped: the top
              // saturates, the bottom washes out — the direction an intensity
              // slider has.
              const y = 1 - (event.clientY - box.top) / Math.max(box.height, 1)

              frame.style.setProperty('--o-cs-hue', `${(x * amplitude).toFixed(1)}deg`)
              frame.style.setProperty('--o-cs-sat', (y * top).toFixed(3))
            }
      }
      onPointerLeave={
        reduced
          ? undefined
          : (event) => {
              resetFilter(event.currentTarget)
            }
      }
    >
      <img
        loading="lazy"
        decoding="async"
        {...rest}
        src={src}
        alt={alt}
        className="o-size-full o-object-cover"
        style={
          reduced
            ? undefined
            : {
                filter: 'hue-rotate(var(--o-cs-hue)) saturate(var(--o-cs-sat))',
                transition: `filter ${String(Math.max(0, duration))}ms var(--o-ease-standard)`,
              }
        }
      />
    </div>
  )
}

/**
 * Blob that deforms: a central mass lets a bud go, the neck stretches,
 * breaks, then the bud comes back and melts in again.
 *
 * ## Two circles that make only one
 *
 * The drawing contains nothing but two circles. What welds them together is
 * a filter: a Gaussian blur spreads their edges toward one another, then a
 * color matrix multiplies alpha heavily and shifts it down. Everything that
 * was half transparent becomes frankly opaque or frankly empty, and the
 * threshold thus set carves a crisp contour back around the two mingled
 * shapes. Where their halos overlap, a neck appears; when they move far
 * enough apart, it thins out and snaps.
 *
 * No path interpolation, then, and no per-frame computation: the
 * deformation is a side effect of the distance between two circles.
 *
 * The core retracts when the bud moves away and swells again when it comes
 * back. It is a small cheat on the conservation of matter, but the eye
 * expects it: without it, the blob seems to manufacture substance.
 *
 * The filter region is widened by a quarter on either side: by default it
 * hugs the bounding box too closely, and the blur would be cut off square
 * on its edges.
 *
 * ## A status, not a drawing
 *
 * The element carries `role="status"` and a label for screen readers: the
 * wait is information, not decoration. The drawing is removed from the
 * accessibility tree.
 *
 * Under reduced motion, the bud stays in the center: the two circles are
 * concentric and the filter renders only a single round mass, quite
 * still.
 *
 * @module
 */

import { mergePresentation, type Customisable } from '@odoro-cli/engine'
import { useId, type CSSProperties, type ReactElement } from 'react'

/** Id of the injected stylesheet. */
const STYLE_ID = 'o-blob-loader'

/**
 * Threshold matrix: the colors pass through unchanged, alpha is multiplied
 * then lowered. The product is one beyond about a half and zero below it:
 * the gradient of the blur becomes an edge again.
 */
const THRESHOLD = '1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -10'

/** Sets the blob, its bud and its breathing, once per document. */
function ensureBlobRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-blob-loader]{display:inline-block;line-height:0}',
    '[data-o-blob-loader] svg{display:block}',
    '[data-o-blob-arm],[data-o-blob-bud],[data-o-blob-core]{',
    'transform-box:view-box;transform-origin:50px 50px;',
    '}',
    // The arm turns one turn per cycle; the bud goes out and comes back twice
    // during that turn, so one break every half turn.
    '[data-o-blob-arm]{',
    'animation:o-blob-loader-turn var(--o-blob-speed) linear infinite;',
    '}',
    '@keyframes o-blob-loader-turn{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}',
    '[data-o-blob-bud]{',
    'animation:o-blob-loader-reach var(--o-blob-speed) ease-in-out infinite;',
    '}',
    '@keyframes o-blob-loader-reach{',
    '0%,50%,100%{transform:translateX(2px) scale(0.66)}',
    '25%,75%{transform:translateX(29px) scale(1)}',
    '}',
    '[data-o-blob-core]{',
    'animation:o-blob-loader-breathe var(--o-blob-speed) ease-in-out infinite;',
    '}',
    '@keyframes o-blob-loader-breathe{',
    '0%,50%,100%{transform:scale(1)}',
    '25%,75%{transform:scale(0.86)}',
    '}',
    '@media (prefers-reduced-motion:reduce){',
    '[data-o-blob-arm],[data-o-blob-bud],[data-o-blob-core]{animation:none;transform:none}',
    '}',
  ].join('')
  document.head.append(style)
}

/** The component's own props. */
export interface BlobLoaderOwnProps {
  /** Side of the drawing area, in pixels. @defaultValue 56 */
  size?: number
  /** Duration of one turn of the bud, in milliseconds. @defaultValue 2800 */
  speed?: number
  /** Color of the blob. @defaultValue the text color */
  color?: string
  /** Label announced to screen readers. @defaultValue 'Loading' */
  label?: string
}

/** All props. */
export type BlobLoaderProps = Customisable<BlobLoaderOwnProps, 'span'>

/**
 * Signals a wait with a mass that buds and welds itself back together.
 *
 * @example
 * <BlobLoader />
 *
 * @example
 * // Bigger, slower, in the brand hue.
 * <BlobLoader size={96} speed={4200} color="var(--o-palette-brand-500)" />
 */
export function BlobLoader({
  size = 56,
  speed = 2800,
  color = 'currentColor',
  label = 'Loading',
  ...rest
}: BlobLoaderProps): ReactElement {
  ensureBlobRule()

  // One id per instance: two blobs on the same page must not share a
  // filter.
  const goo = `o-blob-loader-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`

  const { className, style } = mergePresentation({}, rest)

  const loaderStyle = {
    ...style,
    width: `${String(size)}px`,
    height: `${String(size)}px`,
    color,
    '--o-blob-speed': `${String(speed)}ms`,
  } as CSSProperties

  return (
    <span
      {...rest}
      className={className}
      style={loaderStyle}
      data-o-blob-loader=""
      role="status"
    >
      <span className="o-sr-only">{label}</span>
      <svg aria-hidden viewBox="0 0 100 100" width="100%" height="100%">
        <defs>
          <filter id={goo} x="-25%" y="-25%" width="150%" height="150%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="o-blob-blur" />
            <feColorMatrix in="o-blob-blur" type="matrix" values={THRESHOLD} />
          </filter>
        </defs>
        <g filter={`url(#${goo})`} fill="currentColor">
          <circle data-o-blob-core="" cx="50" cy="50" r="17" />
          <g data-o-blob-arm="">
            <circle data-o-blob-bud="" cx="50" cy="50" r="9.5" />
          </g>
        </g>
      </svg>
    </span>
  )
}

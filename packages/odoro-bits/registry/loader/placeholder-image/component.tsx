/**
 * Image frame: a rectangle at the right ratio, ringed with a dashed line,
 * with the glyph of what is missing at its centre.
 *
 * ## An empty frame is not a grey block
 *
 * A plain block says "this is loading". A dashed frame with an icon says "an
 * image goes here" — and says it even when nothing is loading: an
 * illustration that is absent, an upload field still empty, a template being
 * assembled. The two readings do not call for the same drawing, hence an
 * entry separate from `skeleton-grid`, whose thumbnails are full and
 * anonymous.
 *
 * The line is **dashed**: it is the convention that tells reserved room apart
 * from a real border. A solid stroke would read as the final frame of the
 * image.
 *
 * The glyph is drawn inline rather than imported: three strokes, a disc and a
 * rectangle cost less than one more dependency for a component that displays
 * nothing else.
 *
 * ## The ratio, again
 *
 * `ratio` reserves the exact height. It is the same reason as in
 * `skeleton-grid`: without a declared ratio, the page folds up when the image
 * arrives, and everything below it jumps.
 *
 * ## A status, not a drawing
 *
 * The element carries `role="status"` and a label; the frame and its glyph
 * are removed from the accessibility tree. Under reduced motion, the sheen
 * stops and the frame stays whole: the room stays said, it does not fade
 * away.
 *
 * @module
 */

import { mergePresentation, type Customisable } from '@odoro-cli/engine'
import type { CSSProperties, ReactElement } from 'react'

/** Id of the injected stylesheet. */
const STYLE_ID = 'o-placeholder-image'

/** Ratios accepted for the frame. */
const RATIOS = ['16/9', '4/3', '3/2', '1/1'] as const

/** Sets the frame, its line and its sheen, once per document. */
function ensurePlaceholderImageRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-pimg]{display:block;width:100%}',
    '[data-o-pimg-frame]{',
    'position:relative;display:flex;align-items:center;justify-content:center;',
    'overflow:hidden;box-sizing:border-box;',
    'width:100%;aspect-ratio:var(--o-pimg-ratio);',
    'border-radius:var(--o-pimg-radius);',
    // Lighter than a skeleton block: the glyph has to read.
    'background:color-mix(in oklab,var(--o-theme-line) 38%,var(--o-theme-surface));',
    // Dashed: the convention of reserved room, not of a real frame.
    'border:1px dashed var(--o-theme-line);',
    '}',
    // The glyph takes the ink muted: present, never dominant.
    '[data-o-pimg-glyph]{',
    'position:relative;display:block;color:var(--o-theme-muted);',
    'width:var(--o-pimg-icon);height:auto;opacity:0.85;',
    '}',
    '[data-o-pimg-shimmer] [data-o-pimg-frame]::after{',
    'content:"";position:absolute;inset:0;',
    'background:linear-gradient(100deg,transparent 0 35%,color-mix(in oklab,var(--o-theme-surface) 80%,transparent) 50%,transparent 65% 100%);',
    'transform:translateX(-100%);',
    'animation:o-pimg-sweep var(--o-pimg-speed) linear infinite;',
    '}',
    '@keyframes o-pimg-sweep{to{transform:translateX(100%)}}',
    // The frame stays whole, without a sheen.
    '@media (prefers-reduced-motion:reduce){',
    '[data-o-pimg-shimmer] [data-o-pimg-frame]::after{animation:none;opacity:0}',
    '}',
  ].join('')
  document.head.append(style)
}

/** Props specific to the component. */
export interface PlaceholderImageOwnProps {
  /** Width to height ratio of the frame. @defaultValue '16/9' */
  ratio?: string
  /** Width of the glyph, in pixels. @defaultValue 40 */
  icon?: number
  /** Corner radius, in pixels. @defaultValue 12 */
  radius?: number
  /** Run a sheen across the frame. @defaultValue false */
  shimmer?: boolean
  /** Duration of one pass of the sheen, in milliseconds. @defaultValue 2000 */
  speed?: number
  /** Label announced to screen readers. @defaultValue 'Image pending' */
  label?: string
}

/** All props. */
export type PlaceholderImageProps = Customisable<PlaceholderImageOwnProps, 'div'>

/**
 * Reserves the room for an image, frame and glyph included.
 *
 * @example
 * <PlaceholderImage />
 *
 * @example
 * // A square that really is loading: the sheen says so.
 * <PlaceholderImage ratio="1/1" shimmer />
 */
export function PlaceholderImage({
  ratio = '16/9',
  icon = 40,
  radius = 12,
  shimmer = false,
  speed = 2000,
  label = 'Image pending',
  ...rest
}: PlaceholderImageProps): ReactElement {
  ensurePlaceholderImageRule()

  // An unknown ratio would break the frame without saying anything: we fall
  // back to the default one rather than writing an invalid value.
  const safeRatio = (RATIOS as readonly string[]).includes(ratio) ? ratio : '16/9'

  const { className, style } = mergePresentation({}, rest)

  const hostStyle = {
    ...style,
    '--o-pimg-ratio': safeRatio,
    '--o-pimg-icon': `${String(icon)}px`,
    '--o-pimg-radius': `${String(radius)}px`,
    '--o-pimg-speed': `${String(speed)}ms`,
  } as CSSProperties

  return (
    <div
      {...rest}
      className={className}
      style={hostStyle}
      data-o-pimg=""
      data-o-pimg-shimmer={shimmer ? '' : undefined}
      role="status"
    >
      <span className="o-sr-only">{label}</span>
      <span aria-hidden data-o-pimg-frame="">
        <svg
          data-o-pimg-glyph=""
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="3" y="4.5" width="18" height="15" rx="2.5" />
          <circle cx="8.75" cy="10" r="1.6" />
          <path d="M3.5 16.4 8.6 12.1 13 15.8" />
          <path d="M12.4 15.3 15.9 12.2 20.5 16" />
        </svg>
      </span>
    </div>
  )
}

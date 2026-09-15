/**
 * A grid in waiting: thumbnails all at the same ratio, each with its caption,
 * swept diagonally.
 *
 * ## The ratio above all
 *
 * A gallery that loads without reserving the height of its thumbnails makes
 * the whole page jump every time an image arrives. That is the only real job
 * of this skeleton: `ratio` fixes the ratio of each cell, and the grid takes
 * up right now the exact room the images will take.
 *
 * The caption under each thumbnail is shorter than the cell: it is that
 * offset which tells a gallery apart from a chessboard.
 *
 * ## A diagonal, not a line
 *
 * The delay of the sheen follows the sum of the row and the column: the wave
 * crosses the grid at an angle. A delay by column alone would scroll vertical
 * bands past, and the eye would follow the band instead of reading the grid;
 * on the diagonal, the movement stays a breathing of the whole.
 *
 * ## A status, not a drawing
 *
 * The element carries `role="status"` and a label; the thumbnails are removed
 * from the accessibility tree. Under reduced motion, they stay full and
 * still: the empty grid remains visible, it does not fade away.
 *
 * @module
 */

import { mergePresentation, type Customisable } from '@odoro-cli/engine'
import type { CSSProperties, ReactElement } from 'react'

/** Id of the injected stylesheet. */
const STYLE_ID = 'o-skeleton-grid'

/** Ratios accepted for a thumbnail. */
const RATIOS = ['16/9', '4/3', '3/2', '1/1'] as const

/** Caption lengths, as a percentage of the thumbnail. */
const CAPTIONS = [72, 54, 84, 62] as const

/** Sets the grid, its thumbnails and their animation, once per document. */
function ensureSkeletonGridRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-skgrid]{',
    'display:grid;width:100%;',
    'grid-template-columns:repeat(var(--o-skgrid-columns),minmax(0,1fr));',
    'gap:var(--o-skgrid-gap);',
    '}',
    '[data-o-skgrid-cell]{display:flex;flex-direction:column;gap:calc(var(--o-skgrid-gap) * 0.45)}',
    '[data-o-skgrid-fill]{',
    'position:relative;display:block;overflow:hidden;',
    'background:color-mix(in oklab,var(--o-theme-line) 72%,var(--o-theme-surface));',
    '}',
    // The ratio reserves the height: that is what keeps the page from
    // jumping when the images arrive.
    '[data-o-skgrid-tile]{',
    'width:100%;aspect-ratio:var(--o-skgrid-ratio);',
    'border-radius:var(--o-skgrid-radius);',
    '}',
    '[data-o-skgrid-caption]{',
    'height:0.55rem;border-radius:calc(var(--o-skgrid-radius) * 0.5);',
    '}',
    '[data-o-skgrid-shimmer] [data-o-skgrid-fill]::after{',
    'content:"";position:absolute;inset:0;',
    'background:linear-gradient(90deg,transparent 0 30%,color-mix(in oklab,var(--o-theme-surface) 85%,transparent) 50%,transparent 70% 100%);',
    'transform:translateX(-100%);',
    'animation:o-skgrid-sweep var(--o-skgrid-speed) linear infinite;',
    'animation-delay:var(--o-skgrid-delay);',
    '}',
    '@keyframes o-skgrid-sweep{to{transform:translateX(100%)}}',
    '[data-o-skgrid-pulse] [data-o-skgrid-fill]{',
    'animation:o-skgrid-pulse var(--o-skgrid-speed) ease-in-out infinite;',
    'animation-delay:var(--o-skgrid-delay);',
    '}',
    '@keyframes o-skgrid-pulse{0%,100%{opacity:1}50%{opacity:0.45}}',
    '@media (prefers-reduced-motion:reduce){',
    '[data-o-skgrid-fill]{animation:none;opacity:1}',
    '[data-o-skgrid-shimmer] [data-o-skgrid-fill]::after{animation:none;opacity:0}',
    '}',
  ].join('')
  document.head.append(style)
}

/** Props specific to the component. */
export interface SkeletonGridOwnProps {
  /** Number of rows. @defaultValue 2 */
  rows?: number
  /** Number of columns. @defaultValue 3 */
  columns?: number
  /** Width to height ratio of a thumbnail. @defaultValue '4/3' */
  ratio?: string
  /** Reserve the room for a caption under each thumbnail. @defaultValue true */
  caption?: boolean
  /** Gap between the thumbnails, in pixels. @defaultValue 14 */
  gap?: number
  /** Corner radius of a thumbnail, in pixels. @defaultValue 10 */
  radius?: number
  /** A sheen that crosses rather than a pulse of the whole. @defaultValue true */
  shimmer?: boolean
  /** Duration of one pass of the sheen or of one pulse, in milliseconds. @defaultValue 1600 */
  speed?: number
  /** Label announced to screen readers. @defaultValue 'Loading gallery' */
  label?: string
}

/** All props. */
export type SkeletonGridProps = Customisable<SkeletonGridOwnProps, 'div'>

/**
 * Reserves the room for a gallery of thumbnails.
 *
 * @example
 * <SkeletonGrid />
 *
 * @example
 * // Four square columns, without a caption.
 * <SkeletonGrid rows={2} columns={4} ratio="1/1" caption={false} />
 */
export function SkeletonGrid({
  rows = 2,
  columns = 3,
  ratio = '4/3',
  caption = true,
  gap = 14,
  radius = 10,
  shimmer = true,
  speed = 1600,
  label = 'Loading gallery',
  ...rest
}: SkeletonGridProps): ReactElement {
  ensureSkeletonGridRule()

  const rowCount = Math.max(1, Math.round(rows))
  const columnCount = Math.max(1, Math.round(columns))
  // An unknown ratio would break the grid without saying anything: we fall
  // back to the default one rather than writing an invalid value.
  const safeRatio = (RATIOS as readonly string[]).includes(ratio) ? ratio : '4/3'

  const { className, style } = mergePresentation({}, rest)

  const hostStyle = {
    ...style,
    '--o-skgrid-columns': String(columnCount),
    '--o-skgrid-ratio': safeRatio,
    '--o-skgrid-gap': `${String(gap)}px`,
    '--o-skgrid-radius': `${String(radius)}px`,
    '--o-skgrid-speed': `${String(speed)}ms`,
  } as CSSProperties

  return (
    <div
      {...rest}
      className={className}
      style={hostStyle}
      data-o-skgrid=""
      data-o-skgrid-shimmer={shimmer ? '' : undefined}
      data-o-skgrid-pulse={shimmer ? undefined : ''}
      role="status"
    >
      <span className="o-sr-only">{label}</span>
      {Array.from({ length: rowCount * columnCount }, (_, index) => {
        const row = Math.floor(index / columnCount)
        const column = index % columnCount
        // The sum of row plus column: the wave crosses at an angle.
        const delay = {
          '--o-skgrid-delay': `${String(Math.round((speed / 12) * (row + column)))}ms`,
        } as CSSProperties

        return (
          <span key={index} aria-hidden data-o-skgrid-cell="">
            <span data-o-skgrid-fill="" data-o-skgrid-tile="" style={delay} />
            {caption ? (
              <span
                data-o-skgrid-fill=""
                data-o-skgrid-caption=""
                style={
                  {
                    ...delay,
                    width: `${String(CAPTIONS[index % CAPTIONS.length] ?? 70)}%`,
                  } as CSSProperties
                }
              />
            ) : null}
          </span>
        )
      })}
    </div>
  )
}

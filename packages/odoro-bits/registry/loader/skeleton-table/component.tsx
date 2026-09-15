/**
 * Table placeholder: rows separated by their rules, a wide first column, cells
 * of uneven lengths.
 *
 * ## What makes something read as a table
 *
 * Three things, and none of them is the number of blocks: the **rules**
 * between the rows, the first column wider than the others, and cells of
 * differing lengths. A grid of identical bars reads as a wall; those three
 * clues are enough to make it read as data, before any data is there.
 *
 * The lengths are not drawn at random: a random draw changes on every render,
 * and a skeleton that moves from one render to the next gives away that it is
 * fake. They come from a fixed sequence, indexed by the position of the cell.
 *
 * The header is painted at the full value of the rule, denser than the cells:
 * it is that contrast which sets it apart, not a different size.
 *
 * ## A status, not a drawing
 *
 * The element carries `role="status"` and a label; the cells are removed from
 * the accessibility tree. Under reduced motion, they stay solid and still: the
 * empty table remains visible, it does not fade away.
 *
 * @module
 */

import { mergePresentation, type Customisable } from '@odoro-cli/engine'
import type { CSSProperties, ReactElement } from 'react'

/** Identifier of the injected stylesheet. */
const STYLE_ID = 'o-skeleton-table'

/**
 * Cell lengths, as a percentage of their column.
 *
 * A fixed sequence rather than a random draw: the skeleton has to be identical
 * on every render, otherwise a simple re-render makes it flinch.
 */
const WIDTHS = [86, 58, 72, 44, 64, 92, 52, 78] as const

/** Sets up the table, its rules and the cell animation, once per document. */
function ensureSkeletonTableRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-sktab]{display:block;width:100%}',
    // The rule is what tells a table apart from a grid: it stays drawn even
    // when every cell is empty.
    '[data-o-sktab-row]{',
    'display:grid;grid-template-columns:var(--o-sktab-cols);',
    'gap:1rem;align-items:center;padding:var(--o-sktab-pad) 0;',
    'border-bottom:1px solid var(--o-theme-line);',
    '}',
    '[data-o-sktab-row]:last-child{border-bottom:0}',
    '[data-o-sktab-cell]{',
    'position:relative;display:block;overflow:hidden;',
    'height:var(--o-sktab-cell);border-radius:var(--o-sktab-radius);',
    'background:color-mix(in oklab,var(--o-theme-line) 72%,var(--o-theme-surface));',
    '}',
    // The header is denser, at the full value of the rule.
    '[data-o-sktab-head] [data-o-sktab-cell]{background:var(--o-theme-line)}',
    '[data-o-sktab-shimmer] [data-o-sktab-cell]::after{',
    'content:"";position:absolute;inset:0;',
    'background:linear-gradient(90deg,transparent 0 30%,color-mix(in oklab,var(--o-theme-surface) 85%,transparent) 50%,transparent 70% 100%);',
    'transform:translateX(-100%);',
    'animation:o-sktab-sweep var(--o-sktab-speed) linear infinite;',
    'animation-delay:var(--o-sktab-delay);',
    '}',
    '@keyframes o-sktab-sweep{to{transform:translateX(100%)}}',
    '[data-o-sktab-pulse] [data-o-sktab-cell]{',
    'animation:o-sktab-pulse var(--o-sktab-speed) ease-in-out infinite;',
    'animation-delay:var(--o-sktab-delay);',
    '}',
    '@keyframes o-sktab-pulse{0%,100%{opacity:1}50%{opacity:0.45}}',
    '@media (prefers-reduced-motion:reduce){',
    '[data-o-sktab-cell]{animation:none;opacity:1}',
    '[data-o-sktab-shimmer] [data-o-sktab-cell]::after{animation:none;opacity:0}',
    '}',
  ].join('')
  document.head.append(style)
}

/** Props of the component itself. */
export interface SkeletonTableOwnProps {
  /** Number of data rows, header excluded. @defaultValue 4 */
  rows?: number
  /** Number of columns. @defaultValue 4 */
  columns?: number
  /** Draw a denser header row. @defaultValue true */
  header?: boolean
  /** Height of a cell, in pixels. @defaultValue 10 */
  height?: number
  /** Corner radius of a cell, in pixels. @defaultValue 5 */
  radius?: number
  /** A reflection crossing over rather than an overall pulse. @defaultValue true */
  shimmer?: boolean
  /** Duration of one pass of the reflection or of one pulse, in milliseconds. @defaultValue 1600 */
  speed?: number
  /** Label announced to screen readers. @defaultValue 'Loading table' */
  label?: string
}

/** All the props. */
export type SkeletonTableProps = Customisable<SkeletonTableOwnProps, 'div'>

/**
 * Holds the place of a data table.
 *
 * @example
 * <SkeletonTable />
 *
 * @example
 * // Six rows, three columns, no header, pulsing.
 * <SkeletonTable rows={6} columns={3} header={false} shimmer={false} />
 */
export function SkeletonTable({
  rows = 4,
  columns = 4,
  header = true,
  height = 10,
  radius = 5,
  shimmer = true,
  speed = 1600,
  label = 'Loading table',
  ...rest
}: SkeletonTableProps): ReactElement {
  ensureSkeletonTableRule()

  const rowCount = Math.max(1, Math.round(rows))
  const columnCount = Math.max(1, Math.round(columns))

  const { className, style } = mergePresentation({}, rest)

  const hostStyle = {
    ...style,
    // The first column is wide: it is the one that names the row.
    '--o-sktab-cols': `1.7fr ${Array.from({ length: columnCount - 1 }, () => '1fr').join(' ')}`,
    '--o-sktab-cell': `${String(height)}px`,
    '--o-sktab-pad': `${String(Math.round(height * 1.1))}px`,
    '--o-sktab-radius': `${String(radius)}px`,
    '--o-sktab-speed': `${String(speed)}ms`,
  } as CSSProperties

  /** One row, header or data. */
  const row = (rank: number, isHead: boolean): ReactElement => (
    <span
      key={isHead ? 'head' : rank}
      aria-hidden
      data-o-sktab-row=""
      data-o-sktab-head={isHead ? '' : undefined}
    >
      {Array.from({ length: columnCount }, (_, column) => (
        <span
          key={column}
          data-o-sktab-cell=""
          style={
            {
              // The reflection goes down the table in reading order.
              '--o-sktab-delay': `${String(Math.round((speed / 14) * (rank + column)))}ms`,
              width: isHead
                ? '55%'
                : `${String(WIDTHS[(rank * columnCount + column) % WIDTHS.length] ?? 70)}%`,
            } as CSSProperties
          }
        />
      ))}
    </span>
  )

  return (
    <div
      {...rest}
      className={className}
      style={hostStyle}
      data-o-sktab=""
      data-o-sktab-shimmer={shimmer ? '' : undefined}
      data-o-sktab-pulse={shimmer ? undefined : ''}
      role="status"
    >
      <span className="o-sr-only">{label}</span>
      {header ? row(0, true) : null}
      {Array.from({ length: rowCount }, (_, rank) => row(rank + 1, false))}
    </div>
  )
}

/**
 * Generic data table.
 *
 * @module
 */

import { type ReactElement, type ReactNode } from 'react'

import { cx } from '../styles/cx.js'

/** One column of the table. */
export interface TableColumn<T> {
  /**
   * Key of the column. Without `render`, it is also used to read the value of
   * the row: `row[key]` must then be displayable as is.
   */
  readonly key: string
  /** Displayed header. */
  readonly header: ReactNode
  /** Alignment of the column content. @defaultValue 'left' */
  readonly align?: 'left' | 'center' | 'right'
  /** Custom rendering of a cell, from the whole row. */
  readonly render?: (row: T) => ReactNode
}

/** Properties of {@link Table}. */
export interface TableProps<T> {
  /** Columns, in display order. */
  columns: readonly TableColumn<T>[]
  /** Data rows. */
  rows: readonly T[]
  /** Stable key of a row, for reconciliation. */
  rowKey: (row: T) => string
  /**
   * Caption of the table. Visually hidden by default, it stays the title that
   * screen readers announce.
   */
  caption?: ReactNode
  /** Makes the caption visible. @defaultValue false */
  showCaption?: boolean
  /** Alternates the background of the rows. @defaultValue false */
  striped?: boolean
  /** Highlights the hovered row. @defaultValue false */
  hoverable?: boolean
  /** Tightens the vertical spacing. @defaultValue false */
  dense?: boolean
  /**
   * Keeps the header visible during the vertical scrolling of the container.
   *
   * @defaultValue false
   */
  stickyHeader?: boolean
  /** Message displayed, centered, when there is no row. */
  empty?: ReactNode
  /** Additional classes for the scrolling container. */
  className?: string
}

/** Alignment classes, per `align` value. */
const ALIGN_CLASSES: Readonly<Record<'left' | 'center' | 'right', string>> = {
  left: 'o-text-left',
  center: 'o-text-center',
  right: 'o-text-right',
}

/**
 * Accessible data table.
 *
 * The table lives in an `o-overflow-x-auto` container: on a narrow screen, it
 * is the container that scrolls, never the page.
 *
 * @example
 * <Table
 *   caption="Invoices for the quarter"
 *   columns={[
 *     { key: 'ref', header: 'Reference' },
 *     { key: 'total', header: 'Total', align: 'right', render: (f) => euros(f.total) },
 *   ]}
 *   rows={invoices}
 *   rowKey={(f) => f.ref}
 *   empty="No invoice."
 * />
 */
export function Table<T>({
  columns,
  rows,
  rowKey,
  caption,
  showCaption = false,
  striped = false,
  hoverable = false,
  dense = false,
  stickyHeader = false,
  empty,
  className,
}: TableProps<T>): ReactElement {
  const cellPadding = dense ? 'o-px-3 o-py-1.5' : 'o-px-4 o-py-3'

  return (
    <div className={cx('o-overflow-x-auto o-w-full', className)}>
      <table className="o-w-full o-text-sm o-text-zinc-900 dark:o-text-zinc-50">
        {caption === undefined ? null : (
          <caption
            className={cx(
              showCaption
                ? 'o-text-left o-text-sm o-text-zinc-500 dark:o-text-zinc-400 o-pb-2'
                : 'o-sr-only',
            )}
          >
            {caption}
          </caption>
        )}
        <thead
          className={cx(stickyHeader && 'o-sticky o-top-0 o-bg-white dark:o-bg-zinc-900')}
        >
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                scope="col"
                className={cx(
                  'o-text-zinc-500 dark:o-text-zinc-400 o-text-sm o-font-medium',
                  'o-border-b o-border-zinc-200 dark:o-border-zinc-800',
                  cellPadding,
                  ALIGN_CLASSES[column.align ?? 'left'],
                )}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className={cx(
                  'o-text-center o-text-zinc-500 dark:o-text-zinc-400 o-py-8',
                  'o-px-4',
                )}
              >
                {empty}
              </td>
            </tr>
          ) : (
            rows.map((row, index) => (
              <tr
                key={rowKey(row)}
                className={cx(
                  striped && index % 2 === 1 && 'o-bg-zinc-100 dark:o-bg-zinc-950',
                  hoverable && 'hover:o-bg-zinc-50 dark:hover:o-bg-zinc-800 o-transition',
                )}
              >
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={cx(
                      'o-border-b o-border-zinc-200 dark:o-border-zinc-800 o-align-middle',
                      cellPadding,
                      ALIGN_CLASSES[column.align ?? 'left'],
                    )}
                  >
                    {column.render === undefined
                      ? // Without custom rendering, the key names the property of
                        // the row. The contract is documented on `TableColumn.key`.
                        ((row as Record<string, unknown>)[column.key] as ReactNode)
                      : column.render(row)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}

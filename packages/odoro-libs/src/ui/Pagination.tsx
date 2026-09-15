/**
 * Pagination with a sliding window.
 *
 * @module
 */

import { type ReactElement } from 'react'

import { cx } from '../styles/cx.js'

/** Properties of {@link Pagination}. */
export interface PaginationProps {
  /** Current page, 1-indexed. */
  page: number
  /** Total number of pages. */
  pageCount: number
  /** Called with the requested page. */
  onPageChange: (page: number) => void
  /**
   * Number of pages displayed on each side of the current page.
   *
   * @defaultValue 1
   */
  siblingCount?: number
  /** Accessible label of the navigation. @defaultValue 'Pagination' */
  label?: string
  /** Additional classes for the navigation. */
  className?: string
}

/** Ellipsis markers, distinct so that each side keeps a stable key. */
type Ellipsis = 'start-ellipsis' | 'end-ellipsis'

/**
 * Numbers to display: the first and the last page are always present, a
 * window surrounds the current page, an ellipsis marks each jump.
 */
function pageWindow(
  page: number,
  pageCount: number,
  siblingCount: number,
): readonly (number | Ellipsis)[] {
  if (pageCount < 1) return []
  const start = Math.max(2, page - siblingCount)
  const end = Math.min(pageCount - 1, page + siblingCount)

  const result: (number | Ellipsis)[] = [1]
  if (start > 2) result.push('start-ellipsis')
  for (let current = start; current <= end; current += 1) result.push(current)
  if (end < pageCount - 1) result.push('end-ellipsis')
  if (pageCount > 1) result.push(pageCount)
  return result
}

/** Classes shared by the buttons of the bar. */
const BUTTON_CLASSES = cx(
  'o-inline-flex o-items-center o-justify-center o-size-9',
  'o-rounded-md o-text-sm o-font-medium o-transition',
)

/** Chevron of the previous and next buttons. */
function Chevron({ direction }: { direction: 'left' | 'right' }): ReactElement {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
      className="o-shrink-0"
    >
      <path
        d={direction === 'left' ? 'M15 6l-6 6 6 6' : 'M9 6l6 6-6 6'}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/**
 * Accessible pagination.
 *
 * The current page is flagged by `aria-current="page"`; the previous and next
 * buttons carry a visually hidden label, the chevron alone says nothing to
 * screen readers.
 *
 * @example
 * <Pagination page={page} pageCount={42} onPageChange={setPage} />
 */
export function Pagination({
  page,
  pageCount,
  onPageChange,
  siblingCount = 1,
  label = 'Pagination',
  className,
}: PaginationProps): ReactElement {
  const entries = pageWindow(page, pageCount, siblingCount)

  return (
    <nav aria-label={label} className={className}>
      <ul className="o-flex o-items-center o-gap-1 o-list-none o-m-0 o-p-0">
        <li>
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
            className={cx(
              BUTTON_CLASSES,
              page <= 1
                ? 'o-text-zinc-400 dark:o-text-zinc-500 o-opacity-50 o-cursor-not-allowed'
                : 'o-text-zinc-900 dark:o-text-zinc-50 o-cursor-pointer hover:o-bg-zinc-50 dark:hover:o-bg-zinc-800',
            )}
          >
            <Chevron direction="left" />
            <span className="o-sr-only">Previous page</span>
          </button>
        </li>

        {entries.map((entry) =>
          typeof entry === 'number' ? (
            <li key={entry}>
              <button
                type="button"
                aria-current={entry === page ? 'page' : undefined}
                onClick={() => onPageChange(entry)}
                className={cx(
                  BUTTON_CLASSES,
                  'o-cursor-pointer o-tabular-nums',
                  entry === page
                    ? 'o-bg-brand-600 dark:o-bg-brand-400 o-text-white dark:o-text-zinc-950'
                    : 'o-text-zinc-900 dark:o-text-zinc-50 hover:o-bg-zinc-50 dark:hover:o-bg-zinc-800',
                )}
              >
                {entry}
              </button>
            </li>
          ) : (
            <li key={entry} aria-hidden="true">
              <span
                className={cx(
                  BUTTON_CLASSES,
                  'o-text-zinc-400 dark:o-text-zinc-500 o-select-none',
                )}
              >
                &#8230;
              </span>
            </li>
          ),
        )}

        <li>
          <button
            type="button"
            disabled={page >= pageCount}
            onClick={() => onPageChange(page + 1)}
            className={cx(
              BUTTON_CLASSES,
              page >= pageCount
                ? 'o-text-zinc-400 dark:o-text-zinc-500 o-opacity-50 o-cursor-not-allowed'
                : 'o-text-zinc-900 dark:o-text-zinc-50 o-cursor-pointer hover:o-bg-zinc-50 dark:hover:o-bg-zinc-800',
            )}
          >
            <Chevron direction="right" />
            <span className="o-sr-only">Next page</span>
          </button>
        </li>
      </ul>
    </nav>
  )
}

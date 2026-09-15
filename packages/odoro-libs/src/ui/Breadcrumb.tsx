/**
 * Breadcrumb.
 *
 * @module
 */

import { Fragment, type ReactElement, type ReactNode } from 'react'

import { cx } from '../styles/cx.js'

/** One step of the breadcrumb. */
export interface BreadcrumbItem {
  /** Displayed label. */
  readonly label: ReactNode
  /** Destination. Without a link, the step is rendered as plain text. */
  readonly href?: string
}

/** Properties of {@link Breadcrumb}. */
export interface BreadcrumbProps {
  /** Steps, from the root to the current page. */
  items: readonly BreadcrumbItem[]
  /** Accessible label of the navigation. @defaultValue 'Breadcrumb' */
  label?: string
  /** Separator between steps. @defaultValue a chevron */
  separator?: ReactNode
  /** Additional classes for the navigation. */
  className?: string
}

/** Default separator chevron. */
function Chevron(): ReactElement {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
      className="o-shrink-0 o-text-zinc-400 dark:o-text-zinc-500"
    >
      <path
        d="M9 6l6 6-6 6"
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
 * Semantic breadcrumb.
 *
 * The last step represents the current page: it carries `aria-current="page"`
 * and is never a link. Separators are out of the accessible flow, the
 * `ol`/`li` structure is enough for screen readers.
 *
 * @example
 * <Breadcrumb
 *   items={[
 *     { label: 'Home', href: '/' },
 *     { label: 'Projects', href: '/projects' },
 *     { label: 'OdoroKit' },
 *   ]}
 * />
 */
export function Breadcrumb({
  items,
  label = 'Breadcrumb',
  separator,
  className,
}: BreadcrumbProps): ReactElement {
  return (
    <nav aria-label={label} className={className}>
      <ol className="o-flex o-flex-wrap o-items-center o-gap-2 o-list-none o-m-0 o-p-0 o-text-sm">
        {items.map((item, index) => {
          const isLast = index === items.length - 1
          return (
            // A step has no identifier: its position is enough.
            <Fragment key={index}>
              {index === 0 ? null : (
                <li aria-hidden="true" className="o-flex o-items-center">
                  {separator ?? <Chevron />}
                </li>
              )}
              <li className="o-flex o-items-center">
                {isLast ? (
                  <span
                    aria-current="page"
                    className="o-text-zinc-900 dark:o-text-zinc-50 o-font-medium"
                  >
                    {item.label}
                  </span>
                ) : item.href === undefined ? (
                  <span className="o-text-zinc-500 dark:o-text-zinc-400">
                    {item.label}
                  </span>
                ) : (
                  <a
                    href={item.href}
                    className={cx(
                      'o-text-zinc-500 dark:o-text-zinc-400 hover:o-text-zinc-900 dark:hover:o-text-zinc-50',
                      'o-transition',
                    )}
                  >
                    {item.label}
                  </a>
                )}
              </li>
            </Fragment>
          )
        })}
      </ol>
    </nav>
  )
}

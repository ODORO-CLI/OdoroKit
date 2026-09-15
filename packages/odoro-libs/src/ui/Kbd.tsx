/**
 * Keyboard key.
 *
 * @module
 */

import { Fragment, type HTMLAttributes, type ReactElement, type ReactNode } from 'react'

import { cx } from '../styles/cx.js'

/** Styling of a standalone key. */
const KEY_CLASSES = cx(
  'o-inline-flex o-items-center o-justify-center',
  'o-text-xs o-font-mono o-text-zinc-900 dark:o-text-zinc-50',
  'o-bg-zinc-100 dark:o-bg-zinc-950 o-border-w-1 o-border-zinc-200 dark:o-border-zinc-800 o-rounded-sm o-shadow-2xs',
  'o-px-1.5 o-py-0.5 o-select-none',
)

/** Properties of {@link Kbd}. */
export interface KbdProps extends Omit<HTMLAttributes<HTMLElement>, 'className'> {
  /**
   * Combination: each key is rendered in its own `<kbd>`, separated by a
   * "+". Without it, `children` fills a single `<kbd>`.
   */
  keys?: readonly string[]
  /** Key content when `keys` is not provided. */
  children?: ReactNode
  /** Additional classes. */
  className?: string
}

/**
 * Keyboard key, alone or as a combination.
 *
 * @example
 * <Kbd>Esc</Kbd>
 * <Kbd keys={['Ctrl', 'K']} />
 */
export function Kbd({ keys, children, className, ...rest }: KbdProps): ReactElement {
  if (keys === undefined) {
    return (
      <kbd {...rest} className={cx(KEY_CLASSES, className)}>
        {children}
      </kbd>
    )
  }

  return (
    // The container stays a `<kbd>`: this is the nesting HTML provides to
    // represent a combination of keys.
    <kbd {...rest} className={cx('o-inline-flex o-items-center o-gap-1', className)}>
      {keys.map((key, index) => (
        <Fragment key={`${key}-${index}`}>
          {index > 0 ? (
            <span
              aria-hidden="true"
              className="o-text-xs o-text-zinc-400 dark:o-text-zinc-500"
            >
              +
            </span>
          ) : null}
          <kbd className={KEY_CLASSES}>{key}</kbd>
        </Fragment>
      ))}
    </kbd>
  )
}

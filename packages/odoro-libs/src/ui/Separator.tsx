/**
 * Separator rule.
 *
 * @module
 */

import { type HTMLAttributes, type ReactElement, type ReactNode } from 'react'

import { cx } from '../styles/cx.js'

/** Properties of {@link Separator}. */
export interface SeparatorProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'className'
> {
  /** Direction of the rule. @defaultValue 'horizontal' */
  orientation?: 'horizontal' | 'vertical'
  /**
   * Label centered between two rules. Horizontal only: a label on a vertical
   * rule has no reasonable layout.
   */
  label?: ReactNode
  /**
   * A decorative separator is removed from the accessibility tree
   * (`aria-hidden`); otherwise it carries `role="separator"` and its orientation.
   *
   * @defaultValue true
   */
  decorative?: boolean
  /** Additional classes. */
  className?: string
}

/**
 * Horizontal or vertical rule, with an optional label.
 *
 * @example
 * <Separator label="or" />
 */
export function Separator({
  orientation = 'horizontal',
  label,
  decorative = true,
  className,
  ...rest
}: SeparatorProps): ReactElement {
  // ARIA treats a horizontal separator as the implicit orientation;
  // only the vertical one has to be declared.
  const aria = decorative
    ? ({ 'aria-hidden': true } as const)
    : ({
        role: 'separator',
        'aria-orientation':
          orientation === 'vertical' ? ('vertical' as const) : undefined,
      } as const)

  if (orientation === 'vertical') {
    return (
      <div
        {...rest}
        {...aria}
        className={cx(
          'o-w-px o-self-stretch o-bg-zinc-200 dark:o-bg-zinc-800',
          className,
        )}
      />
    )
  }

  if (label === undefined) {
    return (
      <div
        {...rest}
        {...aria}
        className={cx('o-h-px o-w-full o-bg-zinc-200 dark:o-bg-zinc-800', className)}
      />
    )
  }

  return (
    <div
      {...rest}
      {...aria}
      className={cx('o-flex o-items-center o-gap-3 o-w-full', className)}
    >
      <span className="o-h-px o-flex-1 o-bg-zinc-200 dark:o-bg-zinc-800" />
      <span className="o-text-sm o-text-zinc-500 dark:o-text-zinc-400 o-shrink-0">
        {label}
      </span>
      <span className="o-h-px o-flex-1 o-bg-zinc-200 dark:o-bg-zinc-800" />
    </div>
  )
}

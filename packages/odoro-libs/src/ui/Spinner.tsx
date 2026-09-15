/**
 * Circular activity indicator.
 *
 * @module
 */

import { type HTMLAttributes, type ReactElement } from 'react'

import { cx } from '../styles/cx.js'

/** Diameter in pixels per size. */
const SIZE_PX: Readonly<Record<'sm' | 'md' | 'lg', number>> = {
  sm: 16,
  md: 24,
  lg: 32,
}

/** Properties of {@link Spinner}. */
export interface SpinnerProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'className'> {
  /** Size. @defaultValue 'md' */
  size?: 'sm' | 'md' | 'lg'
  /**
   * Label announced to screen readers, visually hidden.
   *
   * @defaultValue 'Loading'
   */
  label?: string
  /** Additional classes. */
  className?: string
}

/**
 * Activity indicator.
 *
 * The drawing inherits `currentColor`: applying a text color class on the
 * component is enough to tint it. The state is carried by `role="status"`
 * and a hidden label, the SVG staying decorative.
 *
 * @example
 * <Spinner size="lg" label="Loading projects" className="o-text-brand-600 dark:o-text-brand-400" />
 */
export function Spinner({
  size = 'md',
  label = 'Loading',
  className,
  ...rest
}: SpinnerProps): ReactElement {
  const px = SIZE_PX[size]

  return (
    <span {...rest} role="status" className={cx('o-inline-flex', className)}>
      <svg
        className="o-animate-spin o-shrink-0"
        width={px}
        height={px}
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
        focusable="false"
      >
        <circle
          cx="12"
          cy="12"
          r="9"
          stroke="currentColor"
          strokeWidth="2.5"
          opacity="0.25"
        />
        <path
          d="M21 12a9 9 0 0 0-9-9"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      </svg>
      <span className="o-sr-only">{label}</span>
    </span>
  )
}

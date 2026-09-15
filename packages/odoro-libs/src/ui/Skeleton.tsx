/**
 * Loading skeleton.
 *
 * @module
 */

import { type CSSProperties, type HTMLAttributes, type ReactElement } from 'react'

import { cx } from '../styles/cx.js'

/** Properties of {@link Skeleton}. */
export interface SkeletonProps extends Omit<HTMLAttributes<HTMLDivElement>, 'className'> {
  /** Shape of the skeleton. @defaultValue 'text' */
  variant?: 'text' | 'circle' | 'rect'
  /** Width, in any CSS unit (number: pixels). */
  width?: string | number
  /** Height, in any CSS unit (number: pixels). */
  height?: string | number
  /**
   * Number of lines for the `text` variant; the last one is shortened to
   * 60% to evoke the end of a paragraph.
   *
   * @defaultValue 1
   */
  lines?: number
  /** Additional classes. */
  className?: string
}

/**
 * Animated skeleton displayed during a load.
 *
 * Always `aria-hidden`: it carries no information — it is up to the
 * container to announce the load (`aria-busy`, `role="status"`...).
 *
 * @example
 * <Skeleton variant="text" lines={3} />
 * <Skeleton variant="circle" width={40} height={40} />
 */
export function Skeleton({
  variant = 'text',
  width,
  height,
  lines = 1,
  className,
  style,
  ...rest
}: SkeletonProps): ReactElement {
  const shimmer = cx(
    'o-animate-shimmer o-bg-zinc-100 dark:o-bg-zinc-950',
    variant === 'circle' ? 'o-rounded-full' : 'o-rounded-md',
  )

  const dimensions: CSSProperties = { width, height, ...style }

  if (variant === 'text' && lines > 1) {
    return (
      <div
        {...rest}
        aria-hidden="true"
        className={cx('o-flex o-flex-col o-gap-2', className)}
        style={dimensions}
      >
        {Array.from({ length: lines }, (_, index) => (
          <span
            key={index}
            className={cx(shimmer, 'o-h-4 o-w-full')}
            style={index === lines - 1 ? { width: '60%' } : undefined}
          />
        ))}
      </div>
    )
  }

  return (
    <div
      {...rest}
      aria-hidden="true"
      className={cx(shimmer, variant === 'text' && 'o-h-4', className)}
      style={dimensions}
    />
  )
}

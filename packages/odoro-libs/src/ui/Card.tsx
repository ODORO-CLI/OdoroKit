/**
 * Content card.
 *
 * @module
 */

import { type HTMLAttributes, type ReactElement, type ReactNode, type Ref } from 'react'

import { cx, variants } from '../styles/cx.js'

/**
 * Card classes, exposed to style another container (an `<a>`, an
 * `<article>`) without duplicating the variant table.
 *
 * @example
 * <a href="/projects/1" className={cardClasses({ variant: 'elevated' })}>...</a>
 */
export const cardClasses = variants({
  // `o-overflow-hidden` guarantees that a full-width media hugs the rounded
  // corners instead of overflowing them. The background is carried by each
  // variant: two competing background classes would be settled by the order of
  // the stylesheet, not by the order they are written in.
  base: 'o-flex o-flex-col o-rounded-md o-overflow-hidden',
  variants: {
    variant: {
      outlined:
        'o-bg-white dark:o-bg-zinc-900 o-border-w-1 o-border-zinc-200 dark:o-border-zinc-800',
      elevated: 'o-bg-white dark:o-bg-zinc-900 o-shadow-md',
      ghost: 'o-bg-zinc-50 dark:o-bg-zinc-900',
    },
    interactive: {
      true: 'hover:o-lift-sm o-transition-transform hover:o-shadow-md o-cursor-pointer',
      false: '',
    },
  },
  defaults: { variant: 'outlined', interactive: 'false' },
})

/** Inner spacings available for the card body. */
const PADDING_CLASSES: Readonly<Record<'none' | 'sm' | 'md' | 'lg', string>> = {
  none: '',
  sm: 'o-p-3',
  md: 'o-p-4',
  lg: 'o-p-6',
}

/** Properties of {@link Card}. */
export interface CardProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'className' | 'title'
> {
  /** Title displayed at the top of the body. */
  title?: ReactNode
  /** Subtitle displayed under the title. */
  description?: ReactNode
  /**
   * Media rendered full width above the body, outside of any padding
   * (image, video, illustration).
   */
  media?: ReactNode
  /** Footer area, under the content. */
  footer?: ReactNode
  /** Main content. */
  children?: ReactNode
  /** Visual register. @defaultValue 'outlined' */
  variant?: 'outlined' | 'elevated' | 'ghost'
  /** Reacts to hover (elevation and cursor). @defaultValue false */
  interactive?: boolean
  /** Inner spacing of the body and the footer. @defaultValue 'md' */
  padding?: 'none' | 'sm' | 'md' | 'lg'
  /** Additional classes. */
  className?: string
  /** Ref to the native element. */
  ref?: Ref<HTMLDivElement>
}

/**
 * Composable card: optional media, title, description, content and footer.
 *
 * @example
 * <Card
 *   variant="elevated"
 *   title="Odoro project"
 *   description="In-house front-end library."
 *   footer={<Button size="sm">Open</Button>}
 * >
 *   <p>Three modules delivered this week.</p>
 * </Card>
 */
export function Card({
  title,
  description,
  media,
  footer,
  children,
  variant = 'outlined',
  interactive = false,
  padding = 'md',
  className,
  ref,
  ...rest
}: CardProps): ReactElement {
  const hasHeader = title !== undefined || description !== undefined
  const hasBody = hasHeader || children !== undefined

  return (
    <div
      {...rest}
      ref={ref}
      className={cx(
        cardClasses({ variant, interactive: interactive ? 'true' : 'false' }),
        className,
      )}
    >
      {media === undefined ? null : (
        <div className="o-w-full o-overflow-hidden">{media}</div>
      )}

      {hasBody ? (
        <div
          className={cx('o-flex o-flex-col o-gap-2 o-flex-1', PADDING_CLASSES[padding])}
        >
          {hasHeader ? (
            <div className="o-flex o-flex-col o-gap-1">
              {title === undefined ? null : (
                <h3 className="o-text-base o-font-semibold o-text-zinc-900 dark:o-text-zinc-50">
                  {title}
                </h3>
              )}
              {description === undefined ? null : (
                <p className="o-text-sm o-text-zinc-500 dark:o-text-zinc-400">
                  {description}
                </p>
              )}
            </div>
          ) : null}
          {children}
        </div>
      ) : null}

      {footer === undefined ? null : (
        <div
          className={cx(
            'o-border-t o-border-zinc-200 dark:o-border-zinc-800',
            PADDING_CLASSES[padding],
          )}
        >
          {footer}
        </div>
      )}
    </div>
  )
}

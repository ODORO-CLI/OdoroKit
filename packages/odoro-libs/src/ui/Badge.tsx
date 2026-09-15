/**
 * Text pill.
 *
 * @module
 */

import { type HTMLAttributes, type ReactElement, type ReactNode } from 'react'

import { type ClassValue, cx } from '../styles/cx.js'

/** Color register of a pill. */
export type BadgeTone =
  'neutral' | 'primary' | 'accent' | 'success' | 'warning' | 'danger' | 'info'

/** Rendering of a pill. */
export type BadgeVariant = 'soft' | 'solid' | 'outline'

/** Size of a pill. */
export type BadgeSize = 'sm' | 'md'

/**
 * Colors per rendering then per register. The `neutral` tone has no dedicated
 * semantic color: it relies on the surface and text grays.
 */
const TONE_CLASSES: Readonly<Record<BadgeVariant, Readonly<Record<BadgeTone, string>>>> =
  {
    soft: {
      neutral: 'o-bg-zinc-100 dark:o-bg-zinc-950 o-text-zinc-900 dark:o-text-zinc-50',
      primary: 'o-bg-brand-50 dark:o-bg-brand-950 o-text-brand-600 dark:o-text-brand-400',
      accent:
        'o-bg-fuchsia-50 dark:o-bg-fuchsia-950 o-text-fuchsia-600 dark:o-text-fuchsia-400',
      success:
        'o-bg-emerald-50 dark:o-bg-emerald-950 o-text-emerald-600 dark:o-text-emerald-400',
      warning: 'o-bg-amber-50 dark:o-bg-amber-950 o-text-amber-600 dark:o-text-amber-400',
      danger: 'o-bg-red-50 dark:o-bg-red-950 o-text-red-600 dark:o-text-red-400',
      info: 'o-bg-sky-50 dark:o-bg-sky-950 o-text-sky-600 dark:o-text-sky-400',
    },
    solid: {
      neutral: 'o-bg-zinc-900 dark:o-bg-zinc-50 o-text-white dark:o-text-zinc-950',
      primary: 'o-bg-brand-600 dark:o-bg-brand-400 o-text-white dark:o-text-zinc-950',
      accent: 'o-bg-fuchsia-600 dark:o-bg-fuchsia-400 o-text-white dark:o-text-zinc-950',
      success: 'o-bg-emerald-600 dark:o-bg-emerald-400 o-text-white dark:o-text-zinc-950',
      warning:
        'o-bg-amber-600 dark:o-bg-amber-400 o-text-amber-950 dark:o-text-amber-950',
      danger: 'o-bg-red-600 dark:o-bg-red-400 o-text-white dark:o-text-zinc-950',
      info: 'o-bg-sky-600 dark:o-bg-sky-400 o-text-white dark:o-text-zinc-950',
    },
    outline: {
      neutral:
        'o-border-w-1 o-border-zinc-200 dark:o-border-zinc-800 o-text-zinc-900 dark:o-text-zinc-50',
      primary:
        'o-border-w-1 o-border-brand-200 dark:o-border-brand-800 o-text-brand-600 dark:o-text-brand-400',
      accent:
        'o-border-w-1 o-border-fuchsia-600 dark:o-border-fuchsia-400 o-text-fuchsia-600 dark:o-text-fuchsia-400',
      success:
        'o-border-w-1 o-border-emerald-200 dark:o-border-emerald-800 o-text-emerald-600 dark:o-text-emerald-400',
      warning:
        'o-border-w-1 o-border-amber-200 dark:o-border-amber-800 o-text-amber-600 dark:o-text-amber-400',
      danger:
        'o-border-w-1 o-border-red-200 dark:o-border-red-800 o-text-red-600 dark:o-text-red-400',
      info: 'o-border-w-1 o-border-sky-200 dark:o-border-sky-800 o-text-sky-600 dark:o-text-sky-400',
    },
  }

const SIZE_CLASSES: Readonly<Record<BadgeSize, string>> = {
  sm: 'o-h-5 o-px-2 o-text-xs',
  md: 'o-h-6 o-px-2 o-text-sm',
}

const BASE_CLASSES = cx(
  'o-inline-flex o-items-center o-gap-1',
  'o-rounded-full o-font-medium o-whitespace-nowrap o-select-none',
)

/** Options of {@link badgeClasses}. */
export interface BadgeClassesOptions {
  /** Color register. @defaultValue 'neutral' */
  tone?: BadgeTone
  /** Rendering. @defaultValue 'soft' */
  variant?: BadgeVariant
  /** Size. @defaultValue 'sm' */
  size?: BadgeSize
  /** Additional classes. */
  className?: ClassValue
}

/**
 * Pill classes, exposed to style another inline element.
 *
 * A dedicated function rather than a `variants()` table: the color depends on
 * the tone x rendering pair, a combination the helper cannot express.
 *
 * @example
 * <span className={badgeClasses({ tone: 'success', variant: 'solid' })}>Active</span>
 */
export function badgeClasses({
  tone = 'neutral',
  variant = 'soft',
  size = 'sm',
  className,
}: BadgeClassesOptions = {}): string {
  return cx(BASE_CLASSES, TONE_CLASSES[variant][tone], SIZE_CLASSES[size], className)
}

/** Properties of {@link Badge}. */
export interface BadgeProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'className'> {
  /** Color register. @defaultValue 'neutral' */
  tone?: BadgeTone
  /**
   * Rendering: `soft` puts the tone text on its muted background, `solid` the
   * full color, `outline` a plain hairline border.
   *
   * @defaultValue 'soft'
   */
  variant?: BadgeVariant
  /** Size. @defaultValue 'sm' */
  size?: BadgeSize
  /**
   * Colored dot in front of the label. It inherits the text color
   * (`currentColor`) and therefore stays matched whatever the rendering.
   *
   * @defaultValue false
   */
  dot?: boolean
  /** Label. */
  children?: ReactNode
  /** Additional classes. */
  className?: string
}

/**
 * Status or labelling pill.
 *
 * Purely visual: if the pill is the only carrier of a piece of state
 * information, the caller must back it with an accessible text.
 *
 * @example
 * <Badge tone="success" dot>Published</Badge>
 */
export function Badge({
  tone = 'neutral',
  variant = 'soft',
  size = 'sm',
  dot = false,
  children,
  className,
  ...rest
}: BadgeProps): ReactElement {
  return (
    <span {...rest} className={badgeClasses({ tone, variant, size, className })}>
      {dot ? (
        <span
          aria-hidden="true"
          className="o-h-1.5 o-w-1.5 o-rounded-full o-bg-current o-shrink-0"
        />
      ) : null}
      {children}
    </span>
  )
}

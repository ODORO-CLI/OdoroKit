/**
 * Avatar with an initials fallback, and an overlapping group.
 *
 * @module
 */

import {
  Children,
  type CSSProperties,
  type HTMLAttributes,
  type ReactElement,
  type ReactNode,
  type Ref,
  useEffect,
  useState,
} from 'react'

import { cx } from '../styles/cx.js'

/** Size of an avatar. */
export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

/** Templates: dimensions and body text of the initials. */
const SIZE_CLASSES: Readonly<Record<AvatarSize, string>> = {
  xs: 'o-h-6 o-w-6 o-text-xs',
  sm: 'o-h-8 o-w-8 o-text-xs',
  md: 'o-h-10 o-w-10 o-text-sm',
  lg: 'o-h-12 o-w-12 o-text-base',
  xl: 'o-h-16 o-w-16 o-text-lg',
}

/**
 * Fallback initials: first letter of the first two words of the name.
 *
 * @example
 * initialsOf('Jean Dupont') // 'JD'
 */
function initialsOf(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word.charAt(0))
    .join('')
    .toUpperCase()
}

/** Properties of {@link Avatar}. */
export interface AvatarProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'className'> {
  /** Address of the image. Without it, the initials are displayed right away. */
  src?: string
  /** Alternative text of the image, reused as the label of the fallback. */
  alt: string
  /** Name the fallback initials are taken from. */
  name?: string
  /** Size. @defaultValue 'md' */
  size?: AvatarSize
  /** Shape. @defaultValue 'circle' */
  shape?: 'circle' | 'square'
  /** Additional classes. */
  className?: string
  /** Ref to the container element. */
  ref?: Ref<HTMLSpanElement>
}

/**
 * Avatar: the image if it loads, the initials otherwise.
 *
 * A load failure falls back to the initials without leaving the broken image
 * icon of the browser. The fallback carries `role="img"` and the `alt` label,
 * so that it stays announced as the image it replaces.
 *
 * @example
 * <Avatar src={user.photoUrl} alt="Photo of Jean Dupont" name="Jean Dupont" />
 */
export function Avatar({
  src,
  alt,
  name,
  size = 'md',
  shape = 'circle',
  className,
  ref,
  ...rest
}: AvatarProps): ReactElement {
  const [failed, setFailed] = useState(false)

  // A new address starts over from scratch: the failure of the previous one
  // does not concern it.
  useEffect(() => {
    setFailed(false)
  }, [src])

  const showImage = src !== undefined && !failed
  const initials = name === undefined ? '' : initialsOf(name)

  return (
    <span
      {...rest}
      ref={ref}
      className={cx(
        'o-inline-flex o-items-center o-justify-center o-shrink-0 o-select-none',
        'o-overflow-hidden o-bg-brand-50 dark:o-bg-brand-950 o-text-brand-600 dark:o-text-brand-400 o-font-medium',
        SIZE_CLASSES[size],
        shape === 'circle' ? 'o-rounded-full' : 'o-rounded-md',
        className,
      )}
      role={showImage ? undefined : 'img'}
      aria-label={showImage ? undefined : alt}
    >
      {showImage ? (
        <img
          src={src}
          alt={alt}
          className="o-h-full o-w-full o-object-cover"
          onError={() => setFailed(true)}
        />
      ) : (
        // `aria-hidden`: the label is already carried by the container, the
        // initials are only a drawing.
        <span aria-hidden="true">{initials}</span>
      )}
    </span>
  )
}

/** Properties of {@link AvatarGroup}. */
export interface AvatarGroupProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'className'
> {
  /** Avatars to overlap, from the foreground towards the back. */
  children?: ReactNode
  /**
   * Maximum number of displayed avatars. Beyond that, a "+N" pill of the same
   * template sums up the rest.
   */
  max?: number
  /** Template of the "+N" pill, to align with the avatars one. @defaultValue 'md' */
  size?: AvatarSize
  /** Additional classes. */
  className?: string
}

/**
 * Row of overlapping avatars.
 *
 * The overlap goes through a negative `marginInlineStart` in an inline style:
 * the utility stylesheet does not provide negative margins.
 *
 * @example
 * <AvatarGroup max={3}>
 *   <Avatar alt="Ana" name="Ana Ruiz" />
 *   <Avatar alt="Bob" name="Bob Marchand" />
 *   <Avatar alt="Chloe" name="Chloe Petit" />
 *   <Avatar alt="Dan" name="Dan Morel" />
 * </AvatarGroup>
 */
export function AvatarGroup({
  children,
  max,
  size = 'md',
  className,
  ...rest
}: AvatarGroupProps): ReactElement {
  const items = Children.toArray(children)
  const limit = max === undefined ? items.length : Math.max(0, max)
  const visible = items.slice(0, limit)
  const hidden = items.length - visible.length

  const overlap: CSSProperties = { marginInlineStart: '-0.5rem' }

  return (
    <div {...rest} className={cx('o-flex o-items-center', className)}>
      {visible.map((item, index) => (
        // The surface hairline detaches each avatar from the one it covers.
        <span
          key={index}
          className="o-inline-flex o-rounded-full o-border-w-2 o-border-white dark:o-border-zinc-900"
          style={index === 0 ? undefined : overlap}
        >
          {item}
        </span>
      ))}
      {hidden > 0 ? (
        <span
          className={cx(
            'o-inline-flex o-items-center o-justify-center o-shrink-0 o-select-none',
            'o-rounded-full o-border-w-2 o-border-white dark:o-border-zinc-900',
            'o-bg-zinc-100 dark:o-bg-zinc-950 o-text-zinc-500 dark:o-text-zinc-400 o-font-medium',
            SIZE_CLASSES[size],
          )}
          style={visible.length === 0 ? undefined : overlap}
        >
          +{hidden}
        </span>
      ) : null}
    </div>
  )
}

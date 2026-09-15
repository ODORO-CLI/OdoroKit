/**
 * Button.
 *
 * @module
 */

import {
  type ButtonHTMLAttributes,
  type MouseEvent,
  type ReactElement,
  type ReactNode,
  type Ref,
  useCallback,
} from 'react'

import { useAnimate } from '../motion/useAnimate.js'
import { cx, variants } from '../styles/cx.js'

/**
 * Button classes, exposed to style an `<a>` or a `<Link>` identically without
 * duplicating the variant table.
 *
 * @example
 * <Link to="/docs" className={buttonClasses({ tone: 'secondary' })}>Docs</Link>
 */
export const buttonClasses = variants({
  base: cx(
    'o-inline-flex o-items-center o-justify-center o-gap-2',
    'o-rounded-md o-font-medium o-select-none o-transition',
  ),
  variants: {
    tone: {
      primary:
        'o-bg-brand-600 dark:o-bg-brand-400 o-text-white dark:o-text-zinc-950 hover:o-bg-brand-700 dark:hover:o-bg-brand-300 active:o-bg-brand-800 dark:active:o-bg-brand-200',
      secondary:
        'o-bg-zinc-100 dark:o-bg-zinc-950 o-text-zinc-900 dark:o-text-zinc-50 o-border-w-1 o-border-zinc-200 dark:o-border-zinc-800 hover:o-bg-zinc-50 dark:hover:o-bg-zinc-800',
      ghost:
        'o-text-zinc-900 dark:o-text-zinc-50 hover:o-bg-zinc-50 dark:hover:o-bg-zinc-800',
      danger:
        'o-bg-red-600 dark:o-bg-red-400 o-text-white dark:o-text-zinc-950 hover:o-bg-red-700 dark:hover:o-bg-red-300',
    },
    size: {
      sm: 'o-h-8 o-px-3 o-text-sm',
      md: 'o-h-10 o-px-4 o-text-base',
      lg: 'o-h-12 o-px-5 o-text-lg',
    },
    block: {
      true: 'o-w-full',
      false: '',
    },
  },
  defaults: { tone: 'primary', size: 'md', block: 'false' },
})

/** Properties of {@link Button}. */
export interface ButtonProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'className'
> {
  /** Visual register. @defaultValue 'primary' */
  tone?: 'primary' | 'secondary' | 'ghost' | 'danger'
  /** Size. @defaultValue 'md' */
  size?: 'sm' | 'md' | 'lg'
  /** Takes up the whole available width. @defaultValue false */
  block?: boolean
  /**
   * Shows a loading indicator and neutralizes the button. The label stays in
   * place: its disappearance would make the layout jump and would deprive
   * screen readers of the context.
   */
  loading?: boolean
  /** Decorative element placed before the label. */
  startSlot?: ReactNode
  /** Decorative element placed after the label. */
  endSlot?: ReactNode
  /** Additional classes. */
  className?: string
  /** Ref to the native element. */
  ref?: Ref<HTMLButtonElement>
  /**
   * Plays a brief press on activation.
   *
   * Neutralized under `prefers-reduced-motion`.
   *
   * @defaultValue true
   */
  press?: boolean
}

/** Loading indicator. Purely decorative: the state is carried by ARIA. */
function Spinner(): ReactElement {
  return (
    <svg
      className="o-animate-spin o-shrink-0"
      width="1em"
      height="1em"
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
  )
}

/**
 * Action button.
 *
 * The label stays visible during the loading; the state is announced by
 * `aria-busy` and the activation is blocked by `aria-disabled` rather than by
 * `disabled`, which keeps the button focusable and therefore announceable.
 *
 * @example
 * <Button tone="danger" size="sm" loading={pending} onClick={remove}>
 *   Delete
 * </Button>
 */
export function Button({
  tone = 'primary',
  size = 'md',
  block = false,
  loading = false,
  startSlot,
  endSlot,
  className,
  children,
  disabled = false,
  press = true,
  onClick,
  ref,
  ...rest
}: ButtonProps): ReactElement {
  const [animationRef, controls] = useAnimate<HTMLButtonElement>()
  const inert = disabled || loading

  const handleClick = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      if (inert) {
        event.preventDefault()
        return
      }
      if (press) {
        void controls.play(
          [
            { transform: 'scale(1)' },
            { transform: 'scale(0.97)' },
            { transform: 'scale(1)' },
          ],
          { duration: 'faster', easing: 'emphasized' },
        )
      }
      onClick?.(event)
    },
    [controls, inert, onClick, press],
  )

  return (
    <button
      {...rest}
      ref={(node) => {
        animationRef.current = node
        if (typeof ref === 'function') ref(node)
        else if (ref) ref.current = node
      }}
      type={rest.type ?? 'button'}
      className={cx(
        buttonClasses({ tone, size, block: block ? 'true' : 'false' }),
        inert && 'o-opacity-50 o-cursor-not-allowed',
        !inert && 'o-cursor-pointer',
        className,
      )}
      aria-disabled={inert || undefined}
      aria-busy={loading || undefined}
      onClick={handleClick}
    >
      {loading ? <Spinner /> : startSlot}
      {children}
      {endSlot}
    </button>
  )
}

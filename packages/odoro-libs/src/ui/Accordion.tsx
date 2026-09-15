/**
 * Accordion with collapsible sections.
 *
 * Follows the APG pattern: each header is a `<button>` inside an `<h3>`
 * title, tied to its region by `aria-controls` and `aria-expanded`. The
 * opening is animated in height from the measured value — `height: auto` is
 * not animatable, it has to go through `scrollHeight` as the indicator of
 * `Tabs` does.
 *
 * @module
 */

import {
  type ReactElement,
  type ReactNode,
  useCallback,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from 'react'

import { motionDuration, motionEasing } from '../motion/tokens.js'
import { usePrefersReducedMotion } from '../shared/motionPreference.js'
import { cx } from '../styles/cx.js'

/** One section of the accordion. */
export interface AccordionItem {
  /** Unique identifier of the section. */
  readonly id: string
  /** Title displayed in the clickable header. */
  readonly title: ReactNode
  /** Content of the unfolded region. */
  readonly content: ReactNode
  /** Makes the section impossible to activate. */
  readonly disabled?: boolean
}

/** Properties of {@link Accordion}. */
export interface AccordionProps {
  /** Sections, in display order. */
  items: readonly AccordionItem[]
  /**
   * `'single'` only allows one open section at a time; `'multiple'` leaves
   * every section independent.
   *
   * @defaultValue 'single'
   */
  type?: 'single' | 'multiple'
  /** Sections open initially, in uncontrolled mode. */
  defaultValue?: string | readonly string[]
  /**
   * Open sections in controlled mode. Always expressed as an array of
   * identifiers, even in `single` mode, so that the type does not depend on
   * the mode.
   */
  value?: string | readonly string[]
  /** Called on every change, with the list of open sections. */
  onValueChange?: (value: readonly string[]) => void
  /**
   * In `single` mode, allows the open section to be closed again so that
   * everything is shut.
   *
   * @defaultValue true
   */
  collapsible?: boolean
  /** Additional classes for the container. */
  className?: string
}

/** Normalizes a single or multiple value into an array of identifiers. */
function toIds(value: string | readonly string[] | undefined): readonly string[] {
  if (value === undefined) return []
  return typeof value === 'string' ? [value] : value
}

/** Header chevron. Purely decorative: the state is carried by `aria-expanded`. */
function Chevron({ open }: { open: boolean }): ReactElement {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
      className={cx('o-shrink-0 o-transition-transform', open && 'o-rotate-180')}
    >
      <path
        d="M6 9l6 6 6-6"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/** Properties of {@link Region}. */
interface RegionProps {
  open: boolean
  id: string
  labelId: string
  children: ReactNode
}

/**
 * Unfoldable region of a section.
 *
 * The content stays mounted during the closing animation: the unmount only
 * happens once the height is back to zero, otherwise there would be nothing
 * left to animate.
 */
function Region({ open, id, labelId, children }: RegionProps): ReactElement | null {
  const ref = useRef<HTMLDivElement | null>(null)
  const animationRef = useRef<Animation | null>(null)
  const isFirstRun = useRef(true)
  const reduced = usePrefersReducedMotion()
  const [isMounted, setIsMounted] = useState(open)

  // The mount must precede the entrance animation, as in `usePresence`.
  useLayoutEffect(() => {
    if (open) setIsMounted(true)
  }, [open])

  useLayoutEffect(() => {
    const element = ref.current
    const first = isFirstRun.current
    isFirstRun.current = false

    if (element === null || !isMounted) return
    // The initial state is rendered as is: animating on the first render
    // would make the sections open by default flicker.
    if (first) return

    animationRef.current?.cancel()
    animationRef.current = null

    if (reduced || typeof element.animate !== 'function') {
      if (!open) setIsMounted(false)
      return
    }

    const height = `${element.scrollHeight}px`
    const animation = element.animate(
      open ? [{ height: '0px' }, { height }] : [{ height }, { height: '0px' }],
      {
        duration: motionDuration.base,
        easing: open ? motionEasing.entrance : motionEasing.exit,
        fill: 'both',
      },
    )
    animationRef.current = animation

    void animation.finished.then(
      () => {
        if (animationRef.current !== animation) return
        // The natural height takes over again: we release the animation
        // rather than letting it freeze a measured height.
        animation.cancel()
        animationRef.current = null
        if (!open) setIsMounted(false)
      },
      () => undefined,
    )
  }, [open, isMounted, reduced])

  if (!isMounted) return null

  return (
    <div
      ref={ref}
      role="region"
      id={id}
      aria-labelledby={labelId}
      className="o-overflow-hidden"
    >
      <div className="o-pb-4 o-text-sm o-text-zinc-500 dark:o-text-zinc-400">
        {children}
      </div>
    </div>
  )
}

/**
 * Accessible accordion with one or several open sections.
 *
 * @example
 * <Accordion
 *   items={[
 *     { id: 'account', title: 'Account', content: <AccountForm /> },
 *     { id: 'billing', title: 'Billing', content: <BillingForm /> },
 *   ]}
 *   defaultValue="account"
 * />
 */
export function Accordion({
  items,
  type = 'single',
  defaultValue,
  value,
  onValueChange,
  collapsible = true,
  className,
}: AccordionProps): ReactElement {
  const baseId = useId()
  const [internal, setInternal] = useState<readonly string[]>(() => toIds(defaultValue))
  const openIds = value === undefined ? internal : toIds(value)

  const toggle = useCallback(
    (id: string) => {
      const isOpen = openIds.includes(id)
      // In single non-collapsible mode, closing the only open section would
      // leave everything shut: we ignore the request.
      if (type === 'single' && isOpen && !collapsible) return

      const next: readonly string[] =
        type === 'single'
          ? isOpen
            ? []
            : [id]
          : isOpen
            ? openIds.filter((openId) => openId !== id)
            : [...openIds, id]

      if (value === undefined) setInternal(next)
      onValueChange?.(next)
    },
    [collapsible, onValueChange, openIds, type, value],
  )

  return (
    <div className={cx('o-flex o-flex-col', className)}>
      {items.map((item) => {
        const open = openIds.includes(item.id)
        const headerId = `${baseId}-header-${item.id}`
        const regionId = `${baseId}-region-${item.id}`
        return (
          <div
            key={item.id}
            className="o-border-b o-border-zinc-200 dark:o-border-zinc-800"
          >
            <h3 className="o-m-0">
              <button
                type="button"
                id={headerId}
                aria-expanded={open}
                aria-controls={regionId}
                aria-disabled={item.disabled || undefined}
                onClick={() => {
                  if (item.disabled !== true) toggle(item.id)
                }}
                className={cx(
                  'o-flex o-w-full o-items-center o-justify-between o-gap-2',
                  'o-py-3 o-text-left o-text-base o-font-medium o-text-zinc-900 dark:o-text-zinc-50 o-transition',
                  item.disabled === true
                    ? 'o-opacity-50 o-cursor-not-allowed'
                    : 'o-cursor-pointer hover:o-text-zinc-900 dark:hover:o-text-zinc-50',
                )}
              >
                {item.title}
                <Chevron open={open} />
              </button>
            </h3>
            <Region open={open} id={regionId} labelId={headerId}>
              {item.content}
            </Region>
          </div>
        )
      })}
    </div>
  )
}

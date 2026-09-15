/**
 * Tooltip on hover and on focus.
 *
 * The panel is positioned absolutely relative to an `o-relative` wrapper that
 * surrounds the trigger: no measuring and no position computation, the CSS
 * flow is enough. The placement classes (`o-translate-center-*`) live on a
 * wrapper distinct from the animated panel, because `usePresence` drives the
 * `transform` property and would crush the centering during the animation.
 *
 * @module
 */

import {
  type KeyboardEvent,
  type ReactElement,
  type ReactNode,
  cloneElement,
  isValidElement,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react'

import { usePresence } from '../motion/usePresence.js'
import { cx } from '../styles/cx.js'

/** Side the tooltip appears on. */
export type TooltipPlacement = 'top' | 'bottom' | 'left' | 'right'

/** Properties of {@link Tooltip}. */
export interface TooltipProps {
  /** Tooltip content. Short: one sentence, not a paragraph. */
  content: ReactNode
  /** Trigger element, hovered or focused. */
  children: ReactNode
  /** Side it appears on. @defaultValue 'top' */
  placement?: TooltipPlacement
  /**
   * Delay before it appears, in milliseconds. Avoids flickering when the
   * pointer merely crosses the element.
   *
   * @defaultValue 300
   */
  delay?: number
  /** Additional classes for the panel. */
  className?: string
}

/** Placement classes of the positioned wrapper, per side. */
const PLACEMENT_CLASSES: Readonly<Record<TooltipPlacement, string>> = {
  top: 'o-bottom-full o-left-1/2 o-translate-center-x o-mb-1',
  bottom: 'o-top-full o-left-1/2 o-translate-center-x o-mt-1',
  left: 'o-right-full o-top-1/2 o-translate-center-y o-mr-1',
  right: 'o-left-full o-top-1/2 o-translate-center-y o-ml-1',
}

/**
 * Accessible tooltip.
 *
 * Appears on hover as well as on keyboard focus, disappears on leave, on blur
 * and on Escape. The trigger is described by `aria-describedby` as long as
 * the tooltip is visible.
 *
 * @example
 * <Tooltip content="Copy to the clipboard">
 *   <Button tone="ghost">Copy</Button>
 * </Tooltip>
 */
export function Tooltip({
  content,
  children,
  placement = 'top',
  delay = 300,
  className,
}: TooltipProps): ReactElement {
  const tooltipId = useId()
  const [visible, setVisible] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  const { ref, isMounted } = usePresence<HTMLSpanElement>(visible, {
    enter: { opacity: 0 },
    duration: 'fast',
    initial: true,
  })

  const show = useCallback(() => {
    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => setVisible(true), delay)
  }, [delay])

  const hide = useCallback(() => {
    clearTimeout(timerRef.current)
    setVisible(false)
  }, [])

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLSpanElement>) => {
      if (event.key === 'Escape') hide()
    },
    [hide],
  )

  useEffect(() => () => clearTimeout(timerRef.current), [])

  // The trigger carries `aria-describedby` when it is a single element;
  // otherwise the description is placed on the wrapper, for want of better.
  const describedBy = isMounted ? tooltipId : undefined
  const trigger = isValidElement<{ 'aria-describedby'?: string }>(children)
    ? cloneElement(children, { 'aria-describedby': describedBy })
    : children

  return (
    <span
      className="o-relative o-inline-block"
      aria-describedby={trigger === children ? describedBy : undefined}
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
      onKeyDown={handleKeyDown}
    >
      {trigger}
      {isMounted ? (
        <span className={cx('o-absolute o-z-overlay', PLACEMENT_CLASSES[placement])}>
          <span
            ref={ref}
            role="tooltip"
            id={tooltipId}
            className={cx(
              'o-block o-bg-zinc-900 dark:o-bg-zinc-50 o-text-white dark:o-text-zinc-950 o-text-sm o-whitespace-nowrap',
              'o-rounded-md o-shadow-md o-px-2 o-py-1 o-pointer-events-none',
              className,
            )}
          >
            {content}
          </span>
        </span>
      ) : null}
    </span>
  )
}

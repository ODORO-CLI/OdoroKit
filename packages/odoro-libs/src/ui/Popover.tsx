/**
 * Rich panel anchored to a trigger.
 *
 * Unlike the tooltip, the panel is interactive: it receives the focus, closes
 * on an outside click and on Escape, and then gives the focus back to the
 * trigger. The positioning stays purely CSS, on a wrapper distinct from the
 * animated panel so that `usePresence` can drive `transform` without crushing
 * the centering.
 *
 * @module
 */

import {
  type ReactElement,
  type ReactNode,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react'

import { usePresence } from '../motion/usePresence.js'
import { cx } from '../styles/cx.js'

/** Properties of {@link Popover}. */
export interface PopoverProps {
  /** Content of the trigger button. */
  trigger: ReactNode
  /** Content of the panel. */
  children?: ReactNode
  /** Side it appears on. @defaultValue 'bottom' */
  placement?: 'top' | 'bottom'
  /** Alignment of the panel on the trigger. @defaultValue 'start' */
  align?: 'start' | 'center' | 'end'
  /** Open state in controlled mode. */
  open?: boolean
  /** Initial open state in uncontrolled mode. @defaultValue false */
  defaultOpen?: boolean
  /** Called on every request to open or to close. */
  onOpenChange?: (open: boolean) => void
  /** Additional classes for the panel. */
  className?: string
  /** Additional classes for the trigger button. */
  triggerClassName?: string
}

/** Placement classes of the positioned wrapper. */
const PLACEMENT_CLASSES: Readonly<Record<'top' | 'bottom', string>> = {
  top: 'o-bottom-full o-mb-2',
  bottom: 'o-top-full o-mt-2',
}

/** Alignment classes of the positioned wrapper. */
const ALIGN_CLASSES: Readonly<Record<'start' | 'center' | 'end', string>> = {
  start: 'o-left-0',
  center: 'o-left-1/2 o-translate-center-x',
  end: 'o-right-0',
}

/**
 * Accessible contextual panel.
 *
 * @example
 * <Popover trigger="Filters" placement="bottom" align="end">
 *   <FilterForm />
 * </Popover>
 */
export function Popover({
  trigger,
  children,
  placement = 'bottom',
  align = 'start',
  open,
  defaultOpen = false,
  onOpenChange,
  className,
  triggerClassName,
}: PopoverProps): ReactElement {
  const panelId = useId()
  const [internal, setInternal] = useState(defaultOpen)
  const isOpen = open ?? internal

  const wrapperRef = useRef<HTMLDivElement | null>(null)
  const triggerRef = useRef<HTMLButtonElement | null>(null)

  const { ref, isMounted } = usePresence<HTMLDivElement>(isOpen, {
    enter: { opacity: 0, transform: 'translateY(0.25rem) scale(0.98)' },
    duration: 'fast',
    initial: true,
  })

  const setOpen = useCallback(
    (next: boolean) => {
      if (open === undefined) setInternal(next)
      onOpenChange?.(next)
    },
    [onOpenChange, open],
  )

  const close = useCallback(
    (restoreFocus: boolean) => {
      // The focus is given back only if it is still inside the component: on
      // an outside click, it already belongs to the clicked element.
      if (restoreFocus || wrapperRef.current?.contains(document.activeElement) === true) {
        triggerRef.current?.focus()
      }
      setOpen(false)
    },
    [setOpen],
  )

  // Closing on an outside click and on Escape, wherever the focus is. The
  // listeners only live while it is open.
  useEffect(() => {
    if (!isOpen) return

    const handlePointerDown = (event: PointerEvent) => {
      if (wrapperRef.current?.contains(event.target as Node) === true) return
      close(false)
    }
    const handleKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') close(true)
    }

    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [close, isOpen])

  return (
    <div ref={wrapperRef} className="o-relative o-inline-block">
      <button
        ref={triggerRef}
        type="button"
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        aria-controls={isMounted ? panelId : undefined}
        onClick={() => setOpen(!isOpen)}
        className={cx('o-cursor-pointer', triggerClassName)}
      >
        {trigger}
      </button>
      {isMounted ? (
        <div
          className={cx(
            'o-absolute o-z-overlay',
            PLACEMENT_CLASSES[placement],
            ALIGN_CLASSES[align],
          )}
        >
          <div
            ref={ref}
            role="dialog"
            id={panelId}
            className={cx(
              'o-bg-white dark:o-bg-zinc-800 o-text-zinc-900 dark:o-text-zinc-50 o-border-w-1 o-border-zinc-200 dark:o-border-zinc-800',
              'o-rounded-lg o-shadow-lg o-p-4',
              className,
            )}
          >
            {children}
          </div>
        </div>
      ) : null}
    </div>
  )
}

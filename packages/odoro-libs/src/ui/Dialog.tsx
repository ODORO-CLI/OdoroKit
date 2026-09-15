/**
 * Modal dialog box.
 *
 * Built on the native `<dialog>` element opened in modal mode. The browser
 * then provides focus trapping, closing with Escape, the inertness of the
 * rest of the page and the top layer — four behaviors that a JavaScript
 * reimplementation almost always gets wrong in some edge case.
 *
 * The only thing the native element cannot do is delay the closing for the
 * duration of an exit animation: that is the role of `usePresence`.
 *
 * @module
 */

import {
  type HTMLAttributes,
  type MouseEvent,
  type ReactElement,
  type ReactNode,
  type SyntheticEvent,
  useCallback,
  useEffect,
  useId,
  useRef,
} from 'react'

import { usePresence } from '../motion/usePresence.js'
import { cx } from '../styles/cx.js'

/** Properties of {@link Dialog}. */
export interface DialogProps extends Omit<
  HTMLAttributes<HTMLDialogElement>,
  'className' | 'title'
> {
  /** Open state, driven by the application. */
  open: boolean
  /**
   * Called when the user asks to close: button, Escape key, or click on the
   * backdrop.
   */
  onClose: () => void
  /**
   * Title of the box. Tied to the element by `aria-labelledby`: this is what
   * screen readers announce on opening.
   */
  title: ReactNode
  /** Optional description, announced after the title. */
  description?: ReactNode
  /** Content. */
  children?: ReactNode
  /** Footer of the box, typically action buttons. */
  footer?: ReactNode
  /** Closes the box on a click on the backdrop. @defaultValue true */
  closeOnBackdrop?: boolean
  /** Additional classes applied to the `<dialog>` element. */
  className?: string
}

/**
 * Accessible modal dialog box.
 *
 * @example
 * <Dialog
 *   open={open}
 *   onClose={() => setOpen(false)}
 *   title="Delete the project"
 *   description="This action is irreversible."
 *   footer={<Button tone="danger" onClick={remove}>Delete</Button>}
 * />
 */
export function Dialog({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  closeOnBackdrop = true,
  className,
  ...rest
}: DialogProps): ReactElement | null {
  const { ref, isMounted } = usePresence<HTMLDialogElement>(open, {
    enter: { opacity: 0, transform: 'translateY(0.5rem) scale(0.98)' },
    duration: 'fast',
  })

  const titleId = useId()
  const descriptionId = useId()
  const closeRef = useRef(onClose)
  closeRef.current = onClose

  // `showModal()` can only be called once the element is in the document.
  useEffect(() => {
    const dialog = ref.current
    if (dialog === null || !isMounted) return
    if (typeof dialog.showModal !== 'function') return
    if (!dialog.open) dialog.showModal()
    return () => {
      if (dialog.open) dialog.close()
    }
  }, [ref, isMounted])

  // The Escape key fires the native `cancel` event: we intercept it to go
  // through the application state, otherwise the box would close without an
  // animation and without the application knowing about it.
  const handleCancel = useCallback((event: SyntheticEvent<HTMLDialogElement>) => {
    event.preventDefault()
    closeRef.current()
  }, [])

  const handleClick = useCallback(
    (event: MouseEvent<HTMLDialogElement>) => {
      if (!closeOnBackdrop) return
      // A click on the backdrop targets the `<dialog>` itself: the content is
      // in a child, so any click inside has another target.
      if (event.target === ref.current) closeRef.current()
    },
    [closeOnBackdrop, ref],
  )

  if (!isMounted) return null

  return (
    <dialog
      {...rest}
      ref={ref}
      aria-labelledby={titleId}
      aria-describedby={description === undefined ? undefined : descriptionId}
      onCancel={handleCancel}
      onClick={handleClick}
      className={cx(
        'o-w-full o-max-w-md o-rounded-lg o-border-w-1 o-border-zinc-200 dark:o-border-zinc-800',
        'o-bg-white dark:o-bg-zinc-800 o-text-zinc-900 dark:o-text-zinc-50 o-shadow-lg o-p-0',
        className,
      )}
    >
      <div className="o-flex o-flex-col o-gap-4 o-p-6">
        <div className="o-flex o-flex-col o-gap-1">
          <h2 id={titleId} className="o-text-lg o-font-semibold">
            {title}
          </h2>
          {description === undefined ? null : (
            <p
              id={descriptionId}
              className="o-text-sm o-text-zinc-500 dark:o-text-zinc-400"
            >
              {description}
            </p>
          )}
        </div>

        {children}

        {footer === undefined ? null : (
          <div className="o-flex o-justify-end o-gap-2">{footer}</div>
        )}
      </div>
    </dialog>
  )
}

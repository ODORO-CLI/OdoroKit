/**
 * Modal side panel.
 *
 * Same foundation as `Dialog`: the native `<dialog>` element opened in modal
 * mode provides focus trapping, closing with Escape, the inertness of the
 * rest of the page and the top layer. Only the geometry changes — the panel
 * is pinned to an edge and slides in from it.
 *
 * The native `<dialog>` centers itself by default through its automatic
 * margins: pinning to the edge goes through an inline style (`position:
 * fixed`, `inset`, `margin: 0`), the utility stylesheet having no class for
 * each combination.
 *
 * @module
 */

import {
  type CSSProperties,
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

/** Anchoring edge of the panel. */
export type DrawerSide = 'right' | 'left' | 'bottom'

/** Properties of {@link Drawer}. */
export interface DrawerProps extends Omit<
  HTMLAttributes<HTMLDialogElement>,
  'className' | 'title'
> {
  /** Open state, driven by the application. */
  open: boolean
  /**
   * Called when the user asks to close: cross, Escape key, or click on the
   * backdrop.
   */
  onClose: () => void
  /** Title of the panel, announced on opening through `aria-labelledby`. */
  title: ReactNode
  /** Optional description, announced after the title. */
  description?: ReactNode
  /** Content. */
  children?: ReactNode
  /** Footer of the panel, typically action buttons. */
  footer?: ReactNode
  /** Anchoring edge. @defaultValue 'right' */
  side?: DrawerSide
  /**
   * Maximum width for the lateral sides. No effect for `bottom`, whose
   * height follows the content.
   *
   * @defaultValue 'md'
   */
  size?: 'sm' | 'md' | 'lg'
  /** Closes the panel on a click on the backdrop. @defaultValue true */
  closeOnBackdrop?: boolean
  /** Additional classes applied to the `<dialog>` element. */
  className?: string
}

/** Offscreen start and end state, per edge. */
const OFFSCREEN: Readonly<Record<DrawerSide, { transform: string }>> = {
  right: { transform: 'translateX(100%)' },
  left: { transform: 'translateX(-100%)' },
  bottom: { transform: 'translateY(100%)' },
}

/** Pinning to the edge, per edge. `100dvh` follows the mobile address bar. */
const POSITION: Readonly<Record<DrawerSide, CSSProperties>> = {
  right: {
    position: 'fixed',
    inset: '0 0 0 auto',
    margin: 0,
    height: '100dvh',
    maxHeight: 'none',
  },
  left: {
    position: 'fixed',
    inset: '0 auto 0 0',
    margin: 0,
    height: '100dvh',
    maxHeight: 'none',
  },
  bottom: {
    position: 'fixed',
    inset: 'auto 0 0 0',
    margin: 0,
    width: '100%',
    maxWidth: 'none',
  },
}

/** Border on the page side, per edge. */
const BORDER: Readonly<Record<DrawerSide, string>> = {
  right: 'o-border-l',
  left: 'o-border-r',
  bottom: 'o-border-t',
}

/** Maximum width of the lateral panels, per size. */
const SIZE: Readonly<Record<'sm' | 'md' | 'lg', string>> = {
  sm: 'o-max-w-sm',
  md: 'o-max-w-md',
  lg: 'o-max-w-lg',
}

/**
 * Accessible modal side panel.
 *
 * @example
 * <Drawer
 *   open={open}
 *   onClose={() => setOpen(false)}
 *   title="Filters"
 *   footer={<Button onClick={apply}>Apply</Button>}
 * >
 *   <FilterForm />
 * </Drawer>
 */
export function Drawer({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  side = 'right',
  size = 'md',
  closeOnBackdrop = true,
  className,
  ...rest
}: DrawerProps): ReactElement | null {
  const { ref, isMounted } = usePresence<HTMLDialogElement>(open, {
    enter: OFFSCREEN[side],
    duration: 'base',
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
  // through the application state, otherwise the panel would close without an
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
      style={POSITION[side]}
      aria-labelledby={titleId}
      aria-describedby={description === undefined ? undefined : descriptionId}
      onCancel={handleCancel}
      onClick={handleClick}
      className={cx(
        'o-w-full o-bg-white dark:o-bg-zinc-800 o-text-zinc-900 dark:o-text-zinc-50 o-shadow-lg o-p-0',
        'o-border-zinc-200 dark:o-border-zinc-800',
        BORDER[side],
        side === 'bottom' ? null : SIZE[size],
        className,
      )}
    >
      <div className="o-relative o-flex o-flex-col o-gap-4 o-p-6 o-h-full">
        <button
          type="button"
          aria-label="Close"
          onClick={() => closeRef.current()}
          className={cx(
            'o-absolute o-top-3 o-right-3 o-cursor-pointer o-rounded-sm o-p-1',
            'o-text-zinc-500 dark:o-text-zinc-400 hover:o-text-zinc-900 dark:hover:o-text-zinc-50 o-transition',
          )}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            aria-hidden="true"
            focusable="false"
          >
            <path
              d="M6 6l12 12M18 6L6 18"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>

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

        {/* The content scrolls on its own when it overflows: the panel itself
            stays pinned along the whole height of the edge. */}
        <div className="o-flex-1 o-min-w-0 o-overflow-y-auto">{children}</div>

        {footer === undefined ? null : (
          <div className="o-flex o-justify-end o-gap-2">{footer}</div>
        )}
      </div>
    </dialog>
  )
}

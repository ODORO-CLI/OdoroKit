/**
 * Stackable notifications.
 *
 * @module
 */

import {
  type ReactElement,
  type ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'

import { usePresence } from '../motion/usePresence.js'
import { cx } from '../styles/cx.js'

/** Visual register of a notification. */
export type ToastTone = 'info' | 'success' | 'warning' | 'danger'

/** A notification waiting to be displayed or already displayed. */
export interface Toast {
  /** Unique identifier, assigned at creation. */
  readonly id: string
  /** Short title. */
  readonly title: ReactNode
  /** Optional detail. */
  readonly description?: ReactNode
  /** Visual register. @defaultValue 'info' */
  readonly tone?: ToastTone
  /**
   * Display duration in milliseconds. `0` keeps the notification until an
   * explicit dismissal.
   *
   * @defaultValue 5000
   */
  readonly duration?: number
}

/** Notification as passed to `toast()`, without an identifier. */
export type ToastInput = Omit<Toast, 'id'>

/** Interface exposed by {@link useToast}. */
export interface ToastApi {
  /**
   * Stacks a notification.
   *
   * @returns The assigned identifier, usable to dismiss it ahead of time.
   */
  toast(input: ToastInput): string
  /** Dismisses a notification. */
  dismiss(id: string): void
  /** Dismisses every notification. */
  clear(): void
  /** Notifications currently displayed, from the oldest to the most recent. */
  readonly toasts: readonly Toast[]
}

const ToastContext = createContext<ToastApi | null>(null)
ToastContext.displayName = 'OdoroToast'

/** Colors per register, as classes of the base stylesheet. */
const TONE_CLASSES: Readonly<Record<ToastTone, string>> = {
  info: 'o-bg-sky-50 dark:o-bg-sky-950 o-border-sky-200 dark:o-border-sky-800 o-text-zinc-900 dark:o-text-zinc-50',
  success:
    'o-bg-emerald-50 dark:o-bg-emerald-950 o-border-emerald-200 dark:o-border-emerald-800 o-text-zinc-900 dark:o-text-zinc-50',
  warning:
    'o-bg-amber-50 dark:o-bg-amber-950 o-border-amber-200 dark:o-border-amber-800 o-text-zinc-900 dark:o-text-zinc-50',
  danger:
    'o-bg-red-50 dark:o-bg-red-950 o-border-red-200 dark:o-border-red-800 o-text-zinc-900 dark:o-text-zinc-50',
}

/** Properties of {@link ToastProvider}. */
export interface ToastProviderProps {
  /** Application. */
  children?: ReactNode
  /**
   * Maximum number of simultaneous notifications. Beyond that, the oldest one
   * is removed: a stack without a limit ends up hiding the interface.
   *
   * @defaultValue 4
   */
  max?: number
  /** Default display duration, in milliseconds. @defaultValue 5000 */
  duration?: number
  /** Additional classes for the display region. */
  className?: string
}

let counter = 0

/**
 * Provides the notification queue and renders the region that presents them.
 *
 * The region carries `aria-live="polite"`: a notification is announced
 * without interrupting the reading in progress. Notifications in the `danger`
 * register switch to `role="alert"`, which interrupts.
 *
 * @example
 * <ToastProvider>
 *   <App />
 * </ToastProvider>
 */
export function ToastProvider({
  children,
  max = 4,
  duration = 5000,
  className,
}: ToastProviderProps): ReactElement {
  const [toasts, setToasts] = useState<readonly Toast[]>([])

  const dismiss = useCallback((id: string) => {
    setToasts((current) => current.filter((item) => item.id !== id))
  }, [])

  const clear = useCallback(() => setToasts([]), [])

  const push = useCallback(
    (input: ToastInput) => {
      counter += 1
      const id = `o-toast-${counter}`
      setToasts((current) => [...current, { duration, ...input, id }].slice(-max))
      return id
    },
    [duration, max],
  )

  const api = useMemo<ToastApi>(
    () => ({ toast: push, dismiss, clear, toasts }),
    [push, dismiss, clear, toasts],
  )

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div
        aria-live="polite"
        aria-atomic="false"
        className={cx(
          'o-fixed o-bottom-0 o-right-0 o-z-toast',
          'o-flex o-flex-col o-gap-2 o-p-4 o-w-full o-max-w-sm',
          'o-pointer-events-none',
          className,
        )}
      >
        {toasts.map((item) => (
          <ToastItem key={item.id} toast={item} onDismiss={dismiss} />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

/** Properties of {@link ToastItem}. */
interface ToastItemProps {
  toast: Toast
  onDismiss: (id: string) => void
}

/** One displayed notification, with its timer and its animation. */
function ToastItem({ toast, onDismiss }: ToastItemProps): ReactElement | null {
  const [visible, setVisible] = useState(true)
  const { ref, isMounted } = usePresence<HTMLDivElement>(visible, {
    enter: { opacity: 0, transform: 'translateY(0.75rem)' },
    duration: 'fast',
    initial: true,
  })

  const dismissRef = useRef(onDismiss)
  dismissRef.current = onDismiss

  const lifetime = toast.duration ?? 5000

  useEffect(() => {
    if (lifetime <= 0) return
    const timer = setTimeout(() => setVisible(false), lifetime)
    return () => clearTimeout(timer)
  }, [lifetime])

  // The removal from the queue only happens after the exit animation.
  useEffect(() => {
    if (isMounted) return
    dismissRef.current(toast.id)
  }, [isMounted, toast.id])

  if (!isMounted) return null

  const tone = toast.tone ?? 'info'

  return (
    <div
      ref={ref}
      role={tone === 'danger' ? 'alert' : 'status'}
      className={cx(
        'o-pointer-events-auto o-flex o-items-start o-gap-3',
        'o-rounded-md o-border-w-1 o-p-3 o-shadow-md',
        TONE_CLASSES[tone],
      )}
    >
      <div className="o-flex o-flex-col o-gap-1 o-flex-1 o-min-w-0">
        <p className="o-text-sm o-font-medium">{toast.title}</p>
        {toast.description === undefined ? null : (
          <p className="o-text-sm o-text-zinc-500 dark:o-text-zinc-400">
            {toast.description}
          </p>
        )}
      </div>
      <button
        type="button"
        onClick={() => setVisible(false)}
        aria-label="Close the notification"
        className="o-shrink-0 o-cursor-pointer o-rounded-sm o-text-zinc-500 dark:o-text-zinc-400 hover:o-text-zinc-900 dark:hover:o-text-zinc-50 o-transition"
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
    </div>
  )
}

/**
 * Accesses the notification queue.
 *
 * @throws {Error} Outside of a {@link ToastProvider}.
 *
 * @example
 * const { toast } = useToast()
 * toast({ title: 'Project saved', tone: 'success' })
 */
export function useToast(): ToastApi {
  const api = useContext(ToastContext)
  if (api === null) {
    throw new Error('[odoro/ui] useToast() must be called inside a <ToastProvider>.')
  }
  return api
}

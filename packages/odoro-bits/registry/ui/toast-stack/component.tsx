/**
 * Stack of notifications: new ones settle in front, older ones step back,
 * and hovering spreads the pack out.
 *
 * ## Three notifications at a time, not thirty
 *
 * A stack that grows without a limit ends up covering the page it comments
 * on. Beyond `max`, the oldest ones leave the pack — they stay in the list
 * the page holds, but stop taking up the screen.
 *
 * ## The offsets are measured, not guessed
 *
 * Spread out, each card settles above the previous one: the offset is
 * therefore the sum of the real heights, which depend on the text. The
 * heights are read after the render and written as variables on the elements
 * — not in React state, which would ask for a render on every measure, hence
 * a measure on every render.
 *
 * ## The countdown is an animation, and it pauses
 *
 * The life bar is a CSS animation whose duration is that of the timer.
 * Hovering or entering with the keyboard pauses both at once: a notification
 * is not lost while it is being read.
 *
 * ## A status region, not an alert
 *
 * `role="status"` is polite: the screen reader finishes its sentence before
 * announcing. `aria-atomic="false"` limits the announcement to what has just
 * arrived, otherwise the three cards would be read again on every new one.
 *
 * ## Reduced motion
 *
 * The cards appear in place and the life bar disappears; the removal after a
 * delay, however, stays — it is a behavior, not an animation.
 *
 * @module
 */

import { mergePresentation, type Customisable } from '@odoro-cli/engine'
import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactElement,
} from 'react'

/** Nature of a notification, which gives the rule its hue. */
export type ToastTone = 'info' | 'success' | 'warning' | 'error'

/** A notification. */
export interface ToastItem {
  /** Identifier, unique within the stack. */
  readonly id: string
  /** Title, read first. */
  readonly title: string
  /** Detail shown under the title. */
  readonly description?: string
  /** Nature of the notification. @defaultValue 'info' */
  readonly tone?: ToastTone
}

/** Props specific to this component. */
export interface ToastStackOwnProps {
  /** The notifications, from the oldest to the most recent. */
  toasts: readonly ToastItem[]
  /** Name of the region for screen readers. @defaultValue 'Notifications' */
  label?: string
  /** Called when a notification is removed, on its own or by hand. */
  onDismiss?: (id: string) => void
  /** Delay before removal. Zero leaves the notification until the click. @defaultValue 4000 */
  duration?: number
  /** Number of notifications visible in the pack. @defaultValue 3 */
  max?: number
  /** Side the stack is anchored to. @defaultValue 'bottom' */
  side?: 'top' | 'bottom'
}

/** All props. */
export type ToastStackProps = Customisable<ToastStackOwnProps>

/** Hue of each nature, as palette tokens. */
const TONES: Readonly<Record<ToastTone, string>> = {
  info: 'var(--o-palette-brand-500)',
  success: 'var(--o-palette-emerald-500)',
  warning: 'var(--o-palette-amber-500)',
  error: 'var(--o-palette-rose-500)',
}

/** Identifier of the injected stylesheet. */
const STYLE_ID = 'o-toast-stack'

/** Sets the stack, the cards and the life bar, once per document. */
function ensureToastRules(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-toasts]{position:relative;z-index:var(--o-z-toast);width:min(22rem,100%)}',
    '[data-o-toasts] ol{position:relative;margin:0;padding:0;list-style:none;height:0}',
    '[data-o-toast]{',
    'position:absolute;left:0;right:0;',
    'display:flex;align-items:flex-start;gap:0.6rem;overflow:hidden;',
    'padding:0.7rem 0.8rem;border-radius:0.8rem;text-align:left;',
    'background:var(--o-theme-surface);border:1px solid var(--o-theme-line);',
    'box-shadow:0 10px 30px color-mix(in oklab,currentColor 14%,transparent);',
    'transform:translateY(var(--o-toast-y)) scale(var(--o-toast-scale));',
    'opacity:var(--o-toast-opacity);',
    'transition:transform var(--o-duration-slow) var(--o-ease-emphasized),',
    'opacity var(--o-duration-slow) linear;',
    'animation:o-toast-in var(--o-duration-slow) var(--o-ease-emphasized) both;',
    '}',
    '[data-o-toasts][data-o-toasts-side="bottom"] [data-o-toast]{bottom:0;transform-origin:bottom center}',
    '[data-o-toasts][data-o-toasts-side="top"] [data-o-toast]{top:0;transform-origin:top center}',
    // The rule of the nature, along the left edge.
    '[data-o-toast]::before{',
    'content:"";position:absolute;inset-block:0;left:0;width:3px;background:var(--o-toast-tone)}',
    '[data-o-toast-body]{flex:1 1 auto;min-width:0;display:flex;flex-direction:column;gap:0.15rem}',
    '[data-o-toast-title]{font-weight:600;font-size:0.9375em}',
    '[data-o-toast-text]{font-size:0.875em;opacity:0.7}',
    '[data-o-toast-close]{',
    'flex:none;display:inline-grid;place-items:center;width:1.5em;height:1.5em;',
    'border:0;border-radius:999px;background:transparent;color:inherit;font:inherit;',
    'cursor:pointer;opacity:0.5;transition:opacity var(--o-duration-fast) linear;',
    '}',
    '[data-o-toast-close]:is(:hover,:focus-visible){opacity:1}',
    '[data-o-toast-close]:focus-visible{outline:2px solid var(--o-toast-tone);outline-offset:1px}',
    // The life bar: its duration is that of the timer, and so is its pause.
    '[data-o-toast-life]{',
    'position:absolute;left:0;bottom:0;height:2px;width:100%;',
    'background:var(--o-toast-tone);transform-origin:left center;',
    'animation:o-toast-life var(--o-toast-duration) linear forwards;',
    '}',
    '[data-o-toasts][data-o-toasts-paused] [data-o-toast-life]{animation-play-state:paused}',
    '@keyframes o-toast-life{from{transform:scaleX(1)}to{transform:scaleX(0)}}',
    // The entrance touches neither `opacity` nor `transform`: those two carry
    // the place of the card in the pack, and an animation filled forwards
    // would freeze them at their arrival value.
    '@keyframes o-toast-in{from{scale:0.9;translate:0 14px}to{scale:1;translate:none}}',
    '@media (prefers-reduced-motion:reduce){',
    '[data-o-toast]{animation:none;transition:none}',
    '[data-o-toast-life]{display:none}',
    '}',
  ].join('')
  document.head.append(style)
}

/** A card, with its own timer. */
function ToastCard({
  toast,
  paused,
  duration,
  onDone,
}: {
  toast: ToastItem
  paused: boolean
  duration: number
  onDone: () => void
}): ReactElement {
  const left = useRef(duration)
  const startedAt = useRef(0)
  const done = useRef(onDone)

  // The last known function, without restarting the timer for all that:
  // resetting it on every render of the parent would never let it expire.
  useEffect(() => {
    done.current = onDone
  })

  useEffect(() => {
    if (duration <= 0 || paused || left.current <= 0) return
    startedAt.current = Date.now()
    const timer = setTimeout(() => {
      done.current()
    }, left.current)
    return () => {
      clearTimeout(timer)
      left.current = Math.max(0, left.current - (Date.now() - startedAt.current))
    }
  }, [paused, duration])

  return (
    <li
      data-o-toast=""
      data-o-toast-id={toast.id}
      style={
        {
          '--o-toast-tone': TONES[toast.tone ?? 'info'],
          '--o-toast-duration': `${String(duration)}ms`,
        } as CSSProperties
      }
    >
      <span data-o-toast-body="">
        <span data-o-toast-title="">{toast.title}</span>
        {toast.description !== undefined && (
          <span data-o-toast-text="">{toast.description}</span>
        )}
      </span>
      <button
        type="button"
        data-o-toast-close=""
        aria-label={`Close ${toast.title}`}
        onClick={() => {
          done.current()
        }}
      >
        <span aria-hidden="true">{'×'}</span>
      </button>
      {duration > 0 && <span data-o-toast-life="" aria-hidden="true" />}
    </li>
  )
}

/**
 * Stack of piled notifications, removed after a delay.
 *
 * @example
 * <ToastStack
 *   toasts={[{ id: '1', title: 'Draft saved', tone: 'success' }]}
 *   onDismiss={(id) => { remove(id) }}
 * />
 *
 * @example
 * // Anchored at the top, four cards visible, without automatic removal.
 * <ToastStack toasts={notices} onDismiss={remove} side="top" max={4} duration={0} />
 */
export function ToastStack({
  toasts,
  label = 'Notifications',
  onDismiss,
  duration = 4000,
  max = 3,
  side = 'bottom',
  ...rest
}: ToastStackProps): ReactElement {
  const listRef = useRef<HTMLOListElement | null>(null)
  const [retired, setRetired] = useState<readonly string[]>([])
  // A single state for two effects: the hand laid on the stack stops the
  // timers and spreads the pack. These are the two halves of the same gesture.
  const [paused, setPaused] = useState(false)
  ensureToastRules()

  // Removed on screen, but maybe still in the list of the page: the stack
  // erases nothing there, it only stops showing it.
  const alive = toasts.filter((toast) => !retired.includes(toast.id))
  // One card more than the pack shows: it is the one that fades away behind
  // the others when a new one arrives.
  const shown = alive.slice(-(max + 1))

  const dismiss = (id: string): void => {
    setRetired((previous) => [...previous.filter((entry) => entry !== id), id])
    onDismiss?.(id)
  }

  // Identifiers gone from the list no longer have to be retained.
  useEffect(() => {
    setRetired((previous) => {
      const kept = previous.filter((id) => toasts.some((toast) => toast.id === id))
      return kept.length === previous.length ? previous : kept
    })
  }, [toasts])

  // The offsets: measured after the render, written on the elements.
  useLayoutEffect(() => {
    const cards = Array.from(
      listRef.current?.querySelectorAll<HTMLLIElement>('[data-o-toast]') ?? [],
    ).reverse()
    const sign = side === 'bottom' ? -1 : 1
    let offset = 0

    for (const [depth, card] of cards.entries()) {
      // Spread out, the card settles behind the previous one; stacked, it
      // sticks out by an edge and steps back one notch.
      const shift = paused ? offset : depth * 10
      card.style.setProperty('--o-toast-y', `${String(sign * shift)}px`)
      card.style.setProperty('--o-toast-scale', String(paused ? 1 : 1 - depth * 0.05))
      card.style.setProperty('--o-toast-opacity', String(depth >= max ? 0 : 1))
      card.style.zIndex = String(cards.length - depth)
      offset += card.offsetHeight + 8
    }
  })

  const { className, style } = mergePresentation({}, rest)

  return (
    <div
      {...rest}
      role="status"
      aria-atomic="false"
      aria-label={label}
      data-o-toasts=""
      data-o-toasts-side={side}
      data-o-toasts-paused={paused ? '' : undefined}
      className={className}
      style={style as CSSProperties}
      onPointerEnter={(event) => {
        setPaused(true)
        rest.onPointerEnter?.(event)
      }}
      onPointerLeave={(event) => {
        setPaused(false)
        rest.onPointerLeave?.(event)
      }}
      onFocusCapture={(event) => {
        setPaused(true)
        rest.onFocusCapture?.(event)
      }}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setPaused(false)
        rest.onBlurCapture?.(event)
      }}
    >
      <ol ref={listRef}>
        {shown.map((toast) => (
          <ToastCard
            key={toast.id}
            toast={toast}
            paused={paused}
            duration={duration}
            onDone={() => {
              dismiss(toast.id)
            }}
          />
        ))}
      </ol>
    </div>
  )
}

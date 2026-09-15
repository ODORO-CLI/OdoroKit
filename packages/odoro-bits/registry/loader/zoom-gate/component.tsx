/**
 * Curtain that moves away: the brand comes forward, the plate retreats.
 *
 * ## Two opposite movements, in the same depth
 *
 * The curtain does not fade and does not slide: it **retreats**, in a
 * perspective. At the same instant the brand comes towards the eye. The two
 * gestures leave together and go in opposite directions, and it is that
 * opposition that makes the whole: the brand grows, detaches itself, leaves the
 * frame; the plate that carried it sinks behind it and becomes a distant
 * rectangle.
 *
 * The effect costs nothing more than a translation: `translateZ` is a transform
 * like any other, and the perspective lives on the container.
 *
 * ## Why the opacity arrives late
 *
 * A plate that retreats never quite disappears: it ends as a small rectangle in
 * the center, and a small rectangle that stays is more of a nuisance than a big
 * one that leaves. So we make it fade, but **only towards the end** — the fade
 * starts halfway through the travel. Fading from the start would let the page
 * show through the curtain and would give away the trick: you would see that
 * there was only a veil where we wanted an object.
 *
 * ## The exit leaves at the START, not after
 *
 * `onDone` is called when the plate **begins** to retreat. The content comes in
 * while the curtain moves away, which is precisely what the depth is telling:
 * the page was behind. Waiting for the end would give two gestures one after
 * the other where we wanted a single one.
 *
 * ## Contained or full screen
 *
 * By default the curtain is `fixed`, covers the window and locks the document
 * scroll. With `contained`, it becomes `absolute`, resolves against the first
 * positioned ancestor and no longer touches the scroll.
 *
 * @module
 */

import { mergePresentation, useMotionState, type Customisable } from '@odoro-cli/engine'
import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactElement,
  type ReactNode,
} from 'react'

/** Properties specific to the component. */
export interface ZoomGateOwnProps {
  /** The background of the plate. @defaultValue the theme background */
  background?: string
  /** The ink of the brand. @defaultValue the theme ink */
  ink?: string
  /** The brand that comes towards the eye: a name, a logo. */
  label?: ReactNode
  /**
   * What screen readers announce. Empty string to announce the label only.
   *
   * @defaultValue 'Loading'
   */
  status?: string
  /** How much the brand grows as it leaves. @defaultValue 3.2 */
  punch?: number
  /** Depth the plate retreats by, in pixels. @defaultValue 900 */
  depth?: number
  /** How long the plate stays in place, in milliseconds. @defaultValue 1200 */
  holdMs?: number
  /** Duration of the retreat, in milliseconds. @defaultValue 900 */
  exitMs?: number
  /**
   * Controlled state: the plate covers as long as this is `true`, and retreats
   * on the first `false`. When provided, it replaces `holdMs`.
   */
  open?: boolean
  /** Covers the positioned parent rather than the window. @defaultValue false */
  contained?: boolean
  /** Called at the **start** of the exit. See the module header. */
  onDone?: () => void
}

/** All the properties. */
export type ZoomGateProps = Customisable<ZoomGateOwnProps, 'div'>

/** Identifier of the injected stylesheet. */
const STYLE_ID = 'o-zoom-gate'

/** Applies the depth rules, once per document. */
function ensureZoomGateRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    // The perspective lives here, on the stage: that is what gives the plate
    // and the brand a common vanishing point, hence the sense that they share
    // the same space.
    '[data-o-zoomg]{',
    'position:fixed;inset:0;z-index:9999;overflow:hidden;',
    'perspective:1000px;color:var(--o-zoomg-ink);',
    '}',
    '[data-o-zoomg][data-o-zoomg-contained]{position:absolute}',
    '[data-o-zoomg][data-o-zoomg-out]{pointer-events:none}',
    '[data-o-zoomg-plate]{',
    'position:absolute;inset:0;background:var(--o-zoomg-bg);',
    'transform:translateZ(0);',
    'transition:transform var(--o-zoomg-exit) cubic-bezier(0.5,0,0.2,1),',
    // The fade starts halfway through the travel, and lasts only half of it.
    // See the header.
    'opacity calc(var(--o-zoomg-exit) / 2) linear calc(var(--o-zoomg-exit) / 2);',
    '}',
    '[data-o-zoomg-out] [data-o-zoomg-plate]{',
    'transform:translateZ(calc(-1 * var(--o-zoomg-depth)));opacity:0;',
    '}',
    '[data-o-zoomg-status]{',
    'position:absolute;inset:0;display:flex;align-items:center;justify-content:center;',
    'transform:scale(1);',
    'transition:transform var(--o-zoomg-exit) cubic-bezier(0.5,0,0.75,0),',
    'opacity calc(var(--o-zoomg-exit) * 0.7) ease-in calc(var(--o-zoomg-exit) * 0.3);',
    '}',
    '[data-o-zoomg-out] [data-o-zoomg-status]{transform:scale(var(--o-zoomg-punch));opacity:0}',
  ].join('')
  document.head.append(style)
}

/**
 * Covers the page with a plate, then moves it away while the brand comes
 * forward.
 *
 * @example
 * <ZoomGate label="Odoro" onDone={reveal} />
 *
 * @example
 * // A more violent departure, and a plate that goes very far.
 * <ZoomGate punch={5} depth={1400} exitMs={1100} onDone={reveal} />
 */
export function ZoomGate({
  background = 'var(--o-theme-bg)',
  ink = 'var(--o-theme-fg)',
  label,
  status = 'Loading',
  punch = 3.2,
  depth = 900,
  holdMs = 1200,
  exitMs = 900,
  open,
  contained = false,
  onDone,
  ...rest
}: ZoomGateProps): ReactElement | null {
  const { reduced } = useMotionState()
  const [exiting, setExiting] = useState(false)
  const [gone, setGone] = useState(false)

  // In a ref: the exit announces itself only once, and one more render must not
  // replay the callback.
  const announced = useRef(false)
  const callback = useRef(onDone)
  callback.current = onDone

  ensureZoomGateRule()

  useEffect(() => {
    const announce = (): void => {
      if (announced.current) return
      announced.current = true
      callback.current?.()
    }

    // Reduced motion: the exit is immediate. A zoom is exactly the kind of
    // movement the preference is aimed at, and taking it away costs nothing
    // here since the curtain brought nothing but that.
    if (reduced) {
      announce()
      setGone(true)
      return
    }

    if (open !== undefined) {
      if (!open) {
        setExiting(true)
        announce()
      }
      return
    }

    const timer = window.setTimeout(() => {
      setExiting(true)
      announce()
    }, holdMs)

    return () => {
      window.clearTimeout(timer)
    }
  }, [reduced, open, holdMs])

  // A timer rather than `transitionend`: four transitions leave together, on
  // two elements, and the shortest would bubble up here first.
  useEffect(() => {
    if (!exiting) return

    const timer = window.setTimeout(() => {
      setGone(true)
    }, exitMs + 40)

    return () => {
      window.clearTimeout(timer)
    }
  }, [exiting, exitMs])

  // The scroll lock, only when the plate covers the window.
  useEffect(() => {
    if (contained || gone || reduced) return

    // A lock that COUNTS, rather than one that memorises. Two curtains can
    // overlap — hot reload, navigation, concurrent rendering — and the second
    // would then memorise the value set by the first, "hidden", to restore it
    // on the way out: the page would stay stuck with no error and no trace.
    const root = document.documentElement
    const locks = Number(root.dataset['oGateLocks'] ?? '0')
    if (locks === 0) root.dataset['oGatePrevious'] = root.style.overflow
    root.dataset['oGateLocks'] = String(locks + 1)
    root.style.overflow = 'hidden'

    let released = false
    const release = (): void => {
      if (released) return
      released = true
      const remaining = Number(root.dataset['oGateLocks'] ?? '1') - 1
      if (remaining > 0) {
        root.dataset['oGateLocks'] = String(remaining)
        return
      }
      root.style.overflow = root.dataset['oGatePrevious'] ?? ''
      delete root.dataset['oGateLocks']
      delete root.dataset['oGatePrevious']
    }

    // The safety net. Longer than the ceiling of any curtain, so invisible in
    // normal running: it exists only so that a delay can never leave the page
    // without scrolling.
    const safety = window.setTimeout(release, 8000)

    return () => {
      window.clearTimeout(safety)
      release()
    }
  }, [contained, gone, reduced])

  if (gone) return null

  const { className, style } = mergePresentation({}, rest)

  const sceneStyle = {
    ...style,
    '--o-zoomg-bg': background,
    '--o-zoomg-ink': ink,
    '--o-zoomg-exit': `${String(exitMs)}ms`,
    '--o-zoomg-depth': `${String(depth)}px`,
    '--o-zoomg-punch': String(punch),
  } as CSSProperties

  return (
    <div
      {...rest}
      className={className}
      style={sceneStyle}
      data-o-zoomg=""
      {...(exiting ? { 'data-o-zoomg-out': '' } : {})}
      {...(contained ? { 'data-o-zoomg-contained': '' } : {})}
    >
      {/* The plate is decoration: it must not be read out. */}
      <div data-o-zoomg-plate="" aria-hidden="true" />

      <div data-o-zoomg-status="" role="status">
        {status.length > 0 && <span className="o-sr-only">{status}</span>}
        {label}
      </div>
    </div>
  )
}

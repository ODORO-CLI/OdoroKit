/**
 * Curtain of pivoting blades, like the diaphragm of a camera lens.
 *
 * ## Why blades, when a `clip-path` would do
 *
 * `curtain-wipe` opens a perfect disc with a single animated shape. That is the
 * cheap choice, and it is the right one when what you want is a hole. It is not
 * the right one when what you want is a **mechanism**: a real diaphragm has no
 * round aperture, it has an n-sided polygon, and that polygon turns as it opens
 * because each blade pivots around its own axis.
 *
 * So we keep the blades. Each one is a plate anchored by its corner at the
 * center and rotated by its share of the turn; their overlap closes the screen.
 * On the way out they slide outwards while the whole assembly rotates: the
 * aperture is a polygon that grows **while turning**. No `clip-path` would have
 * given that without recomputing its vertices on every frame.
 *
 * ## The blade is square, and its size is measured
 *
 * A blade sized in percentages of the frame is only square on a square frame.
 * Anywhere else its `translate` travel — in percentages too — advances a lot
 * along one axis and little along the other: on a wide banner the aperture is
 * finished a third of the way through the duration in one direction and not
 * started in the other.
 *
 * So we measure the frame once, on mount, and derive a radius from it: the
 * blade is a square three radii on a side, and its travel is one radius on each
 * local axis. The geometry becomes exact whatever the aspect ratio, and the
 * opening takes up the whole announced duration. A `ResizeObserver` redoes the
 * computation if the frame changes size — a layout read per resize, never per
 * frame.
 *
 * ## Four blades at the minimum
 *
 * A plate anchored by its corner covers a quarter turn. Below four blades their
 * sum no longer closes the circle and corners of the page show through before
 * the opening. The bound is therefore not a preference: it is the condition for
 * the curtain to cover.
 *
 * ## The exit leaves at the START, not after
 *
 * `onDone` is called the moment the blades **begin** to part. The content comes
 * in through the aperture while it grows; waiting for the end would give a
 * diaphragm, a dead beat, then a page — three beats where we wanted one.
 *
 * ## Contained or full screen
 *
 * By default the curtain is `fixed`, covers the window and locks the document
 * scroll. With `contained`, it becomes `absolute`, resolves against the first
 * positioned ancestor and leaves scrolling alone: a mockup frame has no reason
 * to freeze the page around it.
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
export interface IrisOpenOwnProps {
  /** The background of the blades. @defaultValue the theme background */
  background?: string
  /** The ink of the label. @defaultValue the theme ink */
  ink?: string
  /** What shows in the center during the wait: a name, a brand. */
  label?: ReactNode
  /**
   * What screen readers announce. Empty string to announce the label only.
   *
   * @defaultValue 'Loading'
   */
  status?: string
  /** Number of blades. Four at the minimum, see the header. @defaultValue 6 */
  blades?: number
  /** Rotation of the whole assembly during the opening, in degrees. @defaultValue 26 */
  turn?: number
  /** How long the diaphragm stays closed, in milliseconds. @defaultValue 1200 */
  holdMs?: number
  /** Duration of the opening, in milliseconds. @defaultValue 1000 */
  exitMs?: number
  /**
   * Controlled state: the curtain covers as long as this is `true`, and exits on
   * the first `false`. When provided, it replaces `holdMs`.
   */
  open?: boolean
  /** Covers the positioned parent rather than the window. @defaultValue false */
  contained?: boolean
  /** Called at the **start** of the exit. See the module header. */
  onDone?: () => void
}

/** All the properties. */
export type IrisOpenProps = Customisable<IrisOpenOwnProps, 'div'>

/** Identifier of the injected stylesheet. */
const STYLE_ID = 'o-iris-open'

/** Below this, the blades no longer close the circle. See the header. */
const MIN_BLADES = 4

/** Applies the diaphragm rules, once per document. */
function ensureIrisOpenRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-iris]{',
    'position:fixed;inset:0;z-index:9999;overflow:hidden;',
    'color:var(--o-iris-ink);',
    '}',
    '[data-o-iris][data-o-iris-contained]{position:absolute}',
    '[data-o-iris][data-o-iris-out]{pointer-events:none}',
    // The hub carries the rotation of the whole assembly; the blades carry
    // their own slide. Separating the two avoids recomposing one matrix per
    // blade on every frame.
    '[data-o-iris-hub]{',
    'position:absolute;inset:0;',
    'transition:transform var(--o-iris-exit) cubic-bezier(0.65,0,0.35,1);',
    '}',
    '[data-o-iris-out] [data-o-iris-hub]{transform:rotate(var(--o-iris-turn))}',
    // The blade is anchored by its corner at the exact center: that is what
    // makes it cover a quarter turn, and what makes the bound of four
    // necessary.
    '[data-o-iris-blade]{',
    'position:absolute;left:50%;top:50%;',
    'width:var(--o-iris-size);height:var(--o-iris-size);',
    'background:var(--o-iris-bg);transform-origin:0 0;',
    'transform:rotate(var(--o-iris-a)) translate(0,0);',
    'transition:transform var(--o-iris-exit) cubic-bezier(0.65,0,0.35,1);',
    '}',
    '[data-o-iris-out] [data-o-iris-blade]{',
    'transform:rotate(var(--o-iris-a)) translate(var(--o-iris-travel),var(--o-iris-travel));',
    '}',
    '[data-o-iris-status]{',
    'position:absolute;inset:0;display:flex;align-items:center;justify-content:center;',
    'transition:opacity 240ms ease,transform 480ms cubic-bezier(0.2,0,0,1);',
    '}',
    '[data-o-iris-out] [data-o-iris-status]{opacity:0;transform:scale(1.06)}',
  ].join('')
  document.head.append(style)
}

/**
 * Closes the page behind a diaphragm, then opens it with a turn.
 *
 * @example
 * <IrisOpen label="Odoro" onDone={reveal} />
 *
 * @example
 * // Eight blades and a decided rotation: the mechanism shows more.
 * <IrisOpen blades={8} turn={45} exitMs={1200} onDone={reveal} />
 */
export function IrisOpen({
  background = 'var(--o-theme-bg)',
  ink = 'var(--o-theme-fg)',
  label,
  status = 'Loading',
  blades = 6,
  turn = 26,
  holdMs = 1200,
  exitMs = 1000,
  open,
  contained = false,
  onDone,
  ...rest
}: IrisOpenProps): ReactElement | null {
  const { reduced } = useMotionState()
  const [exiting, setExiting] = useState(false)
  const [gone, setGone] = useState(false)
  const host = useRef<HTMLDivElement>(null)

  const announced = useRef(false)
  const callback = useRef(onDone)
  callback.current = onDone

  ensureIrisOpenRule()

  // The measurement. It is written into the variables of the node rather than
  // into state: nothing on the React side depends on its value, and a render
  // per resize would be work for nothing.
  useEffect(() => {
    const node = host.current
    if (node === null) return

    const measure = (): void => {
      const radius = Math.hypot(node.clientWidth, node.clientHeight) / 2
      node.style.setProperty('--o-iris-size', `${String(radius * 3)}px`)
      node.style.setProperty('--o-iris-travel', `${String(radius)}px`)
    }

    measure()

    const observer = new ResizeObserver(measure)
    observer.observe(node)

    return () => {
      observer.disconnect()
    }
  }, [])

  useEffect(() => {
    const announce = (): void => {
      if (announced.current) return
      announced.current = true
      callback.current?.()
    }

    // Reduced motion: the exit is immediate. The diaphragm brought nothing but
    // a gesture, and the gesture is what we are being asked to leave out.
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

  // A timer rather than `transitionend`: the event bubbles up from any one of
  // the blades, and the label's own would arrive before them.
  useEffect(() => {
    if (!exiting) return

    const timer = window.setTimeout(() => {
      setGone(true)
    }, exitMs + 40)

    return () => {
      window.clearTimeout(timer)
    }
  }, [exiting, exitMs])

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
  const count = Math.max(MIN_BLADES, Math.round(blades))
  const step = 360 / count

  const curtainStyle = {
    ...style,
    '--o-iris-bg': background,
    '--o-iris-ink': ink,
    '--o-iris-exit': `${String(exitMs)}ms`,
    '--o-iris-turn': `${String(turn)}deg`,
    // The fallback from before the measurement: big enough to cover any frame
    // on the paint where the curtain appears, before the effect measures.
    '--o-iris-size': '200vmax',
    '--o-iris-travel': '100vmax',
  } as CSSProperties

  return (
    <div
      {...rest}
      ref={host}
      className={className}
      style={curtainStyle}
      data-o-iris=""
      {...(exiting ? { 'data-o-iris-out': '' } : {})}
      {...(contained ? { 'data-o-iris-contained': '' } : {})}
    >
      {/* The blades are decoration: they must not be read out. */}
      <div data-o-iris-hub="" aria-hidden="true">
        {Array.from({ length: count }, (_, index) => (
          <div
            key={index}
            data-o-iris-blade=""
            style={{ '--o-iris-a': `${String(index * step)}deg` } as CSSProperties}
          />
        ))}
      </div>

      <div data-o-iris-status="" role="status">
        {status.length > 0 && <span className="o-sr-only">{status}</span>}
        {label}
      </div>
    </div>
  )
}

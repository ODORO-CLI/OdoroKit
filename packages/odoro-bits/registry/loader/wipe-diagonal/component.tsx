/**
 * Curtain swept away by a slanted edge.
 *
 * ## An edge, not a shape
 *
 * `curtain-wipe` pierces its plate, `counter-gate` lifts it in one block. Here
 * there is only a **line**: the plate leaves the screen in a single move, and
 * what one reads is its trailing edge, tilted. It is the quickest gesture of
 * the set to understand, and the one that gives a direction to the page that
 * arrives — the eye follows the edge and lands where it ends.
 *
 * The tilt comes from a `skewX`, not from a rotation: a rotation would also
 * tilt the top and bottom edges, which would then have to be oversized in both
 * directions. A shear only leans the vertical, which is exactly the edge we
 * want tilted.
 *
 * ## The travel is measured, not guessed
 *
 * A tilted edge overhangs sideways by `tan(angle) x height / 2`. That amount
 * depends on the **aspect ratio** of the frame: on a wide banner it is
 * negligible, on a phone it is a quarter of the width. A fixed oversize in
 * percent must therefore be computed for the worst case — and then, on every
 * other aspect ratio, the plate spends the first third of its duration off
 * screen: the wipe seems to start late.
 *
 * So we measure the frame once, on mount, and write the overhang and the travel
 * in pixels. A `ResizeObserver` redoes the computation if the frame changes
 * size. This is a layout read per resize, never per frame — and it buys a wipe
 * that occupies exactly the announced duration.
 *
 * ## The exit fires at the START, not after
 *
 * `onDone` is called when the plate **starts** to leave, never when it arrives.
 * The page enters behind the edge while it sweeps; waiting for the end would
 * make two successive gestures where we wanted a single one.
 *
 * ## Contained or full screen
 *
 * By default the plate is `fixed`, covers the window and locks the scrolling of
 * the document. With `contained`, it becomes `absolute`, resolves against the
 * first positioned ancestor and no longer touches scrolling: a mockup frame has
 * no reason to freeze the page around it.
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
export interface WipeDiagonalOwnProps {
  /** The background of the plate. @defaultValue the theme background */
  background?: string
  /** The ink: the edge hairline and the label. @defaultValue the theme ink */
  ink?: string
  /** What shows in the centre during the wait: a name, a brand. */
  label?: ReactNode
  /**
   * What screen readers announce. Empty string to announce only the label.
   *
   * @defaultValue 'Loading'
   */
  status?: string
  /** Side the plate leaves through. @defaultValue 'left' */
  direction?: 'left' | 'right'
  /** Tilt of the edge, in degrees. @defaultValue 14 */
  slant?: number
  /** How long the plate stays in place, in milliseconds. @defaultValue 1200 */
  holdMs?: number
  /** Duration of the wipe, in milliseconds. @defaultValue 800 */
  exitMs?: number
  /**
   * Controlled state: the plate covers as long as this is `true`, and leaves on
   * the first `false`. When given, it replaces `holdMs`.
   */
  open?: boolean
  /** Covers the positioned parent rather than the window. @defaultValue false */
  contained?: boolean
  /** Called at the **start** of the exit. See the module header. */
  onDone?: () => void
}

/** All the properties. */
export type WipeDiagonalProps = Customisable<WipeDiagonalOwnProps, 'div'>

/** Identifier of the injected stylesheet. */
const STYLE_ID = 'o-wipe-diagonal'

/** Safety margin added to the measured overhang, in pixels. */
const SAFETY = 4

/** Applies the rules of the plate, once per document. */
function ensureWipeDiagonalRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-wipd]{',
    'position:fixed;inset:0;z-index:9999;overflow:hidden;',
    'color:var(--o-wipd-ink);',
    '}',
    '[data-o-wipd][data-o-wipd-contained]{position:absolute}',
    // During the wipe the curtain must no longer intercept anything: the page
    // is already there behind the edge.
    '[data-o-wipd][data-o-wipd-out]{pointer-events:none}',
    '[data-o-wipd-plate]{',
    'position:absolute;top:0;bottom:0;',
    'background:var(--o-wipd-bg);',
    'transform:skewX(var(--o-wipd-slant)) translateX(0);',
    'transition:transform var(--o-wipd-exit) cubic-bezier(0.72,0,0.28,1);',
    '}',
    // The overhang on the exit side is wide — the plate must disappear there
    // entirely; the one on the edge side is exactly what the shear measured.
    '[data-o-wipd-dir="l"] [data-o-wipd-plate]{',
    'left:calc(-200% - 4 * var(--o-wipd-lead));right:calc(-1 * var(--o-wipd-lead));',
    '}',
    '[data-o-wipd-dir="r"] [data-o-wipd-plate]{',
    'right:calc(-200% - 4 * var(--o-wipd-lead));left:calc(-1 * var(--o-wipd-lead));',
    '}',
    '[data-o-wipd-dir="l"][data-o-wipd-out] [data-o-wipd-plate]{',
    'transform:skewX(var(--o-wipd-slant)) translateX(calc(-1 * var(--o-wipd-travel)));',
    '}',
    '[data-o-wipd-dir="r"][data-o-wipd-out] [data-o-wipd-plate]{',
    'transform:skewX(var(--o-wipd-slant)) translateX(var(--o-wipd-travel));',
    '}',
    // The hairline of the edge: it is what makes the direction legible, even
    // more than the plate itself.
    '[data-o-wipd-plate]::after{',
    'content:"";position:absolute;top:0;bottom:0;width:2px;background:currentColor;opacity:0.45;',
    '}',
    '[data-o-wipd-dir="l"] [data-o-wipd-plate]::after{right:0}',
    '[data-o-wipd-dir="r"] [data-o-wipd-plate]::after{left:0}',
    '[data-o-wipd-status]{',
    'position:absolute;inset:0;display:flex;align-items:center;justify-content:center;',
    'transition:opacity 220ms ease;',
    '}',
    '[data-o-wipd-out] [data-o-wipd-status]{opacity:0}',
  ].join('')
  document.head.append(style)
}

/**
 * Covers the page with a plate, then wipes it away at an angle.
 *
 * @example
 * <WipeDiagonal label="Odoro" onDone={open} />
 *
 * @example
 * // To the right, sharply tilted.
 * <WipeDiagonal direction="right" slant={22} exitMs={700} onDone={open} />
 */
export function WipeDiagonal({
  background = 'var(--o-theme-bg)',
  ink = 'var(--o-theme-fg)',
  label,
  status = 'Loading',
  direction = 'left',
  slant = 14,
  holdMs = 1200,
  exitMs = 800,
  open,
  contained = false,
  onDone,
  ...rest
}: WipeDiagonalProps): ReactElement | null {
  const { reduced } = useMotionState()
  const [exiting, setExiting] = useState(false)
  const [gone, setGone] = useState(false)
  const host = useRef<HTMLDivElement>(null)

  // In a ref: the exit announces itself only once, and one more render must not
  // replay the callback.
  const announced = useRef(false)
  const callback = useRef(onDone)
  callback.current = onDone

  ensureWipeDiagonalRule()

  // The measurement. It is written into the variables of the node rather than
  // into state: nothing on screen depends on its value on the React side, and a
  // render per resize would be work for nothing.
  useEffect(() => {
    const node = host.current
    if (node === null) return

    const measure = (): void => {
      const overhang =
        Math.abs(Math.tan((slant * Math.PI) / 180)) * (node.clientHeight / 2)
      node.style.setProperty('--o-wipd-lead', `${String(overhang + SAFETY)}px`)
      node.style.setProperty(
        '--o-wipd-travel',
        `${String(node.clientWidth + 2 * (overhang + SAFETY))}px`,
      )
    }

    measure()

    const observer = new ResizeObserver(measure)
    observer.observe(node)

    return () => {
      observer.disconnect()
    }
  }, [slant])

  useEffect(() => {
    const announce = (): void => {
      if (announced.current) return
      announced.current = true
      callback.current?.()
    }

    // Reduced motion: the exit is immediate. What the plate brought was the
    // gesture, and the gesture is what we are asked to omit.
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

  // A timer rather than `transitionend`: the event bubbles up from any child,
  // and the one from the label — far shorter than the wipe — would remove the
  // plate mid-travel.
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

    // A COUNTED lock, not a memorised one. Two curtains can overlap — hot
    // reload, navigation, concurrent rendering — and the second would then
    // memorise the value set by the first, "hidden", to restore it on the way
    // out: the page would stay stuck with no error and no trace.
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

    // The guard rail. Longer than the ceiling of any curtain, hence invisible
    // in normal operation: it exists only so that a delay can never leave the
    // page without scrolling.
    const failsafe = window.setTimeout(release, 8000)

    return () => {
      window.clearTimeout(failsafe)
      release()
    }
  }, [contained, gone, reduced])

  if (gone) return null

  const { className, style } = mergePresentation({}, rest)

  // The shear leans towards the side the plate leaves through: the edge leads
  // the movement instead of trailing it.
  const tilt = direction === 'right' ? slant : -slant

  const plateStyle = {
    ...style,
    '--o-wipd-bg': background,
    '--o-wipd-ink': ink,
    '--o-wipd-exit': `${String(exitMs)}ms`,
    '--o-wipd-slant': `${String(tilt)}deg`,
    '--o-wipd-lead': '0px',
    '--o-wipd-travel': '200%',
  } as CSSProperties

  return (
    <div
      {...rest}
      ref={host}
      className={className}
      style={plateStyle}
      data-o-wipd=""
      data-o-wipd-dir={direction === 'right' ? 'r' : 'l'}
      {...(exiting ? { 'data-o-wipd-out': '' } : {})}
      {...(contained ? { 'data-o-wipd-contained': '' } : {})}
    >
      {/* The plate is decoration: it must not be read. */}
      <div data-o-wipd-plate="" aria-hidden="true" />

      <div data-o-wipd-status="" role="status">
        {status.length > 0 && <span className="o-sr-only">{status}</span>}
        {label}
      </div>
    </div>
  )
}

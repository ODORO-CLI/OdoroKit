/**
 * Two-panel curtain that parts from the central seam.
 *
 * ## Two panels, because a curtain is drawn
 *
 * `curtain-wipe` pierces its plate, `counter-gate` lifts it in one block. Here
 * the plane is cut in two from the start, and the seam shows: a one-pixel line
 * in the middle of the screen announces where the opening is going to happen.
 * The gesture is therefore readable **before** it begins, which is exactly what
 * a theatre curtain does.
 *
 * The two panels leave through opposite sides. Nothing crosses them, nothing
 * fades: the page appears in the gap that grows between them.
 *
 * ## Half a per cent of overlap
 *
 * Each panel measures `50.5 %`, not `50 %`. On an odd width, two rounded halves
 * leave a one-pixel sliver in the middle through which the page shows early.
 * The overlap costs half a per cent of extra translation and removes the flaw.
 *
 * ## The exit starts at the BEGINNING, not after
 *
 * `onDone` is called when the panels **start** to part, never when they
 * arrive. The content must enter through the opening while it is being made:
 * waiting for the end would give two gestures one after the other — a curtain
 * that parts, a dead moment, then a page that animates — where only one that
 * unfolds was wanted.
 *
 * ## Contained or fullscreen
 *
 * By default the curtain is `fixed` and covers the window; it then locks the
 * document's scrolling, since nothing underneath is reachable. With
 * `contained`, it becomes `absolute` and resolves against the first positioned
 * ancestor — a mockup, a card — and no longer touches scrolling: that would
 * mean locking the page for a three-hundred-pixel frame.
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
export interface SplitCurtainOwnProps {
  /** The panel background. @defaultValue the theme background */
  background?: string
  /** The curtain ink: seam and label. @defaultValue the theme ink */
  ink?: string
  /** What shows in the centre during the wait: a name, a brand. */
  label?: ReactNode
  /**
   * What screen readers announce. Empty string to announce only the label.
   *
   * @defaultValue 'Loading'
   */
  status?: string
  /** Direction of the parting. @defaultValue 'horizontal' */
  axis?: 'horizontal' | 'vertical'
  /** How long the curtain stays closed, in milliseconds. @defaultValue 1200 */
  holdMs?: number
  /** Duration of the parting, in milliseconds. @defaultValue 900 */
  exitMs?: number
  /**
   * Controlled state: the curtain covers as long as this is `true`, and exits
   * on the first `false`. When it is given, it replaces `holdMs`.
   */
  open?: boolean
  /** Covers the positioned parent rather than the window. @defaultValue false */
  contained?: boolean
  /** Called at the **start** of the exit. See the module header. */
  onDone?: () => void
}

/** All the properties. */
export type SplitCurtainProps = Customisable<SplitCurtainOwnProps, 'div'>

/** Identifier of the injected stylesheet. */
const STYLE_ID = 'o-split-curtain'

/** Sets the rules of the two panels, once per document. */
function ensureSplitCurtainRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-splc]{',
    'position:fixed;inset:0;z-index:9999;overflow:hidden;',
    'color:var(--o-splc-ink);',
    '}',
    '[data-o-splc][data-o-splc-contained]{position:absolute}',
    // During the exit the curtain must no longer intercept anything: the page
    // is already there, and a click in the gap must reach it.
    '[data-o-splc][data-o-splc-out]{pointer-events:none}',
    '[data-o-splc-pan]{',
    'position:absolute;background:var(--o-splc-bg);',
    'transition:transform var(--o-splc-exit) cubic-bezier(0.76,0,0.24,1);',
    '}',
    '[data-o-splc-axis="h"] [data-o-splc-pan]{top:0;bottom:0;width:50.5%}',
    '[data-o-splc-axis="h"] [data-o-splc-pan="a"]{left:0}',
    '[data-o-splc-axis="h"] [data-o-splc-pan="b"]{right:0}',
    '[data-o-splc-axis="h"][data-o-splc-out] [data-o-splc-pan="a"]{transform:translateX(-101%)}',
    '[data-o-splc-axis="h"][data-o-splc-out] [data-o-splc-pan="b"]{transform:translateX(101%)}',
    '[data-o-splc-axis="v"] [data-o-splc-pan]{left:0;right:0;height:50.5%}',
    '[data-o-splc-axis="v"] [data-o-splc-pan="a"]{top:0}',
    '[data-o-splc-axis="v"] [data-o-splc-pan="b"]{bottom:0}',
    '[data-o-splc-axis="v"][data-o-splc-out] [data-o-splc-pan="a"]{transform:translateY(-101%)}',
    '[data-o-splc-axis="v"][data-o-splc-out] [data-o-splc-pan="b"]{transform:translateY(101%)}',
    '[data-o-splc-seam]{position:absolute;background:currentColor;opacity:0.18;transition:opacity 240ms ease}',
    '[data-o-splc-axis="h"] [data-o-splc-seam]{top:0;bottom:0;left:50%;width:1px}',
    '[data-o-splc-axis="v"] [data-o-splc-seam]{left:0;right:0;top:50%;height:1px}',
    '[data-o-splc-out] [data-o-splc-seam]{opacity:0}',
    '[data-o-splc-status]{',
    'position:absolute;inset:0;display:flex;align-items:center;justify-content:center;',
    'transition:opacity 260ms ease;',
    '}',
    '[data-o-splc-out] [data-o-splc-status]{opacity:0}',
  ].join('')
  document.head.append(style)
}

/**
 * Covers the page with two panels, then parts them.
 *
 * @example
 * <SplitCurtain label="Odoro" onDone={reveal} />
 *
 * @example
 * // Controlled by the caller: the panels leave when the scene is drawn.
 * <SplitCurtain open={!sceneDrawn} axis="vertical" onDone={reveal} />
 */
export function SplitCurtain({
  background = 'var(--o-theme-bg)',
  ink = 'var(--o-theme-fg)',
  label,
  status = 'Loading',
  axis = 'horizontal',
  holdMs = 1200,
  exitMs = 900,
  open,
  contained = false,
  onDone,
  ...rest
}: SplitCurtainProps): ReactElement | null {
  const { reduced } = useMotionState()
  const [exiting, setExiting] = useState(false)
  const [gone, setGone] = useState(false)

  // In a ref: the exit announces itself only once, and one more render must
  // not replay the callback.
  const announced = useRef(false)
  const callback = useRef(onDone)
  callback.current = onDone

  ensureSplitCurtainRule()

  useEffect(() => {
    const announce = (): void => {
      if (announced.current) return
      announced.current = true
      callback.current?.()
    }

    // Reduced motion: the exit is immediate. What the curtain brought was the
    // gesture; what it would cost here would be a wait with nothing in
    // return.
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

  // The removal from the DOM, once the gesture is over. A timer rather than
  // `transitionend`: the event bubbles up from any child, and the label's one
  // — shorter than the translation — would arrive first.
  useEffect(() => {
    if (!exiting) return

    const timer = window.setTimeout(() => {
      setGone(true)
    }, exitMs + 40)

    return () => {
      window.clearTimeout(timer)
    }
  }, [exiting, exitMs])

  // The scroll lock, only when the curtain covers the window. Inside a frame
  // there is nothing to lock: the page around it stays usable.
  useEffect(() => {
    if (contained || gone || reduced) return

    // A COUNTING lock, not a memorising one. Two curtains can overlap — hot
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

    // The safety net. Longer than the ceiling of any curtain, so invisible in
    // normal operation: it only exists so that a delay can never leave the
    // page without scrolling.
    const safety = window.setTimeout(release, 8000)

    return () => {
      window.clearTimeout(safety)
      release()
    }
  }, [contained, gone, reduced])

  if (gone) return null

  const { className, style } = mergePresentation({}, rest)

  const curtainStyle = {
    ...style,
    '--o-splc-bg': background,
    '--o-splc-ink': ink,
    '--o-splc-exit': `${String(exitMs)}ms`,
  } as CSSProperties

  return (
    <div
      {...rest}
      className={className}
      style={curtainStyle}
      data-o-splc=""
      data-o-splc-axis={axis === 'vertical' ? 'v' : 'h'}
      {...(exiting ? { 'data-o-splc-out': '' } : {})}
      {...(contained ? { 'data-o-splc-contained': '' } : {})}
    >
      {/* Decoration is not content: it must not be read. */}
      <div aria-hidden="true">
        <div data-o-splc-pan="a" />
        <div data-o-splc-pan="b" />
        <div data-o-splc-seam="" />
      </div>

      <div data-o-splc-status="" role="status">
        {status.length > 0 && <span className="o-sr-only">{status}</span>}
        {label}
      </div>
    </div>
  )
}

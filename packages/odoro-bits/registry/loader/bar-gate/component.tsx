/**
 * Segmented bar curtain, which folds back into the line that measured it.
 *
 * ## A bar that measures time, and says so
 *
 * `counter-gate` shows a percentage, and therefore takes it upon itself never
 * to lie: its counter follows a real availability. This bar claims nothing of
 * the sort — it shows **no figure at all**, and that is deliberate: what it
 * fills is a duration, not a load.
 *
 * The distinction is not cosmetic. A percentage is a verifiable claim; a bar
 * without a figure is a sign of patience. Dropping the figures is the honest
 * way to have a bar when there is nothing to measure, and that is the case for
 * most entrance curtains.
 *
 * The segments say the same thing: a continuous bar reads as a fine
 * measurement, a bar in twenty cells reads as a countdown. The last segment
 * lights up progressively — a cell's opacity is its filled share — which
 * avoids the jolt of a cell appearing all at once.
 *
 * ## The engine clock, not a `setInterval`
 *
 * The progress comes from the engine's single loop. An interval beats against
 * the screen's refresh rate and produces a bar that advances in fits and
 * starts; and two competing loops in one page render in an undetermined order.
 *
 * The value is written into a CSS variable on the node, not into React state:
 * a bar at sixty frames per second would mean sixty renders per second for a
 * value React has no need of.
 *
 * ## A ceiling, when the caller is in control
 *
 * In controlled mode, the bar **parks** below a ceiling instead of crossing
 * it, and stays there as long as `open` is true. A bar that reached the end
 * and then waited would say it was over when it is not. Once released, it
 * finishes its run at the same speed: the last fraction takes the time it
 * would have taken.
 *
 * ## The exit: the curtain retreats into its own line
 *
 * The plate does not slide and does not fade out: it **flattens onto the
 * bar**, squashing towards the median line. The curtain vanishes into the
 * object that measured it; the bar fades last, once there is nothing left
 * around it.
 *
 * ## The exit starts at the BEGINNING, not after
 *
 * `onDone` is called the moment the plate **starts** to flatten. The content
 * enters during the squash; waiting for the end would give two gestures one
 * after the other where only one was wanted.
 *
 * ## Contained or fullscreen
 *
 * By default the curtain is `fixed`, covers the window and locks the
 * document's scrolling. With `contained`, it becomes `absolute`, resolves
 * against the first positioned ancestor and no longer touches scrolling.
 *
 * @module
 */

import {
  clock,
  mergePresentation,
  useMotionState,
  type Customisable,
} from '@odoro-cli/engine'
import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactElement,
  type ReactNode,
} from 'react'

/** Properties specific to the component. */
export interface BarGateOwnProps {
  /** The plate background. @defaultValue the theme background */
  background?: string
  /** The ink: the bar and the label. @defaultValue the theme ink */
  ink?: string
  /** What shows above the bar: a name, a brand. */
  label?: ReactNode
  /**
   * What screen readers announce. Empty string to announce only the label.
   *
   * @defaultValue 'Loading'
   */
  status?: string
  /** Number of segments in the bar. @defaultValue 20 */
  segments?: number
  /** Fill duration, in milliseconds. @defaultValue 1600 */
  holdMs?: number
  /** Squash duration, in milliseconds. @defaultValue 850 */
  exitMs?: number
  /**
   * Where the bar parks in controlled mode, as a percentage. No effect when
   * `open` is not given.
   *
   * @defaultValue 92
   */
  ceiling?: number
  /**
   * Controlled state: the curtain covers as long as this is `true`, and exits
   * on the first `false`. When it is given, the bar parks below `ceiling`
   * while it waits.
   */
  open?: boolean
  /** Covers the positioned parent rather than the window. @defaultValue false */
  contained?: boolean
  /** Called at the **start** of the exit. See the module header. */
  onDone?: () => void
}

/** All the properties. */
export type BarGateProps = Customisable<BarGateOwnProps, 'div'>

/** Identifier of the injected stylesheet. */
const STYLE_ID = 'o-bar-gate'

/** Sets the bar and plate rules, once per document. */
function ensureBarGateRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-barg]{',
    'position:fixed;inset:0;z-index:9999;overflow:hidden;',
    'color:var(--o-barg-ink);',
    '}',
    '[data-o-barg][data-o-barg-contained]{position:absolute}',
    '[data-o-barg][data-o-barg-out]{pointer-events:none}',
    // The plate squashes towards its median line, where the bar sits.
    '[data-o-barg-plate]{',
    'position:absolute;inset:0;background:var(--o-barg-bg);',
    'transform-origin:50% 50%;transform:scaleY(1);',
    'transition:transform var(--o-barg-exit) cubic-bezier(0.7,0,0.3,1);',
    '}',
    '[data-o-barg-out] [data-o-barg-plate]{transform:scaleY(0)}',
    '[data-o-barg-bar]{',
    'position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);',
    'display:flex;gap:2px;width:min(20rem,62%);',
    'transition:opacity calc(var(--o-barg-exit) * 0.45) ease calc(var(--o-barg-exit) * 0.55);',
    '}',
    '[data-o-barg-out] [data-o-barg-bar]{opacity:0}',
    // A segment's filled share becomes its opacity: the cell in progress
    // lights up instead of appearing.
    '[data-o-barg-seg]{',
    'flex:1;height:3px;background:currentColor;',
    'opacity:clamp(0.12,calc(var(--o-barg-p) * var(--o-barg-n) - var(--o-barg-i)),1);',
    '}',
    // On the way out, the bar is full by rule and not by variable: the React
    // render that accompanies the switch to the exit state rewrites the
    // node's inline style, and would put the variable back to its initial
    // value.
    '[data-o-barg-out] [data-o-barg-seg]{opacity:1}',
    '[data-o-barg-mark]{',
    'position:absolute;left:0;right:0;bottom:calc(50% + 2.2rem);text-align:center;',
    'transition:opacity 220ms ease;',
    '}',
    '[data-o-barg-out] [data-o-barg-mark]{opacity:0}',
  ].join('')
  document.head.append(style)
}

/**
 * Covers the page, fills a bar, then squashes into it.
 *
 * @example
 * <BarGate label="Odoro" onDone={reveal} />
 *
 * @example
 * // Controlled: the bar parks at 92 % until the scene is drawn.
 * <BarGate open={!sceneDrawn} segments={32} onDone={reveal} />
 */
export function BarGate({
  background = 'var(--o-theme-bg)',
  ink = 'var(--o-theme-fg)',
  label,
  status = 'Loading',
  segments = 20,
  holdMs = 1600,
  exitMs = 850,
  ceiling = 92,
  open,
  contained = false,
  onDone,
  ...rest
}: BarGateProps): ReactElement | null {
  const { reduced } = useMotionState()
  const [exiting, setExiting] = useState(false)
  const [gone, setGone] = useState(false)
  const host = useRef<HTMLDivElement>(null)

  // In a ref: the exit announces itself only once, and one more render must
  // not replay the callback.
  const announced = useRef(false)
  const callback = useRef(onDone)
  callback.current = onDone

  // `open` lives in a ref because the loop reads it on every frame. Making it
  // a dependency of the effect would take the bar back to zero every time the
  // caller changes its mind.
  const openRef = useRef(open)
  openRef.current = open

  ensureBarGateRule()

  const cells = Math.max(4, Math.round(segments))

  useEffect(() => {
    const announce = (): void => {
      if (announced.current) return
      announced.current = true
      callback.current?.()
    }

    // Reduced motion: the exit is immediate. A bar that fills up is precisely
    // the motion the preference asks to leave out, and without it the curtain
    // has nothing left to say.
    if (reduced) {
      announce()
      setGone(true)
      return
    }

    const node = host.current
    let elapsed = 0

    const subscription = clock.subscribe(
      ({ delta }) => {
        // The ceiling only applies in controlled mode: without `open`, the bar
        // measures a duration and goes all the way.
        const free = openRef.current !== true
        const cap = free ? 1 : Math.min(0.99, ceiling / 100)

        // We bound the elapsed time, not just the displayed share: otherwise
        // the parked bar would pile up time in silence and jump to a hundred
        // as soon as it is released.
        elapsed = Math.min(elapsed + delta * 1000, cap * holdMs)
        const ratio = holdMs > 0 ? Math.min(1, elapsed / holdMs) : 1

        node?.style.setProperty('--o-barg-p', ratio.toFixed(4))

        if (ratio < 1) return

        subscription.unsubscribe()
        setExiting(true)
        announce()
      },
      { name: 'bar-gate' },
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [reduced, holdMs, ceiling])

  // A timer rather than `transitionend`: three transitions of different
  // durations start together, and the shortest one would report back here
  // first.
  useEffect(() => {
    if (!exiting) return

    const timer = window.setTimeout(() => {
      setGone(true)
    }, exitMs + 40)

    return () => {
      window.clearTimeout(timer)
    }
  }, [exiting, exitMs])

  // The scroll lock, only when the curtain covers the window.
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

  const gateStyle = {
    ...style,
    '--o-barg-bg': background,
    '--o-barg-ink': ink,
    '--o-barg-exit': `${String(exitMs)}ms`,
    '--o-barg-n': String(cells),
    '--o-barg-p': '0',
  } as CSSProperties

  return (
    <div
      {...rest}
      ref={host}
      className={className}
      style={gateStyle}
      data-o-barg=""
      {...(exiting ? { 'data-o-barg-out': '' } : {})}
      {...(contained ? { 'data-o-barg-contained': '' } : {})}
    >
      {/* The plate and the bar are decoration: the state is spoken by the
          status region, and a bar read segment by segment would say nothing. */}
      <div data-o-barg-plate="" aria-hidden="true" />
      <div data-o-barg-bar="" aria-hidden="true">
        {Array.from({ length: cells }, (_, index) => (
          <div
            key={index}
            data-o-barg-seg=""
            style={{ '--o-barg-i': String(index) } as CSSProperties}
          />
        ))}
      </div>

      <div data-o-barg-mark="" role="status">
        {status.length > 0 && <span className="o-sr-only">{status}</span>}
        {label}
      </div>
    </div>
  )
}

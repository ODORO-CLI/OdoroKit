/**
 * An opening curtain with an honest counter.
 *
 * ## A percentage has to measure something
 *
 * The flaw of almost every preloader: a `setTimeout` dressed up as progress.
 * The counter climbs from zero to a hundred in two seconds, whatever the
 * reality, and sits at 100 % while nothing is ready — or at 40 % while
 * everything has been ready for a long time.
 *
 * Here the counter follows `ready`. As long as that is not true, it **parks**
 * below a ceiling and stays there. If the resource never comes, the bar stops
 * at 92 % and does not lie. It is ugly, and it is exact: better a stuck
 * figure than a false one.
 *
 * Two speeds, then: a slow crawl towards the ceiling during the wait, a quick
 * run to a hundred once ready.
 *
 * ## A floor, and a ceiling
 *
 * **The floor** prevents flicker. On a warm cache, everything is ready in
 * forty milliseconds; without a floor, the visitor sees a curtain appear and
 * disappear — a jolt, not an entrance.
 *
 * **The duration ceiling** prevents the prison. A resource that never answers
 * would keep the visitor behind the curtain indefinitely. Past that delay, we
 * open: a page without its scene is better than a page one never sees.
 *
 * ## `onDone` fires at the **start** of the exit, not at its end
 *
 * This is the detail that separates a successful opening from a succession of
 * two animations. The content must enter **through** the curtain as it
 * leaves: if one waits for the curtain to be gone, the page stays empty for a
 * quarter of a second, then animates — two gestures, where one was wanted.
 *
 * ## It does not hold the content back, it covers it
 *
 * The curtain is an overlay. The page is mounted underneath from the first
 * render, hidden by its own initial states. Not mounting the content would be
 * simpler, and would cost three things: indexing engines do not see it,
 * screen readers do not either, and the splitting of the texts would happen
 * at reveal time — that is, during the very frame where one can least afford
 * it.
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

/** Props specific to the component. */
export interface CounterGateOwnProps {
  /**
   * The curtain background.
   *
   * A value, not a role token: the system has none. It ships raw scales, and
   * it is up to the component to say which one it takes.
   *
   * @defaultValue the darkest of the neutral scale
   */
  background?: string
  /** The curtain ink. @defaultValue the lightest of the neutral scale */
  ink?: string
  /**
   * What is really being waited on.
   *
   * Passing `true` straight away gives a courtesy curtain that holds the
   * floor then opens. Wiring it to the first drawn frame of a scene gives a
   * counter that tells the truth.
   *
   * @defaultValue true
   */
  ready?: boolean
  /** What shows in the centre: a name, a brand. */
  label?: ReactNode
  /**
   * Minimum display time, in milliseconds.
   *
   * @defaultValue 900
   */
  minVisibleMs?: number
  /**
   * Beyond that, we open whatever happens.
   *
   * @defaultValue 6000
   */
  maxMs?: number
  /**
   * Where the counter parks as long as nothing is ready, as a percentage.
   *
   * @defaultValue 92
   */
  ceiling?: number
  /** Hides the percentage, and keeps only the bar. */
  hideCount?: boolean
  /**
   * Called at the **start** of the exit. See the module header.
   */
  onDone?: () => void
}

/** All props. */
export type CounterGateProps = Customisable<CounterGateOwnProps, 'div'>

/** Id of the injected stylesheet. */
const STYLE_ID = 'o-counter-gate'

/** Sets the curtain rules, once per document. */
function ensureCounterGateRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-gate]{',
    'position:fixed;inset:0;z-index:9999;',
    'display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1.5rem;',
    'background:var(--o-gate-bg);color:var(--o-gate-ink);',
    'transition:transform var(--o-gate-exit) cubic-bezier(0.76,0,0.24,1);',
    '}',
    // The exit translates the curtain rather than making it disappear: an
    // opacity that falls lets the page show through, which gives the trick
    // away. A plane that leaves is an object, not a veil.
    '[data-o-gate-out]{transform:translateY(-100%)}',
    '[data-o-gate-bar]{',
    'position:relative;width:min(18rem,60vw);height:1px;',
    'background:color-mix(in oklch,currentColor 25%,transparent);',
    '}',
    '[data-o-gate-bar]::after{',
    'content:"";position:absolute;inset:0;',
    'transform-origin:left;transform:scaleX(var(--o-gate-p));',
    'background:currentColor;',
    '}',
    '[data-o-gate-count]{font-variant-numeric:tabular-nums;font-size:0.75rem;opacity:0.6}',
  ].join('')
  document.head.append(style)
}

/**
 * Covers the page until it is ready, then leaves.
 *
 * @example
 * // A courtesy curtain: nothing to wait for, but a real entrance.
 * <CounterGate label="Odoro" onDone={() => { setReady(true) }} />
 *
 * @example
 * // Wired to the first frame of a scene: the counter tells the truth.
 * <CounterGate ready={sceneDrawn} onDone={reveal} />
 */
export function CounterGate({
  background = 'var(--o-theme-bg)',
  ink = 'var(--o-theme-fg)',
  ready = true,
  label,
  minVisibleMs = 900,
  maxMs = 6000,
  ceiling = 92,
  hideCount = false,
  onDone,
  ...rest
}: CounterGateProps): ReactElement | null {
  const { reduced } = useMotionState()
  const [percent, setPercent] = useState(0)
  const [exiting, setExiting] = useState(false)
  const [gone, setGone] = useState(false)

  // In a ref: the exit must fire only once, and an extra render must not
  // replay it.
  const announced = useRef(false)
  const callback = useRef(onDone)
  callback.current = onDone

  ensureCounterGateRule()

  useEffect(() => {
    // Reduced motion: no curtain at all. What it brought was the gesture;
    // what it would cost would be a wait with nothing in return.
    if (reduced) {
      if (!announced.current) {
        announced.current = true
        callback.current?.()
      }
      setGone(true)
      return
    }

    const start = performance.now()
    let frame = 0
    let last = start

    // The value lives in a variable, not in state: without that the loop
    // would cause sixty renders per second for a figure that only changes a
    // hundred times. We only go back to React when the displayed integer
    // moves.
    let value = 0
    let shown = -1

    const step = (now: number) => {
      // The step is bounded: a tab brought back to the foreground after a
      // minute would give a huge delta and make the counter jump to a
      // hundred.
      const dt = Math.min((now - last) / 1000, 0.05)
      last = now

      const elapsed = now - start
      const isReady = ready || elapsed >= maxMs

      // Three regimes, and the floor is what separates the last two. Without
      // it, a warm cache brings the counter to a hundred in less time than
      // the minimum duration, and the exit would fire before it: the curtain
      // would flicker, which the floor was meant to prevent.
      const complete = isReady && elapsed >= minVisibleMs
      const target = complete ? 100 : isReady ? 99 : ceiling
      const speed = isReady ? 6 : 1.7

      value = complete && value >= 99.4 ? 100 : value + (target - value) * speed * dt

      const rounded = Math.round(value)
      if (rounded !== shown) {
        shown = rounded
        setPercent(value)
      }

      // The last value is pushed WITHOUT going through the integer test.
      // Without that, a value of 99.6 already rounds to a hundred and freezes
      // `shown`; the final jump to a hundred then no longer changes the
      // integer, `setPercent(100)` is never called, and the exit — which
      // waits for nothing else — never fires. The curtain stays on a counter
      // at a hundred, indefinitely.
      if (value >= 100) {
        setPercent(100)
        return
      }

      frame = requestAnimationFrame(step)
    }

    frame = requestAnimationFrame(step)

    return () => {
      cancelAnimationFrame(frame)
    }
  }, [ready, reduced, minVisibleMs, maxMs, ceiling])

  // The switch to the exit, kept apart from the loop: it depends only on the
  // state reached, and mixing it into the loop would make it depend on a
  // frame.
  useEffect(() => {
    if (reduced || exiting || percent < 100) return

    setExiting(true)

    // Here, and not at the end of the transition: the content must enter
    // through the curtain as it leaves.
    if (!announced.current) {
      announced.current = true
      callback.current?.()
    }
  }, [percent, exiting, reduced])

  if (gone) return null

  const { className, style } = mergePresentation({}, rest)

  const curtainStyle = {
    ...style,
    '--o-gate-p': String(Math.min(1, percent / 100)),
    '--o-gate-exit': '900ms',
    '--o-gate-bg': background,
    '--o-gate-ink': ink,
  } as CSSProperties

  return (
    <div
      {...rest}
      className={className}
      style={curtainStyle}
      data-o-gate=""
      {...(exiting ? { 'data-o-gate-out': '' } : {})}
      // The curtain is not content: it must not be read, and the page it
      // covers already is.
      aria-hidden="true"
      onTransitionEnd={() => {
        if (exiting) setGone(true)
      }}
    >
      {label !== undefined && <div>{label}</div>}
      <div data-o-gate-bar="" />
      {!hideCount && (
        <div data-o-gate-count="">{String(Math.round(percent)).padStart(3, '0')}</div>
      )}
    </div>
  )
}

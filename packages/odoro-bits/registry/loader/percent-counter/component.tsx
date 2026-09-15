/**
 * Percent counter: a number that climbs from zero to a hundred with a gentle
 * acceleration, holds, and starts again; or that joins the value it is
 * given.
 *
 * ## Two regimes, and which one is honest
 *
 * Without `value`, the counter loops: it is a sign of activity, not a
 * measure, and it does not pretend to be one — it goes back through zero,
 * which a real percentage never does. With `value`, it joins the given value
 * and stops there: every change is caught up smoothly from the number on
 * screen, without starting over from zero. That is the version to wire onto
 * a real progression; the first is the one that waits without knowing how
 * long.
 *
 * The climb accelerates then brakes: a linear number reads like a stopwatch,
 * and a stopwatch promises an end that can be computed.
 *
 * ## The number is written into the DOM, not into state
 *
 * The counter advances on every frame of the engine loop. Going through
 * React state would trigger one render per frame for a number that only
 * changes a hundred or so times per cycle. The text node is therefore
 * written directly, by ref, and only when the displayed integer moves.
 *
 * The engine loop rather than a timer: a fixed interval beats against the
 * refresh rate of the screen and produces a number that jumps in fits.
 *
 * ## A status, not a drawing
 *
 * The element carries `role="status"` and a label for screen readers. The
 * number is removed from the accessibility tree: inside a status region,
 * every one of its changes would be announced.
 *
 * Under reduced motion, the number is frozen: on the given value, or at
 * zero when there is none. A counter frozen at a hundred would say it is
 * over; at zero, it still says the wait.
 *
 * @module
 */

import {
  clock,
  mergePresentation,
  useMotionState,
  type Customisable,
} from '@odoro-cli/engine'
import { useEffect, useRef, type CSSProperties, type ReactElement } from 'react'

/** Id of the injected stylesheet. */
const STYLE_ID = 'o-percent-counter'

/** Share of the climb added as a hold at a hundred, before starting again. */
const HOLD_SHARE = 0.3

/** Sets the number and its caption, once per document. */
function ensurePercentCounterRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-pc]{',
    'display:inline-flex;flex-direction:column;align-items:center;gap:0.45em;',
    'line-height:1;font-size:var(--o-pc-size);color:var(--o-pc-color);',
    '}',
    // Fixed-pitch figures, and a minimum width of three: going from 9 to 10
    // shifts nothing.
    '[data-o-pc-figure]{',
    'display:inline-flex;align-items:baseline;justify-content:flex-end;min-width:3.2ch;',
    'font-size:2.5em;font-weight:600;letter-spacing:-0.03em;font-variant-numeric:tabular-nums;',
    '}',
    '[data-o-pc-unit]{font-size:0.4em;margin-left:0.12em;opacity:0.55}',
    '[data-o-pc-text]{font-size:0.7em;letter-spacing:0.18em;text-transform:uppercase;opacity:0.6}',
  ].join('')
  document.head.append(style)
}

/** Acceleration then braking, for a climb that does not read like a stopwatch. */
function easeInOut(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}

/** Braking alone, to join a value without overshooting it. */
function easeOut(t: number): number {
  return 1 - Math.pow(1 - t, 3)
}

/** The component's own props. */
export interface PercentCounterOwnProps {
  /** The caption under the number. Empty string to keep only the number. @defaultValue 'Loading' */
  text?: string
  /**
   * Real progression, from 0 to 100.
   *
   * Without it, the counter loops and does not pretend to measure. With it,
   * it joins the value and stops there.
   */
  value?: number
  /** Reference body size, in pixels; the number is two and a half times that. @defaultValue 16 */
  size?: number
  /** Duration of a climb from zero to a hundred, or of a catch-up, in milliseconds. @defaultValue 2400 */
  speed?: number
  /** Color of the number and the caption. @defaultValue the text color */
  color?: string
  /** Label announced to screen readers. @defaultValue 'Loading' */
  label?: string
}

/** All props. */
export type PercentCounterProps = Customisable<PercentCounterOwnProps, 'span'>

/**
 * Signals a wait with a percentage that climbs.
 *
 * @example
 * // Without a value: the counter loops, a sign of activity.
 * <PercentCounter />
 *
 * @example
 * // Wired onto a real progression: it joins it and stops there.
 * <PercentCounter value={progress} text="Envoi" color="var(--o-palette-brand-500)" />
 */
export function PercentCounter({
  text = 'Loading',
  value,
  size = 16,
  speed = 2400,
  color = 'currentColor',
  label = 'Loading',
  ...rest
}: PercentCounterProps): ReactElement {
  ensurePercentCounterRule()
  const { reduced } = useMotionState()
  const figure = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const node = figure.current
    if (node === null) return

    // We only write when the displayed integer changes: one write per frame
    // for the same string would be pointless layout work.
    let shown = -1
    const write = (amount: number): void => {
      const whole = Math.round(amount)
      if (whole === shown) return
      shown = whole
      node.textContent = String(whole)
    }

    const target = value === undefined ? undefined : Math.max(0, Math.min(100, value))

    if (reduced) {
      write(target ?? 0)
      return
    }

    // The catch-up starts from the displayed number, not from zero: a change
    // of value is a continuation, not a new start.
    const from = Number(node.textContent ?? '') || 0
    let elapsed = 0

    const subscription = clock.subscribe(
      ({ delta }) => {
        elapsed += delta * 1000

        if (target !== undefined) {
          const progress = Math.min(1, elapsed / speed)
          write(from + (target - from) * easeOut(progress))
          if (progress >= 1) subscription.unsubscribe()
          return
        }

        const cycle = speed * (1 + HOLD_SHARE)
        const local = elapsed % cycle
        write(easeInOut(Math.min(1, local / speed)) * 100)
      },
      { name: 'percent-counter' },
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [value, speed, reduced])

  const { className, style } = mergePresentation({}, rest)

  const loaderStyle = {
    ...style,
    '--o-pc-size': `${String(size)}px`,
    '--o-pc-color': color,
  } as CSSProperties

  return (
    <span {...rest} className={className} style={loaderStyle} data-o-pc="" role="status">
      <span className="o-sr-only">{label}</span>
      <span aria-hidden data-o-pc-figure="">
        <span ref={figure}>0</span>
        <span data-o-pc-unit="">%</span>
      </span>
      {text.length > 0 && (
        <span aria-hidden data-o-pc-text="">
          {text}
        </span>
      )}
    </span>
  )
}

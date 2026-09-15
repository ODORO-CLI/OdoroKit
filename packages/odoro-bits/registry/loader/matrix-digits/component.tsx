/**
 * Digits that freeze: a code whose digits all spin, then lock one by one
 * from left to right, hold, and start over.
 *
 * ## The locking is the only information
 *
 * Digits spinning endlessly are noise: nothing in them advances. What makes
 * this code a loader is the lock. Each slot stops turning in its turn, from
 * left to right, and the eye follows the front as it progresses just as it
 * would follow a bar. The complete code holds for a moment, long enough to
 * be read as a result, then everything starts again: it is a loop, and it
 * does not pretend to measure.
 *
 * The spin changes digit at a fixed cadence, not on every frame: at sixty
 * changes per second, the eye sees only grey; at twenty, it sees digits go
 * by. The tick is counted in time elapsed on the engine loop, which makes it
 * independent of the screen's cadence.
 *
 * ## The digits are written to the DOM, not to state
 *
 * Six slots changing twenty times a second would make a hundred and twenty
 * React renders per second for text nodes. Each slot is therefore written by
 * reference, and the lock is an attribute set on the slot, which the
 * stylesheet turns into full ink.
 *
 * ## A status, not a drawing
 *
 * The element carries `role="status"` and a label for screen readers. The
 * code is removed from the accessibility tree: its digits carry no meaning,
 * and inside a status region each one would be announced.
 *
 * Under reduced motion, the code is locked straight away: the figure still
 * reads as a loader, only the spin stops.
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
const STYLE_ID = 'o-matrix-digits'

/** Share of the cycle where everything spins, before the first lock. */
const SPIN_SHARE = 0.3

/** Share of the cycle over which the locks land, from left to right. */
const LOCK_SHARE = 0.45

/** Interval between two digits of a spinning slot, in milliseconds. */
const TICK_MS = 50

/** Sets the code and its caption, once per document. */
function ensureMatrixDigitsRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-md]{',
    'display:inline-flex;flex-direction:column;align-items:center;gap:0.5em;',
    'line-height:1;font-size:var(--o-md-size);color:var(--o-md-color);',
    '}',
    '[data-o-md-code]{',
    'display:inline-flex;gap:0.2em;font-family:var(--o-font-mono);font-size:1.5em;font-weight:600;',
    '}',
    // A spinning slot is half-ink on a light background; locked, it goes to
    // full ink and its background strengthens.
    '[data-o-md-slot]{',
    'display:inline-block;min-width:1ch;text-align:center;padding:0.2em 0.12em;border-radius:0.15em;',
    'opacity:0.4;background:color-mix(in oklab,currentColor 8%,transparent);',
    'transition:opacity 120ms,background-color 120ms;',
    '}',
    '[data-o-md-slot][data-o-md-locked]{opacity:1;background:color-mix(in oklab,currentColor 16%,transparent)}',
    '[data-o-md-text]{font-size:0.7em;letter-spacing:0.18em;text-transform:uppercase;opacity:0.6}',
  ].join('')
  document.head.append(style)
}

/** A random digit, different from the previous one so that each tick shows. */
function nextDigit(previous: number): number {
  const candidate = Math.floor(Math.random() * 9)
  return candidate >= previous ? candidate + 1 : candidate
}

/** Props specific to the component. */
export interface MatrixDigitsOwnProps {
  /** The caption under the code. Empty string to keep only the code. @defaultValue 'Loading' */
  text?: string
  /** Number of digits in the code. @defaultValue 6 */
  digits?: number
  /** Reference body size, in pixels; the digits are one and a half times that. @defaultValue 16 */
  size?: number
  /** Duration of one cycle — spin, locking and hold — in milliseconds. @defaultValue 2600 */
  speed?: number
  /** Colour of the digits and of the caption. @defaultValue the text colour */
  color?: string
  /** Label announced to screen readers. @defaultValue 'Loading' */
  label?: string
}

/** All props. */
export type MatrixDigitsProps = Customisable<MatrixDigitsOwnProps, 'span'>

/**
 * Signals a wait with a code of digits that lock.
 *
 * @example
 * <MatrixDigits />
 *
 * @example
 * // A short code, livelier, in the brand hue.
 * <MatrixDigits digits={4} speed={1800} color="var(--o-palette-brand-500)" />
 */
export function MatrixDigits({
  text = 'Loading',
  digits = 6,
  size = 16,
  speed = 2600,
  color = 'currentColor',
  label = 'Loading',
  ...rest
}: MatrixDigitsProps): ReactElement {
  ensureMatrixDigitsRule()
  const { reduced } = useMotionState()
  const count = Math.max(1, Math.round(digits))
  const slots = useRef<(HTMLSpanElement | null)[]>([])

  useEffect(() => {
    const nodes: HTMLSpanElement[] = []
    for (let index = 0; index < count; index += 1) {
      const node = slots.current[index]
      if (node !== null && node !== undefined) nodes.push(node)
    }
    if (nodes.length === 0) return

    const shown = nodes.map(() => 0)
    let targets = nodes.map(() => Math.floor(Math.random() * 10))

    const lock = (index: number): void => {
      const node = nodes[index]
      const target = targets[index]
      if (node === undefined || target === undefined) return
      shown[index] = target
      node.textContent = String(target)
      node.setAttribute('data-o-md-locked', '')
    }

    if (reduced) {
      nodes.forEach((_, index) => {
        lock(index)
      })
      return
    }

    const locked = nodes.map(() => false)
    let elapsed = 0
    let sinceTick = 0
    let cycleIndex = 0

    const subscription = clock.subscribe(
      ({ delta }) => {
        const step = delta * 1000
        elapsed += step
        sinceTick += step

        // New cycle: new code, every lock releases.
        const cycle = Math.floor(elapsed / speed)
        if (cycle !== cycleIndex) {
          cycleIndex = cycle
          targets = nodes.map(() => Math.floor(Math.random() * 10))
          locked.fill(false)
          for (const node of nodes) node.removeAttribute('data-o-md-locked')
        }

        const local = (elapsed - cycle * speed) / speed
        nodes.forEach((_, index) => {
          if (locked[index] === true) return
          const at = SPIN_SHARE + ((index + 1) / nodes.length) * LOCK_SHARE
          if (local >= at) {
            locked[index] = true
            lock(index)
          }
        })

        if (sinceTick < TICK_MS) return
        sinceTick = 0
        nodes.forEach((node, index) => {
          if (locked[index] === true) return
          const digit = nextDigit(shown[index] ?? 0)
          shown[index] = digit
          node.textContent = String(digit)
        })
      },
      { name: 'matrix-digits' },
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [count, speed, reduced])

  const { className, style } = mergePresentation({}, rest)

  const loaderStyle = {
    ...style,
    '--o-md-size': `${String(size)}px`,
    '--o-md-color': color,
  } as CSSProperties

  return (
    <span {...rest} className={className} style={loaderStyle} data-o-md="" role="status">
      <span className="o-sr-only">{label}</span>
      <span aria-hidden data-o-md-code="">
        {Array.from({ length: count }, (_, index) => (
          <span
            key={index}
            data-o-md-slot=""
            ref={(node) => {
              slots.current[index] = node
            }}
          >
            0
          </span>
        ))}
      </span>
      {text.length > 0 && (
        <span aria-hidden data-o-md-text="">
          {text}
        </span>
      )}
    </span>
  )
}

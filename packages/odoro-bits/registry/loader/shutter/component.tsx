/**
 * Curtain of vertical blades leaving alternately upwards and downwards.
 *
 * ## The alternation is the whole point
 *
 * Blades all rising together give a curtain going up — `counter-gate` already
 * does that, in a single block and for less. What justifies cutting the plate
 * up is that the blades leave in **opposite directions**: every other one
 * upwards, the rest downwards. The page then appears through a comb parting,
 * and not through a boundary moving up.
 *
 * It is also what makes the gesture legible on a wide frame: two opposite
 * directions show even when each blade is narrow, where a shared translation
 * reads as a plain fade upwards.
 *
 * ## A short offset, from the edge
 *
 * The blades do not leave together. The offset is deliberately shorter than
 * that of the blinds: there is no wave to tell here, only a need to keep
 * twelve blades from setting off within the same frame, which reads as a
 * single badly cut block.
 *
 * ## One pixel of overlap
 *
 * Each blade measures one pixel more than its exact share. On a width that
 * does not divide into a whole count of pixels, lines of background would
 * appear between them even before the gesture begins.
 *
 * ## The exit fires at the START, not after
 *
 * `onDone` is called when the first blade **begins** to leave. The content
 * comes in through the comb while it opens; waiting for the end would give two
 * gestures following one another where one was wanted.
 *
 * ## Contained or full screen
 *
 * By default the curtain is `fixed`, covers the window and locks the scrolling
 * of the document. With `contained`, it becomes `absolute`, resolves against
 * the first positioned ancestor and no longer touches scrolling.
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

/** Props of the component itself. */
export interface ShutterOwnProps {
  /** The background of the blades. @defaultValue the theme background */
  background?: string
  /** The ink of the label. @defaultValue the theme ink */
  ink?: string
  /** What is displayed at the centre during the wait: a name, a brand. */
  label?: ReactNode
  /**
   * What screen readers announce. Empty string to announce only the label.
   *
   * @defaultValue 'Loading'
   */
  status?: string
  /** Number of blades. @defaultValue 12 */
  blades?: number
  /** Offset between two blades, in milliseconds. @defaultValue 32 */
  stagger?: number
  /** How long the shutter stays closed, in milliseconds. @defaultValue 1200 */
  holdMs?: number
  /** Time for one blade to leave, in milliseconds. @defaultValue 750 */
  exitMs?: number
  /**
   * Controlled state: the shutter covers as long as this is `true`, and opens
   * on the first `false`. When given, it replaces `holdMs`.
   */
  open?: boolean
  /** Covers the positioned parent rather than the window. @defaultValue false */
  contained?: boolean
  /** Called at the **start** of the exit. See the module header. */
  onDone?: () => void
}

/** All the props. */
export type ShutterProps = Customisable<ShutterOwnProps, 'div'>

/** Identifier of the injected stylesheet. */
const STYLE_ID = 'o-shutter'

/** Sets up the rules of the shutter, once per document. */
function ensureShutterRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-shut]{',
    'position:fixed;inset:0;z-index:9999;overflow:hidden;',
    'color:var(--o-shut-ink);',
    '}',
    '[data-o-shut][data-o-shut-contained]{position:absolute}',
    '[data-o-shut][data-o-shut-out]{pointer-events:none}',
    '[data-o-shut-blade]{',
    'position:absolute;top:0;bottom:0;',
    'left:calc(var(--o-shut-i) * 100% / var(--o-shut-n));',
    'width:calc(100% / var(--o-shut-n) + 1px);',
    'background:var(--o-shut-bg);',
    'transition:transform var(--o-shut-exit) cubic-bezier(0.76,0,0.24,1) var(--o-shut-d);',
    '}',
    // The direction is carried by an attribute rather than a variable: two
    // fixed rules are better than a sign computation in every transform.
    '[data-o-shut-out] [data-o-shut-blade="up"]{transform:translateY(-101%)}',
    '[data-o-shut-out] [data-o-shut-blade="down"]{transform:translateY(101%)}',
    '[data-o-shut-status]{',
    'position:absolute;inset:0;display:flex;align-items:center;justify-content:center;',
    'transition:opacity 200ms ease;',
    '}',
    '[data-o-shut-out] [data-o-shut-status]{opacity:0}',
  ].join('')
  document.head.append(style)
}

/**
 * Covers the page with a shutter, then parts its blades.
 *
 * @example
 * <Shutter label="Odoro" onDone={ouvrir} />
 *
 * @example
 * // Few blades, wide, and an almost simultaneous departure.
 * <Shutter blades={6} stagger={12} onDone={ouvrir} />
 */
export function Shutter({
  background = 'var(--o-theme-bg)',
  ink = 'var(--o-theme-fg)',
  label,
  status = 'Loading',
  blades = 12,
  stagger = 32,
  holdMs = 1200,
  exitMs = 750,
  open,
  contained = false,
  onDone,
  ...rest
}: ShutterProps): ReactElement | null {
  const { reduced } = useMotionState()
  const [exiting, setExiting] = useState(false)
  const [gone, setGone] = useState(false)

  // In a ref: the exit only announces itself once, and one more render must
  // not replay the callback.
  const announced = useRef(false)
  const callback = useRef(onDone)
  callback.current = onDone

  ensureShutterRule()

  const count = Math.max(2, Math.round(blades))

  useEffect(() => {
    const announce = (): void => {
      if (announced.current) return
      announced.current = true
      callback.current?.()
    }

    // Reduced motion: the exit is immediate.
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

  // A timer, and not `transitionend`: twelve offset blades emit twelve events,
  // and the first one arrives when eleven still cover the screen.
  useEffect(() => {
    if (!exiting) return

    const timer = window.setTimeout(
      () => {
        setGone(true)
      },
      exitMs + (count - 1) * stagger + 40,
    )

    return () => {
      window.clearTimeout(timer)
    }
  }, [exiting, exitMs, count, stagger])

  // The scroll lock, only when the shutter covers the window.
  useEffect(() => {
    if (contained || gone || reduced) return

    // A COUNTED lock, not a remembered one. Two curtains can overlap — hot
    // reload, navigation, concurrent rendering — and the second one would then
    // remember the value set by the first, "hidden", to restore it on the way
    // out: the page would stay stuck with neither error nor trace.
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

    // The failsafe. Longer than the cap of any curtain, and so invisible in
    // normal operation: it only exists so that a delay can never leave the
    // page without scrolling.
    const failsafe = window.setTimeout(release, 8000)

    return () => {
      window.clearTimeout(failsafe)
      release()
    }
  }, [contained, gone, reduced])

  if (gone) return null

  const { className, style } = mergePresentation({}, rest)

  const shutterStyle = {
    ...style,
    '--o-shut-bg': background,
    '--o-shut-ink': ink,
    '--o-shut-exit': `${String(exitMs)}ms`,
    '--o-shut-n': String(count),
  } as CSSProperties

  return (
    <div
      {...rest}
      className={className}
      style={shutterStyle}
      data-o-shut=""
      {...(exiting ? { 'data-o-shut-out': '' } : {})}
      {...(contained ? { 'data-o-shut-contained': '' } : {})}
    >
      {/* The blades are decor: they must not be read. */}
      <div aria-hidden="true">
        {Array.from({ length: count }, (_, index) => (
          <div
            key={index}
            data-o-shut-blade={index % 2 === 0 ? 'up' : 'down'}
            style={
              {
                '--o-shut-i': String(index),
                '--o-shut-d': `${String(index * stagger)}ms`,
              } as CSSProperties
            }
          />
        ))}
      </div>

      <div data-o-shut-status="" role="status">
        {status.length > 0 && <span className="o-sr-only">{status}</span>}
        {label}
      </div>
    </div>
  )
}

/**
 * Curtain of horizontal slats that tilt on their own axis.
 *
 * ## Tilt, not slide
 *
 * Every other curtain in the registry translates, pierces or wipes. This one
 * **pivots**: each slat turns a quarter turn around its median axis, and
 * vanishes by going edge-on. It is the only gesture of the lot that gives the
 * plate a thickness — one understands the curtain was an object, not a layer
 * of color.
 *
 * The rotation lives in a perspective set on the container, not on each slat:
 * one perspective per slat would give each of them its own vanishing point,
 * and the top slats would not lean the same way as the bottom ones. A single
 * vanishing point, then, and a blind that looks like a blind.
 *
 * ## The stagger is what makes it readable
 *
 * The slats do not leave together. A constant stagger, from top to bottom,
 * turns ten simultaneous rotations — unreadable — into a wave running down.
 * That stagger is what costs: the exit lasts `exitMs` **plus** the total
 * stagger, and the component accounts for it before pulling itself out of the
 * DOM.
 *
 * ## One pixel of overlap
 *
 * Each slat measures one pixel more than its exact share. On a height that
 * does not divide into a whole count of pixels, stripes of background would
 * appear between the slats before the gesture had even begun.
 *
 * ## The exit starts at the BEGINNING, not after
 *
 * `onDone` is called when the first slat **starts** to tilt. The content comes
 * in between the slats while they open; waiting for the end would give a
 * blind, a dead beat, then a page.
 *
 * ## Contained or full screen
 *
 * By default the curtain is `fixed`, covers the window and locks the document
 * scroll. With `contained`, it becomes `absolute`, resolves against the first
 * positioned ancestor and leaves the scroll alone.
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

/** The component's own props. */
export interface BlindsOwnProps {
  /** The background of the slats. @defaultValue the theme background */
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
  /** Number of slats. @defaultValue 10 */
  slats?: number
  /** Stagger between two slats, in milliseconds. @defaultValue 55 */
  stagger?: number
  /** How long the blind stays closed, in milliseconds. @defaultValue 1200 */
  holdMs?: number
  /** Duration of one slat's tilt, in milliseconds. @defaultValue 700 */
  exitMs?: number
  /**
   * Controlled state: the blind covers for as long as this is `true`, and
   * opens on the first `false`. When given, it replaces `holdMs`.
   */
  open?: boolean
  /** Covers the positioned parent rather than the window. @defaultValue false */
  contained?: boolean
  /** Called at the **start** of the exit. See the module header. */
  onDone?: () => void
}

/** All props. */
export type BlindsProps = Customisable<BlindsOwnProps, 'div'>

/** Id of the injected stylesheet. */
const STYLE_ID = 'o-blinds'

/** Sets the blind rules, once per document. */
function ensureBlindsRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-blind]{',
    'position:fixed;inset:0;z-index:9999;overflow:hidden;',
    'color:var(--o-blind-ink);',
    '}',
    '[data-o-blind][data-o-blind-contained]{position:absolute}',
    '[data-o-blind][data-o-blind-out]{pointer-events:none}',
    // A single perspective, on the rack: one vanishing point shared by all
    // the slats. See the header.
    '[data-o-blind-rack]{position:absolute;inset:0;perspective:1400px}',
    '[data-o-blind-slat]{',
    'position:absolute;left:0;right:0;',
    'top:calc(var(--o-blind-i) * 100% / var(--o-blind-n));',
    'height:calc(100% / var(--o-blind-n) + 1px);',
    'background:var(--o-blind-bg);',
    'transform-origin:50% 50%;transform:rotateX(0deg);',
    'transition:transform var(--o-blind-exit) cubic-bezier(0.65,0,0.35,1) var(--o-blind-d),',
    // Edge-on, a slat is still not zero pixels tall: render rounding leaves it
    // a hairline. So it fades out over the last third of its rotation, when it
    // is already no more than a line.
    'opacity calc(var(--o-blind-exit) * 0.3) linear',
    'calc(var(--o-blind-d) + var(--o-blind-exit) * 0.7);',
    '}',
    '[data-o-blind-out] [data-o-blind-slat]{transform:rotateX(-90deg);opacity:0}',
    '[data-o-blind-status]{',
    'position:absolute;inset:0;display:flex;align-items:center;justify-content:center;',
    'transition:opacity 220ms ease;',
    '}',
    '[data-o-blind-out] [data-o-blind-status]{opacity:0}',
  ].join('')
  document.head.append(style)
}

/**
 * Covers the page with a blind, then tilts its slats away.
 *
 * @example
 * <Blinds label="Odoro" onDone={reveal} />
 *
 * @example
 * // Many thin slats, a fast wave.
 * <Blinds slats={18} stagger={30} exitMs={520} onDone={reveal} />
 */
export function Blinds({
  background = 'var(--o-theme-bg)',
  ink = 'var(--o-theme-fg)',
  label,
  status = 'Loading',
  slats = 10,
  stagger = 55,
  holdMs = 1200,
  exitMs = 700,
  open,
  contained = false,
  onDone,
  ...rest
}: BlindsProps): ReactElement | null {
  const { reduced } = useMotionState()
  const [exiting, setExiting] = useState(false)
  const [gone, setGone] = useState(false)

  // In a ref: the exit announces itself only once, and one more render must
  // not replay the callback.
  const announced = useRef(false)
  const callback = useRef(onDone)
  callback.current = onDone

  ensureBlindsRule()

  const count = Math.max(2, Math.round(slats))

  useEffect(() => {
    const announce = (): void => {
      if (announced.current) return
      announced.current = true
      callback.current?.()
    }

    // Reduced motion: the exit is immediate. The blind only brought a gesture,
    // and the gesture is what we are asked to leave out.
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

  // Removal from the DOM. A timer, and not `transitionend`: ten staggered
  // slats emit ten events, and the first one arrives while nine slats still
  // cover the screen.
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

  // The scroll lock, only when the blind covers the window.
  useEffect(() => {
    if (contained || gone || reduced) return

    // A lock COUNTS, it does not memorize. Two curtains can overlap — hot
    // reload, navigation, concurrent rendering — and the second would then
    // memorize the value set by the first, "hidden", to restore it on the way
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

    // The guardrail. Longer than the ceiling of any curtain, so invisible in
    // normal operation: it exists only so that a delay can never leave the
    // page without scrolling.
    const safety = window.setTimeout(release, 8000)

    return () => {
      window.clearTimeout(safety)
      release()
    }
  }, [contained, gone, reduced])

  if (gone) return null

  const { className, style } = mergePresentation({}, rest)

  const blindStyle = {
    ...style,
    '--o-blind-bg': background,
    '--o-blind-ink': ink,
    '--o-blind-exit': `${String(exitMs)}ms`,
    '--o-blind-n': String(count),
  } as CSSProperties

  return (
    <div
      {...rest}
      className={className}
      style={blindStyle}
      data-o-blind=""
      {...(exiting ? { 'data-o-blind-out': '' } : {})}
      {...(contained ? { 'data-o-blind-contained': '' } : {})}
    >
      {/* The slats are decor: they must not be read out. */}
      <div data-o-blind-rack="" aria-hidden="true">
        {Array.from({ length: count }, (_, index) => (
          <div
            key={index}
            data-o-blind-slat=""
            style={
              {
                '--o-blind-i': String(index),
                '--o-blind-d': `${String(index * stagger)}ms`,
              } as CSSProperties
            }
          />
        ))}
      </div>

      <div data-o-blind-status="" role="status">
        {status.length > 0 && <span className="o-sr-only">{status}</span>}
        {label}
      </div>
    </div>
  )
}

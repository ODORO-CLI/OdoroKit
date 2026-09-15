/**
 * Veil that clears away after a delay.
 *
 * ## The only curtain of the set allowed to be a veil
 *
 * The other curtains of the registry refuse opacity, and for a good reason: a
 * plate that fades lets the page show through it, which gives away that there
 * had never been a plate. So they take on shapes — a hole, two panels, slats —
 * to stay objects to the end.
 *
 * This one owns up to the opposite. It does not claim to be an object: it is a
 * veil, it behaves like a veil, and that is exactly what one wants when the
 * entrance must tell no story — a dashboard, a tool, a page where the curtain
 * is a courtesy and not a staging. Candour is worth more here than shape.
 *
 * It is also the cheapest of the set: one element, one animated property, the
 * one the compositor handles best.
 *
 * ## The blur is optional, and it has a price
 *
 * With `blurPx`, the veil becomes frosted: the background is made partly
 * transparent and the backdrop filter blurs the page underneath, then relaxes
 * to zero. The focus pulling itself into place is a fine gesture, and it
 * costs: `backdrop-filter` makes the layer recompose on every frame, which
 * opacity alone does not. So it stays at zero by default, and the filter is
 * not even declared as long as it is not asked for.
 *
 * ## The exit fires at the START, not after
 *
 * `onDone` is called when the veil **begins** to clear. The content comes in
 * while it lightens; waiting for the end would give a veil, a dead moment,
 * then a page starting to animate.
 *
 * ## Contained or full screen
 *
 * By default the veil is `fixed`, covers the window and locks the scrolling of
 * the document. With `contained`, it becomes `absolute`, resolves against the
 * first positioned ancestor and no longer touches scrolling.
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
export interface FadeGateOwnProps {
  /** The background of the veil. @defaultValue the theme background */
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
  /**
   * Backdrop blur, in pixels. Zero leaves an opaque and free veil; beyond
   * that, the veil becomes frosted and has a price. See the header.
   *
   * @defaultValue 0
   */
  blurPx?: number
  /** How long the veil stays solid, in milliseconds. @defaultValue 1000 */
  holdMs?: number
  /** Duration of the clearing, in milliseconds. @defaultValue 700 */
  exitMs?: number
  /**
   * Controlled state: the veil covers as long as this is `true`, and clears on
   * the first `false`. When given, it replaces `holdMs`.
   */
  open?: boolean
  /** Covers the positioned parent rather than the window. @defaultValue false */
  contained?: boolean
  /** Called at the **start** of the exit. See the module header. */
  onDone?: () => void
}

/** All the props. */
export type FadeGateProps = Customisable<FadeGateOwnProps, 'div'>

/** Identifier of the injected stylesheet. */
const STYLE_ID = 'o-fade-gate'

/** Sets up the rules of the veil, once per document. */
function ensureFadeGateRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-fadeg]{',
    'position:fixed;inset:0;z-index:9999;overflow:hidden;',
    'color:var(--o-fadeg-ink);',
    'opacity:1;transition:opacity var(--o-fadeg-exit) ease;',
    '}',
    '[data-o-fadeg][data-o-fadeg-contained]{position:absolute}',
    '[data-o-fadeg][data-o-fadeg-out]{opacity:0;pointer-events:none}',
    '[data-o-fadeg-veil]{position:absolute;inset:0;background:var(--o-fadeg-bg)}',
    // The frosting only exists if it was asked for: without the attribute, no
    // filter layer is created.
    '[data-o-fadeg-frost] [data-o-fadeg-veil]{',
    'background:color-mix(in oklab,var(--o-fadeg-bg) 76%,transparent);',
    'backdrop-filter:blur(var(--o-fadeg-blur));',
    'transition:backdrop-filter var(--o-fadeg-exit) ease;',
    '}',
    '[data-o-fadeg-frost][data-o-fadeg-out] [data-o-fadeg-veil]{backdrop-filter:blur(0px)}',
    '[data-o-fadeg-status]{',
    'position:absolute;inset:0;display:flex;align-items:center;justify-content:center;',
    '}',
  ].join('')
  document.head.append(style)
}

/**
 * Covers the page with a veil, then clears it away.
 *
 * @example
 * <FadeGate label="Odoro" onDone={ouvrir} />
 *
 * @example
 * // Frosted: the page pulls into focus behind the veil.
 * <FadeGate blurPx={14} exitMs={900} onDone={ouvrir} />
 */
export function FadeGate({
  background = 'var(--o-theme-bg)',
  ink = 'var(--o-theme-fg)',
  label,
  status = 'Loading',
  blurPx = 0,
  holdMs = 1000,
  exitMs = 700,
  open,
  contained = false,
  onDone,
  ...rest
}: FadeGateProps): ReactElement | null {
  const { reduced } = useMotionState()
  const [exiting, setExiting] = useState(false)
  const [gone, setGone] = useState(false)

  // In a ref: the exit only announces itself once, and one more render must
  // not replay the callback.
  const announced = useRef(false)
  const callback = useRef(onDone)
  callback.current = onDone

  ensureFadeGateRule()

  useEffect(() => {
    const announce = (): void => {
      if (announced.current) return
      announced.current = true
      callback.current?.()
    }

    // Reduced motion: the exit is immediate. A courtesy veil without the
    // gesture is nothing more than a wait.
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

  // A timer rather than `transitionend`: the frosted veil animates two
  // properties, and the same code has to hold in both cases.
  useEffect(() => {
    if (!exiting) return

    const timer = window.setTimeout(() => {
      setGone(true)
    }, exitMs + 40)

    return () => {
      window.clearTimeout(timer)
    }
  }, [exiting, exitMs])

  // The scroll lock, only when the veil covers the window.
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
  const frosted = blurPx > 0

  const veilStyle = {
    ...style,
    '--o-fadeg-bg': background,
    '--o-fadeg-ink': ink,
    '--o-fadeg-exit': `${String(exitMs)}ms`,
    '--o-fadeg-blur': `${String(blurPx)}px`,
  } as CSSProperties

  return (
    <div
      {...rest}
      className={className}
      style={veilStyle}
      data-o-fadeg=""
      {...(exiting ? { 'data-o-fadeg-out': '' } : {})}
      {...(contained ? { 'data-o-fadeg-contained': '' } : {})}
      {...(frosted ? { 'data-o-fadeg-frost': '' } : {})}
    >
      {/* The veil is decor: it must not be read. */}
      <div data-o-fadeg-veil="" aria-hidden="true" />

      <div data-o-fadeg-status="" role="status">
        {status.length > 0 && <span className="o-sr-only">{status}</span>}
        {label}
      </div>
    </div>
  )
}

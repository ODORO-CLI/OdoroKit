/**
 * Curtain that dissolves into tiles, in a reproducible disorder.
 *
 * ## The disorder is computed, not drawn at random
 *
 * The order of disappearance comes from a deterministic shuffle of the index,
 * not from `Math.random`. Two reasons, and the second is the real one.
 *
 * The first: a server render and the client render must produce the same
 * document. A delay drawn at random at construction time would differ between
 * the two, and React would report a hydration mismatch.
 *
 * The second: real randomness makes clumps. Over two hundred tiles, it
 * regularly leaves whole areas leaving at the same time and others staying
 * put, and the dissolve then reads as a failure. The shuffle used here — a
 * golden step taken modulo the number of tiles — sends neighbouring indices far
 * away from one another: the result looks more random than randomness, because
 * it has no lumps.
 *
 * ## One pixel of overlap
 *
 * Each tile measures one pixel more than its exact share, in both directions.
 * Without this, a grid of twenty columns over a width that does not divide by
 * twenty gives a mesh of light lines visible even before the gesture begins.
 *
 * ## What the grid costs
 *
 * Twenty columns over twelve rows make two hundred and forty elements. It is
 * the only curtain of the set whose cost depends on a setting, and the only one
 * where raising the values has a limit: beyond six hundred tiles, compositing
 * the layer alone becomes noticeable on a modest machine. The bounds in the
 * meta take that ceiling into account.
 *
 * ## The exit fires at the START, not after
 *
 * `onDone` is called when the first tiles **begin** to leave. The content is
 * uncovered through the grid while it fills with holes; waiting for the end
 * would give two successive gestures where one was wanted.
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
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactElement,
  type ReactNode,
} from 'react'

/** Props of the component itself. */
export interface PixelDissolveOwnProps {
  /** The background of the tiles. @defaultValue the theme background */
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
  /** Number of columns. @defaultValue 20 */
  columns?: number
  /** Number of rows. @defaultValue 12 */
  rows?: number
  /** Spread of the departures, in milliseconds. @defaultValue 700 */
  spreadMs?: number
  /** How long the grid stays solid, in milliseconds. @defaultValue 1200 */
  holdMs?: number
  /** Time for one tile to disappear, in milliseconds. @defaultValue 420 */
  exitMs?: number
  /**
   * Controlled state: the grid covers as long as this is `true`, and dissolves
   * on the first `false`. When given, it replaces `holdMs`.
   */
  open?: boolean
  /** Covers the positioned parent rather than the window. @defaultValue false */
  contained?: boolean
  /** Called at the **start** of the exit. See the module header. */
  onDone?: () => void
}

/** All the props. */
export type PixelDissolveProps = Customisable<PixelDissolveOwnProps, 'div'>

/** Identifier of the injected stylesheet. */
const STYLE_ID = 'o-pixel-dissolve'

/**
 * Golden step, as a fraction of the turn.
 *
 * Multiplied modulo the number of tiles, it sends two neighbouring indices to
 * the two ends of the grid: it is the most evenly spread sequence there is, and
 * the reason why it beats a random draw. See the header.
 */
const GOLDEN = 0.618_033_988_75

/** Sets up the rules of the grid, once per document. */
function ensurePixelDissolveRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-pxd]{',
    'position:fixed;inset:0;z-index:9999;overflow:hidden;',
    'color:var(--o-pxd-ink);',
    '}',
    '[data-o-pxd][data-o-pxd-contained]{position:absolute}',
    '[data-o-pxd][data-o-pxd-out]{pointer-events:none}',
    '[data-o-pxd-cell]{',
    'position:absolute;',
    'left:calc(var(--o-pxd-x) * 100% / var(--o-pxd-cols));',
    'top:calc(var(--o-pxd-y) * 100% / var(--o-pxd-rows));',
    'width:calc(100% / var(--o-pxd-cols) + 1px);',
    'height:calc(100% / var(--o-pxd-rows) + 1px);',
    'background:var(--o-pxd-bg);',
    'transition:opacity var(--o-pxd-exit) linear var(--o-pxd-d),',
    'transform var(--o-pxd-exit) cubic-bezier(0.4,0,1,1) var(--o-pxd-d);',
    '}',
    // The tile does not merely fade out: it shrinks back slightly. Opacity
    // alone reads as a fade of the whole plane; a shrink says that each tile is
    // a piece.
    '[data-o-pxd-out] [data-o-pxd-cell]{opacity:0;transform:scale(0.55)}',
    '[data-o-pxd-status]{',
    'position:absolute;inset:0;display:flex;align-items:center;justify-content:center;',
    'transition:opacity 240ms ease;',
    '}',
    '[data-o-pxd-out] [data-o-pxd-status]{opacity:0}',
  ].join('')
  document.head.append(style)
}

/**
 * Covers the page with a grid, then dissolves it tile by tile.
 *
 * @example
 * <PixelDissolve label="Odoro" onDone={ouvrir} />
 *
 * @example
 * // Big tiles, tight dissolve.
 * <PixelDissolve columns={10} rows={6} spreadMs={400} onDone={ouvrir} />
 */
export function PixelDissolve({
  background = 'var(--o-theme-bg)',
  ink = 'var(--o-theme-fg)',
  label,
  status = 'Loading',
  columns = 20,
  rows = 12,
  spreadMs = 700,
  holdMs = 1200,
  exitMs = 420,
  open,
  contained = false,
  onDone,
  ...rest
}: PixelDissolveProps): ReactElement | null {
  const { reduced } = useMotionState()
  const [exiting, setExiting] = useState(false)
  const [gone, setGone] = useState(false)

  // In a ref: the exit only announces itself once, and one more render must
  // not replay the callback.
  const announced = useRef(false)
  const callback = useRef(onDone)
  callback.current = onDone

  ensurePixelDissolveRule()

  const cols = Math.max(2, Math.round(columns))
  const lines = Math.max(2, Math.round(rows))

  // The grid is memoised: it only depends on the settings, and rebuilding it
  // on every render would recreate two hundred objects for nothing.
  const tiles = useMemo(() => {
    const total = cols * lines
    return Array.from({ length: total }, (_, index) => ({
      x: index % cols,
      y: Math.floor(index / cols),
      delay: ((index * GOLDEN) % 1) * spreadMs,
    }))
  }, [cols, lines, spreadMs])

  useEffect(() => {
    const announce = (): void => {
      if (announced.current) return
      announced.current = true
      callback.current?.()
    }

    // Reduced motion: the exit is immediate. The grid only brought a gesture,
    // and the gesture is what we are being asked to leave out.
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

  // A timer, and not `transitionend`: two hundred and forty tiles emit as many
  // events, and the first one arrives when the grid is still almost full.
  useEffect(() => {
    if (!exiting) return

    const timer = window.setTimeout(
      () => {
        setGone(true)
      },
      exitMs + spreadMs + 40,
    )

    return () => {
      window.clearTimeout(timer)
    }
  }, [exiting, exitMs, spreadMs])

  // The scroll lock, only when the grid covers the window.
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

  const gridStyle = {
    ...style,
    '--o-pxd-bg': background,
    '--o-pxd-ink': ink,
    '--o-pxd-exit': `${String(exitMs)}ms`,
    '--o-pxd-cols': String(cols),
    '--o-pxd-rows': String(lines),
  } as CSSProperties

  return (
    <div
      {...rest}
      className={className}
      style={gridStyle}
      data-o-pxd=""
      {...(exiting ? { 'data-o-pxd-out': '' } : {})}
      {...(contained ? { 'data-o-pxd-contained': '' } : {})}
    >
      {/* The grid is decor: it must not be read. */}
      <div aria-hidden="true">
        {tiles.map((tile, index) => (
          <div
            key={index}
            data-o-pxd-cell=""
            style={
              {
                '--o-pxd-x': String(tile.x),
                '--o-pxd-y': String(tile.y),
                '--o-pxd-d': `${String(Math.round(tile.delay))}ms`,
              } as CSSProperties
            }
          />
        ))}
      </div>

      <div data-o-pxd-status="" role="status">
        {status.length > 0 && <span className="o-sr-only">{status}</span>}
        {label}
      </div>
    </div>
  )
}

/**
 * Double cursor: a crisp dot, a ring that catches up.
 *
 * ## The dot follows the event, the ring follows the loop
 *
 * The dot replaces the native cursor: any lag would show as an offset, so it
 * is written directly on pointer movement — two CSS variables, no React
 * render. The ring, on the other hand, lives entirely in its lag: the gap
 * between the dot and itself is what makes the effect. It reads the damped
 * position from the `usePointerDamped` hook inside a subscription to the loop,
 * and copies it into two other variables.
 *
 * ## The ring announces the interactive
 *
 * When hovering a link or a button — detected by `closest()` on `pointerover`,
 * which also covers the children of the interactive element — the ring grows.
 * The growth goes through the same loop as the position: a CSS transition on
 * the transform would break the tracking, which writes that transform on every
 * frame.
 *
 * ## Where the effect fades out
 *
 * On touch, there is no cursor to replace: nothing is shown, nothing is
 * hidden. Under reduced motion, a ring that trails is exactly the movement we
 * are asked to leave out: the native cursor is kept as it is.
 *
 * @module
 */

import {
  CLOCK_PRIORITY,
  clock,
  mergePresentation,
  useMotionState,
  type Customisable,
} from '@odoro-cli/engine'
import {
  useEffect,
  useState,
  type CSSProperties,
  type ReactElement,
  type ReactNode,
} from 'react'

import { usePointerDamped } from '@registre/hooks/usePointerDamped'

/** Properties specific to the component. */
export interface CursorRingOwnProps {
  /** Content of the area where the cursor is replaced. */
  children: ReactNode
  /** Diameter of the ring, in pixels. @defaultValue 36 */
  size?: number
  /** Lag of the ring: the higher, the more it trails. @defaultValue 1 */
  lag?: number
  /** Growth factor over interactive elements. @defaultValue 1.8 */
  grow?: number
  /** Colour of the dot and of the ring. @defaultValue the text colour */
  color?: string
}

/** All properties. */
export type CursorRingProps = Customisable<CursorRingOwnProps>

/** Identifier of the injected stylesheet. */
const STYLE_ID = 'o-cursor-ring'

/** What the ring considers interactive. */
const INTERACTIVE = 'a,button,[role=button]'

/** Sets the dot and the ring, once per document. */
function ensureCursorRingRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-cursor-ring]{position:relative;overflow:hidden}',
    // The native cursor only disappears once the replacement is there: before
    // the first mouse movement, nothing is hidden.
    '[data-o-cursor-ring][data-o-cursor-ring-on]{cursor:none}',
    '[data-o-cursor-ring][data-o-cursor-ring-on] *{cursor:none}',
    '[data-o-ring-dot],[data-o-ring-halo]{',
    'position:absolute;left:0;top:0;pointer-events:none;border-radius:50%;',
    'opacity:0;transition:opacity 150ms linear;',
    '}',
    '[data-o-ring-dot]{',
    'width:6px;height:6px;margin:-3px;background:var(--o-ring-color);',
    // Off screen by default: a dot placed at (0,0) before any movement would
    // show in the corner of the area.
    'transform:translate3d(var(--o-ring-dot-x,-100px),var(--o-ring-dot-y,-100px),0);',
    '}',
    '[data-o-ring-halo]{',
    'width:var(--o-ring-size);height:var(--o-ring-size);',
    'margin:calc(var(--o-ring-size) / -2);',
    'border:1.5px solid var(--o-ring-color);',
    'transform:translate3d(var(--o-ring-x,-200px),var(--o-ring-y,-200px),0) scale(var(--o-ring-grow,1));',
    '}',
    '[data-o-cursor-ring-on] [data-o-ring-dot],[data-o-cursor-ring-on] [data-o-ring-halo]{opacity:1}',
  ].join('')
  document.head.append(style)
}

/**
 * Replaces the native cursor of its area with a dot and a lagging ring.
 *
 * @example
 * <CursorRing className="o-rounded-xl o-p-8">
 *   <a href="/pricing">The ring grows over this link</a>
 * </CursorRing>
 *
 * @example
 * // A wide and lazy ring.
 * <CursorRing size={56} lag={2} grow={1.5}>
 *   <nav>…</nav>
 * </CursorRing>
 */
export function CursorRing({
  children,
  size = 36,
  lag = 1,
  grow = 1.8,
  color = 'currentColor',
  ...rest
}: CursorRingProps): ReactElement {
  const { reduced } = useMotionState()
  const [host, setHost] = useState<HTMLElement | null>(null)
  ensureCursorRingRule()

  // The lag is an inverted damping speed: lag 1 gives the visible catch-up
  // that makes the ring exist.
  const pointer = usePointerDamped({
    host,
    speed: 8 / Math.max(lag, 0.1),
    name: 'cursor-ring : pointer',
  })

  useEffect(() => {
    if (host === null || reduced) return

    // The size of the area is read on movement, not on every frame: querying
    // the geometry inside the loop would force a layout.
    const bounds = { width: 0, height: 0 }
    let targetScale = 1
    let scale = 1

    const onMove = (event: PointerEvent): void => {
      // On touch, there is no cursor to replace: see the header.
      if (event.pointerType !== 'mouse') return
      const box = host.getBoundingClientRect()
      bounds.width = box.width
      bounds.height = box.height
      host.style.setProperty(
        '--o-ring-dot-x',
        `${(event.clientX - box.left).toFixed(1)}px`,
      )
      host.style.setProperty(
        '--o-ring-dot-y',
        `${(event.clientY - box.top).toFixed(1)}px`,
      )
      host.setAttribute('data-o-cursor-ring-on', '')
    }

    const onLeave = (): void => {
      host.removeAttribute('data-o-cursor-ring-on')
    }

    const onOver = (event: PointerEvent): void => {
      const target = event.target
      if (!(target instanceof Element)) return
      targetScale = target.closest(INTERACTIVE) === null ? 1 : grow
    }

    host.addEventListener('pointermove', onMove, { passive: true })
    host.addEventListener('pointerleave', onLeave)
    host.addEventListener('pointerover', onOver)

    const subscription = clock.subscribe(
      ({ delta }) => {
        if (bounds.width === 0) return
        // From the hook's frame of reference (centred, [-1, 1]) to the pixels
        // of the area.
        const x = ((pointer.current.x + 1) / 2) * bounds.width
        const y = ((pointer.current.y + 1) / 2) * bounds.height
        const factor = 1 - Math.exp(-12 * delta)
        scale += (targetScale - scale) * factor
        host.style.setProperty('--o-ring-x', `${x.toFixed(1)}px`)
        host.style.setProperty('--o-ring-y', `${y.toFixed(1)}px`)
        host.style.setProperty('--o-ring-grow', scale.toFixed(3))
      },
      { name: 'cursor-ring : ring', priority: CLOCK_PRIORITY.default },
    )

    return () => {
      host.removeEventListener('pointermove', onMove)
      host.removeEventListener('pointerleave', onLeave)
      host.removeEventListener('pointerover', onOver)
      subscription.unsubscribe()
      host.removeAttribute('data-o-cursor-ring-on')
    }
  }, [host, reduced, grow, pointer])

  const { className, style } = mergePresentation({}, rest)

  const hostStyle = {
    ...style,
    '--o-ring-color': color,
    '--o-ring-size': `${String(size)}px`,
  } as CSSProperties

  return (
    <div
      {...rest}
      ref={setHost}
      className={className}
      style={hostStyle}
      data-o-cursor-ring=""
    >
      {children}
      {/* Under reduced motion, the replacement does not exist at all: the
          native cursor stays, and nothing trails behind it. */}
      {reduced ? null : (
        <>
          <span aria-hidden data-o-ring-dot="" />
          <span aria-hidden data-o-ring-halo="" />
        </>
      )}
    </div>
  )
}

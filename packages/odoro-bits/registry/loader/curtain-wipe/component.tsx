/**
 * Curtain without a counter: a plate that opens through a hole growing in it.
 *
 * ## Counting nothing is often the better choice
 *
 * `counter-gate` measures a real availability. When there is nothing to
 * measure — a page whose whole weight is already there, a site that simply
 * wants an entrance — a percentage would have nothing to say, and a percentage
 * with nothing to say lies.
 *
 * So we do not count. A mark, a plate, a duration owned up to. It is the more
 * expensive of the two curtains to the eye and the more honest, because it
 * promises no information.
 *
 * ## The opening is a shape, not a disappearance
 *
 * The plane does not fade: it gets **pierced**. A disc grows from the centre
 * until it overflows the screen, and the page appears inside it.
 *
 * It is done with `clip-path`, and therefore by the compositor: no layout is
 * recomputed during the opening. A falling opacity would let the page show
 * through the curtain and would give away that there had only ever been a
 * veil. A hole says there was a plate.
 *
 * ## `onDone` fires at the start of the opening
 *
 * As with the other curtain, and for the same reason: the content has to come
 * in while the hole widens. Waiting for the end gives two gestures following
 * one another instead of a single one unfolding.
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
export interface CurtainWipeOwnProps {
  /**
   * The background of the curtain.
   *
   * A value, not a role token: the system has none. It ships raw scales, and it
   * is up to the component to say which one it takes.
   *
   * @defaultValue the darkest of the neutral scale
   */
  background?: string
  /** The ink of the curtain. @defaultValue the lightest of the neutral scale */
  ink?: string
  /** What is displayed at the centre during the wait. */
  label?: ReactNode
  /**
   * How long the plate stays solid, in milliseconds.
   *
   * @defaultValue 1200
   */
  holdMs?: number
  /**
   * Duration of the opening, in milliseconds.
   *
   * @defaultValue 1000
   */
  wipeMs?: number
  /**
   * Where the hole starts from, as a percentage of the width and the height.
   *
   * @defaultValue [50, 50]
   */
  origin?: readonly [number, number]
  /** Called at the **start** of the opening. See the module header. */
  onDone?: () => void
}

/** All the props. */
export type CurtainWipeProps = Customisable<CurtainWipeOwnProps, 'div'>

/** Identifier of the injected stylesheet. */
const STYLE_ID = 'o-curtain-wipe'

/** Sets up the rules of the plate, once per document. */
function ensureCurtainRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-curtain]{',
    'position:fixed;inset:0;z-index:9999;',
    'display:flex;align-items:center;justify-content:center;',
    'background:var(--o-curtain-bg);color:var(--o-curtain-ink);',
    // The hole is closed at rest. `circle(0)` rather than `circle(0%)`: the
    // shape closes on a nil radius, not on a fraction of a reference that would
    // change with the aspect ratio of the screen.
    'clip-path:circle(140% at var(--o-curtain-x) var(--o-curtain-y));',
    'transition:clip-path var(--o-curtain-wipe) cubic-bezier(0.83,0,0.17,1);',
    '}',
    // The opening inverts the clipping: it is the curtain being pierced, so its
    // radius *shrinks* until it covers nothing.
    '[data-o-curtain-open]{clip-path:circle(0% at var(--o-curtain-x) var(--o-curtain-y))}',
    '[data-o-curtain-label]{transition:opacity 420ms ease}',
    '[data-o-curtain-open] [data-o-curtain-label]{opacity:0}',
  ].join('')
  document.head.append(style)
}

/**
 * Covers the page with a plate, then pierces it.
 *
 * @example
 * <CurtainWipe label="Odoro" onDone={ouvrir} />
 *
 * @example
 * // The hole starts from the top left corner, where the logo sits.
 * <CurtainWipe origin={[12, 18]} holdMs={800} onDone={ouvrir} />
 */
export function CurtainWipe({
  background = 'var(--o-theme-bg)',
  ink = 'var(--o-theme-fg)',
  label,
  holdMs = 1200,
  wipeMs = 1000,
  origin = [50, 50],
  onDone,
  ...rest
}: CurtainWipeProps): ReactElement | null {
  const { reduced } = useMotionState()
  const [open, setOpen] = useState(false)
  const [gone, setGone] = useState(false)

  const announced = useRef(false)
  const callback = useRef(onDone)
  callback.current = onDone

  ensureCurtainRule()

  useEffect(() => {
    // Reduced motion: the plate does not appear. It only brought a gesture, and
    // the gesture is precisely what we are being asked to leave out.
    if (reduced) {
      if (!announced.current) {
        announced.current = true
        callback.current?.()
      }
      setGone(true)
      return
    }

    const timer = setTimeout(() => {
      setOpen(true)

      // Here, not at the end of the transition: the content comes in while the
      // hole widens.
      if (!announced.current) {
        announced.current = true
        callback.current?.()
      }
    }, holdMs)

    return () => {
      clearTimeout(timer)
    }
  }, [reduced, holdMs])

  if (gone) return null

  const { className, style } = mergePresentation({}, rest)

  const plateStyle = {
    ...style,
    '--o-curtain-x': `${String(origin[0])}%`,
    '--o-curtain-y': `${String(origin[1])}%`,
    '--o-curtain-wipe': `${String(wipeMs)}ms`,
    '--o-curtain-bg': background,
    '--o-curtain-ink': ink,
  } as CSSProperties

  return (
    <div
      {...rest}
      className={className}
      style={plateStyle}
      data-o-curtain=""
      {...(open ? { 'data-o-curtain-open': '' } : {})}
      aria-hidden="true"
      onTransitionEnd={() => {
        if (open) setGone(true)
      }}
    >
      {label !== undefined && <div data-o-curtain-label="">{label}</div>}
    </div>
  )
}

/**
 * Custom cursor: an exact dot, a halo that catches up with it.
 *
 * ## The lag is the whole effect
 *
 * A drawn cursor that follows the pointer to the pixel brings nothing: it
 * replaces an arrow with a circle. What gives the impression of a substance is
 * **the gap** — the dot is exact, the halo arrives a tenth of a second later,
 * and that gap widens when you move fast.
 *
 * The damping is independent of the frame rate:
 *
 *     k = 1 - exp(-speed * dt)
 *
 * A `lerp` with a fixed coefficient would go twice as fast on a 120 Hz screen
 * as on a 60 Hz one — the same component would not have the same weight
 * depending on the machine. Here the time constant is a duration, not a number
 * of frames.
 *
 * ## It never re-renders
 *
 * The positions are written directly into the style of the two elements, from
 * the loop. Routing them through React state would trigger a render of the
 * tree on every mouse movement — that is, as often as possible, for two
 * `transform`s.
 *
 * `translate3d` and not `left`/`top`: the first form is composited, the second
 * triggers a layout.
 *
 * ## It disappears under a finger
 *
 * On a touch screen there is no pointer to follow, and a halo stuck somewhere
 * would be a dead object on the screen. `(pointer: coarse)` removes it
 * entirely — not merely hides it: the component does not even subscribe.
 *
 * ## Under reduced motion, it loses its lag, not its existence
 *
 * The halo sticks to the dot. We remove the superfluous movement; we do not
 * remove a landmark that the person follows with their eyes.
 *
 * @module
 */

import { mergePresentation, useMotionState, type Customisable } from '@odoro-cli/engine'
import { useEffect, useRef, type CSSProperties, type ReactElement } from 'react'

/** Properties specific to the component. */
export interface CursorHaloOwnProps {
  /** Diameter of the dot, in pixels. @defaultValue 6 */
  dotSize?: number
  /** Diameter of the halo at rest, in pixels. @defaultValue 34 */
  haloSize?: number
  /**
   * Speed at which the halo joins the dot.
   *
   * An inverse time constant: the higher, the closer it sticks. Around 8, the
   * gap is felt without dragging.
   *
   * @defaultValue 8
   */
  speed?: number
  /**
   * How much the halo grows when hovering an interactive element.
   *
   * @defaultValue 1.8
   */
  hoverScale?: number
  /**
   * What counts as interactive.
   *
   * @defaultValue 'a, button, [role="button"], input, select, textarea, summary'
   */
  interactive?: string
  /**
   * Confining the cursor to one area.
   *
   * Absent, it holds for the whole window — the common case. Provided, it
   * listens only to that element: this is how a hero gets a cursor of its own
   * without imposing it on the rest of the page.
   */
  host?: { readonly current: HTMLElement | null }
  /**
   * Hiding the native cursor.
   *
   * False by default, and deliberately so: the system cursor changes shape
   * depending on what it hovers — text, link, resize — and replacing it strips
   * away all of those signals. We only hide it when the halo takes them over.
   *
   * @defaultValue false
   */
  hideNative?: boolean
}

/** All properties. */
export type CursorHaloProps = Customisable<CursorHaloOwnProps, 'div'>

/** Identifier of the injected stylesheet. */
const STYLE_ID = 'o-cursor-halo'

/** Sets the cursor rules, once per document. */
function ensureCursorRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-cursor]{position:fixed;inset:0;z-index:9998;pointer-events:none}',
    '[data-o-cursor-dot],[data-o-cursor-ring]{',
    'position:fixed;top:0;left:0;border-radius:9999px;',
    // `will-change` on both: they move on every frame, and without it the
    // browser re-promotes them each time.
    'will-change:transform;pointer-events:none;',
    '}',
    '[data-o-cursor-dot]{background:currentColor}',
    '[data-o-cursor-ring]{',
    'border:1px solid currentColor;',
    'transition:width 220ms ease,height 220ms ease,opacity 220ms ease;',
    '}',
    '[data-o-cursor-hide]{cursor:none}',
    // Under a finger, nothing. The component does not subscribe either — the
    // rule is only a second barrier.
    '@media (pointer:coarse){[data-o-cursor]{display:none}}',
  ].join('')
  document.head.append(style)
}

/**
 * Replaces the cursor with a dot and its halo.
 *
 * To be placed once only, at page level.
 *
 * @example
 * <CursorHalo />
 *
 * @example
 * // Sticks closer, grows more, and takes over the native cursor.
 * <CursorHalo speed={14} hoverScale={2.4} hideNative />
 */
export function CursorHalo({
  dotSize = 6,
  haloSize = 34,
  speed = 8,
  hoverScale = 1.8,
  interactive = 'a, button, [role="button"], input, select, textarea, summary',
  host,
  hideNative = false,
  ...rest
}: CursorHaloProps): ReactElement {
  const { reduced } = useMotionState()
  const dotRef = useRef<HTMLDivElement | null>(null)
  const haloRef = useRef<HTMLDivElement | null>(null)

  ensureCursorRule()

  useEffect(() => {
    // No fine pointer: we subscribe to nothing. Checking here rather than
    // relying on the CSS rule alone avoids a frame loop running for an
    // invisible element.
    if (typeof window === 'undefined') return
    if (window.matchMedia('(pointer: coarse)').matches) return

    const dot = dotRef.current
    const halo = haloRef.current
    if (dot === null || halo === null) return

    // Off screen to begin with: without this, the two elements appear in the
    // top left corner until the first movement.
    let x = -100
    let y = -100
    let hx = -100
    let hy = -100
    let seen = false

    const onMouse = (event: PointerEvent) => {
      // An ancestor carrying a `transform` becomes the containing block of its
      // `fixed` descendants: window coordinates no longer apply there, and the
      // origin of the area has to be subtracted. Without this the cursor
      // merely follows in an ordinary page and drifts by the height of the
      // frame inside a documentation page.
      const frame = host?.current?.getBoundingClientRect()
      x = event.clientX - (frame?.left ?? 0)
      y = event.clientY - (frame?.top ?? 0)

      if (!seen) {
        // The halo lands on the dot at the very first movement, failing which
        // it would cross the screen diagonally from its starting point.
        hx = x
        hy = y
        seen = true
        dot.style.opacity = '1'
        halo.style.opacity = '1'
      }
    }

    const onTarget = (event: Event) => {
      const target = event.target
      const over = target instanceof Element && target.closest(interactive) !== null
      halo.style.width = `${String(over ? haloSize * hoverScale : haloSize)}px`
      halo.style.height = `${String(over ? haloSize * hoverScale : haloSize)}px`
    }

    const surface: HTMLElement | Window = host?.current ?? window
    surface.addEventListener('pointermove', onMouse as EventListener, { passive: true })
    surface.addEventListener('pointerover', onTarget, { passive: true })

    let frame = 0
    let last = performance.now()

    const step = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.1)
      last = now

      // Frame-rate independent damping: see the header.
      const k = reduced ? 1 : 1 - Math.exp(-speed * dt)
      hx += (x - hx) * k
      hy += (y - hy) * k

      dot.style.transform = `translate3d(${String(x)}px,${String(y)}px,0) translate(-50%,-50%)`
      halo.style.transform = `translate3d(${String(hx)}px,${String(hy)}px,0) translate(-50%,-50%)`

      frame = requestAnimationFrame(step)
    }

    frame = requestAnimationFrame(step)

    return () => {
      surface.removeEventListener('pointermove', onMouse as EventListener)
      surface.removeEventListener('pointerover', onTarget)
      cancelAnimationFrame(frame)
    }
  }, [reduced, speed, haloSize, hoverScale, interactive, host])

  // The class that hides the native cursor lives on the document root: setting
  // it on this element would only cover its own surface, which is empty.
  useEffect(() => {
    if (!hideNative || typeof document === 'undefined') return
    document.documentElement.setAttribute('data-o-cursor-hide', '')
    return () => {
      document.documentElement.removeAttribute('data-o-cursor-hide')
    }
  }, [hideNative])

  const { className, style } = mergePresentation({}, rest)

  return (
    <div {...rest} className={className} style={style as CSSProperties} data-o-cursor="">
      <div
        ref={dotRef}
        data-o-cursor-dot=""
        style={{ width: dotSize, height: dotSize, opacity: 0 } as CSSProperties}
      />
      <div
        ref={haloRef}
        data-o-cursor-ring=""
        style={{ width: haloSize, height: haloSize, opacity: 0 } as CSSProperties}
      />
    </div>
  )
}

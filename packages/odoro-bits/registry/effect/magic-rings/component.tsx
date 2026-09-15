/**
 * Concentric rings emitted on every click.
 *
 * ## What sets it apart from the click ripple
 *
 * The click ripple is **one** filled circle that reaches the edges: it marks
 * the touched surface, the way a button does. Here it is a volley of thin
 * strokes that spread while slowing down, staggered from one another. The
 * first answers a press; this one celebrates an event — a success, a send, a
 * piece that has just appeared.
 *
 * ## A canvas, not elements
 *
 * Six volleys of three rings make eighteen circles to redraw per frame. As
 * document elements, that would be eighteen concurrent transitions to create
 * and destroy without pause; on a canvas, it is eighteen calls to `arc` in a
 * single pass.
 *
 * ## The time of the clicks comes from the engine clock
 *
 * A click is time-stamped so that the age of its ring can be computed by
 * subtraction. Using `performance.now()` would take a different origin from
 * that of the drawing time: the rings would be born several seconds old, hence
 * invisible. An input-priority subscription therefore remembers the current
 * time, and it stays active even when the drawing loop sleeps — it is what
 * guarantees that a click after ten seconds of inactivity is stamped right.
 *
 * ## What is left under reduced motion
 *
 * Nothing: a volley has no final state, it is made of nothing but its
 * expansion. The canvas is then not mounted at all.
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
  useRef,
  useState,
  type CSSProperties,
  type ReactElement,
  type ReactNode,
} from 'react'

/** Properties specific to the component. */
export interface MagicRingsOwnProps {
  /** Content of the sensitive area. */
  children: ReactNode
  /** Number of rings per volley. @defaultValue 3 */
  rings?: number
  /** Lifetime of a ring, in milliseconds. @defaultValue 1200 */
  duration?: number
  /** Radius reached at the end of the run, in pixels. @defaultValue 260 */
  size?: number
  /** Thickness of the stroke, in pixels. @defaultValue 2 */
  thickness?: number
  /** Delay between two rings of the same volley, in milliseconds. @defaultValue 130 */
  gap?: number
  /** Colour of the rings. @defaultValue the brand hue */
  color?: string
}

/** All properties. */
export type MagicRingsProps = Customisable<MagicRingsOwnProps>

/** Volleys kept in memory. Beyond that, the oldest is overwritten. */
const SLOTS = 6

/** A volley: the touched point and the instant of the press, in seconds. */
interface Burst {
  x: number
  y: number
  birth: number
}

/**
 * Emits rings on a click inside its area.
 *
 * @example
 * <MagicRings className="o-rounded-xl o-p-8">
 *   <p>Click anywhere</p>
 * </MagicRings>
 *
 * @example
 * // A single wide and slow wave, in another hue.
 * <MagicRings rings={1} size={520} duration={2200} color="var(--o-palette-sky-400)">
 *   <button type="button">Send</button>
 * </MagicRings>
 */
export function MagicRings({
  children,
  rings = 3,
  duration = 1200,
  size = 260,
  thickness = 2,
  gap = 130,
  color = 'var(--o-palette-brand-500)',
  ...rest
}: MagicRingsProps): ReactElement {
  const { reduced } = useMotionState()
  const [host, setHost] = useState<HTMLElement | null>(null)
  const canvas = useRef<HTMLCanvasElement | null>(null)

  // Circular buffer, mutated in place: a birth at minus one thousand makes the
  // volley inert by default, with no special case on the first pass.
  const bursts = useRef<Burst[]>(
    Array.from({ length: SLOTS }, () => ({ x: 0, y: 0, birth: -1000 })),
  ).current

  useEffect(() => {
    const surface = canvas.current
    if (host === null || surface === null || reduced) return

    const context = surface.getContext('2d')
    if (context === null) return

    const life = Math.max(duration, 1) / 1000
    const stagger = Math.max(gap, 0) / 1000
    const count = Math.max(1, Math.round(rings))

    let width = 0
    let height = 0
    let stroke = ''
    let cursor = 0
    let now = 0

    const measure = (): void => {
      const box = host.getBoundingClientRect()
      const ratio = window.devicePixelRatio || 1
      width = Math.max(1, Math.round(box.width))
      height = Math.max(1, Math.round(box.height))
      surface.width = Math.round(width * ratio)
      surface.height = Math.round(height * ratio)
      context.setTransform(ratio, 0, 0, ratio, 0, 0)
      // The colour is read again on every measurement: the theme may have
      // switched.
      stroke = window.getComputedStyle(surface).color
    }

    const draw = (time: number): void => {
      context.clearRect(0, 0, width, height)
      context.lineWidth = thickness
      context.strokeStyle = stroke

      let alive = false
      for (const burst of bursts) {
        for (let index = 0; index < count; index += 1) {
          const age = time - burst.birth - index * stagger
          if (age < 0 || age > life) continue
          alive = true

          const progress = age / life
          // A cubic ease out: the ring starts fast and spreads while slowing
          // down, which gives the release of a wave rather than a circle that
          // grows.
          const radius = size * (1 - (1 - progress) ** 3)
          context.globalAlpha = (1 - progress) ** 2
          context.beginPath()
          context.arc(burst.x, burst.y, Math.max(radius, 0.5), 0, Math.PI * 2)
          context.stroke()
        }
      }
      context.globalAlpha = 1

      // No living volley left: the loop suspends itself, and the next press
      // wakes it. It keeps its place in the order of the frame.
      if (!alive) render.setActive(false)
    }

    // Always active, even when the drawing sleeps: it is what stamps the
    // presses in the same time base as the drawing.
    const ticker = clock.subscribe(
      ({ time }) => {
        now = time
      },
      { priority: CLOCK_PRIORITY.input, name: 'rings : clock' },
    )

    const render = clock.subscribe(({ time }) => draw(time), {
      priority: CLOCK_PRIORITY.render,
      name: 'rings',
    })
    render.setActive(false)

    const onDown = (event: PointerEvent): void => {
      const box = host.getBoundingClientRect()
      const slot = bursts[cursor % SLOTS]
      if (slot === undefined) return
      slot.x = event.clientX - box.left
      slot.y = event.clientY - box.top
      slot.birth = now
      cursor += 1
      render.setActive(true)
    }

    const observer = new ResizeObserver(measure)
    observer.observe(host)
    measure()

    host.addEventListener('pointerdown', onDown, { passive: true })

    return () => {
      host.removeEventListener('pointerdown', onDown)
      observer.disconnect()
      render.unsubscribe()
      ticker.unsubscribe()
      context.clearRect(0, 0, width, height)
    }
  }, [host, reduced, bursts, rings, duration, size, thickness, gap])

  const { className, style } = mergePresentation({ className: 'o-relative' }, rest)

  return (
    <div {...rest} ref={setHost} className={className} style={style}>
      {children}
      {reduced ? null : (
        <canvas
          ref={canvas}
          aria-hidden="true"
          className="o-absolute o-inset-0 o-size-full o-pointer-events-none"
          style={{ color } as CSSProperties}
        />
      )}
    </div>
  )
}

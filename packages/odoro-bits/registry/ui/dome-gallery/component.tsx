/**
 * Dome gallery: the images are stuck on a cap that one spins with the finger
 * or with the arrow keys.
 *
 * ## The geometry is written once, the rotation is the only motion
 *
 * Every image takes a cell of the cap: a column angle, a row angle, then a
 * distance from the center — `rotateY`, `rotateX`, `translateZ`. That
 * transform never changes; it is placed at render time and the browser never
 * comes back to it.
 *
 * What moves is the dome: **a single** element carries the rotation the loop
 * writes. Spinning fifty images therefore amounts to writing one string per
 * frame, whatever their number. Writing one transform per image would cost
 * fifty times more, for the same result.
 *
 * ## What goes behind disappears without being computed
 *
 * An image on the other side of the dome is turned face away from us.
 * `backface-visibility: hidden` takes it out of the render — no opacity to
 * compute, no depth sorting, no list to keep up to date. The geometry does the
 * work that code would do less well.
 *
 * ## This is not the infinite menu
 *
 * The infinite menu is a cylinder of links one travels along a single axis,
 * and whose every step is a target to activate. The dome is a volume: two
 * axes, images rather than links, and nothing to activate — one looks. The
 * keyboard spins the view there, it does not walk a focus around.
 *
 * ## What the pointer must not carry away
 *
 * The drag is captured on the element, not on the window: releasing the finger
 * outside the frame ends the gesture cleanly, thanks to pointer capture.
 * Without it, a fast gesture leaves the dome hooked to the pointer long after
 * the release.
 *
 * ## Reduced motion
 *
 * No damping any more: the dome is at its aimed position as soon as that
 * position changes. Spinning stays possible — it is the only way to see the
 * images at the back.
 *
 * @module
 */

import { mergePresentation, useMotionState, type Customisable } from '@odoro-cli/engine'
import {
  useCallback,
  useEffect,
  useRef,
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactElement,
} from 'react'

/** An image of the dome. */
export interface DomeGalleryItem {
  /** Source of the image. */
  readonly src: string
  /** Alternative text, mandatory: this is the content, not a decoration. */
  readonly alt: string
  /** Caption shown under the image. */
  readonly caption?: string
}

/** Properties specific to the component. */
export interface DomeGalleryOwnProps {
  /** The images placed on the dome, in order. */
  items: readonly DomeGalleryItem[]
  /** Name of the gallery, announced to assistive technologies. */
  label: string
  /** Radius of the dome, in pixels. @defaultValue 360 */
  radius?: number
  /** Number of images per row. @defaultValue 8 */
  columns?: number
  /** Angle between two rows, in degrees. @defaultValue 34 */
  pitch?: number
  /** Width of an image on the dome, in pixels. @defaultValue 180 */
  tile?: number
}

/** All the properties. */
export type DomeGalleryProps = Customisable<DomeGalleryOwnProps>

/** Identifier of the injected stylesheet. */
const STYLE_ID = 'o-dome-gallery'

/** Degrees travelled per hundred pixels of drag. */
const SENSITIVITY = 0.28

/** Places the scene, the dome and its cells, once per document. */
function ensureDomeRules(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-dome]{',
    'position:relative;display:block;overflow:hidden;touch-action:none;cursor:grab;',
    'perspective:var(--o-dome-view);perspective-origin:50% 50%;',
    '}',
    '[data-o-dome][data-o-dome-tire]{cursor:grabbing}',
    '[data-o-dome]:focus-visible{outline:2px solid var(--o-dome-accent);outline-offset:-2px}',
    // The scene pushes the center of the dome back by one radius: the front
    // cell then lands in the plane of the screen, at its exact scale. Without
    // that setback, it would reach the eye and stretch to infinity.
    '[data-o-dome-scene]{',
    'position:absolute;inset:0;transform-style:preserve-3d;',
    'transform:translateZ(var(--o-dome-recul));',
    '}',
    '[data-o-dome-calotte]{',
    'position:absolute;left:50%;top:50%;width:0;height:0;',
    'transform-style:preserve-3d;will-change:transform;',
    '}',
    '[data-o-dome-case]{',
    'position:absolute;top:0;left:0;margin:0;',
    'width:var(--o-dome-tuile);translate:-50% -50%;',
    // The hidden face removes on its own whatever has gone behind.
    'backface-visibility:hidden;',
    '}',
    '[data-o-dome-case] img{',
    'display:block;width:100%;aspect-ratio:4 / 3;object-fit:cover;',
    'border-radius:0.7rem;background:var(--o-theme-surface);',
    'box-shadow:0 0 0 1px var(--o-theme-line);',
    '}',
    '[data-o-dome-case] figcaption{',
    'margin-top:0.4rem;text-align:center;font-size:0.75em;color:var(--o-theme-muted);',
    '}',
  ].join('')
  document.head.append(style)
}

/**
 * Dome of images, by drag as well as by keyboard.
 *
 * @example
 * <DomeGallery
 *   label="Workshop panorama"
 *   items={[
 *     { src: '/dome/workbench.jpg', alt: 'Workbench covered with tools' },
 *     { src: '/dome/kiln.jpg', alt: 'Open ceramic kiln' },
 *   ]}
 *   className="o-h-96"
 * />
 *
 * @example
 * // A tighter dome, ten images per row.
 * <DomeGallery label="Wall of images" items={photos} radius={300} columns={10} tile={140} />
 */
export function DomeGallery({
  items,
  label,
  radius = 360,
  columns = 8,
  pitch = 34,
  tile = 180,
  ...rest
}: DomeGalleryProps): ReactElement {
  const { reduced } = useMotionState()
  const cap = useRef<HTMLDivElement | null>(null)
  /** Aimed angle and displayed angle, in degrees — yaw then tilt. */
  const aim = useRef({ yaw: 0, tilt: 0 })
  const shown = useRef({ yaw: 0, tilt: 0 })
  const frame = useRef(0)
  const stamp = useRef(0)
  ensureDomeRules()

  const perRow = Math.max(1, Math.round(columns))
  const rows = Math.max(1, Math.ceil(items.length / perRow))
  /** Beyond that, the dome would tip over onto its back. */
  const limit = ((rows - 1) / 2) * pitch + 20

  /** Brings the displayed angle closer to the aimed one, and writes the dome. */
  const loop = useCallback((): void => {
    frame.current = 0
    const node = cap.current
    if (node === null) return

    const now = typeof performance === 'undefined' ? 0 : performance.now()
    const dt = Math.min(0.05, (now - stamp.current) / 1000)
    stamp.current = now

    // Exponential damping: the same motion whatever the display refresh rate,
    // unlike a fixed step per frame.
    const k = reduced ? 1 : 1 - Math.exp(-9 * dt)
    shown.current.yaw += (aim.current.yaw - shown.current.yaw) * k
    shown.current.tilt += (aim.current.tilt - shown.current.tilt) * k

    node.style.transform = `rotateX(${shown.current.tilt.toFixed(2)}deg) rotateY(${shown.current.yaw.toFixed(2)}deg)`

    const remaining =
      Math.abs(aim.current.yaw - shown.current.yaw) +
      Math.abs(aim.current.tilt - shown.current.tilt)
    // Nothing is written when nothing moves: the loop stops on its own.
    if (remaining > 0.02 && typeof requestAnimationFrame === 'function') {
      frame.current = requestAnimationFrame(loop)
    }
  }, [reduced])

  const restart = useCallback((): void => {
    if (frame.current !== 0 || typeof requestAnimationFrame !== 'function') return
    stamp.current = typeof performance === 'undefined' ? 0 : performance.now()
    frame.current = requestAnimationFrame(loop)
  }, [loop])

  useEffect(() => {
    restart()
    return () => {
      if (frame.current !== 0) cancelAnimationFrame(frame.current)
      frame.current = 0
    }
  }, [restart, radius, pitch, columns, items])

  const drag = useRef<{ x: number; y: number; id: number } | null>(null)

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>): void => {
    if (event.button !== 0 && event.pointerType === 'mouse') return
    drag.current = { x: event.clientX, y: event.clientY, id: event.pointerId }
    event.currentTarget.setPointerCapture(event.pointerId)
    event.currentTarget.setAttribute('data-o-dome-tire', '')
  }

  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>): void => {
    const start = drag.current
    if (start === null || start.id !== event.pointerId) return
    aim.current.yaw += (event.clientX - start.x) * SENSITIVITY
    aim.current.tilt = Math.min(
      limit,
      Math.max(-limit, aim.current.tilt - (event.clientY - start.y) * SENSITIVITY),
    )
    start.x = event.clientX
    start.y = event.clientY
    restart()
  }

  const onPointerUp = (event: ReactPointerEvent<HTMLDivElement>): void => {
    drag.current = null
    event.currentTarget.removeAttribute('data-o-dome-tire')
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
  }

  /** The arrow keys spin the view by one cell; Home brings it back to front. */
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>): void => {
    const column = 360 / perRow
    const moves: Readonly<Record<string, (() => void) | undefined>> = {
      ArrowRight: () => (aim.current.yaw -= column),
      ArrowLeft: () => (aim.current.yaw += column),
      ArrowUp: () => (aim.current.tilt = Math.max(-limit, aim.current.tilt - pitch)),
      ArrowDown: () => (aim.current.tilt = Math.min(limit, aim.current.tilt + pitch)),
      Home: () => {
        aim.current.yaw = 0
        aim.current.tilt = 0
      },
    }
    const move = moves[event.key]
    if (move === undefined) return
    event.preventDefault()
    move()
    restart()
  }

  const { className, style } = mergePresentation({}, rest)

  return (
    <div
      {...rest}
      role="group"
      aria-roledescription="gallery"
      aria-label={label}
      tabIndex={0}
      data-o-dome=""
      className={className}
      style={
        {
          '--o-dome-accent': 'var(--o-palette-brand-500)',
          '--o-dome-tuile': `${String(tile)}px`,
          '--o-dome-recul': `${String(-radius)}px`,
          '--o-dome-view': `${String(radius * 2)}px`,
          ...style,
        } as CSSProperties
      }
      onPointerDown={(event) => {
        onPointerDown(event)
        rest.onPointerDown?.(event)
      }}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onKeyDown={(event) => {
        onKeyDown(event)
        rest.onKeyDown?.(event)
      }}
    >
      <div data-o-dome-scene="">
        <div ref={cap} data-o-dome-calotte="">
          {items.map((item, index) => {
            const row = Math.floor(index / perRow)
            const column = index % perRow
            // The last row is often incomplete: it spreads over its own count
            // rather than leaving a stretch of dome empty.
            const inRow = Math.min(perRow, items.length - row * perRow)
            const yaw = column * (360 / Math.max(1, inRow))
            const tilt = (row - (rows - 1) / 2) * pitch

            return (
              <figure
                key={item.src}
                data-o-dome-case=""
                style={{
                  transform: `rotateY(${String(yaw)}deg) rotateX(${String(-tilt)}deg) translateZ(${String(radius)}px)`,
                }}
              >
                <img src={item.src} alt={item.alt} loading="lazy" decoding="async" />
                {item.caption === undefined ? null : (
                  <figcaption>{item.caption}</figcaption>
                )}
              </figure>
            )
          })}
        </div>
      </div>
    </div>
  )
}

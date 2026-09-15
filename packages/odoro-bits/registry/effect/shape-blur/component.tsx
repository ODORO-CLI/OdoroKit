/**
 * Blurred geometric silhouette that follows the pointer under the content.
 *
 * ## What sets it apart from a halo
 *
 * A halo is a radial gradient: it has no shape, only a centre. Here, the blob
 * keeps a **silhouette** — a hexagon, a triangle — that the blur softens
 * without making it disappear. That is what makes it usable as section decor
 * rather than as a cursor: one recognises a shape, not a lamp.
 *
 * ## A clip then a blur, not an image
 *
 * The silhouette is a plain block of colour, clipped by a path and blurred by
 * the compositor. An image or a vector path would give the same drawing for
 * far more: clipping is a property that the browser applies at paint time, and
 * the blur an operation it already hands to the graphics processor.
 *
 * ## The lag is part of the effect
 *
 * The shape is damped by the pointer hook: it trails behind the hand, which
 * gives it weight. Without damping, a mass of two hundred pixels stuck to the
 * cursor would give a nervous and unpleasant movement.
 *
 * ## Under reduced motion
 *
 * The hook stays at rest, so the shape settles at the centre of the area and
 * no longer moves: this really is the final state, and the decor remains.
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
import { useEffect, useRef, useState, type ReactElement, type ReactNode } from 'react'

import { usePointerDamped } from '@registre/hooks/usePointerDamped'

/** Available silhouettes. */
export type BlurShape = 'circle' | 'square' | 'triangle' | 'hexagon'

/** Properties specific to the component. */
export interface ShapeBlurOwnProps {
  /** Content laid over the shape. */
  children: ReactNode
  /** Silhouette used. @defaultValue 'hexagon' */
  shape?: BlurShape
  /** Side of the silhouette, in pixels. @defaultValue 240 */
  size?: number
  /** Blur applied to the silhouette, in pixels. @defaultValue 44 */
  blur?: number
  /** Catch-up speed of the pointer. @defaultValue 2 */
  speed?: number
  /** Colour of the silhouette. @defaultValue the brand hue */
  color?: string
}

/** All properties. */
export type ShapeBlurProps = Customisable<ShapeBlurOwnProps>

/** Clip paths, one per silhouette. */
const CLIPS: Readonly<Record<BlurShape, string | undefined>> = {
  circle: 'circle(50% at 50% 50%)',
  square: undefined,
  triangle: 'polygon(50% 0%, 100% 100%, 0% 100%)',
  hexagon: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)',
}

/**
 * Drifts a blurred shape under its content.
 *
 * @example
 * <ShapeBlur className="o-rounded-2xl o-p-12">
 *   <h2>A section</h2>
 * </ShapeBlur>
 *
 * @example
 * // A crisp and heavy triangle, in another hue.
 * <ShapeBlur shape="triangle" blur={12} speed={1} color="var(--o-palette-sky-400)">
 *   <p>…</p>
 * </ShapeBlur>
 */
export function ShapeBlur({
  children,
  shape = 'hexagon',
  size = 240,
  blur = 44,
  speed = 2,
  color = 'var(--o-palette-brand-500)',
  ...rest
}: ShapeBlurProps): ReactElement {
  const { reduced } = useMotionState()
  const [host, setHost] = useState<HTMLDivElement | null>(null)
  const mark = useRef<HTMLSpanElement | null>(null)

  const pointer = usePointerDamped({ host, speed, name: 'blurred shape' })

  useEffect(() => {
    if (host === null) return

    const place = (): void => {
      const target = mark.current
      if (target === null) return

      // The position returned by the hook is centred on zero and clamped to
      // one; the area brings it back to pixels, and half the side recentres
      // the shape on the tracked point.
      const box = host.getBoundingClientRect()
      const x = ((pointer.current.x + 1) / 2) * box.width - size / 2
      const y = ((pointer.current.y + 1) / 2) * box.height - size / 2

      target.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`
    }

    // With no motion, the hook stays at rest: the shape is placed once at the
    // centre, and no loop copies the same value sixty times a second.
    if (reduced) {
      place()
      return
    }

    const subscription = clock.subscribe(place, {
      priority: CLOCK_PRIORITY.render,
      name: 'blurred shape',
    })

    return () => subscription.unsubscribe()
  }, [host, pointer, size, reduced])

  const { className, style } = mergePresentation(
    { className: 'o-relative o-overflow-hidden o-isolate' },
    rest,
  )

  return (
    <div {...rest} ref={setHost} className={className} style={style}>
      <span
        aria-hidden
        ref={mark}
        className="o-absolute o-pointer-events-none o-will-change-transform"
        style={{
          top: 0,
          left: 0,
          width: `${String(size)}px`,
          height: `${String(size)}px`,
          backgroundColor: color,
          clipPath: CLIPS[shape],
          filter: `blur(${String(blur)}px)`,
          // Under the content, never in front: the shape is decor, and the
          // text must stay crisp over it.
          zIndex: -1,
        }}
      />
      {children}
    </div>
  )
}

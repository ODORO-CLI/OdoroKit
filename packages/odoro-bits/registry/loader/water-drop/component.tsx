/**
 * Falling drop: a drop breaks away, stretches as it falls, flattens on the
 * surface, and a single ripple leaves the point of impact.
 *
 * ## The stretch is what makes the fall
 *
 * A drop going down at constant shape looks like a marble. What says
 * "liquid" is the deformation: the drop thins out as it picks up speed,
 * then flattens all at once on contact. Both scales are carried by the same
 * transform as the position — one group, one animation, and the order of
 * the functions guarantees that the flattening does happen around the
 * center of the drop and not around the view.
 *
 * The fall takes up two thirds of the cycle, the impact a tenth, and the
 * rest is a dead beat. Without that dead beat, the next drop would leave
 * while the ripple was still spreading, and the eye would no longer know
 * which one to watch.
 *
 * ## A single ripple
 *
 * The ripple is an ellipse — not a circle: the surface is seen at an angle,
 * and a circle would tip it flat. It is born small and sharp at the exact
 * moment of impact, widens and dies out. One is enough: it is the
 * consequence of a single event, not a beat. That is what separates this
 * loader from concentric ripples, where the rings take over from one another
 * with no visible cause.
 *
 * ## A status, not a drawing
 *
 * The element carries `role="status"` and a label for screen readers: the
 * wait is information, not decoration. The drawing is removed from the
 * accessibility tree.
 *
 * Under reduced motion, the drop stays suspended just above the surface and
 * the ripple stays newborn: both halves of the story are visible at once,
 * without movement.
 *
 * @module
 */

import { mergePresentation, type Customisable } from '@odoro-cli/engine'
import type { CSSProperties, ReactElement } from 'react'

/** Id of the injected stylesheet. */
const STYLE_ID = 'o-water-drop'

/** Height of the surface, in view units. */
const SURFACE = 74

/**
 * Path of the drop, centered on its local origin.
 *
 * Tip up, belly down: it is the shape of a drop in free fall, not that of a
 * teardrop at rest.
 */
const DROP =
  'M 0 -15 C 6.4 -5.4 9.5 -1.4 9.5 4 C 9.5 10.1 5.2 15 0 15 C -5.2 15 -9.5 10.1 -9.5 4 C -9.5 -1.4 -6.4 -5.4 0 -15 Z'

/** Sets the drop, its impact and its ripple, once per document. */
function ensureDropRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-water-drop]{display:inline-block;line-height:0}',
    '[data-o-water-drop] svg{display:block}',
    // The origin is that of the view: the transform functions place the
    // drop, then deform it around its own center.
    '[data-o-water-drop-body],[data-o-water-drop-ring]{',
    'transform-box:view-box;transform-origin:0 0;',
    '}',
    '[data-o-water-drop-body]{',
    'animation:o-water-drop-fall var(--o-drop-speed) linear infinite;',
    '}',
    // The positions are those of the center of the drop: at each step, it is
    // its half height, scale included, that says where its belly is.
    '@keyframes o-water-drop-fall{',
    '0%{transform:translate(50px,15px) scale(0.7,1.15);opacity:0}',
    '8%{transform:translate(50px,20px) scale(0.8,1.1);opacity:1}',
    // The fall accelerates: half the way is done in a third of the time.
    '38%{transform:translate(50px,34px) scale(0.78,1.18)}',
    '62%{transform:translate(50px,55px) scale(0.72,1.32);opacity:1}',
    `70%{transform:translate(50px,${String(SURFACE - 5)}px) scale(1.45,0.34);opacity:0.85}`,
    `78%,100%{transform:translate(50px,${String(SURFACE - 2)}px) scale(1.9,0.12);opacity:0}`,
    '}',
    '[data-o-water-drop-ring]{',
    `transform-origin:50px ${String(SURFACE)}px;`,
    'animation:o-water-drop-spread var(--o-drop-speed) ease-out infinite;',
    '}',
    // The ripple only exists after the impact: before, it is at zero.
    '@keyframes o-water-drop-spread{',
    '0%,66%{transform:scale(0.12);opacity:0}',
    '72%{transform:scale(0.3);opacity:0.9}',
    '100%{transform:scale(1);opacity:0}',
    '}',
    '@media (prefers-reduced-motion:reduce){',
    '[data-o-water-drop-body]{animation:none;transform:translate(50px,50px) scale(0.75,1.25);opacity:1}',
    '[data-o-water-drop-ring]{animation:none;transform:scale(0.4);opacity:0.5}',
    '}',
  ].join('')
  document.head.append(style)
}

/** The component's own props. */
export interface WaterDropOwnProps {
  /** Side of the drawing area, in pixels. @defaultValue 64 */
  size?: number
  /** Duration of one cycle, fall and ripple included, in milliseconds. @defaultValue 2000 */
  speed?: number
  /** Color of the drop, the ripple and the surface. @defaultValue the text color */
  color?: string
  /** Label announced to screen readers. @defaultValue 'Loading' */
  label?: string
}

/** All props. */
export type WaterDropProps = Customisable<WaterDropOwnProps, 'span'>

/**
 * Signals a wait with a drop that falls and ripples the surface.
 *
 * @example
 * <WaterDrop />
 *
 * @example
 * // Bigger, slower, in the brand hue.
 * <WaterDrop size={96} speed={3200} color="var(--o-palette-brand-500)" />
 */
export function WaterDrop({
  size = 64,
  speed = 2000,
  color = 'currentColor',
  label = 'Loading',
  ...rest
}: WaterDropProps): ReactElement {
  ensureDropRule()

  const { className, style } = mergePresentation({}, rest)

  const loaderStyle = {
    ...style,
    width: `${String(size)}px`,
    height: `${String(size)}px`,
    color,
    '--o-drop-speed': `${String(speed)}ms`,
  } as CSSProperties

  return (
    <span
      {...rest}
      className={className}
      style={loaderStyle}
      data-o-water-drop=""
      role="status"
    >
      <span className="o-sr-only">{label}</span>
      <svg aria-hidden viewBox="0 0 100 100" width="100%" height="100%">
        <line
          x1="14"
          y1={SURFACE}
          x2="86"
          y2={SURFACE}
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          opacity={0.28}
        />
        <ellipse
          data-o-water-drop-ring=""
          cx="50"
          cy={SURFACE}
          rx="34"
          ry="8"
          fill="none"
          stroke="currentColor"
          strokeWidth={2.5}
          // Without this, the scale would thicken the stroke as the ripple
          // widens: a ripple growing fatter as it moves away.
          vectorEffect="non-scaling-stroke"
        />
        <g data-o-water-drop-body="">
          <path d={DROP} fill="currentColor" />
        </g>
      </svg>
    </span>
  )
}

/**
 * Laser sweep: a beam crosses the frame on a loop.
 *
 * ## What sets it apart from the border stroke
 *
 * The border stroke runs **along** the outline; this beam crosses the surface
 * **from side to side**. One underlines a card among its neighbours, the other
 * gives the impression that a machine is reading what it contains. They do not
 * replace one another, and can even be laid together.
 *
 * ## Two layers, because a laser is not a stroke
 *
 * A single bright rectangle reads as a separator, not as light. What makes the
 * laser is the contrast between a crisp two-pixel core and a sheet a hundred
 * times wider, blurred and pale, that accompanies it. Both travel together in
 * the same track.
 *
 * ## Why a track rather than a displacement of the beam
 *
 * A `translate` percentage refers to the element being moved. Animated on the
 * beam — two pixels wide — it would take thousands of percent, and the value
 * would depend on the thickness that was set. The track, on the other hand, is
 * exactly the size of the frame: moving it by half moves the beam by half a
 * frame width, whatever its thickness.
 *
 * Under reduced motion, no beam: a sweep has no final state, only its passage
 * exists. The outline hairline, however, stays.
 *
 * @module
 */

import { mergePresentation, useMotionState, type Customisable } from '@odoro-cli/engine'
import { type CSSProperties, type ReactElement, type ReactNode } from 'react'

/** Properties specific to the component. */
export interface LaserFlowOwnProps {
  /** Swept content. */
  children: ReactNode
  /** Duration of one crossing, in milliseconds. @defaultValue 3200 */
  duration?: number
  /** Tilt of the beam, in degrees. @defaultValue 14 */
  angle?: number
  /** Thickness of the crisp stroke, in pixels. @defaultValue 2 */
  width?: number
  /** Width of the diffuse sheet, in pixels. @defaultValue 90 */
  glow?: number
  /** Colour of the beam. @defaultValue the brand hue */
  color?: string
  /** Also lights a hairline on the outline of the frame. @defaultValue true */
  frame?: boolean
}

/** All properties. */
export type LaserFlowProps = Customisable<LaserFlowOwnProps>

/** Identifier of the injected stylesheet. */
const STYLE_ID = 'o-laser-flow'

/** Sets the beam rules, once per document. */
function ensureLaserRules(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-laser]{position:relative;isolation:isolate}',
    // The track is the size of the frame: one percent of its displacement is
    // one percent of the width, and not of the thickness of the beam.
    '[data-o-laser-track]{',
    'position:absolute;inset:0;pointer-events:none;',
    'animation:o-laser var(--o-laser-duration) linear infinite',
    '}',
    '@keyframes o-laser{',
    'from{transform:translate3d(-58%,0,0)}',
    'to{transform:translate3d(58%,0,0)}',
    '}',
    // Both layers start from the middle of the track and overflow in height:
    // the tilt must never uncover their ends.
    '[data-o-laser-beam]{',
    'position:absolute;top:-60%;height:220%;left:50%;',
    'transform:rotate(var(--o-laser-angle))',
    '}',
    '[data-o-laser-glow]{',
    'width:var(--o-laser-glow);margin-left:calc(var(--o-laser-glow) / -2);',
    'background:var(--o-laser-color);opacity:0.22;',
    'filter:blur(calc(var(--o-laser-glow) / 3))',
    '}',
    '[data-o-laser-core]{',
    'width:var(--o-laser-width);margin-left:calc(var(--o-laser-width) / -2);',
    'background:linear-gradient(to bottom,transparent,var(--o-laser-color) 25%,var(--o-laser-color) 75%,transparent)',
    '}',
    '[data-o-laser-frame]{',
    'position:absolute;inset:0;pointer-events:none;border-radius:inherit;',
    'box-shadow:inset 0 0 0 1px var(--o-laser-color);opacity:0.35',
    '}',
    '@media (prefers-reduced-motion:reduce){[data-o-laser-track]{display:none}}',
  ].join('')
  document.head.append(style)
}

/**
 * Sends a beam across its content.
 *
 * @example
 * <LaserFlow className="o-rounded-xl o-overflow-hidden o-p-8">
 *   <h3>Analysis in progress</h3>
 * </LaserFlow>
 *
 * @example
 * // A slow and wide sweep, with no outline hairline.
 * <LaserFlow duration={7000} glow={220} frame={false} angle={-24}>
 *   <pre>…</pre>
 * </LaserFlow>
 */
export function LaserFlow({
  children,
  duration = 3200,
  angle = 14,
  width = 2,
  glow = 90,
  color = 'var(--o-palette-brand-500)',
  frame = true,
  ...rest
}: LaserFlowProps): ReactElement {
  const { reduced } = useMotionState()
  ensureLaserRules()

  const { className, style } = mergePresentation({ className: 'o-overflow-hidden' }, rest)

  return (
    <div
      {...rest}
      className={className}
      style={
        {
          ...style,
          '--o-laser-duration': `${String(duration)}ms`,
          '--o-laser-angle': `${String(angle)}deg`,
          '--o-laser-width': `${String(width)}px`,
          '--o-laser-glow': `${String(glow)}px`,
          '--o-laser-color': color,
        } as CSSProperties
      }
      data-o-laser=""
    >
      {children}
      {reduced ? null : (
        <span aria-hidden data-o-laser-track="">
          <span data-o-laser-beam="" data-o-laser-glow="" />
          <span data-o-laser-beam="" data-o-laser-core="" />
        </span>
      )}
      {frame ? <span aria-hidden data-o-laser-frame="" /> : null}
    </div>
  )
}

/**
 * Meteors: oblique strokes fall on a loop across the area.
 *
 * ## A randomness that is not one
 *
 * Position, delay and duration of each meteor look random, but are derived
 * from its index by a deterministic sequence. `Math.random()` at render time
 * would make two different showers between the server and the client — one
 * hydration error per meteor — and a new shower on every render of the parent.
 * Seeding by index gives the same shower everywhere, always.
 *
 * ## The compositor makes the rain fall
 *
 * Each meteor is a single CSS animation — translation along its slope and fade
 * — that loops with a negative delay: the shower is already under way at first
 * glance, nobody witnesses the grouped start.
 *
 * The area is purely decorative: it is removed from the accessibility tree,
 * and under reduced motion it is not rendered at all.
 *
 * @module
 */

import { mergePresentation, useMotionState, type Customisable } from '@odoro-cli/engine'
import { type CSSProperties, type ReactElement } from 'react'

/** Properties specific to the component. */
export interface MeteorsOwnProps {
  /** Number of meteors. @defaultValue 12 */
  count?: number
  /** Angle of the fall, in degrees. @defaultValue 215 */
  angle?: number
  /** Colour of the strokes. @defaultValue the text colour */
  color?: string
}

/** All properties. */
export type MeteorsProps = Customisable<MeteorsOwnProps>

/** Identifier of the injected stylesheet. */
const STYLE_ID = 'o-meteors'

/**
 * Pseudo-random value in [0, 1), stable for an index-channel pair.
 *
 * A congruence is enough: this is not cryptography, only a way to break the
 * visible alignments between neighbouring meteors.
 */
function seeded(index: number, channel: number): number {
  const value = Math.sin(index * 127.1 + channel * 311.7) * 43758.5453
  return value - Math.floor(value)
}

/** Sets the fall, once per document. */
function ensureMeteorRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-meteors]{position:absolute;inset:0;overflow:hidden;pointer-events:none}',
    '[data-o-meteor]{',
    'position:absolute;top:-10%;width:var(--o-meteor-length);height:1px;',
    // The stroke is a gradient: full head, tail that fades away.
    'background:linear-gradient(90deg,var(--o-meteor-color),transparent);',
    'rotate:var(--o-meteor-angle);',
    'animation:o-meteor-fall var(--o-meteor-duration) linear infinite;',
    'animation-delay:var(--o-meteor-delay);',
    'opacity:0;',
    '}',
    // The translation follows the axis of the stroke: `rotate` has already
    // oriented the frame of reference, falling amounts to advancing along its
    // own X.
    '@keyframes o-meteor-fall{',
    '0%{transform:translateX(0);opacity:0}',
    '8%{opacity:var(--o-meteor-opacity)}',
    '75%{opacity:var(--o-meteor-opacity)}',
    '100%{transform:translateX(var(--o-meteor-travel));opacity:0}',
    '}',
  ].join('')
  document.head.append(style)
}

/**
 * Fills its area with a shower of meteors.
 *
 * The parent must be positioned relative: the shower hugs its edges.
 *
 * @example
 * <div className="o-relative o-overflow-hidden o-rounded-xl o-p-8">
 *   <Meteors />
 *   <h3>A corner of sky</h3>
 * </div>
 *
 * @example
 * // A dense shower, almost vertical.
 * <Meteors count={24} angle={245} />
 */
export function Meteors({
  count = 12,
  angle = 215,
  color = 'currentColor',
  ...rest
}: MeteorsProps): ReactElement | null {
  const { reduced } = useMotionState()
  ensureMeteorRule()

  // Purely decorative: under reduced motion, a frozen shower would only be a
  // noise of strokes. Nothing is rendered.
  if (reduced) return null

  const { className, style } = mergePresentation({}, rest)

  const zoneStyle = {
    ...style,
    '--o-meteor-color': color,
    '--o-meteor-angle': `${String(angle)}deg`,
  } as CSSProperties

  return (
    <div {...rest} aria-hidden className={className} style={zoneStyle} data-o-meteors="">
      {Array.from({ length: count }, (_, index) => {
        const duration = 2400 + seeded(index, 1) * 3200
        return (
          <span
            key={index}
            data-o-meteor=""
            style={
              {
                left: `${String(seeded(index, 0) * 100)}%`,
                '--o-meteor-duration': `${String(Math.round(duration))}ms`,
                // Negative delay: each meteor is already somewhere along its
                // course on the first render.
                '--o-meteor-delay': `${String(-Math.round(seeded(index, 2) * duration))}ms`,
                '--o-meteor-length': `${String(Math.round(60 + seeded(index, 3) * 90))}px`,
                '--o-meteor-travel': `${String(Math.round(400 + seeded(index, 4) * 400))}px`,
                '--o-meteor-opacity': String(0.35 + seeded(index, 5) * 0.55),
              } as CSSProperties
            }
          />
        )
      })}
    </div>
  )
}

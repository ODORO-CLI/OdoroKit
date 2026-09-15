/**
 * Two gears: a big one and a small one turn in opposite directions, teeth
 * meshed, at speeds that respect their ratio.
 *
 * ## Teeth that do not pass through each other
 *
 * Two gears drawn at random overlap: a tooth of one always ends up passing
 * through a tooth of the other, and the eye sees it even without knowing why.
 * Here the two wheels have teeth of the same height and the same pitch, which
 * fixes their radii in proportion to their tooth counts, and their centre
 * distance to the sum of their pitch radii. Each wheel is then turned so that
 * a tooth of one points towards the other, and a gap of the other towards the
 * first.
 *
 * The speed ratio is the tooth ratio: twelve against eight, the small gear
 * turns one and a half times faster, in the opposite direction. That is the
 * only speed at which the teeth stay meshed; any other would make them slip.
 *
 * The teeth are trapezoids, not involutes: at this size, the difference is
 * invisible, and the path stays a sequence of segments the browser renders
 * without effort.
 *
 * Two rotation animations, held by the compositor. No JavaScript after the
 * first render: the paths are computed once when the module loads.
 *
 * ## A status, not a drawing
 *
 * The element carries `role="status"` and a label for screen readers: waiting
 * is information, not decoration. The drawing is removed from the
 * accessibility tree.
 *
 * Under reduced motion, the gears stay still, teeth meshed: the figure still
 * reads as a loader, only the movement stops.
 *
 * @module
 */

import { mergePresentation, type Customisable } from '@odoro-cli/engine'
import type { CSSProperties, ReactElement } from 'react'

/** Identifier of the injected stylesheet. */
const STYLE_ID = 'o-gear-pair'

/** What defines a wheel. */
interface Gear {
  readonly cx: number
  readonly cy: number
  readonly teeth: number
  /** Pitch radius: where the teeth of the two wheels meet. */
  readonly pitch: number
}

/** Height of a tooth, on either side of the pitch radius. */
const TOOTH = 4

/**
 * Clearance at the tip of the teeth.
 *
 * Without it, the tip of a tooth would touch exactly the bottom of the gap
 * facing it, and the trapezoid teeth would overlap there by a fraction of a
 * unit on every pass. One unit of setback is enough to avoid that.
 */
const CLEARANCE = 1

/**
 * Path of a toothed wheel, with its central hole.
 *
 * Each tooth is a trapezoid: rise over a quarter of the pitch, plateau to the
 * half, fall at three quarters, gap until the next pitch. `toothAt` is the
 * angle, in degrees, where the middle of a tooth is wanted: it is through it
 * that the two wheels mesh.
 */
function gearPath(gear: Gear, toothAt: number): string {
  const outer = gear.pitch + TOOTH - CLEARANCE
  const inner = gear.pitch - TOOTH
  const pitch = (2 * Math.PI) / gear.teeth
  const start = (toothAt * Math.PI) / 180 - pitch * 0.375

  const point = (angle: number, radius: number): string =>
    `${(gear.cx + radius * Math.cos(angle)).toFixed(2)} ${(gear.cy + radius * Math.sin(angle)).toFixed(2)}`

  const points: string[] = []
  for (let index = 0; index < gear.teeth; index += 1) {
    const base = start + pitch * index
    points.push(
      point(base, inner),
      point(base + pitch * 0.25, outer),
      point(base + pitch * 0.5, outer),
      point(base + pitch * 0.75, inner),
    )
  }

  const hole = gear.pitch * 0.32
  return [
    `M ${points.join(' L ')} Z`,
    `M ${point(0, hole)} A ${String(hole)} ${String(hole)} 0 1 0 ${point(Math.PI, hole)}`,
    `A ${String(hole)} ${String(hole)} 0 1 0 ${point(0, hole)} Z`,
  ].join(' ')
}

/** The big wheel, at the bottom left of the view. */
const BIG: Gear = { cx: 38, cy: 58, teeth: 12, pitch: 24 }

/** Direction of the small gear from the big one, in degrees. */
const LINK = -35

/**
 * The small wheel, at the exact centre distance: the sum of the pitch radii,
 * in the direction of the link.
 */
const SMALL: Gear = {
  cx: BIG.cx + (BIG.pitch + 16) * Math.cos((LINK * Math.PI) / 180),
  cy: BIG.cy + (BIG.pitch + 16) * Math.sin((LINK * Math.PI) / 180),
  teeth: 8,
  pitch: 16,
}

/** A tooth of the big one points at the small one; a gap of the small one answers it. */
const BIG_PATH = gearPath(BIG, LINK)
const SMALL_PATH = gearPath(SMALL, LINK + 180 + 360 / SMALL.teeth / 2)

/** Sets up the gears and their rotations, once per document. */
function ensureGearRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-gear-pair]{display:inline-block;line-height:0}',
    '[data-o-gear-pair] svg{display:block}',
    // Each wheel turns around its own centre, in view units.
    '[data-o-gear]{',
    'transform-box:view-box;transform-origin:var(--o-gear-origin);',
    'animation:var(--o-gear-spin) var(--o-gear-speed) linear infinite;',
    '}',
    '@keyframes o-gear-pair-cw{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}',
    '@keyframes o-gear-pair-ccw{from{transform:rotate(0deg)}to{transform:rotate(-360deg)}}',
    '@media (prefers-reduced-motion:reduce){',
    '[data-o-gear]{animation:none;transform:none}',
    '}',
  ].join('')
  document.head.append(style)
}

/** Props of the component itself. */
export interface GearPairOwnProps {
  /** Side of the drawing area, in pixels. @defaultValue 56 */
  size?: number
  /** Duration of one turn of the big gear, in milliseconds. @defaultValue 3000 */
  speed?: number
  /** Colour of the gears. @defaultValue the text colour */
  color?: string
  /** Label announced to screen readers. @defaultValue 'Loading' */
  label?: string
}

/** All the props. */
export type GearPairProps = Customisable<GearPairOwnProps, 'span'>

/**
 * Signals a wait through two gears turning against each other.
 *
 * @example
 * <GearPair />
 *
 * @example
 * // Bigger, slower, in the brand hue.
 * <GearPair size={96} speed={5000} color="var(--o-palette-brand-500)" />
 */
export function GearPair({
  size = 56,
  speed = 3000,
  color = 'currentColor',
  label = 'Loading',
  ...rest
}: GearPairProps): ReactElement {
  ensureGearRule()

  const { className, style } = mergePresentation({}, rest)

  const loaderStyle = {
    ...style,
    width: `${String(size)}px`,
    height: `${String(size)}px`,
    color,
  } as CSSProperties

  return (
    <span
      {...rest}
      className={className}
      style={loaderStyle}
      data-o-gear-pair=""
      role="status"
    >
      <span className="o-sr-only">{label}</span>
      <svg aria-hidden viewBox="0 0 100 100" width="100%" height="100%">
        <path
          data-o-gear=""
          d={BIG_PATH}
          fill="currentColor"
          fillRule="evenodd"
          style={
            {
              '--o-gear-origin': `${String(BIG.cx)}px ${String(BIG.cy)}px`,
              '--o-gear-spin': 'o-gear-pair-cw',
              '--o-gear-speed': `${String(speed)}ms`,
            } as CSSProperties
          }
        />
        <path
          data-o-gear=""
          d={SMALL_PATH}
          fill="currentColor"
          fillOpacity={0.7}
          fillRule="evenodd"
          style={
            {
              '--o-gear-origin': `${SMALL.cx.toFixed(2)}px ${SMALL.cy.toFixed(2)}px`,
              '--o-gear-spin': 'o-gear-pair-ccw',
              // The tooth ratio: the small one makes a full turn while the big
              // one makes eight twelfths.
              '--o-gear-speed': `${String(Math.round((speed * SMALL.teeth) / BIG.teeth))}ms`,
            } as CSSProperties
          }
        />
      </svg>
    </span>
  )
}

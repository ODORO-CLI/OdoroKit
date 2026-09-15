/**
 * Flipping cube: a CSS 3D cube tips by a quarter turn, pauses, then tips on
 * the other axis.
 *
 * ## Four flips that come back to the start
 *
 * A cube always rolling the same way would not come back to its starting
 * orientation at the end of the cycle, and the loop would show a seam. Here
 * the four flips draw a round trip: a quarter turn on X, a quarter on Y, back
 * on X, back on Y. The last frame of the cycle is exactly the first.
 *
 * Between two flips, a pause. Without it, the cube turns continuously and the
 * eye no longer tells the faces apart: it is the pause that makes one read
 * "one face, then another".
 *
 * ## Two boxes, two roles
 *
 * The outer box carries a fixed tilt — a little from above, a little from the
 * side — so that three faces are always visible. The inner box carries the
 * animation. Separating the two avoids re-encoding the tilt in every
 * keyframe, and gives a rest state that reads as a cube and not as a square.
 *
 * The faces are shades of the same colour, obtained by mixing with
 * transparent: the cube follows the text colour, or the one it is given,
 * without ever hard coding one.
 *
 * ## A status, not a drawing
 *
 * The element carries `role="status"` and a label for screen readers: the
 * wait is information, not decoration. The cube itself is removed from the
 * accessibility tree.
 *
 * Under reduced motion, the cube stays tilted and still: three faces visible,
 * the figure still reads as a loader, only the movement stops.
 *
 * @module
 */

import { mergePresentation, type Customisable } from '@odoro-cli/engine'
import type { CSSProperties, ReactElement } from 'react'

/** Identifier of the injected stylesheet. */
const STYLE_ID = 'o-cube-flip'

/**
 * The six faces: their placement around the centre and their shade.
 *
 * The shade is a percentage of the colour, the rest being transparent. Three
 * values are enough to give relief: a full face, a middle face, a dark face.
 * Opposite faces share their shade, so that the cube looks the same after a
 * flip.
 */
const FACES: ReadonlyArray<{ readonly place: string; readonly shade: number }> = [
  { place: 'rotateY(0deg)', shade: 100 },
  { place: 'rotateY(180deg)', shade: 100 },
  { place: 'rotateY(90deg)', shade: 62 },
  { place: 'rotateY(-90deg)', shade: 62 },
  { place: 'rotateX(90deg)', shade: 82 },
  { place: 'rotateX(-90deg)', shade: 82 },
]

/** Applies the cube and its flips, once per document. */
function ensureCubeFlipRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    // A short perspective: the cube is small, a long perspective would make it
    // flat like an orthographic projection.
    '[data-o-cube-flip]{',
    'display:inline-block;line-height:0;',
    'width:var(--o-cube-size);height:var(--o-cube-size);',
    'perspective:calc(var(--o-cube-size) * 4);',
    '}',
    '[data-o-cube-flip-tilt]{',
    'display:block;width:100%;height:100%;',
    'transform-style:preserve-3d;',
    'transform:rotateX(-24deg) rotateY(-32deg);',
    '}',
    '[data-o-cube-flip-box]{',
    'display:block;position:relative;width:100%;height:100%;',
    'transform-style:preserve-3d;',
    'animation:o-cube-flip-turn var(--o-cube-speed) ease-in-out infinite;',
    '}',
    // The faces are translucent: without this line, the back faces would show
    // through the front faces.
    '[data-o-cube-flip-face]{',
    'position:absolute;inset:0;backface-visibility:hidden;',
    'background:color-mix(in oklab, var(--o-cube-color) var(--o-cube-shade), transparent);',
    'transform:var(--o-cube-place) translateZ(calc(var(--o-cube-size) / 2));',
    '}',
    // Four flips and four pauses. Each flip changes only one axis, and the
    // cycle comes back to (0, 0) with no seam.
    '@keyframes o-cube-flip-turn{',
    '0%,8%{transform:rotateX(0deg) rotateY(0deg)}',
    '25%,33%{transform:rotateX(-90deg) rotateY(0deg)}',
    '50%,58%{transform:rotateX(-90deg) rotateY(-90deg)}',
    '75%,83%{transform:rotateX(0deg) rotateY(-90deg)}',
    '100%{transform:rotateX(0deg) rotateY(0deg)}',
    '}',
    '@media (prefers-reduced-motion:reduce){',
    '[data-o-cube-flip-box]{animation:none;transform:none}',
    '}',
  ].join('')
  document.head.append(style)
}

/** Properties specific to the component. */
export interface CubeFlipOwnProps {
  /** Edge of the cube, in pixels. @defaultValue 32 */
  size?: number
  /** Duration of one cycle of four flips, in milliseconds. @defaultValue 2400 */
  speed?: number
  /** Colour of the cube. @defaultValue the text colour */
  color?: string
  /** Label announced to screen readers. @defaultValue 'Loading' */
  label?: string
}

/** All the properties. */
export type CubeFlipProps = Customisable<CubeFlipOwnProps, 'span'>

/**
 * Signals a wait with a cube tipping face after face.
 *
 * @example
 * <CubeFlip />
 *
 * @example
 * // Bigger, slower, in the brand hue.
 * <CubeFlip size={56} speed={3600} color="var(--o-palette-brand-500)" />
 */
export function CubeFlip({
  size = 32,
  speed = 2400,
  color = 'currentColor',
  label = 'Loading',
  ...rest
}: CubeFlipProps): ReactElement {
  ensureCubeFlipRule()

  const { className, style } = mergePresentation({}, rest)

  const loaderStyle = {
    ...style,
    '--o-cube-size': `${String(size)}px`,
    '--o-cube-speed': `${String(speed)}ms`,
    '--o-cube-color': color,
  } as CSSProperties

  return (
    <span
      {...rest}
      className={className}
      style={loaderStyle}
      data-o-cube-flip=""
      role="status"
    >
      <span className="o-sr-only">{label}</span>
      <span aria-hidden data-o-cube-flip-tilt="">
        <span data-o-cube-flip-box="">
          {FACES.map((face) => (
            <span
              key={face.place}
              data-o-cube-flip-face=""
              style={
                {
                  '--o-cube-place': face.place,
                  '--o-cube-shade': `${String(face.shade)}%`,
                } as CSSProperties
              }
            />
          ))}
        </span>
      </span>
    </span>
  )
}

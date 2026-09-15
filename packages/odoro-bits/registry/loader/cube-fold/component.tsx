/**
 * Folding square: a cross-shaped net whose four flaps rise one by one to close
 * a box, then fold back down.
 *
 * ## A flap turns on its hinge
 *
 * The net is a central face and four flaps stuck to its sides. Each flap
 * pivots around the side it shares with the centre — its transform origin is
 * that edge, not its middle. A centred rotation would send the flap through
 * the centre; from the edge, it rises like a cardboard lid.
 *
 * The four flaps play the same animation, but each on its own axis and in its
 * own direction: the rotation is written `rotate3d` with per-flap variables,
 * which the keyframe resolves element by element. One animation, four hinges.
 * The delays are negative and staggered from one flap to the next: the fold is
 * already under way on the first frame, and the flaps rise turning around the
 * box rather than all together.
 *
 * The flaps fold backwards, away from the viewer: what is seen is the outside
 * of the box, with its shaded faces, and not the inside of a well.
 *
 * ## A status, not a drawing
 *
 * The element carries `role="status"` and a label for screen readers: the wait
 * is information, not decoration. The net is removed from the accessibility
 * tree.
 *
 * Under reduced motion, the box stays closed: that is the state the fold
 * arrives at, and the only one where the figure is a cube.
 *
 * @module
 */

import { mergePresentation, type Customisable } from '@odoro-cli/engine'
import type { CSSProperties, ReactElement } from 'react'

/** Identifier of the injected stylesheet. */
const STYLE_ID = 'o-cube-fold'

/**
 * The four flaps: place in the net, hinge, axis and direction.
 *
 * The place is counted in faces: the centre is at (1, 1). The direction is
 * chosen so that each flap folds backwards: around X in the positive
 * direction for the top flap, negative for the bottom one, and likewise on Y
 * for the right and the left. The order of the list is the order of folding,
 * clockwise.
 */
const FLAPS: ReadonlyArray<{
  readonly row: number
  readonly column: number
  readonly hinge: string
  readonly axis: string
  readonly turn: number
}> = [
  { row: 0, column: 1, hinge: 'bottom center', axis: '1,0,0', turn: 90 },
  { row: 1, column: 2, hinge: 'left center', axis: '0,1,0', turn: 90 },
  { row: 2, column: 1, hinge: 'top center', axis: '1,0,0', turn: -90 },
  { row: 1, column: 0, hinge: 'right center', axis: '0,1,0', turn: -90 },
]

/** Sets the net and its folding, once per document. */
function ensureCubeFoldRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-cube-fold]{',
    'display:inline-block;line-height:0;',
    'width:calc(var(--o-fold-size) * 3);height:calc(var(--o-fold-size) * 3);',
    'perspective:calc(var(--o-fold-size) * 12);',
    '}',
    // A fixed tilt: head-on, the folded flaps would disappear behind the
    // centre and the fold would read as a shrinking.
    '[data-o-cube-fold-tilt]{',
    'display:block;position:relative;width:100%;height:100%;',
    'transform-style:preserve-3d;',
    'transform:rotateX(-28deg) rotateY(-34deg);',
    '}',
    '[data-o-cube-fold-face]{',
    'position:absolute;width:var(--o-fold-size);height:var(--o-fold-size);',
    'top:calc(var(--o-fold-size) * var(--o-fold-row));',
    'left:calc(var(--o-fold-size) * var(--o-fold-column));',
    'backface-visibility:hidden;',
    'background:color-mix(in oklab, var(--o-fold-color) var(--o-fold-shade), transparent);',
    '}',
    '[data-o-cube-fold-flap]{',
    'transform-origin:var(--o-fold-hinge);',
    'animation:o-cube-fold-close var(--o-fold-speed) ease-in-out infinite;',
    'animation-delay:var(--o-fold-delay);',
    '}',
    // Folds, holds, unfolds. The axis and angle variables are the flap's own:
    // a single animation, four hinges.
    '@keyframes o-cube-fold-close{',
    '0%,12%{transform:rotate3d(var(--o-fold-axis),0deg)}',
    '38%,62%{transform:rotate3d(var(--o-fold-axis),var(--o-fold-turn))}',
    '88%,100%{transform:rotate3d(var(--o-fold-axis),0deg)}',
    '}',
    '@media (prefers-reduced-motion:reduce){',
    '[data-o-cube-fold-flap]{animation:none;transform:rotate3d(var(--o-fold-axis),var(--o-fold-turn))}',
    '}',
  ].join('')
  document.head.append(style)
}

/** Properties specific to the component. */
export interface CubeFoldOwnProps {
  /** Side of one face, in pixels. The unfolded net takes three. @defaultValue 20 */
  size?: number
  /** Duration of one fold and unfold cycle, in milliseconds. @defaultValue 2600 */
  speed?: number
  /** Colour of the faces. @defaultValue the text colour */
  color?: string
  /** Label announced to screen readers. @defaultValue 'Loading' */
  label?: string
}

/** All the properties. */
export type CubeFoldProps = Customisable<CubeFoldOwnProps, 'span'>

/**
 * Signals a wait with a net that folds itself into a box.
 *
 * @example
 * <CubeFold />
 *
 * @example
 * // Bigger, slower, in the brand hue.
 * <CubeFold size={32} speed={4000} color="var(--o-palette-brand-500)" />
 */
export function CubeFold({
  size = 20,
  speed = 2600,
  color = 'currentColor',
  label = 'Loading',
  ...rest
}: CubeFoldProps): ReactElement {
  ensureCubeFoldRule()

  const { className, style } = mergePresentation({}, rest)

  const loaderStyle = {
    ...style,
    '--o-fold-size': `${String(size)}px`,
    '--o-fold-speed': `${String(speed)}ms`,
    '--o-fold-color': color,
  } as CSSProperties

  return (
    <span
      {...rest}
      className={className}
      style={loaderStyle}
      data-o-cube-fold=""
      role="status"
    >
      <span className="o-sr-only">{label}</span>
      <span aria-hidden data-o-cube-fold-tilt="">
        <span
          data-o-cube-fold-face=""
          style={
            {
              '--o-fold-row': 1,
              '--o-fold-column': 1,
              '--o-fold-shade': '100%',
            } as CSSProperties
          }
        />
        {FLAPS.map((flap, index) => (
          <span
            key={flap.hinge}
            data-o-cube-fold-face=""
            data-o-cube-fold-flap=""
            style={
              {
                '--o-fold-row': flap.row,
                '--o-fold-column': flap.column,
                '--o-fold-shade': '66%',
                '--o-fold-hinge': flap.hinge,
                '--o-fold-axis': flap.axis,
                '--o-fold-turn': `${String(flap.turn)}deg`,
                // A tenth of a cycle between two flaps, negative: the first
                // flap is already up when the last one starts, and the fold
                // turns around the box.
                '--o-fold-delay': `${String(Math.round(-speed * index * 0.1))}ms`,
              } as CSSProperties
            }
          />
        ))}
      </span>
    </span>
  )
}

/**
 * Depth: the heading is extruded into layers, and the block turns on itself.
 *
 * ## An extrusion, not a drop shadow
 *
 * A drop shadow is flat: it reveals nothing when the object turns. Here each
 * copy is pushed back **in depth** — `translate3d` on the Z axis, inside a
 * `preserve-3d` context — so that the slow rotation uncovers the side of the
 * block, then closes it again. It is the rotation that makes the thickness
 * credible; without it, one would only see an offset.
 *
 * ## Nothing runs
 *
 * The copies are laid down at render, their offset comes from a variable
 * multiplied by their rank, and the rotation is a CSS animation. The
 * compositor animates **a single** element — the stack — and the copies follow
 * because they live in its 3D space. One JavaScript per frame would be waste
 * for a movement that depends on nothing.
 *
 * ## The document order serves as the fallback
 *
 * The copies are written from the furthest to the nearest, the real face last.
 * Where `preserve-3d` does not exist, the paint order already gives the right
 * stacking: the heading stays above its extrusion.
 *
 * ## Distinction
 *
 * `echo-text` also lays down copies, but faded, in two dimensions, and they
 * follow the pointer with a lag: that is a trail. Here the copies are solid,
 * welded to the heading, and nothing follows the pointer.
 *
 * ## Reduced motion
 *
 * The rotation stops, the extrusion stays. That really is the arrival state:
 * the thickness is the shape of the heading, not its animation.
 *
 * @module
 */

import { mergePresentation, type Customisable } from '@odoro-cli/engine'
import { type CSSProperties, type ElementType, type ReactElement } from 'react'

/** Properties specific to the component. */
export interface DepthTextOwnProps {
  /** Text to extrude. A string: it is copied layer by layer. */
  children: string
  /** Rendered tag. @defaultValue 'span' */
  as?: ElementType
  /** Number of extrusion layers. @defaultValue 8 */
  depth?: number
  /** Offset from one layer to the next, in pixels. @defaultValue 2 */
  step?: number
  /**
   * Colour of the side.
   *
   * A value, not a role: the thickness is a graphic decision, and tying it to
   * the ink of the theme would make it invisible.
   *
   * @defaultValue a hue from the brand palette
   */
  color?: string
  /** Amplitude of the rotation, in degrees. @defaultValue 16 */
  angle?: number
  /** Duration of one full round trip, in milliseconds. @defaultValue 6000 */
  speed?: number
  /** Vanishing distance, in pixels. The lower, the more pronounced. @defaultValue 600 */
  perspective?: number
}

/** All properties. */
export type DepthTextProps = Customisable<DepthTextOwnProps, 'span'>

/** Identifier of the injected stylesheet. */
const STYLE_ID = 'o-depth-text'

/** Ceiling on layers: beyond it, the thickness no longer reads, it clogs. */
const MAX_LAYERS = 32

/** Sets the extrusion rules, once per document. */
function ensureDepthRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-depth]{display:inline-block;perspective:var(--o-depth-vanish)}',
    '[data-o-depth-stack]{',
    'position:relative;display:inline-block;transform-style:preserve-3d;',
    'animation:o-depth-turn var(--o-depth-speed) ease-in-out infinite;',
    '}',
    // The copies occupy exactly the box of the face: same width, hence the
    // same line composition.
    '[data-o-depth-layer]{',
    'position:absolute;left:0;top:0;width:100%;',
    'color:var(--o-depth-colour);pointer-events:none;',
    'transform:translate3d(',
    'calc(var(--o-depth-row) * var(--o-depth-step)),',
    'calc(var(--o-depth-row) * var(--o-depth-step)),',
    'calc(var(--o-depth-row) * var(--o-depth-step) * -1));',
    '}',
    '[data-o-depth-face]{position:relative;display:inline-block}',
    '@keyframes o-depth-turn{',
    '0%,100%{transform:rotateY(calc(var(--o-depth-angle) * -1)) rotateX(calc(var(--o-depth-angle) / 3))}',
    '50%{transform:rotateY(var(--o-depth-angle)) rotateX(calc(var(--o-depth-angle) / -3))}',
    '}',
    // With no motion, the block comes to rest facing forward: the thickness
    // remains.
    '@media (prefers-reduced-motion:reduce){[data-o-depth-stack]{animation:none}}',
  ].join('')
  document.head.append(style)
}

/**
 * Extrudes a heading into layers and turns it slowly.
 *
 * @example
 * <DepthText as="h1" className="o-text-5xl o-font-extrabold">
 *   Volume
 * </DepthText>
 *
 * @example
 * // A deep and dark thickness, almost motionless.
 * <DepthText depth={18} step={3} angle={6} speed={12000} color="var(--o-palette-indigo-700)">
 *   Relief
 * </DepthText>
 */
export function DepthText({
  children,
  as: Tag = 'span',
  depth = 8,
  step = 2,
  color = 'var(--o-palette-brand-500)',
  angle = 16,
  speed = 6000,
  perspective = 600,
  ...rest
}: DepthTextProps): ReactElement {
  ensureDepthRule()

  const { className, style } = mergePresentation({}, rest)

  const layers = Math.max(0, Math.min(MAX_LAYERS, Math.round(depth)))

  const rootStyle = {
    ...style,
    '--o-depth-vanish': `${String(perspective)}px`,
    '--o-depth-step': `${String(step)}px`,
    '--o-depth-colour': color,
    '--o-depth-angle': `${String(angle)}deg`,
    '--o-depth-speed': `${String(speed)}ms`,
  } as CSSProperties

  // From the furthest to the nearest: see the header, the document order
  // serves as the fallback where depth is not composited.
  const ranks = Array.from({ length: layers }, (_, index) => layers - index)

  return (
    <Tag {...rest} className={className} style={rootStyle} data-o-depth="">
      <span data-o-depth-stack="">
        {ranks.map((rank) => (
          <span
            key={rank}
            aria-hidden
            data-o-depth-layer=""
            style={{ '--o-depth-row': rank } as CSSProperties}
          >
            {children}
          </span>
        ))}
        {/* The face: the real text, exposed once only. */}
        <span data-o-depth-face="">{children}</span>
      </span>
    </Tag>
  )
}

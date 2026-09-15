/**
 * Bouncing ball: a ball falls, squashes on the ground, leaves again, and
 * its shadow grows as it comes closer.
 *
 * ## A fall is not a rise in reverse
 *
 * A falling ball speeds up; a rising ball slows down. The same curve in
 * both directions — the `ease-in-out` one reaches for by reflex — gives a
 * ball that floats, with no weight. Here the fall is in `ease-in`, the rise
 * in `ease-out`, and between the two the ball flattens on the ground: it is
 * the squash that says there has been an impact, and the recovery of shape
 * that says the ball is elastic. The origin of the squash is the bottom of
 * the ball, so that it stays resting on the ground while it deforms.
 *
 * The shadow is what gives the height: without it, a ball that goes up and
 * down is a dot that moves. It tightens and pales when the ball is far,
 * spreads and darkens when it touches. Two animations, held by the
 * compositor, no JavaScript after the first render.
 *
 * ## A status, not a drawing
 *
 * The element carries `role="status"` and a label for screen readers: the
 * wait is information, not decoration. The ball and its shadow are removed
 * from the accessibility tree.
 *
 * Under reduced motion, the ball rests on the ground, on its full shadow:
 * that is where a ball always ends up, and the figure is still recognised.
 *
 * @module
 */

import { mergePresentation, type Customisable } from '@odoro-cli/engine'
import type { CSSProperties, ReactElement } from 'react'

/** Identifier of the injected stylesheet. */
const STYLE_ID = 'o-bouncing-ball'

/** Height of the bounce, in ball diameters. */
const HEIGHT = 2.4

/** Applies the ball, its shadow and the bounce, once per document. */
function ensureBallRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    // The column reserves the height of the jump above the ball: the loader
    // does not change size depending on the frame you look at it in.
    '[data-o-bouncing-ball]{',
    'display:inline-flex;flex-direction:column;align-items:center;justify-content:flex-end;',
    `height:calc(var(--o-ball-size) * ${String(HEIGHT + 1.5)});`,
    'width:calc(var(--o-ball-size) * 1.6);',
    '}',
    '[data-o-ball]{',
    'width:var(--o-ball-size);height:var(--o-ball-size);',
    'border-radius:50%;background:var(--o-ball-color);',
    'transform-origin:50% 100%;',
    'animation:o-bouncing-ball-jump var(--o-ball-speed) infinite;',
    '}',
    '[data-o-ball-shadow]{',
    'width:calc(var(--o-ball-size) * 1.2);height:calc(var(--o-ball-size) * 0.28);',
    'margin-top:calc(var(--o-ball-size) * 0.12);',
    'border-radius:50%;background:var(--o-ball-color);opacity:0.4;',
    'animation:o-bouncing-ball-shade var(--o-ball-speed) infinite;',
    '}',
    // Fall while speeding up, squash on the ground, rise while slowing down.
    '@keyframes o-bouncing-ball-jump{',
    `0%{transform:translateY(calc(var(--o-ball-size) * -${String(HEIGHT)})) scale(1);animation-timing-function:ease-in}`,
    '44%{transform:translateY(0) scale(1);animation-timing-function:ease-out}',
    '50%{transform:translateY(0) scale(1.25,0.72);animation-timing-function:ease-in}',
    '56%{transform:translateY(0) scale(1);animation-timing-function:ease-out}',
    `100%{transform:translateY(calc(var(--o-ball-size) * -${String(HEIGHT)})) scale(1)}`,
    '}',
    // The shadow follows the height: small and pale at the top, wide and
    // full at the contact.
    '@keyframes o-bouncing-ball-shade{',
    '0%{transform:scaleX(0.45);opacity:0.12;animation-timing-function:ease-in}',
    '44%,56%{transform:scaleX(1);opacity:0.4;animation-timing-function:ease-out}',
    '100%{transform:scaleX(0.45);opacity:0.12}',
    '}',
    // A ball resting on its shadow: the figure is stated, with no bounce.
    '@media (prefers-reduced-motion:reduce){',
    '[data-o-ball],[data-o-ball-shadow]{animation:none;transform:none}',
    '}',
  ].join('')
  document.head.append(style)
}

/** Properties specific to the component. */
export interface BouncingBallOwnProps {
  /** Diameter of the ball, in pixels. @defaultValue 12 */
  size?: number
  /** Duration of a full bounce, in milliseconds. @defaultValue 800 */
  speed?: number
  /** Color of the ball and of its shadow. @defaultValue the text color */
  color?: string
  /** Label announced to screen readers. @defaultValue 'Loading' */
  label?: string
}

/** All the properties. */
export type BouncingBallProps = Customisable<BouncingBallOwnProps, 'span'>

/**
 * Signals a wait with a ball bouncing on its shadow.
 *
 * @example
 * <BouncingBall />
 *
 * @example
 * // Bigger, slower, in the brand hue.
 * <BouncingBall size={18} speed={1200} color="var(--o-palette-brand-500)" />
 */
export function BouncingBall({
  size = 12,
  speed = 800,
  color = 'currentColor',
  label = 'Loading',
  ...rest
}: BouncingBallProps): ReactElement {
  ensureBallRule()

  const { className, style } = mergePresentation({}, rest)

  const loaderStyle = {
    ...style,
    '--o-ball-size': `${String(size)}px`,
    '--o-ball-speed': `${String(speed)}ms`,
    '--o-ball-color': color,
  } as CSSProperties

  return (
    <span
      {...rest}
      className={className}
      style={loaderStyle}
      data-o-bouncing-ball=""
      role="status"
    >
      <span className="o-sr-only">{label}</span>
      <span aria-hidden data-o-ball="" />
      <span aria-hidden data-o-ball-shadow="" />
    </span>
  )
}

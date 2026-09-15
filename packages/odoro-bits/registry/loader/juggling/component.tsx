/**
 * Juggling: three balls pass from one hand to the other, a low pass one way, a
 * tall arc the other.
 *
 * ## Why a shower, and not a cascade
 *
 * The classic figure — the cascade, where every ball describes the same arc in
 * both directions — does not let itself be replayed by three offset copies of
 * a single animation: two balls end up crossing at the same point, at the same
 * height, and pass through each other. The shower does not have that problem:
 * one hand throws high, the other returns low and fast, and the two paths
 * never meet. It is also the most legible figure at this size, because the eye
 * follows a single tall arc.
 *
 * Each ball carries two animations on two nested elements: the horizontal
 * movement, linear — nothing slows a ball down sideways — and the vertical
 * movement, `ease-out` on the way up and `ease-in` on the way down, which is a
 * parabola near enough. Separating them makes it possible to give them
 * different curves; a single animation would have to choose.
 *
 * The balls stay a moment in each hand before setting off again: without that
 * catching time, they would bounce instead of being thrown.
 *
 * ## A status, not a drawing
 *
 * The element carries `role="status"` and a label for screen readers: waiting
 * is information, not decoration. The balls are removed from the accessibility
 * tree.
 *
 * Under reduced motion, the three balls sit in a line, at the bottom: the
 * figure still reads, only the throwing stops.
 *
 * @module
 */

import { mergePresentation, type Customisable } from '@odoro-cli/engine'
import type { CSSProperties, ReactElement } from 'react'

/** Identifier of the injected stylesheet. */
const STYLE_ID = 'o-juggling'

/** Number of balls. */
const BALLS = 3

/** Distance between the two hands, in ball diameters. */
const SPAN = 3

/** Height of the tall arc, in ball diameters. */
const ARC = 3

/** Height of the low pass, as a share of the tall arc. */
const PASS = 0.35

/** Sets up the balls and their two paths, once per document. */
function ensureJugglingRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-juggling]{',
    'position:relative;display:inline-block;',
    `width:calc(var(--o-juggle-size) * ${String(SPAN + 1)});`,
    `height:calc(var(--o-juggle-size) * ${String(ARC + 1)});`,
    '}',
    // The outer element carries the horizontal path; at rest, each ball has
    // its own place at the bottom, so that the three do not overlap.
    '[data-o-juggle-path]{',
    'position:absolute;left:0;bottom:0;',
    'width:var(--o-juggle-size);height:var(--o-juggle-size);',
    'transform:translateX(var(--o-juggle-rest));',
    'animation:o-juggling-across var(--o-juggle-speed) linear infinite;',
    'animation-delay:var(--o-juggle-delay);',
    '}',
    // The inner element carries the height, with its own curves.
    '[data-o-juggle-ball]{',
    'display:block;width:100%;height:100%;',
    'border-radius:50%;background:var(--o-juggle-color);',
    'animation:o-juggling-height var(--o-juggle-speed) infinite;',
    'animation-delay:var(--o-juggle-delay);',
    '}',
    // Low pass from left to right, catch, tall arc from right to left, catch.
    // The path is linear: nothing slows a ball down sideways.
    '@keyframes o-juggling-across{',
    '0%,6%{transform:translateX(0)}',
    `26%,36%{transform:translateX(calc(var(--o-juggle-size) * ${String(SPAN)}))}`,
    '92%,100%{transform:translateX(0)}',
    '}',
    // Rising while slowing, falling while speeding up: a parabola near enough,
    // and two different heights depending on the direction.
    '@keyframes o-juggling-height{',
    '0%,6%{transform:translateY(0);animation-timing-function:ease-out}',
    `16%{transform:translateY(calc(var(--o-juggle-size) * -${String(ARC * PASS)}));animation-timing-function:ease-in}`,
    '26%,36%{transform:translateY(0);animation-timing-function:ease-out}',
    `64%{transform:translateY(calc(var(--o-juggle-size) * -${String(ARC)}));animation-timing-function:ease-in}`,
    '92%,100%{transform:translateY(0)}',
    '}',
    // Three balls sitting in a line: the figure is stated, without throwing.
    '@media (prefers-reduced-motion:reduce){',
    '[data-o-juggle-path],[data-o-juggle-ball]{animation:none}',
    '[data-o-juggle-ball]{transform:none}',
    '}',
  ].join('')
  document.head.append(style)
}

/** Props of the component itself. */
export interface JugglingOwnProps {
  /** Diameter of a ball, in pixels. @defaultValue 10 */
  size?: number
  /** Duration of a complete turn of one ball, in milliseconds. @defaultValue 1800 */
  speed?: number
  /** Colour of the balls. @defaultValue the text colour */
  color?: string
  /** Label announced to screen readers. @defaultValue 'Loading' */
  label?: string
}

/** All the props. */
export type JugglingProps = Customisable<JugglingOwnProps, 'span'>

/**
 * Signals a wait through three juggled balls.
 *
 * @example
 * <Juggling />
 *
 * @example
 * // Bigger, slower, in the brand hue.
 * <Juggling size={14} speed={2600} color="var(--o-palette-brand-500)" />
 */
export function Juggling({
  size = 10,
  speed = 1800,
  color = 'currentColor',
  label = 'Loading',
  ...rest
}: JugglingProps): ReactElement {
  ensureJugglingRule()

  const { className, style } = mergePresentation({}, rest)

  const loaderStyle = {
    ...style,
    '--o-juggle-size': `${String(size)}px`,
    '--o-juggle-speed': `${String(speed)}ms`,
    '--o-juggle-color': color,
  } as CSSProperties

  return (
    <span
      {...rest}
      className={className}
      style={loaderStyle}
      data-o-juggling=""
      role="status"
    >
      <span className="o-sr-only">{label}</span>
      {Array.from({ length: BALLS }, (_, ball) => (
        <span
          key={ball}
          aria-hidden
          data-o-juggle-path=""
          style={
            {
              // A third of a turn apart, negative: the three balls are already
              // in the air or in hand on the first frame.
              '--o-juggle-delay': `${String(Math.round((-speed * ball) / BALLS))}ms`,
              '--o-juggle-rest': `${String((size * SPAN * ball) / (BALLS - 1))}px`,
            } as CSSProperties
          }
        >
          <span data-o-juggle-ball="" />
        </span>
      ))}
    </span>
  )
}

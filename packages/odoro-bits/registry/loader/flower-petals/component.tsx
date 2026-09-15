/**
 * Opening petals: eight petals open one by one around a heart, hold, then
 * close again.
 *
 * ## A petal grows from its base
 *
 * Each petal is an ellipse placed above the heart, then turned around it by
 * its group: eight groups, eight angles, a single shape. The opening is a
 * scale whose origin is the base of the petal — the end that touches the
 * heart. A centred scale would make the petal appear in mid-air, detached;
 * from its base, it grows.
 *
 * The cycle is asymmetric on purpose: the opening is slow and the flower holds
 * open half of the time, the closing is abrupt. A flower that opened and
 * closed at the same pace would breathe, and this loader is not a breath —
 * `dots-loader` already is one.
 *
 * The eight petals share the animation, each offset by a twelfth of a cycle,
 * in negative delay: the sequence is already under way on the first frame.
 *
 * ## A status, not a drawing
 *
 * The element carries `role="status"` and a label for screen readers: the wait
 * is information, not decoration. The drawing is removed from the
 * accessibility tree.
 *
 * Under reduced motion, the flower stays open: that is the state it spends the
 * most time in, and the only one where it is recognisable.
 *
 * @module
 */

import { mergePresentation, type Customisable } from '@odoro-cli/engine'
import type { CSSProperties, ReactElement } from 'react'

/** Identifier of the injected stylesheet. */
const STYLE_ID = 'o-flower-petals'

/** Number of petals. */
const PETALS = 8

/** Sets the flower and its opening, once per document. */
function ensureFlowerRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-flower-petals]{display:inline-block;line-height:0}',
    '[data-o-flower-heart]{fill:var(--o-petal-color)}',
    // The origin of the scale is the base of the petal, on the heart side: it
    // grows out of the flower, it does not appear in mid-air.
    '[data-o-flower-petal]{',
    'fill:var(--o-petal-color);opacity:0.85;',
    'transform-box:fill-box;transform-origin:50% 100%;',
    'animation:o-flower-petals-bloom var(--o-petal-speed) infinite;',
    'animation-delay:var(--o-petal-delay);',
    '}',
    // Slow opening, long hold, abrupt closing.
    '@keyframes o-flower-petals-bloom{',
    '0%{transform:scale(0.1);animation-timing-function:ease-out}',
    '30%,80%{transform:scale(1);animation-timing-function:ease-in}',
    '92%,100%{transform:scale(0.1)}',
    '}',
    // The flower open: the state in which it is recognisable.
    '@media (prefers-reduced-motion:reduce){',
    '[data-o-flower-petal]{animation:none;transform:none}',
    '}',
  ].join('')
  document.head.append(style)
}

/** Properties specific to the component. */
export interface FlowerPetalsOwnProps {
  /** Side of the drawing, in pixels. @defaultValue 48 */
  size?: number
  /** Duration of one full bloom, in milliseconds. @defaultValue 2400 */
  speed?: number
  /** Colour of the petals and of the heart. @defaultValue the text colour */
  color?: string
  /** Label announced to screen readers. @defaultValue 'Loading' */
  label?: string
}

/** All the properties. */
export type FlowerPetalsProps = Customisable<FlowerPetalsOwnProps, 'span'>

/**
 * Signals a wait with a flower opening petal after petal.
 *
 * @example
 * <FlowerPetals />
 *
 * @example
 * // Bigger, slower, in the brand hue.
 * <FlowerPetals size={96} speed={3600} color="var(--o-palette-brand-500)" />
 */
export function FlowerPetals({
  size = 48,
  speed = 2400,
  color = 'currentColor',
  label = 'Loading',
  ...rest
}: FlowerPetalsProps): ReactElement {
  ensureFlowerRule()

  const { className, style } = mergePresentation({}, rest)

  const loaderStyle = {
    ...style,
    '--o-petal-speed': `${String(speed)}ms`,
    '--o-petal-color': color,
  } as CSSProperties

  return (
    <span
      {...rest}
      className={className}
      style={loaderStyle}
      data-o-flower-petals=""
      role="status"
    >
      <span className="o-sr-only">{label}</span>
      <svg aria-hidden width={size} height={size} viewBox="0 0 100 100">
        {Array.from({ length: PETALS }, (_, index) => (
          <g key={index} transform={`rotate(${String((360 / PETALS) * index)} 50 50)`}>
            <ellipse
              data-o-flower-petal=""
              cx="50"
              cy="27"
              rx="9"
              ry="19"
              style={
                {
                  // A twelfth of a cycle between two petals, negative: the
                  // sequence is already under way on the first frame.
                  '--o-petal-delay': `${String(Math.round((-speed * (PETALS - 1 - index)) / 12))}ms`,
                } as CSSProperties
              }
            />
          </g>
        ))}
        <circle data-o-flower-heart="" cx="50" cy="50" r="7" />
      </svg>
    </span>
  )
}

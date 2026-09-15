/**
 * Yin and yang: the symbol spins like a top being flicked, two turns per
 * flick, slowing down until it nearly stops.
 *
 * ## A single colour, and the background for the other
 *
 * The symbol has two; the component knows only one. The dark half is a closed
 * path — an outer half-circle and two inner half-circles in an S — whose eye
 * is a hole, cut out by the `evenodd` rule. The light half is not drawn: it is
 * what the background shows through, bounded by the outer circle in stroke.
 * The symbol therefore stays correct on any surface, dark or light, without
 * ever naming the colour of the background.
 *
 * The motion is that of a top, not of a wheel: launched in one go, it races,
 * slows down at length, and nearly stops before being flicked again. It is a
 * single strongly `ease-out` curve over two turns, followed by a pause. A
 * linear rotation, the default choice, would make a disc that turns; here the
 * eye sees the gesture that relaunches it.
 *
 * One rotation animation on an SVG group, held by the compositor, no
 * JavaScript after the first render.
 *
 * ## A status, not a drawing
 *
 * The element carries `role="status"` and a label for screen readers: the wait
 * is information, not decoration. The symbol is removed from the accessibility
 * tree.
 *
 * Under reduced motion, the symbol is upright and still: that is where the top
 * ends up, and the figure is still recognisable.
 *
 * @module
 */

import { mergePresentation, type Customisable } from '@odoro-cli/engine'
import type { CSSProperties, ReactElement } from 'react'

/** Identifier of the injected stylesheet. */
const STYLE_ID = 'o-yin-yang'

/** Radius of the symbol, in a view of 100. */
const RADIUS = 45

/** Radius of each eye. */
const EYE = 6

/**
 * The dark half: outer half-circle by the right, then the S by two inner
 * half-circles, and the eye of the dark half as a hole.
 */
const DARK = [
  `M 50 ${String(50 - RADIUS)}`,
  `A ${String(RADIUS)} ${String(RADIUS)} 0 0 1 50 ${String(50 + RADIUS)}`,
  `A ${String(RADIUS / 2)} ${String(RADIUS / 2)} 0 0 1 50 50`,
  `A ${String(RADIUS / 2)} ${String(RADIUS / 2)} 0 0 0 50 ${String(50 - RADIUS)}`,
  'Z',
  `M ${String(50 + EYE)} ${String(50 + RADIUS / 2)}`,
  `A ${String(EYE)} ${String(EYE)} 0 1 0 ${String(50 - EYE)} ${String(50 + RADIUS / 2)}`,
  `A ${String(EYE)} ${String(EYE)} 0 1 0 ${String(50 + EYE)} ${String(50 + RADIUS / 2)}`,
  'Z',
].join(' ')

/** Sets the symbol and its spin, once per document. */
function ensureYinYangRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-yin-yang]{display:inline-block;line-height:0}',
    '[data-o-yin-yang] svg{display:block}',
    '[data-o-yin-yang-disc]{',
    'transform-box:view-box;transform-origin:50px 50px;',
    'animation:o-yin-yang-spin var(--o-yin-yang-speed) infinite;',
    '}',
    // One flick: two turns that start fast and die away, then a pause before
    // the next one.
    '@keyframes o-yin-yang-spin{',
    '0%{transform:rotate(0deg);animation-timing-function:cubic-bezier(0.1,0.7,0.2,1)}',
    '90%,100%{transform:rotate(720deg)}',
    '}',
    // The symbol upright: the figure is spoken, the top set down.
    '@media (prefers-reduced-motion:reduce){',
    '[data-o-yin-yang-disc]{animation:none;transform:none}',
    '}',
  ].join('')
  document.head.append(style)
}

/** Properties specific to the component. */
export interface YinYangOwnProps {
  /** Diameter of the symbol, in pixels. @defaultValue 44 */
  size?: number
  /** Duration of one flick, the two turns and the pause included, in milliseconds. @defaultValue 2400 */
  speed?: number
  /** Colour of the dark half and of the outline; the other half is the background. @defaultValue the text colour */
  color?: string
  /** Label announced to screen readers. @defaultValue 'Loading' */
  label?: string
}

/** All the properties. */
export type YinYangProps = Customisable<YinYangOwnProps, 'span'>

/**
 * Signals a wait with a yin and yang spinning like a top.
 *
 * @example
 * <YinYang />
 *
 * @example
 * // Bigger, slower, in the brand hue.
 * <YinYang size={72} speed={4000} color="var(--o-palette-brand-500)" />
 */
export function YinYang({
  size = 44,
  speed = 2400,
  color = 'currentColor',
  label = 'Loading',
  ...rest
}: YinYangProps): ReactElement {
  ensureYinYangRule()

  const { className, style } = mergePresentation({}, rest)

  const loaderStyle = {
    ...style,
    width: `${String(size)}px`,
    height: `${String(size)}px`,
    color,
    '--o-yin-yang-speed': `${String(speed)}ms`,
  } as CSSProperties

  return (
    <span
      {...rest}
      className={className}
      style={loaderStyle}
      data-o-yin-yang=""
      role="status"
    >
      <span className="o-sr-only">{label}</span>
      <svg aria-hidden viewBox="0 0 100 100" width="100%" height="100%">
        <g data-o-yin-yang-disc="">
          <circle
            cx={50}
            cy={50}
            r={RADIUS}
            fill="none"
            stroke="currentColor"
            strokeWidth={3}
          />
          <path d={DARK} fill="currentColor" fillRule="evenodd" />
          <circle cx={50} cy={50 - RADIUS / 2} r={EYE} fill="currentColor" />
        </g>
      </svg>
    </span>
  )
}

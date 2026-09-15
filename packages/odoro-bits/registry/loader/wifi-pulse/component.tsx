/**
 * Wifi wave: the arcs draw themselves from the nearest to the farthest,
 * hold for a moment all together, then clear at once.
 *
 * ## A wave leaves the source, it does not appear everywhere at once
 *
 * Every arc draws itself through its middle — from left to right along the
 * path — instead of appearing in a fade: a wave has a direction, and a fade
 * has none. The arcs then leave one after the other, from the smallest to
 * the largest, which gives the propagation. It is the same stroke for all
 * of them, offset by a fraction of the cycle: the number of arcs changes
 * nothing in the stylesheet.
 *
 * The path declares a length of one hundred: the dash and its offset read
 * as per cent, whatever the radius of the arc. Without that, every arc
 * would ask for its own values, since they do not share the same length.
 *
 * The three arcs share the same center, that of the emission point, and
 * cover the same sector: they are therefore concentric to the eye, which a
 * series of arcs placed by hand would not be.
 *
 * The dot does not blink in time with the arcs: it gives a single impulse
 * per cycle, as the wave leaves. It is the source, not a fourth arc.
 *
 * One CSS animation per arc, the same one, plus one for the dot, held by
 * the compositor, no JavaScript after the first render.
 *
 * ## A status, not a drawing
 *
 * The element carries `role="status"` and a label for screen readers: the
 * wait is information, not decoration. The drawing is removed from the
 * accessibility tree.
 *
 * Under reduced motion, every arc is drawn and the dot is placed: that is
 * the instant when the wave is complete, the one that states the figure.
 *
 * @module
 */

import { mergePresentation, type Customisable } from '@odoro-cli/engine'
import type { CSSProperties, ReactElement } from 'react'

/** Identifier of the injected stylesheet. */
const STYLE_ID = 'o-wifi-pulse'

/** The emission point, in a 100-unit view box. */
const SOURCE = { x: 50, y: 80 }

/** Radii of the arcs, from the nearest to the farthest. */
const RADII = [22, 38, 54] as const

/** Share of the cycle that separates two arcs. */
const STAGGER = 0.12

/**
 * A ninety-degree arc centered on the source, open towards the top: from
 * the left diagonal to the right diagonal, by way of the apex.
 */
function arcAt(radius: number): string {
  const reach = radius * Math.SQRT1_2
  const from = `${(SOURCE.x - reach).toFixed(2)} ${(SOURCE.y - reach).toFixed(2)}`
  const to = `${(SOURCE.x + reach).toFixed(2)} ${(SOURCE.y - reach).toFixed(2)}`
  return `M ${from} A ${String(radius)} ${String(radius)} 0 0 1 ${to}`
}

/** Applies the arcs, their propagation and the dot, once per document. */
function ensureWifiRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-wifi-pulse]{display:inline-block;line-height:0}',
    '[data-o-wifi-pulse] svg{display:block}',
    '[data-o-wifi-arc]{',
    'stroke-dasharray:100 100;stroke-dashoffset:100;opacity:0;',
    'animation:o-wifi-pulse-arc var(--o-wifi-speed) infinite;',
    '}',
    '[data-o-wifi-dot]{',
    'transform-box:view-box;',
    `transform-origin:${String(SOURCE.x)}px ${String(SOURCE.y)}px;`,
    'animation:o-wifi-pulse-dot var(--o-wifi-speed) infinite;',
    '}',
    // The arc draws itself, holds long enough for the next ones to join it,
    // then the whole wave clears together.
    '@keyframes o-wifi-pulse-arc{',
    '0%{stroke-dashoffset:100;opacity:0;animation-timing-function:ease-out}',
    '12%{opacity:1}',
    '36%,68%{stroke-dashoffset:0;opacity:1;animation-timing-function:ease-in}',
    '86%,100%{stroke-dashoffset:0;opacity:0}',
    '}',
    // One impulse per cycle, as the wave leaves.
    '@keyframes o-wifi-pulse-dot{',
    '0%{transform:scale(0.72);animation-timing-function:cubic-bezier(0.34,1.56,0.64,1)}',
    '18%,100%{transform:scale(1)}',
    '}',
    // Complete wave, dot placed: the figure is stated, at a standstill.
    '@media (prefers-reduced-motion:reduce){',
    '[data-o-wifi-arc]{animation:none;stroke-dashoffset:0;opacity:1}',
    '[data-o-wifi-dot]{animation:none;transform:none}',
    '}',
  ].join('')
  document.head.append(style)
}

/** Properties specific to the component. */
export interface WifiPulseOwnProps {
  /** Side of the drawing, in pixels. @defaultValue 56 */
  size?: number
  /** Thickness of the arcs, in pixels. @defaultValue 6 */
  thickness?: number
  /** Duration of a full cycle, in milliseconds. @defaultValue 1800 */
  speed?: number
  /** Color of the arcs and of the dot. @defaultValue the text color */
  color?: string
  /** Label announced to screen readers. @defaultValue 'Loading' */
  label?: string
}

/** All the properties. */
export type WifiPulseProps = Customisable<WifiPulseOwnProps, 'span'>

/**
 * Signals a wait with a wifi wave that propagates.
 *
 * @example
 * <WifiPulse />
 *
 * @example
 * // Bigger, slower, in the brand hue.
 * <WifiPulse size={88} speed={2600} color="var(--o-palette-brand-500)" />
 */
export function WifiPulse({
  size = 56,
  thickness = 6,
  speed = 1800,
  color = 'currentColor',
  label = 'Loading',
  ...rest
}: WifiPulseProps): ReactElement {
  ensureWifiRule()

  const { className, style } = mergePresentation({}, rest)

  // The drawing lives in a 100-unit view box: the thickness asked for in
  // pixels is converted so the stroke keeps its measure at any size.
  const stroke = Math.min((thickness / size) * 100, 16)

  const loaderStyle = {
    ...style,
    width: `${String(size)}px`,
    height: `${String(size)}px`,
    color,
    '--o-wifi-speed': `${String(speed)}ms`,
  } as CSSProperties

  return (
    <span
      {...rest}
      className={className}
      style={loaderStyle}
      data-o-wifi-pulse=""
      role="status"
    >
      <span className="o-sr-only">{label}</span>
      <svg aria-hidden viewBox="0 0 100 100" width="100%" height="100%">
        {RADII.map((radius, index) => (
          <path
            key={radius}
            data-o-wifi-arc=""
            d={arcAt(radius)}
            pathLength={100}
            fill="none"
            stroke="currentColor"
            strokeWidth={stroke}
            strokeLinecap="round"
            style={{ animationDelay: `${String(Math.round(speed * STAGGER * index))}ms` }}
          />
        ))}
        <circle
          data-o-wifi-dot=""
          cx={SOURCE.x}
          cy={SOURCE.y}
          r={stroke * 1.15}
          fill="currentColor"
        />
      </svg>
    </span>
  )
}

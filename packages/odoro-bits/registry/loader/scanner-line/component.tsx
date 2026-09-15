/**
 * Scanner line: a beam travels across an area from top to bottom, pauses, and
 * comes back up.
 *
 * ## A beam has a thickness, not only a position
 *
 * A plain two-pixel bar going down does not read as a scan: nothing says
 * which way it is heading, nor that it is lighting anything up. The beam is
 * therefore a band, whose gradient rises to a sharp core then falls back —
 * symmetric, so that the downward pass and the upward pass look the same
 * without having to flip the element.
 *
 * The dwell time at each end carries the whole reading: without it, the beam
 * bounces, and a bounce tells of a ball, not of a scan. With it, one reads a
 * pass that ends, then another that begins.
 *
 * The four brackets are not an ornament: they say where the examined area
 * stops, and hence what the travel of the beam means. The full frame, for its
 * part, stays very faint — it bounds without competing with the beam.
 *
 * The travel is set as a variable, computed from the requested height: the
 * animation holds for every size without a single measurement being read from
 * the document.
 *
 * A single CSS animation, held by the compositor, no JavaScript after the
 * first render.
 *
 * ## A status, not a drawing
 *
 * The element carries `role="status"` and a label for screen readers: the
 * wait is information, not decoration. The frame and the beam are removed
 * from the accessibility tree.
 *
 * Under reduced motion, the beam sits at the bottom of the area: the pass is
 * over, the area entirely covered.
 *
 * @module
 */

import { mergePresentation, type Customisable } from '@odoro-cli/engine'
import type { CSSProperties, ReactElement } from 'react'

/** Identifier of the injected stylesheet. */
const STYLE_ID = 'o-scanner-line'

/**
 * The four brackets.
 *
 * Each one is the same bordered square, placed in a corner, from which the
 * two edges facing inwards are removed: a single shape, four placements,
 * instead of four sets of borders to keep in agreement.
 */
const CORNERS: readonly { readonly key: string; readonly place: CSSProperties }[] = [
  {
    key: 'top-left',
    place: { top: 0, left: 0, borderRightWidth: 0, borderBottomWidth: 0 },
  },
  {
    key: 'top-right',
    place: { top: 0, right: 0, borderLeftWidth: 0, borderBottomWidth: 0 },
  },
  {
    key: 'bottom-left',
    place: { bottom: 0, left: 0, borderRightWidth: 0, borderTopWidth: 0 },
  },
  {
    key: 'bottom-right',
    place: { bottom: 0, right: 0, borderLeftWidth: 0, borderTopWidth: 0 },
  },
]

/** Applies the area, its brackets and the beam, once per document. */
function ensureScannerRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-scanner-line]{position:relative;display:inline-block;overflow:hidden}',
    '[data-o-scanner-frame]{position:absolute;inset:0;border:1px solid currentColor;opacity:0.22;border-radius:6px}',
    '[data-o-scanner-corner]{position:absolute;border:2px solid currentColor}',
    // The sharp core in the middle, the spread on either side: the beam reads
    // in both directions of travel.
    '[data-o-scanner-beam]{',
    'position:absolute;left:0;right:0;top:0;height:var(--o-scanner-beam);',
    'background:linear-gradient(to bottom,transparent,',
    'color-mix(in oklab,currentColor 28%,transparent) 40%,',
    'currentColor 48%,currentColor 52%,',
    'color-mix(in oklab,currentColor 28%,transparent) 60%,transparent);',
    'animation:o-scanner-line-sweep var(--o-scanner-speed) infinite;',
    '}',
    // Descent, dwell at the bottom, climb, dwell at the top.
    '@keyframes o-scanner-line-sweep{',
    '0%{transform:translateY(0);animation-timing-function:cubic-bezier(0.45,0,0.55,1)}',
    '44%,56%{transform:translateY(var(--o-scanner-travel));animation-timing-function:cubic-bezier(0.45,0,0.55,1)}',
    '94%,100%{transform:translateY(0)}',
    '}',
    // Beam resting at the bottom: the pass is over.
    '@media (prefers-reduced-motion:reduce){',
    '[data-o-scanner-beam]{animation:none;transform:translateY(var(--o-scanner-travel))}',
    '}',
  ].join('')
  document.head.append(style)
}

/** Properties specific to the component. */
export interface ScannerLineOwnProps {
  /** Width of the examined area, in pixels. @defaultValue 160 */
  size?: number
  /** Height of the examined area, in pixels. @defaultValue 96 */
  height?: number
  /** Duration of one complete round trip, in milliseconds. @defaultValue 2200 */
  speed?: number
  /** Colour of the frame and of the beam. @defaultValue the text colour */
  color?: string
  /** Label announced to screen readers. @defaultValue 'Loading' */
  label?: string
}

/** All the properties. */
export type ScannerLineProps = Customisable<ScannerLineOwnProps, 'span'>

/**
 * Signals a wait with a beam sweeping an area.
 *
 * @example
 * <ScannerLine />
 *
 * @example
 * // A wide, low band, faster, in the brand hue.
 * <ScannerLine size={280} height={64} speed={1400} color="var(--o-palette-brand-500)" />
 */
export function ScannerLine({
  size = 160,
  height = 96,
  speed = 2200,
  color = 'currentColor',
  label = 'Loading',
  ...rest
}: ScannerLineProps): ReactElement {
  ensureScannerRule()

  const { className, style } = mergePresentation({}, rest)

  // The thickness of the beam follows the area, without ever swallowing it: on
  // a low band, a fixed band of twenty pixels would be half the subject.
  const beam = Math.max(8, Math.min(height * 0.2, 28))

  // The brackets follow the same logic, bounded so they stay legible.
  const bracket = Math.max(8, Math.min(size, height) * 0.16)

  const loaderStyle = {
    ...style,
    width: `${String(size)}px`,
    height: `${String(height)}px`,
    color,
    '--o-scanner-speed': `${String(speed)}ms`,
    '--o-scanner-beam': `${String(beam)}px`,
    '--o-scanner-travel': `${String(height - beam)}px`,
  } as CSSProperties

  return (
    <span
      {...rest}
      className={className}
      style={loaderStyle}
      data-o-scanner-line=""
      role="status"
    >
      <span className="o-sr-only">{label}</span>
      <span data-o-scanner-frame="" aria-hidden />
      {CORNERS.map((corner) => (
        <span
          key={corner.key}
          data-o-scanner-corner=""
          aria-hidden
          style={{
            ...corner.place,
            width: `${String(bracket)}px`,
            height: `${String(bracket)}px`,
          }}
        />
      ))}
      <span data-o-scanner-beam="" aria-hidden />
    </span>
  )
}

/**
 * Cascading bars: five bars grow from the floor one after the other, hold,
 * then fall back together.
 *
 * ## One window per bar, not a phase shift
 *
 * A phase shift through negative delays gives a wave that never stops —
 * that is `wave-bars`. Here the figure has a beginning and an end: the bars
 * rise in order, the row stays full for a moment, then everything falls back
 * at once before starting over. This asks that each bar know its place in
 * the cycle, hence one animation per bar, written once into the stylesheet,
 * of which only the rise keyframes differ.
 *
 * The rise is `ease-out` — the bar arrives and brakes — and the fall
 * `ease-in` — it collapses while accelerating: it is the contrast between
 * the two that makes one read a construction, then a fall, and not a
 * back-and-forth.
 *
 * The bars are stretched by a vertical scale from the floor, never by a
 * height: nothing recomputes the layout. A base of a few per cent stays
 * visible between two cycles: the row never disappears completely.
 *
 * ## A status, not a drawing
 *
 * The element carries `role="status"` and a label for screen readers: the
 * wait is information, not decoration. The bars are removed from the
 * accessibility tree.
 *
 * Under reduced motion, the five bars stay full, at their end-of-rise
 * height: the built row still reads, only the cascade stops.
 *
 * @module
 */

import { mergePresentation, type Customisable } from '@odoro-cli/engine'
import type { CSSProperties, ReactElement } from 'react'

/** Id of the injected stylesheet. */
const STYLE_ID = 'o-bars-scale'

/** Number of bars. */
const BARS = 5

/** Share of the cycle between two rise starts, in per cent. */
const STEP = 14

/** Duration of one rise, in per cent of the cycle. */
const RISE = 12

/** Moment when the full row starts to fall back, in per cent. */
const FALL_AT = 84

/** Sets the bars and their cascade, once per document. */
function ensureBarsScaleRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-bars-scale]{',
    'display:inline-flex;align-items:flex-end;',
    'gap:calc(var(--o-bscale-size) * 0.8);height:calc(var(--o-bscale-size) * 7);',
    '}',
    '[data-o-bars-scale-bar]{',
    'width:var(--o-bscale-size);height:100%;',
    'border-radius:calc(var(--o-bscale-size) / 3);',
    'background:var(--o-bscale-color);transform-origin:bottom;',
    'animation-duration:var(--o-bscale-speed);animation-iteration-count:infinite;',
    '}',
    // One rise window per bar; the fall is common to all of them.
    ...Array.from({ length: BARS }, (_, bar) => {
      const start = bar * STEP
      const end = start + RISE
      return [
        `[data-o-bars-scale-bar="${String(bar)}"]{animation-name:o-bars-scale-${String(bar)}}`,
        `@keyframes o-bars-scale-${String(bar)}{`,
        `0%,${String(start)}%{transform:scaleY(0.08);animation-timing-function:ease-out}`,
        `${String(end)}%,${String(FALL_AT)}%{transform:scaleY(1);animation-timing-function:ease-in}`,
        `${String(FALL_AT + 8)}%,100%{transform:scaleY(0.08)}`,
        '}',
      ].join('')
    }),
    // A full row: the built figure is still said, without the cascade.
    '@media (prefers-reduced-motion:reduce){',
    '[data-o-bars-scale-bar]{animation:none;transform:scaleY(1)}',
    '}',
  ].join('')
  document.head.append(style)
}

/** The component's own props. */
export interface BarsScaleOwnProps {
  /** Width of one bar, in pixels. @defaultValue 5 */
  size?: number
  /** Duration of one complete cycle, in milliseconds. @defaultValue 1800 */
  speed?: number
  /** Color of the bars. @defaultValue the text color */
  color?: string
  /** Label announced to screen readers. @defaultValue 'Loading' */
  label?: string
}

/** All props. */
export type BarsScaleProps = Customisable<BarsScaleOwnProps, 'span'>

/**
 * Signals a wait with five bars that grow in cascade and fall back.
 *
 * @example
 * <BarsScale />
 *
 * @example
 * // Wider, slower, in the brand hue.
 * <BarsScale size={8} speed={2600} color="var(--o-palette-brand-500)" />
 */
export function BarsScale({
  size = 5,
  speed = 1800,
  color = 'currentColor',
  label = 'Loading',
  ...rest
}: BarsScaleProps): ReactElement {
  ensureBarsScaleRule()

  const { className, style } = mergePresentation({}, rest)

  const loaderStyle = {
    ...style,
    '--o-bscale-size': `${String(size)}px`,
    '--o-bscale-speed': `${String(speed)}ms`,
    '--o-bscale-color': color,
  } as CSSProperties

  return (
    <span
      {...rest}
      className={className}
      style={loaderStyle}
      data-o-bars-scale=""
      role="status"
    >
      <span className="o-sr-only">{label}</span>
      {Array.from({ length: BARS }, (_, bar) => (
        <span key={bar} aria-hidden data-o-bars-scale-bar={String(bar)} />
      ))}
    </span>
  )
}

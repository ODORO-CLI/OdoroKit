/**
 * Wave bars: five thin bars stretch from their center, one after the other,
 * like a wave crossing the row.
 *
 * ## A scale, not a height
 *
 * Every bar takes the whole height of the container and is stretched only by
 * a vertical scale, from its middle: the layout never moves, and the figure
 * stays symmetrical around its median line — that is what makes it read as a
 * waveform rather than as a histogram. A histogram is `equalizer`, anchored
 * to the ground.
 *
 * The five bars play the same animation a fifth of a cycle apart, with a
 * negative delay: the wave is already under way on the first frame, instead
 * of setting off from a flat row.
 *
 * ## A status, not a drawing
 *
 * The element carries `role="status"` and a label for screen readers: the
 * wait is information, not decoration. The bars are removed from the
 * accessibility tree.
 *
 * Under reduced motion, the five bars stay at half height: the waveform
 * still reads, only the wave stops.
 *
 * @module
 */

import { mergePresentation, type Customisable } from '@odoro-cli/engine'
import type { CSSProperties, ReactElement } from 'react'

/** Identifier of the injected stylesheet. */
const STYLE_ID = 'o-wave-bars'

/** Number of bars. */
const BARS = 5

/** Applies the bars and their wave, once per document. */
function ensureWaveBarsRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-wave-bars]{',
    'display:inline-flex;align-items:center;',
    'gap:var(--o-wbars-size);height:calc(var(--o-wbars-size) * 8);',
    '}',
    '[data-o-wave-bar]{',
    'width:var(--o-wbars-size);height:100%;',
    'border-radius:calc(var(--o-wbars-size) / 2);background:var(--o-wbars-color);',
    'transform-origin:center;',
    'animation:o-wave-bars-swell var(--o-wbars-speed) ease-in-out infinite;',
    'animation-delay:var(--o-wbars-delay);',
    '}',
    '@keyframes o-wave-bars-swell{',
    '0%,100%{transform:scaleY(0.25)}',
    '50%{transform:scaleY(1)}',
    '}',
    // A row at half height: the waveform is still stated, with no wave.
    '@media (prefers-reduced-motion:reduce){',
    '[data-o-wave-bar]{animation:none;transform:scaleY(0.6)}',
    '}',
  ].join('')
  document.head.append(style)
}

/** Properties specific to the component. */
export interface WaveBarsOwnProps {
  /** Width of a bar, in pixels. @defaultValue 4 */
  size?: number
  /** Duration of a full pass of the wave, in milliseconds. @defaultValue 1000 */
  speed?: number
  /** Color of the bars. @defaultValue the text color */
  color?: string
  /** Label announced to screen readers. @defaultValue 'Loading' */
  label?: string
}

/** All the properties. */
export type WaveBarsProps = Customisable<WaveBarsOwnProps, 'span'>

/**
 * Signals a wait with five bars crossed by a wave.
 *
 * @example
 * <WaveBars />
 *
 * @example
 * // Wider, slower, in the brand hue.
 * <WaveBars size={6} speed={1600} color="var(--o-palette-brand-500)" />
 */
export function WaveBars({
  size = 4,
  speed = 1000,
  color = 'currentColor',
  label = 'Loading',
  ...rest
}: WaveBarsProps): ReactElement {
  ensureWaveBarsRule()

  const { className, style } = mergePresentation({}, rest)

  const loaderStyle = {
    ...style,
    '--o-wbars-size': `${String(size)}px`,
    '--o-wbars-speed': `${String(speed)}ms`,
    '--o-wbars-color': color,
  } as CSSProperties

  return (
    <span
      {...rest}
      className={className}
      style={loaderStyle}
      data-o-wave-bars=""
      role="status"
    >
      <span className="o-sr-only">{label}</span>
      {Array.from({ length: BARS }, (_, bar) => (
        <span
          key={bar}
          aria-hidden
          data-o-wave-bar=""
          style={
            {
              // A fifth of a cycle apart, negative: the wave is already
              // under way on the first frame.
              '--o-wbars-delay': `${String(Math.round((-speed * bar) / BARS))}ms`,
            } as CSSProperties
          }
        />
      ))}
    </span>
  )
}

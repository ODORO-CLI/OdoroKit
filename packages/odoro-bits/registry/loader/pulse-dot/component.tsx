/**
 * Pulsing dot: a solid dot from which two concentric waves escape.
 *
 * ## Two waves, half a period apart
 *
 * A single wave that grows then vanishes leaves a hole: while it fades,
 * nothing leaves the centre, and the rhythm seems to stutter. Two waves half
 * a period apart relieve one another with no gap — there is always one on its
 * way. The delay of the second is negative, so that it is already on its way
 * at the first frame rather than waiting its turn.
 *
 * The central dot, for its part, does not move: it is the visual anchor, what
 * the eye holds on to while the waves travel out. A centre that pulsed as
 * well would blur the reading — nothing would stay fixed.
 *
 * ## A status, not a drawing
 *
 * The element carries `role="status"` and a label for screen readers: the
 * wait is information, not decoration. Dot and waves are removed from the
 * accessibility tree.
 *
 * Under reduced motion, the dot stays solid and a single wave is frozen
 * halfway, dimmed: the figure still says "something is emitting", without
 * movement.
 *
 * @module
 */

import { mergePresentation, type Customisable } from '@odoro-cli/engine'
import type { CSSProperties, ReactElement } from 'react'

/** Id of the injected stylesheet. */
const STYLE_ID = 'o-pulse-dot'

/** Sets the dot and its waves, once per document. */
function ensurePulseRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-pulse-dot]{',
    'position:relative;display:inline-block;',
    'width:var(--o-pdot-size);height:var(--o-pdot-size);',
    '}',
    '[data-o-pulse-core]{',
    'position:absolute;inset:35%;border-radius:50%;',
    'background:var(--o-pdot-color);',
    '}',
    '[data-o-pulse-wave]{',
    'position:absolute;inset:0;border-radius:50%;',
    'border:2px solid var(--o-pdot-color);',
    'animation:o-pulse-dot-wave var(--o-pdot-speed) ease-out infinite;',
    'animation-delay:var(--o-pdot-delay);',
    '}',
    '@keyframes o-pulse-dot-wave{',
    'from{transform:scale(0.3);opacity:0.9}',
    'to{transform:scale(1);opacity:0}',
    '}',
    // One wave frozen halfway: the figure still says "emission", with
    // nothing moving. The second wave disappears — two fixed waves would be
    // a target, not a loader.
    '@media (prefers-reduced-motion:reduce){',
    '[data-o-pulse-wave]{animation:none;transform:scale(0.7);opacity:0.35}',
    '[data-o-pulse-wave]:last-child{display:none}',
    '}',
  ].join('')
  document.head.append(style)
}

/** Props specific to the component. */
export interface PulseDotOwnProps {
  /** Diameter of the wave at its widest, in pixels. @defaultValue 32 */
  size?: number
  /** Lifetime of one wave, in milliseconds. @defaultValue 1400 */
  speed?: number
  /** Colour of the dot and of the waves. @defaultValue the text colour */
  color?: string
  /** Label announced to screen readers. @defaultValue 'Loading' */
  label?: string
}

/** All props. */
export type PulseDotProps = Customisable<PulseDotOwnProps, 'span'>

/**
 * Signals a wait with a dot from which waves leave.
 *
 * @example
 * <PulseDot />
 *
 * @example
 * // Wider, slower, in the brand hue.
 * <PulseDot size={64} speed={2200} color="var(--o-palette-brand-500)" />
 */
export function PulseDot({
  size = 32,
  speed = 1400,
  color = 'currentColor',
  label = 'Loading',
  ...rest
}: PulseDotProps): ReactElement {
  ensurePulseRule()

  const { className, style } = mergePresentation({}, rest)

  const loaderStyle = {
    ...style,
    '--o-pdot-size': `${String(size)}px`,
    '--o-pdot-speed': `${String(speed)}ms`,
    '--o-pdot-color': color,
  } as CSSProperties

  return (
    <span
      {...rest}
      className={className}
      style={loaderStyle}
      data-o-pulse-dot=""
      role="status"
    >
      <span className="o-sr-only">{label}</span>
      <span aria-hidden data-o-pulse-core="" />
      {[0, 1].map((wave) => (
        <span
          key={wave}
          aria-hidden
          data-o-pulse-wave=""
          style={
            {
              // Half a period apart, in the negative: the second wave is
              // already on its way at the first frame.
              '--o-pdot-delay': `${String(Math.round((-speed * wave) / 2))}ms`,
            } as CSSProperties
          }
        />
      ))}
    </span>
  )
}

/**
 * Concentric ripples: four fixed rings that a crest crosses from the centre
 * towards the edge.
 *
 * ## What moves is the crest, not the ring
 *
 * A ripple loader is usually made of rings that grow and leave the frame —
 * that is what `pulse-dot` does, and the reading there is one of emission.
 * Here the structure is still: the four rings stay where they are, always
 * visible in a faint ink, and what travels is the passage — each one lights
 * up and swells in its turn, from the smallest to the largest.
 *
 * The difference is not cosmetic. A ring that grows says "something leaves
 * from here"; a crest crossing a structure that stays says "something is
 * passing through". The second sits better in the middle of an interface,
 * because it has no edge to disappear at.
 *
 * A single animation rule, four delays offset by an eighth of a cycle. They
 * are negative: a positive delay would make the outer rings wait at the first
 * render, and the wave would seem to start late.
 *
 * There is deliberately no central dot: the void in the middle is what keeps
 * the figure from reading as a source.
 *
 * ## A status, not a drawing
 *
 * The element carries `role="status"` and a label for screen readers: the
 * wait is information, not decoration. The rings are removed from the
 * accessibility tree.
 *
 * Under reduced motion, the four rings stay set in a middling ink: the figure
 * of a stopped wave, with no passage.
 *
 * @module
 */

import { mergePresentation, type Customisable } from '@odoro-cli/engine'
import type { CSSProperties, ReactElement } from 'react'

/** Id of the injected stylesheet. */
const STYLE_ID = 'o-ripple-loader'

/** Insets of the four rings, from the smallest to the largest. */
const INSETS = [42, 28, 14, 0] as const

/** Sets the rings and the crest that crosses them, once per document. */
function ensureRippleRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-ripple-loader]{',
    'position:relative;display:inline-block;',
    'width:var(--o-ripple-size);height:var(--o-ripple-size);',
    '}',
    '[data-o-ripple-ring]{',
    'position:absolute;inset:var(--o-ripple-inset);border-radius:50%;',
    'border:var(--o-ripple-line) solid var(--o-ripple-color);',
    'animation:o-ripple-loader-crest var(--o-ripple-speed) ease-in-out infinite;',
    'animation-delay:var(--o-ripple-delay);',
    '}',
    // The passage takes up the first third of the cycle; the rest is the
    // rest, which leaves the crest time to reach the edge before starting
    // again.
    '@keyframes o-ripple-loader-crest{',
    '0%{transform:scale(1);opacity:0.16}',
    '14%{transform:scale(1.06);opacity:1}',
    '32%{transform:scale(0.98);opacity:0.32}',
    '48%,100%{transform:scale(1);opacity:0.16}',
    '}',
    '@media (prefers-reduced-motion:reduce){',
    '[data-o-ripple-ring]{animation:none;transform:none;opacity:0.4}',
    '}',
  ].join('')
  document.head.append(style)
}

/** Props specific to the component. */
export interface RippleLoaderOwnProps {
  /** Diameter of the outer ring, in pixels. @defaultValue 56 */
  size?: number
  /** Duration of one complete passage of the crest, in milliseconds. @defaultValue 2000 */
  speed?: number
  /** Colour of the rings. @defaultValue the text colour */
  color?: string
  /** Label announced to screen readers. @defaultValue 'Loading' */
  label?: string
}

/** All props. */
export type RippleLoaderProps = Customisable<RippleLoaderOwnProps, 'span'>

/**
 * Signals a wait with a crest crossing four fixed rings.
 *
 * @example
 * <RippleLoader />
 *
 * @example
 * // Bigger, slower, in the brand hue.
 * <RippleLoader size={88} speed={2800} color="var(--o-palette-brand-500)" />
 */
export function RippleLoader({
  size = 56,
  speed = 2000,
  color = 'currentColor',
  label = 'Loading',
  ...rest
}: RippleLoaderProps): ReactElement {
  ensureRippleRule()

  const { className, style } = mergePresentation({}, rest)

  const loaderStyle = {
    ...style,
    '--o-ripple-size': `${String(size)}px`,
    '--o-ripple-speed': `${String(speed)}ms`,
    '--o-ripple-color': color,
    // The stroke follows the size: a one-pixel line on a large ring would
    // disappear, four on a small one would clog it.
    '--o-ripple-line': `${String(Math.max(1, Math.round(size / 28)))}px`,
  } as CSSProperties

  return (
    <span
      {...rest}
      className={className}
      style={loaderStyle}
      data-o-ripple-loader=""
      role="status"
    >
      <span className="o-sr-only">{label}</span>
      {INSETS.map((inset, index) => (
        <span
          key={inset}
          aria-hidden
          data-o-ripple-ring=""
          style={
            {
              '--o-ripple-inset': `${String(inset)}%`,
              // An eighth of a cycle between two rings, in the negative: the
              // crest is already on its way at the first frame.
              '--o-ripple-delay': `${String(Math.round((index / 8 - 1) * speed))}ms`,
            } as CSSProperties
          }
        />
      ))}
    </span>
  )
}

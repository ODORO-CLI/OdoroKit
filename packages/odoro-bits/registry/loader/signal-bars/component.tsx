/**
 * Signal bars: the bars light up one after another, from the shortest to the
 * tallest, then go out in the same order.
 *
 * ## A single animation, offset in time
 *
 * The bars all do the same thing: rise and brighten, hold, fall back. What
 * tells them apart is not their animation but the moment it starts. A single
 * rule, then, and one delay per bar — the wave is born from the offset, not
 * from keyframes copied four times over. Changing the number of bars then
 * requires no change to the stylesheet.
 *
 * The delay is a fraction of the cycle duration, never a value in
 * milliseconds: the sequence keeps its proportions at every speed.
 *
 * Each bar rises from its base — its transform origin is at the bottom —
 * because a signal bar is planted on a line, like an antenna. Growing from the
 * centre would give a floating histogram.
 *
 * The unlit state is not absence: the bar stays visible, short and dimmed.
 * That is what makes one read a scale filling up rather than bars appearing
 * out of nowhere.
 *
 * One single CSS animation per bar, held by the compositor, no JavaScript
 * after the first render.
 *
 * ## A status, not a drawing
 *
 * The element carries `role="status"` and a label for screen readers: waiting
 * is information, not decoration. The bars are removed from the accessibility
 * tree.
 *
 * Under reduced motion, every bar is at its full height: the signal is
 * complete, the scale still reads.
 *
 * @module
 */

import { mergePresentation, type Customisable } from '@odoro-cli/engine'
import type { CSSProperties, ReactElement } from 'react'

/** Identifier of the injected stylesheet. */
const STYLE_ID = 'o-signal-bars'

/** Share of the cycle separating two bars. */
const STAGGER = 0.11

/** Height of the shortest one, as a share of the tallest. */
const SHORTEST = 0.38

/** Sets up the bars and their sequence, once per document. */
function ensureSignalRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-signal-bars]{display:inline-flex;align-items:flex-end;line-height:0}',
    '[data-o-signal-bar]{',
    'display:block;background:currentColor;border-radius:2px;',
    'transform-origin:bottom;transform:scaleY(0.55);opacity:0.24;',
    'animation:o-signal-bars-lit var(--o-signal-speed) ease-in-out infinite;',
    '}',
    // Clean rise, plateau, return: the plateau is what gives the sequence the
    // time to be read as a sequence.
    '@keyframes o-signal-bars-lit{',
    '0%{transform:scaleY(0.55);opacity:0.24}',
    '16%,62%{transform:scaleY(1);opacity:1}',
    '80%,100%{transform:scaleY(0.55);opacity:0.24}',
    '}',
    // Every bar full: the signal complete, motionless.
    '@media (prefers-reduced-motion:reduce){',
    '[data-o-signal-bar]{animation:none;transform:none;opacity:1}',
    '}',
  ].join('')
  document.head.append(style)
}

/** Props of the component itself. */
export interface SignalBarsOwnProps {
  /** Height of the tallest bar, in pixels. @defaultValue 32 */
  size?: number
  /** Number of bars. @defaultValue 4 */
  count?: number
  /** Duration of a complete cycle, in milliseconds. @defaultValue 1400 */
  speed?: number
  /** Colour of the bars. @defaultValue the text colour */
  color?: string
  /** Label announced to screen readers. @defaultValue 'Loading' */
  label?: string
}

/** All the props. */
export type SignalBarsProps = Customisable<SignalBarsOwnProps, 'span'>

/**
 * Signals a wait through signal bars rising in sequence.
 *
 * @example
 * <SignalBars />
 *
 * @example
 * // Five bars, taller and slower, in the brand hue.
 * <SignalBars count={5} size={48} speed={2000} color="var(--o-palette-brand-500)" />
 */
export function SignalBars({
  size = 32,
  count = 4,
  speed = 1400,
  color = 'currentColor',
  label = 'Loading',
  ...rest
}: SignalBarsProps): ReactElement {
  ensureSignalRule()

  const { className, style } = mergePresentation({}, rest)

  // Two bars at least: below that, there is no scale left, and so nothing
  // left to read in the sequence.
  const bars = Math.max(2, Math.round(count))
  const width = Math.max(2, size * 0.2)
  const gap = Math.max(2, size * 0.12)

  const loaderStyle = {
    ...style,
    gap: `${String(gap)}px`,
    color,
    '--o-signal-speed': `${String(speed)}ms`,
  } as CSSProperties

  return (
    <span
      {...rest}
      className={className}
      style={loaderStyle}
      data-o-signal-bars=""
      role="status"
    >
      <span className="o-sr-only">{label}</span>
      {Array.from({ length: bars }, (_, index) => (
        <span
          key={index}
          data-o-signal-bar=""
          aria-hidden
          style={{
            width: `${String(width)}px`,
            // The heights step up evenly from the shortest to the tallest: it
            // is that progression which makes the scale.
            height: `${String(size * (SHORTEST + ((1 - SHORTEST) * index) / (bars - 1)))}px`,
            animationDelay: `${String(Math.round(speed * STAGGER * index))}ms`,
          }}
        />
      ))}
    </span>
  )
}

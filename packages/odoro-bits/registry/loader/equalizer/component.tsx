/**
 * Equalizer: six bars anchored to the floor rise and fall, each at its own
 * rate, like the meters of an equalizer.
 *
 * ## Six scores, six durations
 *
 * A single animation phase-shifted by delays would give a wave — that is
 * `wave-bars`. An equalizer does not make a wave: each bar follows its own
 * sequence of levels, written in a table, and plays at a duration slightly
 * different from its neighbours. The cycles only fall back into phase after
 * several tens of seconds: the eye never sees a pattern in it, which is
 * exactly the impression of a signal.
 *
 * The levels are fixed, not drawn at random: the output is identical from one
 * load to the next, and the first level of each sequence is also the last, so
 * that the loop does not jump.
 *
 * The bars are stretched by a vertical scale from the floor, never by a
 * height: nothing recomputes the layout.
 *
 * ## A status, not a drawing
 *
 * The element carries `role="status"` and a label for screen readers: the
 * wait is information, not decoration. The bars are removed from the
 * accessibility tree.
 *
 * Under reduced motion, each bar freezes at its first level: the uneven
 * spectrum still reads as an equalizer, only the movement stops.
 *
 * @module
 */

import { mergePresentation, type Customisable } from '@odoro-cli/engine'
import type { CSSProperties, ReactElement } from 'react'

/** Identifier of the injected stylesheet. */
const STYLE_ID = 'o-equalizer'

/**
 * Sequences of levels, one per bar, as a fraction of the maximum height.
 *
 * The first and the last level are equal: the loop closes with no jump. The
 * sequences are offset from one another so that no pair of neighbouring bars
 * rises at the same moment.
 */
const LEVELS: readonly (readonly number[])[] = [
  [0.3, 0.9, 0.5, 1, 0.4, 0.7, 0.3],
  [0.6, 0.2, 0.8, 0.5, 1, 0.3, 0.6],
  [0.9, 0.5, 0.3, 0.7, 0.2, 0.8, 0.9],
  [0.4, 1, 0.6, 0.3, 0.7, 0.5, 0.4],
  [0.7, 0.3, 1, 0.6, 0.5, 0.9, 0.7],
  [0.5, 0.7, 0.2, 0.9, 0.3, 1, 0.5],
]

/**
 * Duration factor of each bar.
 *
 * Durations all different and with no simple ratio between them: the cycles
 * do not realign on the scale of a wait.
 */
const TEMPO: readonly number[] = [1, 1.17, 0.89, 1.31, 1.07, 0.83]

/** Number of bars, deduced from the table. */
const BARS = LEVELS.length

/** Applies the bars and their six scores, once per document. */
function ensureEqualizerRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-equalizer]{',
    'display:inline-flex;align-items:flex-end;',
    'gap:calc(var(--o-eq-size) * 0.6);height:calc(var(--o-eq-size) * 6);',
    '}',
    '[data-o-equalizer-bar]{',
    'width:var(--o-eq-size);height:100%;',
    'border-radius:calc(var(--o-eq-size) / 3) calc(var(--o-eq-size) / 3) 0 0;',
    'background:var(--o-eq-color);transform-origin:bottom;',
    'animation-timing-function:ease-in-out;animation-iteration-count:infinite;',
    'animation-duration:var(--o-eq-duration);animation-delay:var(--o-eq-delay);',
    '}',
    // One score per bar: the keyframes are spread at equal distance over the
    // cycle, the last level rejoining the first.
    ...LEVELS.flatMap((levels, bar) => [
      `[data-o-equalizer-bar="${String(bar)}"]{animation-name:o-equalizer-${String(bar)}}`,
      `@keyframes o-equalizer-${String(bar)}{`,
      ...levels.map(
        (level, index) =>
          `${String(Math.round((index / (levels.length - 1)) * 100))}%{transform:scaleY(${String(level)})}`,
      ),
      '}',
    ]),
    // A frozen spectrum: the bars keep their first level, uneven.
    '@media (prefers-reduced-motion:reduce){',
    '[data-o-equalizer-bar]{animation:none;transform:scaleY(var(--o-eq-rest))}',
    '}',
  ].join('')
  document.head.append(style)
}

/** Properties specific to the component. */
export interface EqualizerOwnProps {
  /** Width of one bar, in pixels. @defaultValue 5 */
  size?: number
  /** Reference duration of a cycle, in milliseconds. @defaultValue 1200 */
  speed?: number
  /** Colour of the bars. @defaultValue the text colour */
  color?: string
  /** Label announced to screen readers. @defaultValue 'Loading' */
  label?: string
}

/** All the properties. */
export type EqualizerProps = Customisable<EqualizerOwnProps, 'span'>

/**
 * Signals a wait with six meter bars dancing.
 *
 * @example
 * <Equalizer />
 *
 * @example
 * // Wider, slower, in the brand hue.
 * <Equalizer size={8} speed={1800} color="var(--o-palette-brand-500)" />
 */
export function Equalizer({
  size = 5,
  speed = 1200,
  color = 'currentColor',
  label = 'Loading',
  ...rest
}: EqualizerProps): ReactElement {
  ensureEqualizerRule()

  const { className, style } = mergePresentation({}, rest)

  const loaderStyle = {
    ...style,
    '--o-eq-size': `${String(size)}px`,
    '--o-eq-color': color,
  } as CSSProperties

  return (
    <span
      {...rest}
      className={className}
      style={loaderStyle}
      data-o-equalizer=""
      role="status"
    >
      <span className="o-sr-only">{label}</span>
      {LEVELS.map((levels, bar) => (
        <span
          key={bar}
          aria-hidden
          data-o-equalizer-bar={String(bar)}
          style={
            {
              '--o-eq-duration': `${String(Math.round(speed * (TEMPO[bar] ?? 1)))}ms`,
              // Each bar starts at a different point of its score, negatively:
              // the spectrum is complete from the very first frame.
              '--o-eq-delay': `${String(Math.round((-speed * bar) / BARS))}ms`,
              '--o-eq-rest': String(levels[0] ?? 0.5),
            } as CSSProperties
          }
        />
      ))}
    </span>
  )
}

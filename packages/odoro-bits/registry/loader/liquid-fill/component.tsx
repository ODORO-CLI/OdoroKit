/**
 * Liquid fill: a round jar where the level rises, the surface held by two
 * sheets drifting in opposite directions.
 *
 * ## Two sheets are better than one
 *
 * A single sliding sine reads like a scrolling image: the crest comes back to
 * the same place on every period, and the eye catches the loop. Two sheets of
 * the same period but of different speeds and directions only cross again
 * after a long time; their visual sum no longer has a recognisable pattern,
 * and the surface starts to look like water rather than a ribbon.
 *
 * The back sheet is lighter and slower, the front one denser and faster: the
 * difference in opacity gives the liquid a thickness, the difference in speed
 * a parallax.
 *
 * Each sheet is a path of four periods, wider than the view, translated by
 * exactly one period: the loop is invisible because the arrival position
 * gives back the drawing it started from.
 *
 * ## Two modes, two kinds of honesty
 *
 * The determinate mode receives `value` and places the level where it belongs:
 * the jar is a complete `role="progressbar"`, value included. The level slides
 * from one value to the next through a transition, never through a jump.
 *
 * The `indeterminate` mode claims to measure nothing: the level rises and
 * falls endlessly like a tide, and the `progressbar` is declared **without** a
 * value — that is how the specification describes an unknown progression.
 *
 * Under reduced motion, the sheets stand still, the value jumps with no
 * transition, and the indeterminate tide stays at half height: the jar still
 * reads, only the movement stops.
 *
 * @module
 */

import { mergePresentation, type Customisable } from '@odoro-cli/engine'
import { useId, type CSSProperties, type ReactElement } from 'react'

/** Identifier of the injected stylesheet. */
const STYLE_ID = 'o-liquid-fill'

/** Width of one wave period, in view units. */
const PERIOD = 50

/** Height of the crest above the mean level, in view units. */
const AMPLITUDE = 3.5

/**
 * Path of one sheet: a sine made of quadratics, extended downwards.
 *
 * The path starts one period before the view and covers four of them: after
 * the translation of one period, there is still matter on both sides of the
 * jar. A quadratic whose control point sits at twice the amplitude passes
 * exactly through the intended crest at mid-course.
 */
function wavePath(): string {
  const parts: string[] = [`M ${String(-PERIOD)} 0`]
  for (let index = 0; index < 4; index += 1) {
    parts.push(
      `q ${String(PERIOD / 4)} ${String(-AMPLITUDE * 2)} ${String(PERIOD / 2)} 0`,
      `q ${String(PERIOD / 4)} ${String(AMPLITUDE * 2)} ${String(PERIOD / 2)} 0`,
    )
  }
  parts.push(`L ${String(PERIOD * 3)} 160`, `L ${String(-PERIOD)} 160`, 'Z')
  return parts.join(' ')
}

/** The path, computed once when the module loads. */
const WAVE = wavePath()

/**
 * Height of the mean level, in view units, for a value from 0 to 100.
 *
 * At zero the surface is below the bottom of the jar, at a hundred it is above
 * the rim: the crest never sticks out on one side without the jar being truly
 * empty or truly full.
 */
function levelOf(value: number): number {
  return 98 - (value / 100) * 96
}

/** Applies the jar, its sheets and its tide, once per document. */
function ensureLiquidRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-liquid-fill]{display:inline-block;line-height:0}',
    '[data-o-liquid-fill] svg{display:block}',
    // The level slides from one value to the next; it does not jump.
    '[data-o-liquid-level]{',
    'transition:transform var(--o-duration-base) var(--o-ease-standard);',
    '}',
    '[data-o-liquid-indeterminate] [data-o-liquid-level]{',
    'transition:none;',
    'animation:o-liquid-fill-tide var(--o-liquid-tide) ease-in-out infinite;',
    '}',
    '@keyframes o-liquid-fill-tide{',
    '0%,100%{transform:translateY(74px)}',
    '50%{transform:translateY(26px)}',
    '}',
    '[data-o-liquid-wave]{',
    'animation:o-liquid-fill-drift var(--o-liquid-drift) linear infinite;',
    '}',
    // The back sheet drifts the other way: the two crests cross each other
    // instead of following one another.
    '[data-o-liquid-wave-back]{animation-direction:reverse}',
    '@keyframes o-liquid-fill-drift{',
    'from{transform:translateX(0)}',
    `to{transform:translateX(${String(-PERIOD)}px)}`,
    '}',
    '@media (prefers-reduced-motion:reduce){',
    '[data-o-liquid-wave]{animation:none;transform:none}',
    '[data-o-liquid-level]{transition:none}',
    '[data-o-liquid-indeterminate] [data-o-liquid-level]{animation:none;transform:translateY(50px)}',
    '}',
  ].join('')
  document.head.append(style)
}

/** Properties specific to the component. */
export interface LiquidFillOwnProps {
  /** Level, from 0 to 100. Ignored in indeterminate mode. @defaultValue 62 */
  value?: number
  /** Tide with no value, when nothing is measurable. @defaultValue false */
  indeterminate?: boolean
  /** Diameter of the jar, in pixels. @defaultValue 88 */
  size?: number
  /** Duration of one sheet drift, in milliseconds. @defaultValue 2600 */
  speed?: number
  /** Colour of the liquid and of the jar. @defaultValue the text colour */
  color?: string
  /** Label announced to screen readers. @defaultValue 'Loading' */
  label?: string
}

/** All the properties. */
export type LiquidFillProps = Customisable<LiquidFillOwnProps, 'span'>

/**
 * Round jar whose liquid level tells the progression.
 *
 * @example
 * // Real progression.
 * <LiquidFill value={(sent / total) * 100} />
 *
 * @example
 * // Wait with no measure, in the brand hue.
 * <LiquidFill indeterminate color="var(--o-palette-brand-500)" />
 */
export function LiquidFill({
  value = 62,
  indeterminate = false,
  size = 88,
  speed = 2600,
  color = 'currentColor',
  label = 'Loading',
  ...rest
}: LiquidFillProps): ReactElement {
  ensureLiquidRule()

  // One identifier per instance: two jars on the same page must not share a
  // clip path.
  const clip = `o-liquid-fill-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`

  const clamped = Math.min(100, Math.max(0, value))

  const { className, style } = mergePresentation({}, rest)

  const hostStyle = {
    ...style,
    width: `${String(size)}px`,
    height: `${String(size)}px`,
    color,
    '--o-liquid-drift': `${String(speed)}ms`,
    // The tide is far slower than the drift: it tells a progression, not a
    // ripple.
    '--o-liquid-tide': `${String(speed * 3)}ms`,
  } as CSSProperties

  return (
    <span
      {...rest}
      className={className}
      style={hostStyle}
      data-o-liquid-fill=""
      data-o-liquid-indeterminate={indeterminate ? '' : undefined}
      role="progressbar"
      aria-label={label}
      // A progressbar with no aria-valuenow is indeterminate: it is the
      // normative way to say "I am moving, but I do not know by how much".
      aria-valuemin={indeterminate ? undefined : 0}
      aria-valuemax={indeterminate ? undefined : 100}
      aria-valuenow={indeterminate ? undefined : Math.round(clamped)}
    >
      <svg aria-hidden viewBox="0 0 100 100" width="100%" height="100%">
        <defs>
          <clipPath id={clip}>
            <circle cx="50" cy="50" r="44" />
          </clipPath>
        </defs>
        <circle
          cx="50"
          cy="50"
          r="46"
          fill="none"
          stroke="currentColor"
          strokeWidth={3}
          opacity={0.25}
        />
        <g clipPath={`url(#${clip})`}>
          <g
            data-o-liquid-level=""
            style={
              indeterminate
                ? undefined
                : { transform: `translateY(${levelOf(clamped).toFixed(2)}px)` }
            }
          >
            <g data-o-liquid-wave="" data-o-liquid-wave-back="">
              <path d={WAVE} fill="currentColor" fillOpacity={0.3} />
            </g>
            <g data-o-liquid-wave="">
              <path d={WAVE} fill="currentColor" fillOpacity={0.72} />
            </g>
          </g>
        </g>
      </svg>
    </span>
  )
}

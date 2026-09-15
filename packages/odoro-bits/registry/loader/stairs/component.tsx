/**
 * Stairs: five steps of growing height, and a square that climbs them by
 * hopping before reappearing at the bottom.
 *
 * ## The stairs are fixed, only the square moves
 *
 * Making the steps themselves rise would give one more row of bars — that
 * is `bars-scale`. Here the staircase is a dimmed piece of scenery, laid
 * down once, and the whole animation fits in a single translation: that of
 * the square, which hops from landing to landing. One animation instead of
 * six, and a figure that reads at first glance, because the journey has a
 * direction.
 *
 * Every hop is two half-curves: `ease-out` towards the apex — the square
 * rises and slows down — then `ease-in` down to the next landing — it falls
 * back while speeding up. A single soft curve over the whole hop would read
 * as a slide, not as a leap. Once at the top, the square fades out,
 * reappears at the bottom, and starts again: the loop has no descent, one
 * does not walk a loading back down.
 *
 * ## A status, not a drawing
 *
 * The element carries `role="status"` and a label for screen readers: the
 * wait is information, not decoration. The steps and the square are removed
 * from the accessibility tree.
 *
 * Under reduced motion, the square stays resting on the top step: the
 * figure still reads as a climbed staircase, only the hop stops.
 *
 * @module
 */

import { mergePresentation, type Customisable } from '@odoro-cli/engine'
import type { CSSProperties, ReactElement } from 'react'

/** Identifier of the injected stylesheet. */
const STYLE_ID = 'o-stairs'

/** Number of steps. */
const STEPS = 5

/** Gap between two steps, in step widths. */
const GAP = 0.25

/** Share of the cycle given to the climb; the rest is the fade and the return. */
const CLIMB_SHARE = 0.68

/** A position of the square: column and landing, in step widths. */
function at(column: number, level: number): string {
  return `transform:translate(calc(var(--o-stairs-size) * ${String(column)}),calc(var(--o-stairs-size) * ${String(-level)}))`
}

/** Applies the staircase and the journey of the square, once per document. */
function ensureStairsRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  // One hop per step to climb; every hop has an apex halfway through.
  const hops = STEPS - 1
  const hopShare = (CLIMB_SHARE * 100) / hops
  const frames: string[] = []
  for (let hop = 0; hop < hops; hop += 1) {
    const from = hop * (1 + GAP)
    const to = (hop + 1) * (1 + GAP)
    const start = hop * hopShare
    frames.push(
      `${start.toFixed(2)}%{${at(from, hop + 1)};opacity:1;animation-timing-function:ease-out}`,
      `${(start + hopShare / 2).toFixed(2)}%{${at((from + to) / 2, hop + 2.7)};animation-timing-function:ease-in}`,
    )
  }
  const top = hops * (1 + GAP)
  frames.push(
    `${(CLIMB_SHARE * 100).toFixed(2)}%,82%{${at(top, STEPS)};opacity:1}`,
    // Fade out at the top, then an invisible return to the bottom, then the
    // reappearance.
    `88%{${at(top, STEPS)};opacity:0}`,
    `89%{${at(0, 1)};opacity:0}`,
    `100%{${at(0, 1)};opacity:1}`,
  )

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    // Two landings of margin at the top: the apex of the last hop rises into
    // them.
    '[data-o-stairs]{',
    'position:relative;display:inline-flex;align-items:flex-end;',
    `gap:calc(var(--o-stairs-size) * ${String(GAP)});`,
    `height:calc(var(--o-stairs-size) * ${String(STEPS + 2)});`,
    '}',
    '[data-o-stairs-step]{',
    'width:var(--o-stairs-size);height:calc(var(--o-stairs-size) * var(--o-stairs-level));',
    'border-radius:calc(var(--o-stairs-size) / 5) calc(var(--o-stairs-size) / 5) 0 0;',
    'background:var(--o-stairs-color);opacity:0.3;',
    '}',
    '[data-o-stairs-climber]{',
    'position:absolute;left:0;bottom:0;',
    'width:var(--o-stairs-size);height:var(--o-stairs-size);',
    'border-radius:calc(var(--o-stairs-size) / 5);background:var(--o-stairs-color);',
    'animation:o-stairs-climb var(--o-stairs-speed) infinite;',
    '}',
    `@keyframes o-stairs-climb{${frames.join('')}}`,
    // The square at the top of the stairs: the figure is stated, with no hop.
    '@media (prefers-reduced-motion:reduce){',
    `[data-o-stairs-climber]{animation:none;${at(top, STEPS)}}`,
    '}',
  ].join('')
  document.head.append(style)
}

/** Properties specific to the component. */
export interface StairsOwnProps {
  /** Width of a step, in pixels. @defaultValue 8 */
  size?: number
  /** Duration of a complete climb, in milliseconds. @defaultValue 2400 */
  speed?: number
  /** Color of the steps and of the square. @defaultValue the text color */
  color?: string
  /** Label announced to screen readers. @defaultValue 'Loading' */
  label?: string
}

/** All the properties. */
export type StairsProps = Customisable<StairsOwnProps, 'span'>

/**
 * Signals a wait with a square that climbs a staircase.
 *
 * @example
 * <Stairs />
 *
 * @example
 * // Bigger, slower, in the brand hue.
 * <Stairs size={12} speed={3200} color="var(--o-palette-brand-500)" />
 */
export function Stairs({
  size = 8,
  speed = 2400,
  color = 'currentColor',
  label = 'Loading',
  ...rest
}: StairsProps): ReactElement {
  ensureStairsRule()

  const { className, style } = mergePresentation({}, rest)

  const loaderStyle = {
    ...style,
    '--o-stairs-size': `${String(size)}px`,
    '--o-stairs-speed': `${String(speed)}ms`,
    '--o-stairs-color': color,
  } as CSSProperties

  return (
    <span
      {...rest}
      className={className}
      style={loaderStyle}
      data-o-stairs=""
      role="status"
    >
      <span className="o-sr-only">{label}</span>
      {Array.from({ length: STEPS }, (_, step) => (
        <span
          key={step}
          aria-hidden
          data-o-stairs-step=""
          style={{ '--o-stairs-level': String(step + 1) } as CSSProperties}
        />
      ))}
      <span aria-hidden data-o-stairs-climber="" />
    </span>
  )
}

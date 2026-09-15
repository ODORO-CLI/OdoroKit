/**
 * Dominoes: five standing dominoes fall onto one another, from left to right,
 * then rise again together.
 *
 * ## The fall pivots on the corner, not on the centre
 *
 * A falling domino does not turn around its middle: it tips over its edge on
 * the ground. The rotation origin is therefore the bottom right corner, and
 * the rotation is `ease-in` — nothing holds it back, it accelerates. It stops
 * at sixty-five degrees, leaning on the next one, and not flat: a fallen
 * domino rests against its neighbour, and that is what makes one read a chain
 * rather than a row lying down.
 *
 * The gap between two dominoes is computed so that the top of a leaning domino
 * just reaches the next one: any tighter and they would overlap; any wider and
 * the chain would break.
 *
 * Each domino knows its window in the cycle, through an animation of its own
 * written once in the stylesheet: the chain has an order, and the rising is
 * shared — the row straightens as one block, `ease-out`, as if put back in
 * place by a hand.
 *
 * ## A status, not a drawing
 *
 * The element carries `role="status"` and a label for screen readers: waiting
 * is information, not decoration. The dominoes are removed from the
 * accessibility tree.
 *
 * Under reduced motion, the row stays standing: the figure still reads as
 * dominoes, only the fall stops.
 *
 * @module
 */

import { mergePresentation, type Customisable } from '@odoro-cli/engine'
import type { CSSProperties, ReactElement } from 'react'

/** Identifier of the injected stylesheet. */
const STYLE_ID = 'o-domino'

/** Number of dominoes. */
const TILES = 5

/** Height of a domino, in thicknesses. */
const HEIGHT = 4

/** Fall angle, in degrees: leaning on the next one, not flat. */
const ANGLE = 65

/**
 * Gap between two dominoes, in thicknesses.
 *
 * The top of a leaning domino moves forward by `HEIGHT * sin(ANGLE)`; minus
 * one thickness, that is the gap which brings it just against the next one.
 */
const GAP = Number((HEIGHT * Math.sin((ANGLE * Math.PI) / 180) - 1).toFixed(2))

/** Share of the cycle between two fall starts, in per cent. */
const STEP = 11

/** Duration of a fall, in per cent of the cycle. */
const FALL = 12

/** Moment when the fallen row starts to rise again, in per cent. */
const RAISE_AT = 76

/** Sets up the dominoes and their falls, once per document. */
function ensureDominoRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    // A margin on the right: the last leaning domino overflows into it.
    '[data-o-domino]{',
    'display:inline-flex;align-items:flex-end;',
    `gap:calc(var(--o-domino-size) * ${String(GAP)});`,
    `height:calc(var(--o-domino-size) * ${String(HEIGHT)});`,
    `padding-right:calc(var(--o-domino-size) * ${String(GAP)});`,
    '}',
    '[data-o-domino-tile]{',
    `width:var(--o-domino-size);height:calc(var(--o-domino-size) * ${String(HEIGHT)});`,
    'border-radius:calc(var(--o-domino-size) / 3);background:var(--o-domino-color);',
    'transform-origin:bottom right;',
    'animation-duration:var(--o-domino-speed);animation-iteration-count:infinite;',
    '}',
    ...Array.from({ length: TILES }, (_, tile) => {
      const start = tile * STEP
      const end = start + FALL
      return [
        `[data-o-domino-tile="${String(tile)}"]{animation-name:o-domino-${String(tile)}}`,
        `@keyframes o-domino-${String(tile)}{`,
        `0%,${String(start)}%{transform:rotate(0);animation-timing-function:ease-in}`,
        `${String(end)}%,${String(RAISE_AT)}%{transform:rotate(${String(ANGLE)}deg);animation-timing-function:ease-out}`,
        `${String(RAISE_AT + 14)}%,100%{transform:rotate(0)}`,
        '}',
      ].join('')
    }),
    // A standing row: the figure is stated, without the fall.
    '@media (prefers-reduced-motion:reduce){',
    '[data-o-domino-tile]{animation:none;transform:none}',
    '}',
  ].join('')
  document.head.append(style)
}

/** Props of the component itself. */
export interface DominoOwnProps {
  /** Thickness of a domino, in pixels. @defaultValue 5 */
  size?: number
  /** Duration of a complete cycle, in milliseconds. @defaultValue 2000 */
  speed?: number
  /** Colour of the dominoes. @defaultValue the text colour */
  color?: string
  /** Label announced to screen readers. @defaultValue 'Loading' */
  label?: string
}

/** All the props. */
export type DominoProps = Customisable<DominoOwnProps, 'span'>

/**
 * Signals a wait through a chain of falling dominoes.
 *
 * @example
 * <Domino />
 *
 * @example
 * // Thicker, slower, in the brand hue.
 * <Domino size={8} speed={3000} color="var(--o-palette-brand-500)" />
 */
export function Domino({
  size = 5,
  speed = 2000,
  color = 'currentColor',
  label = 'Loading',
  ...rest
}: DominoProps): ReactElement {
  ensureDominoRule()

  const { className, style } = mergePresentation({}, rest)

  const loaderStyle = {
    ...style,
    '--o-domino-size': `${String(size)}px`,
    '--o-domino-speed': `${String(speed)}ms`,
    '--o-domino-color': color,
  } as CSSProperties

  return (
    <span
      {...rest}
      className={className}
      style={loaderStyle}
      data-o-domino=""
      role="status"
    >
      <span className="o-sr-only">{label}</span>
      {Array.from({ length: TILES }, (_, tile) => (
        <span key={tile} aria-hidden data-o-domino-tile={String(tile)} />
      ))}
    </span>
  )
}

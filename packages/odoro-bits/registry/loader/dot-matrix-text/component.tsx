/**
 * Dot matrix text: a word drawn on a 5x7 grid of dots, whose dots light up
 * from left to right then go out in the same direction.
 *
 * ## The grid is visible, the word lights up on it
 *
 * Every dot of the grid is drawn, unlit; only those of the word carry the
 * animation. It is the grid that makes the display: without it, you would
 * see pixelated letters, not a panel. And because the unlit dots are
 * painted once and for all, the cost of the animation depends only on the
 * dots of the word, not on the surface.
 *
 * Every lit dot carries the number of its column in a variable, and its
 * delay is derived from it: a left-to-right sweep therefore asks for only
 * one animation, declared once. The delay is negative, so that the first
 * frame is already halfway through the sweep rather than an empty grid
 * that waits.
 *
 * ## A font of thirty-five dots
 *
 * The glyphs are a table of seven rows of five bits. It covers the
 * capitals, the digits and the common punctuation; the text is upcased and
 * its accents removed, because an accent has no room in seven rows. An
 * unknown character becomes a question mark: a hole in the word would read
 * as a dead spot of the display.
 *
 * ## A status, not a drawing
 *
 * The element carries `role="status"` and a label for screen readers. The
 * grid is removed from the accessibility tree: circles do not read.
 *
 * Under reduced motion, every dot of the word is lit: the panel still
 * reads, only the sweep stops.
 *
 * @module
 */

import { mergePresentation, type Customisable } from '@odoro-cli/engine'
import type { CSSProperties, ReactElement } from 'react'

/** Identifier of the injected stylesheet. */
const STYLE_ID = 'o-dot-matrix-text'

/** Columns and rows of a glyph, and the empty column between two glyphs. */
const GLYPH_COLS = 5
const GLYPH_ROWS = 7
const PITCH = GLYPH_COLS + 1

/** Share of the cycle over which the lighting front crosses the word. */
const SWEEP_SHARE = 0.45

/**
 * Seven rows of five bits per glyph, the most significant bit on the left.
 *
 * A table rather than a font: thirty-five dots are enough for a capital,
 * and it is that constraint that gives the panel its character.
 */
const FONT: Readonly<Record<string, readonly number[]>> = {
  A: [0x0e, 0x11, 0x11, 0x1f, 0x11, 0x11, 0x11],
  B: [0x1e, 0x11, 0x11, 0x1e, 0x11, 0x11, 0x1e],
  C: [0x0e, 0x11, 0x10, 0x10, 0x10, 0x11, 0x0e],
  D: [0x1c, 0x12, 0x11, 0x11, 0x11, 0x12, 0x1c],
  E: [0x1f, 0x10, 0x10, 0x1e, 0x10, 0x10, 0x1f],
  F: [0x1f, 0x10, 0x10, 0x1e, 0x10, 0x10, 0x10],
  G: [0x0e, 0x11, 0x10, 0x17, 0x11, 0x11, 0x0f],
  H: [0x11, 0x11, 0x11, 0x1f, 0x11, 0x11, 0x11],
  I: [0x0e, 0x04, 0x04, 0x04, 0x04, 0x04, 0x0e],
  J: [0x07, 0x02, 0x02, 0x02, 0x02, 0x12, 0x0c],
  K: [0x11, 0x12, 0x14, 0x18, 0x14, 0x12, 0x11],
  L: [0x10, 0x10, 0x10, 0x10, 0x10, 0x10, 0x1f],
  M: [0x11, 0x1b, 0x15, 0x15, 0x11, 0x11, 0x11],
  N: [0x11, 0x11, 0x19, 0x15, 0x13, 0x11, 0x11],
  O: [0x0e, 0x11, 0x11, 0x11, 0x11, 0x11, 0x0e],
  P: [0x1e, 0x11, 0x11, 0x1e, 0x10, 0x10, 0x10],
  Q: [0x0e, 0x11, 0x11, 0x11, 0x15, 0x12, 0x0d],
  R: [0x1e, 0x11, 0x11, 0x1e, 0x14, 0x12, 0x11],
  S: [0x0f, 0x10, 0x10, 0x0e, 0x01, 0x01, 0x1e],
  T: [0x1f, 0x04, 0x04, 0x04, 0x04, 0x04, 0x04],
  U: [0x11, 0x11, 0x11, 0x11, 0x11, 0x11, 0x0e],
  V: [0x11, 0x11, 0x11, 0x11, 0x11, 0x0a, 0x04],
  W: [0x11, 0x11, 0x11, 0x15, 0x15, 0x15, 0x0a],
  X: [0x11, 0x11, 0x0a, 0x04, 0x0a, 0x11, 0x11],
  Y: [0x11, 0x11, 0x11, 0x0a, 0x04, 0x04, 0x04],
  Z: [0x1f, 0x01, 0x02, 0x04, 0x08, 0x10, 0x1f],
  '0': [0x0e, 0x11, 0x13, 0x15, 0x19, 0x11, 0x0e],
  '1': [0x04, 0x0c, 0x04, 0x04, 0x04, 0x04, 0x0e],
  '2': [0x0e, 0x11, 0x01, 0x02, 0x04, 0x08, 0x1f],
  '3': [0x1f, 0x02, 0x04, 0x02, 0x01, 0x11, 0x0e],
  '4': [0x02, 0x06, 0x0a, 0x12, 0x1f, 0x02, 0x02],
  '5': [0x1f, 0x10, 0x1e, 0x01, 0x01, 0x11, 0x0e],
  '6': [0x06, 0x08, 0x10, 0x1e, 0x11, 0x11, 0x0e],
  '7': [0x1f, 0x01, 0x02, 0x04, 0x08, 0x08, 0x08],
  '8': [0x0e, 0x11, 0x11, 0x0e, 0x11, 0x11, 0x0e],
  '9': [0x0e, 0x11, 0x11, 0x0f, 0x01, 0x02, 0x0c],
  ' ': [0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00],
  '.': [0x00, 0x00, 0x00, 0x00, 0x00, 0x0c, 0x0c],
  ',': [0x00, 0x00, 0x00, 0x00, 0x0c, 0x04, 0x08],
  ':': [0x00, 0x0c, 0x0c, 0x00, 0x0c, 0x0c, 0x00],
  '-': [0x00, 0x00, 0x00, 0x1f, 0x00, 0x00, 0x00],
  '!': [0x04, 0x04, 0x04, 0x04, 0x04, 0x00, 0x04],
  '?': [0x0e, 0x11, 0x01, 0x02, 0x04, 0x00, 0x04],
  '%': [0x18, 0x19, 0x02, 0x04, 0x08, 0x13, 0x03],
  "'": [0x04, 0x04, 0x00, 0x00, 0x00, 0x00, 0x00],
}

/** The glyph of a character: capital without accent, or question mark. */
function glyphOf(char: string): readonly number[] {
  const key = char
    .normalize('NFD')
    .replace(/\p{M}+/gu, '')
    .toUpperCase()
  return FONT[key] ?? FONT['?'] ?? []
}

/** Applies the grid and its sweep, once per document. */
function ensureDotMatrixTextRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-dmt]{display:inline-block;line-height:0}',
    '[data-o-dmt] svg{display:block;overflow:visible}',
    '[data-o-dmt-cell]{fill:currentColor;opacity:0.12}',
    '[data-o-dmt-on]{',
    'animation:o-dmt-light var(--o-dmt-speed) linear infinite;',
    // The delay is derived from the column: a single animation for the whole
    // sweep, and a negative start so the empty grid is never shown.
    'animation-delay:calc(var(--o-dmt-col) * var(--o-dmt-step) - var(--o-dmt-speed));',
    '}',
    '@keyframes o-dmt-light{0%,6%{opacity:0.12}10%,46%{opacity:1}52%,100%{opacity:0.12}}',
    '@media (prefers-reduced-motion:reduce){',
    '[data-o-dmt-on]{animation:none;opacity:1}',
    '}',
  ].join('')
  document.head.append(style)
}

/** Properties specific to the component. */
export interface DotMatrixTextOwnProps {
  /** The text drawn; capitals, digits and common punctuation. @defaultValue 'Loading' */
  text?: string
  /** Pitch of the grid, from one dot to the next, in pixels. @defaultValue 4 */
  size?: number
  /** Duration of a cycle, lighting and extinction included, in milliseconds. @defaultValue 2400 */
  speed?: number
  /** Color of the dots. @defaultValue the text color */
  color?: string
  /** Label announced to screen readers. @defaultValue 'Loading' */
  label?: string
}

/** All the properties. */
export type DotMatrixTextProps = Customisable<DotMatrixTextOwnProps, 'span'>

/**
 * Signals a wait with a word that lights up on a dot matrix.
 *
 * @example
 * <DotMatrixText />
 *
 * @example
 * // Bigger, slower, in the brand hue.
 * <DotMatrixText text="Envoi" size={6} speed={3200} color="var(--o-palette-brand-500)" />
 */
export function DotMatrixText({
  text = 'Loading',
  size = 4,
  speed = 2400,
  color = 'currentColor',
  label = 'Loading',
  ...rest
}: DotMatrixTextProps): ReactElement {
  ensureDotMatrixTextRule()

  const { className, style } = mergePresentation({}, rest)
  const chars = Array.from(text)
  const columns = Math.max(GLYPH_COLS, chars.length * PITCH - 1)
  const radius = size * 0.34

  const cells: { key: number; x: number; y: number; column: number; on: boolean }[] = []
  chars.forEach((char, index) => {
    const rows = glyphOf(char)
    for (let row = 0; row < GLYPH_ROWS; row += 1) {
      const bits = rows[row] ?? 0
      for (let col = 0; col < GLYPH_COLS; col += 1) {
        const column = index * PITCH + col
        cells.push({
          key: row * columns + column,
          x: (column + 0.5) * size,
          y: (row + 0.5) * size,
          column,
          on: ((bits >> (GLYPH_COLS - 1 - col)) & 1) === 1,
        })
      }
    }
  })

  const loaderStyle = {
    ...style,
    '--o-dmt-speed': `${String(speed)}ms`,
    '--o-dmt-step': `${((speed * SWEEP_SHARE) / columns).toFixed(2)}ms`,
    color,
  } as CSSProperties

  return (
    <span {...rest} className={className} style={loaderStyle} data-o-dmt="" role="status">
      <span className="o-sr-only">{label}</span>
      <svg
        aria-hidden
        viewBox={`0 0 ${String(columns * size)} ${String(GLYPH_ROWS * size)}`}
        width={columns * size}
        height={GLYPH_ROWS * size}
      >
        {cells.map((cell) => (
          <circle
            key={cell.key}
            cx={cell.x}
            cy={cell.y}
            r={radius}
            data-o-dmt-cell=""
            {...(cell.on ? { 'data-o-dmt-on': '' } : {})}
            style={
              cell.on
                ? ({ '--o-dmt-col': String(cell.column) } as CSSProperties)
                : undefined
            }
          />
        ))}
      </svg>
    </span>
  )
}

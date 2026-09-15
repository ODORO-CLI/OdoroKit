/**
 * Words that flip: a 3D drum of words, where the current word tips downwards
 * while the next one comes down into its place.
 *
 * ## A drum, not a stack of cards
 *
 * Turning each word separately takes as many animations as there are words,
 * and their keyframes all depend on the total count: word three has to enter
 * when word two leaves. Here the words are the faces of a prism whose axis is
 * horizontal, and it is the prism that turns. One animation, one object, and
 * the faces relieve one another by geometry alone.
 *
 * The radius of the prism is computed so that the faces meet edge to edge:
 * each face sits at the distance from the centre that makes a regular polygon
 * with as many sides close up. Two words give a piece with two faces, back to
 * back; three, a triangular prism; and so on. The faces turned towards the
 * back are hidden, and the frame clips whatever overflows the line: one never
 * sees more than one word, and the passage from one to the other.
 *
 * The drum turns in notches, with a pause on each word: without the landings,
 * one would never read a whole word. The keyframes depend on the number of
 * faces, so they are generated once per face count encountered, and not per
 * component.
 *
 * ## A status, not a drawing
 *
 * The element carries `role="status"` and a label for screen readers. The
 * faces are removed from the accessibility tree: they are all in the
 * document, and a screen reader would run them together into one sentence.
 *
 * Under reduced motion, the drum sits still on its first word: it still reads
 * as a wait, only the flipping stops.
 *
 * @module
 */

import { mergePresentation, type Customisable } from '@odoro-cli/engine'
import type { CSSProperties, ReactElement } from 'react'

/** Id of the injected stylesheet. */
const STYLE_ID = 'o-word-flip'

/** Share of each notch spent standing still on the word. */
const HOLD_SHARE = 0.68

/** Height of one face, in em of the body size. */
const LINE = 1.4

/** Sets the frame, the drum and its faces, once per document. */
function ensureWordFlipRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-wf]{',
    'display:inline-block;overflow:hidden;white-space:nowrap;vertical-align:middle;',
    'font-weight:600;font-size:var(--o-wf-size);color:var(--o-wf-color);',
    // The vanishing point is close: a drum seen from afar would read as a
    // plain vertical slide.
    'perspective:calc(var(--o-wf-h) * 5);',
    '}',
    '[data-o-wf-drum]{',
    'position:relative;display:block;height:var(--o-wf-h);',
    'transform-style:preserve-3d;',
    'animation:var(--o-wf-drum) var(--o-wf-cycle) cubic-bezier(0.65,0,0.35,1) infinite;',
    '}',
    // The longest of the words, invisible, holds the width: the faces are out
    // of flow and measure nothing.
    '[data-o-wf-sizer]{display:block;height:var(--o-wf-h);visibility:hidden;padding:0 0.15em}',
    '[data-o-wf-face]{',
    'position:absolute;inset:0;display:flex;align-items:center;justify-content:center;',
    'backface-visibility:hidden;',
    'transform:rotateX(var(--o-wf-angle)) translateZ(var(--o-wf-r));',
    '}',
    '@media (prefers-reduced-motion:reduce){',
    '[data-o-wf-drum]{animation:none;transform:none}',
    '}',
  ].join('')
  document.head.append(style)
}

/**
 * Sets the keyframes of a drum with `faces` faces, once per document and per
 * face count.
 *
 * Each notch: a landing on the word, then a turn of one nth up to the next
 * one. The last notch brings it back to a full turn, and the loop is
 * invisible.
 */
function ensureWordFlipDrumRule(faces: number): void {
  if (typeof document === 'undefined') return
  const id = `${STYLE_ID}-${String(faces)}`
  if (document.getElementById(id) !== null) return

  const stops: string[] = []
  for (let index = 0; index < faces; index += 1) {
    const angle = (-(360 / faces) * index).toFixed(2)
    const start = ((index / faces) * 100).toFixed(2)
    const hold = (((index + HOLD_SHARE) / faces) * 100).toFixed(2)
    stops.push(`${start}%,${hold}%{transform:rotateX(${angle}deg)}`)
  }
  stops.push('100%{transform:rotateX(-360deg)}')

  const style = document.createElement('style')
  style.id = id
  style.textContent = `@keyframes ${id}{${stops.join('')}}`
  document.head.append(style)
}

/** Props specific to the component. */
export interface WordFlipOwnProps {
  /** The first word of the drum, the one shown at rest. @defaultValue 'Loading' */
  text?: string
  /** The following words, separated by commas. @defaultValue 'Un instant,Presque la' */
  words?: string
  /** Body size of the text, in pixels. @defaultValue 18 */
  size?: number
  /** Time spent on each word, the flip included, in milliseconds. @defaultValue 1400 */
  speed?: number
  /** Colour of the text. @defaultValue the text colour */
  color?: string
  /** Label announced to screen readers. @defaultValue 'Loading' */
  label?: string
}

/** All props. */
export type WordFlipProps = Customisable<WordFlipOwnProps, 'span'>

/**
 * Signals a wait with words relieving one another on a drum.
 *
 * @example
 * <WordFlip />
 *
 * @example
 * // Its own steps, slower, in the brand hue.
 * <WordFlip text="Envoi" words="Verification,Termine" speed={2000} color="var(--o-palette-brand-500)" />
 */
export function WordFlip({
  text = 'Loading',
  words = 'Un instant,Presque la',
  size = 18,
  speed = 1400,
  color = 'currentColor',
  label = 'Loading',
  ...rest
}: WordFlipProps): ReactElement {
  const faces = [
    text,
    ...words
      .split(',')
      .map((word) => word.trim())
      .filter((word) => word.length > 0),
  ]
  // A single face cannot relieve itself: we double it, and the drum becomes a
  // piece that shows the same word twice.
  if (faces.length < 2) faces.push(text)

  ensureWordFlipRule()
  ensureWordFlipDrumRule(faces.length)

  const { className, style } = mergePresentation({}, rest)

  const lineHeight = size * LINE
  // The radius that closes the polygon: two faces are back to back, with no
  // thickness; beyond that, each face sits at the apothem's distance.
  const radius =
    faces.length === 2 ? 0 : lineHeight / 2 / Math.tan(Math.PI / faces.length)
  const longest = faces.reduce((a, b) => (b.length > a.length ? b : a), '')

  const loaderStyle = {
    ...style,
    '--o-wf-size': `${String(size)}px`,
    '--o-wf-h': `${lineHeight.toFixed(2)}px`,
    '--o-wf-r': `${radius.toFixed(2)}px`,
    '--o-wf-cycle': `${String(speed * faces.length)}ms`,
    '--o-wf-drum': `${STYLE_ID}-${String(faces.length)}`,
    '--o-wf-color': color,
  } as CSSProperties

  return (
    <span {...rest} className={className} style={loaderStyle} data-o-wf="" role="status">
      <span className="o-sr-only">{label}</span>
      <span aria-hidden data-o-wf-drum="">
        <span data-o-wf-sizer="">{longest}</span>
        {faces.map((word, index) => (
          <span
            key={index}
            data-o-wf-face=""
            style={
              {
                '--o-wf-angle': `${((360 / faces.length) * index).toFixed(2)}deg`,
              } as CSSProperties
            }
          >
            {word}
          </span>
        ))}
      </span>
    </span>
  )
}

/**
 * Scrambled text that resolves: a word made of glyphs that settles character
 * by character in a random order, holds while flickering, then scrambles
 * again.
 *
 * ## It never quite comes to rest
 *
 * The decoding of the text category plays once, left to right, and delivers a
 * headline: its end is the point. A loader has no end to deliver. Here the
 * resolution happens in a randomly drawn order, with no legible front, and
 * the clean word is only a plateau: during the hold, a character at random
 * rescrambles for an instant and comes back, like a signal that holds
 * poorly. Then everything scrambles and starts over. It is a state, not a
 * result.
 *
 * Each cycle draws a new order: two identical resolutions in a row would read
 * like a looping video.
 *
 * ## A fixed-pitch font, and scrambling at a fixed rate
 *
 * The scrambling glyphs do not have the width of the letters they replace;
 * in a proportional font, the word would wobble in width at every tick. The
 * system mono font pins each cell to one character. And the scrambling
 * changes glyph twenty times per second, not on every frame: any faster and
 * it is nothing but grey. The tick is counted in time elapsed on the engine
 * loop, independently of the display.
 *
 * ## The characters are written into the DOM, not into state
 *
 * Ten cells changing twenty times per second would make two hundred React
 * renders per second for text nodes. Each cell is therefore written by
 * reference; the settled state is an attribute that the stylesheet turns into
 * full ink.
 *
 * ## A status, not a drawing
 *
 * The element carries `role="status"` and a label for screen readers. The
 * cells are removed from the accessibility tree: scrambled, they would be
 * read as a string of glyphs.
 *
 * Under reduced motion, the text is clean from the start: it still reads as a
 * wait, only the scrambling stops.
 *
 * @module
 */

import {
  clock,
  mergePresentation,
  useMotionState,
  type Customisable,
} from '@odoro-cli/engine'
import { useEffect, useRef, type CSSProperties, type ReactElement } from 'react'

/** Identifier of the injected stylesheet. */
const STYLE_ID = 'o-scramble-loader'

/** The scrambling glyphs. */
const GLYPHS = '!<>-_/[]{}=+*^?#%&@$0123456789'

/** Share of the resolution where all stays scrambled, before the first clean character. */
const SCRAMBLE_SHARE = 0.25

/** Duration of the hold, as a share of the resolution. */
const HOLD_SHARE = 0.7

/** Interval between two glyphs of a scrambled cell, in milliseconds. */
const TICK_MS = 48

/** During the hold: gap between two flickers, and duration of one flicker. */
const FLICKER_GAP_MS = 320
const FLICKER_MS = 110

/** Non-breaking space: an ordinary space in an inline block would collapse. */
const NBSP = String.fromCharCode(160)

/** A glyph at random. */
function glyph(): string {
  return GLYPHS.charAt(Math.floor(Math.random() * GLYPHS.length))
}

/** Applies the cells and their two states, once per document. */
function ensureScrambleLoaderRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-sl]{',
    'display:inline-block;white-space:nowrap;font-weight:600;',
    'font-family:var(--o-font-mono);font-size:var(--o-sl-size);color:var(--o-sl-color);',
    '}',
    // A scrambled cell is at half ink; clean, it goes to full ink. It is the
    // attribute, not the character, that carries the difference.
    '[data-o-sl-char]{display:inline-block;min-width:1ch;text-align:center;opacity:0.45;transition:opacity 160ms}',
    '[data-o-sl-char][data-o-sl-set]{opacity:1}',
  ].join('')
  document.head.append(style)
}

/** Properties specific to the component. */
export interface ScrambleLoaderOwnProps {
  /** The text that resolves. @defaultValue 'Loading' */
  text?: string
  /** Text body size, in pixels. @defaultValue 16 */
  size?: number
  /** Duration of the resolution, from full scramble to clean text, in milliseconds. @defaultValue 2200 */
  speed?: number
  /** Colour of the text. @defaultValue the text colour */
  color?: string
  /** Label announced to screen readers. @defaultValue 'Loading' */
  label?: string
}

/** All the properties. */
export type ScrambleLoaderProps = Customisable<ScrambleLoaderOwnProps, 'span'>

/**
 * Signals a wait with a text that resolves out of a scramble.
 *
 * @example
 * <ScrambleLoader />
 *
 * @example
 * // Another word, slower, in the brand hue.
 * <ScrambleLoader text="Connexion" speed={3000} color="var(--o-palette-brand-500)" />
 */
export function ScrambleLoader({
  text = 'Loading',
  size = 16,
  speed = 2200,
  color = 'currentColor',
  label = 'Loading',
  ...rest
}: ScrambleLoaderProps): ReactElement {
  ensureScrambleLoaderRule()
  const { reduced } = useMotionState()
  const cells = useRef<(HTMLSpanElement | null)[]>([])
  const chars = Array.from(text)

  useEffect(() => {
    const letters = Array.from(text)
    const nodes: { node: HTMLSpanElement; char: string; fixed: boolean }[] = []
    letters.forEach((char, index) => {
      const node = cells.current[index]
      if (node === null || node === undefined) return
      // A space has nothing to resolve: it is clean from the start.
      nodes.push({ node, char: char === ' ' ? NBSP : char, fixed: char === ' ' })
    })
    if (nodes.length === 0) return

    const settle = (index: number): void => {
      const cell = nodes[index]
      if (cell === undefined) return
      cell.node.textContent = cell.char
      cell.node.setAttribute('data-o-sl-set', '')
    }

    if (reduced) {
      nodes.forEach((_, index) => {
        settle(index)
      })
      return
    }

    const cycle = speed * (1 + HOLD_SHARE)
    const set = nodes.map(() => false)
    let reveal = nodes.map(() => 1)
    let elapsed = 0
    let sinceTick = 0
    let cycleIndex = -1
    let flickerIndex = -1
    let flickerAt = 0
    let flickerUntil = 0

    // A new order on every cycle; spaces are clean from the start.
    const plan = (): void => {
      reveal = nodes.map(() => SCRAMBLE_SHARE + Math.random() * (1 - SCRAMBLE_SHARE))
      set.fill(false)
      nodes.forEach((cell, index) => {
        if (cell.fixed) {
          set[index] = true
          settle(index)
        } else {
          cell.node.removeAttribute('data-o-sl-set')
        }
      })
      flickerIndex = -1
      flickerAt = speed + FLICKER_GAP_MS
    }

    const subscription = clock.subscribe(
      ({ delta }) => {
        const step = delta * 1000
        elapsed += step
        sinceTick += step

        const index = Math.floor(elapsed / cycle)
        if (index !== cycleIndex) {
          cycleIndex = index
          plan()
        }
        const local = elapsed - index * cycle

        // Resolution: each cell settles at its own hour, the others keep spinning.
        if (local < speed) {
          const progress = local / speed
          nodes.forEach((_, position) => {
            if (set[position] === true) return
            if (progress >= (reveal[position] ?? 1)) {
              set[position] = true
              settle(position)
            }
          })
          if (sinceTick < TICK_MS) return
          sinceTick = 0
          nodes.forEach((cell, position) => {
            if (set[position] === true) return
            cell.node.textContent = glyph()
          })
          return
        }

        // Hold: a character at random flickers for an instant, then comes back.
        if (flickerIndex >= 0) {
          const cell = nodes[flickerIndex]
          if (local >= flickerUntil) {
            settle(flickerIndex)
            flickerIndex = -1
            flickerAt = local + FLICKER_GAP_MS
          } else if (sinceTick >= TICK_MS && cell !== undefined) {
            sinceTick = 0
            cell.node.textContent = glyph()
          }
          return
        }
        if (local >= flickerAt && local < cycle - FLICKER_MS) {
          const candidates = nodes
            .map((cell, position) => (cell.fixed ? -1 : position))
            .filter((p) => p >= 0)
          const pick = candidates[Math.floor(Math.random() * candidates.length)]
          const cell = pick === undefined ? undefined : nodes[pick]
          if (pick === undefined || cell === undefined) return
          flickerIndex = pick
          flickerUntil = local + FLICKER_MS
          cell.node.removeAttribute('data-o-sl-set')
          cell.node.textContent = glyph()
        }
      },
      { name: 'scramble-loader' },
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [text, speed, reduced])

  const { className, style } = mergePresentation({}, rest)

  const loaderStyle = {
    ...style,
    '--o-sl-size': `${String(size)}px`,
    '--o-sl-color': color,
  } as CSSProperties

  return (
    <span {...rest} className={className} style={loaderStyle} data-o-sl="" role="status">
      <span className="o-sr-only">{label}</span>
      <span aria-hidden>
        {chars.map((char, index) => (
          <span
            key={index}
            data-o-sl-char=""
            ref={(node) => {
              cells.current[index] = node
            }}
          >
            {char === ' ' ? NBSP : char}
          </span>
        ))}
      </span>
    </span>
  )
}

/**
 * Morph: a word pours into the next instead of substituting for it.
 *
 * ## What the filter does, and why a fade is not enough
 *
 * Two superimposed words, one fading out while the other fades in, is a
 * cross-fade: halfway along the path one sees two half-transparent texts over
 * each other, and the eye reads two words.
 *
 * The filter changes the nature of the passage. Each word is first drowned in
 * a blur, then a colour matrix heavily multiplies the alpha and shifts it
 * down: everything that was half transparent becomes either plainly opaque or
 * plainly empty. The threshold cuts a crisp outline back around the two mixed
 * halos. Where the letters of the two words overlap, the material welds; where
 * they draw apart, a neck thins and breaks.
 *
 * Halfway along the path one therefore no longer sees two words, but a single
 * shape coming undone — which is exactly the point.
 *
 * ## The fallback is the base state, not a branch
 *
 * The cross-fade is written first: both layers change opacity whatever
 * happens. The filter is **added** on top when the browser can render it, and
 * the blur of each layer is brought back to zero when it cannot — otherwise
 * the fallback would be a fade between two blurred smudges.
 *
 * The filter is also removed under forced colours, where it would erase the
 * contrast that this mode has just imposed.
 *
 * ## The state is carried by the render, the animation only joins it
 *
 * The resting opacity of each layer is derived from the current index. The
 * animations hold their final value, then are cancelled once the next render
 * is in place: at no moment does the displayed value differ from the computed
 * one, and nothing accumulates over the turns.
 *
 * ## The reserved space
 *
 * The words are stacked in the same grid cell: the box takes the size of the
 * longest and no longer moves. A box that resized during the morph would make
 * the whole line breathe.
 *
 * ## Reduced motion
 *
 * The first word, with no filter and no morph. A loop has no arrival state:
 * its rest is its starting point.
 *
 * @module
 */

import { mergePresentation, useMotionState, type Customisable } from '@odoro-cli/engine'
import {
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type ReactElement,
} from 'react'

/** Properties specific to the component. */
export interface MorphTextOwnProps {
  /** Words morphed into one another, on a loop. At least two. */
  words: readonly string[]
  /** Time a word stays readable, in milliseconds. @defaultValue 1400 */
  hold?: number
  /** Duration of one morph, in milliseconds. @defaultValue 900 */
  morph?: number
  /** Blur each word crosses during the morph, in pixels. @defaultValue 12 */
  blur?: number
  /** Strength of the welding, in pixels of spread. @defaultValue 4 */
  weld?: number
}

/** All properties. */
export type MorphTextProps = Customisable<MorphTextOwnProps, 'span'>

/** Identifier of the injected stylesheet. */
const STYLE_ID = 'o-morph-text'

/**
 * Threshold matrix: the colours pass through as they are, the alpha is
 * multiplied then lowered. The product is one beyond roughly a half and zero
 * below it: the gradient of the blur becomes an edge again.
 */
const THRESHOLD = '1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -10'

/**
 * Minimum type size, in pixels, below which the welding is abandoned.
 *
 * The threshold keeps only what stays above an alpha of 0.5 after the blur. A
 * stem of body text — two pixels at twenty of size — does not survive it, and
 * the word disappears **entirely**, with no error and no trace. Forty-four
 * pixels is the measured threshold from which the stem of an ordinary grotesk
 * holds.
 */
const MIN_FONT_SIZE = 44

/** Sets the stacking of the words, once per document. */
function ensureMorphRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-morph]{position:relative;display:inline-grid}',
    '[data-o-morph-layer]{grid-area:1/1}',
  ].join('')
  document.head.append(style)
}

/**
 * Says whether the browser can weld two shapes with a filter.
 *
 * Two conditions, and they do not overlap: the colour matrix must exist, and
 * forced-colours mode must be absent — it neutralises filters, and the
 * threshold would then make the text unreadable rather than welded.
 */
function canWeld(): boolean {
  if (typeof window === 'undefined') return false
  if (typeof SVGFEColorMatrixElement === 'undefined') return false
  return !window.matchMedia('(forced-colors: active)').matches
}

/**
 * Morphs a series of words into one another.
 *
 * @example
 * <MorphText words={['think', 'make']} className="o-text-5xl o-font-bold" />
 *
 * @example
 * // Slow and very fluid morph.
 * <MorphText words={['water', 'air', 'fire']} morph={1600} blur={22} weld={7} />
 */
export function MorphText({
  words,
  hold = 1400,
  morph = 900,
  blur = 12,
  weld,
  ...rest
}: MorphTextProps): ReactElement {
  const { reduced } = useMotionState()
  const host = useRef<HTMLElement | null>(null)
  const [index, setIndex] = useState(0)
  const [welded, setWelded] = useState(false)
  // The rendered type size, read once: it decides whether the welding is
  // possible, and how much is blurred.
  const [fontSize, setFontSize] = useState(0)

  ensureMorphRule()

  // One identifier per instance: two morphs on the same page must not share a
  // filter.
  const filterId = `o-morph-text-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`

  const total = words.length

  useEffect(() => {
    const element = host.current
    const size =
      element === null ? 0 : Number.parseFloat(getComputedStyle(element).fontSize)
    setFontSize(Number.isFinite(size) ? size : 0)
    // MIN_FONT_SIZE: below it, the threshold would eat the stems and the word
    // would disappear. The cross-fade then takes over — it is written first,
    // precisely for that.
    setWelded(!reduced && canWeld() && size >= MIN_FONT_SIZE)
  }, [reduced])

  // The blur of the filter follows the type size: fixed, it erases body text
  // and does not show on a two-hundred-pixel heading.
  const spread = weld ?? Math.max(1.5, fontSize * 0.05)

  useEffect(() => {
    const element = host.current
    if (element === null || reduced || total < 2) return

    const layers = [...element.querySelectorAll<HTMLElement>('[data-o-morph-layer]')]
    const leaving = layers[index]
    const entering = layers[(index + 1) % total]
    if (leaving === undefined || entering === undefined) return

    // Without the filter, the blur no longer helps: all that would be left is
    // a fade between two smudges. See the module header.
    const crossed = welded ? blur : 0

    const exit = leaving.animate(
      [
        { opacity: 1, filter: 'blur(0px)' },
        { opacity: 0, filter: `blur(${String(crossed)}px)` },
      ],
      { duration: morph, delay: hold, easing: 'ease-in', fill: 'forwards' },
    )
    const enter = entering.animate(
      [
        { opacity: 0, filter: `blur(${String(crossed)}px)` },
        { opacity: 1, filter: 'blur(0px)' },
      ],
      { duration: morph, delay: hold, easing: 'ease-out', fill: 'forwards' },
    )

    enter.onfinish = (): void => {
      setIndex((previous) => (previous + 1) % total)
    }

    // Cancelled only on the next render, once the computed opacity has taken
    // the same value: nothing flickers in between.
    return () => {
      exit.cancel()
      enter.cancel()
    }
  }, [reduced, welded, index, total, hold, morph, blur])

  const { className, style } = mergePresentation({}, rest)

  const current = total === 0 ? 0 : index % total

  const rootStyle = {
    ...style,
    // The filter only applies to the stack: applying it to the whole element
    // would swallow whatever the caller puts around it.
    ...(welded ? { filter: `url(#${filterId})` } : {}),
  } as CSSProperties

  return (
    <span {...rest} ref={host} className={className} style={rootStyle} data-o-morph="">
      {/* Filter region widened by a fifth: by default it hugs the bounding box
          too closely, and the blur would be cut off. */}
      <svg
        aria-hidden
        width="0"
        height="0"
        style={{ position: 'absolute', width: 0, height: 0 }}
      >
        <defs>
          <filter id={filterId} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur in="SourceGraphic" stdDeviation={spread} result="halo" />
            <feColorMatrix in="halo" type="matrix" values={THRESHOLD} />
          </filter>
        </defs>
      </svg>

      {words.map((word, position) => (
        <span
          key={`${word}-${String(position)}`}
          data-o-morph-layer=""
          aria-hidden={position !== current}
          style={{ opacity: position === current ? 1 : 0 }}
        >
          {word}
        </span>
      ))}
    </span>
  )
}

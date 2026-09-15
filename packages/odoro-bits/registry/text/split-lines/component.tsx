/**
 * Reveal by line: each line rises from under its own mask.
 *
 * ## Splitting by line, and not by character
 *
 * `split-reveal` splits by character: each letter is an element, and the
 * effect is small, nervous. This one works at the scale of the line — the
 * movement is wide, slow, and suits a long heading or an introductory
 * paragraph, where a hundred jumping letters would be noise.
 *
 * ## A line does not exist in the DOM
 *
 * That is the whole difficulty. A word is a string, so is a character; a line,
 * on the other hand, is a decision of the rendering engine, taken after
 * layout, and it changes with the width, the font, the system text size.
 *
 * It is therefore read where it exists: in the rendered rectangles. A `Range`
 * placed on each word gives its vertical position, and the words that share
 * that position form a line. It is the only method that does not get it wrong
 * — guessing from the number of characters works until the first line break.
 *
 * ## The original text never moves
 *
 * It stays a single node: readable by a screen reader, selectable, copyable in
 * one piece. It is its rectangles that are measured, and it also gives the
 * container its height.
 *
 * The animated lines live in an `aria-hidden` layer laid over it. The original
 * text is only made transparent **once that layer is built**: if the
 * JavaScript does not run, or fails, the text simply stays there. A missing
 * effect is forgivable, an invisible heading is not.
 *
 * ## The measurement is redone when the layout changes
 *
 * A font that finishes loading recomposes the lines. A window being resized
 * does too. Measuring once at mount would give a layer that is correct for two
 * seconds, then offset — and offset all the more visibly the longer the text
 * is.
 *
 * @module
 */

import { mergePresentation, useMotionState, type Customisable } from '@odoro-cli/engine'
import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ElementType,
  type ReactElement,
} from 'react'

import { useInView } from '@registre/hooks/useInView'

/** Properties specific to the component. */
export interface SplitLinesOwnProps {
  /** Text to reveal. A string: it is its lines that are measured. */
  children: string
  /** Rendered tag. @defaultValue 'p' */
  as?: ElementType
  /** Duration of the rise of one line, in milliseconds. @defaultValue 700 */
  duration?: number
  /** Delay between two lines, in milliseconds. @defaultValue 90 */
  stagger?: number
  /** Delay before the first line, in milliseconds. @defaultValue 0 */
  delay?: number
  /**
   * When to start.
   *
   * `view` waits for the entry into the viewport, `mount` starts right away.
   *
   * @defaultValue 'view'
   */
  trigger?: 'view' | 'mount'
}

/** All properties. */
export type SplitLinesProps = Customisable<SplitLinesOwnProps, 'p'>

/** Identifier of the injected stylesheet. */
const STYLE_ID = 'o-split-lines'

/** Sets the layer rules, once per document. */
function ensureSplitLinesRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-split-lines]{position:relative}',
    // The layer overlays exactly, and never receives the pointer: text
    // selection must reach the original, underneath.
    '[data-o-split-lines-layer]{position:absolute;inset:0;pointer-events:none}',
    // Each line is a mask: whatever sticks out at the bottom is clipped.
    '[data-o-split-lines-mask]{display:block;overflow:hidden}',
    '[data-o-split-lines-inner]{display:block;will-change:transform}',
    // The original only becomes transparent when the layer exists.
    '[data-o-split-lines-hidden]{color:transparent}',
  ].join('')
  document.head.append(style)
}

/** A word, and the rectangle it occupies. */
interface MeasuredWord {
  readonly text: string
  readonly top: number
}

/**
 * Groups the words of a text node into rendered lines.
 *
 * The rectangles are rounded before comparison: two words of the same line can
 * differ by a fraction of a pixel depending on their descenders, and a strict
 * comparison would split them into two lines of one word.
 */
function renderedLines(node: Text): readonly string[] {
  const text = node.data
  const measures: MeasuredWord[] = []

  const range = document.createRange()

  // With no measurement, no lines — and therefore no layer. The original text
  // then stays visible and intact, which is exactly the right degradation: the
  // effect is missing, the sentence is there. Throwing here would break the
  // whole rendering for an animation.
  if (typeof range.getBoundingClientRect !== 'function') {
    range.detach()
    return []
  }
  let start = 0

  while (start < text.length) {
    // Spaces are skipped: they belong to the line that precedes them, and a
    // space at the end of a line has a rectangle that can spill onto the next.
    while (start < text.length && /\s/.test(text[start] as string)) start += 1
    if (start >= text.length) break

    let end = start
    while (end < text.length && !/\s/.test(text[end] as string)) end += 1

    range.setStart(node, start)
    range.setEnd(node, end)

    const rect = range.getBoundingClientRect()
    measures.push({ text: text.slice(start, end), top: Math.round(rect.top) })

    start = end
  }

  range.detach()

  const lines: string[] = []
  let currentTop: number | undefined

  for (const word of measures) {
    if (currentTop === undefined || word.top !== currentTop) {
      lines.push(word.text)
      currentTop = word.top
    } else {
      lines[lines.length - 1] += ` ${word.text}`
    }
  }

  return lines
}

/**
 * Reveals a text line by line.
 *
 * @example
 * <SplitLines as="h1" className="o-text-4xl o-font-bold">
 *   An in-house engine, and nothing that is not yours.
 * </SplitLines>
 *
 * @example
 * // At mount rather than on entering the viewport, for a hero heading.
 * <SplitLines trigger="mount" stagger={140}>
 *   Welcome
 * </SplitLines>
 */
export function SplitLines({
  children,
  as: Tag = 'p',
  duration = 700,
  stagger = 90,
  delay = 0,
  trigger = 'view',
  ...rest
}: SplitLinesProps): ReactElement {
  const { reduced } = useMotionState()
  const { ref: viewRef, inView } = useInView<HTMLElement>({
    immediate: trigger === 'mount',
  })

  const sourceRef = useRef<HTMLSpanElement | null>(null)
  const layerRef = useRef<HTMLSpanElement | null>(null)
  const [built, setBuilt] = useState(false)

  ensureSplitLinesRule()

  useEffect(() => {
    // Under reduced motion, no layer is built: the text is there, and that is
    // all that was being asked of it.
    if (reduced) return

    const source = sourceRef.current
    const layer = layerRef.current
    if (source === null || layer === null) return

    const node = source.firstChild
    if (node === null || node.nodeType !== Node.TEXT_NODE) return

    let animations: Animation[] = []

    const build = () => {
      for (const a of animations) a.cancel()
      animations = []
      layer.replaceChildren()

      const lines = renderedLines(node as Text)
      if (lines.length === 0) return

      for (const line of lines) {
        const mask = document.createElement('span')
        mask.setAttribute('data-o-split-lines-mask', '')

        const inner = document.createElement('span')
        inner.setAttribute('data-o-split-lines-inner', '')
        inner.textContent = line

        mask.append(inner)
        layer.append(mask)
      }

      setBuilt(true)

      if (!inView) {
        // Built but not yet triggered: the lines wait under their mask.
        // Without this, they would be visible before the animation.
        for (const inner of layer.children) {
          const target = inner.firstElementChild
          if (target instanceof HTMLElement) target.style.transform = 'translateY(110%)'
        }
        return
      }

      let index = 0
      for (const mask of layer.children) {
        const inner = mask.firstElementChild
        if (!(inner instanceof HTMLElement)) continue

        inner.style.transform = ''

        animations.push(
          inner.animate(
            [{ transform: 'translateY(110%)' }, { transform: 'translateY(0)' }],
            {
              duration,
              delay: delay + index * stagger,
              // A sharp ease out then a damping: the movement must seem to
              // arrive, not to stop dead.
              easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
              fill: 'both',
            },
          ),
        )
        index += 1
      }
    }

    build()

    // The layout changes, the lines change. A font that finishes loading is
    // the most frequent case, and the most visible.
    const observer = new ResizeObserver(() => {
      build()
    })
    observer.observe(source)

    let alive = true
    if (typeof document.fonts !== 'undefined') {
      void document.fonts.ready.then(() => {
        if (alive) build()
      })
    }

    return () => {
      alive = false
      observer.disconnect()
      for (const a of animations) a.cancel()
      layer.replaceChildren()
      setBuilt(false)
    }
  }, [children, reduced, inView, duration, stagger, delay])

  const { className, style } = mergePresentation({}, rest)

  return (
    <Tag
      {...rest}
      ref={viewRef}
      className={className}
      style={style as CSSProperties}
      data-o-split-lines=""
    >
      <span ref={sourceRef} {...(built ? { 'data-o-split-lines-hidden': '' } : {})}>
        {children}
      </span>
      <span ref={layerRef} aria-hidden="true" data-o-split-lines-layer="" />
    </Tag>
  )
}

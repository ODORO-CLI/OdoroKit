/**
 * Warp on scroll: the line sags then bulges as it crosses the viewport.
 *
 * ## The scroll commands a curvature, not a position
 *
 * `scroll-float` drifts the words and `scroll-reveal` lights them. Here the
 * line keeps its place: what the scroll commands is its **shape**. When the
 * block is low in the viewport, the line hangs like a catenary; when it
 * reaches the middle of the screen, it is perfectly straight; when it rises
 * towards the top, it bulges the other way.
 *
 * The point of balance is therefore the centre of the screen, where the eye
 * settles: the text is straight at exactly the moment one reads it, and curved
 * the rest of the time.
 *
 * ## A single variable written per frame
 *
 * The engine loop writes `--o-wt-k` on the container, a signed number between
 * minus one and one. Each letter carries two constants computed at render —
 * its share of sag and its slope — and composes its own transform in `calc`.
 * The curve is never computed in JavaScript then distributed: it is the same
 * value, read with two different coefficients by each of them.
 *
 * A line of forty characters therefore costs exactly the same work per frame
 * as one of five.
 *
 * ## The shape of the curve
 *
 * The sag follows `1 - u * u`, maximal in the middle and zero at the ends: it
 * is the simplest arc that holds by both of its tips. The tilt follows the
 * slope of that same curve, `-u`, so that the letters lie along the direction
 * of the stroke instead of standing upright on a slanted line — it is that
 * detail that makes the difference between a warp and a mere stack of offsets.
 *
 * ## The straight line is the default value
 *
 * `--o-wt-k` is zero in the stylesheet: with no JavaScript, with no loop, the
 * text is straight and perfectly readable.
 *
 * ## The split is a display device
 *
 * The complete text appears once, in one piece; the letters are removed from
 * the accessibility tree.
 *
 * @module
 */

import {
  CLOCK_PRIORITY,
  clock,
  mergePresentation,
  useMotionState,
  type Customisable,
} from '@odoro-cli/engine'
import {
  useEffect,
  useRef,
  type CSSProperties,
  type ElementType,
  type ReactElement,
} from 'react'

/** Properties specific to the component. */
export interface WarpTextOwnProps {
  /** Text to warp. */
  children: string
  /** Rendered tag. @defaultValue 'span' */
  as?: ElementType
  /** Maximum sag of the curve, in pixels. @defaultValue 28 */
  amplitude?: number
  /** Maximum tilt of the edge letters, in degrees. @defaultValue 6 */
  tilt?: number
  /** Run of the control, in window heights. @defaultValue 1 */
  travel?: number
}

/** All properties. */
export type WarpTextProps = Customisable<WarpTextOwnProps, 'span'>

/** No-break space: an ordinary space collapses inside an inline block. */
const NBSP = '\u00A0'

/** Identifier of the injected stylesheet. */
const STYLE_ID = 'o-warp-text'

/** Sets the curvature, once per document. */
function ensureWarpRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    // Zero at rest: with no loop, the line is straight. See the header.
    '[data-o-warp]{display:inline-block;--o-wt-k:0}',
    '[data-o-warp-letter]{',
    'display:inline-block;',
    'transform:translateY(calc(var(--o-wt-k) * var(--o-wt-b) * var(--o-wt-amp)))',
    ' rotate(calc(var(--o-wt-k) * var(--o-wt-t) * var(--o-wt-tilt)));',
    '}',
    // With no motion, the line stays straight: it is its reading state.
    '@media (prefers-reduced-motion:reduce){',
    '[data-o-warp-letter]{transform:none}',
    '}',
  ].join('')
  document.head.append(style)
}

/** First ancestor whose content really scrolls, or nothing: the page will do. */
function scrollingAncestor(element: HTMLElement): HTMLElement | null {
  let node = element.parentElement
  while (node !== null) {
    const overflow = getComputedStyle(node).overflowY
    if (
      (overflow === 'auto' || overflow === 'scroll') &&
      node.scrollHeight > node.clientHeight
    ) {
      return node
    }
    node = node.parentElement
  }
  return null
}

/**
 * Curves a line of text along with the scroll.
 *
 * @example
 * <WarpText as="h2" className="o-text-5xl o-font-bold">
 *   The line bends
 * </WarpText>
 *
 * @example
 * // Pronounced sag, heavily reclined letters, short run.
 * <WarpText amplitude={64} tilt={14} travel={0.5}>Elastic</WarpText>
 */
export function WarpText({
  children,
  as: Tag = 'span',
  amplitude = 28,
  tilt = 6,
  travel = 1,
  ...rest
}: WarpTextProps): ReactElement {
  const { reduced } = useMotionState()
  const host = useRef<HTMLElement | null>(null)

  ensureWarpRule()

  useEffect(() => {
    const element = host.current
    if (element === null || reduced) return

    // The ancestor is looked up once: it does not change during the life of
    // the component, and looking it up on every frame would cost for nothing.
    const scroller = scrollingAncestor(element)

    const subscription = clock.subscribe(
      () => {
        const box = element.getBoundingClientRect()
        const viewTop = scroller === null ? 0 : scroller.getBoundingClientRect().top
        const viewHeight = scroller === null ? window.innerHeight : scroller.clientHeight

        const blockCentre = box.top + box.height / 2
        const viewCentre = viewTop + viewHeight / 2
        // Half a viewport of run on each side of the centre: the line is
        // straight in the middle, fully bent at the edges.
        const reach = Math.max(1, (viewHeight * travel) / 2)
        const raw = (blockCentre - viewCentre) / reach

        element.style.setProperty('--o-wt-k', Math.min(1, Math.max(-1, raw)).toFixed(4))
      },
      { name: 'scroll warp', priority: CLOCK_PRIORITY.input },
    )

    return () => {
      subscription.unsubscribe()
      element.style.removeProperty('--o-wt-k')
    }
  }, [reduced, travel, children])

  const { className, style } = mergePresentation({}, rest)

  // Reduced motion: the text is there, straight, with no split.
  if (reduced) {
    return (
      <Tag {...rest} className={className} style={style}>
        {children}
      </Tag>
    )
  }

  const letters = [...children]
  const last = Math.max(1, letters.length - 1)

  const rootStyle = {
    ...style,
    '--o-wt-amp': `${String(amplitude)}px`,
    '--o-wt-tilt': `${String(tilt)}deg`,
  } as CSSProperties

  return (
    <Tag {...rest} ref={host} className={className} style={rootStyle} data-o-warp="">
      {/* The complete text, in one piece, for screen readers. */}
      <span className="o-sr-only">{children}</span>
      <span aria-hidden>
        {letters.map((letter, index) => {
          // Place of the letter along the line, from -1 to 1.
          const u = letters.length < 2 ? 0 : (index / last) * 2 - 1
          return (
            <span
              key={`${letter}-${String(index)}`}
              data-o-warp-letter=""
              style={
                {
                  // Sag of the arc, zero at the tips; slope of that same arc,
                  // zero in the middle. See the module header.
                  '--o-wt-b': (1 - u * u).toFixed(4),
                  '--o-wt-t': (-u).toFixed(4),
                } as CSSProperties
              }
            >
              {/* An ordinary space collapses inside an inline block: the
                  no-break one keeps its width. */}
              {letter === ' ' ? NBSP : letter}
            </span>
          )
        })}
      </span>
    </Tag>
  )
}

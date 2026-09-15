/**
 * Reading by scrolling: a playhead lights the words one by one.
 *
 * ## A reveal that follows the finger, not a trigger
 *
 * `blur-reveal` starts once, on entering the viewport, and plays to the end
 * whatever happens next. Here the progress **is** the scroll position:
 * scrolling back one notch puts the last words out, scrolling down lights them
 * again. The text is a gauge as much as an animation, and that is what makes
 * it a pull quote or a manifesto block rather than a heading.
 *
 * ## A single variable written per frame
 *
 * The engine loop writes `--o-srv-p` on the container. Each word derives its
 * own progress from it by `calc` and `clamp`: the playhead is not a position
 * computed in JavaScript and distributed word by word, it is the same value
 * read with a different offset by each of them.
 *
 * Direct consequence: a paragraph of two hundred words costs exactly the same
 * work per frame as one of five.
 *
 * ## The progress is measured against what really scrolls
 *
 * Against the window by default, against the first ancestor with internal
 * scrolling if there is one. A `scroll` listener would have given a rhythm
 * different from the refresh, and the judder that goes with it.
 *
 * ## Lit text is the default value
 *
 * `--o-srv-p` is 1 in the stylesheet: with no JavaScript, with no loop, the
 * paragraph is entirely readable. A text that only lights up at runtime is a
 * text that is missing.
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
export interface ScrollRevealOwnProps {
  /** Text to reveal. A string: it is split into words. */
  children: string
  /** Rendered tag. @defaultValue 'p' */
  as?: ElementType
  /** Opacity of a word not yet reached, from 0 to 1. @defaultValue 0.18 */
  dim?: number
  /** Blur of a word not yet reached, in pixels. @defaultValue 4 */
  blur?: number
  /**
   * Run of the control, in window heights.
   *
   * The higher, the more scrolling is needed to light the last word.
   *
   * @defaultValue 0.7
   */
  travel?: number
}

/** All properties. */
export type ScrollRevealProps = Customisable<ScrollRevealOwnProps, 'p'>

/** Identifier of the injected stylesheet. */
const STYLE_ID = 'o-scroll-reveal'

/** Sets the playhead rules, once per document. */
function ensureScrollRevealRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    // One at rest: with no loop, the whole text is lit. See the header.
    '[data-o-scroll-reveal]{--o-srv-p:1}',
    '[data-o-scroll-reveal-word]{',
    'display:inline-block;',
    // The playhead advances by `span` notches as the progress goes from zero
    // to one; each word keeps only the notch that concerns it.
    '--o-srv-t:clamp(0,calc(var(--o-srv-p) * var(--o-srv-span) - var(--o-srv-i)),1);',
    'opacity:calc(var(--o-srv-dim) + (1 - var(--o-srv-dim)) * var(--o-srv-t));',
    'filter:blur(calc((1 - var(--o-srv-t)) * var(--o-srv-blur)));',
    '}',
    // With no motion, the paragraph is lit in one block: the arrival state.
    '@media (prefers-reduced-motion:reduce){',
    '[data-o-scroll-reveal-word]{opacity:1;filter:none}',
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
 * Lights the words of a text along with the scroll.
 *
 * @example
 * <ScrollReveal as="p" className="o-text-2xl">
 *   A component you cannot modify is not yours.
 * </ScrollReveal>
 *
 * @example
 * // Almost out at the start, with no blur, over a long run.
 * <ScrollReveal dim={0.05} blur={0} travel={1.4}>Slowly</ScrollReveal>
 */
export function ScrollReveal({
  children,
  as: Tag = 'p',
  dim = 0.18,
  blur = 4,
  travel = 0.7,
  ...rest
}: ScrollRevealProps): ReactElement {
  const { reduced } = useMotionState()
  const host = useRef<HTMLElement | null>(null)

  ensureScrollRevealRule()

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
        const viewBottom = viewTop + viewHeight

        // Zero when the top of the block touches the bottom of the viewport;
        // one when it has risen by its own height plus the requested run.
        const travelled = viewBottom - box.top
        const total = Math.max(1, viewHeight * travel + box.height)
        const progress = Math.min(1, Math.max(0, travelled / total))

        element.style.setProperty('--o-srv-p', progress.toFixed(4))
      },
      { name: 'scroll reveal', priority: CLOCK_PRIORITY.input },
    )

    return () => {
      subscription.unsubscribe()
      element.style.removeProperty('--o-srv-p')
    }
  }, [reduced, travel, children])

  const { className, style } = mergePresentation({}, rest)

  const words = children.split(' ').filter((word) => word.length > 0)

  const rootStyle = {
    ...style,
    '--o-srv-dim': Math.min(1, Math.max(0, dim)),
    '--o-srv-blur': `${String(blur)}px`,
    // One notch more than there are words: the last one finishes arriving
    // before the progress reaches one, rather than exactly on it.
    '--o-srv-span': words.length + 1,
  } as CSSProperties

  return (
    <Tag
      {...rest}
      ref={host}
      className={className}
      style={rootStyle}
      data-o-scroll-reveal=""
    >
      {/* The complete text, in one piece, for screen readers. */}
      <span className="o-sr-only">{children}</span>
      <span aria-hidden>
        {words.map((word, index) => (
          <span key={`${word}-${String(index)}`}>
            <span
              data-o-scroll-reveal-word=""
              style={{ '--o-srv-i': index } as CSSProperties}
            >
              {word}
            </span>
            {index < words.length - 1 ? ' ' : null}
          </span>
        ))}
      </span>
    </Tag>
  )
}

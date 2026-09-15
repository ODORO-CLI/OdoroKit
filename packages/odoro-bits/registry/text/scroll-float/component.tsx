/**
 * Float: the words drift while the block is entering, then settle.
 *
 * ## An amplitude driven by the scroll, not a position
 *
 * Text parallaxes move the words in proportion to the scroll: the word is
 * *elsewhere*, and it comes back. Here the words are always in their place —
 * what the scroll commands is the **amplitude** of a continuous oscillation.
 * Far down the page, they float widely; once the block has properly entered,
 * the amplitude falls to zero and the paragraph reads as a paragraph.
 *
 * Each word has its own phase, so that they never rise together: it is that
 * phase shift that gives the impression of floating rather than of a swell.
 *
 * ## A single variable written per frame
 *
 * The engine loop writes `--o-slf-p` on the container, and nothing else. The
 * words derive their amplitude and their opacity from it by `calc`: no React
 * render, no style write per word, whatever their number.
 *
 * The oscillation itself is a CSS animation, composited, which never asks for
 * control.
 *
 * ## The progress is measured against what really scrolls
 *
 * Against the window by default, but against the first ancestor with internal
 * scrolling if there is one: laid inside a panel, the text must answer the
 * panel. A `scroll` listener would have given a rhythm different from that of
 * the refresh, and the judder that goes with it.
 *
 * ## Rest is the default value
 *
 * `--o-slf-p` is 1 in the stylesheet: with no JavaScript, with no loop, the
 * words are settled, crisp and motionless. The progress can only *take* rest
 * away, never give it — a text that only lights up at runtime is a text that
 * is missing.
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
export interface ScrollFloatOwnProps {
  /** Text to float. A string: it is split into words. */
  children: string
  /** Rendered tag. @defaultValue 'p' */
  as?: ElementType
  /** Amplitude of the drift on entry, in pixels. @defaultValue 26 */
  lift?: number
  /** Duration of one full oscillation, in milliseconds. @defaultValue 3200 */
  period?: number
  /**
   * Run of the control, in window heights.
   *
   * The higher, the more scrolling is needed before the words settle.
   *
   * @defaultValue 0.6
   */
  travel?: number
}

/** All properties. */
export type ScrollFloatProps = Customisable<ScrollFloatOwnProps, 'p'>

/** Identifier of the injected stylesheet. */
const STYLE_ID = 'o-scroll-float'

/** Sets the float rules, once per document. */
function ensureScrollFloatRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    // One at rest: with no loop, the text is settled. See the header.
    '[data-o-scroll-float]{--o-slf-p:1}',
    '[data-o-scroll-float-word]{',
    'display:inline-block;',
    'opacity:calc(0.15 + 0.85 * var(--o-slf-p));',
    '--o-slf-amp:calc((1 - var(--o-slf-p)) * var(--o-slf-lift));',
    'animation:o-slf-bob var(--o-slf-period) ease-in-out infinite;',
    'animation-delay:var(--o-slf-delay,0ms);',
    '}',
    // `translate` rather than `transform`: the independent property leaves the
    // transform available to whoever wants to set their own.
    '@keyframes o-slf-bob{',
    '0%,100%{translate:0 calc(var(--o-slf-amp) * -1)}',
    '50%{translate:0 var(--o-slf-amp)}',
    '}',
    // With no motion, the words are settled, crisp: the arrival state.
    '@media (prefers-reduced-motion:reduce){',
    '[data-o-scroll-float-word]{animation:none;opacity:1;translate:none}',
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
 * Drifts the words of a text while it is entering the viewport.
 *
 * @example
 * <ScrollFloat as="h2" className="o-text-3xl o-font-semibold">
 *   What matters deserves to be read
 * </ScrollFloat>
 *
 * @example
 * // A wide and slow drift, which takes a long time to settle.
 * <ScrollFloat lift={48} period={5200} travel={1}>An opening</ScrollFloat>
 */
export function ScrollFloat({
  children,
  as: Tag = 'p',
  lift = 26,
  period = 3200,
  travel = 0.6,
  ...rest
}: ScrollFloatProps): ReactElement {
  const { reduced } = useMotionState()
  const host = useRef<HTMLElement | null>(null)

  ensureScrollFloatRule()

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

        element.style.setProperty('--o-slf-p', progress.toFixed(4))
      },
      { name: 'floating words', priority: CLOCK_PRIORITY.input },
    )

    return () => {
      subscription.unsubscribe()
      element.style.removeProperty('--o-slf-p')
    }
  }, [reduced, travel, children])

  const { className, style } = mergePresentation({}, rest)

  const rootStyle = {
    ...style,
    '--o-slf-lift': `${String(lift)}px`,
    '--o-slf-period': `${String(period)}ms`,
  } as CSSProperties

  const words = children.split(' ').filter((word) => word.length > 0)

  return (
    <Tag
      {...rest}
      ref={host}
      className={className}
      style={rootStyle}
      data-o-scroll-float=""
    >
      {/* The complete text, in one piece, for screen readers. */}
      <span className="o-sr-only">{children}</span>
      <span aria-hidden>
        {words.map((word, index) => (
          <span key={`${word}-${String(index)}`}>
            <span
              data-o-scroll-float-word=""
              style={
                {
                  // A negative delay, different for each word: they never rise
                  // together, and the drift looks free.
                  '--o-slf-delay': `${String(-(index * period) / 7)}ms`,
                } as CSSProperties
              }
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

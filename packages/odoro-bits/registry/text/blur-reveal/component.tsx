/**
 * Blur reveal: the words go from blurred to crisp, one after the other.
 *
 * ## `element.animate` rather than a stylesheet
 *
 * The effect plays only once, when the text enters the viewport. A declarative
 * animation would have to exist before knowing when to start, and would have
 * to be held back by an attribute then released at the right moment. The Web
 * Animations API says the same thing in one line, at the exact moment the
 * observer signals the entry — and the browser composites it like any CSS
 * animation.
 *
 * ## The initial blur is only applied if the effect will happen
 *
 * The classic trap of this kind of effect: hiding the text in CSS and
 * revealing it in JavaScript. If the JavaScript never comes — an error, a
 * reader without scripts, reduced motion — the text stays invisible. Here the
 * hidden state is applied by the very code that schedules the reveal: without
 * it, the text is simply there, crisp.
 *
 * ## The split is a display device
 *
 * The words are broken into elements so that each can receive its own delay.
 * The container therefore carries the complete text for screen readers, and
 * the split words are removed from the accessibility tree.
 *
 * @module
 */

import { mergePresentation, useMotionState, type Customisable } from '@odoro-cli/engine'
import { useEffect, useRef, type ElementType, type ReactElement } from 'react'

/** Properties specific to the component. */
export interface BlurRevealOwnProps {
  /** Text to reveal. */
  children: string
  /** Rendered tag. @defaultValue 'p' */
  as?: ElementType
  /** Delay between two words, in milliseconds. @defaultValue 90 */
  step?: number
  /** Starting blur, in pixels. @defaultValue 8 */
  blur?: number
  /** Duration of the reveal of one word, in milliseconds. @defaultValue 600 */
  duration?: number
}

/** All properties. */
export type BlurRevealProps = Customisable<BlurRevealOwnProps, 'p'>

/**
 * Reveals a text word by word, from blurred to crisp, on entering the viewport.
 *
 * @example
 * <BlurReveal as="h2" className="o-text-3xl o-font-bold">
 *   What matters deserves to be read
 * </BlurReveal>
 *
 * @example
 * // Slower, blurrier: for a heading alone on its screen.
 * <BlurReveal step={140} blur={14}>An opening</BlurReveal>
 */
export function BlurReveal({
  children,
  as: Tag = 'p',
  step = 90,
  blur = 8,
  duration = 600,
  ...rest
}: BlurRevealProps): ReactElement {
  const { reduced } = useMotionState()
  const host = useRef<HTMLElement | null>(null)

  useEffect(() => {
    const element = host.current
    if (element === null || reduced) return

    const words = element.querySelectorAll<HTMLElement>('[data-o-blur-word]')
    if (words.length === 0) return

    // The hidden state is applied here, not in the render: if this code does
    // not run, the text stays crisp and visible. See the module header.
    for (const word of words) {
      word.style.opacity = '0'
    }

    let played = false
    const animations: Animation[] = []

    const observer = new IntersectionObserver(
      (entries) => {
        if (played || entries.every((entry) => !entry.isIntersecting)) return
        played = true
        observer.disconnect()

        words.forEach((word, index) => {
          word.style.opacity = ''
          animations.push(
            word.animate(
              [
                { filter: `blur(${String(blur)}px)`, opacity: 0 },
                { filter: 'blur(0px)', opacity: 1 },
              ],
              {
                duration,
                delay: index * step,
                easing: 'ease-out',
                fill: 'both',
              },
            ),
          )
        })
      },
      { threshold: 0.4 },
    )

    observer.observe(element)
    return () => {
      observer.disconnect()
      for (const animation of animations) animation.cancel()
      for (const word of words) {
        word.style.opacity = ''
      }
    }
  }, [reduced, children, step, blur, duration])

  const { className, style } = mergePresentation({}, rest)

  // Reduced motion: the text is there, crisp, with no split.
  if (reduced) {
    return (
      <Tag {...rest} className={className} style={style}>
        {children}
      </Tag>
    )
  }

  const words = children.split(' ').filter((word) => word.length > 0)

  return (
    <Tag {...rest} ref={host} className={className} style={style}>
      {/* The complete text, in one piece, for screen readers. */}
      <span className="o-sr-only">{children}</span>
      <span aria-hidden>
        {words.map((word, index) => (
          <span key={`${word}-${String(index)}`}>
            <span data-o-blur-word="" style={{ display: 'inline-block' }}>
              {word}
            </span>
            {index < words.length - 1 ? ' ' : null}
          </span>
        ))}
      </span>
    </Tag>
  )
}

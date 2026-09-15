/**
 * Focus pull: a frame of corner brackets jumps from word to word, and the
 * targeted word becomes crisp again while the others stay blurred.
 *
 * ## A sight, not a reveal
 *
 * `blur-reveal` goes from blurred to crisp once and for all; here the blur is
 * the normal state of the text, and only one word comes out of it at a time.
 * The effect does not tell of an arrival, it tells of a reading: something is
 * looking at the text, and one sees where it is looking.
 *
 * The frame is made of four open corners, not of a full rectangle: a rectangle
 * would shut the word in, four corners designate it.
 *
 * ## The blur is only applied if the sight exists
 *
 * The trap of every effect that hides: if the JavaScript never comes, the text
 * stays in its initial state. An entirely blurred paragraph would be worse
 * than an absent paragraph — it looks like a bug.
 *
 * The blur is therefore carried by an attribute set from an effect. Without
 * it, the whole text is crisp and the frame does not exist.
 *
 * ## The frame is placed, not drawn
 *
 * Its position and its size are read off the targeted word, in coordinates of
 * the element — `offsetLeft` and company, which require no conversion. The
 * movement itself is a CSS transition: nothing is animated in JavaScript, and
 * the frame crosses the line, or even changes line, without a single
 * trajectory computation.
 *
 * ## The hover takes over
 *
 * Pointing at a word focuses it and suspends the cycle. It is the only right
 * answer: without it, the word one has just designated would have the focus
 * stolen from it a second later.
 *
 * ## The split is a display device
 *
 * The complete text appears once, in one piece; the words are removed from the
 * accessibility tree.
 *
 * ## Reduced motion
 *
 * No blur, no frame: the whole text is crisp. It is the state where everything
 * reads, and it really is the arrival state of every pass of the sight.
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

/** Properties specific to the component. */
export interface TrueFocusOwnProps {
  /** Text to focus. A string: it is split into words. */
  children: string
  /** Rendered tag. @defaultValue 'p' */
  as?: ElementType
  /** Blur of a word out of focus, in pixels. @defaultValue 5 */
  blur?: number
  /** Opacity of a word out of focus, from 0 to 1. @defaultValue 0.55 */
  dimmed?: number
  /** Time spent on a word, in milliseconds. @defaultValue 1400 */
  hold?: number
  /** Duration of the movement of the frame, in milliseconds. @defaultValue 600 */
  travel?: number
  /** Colour of the frame. @defaultValue the brand hue */
  color?: string
}

/** All properties. */
export type TrueFocusProps = Customisable<TrueFocusOwnProps, 'p'>

/** Identifier of the injected stylesheet. */
const STYLE_ID = 'o-true-focus'

/** Play left between the word and its frame, in pixels. */
const MARGIN = 6

/** Length of one corner of the frame, in pixels. */
const CORNER_LEN = 10

/** Thickness of the stroke of the frame, in pixels. */
const STROKE = 2

/** Sets the sight and the blur, once per document. */
function ensureFocusRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-focus]{position:relative}',
    '[data-o-focus-word]{display:inline-block}',
    // The blur only exists under the attribute set by the effect: see the
    // header.
    '[data-o-focus="ready"] [data-o-focus-word]{',
    'filter:blur(var(--o-focus-blur));opacity:var(--o-focus-dim);',
    'transition:filter var(--o-focus-travel) ease,opacity var(--o-focus-travel) ease;',
    '}',
    '[data-o-focus="ready"] [data-o-focus-word][data-o-focus-aimed]{',
    'filter:blur(0);opacity:1;',
    '}',
    '[data-o-focus-frame]{',
    'position:absolute;left:0;top:0;opacity:0;pointer-events:none;',
    'transition:transform var(--o-focus-travel) cubic-bezier(0.22,1,0.36,1),',
    'width var(--o-focus-travel) cubic-bezier(0.22,1,0.36,1),',
    'height var(--o-focus-travel) cubic-bezier(0.22,1,0.36,1),',
    'opacity var(--o-focus-travel) ease;',
    '}',
    '[data-o-focus="ready"] [data-o-focus-frame]{opacity:1}',
    '[data-o-focus-corner]{',
    'position:absolute;width:var(--o-focus-angle);height:var(--o-focus-angle);',
    'border:var(--o-focus-trait) solid var(--o-focus-color);',
    '}',
    '[data-o-focus-corner="hg"]{top:0;left:0;border-right:0;border-bottom:0}',
    '[data-o-focus-corner="hd"]{top:0;right:0;border-left:0;border-bottom:0}',
    '[data-o-focus-corner="bg"]{bottom:0;left:0;border-right:0;border-top:0}',
    '[data-o-focus-corner="bd"]{bottom:0;right:0;border-left:0;border-top:0}',
  ].join('')
  document.head.append(style)
}

/**
 * Jumps a focus pull from word to word.
 *
 * @example
 * <TrueFocus as="h2" className="o-text-4xl o-font-bold">
 *   Every word in turn
 * </TrueFocus>
 *
 * @example
 * // Slow sight, pronounced blur, frame in the text colour.
 * <TrueFocus hold={2600} blur={9} color="currentColor">Slowly</TrueFocus>
 */
export function TrueFocus({
  children,
  as: Tag = 'p',
  blur = 5,
  dimmed = 0.55,
  hold = 1400,
  travel = 600,
  color = 'var(--o-palette-brand-500)',
  ...rest
}: TrueFocusProps): ReactElement {
  const { reduced } = useMotionState()
  const host = useRef<HTMLElement | null>(null)
  const [index, setIndex] = useState(0)
  const [ready, setReady] = useState(false)
  const [frozen, setFrozen] = useState(false)

  ensureFocusRule()

  const words = children.split(' ').filter((word) => word.length > 0)
  const total = words.length

  // The blur arrives after the first render, and never under reduced motion.
  useEffect(() => {
    setReady(!reduced)
  }, [reduced])

  useEffect(() => {
    if (reduced || frozen || total < 2) return

    // A clock, not the engine loop: one word every second and a half is a
    // change every ninety frames.
    const timer = setTimeout(() => {
      setIndex((previous) => (previous + 1) % total)
    }, hold)

    return () => clearTimeout(timer)
  }, [reduced, frozen, index, hold, total])

  useEffect(() => {
    const element = host.current
    if (element === null || reduced) return

    const frame = element.querySelector<HTMLElement>('[data-o-focus-frame]')
    if (frame === null) return

    const place = (): void => {
      const target = element.querySelectorAll<HTMLElement>('[data-o-focus-word]')[index]
      if (target === undefined) return
      // `offset*` is already expressed in the frame of reference of the
      // positioned element: no box to convert, no scroll position to subtract.
      frame.style.width = `${String(target.offsetWidth + MARGIN * 2)}px`
      frame.style.height = `${String(target.offsetHeight + MARGIN * 2)}px`
      frame.style.transform = `translate(${String(target.offsetLeft - MARGIN)}px, ${String(target.offsetTop - MARGIN)}px)`
    }
    place()

    // The line recomposes, the frame follows: without that, it would stay at
    // the place the word occupied before the width change.
    const observer = new ResizeObserver(place)
    observer.observe(element)
    return () => observer.disconnect()
  }, [reduced, index, children])

  const { className, style } = mergePresentation({}, rest)

  const rootStyle = {
    ...style,
    '--o-focus-blur': `${String(blur)}px`,
    '--o-focus-dim': Math.min(1, Math.max(0, dimmed)),
    '--o-focus-travel': `${String(travel)}ms`,
    '--o-focus-color': color,
    '--o-focus-angle': `${String(CORNER_LEN)}px`,
    '--o-focus-trait': `${String(STROKE)}px`,
  } as CSSProperties

  return (
    <Tag
      {...rest}
      ref={host}
      className={className}
      style={rootStyle}
      data-o-focus={ready ? 'ready' : ''}
      onPointerLeave={() => {
        setFrozen(false)
      }}
    >
      {/* The complete text, in one piece, for screen readers. */}
      <span className="o-sr-only">{children}</span>
      <span aria-hidden>
        {words.map((word, position) => (
          <span key={`${word}-${String(position)}`}>
            <span
              data-o-focus-word=""
              data-o-focus-aimed={position === index ? '' : undefined}
              onPointerEnter={() => {
                setIndex(position)
                setFrozen(true)
              }}
            >
              {word}
            </span>
            {position < total - 1 ? ' ' : null}
          </span>
        ))}
        <span data-o-focus-frame="">
          <span data-o-focus-corner="hg" />
          <span data-o-focus-corner="hd" />
          <span data-o-focus-corner="bg" />
          <span data-o-focus-corner="bd" />
        </span>
      </span>
    </Tag>
  )
}

/**
 * Rotating word: a single word changes inside a sentence that does not move.
 *
 * ## This is not the typewriter
 *
 * `typewriter` types then erases whole sentences, character by character: the
 * eye follows the caret. Here the sentence is fixed and readable from start to
 * finish, and only one word is substituted. It is what one wants for a page
 * heading — "Build **faster** / more **safely** / **together**" — where a
 * sentence that erases itself would force a re-read on every turn.
 *
 * ## The width does not jump, and without measuring anything
 *
 * The classic problem: "faster" is shorter than "together", so the end of the
 * sentence moves on every turn. The usual answer is to measure each word in
 * JavaScript to reserve the width of the longest — which assumes the fonts are
 * loaded, has to be redone on every resize, and is wrong in the meantime.
 *
 * An inline grid does it on its own. Every word occupies the **same cell**;
 * the cell takes the width of the widest, and nothing has been measured. The
 * browser has been able to do this forever, and it redoes it by itself when
 * the font changes.
 *
 * ## The first word is the word that is read
 *
 * A screen reader must not hear eight variants in a row. The sentence
 * therefore carries one word, a single one, in the normal flow; the rotating
 * stack is `aria-hidden`. What one hears is a complete and sensible sentence,
 * what one sees is the same sentence breathing.
 *
 * ## It only turns under the eye
 *
 * The interval stops as soon as the component leaves the viewport. A page that
 * keeps three headings turning in sections nobody is looking at wakes the
 * processor for nothing, and it shows on the battery.
 *
 * @module
 */

import { mergePresentation, useMotionState, type Customisable } from '@odoro-cli/engine'
import {
  useEffect,
  useState,
  type CSSProperties,
  type ElementType,
  type ReactElement,
} from 'react'

import { useInView } from '@registre/hooks/useInView'

/** Properties specific to the component. */
export interface RotatingWordsOwnProps {
  /** The words that follow one another. The first is the one that is read. */
  words: readonly string[]
  /** Rendered tag. @defaultValue 'span' */
  as?: ElementType
  /** Time a word is shown, in milliseconds. @defaultValue 2200 */
  interval?: number
  /** Duration of the substitution, in milliseconds. @defaultValue 420 */
  duration?: number
  /**
   * Direction of the movement.
   *
   * @defaultValue 'up'
   */
  direction?: 'up' | 'down'
}

/** All properties. */
export type RotatingWordsProps = Customisable<RotatingWordsOwnProps, 'span'>

/** Identifier of the injected stylesheet. */
const STYLE_ID = 'o-rotating-words'

/** Sets the stack rules, once per document. */
function ensureRotatingRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    // The inline grid gives the width of the longest word, with no measuring.
    '[data-o-rotating]{display:inline-grid;vertical-align:bottom;overflow:hidden;text-align:left}',
    '[data-o-rotating]>*{grid-area:1/1}',
    '[data-o-rotating-stack]{display:inline-grid}',
    '[data-o-rotating-stack]>*{grid-area:1/1}',
    '[data-o-rotating-word]{',
    'opacity:0;',
    'transform:translateY(var(--o-rotating-enter));',
    'transition:opacity var(--o-rotating-duration) ease,transform var(--o-rotating-duration) cubic-bezier(0.22,1,0.36,1);',
    '}',
    '[data-o-rotating-word][data-active]{opacity:1;transform:translateY(0)}',
    // The word that has just left goes away in the direction of the movement,
    // rather than retracing its steps: without that, the entering and the
    // leaving words cross each other.
    '[data-o-rotating-word][data-leaving]{opacity:0;transform:translateY(var(--o-rotating-exit))}',
    '[data-o-rotating-hidden]{color:transparent}',
    '@media (prefers-reduced-motion:reduce){[data-o-rotating-word]{transition:none}}',
  ].join('')
  document.head.append(style)
}

/**
 * Rotates a word inside a fixed sentence.
 *
 * @example
 * <p className="o-text-4xl">
 *   Build more{' '}
 *   <RotatingWords words={['quickly', 'safely', 'together']} className="o-text-brand-600" />
 * </p>
 *
 * @example
 * // Downwards, and more slowly.
 * <RotatingWords words={['yesterday', 'today', 'tomorrow']} direction="down" interval={3200} />
 */
export function RotatingWords({
  words,
  as: Tag = 'span',
  interval = 2200,
  duration = 420,
  direction = 'up',
  ...rest
}: RotatingWordsProps): ReactElement {
  const { reduced } = useMotionState()
  const { ref: viewRef, inView } = useInView<HTMLElement>({ once: false })
  const [index, setIndex] = useState(0)
  const [previous, setPrevious] = useState<number | undefined>(undefined)

  ensureRotatingRule()

  useEffect(() => {
    // Under reduced motion, the first word stays. The sentence keeps its
    // meaning, and that is all the rotation brought.
    if (reduced || !inView || words.length < 2) return

    const timer = setInterval(
      () => {
        setIndex((current) => {
          setPrevious(current)
          return (current + 1) % words.length
        })
      },
      Math.max(duration, interval),
    )

    return () => {
      clearInterval(timer)
    }
  }, [inView, reduced, words.length, interval, duration])

  const { className, style } = mergePresentation({}, rest)

  // The direction decides where the entering word comes from and where the
  // leaving one goes. Both go the same way: that is what gives the impression
  // of a roller.
  const entry = direction === 'up' ? '0.9em' : '-0.9em'
  const exit = direction === 'up' ? '-0.9em' : '0.9em'

  const rotationStyle = {
    ...style,
    '--o-rotating-duration': `${String(duration)}ms`,
    '--o-rotating-enter': entry,
    '--o-rotating-exit': exit,
  } as CSSProperties

  const animating = !reduced && words.length > 1
  const spoken = words[0] ?? ''

  return (
    <Tag
      {...rest}
      ref={viewRef}
      className={className}
      style={rotationStyle}
      data-o-rotating=""
    >
      {/* The word that is read, in the flow: it is the one announced and
          copied. */}
      <span {...(animating ? { 'data-o-rotating-hidden': '' } : {})}>{spoken}</span>

      {animating && (
        <span aria-hidden="true" data-o-rotating-stack="">
          {words.map((word, i) => (
            <span
              key={word}
              data-o-rotating-word=""
              {...(i === index ? { 'data-active': '' } : {})}
              {...(i === previous && i !== index ? { 'data-leaving': '' } : {})}
            >
              {word}
            </span>
          ))}
        </span>
      )}
    </Tag>
  )
}

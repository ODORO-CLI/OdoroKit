/**
 * Typewriter: sentences typed then erased, on a loop.
 *
 * ## Why a timer rather than the loop
 *
 * The typing advances by one character every fifty milliseconds. On a
 * sixty-frames-per-second screen, that is one change every three frames; on a
 * hundred-and-twenty one, one every six. The refresh rate of the display
 * therefore has no influence on the result, and subscribing to the loop would
 * amount to waking it fifty-nine times out of sixty to do nothing.
 *
 * It is the counter-proof of the engine criterion: this effect does not own
 * the frame, it owns a clock.
 *
 * ## The reserved space
 *
 * The line changes length on every character. Without precaution, whatever
 * follows shifts constantly — and if the typewriter is inside a heading, it is
 * the whole page that breathes. The longest sentence is therefore rendered as
 * a reserve, invisible and with no height, to fix the width.
 *
 * @module
 */

import { mergePresentation, useMotionState, type Customisable } from '@odoro-cli/engine'
import { useEffect, useRef, useState, type ReactElement } from 'react'

/** Properties specific to the component. */
export interface TypewriterOwnProps {
  /** Sentences played on a loop. */
  phrases: readonly string[]
  /** Delay between two typed characters, in milliseconds. @defaultValue 55 */
  typeSpeed?: number
  /** Delay between two erased characters, in milliseconds. @defaultValue 28 */
  deleteSpeed?: number
  /** Wait once the sentence is complete, in milliseconds. @defaultValue 1400 */
  hold?: number
  /** Character of the caret. Empty string to remove it. @defaultValue '|' */
  cursor?: string
}

/** All properties. */
export type TypewriterProps = Customisable<TypewriterOwnProps, 'span'>

/**
 * Types a series of sentences, on a loop.
 *
 * @example
 * <Typewriter
 *   phrases={['living interfaces', 'with no external dependency']}
 *   className="o-text-brand-500"
 * />
 */
export function Typewriter({
  phrases,
  typeSpeed = 55,
  deleteSpeed = 28,
  hold = 1400,
  cursor = '|',
  ...rest
}: TypewriterProps): ReactElement {
  const { reduced } = useMotionState()
  const [index, setIndex] = useState(0)
  const [length, setLength] = useState(0)
  const [erasing, setErasing] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  const phrase = phrases[index % Math.max(phrases.length, 1)] ?? ''
  const longest = phrases.reduce(
    (best, item) => (item.length > best.length ? item : best),
    '',
  )

  useEffect(() => {
    if (reduced || phrases.length === 0) return

    const step = (): void => {
      if (!erasing) {
        if (length < phrase.length) {
          setLength(length + 1)
          return
        }
        // A single sentence: erasing it to retype it identically would be
        // movement for nothing.
        if (phrases.length > 1) setErasing(true)
        return
      }

      if (length > 0) {
        setLength(length - 1)
        return
      }
      setErasing(false)
      setIndex(index + 1)
    }

    const delay = erasing ? deleteSpeed : length === phrase.length ? hold : typeSpeed

    timer.current = setTimeout(step, delay)
    return () => clearTimeout(timer.current)
  }, [reduced, phrases, phrase, length, erasing, index, typeSpeed, deleteSpeed, hold])

  const { className, style } = mergePresentation(
    { className: 'o-relative o-inline-grid' },
    rest,
  )

  // Under reduced motion, the first sentence is simply there.
  const shown = reduced ? (phrases[0] ?? '') : phrase.slice(0, length)

  return (
    <span {...rest} className={className} style={style}>
      {/*
        Width reserve: the longest sentence occupies the same grid cell,
        invisible. Without it, the line shifts on every character.
      */}
      <span aria-hidden className="o-invisible o-col-start-1 o-row-start-1">
        {longest}
        {cursor}
      </span>

      <span className="o-col-start-1 o-row-start-1" aria-live="polite">
        {shown}
        {cursor === '' || reduced ? null : (
          <span aria-hidden className="o-animate-caret-blink">
            {cursor}
          </span>
        )}
      </span>
    </span>
  )
}

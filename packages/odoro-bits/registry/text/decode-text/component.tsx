/**
 * Decoding: the text settles out of a scramble.
 *
 * ## The text stays readable throughout the effect
 *
 * A scramble replaces the displayed characters with random symbols. Rendered
 * as it is, that is noise: a screen reader announces strings of signs, and an
 * in-page search finds nothing for the whole duration of the animation.
 *
 * The real text is therefore carried by the element, as an `aria-label`, and
 * the scramble exists only in what is painted. The effect then costs nothing
 * to anybody but the eye.
 *
 * ## Why the engine loop
 *
 * The scramble must change at the rate of the screen, otherwise it stutters. A
 * timer at a fixed interval would give a rhythm different from the refresh and
 * would produce a visible beat. It is the textbook case of an effect that owns
 * the frame.
 *
 * @module
 */

import {
  CLOCK_PRIORITY,
  clock,
  mergePresentation,
  useMotionState,
  useOnReady,
  type Customisable,
  type ReadyCallback,
} from '@odoro-cli/engine'
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ElementType,
  type ReactElement,
} from 'react'

/** What the escape hatch receives. */
export interface DecodeControls {
  /** Replays the sequence from the start. */
  replay(): void
}

/** What triggers the sequence. */
export type DecodeTrigger = 'mount' | 'view' | 'hover'

/** Properties specific to the component. */
export interface DecodeTextOwnProps {
  /** Text to decode. */
  children: string
  /** Rendered tag. @defaultValue 'span' */
  as?: ElementType
  /** Total duration of the settling, in milliseconds. @defaultValue 1200 */
  duration?: number
  /** Characters used for the scramble. */
  alphabet?: string
  /** What triggers the sequence. @defaultValue 'view' */
  trigger?: DecodeTrigger
  /** Escape hatch. */
  onReady?: ReadyCallback<DecodeControls>
}

/** All properties. */
export type DecodeTextProps = Customisable<DecodeTextOwnProps, 'span'>

/**
 * Default alphabet.
 *
 * Deliberately without accented letters or wide signs: a character wider than
 * the one it replaces would make the line breathe on every frame, and the text
 * would shiver instead of settling.
 */
const DEFAULT_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&@$?!/\\|<>*+='

/**
 * Reveals a text by decoding it.
 *
 * @example
 * <DecodeText as="h2" className="o-text-4xl o-font-bold">
 *   Odoro
 * </DecodeText>
 *
 * @example
 * // Level 5: replaying the sequence from the outside.
 * const replay = useRef<(() => void) | null>(null)
 * <DecodeText onReady={({ handle }) => { replay.current = handle.replay }}>
 *   Odoro
 * </DecodeText>
 */
export function DecodeText({
  children,
  as: Tag = 'span',
  duration = 1200,
  alphabet = DEFAULT_ALPHABET,
  trigger = 'view',
  onReady,
  ...rest
}: DecodeTextProps): ReactElement {
  const { reduced } = useMotionState()
  const [host, setHost] = useState<HTMLElement | null>(null)
  const output = useRef<HTMLSpanElement | null>(null)

  const run = useCallback(() => {
    const target = output.current
    if (target === null) return

    // Under reduced motion, the text is simply there. The animation is
    // neutralised, never the final state.
    if (reduced) {
      target.textContent = children
      return
    }

    const started = performance.now()
    const letters = [...children]

    const subscription = clock.subscribe(
      () => {
        const ratio = Math.min(1, (performance.now() - started) / duration)
        // Each letter settles in turn, from the first to the last: the
        // progress advances through the word, it does not settle it in one
        // block.
        const settled = ratio * letters.length

        target.textContent = letters
          .map((letter, index) => {
            if (index < settled) return letter
            if (letter === ' ') return ' '
            return alphabet[Math.floor(Math.random() * alphabet.length)] ?? letter
          })
          .join('')

        if (ratio >= 1) subscription.unsubscribe()
      },
      { name: 'text decoding', priority: CLOCK_PRIORITY.default },
    )

    return () => subscription.unsubscribe()
  }, [children, duration, alphabet, reduced])

  useEffect(() => {
    if (host === null) return

    if (trigger === 'mount') return run()

    if (trigger === 'view') {
      const observer = new IntersectionObserver(
        (entries) => {
          if (entries.some((entry) => entry.isIntersecting)) {
            run()
            observer.disconnect()
          }
        },
        { threshold: 0.4 },
      )
      observer.observe(host)
      return () => observer.disconnect()
    }

    const onEnter = (): void => void run()
    host.addEventListener('pointerenter', onEnter)
    return () => host.removeEventListener('pointerenter', onEnter)
  }, [host, trigger, run])

  // The handle is stable: `useOnReady` depends only on it and on the element,
  // and a new object on every render would replay the escape hatch endlessly.
  // It reads `run` through a ref so as to stay correct after a change of
  // setting.
  const runRef = useRef(run)
  runRef.current = run
  const controls = useRef<DecodeControls>({ replay: () => void runRef.current() })
  useOnReady(onReady, controls.current, host)

  const { className, style } = mergePresentation({}, rest)

  return (
    <Tag
      {...rest}
      ref={setHost}
      className={className}
      style={style}
      // The scramble exists for the eye only: the real text stays announced,
      // searchable and copyable.
      aria-label={children}
    >
      <span ref={output} aria-hidden>
        {children}
      </span>
    </Tag>
  )
}

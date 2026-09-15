/**
 * A curtain whose word assembles letter by letter, then folds down like a
 * lid.
 *
 * ## The word is the wait
 *
 * The other curtains fill the time with a shape or with a bar. This one
 * fills it with a **word**: each character arrives in turn, and the length
 * of the curtain reads in the name being built. It is the only one of the
 * set where the object watched during the wait is the content itself, not a
 * decoration set in front of it.
 *
 * That has a design consequence: the length of the word **is** a duration
 * setting. A five-letter name and a twelve-letter one do not hold the screen
 * for the same time, and it is meant that way — better an entrance that fits
 * the brand than a fixed duration the brand was forced into.
 *
 * ## The engine clock, not a `setInterval`
 *
 * The letters advance on the engine's single loop. An interval beats against
 * the screen's cadence: the characters would arrive at moments that do not
 * fall on frames, and one in three would look a frame late. And two
 * competing loops in one page render in an undefined order, which is the
 * very fault the single clock exists to prevent.
 *
 * Nothing is written to React state: the loop sets an attribute on the
 * character that has just arrived, that is to say one write per letter, and
 * not a render per frame.
 *
 * ## The real text, and what screen readers hear
 *
 * The characters are separate elements, which is necessary to animate them
 * one by one — and unreadable for a screen reader, which would spell them
 * out. The word is therefore also present in one piece in the status region,
 * off screen, and the split version is marked as decorative. The text is
 * indeed in the document, once for the eye, once for the ear.
 *
 * ## The exit: a lid, not a translation
 *
 * The plate tips around its top edge and folds backwards, in perspective.
 * The letters, for their part, leave upwards in staggered order, slightly
 * before the plate: they quit the stage through the very place the plate is
 * about to open, which gives a single movement instead of two.
 *
 * ## The exit starts at the BEGINNING, not after
 *
 * `onDone` is called when the plate **starts** to tip. The content enters
 * while the lid opens; waiting for the end would give a curtain, a dead
 * beat, then a page.
 *
 * ## Contained or full screen
 *
 * By default the curtain is `fixed`, covers the window and locks the
 * document's scrolling. With `contained`, it becomes `absolute`, resolves
 * against the first positioned ancestor and no longer touches scrolling.
 *
 * @module
 */

import {
  clock,
  mergePresentation,
  useMotionState,
  type Customisable,
} from '@odoro-cli/engine'
import { useEffect, useRef, useState, type CSSProperties, type ReactElement } from 'react'

/** Props specific to the component. */
export interface LettersGateOwnProps {
  /** The plate background. @defaultValue the theme background */
  background?: string
  /** The ink of the word. @defaultValue the theme ink */
  ink?: string
  /** The word that assembles. @defaultValue 'ODORO' */
  word?: string
  /**
   * What screen readers announce before the word. Empty string to announce
   * the word only.
   *
   * @defaultValue 'Loading'
   */
  status?: string
  /** Time between two characters, in milliseconds. @defaultValue 130 */
  letterMs?: number
  /** Pause after the last character, in milliseconds. @defaultValue 650 */
  holdMs?: number
  /** Duration of the fold-down, in milliseconds. @defaultValue 900 */
  exitMs?: number
  /**
   * Controlled state: the curtain waits as long as this is `true`, even with
   * the word assembled, and exits on the first `false`. When set, it
   * replaces `holdMs`.
   */
  open?: boolean
  /** Covers the positioned parent rather than the window. @defaultValue false */
  contained?: boolean
  /** Called at the **start** of the exit. See the module header. */
  onDone?: () => void
}

/** All props. */
export type LettersGateProps = Customisable<LettersGateOwnProps, 'div'>

/** Id of the injected stylesheet. */
const STYLE_ID = 'o-letters-gate'

/** Offset between two letters on the way out, in milliseconds. */
const EXIT_STAGGER = 45

/** Sets the rules of the word and of the lid, once per document. */
function ensureLettersGateRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    // The perspective lives on the stage: it is what makes the fold-down a
    // rotation in space rather than a flattening.
    '[data-o-letg]{',
    'position:fixed;inset:0;z-index:9999;overflow:hidden;',
    'perspective:1600px;color:var(--o-letg-ink);',
    '}',
    '[data-o-letg][data-o-letg-contained]{position:absolute}',
    '[data-o-letg][data-o-letg-out]{pointer-events:none}',
    '[data-o-letg-plate]{',
    'position:absolute;inset:0;',
    'display:flex;align-items:center;justify-content:center;',
    'transform-origin:50% 0%;transform:rotateX(0deg);',
    'transition:transform var(--o-letg-exit) cubic-bezier(0.6,0,0.3,1);',
    '}',
    '[data-o-letg-out] [data-o-letg-plate]{transform:rotateX(-104deg)}',
    '[data-o-letg-face]{position:absolute;inset:0;background:var(--o-letg-bg)}',
    '[data-o-letg-word]{',
    'position:relative;display:inline-flex;',
    'font-size:clamp(1.6rem,6vw,3.2rem);font-weight:600;letter-spacing:0.02em;line-height:1;',
    '}',
    '[data-o-letg-ch]{',
    'display:inline-block;white-space:pre;',
    'opacity:0;transform:translateY(0.42em);',
    'transition:opacity 260ms ease,transform 260ms cubic-bezier(0.2,0,0,1);',
    '}',
    '[data-o-letg-ch][data-o-letg-on]{opacity:1;transform:none}',
    // On the way out, the letters rise in staggered order: they quit the
    // stage through the very place the lid is about to open.
    '[data-o-letg-out] [data-o-letg-ch]{',
    'opacity:0;transform:translateY(-0.5em);',
    'transition:opacity 220ms ease var(--o-letg-d),',
    'transform 320ms cubic-bezier(0.6,0,0.8,0) var(--o-letg-d);',
    '}',
  ].join('')
  document.head.append(style)
}

/**
 * Assembles a word, then folds down the plate that carried it.
 *
 * @example
 * <LettersGate word="ODORO" onDone={reveal} />
 *
 * @example
 * // Controlled: the word stays on screen until the scene is drawn.
 * <LettersGate word="ATELIER" open={!sceneDrawn} onDone={reveal} />
 */
export function LettersGate({
  background = 'var(--o-theme-bg)',
  ink = 'var(--o-theme-fg)',
  word = 'ODORO',
  status = 'Loading',
  letterMs = 130,
  holdMs = 650,
  exitMs = 900,
  open,
  contained = false,
  onDone,
  ...rest
}: LettersGateProps): ReactElement | null {
  const { reduced } = useMotionState()
  const [exiting, setExiting] = useState(false)
  const [gone, setGone] = useState(false)
  const characters = useRef<(HTMLSpanElement | null)[]>([])

  // In a ref: the exit is announced only once, and one more render must not
  // replay the callback.
  const announced = useRef(false)
  const callback = useRef(onDone)
  callback.current = onDone

  // `open` lives in a ref because the loop reads it on every frame. Making
  // it a dependency of the effect would restart the assembly of the word
  // every time the caller changes its mind.
  const opened = useRef(open)
  opened.current = open

  ensureLettersGateRule()

  const letters = [...word]
  const letterCount = letters.length

  useEffect(() => {
    const announce = (): void => {
      if (announced.current) return
      announced.current = true
      callback.current?.()
    }

    // Reduced motion: the exit is immediate. A word that assembles is
    // exactly the movement the preference asks to omit, and the curtain
    // brought nothing but that.
    if (reduced) {
      announce()
      setGone(true)
      return
    }

    const total = letterCount
    let elapsed = 0
    let placed = 0

    const subscription = clock.subscribe(
      ({ delta }) => {
        elapsed += delta * 1000

        // One write per letter, not one per frame: we only enter the write
        // loop once the count has changed.
        const expected = Math.min(total, Math.floor(elapsed / Math.max(1, letterMs)))
        while (placed < expected) {
          characters.current[placed]?.setAttribute('data-o-letg-on', '')
          placed += 1
        }

        if (placed < total) return

        // The word is assembled. Without `open`, the pause decides; with it,
        // the caller does, and the word stays on screen as long as needed.
        const finished =
          opened.current === undefined
            ? elapsed >= total * letterMs + holdMs
            : opened.current === false

        if (!finished) return

        subscription.unsubscribe()
        setExiting(true)
        announce()
      },
      { name: 'letters-gate' },
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [reduced, letterMs, holdMs, letterCount])

  // A timer rather than `transitionend`: the letters leave in staggered
  // order, and the first event arrives when the plate has not moved.
  useEffect(() => {
    if (!exiting) return

    const timer = window.setTimeout(
      () => {
        setGone(true)
      },
      exitMs + letterCount * EXIT_STAGGER + 40,
    )

    return () => {
      window.clearTimeout(timer)
    }
  }, [exiting, exitMs, letterCount])

  // The scroll lock, only when the curtain covers the window.
  useEffect(() => {
    if (contained || gone || reduced) return

    // A COUNTED lock, not a remembered one. Two curtains can overlap — hot
    // reload, navigation, concurrent rendering — and the second would then
    // remember the value set by the first, "hidden", to restore it on the
    // way out: the page would stay stuck with no error and no trace.
    const root = document.documentElement
    const locks = Number(root.dataset['oGateLocks'] ?? '0')
    if (locks === 0) root.dataset['oGatePrevious'] = root.style.overflow
    root.dataset['oGateLocks'] = String(locks + 1)
    root.style.overflow = 'hidden'

    let released = false
    const release = (): void => {
      if (released) return
      released = true
      const remaining = Number(root.dataset['oGateLocks'] ?? '1') - 1
      if (remaining > 0) {
        root.dataset['oGateLocks'] = String(remaining)
        return
      }
      root.style.overflow = root.dataset['oGatePrevious'] ?? ''
      delete root.dataset['oGateLocks']
      delete root.dataset['oGatePrevious']
    }

    // The guardrail. Longer than the ceiling of any curtain, so invisible in
    // normal operation: it exists only so that a delay can never leave the
    // page without scrolling.
    const safety = window.setTimeout(release, 8000)

    return () => {
      window.clearTimeout(safety)
      release()
    }
  }, [contained, gone, reduced])

  if (gone) return null

  const { className, style } = mergePresentation({}, rest)

  const sceneStyle = {
    ...style,
    '--o-letg-bg': background,
    '--o-letg-ink': ink,
    '--o-letg-exit': `${String(exitMs)}ms`,
  } as CSSProperties

  return (
    <div
      {...rest}
      className={className}
      style={sceneStyle}
      data-o-letg=""
      {...(exiting ? { 'data-o-letg-out': '' } : {})}
      {...(contained ? { 'data-o-letg-contained': '' } : {})}
    >
      <div data-o-letg-plate="">
        {/* The background is decoration: it must not be read. */}
        <div data-o-letg-face="" aria-hidden="true" />

        <div role="status">
          <span className="o-sr-only">
            {status.length > 0 ? `${status} ${word}` : word}
          </span>

          {/* The split word is decorative: read as is, it would be spelled out. */}
          <span data-o-letg-word="" aria-hidden="true">
            {letters.map((character, index) => (
              <span
                key={index}
                ref={(node) => {
                  characters.current[index] = node
                }}
                data-o-letg-ch=""
                style={
                  { '--o-letg-d': `${String(index * EXIT_STAGGER)}ms` } as CSSProperties
                }
              >
                {character}
              </span>
            ))}
          </span>
        </div>
      </div>
    </div>
  )
}

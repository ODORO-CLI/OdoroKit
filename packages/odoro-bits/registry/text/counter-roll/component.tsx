/**
 * Odometer: each digit is a column that rolls to its position.
 *
 * ## Rolling, not interpolating
 *
 * The `count-up` counter crosses the intermediate values — it interpolates the
 * number. The odometer, on the other hand, computes nothing: each column is a
 * stack from 0 to 9, and reaching the target digit is a single CSS
 * translation, with a delay that grows from the right as on a mechanical
 * counter. The browser composites everything; no JavaScript runs during the
 * animation.
 *
 * ## One value, not ten digits
 *
 * Stacks of digits truncated by an `overflow` are unreadable to a screen
 * reader — it would find ten digits per column there. They are therefore
 * `aria-hidden`, and the final value, formatted, lives in a visually hidden
 * element, announced politely when it changes.
 *
 * ## Formatting goes through `Intl`
 *
 * Separating thousands by hand gives "1,234" to a French reader, who reads a
 * decimal number in it. `Intl.NumberFormat` knows the convention of each
 * language.
 *
 * @module
 */

import { mergePresentation, useMotionState, type Customisable } from '@odoro-cli/engine'
import { useMemo, type CSSProperties, type ElementType, type ReactElement } from 'react'

import { useInView } from '@registre/hooks/useInView'

/** Properties specific to the component. */
export interface CounterRollOwnProps {
  /** Displayed value. */
  value: number
  /** Rendered tag. @defaultValue 'span' */
  as?: ElementType
  /** Duration of the roll of one column, in milliseconds. @defaultValue 900 */
  duration?: number
  /** Delay between two columns, from the right, in milliseconds. @defaultValue 80 */
  step?: number
  /**
   * Formatting language.
   *
   * By default, the browser's — and not a hard-coded `fr-FR`: a counter that
   * shows no-break spaces to an English reader looks broken.
   */
  locale?: string
}

/** All properties. */
export type CounterRollProps = Customisable<CounterRollOwnProps, 'span'>

/** Identifier of the injected stylesheet. */
const STYLE_ID = 'o-counter-roll'

/** The complete stack, the one each column scrolls through. */
const DIGITS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'] as const

/**
 * Sets the column rules, once per document.
 *
 * The height of a slot is exactly `1em`, and the stack moves in `em`: the
 * odometer follows the font size without a single measurement.
 */
function ensureCounterRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-roll]{font-variant-numeric:tabular-nums}',
    '[data-o-roll-col]{',
    'display:inline-block;overflow:hidden;height:1em;line-height:1;',
    'vertical-align:-0.15em;',
    '}',
    '[data-o-roll-col] span{display:block;height:1em;line-height:1}',
    '[data-o-roll-sep]{display:inline-block;line-height:1;vertical-align:-0.15em}',
  ].join('')
  document.head.append(style)
}

/**
 * Displays a number as columns of digits that roll to their position.
 *
 * @example
 * <CounterRoll value={12480} className="o-text-4xl o-font-extrabold" />
 *
 * @example
 * // Slower roll, columns further apart.
 * <CounterRoll value={2026} duration={1400} step={140} />
 */
export function CounterRoll({
  value,
  as: Tag = 'span',
  duration = 900,
  step = 80,
  locale,
  ...rest
}: CounterRollProps): ReactElement {
  const { reduced } = useMotionState()
  const { ref, inView } = useInView<HTMLElement>()
  ensureCounterRule()

  const formatter = useMemo(() => new Intl.NumberFormat(locale), [locale])
  const final = formatter.format(value)

  const { className, style } = mergePresentation({}, rest)

  // Reduced motion: the value is there, formatted, without a single stack.
  if (reduced) {
    return (
      <Tag {...rest} className={className} style={style}>
        {final}
      </Tag>
    )
  }

  const chars = [...final]
  const digitCount = chars.filter((char) => char >= '0' && char <= '9').length
  let digitIndex = 0

  return (
    <Tag {...rest} ref={ref} className={className} style={style} data-o-roll="">
      {/* The final value, announced politely when it changes. */}
      <span className="o-sr-only" aria-live="polite">
        {final}
      </span>
      <span aria-hidden>
        {chars.map((char, index) => {
          if (char < '0' || char > '9') {
            return (
              <span key={`sep-${String(index)}`} data-o-roll-sep="">
                {char}
              </span>
            )
          }

          // The delay grows from the right: the units column leaves first, as
          // on a mechanical counter.
          const delay = (digitCount - 1 - digitIndex) * step
          digitIndex += 1

          return (
            <span key={`col-${String(index)}`} data-o-roll-col="">
              <span
                style={
                  {
                    transform: `translateY(${String(inView ? -Number(char) : 0)}em)`,
                    transition: `transform ${String(duration)}ms cubic-bezier(0.2, 0, 0, 1) ${String(delay)}ms`,
                  } as CSSProperties
                }
              >
                {DIGITS.map((digit) => (
                  <span key={digit}>{digit}</span>
                ))}
              </span>
            </span>
          )
        })}
      </span>
    </Tag>
  )
}

/**
 * Card form, with a preview that flips over.
 *
 * ## To read before wiring it to a real payment
 *
 * This component renders ordinary fields. The numbers typed in therefore pass
 * through the document and through the page's JavaScript, and that has a
 * consequence which is invisible in the code: **the application enters the
 * full PCI-DSS scope**. A form hosted by the payment provider — a field inside
 * an iframe that hands back a token — leaves the application out of scope
 * instead, because card data never crosses it.
 *
 * The gap between the two is measured in audits, not in lines of code.
 *
 * So this component belongs in a preview, a mockup, a demonstration form, or
 * an entry handed straight over to a tokenisation client. It has no place as
 * the entry point of a real charge. `onSubmit` returns the state and its
 * validity; it sends nothing, and that is deliberate.
 *
 * ## Validation refuses what is wrong, not what is unfinished
 *
 * The original implementation announced a Luhn check in its comments and did
 * none: it merely counted thirteen digits. Yet Luhn is what tells a typo from
 * a plausible number, and that is the whole point of a client-side check — to
 * flag the slip before the network round trip. It is here, and it is short.
 *
 * ## What the flip does not do
 *
 * It hides nothing. The back face is masked by `backface-visibility`, which
 * removes it from painting but **not** from the document: its content stays
 * readable by a screen reader and reachable from the keyboard. That is why the
 * whole preview is `aria-hidden` — the form fields already carry the
 * information, and announcing it twice helps nobody.
 *
 * @module
 */

import { mergePresentation, type Customisable } from '@odoro-cli/engine'
import { useId, useMemo, useState, type FormEvent, type ReactElement } from 'react'

/** What the form holds. */
export interface CardFormState {
  /** Digits of the number, without spaces. */
  readonly number: string
  /** Name of the holder, in upper case. */
  readonly holder: string
  /** Expiry month, from `01` to `12`. */
  readonly month: string
  /** Expiry year, on four digits. */
  readonly year: string
  /** Verification code, three or four digits. */
  readonly cvv: string
}

/** What validation says about each field. */
export interface CardFormValidity {
  /** Plausible length **and** correct Luhn sum. */
  readonly number: boolean
  readonly holder: boolean
  readonly expiry: boolean
  readonly cvv: boolean
  /** True if all four are. */
  readonly all: boolean
}

/** Properties specific to the component. */
export interface CardFormOwnProps {
  /** Starting values. */
  defaultValue?: Partial<CardFormState>
  /** Masks the middle digits on the preview. @defaultValue true */
  maskMiddle?: boolean
  /** Shows the submit button. @defaultValue true */
  showSubmit?: boolean
  /** Label of the submit button. */
  submitLabel?: string
  /** Tokens of the card's two halos. */
  colors?: readonly [string, string]
  /** Called on every keystroke. */
  onValueChange?: (state: CardFormState, validity: CardFormValidity) => void
  /** Called on submit. Transmits nothing: that is the application's job. */
  onSubmit?: (state: CardFormState, validity: CardFormValidity) => void
}

/** All properties. */
export type CardFormProps = Customisable<CardFormOwnProps, 'section'>

/** Tokens used by default. */
const DEFAULT_TOKENS = ['--o-palette-fuchsia-500', '--o-palette-brand-500'] as const

/** Identifier of the injected stylesheet. */
const STYLE_ID = 'o-card-form'

/** Number of slots shown on the preview. */
const SLOTS = 16

/**
 * Luhn sum.
 *
 * ## The principle
 *
 * Starting from the right, every other digit is doubled; if the double goes
 * past nine, nine is taken off it — which amounts to adding its two digits
 * together. The sum of all the digits so obtained must be a multiple of ten.
 *
 * The check catches any single-digit error and nearly every transposition of
 * two neighbouring digits, that is, the two real typing mistakes. It says
 * nothing about whether the account exists: that is not its job, and no local
 * check can do it.
 *
 * @param digits Digits of the number, without spaces.
 *
 * @example
 * luhn('4242424242424242') // true
 */
export function luhn(digits: string): boolean {
  if (!/^\d+$/.test(digits)) return false

  let sum = 0
  let double = false

  for (let index = digits.length - 1; index >= 0; index -= 1) {
    let value = digits.charCodeAt(index) - 48
    if (double) {
      value *= 2
      if (value > 9) value -= 9
    }
    sum += value
    double = !double
  }

  return sum % 10 === 0
}

/** Keeps only the digits, and caps the length. */
function digitsOf(value: string, max: number): string {
  return value.replace(/\D/g, '').slice(0, max)
}

/** Groups the number by four, for typing. */
function grouped(digits: string): string {
  return digits.replace(/(\d{4})(?=\d)/g, '$1 ')
}

/** Applies the form rules, once per document. */
function ensureCardRules(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-card]{position:relative;transform-style:preserve-3d;',
    'transition:transform var(--o-duration-slowest) var(--o-ease-standard)}',
    '[data-o-card="back"]{transform:rotateY(180deg)}',

    '[data-o-card-face]{backface-visibility:hidden;-webkit-backface-visibility:hidden;',
    'position:relative;overflow:hidden}',
    '[data-o-card-face="back"]{position:absolute;inset:0;transform:rotateY(180deg)}',

    // The two halos, blurred, that give the card its depth.
    '[data-o-card-face]::before,[data-o-card-face]::after{content:"";position:absolute;',
    'border-radius:100%;height:300px;width:300px;filter:blur(13px);pointer-events:none}',
    '[data-o-card-face]::before{border:16px solid var(--o-card-ring-a);left:-17%;top:-45px}',
    '[data-o-card-face]::after{border:16px solid var(--o-card-ring-b);left:-200px;top:55%}',

    // Each slot of the number holds two lines; it slides by one height to
    // reveal the digit. That is what makes the digit feel as if it falls into
    // place instead of appearing.
    '[data-o-card-slot]{display:inline-flex;height:2rem;overflow:hidden}',
    '[data-o-card-slot]>span{display:flex;flex-direction:column;height:2rem;',
    'line-height:2rem;transition:transform var(--o-duration-base) var(--o-ease-standard)}',
    '[data-o-card-slot="filled"]>span{transform:translateY(-2rem)}',
    '[data-o-card-slot]>span>span{height:2rem;display:block}',

    '@media (prefers-reduced-motion:reduce){',
    '[data-o-card],[data-o-card-slot]>span{transition:none}}',
  ].join('')
  document.head.append(style)
}

/**
 * Card form with a preview.
 *
 * @example
 * <CardForm onSubmit={(state, validity) => tokenise(state)} />
 *
 * @example
 * // Without a button: the submit is carried by the surrounding form.
 * <CardForm showSubmit={false} onValueChange={setState} />
 */
export function CardForm({
  defaultValue,
  maskMiddle = true,
  showSubmit = true,
  submitLabel = 'Confirm',
  colors = DEFAULT_TOKENS,
  onValueChange,
  onSubmit,
  ...rest
}: CardFormProps): ReactElement {
  const ids = useId()
  const [state, setState] = useState<CardFormState>(() => ({
    number: digitsOf(defaultValue?.number ?? '', 19),
    holder: (defaultValue?.holder ?? '').toUpperCase(),
    month: defaultValue?.month ?? '',
    year: defaultValue?.year ?? '',
    cvv: digitsOf(defaultValue?.cvv ?? '', 4),
  }))
  const [focused, setFocused] = useState<'cvv' | 'other' | null>(null)

  ensureCardRules()

  const years = useMemo(() => {
    const first = new Date().getFullYear()
    return Array.from({ length: 10 }, (_, index) => String(first + index))
  }, [])

  const validity = useMemo<CardFormValidity>(() => {
    const number = state.number.length >= 13 && luhn(state.number)
    const holder = state.holder.trim().length >= 2

    // The expiry is judged as a whole: a month without a year means nothing,
    // and a past month of the current year is expired while each field, taken
    // on its own, looks correct.
    const now = new Date()
    const month = Number(state.month)
    const year = Number(state.year)
    const expiry =
      month >= 1 &&
      month <= 12 &&
      year >= now.getFullYear() &&
      (year > now.getFullYear() || month >= now.getMonth() + 1)

    const cvv = /^\d{3,4}$/.test(state.cvv)

    return { number, holder, expiry, cvv, all: number && holder && expiry && cvv }
  }, [state])

  /** Writes a field, and tells the caller. */
  const write = (patch: Partial<CardFormState>): void => {
    const next = { ...state, ...patch }
    setState(next)
    // Validity is recomputed on the next render; the caller receives the one
    // from the current render, which is enough for a preview and avoids
    // duplicating it.
    onValueChange?.(next, validity)
  }

  const submit = (event: FormEvent): void => {
    event.preventDefault()
    onSubmit?.(state, validity)
  }

  // The preview slots: sixteen of them, filled from the left.
  const slots = Array.from({ length: SLOTS }, (_, index) => {
    const digit = state.number[index]
    if (digit === undefined) return { text: '#', filled: false }
    const hidden = maskMiddle && index >= 4 && index <= 11
    return { text: hidden ? '•' : digit, filled: true }
  })

  const { className, style } = mergePresentation(
    { className: 'o-grid o-gap-6 md:o-grid-cols-2' },
    rest,
  )

  return (
    <section {...rest} className={className} style={style}>
      {/* The preview is decorative: the fields already carry the information,
          and the back face stays in the document despite the flip. */}
      <div
        aria-hidden
        className="o-mx-auto o-w-full o-max-w-md"
        style={{ perspective: 1000 }}
      >
        <div
          data-o-card={focused === 'cvv' ? 'back' : 'front'}
          style={
            {
              ['--o-card-ring-a' as string]: `var(${colors[0]})`,
              ['--o-card-ring-b' as string]: `var(${colors[1]})`,
            } as Record<string, string>
          }
        >
          <div
            data-o-card-face="front"
            className="o-flex o-h-56 o-flex-col o-justify-between o-rounded-2xl o-bg-gradient-to-br o-from-zinc-700 o-to-zinc-950 o-p-6 o-text-zinc-50 o-shadow-xl"
          >
            <p className="o-relative o-font-semibold">Card</p>

            <p className="o-relative o-flex o-text-2xl">
              {slots.map((slot, index) => (
                <span
                  key={index}
                  data-o-card-slot={slot.filled ? 'filled' : 'empty'}
                  className={index % 4 === 3 ? 'o-mr-2' : ''}
                >
                  <span>
                    <span>#</span>
                    <span>{slot.text}</span>
                  </span>
                </span>
              ))}
            </p>

            <span className="o-relative o-flex o-items-end o-justify-between o-gap-4">
              <span className="o-flex o-flex-col">
                <span className="o-text-xs o-font-semibold o-uppercase o-text-zinc-500 dark:o-text-zinc-400">
                  Holder
                </span>
                <span className="o-uppercase">{state.holder || 'NAME ON CARD'}</span>
              </span>
              <span className="o-flex o-flex-col">
                <span className="o-text-xs o-font-semibold o-uppercase o-text-zinc-500 dark:o-text-zinc-400">
                  Expires
                </span>
                <span>
                  {state.month || 'MM'}/{state.year ? state.year.slice(-2) : 'YY'}
                </span>
              </span>
            </span>
          </div>

          <div
            data-o-card-face="back"
            className="o-flex o-h-56 o-flex-col o-rounded-2xl o-bg-gradient-to-br o-from-zinc-700 o-to-zinc-950 o-pt-6 o-text-zinc-50 o-shadow-xl"
          >
            <span className="o-relative o-h-10 o-w-full o-bg-zinc-800" />
            <span className="o-relative o-mt-6 o-flex o-flex-col o-items-end o-gap-1 o-px-8">
              <span className="o-text-xs o-font-semibold o-uppercase">Code</span>
              <span className="o-flex o-h-11 o-w-full o-items-center o-justify-end o-rounded-lg o-bg-zinc-50 o-px-3 o-text-2xl o-text-zinc-950">
                {'•'.repeat(state.cvv.length)}
              </span>
            </span>
          </div>
        </div>
      </div>

      <form
        onSubmit={submit}
        noValidate
        className="o-grid o-gap-3 o-rounded-xl o-border-w-1 o-border-zinc-200 o-p-6 dark:o-border-zinc-800"
      >
        <div>
          <label htmlFor={`${ids}-number`} className="o-mb-1 o-block o-font-medium">
            Card number
          </label>
          <input
            id={`${ids}-number`}
            inputMode="numeric"
            autoComplete="cc-number"
            placeholder="1234 5678 9012 3456"
            value={grouped(state.number)}
            onChange={(event) => write({ number: digitsOf(event.target.value, 19) })}
            onFocus={() => setFocused('other')}
            onBlur={() => setFocused(null)}
            aria-invalid={state.number.length >= 13 && !validity.number}
            aria-describedby={validity.number ? undefined : `${ids}-number-error`}
            className="o-h-12 o-w-full o-rounded-lg o-border-w-1 o-border-zinc-300 o-bg-transparent o-px-4 focus:o-border-zinc-500 focus:o-outline-none dark:o-border-zinc-700"
          />
          {/* The error only appears once the number is long enough: flagging it
              on the first keystroke would blame the user for not having
              finished typing. */}
          <p
            id={`${ids}-number-error`}
            className={
              state.number.length >= 13 && !validity.number
                ? 'o-mt-1 o-text-xs o-text-red-600 dark:o-text-red-400'
                : 'o-sr-only'
            }
          >
            {state.number.length >= 13 && !validity.number
              ? 'This number has a typing error.'
              : ''}
          </p>
        </div>

        <div>
          <label htmlFor={`${ids}-holder`} className="o-mb-1 o-block o-font-medium">
            Cardholder name
          </label>
          <input
            id={`${ids}-holder`}
            type="text"
            autoComplete="cc-name"
            placeholder="JANE MARTIN"
            value={state.holder}
            onChange={(event) => write({ holder: event.target.value.toUpperCase() })}
            onFocus={() => setFocused('other')}
            onBlur={() => setFocused(null)}
            aria-invalid={!validity.holder}
            className="o-h-12 o-w-full o-rounded-lg o-border-w-1 o-border-zinc-300 o-bg-transparent o-px-4 focus:o-border-zinc-500 focus:o-outline-none dark:o-border-zinc-700"
          />
        </div>

        <div className="o-grid o-gap-4 sm:o-grid-cols-3">
          <div className="sm:o-col-span-2">
            <span className="o-mb-1 o-block o-font-medium">Expiry</span>
            <div className="o-grid o-grid-cols-2 o-gap-3">
              <label className="o-sr-only" htmlFor={`${ids}-month`}>
                Expiry month
              </label>
              <select
                id={`${ids}-month`}
                value={state.month}
                onChange={(event) => write({ month: event.target.value })}
                onFocus={() => setFocused('other')}
                onBlur={() => setFocused(null)}
                aria-invalid={!validity.expiry}
                className="o-h-12 o-w-full o-rounded-lg o-border-w-1 o-border-zinc-300 o-bg-transparent o-px-4 focus:o-border-zinc-500 focus:o-outline-none dark:o-border-zinc-700"
              >
                <option value="">Month</option>
                {Array.from({ length: 12 }, (_, index) =>
                  String(index + 1).padStart(2, '0'),
                ).map((month) => (
                  <option key={month} value={month}>
                    {month}
                  </option>
                ))}
              </select>

              <label className="o-sr-only" htmlFor={`${ids}-year`}>
                Expiry year
              </label>
              <select
                id={`${ids}-year`}
                value={state.year}
                onChange={(event) => write({ year: event.target.value })}
                onFocus={() => setFocused('other')}
                onBlur={() => setFocused(null)}
                aria-invalid={!validity.expiry}
                className="o-h-12 o-w-full o-rounded-lg o-border-w-1 o-border-zinc-300 o-bg-transparent o-px-4 focus:o-border-zinc-500 focus:o-outline-none dark:o-border-zinc-700"
              >
                <option value="">Year</option>
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor={`${ids}-cvv`} className="o-mb-1 o-block o-font-medium">
              Code
            </label>
            <input
              id={`${ids}-cvv`}
              inputMode="numeric"
              autoComplete="cc-csc"
              placeholder="123"
              value={state.cvv}
              onChange={(event) => write({ cvv: digitsOf(event.target.value, 4) })}
              // Focus on this field flips the card: that is the only reason the
              // focus state exists.
              onFocus={() => setFocused('cvv')}
              onBlur={() => setFocused(null)}
              aria-invalid={!validity.cvv}
              className="o-h-12 o-w-full o-rounded-lg o-border-w-1 o-border-zinc-300 o-bg-transparent o-px-4 focus:o-border-zinc-500 focus:o-outline-none dark:o-border-zinc-700"
            />
          </div>
        </div>

        {showSubmit ? (
          <button
            type="submit"
            disabled={!validity.all}
            className="o-mt-2 o-h-12 o-rounded-lg o-bg-zinc-950 o-font-semibold o-text-zinc-50 disabled:o-opacity-50 dark:o-bg-zinc-50 dark:o-text-zinc-950"
          >
            {validity.all ? submitLabel : 'Complete the fields'}
          </button>
        ) : null}
      </form>
    </section>
  )
}

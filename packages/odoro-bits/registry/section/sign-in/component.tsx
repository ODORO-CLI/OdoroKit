/**
 * Sign-in flow in three screens: address, code, confirmation.
 *
 * ## What this component is not
 *
 * It is not an authentication client. It knows neither token, nor session, nor
 * provider: it chains three screens and warns the application at each step.
 * What goes out on the network, what comes back, and what has to be done with
 * it is the business of the application — which will set its error message
 * through `error` and block the sending through `pending`.
 *
 * The boundary is deliberate. A component that would call an API itself would
 * impose its response shape, its error codes and its session handling on every
 * project that installs it, whereas it is copied precisely to be owned.
 *
 * ## Why only the entrance is animated
 *
 * The original implementation made a screen leave before the next one entered,
 * with a presence machine. There is none here: the registry depends only on
 * the engine, and the library that carries `usePresence` is optional for a
 * landing project.
 *
 * The leaving screen is therefore removed, and the entering one animated. The
 * loss is real and it is small; the avoided dependency, on the other hand,
 * would have been carried by all.
 *
 * ## The code field
 *
 * Six one character fields are a classic accessibility trap: without a label,
 * a screen reader announces six anonymous areas. Each one therefore carries
 * its own, the first declares `one-time-code` so that the automatic filling of
 * the system works, and a paste spreads over the whole row — the most common
 * case, and the one that gets forgotten.
 *
 * @module
 */

import { mergePresentation, useMotionState, type Customisable } from '@odoro-cli/engine'
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ClipboardEvent,
  type CSSProperties,
  type FormEvent,
  type KeyboardEvent,
  type ReactElement,
  type ReactNode,
} from 'react'

import { DotMatrix } from '@registre/background/DotMatrix'

/** Current step of the flow. */
export type SignInStep = 'email' | 'code' | 'success'

/** Properties of the component itself. */
export interface SignInOwnProps {
  /**
   * Screen displayed, imposed by the application.
   *
   * ## Why this prop exists
   *
   * Without it, the component moves on by itself as soon as the code is
   * complete — so also when it is **wrong**. The application receives
   * `onCodeSubmit`, goes off to check, and during that time the user is
   * already reading "You are in". The error message lands on a success screen,
   * which is worse than no message at all.
   *
   * Provided, it makes the flow controlled: the component reports, and it is
   * the application that decides on the screen. Absent, it moves on by itself
   * — which suits a demonstration, not a real authentication.
   */
  step?: SignInStep
  /** Number of characters of the code. @defaultValue 6 */
  codeLength?: number
  /** Title of the first screen. */
  title?: ReactNode
  /** Subtitle of the first screen. */
  subtitle?: ReactNode
  /**
   * External providers, rendered above the separator.
   *
   * It is a slot rather than a list of props: a provider button carries a
   * brand, a label and a call that belong only to the application.
   */
  providers?: ReactNode
  /** Legal notices, rendered under the form. */
  legal?: ReactNode
  /** Error message displayed under the active field. */
  error?: string
  /** Suspends the sendings during a call in flight. @defaultValue false */
  pending?: boolean
  /** Called when the address is submitted. */
  onEmailSubmit?: (email: string) => void
  /** Called when the code is complete. */
  onCodeSubmit?: (code: string) => void
  /** Called when a new sending is requested. */
  onResend?: () => void
  /** Called on every screen change. */
  onStepChange?: (step: SignInStep) => void
  /** Called from the last screen. */
  onDone?: () => void
}

/** All the properties. */
export type SignInProps = Customisable<SignInOwnProps, 'section'>

/** Identifier of the injected stylesheet. */
const STYLE_ID = 'o-sign-in'

/**
 * Sets the entrance animation, once per document.
 *
 * Reduced motion is handled in the stylesheet rather than in JavaScript: a
 * media query does not need to be reevaluated, and the rule stays true even if
 * the setting changes after the mount.
 */
function ensureSignInRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '@keyframes o-sign-in-enter{from{opacity:0;transform:translate3d(var(--o-sign-in-from),0,0)}',
    'to{opacity:1;transform:none}}',
    '[data-o-sign-in-panel]{animation:o-sign-in-enter var(--o-duration-slow) var(--o-ease-entrance) both}',
    '@media (prefers-reduced-motion:reduce){[data-o-sign-in-panel]{animation:none}}',
  ].join('')
  document.head.append(style)
}

/** What the live region announces on every screen change. */
const STEP_ANNOUNCEMENT: Readonly<Record<SignInStep, string>> = {
  email: 'Enter your email address.',
  code: 'A code has been sent to you. Enter it.',
  success: 'Signed in.',
}

/** Keeps only the digits of a pasted string. */
function digitsOf(value: string): string {
  return value.replace(/\D/g, '')
}

/**
 * Sign-in flow.
 *
 * @example
 * <SignIn
 *   onEmailSubmit={(address) => sendCode(address)}
 *   onCodeSubmit={(code) => verify(code)}
 *   error={problem}
 *   pending={busy}
 * />
 *
 * @example
 * // The providers and the notices are slots: they belong to the application,
 * // with its router and its brands.
 * <SignIn
 *   providers={<button onClick={google}>Continue with Google</button>}
 *   legal={<Link to="/terms">Terms</Link>}
 * />
 */
export function SignIn({
  step: imposedStep,
  codeLength = 6,
  title = 'Good to see you again',
  subtitle = 'Enter your address to receive a code.',
  providers,
  legal,
  error,
  pending = false,
  onEmailSubmit,
  onCodeSubmit,
  onResend,
  onStepChange,
  onDone,
  ...rest
}: SignInProps): ReactElement {
  const { reduced } = useMotionState()
  const [ownStep, setOwnStep] = useState<SignInStep>('email')
  // The application wins when it speaks up. The component nonetheless keeps
  // its own state: it may stop doing so at any moment, and the flow has to
  // resume where it was rather than start again from zero.
  const step = imposedStep ?? ownStep
  const [email, setEmail] = useState('')
  const [code, setCode] = useState<readonly string[]>(() =>
    Array.from({ length: codeLength }, () => ''),
  )
  const inputs = useRef<(HTMLInputElement | null)[]>([])

  ensureSignInRule()

  const goTo = useCallback(
    (next: SignInStep): void => {
      setOwnStep(next)
      onStepChange?.(next)
    },
    [onStepChange],
  )

  // The row follows the requested length. Without that, `useState` having read
  // its initialisation only once, a change of `codeLength` would leave a row
  // of the former size: the code would never be recognised as complete, and
  // the form would stay stuck without saying anything.
  useEffect(() => {
    setCode((current) =>
      current.length === codeLength
        ? current
        : Array.from({ length: codeLength }, () => ''),
    )
    // The table of refs follows too: shortened, it would otherwise hold on to
    // elements removed from the document, that nothing would come to release.
    inputs.current.length = codeLength
  }, [codeLength])

  // The first field of the code receives the focus on arrival on the screen.
  // Without that, one has to aim at a box eight pixels wide to start typing —
  // and with the keyboard alone, tab all the way to it.
  useEffect(() => {
    if (step !== 'code') return
    inputs.current[0]?.focus()
  }, [step])

  const submitEmail = (event: FormEvent): void => {
    event.preventDefault()
    if (pending || email.trim() === '') return
    onEmailSubmit?.(email)
    goTo('code')
  }

  /** Writes the row, and reports the code as soon as it is complete. */
  const commit = (next: readonly string[]): void => {
    setCode(next)
    if (next.some((digit) => digit === '')) return
    onCodeSubmit?.(next.join(''))
    // The pattern reverses while the final screen arrives: the feedback lasts
    // the time of the propagation, not the one of an arbitrary delay.
    goTo('success')
  }

  const changeAt = (index: number, value: string): void => {
    const digit = digitsOf(value).slice(-1)
    const next = [...code]
    next[index] = digit
    if (digit !== '' && index < codeLength - 1) inputs.current[index + 1]?.focus()
    commit(next)
  }

  const keyAt = (index: number, event: KeyboardEvent<HTMLInputElement>): void => {
    if (event.key === 'Backspace' && code[index] === '' && index > 0) {
      inputs.current[index - 1]?.focus()
      return
    }
    if (event.key === 'ArrowLeft' && index > 0) {
      event.preventDefault()
      inputs.current[index - 1]?.focus()
      return
    }
    if (event.key === 'ArrowRight' && index < codeLength - 1) {
      event.preventDefault()
      inputs.current[index + 1]?.focus()
    }
  }

  /**
   * A code almost always arrives by paste, from an email or a notification.
   * Pasted in the first box, it would leave only one character there: the
   * whole row has to absorb it.
   */
  const pasteAt = (index: number, event: ClipboardEvent<HTMLInputElement>): void => {
    const pasted = digitsOf(event.clipboardData.getData('text'))
    if (pasted === '') return
    event.preventDefault()

    const next = [...code]
    for (
      let offset = 0;
      offset < pasted.length && index + offset < codeLength;
      offset += 1
    ) {
      next[index + offset] = pasted[offset] ?? ''
    }
    const landing = Math.min(index + pasted.length, codeLength - 1)
    inputs.current[landing]?.focus()
    commit(next)
  }

  const back = (): void => {
    setCode(Array.from({ length: codeLength }, () => ''))
    goTo('email')
  }

  const { className, style } = mergePresentation(
    { className: 'o-relative o-flex o-min-h-screen o-flex-col o-bg-zinc-950' },
    rest,
  )

  // The entering screen slides from the side it comes from: backwards for the
  // return, forwards for the next one. Under reduced motion, there is no side
  // — the stylesheet neutralises the animation, and the variable no longer
  // serves.
  const from = step === 'email' ? '-2rem' : '2rem'

  return (
    <section {...rest} className={className} style={style}>
      <DotMatrix
        className="o-absolute o-inset-0"
        reverse={step === 'success'}
        speed={step === 'success' ? 0.9 : 0.6}
      />

      {/* Darkening of the edges: the text reads over the pattern without it
          disappearing. */}
      <div
        aria-hidden
        className="o-absolute o-inset-0 o-bg-gradient-to-b o-from-zinc-950 o-via-transparent o-to-zinc-950 o-pointer-events-none"
      />

      <div className="o-relative o-flex o-flex-1 o-items-center o-justify-center o-px-6 o-py-16">
        <div
          key={step}
          data-o-sign-in-panel
          style={{ '--o-sign-in-from': reduced ? '0' : from } as CSSProperties}
          className="o-w-full o-max-w-sm o-text-center"
        >
          {step === 'email' ? (
            <div className="o-flex o-flex-col o-gap-6">
              <div className="o-flex o-flex-col o-gap-2">
                <h1 className="o-text-4xl o-font-bold o-tracking-tight o-text-zinc-50">
                  {title}
                </h1>
                <p className="o-text-base o-text-zinc-400">{subtitle}</p>
              </div>

              {providers === undefined ? null : (
                <div className="o-flex o-flex-col o-gap-3">
                  {providers}
                  <div className="o-flex o-items-center o-gap-4">
                    <span aria-hidden className="o-h-px o-flex-1 o-bg-zinc-800" />
                    <span className="o-text-sm o-text-zinc-500">or</span>
                    <span aria-hidden className="o-h-px o-flex-1 o-bg-zinc-800" />
                  </div>
                </div>
              )}

              <form onSubmit={submitEmail} className="o-flex o-flex-col o-gap-3">
                <label htmlFor="o-sign-in-email" className="o-sr-only">
                  Email address
                </label>
                <div className="o-relative">
                  <input
                    id="o-sign-in-email"
                    type="email"
                    name="email"
                    autoComplete="email"
                    required
                    disabled={pending}
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    aria-invalid={error !== undefined}
                    aria-describedby={error === undefined ? undefined : 'o-sign-in-error'}
                    placeholder="you@example.com"
                    className="o-w-full o-rounded-full o-border-w-1 o-border-zinc-800 o-bg-transparent o-py-3 o-pl-5 o-pr-14 o-text-center o-text-zinc-50 focus:o-border-zinc-500 focus:o-outline-none"
                  />
                  <button
                    type="submit"
                    disabled={pending}
                    className="o-absolute o-right-1.5 o-top-1.5 o-flex o-h-9 o-w-9 o-items-center o-justify-center o-rounded-full o-bg-zinc-800 o-text-zinc-50 hover:o-bg-zinc-700 focus:o-outline-none disabled:o-opacity-50"
                  >
                    <span className="o-sr-only">Continue</span>
                    <span aria-hidden>&rarr;</span>
                  </button>
                </div>
              </form>

              {legal === undefined ? null : (
                <p className="o-text-xs o-text-zinc-500">{legal}</p>
              )}
            </div>
          ) : null}

          {step === 'code' ? (
            <div className="o-flex o-flex-col o-gap-6">
              <div className="o-flex o-flex-col o-gap-2">
                <h1 className="o-text-4xl o-font-bold o-tracking-tight o-text-zinc-50">
                  A code is waiting for you
                </h1>
                <p className="o-text-base o-text-zinc-400">
                  Sent to <span className="o-text-zinc-200">{email}</span>.
                </p>
              </div>

              <div
                role="group"
                aria-label={`Sign-in code, ${String(codeLength)} digits`}
                className="o-flex o-items-center o-justify-center o-gap-2 o-rounded-full o-border-w-1 o-border-zinc-800 o-px-5 o-py-4"
              >
                {code.map((digit, index) => (
                  <input
                    // The boxes have no identity of their own: their position
                    // is their only key, and the row never reorders.
                    key={index}
                    ref={(element) => {
                      inputs.current[index] = element
                    }}
                    type="text"
                    inputMode="numeric"
                    autoComplete={index === 0 ? 'one-time-code' : 'off'}
                    maxLength={1}
                    disabled={pending}
                    value={digit}
                    aria-label={`Digit ${String(index + 1)}`}
                    onChange={(event) => changeAt(index, event.target.value)}
                    onKeyDown={(event) => keyAt(index, event)}
                    onPaste={(event) => pasteAt(index, event)}
                    className="o-w-8 o-bg-transparent o-text-center o-text-xl o-text-zinc-50 focus:o-outline-none"
                  />
                ))}
              </div>

              <div className="o-flex o-gap-3">
                <button
                  type="button"
                  onClick={back}
                  className="o-rounded-full o-border-w-1 o-border-zinc-800 o-px-6 o-py-3 o-text-zinc-300 hover:o-text-zinc-50"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={onResend}
                  disabled={pending}
                  className="o-flex-1 o-rounded-full o-bg-zinc-50 o-px-6 o-py-3 o-font-medium o-text-zinc-950 hover:o-bg-zinc-200 disabled:o-opacity-50"
                >
                  Resend the code
                </button>
              </div>

              {legal === undefined ? null : (
                <p className="o-text-xs o-text-zinc-500">{legal}</p>
              )}
            </div>
          ) : null}

          {step === 'success' ? (
            <div className="o-flex o-flex-col o-gap-6">
              <div className="o-flex o-flex-col o-gap-2">
                <h1 className="o-text-4xl o-font-bold o-tracking-tight o-text-zinc-50">
                  You are in
                </h1>
                <p className="o-text-base o-text-zinc-400">Welcome.</p>
              </div>
              <button
                type="button"
                onClick={onDone}
                className="o-w-full o-rounded-full o-bg-zinc-50 o-px-6 o-py-3 o-font-medium o-text-zinc-950 hover:o-bg-zinc-200"
              >
                Continue
              </button>
            </div>
          ) : null}

          {/* The screen change and the error are announced: without that, a
              keyboard navigation reports nothing at all. The text is a
              sentence and not the identifier of the step: a screen reader
              would pronounce "step code", which means nothing to someone who
              does not have the code in front of them. */}
          <p
            id="o-sign-in-error"
            role="status"
            aria-live="polite"
            className={
              error === undefined ? 'o-sr-only' : 'o-mt-4 o-text-sm o-text-red-400'
            }
          >
            {error ?? STEP_ANNOUNCEMENT[step]}
          </p>
        </div>
      </div>
    </section>
  )
}

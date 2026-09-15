/**
 * Newsletter sign-up, with its four states.
 *
 * ## The four states exist, and they are named
 *
 * Idle, sending, success, error. Most forms implement only two — before and
 * after — and leave the third to the whims of the network: you click, nothing
 * moves, you click again, and two sign-ups go out. The sending state is not a
 * decoration, then: it is the one thing preventing the second click.
 *
 * The error is the fourth, and it is distinct from idle: going back to idle
 * after a failure erases the only useful information of the previous second.
 *
 * ## The live region exists before the message
 *
 * This is the detail that sinks half the implementations: a `role="status"`
 * region **inserted** at the same time as its content is not announced. The
 * browser has to be watching it before it changes. It is therefore always in
 * the document, empty when idle, and it is its text that changes.
 *
 * ## Validation is the browser's, not a regular expression
 *
 * `type="email"` and `required` already validate — better, and in the language
 * of the user. The component reads `validity` rather than rewriting a rule that
 * will one day reject a perfectly valid address. It only holds back the default
 * submission, to show the message in its place rather than in a native bubble
 * that vanishes on the first click.
 *
 * ## A late response must not overwrite the current state
 *
 * Two successive submissions, the first slower than the second: without a
 * guard, the response of the first arrives afterwards and replaces the result
 * of the second. Each submission therefore carries a number, and only the
 * response of the last one is kept.
 *
 * @module
 */

import { mergePresentation, useMotionState, type Customisable } from '@odoro-cli/engine'
import {
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type FormEvent,
  type ReactElement,
  type ReactNode,
} from 'react'

import { useInView } from '@registre/hooks/useInView'

/** Form state. */
export type NewsletterStatus = 'idle' | 'sending' | 'success' | 'error'

/** The sentences shown in the live region. */
export interface NewsletterMessages {
  /** While sending. */
  readonly sending?: string
  /** After a successful sign-up. */
  readonly success?: string
  /** After a failure of the service. */
  readonly error?: string
  /** When the address entered is not valid. */
  readonly invalid?: string
}

/** Props specific to the component. */
export interface NewsletterOwnProps {
  /**
   * Sends the address. A rejected promise counts as a failure, and its message
   * is shown if there is one.
   *
   * Without this function the form never completes: that is deliberate, a fake
   * success would be worse than an inert button.
   */
  onSubmit?: (email: string) => void | Promise<void>
  /** Section title. */
  title?: ReactNode
  /** What the newsletter contains, and how often. */
  body?: ReactNode
  /** Field label. @defaultValue 'Email address' */
  fieldLabel?: string
  /** What is written on the button. @defaultValue 'Subscribe' */
  cta?: string
  /** The sentences shown in the live region. */
  messages?: NewsletterMessages
  /** Note under the form: frequency, unsubscribing, data. */
  note?: ReactNode
  /** Section name, announced to assistive technologies. */
  label?: string
}

/** All props. */
export type NewsletterProps = Customisable<NewsletterOwnProps, 'section'>

/** Identifier of the injected stylesheet. */
const STYLE_ID = 'o-newsletter'

/** Default sentences, replaceable one by one. */
const DEFAULTS: Required<NewsletterMessages> = {
  sending: 'Sending',
  success: 'Done: check your inbox to confirm.',
  error: 'The sign-up did not go through. Try again in a moment.',
  invalid: 'That address does not look valid.',
}

/** Applies the form rules, once per document. */
function ensureNewsletterRules(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-news-ligne]{display:flex;flex-wrap:wrap;gap:0.5rem}',
    '[data-o-news-champ]{flex:1 1 14rem;min-width:0}',

    // The disc that spins while sending. It is decorative: the live region is
    // what tells what is going on.
    '[data-o-news-rouet]{',
    'display:inline-block;width:0.85em;height:0.85em;border-radius:9999px;',
    'border:2px solid currentColor;border-top-color:transparent;',
    'animation:o-news-tourne 0.7s linear infinite}',
    '@keyframes o-news-tourne{to{transform:rotate(1turn)}}',

    '[data-o-news-annonce]{min-height:1.25rem}',

    '@media (prefers-reduced-motion:reduce){',
    // Without rotation the disc keeps its shape: it remains the visible sign
    // that something is under way, which removing the element would take away.
    '[data-o-news-rouet]{animation:none;border-top-color:currentColor;opacity:0.5}}',
  ].join('')
  document.head.append(style)
}

/**
 * Newsletter sign-up form.
 *
 * @example
 * <Newsletter
 *   title="The registry newsletter"
 *   body="Once a month, the entries added and what they taught."
 *   onSubmit={async (email) => { await api.subscribe(email) }}
 * />
 */
export function Newsletter({
  onSubmit,
  title,
  body,
  fieldLabel = 'Email address',
  cta = 'Subscribe',
  messages,
  note,
  label,
  ...rest
}: NewsletterProps): ReactElement {
  const { reduced } = useMotionState()
  const { ref, inView } = useInView<HTMLElement>({ amount: 0.2 })
  const base = useId().replace(/[^a-zA-Z0-9]/g, '')
  const [state, setState] = useState<NewsletterStatus>('idle')
  const [announcement, setAnnouncement] = useState('')
  const field = useRef<HTMLInputElement | null>(null)

  // Each submission carries a number: a late response cannot overwrite the
  // result of a more recent submission.
  const submission = useRef(0)
  const mounted = useRef(true)

  ensureNewsletterRules()

  useEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
    }
  }, [])

  const phrases = { ...DEFAULTS, ...messages }

  const submit = (event: FormEvent<HTMLFormElement>): void => {
    // Held back to show the message in its place: the native bubble vanishes on
    // the first click and leaves nothing behind it.
    event.preventDefault()
    const element = field.current
    if (element === null) return

    if (!element.validity.valid) {
      setState('error')
      setAnnouncement(phrases.invalid)
      element.focus()
      return
    }

    const address = element.value.trim()
    const number = submission.current + 1
    submission.current = number

    setState('sending')
    setAnnouncement(phrases.sending)

    void Promise.resolve(onSubmit?.(address)).then(
      () => {
        if (!mounted.current || submission.current !== number) return
        setState('success')
        setAnnouncement(phrases.success)
        element.value = ''
      },
      (reason: unknown) => {
        if (!mounted.current || submission.current !== number) return
        setState('error')
        setAnnouncement(
          reason instanceof Error && reason.message !== ''
            ? reason.message
            : phrases.error,
        )
      },
    )
  }

  const hue =
    state === 'success'
      ? 'color-mix(in oklab, var(--o-palette-emerald-600) 70%, var(--o-theme-fg))'
      : 'color-mix(in oklab, var(--o-palette-rose-600) 70%, var(--o-theme-fg))'

  const { className, style } = mergePresentation(
    { className: 'o-flex o-flex-col o-gap-5' },
    rest,
  )

  return (
    <section
      {...rest}
      ref={ref}
      aria-label={label}
      className={className}
      style={
        {
          ...style,
          opacity: reduced || inView ? 1 : 0,
          transform: reduced || inView ? 'none' : 'translateY(12px)',
          transition:
            'opacity var(--o-duration-slower) var(--o-ease-entrance), transform var(--o-duration-slower) var(--o-ease-entrance)',
        } as CSSProperties
      }
    >
      {title === undefined ? null : (
        <h2
          className="o-text-2xl o-font-semibold o-tracking-tight"
          style={{ color: 'var(--o-theme-fg)' }}
        >
          {title}
        </h2>
      )}

      {body !== undefined && (
        <p
          className="o-max-w-xl o-text-sm o-leading-relaxed"
          style={{ color: 'var(--o-theme-muted)' }}
        >
          {body}
        </p>
      )}

      {/*
        `noValidate` only disables the native bubble, never the computation: the
        field keeps its `validity`, which the component reads to show the
        message somewhere that does not vanish on the first click.
      */}
      <form onSubmit={submit} noValidate data-o-news-ligne="">
        <div data-o-news-champ="">
          <label
            htmlFor={`${base}-email`}
            className="o-mb-1 o-block o-text-xs o-font-medium"
            style={{ color: 'var(--o-theme-muted)' }}
          >
            {fieldLabel}
          </label>
          <input
            ref={field}
            id={`${base}-email`}
            name="email"
            type="email"
            required
            autoComplete="email"
            inputMode="email"
            placeholder="name@example.com"
            disabled={state === 'sending'}
            aria-invalid={state === 'error'}
            aria-describedby={`${base}-annonce`}
            className="o-w-full o-rounded-lg o-px-3 o-py-2 o-text-sm focus:o-ring"
            style={{
              backgroundColor: 'var(--o-theme-surface)',
              border: `1px solid ${
                state === 'error' ? 'var(--o-palette-rose-600)' : 'var(--o-theme-line)'
              }`,
              color: 'var(--o-theme-fg)',
            }}
          />
        </div>

        <button
          type="submit"
          // The only role of the sending state: prevent the second click, and
          // therefore the second sign-up.
          disabled={state === 'sending'}
          className="o-inline-flex o-items-center o-gap-2 o-self-end o-rounded-lg o-px-5 o-py-2 o-text-sm o-font-medium focus:o-ring"
          style={{
            backgroundColor: 'var(--o-palette-brand-600)',
            color: 'var(--o-palette-white)',
            border: '1px solid transparent',
            cursor: state === 'sending' ? 'progress' : 'pointer',
            opacity: state === 'sending' ? 0.75 : 1,
          }}
        >
          {state === 'sending' && <span aria-hidden data-o-news-rouet="" />}
          {cta}
        </button>
      </form>

      {/*
        Always present, empty when idle: a region inserted at the same time as
        its message would not be announced.
      */}
      <p
        id={`${base}-annonce`}
        role="status"
        data-o-news-annonce=""
        className="o-text-xs"
        style={{ color: state === 'idle' ? 'var(--o-theme-muted)' : hue }}
      >
        {announcement}
      </p>

      {note !== undefined && (
        <p className="o-text-xs" style={{ color: 'var(--o-theme-muted)' }}>
          {note}
        </p>
      )}
    </section>
  )
}

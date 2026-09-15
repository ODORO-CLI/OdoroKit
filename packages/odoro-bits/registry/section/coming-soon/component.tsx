/**
 * "Coming soon" page, with a countdown.
 *
 * ## A countdown must not be read out loud
 *
 * That is the mistake that makes these pages unusable: digits changing every
 * second inside an announced region, and a screen reader reciting the
 * remaining time without ever letting the rest be read. The digits are
 * therefore hidden from assistive technologies, and the opening date is given
 * next to them, once, in a `<time>` that a machine knows how to read.
 *
 * The information is not lost: it is said better.
 *
 * ## Why the loop of the engine rather than a timer
 *
 * A one second `setInterval` drifts: timers are throttled in a background tab,
 * and the countdown is several minutes late on return. The single loop of the
 * engine gives the time on every frame, and the text is only rewritten when
 * the second changes — that is, once per second, whatever the refresh rate of
 * the screen.
 *
 * ## No React render per second
 *
 * The four numbers live in elements, and the loop writes their text. Passing
 * them through a state would cause a complete render of the section every
 * second, for four strings of two characters.
 *
 * The first display, for its part, is computed at render time: a page showing
 * four zeros for one frame before correcting itself would be noticed.
 *
 * @module
 */

import {
  clock,
  mergePresentation,
  useMotionState,
  type Customisable,
} from '@odoro-cli/engine'
import {
  useEffect,
  useMemo,
  useRef,
  type CSSProperties,
  type ReactElement,
  type ReactNode,
} from 'react'

import { useInView } from '@registre/hooks/useInView'

/** Props specific to the component. */
export interface ComingSoonOwnProps {
  /** Opening date, in ISO 8601 or as a `Date`. */
  date: string | Date
  /** Title of the page. */
  title: ReactNode
  /** What is being prepared, in one or two sentences. */
  message?: ReactNode
  /** What can be done meanwhile: links, button, form. */
  actions?: ReactNode
  /** Language of the date formatting. By default, the one of the browser. */
  locale?: string
  /** Name of the section, announced to assistive technologies. */
  label?: string
}

/** All the props. */
export type ComingSoonProps = Customisable<ComingSoonOwnProps, 'section'>

/** Identifier of the injected stylesheet. */
const STYLE_ID = 'o-coming-soon'

/** The four steps of the countdown, from the largest to the smallest. */
const STEPS = [
  { key: 'days', label: 'days', divisor: 86400000 },
  { key: 'hours', label: 'hours', divisor: 3600000 },
  { key: 'minutes', label: 'minutes', divisor: 60000 },
  { key: 'seconds', label: 'seconds', divisor: 1000 },
] as const

/** Sets the page rules, once per document. */
function ensureComingSoonRules(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-cs-compte]{display:flex;gap:0.75rem;list-style:none;margin:0;padding:0}',
    '[data-o-cs-palier]{min-width:4.5rem;text-align:center}',
    // The fixed width of the digits: without it, a "1" narrower than an "8"
    // makes the whole row breathe once per second.
    '[data-o-cs-valeur]{font-variant-numeric:tabular-nums;line-height:1}',

    '[data-o-cs-point]{animation:o-cs-pouls 2.4s var(--o-ease-standard) infinite}',
    '@keyframes o-cs-pouls{0%,100%{opacity:1}50%{opacity:0.35}}',

    '@media (prefers-reduced-motion:reduce){[data-o-cs-point]{animation:none}}',
  ].join('')
  document.head.append(style)
}

/** Spreads a remainder of milliseconds over the four steps. */
function split(remainder: number): readonly number[] {
  let left = Math.max(0, remainder)
  return STEPS.map((step) => {
    const value = Math.floor(left / step.divisor)
    left -= value * step.divisor
    return value
  })
}

/** Two digits at least: the row then keeps the same width. */
function twoDigits(value: number): string {
  return String(value).padStart(2, '0')
}

/**
 * A "coming soon" page with a countdown.
 *
 * @example
 * <ComingSoon
 *   date="2026-03-12T09:00:00Z"
 *   title="The public registry opens soon"
 *   message="Three hundred entries, an index, and the command that installs them."
 *   locale="en-GB"
 * />
 */
export function ComingSoon({
  date,
  title,
  message,
  actions,
  locale,
  label,
  ...rest
}: ComingSoonProps): ReactElement {
  const { reduced } = useMotionState()
  const { ref, inView } = useInView<HTMLElement>({ amount: 0.2 })
  const values = useRef<(HTMLSpanElement | null)[]>([])

  ensureComingSoonRules()

  const target = useMemo(
    () => (typeof date === 'string' ? new Date(date) : date).getTime(),
    [date],
  )

  // The first display is computed at render time: four zeros corrected one
  // frame later would be noticed, and the server render would give a wrong page.
  const start = split(target - Date.now())

  useEffect(() => {
    if (Number.isNaN(target)) return

    let lastSecond = -1

    const subscription = clock.subscribe(
      () => {
        const remainder = target - Date.now()
        const second = Math.floor(Math.max(0, remainder) / 1000)
        // A single write per second, whatever the refresh rate of the screen.
        if (second === lastSecond) return
        lastSecond = second

        split(remainder).forEach((value, index) => {
          const element = values.current[index]
          if (element !== null && element !== undefined) {
            element.textContent = twoDigits(value)
          }
        })
      },
      { name: 'countdown' },
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [target])

  const readable = useMemo(() => {
    if (Number.isNaN(target)) return null
    return new Intl.DateTimeFormat(locale, {
      dateStyle: 'long',
      timeStyle: 'short',
    }).format(new Date(target))
  }, [target, locale])

  const { className, style } = mergePresentation(
    {
      className:
        'o-flex o-flex-col o-items-center o-justify-center o-gap-8 o-px-6 o-py-20 o-text-center',
    },
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
      <p
        className="o-flex o-items-center o-gap-2 o-text-xs o-font-medium o-uppercase o-tracking-wider"
        style={{ color: 'var(--o-theme-muted)' }}
      >
        <span
          aria-hidden
          data-o-cs-point=""
          className="o-inline-block o-size-2 o-rounded-full"
          style={{ backgroundColor: 'var(--o-palette-brand-500)' }}
        />
        Coming soon
      </p>

      <h1
        className="o-max-w-2xl o-text-4xl o-font-bold o-tracking-tight o-text-balance"
        style={{ color: 'var(--o-theme-fg)' }}
      >
        {title}
      </h1>

      {message !== undefined && (
        <p
          className="o-max-w-xl o-text-base o-leading-relaxed"
          style={{ color: 'var(--o-theme-muted)' }}
        >
          {message}
        </p>
      )}

      {/*
        The digits are decorative: it is the date, just below, that carries the
        information. Announcing them every second would make the page
        unlistenable.
      */}
      <ul aria-hidden data-o-cs-compte="">
        {STEPS.map((step, index) => (
          <li
            key={step.key}
            data-o-cs-palier=""
            className="o-rounded-xl o-px-3 o-py-4"
            style={{
              backgroundColor: 'var(--o-theme-surface)',
              border: '1px solid var(--o-theme-line)',
            }}
          >
            <span
              ref={(element) => {
                values.current[index] = element
              }}
              data-o-cs-valeur=""
              className="o-block o-text-3xl o-font-bold"
              style={{ color: 'var(--o-theme-fg)' }}
            >
              {twoDigits(start[index] ?? 0)}
            </span>
            <span
              className="o-mt-1 o-block o-text-xs o-uppercase o-tracking-wider"
              style={{ color: 'var(--o-theme-muted)' }}
            >
              {step.label}
            </span>
          </li>
        ))}
      </ul>

      {readable !== null && (
        <p className="o-text-sm" style={{ color: 'var(--o-theme-muted)' }}>
          Opening on{' '}
          <time
            dateTime={new Date(target).toISOString()}
            className="o-font-medium"
            style={{ color: 'var(--o-theme-fg)' }}
          >
            {readable}
          </time>
        </p>
      )}

      {actions}
    </section>
  )
}

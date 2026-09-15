/**
 * Call to action band.
 *
 * ## One call, not two
 *
 * The band accepts one primary action and, at most, one secondary — and they
 * do not look alike. Two buttons of the same weight do not ask a question,
 * they defer it : the person chooses to do nothing, which is the only choice
 * that asks for no decision.
 *
 * ## A link stays a link, a button stays a button
 *
 * The action carries an address or a function, never both at random. This
 * is not a markup nicety : a link opens in a new tab, gets copied,
 * announces itself as "link" ; a button does something here and now. A
 * `<div onClick>` does neither of the two, and shows itself straight away
 * to the keyboard.
 *
 * ## The sheen passes once
 *
 * It sweeps the band on entry into the view, then stops. A looping shine on a
 * call to action draws the eye permanently to an object that has nothing left
 * to say once read : that is what makes one stop seeing it. Under reduced
 * motion, it does not pass at all.
 *
 * ## The title is a real heading
 *
 * The band opens a heading level, because it is one in the outline of the
 * page. Written as large text, it would be invisible in the summary a screen
 * reader builds — and that is how one navigates when one cannot see.
 *
 * @module
 */

import { mergePresentation, type Customisable } from '@odoro-cli/engine'
import { type CSSProperties, type ReactElement, type ReactNode } from 'react'

import { useInView } from '@registre/hooks/useInView'

/** An action of the band. */
export interface CtaAction {
  /** What is written on it. */
  readonly label: string
  /** Address : the action is then a link. */
  readonly href?: string
  /** Function : the action is then a button. */
  readonly onClick?: () => void
}

/** Properties specific to the component. */
export interface CtaBandOwnProps {
  /** What is on offer, in one sentence. */
  title: ReactNode
  /** The primary action. */
  primary: CtaAction
  /** A detail under the title. */
  body?: ReactNode
  /** A second action, quiet. */
  secondary?: CtaAction
  /** Heading level rendered. @defaultValue 'h2' */
  headingLevel?: 'h2' | 'h3'
  /** Name of the section, announced to assistive technologies. */
  label?: string
}

/** All the properties. */
export type CtaBandProps = Customisable<CtaBandOwnProps, 'section'>

/** Identifier of the injected stylesheet. */
const STYLE_ID = 'o-cta-band'

/** Sets the rules of the band, once per document. */
function ensureCtaRules(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-cta]{position:relative;overflow:hidden;isolation:isolate}',
    '[data-o-cta-sheen]{',
    'position:absolute;inset:0;pointer-events:none;z-index:-1;',
    'transform:translateX(-100%);opacity:0}',
    // `forwards` holds the end state : without it, the sheen would come back to
    // its starting position and flicker on the last frame.
    '[data-o-cta-seen] [data-o-cta-sheen]{',
    'animation:o-cta-balayage 1.4s var(--o-ease-standard) 0.15s forwards}',
    '@keyframes o-cta-balayage{',
    '0%{transform:translateX(-100%);opacity:0}',
    '25%{opacity:1}',
    '100%{transform:translateX(100%);opacity:0}}',

    '[data-o-cta-corps]{',
    'opacity:0;transform:translateY(12px);',
    'transition:opacity var(--o-duration-slower) var(--o-ease-entrance),',
    'transform var(--o-duration-slower) var(--o-ease-entrance)}',
    '[data-o-cta-seen] [data-o-cta-corps]{opacity:1;transform:none}',

    '@media (prefers-reduced-motion:reduce){',
    '[data-o-cta-sheen]{display:none}',
    '[data-o-cta-corps]{opacity:1;transform:none;transition:none}}',
  ].join('')
  document.head.append(style)
}

/** Renders an action, as a link or as a button according to what it carries. */
function Action({
  action,
  primary,
}: {
  action: CtaAction
  primary: boolean
}): ReactElement {
  const classes = [
    'o-inline-flex o-items-center o-justify-center o-rounded-lg o-px-5 o-py-2.5',
    'o-text-sm o-font-medium focus:o-ring',
  ].join(' ')

  const appearance: CSSProperties = primary
    ? {
        backgroundColor: 'var(--o-palette-brand-600)',
        color: 'var(--o-palette-white)',
        textDecoration: 'none',
        border: '1px solid transparent',
        cursor: 'pointer',
      }
    : {
        backgroundColor: 'transparent',
        color: 'var(--o-theme-fg)',
        textDecoration: 'none',
        border: '1px solid var(--o-theme-line)',
        cursor: 'pointer',
      }

  if (action.href !== undefined) {
    return (
      <a href={action.href} className={classes} style={appearance}>
        {action.label}
      </a>
    )
  }

  return (
    <button type="button" onClick={action.onClick} className={classes} style={appearance}>
      {action.label}
    </button>
  )
}

/**
 * A call to action band.
 *
 * @example
 * <CtaBand
 *   title="Install the first entry with one command"
 *   body="The code is copied to your side : it is yours from the first second."
 *   primary={{ label: 'Get started', href: '/install' }}
 *   secondary={{ label: 'Read the contract', href: '/contract' }}
 * />
 */
export function CtaBand({
  title,
  primary,
  body,
  secondary,
  headingLevel = 'h2',
  label,
  ...rest
}: CtaBandProps): ReactElement {
  const { ref, inView } = useInView<HTMLElement>({ amount: 0.25 })
  const Heading = headingLevel

  ensureCtaRules()

  const { className, style } = mergePresentation(
    { className: 'o-rounded-2xl o-px-8 o-py-12' },
    rest,
  )

  return (
    <section
      {...rest}
      ref={ref}
      aria-label={label}
      data-o-cta=""
      data-o-cta-seen={inView ? '' : undefined}
      className={className}
      style={
        {
          ...style,
          backgroundColor:
            'color-mix(in oklab, var(--o-palette-brand-500) 10%, var(--o-theme-surface))',
          border:
            '1px solid color-mix(in oklab, var(--o-palette-brand-500) 35%, transparent)',
        } as CSSProperties
      }
    >
      <span
        aria-hidden
        data-o-cta-sheen=""
        style={{
          backgroundImage:
            'linear-gradient(100deg, transparent 30%, color-mix(in oklab, var(--o-palette-brand-400) 45%, transparent) 50%, transparent 70%)',
        }}
      />

      <div
        data-o-cta-corps=""
        className="o-flex o-flex-col o-items-center o-gap-6 o-text-center"
      >
        <div className="o-flex o-max-w-2xl o-flex-col o-gap-3">
          <Heading
            className="o-text-2xl o-font-bold o-tracking-tight o-text-balance"
            style={{ color: 'var(--o-theme-fg)' }}
          >
            {title}
          </Heading>
          {body !== undefined && (
            <p
              className="o-text-sm o-leading-relaxed"
              style={{ color: 'var(--o-theme-muted)' }}
            >
              {body}
            </p>
          )}
        </div>

        <div className="o-flex o-flex-wrap o-items-center o-justify-center o-gap-3">
          <Action action={primary} primary />
          {secondary !== undefined && <Action action={secondary} primary={false} />}
        </div>
      </div>
    </section>
  )
}

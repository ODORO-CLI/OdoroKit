/**
 * Pricing grid, with a period toggle and prices that recompute.
 *
 * ## The price changes, it does not get replaced
 *
 * Going from the month to the year replaces a number with another one.
 * Written as such, the change is instant and one doubts having seen right —
 * above all when three prices change at once.
 *
 * The counter of `text/count-up` makes the transition between the old and the
 * new one, so that the eye follows the motion and sees which way it goes. That
 * is the only reason why it is here: it is not a decoration, it is what makes
 * the toggle legible.
 *
 * ## The discount is not displayed, it is applied
 *
 * A yearly discount is usually announced by a badge — "two months free" — that
 * nothing ties to the neighbouring number. Here it is **inside** the
 * computation: the yearly price displayed is the discounted monthly price, and
 * the badge only names what the number already shows.
 *
 * ## One tier featured, never two
 *
 * A tier stands out by its border and a reminder, and the component accepts
 * only one. Two featured tiers no longer point anyone anywhere: they only
 * signal that one could not choose.
 *
 * ## What the structure has to say
 *
 * Each tier is an `article` with its title; the benefits are a real list. A
 * grid of `div` would give the same drawing and nothing to a screen reader,
 * which would hear a run of words without knowing where a tier begins nor
 * where it ends.
 *
 * The toggle is a group of radio buttons, not two buttons: it is a choice
 * between two exclusive states, and the arrow keys have to move through it.
 *
 * @module
 */

import { mergePresentation, type Customisable } from '@odoro-cli/engine'
import {
  useId,
  useState,
  type CSSProperties,
  type ElementType,
  type ReactElement,
  type ReactNode,
} from 'react'

import { CountUp } from '@registre/text/CountUp'

/** One tier. */
export interface Tier {
  /** The name of the tier. */
  readonly name: string
  /** The monthly price, in the display unit. */
  readonly monthly: number
  /** A sentence under the name. */
  readonly note?: string
  /** What the tier includes. */
  readonly features: readonly string[]
  /** The label of the button. @defaultValue 'Choose' */
  readonly cta?: string
  /** Feature this tier. Only one may be. */
  readonly featured?: boolean
}

/** Properties of the component itself. */
export interface PricingTiersOwnProps {
  /** The tiers, in display order. */
  tiers: readonly Tier[]
  /** Rendered tag. @defaultValue 'section' */
  as?: ElementType
  /** Symbol stuck before the price. @defaultValue '' */
  currency?: string
  /** Symbol stuck after the price. @defaultValue ' €' */
  suffix?: string
  /**
   * Share discounted over the year, from 0 to 1.
   *
   * `0.2` takes a fifth off the yearly price. Zero removes the toggle:
   * without a discount, offering two periods brings nothing.
   *
   * @defaultValue 0.2
   */
  yearlyDiscount?: number
  /** Language of the formatting. By default, the one of the browser. */
  locale?: string
  /** Called on click on a tier. */
  onChoose?: (tier: Tier) => void
  /** What is displayed above the grid. */
  children?: ReactNode
}

/** All the properties. */
export type PricingTiersProps = Customisable<PricingTiersOwnProps, 'section'>

/** Identifier of the injected stylesheet. */
const STYLE_ID = 'o-pricing-tiers'

/** Sets the rules of the grid, once per document. */
function ensurePricingRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-pricing-grid]{',
    'display:grid;gap:1rem;align-items:stretch;',
    'grid-template-columns:repeat(auto-fit,minmax(15rem,1fr));',
    '}',
    '[data-o-tier]{display:flex;flex-direction:column;height:100%}',
    '[data-o-tier-features]{list-style:none;margin:0;padding:0;flex:1}',
    '[data-o-tier-features] li{display:flex;gap:0.5rem;padding:0.3rem 0}',
    // The check mark is decorative: the fact that a benefit is in the list
    // already says that it is included, and having it read out would add
    // "check" in front of every line.
    '[data-o-tier-features] li::before{content:"✓";opacity:0.5}',
    '[data-o-period]{display:inline-flex;gap:0.25rem;padding:0.25rem;border-radius:9999px}',
    '[data-o-period] label{border-radius:9999px;padding:0.3rem 0.9rem;cursor:pointer;font-size:0.8125rem}',
    '[data-o-period] input{position:absolute;opacity:0;pointer-events:none}',
    '[data-o-period] input:focus-visible+span{outline:2px solid currentColor;outline-offset:2px;border-radius:9999px}',
  ].join('')
  document.head.append(style)
}

/**
 * A pricing grid with a monthly / yearly toggle.
 *
 * @example
 * <PricingTiers
 *   tiers={[
 *     { name: 'Start', monthly: 0, features: ['One project', 'Community'] },
 *     { name: 'Studio', monthly: 29, features: ['Ten projects', 'Support'], featured: true },
 *     { name: 'Agency', monthly: 99, features: ['Unlimited', 'On call'] },
 *   ]}
 * />
 */
/**
 * Line and veil drawn from the current ink.
 *
 * The system has no class for a partially transparent color derived from
 * `currentColor`: `o-border-current/15` does not exist, and an absent class
 * paints nothing. The mix is therefore done in style, where it is exact.
 */
const LINE = 'color-mix(in oklab, currentColor 15%, transparent)'
const VEIL = 'color-mix(in oklab, currentColor 10%, transparent)'

export function PricingTiers({
  tiers,
  as: Tag = 'section',
  currency = '',
  suffix = ' €',
  yearlyDiscount = 0.2,
  locale,
  onChoose,
  children,
  ...rest
}: PricingTiersProps): ReactElement {
  const [yearly, setYearly] = useState(false)
  const group = useId()

  ensurePricingRule()

  const { className, style } = mergePresentation({}, rest)

  // Without a discount, the toggle would change no figure: offering it would
  // be a setting that does nothing.
  const toggle = yearlyDiscount > 0

  return (
    <Tag {...rest} className={className} style={style as CSSProperties}>
      {children}

      {toggle && (
        <div
          role="radiogroup"
          aria-label="Billing period"
          data-o-period=""
          className="o-mb-6 o-border-w-1"
          style={{ borderColor: LINE }}
        >
          {[
            { value: false, label: 'Monthly' },
            {
              value: true,
              label: `Yearly −${String(Math.round(yearlyDiscount * 100))}%`,
            },
          ].map((choice) => (
            <label key={String(choice.value)}>
              <input
                type="radio"
                name={group}
                checked={yearly === choice.value}
                onChange={() => {
                  setYearly(choice.value)
                }}
              />
              <span
                className={yearly === choice.value ? 'o-font-medium' : 'o-opacity-70'}
                style={yearly === choice.value ? { backgroundColor: VEIL } : undefined}
              >
                {choice.label}
              </span>
            </label>
          ))}
        </div>
      )}

      <div data-o-pricing-grid="">
        {tiers.map((tier) => {
          const price = yearly ? tier.monthly * (1 - yearlyDiscount) : tier.monthly

          return (
            <article
              key={tier.name}
              data-o-tier=""
              className={[
                'o-rounded-xl o-border-w-1 o-p-6',
                tier.featured === true ? 'o-border-current o-shadow-lg' : '',
              ].join(' ')}
              style={tier.featured === true ? undefined : { borderColor: LINE }}
            >
              <h3 className="o-text-sm o-font-semibold o-uppercase o-tracking-wider">
                {tier.name}
              </h3>

              {tier.note !== undefined && (
                <p className="o-mt-1 o-text-sm o-opacity-70">{tier.note}</p>
              )}

              <p className="o-mt-4 o-text-4xl o-font-bold o-tracking-tight">
                <CountUp
                  value={price}
                  // On mount, not on entering the viewport: a toggle triggers a
                  // new count, and waiting for an entry into the viewport that
                  // has already happened would never hand back control.
                  trigger="mount"
                  duration={520}
                  decimals={Number.isInteger(price) ? 0 : 2}
                  prefix={currency}
                  suffix={suffix}
                  {...(locale === undefined ? {} : { locale })}
                />
                <span className="o-text-base o-font-normal o-opacity-60">
                  {yearly ? ' / month, billed yearly' : ' / month'}
                </span>
              </p>

              <ul data-o-tier-features="" className="o-mt-5 o-text-sm">
                {tier.features.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>

              <button
                type="button"
                onClick={() => {
                  onChoose?.(tier)
                }}
                className={[
                  'o-mt-6 o-w-full o-rounded-lg o-px-4 o-py-2 o-text-sm o-font-medium',
                  tier.featured === true ? '' : 'o-border-w-1',
                ].join(' ')}
                // `background-color: currentColor` on a button whose color is
                // redefined paints the background with the ink: both are then
                // worth the same thing and the label vanishes. The two roles
                // are therefore named, each by its own token.
                style={
                  tier.featured === true
                    ? { backgroundColor: 'var(--o-theme-fg)', color: 'var(--o-theme-bg)' }
                    : { borderColor: LINE }
                }
              >
                {tier.cta ?? 'Choose'}
              </button>
            </article>
          )
        })}
      </div>
    </Tag>
  )
}

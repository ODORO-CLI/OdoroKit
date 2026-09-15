/**
 * Stat band: numbers that count up when the section arrives.
 *
 * ## It does not recount what already exists
 *
 * The counting, the locale-aware formatting, the fixed-width digits, the layer
 * that keeps the final value readable by a screen reader — all of that lives
 * in `text/count-up`, and this section uses it. Rewriting it here would give
 * two implementations of the same problem, one of which would fall behind
 * without anything reporting it.
 *
 * This is what a registry dependency is for: `odoro add` installs both, and
 * the link is declared rather than copied.
 *
 * ## The trigger belongs to the band, not to each number
 *
 * Every counter could watch its own entry into the viewport. They would then
 * start one after another, as the page scrolls — which is right for a
 * paragraph, and wrong for a row: a band of figures reads as a single object,
 * and must animate as one.
 *
 * The delay between them is therefore deliberate and set here, not endured.
 *
 * ## What a statistic must say when it does not move
 *
 * Everything. The final number is in the DOM from the first render — that is
 * `count-up`'s job — and the label is ordinary text. Under reduced motion, the
 * band is simply a band of figures, which is what it has always been.
 *
 * @module
 */

import { mergePresentation, type Customisable } from '@odoro-cli/engine'
import { type CSSProperties, type ElementType, type ReactElement } from 'react'

import { CountUp } from '@registre/text/CountUp'

/** One statistic in the band. */
export interface Stat {
  /** The target value. */
  readonly value: number
  /** What it measures. */
  readonly label: string
  /** Glued before the number. */
  readonly prefix?: string
  /** Glued after the number. */
  readonly suffix?: string
  /** Number of decimals. @defaultValue 0 */
  readonly decimals?: number
}

/** Props specific to the component. */
export interface StatBandOwnProps {
  /** The statistics, in display order. */
  stats: readonly Stat[]
  /** Rendered tag. @defaultValue 'section' */
  as?: ElementType
  /** Duration of one number's climb, in milliseconds. @defaultValue 1500 */
  duration?: number
  /**
   * Delay between two numbers, in milliseconds.
   *
   * Zero starts them together; about a hundred gives a left-to-right reading
   * without the band falling apart.
   *
   * @defaultValue 120
   */
  stagger?: number
  /** Formatting locale. Defaults to the browser's. */
  locale?: string
}

/** Every prop. */
export type StatBandProps = Customisable<StatBandOwnProps, 'section'>

/** Identifier of the injected stylesheet. */
const STYLE_ID = 'o-stat-band'

/** Applies the band rules, once per document. */
function ensureStatBandRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    // An auto grid rather than a fixed column count: the band serves two
    // statistics as well as six, and nobody should have to pick a layout
    // according to how many there are.
    '[data-o-stat-band]{',
    'display:grid;gap:2rem 3rem;',
    'grid-template-columns:repeat(auto-fit,minmax(10rem,1fr));',
    '}',
    '[data-o-stat] dt{order:2;font-size:0.875rem;opacity:0.7;margin-top:0.35rem}',
    '[data-o-stat] dd{order:1;margin:0;line-height:1.05}',
    // The column reverses the visual order without touching the document
    // order: a screen reader must hear "projects delivered, 12,480", not the
    // other way round, and the eye must see the number first.
    '[data-o-stat]{display:flex;flex-direction:column}',
  ].join('')
  document.head.append(style)
}

/**
 * A row of statistics that count up on entering the viewport.
 *
 * @example
 * <StatBand
 *   stats={[
 *     { value: 12480, label: 'projects delivered' },
 *     { value: 99.98, label: 'uptime', suffix: ' %', decimals: 2 },
 *     { value: 42, label: 'countries' },
 *   ]}
 * />
 */
export function StatBand({
  stats,
  as: Tag = 'section',
  duration = 1500,
  stagger = 120,
  locale,
  ...rest
}: StatBandProps): ReactElement {
  ensureStatBandRule()

  const { className, style } = mergePresentation({}, rest)

  return (
    <Tag
      {...rest}
      className={className}
      style={style as CSSProperties}
      data-o-stat-band=""
    >
      {stats.map((stat, i) => (
        // A definition list: each statistic is a value and what it measures,
        // which is exactly the relation `dl` describes.
        <dl key={stat.label} data-o-stat="">
          <dd className="o-text-4xl o-font-bold o-tracking-tight">
            <CountUp
              value={stat.value}
              duration={duration}
              // The delay comes from the band: the counters do not each watch
              // their own entry into the viewport.
              delay={i * stagger}
              decimals={stat.decimals ?? 0}
              {...(locale === undefined ? {} : { locale })}
              {...(stat.prefix === undefined ? {} : { prefix: stat.prefix })}
              {...(stat.suffix === undefined ? {} : { suffix: stat.suffix })}
            />
          </dd>
          <dt>{stat.label}</dt>
        </dl>
      ))}
    </Tag>
  )
}

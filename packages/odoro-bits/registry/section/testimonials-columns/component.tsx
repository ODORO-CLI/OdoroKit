/**
 * Columns of testimonials that scroll.
 *
 * ## Why columns in opposite directions
 *
 * A single band going up reads like closing credits: the eye follows it and
 * waits for it to end. Two columns crossing each other give no privileged
 * reading direction, and the eye stops on what interests it instead of
 * carrying on with the motion. That is the difference between a scroll one
 * endures and a wall one browses.
 *
 * ## The seamless loop, and the half-gap mistake
 *
 * The technique is well known: the list is written twice, and the track slides
 * by half its height. It only works if every item takes exactly the same room,
 * spacing included — but a flexbox `gap` sits **between** the items, not after
 * the last one. Over 2n items there are 2n-1 intervals, and the track
 * therefore comes back half a gap too early: one jolt per turn, discreet
 * enough to pass review and visible enough to annoy.
 *
 * The spacing is here a bottom margin carried by each item. Each one then
 * weighs its height plus the spacing, half the track is worth exactly one
 * period, and the loop is invisible.
 *
 * ## The second copy does not exist for reading
 *
 * It is decorative: a screen reader hearing every testimonial twice would
 * think the page was broken. The duplicates are therefore hidden one by one,
 * which leaves the real list complete and readable.
 *
 * ## What stops the motion
 *
 * Hover and keyboard focus — one does not read a text that moves — and the
 * section being off screen: as long as it has not entered the viewport, no
 * animation is started. Under reduced motion, the columns are still and the
 * wall is browsed by scrolling the page.
 *
 * @module
 */

import { mergePresentation, useMotionState, type Customisable } from '@odoro-cli/engine'
import { type CSSProperties, type ReactElement, type ReactNode } from 'react'

import { useInView } from '@registre/hooks/useInView'

/** A testimonial. */
export interface Testimonial {
  /** What is said. */
  readonly quote: ReactNode
  /** Who says it. */
  readonly author: string
  /** Role, company, or whatever places the person. */
  readonly role?: string
  /** URL of a portrait. Without it, the initials stand in as the thumbnail. */
  readonly avatar?: string
}

/** Props specific to the component. */
export interface TestimonialsColumnsOwnProps {
  /** The testimonials. They are spread across columns in the given order. */
  items: readonly Testimonial[]
  /** Number of columns beyond the medium breakpoint. @defaultValue 3 */
  columns?: number
  /** Duration of one full turn, in milliseconds. @defaultValue 40000 */
  duration?: number
  /** Visible height of the wall, in pixels. @defaultValue 480 */
  height?: number
  /** Name of the section, announced to assistive technology. */
  label?: string
  /** Heading displayed above the wall. */
  title?: ReactNode
}

/** Every prop. */
export type TestimonialsColumnsProps = Customisable<
  TestimonialsColumnsOwnProps,
  'section'
>

/** Identifier of the injected stylesheet. */
const STYLE_ID = 'o-testimonials-columns'

/** Applies the wall rules, once per document. */
function ensureColumnsRules(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-tcol-wall]{',
    'display:grid;gap:1rem;overflow:hidden;',
    'grid-template-columns:1fr;',
    'height:var(--o-tcol-height);',
    // The top and the bottom fade out: without that, the cards are cut sharp
    // by the edge and the wall looks like truncated content rather than a
    // continuous scroll.
    '-webkit-mask-image:var(--o-tcol-fondu);mask-image:var(--o-tcol-fondu);',
    '}',
    '@media (min-width:48rem){[data-o-tcol-wall]{',
    'grid-template-columns:repeat(var(--o-tcol-columns),minmax(0,1fr))}}',

    '[data-o-tcol-track]{display:flex;flex-direction:column;list-style:none;margin:0;padding:0;',
    'animation:o-tcol-monte var(--o-tcol-duration) linear infinite;animation-play-state:paused}',
    // The spacing is a bottom margin, never a `gap`: see the module header.
    // Every item must weigh exactly the same for half the track to be worth
    // one period.
    '[data-o-tcol-track]>li{margin-block-end:1rem}',
    '[data-o-tcol-col][data-direction="bas"] [data-o-tcol-track]{animation-name:o-tcol-descend}',
    '[data-o-tcol-seen] [data-o-tcol-track]{animation-play-state:running}',
    '[data-o-tcol-col]:hover [data-o-tcol-track],',
    '[data-o-tcol-col]:focus-within [data-o-tcol-track]{animation-play-state:paused}',

    '@keyframes o-tcol-monte{from{transform:translateY(0)}to{transform:translateY(-50%)}}',
    '@keyframes o-tcol-descend{from{transform:translateY(-50%)}to{transform:translateY(0)}}',

    // Still, the wall stays a wall: it is browsed by scrolling the page, and
    // nothing is hidden.
    '@media (prefers-reduced-motion:reduce){',
    '[data-o-tcol-wall]{height:auto;-webkit-mask-image:none;mask-image:none}',
    '[data-o-tcol-track]{animation:none}}',
  ].join('')
  document.head.append(style)
}

/** Initials of a name, for the fallback thumbnail. */
function initials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join('')
}

/** Spreads the testimonials across columns, keeping the reading order. */
function spread(
  items: readonly Testimonial[],
  columns: number,
): readonly (readonly Testimonial[])[] {
  const buckets: Testimonial[][] = Array.from({ length: columns }, () => [])
  items.forEach((item, index) => {
    buckets[index % columns]?.push(item)
  })
  return buckets.filter((bucket) => bucket.length > 0)
}

/** A testimonial card. */
function Card({ item }: { item: Testimonial }): ReactElement {
  return (
    <figure
      className="o-rounded-xl o-p-5"
      style={{
        backgroundColor: 'var(--o-theme-surface)',
        border: '1px solid var(--o-theme-line)',
        color: 'var(--o-theme-fg)',
      }}
    >
      <blockquote className="o-text-sm o-leading-relaxed">{item.quote}</blockquote>
      <figcaption className="o-mt-4 o-flex o-items-center o-gap-3">
        {item.avatar === undefined ? (
          <span
            aria-hidden
            className="o-flex o-size-10 o-shrink-0 o-items-center o-justify-center o-rounded-full o-text-xs o-font-semibold"
            style={{
              backgroundColor: 'color-mix(in oklab, var(--o-theme-fg) 10%, transparent)',
            }}
          >
            {initials(item.author)}
          </span>
        ) : (
          <img
            src={item.avatar}
            alt=""
            className="o-size-10 o-shrink-0 o-rounded-full o-object-cover"
          />
        )}
        <span className="o-min-w-0">
          <span className="o-block o-text-sm o-font-medium o-truncate">
            {item.author}
          </span>
          {item.role !== undefined && (
            <span
              className="o-block o-text-xs o-truncate"
              style={{ color: 'var(--o-theme-muted)' }}
            >
              {item.role}
            </span>
          )}
        </span>
      </figcaption>
    </figure>
  )
}

/**
 * A wall of testimonials in columns that cross each other.
 *
 * @example
 * <TestimonialsColumns
 *   label="What people say"
 *   items={[
 *     { quote: 'Installed in one command, tweaked the next day.', author: 'Camille Roy' },
 *     { quote: 'The fallback without WebGL saved us a rewrite.', author: 'Sami Belkacem' },
 *   ]}
 * />
 */
export function TestimonialsColumns({
  items,
  columns = 3,
  duration = 40000,
  height = 480,
  label,
  title,
  ...rest
}: TestimonialsColumnsProps): ReactElement {
  const { reduced } = useMotionState()
  const { ref, inView } = useInView<HTMLElement>({ amount: 0.05 })
  ensureColumnsRules()

  const buckets = spread(items, Math.max(1, Math.round(columns)))

  const { className, style } = mergePresentation(
    { className: 'o-flex o-flex-col o-gap-8' },
    rest,
  )

  return (
    <section
      {...rest}
      ref={ref}
      aria-label={label}
      className={className}
      style={style as CSSProperties}
    >
      {title === undefined ? null : (
        <h2
          className="o-text-2xl o-font-semibold o-tracking-tight"
          style={{ color: 'var(--o-theme-fg)' }}
        >
          {title}
        </h2>
      )}

      <div
        data-o-tcol-wall=""
        data-o-tcol-seen={inView && !reduced ? '' : undefined}
        style={
          {
            '--o-tcol-columns': String(buckets.length),
            '--o-tcol-duration': `${String(duration)}ms`,
            '--o-tcol-height': `${String(height)}px`,
            '--o-tcol-fondu':
              'linear-gradient(to bottom, transparent, var(--o-theme-fg) 10%, var(--o-theme-fg) 90%, transparent)',
          } as CSSProperties
        }
      >
        {buckets.map((bucket, column) => (
          <div
            key={column}
            data-o-tcol-col=""
            // Every other column goes down: two opposite directions take the
            // wall's reading direction away, and the eye stops instead of
            // following.
            data-direction={column % 2 === 1 ? 'down' : 'up'}
          >
            <ul data-o-tcol-track="">
              {bucket.map((item, index) => (
                <li key={`real-${String(index)}`}>
                  <Card item={item} />
                </li>
              ))}
              {/*
                The second copy only exists to close the loop. It is hidden item
                by item: a screen reader must hear the list once. Still, it has
                no reason to be — and would show every testimonial twice in a
                row.
              */}
              {!reduced &&
                bucket.map((item, index) => (
                  <li key={`copy-${String(index)}`} aria-hidden>
                    <Card item={item} />
                  </li>
                ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  )
}

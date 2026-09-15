/**
 * Vertical timeline that fills as the page scrolls.
 *
 * ## The progress is read in the loop, never rendered
 *
 * A timeline that fills changes look on every frame. Holding that value in
 * React state would mean a full render per frame for the whole scroll of the
 * page — to move a rectangle and change two opacities, which the compositor
 * knows how to do on its own.
 *
 * The progress is therefore read in the engine's single loop, at the
 * measurement priority, and written into a CSS variable. The rail fills by
 * `scaleY`, the milestones light up through an attribute: no React render
 * happens during the run.
 *
 * ## Why a single measurement for the whole timeline
 *
 * Every milestone could watch its own crossing. Over twenty events that would
 * make twenty observers and twenty thresholds that never fall exactly where
 * the rail is: the dot would light up before or after the line reaches it, and
 * the offset would show.
 *
 * One measurement, one progress: the milestone lights up when the line
 * arrives, by construction.
 *
 * ## The reference is the middle of the viewport, not its edge
 *
 * A fill locked on the top of the window is already finished when one reads
 * the first event; locked on the bottom, it has not started. The middle of the
 * viewport puts the line where the eye is.
 *
 * ## What a screen reader hears
 *
 * An ordered list of dated events. The rail, the dots and the fill are
 * decorative and hidden: they say visually what the order of the list already
 * says.
 *
 * @module
 */

import {
  CLOCK_PRIORITY,
  clock,
  mergePresentation,
  useMotionState,
  type Customisable,
} from '@odoro-cli/engine'
import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactElement,
  type ReactNode,
} from 'react'

/** An event on the timeline. */
export interface TimelineEvent {
  /** Displayed date. Free text: "March 2024", "v2.0". */
  readonly date: string
  /**
   * Machine-readable date, in `YYYY-MM-DD` or `YYYY-MM` format.
   *
   * Without it, `<time>` brings nothing more than a `<span>`: it is the
   * attribute that makes the date usable.
   */
  readonly dateTime?: string
  /** Heading of the event. */
  readonly title: string
  /** What happened. */
  readonly body?: ReactNode
}

/** Props specific to the component. */
export interface TimelineOwnProps {
  /** The events, from the oldest to the most recent. */
  events: readonly TimelineEvent[]
  /** Name of the timeline, announced to assistive technology. */
  label: string
  /** Heading displayed above the timeline. */
  title?: ReactNode
}

/** Every prop. */
export type TimelineProps = Customisable<TimelineOwnProps, 'section'>

/** Identifier of the injected stylesheet. */
const STYLE_ID = 'o-timeline'

/** Applies the timeline rules, once per document. */
function ensureTimelineRules(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    // The rail lives in the wrapper, never in the list: an ordered list only
    // accepts `li`, and slipping two lines into it would invalidate the only
    // markup that carries the meaning of the timeline.
    '[data-o-timeline-cadre]{position:relative}',
    '[data-o-timeline]{list-style:none;margin:0;padding:0 0 0 2rem}',
    // The rail and its fill are two stacked lines: the second one is scaled,
    // which the compositor does without a layout recalculation.
    '[data-o-timeline-rail],[data-o-timeline-fill]{',
    'position:absolute;left:0.4375rem;top:0.5rem;bottom:0.5rem;width:2px}',
    '[data-o-timeline-fill]{transform-origin:top;transform:scaleY(var(--o-timeline-p,0))}',

    '[data-o-timeline]>li{position:relative;padding-bottom:2.5rem}',
    '[data-o-timeline]>li:last-child{padding-bottom:0}',
    '[data-o-timeline-point]{',
    'position:absolute;left:-2rem;top:0.375rem;width:1rem;height:1rem;border-radius:9999px;',
    'transform:scale(0.7);',
    'transition:transform var(--o-duration-base) var(--o-ease-emphasized),',
    'background-color var(--o-duration-base) var(--o-ease-standard)}',
    '[data-o-timeline-atteint] [data-o-timeline-point]{transform:scale(1)}',

    '[data-o-timeline]>li>[data-o-timeline-corps]{',
    'opacity:0.45;transition:opacity var(--o-duration-slow) var(--o-ease-standard)}',
    '[data-o-timeline-atteint]>[data-o-timeline-corps]{opacity:1}',

    // Without motion, the timeline is entirely travelled: showing an empty rail
    // and half-faded events would be an accessibility defect, not a respect of
    // the preference.
    '@media (prefers-reduced-motion:reduce){',
    '[data-o-timeline-fill]{transform:scaleY(1)}',
    '[data-o-timeline-point]{transform:scale(1);transition:none}',
    '[data-o-timeline]>li>[data-o-timeline-corps]{opacity:1;transition:none}}',
  ].join('')
  document.head.append(style)
}

/**
 * Finds the scrolling container around an element.
 *
 * The window is not always what scrolls: a timeline placed in an overflowing
 * panel — a preview, a drawer, a fixed-height column — is measured against that
 * panel. Taking the window in that case gives a progress that barely moves, and
 * a rail that never fills.
 *
 * The search happens **once**, on mount: `getComputedStyle` forces a style
 * computation, and calling it per frame would cost more than the whole rest of
 * the component.
 */
function scrollingContainer(element: Element): HTMLElement | null {
  let parent = element.parentElement
  while (parent !== null) {
    const overflow = getComputedStyle(parent).overflowY
    if (overflow === 'auto' || overflow === 'scroll') return parent
    parent = parent.parentElement
  }
  return null
}

/**
 * Vertical timeline whose line follows the scroll.
 *
 * @example
 * <Timeline
 *   label="Project history"
 *   events={[
 *     { date: 'January 2024', dateTime: '2024-01', title: 'First entry' },
 *     { date: 'June 2024', dateTime: '2024-06', title: 'The registry opens' },
 *   ]}
 * />
 */
export function Timeline({ events, label, title, ...rest }: TimelineProps): ReactElement {
  const { reduced } = useMotionState()
  const [frame, setFrame] = useState<HTMLDivElement | null>(null)
  const milestones = useRef<(HTMLLIElement | null)[]>([])
  const last = useRef(-1)

  ensureTimelineRules()

  useEffect(() => {
    if (frame === null || reduced) return

    /** Milestone state, so the DOM is written only on a crossing. */
    let reachedCount = -1
    const container = scrollingContainer(frame)

    const subscription = clock.subscribe(
      () => {
        const box = frame.getBoundingClientRect()
        if (box.height === 0) return

        const field =
          container === null
            ? { top: 0, height: window.innerHeight }
            : {
                top: container.getBoundingClientRect().top,
                height: container.clientHeight,
              }

        // The reference is the middle of the viewport: the line is then where
        // the eye reads, and not at an edge nobody looks at.
        const mark = field.top + field.height / 2 - box.top
        const p = Math.min(1, Math.max(0, mark / box.height))

        // Hundredths are enough: the variable is written only when it really
        // changes, which avoids a style invalidation per frame on a still
        // timeline.
        const hundredth = Math.round(p * 100)
        if (hundredth !== last.current) {
          last.current = hundredth
          frame.style.setProperty('--o-timeline-p', (hundredth / 100).toFixed(2))
        }

        const crossed = Math.floor(p * milestones.current.length)
        if (crossed === reachedCount) return
        reachedCount = crossed
        milestones.current.forEach((milestone, index) => {
          if (milestone === null) return
          if (index < crossed) milestone.setAttribute('data-o-timeline-atteint', '')
          else milestone.removeAttribute('data-o-timeline-atteint')
        })
      },
      { name: 'vertical timeline', priority: CLOCK_PRIORITY.layout },
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [frame, reduced, events.length])

  const { className, style } = mergePresentation(
    { className: 'o-flex o-flex-col o-gap-8' },
    rest,
  )

  return (
    <section
      {...rest}
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

      <div ref={setFrame} data-o-timeline-cadre="">
        <span
          aria-hidden
          data-o-timeline-rail=""
          style={{ backgroundColor: 'var(--o-theme-line)' }}
        />
        <span
          aria-hidden
          data-o-timeline-fill=""
          style={{ backgroundColor: 'var(--o-palette-brand-500)' }}
        />

        <ol data-o-timeline="">
          {events.map((event, index) => (
            <li
              key={`${event.date}-${event.title}`}
              ref={(element) => {
                milestones.current[index] = element
              }}
              // Without motion, everything is reached from the first render:
              // the stylesheet says so too, but the attribute avoids depending
              // on a rule the caller could override.
              data-o-timeline-atteint={reduced ? '' : undefined}
            >
              <span
                aria-hidden
                data-o-timeline-point=""
                style={{ backgroundColor: 'var(--o-palette-brand-500)' }}
              />
              <div data-o-timeline-corps="">
                <time
                  {...(event.dateTime === undefined ? {} : { dateTime: event.dateTime })}
                  className="o-font-mono o-text-xs"
                  style={{ color: 'var(--o-theme-muted)' }}
                >
                  {event.date}
                </time>
                <h3
                  className="o-mt-1 o-text-lg o-font-semibold o-tracking-tight"
                  style={{ color: 'var(--o-theme-fg)' }}
                >
                  {event.title}
                </h3>
                {event.body !== undefined && (
                  <div
                    className="o-mt-2 o-text-sm o-leading-relaxed"
                    style={{ color: 'var(--o-theme-muted)' }}
                  >
                    {event.body}
                  </div>
                )}
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

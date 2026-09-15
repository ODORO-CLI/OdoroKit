/**
 * Orbital timeline: steps laid out on a circle, which rotates.
 *
 * ## The rotation goes through the engine loop
 *
 * The original implementation opened a fifty millisecond `setInterval` and set
 * the angle in a React state. Three consequences, two of which are invisible
 * in development:
 *
 * 1. a full React render twenty times a second, to move elements that the
 *    compositor knows how to move on its own;
 * 2. a cadence that does not follow the one of the screen — so a motion that
 *    stutters on a hundred and twenty frame display, and drifts on a
 *    background tab, where timers are slowed down but not stopped;
 * 3. no stop off screen.
 *
 * The angle therefore lives in a ref, the single loop advances it according to
 * the elapsed time, and the positions are written directly in style. No React
 * render during the rotation.
 *
 * ## What stays a state, and why
 *
 * The open step. It changes the structure of the document — a card appears —
 * and only React can do that. It changes once per click, not twenty times a
 * second.
 *
 * ## This is not a timeline in the markup sense
 *
 * It is a list of steps, and it is marked up as such: `<ul>`, `<li>`, one
 * button per step. The circular layout is presentation. With the keyboard, one
 * tabs from a step to the next in the order of the list, and not in the order
 * in which the circle placed them — which is the only stable order.
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
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactElement,
  type ReactNode,
} from 'react'

/** Progress state of a step. */
export type OrbitalStatus = 'done' | 'current' | 'todo'

/** One step of the timeline. */
export interface OrbitalStep {
  /** Identifier, unique within the timeline. */
  readonly id: string
  /** Title displayed under the node. */
  readonly title: string
  /** Date or time marker, displayed in the card. */
  readonly date?: string
  /** Body of the card. */
  readonly content?: ReactNode
  /** Glyph of the node. Slot: the registry provides none. */
  readonly icon?: ReactNode
  /** Identifiers of the related steps, highlighted on opening. */
  readonly relatedIds?: readonly string[]
  /** Progress. @defaultValue 'todo' */
  readonly status?: OrbitalStatus
  /** Energy, from 0 to 100. It draws the halo and the gauge. */
  readonly energy?: number
}

/** Properties of the component itself. */
export interface OrbitalTimelineOwnProps {
  /** The steps, in the order in which they follow one another. */
  steps: readonly OrbitalStep[]
  /** Radius of the circle, in pixels. @defaultValue 200 */
  radius?: number
  /** Turns per minute. Zero holds the timeline still. @defaultValue 1 */
  rpm?: number
  /** Label of the list, for assistive technologies. */
  label?: string
}

/** All the properties. */
export type OrbitalTimelineProps = Customisable<OrbitalTimelineOwnProps, 'section'>

/** Identifier of the injected stylesheet. */
const STYLE_ID = 'o-orbital-timeline'

/** Sets the rules of the timeline, once per document. */
function ensureOrbitalRules(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    // The core breathes, and its two rings spread outwards.
    '[data-o-orbital-core]{animation:o-orbital-beat 2s var(--o-ease-standard) infinite}',
    '[data-o-orbital-ring]{animation:o-orbital-ping 2s var(--o-ease-out) infinite}',
    '[data-o-orbital-ring="2"]{animation-delay:0.5s}',
    '@keyframes o-orbital-beat{0%,100%{opacity:1}50%{opacity:0.55}}',
    '@keyframes o-orbital-ping{75%,100%{transform:scale(2);opacity:0}}',

    // The halo of a related step, long enough for it to be noticed.
    '[data-o-orbital-halo="on"]{animation:o-orbital-beat 1s var(--o-ease-standard) infinite}',

    '@media (prefers-reduced-motion:reduce){',
    '[data-o-orbital-core],[data-o-orbital-ring],[data-o-orbital-halo="on"]{',
    'animation:none}}',
  ].join('')
  document.head.append(style)
}

/** Classes of the progress badge. */
const STATUS_CLASS: Readonly<Record<OrbitalStatus, string>> = {
  done: 'o-bg-emerald-500 o-text-zinc-950',
  current: 'o-bg-zinc-50 o-text-zinc-950',
  todo: 'o-bg-zinc-800 o-text-zinc-300',
}

/** Label of the progress. */
const STATUS_LABEL: Readonly<Record<OrbitalStatus, string>> = {
  done: 'Done',
  current: 'In progress',
  todo: 'Upcoming',
}

/**
 * Orbital timeline.
 *
 * @example
 * <OrbitalTimeline
 *   steps={[
 *     { id: 'plan', title: 'Scoping', date: 'January', status: 'done', energy: 100 },
 *     { id: 'build', title: 'Build', date: 'March', status: 'current', energy: 60,
 *       relatedIds: ['plan'] },
 *   ]}
 * />
 *
 * @example
 * // Still: the circular layout without the rotation.
 * <OrbitalTimeline steps={steps} rpm={0} />
 */
export function OrbitalTimeline({
  steps,
  radius = 200,
  rpm = 1,
  label = 'Steps',
  ...rest
}: OrbitalTimelineProps): ReactElement {
  const { reduced } = useMotionState()
  const [open, setOpen] = useState<string | null>(null)

  /** Current angle, in turns. A ref: the rotation must render nothing. */
  const turns = useRef(0)
  const nodes = useRef<Map<string, HTMLElement>>(new Map())
  const host = useRef<HTMLDivElement | null>(null)

  ensureOrbitalRules()

  const related = useCallback(
    (id: string): readonly string[] =>
      steps.find((step) => step.id === id)?.relatedIds ?? [],
    [steps],
  )

  // The placement. It runs on every frame during the rotation, and a single
  // time when it is stopped — the write is the same, only the source of the
  // angle changes.
  useEffect(() => {
    const place = (): void => {
      const count = steps.length
      if (count === 0) return

      steps.forEach((step, index) => {
        const element = nodes.current.get(step.id)
        if (element === undefined) return

        const angle = ((index / count + turns.current) % 1) * Math.PI * 2
        const x = Math.cos(angle) * radius
        const y = Math.sin(angle) * radius

        element.style.transform = `translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,0)`
        // The nodes at the back go behind and fade out: that is what gives the
        // depth, without perspective nor 3D transform.
        element.style.zIndex = String(Math.round(100 + 50 * Math.cos(angle)))
        element.style.opacity =
          step.id === open ? '1' : (0.4 + 0.6 * ((1 + Math.sin(angle)) / 2)).toFixed(3)
      })
    }

    place()

    // Stopped on request, under reduced motion, or while a card is open: it
    // would carry its card out of the frame.
    if (reduced || rpm === 0 || open !== null) return

    const subscription = clock.subscribe(
      ({ delta }) => {
        turns.current = (turns.current + (delta * rpm) / 60) % 1
        place()
      },
      { name: 'orbital-timeline', priority: CLOCK_PRIORITY.layout },
    )

    return () => subscription.unsubscribe()
  }, [steps, radius, rpm, reduced, open])

  const { className, style } = mergePresentation(
    { className: 'o-relative o-flex o-min-h-screen o-items-center o-justify-center' },
    rest,
  )

  return (
    <section {...rest} className={className} style={style}>
      <div
        ref={host}
        className="o-relative o-flex o-h-full o-w-full o-items-center o-justify-center"
      >
        {/* The core, and its two rings. */}
        <div
          aria-hidden
          data-o-orbital-core
          className="o-absolute o-flex o-h-16 o-w-16 o-items-center o-justify-center o-rounded-full o-bg-gradient-to-br o-from-brand-500 o-to-fuchsia-500"
        >
          <span
            data-o-orbital-ring="1"
            className="o-absolute o-h-20 o-w-20 o-rounded-full o-border-w-1 o-border-zinc-400"
          />
          <span
            data-o-orbital-ring="2"
            className="o-absolute o-h-24 o-w-24 o-rounded-full o-border-w-1 o-border-zinc-500"
          />
          <span className="o-h-8 o-w-8 o-rounded-full o-bg-zinc-50" />
        </div>

        {/* The circle on which the steps are placed. */}
        <div
          aria-hidden
          className="o-absolute o-rounded-full o-border-w-1 o-border-zinc-800"
          style={{ width: radius * 2, height: radius * 2 }}
        />

        {/* The steps: a list, despite the circle. What counts at the keyboard
            is the order, and it is the timeline's, not the screen's. */}
        <ul aria-label={label} className="o-absolute o-list-none o-p-0">
          {steps.map((step) => {
            const status = step.status ?? 'todo'
            const energy = step.energy ?? 0
            const isOpen = step.id === open
            const isRelated = open !== null && related(open).includes(step.id)

            return (
              <li
                key={step.id}
                ref={(element) => {
                  if (element === null) nodes.current.delete(step.id)
                  else nodes.current.set(step.id, element)
                }}
                className="o-absolute"
                style={{ willChange: 'transform' }}
              >
                <button
                  type="button"
                  aria-expanded={isOpen}
                  onClick={() => setOpen(isOpen ? null : step.id)}
                  className="o-relative o-flex o-flex-col o-items-center o-gap-2 o-bg-transparent"
                >
                  {/* The halo: its size tells the energy of the step. */}
                  <span
                    aria-hidden
                    data-o-orbital-halo={isRelated ? 'on' : 'off'}
                    className="o-absolute o-rounded-full o-bg-zinc-50 o-opacity-10"
                    style={{
                      width: energy * 0.5 + 40,
                      height: energy * 0.5 + 40,
                      top: -(energy * 0.5) / 2,
                    }}
                  />
                  <span
                    className={`o-relative o-flex o-h-10 o-w-10 o-items-center o-justify-center o-rounded-full o-border-w-1 ${
                      isOpen
                        ? 'o-bg-zinc-50 o-text-zinc-950 o-border-zinc-50'
                        : isRelated
                          ? 'o-bg-zinc-300 o-text-zinc-950 o-border-zinc-50'
                          : 'o-bg-zinc-950 o-text-zinc-50 o-border-zinc-700'
                    }`}
                  >
                    {step.icon}
                  </span>
                  <span
                    className={`o-whitespace-nowrap o-text-xs o-font-semibold o-tracking-wide ${
                      isOpen ? 'o-text-zinc-50' : 'o-text-zinc-400'
                    }`}
                  >
                    {step.title}
                  </span>
                </button>

                {isOpen ? (
                  <div
                    style={{ transform: 'translateX(-50%)' }}
                    className="o-absolute o-left-1/2 o-top-24 o-w-64 o-rounded-lg o-border-w-1 o-border-zinc-700 o-bg-zinc-950 o-p-4 o-text-left o-backdrop-blur-md"
                  >
                    <div className="o-flex o-items-center o-justify-between o-gap-2">
                      <span
                        className={`o-rounded-full o-px-2 o-py-0.5 o-text-xs o-font-semibold ${STATUS_CLASS[status]}`}
                      >
                        {STATUS_LABEL[status]}
                      </span>
                      {step.date === undefined ? null : (
                        <span className="o-font-mono o-text-xs o-text-zinc-500">
                          {step.date}
                        </span>
                      )}
                    </div>

                    <h3 className="o-mt-2 o-text-sm o-font-semibold o-text-zinc-50">
                      {step.title}
                    </h3>

                    {step.content === undefined ? null : (
                      <div className="o-mt-2 o-text-xs o-text-zinc-300">
                        {step.content}
                      </div>
                    )}

                    <div className="o-mt-4 o-border-t o-border-zinc-800 o-pt-3">
                      <div className="o-flex o-items-center o-justify-between o-text-xs o-text-zinc-400">
                        <span>Energy</span>
                        <span className="o-font-mono">{energy}%</span>
                      </div>
                      {/* A native gauge: read by assistive technologies
                          without having to describe the bar. */}
                      <progress
                        value={energy}
                        max={100}
                        className="o-mt-1 o-h-1 o-w-full"
                      >
                        {energy}%
                      </progress>
                    </div>

                    {(step.relatedIds ?? []).length === 0 ? null : (
                      <div className="o-mt-4 o-border-t o-border-zinc-800 o-pt-3">
                        <p className="o-mb-2 o-text-xs o-uppercase o-tracking-wide o-text-zinc-400">
                          Related steps
                        </p>
                        <div className="o-flex o-flex-wrap o-gap-1">
                          {(step.relatedIds ?? []).map((id) => (
                            <button
                              key={id}
                              type="button"
                              onClick={() => setOpen(id)}
                              className="o-rounded-sm o-border-w-1 o-border-zinc-700 o-bg-transparent o-px-2 o-py-0.5 o-text-xs o-text-zinc-300 hover:o-text-zinc-50"
                            >
                              {steps.find((other) => other.id === id)?.title ?? id}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : null}
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}

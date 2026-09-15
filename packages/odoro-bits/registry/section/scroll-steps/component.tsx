/**
 * Steps on scroll: a sticky media, steps that scroll past.
 *
 * ## The index only changes when a step is crossed
 *
 * Scroll progress is continuous, the active step is not. If React state
 * followed the progress it would change on every frame and cause one render per
 * frame — to show the same media most of the time.
 *
 * The progress is therefore read in the loop, but the state is only written
 * when the computed index differs from the current one. On a section of four
 * steps, that makes three renders instead of several hundred.
 *
 * ## What stays readable without scrolling
 *
 * Every step is in the document, in order, and the media carries the name of
 * the active step. On a small screen the sticky column moves above and the
 * content reads like an ordinary sequence. A section that existed only on
 * scroll would be empty for whoever does not scroll.
 *
 * @module
 */

import {
  mergePresentation,
  useMotionState,
  useScrollScrub,
  type Customisable,
} from '@odoro-cli/engine'
import { useCallback, useRef, useState, type ReactElement, type ReactNode } from 'react'

/** One step. */
export interface Step {
  /** Heading. */
  readonly title: string
  /** Content. */
  readonly body: ReactNode
}

/** Props specific to the component. */
export interface ScrollStepsOwnProps {
  /** The steps, in reading order. */
  steps: readonly Step[]
  /** Renders the media for the active step. */
  render: (index: number) => ReactNode
  /** Section name, announced to assistive technologies. */
  label: string
}

/** All props. */
export type ScrollStepsProps = Customisable<ScrollStepsOwnProps>

/**
 * Makes a media follow the steps of a text.
 *
 * @example
 * <ScrollSteps
 *   label="How it works"
 *   steps={[
 *     { title: 'Write', body: <p>A registry entry…</p> },
 *     { title: 'Validate', body: <p>The schema rejects…</p> },
 *   ]}
 *   render={(index) => <Illustration step={index} />}
 * />
 */
export function ScrollSteps({
  steps,
  render,
  label,
  ...rest
}: ScrollStepsProps): ReactElement {
  const { reduced } = useMotionState()
  const [active, setActive] = useState(0)
  const current = useRef(0)

  const onProgress = useCallback(
    (progress: number) => {
      const index = Math.min(
        steps.length - 1,
        Math.max(0, Math.floor(progress * steps.length)),
      )
      // The state is only written when a step is crossed: the progress is
      // continuous, the index is not.
      if (index !== current.current) {
        current.current = index
        setActive(index)
      }
    },
    [steps.length],
  )

  const { ref } = useScrollScrub<HTMLDivElement>(onProgress, {
    name: 'scroll steps',
  })

  const { className, style } = mergePresentation(
    { className: 'o-grid o-gap-8 lg:o-grid-cols-2' },
    rest,
  )

  return (
    <section {...rest} ref={ref} aria-label={label} className={className} style={style}>
      {/*
        On a small screen the sticky column moves above and stops sticking: two
        stacked columns one of which stays pinned would give a media that covers
        the text.
      */}
      <div className="lg:o-sticky lg:o-top-24 lg:o-self-start">
        <div className="o-overflow-hidden o-rounded-xl o-border-w-1 o-border-zinc-200 dark:o-border-zinc-800">
          {render(active)}
        </div>
      </div>

      <ol className="o-flex o-flex-col o-gap-10">
        {steps.map((step, index) => (
          <li
            key={step.title}
            aria-current={index === active ? 'step' : undefined}
            className="o-flex o-flex-col o-gap-2 o-transition-opacity"
            style={{ opacity: reduced || index === active ? 1 : 0.45 }}
          >
            <span className="o-font-mono o-text-xs o-text-zinc-500 dark:o-text-zinc-400">
              {String(index + 1).padStart(2, '0')}
            </span>
            <h3 className="o-text-xl o-font-semibold o-tracking-tight">{step.title}</h3>
            <div className="o-text-zinc-500 dark:o-text-zinc-400">{step.body}</div>
          </li>
        ))}
      </ol>
    </section>
  )
}

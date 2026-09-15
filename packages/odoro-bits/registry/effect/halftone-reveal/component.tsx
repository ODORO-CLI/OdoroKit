/**
 * Halftone reveal: tight dots retract as the page scrolls.
 *
 * ## A veil of dots, not a mask on the content
 *
 * Like the banded curtain, the pattern is **laid on top**: the content is
 * rendered normally from the first frame, and stays readable to in-page search
 * as well as to a screen reader. Masking the content itself would take it away
 * from those who will never see the effect.
 *
 * The veil is a single element, not a grid: one repeated radial gradient draws
 * every dot at once. An ordinary area would count several thousand of them; as
 * many document elements would cost more than the whole rest of the page.
 *
 * ## How a dot disappears
 *
 * At zero radius, there is nothing. Beyond seven tenths of the step, the
 * neighbouring discs overlap and the veil becomes a flat fill: that is where
 * the pattern starts, and it melts down to zero. In between, one sees exactly
 * what is expected of a printing halftone getting lighter.
 *
 * ## Scrolling goes through the loop, never through a render
 *
 * The progress is measured in the engine's single loop and written into a CSS
 * variable. Carrying it in React state would render the page on every notch of
 * the wheel, to change a radius that the compositor applies on its own.
 *
 * When the pattern has finished withdrawing, the veil leaves the DOM and the
 * subscription unsubscribes: nothing measures any more, nothing covers any
 * more.
 *
 * Under reduced motion, the veil is never rendered — that is the final state.
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
  useState,
  type CSSProperties,
  type ReactElement,
  type ReactNode,
} from 'react'

/** Properties specific to the component. */
export interface HalftoneRevealOwnProps {
  /** Revealed content. */
  children: ReactNode
  /** Step of the pattern, in pixels. @defaultValue 16 */
  cell?: number
  /**
   * Share of the window height over which the reveal plays out.
   *
   * @defaultValue 0.55
   */
  travel?: number
  /** Delay before the start, as a share of window height. @defaultValue 0.15 */
  offset?: number
  /** Colour of the pattern. @defaultValue the theme background */
  color?: string
}

/** All properties. */
export type HalftoneRevealProps = Customisable<HalftoneRevealOwnProps>

/**
 * Radius of a dot, as a fraction of the step, when the veil is still full.
 *
 * Half the diagonal of a cell is roughly 0.707: beyond it, the neighbouring
 * discs overlap and no gap is left. It is the only radius from which the
 * pattern really hides.
 */
const FULL_RADIUS = 0.72

/**
 * Reveals its content through a pattern that lightens as the page scrolls.
 *
 * @example
 * <HalftoneReveal>
 *   <img src="/plate.jpg" alt="Plate from issue 12" />
 * </HalftoneReveal>
 *
 * @example
 * // A wide pattern, which starts earlier and withdraws faster.
 * <HalftoneReveal cell={28} offset={0.05} travel={0.35}>
 *   <section className="o-p-8">…</section>
 * </HalftoneReveal>
 */
export function HalftoneReveal({
  children,
  cell = 16,
  travel = 0.55,
  offset = 0.15,
  color = 'var(--o-theme-bg, currentColor)',
  ...rest
}: HalftoneRevealProps): ReactElement {
  const { reduced } = useMotionState()
  const [host, setHost] = useState<HTMLDivElement | null>(null)
  const [veil, setVeil] = useState<HTMLDivElement | null>(null)
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (host === null || veil === null || reduced || done) return

    const pitch = Math.max(2, cell)
    let last = -1

    const subscription = clock.subscribe(
      () => {
        const box = host.getBoundingClientRect()
        const view = window.innerHeight || 1
        const span = Math.max(view * travel, 1)

        // Zero when the top of the area touches the bottom of the window, one
        // when it has risen by `travel` window heights — the delay shifts the
        // start further into the viewport.
        const progress = (view * (1 - offset) - box.top) / span
        const clamped = Math.min(1, Math.max(0, progress))
        if (Math.abs(clamped - last) < 0.005) return
        last = clamped

        veil.style.setProperty(
          '--o-halftone-radius',
          `${(FULL_RADIUS * pitch * (1 - clamped)).toFixed(2)}px`,
        )

        // Nothing left to hide: the veil leaves, and the measurement with it.
        if (clamped >= 1) setDone(true)
      },
      { priority: CLOCK_PRIORITY.layout, name: 'reveal halftone' },
    )

    return () => subscription.unsubscribe()
  }, [host, veil, reduced, done, cell, travel, offset])

  const { className, style } = mergePresentation(
    { className: 'o-relative o-overflow-hidden' },
    rest,
  )

  const pitch = `${String(Math.max(2, cell))}px`

  return (
    <div {...rest} ref={setHost} className={className} style={style}>
      {children}
      {reduced || done ? null : (
        <div
          aria-hidden
          ref={setVeil}
          style={
            {
              position: 'absolute',
              inset: 0,
              pointerEvents: 'none',
              '--o-halftone-radius': `${(FULL_RADIUS * Math.max(2, cell)).toFixed(2)}px`,
              // A single repeated gradient draws the whole pattern: the radius
              // is the only value that moves.
              backgroundImage: `radial-gradient(circle at center, ${color} var(--o-halftone-radius), transparent calc(var(--o-halftone-radius) + 0.5px))`,
              backgroundSize: `${pitch} ${pitch}`,
            } as CSSProperties
          }
        />
      )}
    </div>
  )
}

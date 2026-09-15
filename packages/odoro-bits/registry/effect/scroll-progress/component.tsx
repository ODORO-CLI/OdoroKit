/**
 * Reading progress bar.
 *
 * ## What this component shows
 *
 * It is the reference implementation of the customisation contract: the five
 * levels are all here, and in this order.
 *
 * 1. **Tokens** — the colour and the duration come from
 *    `--o-palette-brand-600` and `--o-duration-fast`. Changing the theme
 *    changes the bar, without touching it.
 * 2. **Props** — `target`, `thickness`, `position`.
 * 3. **Pass-through** — `className`, `style` and the DOM attributes land on
 *    the root element, with the component's own classes preserved.
 * 4. **Render slot** — `children` receives the progress and replaces the bar,
 *    keeping the measurement.
 * 5. **`onReady`** — gives the imperative reading, for what none of the
 *    preceding levels allows.
 *
 * ## Why the progress is not React state
 *
 * It changes on every frame. Rendering it as state would cause sixty renders
 * per second over the whole scroll of the page, to move a rectangle that the
 * compositor already knows how to animate on its own. The value is therefore
 * written directly into the `transform` of the bar.
 *
 * The render slot is the exception, and a deliberate one: somebody who wants
 * to display a percentage in figures needs a render. It only happens if a slot
 * is supplied, and its rate is capped — see `sampling`.
 *
 * @module
 */

import {
  mergePresentation,
  useOnReady,
  useScrollScrub,
  type Customisable,
  type ReadyCallback,
  type Slot,
} from '@odoro-cli/engine'
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactElement,
  type RefObject,
} from 'react'

/** Imperative reading offered to the escape hatch. */
export interface ScrollProgressControls {
  /** Current progress, from 0 to 1. */
  read(): number
  /** The element of the bar, to take over its rendering entirely. */
  readonly bar: HTMLElement | null
}

/** What the render slot receives. */
export interface ScrollProgressState {
  /** Current progress, from 0 to 1. */
  readonly progress: number
}

/** Properties specific to the component. */
export interface ScrollProgressOwnProps {
  /** Element whose reading is followed. By default, the whole page. */
  target?: RefObject<HTMLElement | null>
  /** Thickness of the bar, in pixels. @defaultValue 3 */
  thickness?: number
  /** Edge the bar is anchored to. @defaultValue 'top' */
  position?: 'top' | 'bottom'
  /** Render slot. Replaces the bar while keeping the measurement. */
  children?: Slot<ScrollProgressState>
  /** Escape hatch, called once the measurement is in place. */
  onReady?: ReadyCallback<ScrollProgressControls>
}

/** All properties: its own, plus those of a `div`. */
export type ScrollProgressProps = Customisable<ScrollProgressOwnProps>

/**
 * Sampling step of the render slot, in hundredths.
 *
 * Without it, a slot would cause one React render per frame. A hundred steps
 * are finer than what a percentage display can show, and divide the number of
 * renders by the order of magnitude that separates a frame from a hundredth of
 * the run.
 */
const SAMPLING = 100

/**
 * Reading progress bar.
 *
 * @example
 * // The common case: nothing to set.
 * <ScrollProgress />
 *
 * @example
 * // Levels 3 and 4: placed in the layout, and rendering replaced.
 * <ScrollProgress className="o-z-50" position="bottom">
 *   {({ progress }) => <span>{Math.round(progress * 100)} %</span>}
 * </ScrollProgress>
 *
 * @example
 * // Level 5: what the API did not foresee.
 * <ScrollProgress
 *   onReady={({ handle, motion }) => {
 *     if (motion.reduced) return
 *     const timer = setInterval(() => console.log(handle.read()), 1000)
 *     return () => clearInterval(timer)
 *   }}
 * />
 */
export function ScrollProgress({
  target,
  thickness = 3,
  position = 'top',
  children,
  onReady,
  ...rest
}: ScrollProgressProps): ReactElement {
  const bar = useRef<HTMLDivElement | null>(null)
  const progress = useRef(0)

  // The slot does not exist most of the time: the state is then never written,
  // and the component causes no render during the scroll.
  const [sampled, setSampled] = useState(0)
  const hasSlot = children !== undefined

  const onProgress = useCallback(
    (value: number) => {
      progress.current = value
      if (bar.current !== null) bar.current.style.transform = `scaleX(${String(value)})`

      if (hasSlot) {
        const step = Math.round(value * SAMPLING)
        setSampled((previous) => (previous === step ? previous : step))
      }
    },
    [hasSlot],
  )

  // The observed element is resolved on every render rather than read once at
  // mount. A target placed **further down the tree** than this bar — the
  // natural case, since a bar is laid at the top — still has an empty ref when
  // the effects run: the progress then stayed at zero, with no error and no
  // trigger registered.
  const [observed, setObserved] = useState<HTMLElement | null>(null)
  // With no dependency list, deliberately: `target.current` fills in after the
  // commit without `target` changing, so no dependency would signal its
  // arrival. The rule fears a chain of updates; it cannot happen here, since
  // `setState` with the same value causes no render.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const next = target === undefined ? document.documentElement : target.current
    // `setState` with the same value causes no render: resolving on every
    // render therefore costs nothing once the target is found.
    setObserved(next)
  })

  useScrollScrub<HTMLElement>(onProgress, {
    element: observed,
    // Bounds of a reading, not of a crossing: the progress starts when the top
    // of the content reaches the top of the window, and ends when its bottom
    // reaches the bottom. The default bounds would measure the passage of the
    // element through the viewport, which is not the same thing.
    start: 'top top',
    end: 'bottom bottom',
    name: 'reading progress',
  })

  const [host, setHost] = useState<HTMLElement | null>(null)
  const controls = useRef<ScrollProgressControls>({
    read: () => progress.current,
    get bar() {
      return bar.current
    },
  })
  useOnReady(onReady, controls.current, host)

  const { className, style } = mergePresentation(
    { className: 'o-fixed o-inset-x-0 o-pointer-events-none' },
    rest,
  )

  return (
    <div
      {...rest}
      ref={setHost}
      className={className}
      style={{ [position]: 0, ...style }}
      role="progressbar"
      aria-hidden={hasSlot ? undefined : true}
    >
      {children === undefined ? (
        <div
          ref={bar}
          style={{
            height: `${String(thickness)}px`,
            background: 'var(--o-palette-brand-600)',
            transform: 'scaleX(0)',
            transformOrigin: 'left',
            // The bar follows the scroll: the transition only smooths the
            // jumps, it does not animate the run itself.
            transition: 'opacity var(--o-duration-fast) linear',
            willChange: 'transform',
          }}
        />
      ) : (
        children({ progress: sampled / SAMPLING })
      )}
    </div>
  )
}

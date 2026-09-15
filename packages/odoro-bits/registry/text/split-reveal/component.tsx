/**
 * Reveal of a heading, fragment by fragment.
 *
 * ## The starting state, and the safety net that goes with it
 *
 * The fragments must be invisible before the animation begins. But the
 * splitting happens inside an effect, after the first render: without
 * precaution, the heading appears in full, then disappears to recompose
 * itself. The flicker is brief and perfectly visible.
 *
 * The element therefore carries a pending attribute, set from the render,
 * which a CSS rule turns into zero opacity. So far, nothing original.
 *
 * What matters is what follows. The splitting may never happen: the plugin may
 * fail to load, on a network that drops or behind a blocker. The pending state
 * would then be lifted by nobody, and the heading would stay invisible — not
 * "without an animation", **invisible**. It is the worst possible fault for a
 * text component, and it does not show in development, where everything loads.
 *
 * The pending state is therefore lifted whatever happens: on the split if it
 * comes, otherwise after a delay. The worst case becomes "the heading arrives
 * a second late" instead of "the heading never arrives".
 *
 * ## Under reduced motion
 *
 * No split, no waiting, no attribute: the heading is simply there. The
 * animation is neutralised, never the final state.
 *
 * @module
 */

import {
  mergePresentation,
  useMotionState,
  useOnReady,
  useSplitText,
  useTimeline,
  type Customisable,
  type ReadyCallback,
  type SplitBy,
} from '@odoro-cli/engine'
import {
  useEffect,
  useState,
  type ElementType,
  type ReactElement,
  type ReactNode,
} from 'react'

/** What the escape hatch receives. */
export interface SplitRevealControls {
  /** Fragments produced by the split, in the order of the text. */
  readonly parts: readonly Element[]
  /** Granularity actually used. */
  readonly by: SplitBy
}

/** Properties specific to the component. */
export interface SplitRevealOwnProps {
  /** Text to reveal. */
  children: ReactNode
  /** Rendered tag. @defaultValue 'h2' */
  as?: ElementType
  /** Granularity of the split. @defaultValue 'chars' */
  by?: SplitBy
  /** Offset between two fragments, in milliseconds. @defaultValue 24 */
  stagger?: number
  /** Entry duration of one fragment, in milliseconds. @defaultValue 600 */
  duration?: number
  /** Height of the rise, in pixels. Zero for a plain fade. @defaultValue 24 */
  distance?: number
  /** Escape hatch, called once the split is done. */
  onReady?: ReadyCallback<SplitRevealControls>
}

/** All properties. */
export type SplitRevealProps = Customisable<SplitRevealOwnProps, 'div'>

/** Attribute carried while the split is pending. */
const PENDING = 'data-o-split-pending'

/**
 * Delay after which the pending state is lifted without a split, in
 * milliseconds.
 *
 * The split happens in the effect that follows the mount: one second is an
 * order of magnitude beyond that. The value does not have to be right, only to
 * bound the worst case.
 */
const RESCUE_MS = 1000

/** Identifier of the injected stylesheet. */
const STYLE_ID = 'o-split-reveal'

/**
 * Sets the starting-state rule, once per document.
 *
 * It cannot be an inline style: the attribute must already hide the element on
 * the first render, before a single effect runs.
 */
function ensureHiddenRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = `[${PENDING}]{opacity:0}`
  document.head.append(style)
}

/**
 * Reveals a text fragment by fragment.
 *
 * @example
 * <SplitReveal as="h1" by="words" className="o-text-5xl o-font-bold">
 *   Build living interfaces
 * </SplitReveal>
 *
 * @example
 * // Level 5: taking control of the fragments.
 * <SplitReveal
 *   onReady={({ handle }) => {
 *     handle.parts.forEach((part, index) => {
 *       part.setAttribute('data-index', String(index))
 *     })
 *   }}
 * >
 *   A heading
 * </SplitReveal>
 */
export function SplitReveal({
  children,
  as: Tag = 'h2',
  by = 'chars',
  stagger = 24,
  duration = 600,
  distance = 24,
  onReady,
  ...rest
}: SplitRevealProps): ReactElement {
  const { reduced } = useMotionState()
  const [host, setHost] = useState<HTMLElement | null>(null)

  ensureHiddenRule()

  const split = useSplitText<HTMLElement>({ by })

  // The timeline is rebuilt when the settings change, and when the split
  // produces new fragments — which happens at mount, then on every re-split
  // into lines.
  const { ref: timelineRef } = useTimeline<HTMLElement>(
    ({ timeline }) => {
      if (split.parts.length === 0) return

      timeline.from([...split.parts], {
        opacity: 0,
        y: distance,
        duration: duration / 1000,
        stagger: stagger / 1000,
        ease: 'power3.out',
      })
    },
    [split.parts, stagger, duration, distance],
    { name: 'text reveal' },
  )

  // The safety net. See the explanation at the head of the module: without it,
  // a plugin that fails to load leaves the heading invisible for good.
  useEffect(() => {
    if (host === null || reduced) return

    if (split.ready) {
      host.removeAttribute(PENDING)
      return
    }

    const timer = setTimeout(() => host.removeAttribute(PENDING), RESCUE_MS)
    return () => clearTimeout(timer)
  }, [host, reduced, split.ready])

  useOnReady(onReady, split.ready ? { parts: split.parts, by } : null, host)

  const { className, style } = mergePresentation({}, rest)

  return (
    <Tag
      {...rest}
      ref={(element: HTMLElement | null) => {
        setHost(element)
        split.ref.current = element
        timelineRef.current = element
      }}
      className={className}
      style={style}
      // The attribute is only set if an animation is expected. The engine
      // takes care of the accessible label and of hiding the fragments:
      // repeating it here would make two truths to maintain.
      {...(reduced ? {} : { [PENDING]: '' })}
    >
      {children}
    </Tag>
  )
}

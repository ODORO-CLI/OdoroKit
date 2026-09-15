/**
 * The customisation contract.
 *
 * ## Five levels, and a sixth one you pay for
 *
 * A registry component is copied into the project: nothing prevents editing
 * its source. That is even the whole point of the copy. But every tweak is a
 * tweak to redo — `odoro diff` will report it as such, and the day the
 * upstream entry changes, it will have to be carried over by hand.
 *
 * The five levels below, on the other hand, survive a reinstall. They are
 * ordered by the distance you have to travel to reach them, and you only go
 * down a notch when the previous one is not enough.
 *
 * 1. **The tokens.** Changing a CSS variable modifies every component at once.
 *    Nothing to touch in the code.
 * 2. **The props.** The documented API, the one the properties table
 *    describes.
 * 3. **The pass-through.** `className`, `style`, `ref`, and the DOM
 *    attributes: placing the component in a layout, without knowing anything
 *    about its inside.
 * 4. **The render slot.** Replacing what is displayed while keeping the
 *    mechanics — the measurements, the subscriptions, the life cycle.
 * 5. **`onReady`.** The escape hatch: the imperative object itself, timeline
 *    or scene, for what the API did not anticipate.
 *
 * ## Why the fifth level exists
 *
 * Without an escape hatch, every unanticipated need becomes one more property.
 * After a year, the component has thirty of them, nobody knows which does
 * what any more, and half of them only serve a single project. `onReady`
 * absorbs those cases without widening the documented surface.
 *
 * @module
 */

import type { ComponentPropsWithRef, CSSProperties, ElementType } from 'react'

/**
 * The props of a registry component: its own, plus everything a host element
 * accepts.
 *
 * @typeParam Own Properties of the component itself.
 * @typeParam Host Element rendered at the root.
 *
 * @example
 * interface AuroraProps {
 *   speed?: number
 * }
 *
 * function Aurora({ speed = 0.12, ...rest }: Customisable<AuroraProps>) { … }
 */
export type Customisable<Own, Host extends ElementType = 'div'> = Own &
  Omit<ComponentPropsWithRef<Host>, keyof Own>

/** What a component applies to its root element. */
export interface Presentation {
  /** Classes, the component's then the caller's. */
  readonly className: string | undefined
  /** Inline styles, the caller's winning. */
  readonly style: CSSProperties | undefined
}

/**
 * Merges the component's presentation with the caller's.
 *
 * Classes are **concatenated**, never replaced: a component that overwrote its
 * own classes with the ones passed to it would lose its formatting as soon as
 * you only wanted to shift it by one notch.
 *
 * ## What concatenation does not do
 *
 * It does not guarantee that the caller wins. The order of the classes in the
 * attribute has **no** effect on the CSS cascade: between two rules of the
 * same specificity, the one that comes last **in the stylesheet** wins, not
 * the one that comes last in the `class`. This is a widespread confusion, and
 * the source of "why is my class not applying".
 *
 * Hence the place of level 3 on the ladder: it serves to **place** the
 * component — margins, position, width, where nothing is disputed — rather
 * than to repaint it. To repaint with certainty, there is a token above and
 * `style` below, which always wins.
 *
 * @example
 * const { className, style } = mergePresentation(
 *   { className: 'o-relative o-overflow-hidden' },
 *   props,
 * )
 */
export function mergePresentation(
  base: { className?: string | undefined; style?: CSSProperties | undefined },
  incoming: { className?: string | undefined; style?: CSSProperties | undefined },
): Presentation {
  const classes = [base.className, incoming.className].filter(
    (value): value is string => typeof value === 'string' && value.trim() !== '',
  )

  const hasStyle = base.style !== undefined || incoming.style !== undefined

  return {
    className: classes.length === 0 ? undefined : classes.join(' '),
    // The caller last: inline, the last write is the one that stays, and it is
    // the only place where winning is guaranteed.
    style: hasStyle ? { ...base.style, ...incoming.style } : undefined,
  }
}

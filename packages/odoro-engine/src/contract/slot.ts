/**
 * The render slot: level 4 of the contract.
 *
 * ## What a slot separates
 *
 * A registry component does two very different things: it **computes** —
 * measurements, subscriptions to the loop, progress, life cycle — and it
 * **displays**. The first part is what you came for; the second is almost
 * always to be redone, because one piece of markup rarely suits two mockups.
 *
 * The slot makes the second part replaceable without touching the first.
 * Without it, the only option left is to copy the whole component to change a
 * tag — and you then inherit the maintenance of all the computation.
 *
 * ## Why a function rather than `children`
 *
 * The slot receives what the component computed. Ordinary `children` would be
 * rendered once, outside that context, and would have access to nothing. The
 * function is what carries the state through to the markup.
 *
 * @module
 */

import type { ReactNode } from 'react'

/**
 * A render slot: receives the computed state, renders the markup.
 *
 * @typeParam Args What the component passes to its slot.
 */
export type Slot<Args> = (args: Args) => ReactNode

/**
 * Renders the slot if it is supplied, the default markup otherwise.
 *
 * The default is a **function**, not a value: computing it on every render
 * only to throw it away when a slot is supplied would be wasted work, and that
 * work often contains whole React elements.
 *
 * @example
 * return (
 *   <div ref={ref}>
 *     {fromSlot(children, { progress, ready }, () => (
 *       <span style={{ width: `${progress * 100}%` }} />
 *     ))}
 *   </div>
 * )
 */
export function fromSlot<Args>(
  slot: Slot<Args> | undefined,
  args: Args,
  fallback: () => ReactNode,
): ReactNode {
  return slot === undefined ? fallback() : slot(args)
}

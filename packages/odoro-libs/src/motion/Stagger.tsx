/**
 * Time offset of the reveal of a list of children.
 *
 * @module
 */

import {
  Children,
  type ComponentPropsWithoutRef,
  type ElementType,
  type ReactElement,
  type ReactNode,
  createElement,
} from 'react'

import { type RevealPresetName } from './presets.js'
import { Reveal, type RevealTiming } from './Reveal.jsx'

/** Properties of {@link Stagger}. */
export interface StaggerProps extends RevealTiming, ComponentPropsWithoutRef<'div'> {
  /** Rendered container element. @defaultValue 'div' */
  as?: ElementType
  /** Element wrapping each child. @defaultValue 'div' */
  itemAs?: ElementType
  /** Named starting state, passed on to each {@link Reveal}. */
  preset?: RevealPresetName
  /** Children to reveal one after the other. */
  children?: ReactNode
  /** Gap between two children, in milliseconds. @defaultValue 60 */
  step?: number
  /**
   * Ceiling of the cumulated delay, in milliseconds. Beyond it, all the
   * remaining children share the same delay: a list of a hundred elements must not
   * finish showing six seconds after the first one.
   *
   * @defaultValue 600
   */
  maxDelay?: number
  /** Plays the animation only once. @defaultValue true */
  once?: boolean
  /** Disables the animation. */
  disabled?: boolean
  /** Visible proportion triggering the reveal. @defaultValue 0.15 */
  threshold?: number
  /** Margin applied to the observation viewport. @defaultValue '0px' */
  rootMargin?: string
}

/**
 * Reveals its children one after the other, each with an increasing delay.
 *
 * Each child is observed individually: in a long list, only
 * those that actually enter the screen animate.
 *
 * @example
 * <Stagger step={80} className="o-grid o-grid-cols-3 o-gap-4">
 *   {items.map((item) => <Card key={item.id} {...item} />)}
 * </Stagger>
 */
export function Stagger({
  as = 'div',
  itemAs = 'div',
  children,
  preset,
  step = 60,
  maxDelay = 600,
  delay = 0,
  duration,
  easing,
  from,
  to,
  once = true,
  disabled = false,
  threshold = 0.15,
  rootMargin = '0px',
  ...rest
}: StaggerProps): ReactElement {
  const items = Children.toArray(children)

  return createElement(
    as,
    rest,
    items.map((child, index) => (
      <Reveal
        // The index is a stable identifier here: `Children.toArray` keeps
        // the original keys on the children, and this wrapper has no state.
        key={index}
        as={itemAs}
        preset={preset}
        delay={Math.min(delay + index * step, delay + maxDelay)}
        duration={duration}
        easing={easing}
        from={from}
        to={to}
        once={once}
        disabled={disabled}
        threshold={threshold}
        rootMargin={rootMargin}
      >
        {child}
      </Reveal>
    )),
  )
}

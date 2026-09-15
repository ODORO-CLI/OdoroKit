/**
 * Grid revealed in a cascade.
 *
 * ## Why CSS transitions and not a timeline
 *
 * Every element makes the same journey, offset in time. That is exactly what a
 * CSS transition with a delay knows how to do, and the compositor of the
 * browser handles it on its own: no JavaScript runs during the animation.
 *
 * A timeline would bring control over the middle of the run — a pause, a step
 * backwards, a chaining. None of that is useful here, and the price would be a
 * loaded orchestrator to move six cards once.
 *
 * ## The trigger, and what it must not break
 *
 * The intersection observer sets the attribute only once, then disconnects.
 * Replaying the cascade on every pass gives a page that fidgets when you scroll
 * back up, which is tiring more than it is elegant — hence `once` by default.
 *
 * And the starting state is only applied if the animation is really going to
 * take place. Under reduced motion the elements are simply there: a neutralised
 * cascade that left the grid invisible would be an accessibility defect, not a
 * respect of the preference.
 *
 * @module
 */

import { mergePresentation, useMotionState, type Customisable } from '@odoro-cli/engine'
import {
  Children,
  useEffect,
  useState,
  type CSSProperties,
  type ReactElement,
  type ReactNode,
} from 'react'

/** Props specific to the component. */
export interface RevealGridOwnProps {
  /** The elements of the grid. */
  children: ReactNode
  /** Columns beyond the medium breakpoint. @defaultValue 3 */
  columns?: number
  /** Offset between two elements, in milliseconds. @defaultValue 70 */
  stagger?: number
  /** Height of the rise, in pixels. @defaultValue 24 */
  distance?: number
  /** Does not replay when the section comes back into view. @defaultValue true */
  once?: boolean
}

/** All props. */
export type RevealGridProps = Customisable<RevealGridOwnProps>

/** Identifier of the injected stylesheet. */
const STYLE_ID = 'o-reveal-grid'

/**
 * Applies the starting state and the arrival, once per document.
 *
 * The starting state has to apply before the first painted render: setting it
 * from JavaScript would leave a frame where the grid appears whole before
 * disappearing to recompose itself.
 */
function ensureRevealRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-reveal-grid] > *{',
    'opacity:0;transform:translateY(var(--o-reveal-distance));',
    'transition:opacity var(--o-duration-slow) var(--o-ease-entrance),',
    'transform var(--o-duration-slow) var(--o-ease-entrance);',
    'transition-delay:var(--o-reveal-delay)}',
    '[data-o-reveal-grid-shown] > *{opacity:1;transform:none}',
    // The number of columns goes through a variable: one rule per possible
    // value would be either incomplete or endless, and a `style` set inside the
    // component would apply to every grid on the page.
    '@media (min-width:48rem){[data-o-reveal-grid]{grid-template-columns:repeat(var(--o-reveal-columns),minmax(0,1fr))}}',
    '@media (prefers-reduced-motion:reduce){',
    '[data-o-reveal-grid] > *{opacity:1;transform:none;transition:none}}',
  ].join('')
  document.head.append(style)
}

/**
 * Reveals a grid in a cascade.
 *
 * @example
 * <RevealGrid columns={3} stagger={60}>
 *   {projects.map((project) => (
 *     <article key={project.id}>…</article>
 *   ))}
 * </RevealGrid>
 */
export function RevealGrid({
  children,
  columns = 3,
  stagger = 70,
  distance = 24,
  once = true,
  ...rest
}: RevealGridProps): ReactElement {
  const { reduced } = useMotionState()
  const [host, setHost] = useState<HTMLElement | null>(null)
  ensureRevealRule()

  useEffect(() => {
    if (host === null || reduced) return

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            host.setAttribute('data-o-reveal-grid-shown', '')
            if (once) observer.disconnect()
          } else if (!once) {
            host.removeAttribute('data-o-reveal-grid-shown')
          }
        }
      },
      { threshold: 0.15 },
    )

    observer.observe(host)
    return () => observer.disconnect()
  }, [host, once, reduced])

  const { className, style } = mergePresentation(
    { className: 'o-grid o-grid-cols-1 sm:o-grid-cols-2 o-gap-4' },
    rest,
  )

  return (
    <div
      {...rest}
      ref={setHost}
      className={className}
      style={
        {
          ...style,
          '--o-reveal-distance': `${String(distance)}px`,
          '--o-reveal-columns': String(columns),
        } as CSSProperties
      }
      data-o-reveal-grid={reduced ? undefined : ''}
    >
      {Children.map(children, (child, index) => (
        <div
          style={{ '--o-reveal-delay': `${String(index * stagger)}ms` } as CSSProperties}
        >
          {child}
        </div>
      ))}
    </div>
  )
}

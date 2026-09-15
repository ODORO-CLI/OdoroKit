/**
 * Sidebar made of lines: a column of lines that stretch as the pointer comes
 * near and uncover their label. The line of the current page stays long, in
 * the brand hue.
 *
 * ## What sets it apart from the magnifying dock
 *
 * The dock magnifies a whole element, upwards, in a horizontal bar. Here
 * nothing is magnified: a line stretches, along the axis that moves away
 * from the edge of the screen, and the label shows up at its end. The
 * column does not move by a single pixel — a longer line has no box width,
 * since it is a scale along its length. This is the nav of a long page:
 * set against an edge, mute at rest, legible as soon as one comes
 * close to it.
 *
 * ## The distance is read on a damped pointer
 *
 * The pointer comes from the damped hook, in a ref, read inside the engine
 * loop. The lines therefore follow the hand with a slight delay, and lie
 * back by sliding rather than by jumping. The profile is a raised cosine,
 * like the dock's, and for the same reason: flat at the edges, it makes no
 * line start when the pointer enters its radius.
 *
 * ## Two paths to the same shape
 *
 * Outside the nav, or without a fine pointer, or under reduced motion, the
 * lines are not written by the loop: hover and focus stretch them through a
 * CSS transition. The label, for its part, always shows up through the
 * stylesheet, on hover, on focus and on the current page. The final state is
 * the same, only the route changes.
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
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type ReactElement,
  type ReactNode,
} from 'react'

import { usePointerDamped } from '@registre/hooks/usePointerDamped'

/** A navigation item. */
export interface NavItem {
  /** Displayed label. */
  readonly label: string
  /** Target of the link. Without a target, the item is a button. */
  readonly href?: string
  /** Icon placed before the label. */
  readonly icon?: ReactNode
}

/** Props specific to the component. */
export interface LineSidebarOwnProps {
  /** The links, from top to bottom. */
  items: readonly NavItem[]
  /** Screen edge the nav is set against: the lines start from that edge. @defaultValue 'left' */
  side?: 'left' | 'right'
  /** Maximum stretch of a line, reached under the pointer. @defaultValue 2.4 */
  extend?: number
  /** Radius of influence of the pointer, in pixels. @defaultValue 90 */
  reach?: number
  /** Speed at which the lines follow the pointer. Higher is drier. @defaultValue 10 */
  speed?: number
  /** Index of the current page. */
  active?: number
  /** Called when the user picks a link. */
  onActiveChange?: (index: number) => void
  /** Name of the block for screen readers. @defaultValue 'Navigation' */
  label?: string
}

/** All the props. */
export type LineSidebarProps = Customisable<LineSidebarOwnProps, 'nav'>

/** Id of the injected stylesheet. */
const STYLE_ID = 'o-line-sidebar'

/** Sets the column, the lines and the labels, once per document. */
function ensureLineRules(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-lines]{display:inline-flex;flex-direction:column;gap:0.25rem;padding:0.5rem 0}',
    '[data-o-lines] ul{display:contents;margin:0;padding:0;list-style:none}',
    '[data-o-lines-item]{',
    'display:flex;align-items:center;gap:0.75rem;',
    'padding:0.4rem 0.75rem;background:none;border:0;',
    'color:inherit;text-decoration:none;font:inherit;cursor:pointer;',
    '}',
    '[data-o-lines][data-o-lines-right] [data-o-lines-item]{flex-direction:row-reverse}',
    '[data-o-lines-item]:focus-visible{outline:2px solid currentColor;outline-offset:2px;border-radius:2px}',
    // The line: a scale along its length, from the edge. The transition only
    // serves hover and rest; under the pointer, the loop writes.
    '[data-o-lines-bar]{',
    'display:block;width:1.25rem;height:2px;flex:none;border-radius:1px;',
    'background:currentColor;opacity:0.5;',
    'transform-origin:left center;',
    'transition:transform var(--o-duration-base) cubic-bezier(0.2,0,0,1),opacity var(--o-duration-base) linear;',
    '}',
    '[data-o-lines][data-o-lines-right] [data-o-lines-bar]{transform-origin:right center}',
    '[data-o-lines][data-o-lines-live] [data-o-lines-bar]{transition:opacity var(--o-duration-base) linear}',
    '[data-o-lines-item]:hover [data-o-lines-bar],[data-o-lines-item]:focus-visible [data-o-lines-bar]{',
    'transform:scaleX(var(--o-lines-extend));opacity:1;',
    '}',
    '[data-o-lines-item][aria-current] [data-o-lines-bar]{',
    'background:var(--o-palette-brand-500);opacity:1;',
    'transform:scaleX(var(--o-lines-extend));',
    '}',
    '[data-o-lines-label]{',
    'display:inline-flex;align-items:center;gap:0.4em;',
    'font-size:0.8rem;font-weight:500;letter-spacing:0.04em;text-transform:uppercase;white-space:nowrap;',
    'opacity:0;transform:translateX(-6px);',
    'transition:opacity var(--o-duration-base) linear,transform var(--o-duration-base) cubic-bezier(0.2,0,0,1);',
    '}',
    '[data-o-lines][data-o-lines-right] [data-o-lines-label]{transform:translateX(6px)}',
    '[data-o-lines-item]:hover [data-o-lines-label],',
    '[data-o-lines-item]:focus-visible [data-o-lines-label],',
    '[data-o-lines-item][aria-current] [data-o-lines-label],',
    '[data-o-lines-item][data-o-lines-near] [data-o-lines-label]{opacity:1;transform:none}',
    '[data-o-lines-item][aria-current] [data-o-lines-label]{color:var(--o-palette-brand-500)}',
    // The rule of the edge: the nav is set against it.
    '[data-o-lines]{border-left:1px solid var(--o-theme-line)}',
    '[data-o-lines][data-o-lines-right]{border-left:0;border-right:1px solid var(--o-theme-line)}',
    '@media (prefers-reduced-motion:reduce){[data-o-lines-bar],[data-o-lines-label]{transition:none}}',
  ].join('')
  document.head.append(style)
}

/**
 * Column of lines that stretch as the pointer comes near.
 *
 * @example
 * <LineSidebar
 *   items={[
 *     { label: 'Intro', href: '#intro' },
 *     { label: 'Method', href: '#method' },
 *     { label: 'Results', href: '#results' },
 *     { label: 'Next', href: '#next' },
 *   ]}
 *   active={1}
 * />
 *
 * @example
 * // Set on the right, longer lines, wider radius.
 * <LineSidebar items={sections} side="right" extend={3} reach={140} />
 */
export function LineSidebar({
  items,
  side = 'left',
  extend = 2.4,
  reach = 90,
  speed = 10,
  active,
  onActiveChange,
  label = 'Navigation',
  ...rest
}: LineSidebarProps): ReactElement {
  const { reduced } = useMotionState()
  const [host, setHost] = useState<HTMLElement | null>(null)
  const pointer = usePointerDamped({ host, speed, name: 'lines: pointer' })
  ensureLineRules()

  // Memoised on `host`: the function reads nothing else, and without that it
  // would be recreated on every render. The effect that uses it would then
  // resubscribe to the clock and reset its listeners on every frame — the
  // opposite of what a dependency array is meant to prevent.
  const links = useCallback(
    (): HTMLElement[] =>
      Array.from(host?.querySelectorAll<HTMLElement>('[data-o-lines-item]') ?? []),
    [host],
  )

  useEffect(() => {
    if (host === null || reduced) return
    if (!window.matchMedia('(hover) and (pointer: fine)').matches) return

    let inside = false

    const rest_ = (): void => {
      host.removeAttribute('data-o-lines-live')
      for (const link of links()) {
        link.removeAttribute('data-o-lines-near')
        const bar = link.querySelector<HTMLElement>('[data-o-lines-bar]')
        if (bar !== null) bar.style.transform = ''
      }
    }

    const onEnter = (): void => {
      inside = true
      host.setAttribute('data-o-lines-live', '')
    }
    const onLeave = (): void => {
      inside = false
      // Rest is written once; the CSS transition brings the lines back.
      rest_()
    }

    const subscription = clock.subscribe(
      () => {
        if (!inside) return
        const box = host.getBoundingClientRect()
        const y = box.top + ((pointer.current.y + 1) / 2) * box.height

        for (const link of links()) {
          const bar = link.querySelector<HTMLElement>('[data-o-lines-bar]')
          if (bar === null) continue
          const own = link.getBoundingClientRect()
          const center = own.top + own.height / 2
          const t = Math.min(1, Math.abs(y - center) / reach)
          // Raised cosine: flat at the edges, rounded at the top.
          const bump = (Math.cos(t * Math.PI) + 1) / 2
          const k = 1 + (extend - 1) * bump
          bar.style.transform = `scaleX(${k.toFixed(3)})`
          if (bump > 0.55) link.setAttribute('data-o-lines-near', '')
          else link.removeAttribute('data-o-lines-near')
        }
      },
      { priority: CLOCK_PRIORITY.render, name: 'lines' },
    )

    host.addEventListener('pointerenter', onEnter, { passive: true })
    host.addEventListener('pointerleave', onLeave, { passive: true })

    return () => {
      host.removeEventListener('pointerenter', onEnter)
      host.removeEventListener('pointerleave', onLeave)
      subscription.unsubscribe()
      rest_()
    }
  }, [host, reduced, pointer, extend, reach, links])

  const onKeyDown = (event: KeyboardEvent<HTMLElement>): void => {
    const all = links()
    const focused = all.findIndex((link) => link === document.activeElement)
    if (focused < 0) return
    const last = all.length - 1
    const moves: Readonly<Record<string, number | undefined>> = {
      ArrowDown: focused >= last ? 0 : focused + 1,
      ArrowUp: focused <= 0 ? last : focused - 1,
      Home: 0,
      End: last,
    }
    const target = moves[event.key]
    if (target === undefined) return
    event.preventDefault()
    all[target]?.focus()
  }

  const { className, style } = mergePresentation({}, rest)

  return (
    <nav
      {...rest}
      ref={setHost}
      aria-label={label}
      data-o-lines=""
      {...(side === 'right' ? { 'data-o-lines-right': '' } : {})}
      className={className}
      style={{ ...style, '--o-lines-extend': String(extend) } as CSSProperties}
      onKeyDown={(event) => {
        onKeyDown(event)
        rest.onKeyDown?.(event)
      }}
    >
      <ul>
        {items.map((item, index) => {
          const isCurrent = index === active
          const content = (
            <>
              <span aria-hidden="true" data-o-lines-bar="" />
              <span data-o-lines-label="">
                {item.icon !== undefined && <span aria-hidden="true">{item.icon}</span>}
                {item.label}
              </span>
            </>
          )
          return (
            <li key={`${item.label}-${String(index)}`}>
              {item.href !== undefined ? (
                <a
                  href={item.href}
                  data-o-lines-item=""
                  aria-current={isCurrent ? 'page' : undefined}
                  onClick={() => onActiveChange?.(index)}
                >
                  {content}
                </a>
              ) : (
                <button
                  type="button"
                  data-o-lines-item=""
                  aria-current={isCurrent ? 'page' : undefined}
                  onClick={() => onActiveChange?.(index)}
                >
                  {content}
                </button>
              )}
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

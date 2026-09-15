/**
 * Flowing menu rows whose background flows on hover. An inverted band
 * comes in from the edge the pointer arrived at, and leaves by the one it
 * departs through, scrolling the label along the way.
 *
 * ## The entry edge is read from the gesture, not guessed
 *
 * A band that always comes in from the bottom lies half the time: when the
 * pointer moves down the list, it arrives from the top. On every entry the
 * vertical position of the pointer is compared to the centre of the row, and
 * the band starts from the nearest edge. Same reading on the way out. That is
 * what makes the background seem to follow the hand rather than react to it.
 *
 * ## Changing edge without showing it
 *
 * The edge is a CSS variable, and the transform depends on it. Writing the
 * variable while the band is hidden would send it across the row, bottom to
 * top, before it even comes in — the transition has no idea that journey is
 * unwanted. The transition is therefore cut off for the time it takes to
 * write the edge, a forced layout makes it stick, then it is given back.
 *
 * ## The scroll only runs on the hovered row
 *
 * One keyframe animation per row, permanently, means that many composited
 * layers living for nothing. The animation is only set when the band is
 * visible.
 *
 * ## Under reduced motion
 *
 * The band appears in place, and does not scroll: the label is written in it
 * several times, motionless. What is left is an inverted hover — the meaning
 * is whole, only the journey is missing.
 *
 * @module
 */

import { mergePresentation, type Customisable } from '@odoro-cli/engine'
import {
  useRef,
  type CSSProperties,
  type FocusEvent,
  type KeyboardEvent,
  type PointerEvent,
  type ReactElement,
  type ReactNode,
} from 'react'

/** One navigation item. */
export interface NavItem {
  /** Displayed label. */
  readonly label: string
  /** Target of the link. With no target, the item is a button. */
  readonly href?: string
  /** Icon, used as a separator inside the band. */
  readonly icon?: ReactNode
}

/** Properties specific to the component. */
export interface FlowingMenuOwnProps {
  /** The rows, in display order. */
  items: readonly NavItem[]
  /** Duration of one turn of the scroll inside the band, in seconds. @defaultValue 10 */
  speed?: number
  /** Number of times the label is repeated inside the band. @defaultValue 4 */
  repeat?: number
  /** Index of the current page. */
  active?: number
  /** Called when the user picks a row. */
  onActiveChange?: (index: number) => void
  /** Name of the block for screen readers. @defaultValue 'Navigation' */
  label?: string
}

/** All properties. */
export type FlowingMenuProps = Customisable<FlowingMenuOwnProps, 'nav'>

/** Identifier of the injected stylesheet. */
const STYLE_ID = 'o-flowing-menu'

/** Applies the rows, the band and the scroll, once per document. */
function ensureFlowingRules(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-flow]{display:block}',
    '[data-o-flow] ul{margin:0;padding:0;list-style:none}',
    '[data-o-flow-row]{',
    'position:relative;overflow:hidden;',
    'border-top:1px solid var(--o-theme-line);',
    '}',
    '[data-o-flow-row]:last-child{border-bottom:1px solid var(--o-theme-line)}',
    '[data-o-flow-link]{',
    'display:block;width:100%;box-sizing:border-box;',
    'padding:0.6em 1.25rem;text-align:left;',
    'font-size:clamp(1.5rem,4vw,3rem);font-weight:600;letter-spacing:-0.02em;line-height:1.1;',
    'color:inherit;text-decoration:none;background:none;border:0;font-family:inherit;cursor:pointer;',
    '}',
    '[data-o-flow-link]:focus-visible{outline:2px solid currentColor;outline-offset:-4px}',
    '[data-o-flow-link][aria-current]{color:var(--o-palette-brand-500)}',
    // The band: the theme inverted, laid on top, never clickable.
    '[data-o-flow-band]{',
    'position:absolute;inset:0;pointer-events:none;overflow:hidden;',
    'background:var(--o-theme-fg);color:var(--o-theme-bg);',
    'transform:translateY(var(--o-flow-edge));',
    'transition:transform calc(var(--o-duration-slow) * 1.4) cubic-bezier(0.2,0,0,1);',
    '}',
    '[data-o-flow-row][data-o-flow-on] [data-o-flow-band]{transform:none}',
    '[data-o-flow-track]{',
    'display:flex;align-items:center;height:100%;width:max-content;',
    'font-size:clamp(1.5rem,4vw,3rem);font-weight:600;letter-spacing:-0.02em;white-space:nowrap;',
    '}',
    '[data-o-flow-row][data-o-flow-on] [data-o-flow-track]{animation:o-flow-marquee var(--o-flow-speed) linear infinite}',
    '[data-o-flow-track]>span{display:inline-flex;align-items:center;gap:0.5em;padding-right:0.5em}',
    '[data-o-flow-dot]{width:0.35em;height:0.35em;border-radius:999px;background:var(--o-palette-brand-500);flex:none}',
    '@keyframes o-flow-marquee{to{transform:translateX(-50%)}}',
    '@media (prefers-reduced-motion:reduce){',
    '[data-o-flow-band]{transition:none}',
    '[data-o-flow-row][data-o-flow-on] [data-o-flow-track]{animation:none}',
    '}',
  ].join('')
  document.head.append(style)
}

/**
 * Menu rows whose background flows on hover.
 *
 * @example
 * <FlowingMenu
 *   items={[
 *     { label: 'Kitchen', href: '/kitchen' },
 *     { label: 'Terrace', href: '/terrace' },
 *     { label: 'Cellar', href: '/cellar' },
 *   ]}
 * />
 *
 * @example
 * // Brisker scroll, label repeated more often.
 * <FlowingMenu items={links} speed={6} repeat={6} />
 */
export function FlowingMenu({
  items,
  speed = 10,
  repeat = 4,
  active,
  onActiveChange,
  label = 'Navigation',
  ...rest
}: FlowingMenuProps): ReactElement {
  const hostRef = useRef<HTMLElement | null>(null)
  ensureFlowingRules()

  const links = (): HTMLElement[] =>
    Array.from(hostRef.current?.querySelectorAll<HTMLElement>('[data-o-flow-link]') ?? [])

  /** Edge nearest the pointer: `-101%` for the top, `101%` for the bottom. */
  const edgeOf = (row: HTMLElement, clientY: number): string => {
    const box = row.getBoundingClientRect()
    return clientY < box.top + box.height / 2 ? '-101%' : '101%'
  }

  /** Writes the edge without the transition showing it. */
  const setEdge = (row: HTMLElement, edge: string): void => {
    const band = row.querySelector<HTMLElement>('[data-o-flow-band]')
    if (band === null) return
    band.style.transition = 'none'
    row.style.setProperty('--o-flow-edge', edge)
    void band.offsetHeight
    band.style.transition = ''
  }

  const enter = (event: PointerEvent<HTMLLIElement>): void => {
    const row = event.currentTarget
    if (!row.hasAttribute('data-o-flow-on')) setEdge(row, edgeOf(row, event.clientY))
    row.setAttribute('data-o-flow-on', '')
  }

  const leave = (event: PointerEvent<HTMLLIElement>): void => {
    const row = event.currentTarget
    // Open, the band sits at zero: changing the edge does not move it, and the
    // closing will head towards that new edge.
    row.style.setProperty('--o-flow-edge', edgeOf(row, event.clientY))
    row.removeAttribute('data-o-flow-on')
  }

  // From the keyboard there is no gesture to read: the band comes in and goes
  // out through the top, as if one were moving down the list.
  const focus = (event: FocusEvent<HTMLLIElement>): void => {
    const row = event.currentTarget
    setEdge(row, '-101%')
    row.setAttribute('data-o-flow-on', '')
  }

  const blur = (event: FocusEvent<HTMLLIElement>): void => {
    event.currentTarget.removeAttribute('data-o-flow-on')
  }

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
  const copies = Math.max(2, Math.min(repeat, 8))

  return (
    <nav
      {...rest}
      ref={hostRef}
      aria-label={label}
      data-o-flow=""
      className={className}
      style={{ ...style, '--o-flow-speed': `${String(speed)}s` } as CSSProperties}
      onKeyDown={(event) => {
        onKeyDown(event)
        rest.onKeyDown?.(event)
      }}
    >
      <ul>
        {items.map((item, index) => {
          const isCurrent = index === active
          const separator =
            item.icon !== undefined ? (
              <span aria-hidden="true">{item.icon}</span>
            ) : (
              <span aria-hidden="true" data-o-flow-dot="" />
            )
          // Two identical groups: scrolling by one half brings the second one
          // exactly onto the place of the first, with no seam.
          const group = (prefix: string): ReactElement[] =>
            Array.from({ length: copies }, (_, copy) => (
              <span key={`${prefix}${String(copy)}`}>
                {item.label}
                {separator}
              </span>
            ))
          return (
            <li
              key={`${item.label}-${String(index)}`}
              data-o-flow-row=""
              style={{ '--o-flow-edge': '101%' } as CSSProperties}
              onPointerEnter={enter}
              onPointerLeave={leave}
              onFocus={focus}
              onBlur={blur}
            >
              {item.href !== undefined ? (
                <a
                  href={item.href}
                  data-o-flow-link=""
                  aria-current={isCurrent ? 'page' : undefined}
                  onClick={() => onActiveChange?.(index)}
                >
                  {item.label}
                </a>
              ) : (
                <button
                  type="button"
                  data-o-flow-link=""
                  aria-current={isCurrent ? 'page' : undefined}
                  onClick={() => onActiveChange?.(index)}
                >
                  {item.label}
                </button>
              )}
              <span aria-hidden="true" data-o-flow-band="">
                <span data-o-flow-track="">
                  {group('a')}
                  {group('b')}
                </span>
              </span>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

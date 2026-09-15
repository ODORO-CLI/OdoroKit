/**
 * Pill navigation: a surface pill follows the hovered link, and comes back to
 * rest under the current page when the pointer leaves.
 *
 * ## What sets it apart from the pill tabs
 *
 * Pill tabs mark a selection: the pill is solid, in the brand hue, and only
 * moves on click. Here the pill is a surface glow that follows hover and
 * focus — it says "here is where you are going" before the click — and the
 * current page is told otherwise, by the brand ink and by `aria-current`. A
 * tab switches a view and stays a button; a navigation item switches a page
 * and stays a link.
 *
 * ## The pill is measured on the targeted element
 *
 * Position and width come from the link's `offsetLeft` and `offsetWidth`,
 * read at the moment it is targeted. A CSS transition makes the trip: if the
 * pointer changes target along the way, the transition restarts from the
 * position where the pill actually is, with nothing to remember.
 *
 * ## Every link is in the tab order
 *
 * These are not tabs: they are links, and a link is tabbed to. The arrows are
 * an extra shortcut — they move the focus inside the bar, Home and End go to
 * the ends — never a replacement.
 *
 * @module
 */

import { mergePresentation, type Customisable } from '@odoro-cli/engine'
import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type ReactElement,
  type ReactNode,
} from 'react'

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
export interface PillNavOwnProps {
  /** The links, in display order. */
  items: readonly NavItem[]
  /** Index of the current page, in controlled mode. */
  active?: number
  /** Current page on mount, in uncontrolled mode. @defaultValue 0 */
  defaultActive?: number
  /** Called when the user chooses a link. */
  onActiveChange?: (index: number) => void
  /** Name of the block for screen readers. @defaultValue 'Navigation' */
  label?: string
}

/** All props. */
export type PillNavProps = Customisable<PillNavOwnProps, 'nav'>

/** Id of the injected stylesheet. */
const STYLE_ID = 'o-pill-nav'

/** Applies the bar and its pill, once per document. */
function ensurePillNavRules(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-pill-nav]{',
    'position:relative;display:inline-flex;align-items:center;',
    'padding:4px;border-radius:999px;',
    'background:var(--o-theme-surface);border:1px solid var(--o-theme-line);',
    '}',
    '[data-o-pill-nav] ul{display:contents;margin:0;padding:0;list-style:none}',
    '[data-o-pill-nav] [data-o-pill-link]{',
    'position:relative;z-index:1;display:inline-flex;align-items:center;gap:0.5em;',
    'border:0;background:none;cursor:pointer;border-radius:999px;',
    'font:inherit;color:inherit;text-decoration:none;white-space:nowrap;',
    'padding:0.5rem 1rem;opacity:0.7;',
    'transition:opacity var(--o-duration-slow) linear;',
    '}',
    '[data-o-pill-nav] [data-o-pill-link]:hover,',
    '[data-o-pill-nav] [data-o-pill-link]:focus-visible{opacity:1}',
    '[data-o-pill-nav] [data-o-pill-link]:focus-visible{outline:2px solid currentColor;outline-offset:-2px}',
    '[data-o-pill-nav] [data-o-pill-link][aria-current]{opacity:1;color:var(--o-palette-brand-500)}',
    '[data-o-pill-nav-pill]{',
    'position:absolute;inset-block:4px;left:0;z-index:0;width:0;',
    'border-radius:999px;',
    'background:color-mix(in oklab,currentColor 10%,transparent);',
    'transition:transform var(--o-duration-slow) cubic-bezier(0.2,0,0,1),',
    'width var(--o-duration-slow) cubic-bezier(0.2,0,0,1);',
    '}',
    '@media (prefers-reduced-motion:reduce){[data-o-pill-nav-pill]{transition:none}}',
  ].join('')
  document.head.append(style)
}

/**
 * Navigation bar whose pill follows the targeted link.
 *
 * @example
 * <PillNav
 *   items={[
 *     { label: 'Home', href: '/' },
 *     { label: 'Work', href: '/work' },
 *     { label: 'Contact', href: '/contact' },
 *   ]}
 *   defaultActive={0}
 * />
 *
 * @example
 * // Controlled mode: the page decides.
 * <PillNav items={links} active={page} onActiveChange={setPage} label="Main" />
 */
export function PillNav({
  items,
  active,
  defaultActive = 0,
  onActiveChange,
  label = 'Navigation',
  ...rest
}: PillNavProps): ReactElement {
  const hostRef = useRef<HTMLElement | null>(null)
  const pillRef = useRef<HTMLSpanElement | null>(null)
  const [internal, setInternal] = useState(defaultActive)
  ensurePillNavRules()

  const current = Math.min(Math.max(active ?? internal, 0), Math.max(items.length - 1, 0))

  const choose = (index: number): void => {
    if (active === undefined) setInternal(index)
    onActiveChange?.(index)
  }

  const links = (): HTMLElement[] =>
    Array.from(hostRef.current?.querySelectorAll<HTMLElement>('[data-o-pill-link]') ?? [])

  /** Places the pill under a link. Without a link, it folds back to zero width. */
  const place = (target: HTMLElement | undefined): void => {
    const pill = pillRef.current
    if (pill === null) return
    if (target === undefined) {
      pill.style.width = '0px'
      return
    }
    pill.style.width = `${String(target.offsetWidth)}px`
    pill.style.transform = `translateX(${String(target.offsetLeft)}px)`
  }

  /** Back under the current page. */
  const settle = (): void => place(links()[current])

  // The pill settles under the current page on mount and on every change, and
  // measures itself again if the bar changes size: a font arriving late moves
  // every link.
  useEffect(() => {
    settle()
    const host = hostRef.current
    if (host === null || typeof ResizeObserver === 'undefined') return
    const observer = new ResizeObserver(settle)
    observer.observe(host)
    return () => observer.disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current, items])

  const onKeyDown = (event: KeyboardEvent<HTMLElement>): void => {
    const all = links()
    const focused = all.findIndex((link) => link === document.activeElement)
    if (focused < 0) return
    const last = all.length - 1
    const moves: Readonly<Record<string, number | undefined>> = {
      ArrowRight: focused >= last ? 0 : focused + 1,
      ArrowLeft: focused <= 0 ? last : focused - 1,
      Home: 0,
      End: last,
    }
    const target = moves[event.key]
    if (target === undefined) return
    event.preventDefault()
    all[target]?.focus()
  }

  const linkUnder = (target: EventTarget): HTMLElement | null =>
    target instanceof HTMLElement
      ? target.closest<HTMLElement>('[data-o-pill-link]')
      : null

  const { className, style } = mergePresentation({}, rest)

  return (
    <nav
      {...rest}
      ref={hostRef}
      aria-label={label}
      data-o-pill-nav=""
      className={className}
      style={style as CSSProperties}
      onKeyDown={onKeyDown}
      onPointerOver={(event) => {
        const link = linkUnder(event.target)
        if (link !== null) place(link)
        rest.onPointerOver?.(event)
      }}
      onPointerLeave={(event) => {
        settle()
        rest.onPointerLeave?.(event)
      }}
      onFocus={(event) => {
        const link = linkUnder(event.target)
        if (link !== null) place(link)
        rest.onFocus?.(event)
      }}
      onBlur={(event) => {
        const next = event.relatedTarget
        if (!(next instanceof Node) || !hostRef.current?.contains(next)) settle()
        rest.onBlur?.(event)
      }}
    >
      <span ref={pillRef} aria-hidden="true" data-o-pill-nav-pill="" />
      <ul>
        {items.map((item, index) => {
          const isCurrent = index === current
          const content = (
            <>
              {item.icon !== undefined && <span aria-hidden="true">{item.icon}</span>}
              {item.label}
            </>
          )
          return (
            <li key={`${item.label}-${String(index)}`}>
              {item.href !== undefined ? (
                <a
                  href={item.href}
                  data-o-pill-link=""
                  aria-current={isCurrent ? 'page' : undefined}
                  onClick={() => choose(index)}
                >
                  {content}
                </a>
              ) : (
                <button
                  type="button"
                  data-o-pill-link=""
                  aria-current={isCurrent ? 'page' : undefined}
                  onClick={() => choose(index)}
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

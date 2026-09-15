/**
 * Staggered menu: a fullscreen menu opened by a button. Color bands sweep
 * across the screen, the panel follows them, and the links rise one after
 * another.
 *
 * ## Three beats, a single attribute
 *
 * Opening is an attribute set on the host. From there the stylesheet does
 * everything: each band leaves with a delay that depends on its rank, the
 * panel leaves after the last band, each link after the panel. It is the
 * same mechanism as the curtain loader — one plane hiding another — but
 * read the other way round: here the planes arrive, and the page stays
 * behind.
 *
 * On closing the delays drop: everything leaves together, fast. A menu that
 * takes as long to close as it takes to open keeps someone waiting who has
 * already decided.
 *
 * ## The links rise out of a mask
 *
 * Each link sits in a row with `overflow: hidden`, and arrives through a
 * vertical translation: it seems to come out of the paper rather than to appear.
 * The text is in the DOM from the start; only the travel is visual.
 *
 * ## What a fullscreen menu owes to the keyboard
 *
 * The button carries `aria-expanded` and `aria-controls`. Once open, focus goes
 * to the first link; Tab cycles inside the menu, never behind it; Escape
 * closes; focus returns to the button. Page scrolling is locked as long as
 * the menu covers the window — and only in that case: a menu contained in a
 * frame does not touch the document.
 *
 * @module
 */

import { mergePresentation, useMotionState, type Customisable } from '@odoro-cli/engine'
import {
  useEffect,
  useId,
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

/** Properties specific to the component. */
export interface StaggeredMenuOwnProps {
  /** The links, in display order. */
  items: readonly NavItem[]
  /**
   * Tokens of the bands that precede the panel, in sweep order.
   *
   * @defaultValue brand, then theme ink
   */
  colors?: readonly string[]
  /** Edge the bands and the panel enter from. @defaultValue 'right' */
  side?: 'right' | 'left'
  /** Offset between two links, in milliseconds. @defaultValue 70 */
  stagger?: number
  /** Covers the positioned parent rather than the window. @defaultValue false */
  contained?: boolean
  /** Open state, in controlled mode. */
  open?: boolean
  /** Called when the user opens or closes. */
  onOpenChange?: (open: boolean) => void
  /** Index of the current page. */
  active?: number
  /** Called when the user picks a link. */
  onActiveChange?: (index: number) => void
  /** Name of the navigation block for screen readers. @defaultValue 'Menu' */
  label?: string
  /** Content of the button. @defaultValue 'Menu' closed, 'Close' open */
  trigger?: ReactNode
  /** What fills the bottom of the panel: social links, legal notices. */
  footer?: ReactNode
}

/** All properties. */
export type StaggeredMenuProps = Customisable<StaggeredMenuOwnProps>

/** Default bands: the brand, then the theme ink. */
const DEFAULT_COLORS: readonly string[] = ['--o-palette-brand-500', '--o-theme-fg']

/** Id of the injected stylesheet. */
const STYLE_ID = 'o-staggered-menu'

/** Sets up the button, the veil, the bands, the panel and the links, once per document. */
function ensureStaggeredRules(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-stag]{display:inline-block}',
    '[data-o-stag-trigger]{',
    'display:inline-flex;align-items:center;gap:0.5em;',
    'padding:0.5rem 1rem;border-radius:999px;',
    'border:1px solid var(--o-theme-line);background:none;',
    'color:inherit;font:inherit;cursor:pointer;',
    '}',
    '[data-o-stag-trigger]:focus-visible{outline:2px solid currentColor;outline-offset:2px}',
    // The button rises above the veil while the veil is open, so that it stays
    // clickable and legible on top of the panel.
    '[data-o-stag][data-o-stag-open] [data-o-stag-trigger]{position:relative;z-index:1011;color:var(--o-theme-fg)}',
    '[data-o-stag-veil]{',
    'position:fixed;inset:0;z-index:1010;overflow:hidden;',
    'visibility:hidden;',
    'transition:visibility 0s linear calc(var(--o-duration-slow) * 1.6);',
    '}',
    '[data-o-stag][data-o-stag-contained] [data-o-stag-veil]{position:absolute}',
    '[data-o-stag][data-o-stag-open] [data-o-stag-veil]{visibility:visible;transition:none}',
    '[data-o-stag-band],[data-o-stag-panel]{',
    'position:absolute;inset:0;',
    'transform:translateX(var(--o-stag-from));',
    'transition:transform calc(var(--o-duration-slow) * 1.4) cubic-bezier(0.3,0,1,1);',
    '}',
    '[data-o-stag-band]{background:var(--o-stag-color)}',
    '[data-o-stag-panel]{',
    'display:flex;flex-direction:column;justify-content:center;',
    'padding:clamp(1.5rem,6vw,5rem);box-sizing:border-box;',
    'background:var(--o-theme-bg);color:var(--o-theme-fg);',
    '}',
    '[data-o-stag][data-o-stag-open] [data-o-stag-band],[data-o-stag][data-o-stag-open] [data-o-stag-panel]{',
    'transform:none;',
    'transition:transform calc(var(--o-duration-slow) * 2) cubic-bezier(0.2,0,0,1) var(--o-stag-delay);',
    '}',
    '[data-o-stag-panel] ul{margin:0;padding:0;list-style:none;display:flex;flex-direction:column;gap:0.2em}',
    '[data-o-stag-panel] li{overflow:hidden;line-height:1.1}',
    '[data-o-stag-link]{',
    'display:inline-flex;align-items:baseline;gap:0.5em;',
    'font-size:clamp(2rem,6vw,4.5rem);font-weight:600;letter-spacing:-0.02em;',
    'color:inherit;text-decoration:none;background:none;border:0;padding:0;font-family:inherit;cursor:pointer;',
    'transform:translateY(110%);',
    'transition:transform var(--o-duration-slow) cubic-bezier(0.3,0,1,1),opacity var(--o-duration-slow) linear;',
    '}',
    '[data-o-stag-link]:hover,[data-o-stag-link]:focus-visible{opacity:0.7}',
    '[data-o-stag-link]:focus-visible{outline:2px solid currentColor;outline-offset:4px}',
    '[data-o-stag-link][aria-current]{color:var(--o-palette-brand-500)}',
    '[data-o-stag-link] small{font-size:0.3em;font-weight:500;letter-spacing:0.1em;opacity:0.6}',
    '[data-o-stag][data-o-stag-open] [data-o-stag-link]{',
    'transform:none;',
    'transition:transform calc(var(--o-duration-slow) * 2) cubic-bezier(0.2,0,0,1) var(--o-stag-delay),',
    'opacity var(--o-duration-slow) linear;',
    '}',
    '[data-o-stag-footer]{margin-top:2rem;opacity:0;transition:opacity var(--o-duration-slow) linear}',
    '[data-o-stag][data-o-stag-open] [data-o-stag-footer]{opacity:1;transition-delay:var(--o-stag-delay)}',
    '@media (prefers-reduced-motion:reduce){',
    '[data-o-stag-veil],[data-o-stag-band],[data-o-stag-panel],[data-o-stag-link],[data-o-stag-footer]{transition:none!important}',
    '}',
  ].join('')
  document.head.append(style)
}

/** What can take focus inside the veil. */
const FOCUSABLE = 'a[href],button:not([disabled]),[tabindex]:not([tabindex="-1"])'

/**
 * Fullscreen menu with bands and staggered links.
 *
 * @example
 * <StaggeredMenu
 *   items={[
 *     { label: 'Home', href: '/' },
 *     { label: 'Projects', href: '/projects' },
 *     { label: 'Studio', href: '/studio' },
 *     { label: 'Contact', href: '/contact' },
 *   ]}
 * />
 *
 * @example
 * // Inside a mockup frame, entering from the left.
 * <StaggeredMenu items={links} contained side="left" colors={['--o-palette-sky-500']} />
 */
export function StaggeredMenu({
  items,
  colors = DEFAULT_COLORS,
  side = 'right',
  stagger = 70,
  contained = false,
  open,
  onOpenChange,
  active,
  onActiveChange,
  label = 'Menu',
  trigger,
  footer,
  ...rest
}: StaggeredMenuProps): ReactElement {
  const { reduced } = useMotionState()
  const veilId = useId()
  const hostRef = useRef<HTMLDivElement | null>(null)
  const veilRef = useRef<HTMLDivElement | null>(null)
  const triggerRef = useRef<HTMLButtonElement | null>(null)
  const [internal, setInternal] = useState(false)
  ensureStaggeredRules()

  const isOpen = open ?? internal

  const setOpen = (next: boolean): void => {
    if (open === undefined) setInternal(next)
    onOpenChange?.(next)
  }

  const links = (): HTMLElement[] =>
    Array.from(veilRef.current?.querySelectorAll<HTMLElement>('[data-o-stag-link]') ?? [])

  const bandDelay = reduced ? 0 : 80
  const panelDelay = bandDelay * colors.length
  const linkDelay = reduced ? 0 : stagger

  // Open: focus goes to the first link once the panel has arrived, and the
  // document no longer scrolls if the menu covers the window. Closed:
  // everything is handed back, focus included.
  useEffect(() => {
    if (!isOpen) return

    const wait = reduced ? 0 : panelDelay + 400
    const timer = window.setTimeout(
      () => links()[0]?.focus({ preventScroll: true }),
      wait,
    )

    const root = document.documentElement
    const previous = root.style.overflow
    if (!contained) root.style.overflow = 'hidden'

    return () => {
      window.clearTimeout(timer)
      if (!contained) root.style.overflow = previous

      // The refs are read **on closing**, and that is deliberate: the point is
      // to know where focus sits right now, and to hand it back to the trigger
      // as it is right now. Copying them when the effect opens, as the rule
      // suggests, would hand focus back to a node that may no longer be in the
      // document.
      /* eslint-disable react-hooks/exhaustive-deps */
      const host = hostRef.current
      if (host !== null && host.contains(document.activeElement))
        triggerRef.current?.focus()
      /* eslint-enable react-hooks/exhaustive-deps */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, contained, reduced])

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>): void => {
    if (!isOpen) return

    if (event.key === 'Escape') {
      event.preventDefault()
      setOpen(false)
      return
    }

    // Tab cycles between the button and the veil content: nothing behind the
    // menu is reachable while it is open.
    if (event.key === 'Tab') {
      const inside = Array.from(
        veilRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? [],
      )
      const ring = [triggerRef.current, ...inside].filter(
        (element): element is HTMLElement => element !== null,
      )
      if (ring.length === 0) return
      const index = ring.findIndex((element) => element === document.activeElement)
      const next = event.shiftKey
        ? ring[index <= 0 ? ring.length - 1 : index - 1]
        : ring[index >= ring.length - 1 ? 0 : index + 1]
      event.preventDefault()
      next?.focus()
      return
    }

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

  const from = side === 'right' ? '100%' : '-100%'
  const { className, style } = mergePresentation({}, rest)

  return (
    <div
      {...rest}
      ref={hostRef}
      data-o-stag=""
      {...(isOpen ? { 'data-o-stag-open': '' } : {})}
      {...(contained ? { 'data-o-stag-contained': '' } : {})}
      className={className}
      style={{ ...style, '--o-stag-from': from } as CSSProperties}
      onKeyDown={(event) => {
        onKeyDown(event)
        rest.onKeyDown?.(event)
      }}
    >
      <button
        ref={triggerRef}
        type="button"
        data-o-stag-trigger=""
        aria-expanded={isOpen}
        aria-controls={veilId}
        onClick={() => setOpen(!isOpen)}
      >
        {trigger ?? (isOpen ? 'Close' : 'Menu')}
      </button>
      <div id={veilId} ref={veilRef} data-o-stag-veil="">
        {colors.map((token, index) => (
          <span
            key={`${token}-${String(index)}`}
            aria-hidden="true"
            data-o-stag-band=""
            style={
              {
                '--o-stag-color': `var(${token})`,
                '--o-stag-delay': `${String(index * bandDelay)}ms`,
              } as CSSProperties
            }
          />
        ))}
        <div
          data-o-stag-panel=""
          style={{ '--o-stag-delay': `${String(panelDelay)}ms` } as CSSProperties}
        >
          <nav aria-label={label}>
            <ul>
              {items.map((item, index) => {
                const isCurrent = index === active
                const vars = {
                  '--o-stag-delay': `${String(panelDelay + 120 + index * linkDelay)}ms`,
                } as CSSProperties
                const content = (
                  <>
                    <small aria-hidden="true">{String(index + 1).padStart(2, '0')}</small>
                    {item.icon !== undefined && (
                      <span aria-hidden="true">{item.icon}</span>
                    )}
                    {item.label}
                  </>
                )
                return (
                  <li key={`${item.label}-${String(index)}`}>
                    {item.href !== undefined ? (
                      <a
                        href={item.href}
                        data-o-stag-link=""
                        aria-current={isCurrent ? 'page' : undefined}
                        tabIndex={isOpen ? 0 : -1}
                        style={vars}
                        onClick={() => {
                          onActiveChange?.(index)
                          setOpen(false)
                        }}
                      >
                        {content}
                      </a>
                    ) : (
                      <button
                        type="button"
                        data-o-stag-link=""
                        aria-current={isCurrent ? 'page' : undefined}
                        tabIndex={isOpen ? 0 : -1}
                        style={vars}
                        onClick={() => {
                          onActiveChange?.(index)
                          setOpen(false)
                        }}
                      >
                        {content}
                      </button>
                    )}
                  </li>
                )
              })}
            </ul>
          </nav>
          {footer !== undefined && (
            <div
              data-o-stag-footer=""
              style={
                {
                  '--o-stag-delay': `${String(panelDelay + 200 + items.length * linkDelay)}ms`,
                } as CSSProperties
              }
            >
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

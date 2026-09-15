/**
 * Bubble menu: a round button whose links burst out as bubbles along an arc,
 * one by one, and come back in the reverse order.
 *
 * ## Every bubble knows its place, and its turn
 *
 * A bubble's position is an angle on an arc, converted into two CSS
 * variables; its turn is an index, converted into a transition delay. Opening
 * is nothing but an attribute set on the host: from there, the stylesheet
 * sends the bubbles out one after the other, with a slight overshoot that
 * makes them "land". Closing reverses the delays, so that the last one out is
 * the first one back — like bubbles being reabsorbed towards their source.
 *
 * ## Closed, the bubbles are genuinely absent
 *
 * A bubble at zero scale stays focusable and stays announced. It is therefore
 * made invisible through `visibility`, with a delay equal to the duration of
 * the return trip: the travel is seen, then the element leaves the
 * accessibility tree.
 *
 * ## The button states its state, and the focus comes back to it
 *
 * `aria-expanded` on the button, Escape to close, focus returned to the
 * button on closing. On opening, focus goes to the first bubble as soon as it
 * is visible; the arrows move from one to the next.
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

/** One navigation item. */
export interface NavItem {
  /** Displayed label. */
  readonly label: string
  /** Target of the link. With no target, the item is a button. */
  readonly href?: string
  /** Icon placed before the label. */
  readonly icon?: ReactNode
}

/** Side towards which the arc unfolds. */
export type BubbleDirection = 'up' | 'right' | 'down' | 'left'

/** Properties specific to the component. */
export interface BubbleMenuOwnProps {
  /** The links, in the order they come out. */
  items: readonly NavItem[]
  /** Side towards which the arc unfolds. @defaultValue 'up' */
  direction?: BubbleDirection
  /** Distance between the button and the bubbles, in pixels. @defaultValue 110 */
  radius?: number
  /** Opening of the arc, in degrees. @defaultValue 120 */
  spread?: number
  /** Offset between two bubbles, in milliseconds. @defaultValue 50 */
  stagger?: number
  /** Open state, in controlled mode. */
  open?: boolean
  /** Called when the user opens or closes. */
  onOpenChange?: (open: boolean) => void
  /** Index of the current page. */
  active?: number
  /** Called when the user picks a link. */
  onActiveChange?: (index: number) => void
  /** Name of the button for screen readers. @defaultValue 'Menu' */
  label?: string
}

/** All properties. */
export type BubbleMenuProps = Customisable<BubbleMenuOwnProps>

/** Starting angle of each direction, in degrees, clockwise from the right. */
const BASE_ANGLE: Readonly<Record<BubbleDirection, number>> = {
  right: 0,
  down: 90,
  left: 180,
  up: 270,
}

/** Identifier of the injected stylesheet. */
const STYLE_ID = 'o-bubble-menu'

/** Applies the button, the arc and the bubbles, once per document. */
function ensureBubbleRules(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-bubble]{position:relative;display:inline-block;width:3rem;height:3rem}',
    '[data-o-bubble-trigger]{',
    'position:relative;z-index:2;width:3rem;height:3rem;border-radius:999px;',
    'display:inline-flex;align-items:center;justify-content:center;',
    'background:var(--o-theme-surface);border:1px solid var(--o-theme-line);',
    'color:inherit;cursor:pointer;padding:0;',
    'transition:transform var(--o-duration-slow) cubic-bezier(0.2,0,0,1.2);',
    '}',
    '[data-o-bubble-trigger]:focus-visible{outline:2px solid currentColor;outline-offset:2px}',
    '[data-o-bubble][data-o-bubble-open] [data-o-bubble-trigger]{transform:rotate(45deg)}',
    // The cross: two bars in the current ink, which make a plus when closed and
    // a cross when open, through the rotation of the button.
    '[data-o-bubble-cross]{position:relative;width:1rem;height:1rem;display:block}',
    '[data-o-bubble-cross]::before,[data-o-bubble-cross]::after{',
    'content:"";position:absolute;background:currentColor;border-radius:1px;',
    '}',
    '[data-o-bubble-cross]::before{left:0;right:0;top:calc(50% - 1px);height:2px}',
    '[data-o-bubble-cross]::after{top:0;bottom:0;left:calc(50% - 1px);width:2px}',
    '[data-o-bubble] ul{position:absolute;top:50%;left:50%;width:0;height:0;margin:0;padding:0;list-style:none;z-index:1}',
    '[data-o-bubble] li{position:absolute;top:0;left:0}',
    '[data-o-bubble-item]{',
    'position:absolute;top:0;left:0;',
    'display:inline-flex;align-items:center;gap:0.5em;white-space:nowrap;',
    'padding:0.5rem 0.9rem;border-radius:999px;',
    'background:var(--o-theme-surface);border:1px solid var(--o-theme-line);',
    'box-shadow:0 8px 24px -12px color-mix(in oklab,currentColor 40%,transparent);',
    'color:inherit;text-decoration:none;font:inherit;cursor:pointer;',
    'transform:translate(-50%,-50%) scale(0);opacity:0;visibility:hidden;',
    'transition:transform var(--o-duration-slow) cubic-bezier(0.2,0,0,1.2) var(--o-bubble-delay-in),',
    'opacity var(--o-duration-slow) linear var(--o-bubble-delay-in),',
    'visibility 0s linear calc(var(--o-duration-slow) + var(--o-bubble-delay-in));',
    '}',
    '[data-o-bubble-item]:focus-visible{outline:2px solid currentColor;outline-offset:2px}',
    '[data-o-bubble-item][aria-current]{color:var(--o-palette-brand-500)}',
    '[data-o-bubble][data-o-bubble-open] [data-o-bubble-item]{',
    'transform:translate(calc(-50% + var(--o-bubble-x)),calc(-50% + var(--o-bubble-y))) scale(1);',
    'opacity:1;visibility:visible;',
    'transition:transform var(--o-duration-slow) cubic-bezier(0.2,0,0,1.2) var(--o-bubble-delay-out),',
    'opacity var(--o-duration-slow) linear var(--o-bubble-delay-out),',
    'visibility 0s linear var(--o-bubble-delay-out);',
    '}',
    '@media (prefers-reduced-motion:reduce){',
    '[data-o-bubble-item],[data-o-bubble-trigger]{transition:none}',
    '}',
  ].join('')
  document.head.append(style)
}

/**
 * Round button whose links burst out as bubbles.
 *
 * @example
 * <BubbleMenu
 *   items={[
 *     { label: 'Home', href: '/' },
 *     { label: 'Gallery', href: '/gallery' },
 *     { label: 'Contact', href: '/contact' },
 *   ]}
 * />
 *
 * @example
 * // Towards the right, on a tighter arc.
 * <BubbleMenu items={links} direction="right" spread={70} radius={140} />
 */
export function BubbleMenu({
  items,
  direction = 'up',
  radius = 110,
  spread = 120,
  stagger = 50,
  open,
  onOpenChange,
  active,
  onActiveChange,
  label = 'Menu',
  ...rest
}: BubbleMenuProps): ReactElement {
  const { reduced } = useMotionState()
  const listId = useId()
  const hostRef = useRef<HTMLDivElement | null>(null)
  const triggerRef = useRef<HTMLButtonElement | null>(null)
  const [internal, setInternal] = useState(false)
  ensureBubbleRules()

  const isOpen = open ?? internal

  const setOpen = (next: boolean): void => {
    if (open === undefined) setInternal(next)
    onOpenChange?.(next)
  }

  const bubbles = (): HTMLElement[] =>
    Array.from(
      hostRef.current?.querySelectorAll<HTMLElement>('[data-o-bubble-item]') ?? [],
    )

  // Open: focus goes to the first bubble as soon as it is visible. A click
  // outside the menu closes it again. Closed: focus returns to the button if it
  // was inside the menu, so as not to drop it on the document body.
  useEffect(() => {
    const host = hostRef.current
    if (host === null) return

    if (!isOpen) {
      if (
        host.contains(document.activeElement) &&
        document.activeElement !== triggerRef.current
      ) {
        triggerRef.current?.focus()
      }
      return
    }

    const first = bubbles()[0]
    const wait = reduced ? 0 : 60
    const timer = window.setTimeout(() => first?.focus({ preventScroll: true }), wait)

    const onOutside = (event: PointerEvent): void => {
      if (event.target instanceof Node && !host.contains(event.target)) setOpen(false)
    }
    document.addEventListener('pointerdown', onOutside, { passive: true })

    return () => {
      window.clearTimeout(timer)
      document.removeEventListener('pointerdown', onOutside)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, reduced])

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>): void => {
    if (event.key === 'Escape') {
      if (!isOpen) return
      event.preventDefault()
      setOpen(false)
      triggerRef.current?.focus()
      return
    }

    const all = bubbles()
    const focused = all.findIndex((bubble) => bubble === document.activeElement)
    if (focused < 0) return
    const last = all.length - 1
    const moves: Readonly<Record<string, number | undefined>> = {
      ArrowRight: focused >= last ? 0 : focused + 1,
      ArrowDown: focused >= last ? 0 : focused + 1,
      ArrowLeft: focused <= 0 ? last : focused - 1,
      ArrowUp: focused <= 0 ? last : focused - 1,
      Home: 0,
      End: last,
    }
    const target = moves[event.key]
    if (target === undefined) return
    event.preventDefault()
    all[target]?.focus()
  }

  const count = items.length
  const base = BASE_ANGLE[direction]
  const step = count > 1 ? spread / (count - 1) : 0
  const delay = reduced ? 0 : stagger

  const { className, style } = mergePresentation({}, rest)

  return (
    <div
      {...rest}
      ref={hostRef}
      data-o-bubble=""
      {...(isOpen ? { 'data-o-bubble-open': '' } : {})}
      className={className}
      style={style as CSSProperties}
      onKeyDown={(event) => {
        onKeyDown(event)
        rest.onKeyDown?.(event)
      }}
    >
      <button
        ref={triggerRef}
        type="button"
        data-o-bubble-trigger=""
        aria-expanded={isOpen}
        aria-controls={listId}
        aria-label={label}
        onClick={() => setOpen(!isOpen)}
      >
        <span aria-hidden="true" data-o-bubble-cross="" />
      </button>
      <ul id={listId}>
        {items.map((item, index) => {
          const angle = ((base - spread / 2 + step * index) * Math.PI) / 180
          const x = Math.cos(angle) * radius
          const y = Math.sin(angle) * radius
          const isCurrent = index === active
          const vars = {
            '--o-bubble-x': `${x.toFixed(1)}px`,
            '--o-bubble-y': `${y.toFixed(1)}px`,
            '--o-bubble-delay-out': `${String(index * delay)}ms`,
            '--o-bubble-delay-in': `${String((count - 1 - index) * delay)}ms`,
          } as CSSProperties
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
                  data-o-bubble-item=""
                  aria-current={isCurrent ? 'page' : undefined}
                  tabIndex={isOpen ? 0 : -1}
                  style={vars}
                  onClick={() => onActiveChange?.(index)}
                >
                  {content}
                </a>
              ) : (
                <button
                  type="button"
                  data-o-bubble-item=""
                  aria-current={isCurrent ? 'page' : undefined}
                  tabIndex={isOpen ? 0 : -1}
                  style={vars}
                  onClick={() => onActiveChange?.(index)}
                >
                  {content}
                </button>
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}

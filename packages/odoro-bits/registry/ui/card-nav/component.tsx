/**
 * Card nav: a compact bar that unfolds into a row of tinted cards, each one a
 * link, entering one after the other.
 *
 * ## The height is never measured
 *
 * Animating a height usually forces one to read it first — a `scrollHeight`
 * after render, a value that goes stale at the first font change. Here the
 * panel is a grid row going from `0fr` to `1fr`: the browser interpolates a
 * fraction, and the height follows whatever the content does, whatever that
 * is. The only constraint is an `overflow: hidden` on the direct child, with
 * `min-height: 0` so that the row can really close.
 *
 * ## The cards enter after the panel, not with it
 *
 * Each card carries its index in a variable, and its delay follows from it.
 * The panel opens first, the cards rise inside it one after the other: it is
 * that offset which makes the opening read as an unfolding rather than as a
 * plain enlargement.
 *
 * ## Closed, the row is removed from the accessibility tree
 *
 * A card of zero height stays tabbable and announced. `visibility` removes
 * it, with the same delay as the closing, so that the travel is seen.
 *
 * ## The button states its state, Escape closes, focus comes back
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

/** One navigation card. */
export interface CardNavItem {
  /** Displayed label. */
  readonly label: string
  /** Target of the link. With no target, the card is a button. */
  readonly href?: string
  /** Icon placed at the top of the card. */
  readonly icon?: ReactNode
  /** One line under the label. */
  readonly description?: string
}

/** Properties specific to the component. */
export interface CardNavOwnProps {
  /** The cards, in display order. */
  items: readonly CardNavItem[]
  /** What occupies the left of the bar: a brand, a title. */
  brand?: ReactNode
  /** What occupies the right of the bar, before the button: a call to action. */
  cta?: ReactNode
  /**
   * Hue tokens, handed out to the cards in a loop.
   *
   * @defaultValue brand, sky, emerald
   */
  colors?: readonly string[]
  /** Entry offset between two cards, in milliseconds. @defaultValue 60 */
  stagger?: number
  /** Open state, in controlled mode. */
  open?: boolean
  /** Called when the user opens or closes. */
  onOpenChange?: (open: boolean) => void
  /** Index of the current page. */
  active?: number
  /** Called when the user picks a card. */
  onActiveChange?: (index: number) => void
  /** Name of the button for screen readers. @defaultValue 'Menu' */
  label?: string
}

/** All properties. */
export type CardNavProps = Customisable<CardNavOwnProps, 'nav'>

/** Default hues. */
const DEFAULT_COLORS: readonly string[] = [
  '--o-palette-brand-500',
  '--o-palette-sky-500',
  '--o-palette-emerald-500',
]

/** Identifier of the injected stylesheet. */
const STYLE_ID = 'o-card-nav'

/** Applies the bar, the panel and the cards, once per document. */
function ensureCardNavRules(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-cardnav]{',
    'display:block;background:var(--o-theme-surface);',
    'border:1px solid var(--o-theme-line);overflow:hidden;',
    '}',
    '[data-o-cardnav-bar]{display:flex;align-items:center;gap:0.75rem;padding:0.5rem 0.5rem 0.5rem 1rem}',
    '[data-o-cardnav-bar]>[data-o-cardnav-brand]{flex:1;min-width:0}',
    '[data-o-cardnav-toggle]{',
    'display:inline-flex;align-items:center;justify-content:center;',
    'width:2.5rem;height:2.5rem;border-radius:999px;border:0;cursor:pointer;',
    'background:none;color:inherit;',
    '}',
    '[data-o-cardnav-toggle]:hover{background:color-mix(in oklab,currentColor 8%,transparent)}',
    '[data-o-cardnav-toggle]:focus-visible{outline:2px solid currentColor;outline-offset:-2px}',
    // Three bars that turn into a cross: the first and the third pivot on the
    // centre, the middle one fades out.
    '[data-o-cardnav-burger]{position:relative;display:block;width:1.125rem;height:0.75rem}',
    '[data-o-cardnav-burger] i{',
    'position:absolute;left:0;right:0;height:2px;border-radius:1px;background:currentColor;',
    'transition:transform var(--o-duration-slow) cubic-bezier(0.2,0,0,1),opacity var(--o-duration-slow) linear;',
    '}',
    '[data-o-cardnav-burger] i:nth-child(1){top:0}',
    '[data-o-cardnav-burger] i:nth-child(2){top:calc(50% - 1px)}',
    '[data-o-cardnav-burger] i:nth-child(3){bottom:0}',
    '[data-o-cardnav][data-o-cardnav-open] [data-o-cardnav-burger] i:nth-child(1){transform:translateY(5px) rotate(45deg)}',
    '[data-o-cardnav][data-o-cardnav-open] [data-o-cardnav-burger] i:nth-child(2){opacity:0}',
    '[data-o-cardnav][data-o-cardnav-open] [data-o-cardnav-burger] i:nth-child(3){transform:translateY(-5px) rotate(-45deg)}',
    // The panel: a row that goes from zero to a fraction.
    '[data-o-cardnav-panel]{',
    'display:grid;grid-template-rows:0fr;',
    'transition:grid-template-rows calc(var(--o-duration-slow) * 1.4) cubic-bezier(0.2,0,0,1);',
    '}',
    '[data-o-cardnav-panel]>div{overflow:hidden;min-height:0;visibility:hidden;',
    'transition:visibility 0s linear calc(var(--o-duration-slow) * 1.4)}',
    '[data-o-cardnav][data-o-cardnav-open] [data-o-cardnav-panel]{grid-template-rows:1fr}',
    '[data-o-cardnav][data-o-cardnav-open] [data-o-cardnav-panel]>div{visibility:visible;transition:none}',
    '[data-o-cardnav] ul{',
    'display:grid;grid-template-columns:repeat(auto-fit,minmax(10rem,1fr));gap:0.5rem;',
    'margin:0;padding:0 0.5rem 0.5rem;list-style:none;',
    '}',
    '[data-o-cardnav-card]{',
    'display:flex;flex-direction:column;justify-content:space-between;gap:1.5rem;',
    'width:100%;min-height:7rem;padding:0.9rem 1rem;box-sizing:border-box;',
    'border-radius:calc(var(--o-cardnav-radius) - 0.35rem);',
    'border:1px solid var(--o-theme-line);',
    'background:color-mix(in oklab,var(--o-cardnav-tint) 14%,var(--o-theme-surface));',
    'color:inherit;text-decoration:none;font:inherit;text-align:left;cursor:pointer;',
    'opacity:0;transform:translateY(12px);',
    'transition:opacity var(--o-duration-slow) linear,transform var(--o-duration-slow) cubic-bezier(0.2,0,0,1),',
    'background-color var(--o-duration-slow) linear;',
    '}',
    '[data-o-cardnav][data-o-cardnav-open] [data-o-cardnav-card]{',
    'opacity:1;transform:none;',
    'transition-delay:calc(var(--o-cardnav-i) * var(--o-cardnav-stagger) + var(--o-duration-slow) * 0.4);',
    '}',
    '[data-o-cardnav-card]:hover{background:color-mix(in oklab,var(--o-cardnav-tint) 24%,var(--o-theme-surface))}',
    '[data-o-cardnav-card]:focus-visible{outline:2px solid currentColor;outline-offset:-2px}',
    '[data-o-cardnav-card][aria-current] [data-o-cardnav-label]{color:var(--o-palette-brand-500)}',
    '[data-o-cardnav-head]{display:flex;align-items:flex-start;justify-content:space-between;gap:0.5rem}',
    '[data-o-cardnav-arrow]{width:1em;height:1em;flex:none;opacity:0.6;transition:transform var(--o-duration-slow) cubic-bezier(0.2,0,0,1)}',
    '[data-o-cardnav-card]:hover [data-o-cardnav-arrow]{transform:translate(2px,-2px)}',
    '[data-o-cardnav-label]{font-weight:600}',
    '[data-o-cardnav-desc]{display:block;margin-top:0.2rem;font-size:0.85em;opacity:0.7}',
    '@media (prefers-reduced-motion:reduce){',
    '[data-o-cardnav-panel],[data-o-cardnav-card],[data-o-cardnav-burger] i,[data-o-cardnav-arrow]{transition:none}',
    '[data-o-cardnav-panel]>div{transition:none}',
    '}',
  ].join('')
  document.head.append(style)
}

/**
 * Bar that unfolds into cards.
 *
 * @example
 * <CardNav
 *   brand={<strong>Studio</strong>}
 *   items={[
 *     { label: 'Work', href: '/work', description: 'What we have shipped.' },
 *     { label: 'Studio', href: '/studio', description: 'Who we are.' },
 *     { label: 'Contact', href: '/contact', description: 'Let us talk about your project.' },
 *   ]}
 * />
 *
 * @example
 * // Another range, and a call to action on the right.
 * <CardNav items={links} colors={['--o-palette-fuchsia-500']} cta={<a href="/quote">Quote</a>} />
 */
export function CardNav({
  items,
  brand,
  cta,
  colors = DEFAULT_COLORS,
  stagger = 60,
  open,
  onOpenChange,
  active,
  onActiveChange,
  label = 'Menu',
  ...rest
}: CardNavProps): ReactElement {
  const { reduced } = useMotionState()
  const panelId = useId()
  const hostRef = useRef<HTMLElement | null>(null)
  const toggleRef = useRef<HTMLButtonElement | null>(null)
  const [internal, setInternal] = useState(false)
  ensureCardNavRules()

  const isOpen = open ?? internal

  const setOpen = (next: boolean): void => {
    if (open === undefined) setInternal(next)
    onOpenChange?.(next)
  }

  const cards = (): HTMLElement[] =>
    Array.from(
      hostRef.current?.querySelectorAll<HTMLElement>('[data-o-cardnav-card]') ?? [],
    )

  // Closed, focus returns to the button if it was on a card.
  useEffect(() => {
    const host = hostRef.current
    if (host === null || isOpen) return
    if (
      host.contains(document.activeElement) &&
      document.activeElement !== toggleRef.current
    ) {
      toggleRef.current?.focus()
    }
  }, [isOpen])

  const onKeyDown = (event: KeyboardEvent<HTMLElement>): void => {
    if (event.key === 'Escape') {
      if (!isOpen) return
      event.preventDefault()
      setOpen(false)
      toggleRef.current?.focus()
      return
    }

    const all = cards()
    const focused = all.findIndex((card) => card === document.activeElement)
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

  const { className, style } = mergePresentation({}, rest)
  const radius =
    typeof style?.borderRadius === 'number'
      ? `${String(style.borderRadius)}px`
      : style?.borderRadius

  const arrow = (
    <svg aria-hidden="true" viewBox="0 0 16 16" fill="none" data-o-cardnav-arrow="">
      <path
        d="M4 12 12 4M6 4h6v6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )

  return (
    <nav
      {...rest}
      ref={hostRef}
      data-o-cardnav=""
      {...(isOpen ? { 'data-o-cardnav-open': '' } : {})}
      className={className}
      style={
        {
          ...style,
          '--o-cardnav-stagger': `${String(reduced ? 0 : stagger)}ms`,
          '--o-cardnav-radius': radius ?? '0.75rem',
        } as CSSProperties
      }
      onKeyDown={(event) => {
        onKeyDown(event)
        rest.onKeyDown?.(event)
      }}
    >
      <div data-o-cardnav-bar="">
        <div data-o-cardnav-brand="">{brand}</div>
        {cta}
        <button
          ref={toggleRef}
          type="button"
          data-o-cardnav-toggle=""
          aria-expanded={isOpen}
          aria-controls={panelId}
          aria-label={label}
          onClick={() => setOpen(!isOpen)}
        >
          <span aria-hidden="true" data-o-cardnav-burger="">
            <i />
            <i />
            <i />
          </span>
        </button>
      </div>
      <div id={panelId} data-o-cardnav-panel="">
        <div>
          <ul>
            {items.map((item, index) => {
              const isCurrent = index === active
              const tint =
                colors[index % Math.max(colors.length, 1)] ?? DEFAULT_COLORS[0] ?? ''
              const vars = {
                '--o-cardnav-i': String(index),
                '--o-cardnav-tint': `var(${tint})`,
              } as CSSProperties
              const content = (
                <>
                  <span data-o-cardnav-head="">
                    <span aria-hidden="true">{item.icon}</span>
                    {arrow}
                  </span>
                  <span>
                    <span data-o-cardnav-label="">{item.label}</span>
                    {item.description !== undefined && (
                      <span data-o-cardnav-desc="">{item.description}</span>
                    )}
                  </span>
                </>
              )
              return (
                <li key={`${item.label}-${String(index)}`}>
                  {item.href !== undefined ? (
                    <a
                      href={item.href}
                      data-o-cardnav-card=""
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
                      data-o-cardnav-card=""
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
      </div>
    </nav>
  )
}

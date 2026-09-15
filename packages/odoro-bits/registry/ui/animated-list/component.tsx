/**
 * List that fills in a cascade when it enters the viewport, and whose hovered
 * row lights up.
 *
 * ## The cascade fires on arrival, not on mount
 *
 * A list placed at the bottom of the page has finished animating before anyone
 * sees it: all that is left is a block already in place, and the work is lost.
 * Observing with `useInView` waits until the list is really being looked at.
 * Each row's delay is an index written into a variable — the stylesheet turns
 * it into an `animation-delay`, and the component sets no timer at all.
 *
 * ## This is not a tab bar
 *
 * Tabs change views and live inside a `tablist`. Here one picks a row from an
 * inventory: this is a `listbox`, selection follows focus, and the list
 * scrolls. Arrows wrap around, Home and End jump to the ends, and a single row
 * sits in the tab order.
 *
 * ## The edge veil is a mask, not a gradient laid on top
 *
 * A stacked gradient would have to know the background colour; it gives itself
 * away as soon as the page changes theme. A `mask-image` removes alpha: it
 * works on any background, and leaves the rows underneath clickable.
 *
 * ## Reduced motion
 *
 * No cascade: rows are at their final place, visible, from the first render —
 * the observation no longer gates anything.
 *
 * @module
 */

import { mergePresentation, type Customisable } from '@odoro-cli/engine'
import { useInView } from '@registre/hooks/useInView'
import {
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type ReactElement,
} from 'react'

/** One row of the list. */
export interface AnimatedListItem {
  /** Identifier, unique within the list. */
  readonly id: string
  /** Displayed label. */
  readonly label: string
  /** Detail shown muted, to the right of the label. */
  readonly hint?: string
}

/** Properties specific to the component. */
export interface AnimatedListOwnProps {
  /** The rows, in display order. */
  items: readonly AnimatedListItem[]
  /** Name of the list for screen readers. */
  label: string
  /** Selected row, in controlled mode. */
  value?: string
  /** Row selected on mount, in uncontrolled mode. */
  defaultValue?: string
  /** Called when the selection changes. */
  onChange?: (id: string) => void
  /** Delay added per row in the cascade. @defaultValue 60 */
  stagger?: number
  /** Veils the top and bottom edges of the scrolling area. @defaultValue true */
  fade?: boolean
}

/** All properties. */
export type AnimatedListProps = Customisable<AnimatedListOwnProps>

/** Identifier of the injected stylesheet. */
const STYLE_ID = 'o-animated-list'

/** Applies the scroll area, the rows and their cascade, once per document. */
function ensureListRules(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-alist]{',
    'display:flex;flex-direction:column;gap:6px;overflow-y:auto;overscroll-behavior:contain;',
    'padding:4px;scrollbar-width:thin;',
    '}',
    // The veil is a mask: it does not know the background colour.
    '[data-o-alist][data-o-alist-fade]{',
    '-webkit-mask-image:linear-gradient(to bottom,transparent,currentColor 10%,currentColor 90%,transparent);',
    'mask-image:linear-gradient(to bottom,transparent,currentColor 10%,currentColor 90%,transparent);',
    '}',
    '[data-o-alist] [role="option"]{',
    'position:relative;display:flex;align-items:center;justify-content:space-between;gap:1rem;',
    'padding:0.6rem 0.9rem;border-radius:0.7rem;cursor:pointer;text-align:left;',
    'border:1px solid var(--o-theme-line);background:var(--o-theme-surface);',
    'font:inherit;color:inherit;',
    'transition:transform var(--o-duration-base) var(--o-ease-standard),',
    'background-color var(--o-duration-base) linear,border-color var(--o-duration-base) linear;',
    '}',
    // The left rule: that is what "lights up" the row, not a solid background.
    '[data-o-alist] [role="option"]::before{',
    'content:"";position:absolute;left:0;top:50%;translate:0 -50%;',
    'width:3px;height:0;border-radius:999px;background:var(--o-alist-accent);',
    'transition:height var(--o-duration-base) var(--o-ease-standard);',
    '}',
    '[data-o-alist] [role="option"]:is(:hover,:focus-visible){',
    'transform:translateX(3px);',
    'background:color-mix(in oklab,var(--o-alist-accent) 7%,var(--o-theme-surface));',
    '}',
    '[data-o-alist] [role="option"]:is(:hover,:focus-visible)::before{height:45%}',
    '[data-o-alist] [role="option"][aria-selected="true"]{',
    'border-color:color-mix(in oklab,var(--o-alist-accent) 45%,transparent);',
    'background:color-mix(in oklab,var(--o-alist-accent) 10%,var(--o-theme-surface));',
    '}',
    '[data-o-alist] [role="option"][aria-selected="true"]::before{height:60%}',
    '[data-o-alist] [role="option"]:focus-visible{outline:2px solid var(--o-alist-accent);outline-offset:2px}',
    '[data-o-alist-hint]{opacity:0.55;font-size:0.875em;white-space:nowrap}',
    // Before the cascade, rows are held back; the in-view attribute releases them.
    '[data-o-alist] [role="option"]{opacity:0}',
    '[data-o-alist][data-o-alist-seen] [role="option"]{',
    'animation:o-alist-in var(--o-duration-slow) var(--o-ease-entrance) both;',
    'animation-delay:calc(var(--o-alist-index) * var(--o-alist-stagger));',
    '}',
    // The cascade plays on `translate`, not on `transform`: an animation filled
    // forwards would keep hold of `transform`, and hover could no longer shift
    // the row.
    '@keyframes o-alist-in{from{opacity:0;translate:0 12px}to{opacity:1;translate:none}}',
    // Reduced motion: final state right away, without waiting for the viewport.
    '@media (prefers-reduced-motion:reduce){',
    '[data-o-alist] [role="option"]{opacity:1;animation:none;transition:none}',
    '[data-o-alist] [role="option"]::before{transition:none}',
    '}',
  ].join('')
  document.head.append(style)
}

/**
 * List whose rows enter in a cascade and light up on hover.
 *
 * @example
 * <AnimatedList
 *   label="Activity"
 *   items={[
 *     { id: 'a', label: 'Transfer received', hint: '120 EUR' },
 *     { id: 'b', label: 'Subscription', hint: '9 EUR' },
 *   ]}
 *   defaultValue="a"
 *   className="o-max-h-64"
 * />
 *
 * @example
 * // Controlled mode: the page decides which row is selected.
 * <AnimatedList label="Files" items={files} value={choice} onChange={setChoice} stagger={40} />
 */
export function AnimatedList({
  items,
  label,
  value,
  defaultValue,
  onChange,
  stagger = 60,
  fade = true,
  ...rest
}: AnimatedListProps): ReactElement {
  const { ref, inView } = useInView<HTMLDivElement>({ amount: 0.15 })
  const [internal, setInternal] = useState<string | undefined>(defaultValue)
  ensureListRules()

  const current = value ?? internal ?? items[0]?.id
  const currentIndex = Math.max(
    0,
    items.findIndex((item) => item.id === current),
  )

  const choose = (id: string): void => {
    if (value === undefined) setInternal(id)
    onChange?.(id)
  }

  /** Selection follows focus: this is a single-select listbox. */
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>): void => {
    const last = items.length - 1
    if (last < 0) return
    const moves: Readonly<Record<string, number | undefined>> = {
      ArrowDown: currentIndex >= last ? 0 : currentIndex + 1,
      ArrowUp: currentIndex <= 0 ? last : currentIndex - 1,
      Home: 0,
      End: last,
    }
    const target = moves[event.key]
    if (target === undefined) return
    event.preventDefault()
    const item = items[target]
    if (item === undefined) return
    choose(item.id)
    const option =
      ref.current?.querySelectorAll<HTMLButtonElement>('[role="option"]')[target]
    option?.focus()
    option?.scrollIntoView({ block: 'nearest' })
  }

  const { className, style } = mergePresentation({}, rest)

  return (
    <div
      {...rest}
      ref={ref}
      role="listbox"
      aria-label={label}
      data-o-alist=""
      data-o-alist-fade={fade ? '' : undefined}
      data-o-alist-seen={inView ? '' : undefined}
      className={className}
      style={
        {
          '--o-alist-accent': 'var(--o-palette-brand-500)',
          '--o-alist-stagger': `${String(stagger)}ms`,
          ...style,
        } as CSSProperties
      }
      onKeyDown={(event) => {
        onKeyDown(event)
        rest.onKeyDown?.(event)
      }}
    >
      {items.map((item, index) => (
        <button
          key={item.id}
          type="button"
          role="option"
          aria-selected={item.id === current}
          tabIndex={index === currentIndex ? 0 : -1}
          style={{ '--o-alist-index': index } as CSSProperties}
          onClick={() => {
            choose(item.id)
          }}
        >
          <span>{item.label}</span>
          {item.hint !== undefined && <span data-o-alist-hint="">{item.hint}</span>}
        </button>
      ))}
    </div>
  )
}

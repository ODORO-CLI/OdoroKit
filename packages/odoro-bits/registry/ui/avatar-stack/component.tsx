/**
 * Avatar stack: overlapping initials that spread out on hover.
 *
 * ## The spreading is a margin, not a transform
 *
 * At rest, each badge bites into the previous one through a negative margin;
 * on hover or focus, the margin returns to zero and the row spreads. A
 * transform would be composited faster, but it would not push the neighbours:
 * the row would keep its width and the badges would overlap differently.
 * Here the geometry really does change, and the margin is the honest property
 * for saying so.
 *
 * ## The keyboard has the same rights as the mouse
 *
 * The group is focusable, and `:focus-visible` triggers the same spreading as
 * `:hover`: a keyboard user can read every name, not only the first one in
 * the stack.
 *
 * ## The initials are not the name
 *
 * Each badge carries the full name in `title` and off-screen; the initials,
 * being redundant, are removed from the accessibility tree.
 *
 * @module
 */

import { mergePresentation, useMotionState, type Customisable } from '@odoro-cli/engine'
import { type CSSProperties, type ReactElement } from 'react'

/** One person in the stack. */
export interface AvatarStackItem {
  /** Full name, shown as a tooltip and read by screen readers. */
  readonly name: string
  /** Palette token for the background, otherwise the default cycle. */
  readonly tone?: string
}

/** Properties specific to the component. */
export interface AvatarStackOwnProps {
  /** The people, in display order. */
  items: readonly AvatarStackItem[]
  /** Number of badges shown before the overflow counter. @defaultValue 5 */
  max?: number
  /** Overlap of the badges at rest, in pixels. @defaultValue 12 */
  offset?: number
  /** Name of the group for screen readers. @defaultValue 'Team' */
  label?: string
}

/** All properties. */
export type AvatarStackProps = Customisable<AvatarStackOwnProps>

/** Default hue cycle, one per position. */
const TONES = [
  '--o-palette-brand-500',
  '--o-palette-emerald-500',
  '--o-palette-amber-500',
  '--o-palette-rose-500',
  '--o-palette-sky-500',
] as const

/** Identifier of the injected stylesheet. */
const STYLE_ID = 'o-avatar-stack'

/** Applies the stack and its spreading, once per document. */
function ensureStackRules(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-avatars]{display:inline-flex;align-items:center}',
    '[data-o-avatars] [data-o-avatar]{',
    'display:inline-flex;align-items:center;justify-content:center;',
    'width:2.5rem;height:2.5rem;border-radius:999px;',
    'background:var(--o-avatar-tone);color:var(--o-avatar-ink);',
    'font-size:0.8125rem;font-weight:600;letter-spacing:0.02em;',
    'border:2px solid color-mix(in oklch,var(--o-avatar-ink) 90%,transparent);',
    'margin-inline-start:calc(var(--o-avatars-offset) * -1);',
    'transition:margin-inline-start var(--o-duration-slow) var(--o-ease-standard);',
    '}',
    '[data-o-avatars] [data-o-avatar]:first-child{margin-inline-start:0}',
    '[data-o-avatars]:is(:hover,:focus-visible) [data-o-avatar]{margin-inline-start:0}',
    // Reduced motion: the spreading stays, only the travel disappears.
    '@media (prefers-reduced-motion:reduce){',
    '[data-o-avatars] [data-o-avatar]{transition:none}',
    '}',
  ].join('')
  document.head.append(style)
}

/** The initials of a name: first letter of the first two words. */
function initialsOf(name: string): string {
  return name
    .split(/\s+/)
    .filter((word) => word !== '')
    .slice(0, 2)
    .map((word) => word.charAt(0).toLocaleUpperCase())
    .join('')
}

/**
 * Stack of overlapping initials that spreads out on hover or focus.
 *
 * @example
 * <AvatarStack
 *   items={[
 *     { name: 'Ada Lovelace' },
 *     { name: 'Grace Hopper' },
 *     { name: 'Alan Turing' },
 *   ]}
 * />
 *
 * @example
 * // A forced tone, and more overlap.
 * <AvatarStack items={[{ name: 'Ada', tone: '--o-palette-sky-500' }]} offset={18} />
 */
export function AvatarStack({
  items,
  max = 5,
  offset = 12,
  label = 'Team',
  ...rest
}: AvatarStackProps): ReactElement {
  const { reduced } = useMotionState()
  ensureStackRules()

  const shown = items.slice(0, max)
  const surplus = items.length - shown.length

  const { className, style } = mergePresentation({}, rest)

  return (
    <div
      {...rest}
      role="group"
      aria-label={label}
      tabIndex={0}
      data-o-avatars=""
      className={className}
      style={
        {
          ...style,
          '--o-avatars-offset': `${String(offset)}px`,
          '--o-avatar-ink': 'var(--o-palette-zinc-50)',
          ...(reduced ? { '--o-duration-slow': '0ms' } : {}),
        } as CSSProperties
      }
    >
      {shown.map((item, index) => (
        <span
          key={item.name}
          data-o-avatar=""
          title={item.name}
          style={
            {
              '--o-avatar-tone': `var(${item.tone ?? TONES[index % TONES.length] ?? TONES[0]})`,
            } as CSSProperties
          }
        >
          <span aria-hidden="true">{initialsOf(item.name)}</span>
          <span className="o-sr-only">{item.name}</span>
        </span>
      ))}
      {surplus > 0 ? (
        <span
          data-o-avatar=""
          style={
            {
              '--o-avatar-tone': 'color-mix(in oklch,currentColor 35%,transparent)',
            } as CSSProperties
          }
        >
          <span aria-hidden="true">+{surplus}</span>
          <span className="o-sr-only">{`${String(surplus)} more people`}</span>
        </span>
      ) : null}
    </div>
  )
}

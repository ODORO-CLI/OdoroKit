/**
 * Bento grid: tiles of unequal sizes, revealed on entry.
 *
 * ## What a bento grid solves, and what it breaks
 *
 * A regular grid gives the same weight to everything: twelve arguments are
 * worth twelve times nothing. Unequal tiles restore a hierarchy — what counts
 * takes two columns, the rest lines up around it.
 *
 * The price is a classic trap: a width picked tile by tile ends up producing
 * an incomplete row as soon as one more is added. The width is therefore
 * bounded by the number of available columns, and a tile that is too wide is
 * pulled back into the grid rather than allowed to overflow it.
 *
 * ## A single column below the medium breakpoint
 *
 * Every size is neutralized on a small screen. A "two columns out of four"
 * tile placed in a one-column grid no longer means anything, and keeping it
 * alive past the breakpoint produces either a horizontal overflow or a
 * crushed tile.
 *
 * ## The cascade is a transition, not an animation
 *
 * Every tile travels the same path, offset by a delay. That is exactly what a
 * CSS transition knows how to do, and the compositor handles it alone: nothing
 * runs in JavaScript during the reveal.
 *
 * Under reduced motion the starting attribute is never set: the tiles are
 * simply there. A neutralized cascade that left the grid invisible would be a
 * defect, not respect for the preference.
 *
 * @module
 */

import { mergePresentation, useMotionState, type Customisable } from '@odoro-cli/engine'
import { type CSSProperties, type ReactElement, type ReactNode } from 'react'

import { useInView } from '@registre/hooks/useInView'

/** One tile of the grid. */
export interface BentoItem {
  /** Identifier, unique within the grid. */
  readonly id: string
  /** Heading of the tile. */
  readonly title: string
  /** What the tile tells. */
  readonly body?: ReactNode
  /** Columns taken. Bounded to the column count of the grid. @defaultValue 1 */
  readonly cols?: number
  /** Rows taken. @defaultValue 1 */
  readonly rows?: number
  /** Visual placed under the text: illustration, screenshot, glyph. */
  readonly media?: ReactNode
  /** Address: the tile then becomes a link, and not an inert block. */
  readonly href?: string
  /** Puts the tile forward: solid background, brand border. */
  readonly featured?: boolean
}

/** Props specific to the component. */
export interface BentoGridOwnProps {
  /** The tiles, in reading order. */
  items: readonly BentoItem[]
  /** Columns beyond the medium breakpoint. @defaultValue 4 */
  columns?: number
  /** Height of a row, in pixels. @defaultValue 180 */
  rowHeight?: number
  /** Offset between two tiles at reveal time, in milliseconds. @defaultValue 60 */
  stagger?: number
  /** Name of the section, announced to assistive technologies. */
  label?: string
}

/** All the props. */
export type BentoGridProps = Customisable<BentoGridOwnProps, 'section'>

/** Identifier of the injected stylesheet. */
const STYLE_ID = 'o-bento-grid'

/** Sets the grid rules, once per document. */
function ensureBentoRules(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-bento]{display:grid;gap:0.75rem;grid-template-columns:1fr;list-style:none;margin:0;padding:0}',
    // The sizes only exist beyond the breakpoint: below it, the grid has one
    // column and "two columns out of four" no longer means anything.
    '@media (min-width:48rem){[data-o-bento]{',
    'grid-template-columns:repeat(var(--o-bento-columns),minmax(0,1fr));',
    'grid-auto-rows:var(--o-bento-row)}',
    '[data-o-bento]>li{grid-column:span var(--o-bento-cols);grid-row:span var(--o-bento-rows)}}',

    '[data-o-bento-tuile]{display:flex;flex-direction:column;height:100%;overflow:hidden}',
    '[data-o-bento-media]{flex:1;min-height:0;margin-top:0.75rem}',

    '[data-o-bento-cache]>li{',
    'opacity:0;transform:translateY(14px) scale(0.98);',
    'transition:opacity var(--o-duration-slower) var(--o-ease-entrance),',
    'transform var(--o-duration-slower) var(--o-ease-entrance);',
    'transition-delay:var(--o-bento-delay)}',
    '[data-o-bento-seen]>li{opacity:1;transform:none}',

    '@media (prefers-reduced-motion:reduce){',
    '[data-o-bento-cache]>li{opacity:1;transform:none;transition:none}}',
  ].join('')
  document.head.append(style)
}

/**
 * The body of a tile, without its wrapper.
 *
 * It is kept apart so that the tile can be a link or a block without the
 * content being written twice — and without the dynamic element that would
 * force lying about the type of the attributes.
 */
function Body({ item }: { item: BentoItem }): ReactElement {
  return (
    <>
      <h3 className="o-text-base o-font-semibold o-tracking-tight">{item.title}</h3>
      {item.body !== undefined && (
        <div
          className="o-mt-2 o-text-sm o-leading-relaxed"
          style={{ color: 'var(--o-theme-muted)' }}
        >
          {item.body}
        </div>
      )}
      {item.media !== undefined && (
        // The visual is decorative: the text of the tile already says what it
        // tells, and having it read out would add noise.
        <div data-o-bento-media="" aria-hidden>
          {item.media}
        </div>
      )}
    </>
  )
}

/** Dressing of a tile, depending on whether it is featured or not. */
function tileStyle(item: BentoItem): CSSProperties {
  return {
    backgroundColor:
      item.featured === true
        ? 'color-mix(in oklab, var(--o-palette-brand-500) 12%, var(--o-theme-surface))'
        : 'var(--o-theme-surface)',
    border: `1px solid ${
      item.featured === true ? 'var(--o-palette-brand-500)' : 'var(--o-theme-line)'
    }`,
    color: 'var(--o-theme-fg)',
    textDecoration: 'none',
  }
}

/** Classes common to both tile wrappers. */
const TILE = 'o-rounded-xl o-p-5 focus:o-ring'

/**
 * A bento grid revealed as a cascade.
 *
 * @example
 * <BentoGrid
 *   label="What the registry guarantees"
 *   items={[
 *     { id: 'copy', title: 'The code is yours', cols: 2, body: <p>Copied, never linked.</p> },
 *     { id: 'fallback', title: 'A fallback always planned' },
 *   ]}
 * />
 */
export function BentoGrid({
  items,
  columns = 4,
  rowHeight = 180,
  stagger = 60,
  label,
  ...rest
}: BentoGridProps): ReactElement {
  const { reduced } = useMotionState()
  const { ref, inView } = useInView<HTMLElement>({ amount: 0.15 })
  ensureBentoRules()

  const columnCount = Math.max(1, Math.round(columns))

  const { className, style } = mergePresentation({}, rest)

  return (
    <section
      {...rest}
      ref={ref}
      aria-label={label}
      className={className}
      style={style as CSSProperties}
    >
      <ul
        data-o-bento=""
        data-o-bento-cache={reduced ? undefined : ''}
        data-o-bento-seen={inView && !reduced ? '' : undefined}
        style={
          {
            '--o-bento-columns': String(columnCount),
            '--o-bento-row': `${String(rowHeight)}px`,
          } as CSSProperties
        }
      >
        {items.map((item, index) => {
          // A tile wider than the grid would produce a row that nothing fills:
          // it is pulled back rather than left to overflow.
          const cols = Math.min(columnCount, Math.max(1, Math.round(item.cols ?? 1)))
          const rows = Math.max(1, Math.round(item.rows ?? 1))

          return (
            <li
              key={item.id}
              style={
                {
                  '--o-bento-cols': String(cols),
                  '--o-bento-rows': String(rows),
                  '--o-bento-delay': `${String(index * stagger)}ms`,
                } as CSSProperties
              }
            >
              {item.href === undefined ? (
                <div data-o-bento-tuile="" className={TILE} style={tileStyle(item)}>
                  <Body item={item} />
                </div>
              ) : (
                <a
                  href={item.href}
                  data-o-bento-tuile=""
                  className={TILE}
                  style={tileStyle(item)}
                >
                  <Body item={item} />
                </a>
              )}
            </li>
          )
        })}
      </ul>
    </section>
  )
}

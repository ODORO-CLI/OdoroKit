/**
 * Comparison table.
 *
 * ## A scrolling area must be able to receive the focus
 *
 * This is the least known rule of the accessibility of wide tables: an
 * overflow container is only reachable with the mouse or the finger as long as
 * it cannot receive the focus. Someone navigating with the keyboard then
 * cannot see the right-hand columns — the content exists and stays out of
 * reach.
 *
 * The wrapper therefore carries `tabindex`, a region role and a name. Once
 * inside, the arrows scroll, as everywhere else.
 *
 * ## What sticks, and why twice
 *
 * The header sticks to the top: without it, a check is read without knowing
 * which plan it talks about. The first column sticks to the left: without it,
 * a check is read without knowing which criterion it is about. The two flaws
 * are symmetrical, and a wide comparison table needs both.
 *
 * The corner cell sticks in both directions, failing which it would pass under
 * its neighbors at the first diagonal.
 *
 * ## A check is a word, not a drawing
 *
 * A "✓" read by a speech synthesis gives "check", or nothing at all depending
 * on the font and the setting. The sign is therefore decorative, and a hidden
 * text says "included" or "not included". It is that text that is announced,
 * and it is that one a search in the page will find.
 *
 * ## The cascade is per row
 *
 * A reveal per cell would make the table flicker; per column, it would ask for
 * a delay on every cell of a same column, hence a value written as many times
 * as there are lines. The row is the only unit that reads and that offsets at
 * little cost.
 *
 * @module
 */

import { mergePresentation, useMotionState, type Customisable } from '@odoro-cli/engine'
import { Fragment, useId, type CSSProperties, type ReactElement } from 'react'

import { useInView } from '@registre/hooks/useInView'

/** One compared column. */
export interface ComparisonColumn {
  /** What the column designates: a plan, a product, a version. */
  readonly name: string
  /** A detail under the name. */
  readonly note?: string
  /** Puts the column forward. Only one should. */
  readonly featured?: boolean
}

/** One compared row. */
export interface ComparisonRow {
  /** The compared criterion. */
  readonly label: string
  /**
   * One value per column, in the same order.
   *
   * A boolean becomes a check or a dash along with their text; everything else
   * is displayed as is.
   */
  readonly values: readonly (boolean | string)[]
  /** Group the row belongs to. The rows of a same group follow each other. */
  readonly group?: string
}

/** Props specific to the component. */
export interface ComparisonTableOwnProps {
  /** The compared columns. */
  columns: readonly ComparisonColumn[]
  /** The rows, in display order. */
  rows: readonly ComparisonRow[]
  /** Caption of the table. It is displayed, and it names the scrolling area. */
  caption: string
  /** Maximum height of the scrolling area, in pixels. @defaultValue 480 */
  maxHeight?: number
  /** What is said of a true value. @defaultValue 'Included' */
  yesLabel?: string
  /** What is said of a false value. @defaultValue 'Not included' */
  noLabel?: string
}

/** All the props. */
export type ComparisonTableProps = Customisable<ComparisonTableOwnProps, 'section'>

/** Identifier of the injected stylesheet. */
const STYLE_ID = 'o-comparison-table'

/** Sets the table rules, once per document. */
function ensureComparisonRules(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-cmp-zone]{overflow:auto;max-height:var(--o-cmp-height);border-radius:0.75rem;',
    'border:1px solid var(--o-theme-line)}',
    '[data-o-cmp-zone]:focus-visible{outline:2px solid var(--o-palette-brand-500);outline-offset:2px}',

    '[data-o-cmp]{border-collapse:separate;border-spacing:0;width:100%;min-width:36rem}',
    '[data-o-cmp] th,[data-o-cmp] td{',
    'padding:0.7rem 1rem;text-align:left;font-size:0.8125rem;',
    'border-bottom:1px solid var(--o-theme-line);background-color:var(--o-theme-surface)}',

    // The header sticks to the top, the first column to the left. The two gaps
    // are symmetrical: without one there is no telling which plan it is about,
    // without the other which criterion.
    '[data-o-cmp] thead th{position:sticky;top:0;z-index:2;font-weight:600}',
    '[data-o-cmp] [data-o-cmp-critere]{position:sticky;left:0;z-index:1;font-weight:500}',
    // The corner sticks in both directions: otherwise it passes under its
    // neighbors at the first diagonal.
    '[data-o-cmp] thead [data-o-cmp-critere]{z-index:3}',

    '[data-o-cmp] [data-o-cmp-groupe]{',
    'font-size:0.6875rem;text-transform:uppercase;letter-spacing:0.06em;',
    'background-color:var(--o-theme-bg)}',

    '[data-o-cmp-cache] tbody tr{',
    'opacity:0;transform:translateY(8px);',
    'transition:opacity var(--o-duration-slow) var(--o-ease-entrance),',
    'transform var(--o-duration-slow) var(--o-ease-entrance);',
    'transition-delay:var(--o-cmp-delay)}',
    '[data-o-cmp-seen] tbody tr{opacity:1;transform:none}',

    '@media (prefers-reduced-motion:reduce){',
    '[data-o-cmp-cache] tbody tr{opacity:1;transform:none;transition:none}}',
  ].join('')
  document.head.append(style)
}

/** Renders a cell value, sign and text included. */
function Value({
  value,
  yes,
  no,
}: {
  value: boolean | string
  yes: string
  no: string
}): ReactElement {
  if (typeof value === 'string') return <>{value}</>

  return (
    <>
      {/*
        The sign is decorative: depending on the font and the setting, a speech
        synthesis says "check", "check mark" or nothing. It is the hidden text
        that carries the meaning, and it is the one the search in the page
        finds.
      */}
      <span
        aria-hidden
        style={{
          color: value
            ? 'var(--o-palette-emerald-600)'
            : 'color-mix(in oklab, var(--o-theme-muted) 70%, transparent)',
        }}
      >
        {value ? '✓' : '—'}
      </span>
      <span className="o-sr-only">{value ? yes : no}</span>
    </>
  )
}

/**
 * A comparison table with a sticky header and keyboard scrolling.
 *
 * @example
 * <ComparisonTable
 *   caption="What each plan includes"
 *   columns={[{ name: 'Starter' }, { name: 'Studio', featured: true }, { name: 'Agency' }]}
 *   rows={[
 *     { label: 'Projects', values: ['1', '10', 'Unlimited'] },
 *     { label: 'Private registry', values: [false, false, true] },
 *   ]}
 * />
 */
export function ComparisonTable({
  columns,
  rows,
  caption,
  maxHeight = 480,
  yesLabel = 'Included',
  noLabel = 'Not included',
  ...rest
}: ComparisonTableProps): ReactElement {
  const { reduced } = useMotionState()
  const { ref, inView } = useInView<HTMLElement>({ amount: 0.1 })
  const title = `${useId().replace(/[^a-zA-Z0-9]/g, '')}-title`

  ensureComparisonRules()

  /** Background of a cell, tinted if its column is put forward. */
  const background = (index: number): string =>
    columns[index]?.featured === true
      ? 'color-mix(in oklab, var(--o-palette-brand-500) 8%, var(--o-theme-surface))'
      : 'var(--o-theme-surface)'

  let currentGroup: string | undefined

  const { className, style } = mergePresentation(
    { className: 'o-flex o-flex-col o-gap-4' },
    rest,
  )

  return (
    <section {...rest} ref={ref} className={className} style={style as CSSProperties}>
      {/*
        A single sentence names both objects: the area that can be scrolled and
        the table it contains. An extra hidden `caption` would make the same
        text be heard twice in a row.
      */}
      <p
        id={title}
        className="o-text-sm o-font-medium"
        style={{ color: 'var(--o-theme-fg)' }}
      >
        {caption}
      </p>

      {/*
        The area receives the focus: without that, the right-hand columns are
        out of reach for whoever navigates with the keyboard.
      */}
      <div
        data-o-cmp-zone=""
        role="region"
        aria-labelledby={title}
        tabIndex={0}
        style={{ '--o-cmp-height': `${String(maxHeight)}px` } as CSSProperties}
      >
        <table
          data-o-cmp=""
          aria-labelledby={title}
          data-o-cmp-cache={reduced ? undefined : ''}
          data-o-cmp-seen={inView && !reduced ? '' : undefined}
        >
          <thead>
            <tr>
              <th
                scope="col"
                data-o-cmp-critere=""
                style={{ color: 'var(--o-theme-muted)' }}
              >
                Criterion
              </th>
              {columns.map((column, index) => (
                <th
                  key={column.name}
                  scope="col"
                  style={{
                    backgroundColor: background(index),
                    color: 'var(--o-theme-fg)',
                  }}
                >
                  {column.name}
                  {column.note !== undefined && (
                    <span
                      className="o-block o-text-xs o-font-normal"
                      style={{ color: 'var(--o-theme-muted)' }}
                    >
                      {column.note}
                    </span>
                  )}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {rows.map((row, rank) => {
              const opensGroup = row.group !== undefined && row.group !== currentGroup
              if (row.group !== undefined) currentGroup = row.group

              return (
                <Fragment key={row.label}>
                  {opensGroup && (
                    <tr
                      style={
                        { '--o-cmp-delay': `${String(rank * 40)}ms` } as CSSProperties
                      }
                    >
                      <th
                        scope="colgroup"
                        colSpan={columns.length + 1}
                        data-o-cmp-groupe=""
                        style={{ color: 'var(--o-theme-muted)' }}
                      >
                        {row.group}
                      </th>
                    </tr>
                  )}
                  <tr
                    style={{ '--o-cmp-delay': `${String(rank * 40)}ms` } as CSSProperties}
                  >
                    <th
                      scope="row"
                      data-o-cmp-critere=""
                      style={{ color: 'var(--o-theme-fg)' }}
                    >
                      {row.label}
                    </th>
                    {columns.map((column, index) => (
                      <td
                        key={column.name}
                        style={{
                          backgroundColor: background(index),
                          color: 'var(--o-theme-fg)',
                        }}
                      >
                        <Value
                          value={row.values[index] ?? false}
                          yes={yesLabel}
                          no={noLabel}
                        />
                      </td>
                    ))}
                  </tr>
                </Fragment>
              )
            })}
          </tbody>
        </table>
      </div>
    </section>
  )
}

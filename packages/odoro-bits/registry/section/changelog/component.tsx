/**
 * Changelog.
 *
 * ## Why a definition list
 *
 * A changelog is a sequence of pairs: a version, and what it changed. That is
 * exactly the relation a `<dl>` describes — the term and its description — and
 * it is the only structure that makes it explicit. A sequence of headings and
 * lists gives the same drawing and leaves a screen reader to guess that
 * "2.4.0" relates to the six lines that follow.
 *
 * The ordering counts for something else: looking for "when did such a thing
 * change" in a changelog is a frequent operation, and a correct structure
 * makes it possible without having to read everything.
 *
 * ## The date is a date, not text
 *
 * `<time>` with its attribute: that is what tells a date apart from a string
 * that looks like one. Without it, "12/03" is ambiguous in half the world.
 *
 * ## The filter removes lines, not versions
 *
 * Filtering by kind — additions, fixes, removals — must not make a whole
 * version disappear: it would no longer be possible to know whether it changed
 * nothing or does not exist. The version therefore stays displayed, and the
 * count of hidden lines is told.
 *
 * The buttons carry `aria-pressed`: they are switches, not actions, and the
 * state of each one has to be heard before pressing.
 *
 * ## The reveal
 *
 * A cascade on entry into view, in CSS transitions, and nothing more. Under
 * reduced motion the starting state is not set: the changelog is simply there.
 *
 * @module
 */

import { mergePresentation, useMotionState, type Customisable } from '@odoro-cli/engine'
import { useState, type CSSProperties, type ReactElement, type ReactNode } from 'react'

import { useInView } from '@registre/hooks/useInView'

/** Kind of a change. */
export type ChangeKind = 'added' | 'changed' | 'fixed' | 'removed'

/** One line of the changelog. */
export interface ChangeNote {
  /** Kind of the change. */
  readonly kind: ChangeKind
  /** What changed. */
  readonly text: ReactNode
}

/** A published version. */
export interface Release {
  /** Version number, as it is published. */
  readonly version: string
  /** Displayed date. */
  readonly date: string
  /** Machine-readable date, in `YYYY-MM-DD` format. */
  readonly dateTime?: string
  /** One sentence that sums up the version. */
  readonly summary?: ReactNode
  /** The changes, in order of importance. */
  readonly notes: readonly ChangeNote[]
}

/** Props specific to the component. */
export interface ChangelogOwnProps {
  /** The versions, from the most recent to the oldest. */
  releases: readonly Release[]
  /** Offers the kind switches above the changelog. @defaultValue true */
  filterable?: boolean
  /** Name of the section, announced to assistive technologies. */
  label?: string
  /** Heading displayed above the changelog. */
  title?: ReactNode
}

/** All the props. */
export type ChangelogProps = Customisable<ChangelogOwnProps, 'section'>

/** Identifier of the injected stylesheet. */
const STYLE_ID = 'o-changelog'

/** What each kind displays, and the hue that carries it. */
const KINDS: Readonly<Record<ChangeKind, { label: string; hue: string }>> = {
  added: { label: 'Added', hue: 'var(--o-palette-emerald-600)' },
  changed: { label: 'Changed', hue: 'var(--o-palette-brand-600)' },
  fixed: { label: 'Fixed', hue: 'var(--o-palette-amber-600)' },
  removed: { label: 'Removed', hue: 'var(--o-palette-rose-600)' },
}

/** The kinds, in the order of the switches. */
const ORDER: readonly ChangeKind[] = ['added', 'changed', 'fixed', 'removed']

/** Sets the changelog rules, once per document. */
function ensureChangelogRules(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-log]{margin:0}',
    '[data-o-log-entree]{padding-block:1.5rem}',
    '[data-o-log-entree]+[data-o-log-entree]{border-top:1px solid var(--o-theme-line)}',
    '@media (min-width:48rem){[data-o-log-entree]{',
    'display:grid;grid-template-columns:10rem minmax(0,1fr);gap:1.5rem}',
    // The number stays in view while its lines are read: on a version with
    // twenty changes, there is no telling which one is being read without it.
    '[data-o-log-entree]>dt{position:sticky;top:1rem;align-self:start}}',
    '[data-o-log-entree]>dd{margin:0}',

    '[data-o-log-notes]{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:0.5rem}',
    '[data-o-log-notes]>li{display:flex;gap:0.6rem;align-items:baseline}',
    '[data-o-log-pastille]{',
    'flex-shrink:0;min-width:5.5rem;text-align:center;border-radius:9999px;',
    'padding:0.1rem 0.5rem;font-size:0.6875rem;font-weight:500}',

    '[data-o-log-cache] [data-o-log-entree]{',
    'opacity:0;transform:translateY(14px);',
    'transition:opacity var(--o-duration-slower) var(--o-ease-entrance),',
    'transform var(--o-duration-slower) var(--o-ease-entrance);',
    'transition-delay:var(--o-log-delay)}',
    '[data-o-log-seen] [data-o-log-entree]{opacity:1;transform:none}',

    '@media (prefers-reduced-motion:reduce){',
    '[data-o-log-cache] [data-o-log-entree]{opacity:1;transform:none;transition:none}}',
  ].join('')
  document.head.append(style)
}

/**
 * A filterable changelog.
 *
 * @example
 * <Changelog
 *   title="Changelog"
 *   releases={[
 *     {
 *       version: '2.4.0',
 *       date: '12 March 2026',
 *       dateTime: '2026-03-12',
 *       notes: [{ kind: 'added', text: 'Twelve sections enter the registry.' }],
 *     },
 *   ]}
 * />
 */
export function Changelog({
  releases,
  filterable = true,
  label,
  title,
  ...rest
}: ChangelogProps): ReactElement {
  const { reduced } = useMotionState()
  const { ref, inView } = useInView<HTMLElement>({ amount: 0.1 })
  const [removed, setRemoved] = useState<readonly ChangeKind[]>([])

  ensureChangelogRules()

  const toggle = (kind: ChangeKind): void => {
    setRemoved((previous) =>
      previous.includes(kind)
        ? previous.filter((other) => other !== kind)
        : [...previous, kind],
    )
  }

  const { className, style } = mergePresentation(
    { className: 'o-flex o-flex-col o-gap-6' },
    rest,
  )

  return (
    <section
      {...rest}
      ref={ref}
      aria-label={label}
      className={className}
      style={style as CSSProperties}
    >
      {title === undefined ? null : (
        <h2
          className="o-text-2xl o-font-semibold o-tracking-tight"
          style={{ color: 'var(--o-theme-fg)' }}
        >
          {title}
        </h2>
      )}

      {filterable && (
        <div
          role="group"
          aria-label="Kinds displayed"
          className="o-flex o-flex-wrap o-gap-2"
        >
          {ORDER.map((kind) => {
            const active = !removed.includes(kind)
            return (
              <button
                key={kind}
                type="button"
                // A switch, not an action: its state has to be heard before it
                // is pressed.
                aria-pressed={active}
                onClick={() => {
                  toggle(kind)
                }}
                className="o-rounded-full o-px-3 o-py-1 o-text-xs o-font-medium focus:o-ring"
                style={{
                  cursor: 'pointer',
                  color: active ? KINDS[kind].hue : 'var(--o-theme-muted)',
                  backgroundColor: active
                    ? `color-mix(in oklab, ${KINDS[kind].hue} 14%, transparent)`
                    : 'transparent',
                  border: `1px solid ${
                    active
                      ? `color-mix(in oklab, ${KINDS[kind].hue} 40%, transparent)`
                      : 'var(--o-theme-line)'
                  }`,
                }}
              >
                {KINDS[kind].label}
              </button>
            )
          })}
        </div>
      )}

      <dl
        data-o-log=""
        data-o-log-cache={reduced ? undefined : ''}
        data-o-log-seen={inView && !reduced ? '' : undefined}
      >
        {releases.map((release, index) => {
          const shown = release.notes.filter((note) => !removed.includes(note.kind))
          const hidden = release.notes.length - shown.length

          return (
            // The specification expressly allows a `div` around a `dt`/`dd`
            // pair: it is the only way to group them for the layout without
            // breaking the relation that the list carries.
            <div
              key={release.version}
              data-o-log-entree=""
              style={{ '--o-log-delay': `${String(index * 70)}ms` } as CSSProperties}
            >
              <dt>
                <span
                  className="o-block o-font-mono o-text-lg o-font-semibold o-tracking-tight"
                  style={{ color: 'var(--o-theme-fg)' }}
                >
                  {release.version}
                </span>
                <time
                  {...(release.dateTime === undefined
                    ? {}
                    : { dateTime: release.dateTime })}
                  className="o-mt-1 o-block o-text-xs"
                  style={{ color: 'var(--o-theme-muted)' }}
                >
                  {release.date}
                </time>
              </dt>

              <dd>
                {release.summary !== undefined && (
                  <p
                    className="o-mb-3 o-text-sm o-leading-relaxed"
                    style={{ color: 'var(--o-theme-fg)' }}
                  >
                    {release.summary}
                  </p>
                )}

                <ul data-o-log-notes="">
                  {shown.map((note, rank) => (
                    <li key={`${note.kind}-${String(rank)}`}>
                      <span
                        data-o-log-pastille=""
                        style={{
                          color: KINDS[note.kind].hue,
                          backgroundColor: `color-mix(in oklab, ${KINDS[note.kind].hue} 14%, transparent)`,
                        }}
                      >
                        {KINDS[note.kind].label}
                      </span>
                      <span className="o-text-sm" style={{ color: 'var(--o-theme-fg)' }}>
                        {note.text}
                      </span>
                    </li>
                  ))}
                </ul>

                {/*
                  The version stays displayed even when the filter has removed
                  everything: making it disappear would suggest it does not
                  exist.
                */}
                {hidden > 0 && (
                  <p
                    className="o-mt-2 o-text-xs"
                    style={{ color: 'var(--o-theme-muted)' }}
                  >
                    {hidden === 1
                      ? '1 line hidden by the filter.'
                      : `${String(hidden)} lines hidden by the filter.`}
                  </p>
                )}
              </dd>
            </div>
          )
        })}
      </dl>
    </section>
  )
}

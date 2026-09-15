/**
 * Team grid.
 *
 * ## A portrait has no alternative text
 *
 * The name is written right below it. Describing the image as "portrait of
 * Camille Roy" would make the name heard twice in a row, which is the most
 * common noise of this pattern. The image is therefore marked as decorative,
 * and the `<figcaption>` carries the information.
 *
 * ## The aspect ratio is fixed, the photo is not
 *
 * Portraits supplied by several people never have the same size. Without an
 * imposed aspect ratio, the grid takes on a different look on every row. The
 * frame is therefore square and the photo cropped inside it: that is the only
 * way to get a regular grid without asking everyone to crop.
 *
 * ## The links are always in the document
 *
 * They fade at rest and reveal on hover, but they are never removed nor
 * hidden: a link that only appears on hover is unreachable by finger as by
 * keyboard. Focus reveals them too, through `:focus-within`.
 *
 * ## The cascade is a transition, not an animation
 *
 * Every card makes the same trip with a delay. The compositor handles it on
 * its own, and under reduced motion the starting state is never applied: the
 * cards are simply there.
 *
 * @module
 */

import { mergePresentation, useMotionState, type Customisable } from '@odoro-cli/engine'
import { type CSSProperties, type ReactElement, type ReactNode } from 'react'

import { useInView } from '@registre/hooks/useInView'

/** A link carried by a card. */
export interface MemberLink {
  /** What is displayed. */
  readonly label: string
  /** URL. */
  readonly href: string
}

/** A person on the team. */
export interface Member {
  /** Displayed name. */
  readonly name: string
  /** Role. */
  readonly role: string
  /** URL of the portrait. Without it, the initials stand in as the thumbnail. */
  readonly photo?: string
  /** A one-sentence introduction. */
  readonly bio?: ReactNode
  /** Links on the card: profile, website, email. */
  readonly links?: readonly MemberLink[]
}

/** Props specific to the component. */
export interface TeamGridOwnProps {
  /** The people, in display order. */
  members: readonly Member[]
  /** Columns beyond the medium breakpoint. @defaultValue 4 */
  columns?: number
  /** Delay between two cards on reveal, in milliseconds. @defaultValue 70 */
  stagger?: number
  /** Name of the section, announced to assistive technology. */
  label?: string
  /** Heading displayed above the grid. */
  title?: ReactNode
}

/** Every prop. */
export type TeamGridProps = Customisable<TeamGridOwnProps, 'section'>

/** Identifier of the injected stylesheet. */
const STYLE_ID = 'o-team-grid'

/** Applies the grid rules, once per document. */
function ensureTeamRules(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-team]{display:grid;gap:1.25rem;list-style:none;margin:0;padding:0;',
    'grid-template-columns:repeat(auto-fit,minmax(12rem,1fr))}',
    '@media (min-width:64rem){[data-o-team]{',
    'grid-template-columns:repeat(var(--o-team-columns),minmax(0,1fr))}}',

    '[data-o-team-fiche]{transition:transform var(--o-duration-base) var(--o-ease-standard)}',
    '[data-o-team-fiche]:hover,[data-o-team-fiche]:focus-within{transform:translateY(-4px)}',

    // The links stay in the document: they change opacity, they do not
    // disappear. A link revealed by hover alone exists neither by finger nor
    // by keyboard.
    '[data-o-team-liens]{opacity:0.55;transition:opacity var(--o-duration-base) var(--o-ease-standard)}',
    '[data-o-team-fiche]:hover [data-o-team-liens],',
    '[data-o-team-fiche]:focus-within [data-o-team-liens]{opacity:1}',

    '[data-o-team-cache]>li{',
    'opacity:0;transform:translateY(16px);',
    'transition:opacity var(--o-duration-slower) var(--o-ease-entrance),',
    'transform var(--o-duration-slower) var(--o-ease-entrance);',
    'transition-delay:var(--o-team-delay)}',
    '[data-o-team-seen]>li{opacity:1;transform:none}',

    '@media (prefers-reduced-motion:reduce){',
    '[data-o-team-cache]>li{opacity:1;transform:none;transition:none}',
    '[data-o-team-fiche],[data-o-team-liens]{transition:none}',
    '[data-o-team-liens]{opacity:1}}',
  ].join('')
  document.head.append(style)
}

/** Initials of a name, for the fallback thumbnail. */
function initials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join('')
}

/**
 * A grid of team cards.
 *
 * @example
 * <TeamGrid
 *   title="The team"
 *   members={[
 *     { name: 'Camille Roy', role: 'Art direction', bio: 'Draws the registry entries.' },
 *     { name: 'Sami Belkacem', role: 'Engine', links: [{ label: 'Profile', href: '/sami' }] },
 *   ]}
 * />
 */
export function TeamGrid({
  members,
  columns = 4,
  stagger = 70,
  label,
  title,
  ...rest
}: TeamGridProps): ReactElement {
  const { reduced } = useMotionState()
  const { ref, inView } = useInView<HTMLElement>({ amount: 0.15 })
  ensureTeamRules()

  const { className, style } = mergePresentation(
    { className: 'o-flex o-flex-col o-gap-8' },
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

      <ul
        data-o-team=""
        data-o-team-cache={reduced ? undefined : ''}
        data-o-team-seen={inView && !reduced ? '' : undefined}
        style={
          {
            '--o-team-columns': String(Math.max(1, Math.round(columns))),
          } as CSSProperties
        }
      >
        {members.map((member, index) => (
          <li
            key={member.name}
            style={{ '--o-team-delay': `${String(index * stagger)}ms` } as CSSProperties}
          >
            <figure
              data-o-team-fiche=""
              className="o-m-0 o-flex o-h-full o-flex-col o-gap-3 o-rounded-xl o-p-4"
              style={{
                backgroundColor: 'var(--o-theme-surface)',
                border: '1px solid var(--o-theme-line)',
              }}
            >
              <div
                className="o-aspect-square o-w-full o-overflow-hidden o-rounded-lg"
                style={{
                  backgroundColor:
                    'color-mix(in oklab, var(--o-theme-fg) 8%, transparent)',
                }}
              >
                {member.photo === undefined ? (
                  <span
                    aria-hidden
                    className="o-flex o-size-full o-items-center o-justify-center o-text-2xl o-font-semibold"
                    style={{ color: 'var(--o-theme-muted)' }}
                  >
                    {initials(member.name)}
                  </span>
                ) : (
                  // Decorative: the name is written right below it, and
                  // describing it would make it heard twice.
                  <img src={member.photo} alt="" className="o-size-full o-object-cover" />
                )}
              </div>

              <figcaption className="o-flex o-flex-1 o-flex-col o-gap-1">
                <span
                  className="o-text-sm o-font-semibold"
                  style={{ color: 'var(--o-theme-fg)' }}
                >
                  {member.name}
                </span>
                <span
                  className="o-text-xs"
                  // A fixed shade does not hold on both backgrounds: laid on a
                  // dark one, a deep brand hue drops below the threshold. The
                  // accent is therefore pulled toward the theme ink, which
                  // lightens it on a dark background and darkens it on a light
                  // one. A page that retints the brand with a free colour may
                  // land on an extreme — a black accent on a dark background —
                  // that this mix does not make up for. It then sets its own
                  // ink through the variable; without it, the mix stays the
                  // rule.
                  style={{
                    color:
                      'var(--o-team-role, color-mix(in oklab, var(--o-palette-brand-600) 70%, var(--o-theme-fg)))',
                  }}
                >
                  {member.role}
                </span>
                {member.bio !== undefined && (
                  <span
                    className="o-mt-1 o-text-xs o-leading-relaxed"
                    style={{ color: 'var(--o-theme-muted)' }}
                  >
                    {member.bio}
                  </span>
                )}
              </figcaption>

              {member.links !== undefined && member.links.length > 0 && (
                <ul
                  data-o-team-liens=""
                  className="o-flex o-flex-wrap o-gap-3 o-list-none o-m-0 o-p-0"
                >
                  {member.links.map((link) => (
                    <li key={link.href}>
                      <a
                        href={link.href}
                        className="o-text-xs o-underline o-underline-offset-2 focus:o-ring"
                        style={{ color: 'var(--o-theme-fg)' }}
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </figure>
          </li>
        ))}
      </ul>
    </section>
  )
}

/**
 * Journal des versions.
 *
 * ## Pourquoi une liste de definitions
 *
 * Un journal est une suite de couples : une version, et ce qu'elle a change.
 * C'est exactement la relation qu'une `<dl>` decrit — le terme et sa
 * description — et c'est la seule structure qui la rende explicite. Une suite
 * de titres et de listes donne le meme dessin et laisse un lecteur d'ecran
 * deviner que « 2.4.0 » se rapporte aux six lignes qui suivent.
 *
 * Le rangement compte pour autre chose : chercher « quand telle chose a-t-elle
 * change » dans un journal est une operation frequente, et une structure juste
 * la rend possible sans avoir a tout lire.
 *
 * ## La date est une date, pas du texte
 *
 * `<time>` avec son attribut : c'est ce qui distingue une date d'une chaine
 * qui lui ressemble. Sans lui, « 12/03 » est ambigu dans la moitie du monde.
 *
 * ## Le filtre retire des lignes, pas des versions
 *
 * Filtrer par nature — ajouts, corrections, retraits — ne doit pas faire
 * disparaitre une version entiere : on ne saurait plus si elle n'a rien change
 * ou si elle n'existe pas. La version reste donc affichee, et le compte des
 * lignes cachees est dit.
 *
 * Les boutons portent `aria-pressed` : ce sont des interrupteurs, pas des
 * actions, et l'etat de chacun doit s'entendre avant d'appuyer.
 *
 * ## La revelation
 *
 * Une cascade a l'entree dans le champ, en transitions CSS, et rien de plus.
 * Sous mouvement reduit, l'etat de depart n'est pas pose : le journal est
 * simplement la.
 *
 * @module
 */

import { mergePresentation, useMotionState, type Customisable } from '@odoro-cli/engine'
import { useState, type CSSProperties, type ReactElement, type ReactNode } from 'react'

import { useInView } from '@registre/hooks/useInView'

/** Nature d'un changement. */
export type ChangeKind = 'ajout' | 'evolution' | 'correction' | 'retrait'

/** Une ligne du journal. */
export interface ChangeNote {
  /** Nature du changement. */
  readonly kind: ChangeKind
  /** Ce qui a change. */
  readonly text: ReactNode
}

/** Une version publiee. */
export interface Release {
  /** Numero de version, tel qu'il est publie. */
  readonly version: string
  /** Date affichee. */
  readonly date: string
  /** Date lisible par une machine, au format `YYYY-MM-DD`. */
  readonly dateTime?: string
  /** Une phrase qui resume la version. */
  readonly summary?: ReactNode
  /** Les changements, dans l'ordre d'importance. */
  readonly notes: readonly ChangeNote[]
}

/** Proprietes propres au composant. */
export interface ChangelogOwnProps {
  /** Les versions, de la plus recente a la plus ancienne. */
  releases: readonly Release[]
  /** Propose les interrupteurs de nature au-dessus du journal. @defaultValue true */
  filterable?: boolean
  /** Nom de la section, annonce aux technologies d'assistance. */
  label?: string
  /** Intitule affiche au-dessus du journal. */
  title?: ReactNode
}

/** Toutes les proprietes. */
export type ChangelogProps = Customisable<ChangelogOwnProps, 'section'>

/** Identifiant de la feuille injectee. */
const STYLE_ID = 'o-changelog'

/** Ce que chaque nature affiche, et la teinte qui la porte. */
const NATURES: Readonly<Record<ChangeKind, { libelle: string; teinte: string }>> = {
  ajout: { libelle: 'Ajout', teinte: 'var(--o-palette-emerald-600)' },
  evolution: { libelle: 'Evolution', teinte: 'var(--o-palette-brand-600)' },
  correction: { libelle: 'Correction', teinte: 'var(--o-palette-amber-600)' },
  retrait: { libelle: 'Retrait', teinte: 'var(--o-palette-rose-600)' },
}

/** Les natures, dans l'ordre des interrupteurs. */
const ORDRE: readonly ChangeKind[] = ['ajout', 'evolution', 'correction', 'retrait']

/** Pose les regles du journal, une fois par document. */
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
    // Le numero reste en vue pendant qu'on lit ses lignes : sur une version a
    // vingt changements, on ne sait plus laquelle on lit sans cela.
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
    'transition-delay:var(--o-log-delai)}',
    '[data-o-log-vu] [data-o-log-entree]{opacity:1;transform:none}',

    '@media (prefers-reduced-motion:reduce){',
    '[data-o-log-cache] [data-o-log-entree]{opacity:1;transform:none;transition:none}}',
  ].join('')
  document.head.append(style)
}

/**
 * Un journal des versions filtrable.
 *
 * @example
 * <Changelog
 *   title="Journal"
 *   releases={[
 *     {
 *       version: '2.4.0',
 *       date: '12 mars 2026',
 *       dateTime: '2026-03-12',
 *       notes: [{ kind: 'ajout', text: 'Douze sections entrent au registre.' }],
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
  const { ref, vu } = useInView<HTMLElement>({ amount: 0.1 })
  const [retirees, setRetirees] = useState<readonly ChangeKind[]>([])

  ensureChangelogRules()

  const basculer = (nature: ChangeKind): void => {
    setRetirees((precedentes) =>
      precedentes.includes(nature)
        ? precedentes.filter((autre) => autre !== nature)
        : [...precedentes, nature],
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
          aria-label="Natures affichees"
          className="o-flex o-flex-wrap o-gap-2"
        >
          {ORDRE.map((nature) => {
            const active = !retirees.includes(nature)
            return (
              <button
                key={nature}
                type="button"
                // Un interrupteur, pas une action : son etat doit s'entendre
                // avant qu'on appuie dessus.
                aria-pressed={active}
                onClick={() => {
                  basculer(nature)
                }}
                className="o-rounded-full o-px-3 o-py-1 o-text-xs o-font-medium focus:o-ring"
                style={{
                  cursor: 'pointer',
                  color: active ? NATURES[nature].teinte : 'var(--o-theme-muted)',
                  backgroundColor: active
                    ? `color-mix(in oklab, ${NATURES[nature].teinte} 14%, transparent)`
                    : 'transparent',
                  border: `1px solid ${
                    active
                      ? `color-mix(in oklab, ${NATURES[nature].teinte} 40%, transparent)`
                      : 'var(--o-theme-line)'
                  }`,
                }}
              >
                {NATURES[nature].libelle}
              </button>
            )
          })}
        </div>
      )}

      <dl
        data-o-log=""
        data-o-log-cache={reduced ? undefined : ''}
        data-o-log-vu={vu && !reduced ? '' : undefined}
      >
        {releases.map((release, index) => {
          const visibles = release.notes.filter((note) => !retirees.includes(note.kind))
          const cachees = release.notes.length - visibles.length

          return (
            // La specification autorise expressement un `div` autour d'un
            // couple `dt`/`dd` : c'est le seul moyen de les grouper pour la
            // mise en page sans casser la relation que la liste porte.
            <div
              key={release.version}
              data-o-log-entree=""
              style={{ '--o-log-delai': `${String(index * 70)}ms` } as CSSProperties}
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
                  {visibles.map((note, rang) => (
                    <li key={`${note.kind}-${String(rang)}`}>
                      <span
                        data-o-log-pastille=""
                        style={{
                          color: NATURES[note.kind].teinte,
                          backgroundColor: `color-mix(in oklab, ${NATURES[note.kind].teinte} 14%, transparent)`,
                        }}
                      >
                        {NATURES[note.kind].libelle}
                      </span>
                      <span className="o-text-sm" style={{ color: 'var(--o-theme-fg)' }}>
                        {note.text}
                      </span>
                    </li>
                  ))}
                </ul>

                {/*
                  La version reste affichee meme quand le filtre a tout retire :
                  la faire disparaitre laisserait croire qu'elle n'existe pas.
                */}
                {cachees > 0 && (
                  <p
                    className="o-mt-2 o-text-xs"
                    style={{ color: 'var(--o-theme-muted)' }}
                  >
                    {cachees === 1
                      ? '1 ligne masquee par le filtre.'
                      : `${String(cachees)} lignes masquees par le filtre.`}
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

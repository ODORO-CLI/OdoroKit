/**
 * Grille d'equipe.
 *
 * ## Un portrait n'a pas de texte de remplacement
 *
 * Le nom est ecrit juste dessous. Decrire l'image par « portrait de Camille
 * Roy » ferait entendre le nom deux fois de suite, ce qui est le bruit le plus
 * courant de ce motif. L'image est donc marquee comme decorative, et la
 * `<figcaption>` porte l'information.
 *
 * ## Le rapport de forme est fixe, la photo ne l'est pas
 *
 * Des portraits fournis par plusieurs personnes n'ont jamais la meme taille.
 * Sans rapport de forme impose, la grille prend une allure differente a chaque
 * ligne. Le cadre est donc carre et la photo recadree dedans : c'est la seule
 * facon d'obtenir une grille reguliere sans demander a chacun de recadrer.
 *
 * ## Les liens sont toujours dans le document
 *
 * Ils s'estompent au repos et se revelent au survol, mais ils ne sont jamais
 * retires ni masques : un lien qui n'apparait qu'au survol est inatteignable
 * au doigt comme au clavier. Le focus les revele aussi, par `:focus-within`.
 *
 * ## La cascade est une transition, pas une animation
 *
 * Chaque carte fait le meme trajet avec un delai. Le compositeur s'en charge
 * seul, et sous mouvement reduit l'etat de depart n'est jamais pose : les
 * cartes sont simplement la.
 *
 * @module
 */

import { mergePresentation, useMotionState, type Customisable } from '@odoro-cli/engine'
import { type CSSProperties, type ReactElement, type ReactNode } from 'react'

import { useInView } from '@registre/hooks/useInView'

/** Un lien porte par une fiche. */
export interface MemberLink {
  /** Ce qui est affiche. */
  readonly label: string
  /** Adresse. */
  readonly href: string
}

/** Une personne de l'equipe. */
export interface Member {
  /** Nom affiche. */
  readonly name: string
  /** Fonction. */
  readonly role: string
  /** Adresse du portrait. Sans elle, les initiales tiennent lieu de vignette. */
  readonly photo?: string
  /** Une phrase de presentation. */
  readonly bio?: ReactNode
  /** Liens de la fiche : profil, site, courriel. */
  readonly links?: readonly MemberLink[]
}

/** Proprietes propres au composant. */
export interface TeamGridOwnProps {
  /** Les personnes, dans l'ordre d'affichage. */
  members: readonly Member[]
  /** Colonnes au-dela du palier moyen. @defaultValue 4 */
  columns?: number
  /** Decalage entre deux fiches a la revelation, en millisecondes. @defaultValue 70 */
  stagger?: number
  /** Nom de la section, annonce aux technologies d'assistance. */
  label?: string
  /** Intitule affiche au-dessus de la grille. */
  title?: ReactNode
}

/** Toutes les proprietes. */
export type TeamGridProps = Customisable<TeamGridOwnProps, 'section'>

/** Identifiant de la feuille injectee. */
const STYLE_ID = 'o-team-grid'

/** Pose les regles de la grille, une fois par document. */
function ensureTeamRules(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-team]{display:grid;gap:1.25rem;list-style:none;margin:0;padding:0;',
    'grid-template-columns:repeat(auto-fit,minmax(12rem,1fr))}',
    '@media (min-width:64rem){[data-o-team]{',
    'grid-template-columns:repeat(var(--o-team-colonnes),minmax(0,1fr))}}',

    '[data-o-team-fiche]{transition:transform var(--o-duration-base) var(--o-ease-standard)}',
    '[data-o-team-fiche]:hover,[data-o-team-fiche]:focus-within{transform:translateY(-4px)}',

    // Les liens restent dans le document : ils changent d'opacite, ils ne
    // disparaissent pas. Un lien revele au seul survol n'existe ni au doigt ni
    // au clavier.
    '[data-o-team-liens]{opacity:0.55;transition:opacity var(--o-duration-base) var(--o-ease-standard)}',
    '[data-o-team-fiche]:hover [data-o-team-liens],',
    '[data-o-team-fiche]:focus-within [data-o-team-liens]{opacity:1}',

    '[data-o-team-cache]>li{',
    'opacity:0;transform:translateY(16px);',
    'transition:opacity var(--o-duration-slower) var(--o-ease-entrance),',
    'transform var(--o-duration-slower) var(--o-ease-entrance);',
    'transition-delay:var(--o-team-delai)}',
    '[data-o-team-vu]>li{opacity:1;transform:none}',

    '@media (prefers-reduced-motion:reduce){',
    '[data-o-team-cache]>li{opacity:1;transform:none;transition:none}',
    '[data-o-team-fiche],[data-o-team-liens]{transition:none}',
    '[data-o-team-liens]{opacity:1}}',
  ].join('')
  document.head.append(style)
}

/** Initiales d'un nom, pour la vignette de repli. */
function initiales(nom: string): string {
  return nom
    .split(/\s+/)
    .slice(0, 2)
    .map((mot) => mot.charAt(0).toUpperCase())
    .join('')
}

/**
 * Une grille de fiches d'equipe.
 *
 * @example
 * <TeamGrid
 *   title="L equipe"
 *   members={[
 *     { name: 'Camille Roy', role: 'Direction artistique', bio: 'Dessine les entrees du registre.' },
 *     { name: 'Sami Belkacem', role: 'Moteur', links: [{ label: 'Profil', href: '/sami' }] },
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
  const { ref, vu } = useInView<HTMLElement>({ amount: 0.15 })
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
        data-o-team-vu={vu && !reduced ? '' : undefined}
        style={
          {
            '--o-team-colonnes': String(Math.max(1, Math.round(columns))),
          } as CSSProperties
        }
      >
        {members.map((member, index) => (
          <li
            key={member.name}
            style={{ '--o-team-delai': `${String(index * stagger)}ms` } as CSSProperties}
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
                    {initiales(member.name)}
                  </span>
                ) : (
                  // Decorative : le nom est ecrit juste dessous, et le decrire
                  // le ferait entendre deux fois.
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
                  // Une nuance fixe ne tient pas sur les deux fonds : posee sur
                  // du sombre, une teinte de marque foncee descend sous le
                  // seuil. L accent est donc tire vers l encre du theme, ce qui
                  // l eclaircit sur fond sombre et le fonce sur fond clair.
                  // Une page qui reteinte la marque avec une couleur libre peut
                  // tomber sur un extreme — un accent noir sur fond sombre — que
                  // ce melange ne rattrape pas. Elle pose alors sa propre encre
                  // par la variable ; sans elle, le melange reste la regle.
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
                  {member.links.map((lien) => (
                    <li key={lien.href}>
                      <a
                        href={lien.href}
                        className="o-text-xs o-underline o-underline-offset-2 focus:o-ring"
                        style={{ color: 'var(--o-theme-fg)' }}
                      >
                        {lien.label}
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

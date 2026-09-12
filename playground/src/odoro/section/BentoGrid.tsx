/**
 * Grille bento : des tuiles de tailles inegales, revelees a l'entree.
 *
 * ## Ce qu'une grille bento resout, et ce qu'elle casse
 *
 * Une grille reguliere donne le meme poids a tout : douze arguments valent
 * douze fois rien. Des tuiles inegales retablissent une hierarchie — ce qui
 * compte occupe deux colonnes, le reste s'aligne autour.
 *
 * Le prix est un piege classique : une largeur choisie tuile par tuile finit
 * par produire une rangee incomplete des qu'on en ajoute une. La largeur est
 * donc bornee par le nombre de colonnes disponibles, et une tuile trop large
 * est ramenee a la grille plutot que de la deborder.
 *
 * ## Une seule colonne avant le palier moyen
 *
 * Toutes les tailles sont neutralisees sur petit ecran. Une tuile « deux
 * colonnes sur quatre » posee dans une grille a une colonne ne veut plus rien
 * dire, et la faire survivre au palier produit soit un debordement horizontal,
 * soit une tuile ecrasee.
 *
 * ## La cascade est une transition, pas une animation
 *
 * Chaque tuile fait le meme trajet, decale par un delai. C'est exactement ce
 * qu'une transition CSS sait faire, et le compositeur s'en charge seul : rien
 * ne s'execute en JavaScript pendant la revelation.
 *
 * Sous mouvement reduit, l'attribut de depart n'est jamais pose : les tuiles
 * sont simplement la. Une cascade neutralisee qui laisserait la grille
 * invisible serait un defaut, pas un respect de la preference.
 *
 * @module
 */

import { mergePresentation, useMotionState, type Customisable } from '@odoro-cli/engine'
import { type CSSProperties, type ReactElement, type ReactNode } from 'react'

import { useInView } from '@/odoro/hooks/useInView'

/** Une tuile de la grille. */
export interface BentoItem {
  /** Identifiant, unique dans la grille. */
  readonly id: string
  /** Intitule de la tuile. */
  readonly title: string
  /** Ce que la tuile raconte. */
  readonly body?: ReactNode
  /** Colonnes occupees. Bornee au nombre de colonnes de la grille. @defaultValue 1 */
  readonly cols?: number
  /** Rangees occupees. @defaultValue 1 */
  readonly rows?: number
  /** Visuel pose sous le texte : illustration, capture, pictogramme. */
  readonly media?: ReactNode
  /** Adresse : la tuile devient alors un lien, et non un bloc inerte. */
  readonly href?: string
  /** Met la tuile en avant : fond plein, bordure de marque. */
  readonly featured?: boolean
}

/** Proprietes propres au composant. */
export interface BentoGridOwnProps {
  /** Les tuiles, dans l'ordre de lecture. */
  items: readonly BentoItem[]
  /** Colonnes au-dela du palier moyen. @defaultValue 4 */
  columns?: number
  /** Hauteur d'une rangee, en pixels. @defaultValue 180 */
  rowHeight?: number
  /** Decalage entre deux tuiles a la revelation, en millisecondes. @defaultValue 60 */
  stagger?: number
  /** Nom de la section, annonce aux technologies d'assistance. */
  label?: string
}

/** Toutes les proprietes. */
export type BentoGridProps = Customisable<BentoGridOwnProps, 'section'>

/** Identifiant de la feuille injectee. */
const STYLE_ID = 'o-bento-grid'

/** Pose les regles de la grille, une fois par document. */
function ensureBentoRules(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-bento]{display:grid;gap:0.75rem;grid-template-columns:1fr;list-style:none;margin:0;padding:0}',
    // Les tailles n'existent qu'au-dela du palier : en dessous, la grille a une
    // colonne et « deux colonnes sur quatre » ne veut plus rien dire.
    '@media (min-width:48rem){[data-o-bento]{',
    'grid-template-columns:repeat(var(--o-bento-colonnes),minmax(0,1fr));',
    'grid-auto-rows:var(--o-bento-rangee)}',
    '[data-o-bento]>li{grid-column:span var(--o-bento-cols);grid-row:span var(--o-bento-rows)}}',

    '[data-o-bento-tuile]{display:flex;flex-direction:column;height:100%;overflow:hidden}',
    '[data-o-bento-media]{flex:1;min-height:0;margin-top:0.75rem}',

    '[data-o-bento-cache]>li{',
    'opacity:0;transform:translateY(14px) scale(0.98);',
    'transition:opacity var(--o-duration-slower) var(--o-ease-entrance),',
    'transform var(--o-duration-slower) var(--o-ease-entrance);',
    'transition-delay:var(--o-bento-delai)}',
    '[data-o-bento-vu]>li{opacity:1;transform:none}',

    '@media (prefers-reduced-motion:reduce){',
    '[data-o-bento-cache]>li{opacity:1;transform:none;transition:none}}',
  ].join('')
  document.head.append(style)
}

/**
 * Le corps d'une tuile, sans son enveloppe.
 *
 * Il est separe pour que la tuile puisse etre un lien ou un bloc sans que le
 * contenu soit ecrit deux fois — et sans l'element dynamique qui obligerait a
 * mentir sur le type des attributs.
 */
function Corps({ item }: { item: BentoItem }): ReactElement {
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
        // Le visuel est decoratif : le texte de la tuile dit deja ce qu'elle
        // raconte, et le faire lire ajouterait du bruit.
        <div data-o-bento-media="" aria-hidden>
          {item.media}
        </div>
      )}
    </>
  )
}

/** Habillage d'une tuile, selon qu'elle est mise en avant ou non. */
function habillage(item: BentoItem): CSSProperties {
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

/** Classes communes aux deux enveloppes de tuile. */
const TUILE = 'o-rounded-xl o-p-5 focus:o-ring'

/**
 * Une grille bento revelee en cascade.
 *
 * @example
 * <BentoGrid
 *   label="Ce que le registre garantit"
 *   items={[
 *     { id: 'copie', title: 'Le code vous appartient', cols: 2, body: <p>Copie, jamais lie.</p> },
 *     { id: 'repli', title: 'Un repli toujours prevu' },
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
  const { ref, vu } = useInView<HTMLElement>({ amount: 0.15 })
  ensureBentoRules()

  const colonnes = Math.max(1, Math.round(columns))

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
        data-o-bento-vu={vu && !reduced ? '' : undefined}
        style={
          {
            '--o-bento-colonnes': String(colonnes),
            '--o-bento-rangee': `${String(rowHeight)}px`,
          } as CSSProperties
        }
      >
        {items.map((item, index) => {
          // Une tuile plus large que la grille produirait une rangee que rien
          // ne remplit : elle est ramenee plutot que laissee deborder.
          const cols = Math.min(colonnes, Math.max(1, Math.round(item.cols ?? 1)))
          const rows = Math.max(1, Math.round(item.rows ?? 1))

          return (
            <li
              key={item.id}
              style={
                {
                  '--o-bento-cols': String(cols),
                  '--o-bento-rows': String(rows),
                  '--o-bento-delai': `${String(index * stagger)}ms`,
                } as CSSProperties
              }
            >
              {item.href === undefined ? (
                <div data-o-bento-tuile="" className={TUILE} style={habillage(item)}>
                  <Corps item={item} />
                </div>
              ) : (
                <a
                  href={item.href}
                  data-o-bento-tuile=""
                  className={TUILE}
                  style={habillage(item)}
                >
                  <Corps item={item} />
                </a>
              )}
            </li>
          )
        })}
      </ul>
    </section>
  )
}

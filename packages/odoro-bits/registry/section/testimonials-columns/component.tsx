/**
 * Colonnes de temoignages qui defilent.
 *
 * ## Pourquoi des colonnes en sens contraires
 *
 * Une seule bande qui monte se lit comme un generique de fin : l'oeil la suit
 * et attend qu'elle finisse. Deux colonnes qui se croisent ne donnent aucun
 * sens de lecture privilegie, et l'oeil s'arrete sur ce qui l'interesse au
 * lieu de poursuivre le mouvement. C'est la difference entre un defilement
 * qu'on subit et un mur qu'on parcourt.
 *
 * ## La boucle sans couture, et l'erreur d'un demi-espace
 *
 * Le procede est connu : la liste est ecrite deux fois, et la piste glisse de
 * la moitie de sa hauteur. Il ne marche que si chaque element occupe exactement
 * la meme place, espace compris — or un `gap` de flexbox se pose **entre** les
 * elements, pas apres le dernier. Sur 2n elements, il y a 2n-1 intervalles, et
 * la piste revient donc un demi-espace trop tot : un sursaut par tour, assez
 * discret pour passer la relecture et assez visible pour agacer.
 *
 * L'espacement est ici une marge basse portee par chaque element. Chacun pese
 * alors sa hauteur plus l'espace, la moitie de la piste vaut exactement une
 * periode, et la boucle est invisible.
 *
 * ## Le second exemplaire n'existe pas pour la lecture
 *
 * Il est decoratif : un lecteur d'ecran qui entendrait chaque temoignage deux
 * fois croirait a un defaut de la page. Les doublons sont donc masques un a
 * un, ce qui laisse la vraie liste complete et lisible.
 *
 * ## Ce qui arrete le mouvement
 *
 * Le survol et le focus clavier — on ne lit pas un texte qui bouge — et
 * l'absence de la section a l'ecran : tant qu'elle n'est pas entree dans le
 * champ, aucune animation n'est lancee. Sous mouvement reduit, les colonnes
 * sont immobiles et le mur se parcourt au defilement de la page.
 *
 * @module
 */

import { mergePresentation, useMotionState, type Customisable } from '@odoro-cli/engine'
import { type CSSProperties, type ReactElement, type ReactNode } from 'react'

import { useInView } from '@registre/hooks/useInView'

/** Un temoignage. */
export interface Testimonial {
  /** Ce qui est dit. */
  readonly quote: ReactNode
  /** Qui le dit. */
  readonly author: string
  /** Fonction, entreprise, ou ce qui situe la personne. */
  readonly role?: string
  /** Adresse d'un portrait. Sans elle, les initiales tiennent lieu de vignette. */
  readonly avatar?: string
}

/** Proprietes propres au composant. */
export interface TestimonialsColumnsOwnProps {
  /** Les temoignages. Ils sont repartis en colonnes dans l'ordre donne. */
  items: readonly Testimonial[]
  /** Nombre de colonnes au-dela du palier moyen. @defaultValue 3 */
  columns?: number
  /** Duree d'un tour complet, en millisecondes. @defaultValue 40000 */
  duration?: number
  /** Hauteur visible du mur, en pixels. @defaultValue 480 */
  height?: number
  /** Nom de la section, annonce aux technologies d'assistance. */
  label?: string
  /** Intitule affiche au-dessus du mur. */
  title?: ReactNode
}

/** Toutes les proprietes. */
export type TestimonialsColumnsProps = Customisable<
  TestimonialsColumnsOwnProps,
  'section'
>

/** Identifiant de la feuille injectee. */
const STYLE_ID = 'o-testimonials-columns'

/** Pose les regles du mur, une fois par document. */
function ensureColumnsRules(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-tcol-wall]{',
    'display:grid;gap:1rem;overflow:hidden;',
    'grid-template-columns:1fr;',
    'height:var(--o-tcol-hauteur);',
    // Le haut et le bas s'effacent : sans cela, les cartes sont coupees net
    // par le bord et le mur ressemble a un contenu tronque plutot qu'a un
    // defilement continu.
    '-webkit-mask-image:var(--o-tcol-fondu);mask-image:var(--o-tcol-fondu);',
    '}',
    '@media (min-width:48rem){[data-o-tcol-wall]{',
    'grid-template-columns:repeat(var(--o-tcol-colonnes),minmax(0,1fr))}}',

    '[data-o-tcol-track]{display:flex;flex-direction:column;list-style:none;margin:0;padding:0;',
    'animation:o-tcol-monte var(--o-tcol-duree) linear infinite;animation-play-state:paused}',
    // L'espacement est une marge basse, jamais un `gap` : voir l'en-tete du
    // module. Chaque element doit peser exactement la meme chose pour que la
    // moitie de la piste vaille une periode.
    '[data-o-tcol-track]>li{margin-block-end:1rem}',
    '[data-o-tcol-col][data-sens="bas"] [data-o-tcol-track]{animation-name:o-tcol-descend}',
    '[data-o-tcol-vu] [data-o-tcol-track]{animation-play-state:running}',
    '[data-o-tcol-col]:hover [data-o-tcol-track],',
    '[data-o-tcol-col]:focus-within [data-o-tcol-track]{animation-play-state:paused}',

    '@keyframes o-tcol-monte{from{transform:translateY(0)}to{transform:translateY(-50%)}}',
    '@keyframes o-tcol-descend{from{transform:translateY(-50%)}to{transform:translateY(0)}}',

    // Immobile, le mur reste un mur : il se parcourt au defilement de la page,
    // et rien n'est cache.
    '@media (prefers-reduced-motion:reduce){',
    '[data-o-tcol-wall]{height:auto;-webkit-mask-image:none;mask-image:none}',
    '[data-o-tcol-track]{animation:none}}',
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

/** Repartit les temoignages en colonnes, en conservant l'ordre de lecture. */
function repartir(
  items: readonly Testimonial[],
  colonnes: number,
): readonly (readonly Testimonial[])[] {
  const paquets: Testimonial[][] = Array.from({ length: colonnes }, () => [])
  items.forEach((item, index) => {
    paquets[index % colonnes]?.push(item)
  })
  return paquets.filter((paquet) => paquet.length > 0)
}

/** Une carte de temoignage. */
function Carte({ item }: { item: Testimonial }): ReactElement {
  return (
    <figure
      className="o-rounded-xl o-p-5"
      style={{
        backgroundColor: 'var(--o-theme-surface)',
        border: '1px solid var(--o-theme-line)',
        color: 'var(--o-theme-fg)',
      }}
    >
      <blockquote className="o-text-sm o-leading-relaxed">{item.quote}</blockquote>
      <figcaption className="o-mt-4 o-flex o-items-center o-gap-3">
        {item.avatar === undefined ? (
          <span
            aria-hidden
            className="o-flex o-size-10 o-shrink-0 o-items-center o-justify-center o-rounded-full o-text-xs o-font-semibold"
            style={{
              backgroundColor: 'color-mix(in oklab, var(--o-theme-fg) 10%, transparent)',
            }}
          >
            {initiales(item.author)}
          </span>
        ) : (
          <img
            src={item.avatar}
            alt=""
            className="o-size-10 o-shrink-0 o-rounded-full o-object-cover"
          />
        )}
        <span className="o-min-w-0">
          <span className="o-block o-text-sm o-font-medium o-truncate">
            {item.author}
          </span>
          {item.role !== undefined && (
            <span
              className="o-block o-text-xs o-truncate"
              style={{ color: 'var(--o-theme-muted)' }}
            >
              {item.role}
            </span>
          )}
        </span>
      </figcaption>
    </figure>
  )
}

/**
 * Un mur de temoignages en colonnes qui se croisent.
 *
 * @example
 * <TestimonialsColumns
 *   label="Ce qu on en dit"
 *   items={[
 *     { quote: 'Installe en une commande, retouche le lendemain.', author: 'Camille Roy' },
 *     { quote: 'Le repli sans WebGL nous a evite une refonte.', author: 'Sami Belkacem' },
 *   ]}
 * />
 */
export function TestimonialsColumns({
  items,
  columns = 3,
  duration = 40000,
  height = 480,
  label,
  title,
  ...rest
}: TestimonialsColumnsProps): ReactElement {
  const { reduced } = useMotionState()
  const { ref, vu } = useInView<HTMLElement>({ amount: 0.05 })
  ensureColumnsRules()

  const paquets = repartir(items, Math.max(1, Math.round(columns)))

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

      <div
        data-o-tcol-wall=""
        data-o-tcol-vu={vu && !reduced ? '' : undefined}
        style={
          {
            '--o-tcol-colonnes': String(paquets.length),
            '--o-tcol-duree': `${String(duration)}ms`,
            '--o-tcol-hauteur': `${String(height)}px`,
            '--o-tcol-fondu':
              'linear-gradient(to bottom, transparent, var(--o-theme-fg) 10%, var(--o-theme-fg) 90%, transparent)',
          } as CSSProperties
        }
      >
        {paquets.map((paquet, colonne) => (
          <div
            key={colonne}
            data-o-tcol-col=""
            // Une colonne sur deux descend : deux sens opposes retirent au mur
            // son sens de lecture, et l'oeil s'arrete au lieu de suivre.
            data-sens={colonne % 2 === 1 ? 'bas' : 'haut'}
          >
            <ul data-o-tcol-track="">
              {paquet.map((item, index) => (
                <li key={`vrai-${String(index)}`}>
                  <Carte item={item} />
                </li>
              ))}
              {/*
                Le second exemplaire ne sert qu'a fermer la boucle. Il est
                masque element par element : un lecteur d'ecran doit entendre
                la liste une fois. Immobile, il n'a plus de raison d'etre — et
                montrerait chaque temoignage deux fois de suite.
              */}
              {!reduced &&
                paquet.map((item, index) => (
                  <li key={`copie-${String(index)}`} aria-hidden>
                    <Carte item={item} />
                  </li>
                ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  )
}

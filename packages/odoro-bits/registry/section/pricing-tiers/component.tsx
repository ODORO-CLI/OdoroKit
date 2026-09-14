/**
 * Grille de tarifs, avec bascule de periode et prix qui se recalculent.
 *
 * ## Le prix change, il ne se remplace pas
 *
 * Passer du mois a l'annee remplace un nombre par un autre. Ecrit tel quel, le
 * changement est instantane et l'on doute d'avoir vu juste — surtout quand
 * trois prix changent d'un coup.
 *
 * Le compteur de `text/count-up` fait la transition entre l'ancien et le
 * nouveau, si bien que l'oeil suit le mouvement et voit dans quel sens il va.
 * C'est la seule raison pour laquelle il est ici : ce n'est pas une decoration,
 * c'est ce qui rend la bascule lisible.
 *
 * ## La remise n'est pas affichee, elle est appliquee
 *
 * Une remise annuelle s'annonce d'ordinaire par une pastille — « deux mois
 * offerts » — que rien ne relie au nombre voisin. Ici elle est **dans** le
 * calcul : le prix annuel affiche est le prix mensuel remise, et la pastille ne
 * fait que nommer ce que le nombre montre deja.
 *
 * ## Une offre mise en avant, jamais deux
 *
 * Un tarif se distingue par sa bordure et un rappel, et le composant n'en
 * accepte qu'un. Deux offres mises en avant n'orientent plus personne : elles
 * signalent seulement qu'on n'a pas su choisir.
 *
 * ## Ce que la structure doit dire
 *
 * Chaque offre est un `article` avec son titre ; les avantages sont une vraie
 * liste. Une grille de `div` donnerait le meme dessin et rien a un lecteur
 * d'ecran, qui entendrait une suite de mots sans savoir ou commence une offre
 * ni ou elle finit.
 *
 * La bascule est un groupe de boutons radio, pas deux boutons : c'est un choix
 * entre deux etats exclusifs, et les fleches du clavier doivent y circuler.
 *
 * @module
 */

import { mergePresentation, type Customisable } from '@odoro-cli/engine'
import {
  useId,
  useState,
  type CSSProperties,
  type ElementType,
  type ReactElement,
  type ReactNode,
} from 'react'

import { CountUp } from '@registre/text/CountUp'

/** Une offre. */
export interface Tier {
  /** Le nom de l'offre. */
  readonly name: string
  /** Le prix mensuel, dans l'unite d'affichage. */
  readonly monthly: number
  /** Une phrase sous le nom. */
  readonly note?: string
  /** Ce que l'offre comprend. */
  readonly features: readonly string[]
  /** Le libelle du bouton. @defaultValue 'Choisir' */
  readonly cta?: string
  /** Mettre cette offre en avant. Une seule le peut. */
  readonly featured?: boolean
}

/** Proprietes propres au composant. */
export interface PricingTiersOwnProps {
  /** Les offres, dans l'ordre d'affichage. */
  tiers: readonly Tier[]
  /** Balise rendue. @defaultValue 'section' */
  as?: ElementType
  /** Symbole colle avant le prix. @defaultValue '' */
  currency?: string
  /** Symbole colle apres le prix. @defaultValue ' €' */
  suffix?: string
  /**
   * Part remise sur l'annee, de 0 a 1.
   *
   * `0.2` retire un cinquieme du prix annuel. Zero retire la bascule : sans
   * remise, proposer deux periodes n'apporte rien.
   *
   * @defaultValue 0.2
   */
  yearlyDiscount?: number
  /** Langue du formatage. Par defaut, celle du navigateur. */
  locale?: string
  /** Appele au clic sur une offre. */
  onChoose?: (tier: Tier) => void
  /** Ce qui s'affiche au-dessus de la grille. */
  children?: ReactNode
}

/** Toutes les proprietes. */
export type PricingTiersProps = Customisable<PricingTiersOwnProps, 'section'>

/** Identifiant de la feuille injectee. */
const STYLE_ID = 'o-pricing-tiers'

/** Pose les regles de la grille, une fois par document. */
function ensurePricingRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-pricing-grid]{',
    'display:grid;gap:1rem;align-items:stretch;',
    'grid-template-columns:repeat(auto-fit,minmax(15rem,1fr));',
    '}',
    '[data-o-tier]{display:flex;flex-direction:column;height:100%}',
    '[data-o-tier-features]{list-style:none;margin:0;padding:0;flex:1}',
    '[data-o-tier-features] li{display:flex;gap:0.5rem;padding:0.3rem 0}',
    // La coche est decorative : le fait qu'un avantage soit dans la liste dit
    // deja qu'il est inclus, et la faire lire ajouterait « coche » devant
    // chaque ligne.
    '[data-o-tier-features] li::before{content:"✓";opacity:0.5}',
    '[data-o-period]{display:inline-flex;gap:0.25rem;padding:0.25rem;border-radius:9999px}',
    '[data-o-period] label{border-radius:9999px;padding:0.3rem 0.9rem;cursor:pointer;font-size:0.8125rem}',
    '[data-o-period] input{position:absolute;opacity:0;pointer-events:none}',
    '[data-o-period] input:focus-visible+span{outline:2px solid currentColor;outline-offset:2px;border-radius:9999px}',
  ].join('')
  document.head.append(style)
}

/**
 * Une grille de tarifs avec bascule mensuelle / annuelle.
 *
 * @example
 * <PricingTiers
 *   tiers={[
 *     { name: 'Depart', monthly: 0, features: ['Un projet', 'Communaute'] },
 *     { name: 'Studio', monthly: 29, features: ['Dix projets', 'Support'], featured: true },
 *     { name: 'Agence', monthly: 99, features: ['Illimite', 'Astreinte'] },
 *   ]}
 * />
 */
/**
 * Filet et voile tires de l encre courante.
 *
 * Le systeme n a pas de classe pour une couleur partiellement transparente
 * derivee de `currentColor` : `o-border-current/15` n existe pas, et une classe
 * absente ne peint rien. Le melange se fait donc en style, ou il est exact.
 */
const FILET = 'color-mix(in oklab, currentColor 15%, transparent)'
const VOILE = 'color-mix(in oklab, currentColor 10%, transparent)'

export function PricingTiers({
  tiers,
  as: Tag = 'section',
  currency = '',
  suffix = ' €',
  yearlyDiscount = 0.2,
  locale,
  onChoose,
  children,
  ...rest
}: PricingTiersProps): ReactElement {
  const [annuel, setAnnuel] = useState(false)
  const groupe = useId()

  ensurePricingRule()

  const { className, style } = mergePresentation({}, rest)

  // Sans remise, la bascule ne changerait aucun chiffre : la proposer serait un
  // reglage qui ne fait rien.
  const bascule = yearlyDiscount > 0

  return (
    <Tag {...rest} className={className} style={style as CSSProperties}>
      {children}

      {bascule && (
        <div
          role="radiogroup"
          aria-label="Periode de facturation"
          data-o-period=""
          className="o-mb-6 o-border-w-1"
          style={{ borderColor: FILET }}
        >
          {[
            { valeur: false, libelle: 'Mensuel' },
            {
              valeur: true,
              libelle: `Annuel −${String(Math.round(yearlyDiscount * 100))} %`,
            },
          ].map((choix) => (
            <label key={String(choix.valeur)}>
              <input
                type="radio"
                name={groupe}
                checked={annuel === choix.valeur}
                onChange={() => {
                  setAnnuel(choix.valeur)
                }}
              />
              <span
                className={annuel === choix.valeur ? 'o-font-medium' : 'o-opacity-70'}
                style={annuel === choix.valeur ? { backgroundColor: VOILE } : undefined}
              >
                {choix.libelle}
              </span>
            </label>
          ))}
        </div>
      )}

      <div data-o-pricing-grid="">
        {tiers.map((tier) => {
          const prix = annuel ? tier.monthly * (1 - yearlyDiscount) : tier.monthly

          return (
            <article
              key={tier.name}
              data-o-tier=""
              className={[
                'o-rounded-xl o-border-w-1 o-p-6',
                tier.featured === true ? 'o-border-current o-shadow-lg' : '',
              ].join(' ')}
              style={tier.featured === true ? undefined : { borderColor: FILET }}
            >
              <h3 className="o-text-sm o-font-semibold o-uppercase o-tracking-wider">
                {tier.name}
              </h3>

              {tier.note !== undefined && (
                <p className="o-mt-1 o-text-sm o-opacity-70">{tier.note}</p>
              )}

              <p className="o-mt-4 o-text-4xl o-font-bold o-tracking-tight">
                <CountUp
                  value={prix}
                  // Au montage, pas a l'entree dans le champ : une bascule
                  // provoque un nouveau comptage, et attendre un passage dans
                  // le champ qui a deja eu lieu ne rendrait jamais la main.
                  declenchement="montage"
                  duration={520}
                  decimals={Number.isInteger(prix) ? 0 : 2}
                  prefix={currency}
                  suffix={suffix}
                  {...(locale === undefined ? {} : { locale })}
                />
                <span className="o-text-base o-font-normal o-opacity-60">
                  {annuel ? ' / mois, facture a l année' : ' / mois'}
                </span>
              </p>

              <ul data-o-tier-features="" className="o-mt-5 o-text-sm">
                {tier.features.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>

              <button
                type="button"
                onClick={() => {
                  onChoose?.(tier)
                }}
                className={[
                  'o-mt-6 o-w-full o-rounded-lg o-px-4 o-py-2 o-text-sm o-font-medium',
                  tier.featured === true ? '' : 'o-border-w-1',
                ].join(' ')}
                // `background-color: currentColor` sur un bouton dont on
                // redefinit la couleur peint le fond de l encre : les deux
                // valent alors la meme chose et le libelle disparait. Les deux
                // roles sont donc nommes, chacun par son propre token.
                style={
                  tier.featured === true
                    ? { backgroundColor: 'var(--o-theme-fg)', color: 'var(--o-theme-bg)' }
                    : { borderColor: FILET }
                }
              >
                {tier.cta ?? 'Choisir'}
              </button>
            </article>
          )
        })}
      </div>
    </Tag>
  )
}

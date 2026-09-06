/**
 * Bande de statistiques : des nombres qui montent quand la section arrive.
 *
 * ## Elle ne recompte pas ce qui existe deja
 *
 * Le comptage, le formatage selon la langue, la chasse fixe des chiffres, le
 * calque qui garde la valeur finale lisible par un lecteur d'ecran — tout cela
 * est dans `text/count-up`, et cette section s'en sert. Le reecrire ici
 * donnerait deux implementations du meme probleme, dont l'une prendrait du
 * retard sans que rien ne le signale.
 *
 * C'est la raison d'etre d'une dependance de registre : `odoro add` installe
 * les deux, et le lien est declare plutot que copie.
 *
 * ## Le declenchement appartient a la bande, pas a chaque nombre
 *
 * Chaque compteur pourrait guetter son propre passage dans le champ. Ils
 * partiraient alors les uns apres les autres, au fil du defilement — ce qui est
 * juste pour un paragraphe, et faux pour une rangee : une bande de chiffres se
 * lit comme un seul objet, et doit s'animer comme tel.
 *
 * Le retard entre eux est donc volontaire et regle ici, pas subi.
 *
 * ## Ce qu'une statistique doit dire quand elle ne bouge pas
 *
 * Tout. Le nombre final est dans le DOM des le premier rendu — c'est
 * `count-up` qui s'en charge — et le libelle est un texte ordinaire. En
 * mouvement reduit, la bande est simplement une bande de chiffres, ce qu'elle
 * a toujours ete.
 *
 * @module
 */

import { mergePresentation, type Customisable } from '@odoro-cli/engine'
import { type CSSProperties, type ElementType, type ReactElement } from 'react'

import { CountUp } from '@/odoro/text/CountUp'

/** Une statistique de la bande. */
export interface Stat {
  /** La valeur d'arrivee. */
  readonly value: number
  /** Ce qu'elle mesure. */
  readonly label: string
  /** Colle avant le nombre. */
  readonly prefix?: string
  /** Colle apres le nombre. */
  readonly suffix?: string
  /** Nombre de decimales. @defaultValue 0 */
  readonly decimals?: number
}

/** Proprietes propres au composant. */
export interface StatBandOwnProps {
  /** Les statistiques, dans l'ordre d'affichage. */
  stats: readonly Stat[]
  /** Balise rendue. @defaultValue 'section' */
  as?: ElementType
  /** Duree de la montee d'un nombre, en millisecondes. @defaultValue 1500 */
  duration?: number
  /**
   * Retard entre deux nombres, en millisecondes.
   *
   * Zero les fait partir ensemble ; une centaine donne une lecture de gauche a
   * droite sans que la bande se disloque.
   *
   * @defaultValue 120
   */
  stagger?: number
  /** Langue du formatage. Par defaut, celle du navigateur. */
  locale?: string
}

/** Toutes les proprietes. */
export type StatBandProps = Customisable<StatBandOwnProps, 'section'>

/** Identifiant de la feuille injectee. */
const STYLE_ID = 'o-stat-band'

/** Pose les regles de la bande, une fois par document. */
function ensureStatBandRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    // Une grille automatique plutot qu'un nombre de colonnes fixe : la bande
    // sert aussi bien deux statistiques que six, et personne ne devrait avoir
    // a choisir une mise en page selon leur nombre.
    '[data-o-stat-band]{',
    'display:grid;gap:2rem 3rem;',
    'grid-template-columns:repeat(auto-fit,minmax(10rem,1fr));',
    '}',
    '[data-o-stat] dt{order:2;font-size:0.875rem;opacity:0.7;margin-top:0.35rem}',
    '[data-o-stat] dd{order:1;margin:0;line-height:1.05}',
    // La colonne inverse l'ordre visuel sans toucher a l'ordre du document :
    // un lecteur d'ecran doit entendre « projets livres, 12 480 », pas
    // l'inverse, et l'oeil doit voir le nombre d'abord.
    '[data-o-stat]{display:flex;flex-direction:column}',
  ].join('')
  document.head.append(style)
}

/**
 * Une rangee de statistiques qui montent a l'entree dans le champ.
 *
 * @example
 * <StatBand
 *   stats={[
 *     { value: 12480, label: 'projets livres' },
 *     { value: 99.98, label: 'disponibilite', suffix: ' %', decimals: 2 },
 *     { value: 42, label: 'pays' },
 *   ]}
 * />
 */
export function StatBand({
  stats,
  as: Tag = 'section',
  duration = 1500,
  stagger = 120,
  locale,
  ...rest
}: StatBandProps): ReactElement {
  ensureStatBandRule()

  const { className, style } = mergePresentation({}, rest)

  return (
    <Tag
      {...rest}
      className={className}
      style={style as CSSProperties}
      data-o-stat-band=""
    >
      {stats.map((stat, i) => (
        // Une liste de definitions : chaque statistique est une valeur et ce
        // qu'elle mesure, ce qui est exactement la relation que `dl` decrit.
        <dl key={stat.label} data-o-stat="">
          <dd className="o-text-4xl o-font-bold o-tracking-tight">
            <CountUp
              value={stat.value}
              duration={duration}
              // Le retard vient de la bande : les compteurs ne guettent pas
              // chacun leur propre entree dans le champ.
              delay={i * stagger}
              decimals={stat.decimals ?? 0}
              {...(locale === undefined ? {} : { locale })}
              {...(stat.prefix === undefined ? {} : { prefix: stat.prefix })}
              {...(stat.suffix === undefined ? {} : { suffix: stat.suffix })}
            />
          </dd>
          <dt>{stat.label}</dt>
        </dl>
      ))}
    </Tag>
  )
}

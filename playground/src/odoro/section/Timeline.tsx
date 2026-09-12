/**
 * Frise verticale qui se remplit au defilement.
 *
 * ## La progression est lue dans la boucle, jamais rendue
 *
 * Une frise qui se remplit change d'aspect a chaque image. Tenir cette valeur
 * dans un etat React ferait un rendu complet par image pendant tout le
 * defilement de la page — pour deplacer un rectangle et changer deux opacites,
 * ce que le compositeur sait faire seul.
 *
 * La progression est donc lue dans la boucle unique du moteur, a la priorite
 * des mesures, et ecrite dans une variable CSS. Le rail se remplit par
 * `scaleY`, les jalons s'allument par un attribut : aucun rendu React n'a lieu
 * pendant la course.
 *
 * ## Pourquoi une seule mesure pour toute la frise
 *
 * Chaque jalon pourrait guetter son propre passage. Sur vingt evenements, cela
 * ferait vingt observateurs et vingt seuils qui ne tombent jamais exactement
 * au meme endroit que le rail : le point s'allumerait avant ou apres que le
 * trait l'atteigne, et le decalage se verrait.
 *
 * Une seule mesure, une seule progression : le jalon s'allume quand le trait
 * arrive, par construction.
 *
 * ## Le repere est le milieu du champ, pas son bord
 *
 * Un remplissage cale sur le haut de la fenetre est deja fini quand on lit le
 * premier evenement ; cale sur le bas, il n'a pas commence. Le milieu du champ
 * met le trait a l'endroit ou l'oeil se trouve.
 *
 * ## Ce qu'un lecteur d'ecran entend
 *
 * Une liste ordonnee d'evenements dates. Le rail, les points et le
 * remplissage sont decoratifs et masques : ils disent visuellement ce que
 * l'ordre de la liste dit deja.
 *
 * @module
 */

import {
  CLOCK_PRIORITY,
  clock,
  mergePresentation,
  useMotionState,
  type Customisable,
} from '@odoro-cli/engine'
import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactElement,
  type ReactNode,
} from 'react'

/** Un evenement de la frise. */
export interface TimelineEvent {
  /** Date affichee. Texte libre : « Mars 2024 », « v2.0 ». */
  readonly date: string
  /**
   * Date lisible par une machine, au format `YYYY-MM-DD` ou `YYYY-MM`.
   *
   * Sans elle, `<time>` n'apporte rien de plus qu'un `<span>` : c'est
   * l'attribut qui rend la date exploitable.
   */
  readonly dateTime?: string
  /** Intitule de l'evenement. */
  readonly title: string
  /** Ce qui s'est passe. */
  readonly body?: ReactNode
}

/** Proprietes propres au composant. */
export interface TimelineOwnProps {
  /** Les evenements, du plus ancien au plus recent. */
  events: readonly TimelineEvent[]
  /** Nom de la frise, annonce aux technologies d'assistance. */
  label: string
  /** Intitule affiche au-dessus de la frise. */
  title?: ReactNode
}

/** Toutes les proprietes. */
export type TimelineProps = Customisable<TimelineOwnProps, 'section'>

/** Identifiant de la feuille injectee. */
const STYLE_ID = 'o-timeline'

/** Pose les regles de la frise, une fois par document. */
function ensureTimelineRules(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    // Le rail vit dans l'enveloppe, jamais dans la liste : une liste ordonnee
    // n'accepte que des `li`, et y glisser deux traits rendrait invalide le
    // seul balisage qui porte le sens de la frise.
    '[data-o-timeline-cadre]{position:relative}',
    '[data-o-timeline]{list-style:none;margin:0;padding:0 0 0 2rem}',
    // Le rail et son remplissage sont deux traits superposes : le second est
    // mis a l'echelle, ce que le compositeur fait sans recalcul de mise en page.
    '[data-o-timeline-rail],[data-o-timeline-fill]{',
    'position:absolute;left:0.4375rem;top:0.5rem;bottom:0.5rem;width:2px}',
    '[data-o-timeline-fill]{transform-origin:top;transform:scaleY(var(--o-timeline-p,0))}',

    '[data-o-timeline]>li{position:relative;padding-bottom:2.5rem}',
    '[data-o-timeline]>li:last-child{padding-bottom:0}',
    '[data-o-timeline-point]{',
    'position:absolute;left:-2rem;top:0.375rem;width:1rem;height:1rem;border-radius:9999px;',
    'transform:scale(0.7);',
    'transition:transform var(--o-duration-base) var(--o-ease-emphasized),',
    'background-color var(--o-duration-base) var(--o-ease-standard)}',
    '[data-o-timeline-atteint] [data-o-timeline-point]{transform:scale(1)}',

    '[data-o-timeline]>li>[data-o-timeline-corps]{',
    'opacity:0.45;transition:opacity var(--o-duration-slow) var(--o-ease-standard)}',
    '[data-o-timeline-atteint]>[data-o-timeline-corps]{opacity:1}',

    // Sans mouvement, la frise est entierement parcourue : montrer un rail vide
    // et des evenements a demi effaces serait un defaut d'accessibilite, pas un
    // respect de la preference.
    '@media (prefers-reduced-motion:reduce){',
    '[data-o-timeline-fill]{transform:scaleY(1)}',
    '[data-o-timeline-point]{transform:scale(1);transition:none}',
    '[data-o-timeline]>li>[data-o-timeline-corps]{opacity:1;transition:none}}',
  ].join('')
  document.head.append(style)
}

/**
 * Trouve le conteneur qui defile autour d'un element.
 *
 * La fenetre n'est pas toujours ce qui defile : une frise posee dans un panneau
 * a debordement — un apercu, un tiroir, une colonne a hauteur fixe — se mesure
 * par rapport a ce panneau. Prendre la fenetre dans ce cas donne une
 * progression qui ne bouge presque pas, et un rail qui ne se remplit jamais.
 *
 * La recherche a lieu **une fois**, au montage : `getComputedStyle` force un
 * calcul de style, et l'appeler par image couterait plus cher que tout le
 * reste du composant.
 */
function conteneurDefilant(element: Element): HTMLElement | null {
  let parent = element.parentElement
  while (parent !== null) {
    const debordement = getComputedStyle(parent).overflowY
    if (debordement === 'auto' || debordement === 'scroll') return parent
    parent = parent.parentElement
  }
  return null
}

/**
 * Frise verticale dont le trait suit le defilement.
 *
 * @example
 * <Timeline
 *   label="Histoire du projet"
 *   events={[
 *     { date: 'Janvier 2024', dateTime: '2024-01', title: 'Premiere entree' },
 *     { date: 'Juin 2024', dateTime: '2024-06', title: 'Le registre s ouvre' },
 *   ]}
 * />
 */
export function Timeline({ events, label, title, ...rest }: TimelineProps): ReactElement {
  const { reduced } = useMotionState()
  const [cadre, setCadre] = useState<HTMLDivElement | null>(null)
  const jalons = useRef<(HTMLLIElement | null)[]>([])
  const dernier = useRef(-1)

  ensureTimelineRules()

  useEffect(() => {
    if (cadre === null || reduced) return

    /** Etat des jalons, pour n'ecrire dans le DOM qu'au franchissement. */
    let atteints = -1
    const conteneur = conteneurDefilant(cadre)

    const subscription = clock.subscribe(
      () => {
        const boite = cadre.getBoundingClientRect()
        if (boite.height === 0) return

        const champ =
          conteneur === null
            ? { haut: 0, hauteur: window.innerHeight }
            : {
                haut: conteneur.getBoundingClientRect().top,
                hauteur: conteneur.clientHeight,
              }

        // Le repere est le milieu du champ : le trait se trouve alors la ou
        // l'oeil lit, et non a un bord qu'on ne regarde pas.
        const repere = champ.haut + champ.hauteur / 2 - boite.top
        const p = Math.min(1, Math.max(0, repere / boite.height))

        // Les centiemes suffisent : la variable n'est ecrite que lorsqu'elle
        // change vraiment, ce qui evite une invalidation de style par image sur
        // une frise immobile.
        const centieme = Math.round(p * 100)
        if (centieme !== dernier.current) {
          dernier.current = centieme
          cadre.style.setProperty('--o-timeline-p', (centieme / 100).toFixed(2))
        }

        const franchis = Math.floor(p * jalons.current.length)
        if (franchis === atteints) return
        atteints = franchis
        jalons.current.forEach((jalon, index) => {
          if (jalon === null) return
          if (index < franchis) jalon.setAttribute('data-o-timeline-atteint', '')
          else jalon.removeAttribute('data-o-timeline-atteint')
        })
      },
      { name: 'frise verticale', priority: CLOCK_PRIORITY.layout },
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [cadre, reduced, events.length])

  const { className, style } = mergePresentation(
    { className: 'o-flex o-flex-col o-gap-8' },
    rest,
  )

  return (
    <section
      {...rest}
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

      <div ref={setCadre} data-o-timeline-cadre="">
        <span
          aria-hidden
          data-o-timeline-rail=""
          style={{ backgroundColor: 'var(--o-theme-line)' }}
        />
        <span
          aria-hidden
          data-o-timeline-fill=""
          style={{ backgroundColor: 'var(--o-palette-brand-500)' }}
        />

        <ol data-o-timeline="">
          {events.map((event, index) => (
            <li
              key={`${event.date}-${event.title}`}
              ref={(element) => {
                jalons.current[index] = element
              }}
              // Sans mouvement, tout est atteint des le premier rendu : la
              // feuille le dit aussi, mais l'attribut evite de dependre d'une
              // regle que l'appelant pourrait surcharger.
              data-o-timeline-atteint={reduced ? '' : undefined}
            >
              <span
                aria-hidden
                data-o-timeline-point=""
                style={{ backgroundColor: 'var(--o-palette-brand-500)' }}
              />
              <div data-o-timeline-corps="">
                <time
                  {...(event.dateTime === undefined ? {} : { dateTime: event.dateTime })}
                  className="o-font-mono o-text-xs"
                  style={{ color: 'var(--o-theme-muted)' }}
                >
                  {event.date}
                </time>
                <h3
                  className="o-mt-1 o-text-lg o-font-semibold o-tracking-tight"
                  style={{ color: 'var(--o-theme-fg)' }}
                >
                  {event.title}
                </h3>
                {event.body !== undefined && (
                  <div
                    className="o-mt-2 o-text-sm o-leading-relaxed"
                    style={{ color: 'var(--o-theme-muted)' }}
                  >
                    {event.body}
                  </div>
                )}
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

/**
 * Bloc differe : un substitut couvre le contenu, puis s'efface pour le
 * laisser paraitre.
 *
 * ## Ce que les autres squelettes ne font pas
 *
 * Les entrees `skeleton-*` sont des figures immobiles : on les monte, on les
 * demonte, et c'est la page qui decide quand. Celui-ci contient les deux
 * etats et le passage de l'un a l'autre. Il sert la ou le contenu est deja
 * la mais ne doit pas surgir d'un coup — une vitrine, une maquette, un
 * chargement dont on connait la duree — et il sert de patron a brancher sur
 * un vrai chargement, en remplacant le minuteur par `loaded`.
 *
 * ## Le contenu est dans le document des le depart
 *
 * Il n'est pas monte a la fin : il est present, en attente derriere le
 * substitut, avec sa hauteur reelle. C'est ce qui evite le saut de mise en
 * page au moment du passage — le defaut que toute cette famille cherche a
 * corriger. `--o-lz-height` ne sert que de plancher, pour le cas ou le
 * contenu serait encore vide.
 *
 * Tant qu'il est couvert, il est retire de l'arbre d'accessibilite et ne
 * recoit pas le pointeur : un lien invisible mais cliquable serait un piege.
 *
 * ## Le minuteur, pas la boucle d'images
 *
 * Deux instants a tenir, pas soixante par seconde : un minuteur suffit, et
 * la boucle du moteur serait un abonnement permanent pour deux
 * evenements. Les minuteurs sont annules a la demontee.
 *
 * ## Pourquoi la boucle est le regime par defaut
 *
 * L'attente de ce composant est une **fiction** : `delay` est un chiffre
 * qu'on choisit, alors qu'un vrai chargement n'en connait pas la duree. Sa
 * place naturelle est donc la ou l'on montre le passage — vitrine, maquette,
 * capture — et un passage joue une seule fois, quelques secondes apres
 * l'arrivee sur la page, n'est vu par personne. `loop={false}` donne la
 * version a un coup, pour une page qui pilote elle-meme le moment ; branche
 * sur un vrai chargement, c'est `loaded` qu'on remplace, et le minuteur
 * disparait.
 *
 * Sous mouvement reduit, le contenu est visible immediatement et le cycle
 * ne se rejoue pas : c'est l'etat final, celui vers lequel le passage
 * allait. La regle du squelette au repos vaut pour les figures qui
 * attendent ; ici, l'attente a une fin, et cette fin est le contenu.
 *
 * @module
 */

import { mergePresentation, useMotionState, type Customisable } from '@odoro-cli/engine'
import { useEffect, useState, type CSSProperties, type ReactElement, type ReactNode } from 'react'

/** Identifiant de la feuille injectee. */
const STYLE_ID = 'o-lazy-block'

/** Pose le substitut, le contenu et leur croisement, une fois par document. */
function ensureLazyBlockRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-lz]{position:relative;display:block;width:100%}',
    // Un plancher, pas une hauteur : c'est le contenu qui commande.
    '[data-o-lz]:not([data-o-lz-loaded]){min-height:var(--o-lz-height)}',
    '[data-o-lz-content]{',
    'opacity:0;pointer-events:none;',
    'transition:opacity var(--o-lz-speed) var(--o-ease-standard);',
    '}',
    '[data-o-lz-loaded] [data-o-lz-content]{opacity:1;pointer-events:auto}',
    '[data-o-lz-veil]{',
    'position:absolute;inset:0;pointer-events:none;',
    'border-radius:var(--o-lz-radius);',
    'background-color:color-mix(in oklab,var(--o-theme-line) 72%,var(--o-theme-surface));',
    'transition:opacity var(--o-lz-speed) var(--o-ease-standard);',
    'animation:o-lz-breathe var(--o-lz-breath) ease-in-out infinite;',
    '}',
    // Le substitut respire sans jamais devenir transparent : ce qu'il
    // couvre ne doit pas transparaitre avant l'heure.
    '@keyframes o-lz-breathe{',
    '0%,100%{background-color:color-mix(in oklab,var(--o-theme-line) 72%,var(--o-theme-surface))}',
    '50%{background-color:color-mix(in oklab,var(--o-theme-line) 38%,var(--o-theme-surface))}',
    '}',
    '[data-o-lz-loaded] [data-o-lz-veil]{opacity:0;animation:none}',
    '@media (prefers-reduced-motion:reduce){',
    '[data-o-lz-content]{transition:none}',
    '[data-o-lz-veil]{transition:none;animation:none}',
    '}',
  ].join('')
  document.head.append(style)
}

/** Proprietes propres au composant. */
export interface LazyBlockOwnProps {
  /** Le contenu couvert, puis revele. */
  children?: ReactNode
  /** Attente avant la revelation, en millisecondes. @defaultValue 1400 */
  delay?: number
  /** Duree du croisement, en millisecondes. @defaultValue 500 */
  speed?: number
  /** Rejouer le cycle en boucle : le regime d'une vitrine ou d'une maquette. @defaultValue true */
  loop?: boolean
  /** Temps ou le contenu reste visible avant de repartir, en millisecondes. @defaultValue 2400 */
  hold?: number
  /** Hauteur minimale pendant l'attente, en pixels. @defaultValue 96 */
  height?: number
  /** Rayon des angles du substitut, en pixels. @defaultValue 12 */
  radius?: number
  /** Libelle annonce aux lecteurs d'ecran pendant l'attente. @defaultValue 'Chargement du contenu' */
  label?: string
}

/** Toutes les proprietes. */
export type LazyBlockProps = Customisable<LazyBlockOwnProps, 'div'>

/**
 * Couvre un contenu d'un substitut, puis le revele.
 *
 * @example
 * <LazyBlock height={120}>
 *   <Article />
 * </LazyBlock>
 *
 * @example
 * // Un seul passage : c'est la page qui decide du moment.
 * <LazyBlock loop={false} delay={900}>{apercu}</LazyBlock>
 */
export function LazyBlock({
  children,
  delay = 1400,
  speed = 500,
  loop = true,
  hold = 2400,
  height = 96,
  radius = 12,
  label = 'Chargement du contenu',
  ...rest
}: LazyBlockProps): ReactElement {
  ensureLazyBlockRule()
  const { reduced } = useMotionState()
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    // L'etat final, sans passage : le contenu est la, tout de suite.
    if (reduced) {
      setLoaded(true)
      return
    }

    setLoaded(false)
    let timer = 0

    const reveal = (): void => {
      setLoaded(true)
      if (loop) timer = window.setTimeout(cover, speed + hold)
    }
    const cover = (): void => {
      setLoaded(false)
      timer = window.setTimeout(reveal, delay)
    }

    timer = window.setTimeout(reveal, delay)

    return () => {
      window.clearTimeout(timer)
    }
  }, [reduced, delay, speed, hold, loop])

  const { className, style } = mergePresentation({}, rest)

  const hostStyle = {
    ...style,
    '--o-lz-height': `${String(height)}px`,
    '--o-lz-radius': `${String(radius)}px`,
    '--o-lz-speed': `${String(speed)}ms`,
    // La respiration du substitut est independante de l'attente : elle doit
    // rester lisible que la revelation arrive dans une seconde ou dix.
    '--o-lz-breath': `${String(Math.max(600, Math.round(delay / 2)))}ms`,
  } as CSSProperties

  return (
    <div
      {...rest}
      className={className}
      style={hostStyle}
      data-o-lz=""
      data-o-lz-loaded={loaded ? '' : undefined}
    >
      {/* Le libelle se tait une fois le contenu la : une region vivante qui
          repeterait « chargement » apres coup dirait le contraire de l'ecran. */}
      <span className="o-sr-only" role="status">
        {loaded ? '' : label}
      </span>
      <div data-o-lz-content="" aria-hidden={loaded ? undefined : true}>
        {children}
      </div>
      <span aria-hidden data-o-lz-veil="" />
    </div>
  )
}

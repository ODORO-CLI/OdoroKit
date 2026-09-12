/**
 * Graisse de proximite : chaque lettre s'epaissit quand le pointeur approche.
 *
 * ## Ce que ce composant fait et que `text-pressure` ne fait pas
 *
 * `text-pressure` branche deux axes sur deux directions : c'est un geste, et
 * il vaut pour une ligne d'affiche. Ici il n'y a qu'un seul axe, la graisse,
 * et une seule distance, radiale. En echange, l'effet tient sur un paragraphe
 * entier, sur plusieurs lignes, et se lit comme une loupe : ce qui est pres
 * est lourd, ce qui est loin est leger.
 *
 * ## La traine vient de la lettre, pas du pointeur
 *
 * Le point suivi n'est pas amorti : c'est la position brute du pointeur.
 * L'amortissement est place ailleurs — dans chaque lettre, qui rejoint sa
 * graisse cible a son propre rythme. Consequence : une lettre que le pointeur
 * vient de quitter est encore lourde, et le halo laisse une trainee derriere
 * le geste au lieu de le suivre comme une tache rigide.
 *
 * C'est le meme amortissement exponentiel qu'ailleurs dans le registre,
 * calcule sur le temps ecoule pour que la traine dure pareil a soixante et a
 * cent vingt images par seconde.
 *
 * ## La police est sondee, pas supposee
 *
 * Une reserve invisible est posee dans l'element, avec la police heritee, et
 * mesuree a deux extremes de l'axe `wght`. Si sa largeur ne bouge pas, l'axe
 * n'existe pas : le repli est alors la graisse discrete, arrondie a la
 * centaine, ou le navigateur choisit la coupe la plus proche de la famille.
 *
 * ## Une seule mesure de boite par image
 *
 * Les centres des lettres sont releves une fois, en coordonnees de l'element,
 * et remesures quand il change de taille ou quand la police finit d'arriver.
 * Par image, il ne reste qu'une lecture de boite et un calcul par lettre.
 *
 * ## Le decoupage est un artifice d'affichage
 *
 * Le texte complet figure une fois, d'un seul tenant ; les lettres sont
 * retirees de l'arbre d'accessibilite.
 *
 * ## Mouvement reduit
 *
 * Le texte est rendu tel quel, a sa graisse de repos et sans decoupage :
 * c'est l'etat ou le pointeur n'est nulle part.
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
import { useEffect, useRef, type ElementType, type ReactElement } from 'react'

/** Proprietes propres au composant. */
export interface VariableProximityOwnProps {
  /** Texte a epaissir. */
  children: string
  /** Balise rendue. @defaultValue 'p' */
  as?: ElementType
  /** Portee de la loupe, en pixels. @defaultValue 180 */
  rayon?: number
  /** Graisse loin du pointeur, sur l'axe `wght`. @defaultValue 300 */
  graisseBasse?: number
  /** Graisse sous le pointeur, sur l'axe `wght`. @defaultValue 800 */
  graisseHaute?: number
  /** Vitesse a laquelle une lettre rejoint sa graisse. Plus bas, plus longue est la traine. @defaultValue 10 */
  speed?: number
}

/** Toutes les proprietes. */
export type VariableProximityProps = Customisable<VariableProximityOwnProps, 'p'>

/** Identifiant de la feuille injectee. */
const STYLE_ID = 'o-variable-proximity'

/** Ecart de largeur, en pixels, au-dela duquel l'axe est repute exister. */
const SONDE_SEUIL = 0.5

/** Pose les regles de la loupe, une fois par document. */
function ensureProximityRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-proximity]{position:relative}',
    '[data-o-proximity-letter]{display:inline-block}',
  ].join('')
  document.head.append(style)
}

/**
 * Dit si la police heritee par un element repond a l'axe de graisse.
 *
 * La reserve est un enfant de l'element : elle herite donc exactement de la
 * police qui sera deformee.
 */
function sonderGraisse(hote: HTMLElement): boolean {
  if (
    typeof CSS === 'undefined' ||
    !CSS.supports('font-variation-settings', "'wght' 400")
  ) {
    return false
  }

  const sonde = document.createElement('span')
  sonde.setAttribute('aria-hidden', 'true')
  sonde.textContent = 'HAMBURGEFONS'
  sonde.style.cssText =
    'position:absolute;left:0;top:0;visibility:hidden;white-space:pre;pointer-events:none'
  hote.append(sonde)

  sonde.style.fontVariationSettings = "'wght' 100"
  const maigre = sonde.getBoundingClientRect().width
  sonde.style.fontVariationSettings = "'wght' 900"
  const gras = sonde.getBoundingClientRect().width

  sonde.remove()
  return Math.abs(gras - maigre) > SONDE_SEUIL
}

/**
 * Epaissit les lettres d'un texte a mesure que le pointeur s'en approche.
 *
 * @example
 * <VariableProximity as="p" className="o-text-2xl">
 *   Un composant qu on ne peut pas modifier n est pas a vous.
 * </VariableProximity>
 *
 * @example
 * // Loupe serree, traine longue.
 * <VariableProximity rayon={90} speed={3}>De pres seulement</VariableProximity>
 */
export function VariableProximity({
  children,
  as: Tag = 'p',
  rayon = 180,
  graisseBasse = 300,
  graisseHaute = 800,
  speed = 10,
  ...rest
}: VariableProximityProps): ReactElement {
  const { reduced } = useMotionState()
  const hote = useRef<HTMLElement | null>(null)

  ensureProximityRule()

  useEffect(() => {
    const element = hote.current
    if (element === null || reduced) return

    const lettres = [
      ...element.querySelectorAll<HTMLElement>('[data-o-proximity-letter]'),
    ]
    if (lettres.length === 0) return

    const variable = sonderGraisse(element)

    // Centres en coordonnees de l'element : le defilement ne les change pas,
    // seule une recomposition de la ligne le fait.
    let centres = lettres.map(() => ({ x: 0, y: 0 }))
    const relever = (): void => {
      const cadre = element.getBoundingClientRect()
      centres = lettres.map((lettre) => {
        const boite = lettre.getBoundingClientRect()
        return {
          x: boite.left - cadre.left + boite.width / 2,
          y: boite.top - cadre.top + boite.height / 2,
        }
      })
    }
    relever()

    const observateur = new ResizeObserver(relever)
    observateur.observe(element)
    // Une police qui arrive apres coup change toutes les largeurs : sans
    // cette relecture, la loupe viserait a cote pour toujours.
    void document.fonts?.ready.then(relever)

    const pointeur = { x: Number.NEGATIVE_INFINITY, y: Number.NEGATIVE_INFINITY }
    const bouger = (evenement: PointerEvent): void => {
      const cadre = element.getBoundingClientRect()
      pointeur.x = evenement.clientX - cadre.left
      pointeur.y = evenement.clientY - cadre.top
    }
    window.addEventListener('pointermove', bouger, { passive: true })

    // Graisse courante de chaque lettre : c'est elle qui porte la traine.
    const graisses = lettres.map(() => graisseBasse)
    const ecrites = lettres.map(() => Number.NaN)

    const abonnement = clock.subscribe(
      ({ delta }) => {
        const facteur = 1 - Math.exp(-speed * delta)
        const portee = Math.max(1, rayon)
        const vu = Number.isFinite(pointeur.x)

        for (let index = 0; index < lettres.length; index += 1) {
          const lettre = lettres[index]
          const centre = centres[index]
          const courante = graisses[index]
          if (lettre === undefined || centre === undefined || courante === undefined) {
            continue
          }

          let part = 0
          if (vu) {
            const dx = pointeur.x - centre.x
            const dy = pointeur.y - centre.y
            const brut = Math.max(0, 1 - Math.hypot(dx, dy) / portee)
            // Adoucissement : un cone laisse voir le bord du rayon, une
            // courbe en S le fond dans le texte.
            part = brut * brut * (3 - 2 * brut)
          }

          const visee = graisseBasse + (graisseHaute - graisseBasse) * part
          const suivante = courante + (visee - courante) * facteur
          graisses[index] = suivante

          if (Math.abs(suivante - (ecrites[index] ?? Number.NaN)) < 1) continue
          ecrites[index] = suivante

          if (variable) {
            lettre.style.fontVariationSettings = `'wght' ${suivante.toFixed(0)}`
          } else {
            // Repli : la graisse continue est arrondie a la centaine, et la
            // famille fournit la coupe la plus proche.
            lettre.style.fontWeight = String(Math.round(suivante / 100) * 100)
          }
        }
      },
      { name: 'graisse de proximite', priority: CLOCK_PRIORITY.default },
    )

    return () => {
      abonnement.unsubscribe()
      observateur.disconnect()
      window.removeEventListener('pointermove', bouger)
      for (const lettre of lettres) {
        lettre.style.removeProperty('font-variation-settings')
        lettre.style.removeProperty('font-weight')
      }
    }
  }, [reduced, children, rayon, graisseBasse, graisseHaute, speed])

  const { className, style } = mergePresentation({}, rest)

  // Mouvement reduit : le texte est la, a sa graisse de repos, sans decoupage.
  if (reduced) {
    return (
      <Tag {...rest} className={className} style={style}>
        {children}
      </Tag>
    )
  }

  const lettres = [...children]

  return (
    <Tag {...rest} ref={hote} className={className} style={style} data-o-proximity="">
      {/* Le texte complet, d'un seul tenant, pour les lecteurs d'ecran. */}
      <span className="o-sr-only">{children}</span>
      <span aria-hidden>
        {lettres.map((lettre, index) =>
          lettre === ' ' ? (
            // Une espace reste une espace, hors du bloc en ligne : c'est la
            // seule facon pour qu'un paragraphe puisse encore aller a la
            // ligne. Un insecable ferait de tout le texte un seul mot.
            <span key={`espace-${String(index)}`}> </span>
          ) : (
            <span key={`${lettre}-${String(index)}`} data-o-proximity-letter="">
              {lettre}
            </span>
          ),
        )}
      </span>
    </Tag>
  )
}

/**
 * Pression : le pointeur deforme la police elle-meme, axe par axe.
 *
 * ## Deux axes, deux distances
 *
 * Une police variable n'a pas des graisses, elle a des axes continus. Les
 * deux plus repandus sont `wght`, la graisse, et `wdth`, la chasse. Ce
 * composant les branche sur deux distances differentes : l'ecart **vertical**
 * au pointeur commande la graisse, l'ecart **horizontal** commande la chasse.
 *
 * Le geste devient alors lisible. Monter ou descendre epaissit ou amincit la
 * ligne entiere ; aller vers la droite etire les lettres qu'on approche et
 * laisse retomber celles qu'on quitte. Brancher les deux axes sur la meme
 * distance radiale aurait donne une simple bosse, et le pointeur n'aurait
 * plus qu'une seule chose a dire.
 *
 * ## La police est sondee, pas supposee
 *
 * `font-variation-settings` est reconnu par tous les navigateurs ; encore
 * faut-il que la police chargee ait les axes. Une reserve invisible est donc
 * posee dans l'element, avec la police heritee, et mesuree a deux extremes de
 * chaque axe. Si la largeur ne bouge pas, l'axe n'existe pas.
 *
 * Sans `wght`, le repli est la graisse discrete : la valeur continue est
 * arrondie a la centaine, et le navigateur choisit la coupe la plus proche
 * dans la famille. Sans `wdth`, la chasse est simplement laissee tranquille —
 * mieux vaut un axe qui ne repond pas qu'un etirement simule qui deformerait
 * les glyphes.
 *
 * ## Une seule mesure de boite par image
 *
 * Les centres des lettres sont releves une fois, en coordonnees de l'element,
 * et remesures quand il change de taille ou quand la police finit d'arriver.
 * Par image, il ne reste qu'une lecture de boite — celle de l'element — et un
 * calcul par lettre. Lire la boite de chaque lettre a chaque image
 * declencherait autant de mises en page forcees qu'il y a de caracteres.
 *
 * ## Le decoupage est un artifice d'affichage
 *
 * Le texte complet figure une fois, d'un seul tenant ; les lettres sont
 * retirees de l'arbre d'accessibilite.
 *
 * ## Mouvement reduit
 *
 * Le texte est rendu tel quel, sans decoupage et sans reglage d'axe : c'est
 * l'etat de repos, celui ou le pointeur n'est nulle part.
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
export interface TextPressureOwnProps {
  /** Texte a mettre sous pression. */
  children: string
  /** Balise rendue. @defaultValue 'span' */
  as?: ElementType
  /** Graisse au repos, sur l'axe `wght`. @defaultValue 200 */
  graisseBasse?: number
  /** Graisse sous le pointeur, sur l'axe `wght`. @defaultValue 900 */
  graisseHaute?: number
  /** Etirement maximal sur l'axe `wdth`, en points de chasse. @defaultValue 25 */
  chasse?: number
  /** Portee de la pression, en pixels. @defaultValue 260 */
  rayon?: number
  /** Vitesse de rattrapage du pointeur. Plus haut, plus sec. @defaultValue 6 */
  speed?: number
}

/** Toutes les proprietes. */
export type TextPressureProps = Customisable<TextPressureOwnProps, 'span'>

/** Espace insecable : une espace ordinaire s'ecrase dans un bloc en ligne. */
const NBSP = ' '

/** Identifiant de la feuille injectee. */
const STYLE_ID = 'o-text-pressure'

/** Chasse de reference : celle de la coupe normale. */
const CHASSE_REPOS = 100

/** Ecart de largeur, en pixels, au-dela duquel un axe est repute exister. */
const SONDE_SEUIL = 0.5

/** Pose les regles de la pression, une fois par document. */
function ensurePressureRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-pressure]{display:inline-block;position:relative}',
    '[data-o-pressure-letter]{display:inline-block}',
  ].join('')
  document.head.append(style)
}

/** Ce que la sonde a trouve dans la police heritee. */
interface Axes {
  /** L'axe de graisse repond. */
  readonly graisse: boolean
  /** L'axe de chasse repond. */
  readonly chasse: boolean
}

/**
 * Mesure les axes de la police heritee par un element.
 *
 * La reserve est un enfant de l'element : elle herite donc exactement de la
 * police qui sera deformee, y compris si la page en change plus bas dans
 * l'arbre.
 */
function sonderAxes(hote: HTMLElement): Axes {
  if (
    typeof CSS === 'undefined' ||
    !CSS.supports('font-variation-settings', "'wght' 400")
  ) {
    return { graisse: false, chasse: false }
  }

  const sonde = document.createElement('span')
  sonde.setAttribute('aria-hidden', 'true')
  sonde.textContent = 'HAMBURGEFONS'
  sonde.style.cssText =
    'position:absolute;left:0;top:0;visibility:hidden;white-space:pre;pointer-events:none'
  hote.append(sonde)

  const mesurer = (reglage: string): number => {
    sonde.style.fontVariationSettings = reglage
    return sonde.getBoundingClientRect().width
  }

  const graisse = Math.abs(mesurer("'wght' 900") - mesurer("'wght' 100")) > SONDE_SEUIL
  const chasse = Math.abs(mesurer("'wdth' 125") - mesurer("'wdth' 75")) > SONDE_SEUIL

  sonde.remove()
  return { graisse, chasse }
}

/**
 * Met un texte sous la pression du pointeur, en police variable.
 *
 * @example
 * <TextPressure as="h1" className="o-text-6xl">
 *   Sous pression
 * </TextPressure>
 *
 * @example
 * // Graisse seule, sur une portee courte.
 * <TextPressure chasse={0} rayon={120} graisseBasse={300}>Serre</TextPressure>
 */
export function TextPressure({
  children,
  as: Tag = 'span',
  graisseBasse = 200,
  graisseHaute = 900,
  chasse = 25,
  rayon = 260,
  speed = 6,
  ...rest
}: TextPressureProps): ReactElement {
  const { reduced } = useMotionState()
  const hote = useRef<HTMLElement | null>(null)

  ensurePressureRule()

  useEffect(() => {
    const element = hote.current
    if (element === null || reduced) return

    const lettres = [...element.querySelectorAll<HTMLElement>('[data-o-pressure-letter]')]
    if (lettres.length === 0) return

    const axes = sonderAxes(element)

    // Centres en coordonnees de l'element : ils ne bougent ni au defilement
    // ni quand la page se deplace, seulement quand la ligne se recompose.
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
    // cette relecture, la pression viserait a cote pour toujours.
    void document.fonts?.ready.then(relever)

    // Cible brute et point amorti : le pointeur saute d'un evenement a
    // l'autre, la pression, elle, glisse.
    const cible = { x: Number.NEGATIVE_INFINITY, y: Number.NEGATIVE_INFINITY }
    const point = { x: Number.NEGATIVE_INFINITY, y: Number.NEGATIVE_INFINITY }

    const bouger = (evenement: PointerEvent): void => {
      const cadre = element.getBoundingClientRect()
      cible.x = evenement.clientX - cadre.left
      cible.y = evenement.clientY - cadre.top
      if (!Number.isFinite(point.x)) {
        // Premiere arrivee : la pression se pose la ou elle est, elle ne
        // traverse pas l'ecran depuis l'infini.
        point.x = cible.x
        point.y = cible.y
      }
    }
    window.addEventListener('pointermove', bouger, { passive: true })

    // Dernieres valeurs ecrites par lettre : sans elles, chaque image reecrit
    // un reglage identique et invalide la mise en forme pour rien.
    const derniereGraisse = lettres.map(() => Number.NaN)
    const derniereChasse = lettres.map(() => Number.NaN)

    const abonnement = clock.subscribe(
      ({ delta }) => {
        if (!Number.isFinite(point.x)) return

        const facteur = 1 - Math.exp(-speed * delta)
        point.x += (cible.x - point.x) * facteur
        point.y += (cible.y - point.y) * facteur

        const portee = Math.max(1, rayon)

        for (let index = 0; index < lettres.length; index += 1) {
          const lettre = lettres[index]
          const centre = centres[index]
          if (lettre === undefined || centre === undefined) continue

          // Vertical pour la graisse, horizontal pour la chasse : voir
          // l'en-tete du module.
          const partGraisse = Math.max(0, 1 - Math.abs(point.y - centre.y) / portee)
          const partChasse = Math.max(0, 1 - Math.abs(point.x - centre.x) / portee)

          const graisse = graisseBasse + (graisseHaute - graisseBasse) * partGraisse
          const largeur = CHASSE_REPOS + chasse * partChasse

          const bougeGraisse = !(
            Math.abs(graisse - (derniereGraisse[index] ?? Number.NaN)) < 1
          )
          const bougeChasse = !(
            Math.abs(largeur - (derniereChasse[index] ?? Number.NaN)) < 0.2
          )
          if (!bougeGraisse && !bougeChasse) continue
          derniereGraisse[index] = graisse
          derniereChasse[index] = largeur

          if (axes.graisse) {
            lettre.style.fontVariationSettings = axes.chasse
              ? `'wght' ${graisse.toFixed(0)}, 'wdth' ${largeur.toFixed(1)}`
              : `'wght' ${graisse.toFixed(0)}`
          } else {
            // Repli : la graisse continue est arrondie a la centaine, et la
            // famille fournit la coupe la plus proche.
            lettre.style.fontWeight = String(Math.round(graisse / 100) * 100)
          }
        }
      },
      { name: 'pression du texte', priority: CLOCK_PRIORITY.default },
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
  }, [reduced, children, graisseBasse, graisseHaute, chasse, rayon, speed])

  const { className, style } = mergePresentation({}, rest)

  // Mouvement reduit : le texte est la, au repos, sans decoupage.
  if (reduced) {
    return (
      <Tag {...rest} className={className} style={style}>
        {children}
      </Tag>
    )
  }

  const lettres = [...children]

  return (
    <Tag {...rest} ref={hote} className={className} style={style} data-o-pressure="">
      {/* Le texte complet, d'un seul tenant, pour les lecteurs d'ecran. */}
      <span className="o-sr-only">{children}</span>
      <span aria-hidden>
        {lettres.map((lettre, index) => (
          <span key={`${lettre}-${String(index)}`} data-o-pressure-letter="">
            {/* Une espace ordinaire s'ecrase dans un bloc en ligne :
                l'insecable garde sa largeur. */}
            {lettre === ' ' ? NBSP : lettre}
          </span>
        ))}
      </span>
    </Tag>
  )
}

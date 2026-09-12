/**
 * Nettoyage : le bloc est flou, et ses mots redeviennent nets un a un, dans
 * un ordre tire au sort, jusqu'a ce que tout se lise.
 *
 * ## Ce que ce composant fait et que `blur-reveal` ne fait pas
 *
 * `blur-reveal` va du flou au net dans l'ordre de lecture, une fois, a
 * l'entree dans le champ : c'est une arrivee. Ici l'ordre est tire au sort et
 * le cycle se rejoue, si bien qu'on ne devine jamais quel mot va sortir du
 * flou. L'effet ne raconte pas un texte qui arrive, il raconte un texte qu'on
 * essaie de dechiffrer.
 *
 * ## Un cycle entier tient dans une seule animation par mot
 *
 * L'ordre du tirage n'est pas joue par une suite de minuteurs : il est cuit
 * dans les images cles. Chaque mot recoit une animation de la duree du cycle
 * complet, dont les instants sont calcules a partir de son rang de tirage —
 * flou jusqu'a son tour, net apres, et le retour au flou pour tout le monde a
 * la fin.
 *
 * Le cycle se repete alors tout seul, sans une ligne de JavaScript pendant
 * qu'il tourne, et le compositeur tient les opacites et les flous. Le tirage
 * est fait une fois au depart : le rejouer a chaque tour demanderait de
 * reconstruire toutes les animations, et le cout du hasard depasserait
 * largement ce qu'il apporte.
 *
 * ## Toutes les animations partent au meme instant
 *
 * Leur date de depart est posee a la main sur la meme valeur de timeline.
 * Sans cela, deux mots crees dans la meme image peuvent commencer a des
 * instants differents, et le tirage se decale d'un cycle a l'autre.
 *
 * ## Le flou n'est pose que si le nettoyage aura lieu
 *
 * Le piege de toutes les revelations : cacher en CSS, montrer en JavaScript.
 * Le flou de depart est porte par la premiere image cle de l'animation
 * elle-meme — sans elle, le texte est simplement la, net.
 *
 * ## Le decoupage est un artifice d'affichage
 *
 * Le texte complet figure une fois, d'un seul tenant ; les mots sont retires
 * de l'arbre d'accessibilite. Les espaces restent des espaces, hors des blocs
 * en ligne : c'est ce qui permet au paragraphe d'aller a la ligne.
 *
 * ## Mouvement reduit
 *
 * Aucun decoupage, aucun flou : le texte est rendu tel quel. C'est l'etat ou
 * tout se lit, et c'est bien la fin de chaque cycle.
 *
 * @module
 */

import { mergePresentation, useMotionState, type Customisable } from '@odoro-cli/engine'
import { useEffect, type ElementType, type ReactElement } from 'react'

import { useInView } from '@registre/hooks/useInView'

/** Proprietes propres au composant. */
export interface BlurWordsOwnProps {
  /** Texte a nettoyer. Une chaine : elle est decoupee en mots. */
  children: string
  /** Balise rendue. @defaultValue 'p' */
  as?: ElementType
  /** Flou d'un mot pas encore nettoye, en pixels. @defaultValue 6 */
  blur?: number
  /** Opacite d'un mot pas encore nettoye, de 0 a 1. @defaultValue 0.25 */
  dim?: number
  /** Duree du nettoyage d'un mot, en millisecondes. @defaultValue 520 */
  duration?: number
  /** Retard entre deux mots du tirage, en millisecondes. @defaultValue 200 */
  step?: number
  /** Temps de lecture avant que tout redevienne flou, en millisecondes. @defaultValue 1600 */
  pause?: number
  /** Rejouer le cycle sans fin. @defaultValue true */
  boucle?: boolean
}

/** Toutes les proprietes. */
export type BlurWordsProps = Customisable<BlurWordsOwnProps, 'p'>

/** Identifiant de la feuille injectee. */
const STYLE_ID = 'o-blur-words'

/** Part de la pause consacree a la lecture ; le reste retourne au flou. */
const LECTURE = 0.6

/** Pose les regles du nettoyage, une fois par document. */
function ensureBlurWordsRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = ['[data-o-blur-words-word]{display:inline-block}'].join('')
  document.head.append(style)
}

/**
 * Rend une permutation des indices, par melange de Fisher-Yates.
 *
 * Une permutation quelconque : que deux mots voisins sortent l'un apres
 * l'autre arrive, et c'est ce qui rend le tirage credible.
 */
function permutation(taille: number): number[] {
  const ordre = Array.from({ length: taille }, (_, index) => index)
  for (let index = taille - 1; index > 0; index -= 1) {
    const tire = Math.floor(Math.random() * (index + 1))
    const garde = ordre[index] ?? index
    ordre[index] = ordre[tire] ?? tire
    ordre[tire] = garde
  }
  return ordre
}

/**
 * Nettoie les mots d'un texte un a un, dans un ordre tire au sort.
 *
 * @example
 * <BlurWords as="p" className="o-text-2xl">
 *   Un composant qu on ne peut pas modifier n est pas a vous.
 * </BlurWords>
 *
 * @example
 * // Un seul passage, tres flou, sans retour en arriere.
 * <BlurWords boucle={false} blur={12} step={90}>Une seule fois</BlurWords>
 */
export function BlurWords({
  children,
  as: Tag = 'p',
  blur = 6,
  dim = 0.25,
  duration = 520,
  step = 200,
  pause = 1600,
  boucle = true,
  ...rest
}: BlurWordsProps): ReactElement {
  const { reduced } = useMotionState()
  const { ref, vu } = useInView<HTMLElement>()

  ensureBlurWordsRule()

  useEffect(() => {
    const element = ref.current
    if (element === null || reduced || !vu) return

    const mots = [...element.querySelectorAll<HTMLElement>('[data-o-blur-words-word]')]
    if (mots.length === 0) return

    const total = mots.length
    const ordre = permutation(total)
    const cycle = total * step + duration + pause

    const trouble = {
      opacity: Math.min(1, Math.max(0, dim)),
      filter: `blur(${String(blur)}px)`,
    }
    const net = { opacity: 1, filter: 'blur(0px)' }

    const animations = mots.map((mot, index) => {
      const rang = ordre[index] ?? index
      const debut = (rang * step) / cycle
      const fin = (rang * step + duration) / cycle
      const lecture = (total * step + duration + pause * LECTURE) / cycle

      const images = boucle
        ? [
            { ...trouble, offset: 0 },
            { ...trouble, offset: debut },
            { ...net, offset: fin },
            { ...net, offset: Math.max(fin, lecture) },
            // Tout le monde retourne au flou ensemble : c'est la fin du
            // cycle, et le tour suivant repart du meme point.
            { ...trouble, offset: 1 },
          ]
        : [
            { ...trouble, offset: 0 },
            { ...trouble, offset: debut },
            { ...net, offset: fin },
            { ...net, offset: 1 },
          ]

      return mot.animate(images, {
        duration: cycle,
        iterations: boucle ? Number.POSITIVE_INFINITY : 1,
        easing: 'linear',
        fill: 'both',
      })
    })

    // Meme instant de depart pour tout le monde : sans cela, le tirage se
    // decale d'un cycle a l'autre. Voir l'en-tete du module.
    const depart = document.timeline.currentTime
    for (const animation of animations) animation.startTime = depart

    return () => {
      for (const animation of animations) animation.cancel()
    }
  }, [ref, reduced, vu, children, blur, dim, duration, step, pause, boucle])

  const { className, style } = mergePresentation({}, rest)

  // Mouvement reduit : le texte est la, net, sans decoupage.
  if (reduced) {
    return (
      <Tag {...rest} className={className} style={style}>
        {children}
      </Tag>
    )
  }

  const mots = children.split(' ').filter((mot) => mot.length > 0)

  return (
    <Tag {...rest} ref={ref} className={className} style={style}>
      {/* Le texte complet, d'un seul tenant, pour les lecteurs d'ecran. */}
      <span className="o-sr-only">{children}</span>
      <span aria-hidden>
        {mots.map((mot, index) => (
          <span key={`${mot}-${String(index)}`}>
            <span data-o-blur-words-word="">{mot}</span>
            {index < mots.length - 1 ? ' ' : null}
          </span>
        ))}
      </span>
    </Tag>
  )
}

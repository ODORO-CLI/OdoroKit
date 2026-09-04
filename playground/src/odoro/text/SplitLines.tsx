/**
 * Revelation par ligne : chaque ligne monte depuis sous son propre masque.
 *
 * ## Decouper par ligne, et non par caractere
 *
 * `split-reveal` decoupe par caractere : chaque lettre est un element, et
 * l'effet est menu, nerveux. Celui-ci travaille a l'echelle de la ligne — le
 * mouvement est ample, lent, et convient a un titre long ou a un paragraphe
 * d'introduction, la ou cent lettres qui sautent seraient du bruit.
 *
 * ## Une ligne n'existe pas dans le DOM
 *
 * C'est toute la difficulte. Un mot est une chaine, un caractere aussi ; une
 * ligne, elle, est une decision du moteur de rendu, prise apres la mise en
 * page, et qui change avec la largeur, la police, la taille de texte du
 * systeme.
 *
 * On la lit donc la ou elle existe : dans les rectangles rendus. Un `Range`
 * pose sur chaque mot donne sa position verticale, et les mots qui partagent
 * cette position forment une ligne. C'est la seule methode qui ne se trompe
 * pas — deviner d'apres le nombre de caracteres marche jusqu'a la premiere
 * cesure.
 *
 * ## Le texte d'origine ne bouge jamais
 *
 * Il reste un noeud unique : lisible par un lecteur d'ecran, selectionnable,
 * copiable d'un bloc. Ce sont ses rectangles qu'on mesure, et il donne aussi
 * sa hauteur au conteneur.
 *
 * Les lignes animees vivent dans un calque `aria-hidden` pose par-dessus. Le
 * texte d'origine n'est rendu transparent **qu'une fois ce calque construit** :
 * si le JavaScript ne s'execute pas, ou echoue, le texte reste simplement la.
 * Un effet manquant se pardonne, un titre invisible non.
 *
 * ## La mesure se refait quand la mise en page change
 *
 * Une police qui finit de charger recompose les lignes. Une fenetre qu'on
 * redimensionne aussi. Mesurer une fois au montage donnerait un calque juste
 * pendant deux secondes, puis decale — et decale de facon d'autant plus visible
 * que le texte est long.
 *
 * @module
 */

import { mergePresentation, useMotionState, type Customisable } from '@odoro-cli/engine'
import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ElementType,
  type ReactElement,
} from 'react'

import { useInView } from '@/odoro/hooks/useInView'

/** Proprietes propres au composant. */
export interface SplitLinesOwnProps {
  /** Texte a reveler. Une chaine : ce sont ses lignes qu'on mesure. */
  children: string
  /** Balise rendue. @defaultValue 'p' */
  as?: ElementType
  /** Duree de la montee d'une ligne, en millisecondes. @defaultValue 700 */
  duration?: number
  /** Retard entre deux lignes, en millisecondes. @defaultValue 90 */
  stagger?: number
  /** Retard avant la premiere ligne, en millisecondes. @defaultValue 0 */
  delay?: number
  /**
   * Quand partir.
   *
   * `vue` attend l'entree dans le champ, `montage` part tout de suite.
   *
   * @defaultValue 'vue'
   */
  declenchement?: 'vue' | 'montage'
}

/** Toutes les proprietes. */
export type SplitLinesProps = Customisable<SplitLinesOwnProps, 'p'>

/** Identifiant de la feuille injectee. */
const STYLE_ID = 'o-split-lines'

/** Pose les regles du calque, une fois par document. */
function ensureSplitLinesRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-split-lines]{position:relative}',
    // Le calque se superpose exactement, et ne recoit jamais le pointeur : la
    // selection de texte doit atteindre l'original, dessous.
    '[data-o-split-lines-layer]{position:absolute;inset:0;pointer-events:none}',
    // Chaque ligne est un masque : ce qui depasse par le bas est coupe.
    '[data-o-split-lines-mask]{display:block;overflow:hidden}',
    '[data-o-split-lines-inner]{display:block;will-change:transform}',
    // L'original devient transparent seulement quand le calque existe.
    '[data-o-split-lines-hidden]{color:transparent}',
  ].join('')
  document.head.append(style)
}

/** Un mot, et le rectangle qu'il occupe. */
interface MotMesure {
  readonly texte: string
  readonly haut: number
}

/**
 * Regroupe les mots d'un noeud de texte en lignes rendues.
 *
 * Les rectangles sont arrondis avant comparaison : deux mots d'une meme ligne
 * peuvent differer d'une fraction de pixel selon leurs jambages, et une
 * comparaison stricte les separerait en deux lignes d'un mot.
 */
function lignesRendues(noeud: Text): readonly string[] {
  const texte = noeud.data
  const mesures: MotMesure[] = []

  const plage = document.createRange()
  let debut = 0

  while (debut < texte.length) {
    // On saute les espaces : ils appartiennent a la ligne qui precede, et un
    // espace en fin de ligne a un rectangle qui peut deborder sur la suivante.
    while (debut < texte.length && /\s/.test(texte[debut] as string)) debut += 1
    if (debut >= texte.length) break

    let fin = debut
    while (fin < texte.length && !/\s/.test(texte[fin] as string)) fin += 1

    plage.setStart(noeud, debut)
    plage.setEnd(noeud, fin)

    const rect = plage.getBoundingClientRect()
    mesures.push({ texte: texte.slice(debut, fin), haut: Math.round(rect.top) })

    debut = fin
  }

  plage.detach()

  const lignes: string[] = []
  let hautCourant: number | undefined

  for (const mot of mesures) {
    if (hautCourant === undefined || mot.haut !== hautCourant) {
      lignes.push(mot.texte)
      hautCourant = mot.haut
    } else {
      lignes[lignes.length - 1] += ` ${mot.texte}`
    }
  }

  return lignes
}

/**
 * Revele un texte ligne par ligne.
 *
 * @example
 * <SplitLines as="h1" className="o-text-4xl o-font-bold">
 *   Un moteur maison, et rien qui ne vous appartienne pas.
 * </SplitLines>
 *
 * @example
 * // Au montage plutot qu'a l'entree dans le champ, pour un titre de heros.
 * <SplitLines declenchement="montage" stagger={140}>
 *   Bienvenue
 * </SplitLines>
 */
export function SplitLines({
  children,
  as: Tag = 'p',
  duration = 700,
  stagger = 90,
  delay = 0,
  declenchement = 'vue',
  ...rest
}: SplitLinesProps): ReactElement {
  const { reduced } = useMotionState()
  const { ref: refVue, vu } = useInView<HTMLElement>({
    immediat: declenchement === 'montage',
  })

  const refSource = useRef<HTMLSpanElement | null>(null)
  const refCalque = useRef<HTMLSpanElement | null>(null)
  const [construit, setConstruit] = useState(false)

  ensureSplitLinesRule()

  useEffect(() => {
    // En mouvement reduit, aucun calque n'est construit : le texte est la, et
    // c'est tout ce qu'on lui demandait.
    if (reduced) return

    const source = refSource.current
    const calque = refCalque.current
    if (source === null || calque === null) return

    const noeud = source.firstChild
    if (noeud === null || noeud.nodeType !== Node.TEXT_NODE) return

    let animations: Animation[] = []

    const construire = () => {
      for (const a of animations) a.cancel()
      animations = []
      calque.replaceChildren()

      const lignes = lignesRendues(noeud as Text)
      if (lignes.length === 0) return

      for (const ligne of lignes) {
        const masque = document.createElement('span')
        masque.setAttribute('data-o-split-lines-mask', '')

        const interieur = document.createElement('span')
        interieur.setAttribute('data-o-split-lines-inner', '')
        interieur.textContent = ligne

        masque.append(interieur)
        calque.append(masque)
      }

      setConstruit(true)

      if (!vu) {
        // Construit mais pas encore declenche : les lignes attendent sous leur
        // masque. Sans cela, elles seraient visibles avant l'animation.
        for (const interieur of calque.children) {
          const cible = interieur.firstElementChild
          if (cible instanceof HTMLElement) cible.style.transform = 'translateY(110%)'
        }
        return
      }

      let index = 0
      for (const masque of calque.children) {
        const interieur = masque.firstElementChild
        if (!(interieur instanceof HTMLElement)) continue

        interieur.style.transform = ''

        animations.push(
          interieur.animate(
            [
              { transform: 'translateY(110%)' },
              { transform: 'translateY(0)' },
            ],
            {
              duration,
              delay: delay + index * stagger,
              // Une sortie franche puis un amorti : le mouvement doit paraitre
              // arriver, pas s'arreter net.
              easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
              fill: 'both',
            },
          ),
        )
        index += 1
      }
    }

    construire()

    // La mise en page change, les lignes changent. Une police qui finit de
    // charger est le cas le plus frequent, et le plus visible.
    const observateur = new ResizeObserver(() => {
      construire()
    })
    observateur.observe(source)

    let vivant = true
    if (typeof document.fonts !== 'undefined') {
      void document.fonts.ready.then(() => {
        if (vivant) construire()
      })
    }

    return () => {
      vivant = false
      observateur.disconnect()
      for (const a of animations) a.cancel()
      calque.replaceChildren()
      setConstruit(false)
    }
  }, [children, reduced, vu, duration, stagger, delay])

  const { className, style } = mergePresentation({}, rest)

  return (
    <Tag
      {...rest}
      ref={refVue}
      className={className}
      style={style as CSSProperties}
      data-o-split-lines=""
    >
      <span
        ref={refSource}
        {...(construit ? { 'data-o-split-lines-hidden': '' } : {})}
      >
        {children}
      </span>
      <span ref={refCalque} aria-hidden="true" data-o-split-lines-layer="" />
    </Tag>
  )
}

/**
 * Signature : un trace se dessine d'un seul geste, comme au stylo.
 *
 * ## Un tiret aussi long que le chemin
 *
 * Le trait n'est pas revele par un masque qui glisse : c'est un tiret dont la
 * longueur vaut le chemin entier, deplace par son propre decalage. Quand le
 * decalage vaut la longueur, le tiret est entierement sorti et rien n'est
 * peint ; quand il retombe a zero, le trait est complet. Le crayon avance
 * donc le long de la courbe, en suivant ses boucles et ses retours — ce
 * qu'aucun masque rectangulaire ne saurait faire.
 *
 * Le chemin declare une longueur de cent : les images cles se lisent en pour
 * cent et valent pour n'importe quelle signature, quelle que soit la longueur
 * reelle de son contour. C'est ce qui permet de passer la sienne en propriete
 * sans toucher a rien d'autre.
 *
 * ## Pas de forme en creux
 *
 * `logo-draw` laisse voir sa marque en filigrane pendant le trace : un logo a
 * demi dessine n'est qu'un fragment, et l'oeil a besoin de savoir ce qui
 * manque. Une signature, non — la voir d'avance detruirait le seul interet du
 * geste. On ne la lit qu'une fois posee.
 *
 * ## Le trace complet est l'etat de depart
 *
 * Le decalage vaut zero dans la feuille : sans JavaScript, la signature est
 * la, entiere. C'est le code de l'animation qui la retire avant de la
 * reposer, jamais le rendu.
 *
 * ## Ce que la signature n'est pas
 *
 * Un dessin, pas un texte. Le nom qu'elle porte figure une fois, d'un seul
 * tenant, pour les lecteurs d'ecran ; le trace est retire de l'arbre
 * d'accessibilite.
 *
 * ## Mouvement reduit
 *
 * La signature entierement tracee, a l'arret : c'est l'etat d'arrivee.
 *
 * @module
 */

import { mergePresentation, useMotionState, type Customisable } from '@odoro-cli/engine'
import { useEffect, type ElementType, type ReactElement } from 'react'

import { useInView } from '@/odoro/hooks/useInView'

/** Ce qui declenche le trace. */
export type HandWrittenDeclenchement = 'montage' | 'vue' | 'survol'

/** Proprietes propres au composant. */
export interface HandWrittenOwnProps {
  /** Nom que la signature porte, annonce aux lecteurs d'ecran. */
  children: string
  /** Balise rendue. @defaultValue 'span' */
  as?: ElementType
  /**
   * Trace de la signature, en donnees de chemin SVG. Un seul trait continu :
   * une signature ne leve pas le stylo.
   * @defaultValue un paraphe
   */
  path?: string
  /** Vue du trace. A changer avec le chemin. @defaultValue '0 0 320 110' */
  viewBox?: string
  /** Largeur du dessin, en pixels. @defaultValue 280 */
  width?: number
  /** Epaisseur du trait, en unites de la vue. @defaultValue 5 */
  thickness?: number
  /** Duree du trace, en millisecondes. @defaultValue 1800 */
  duration?: number
  /** Couleur de l'encre. @defaultValue la couleur du texte */
  color?: string
  /**
   * Quand tracer.
   *
   * `vue` attend l'entree dans le champ, `montage` part tout de suite,
   * `survol` rejoue a chaque entree du pointeur.
   *
   * @defaultValue 'vue'
   */
  declenchement?: HandWrittenDeclenchement
}

/** Toutes les proprietes. */
export type HandWrittenProps = Customisable<HandWrittenOwnProps, 'span'>

/** Identifiant de la feuille injectee. */
const STYLE_ID = 'o-hand-written'

/**
 * Paraphe par defaut : une boucle initiale, trois jambages, et le trait de
 * soulignement qui revient sous le mot sans que le stylo se soit leve.
 */
const PARAPHE = [
  'M 26 74',
  'C 18 44, 44 18, 66 26',
  'C 86 34, 78 66, 60 74',
  'C 46 80, 34 74, 40 60',
  'C 52 32, 84 26, 104 40',
  'C 118 50, 112 72, 96 74',
  'C 84 76, 80 64, 88 56',
  'C 100 44, 122 44, 132 58',
  'C 140 70, 134 78, 124 74',
  'C 112 70, 116 52, 132 48',
  'C 146 44, 152 56, 148 70',
  'C 146 78, 152 80, 158 72',
  'C 168 58, 186 50, 198 58',
  'C 210 66, 204 80, 190 78',
  'C 178 76, 178 60, 192 52',
  'C 214 40, 252 44, 270 62',
  'C 280 72, 274 86, 258 84',
  'C 232 80, 176 90, 120 92',
  'C 84 93, 48 90, 30 84',
].join(' ')

/** Vue du paraphe par defaut. */
const PARAPHE_VUE = '0 0 320 110'

/** Sortie reguliere, a peine ralentie a la fin : une main ne freine pas. */
const COURBE = 'cubic-bezier(0.35, 0.1, 0.3, 1)'

/** Pose le trace, une fois par document. */
function ensureHandRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-hand]{display:inline-block;line-height:0}',
    '[data-o-hand] svg{display:block;height:auto}',
    // Decalage nul : la signature est posee. Voir l'en-tete du module.
    '[data-o-hand-line]{stroke-dasharray:100 100;stroke-dashoffset:0}',
  ].join('')
  document.head.append(style)
}

/**
 * Trace une signature manuscrite.
 *
 * @example
 * <HandWritten>Odoro</HandWritten>
 *
 * @example
 * // Sa propre signature, dans sa propre vue, rejouee au survol.
 * <HandWritten
 *   path="M 10 60 C 60 10, 120 90, 190 40"
 *   viewBox="0 0 200 100"
 *   declenchement="survol"
 * >
 *   Camille
 * </HandWritten>
 */
export function HandWritten({
  children,
  as: Tag = 'span',
  path = PARAPHE,
  viewBox = PARAPHE_VUE,
  width = 280,
  thickness = 5,
  duration = 1800,
  color = 'currentColor',
  declenchement = 'vue',
  ...rest
}: HandWrittenProps): ReactElement {
  const { reduced } = useMotionState()
  const { ref, vu } = useInView<HTMLElement>({
    immediat: declenchement === 'montage',
  })

  ensureHandRule()

  useEffect(() => {
    const element = ref.current
    if (element === null || reduced) return

    const trait = element.querySelector<SVGPathElement>('[data-o-hand-line]')
    if (trait === null) return

    let animation: Animation | null = null

    const arreter = (): void => {
      animation?.cancel()
      animation = null
    }

    const jouer = (): void => {
      arreter()
      animation = trait.animate(
        [{ strokeDashoffset: '100' }, { strokeDashoffset: '0' }],
        { duration, easing: COURBE, fill: 'both' },
      )
    }

    if (declenchement === 'survol') {
      // Rien n'est efface d'avance : la signature attend, posee, et c'est
      // l'animation elle-meme qui la retire le temps de la reecrire.
      const entrer = (): void => {
        jouer()
      }
      element.addEventListener('pointerenter', entrer)
      return () => {
        element.removeEventListener('pointerenter', entrer)
        arreter()
      }
    }

    if (!vu) {
      // L'etat efface est ecrit ici, pas dans le rendu : voir l'en-tete.
      trait.style.strokeDashoffset = '100'
      return
    }

    jouer()
    return () => {
      arreter()
      trait.style.removeProperty('stroke-dashoffset')
    }
  }, [ref, reduced, vu, path, duration, declenchement])

  // La largeur est une base, pas une contrainte : elle passe en premier pour
  // qu'un `style` de l'appelant l'emporte.
  const { className, style } = mergePresentation(
    { style: { width: `${String(width)}px` } },
    rest,
  )

  return (
    <Tag {...rest} ref={ref} className={className} style={style} data-o-hand="">
      {/* Le nom, d'un seul tenant, pour les lecteurs d'ecran. */}
      <span className="o-sr-only">{children}</span>
      <svg aria-hidden viewBox={viewBox} width="100%">
        <path
          data-o-hand-line=""
          d={path}
          pathLength={100}
          fill="none"
          stroke={color}
          strokeWidth={thickness}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </Tag>
  )
}

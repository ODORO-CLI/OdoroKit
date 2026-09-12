/**
 * Avancee d'un element, ou d'une page, dans le champ visible.
 *
 * ## Pourquoi ce crochet plutot que ScrollTrigger
 *
 * Le moteur sait deja suivre le defilement, mais par GSAP et son plugin
 * `ScrollTrigger` — trente kilo-octets de plus, et un plugin a enregistrer,
 * pour une soustraction entre deux rectangles. Le prix est justifie quand on
 * epingle une section ou qu'on synchronise une timeline complete ; il ne l'est
 * pas quand on veut simplement savoir « ou en est cet element ».
 *
 * Ce crochet fait cette soustraction, et rien d'autre.
 *
 * ## Pourquoi la mesure passe par l'horloge, et pas par un ecouteur `scroll`
 *
 * Un ecouteur par element parait plus economique — il ne travaille que pendant
 * le defilement. En pratique c'est l'inverse. Les evenements de defilement
 * arrivent plus souvent qu'une image sur les pilotes tactiles, et chacun
 * declenche une lecture de rectangle : on mesure plusieurs fois pour la meme
 * image affichee. Dix elements observes font dix ecouteurs qui se reveillent
 * tous a chaque cran de molette.
 *
 * En passant par l'horloge, la mesure a lieu **une fois par image**, quel que
 * soit le nombre d'elements, et en priorite `layout` : toutes les lectures de
 * mise en page se groupent avant les ecritures de la frame, ce qui evite
 * l'aller-retour ou l'on lit, on ecrit, et on relit un calcul que le
 * navigateur vient de jeter.
 *
 * ## Pourquoi une ref et un abonnement, plutot qu'un etat
 *
 * La valeur change a chaque image pendant tout un defilement. La rendre comme
 * etat, ce sont soixante rendus React par seconde pour deplacer un rectangle
 * que le compositeur anime seul.
 *
 * `progress.current` est donc la valeur exacte, lue dans la boucle par ceux
 * qui y sont deja. `subscribe` existe pour l'autre besoin, reel : afficher un
 * pourcentage en chiffres, franchir une etape. Il ne publie qu'aux paliers —
 * voir {@link PALIERS} — parce qu'un affichage arrondi au pour cent n'a rien a
 * faire d'un centieme de decimale.
 *
 * ## Un seul axe
 *
 * La verticale. Un defilement horizontal se mesure autrement — c'est la
 * position d'un conteneur, pas la traversee d'un champ — et pretendre couvrir
 * les deux avec les memes options donnerait un crochet ou la moitie des
 * reglages ne s'applique jamais.
 *
 * @module
 */

import { CLOCK_PRIORITY, clock, motionPolicy } from '@odoro-cli/engine'
import { useCallback, useEffect, useMemo, useRef, type RefObject } from 'react'

/**
 * Ce que la course de 0 a 1 recouvre.
 *
 * - `traversee` — 0 quand le haut de l'element touche le bas du champ, 1 quand
 *   son bas en touche le haut. C'est la course d'une revelation : l'element
 *   entre, passe, sort.
 * - `ancrage` — 0 quand le haut de l'element atteint le haut du champ, 1 quand
 *   son bas en atteint le bas. C'est la course d'une section haute qu'on
 *   parcourt de l'interieur : une frise, un recit en etapes.
 */
export type ScrollRange = 'traversee' | 'ancrage'

/** Conduite a tenir sous mouvement reduit. */
export type ScrollReduced = 'final' | 'suivre'

/** Options de `useScrollProgress`. */
export interface ScrollProgressOptions {
  /**
   * Element mesure. Sans lui, c'est l'avancee du document — ou du conteneur —
   * qui est rendue.
   */
  target?: HTMLElement | null
  /**
   * Conteneur qui defile, quand ce n'est pas la fenetre : un panneau, une
   * boite de dialogue. Il definit le champ dans lequel l'element est situe.
   */
  scroller?: HTMLElement | null
  /** Ce que la course recouvre. @defaultValue 'traversee' */
  range?: ScrollRange
  /**
   * Sous mouvement reduit, `final` publie 1 une fois pour toutes et ne mesure
   * plus rien : un texte revele par la progression doit etre lu, pas fige a
   * son etat initial. `suivre` mesure quand meme, pour ce dont la valeur est
   * le contenu — une barre de lecture dit ou l'on en est, ce n'est pas une
   * animation.
   *
   * @defaultValue 'final'
   */
  reduced?: ScrollReduced
  /** Nom affiche dans le panneau de diagnostic. */
  name?: string
}

/** Ce que le crochet rend. */
export interface ScrollProgressHandle {
  /** Progression courante, de 0 a 1. A lire dans la boucle. */
  readonly progress: RefObject<number>
  /**
   * S'abonne aux paliers de la progression. Le nouvel abonne recoit tout de
   * suite la valeur courante — sans quoi il resterait a zero jusqu'au premier
   * mouvement, ce qui est faux des qu'on arrive au milieu d'une page.
   *
   * @returns De quoi se desabonner.
   */
  subscribe(listener: (value: number) => void): () => void
}

/**
 * Nombre de paliers de publication.
 *
 * Cent : plus fin que ce qu'un pourcentage affiche, et deux ordres de grandeur
 * en dessous du nombre d'images d'un defilement complet.
 */
const PALIERS = 100

/**
 * Suit l'avancee d'un element, ou de la page, dans le champ.
 *
 * @example
 * // Une revelation : la valeur est lue dans la boucle, sans rendu React.
 * const [cible, setCible] = useState<HTMLElement | null>(null)
 * const { progress } = useScrollProgress({ target: cible })
 *
 * @example
 * // Un pourcentage affiche : l'abonnement, borne aux paliers.
 * const { subscribe } = useScrollProgress()
 * const [part, setPart] = useState(0)
 * useEffect(() => subscribe(setPart), [subscribe])
 */
export function useScrollProgress(
  options: ScrollProgressOptions = {},
): ScrollProgressHandle {
  const {
    target = null,
    scroller = null,
    range = 'traversee',
    reduced = 'final',
    name = 'progression-defilement',
  } = options

  const progress = useRef(0)
  const publie = useRef(-1)
  const listeners = useRef<Set<(value: number) => void>>(new Set())

  const subscribe = useCallback((listener: (value: number) => void): (() => void) => {
    listeners.current.add(listener)
    listener(progress.current)
    return () => {
      listeners.current.delete(listener)
    }
  }, [])

  useEffect(() => {
    const ecrire = (valeur: number): void => {
      const borne = valeur < 0 ? 0 : valeur > 1 ? 1 : valeur
      progress.current = borne

      const palier = Math.round(borne * PALIERS)
      if (palier === publie.current) return
      publie.current = palier
      // Une copie : un abonne qui se retire depuis sa propre notification est
      // le cas courant d'une etape qui ne doit se franchir qu'une fois.
      for (const listener of [...listeners.current]) listener(borne)
    }

    // Voir les options : sous mouvement reduit, l'etat final, pas l'initial.
    if (reduced === 'final' && motionPolicy.state.reduced) {
      ecrire(1)
      return
    }

    const mesurer = (): number => {
      if (target === null) {
        if (scroller !== null) {
          const course = scroller.scrollHeight - scroller.clientHeight
          return course <= 0 ? 0 : scroller.scrollTop / course
        }
        const racine = document.documentElement
        const course = racine.scrollHeight - window.innerHeight
        return course <= 0 ? 0 : window.scrollY / course
      }

      const champ =
        scroller === null
          ? { haut: 0, hauteur: window.innerHeight }
          : {
              haut: scroller.getBoundingClientRect().top,
              hauteur: scroller.clientHeight,
            }

      const rect = target.getBoundingClientRect()
      const haut = rect.top - champ.haut

      if (range === 'ancrage') {
        const course = rect.height - champ.hauteur
        // Un element plus court que le champ ne se parcourt pas de
        // l'interieur : la course est nulle, et la reponse binaire.
        if (course <= 0) return haut <= 0 ? 1 : 0
        return -haut / course
      }

      const course = champ.hauteur + rect.height
      return course <= 0 ? 0 : (champ.hauteur - haut) / course
    }

    const subscription = clock.subscribe(
      () => {
        ecrire(mesurer())
      },
      // Priorite `layout` : les lectures de mise en page de toute la frame se
      // groupent ici, avant que quiconque ecrive.
      { priority: CLOCK_PRIORITY.layout, name },
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [target, scroller, range, reduced, name])

  return useMemo(() => ({ progress, subscribe }), [subscribe])
}

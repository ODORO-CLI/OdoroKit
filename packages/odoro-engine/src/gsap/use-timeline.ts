/**
 * Timelines liees au cycle de vie d'un composant.
 *
 * ## Le contexte, et pourquoi il est obligatoire
 *
 * Chaque hook cree un contexte d'animation porte par la ref fournie, et le
 * revoque au demontage. Toute animation creee a l'interieur — y compris par du
 * code appele indirectement — appartient a ce contexte et disparait avec lui.
 *
 * Sans cela, une animation continue de tourner apres le demontage de son
 * composant : elle ecrit dans un noeud detache, retient une reference sur
 * l'arbre React, et le seul symptome est une consommation memoire qui monte au
 * fil des navigations. C'est la fuite la plus courante d'une application
 * animee, et elle est invisible tant qu'on ne la cherche pas.
 *
 * ## Mouvement reduit
 *
 * Quand la politique neutralise le mouvement, la timeline est construite puis
 * **avancee immediatement a son etat final**. Elle n'est pas annulee : un
 * element qui devait apparaitre apparait, sans transition. C'est la regle du
 * moteur, appliquee ici plutot que dans chaque appelant.
 *
 * @module
 */

import gsap from 'gsap'
import { type DependencyList, type RefObject, useEffect, useRef } from 'react'

import { motionPolicy } from '../core/motion-policy.js'
import { registry } from '../core/registry.js'

/** Ce que recoit la fonction de construction. */
export interface TimelineSetup {
  /** Timeline a peupler. */
  readonly timeline: gsap.core.Timeline
  /** Contexte, pour enregistrer des animations hors timeline. */
  readonly context: gsap.Context
  /** Element racine, tel que fourni. */
  readonly element: Element
  /** `true` si le mouvement est neutralise. */
  readonly reduced: boolean
}

/** Options de {@link useTimeline}. */
export interface TimelineOptions {
  /** Nom affiche dans le panneau de diagnostic. */
  name?: string
  /** Reglages transmis a la timeline. */
  vars?: gsap.TimelineVars
  /**
   * Joue la timeline des sa construction.
   *
   * @defaultValue true
   */
  autoplay?: boolean
}

/** Ce que rend {@link useTimeline}. */
export interface TimelineHandle<T extends Element> {
  /** Ref a poser sur l'element racine. */
  readonly ref: RefObject<T | null>
  /** Timeline courante, ou `null` avant le montage. */
  readonly timeline: RefObject<gsap.core.Timeline | null>
}

/**
 * Cree une timeline dont la duree de vie suit celle du composant.
 *
 * @param build Construit l'animation. Appelee a chaque changement des
 *   dependances, apres revocation de la precedente.
 * @param deps Dependances, comme pour un effet.
 *
 * @example
 * const { ref } = useTimeline(
 *   ({ timeline }) => {
 *     timeline.from('.titre', { y: 24, opacity: 0 })
 *     timeline.from('.ligne', { scaleX: 0, stagger: 0.08 }, '-=0.2')
 *   },
 *   [],
 *   { name: 'entete' },
 * )
 *
 * return <header ref={ref}>...</header>
 */
export function useTimeline<T extends Element = HTMLElement>(
  build: (setup: TimelineSetup) => void,
  deps: DependencyList = [],
  options: TimelineOptions = {},
): TimelineHandle<T> {
  const ref = useRef<T | null>(null)
  const timeline = useRef<gsap.core.Timeline | null>(null)
  const buildRef = useRef(build)
  buildRef.current = build

  const { name = 'timeline', vars, autoplay = true } = options

  useEffect(() => {
    const element = ref.current
    if (element === null) return

    const reduced = motionPolicy.state.reduced

    // Le contexte capture tout ce qui est cree pendant l'appel, y compris par
    // du code qui ne sait rien de lui. Il est passe en argument : le lire depuis
    // la variable en cours d'affectation reviendrait a y acceder avant son
    // initialisation, la fonction de construction s'executant pendant l'appel.
    const context = gsap.context((self) => {
      const created = gsap.timeline({ paused: true, ...vars })
      timeline.current = created

      buildRef.current({ timeline: created, context: self, element, reduced })

      if (reduced) {
        // L'etat final, immediatement : neutraliser ne doit jamais faire
        // disparaitre un contenu.
        created.progress(1, true).pause()
        return
      }

      if (autoplay) created.play()
    }, element)

    const handle = registry.register({
      kind: 'timeline',
      name,
      dispose: () => context.revert(),
      detail: { reduced },
    })

    return () => {
      handle.release()
      context.revert()
      timeline.current = null
    }
    // Les dependances sont celles de l'appelant ; `build` est lu par ref pour
    // ne pas reconstruire l'animation a chaque rendu.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, name, autoplay])

  return { ref, timeline }
}

/** Options de {@link useTween}. */
export interface TweenOptions {
  /** Nom affiche dans le panneau de diagnostic. */
  name?: string
  /** Rejoue l'animation a chaque changement de cette valeur. */
  trigger?: unknown
}

/**
 * Anime un element unique, sans timeline.
 *
 * Raccourci pour le cas le plus frequent. La revocation au demontage et la
 * neutralisation sous mouvement reduit sont identiques a {@link useTimeline}.
 *
 * @example
 * const ref = useTween<HTMLDivElement>({ rotate: 360, duration: 2, repeat: -1 })
 */
export function useTween<T extends Element = HTMLElement>(
  vars: gsap.TweenVars,
  options: TweenOptions = {},
): RefObject<T | null> {
  const ref = useRef<T | null>(null)
  const varsRef = useRef(vars)
  varsRef.current = vars

  const { name = 'tween', trigger } = options

  useEffect(() => {
    const element = ref.current
    if (element === null) return

    const reduced = motionPolicy.state.reduced

    const context = gsap.context(() => {
      const tween = gsap.to(element, { ...varsRef.current })
      if (reduced) tween.progress(1, true).pause()
    }, element)

    const handle = registry.register({
      kind: 'timeline',
      name,
      dispose: () => context.revert(),
    })

    return () => {
      handle.release()
      context.revert()
    }
  }, [name, trigger])

  return ref
}

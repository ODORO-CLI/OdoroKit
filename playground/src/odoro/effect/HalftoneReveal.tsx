/**
 * Revelation en trame : des points serres se retractent au defilement.
 *
 * ## Un voile de points, pas un masque sur le contenu
 *
 * Comme le rideau par bandes, la trame est **posee par-dessus** : le contenu
 * est rendu normalement des la premiere image, et reste lisible par la
 * recherche dans la page comme par un lecteur d'ecran. Masquer le contenu
 * lui-meme le retirerait a ceux qui ne verront jamais l'effet.
 *
 * Le voile est un seul element, pas une grille : un degrade radial repete
 * dessine tous les points d'un coup. Une zone ordinaire en compterait plusieurs
 * milliers ; autant d'elements du document couteraient plus cher que tout le
 * reste de la page.
 *
 * ## Comment un point disparait
 *
 * A rayon nul, il n'y a rien. Au-dela de sept dixiemes du pas, les disques
 * voisins se recouvrent et le voile devient un aplat : c'est la que la trame
 * part, et elle fond jusqu'a zero. Entre les deux, on voit exactement ce qu'on
 * attend d'une trame d'imprimerie qui s'allege.
 *
 * ## Le defilement passe par la boucle, jamais par un rendu
 *
 * L'avancement est mesure dans la boucle unique du moteur et ecrit dans une
 * variable CSS. Le porter dans l'etat React rendrait la page a chaque cran de
 * molette, pour changer un rayon que le compositeur applique seul.
 *
 * Quand la trame a fini de se retirer, le voile quitte le DOM et l'abonnement
 * se retire : plus rien ne mesure, plus rien ne recouvre.
 *
 * Sous mouvement reduit, le voile n'est jamais rendu — c'est l'etat final.
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
  useState,
  type CSSProperties,
  type ReactElement,
  type ReactNode,
} from 'react'

/** Proprietes propres au composant. */
export interface HalftoneRevealOwnProps {
  /** Contenu revele. */
  children: ReactNode
  /** Pas de la trame, en pixels. @defaultValue 16 */
  cell?: number
  /**
   * Part de la hauteur de fenetre sur laquelle la revelation se joue.
   *
   * @defaultValue 0.55
   */
  travel?: number
  /** Retard avant le depart, en part de hauteur de fenetre. @defaultValue 0.15 */
  offset?: number
  /** Couleur de la trame. @defaultValue le fond du theme */
  color?: string
}

/** Toutes les proprietes. */
export type HalftoneRevealProps = Customisable<HalftoneRevealOwnProps>

/**
 * Rayon d'un point, en fraction du pas, quand le voile est encore plein.
 *
 * La moitie de la diagonale d'une cellule vaut environ 0,707 : au-dela, les
 * disques voisins se recouvrent et il ne reste aucun interstice. C'est le seul
 * rayon a partir duquel la trame cache reellement.
 */
const FULL_RADIUS = 0.72

/**
 * Revele son contenu par une trame qui s'allege au defilement.
 *
 * @example
 * <HalftoneReveal>
 *   <img src="/planche.jpg" alt="Planche du numero 12" />
 * </HalftoneReveal>
 *
 * @example
 * // Une trame large, qui part plus tot et se retire plus vite.
 * <HalftoneReveal cell={28} offset={0.05} travel={0.35}>
 *   <section className="o-p-8">…</section>
 * </HalftoneReveal>
 */
export function HalftoneReveal({
  children,
  cell = 16,
  travel = 0.55,
  offset = 0.15,
  color = 'var(--o-theme-bg, currentColor)',
  ...rest
}: HalftoneRevealProps): ReactElement {
  const { reduced } = useMotionState()
  const [host, setHost] = useState<HTMLDivElement | null>(null)
  const [veil, setVeil] = useState<HTMLDivElement | null>(null)
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (host === null || veil === null || reduced || done) return

    const pitch = Math.max(2, cell)
    let last = -1

    const subscription = clock.subscribe(
      () => {
        const box = host.getBoundingClientRect()
        const view = window.innerHeight || 1
        const span = Math.max(view * travel, 1)

        // Zero quand le haut de la zone touche le bas de la fenetre, un quand
        // il a remonte de `travel` hauteurs de fenetre — le retard decale le
        // depart vers l'interieur du champ.
        const progress = (view * (1 - offset) - box.top) / span
        const clamped = Math.min(1, Math.max(0, progress))
        if (Math.abs(clamped - last) < 0.005) return
        last = clamped

        veil.style.setProperty(
          '--o-halftone-radius',
          `${(FULL_RADIUS * pitch * (1 - clamped)).toFixed(2)}px`,
        )

        // Plus rien a cacher : le voile part, et la mesure avec lui.
        if (clamped >= 1) setDone(true)
      },
      { priority: CLOCK_PRIORITY.layout, name: 'trame de revelation' },
    )

    return () => subscription.unsubscribe()
  }, [host, veil, reduced, done, cell, travel, offset])

  const { className, style } = mergePresentation(
    { className: 'o-relative o-overflow-hidden' },
    rest,
  )

  const pitch = `${String(Math.max(2, cell))}px`

  return (
    <div {...rest} ref={setHost} className={className} style={style}>
      {children}
      {reduced || done ? null : (
        <div
          aria-hidden
          ref={setVeil}
          style={
            {
              position: 'absolute',
              inset: 0,
              pointerEvents: 'none',
              '--o-halftone-radius': `${(FULL_RADIUS * Math.max(2, cell)).toFixed(2)}px`,
              // Un seul degrade repete dessine toute la trame : le rayon est
              // la seule valeur qui bouge.
              backgroundImage: `radial-gradient(circle at center, ${color} var(--o-halftone-radius), transparent calc(var(--o-halftone-radius) + 0.5px))`,
              backgroundSize: `${pitch} ${pitch}`,
            } as CSSProperties
          }
        />
      )}
    </div>
  )
}

/**
 * Battage : les lettres partent des places les unes des autres, puis rentrent.
 *
 * ## Ce sont les places qui sont melangees, pas les caracteres
 *
 * `decode-text` remplace des caracteres par d'autres : le mot est faux, ses
 * lettres sont a leur place. Ici c'est l'inverse — les lettres sont les
 * bonnes, mais chacune commence a la place d'une autre, puis rejoint la
 * sienne. On ne lit jamais un mot faux : on voit un jeu de cartes se ranger.
 *
 * ## Les places sont mesurees, jamais calculees
 *
 * Un decalage devine a partir de la largeur moyenne d'un caractere se voit
 * tout de suite : le `i` et le `m` n'occupent pas la meme place, et les
 * lettres n'atterrissent pas. Les positions rendues sont donc relevees juste
 * avant de partir, et le decalage de depart est la difference entre deux
 * d'entre elles. Le battage reste juste quelle que soit la police, la casse
 * ou la cesure.
 *
 * ## L'etat melange n'est pose que si l'effet aura lieu
 *
 * Comme pour toute revelation du registre : cacher en CSS et montrer en
 * JavaScript laisserait un titre absent le jour ou le JavaScript ne vient
 * pas. L'etat de depart est ecrit par le meme code qui programme le retour —
 * et, au survol, il est porte par le retard de l'animation elle-meme.
 *
 * ## Le decoupage est un artifice d'affichage
 *
 * Le texte complet figure une fois, d'un seul tenant ; les lettres sont
 * retirees de l'arbre d'accessibilite.
 *
 * @module
 */

import { mergePresentation, useMotionState, type Customisable } from '@odoro-cli/engine'
import { useEffect, type ElementType, type ReactElement } from 'react'

import { useInView } from '@registre/hooks/useInView'

/** Ce qui declenche le battage. */
export type ShuffleDeclenchement = 'montage' | 'vue' | 'survol'

/** Proprietes propres au composant. */
export interface ShuffleOwnProps {
  /** Texte a battre. */
  children: string
  /** Balise rendue. @defaultValue 'span' */
  as?: ElementType
  /** Duree du retour d'une lettre, en millisecondes. @defaultValue 800 */
  duration?: number
  /** Retard entre deux lettres, en millisecondes. @defaultValue 35 */
  step?: number
  /** Inclinaison maximale au depart, en degres. @defaultValue 20 */
  tilt?: number
  /**
   * Quand battre.
   *
   * @defaultValue 'vue'
   */
  declenchement?: ShuffleDeclenchement
}

/** Toutes les proprietes. */
export type ShuffleProps = Customisable<ShuffleOwnProps, 'span'>

/** Espace insecable : une espace ordinaire s'ecrase dans un bloc en ligne. */
const NBSP = '\u00A0'

/** Identifiant de la feuille injectee. */
const STYLE_ID = 'o-shuffle'

/** Sortie franche puis amortie : la lettre se range, elle ne freine pas. */
const COURBE = 'cubic-bezier(0.16, 1, 0.3, 1)'

/** Pose les regles du battage, une fois par document. */
function ensureShuffleRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-shuffle]{display:inline-block}',
    '[data-o-shuffle-letter]{display:inline-block}',
  ].join('')
  document.head.append(style)
}

/**
 * Rend une permutation des indices, par melange de Fisher-Yates.
 *
 * Une permutation quelconque, pas un derangement : qu'une lettre ou deux
 * restent en place rend le battage plus credible qu'un deplacement force de
 * chacune.
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
 * Fait rentrer les lettres d'un texte depuis les places les unes des autres.
 *
 * @example
 * <Shuffle as="h1" className="o-text-5xl o-font-bold">
 *   Tout se range
 * </Shuffle>
 *
 * @example
 * // Rejoue a chaque survol, sans inclinaison.
 * <Shuffle declenchement="survol" tilt={0} duration={520}>Encore</Shuffle>
 */
export function Shuffle({
  children,
  as: Tag = 'span',
  duration = 800,
  step = 35,
  tilt = 20,
  declenchement = 'vue',
  ...rest
}: ShuffleProps): ReactElement {
  const { reduced } = useMotionState()
  const { ref, vu } = useInView<HTMLElement>({
    immediat: declenchement === 'montage',
  })

  ensureShuffleRule()

  useEffect(() => {
    const element = ref.current
    if (element === null || reduced) return

    const lettres = [
      ...element.querySelectorAll<HTMLElement>('[data-o-shuffle-letter]'),
    ]
    if (lettres.length === 0) return

    let animations: Animation[] = []

    const arreter = (): void => {
      for (const animation of animations) animation.cancel()
      animations = []
    }

    const jouer = (): void => {
      arreter()

      // Les places sont relevees maintenant : une police chargee entre-temps,
      // une largeur qui a change, et les anciennes seraient fausses.
      const places = lettres.map((lettre) => ({
        x: lettre.offsetLeft,
        y: lettre.offsetTop,
      }))
      const ordre = permutation(lettres.length)

      lettres.forEach((lettre, index) => {
        const ici = places[index]
        const ailleurs = places[ordre[index] ?? index]
        if (ici === undefined || ailleurs === undefined) return

        const angle = (Math.random() * 2 - 1) * tilt

        lettre.style.opacity = ''
        animations.push(
          lettre.animate(
            [
              {
                transform: `translate(${String(ailleurs.x - ici.x)}px, ${String(ailleurs.y - ici.y)}px) rotate(${String(angle)}deg)`,
                opacity: 0.25,
              },
              { transform: 'translate(0px, 0px) rotate(0deg)', opacity: 1 },
            ],
            { duration, delay: index * step, easing: COURBE, fill: 'both' },
          ),
        )
      })
    }

    if (declenchement === 'survol') {
      // Rien n'est cache d'avance : le retard de chaque animation porte
      // l'etat melange, et un titre jamais survole reste lisible.
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
      // L'etat de depart est ecrit ici, pas dans le rendu : voir l'en-tete.
      for (const lettre of lettres) lettre.style.opacity = '0'
      return
    }

    jouer()
    return () => {
      arreter()
      for (const lettre of lettres) lettre.style.opacity = ''
    }
  }, [ref, reduced, vu, children, duration, step, tilt, declenchement])

  const { className, style } = mergePresentation({}, rest)

  // Mouvement reduit : le texte est la, range, sans decoupage.
  if (reduced) {
    return (
      <Tag {...rest} className={className} style={style}>
        {children}
      </Tag>
    )
  }

  const lettres = [...children]

  return (
    <Tag {...rest} ref={ref} className={className} style={style} data-o-shuffle="">
      {/* Le texte complet, d'un seul tenant, pour les lecteurs d'ecran. */}
      <span className="o-sr-only">{children}</span>
      <span aria-hidden>
        {lettres.map((lettre, index) => (
          <span key={`${lettre}-${String(index)}`} data-o-shuffle-letter="">
            {/* Une espace ordinaire s'ecrase dans un bloc en ligne :
                l'insecable garde sa largeur. */}
            {lettre === ' ' ? NBSP : lettre}
          </span>
        ))}
      </span>
    </Tag>
  )
}

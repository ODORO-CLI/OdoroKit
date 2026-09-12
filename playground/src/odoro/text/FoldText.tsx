/**
 * Pliage : chaque lettre bascule vers l'avant, charniere en haut.
 *
 * ## Une charniere, pas une chute
 *
 * `falling-text` translate les lettres depuis le haut : elles arrivent de
 * l'exterieur. Ici rien ne se deplace — chaque lettre est un volet articule
 * sur son bord superieur, qui part presque a plat et se rabat. Sous une
 * perspective courte, la lettre se raccourcit puis retrouve sa hauteur, comme
 * un panneau qu'on deplie.
 *
 * C'est la perspective du conteneur qui fait tout : sans elle, une rotation
 * autour de l'axe X n'est qu'un ecrasement vertical.
 *
 * ## L'etat plie n'est pose que si l'effet aura lieu
 *
 * Le piege des revelations : cacher en CSS, montrer en JavaScript. Si le
 * JavaScript ne vient jamais, le titre reste invisible. L'etat plie est donc
 * ecrit par le meme code qui programme le depliage — et, au survol, il n'est
 * meme pas ecrit du tout : c'est l'animation elle-meme qui le porte, le temps
 * de son retard.
 *
 * ## Le decoupage est un artifice d'affichage
 *
 * Les lettres sont des elements pour recevoir chacune leur retard. Le texte
 * complet figure une fois, d'un seul tenant, et les lettres sont retirees de
 * l'arbre d'accessibilite.
 *
 * ## Mouvement reduit
 *
 * Aucun decoupage, aucune animation : le titre est rendu tel quel, deplie.
 * C'est l'etat d'arrivee.
 *
 * @module
 */

import { mergePresentation, useMotionState, type Customisable } from '@odoro-cli/engine'
import { useEffect, type CSSProperties, type ElementType, type ReactElement } from 'react'

import { useInView } from '@/odoro/hooks/useInView'

/** Ce qui declenche le depliage. */
export type FoldTextDeclenchement = 'montage' | 'vue' | 'survol'

/** Proprietes propres au composant. */
export interface FoldTextOwnProps {
  /** Texte a plier. */
  children: string
  /** Balise rendue. @defaultValue 'span' */
  as?: ElementType
  /** Duree du depliage d'une lettre, en millisecondes. @defaultValue 620 */
  duration?: number
  /** Retard entre deux lettres, en millisecondes. @defaultValue 40 */
  step?: number
  /** Distance de fuite, en pixels. Plus bas, plus marque. @defaultValue 420 */
  perspective?: number
  /**
   * Quand plier.
   *
   * `vue` attend l'entree dans le champ, `montage` part tout de suite,
   * `survol` rejoue a chaque entree du pointeur.
   *
   * @defaultValue 'vue'
   */
  declenchement?: FoldTextDeclenchement
}

/** Toutes les proprietes. */
export type FoldTextProps = Customisable<FoldTextOwnProps, 'span'>

/** Espace insecable : une espace ordinaire s'ecrase dans un bloc en ligne. */
const NBSP = '\u00A0'

/** Identifiant de la feuille injectee. */
const STYLE_ID = 'o-fold-text'

/**
 * Depart legerement au-dela de la verticale : un volet qui part exactement a
 * quatre-vingt-dix degres est invisible, et le depliage semble commencer dans
 * le vide. Deux degres de plus suffisent a le faire exister.
 */
const PLIE = 'rotateX(-98deg)'

/** Sortie franche puis amortie : le volet arrive, il ne s'arrete pas net. */
const COURBE = 'cubic-bezier(0.22, 1, 0.36, 1)'

/** Pose les regles du pliage, une fois par document. */
function ensureFoldRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-fold]{display:inline-block;perspective:var(--o-fold-fuite)}',
    // La charniere est le bord superieur de la lettre.
    '[data-o-fold-letter]{display:inline-block;transform-origin:50% 0%}',
  ].join('')
  document.head.append(style)
}

/**
 * Deplie un texte lettre a lettre, comme une suite de volets.
 *
 * @example
 * <FoldText as="h1" className="o-text-5xl o-font-bold">
 *   Ca se deplie
 * </FoldText>
 *
 * @example
 * // Rejoue a chaque survol, en cascade lente.
 * <FoldText declenchement="survol" step={90} duration={900}>Encore</FoldText>
 */
export function FoldText({
  children,
  as: Tag = 'span',
  duration = 620,
  step = 40,
  perspective = 420,
  declenchement = 'vue',
  ...rest
}: FoldTextProps): ReactElement {
  const { reduced } = useMotionState()
  const { ref, vu } = useInView<HTMLElement>({
    immediat: declenchement === 'montage',
  })

  ensureFoldRule()

  useEffect(() => {
    const element = ref.current
    if (element === null || reduced) return

    const lettres = [
      ...element.querySelectorAll<HTMLElement>('[data-o-fold-letter]'),
    ]
    if (lettres.length === 0) return

    let animations: Animation[] = []

    const arreter = (): void => {
      for (const animation of animations) animation.cancel()
      animations = []
    }

    const jouer = (): void => {
      arreter()
      lettres.forEach((lettre, index) => {
        lettre.style.opacity = ''
        animations.push(
          lettre.animate(
            [
              { transform: PLIE, opacity: 0 },
              { transform: 'rotateX(0deg)', opacity: 1 },
            ],
            { duration, delay: index * step, easing: COURBE, fill: 'both' },
          ),
        )
      })
    }

    if (declenchement === 'survol') {
      // Rien n'est cache d'avance : le retard de chaque animation porte lui-meme
      // l'etat plie, et un titre jamais survole reste donc parfaitement lisible.
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
      // L'etat plie est ecrit ici, pas dans le rendu : voir l'en-tete.
      for (const lettre of lettres) lettre.style.opacity = '0'
      return
    }

    jouer()
    return () => {
      arreter()
      for (const lettre of lettres) lettre.style.opacity = ''
    }
  }, [ref, reduced, vu, children, duration, step, declenchement])

  const { className, style } = mergePresentation({}, rest)

  // Mouvement reduit : le texte est la, deplie, sans decoupage.
  if (reduced) {
    return (
      <Tag {...rest} className={className} style={style}>
        {children}
      </Tag>
    )
  }

  const styleRacine = {
    ...style,
    '--o-fold-fuite': `${String(perspective)}px`,
  } as CSSProperties

  const lettres = [...children]

  return (
    <Tag {...rest} ref={ref} className={className} style={styleRacine} data-o-fold="">
      {/* Le texte complet, d'un seul tenant, pour les lecteurs d'ecran. */}
      <span className="o-sr-only">{children}</span>
      <span aria-hidden>
        {lettres.map((lettre, index) => (
          <span key={`${lettre}-${String(index)}`} data-o-fold-letter="">
            {/* Une espace ordinaire s'ecrase dans un bloc en ligne :
                l'insecable garde sa largeur. */}
            {lettre === ' ' ? NBSP : lettre}
          </span>
        ))}
      </span>
    </Tag>
  )
}

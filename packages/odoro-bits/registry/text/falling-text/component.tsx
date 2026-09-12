/**
 * Chute : chaque lettre tombe en place depuis le haut, avec un leger rebond.
 *
 * ## Un depassement, pas un rebond complet
 *
 * Une lettre qui tombe et s'arrete net a l'air posee ; une lettre qui rebondit
 * plusieurs fois a l'air de faire un numero. Entre les deux, une courbe qui
 * depasse une seule fois la ligne de base avant de s'y ranger — c'est le
 * profil « emphase » des systemes de mouvement, obtenu ici par un
 * `cubic-bezier` dont la sortie franchit 1.
 *
 * ## `element.animate`, arme par l'observateur
 *
 * L'effet ne se joue qu'a l'entree dans le champ. L'etat cache — les lettres
 * en opacite nulle — est pose par le meme code qui programme la chute : si ce
 * code ne tourne jamais, le texte est simplement la. Voir blur-reveal, qui a
 * essuye les platres de ce piege.
 *
 * ## Le decoupage est un artifice d'affichage
 *
 * Le texte est eclate en lettres pour que chacune recoive son delai. Le
 * conteneur porte donc le texte complet pour les lecteurs d'ecran, et les
 * lettres sont retirees de l'arbre d'accessibilite.
 *
 * @module
 */

import { mergePresentation, useMotionState, type Customisable } from '@odoro-cli/engine'
import { useEffect, useRef, type ElementType, type ReactElement } from 'react'

/** Proprietes propres au composant. */
export interface FallingTextOwnProps {
  /** Texte a faire tomber. */
  children: string
  /** Balise rendue. @defaultValue 'span' */
  as?: ElementType
  /** Delai entre deux lettres, en millisecondes. @defaultValue 45 */
  step?: number
  /** Hauteur de la chute, en em. @defaultValue 1.2 */
  drop?: number
  /**
   * Ne jouer qu'une fois.
   *
   * A `false`, la chute se rejoue a chaque retour dans le champ — a reserver
   * aux textes qu'on ne recroise pas par hasard.
   *
   * @defaultValue true
   */
  once?: boolean
}

/** Toutes les proprietes. */
export type FallingTextProps = Customisable<FallingTextOwnProps, 'span'>

/** Espace insecable : une espace ordinaire s'ecrase dans un bloc en ligne. */
const NBSP = '\u00A0'

/** Duree de la chute d'une lettre, en millisecondes. */
const FALL_MS = 550

/**
 * Sortie avec depassement : la lettre franchit sa ligne d'arrivee d'un cheveu,
 * puis s'y range. C'est le depassement qui donne le poids.
 */
const OVERSHOOT = 'cubic-bezier(0.34, 1.56, 0.64, 1)'

/**
 * Fait tomber un texte en place, lettre a lettre, a l'entree dans le champ.
 *
 * @example
 * <FallingText as="h1" className="o-text-5xl o-font-extrabold">
 *   Ca tombe bien
 * </FallingText>
 *
 * @example
 * // Une chute plus haute, rejouee a chaque passage.
 * <FallingText drop={2.5} once={false}>Encore</FallingText>
 */
export function FallingText({
  children,
  as: Tag = 'span',
  step = 45,
  drop = 1.2,
  once = true,
  ...rest
}: FallingTextProps): ReactElement {
  const { reduced } = useMotionState()
  const host = useRef<HTMLElement | null>(null)

  useEffect(() => {
    const element = host.current
    if (element === null || reduced) return

    const letters = element.querySelectorAll<HTMLElement>('[data-o-fall-letter]')
    if (letters.length === 0) return

    // L'etat cache est pose ici, pas dans le rendu : sans ce code, le texte
    // reste visible. Voir l'en-tete du module.
    for (const letter of letters) {
      letter.style.opacity = '0'
    }

    let animations: Animation[] = []

    const play = (): void => {
      for (const animation of animations) animation.cancel()
      animations = []

      letters.forEach((letter, index) => {
        letter.style.opacity = ''
        animations.push(
          letter.animate(
            [
              { transform: `translateY(${String(-drop)}em)`, opacity: 0 },
              { transform: 'translateY(0)', opacity: 1 },
            ],
            {
              duration: FALL_MS,
              delay: index * step,
              easing: OVERSHOOT,
              fill: 'both',
            },
          ),
        )
      })
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.every((entry) => !entry.isIntersecting)) return
        play()
        if (once) observer.disconnect()
      },
      { threshold: 0.4 },
    )

    observer.observe(element)
    return () => {
      observer.disconnect()
      for (const animation of animations) animation.cancel()
      for (const letter of letters) {
        letter.style.opacity = ''
      }
    }
  }, [reduced, children, step, drop, once])

  const { className, style } = mergePresentation({}, rest)

  // Mouvement reduit : le texte est la, entier, sans decoupage.
  if (reduced) {
    return (
      <Tag {...rest} className={className} style={style}>
        {children}
      </Tag>
    )
  }

  const letters = [...children]

  return (
    <Tag {...rest} ref={host} className={className} style={style}>
      {/* Le texte complet, d'un seul tenant, pour les lecteurs d'ecran. */}
      <span className="o-sr-only">{children}</span>
      <span aria-hidden>
        {letters.map((letter, index) => (
          <span
            key={`${letter}-${String(index)}`}
            data-o-fall-letter=""
            style={{ display: 'inline-block' }}
          >
            {/* Une espace ordinaire s'ecrase dans un bloc en ligne :
                l'insecable garde sa largeur. */}
            {letter === ' ' ? NBSP : letter}
          </span>
        ))}
      </span>
    </Tag>
  )
}

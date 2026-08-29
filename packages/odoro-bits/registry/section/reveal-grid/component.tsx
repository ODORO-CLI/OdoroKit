/**
 * Grille revelee en cascade.
 *
 * ## Pourquoi des transitions CSS et pas une timeline
 *
 * Chaque element fait le meme trajet, decale dans le temps. C'est exactement ce
 * qu'une transition CSS avec un delai sait faire, et le compositeur du
 * navigateur s'en charge seul : aucun JavaScript ne s'execute pendant
 * l'animation.
 *
 * Une timeline apporterait le controle du milieu de course — une pause, un
 * retour arriere, un enchainement. Rien de tout cela n'est utile ici, et le
 * prix serait un orchestrateur charge pour deplacer six cartes une fois.
 *
 * ## Le declenchement, et ce qu'il ne doit pas casser
 *
 * L'observateur d'intersection ne pose l'attribut qu'une fois, puis se
 * deconnecte. Rejouer la cascade a chaque passage donne une page qui
 * s'agite quand on remonte, ce qui est fatigant plus qu'elegant — d'ou
 * `once` par defaut.
 *
 * Et l'etat de depart n'est pose que si l'animation va vraiment avoir lieu.
 * Sous mouvement reduit, les elements sont simplement la : une cascade
 * neutralisee qui laisserait la grille invisible serait un defaut
 * d'accessibilite, pas un respect de la preference.
 *
 * @module
 */

import { mergePresentation, useMotionState, type Customisable } from '@odoro-cli/engine'
import {
  Children,
  useEffect,
  useState,
  type CSSProperties,
  type ReactElement,
  type ReactNode,
} from 'react'

/** Proprietes propres au composant. */
export interface RevealGridOwnProps {
  /** Les elements de la grille. */
  children: ReactNode
  /** Colonnes au-dela du palier moyen. @defaultValue 3 */
  columns?: number
  /** Decalage entre deux elements, en millisecondes. @defaultValue 70 */
  stagger?: number
  /** Hauteur de la montee, en pixels. @defaultValue 24 */
  distance?: number
  /** Ne rejoue pas quand la section repasse dans le champ. @defaultValue true */
  once?: boolean
}

/** Toutes les proprietes. */
export type RevealGridProps = Customisable<RevealGridOwnProps>

/** Identifiant de la feuille injectee. */
const STYLE_ID = 'o-reveal-grid'

/**
 * Pose l'etat de depart et l'arrivee, une fois par document.
 *
 * L'etat de depart doit s'appliquer avant le premier rendu peint : le poser
 * depuis JavaScript laisserait une image ou la grille apparait en entier avant
 * de disparaitre pour se recomposer.
 */
function ensureRevealRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-reveal-grid] > *{',
    'opacity:0;transform:translateY(var(--o-reveal-distance));',
    'transition:opacity var(--o-duration-slow) var(--o-ease-entrance),',
    'transform var(--o-duration-slow) var(--o-ease-entrance);',
    'transition-delay:var(--o-reveal-delay)}',
    '[data-o-reveal-grid-shown] > *{opacity:1;transform:none}',
    // Le nombre de colonnes passe par une variable : une regle par valeur
    // possible serait soit incomplete, soit interminable, et un `style` pose
    // dans le composant s'appliquerait a toutes les grilles de la page.
    '@media (min-width:48rem){[data-o-reveal-grid]{grid-template-columns:repeat(var(--o-reveal-columns),minmax(0,1fr))}}',
    '@media (prefers-reduced-motion:reduce){',
    '[data-o-reveal-grid] > *{opacity:1;transform:none;transition:none}}',
  ].join('')
  document.head.append(style)
}

/**
 * Revele une grille en cascade.
 *
 * @example
 * <RevealGrid columns={3} stagger={60}>
 *   {projets.map((projet) => (
 *     <article key={projet.id}>…</article>
 *   ))}
 * </RevealGrid>
 */
export function RevealGrid({
  children,
  columns = 3,
  stagger = 70,
  distance = 24,
  once = true,
  ...rest
}: RevealGridProps): ReactElement {
  const { reduced } = useMotionState()
  const [host, setHost] = useState<HTMLElement | null>(null)
  ensureRevealRule()

  useEffect(() => {
    if (host === null || reduced) return

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            host.setAttribute('data-o-reveal-grid-shown', '')
            if (once) observer.disconnect()
          } else if (!once) {
            host.removeAttribute('data-o-reveal-grid-shown')
          }
        }
      },
      { threshold: 0.15 },
    )

    observer.observe(host)
    return () => observer.disconnect()
  }, [host, once, reduced])

  const { className, style } = mergePresentation(
    { className: 'o-grid o-grid-cols-1 sm:o-grid-cols-2 o-gap-4' },
    rest,
  )

  return (
    <div
      {...rest}
      ref={setHost}
      className={className}
      style={
        {
          ...style,
          '--o-reveal-distance': `${String(distance)}px`,
          '--o-reveal-columns': String(columns),
        } as CSSProperties
      }
      data-o-reveal-grid={reduced ? undefined : ''}
    >
      {Children.map(children, (child, index) => (
        <div
          style={{ '--o-reveal-delay': `${String(index * stagger)}ms` } as CSSProperties}
        >
          {child}
        </div>
      ))}
    </div>
  )
}

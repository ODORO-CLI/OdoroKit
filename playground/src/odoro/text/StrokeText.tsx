/**
 * Contour : un texte en fil de fer dont le remplissage monte du bas.
 *
 * ## Deux copies superposees, aucune n'attend l'autre
 *
 * Le texte reel est rendu en contour — `-webkit-text-stroke`, remplissage
 * transparent. Une copie pleine, posee dessus et cachee a l'arbre
 * d'accessibilite, est revelee par un `clip-path` anime qui remonte : le
 * remplissage semble se verser dans les lettres.
 *
 * Le contour n'est qu'un habillage : pour un lecteur d'ecran, le texte de
 * base est un texte ordinaire, il n'y a rien a compenser.
 *
 * ## L'etat cache n'est pose que si la revelation aura lieu
 *
 * La copie pleine n'est clipee que par le code qui programme sa revelation.
 * Si ce code ne tourne jamais — erreur, environnement sans script — le texte
 * apparait rempli, c'est-a-dire dans son etat final : un effet qui ne joue
 * pas vaut toujours mieux qu'un titre ampute.
 *
 * @module
 */

import { mergePresentation, useMotionState, type Customisable } from '@odoro-cli/engine'
import {
  useEffect,
  useRef,
  type CSSProperties,
  type ElementType,
  type ReactElement,
} from 'react'

/** Proprietes propres au composant. */
export interface StrokeTextOwnProps {
  /** Texte a remplir. */
  children: string
  /** Balise rendue. @defaultValue 'span' */
  as?: ElementType
  /** Epaisseur du contour, en pixels. @defaultValue 1.5 */
  strokeWidth?: number
  /** Duree de la montee, en millisecondes. @defaultValue 900 */
  duration?: number
  /** Couleur du contour. @defaultValue brand-300 de la palette */
  contour?: string
  /** Couleur du remplissage. @defaultValue brand-500 de la palette */
  remplissage?: string
}

/** Toutes les proprietes. */
export type StrokeTextProps = Customisable<StrokeTextOwnProps, 'span'>

/** Clip qui cache tout : l'inset du haut couvre la hauteur entiere. */
const HIDDEN_CLIP = 'inset(100% 0 0 0)'

/**
 * Remplit un texte en contour, du bas vers le haut, a l'entree dans le champ.
 *
 * @example
 * <StrokeText as="h1" className="o-text-5xl o-font-extrabold">
 *   MASSIF
 * </StrokeText>
 *
 * @example
 * // Contour epais, montee lente.
 * <StrokeText strokeWidth={3} duration={1800}>Grand titre</StrokeText>
 */
export function StrokeText({
  children,
  as: Tag = 'span',
  strokeWidth = 1.5,
  duration = 900,
  contour = 'var(--o-palette-brand-300)',
  remplissage = 'var(--o-palette-brand-500)',
  ...rest
}: StrokeTextProps): ReactElement {
  const { reduced } = useMotionState()
  const layer = useRef<HTMLSpanElement | null>(null)
  const host = useRef<HTMLElement | null>(null)

  useEffect(() => {
    const element = host.current
    const copy = layer.current
    if (element === null || copy === null || reduced) return

    // L'etat cache est pose ici, pas dans le rendu : sans ce code, le texte
    // apparait rempli. Voir l'en-tete du module.
    copy.style.clipPath = HIDDEN_CLIP

    let played = false
    let animation: Animation | undefined

    const observer = new IntersectionObserver(
      (entries) => {
        if (played || entries.every((entry) => !entry.isIntersecting)) return
        played = true
        observer.disconnect()

        copy.style.clipPath = ''
        animation = copy.animate(
          [{ clipPath: HIDDEN_CLIP }, { clipPath: 'inset(0 0 0 0)' }],
          {
            duration,
            easing: 'cubic-bezier(0.2, 0, 0, 1)',
            fill: 'both',
          },
        )
      },
      { threshold: 0.4 },
    )

    observer.observe(element)
    return () => {
      observer.disconnect()
      animation?.cancel()
      copy.style.clipPath = ''
    }
  }, [reduced, children, duration])

  const { className, style } = mergePresentation({}, rest)

  // Mouvement reduit : le texte est la, rempli — son etat final, sans copie.
  if (reduced) {
    return (
      <Tag {...rest} className={className} style={{ color: remplissage, ...style }}>
        {children}
      </Tag>
    )
  }

  const outlineStyle = {
    WebkitTextStroke: `${String(strokeWidth)}px ${contour}`,
    WebkitTextFillColor: 'transparent',
  } as CSSProperties

  return (
    <Tag
      {...rest}
      ref={host}
      className={className}
      style={{ position: 'relative', display: 'inline-block', ...style }}
    >
      <span style={outlineStyle}>{children}</span>
      {/* La copie pleine, revelee par le clip. Cachee aux lecteurs d'ecran :
          pour eux, il n'y a qu'un texte. */}
      <span
        ref={layer}
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          color: remplissage,
          pointerEvents: 'none',
          userSelect: 'none',
        }}
      >
        {children}
      </span>
    </Tag>
  )
}

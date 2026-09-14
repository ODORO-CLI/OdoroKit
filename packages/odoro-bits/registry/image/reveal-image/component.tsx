/**
 * Image revelee : un rideau s'ouvre a l'entree dans le champ, pendant que
 * l'image revient d'un leger zoom.
 *
 * ## Deux mouvements, deux calques
 *
 * Le rideau est un `clip-path` sur un voile intermediaire ; le zoom est une
 * transformation sur l'image elle-meme. Les poser sur le meme element
 * obligerait a les exprimer dans une seule propriete, et l'un des deux
 * disparaitrait. Separes, chacun a sa transition, et le navigateur compose.
 *
 * Le decoupage plutot qu'une opacite : une image qui s'ouvre a un bord, une
 * image qui fond n'en a pas. C'est le bord qui donne l'impression qu'on
 * decouvre quelque chose qui etait deja la — renforcee par le zoom inverse,
 * qui part de plus pres et se pose.
 *
 * ## Le declenchement s'ouvre en cas de doute
 *
 * L'observation vient du crochet `useInView`, qui rend « vu » immediatement
 * quand l'observation est impossible. Le defaut inverse serait le pire : une
 * image jamais revelee est une image absente.
 *
 * ## Sous mouvement reduit
 *
 * L'image est visible d'emblee, sans rideau ni zoom : la revelation est un
 * geste d'entree, pas un contenu.
 *
 * @module
 */

import { mergePresentation, useMotionState, type Customisable } from '@odoro-cli/engine'
import type { CSSProperties, ReactElement } from 'react'

import { useInView } from '@registre/hooks/useInView'

/** Proprietes propres au composant. */
export interface RevealImageOwnProps {
  /** Source de l'image. */
  src: string
  /** Texte de remplacement. Chaine vide si l'image est purement decorative. */
  alt: string
  /** Rapport largeur sur hauteur. @defaultValue 1.777 */
  ratio?: number
  /** Sens de l'ouverture du rideau. @defaultValue 'up' */
  direction?: 'up' | 'left'
  /** Duree de la revelation, en millisecondes. @defaultValue 900 */
  duration?: number
}

/** Toutes les proprietes : les siennes, plus celles d'une image. */
export type RevealImageProps = Customisable<RevealImageOwnProps, 'img'>

/**
 * Revele une image a son entree dans le champ.
 *
 * @example
 * <RevealImage src="/photo.jpg" alt="Vue de l atelier" />
 *
 * @example
 * // Ouverture laterale, plus lente.
 * <RevealImage src="/photo.jpg" alt="" direction="left" duration={1200} />
 */
export function RevealImage({
  src,
  alt,
  ratio = 1.777,
  direction = 'up',
  duration = 900,
  ...rest
}: RevealImageProps): ReactElement {
  const { reduced } = useMotionState()
  const { ref, vu } = useInView<HTMLDivElement>({ amount: 0.35 })

  // Sous mouvement reduit, l'etat final est le seul etat.
  const shown = vu || reduced

  const { className, style } = mergePresentation(
    { className: 'o-relative o-overflow-hidden' },
    rest,
  )

  // Le rideau part du bord oppose au sens de l'ouverture : « up » decouvre du
  // bas vers le haut, « left » de la gauche vers la droite.
  const closed = direction === 'up' ? 'inset(100% 0 0 0)' : 'inset(0 100% 0 0)'

  const veil: CSSProperties = {
    clipPath: shown ? 'inset(0 0 0 0)' : closed,
    transition: reduced
      ? undefined
      : `clip-path ${String(duration)}ms var(--o-ease-entrance)`,
  }

  const image: CSSProperties = {
    transform: shown ? 'scale(1)' : 'scale(1.15)',
    transition: reduced
      ? undefined
      : `transform ${String(duration)}ms var(--o-ease-entrance)`,
  }

  return (
    <div ref={ref} className={className} style={{ ...style, aspectRatio: String(ratio) }}>
      <div className="o-absolute o-inset-0" style={veil}>
        <img
          {...rest}
          src={src}
          alt={alt}
          className="o-size-full o-object-cover o-will-change-transform"
          style={image}
        />
      </div>
    </div>
  )
}

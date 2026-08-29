/**
 * Cadre d'image : rapport fige, chargement couvert, revelation en douceur.
 *
 * ## Le rapport est pose avant l'image
 *
 * Une image sans dimensions declarees occupe zero pixel jusqu'a son
 * chargement, puis pousse brutalement tout ce qui la suit. C'est le decalage
 * de mise en page le plus courant du web, et il est entierement evitable : le
 * cadre reserve la place des le premier rendu, a partir du seul rapport.
 *
 * ## La revelation n'est pas un ornement
 *
 * Entre le moment ou la place est reservee et celui ou l'image arrive, il y a
 * un rectangle vide. Le laisser tel quel donne une page trouee ; y poser une
 * silhouette dit qu'il se passe quelque chose. Le fondu, lui, evite le
 * clignotement d'une apparition seche.
 *
 * ## Ce qui n'est pas fait ici
 *
 * Ni miniature floue, ni jeu de sources : cela demande une chaine de
 * traitement d'images que ce composant n'a pas a decider. `srcSet` et `sizes`
 * passent par le passe-plat et arrivent tels quels sur la balise.
 *
 * @module
 */

import { mergePresentation, useMotionState, type Customisable } from '@odoro/engine'
import { useState, type CSSProperties, type ReactElement } from 'react'

/** Identifiant de la feuille injectee. */
const STYLE_ID = 'o-frame'

/**
 * Pose la regle d'agrandissement, une fois par document.
 *
 * Elle ne peut pas etre un style en ligne : elle depend du survol du cadre,
 * pas de celui de l'image.
 */
function ensureFrameRule() {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent =
    '[data-o-frame-zoom]:hover img{transform:scale(var(--o-frame-zoom))}'
  document.head.append(style)
}

/** Proprietes propres au composant. */
export interface FrameOwnProps {
  /** Source de l'image. */
  src: string
  /** Texte de remplacement. Chaine vide si l'image est purement decorative. */
  alt: string
  /** Rapport largeur sur hauteur. @defaultValue 1.777 */
  ratio?: number
  /** Ajustement dans le cadre. @defaultValue 'cover' */
  fit?: 'cover' | 'contain'
  /** Agrandissement au survol, de 0 a 0.3. @defaultValue 0 */
  zoom?: number
}

/** Toutes les proprietes : les siennes, plus celles d'une image. */
export type FrameProps = Customisable<FrameOwnProps, 'img'>

/**
 * Encadre une image.
 *
 * @example
 * <Frame src="/photo.jpg" alt="Vue de l atelier" ratio={16 / 9} zoom={0.06} />
 *
 * @example
 * // Le passe-plat porte ce que le composant n a pas a decider.
 * <Frame
 *   src="/photo.jpg"
 *   alt=""
 *   srcSet="/photo-800.jpg 800w, /photo-1600.jpg 1600w"
 *   sizes="(min-width: 60rem) 50vw, 100vw"
 *   loading="lazy"
 * />
 */
export function Frame({
  src,
  alt,
  ratio = 1.777,
  fit = 'cover',
  zoom = 0,
  ...rest
}: FrameProps): ReactElement {
  const { reduced } = useMotionState()
  const [loaded, setLoaded] = useState(false)
  ensureFrameRule()

  const { className, style } = mergePresentation(
    { className: 'o-relative o-overflow-hidden' },
    rest,
  )

  const image: CSSProperties = {
    objectFit: fit,
    opacity: loaded ? 1 : 0,
    transform: loaded || reduced ? undefined : 'scale(1.02)',
    transition: reduced
      ? undefined
      : 'opacity var(--o-duration-slow) var(--o-ease-entrance), transform var(--o-duration-slow) var(--o-ease-entrance)',
  }

  return (
    <div
      className={className}
      style={{ ...style, aspectRatio: String(ratio) }}
      // Le survol agrandit l'image, pas le cadre : sans quoi la mise en page
      // bougerait, ce que le rapport fige existe justement pour empecher.
      data-o-frame-zoom={zoom > 0 && !reduced ? '' : undefined}
    >
      {loaded ? null : (
        <div
          className="o-absolute o-inset-0 o-bg-zinc-100 dark:o-bg-zinc-900 o-animate-shimmer"
          aria-hidden
        />
      )}

      <img
        {...rest}
        src={src}
        alt={alt}
        onLoad={() => setLoaded(true)}
        className="o-size-full o-transition-transform"
        style={{
          ...image,
          ...(zoom > 0 && !reduced ? { '--o-frame-zoom': String(1 + zoom) } : {}),
        }}
      />
    </div>
  )
}

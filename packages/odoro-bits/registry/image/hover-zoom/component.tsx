/**
 * Zoom au survol : l'image grossit dans son cadre et regarde vers le pointeur.
 *
 * ## Le cadre ne bouge jamais
 *
 * Le zoom s'applique a l'image, pas a son cadre : le rapport est fige par
 * `aspect-ratio` et le debordement est coupe. Agrandir le cadre lui-meme
 * pousserait la mise en page a chaque survol, ce qui transforme une caresse
 * en secousse.
 *
 * ## Le suivi du pointeur passe par l'origine de transformation
 *
 * Deplacer l'image en `translate` demanderait de calculer une amplitude qui
 * depend du zoom pour ne jamais decouvrir le fond. Deplacer l'**origine** de
 * la transformation donne le meme effet — la region survolee vient vers le
 * pointeur — et la geometrie garantit seule que l'image couvre toujours son
 * cadre. L'origine est ecrite en variables CSS depuis l'evenement, sans aucun
 * rendu React : le navigateur interpole le reste.
 *
 * ## Sous mouvement reduit
 *
 * L'image reste a l'echelle un et l'origine ne bouge pas : le composant ne
 * pose ni attribut, ni ecouteur. Un zoom decoratif n'a pas d'information a
 * preserver.
 *
 * @module
 */

import { mergePresentation, useMotionState, type Customisable } from '@odoro-cli/engine'
import { useRef, type CSSProperties, type ReactElement } from 'react'

/** Identifiant de la feuille injectee. */
const STYLE_ID = 'o-hover-zoom'

/**
 * Pose les regles du zoom, une fois par document.
 *
 * Elles ne peuvent pas etre des styles en ligne : l'agrandissement depend du
 * survol du cadre, pas de celui de l'image.
 */
function ensureHoverZoomRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-hover-zoom] img{',
    'transform-origin:var(--o-hz-x) var(--o-hz-y);',
    // L'origine est lissee d'un cran plus court que le zoom : brute, chaque
    // evenement de pointeur ferait sauter la region agrandie.
    'transition:transform var(--o-hz-duration) var(--o-ease-standard),',
    'transform-origin var(--o-duration-base) linear;',
    '}',
    '[data-o-hover-zoom]:hover img,[data-o-hover-zoom]:focus-within img{',
    'transform:scale(var(--o-hz-zoom));',
    '}',
  ].join('')
  document.head.append(style)
}

/** Proprietes propres au composant. */
export interface HoverZoomOwnProps {
  /** Source de l'image. */
  src: string
  /** Texte de remplacement. Chaine vide si l'image est purement decorative. */
  alt: string
  /** Rapport largeur sur hauteur. @defaultValue 1.777 */
  ratio?: number
  /** Echelle atteinte au survol, de 1.05 a 1.6. @defaultValue 1.15 */
  zoom?: number
  /** Duree de l'agrandissement, en millisecondes. @defaultValue 480 */
  duration?: number
}

/** Toutes les proprietes : les siennes, plus celles d'une image. */
export type HoverZoomProps = Customisable<HoverZoomOwnProps, 'img'>

/**
 * Zoome une image au survol, vers le pointeur.
 *
 * @example
 * <HoverZoom src="/photo.jpg" alt="Vue de l atelier" zoom={1.2} />
 *
 * @example
 * // Dans une carte cliquable : le focus du lien declenche aussi le zoom.
 * <a href="/projet">
 *   <HoverZoom src="/photo.jpg" alt="" className="o-rounded-lg" />
 * </a>
 */
export function HoverZoom({
  src,
  alt,
  ratio = 1.777,
  zoom = 1.15,
  duration = 480,
  ...rest
}: HoverZoomProps): ReactElement {
  const { reduced } = useMotionState()
  const host = useRef<HTMLDivElement | null>(null)
  ensureHoverZoomRule()

  const { className, style } = mergePresentation(
    { className: 'o-relative o-overflow-hidden' },
    rest,
  )

  const hostStyle = {
    ...style,
    aspectRatio: String(ratio),
    '--o-hz-zoom': String(Math.min(1.6, Math.max(1.05, zoom))),
    '--o-hz-duration': `${String(duration)}ms`,
    '--o-hz-x': '50%',
    '--o-hz-y': '50%',
  } as CSSProperties

  return (
    <div
      ref={host}
      className={className}
      style={hostStyle}
      data-o-hover-zoom={reduced ? undefined : ''}
      onPointerMove={
        reduced
          ? undefined
          : (event) => {
              // L'origine suit le pointeur en pourcentage du cadre : aucun
              // etat React, le navigateur interpole entre deux ecritures.
              const box = event.currentTarget.getBoundingClientRect()
              const x = ((event.clientX - box.left) / Math.max(box.width, 1)) * 100
              const y = ((event.clientY - box.top) / Math.max(box.height, 1)) * 100
              event.currentTarget.style.setProperty('--o-hz-x', `${x.toFixed(1)}%`)
              event.currentTarget.style.setProperty('--o-hz-y', `${y.toFixed(1)}%`)
            }
      }
      onPointerLeave={
        reduced
          ? undefined
          : (event) => {
              // Retour au centre : sans cela, le prochain survol partirait de
              // la derniere position connue, un bord au hasard.
              event.currentTarget.style.setProperty('--o-hz-x', '50%')
              event.currentTarget.style.setProperty('--o-hz-y', '50%')
            }
      }
    >
      <img
        {...rest}
        src={src}
        alt={alt}
        className="o-size-full o-object-cover o-will-change-transform"
      />
    </div>
  )
}

/**
 * Loupe : un disque suit le pointeur et montre l'image agrandie a l'endroit
 * survole, le reste du cadre restant intact.
 *
 * ## Ce qui la distingue du zoom au survol
 *
 * Le zoom au survol agrandit toute l'image dans son cadre : on perd la vue
 * d'ensemble pour gagner du detail. La loupe fait l'inverse — le cadre garde
 * sa vue d'ensemble, et le detail n'existe que dans le disque. C'est l'outil
 * d'une planche, d'une carte, d'une photo de produit : on inspecte sans
 * perdre le contexte.
 *
 * ## Le disque montre la meme image, pas une copie
 *
 * Le fond du disque est la meme source que l'element `img` : le navigateur ne
 * telecharge rien de plus, les deux calques partagent l'entree de cache. Ce
 * qui change est l'echelle et l'origine du fond, ecrites en variables CSS
 * depuis l'evenement de pointeur — aucun rendu React pendant le geste.
 *
 * ## Pourquoi la taille naturelle est relue a chaque deplacement
 *
 * L'image est cadree en `cover` : son echelle a l'ecran depend de ses
 * proportions naturelles autant que de celles du cadre. Sans elles, le disque
 * montrerait une image etiree, decalee de la vraie des que les deux rapports
 * different. Deux lectures de propriete par evenement coutent moins qu'un
 * etat React, et restent justes apres un changement de source.
 *
 * ## Au doigt, et sous mouvement reduit
 *
 * Sur un ecran tactile il n'y a pas de survol : une loupe qui n'apparait
 * qu'au toucher, sous le doigt qui la cache, ne sert personne — les
 * evenements tactiles sont donc ignores. Sous mouvement reduit, l'image reste
 * nette et entiere, sans disque ni ecouteur.
 *
 * @module
 */

import { mergePresentation, useMotionState, type Customisable } from '@odoro-cli/engine'
import {
  useRef,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  type ReactElement,
} from 'react'

/** Identifiant de la feuille injectee. */
const STYLE_ID = 'o-lens-zoom'

/**
 * Pose les regles de la loupe, une fois par document.
 *
 * Elles ne peuvent pas etre des styles en ligne : l'apparition du disque
 * depend du survol du cadre, pas du disque lui-meme.
 */
function ensureLensRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-lz-glass]{',
    'position:absolute;left:0;top:0;box-sizing:border-box;pointer-events:none;',
    'width:var(--o-lz-size);height:var(--o-lz-size);border-radius:9999px;',
    // Le disque est place par une transformation : elle ne declenche ni
    // reflux ni repeinture du cadre, contrairement a `left` et `top`.
    'transform:translate3d(var(--o-lz-x),var(--o-lz-y),0);',
    'background-image:var(--o-lz-src);background-repeat:no-repeat;',
    'background-size:var(--o-lz-bs);background-position:var(--o-lz-bx) var(--o-lz-by);',
    'border:1px solid var(--o-theme-line);box-shadow:var(--o-shadow-lg);',
    'opacity:0;transition:opacity var(--o-duration-base) var(--o-ease-standard);',
    '}',
    '[data-o-lens-actif] [data-o-lz-glass]{opacity:1}',
  ].join('')
  document.head.append(style)
}

/** Proprietes propres au composant. */
export interface LensZoomOwnProps {
  /** Source de l'image. */
  src: string
  /** Texte de remplacement. Chaine vide si l'image est purement decorative. */
  alt: string
  /** Rapport largeur sur hauteur du cadre. @defaultValue 1.777 */
  ratio?: number
  /**
   * Grossissement dans le disque.
   *
   * Au-dela de quatre, une photo ordinaire montre surtout ses pixels.
   *
   * @defaultValue 2.5
   */
  zoom?: number
  /** Diametre du disque, en pixels. @defaultValue 180 */
  size?: number
}

/** Toutes les proprietes : les siennes, plus celles d'une image. */
export type LensZoomProps = Customisable<LensZoomOwnProps, 'img'>

/**
 * Promene une loupe sur une image.
 *
 * @example
 * <LensZoom src="/planche.jpg" alt="Planche de detail" />
 *
 * @example
 * // Un disque plus petit et plus fort, pour une carte.
 * <LensZoom src="/carte.png" alt="Carte du reseau" zoom={4} size={140} />
 */
export function LensZoom({
  src,
  alt,
  ratio = 1.777,
  zoom = 2.5,
  size = 180,
  ...rest
}: LensZoomProps): ReactElement {
  const { reduced } = useMotionState()
  const picture = useRef<HTMLImageElement | null>(null)
  ensureLensRule()

  const grossissement = Math.min(6, Math.max(1.2, zoom))
  const diametre = Math.max(60, size)

  const { className, style } = mergePresentation(
    { className: 'o-relative o-overflow-hidden' },
    rest,
  )

  const hostStyle = {
    ...style,
    aspectRatio: String(ratio),
    // Les guillemets de la source sont neutralises : une apostrophe double
    // dans un nom de fichier fermerait la fonction `url`.
    '--o-lz-src': `url("${src.replaceAll('"', '%22')}")`,
    '--o-lz-size': `${String(diametre)}px`,
    '--o-lz-x': '0px',
    '--o-lz-y': '0px',
    '--o-lz-bs': 'auto',
    '--o-lz-bx': '0px',
    '--o-lz-by': '0px',
  } as CSSProperties

  /** Place le disque et son fond sous le pointeur. */
  const suivre = (event: ReactPointerEvent<HTMLDivElement>): void => {
    // Voir l'en-tete : le doigt cacherait ce que la loupe montre.
    if (event.pointerType !== 'mouse' && event.pointerType !== 'pen') return

    const frame = event.currentTarget
    const box = frame.getBoundingClientRect()
    const x = event.clientX - box.left
    const y = event.clientY - box.top

    const image = picture.current
    // Tant que l'image n'a pas de taille naturelle, le cadre lui-meme sert de
    // reference : le disque est alors legerement etire, jamais absent.
    const nw = image !== null && image.naturalWidth > 0 ? image.naturalWidth : box.width
    const nh =
      image !== null && image.naturalHeight > 0 ? image.naturalHeight : box.height

    // Echelle du cadrage `cover`, puis origine de l'image affichee : ce sont
    // exactement les nombres que le navigateur applique a l'element `img`.
    const cover = Math.max(box.width / Math.max(nw, 1), box.height / Math.max(nh, 1))
    const ox = (box.width - nw * cover) / 2
    const oy = (box.height - nh * cover) / 2

    // Point de l'image, en pixels naturels, sous le pointeur.
    const u = (x - ox) / Math.max(cover, 0.0001)
    const v = (y - oy) / Math.max(cover, 0.0001)

    const echelle = cover * grossissement
    frame.style.setProperty('--o-lz-x', `${(x - diametre / 2).toFixed(1)}px`)
    frame.style.setProperty('--o-lz-y', `${(y - diametre / 2).toFixed(1)}px`)
    frame.style.setProperty(
      '--o-lz-bs',
      `${(nw * echelle).toFixed(1)}px ${(nh * echelle).toFixed(1)}px`,
    )
    frame.style.setProperty('--o-lz-bx', `${(diametre / 2 - u * echelle).toFixed(1)}px`)
    frame.style.setProperty('--o-lz-by', `${(diametre / 2 - v * echelle).toFixed(1)}px`)
    frame.setAttribute('data-o-lens-actif', '')
  }

  return (
    <div
      className={className}
      style={hostStyle}
      onPointerMove={reduced ? undefined : suivre}
      onPointerLeave={
        reduced
          ? undefined
          : (event) => {
              event.currentTarget.removeAttribute('data-o-lens-actif')
            }
      }
    >
      <img
        loading="lazy"
        decoding="async"
        {...rest}
        ref={picture}
        src={src}
        alt={alt}
        className="o-size-full o-object-cover"
      />

      {/* Le disque est decoratif : ce qu'il montre est deja dans l'image. */}
      {reduced ? null : <div aria-hidden data-o-lz-glass="" />}
    </div>
  )
}

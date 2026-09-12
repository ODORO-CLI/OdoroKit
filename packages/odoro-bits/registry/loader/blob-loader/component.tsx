/**
 * Blob qui se deforme : une masse centrale laisse partir un bourgeon, le
 * cou s'etire, se rompt, puis le bourgeon revient se fondre.
 *
 * ## Deux cercles qui n'en font qu'un
 *
 * Le dessin ne contient que deux cercles. Ce qui les soude est un filtre :
 * un flou gaussien etale leurs bords l'un vers l'autre, puis une matrice de
 * couleur multiplie fortement l'alpha et le decale vers le bas. Tout ce qui
 * etait a demi transparent devient franchement opaque ou franchement vide,
 * et le seuil ainsi pose retaille un contour net autour des deux formes
 * melangees. La ou leurs halos se recouvrent, un cou apparait ; quand ils
 * s'eloignent assez, il s'amincit et casse.
 *
 * Aucune interpolation de trace, donc, et aucun calcul par image : la
 * deformation est un effet de bord de la distance entre deux cercles.
 *
 * Le noyau se retracte quand le bourgeon s'ecarte et se regonfle quand il
 * revient. C'est une petite tricherie de conservation de matiere, mais
 * l'oeil l'attend : sans elle, le blob semble fabriquer de la substance.
 *
 * La region du filtre est elargie d'un quart de part et d'autre : par
 * defaut elle serre la boite englobante de trop pres, et le flou serait
 * coupe net sur ses bords.
 *
 * ## Un statut, pas un dessin
 *
 * L'element porte `role="status"` et un libelle pour les lecteurs d'ecran :
 * l'attente est une information, pas une decoration. Le dessin est retire
 * de l'arbre d'accessibilite.
 *
 * Sous mouvement reduit, le bourgeon reste au centre : les deux cercles
 * sont concentriques et le filtre n'en rend qu'une seule masse ronde,
 * immobile.
 *
 * @module
 */

import { mergePresentation, type Customisable } from '@odoro-cli/engine'
import { useId, type CSSProperties, type ReactElement } from 'react'

/** Identifiant de la feuille injectee. */
const STYLE_ID = 'o-blob-loader'

/**
 * Matrice de seuil : les couleurs passent telles quelles, l'alpha est
 * multiplie puis abaisse. Le produit vaut un au-dela d'environ un demi et
 * zero en deca : le degrade du flou redevient un bord.
 */
const THRESHOLD = '1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -10'

/** Pose le blob, son bourgeon et sa respiration, une fois par document. */
function ensureBlobRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-blob-loader]{display:inline-block;line-height:0}',
    '[data-o-blob-loader] svg{display:block}',
    '[data-o-blob-arm],[data-o-blob-bud],[data-o-blob-core]{',
    'transform-box:view-box;transform-origin:50px 50px;',
    '}',
    // Le bras tourne d'un tour par cycle ; le bourgeon sort et rentre deux
    // fois pendant ce tour, soit une rupture a chaque demi-tour.
    '[data-o-blob-arm]{',
    'animation:o-blob-loader-turn var(--o-blob-speed) linear infinite;',
    '}',
    '@keyframes o-blob-loader-turn{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}',
    '[data-o-blob-bud]{',
    'animation:o-blob-loader-reach var(--o-blob-speed) ease-in-out infinite;',
    '}',
    '@keyframes o-blob-loader-reach{',
    '0%,50%,100%{transform:translateX(2px) scale(0.66)}',
    '25%,75%{transform:translateX(29px) scale(1)}',
    '}',
    '[data-o-blob-core]{',
    'animation:o-blob-loader-breathe var(--o-blob-speed) ease-in-out infinite;',
    '}',
    '@keyframes o-blob-loader-breathe{',
    '0%,50%,100%{transform:scale(1)}',
    '25%,75%{transform:scale(0.86)}',
    '}',
    '@media (prefers-reduced-motion:reduce){',
    '[data-o-blob-arm],[data-o-blob-bud],[data-o-blob-core]{animation:none;transform:none}',
    '}',
  ].join('')
  document.head.append(style)
}

/** Proprietes propres au composant. */
export interface BlobLoaderOwnProps {
  /** Cote de la zone de dessin, en pixels. @defaultValue 56 */
  size?: number
  /** Duree d'un tour du bourgeon, en millisecondes. @defaultValue 2800 */
  speed?: number
  /** Couleur du blob. @defaultValue la couleur du texte */
  color?: string
  /** Libelle annonce aux lecteurs d'ecran. @defaultValue 'Chargement' */
  label?: string
}

/** Toutes les proprietes. */
export type BlobLoaderProps = Customisable<BlobLoaderOwnProps, 'span'>

/**
 * Signale une attente par une masse qui bourgeonne et se ressoude.
 *
 * @example
 * <BlobLoader />
 *
 * @example
 * // Plus grand, plus lent, dans la teinte de marque.
 * <BlobLoader size={96} speed={4200} color="var(--o-palette-brand-500)" />
 */
export function BlobLoader({
  size = 56,
  speed = 2800,
  color = 'currentColor',
  label = 'Chargement',
  ...rest
}: BlobLoaderProps): ReactElement {
  ensureBlobRule()

  // Un identifiant par instance : deux blobs sur la meme page ne doivent
  // pas se partager un filtre.
  const goo = `o-blob-loader-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`

  const { className, style } = mergePresentation({}, rest)

  const loaderStyle = {
    ...style,
    width: `${String(size)}px`,
    height: `${String(size)}px`,
    color,
    '--o-blob-speed': `${String(speed)}ms`,
  } as CSSProperties

  return (
    <span
      {...rest}
      className={className}
      style={loaderStyle}
      data-o-blob-loader=""
      role="status"
    >
      <span className="o-sr-only">{label}</span>
      <svg aria-hidden viewBox="0 0 100 100" width="100%" height="100%">
        <defs>
          <filter id={goo} x="-25%" y="-25%" width="150%" height="150%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="o-blob-blur" />
            <feColorMatrix in="o-blob-blur" type="matrix" values={THRESHOLD} />
          </filter>
        </defs>
        <g filter={`url(#${goo})`} fill="currentColor">
          <circle data-o-blob-core="" cx="50" cy="50" r="17" />
          <g data-o-blob-arm="">
            <circle data-o-blob-bud="" cx="50" cy="50" r="9.5" />
          </g>
        </g>
      </svg>
    </span>
  )
}

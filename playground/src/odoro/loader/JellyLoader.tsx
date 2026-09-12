/**
 * Gelee qui tremble : un pave arrondi s'affaisse sur sa base, rebondit, et
 * ses oscillations s'eteignent avant de repartir.
 *
 * ## Le tremblement est un amortissement
 *
 * Une gelee qui alterne deux etats fait un metronome. Ce qui la rend molle,
 * c'est que chaque rebond est plus faible que le precedent : l'ecrasement
 * initial est franc, le retour depasse un peu, le suivant beaucoup moins,
 * et le dernier se devine a peine. La suite des amplitudes est donc
 * decroissante, et les paliers se resserrent — c'est ce que fait une masse
 * molle qui dissipe son energie.
 *
 * L'ancrage est en bas : la matiere s'ecrase vers sa base et le sommet
 * seul se deplace. Ancree au centre, la forme se dilaterait des deux cotes
 * a la fois, ce qui est le mouvement d'un ballon, pas d'une gelee posee.
 *
 * ## Le rayon fait la matiere
 *
 * L'echelle seule donnerait un rectangle qui s'aplatit. Ce sont les rayons
 * de coin qui font la gelee : ils s'allongent la ou la matiere s'etale, se
 * resserrent la ou elle se tend, et chaque coin a son propre rayon
 * horizontal et vertical. C'est la seule propriete animee qui ne soit pas
 * une transformation ; sur une forme de cette taille, le cout est celui
 * d'un seul rectangle redessine.
 *
 * ## Un statut, pas un dessin
 *
 * L'element porte `role="status"` et un libelle pour les lecteurs d'ecran :
 * l'attente est une information, pas une decoration. La forme est retiree
 * de l'arbre d'accessibilite.
 *
 * Sous mouvement reduit, le pave reste au repos, coins arrondis : la figure
 * se lit encore, seul le tremblement s'arrete.
 *
 * @module
 */

import { mergePresentation, type Customisable } from '@odoro-cli/engine'
import type { CSSProperties, ReactElement } from 'react'

/** Identifiant de la feuille injectee. */
const STYLE_ID = 'o-jelly-loader'

/** Pose la gelee et son tremblement amorti, une fois par document. */
function ensureJellyRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-jelly-loader]{display:inline-flex;align-items:flex-end;justify-content:center}',
    '[data-o-jelly-body]{',
    // La taille ne se negocie pas : le libelle voisin est un element de
    // meme rang, et sans cela il pourrait comprimer la gelee.
    'flex:none;',
    'width:var(--o-jelly-size);height:var(--o-jelly-size);',
    'background:var(--o-jelly-color);',
    'border-radius:26%;',
    // La base ne bouge pas : c'est le sol de la gelee.
    'transform-origin:50% 100%;',
    'animation:o-jelly-loader-wobble var(--o-jelly-speed) ease-in-out infinite;',
    '}',
    '@keyframes o-jelly-loader-wobble{',
    '0%{transform:scale(1,1);border-radius:26%}',
    '10%{transform:scale(1.22,0.78);border-radius:44% 44% 30% 30% / 58% 58% 22% 22%}',
    '26%{transform:scale(0.86,1.16);border-radius:30% 30% 44% 44% / 22% 22% 58% 58%}',
    '42%{transform:scale(1.1,0.92);border-radius:36% 36% 28% 28% / 44% 44% 24% 24%}',
    '58%{transform:scale(0.94,1.06);border-radius:28% 28% 34% 34% / 24% 24% 40% 40%}',
    '72%{transform:scale(1.03,0.97);border-radius:30% 30% 26% 26% / 32% 32% 24% 24%}',
    '84%,100%{transform:scale(1,1);border-radius:26%}',
    '}',
    '@media (prefers-reduced-motion:reduce){',
    '[data-o-jelly-body]{animation:none;transform:none;border-radius:26%}',
    '}',
  ].join('')
  document.head.append(style)
}

/** Proprietes propres au composant. */
export interface JellyLoaderOwnProps {
  /** Cote du pave au repos, en pixels. @defaultValue 40 */
  size?: number
  /** Duree d'un tremblement complet, en millisecondes. @defaultValue 1600 */
  speed?: number
  /** Couleur de la gelee. @defaultValue la couleur du texte */
  color?: string
  /** Libelle annonce aux lecteurs d'ecran. @defaultValue 'Chargement' */
  label?: string
}

/** Toutes les proprietes. */
export type JellyLoaderProps = Customisable<JellyLoaderOwnProps, 'span'>

/**
 * Signale une attente par un pave de gelee qui tremble sur sa base.
 *
 * @example
 * <JellyLoader />
 *
 * @example
 * // Plus grande, plus lente, dans la teinte de marque.
 * <JellyLoader size={64} speed={2400} color="var(--o-palette-brand-500)" />
 */
export function JellyLoader({
  size = 40,
  speed = 1600,
  color = 'currentColor',
  label = 'Chargement',
  ...rest
}: JellyLoaderProps): ReactElement {
  ensureJellyRule()

  const { className, style } = mergePresentation({}, rest)

  const loaderStyle = {
    ...style,
    // La boite reserve la place du rebond le plus haut : sans cette marge,
    // le sommet deborderait de la ligne de texte.
    width: `${String(Math.round(size * 1.3))}px`,
    height: `${String(Math.round(size * 1.2))}px`,
    '--o-jelly-size': `${String(size)}px`,
    '--o-jelly-speed': `${String(speed)}ms`,
    '--o-jelly-color': color,
  } as CSSProperties

  return (
    <span
      {...rest}
      className={className}
      style={loaderStyle}
      data-o-jelly-loader=""
      role="status"
    >
      <span className="o-sr-only">{label}</span>
      <span aria-hidden data-o-jelly-body="" />
    </span>
  )
}

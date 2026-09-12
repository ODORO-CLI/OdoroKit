/**
 * Logo qui se trace : le contour d'une marque se dessine, se remplit, puis
 * se vide et s'efface, sans fin.
 *
 * ## Un trait, puis une matiere
 *
 * Un logo qui apparait en fondu ne raconte rien. Ici il se fabrique dans
 * l'ordre ou une main le ferait : d'abord le trait, d'un seul geste, du
 * debut du chemin a sa fin ; ensuite la matiere, qui vient prendre place
 * dans la forme une fois qu'elle est fermee. Le remplissage arrive apres le
 * trace, jamais pendant : c'est ce decalage qui fait lire les deux temps.
 *
 * Le trace est un tiret aussi long que le chemin entier, deplace par son
 * decalage. Le chemin declare une longueur de cent : le tiret se lit en
 * pour cent, et les images cles valent pour n'importe quel logo, quelle que
 * soit la longueur reelle de son contour. C'est ce qui permet de passer sa
 * propre marque en propriete sans toucher a la feuille de style.
 *
 * L'effacement suit le meme sens que le trace — le decalage continue de
 * descendre au lieu de remonter — donc le crayon ne revient jamais sur ses
 * pas : la queue rattrape la tete, et le cycle se referme sur une forme
 * vide, exactement son point de depart.
 *
 * Deux animations CSS sur des elements SVG, tenues par le compositeur,
 * aucun JavaScript apres le premier rendu.
 *
 * ## Un statut, pas un dessin
 *
 * L'element porte `role="status"` et un libelle pour les lecteurs d'ecran :
 * l'attente est une information, pas une decoration. Le logo est retire de
 * l'arbre d'accessibilite — c'est une image de marque, pas un contenu.
 *
 * Sous mouvement reduit, le logo est entierement trace et rempli : la marque
 * se lit, seul son dessin s'arrete.
 *
 * @module
 */

import { mergePresentation, type Customisable } from '@odoro-cli/engine'
import type { CSSProperties, ReactElement } from 'react'

/** Identifiant de la feuille injectee. */
const STYLE_ID = 'o-logo-draw'

/**
 * La marque odoro, dans une vue de 100 unites : un quart de disque ferme
 * par ses deux rayons.
 */
const ODORO_MARK = 'M20.25 20.25H50a29.75 29.75 0 1 1-29.75 29.75Z'

/** Vue du trace par defaut. */
const ODORO_VIEW = '0 0 100 100'

/** Pose le trace, le remplissage et leur enchainement, une fois par document. */
function ensureLogoRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-logo-draw]{display:inline-block;line-height:0}',
    '[data-o-logo-draw] svg{display:block}',
    '[data-o-logo-line]{',
    'stroke-dasharray:100 100;stroke-dashoffset:100;',
    'animation:o-logo-draw-line var(--o-logo-speed) infinite;',
    '}',
    '[data-o-logo-fill]{opacity:0;animation:o-logo-draw-fill var(--o-logo-speed) infinite}',
    // Le trait se pose, tient, puis s'efface dans le meme sens : le
    // decalage descend jusqu'a moins cent au lieu de remonter a cent.
    '@keyframes o-logo-draw-line{',
    '0%{stroke-dashoffset:100;animation-timing-function:ease-in-out}',
    '40%,84%{stroke-dashoffset:0;animation-timing-function:ease-in-out}',
    '100%{stroke-dashoffset:-100}',
    '}',
    // La matiere n'entre qu'une fois la forme fermee, et sort avant que le
    // trait ne commence a s'effacer.
    '@keyframes o-logo-draw-fill{',
    '0%,40%{opacity:0;animation-timing-function:ease-out}',
    '56%,72%{opacity:1;animation-timing-function:ease-in}',
    '84%,100%{opacity:0}',
    '}',
    // Marque tracee et pleine : la figure est dite, a l'arret.
    '@media (prefers-reduced-motion:reduce){',
    '[data-o-logo-line]{animation:none;stroke-dashoffset:0}',
    '[data-o-logo-fill]{animation:none;opacity:1}',
    '}',
  ].join('')
  document.head.append(style)
}

/** Proprietes propres au composant. */
export interface LogoDrawOwnProps {
  /** Cote du dessin, en pixels. @defaultValue 64 */
  size?: number
  /**
   * Trace du logo, en donnees de chemin SVG. Un seul chemin ferme, pour que
   * le remplissage ait un sens.
   * @defaultValue la marque odoro
   */
  path?: string
  /** Vue du trace. A changer avec le chemin. @defaultValue '0 0 100 100' */
  viewBox?: string
  /** Epaisseur du trait, en unites de la vue. @defaultValue 4 */
  thickness?: number
  /** Duree d'un cycle complet, en millisecondes. @defaultValue 2800 */
  speed?: number
  /** Couleur du trait et du remplissage. @defaultValue la couleur du texte */
  color?: string
  /** Libelle annonce aux lecteurs d'ecran. @defaultValue 'Chargement' */
  label?: string
}

/** Toutes les proprietes. */
export type LogoDrawProps = Customisable<LogoDrawOwnProps, 'span'>

/**
 * Signale une attente par un logo qui se trace puis se remplit.
 *
 * @example
 * <LogoDraw />
 *
 * @example
 * // Sa propre marque, dans sa propre vue.
 * <LogoDraw path="M8 8 H56 V56 H8 Z" viewBox="0 0 64 64" size={80} />
 */
export function LogoDraw({
  size = 64,
  path = ODORO_MARK,
  viewBox = ODORO_VIEW,
  thickness = 4,
  speed = 2800,
  color = 'currentColor',
  label = 'Chargement',
  ...rest
}: LogoDrawProps): ReactElement {
  ensureLogoRule()

  const { className, style } = mergePresentation({}, rest)

  const loaderStyle = {
    ...style,
    width: `${String(size)}px`,
    height: `${String(size)}px`,
    color,
    '--o-logo-speed': `${String(speed)}ms`,
  } as CSSProperties

  return (
    <span
      {...rest}
      className={className}
      style={loaderStyle}
      data-o-logo-draw=""
      role="status"
    >
      <span className="o-sr-only">{label}</span>
      <svg aria-hidden viewBox={viewBox} width="100%" height="100%">
        {/* La forme en creux : sans elle, un logo a demi trace n'est qu'un
            fragment, et l'oeil ne sait pas ce qui manque. */}
        <path
          d={path}
          fill="none"
          stroke="currentColor"
          strokeWidth={thickness}
          strokeOpacity={0.16}
          strokeLinejoin="round"
        />
        <path data-o-logo-fill="" d={path} fill="currentColor" />
        <path
          data-o-logo-line=""
          d={path}
          pathLength={100}
          fill="none"
          stroke="currentColor"
          strokeWidth={thickness}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      </svg>
    </span>
  )
}

/**
 * Phases de lune : un disque eteint sur lequel la part eclairee croit
 * jusqu'a la pleine lune, puis decroit de l'autre bord.
 *
 * ## Le terminateur est une demi-ellipse
 *
 * La frontiere entre l'ombre et la lumiere n'est pas une droite : c'est le
 * bord d'un hemisphere vu de biais, donc une demi-ellipse dont la largeur
 * varie du rayon a moins le rayon. A largeur positive elle bombe vers la
 * droite et decoupe un croissant ; nulle, elle est droite et donne le
 * premier quartier ; negative, elle bombe vers la gauche et la lune est
 * gibbeuse.
 *
 * Le trace de la part eclairee est fait de quatre cubiques : deux pour le
 * demi-cercle exterieur, deux pour le terminateur. On aurait pu employer
 * des arcs, mais un arc porte un drapeau de sens qui bascule au passage du
 * quartier, et un drapeau ne s'interpole pas. Une cubique, elle, n'a que
 * des points : le trace reste affine en la largeur du terminateur, et le
 * navigateur peut passer d'une phase a l'autre en interpolant simplement
 * trois traces — nouvelle lune, pleine lune, nouvelle lune.
 *
 * ## Le retournement invisible
 *
 * Ce trace eclaire toujours le bord droit. Or une lune decroissante est
 * eclairee a gauche. Plutot que de dessiner un second jeu de formes, le
 * groupe est retourne d'un coup au milieu du cycle — c'est-a-dire exactement
 * a la pleine lune, quand la figure est un disque parfait, symetrique, et
 * que le retournement ne se voit pas. La seconde moitie du cycle rejoue donc
 * la premiere a l'envers, dans le bon sens astronomique.
 *
 * Le disque eteint reste dessous en permanence, a faible opacite : sans
 * lui, la nouvelle lune serait un vide, et le chargeur disparaitrait.
 *
 * ## Un statut, pas un dessin
 *
 * L'element porte `role="status"` et un libelle pour les lecteurs d'ecran :
 * l'attente est une information, pas une decoration. Le dessin est retire
 * de l'arbre d'accessibilite.
 *
 * SMIL ignore la preference de mouvement reduit : c'est donc le composant
 * qui la lit, et qui n'insere pas les animations quand elle est active. Il
 * reste un premier quartier, la phase la plus reconnaissable.
 *
 * @module
 */

import { mergePresentation, useMotionState, type Customisable } from '@odoro-cli/engine'
import type { CSSProperties, ReactElement } from 'react'

/** Identifiant de la feuille injectee. */
const STYLE_ID = 'o-moon-phases'

/** Rayon de la lune, en unites de la vue. */
const RADIUS = 40

/**
 * Constante de l'approximation d'un quart d'ellipse par une cubique.
 *
 * Quatre cubiques dont les tangentes sont a cette fraction du rayon
 * s'ecartent du cercle de moins d'un millieme : a cette taille, l'ecart est
 * cent fois plus petit qu'un pixel.
 */
const KAPPA = 0.5522847498

/**
 * Trace de la part eclairee, pour une largeur de terminateur donnee.
 *
 * A `+RADIUS` le terminateur epouse le bord droit et la part eclairee est
 * vide : nouvelle lune. A zero il est droit : premier quartier. A
 * `-RADIUS` il epouse le bord gauche et le disque est plein : pleine lune.
 */
function litPath(width: number): string {
  const r = RADIUS.toFixed(3)
  const negR = (-RADIUS).toFixed(3)
  const k = (KAPPA * RADIUS).toFixed(3)
  const negK = (-KAPPA * RADIUS).toFixed(3)
  const w = width.toFixed(3)
  const wk = (KAPPA * width).toFixed(3)

  return [
    `M 0 ${negR}`,
    // Le bord exterieur, toujours le meme : deux quarts de cercle a droite.
    `C ${k} ${negR} ${r} ${negK} ${r} 0`,
    `C ${r} ${k} ${k} ${r} 0 ${r}`,
    // Le terminateur, remontant : deux quarts d'ellipse de demi-largeur w.
    `C ${wk} ${r} ${w} ${k} ${w} 0`,
    `C ${w} ${negK} ${wk} ${negR} 0 ${negR}`,
    'Z',
  ].join(' ')
}

/** Les trois traces du cycle : nouvelle, pleine, nouvelle. */
const PHASES = [litPath(RADIUS), litPath(-RADIUS), litPath(RADIUS)].join(';')

/** Le premier quartier : le terminateur est droit. */
const QUARTER = litPath(0)

/**
 * Une acceleration douce sur chaque moitie du cycle.
 *
 * La largeur du terminateur suit alors une courbe proche du cosinus, qui
 * est la loi reelle : la phase change lentement pres de la nouvelle et de
 * la pleine lune, vite aux quartiers.
 */
const KEY_SPLINES = '0.4 0 0.6 1;0.4 0 0.6 1'

/** Pose le cadre, une fois par document. */
function ensureMoonRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-moon-phases]{display:inline-block;line-height:0}',
    '[data-o-moon-phases] svg{display:block}',
  ].join('')
  document.head.append(style)
}

/** Proprietes propres au composant. */
export interface MoonPhasesOwnProps {
  /** Diametre de la lune, en pixels. @defaultValue 48 */
  size?: number
  /** Duree d'une lunaison complete, en millisecondes. @defaultValue 3600 */
  speed?: number
  /** Couleur de la lune. @defaultValue la couleur du texte */
  color?: string
  /** Libelle annonce aux lecteurs d'ecran. @defaultValue 'Chargement' */
  label?: string
}

/** Toutes les proprietes. */
export type MoonPhasesProps = Customisable<MoonPhasesOwnProps, 'span'>

/**
 * Signale une attente par une lune qui parcourt ses phases.
 *
 * @example
 * <MoonPhases />
 *
 * @example
 * // Plus grande, plus lente, dans la teinte de marque.
 * <MoonPhases size={80} speed={6000} color="var(--o-palette-brand-500)" />
 */
export function MoonPhases({
  size = 48,
  speed = 3600,
  color = 'currentColor',
  label = 'Chargement',
  ...rest
}: MoonPhasesProps): ReactElement {
  ensureMoonRule()
  const { reduced } = useMotionState()

  const { className, style } = mergePresentation({}, rest)

  const loaderStyle = {
    ...style,
    width: `${String(size)}px`,
    height: `${String(size)}px`,
    color,
  } as CSSProperties

  const duration = `${String(speed)}ms`

  return (
    <span
      {...rest}
      className={className}
      style={loaderStyle}
      data-o-moon-phases=""
      role="status"
    >
      <span className="o-sr-only">{label}</span>
      <svg aria-hidden viewBox="0 0 100 100" width="100%" height="100%">
        <g transform="translate(50 50)">
          <circle cx="0" cy="0" r={RADIUS} fill="currentColor" opacity={0.16} />
          <g>
            {reduced ? null : (
              <animateTransform
                attributeName="transform"
                type="scale"
                values="1 1;-1 1"
                keyTimes="0;0.5"
                calcMode="discrete"
                dur={duration}
                repeatCount="indefinite"
              />
            )}
            <path d={reduced ? QUARTER : litPath(RADIUS)} fill="currentColor">
              {reduced ? null : (
                <animate
                  attributeName="d"
                  values={PHASES}
                  keyTimes="0;0.5;1"
                  keySplines={KEY_SPLINES}
                  calcMode="spline"
                  dur={duration}
                  repeatCount="indefinite"
                />
              )}
            </path>
          </g>
        </g>
      </svg>
    </span>
  )
}

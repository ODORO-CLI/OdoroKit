/**
 * Carre qui se plie : un patron en croix dont les quatre volets se relevent
 * un a un pour fermer une boite, puis se rabattent.
 *
 * ## Un volet tourne sur sa charniere
 *
 * Le patron est une face centrale et quatre volets colles a ses cotes.
 * Chaque volet pivote autour du cote qu'il partage avec le centre — son
 * origine de transformation est cette arete, pas son milieu. Une rotation
 * centree ferait passer le volet a travers le centre ; depuis l'arete, il
 * se releve comme un rabat de carton.
 *
 * Les quatre volets jouent la meme animation, mais chacun sur son axe et
 * dans son sens : la rotation est ecrite `rotate3d` avec des variables par
 * volet, que l'image cle resout element par element. Une animation, quatre
 * charnieres. Les delais sont negatifs et decales d'un volet a l'autre : le
 * pliage est en cours des la premiere image, et les volets se relevent en
 * tournant autour de la boite plutot que tous ensemble.
 *
 * Les volets se plient vers l'arriere, loin du regard : on voit l'exterieur
 * de la boite, avec ses faces ombrees, et non l'interieur d'un puits.
 *
 * ## Un statut, pas un dessin
 *
 * L'element porte `role="status"` et un libelle pour les lecteurs d'ecran :
 * l'attente est une information, pas une decoration. Le patron est retire
 * de l'arbre d'accessibilite.
 *
 * Sous mouvement reduit, la boite reste fermee : c'est l'etat ou le pliage
 * aboutit, et le seul ou la figure est un cube.
 *
 * @module
 */

import { mergePresentation, type Customisable } from '@odoro-cli/engine'
import type { CSSProperties, ReactElement } from 'react'

/** Identifiant de la feuille injectee. */
const STYLE_ID = 'o-cube-fold'

/**
 * Les quatre volets : place dans le patron, charniere, axe et sens.
 *
 * La place est comptee en faces : le centre est en (1, 1). Le sens est
 * choisi pour que chaque volet se replie vers l'arriere : autour de X dans
 * le sens positif pour le volet du haut, negatif pour celui du bas, et de
 * meme sur Y pour la droite et la gauche. L'ordre de la liste est l'ordre
 * de pliage, dans le sens horaire.
 */
const FLAPS: ReadonlyArray<{
  readonly row: number
  readonly column: number
  readonly hinge: string
  readonly axis: string
  readonly turn: number
}> = [
  { row: 0, column: 1, hinge: 'bottom center', axis: '1,0,0', turn: 90 },
  { row: 1, column: 2, hinge: 'left center', axis: '0,1,0', turn: 90 },
  { row: 2, column: 1, hinge: 'top center', axis: '1,0,0', turn: -90 },
  { row: 1, column: 0, hinge: 'right center', axis: '0,1,0', turn: -90 },
]

/** Pose le patron et son pliage, une fois par document. */
function ensureCubeFoldRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-cube-fold]{',
    'display:inline-block;line-height:0;',
    'width:calc(var(--o-fold-size) * 3);height:calc(var(--o-fold-size) * 3);',
    'perspective:calc(var(--o-fold-size) * 12);',
    '}',
    // Une inclinaison fixe : de face, les volets replies disparaitraient
    // derriere le centre et le pliage se lirait comme un retrecissement.
    '[data-o-cube-fold-tilt]{',
    'display:block;position:relative;width:100%;height:100%;',
    'transform-style:preserve-3d;',
    'transform:rotateX(-28deg) rotateY(-34deg);',
    '}',
    '[data-o-cube-fold-face]{',
    'position:absolute;width:var(--o-fold-size);height:var(--o-fold-size);',
    'top:calc(var(--o-fold-size) * var(--o-fold-row));',
    'left:calc(var(--o-fold-size) * var(--o-fold-column));',
    'backface-visibility:hidden;',
    'background:color-mix(in oklab, var(--o-fold-color) var(--o-fold-shade), transparent);',
    '}',
    '[data-o-cube-fold-flap]{',
    'transform-origin:var(--o-fold-hinge);',
    'animation:o-cube-fold-close var(--o-fold-speed) ease-in-out infinite;',
    'animation-delay:var(--o-fold-delay);',
    '}',
    // Plie, tient, deplie. Les variables d'axe et d'angle sont celles du
    // volet : une seule animation, quatre charnieres.
    '@keyframes o-cube-fold-close{',
    '0%,12%{transform:rotate3d(var(--o-fold-axis),0deg)}',
    '38%,62%{transform:rotate3d(var(--o-fold-axis),var(--o-fold-turn))}',
    '88%,100%{transform:rotate3d(var(--o-fold-axis),0deg)}',
    '}',
    '@media (prefers-reduced-motion:reduce){',
    '[data-o-cube-fold-flap]{animation:none;transform:rotate3d(var(--o-fold-axis),var(--o-fold-turn))}',
    '}',
  ].join('')
  document.head.append(style)
}

/** Proprietes propres au composant. */
export interface CubeFoldOwnProps {
  /** Cote d'une face, en pixels. Le patron deplie en occupe trois. @defaultValue 20 */
  size?: number
  /** Duree d'un cycle de pliage et depliage, en millisecondes. @defaultValue 2600 */
  speed?: number
  /** Couleur des faces. @defaultValue la couleur du texte */
  color?: string
  /** Libelle annonce aux lecteurs d'ecran. @defaultValue 'Chargement' */
  label?: string
}

/** Toutes les proprietes. */
export type CubeFoldProps = Customisable<CubeFoldOwnProps, 'span'>

/**
 * Signale une attente par un patron qui se plie en boite.
 *
 * @example
 * <CubeFold />
 *
 * @example
 * // Plus grand, plus lent, dans la teinte de marque.
 * <CubeFold size={32} speed={4000} color="var(--o-palette-brand-500)" />
 */
export function CubeFold({
  size = 20,
  speed = 2600,
  color = 'currentColor',
  label = 'Chargement',
  ...rest
}: CubeFoldProps): ReactElement {
  ensureCubeFoldRule()

  const { className, style } = mergePresentation({}, rest)

  const loaderStyle = {
    ...style,
    '--o-fold-size': `${String(size)}px`,
    '--o-fold-speed': `${String(speed)}ms`,
    '--o-fold-color': color,
  } as CSSProperties

  return (
    <span
      {...rest}
      className={className}
      style={loaderStyle}
      data-o-cube-fold=""
      role="status"
    >
      <span className="o-sr-only">{label}</span>
      <span aria-hidden data-o-cube-fold-tilt="">
        <span
          data-o-cube-fold-face=""
          style={
            {
              '--o-fold-row': 1,
              '--o-fold-column': 1,
              '--o-fold-shade': '100%',
            } as CSSProperties
          }
        />
        {FLAPS.map((flap, index) => (
          <span
            key={flap.hinge}
            data-o-cube-fold-face=""
            data-o-cube-fold-flap=""
            style={
              {
                '--o-fold-row': flap.row,
                '--o-fold-column': flap.column,
                '--o-fold-shade': '66%',
                '--o-fold-hinge': flap.hinge,
                '--o-fold-axis': flap.axis,
                '--o-fold-turn': `${String(flap.turn)}deg`,
                // Un dixieme de cycle entre deux volets, en negatif : le
                // premier volet est deja releve quand le dernier commence,
                // et le pliage tourne autour de la boite.
                '--o-fold-delay': `${String(Math.round(-speed * index * 0.1))}ms`,
              } as CSSProperties
            }
          />
        ))}
      </span>
    </span>
  )
}

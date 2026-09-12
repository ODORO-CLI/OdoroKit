/**
 * Cube qui bascule : un cube en CSS 3D bascule d'un quart de tour, marque un
 * temps, puis bascule sur l'autre axe.
 *
 * ## Quatre bascules qui reviennent au depart
 *
 * Un cube qui roulerait toujours dans le meme sens ne reviendrait pas a son
 * orientation de depart a la fin du cycle, et la boucle montrerait une
 * couture. Ici les quatre bascules dessinent un aller-retour : un quart de
 * tour sur X, un quart sur Y, retour sur X, retour sur Y. La derniere image
 * du cycle est exactement la premiere.
 *
 * Entre deux bascules, une pause. Sans elle, le cube tourne en continu et
 * l'oeil ne distingue plus les faces : c'est la pause qui fait lire « une
 * face, puis une autre ».
 *
 * ## Deux boites, deux roles
 *
 * La boite exterieure porte une inclinaison fixe — un peu de haut, un peu de
 * cote — pour qu'on voie toujours trois faces. La boite interieure porte
 * l'animation. Separer les deux evite de re-encoder l'inclinaison dans
 * chaque image cle, et donne un etat de repos qui se lit comme un cube et
 * non comme un carre.
 *
 * Les faces sont des nuances de la meme couleur, obtenues par melange avec
 * du transparent : le cube suit la couleur du texte, ou celle qu'on lui
 * donne, sans jamais en ecrire une en dur.
 *
 * ## Un statut, pas un dessin
 *
 * L'element porte `role="status"` et un libelle pour les lecteurs d'ecran :
 * l'attente est une information, pas une decoration. Le cube, lui, est
 * retire de l'arbre d'accessibilite.
 *
 * Sous mouvement reduit, le cube reste incline et immobile : trois faces
 * visibles, la figure se lit encore comme un chargeur, seul le mouvement
 * s'arrete.
 *
 * @module
 */

import { mergePresentation, type Customisable } from '@odoro-cli/engine'
import type { CSSProperties, ReactElement } from 'react'

/** Identifiant de la feuille injectee. */
const STYLE_ID = 'o-cube-flip'

/**
 * Les six faces : leur placement autour du centre et leur nuance.
 *
 * La nuance est un pourcentage de la couleur, le reste etant transparent.
 * Trois valeurs suffisent a donner du relief : une face pleine, une face
 * moyenne, une face sombre. Les faces opposees partagent leur nuance, pour
 * que le cube ait le meme aspect apres une bascule.
 */
const FACES: ReadonlyArray<{ readonly place: string; readonly shade: number }> = [
  { place: 'rotateY(0deg)', shade: 100 },
  { place: 'rotateY(180deg)', shade: 100 },
  { place: 'rotateY(90deg)', shade: 62 },
  { place: 'rotateY(-90deg)', shade: 62 },
  { place: 'rotateX(90deg)', shade: 82 },
  { place: 'rotateX(-90deg)', shade: 82 },
]

/** Pose le cube et ses bascules, une fois par document. */
function ensureCubeFlipRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    // Une perspective courte : le cube est petit, une perspective longue le
    // rendrait plat comme une projection orthogonale.
    '[data-o-cube-flip]{',
    'display:inline-block;line-height:0;',
    'width:var(--o-cube-size);height:var(--o-cube-size);',
    'perspective:calc(var(--o-cube-size) * 4);',
    '}',
    '[data-o-cube-flip-tilt]{',
    'display:block;width:100%;height:100%;',
    'transform-style:preserve-3d;',
    'transform:rotateX(-24deg) rotateY(-32deg);',
    '}',
    '[data-o-cube-flip-box]{',
    'display:block;position:relative;width:100%;height:100%;',
    'transform-style:preserve-3d;',
    'animation:o-cube-flip-turn var(--o-cube-speed) ease-in-out infinite;',
    '}',
    // Les faces sont translucides : sans cette ligne, on verrait les faces
    // arriere a travers les faces avant.
    '[data-o-cube-flip-face]{',
    'position:absolute;inset:0;backface-visibility:hidden;',
    'background:color-mix(in oklab, var(--o-cube-color) var(--o-cube-shade), transparent);',
    'transform:var(--o-cube-place) translateZ(calc(var(--o-cube-size) / 2));',
    '}',
    // Quatre bascules et quatre pauses. Chaque bascule ne change qu'un
    // axe, et le cycle revient a (0, 0) sans couture.
    '@keyframes o-cube-flip-turn{',
    '0%,8%{transform:rotateX(0deg) rotateY(0deg)}',
    '25%,33%{transform:rotateX(-90deg) rotateY(0deg)}',
    '50%,58%{transform:rotateX(-90deg) rotateY(-90deg)}',
    '75%,83%{transform:rotateX(0deg) rotateY(-90deg)}',
    '100%{transform:rotateX(0deg) rotateY(0deg)}',
    '}',
    '@media (prefers-reduced-motion:reduce){',
    '[data-o-cube-flip-box]{animation:none;transform:none}',
    '}',
  ].join('')
  document.head.append(style)
}

/** Proprietes propres au composant. */
export interface CubeFlipOwnProps {
  /** Arete du cube, en pixels. @defaultValue 32 */
  size?: number
  /** Duree d'un cycle de quatre bascules, en millisecondes. @defaultValue 2400 */
  speed?: number
  /** Couleur du cube. @defaultValue la couleur du texte */
  color?: string
  /** Libelle annonce aux lecteurs d'ecran. @defaultValue 'Chargement' */
  label?: string
}

/** Toutes les proprietes. */
export type CubeFlipProps = Customisable<CubeFlipOwnProps, 'span'>

/**
 * Signale une attente par un cube qui bascule face apres face.
 *
 * @example
 * <CubeFlip />
 *
 * @example
 * // Plus grand, plus lent, dans la teinte de marque.
 * <CubeFlip size={56} speed={3600} color="var(--o-palette-brand-500)" />
 */
export function CubeFlip({
  size = 32,
  speed = 2400,
  color = 'currentColor',
  label = 'Chargement',
  ...rest
}: CubeFlipProps): ReactElement {
  ensureCubeFlipRule()

  const { className, style } = mergePresentation({}, rest)

  const loaderStyle = {
    ...style,
    '--o-cube-size': `${String(size)}px`,
    '--o-cube-speed': `${String(speed)}ms`,
    '--o-cube-color': color,
  } as CSSProperties

  return (
    <span
      {...rest}
      className={className}
      style={loaderStyle}
      data-o-cube-flip=""
      role="status"
    >
      <span className="o-sr-only">{label}</span>
      <span aria-hidden data-o-cube-flip-tilt="">
        <span data-o-cube-flip-box="">
          {FACES.map((face) => (
            <span
              key={face.place}
              data-o-cube-flip-face=""
              style={
                {
                  '--o-cube-place': face.place,
                  '--o-cube-shade': `${String(face.shade)}%`,
                } as CSSProperties
              }
            />
          ))}
        </span>
      </span>
    </span>
  )
}

/**
 * Serpent : quatre segments parcourent une grille de quatre par quatre en
 * zigzag, sans jamais se croiser.
 *
 * ## Rien ne se deplace, chaque case s'allume a son tour
 *
 * Deplacer un serpent de case en case demanderait de suivre sa tete en
 * JavaScript, ou une animation de position par segment. Ici les cases sont
 * fixes, et chacune joue la meme animation : allumee un quart du cycle,
 * eteinte le reste. Seule sa phase change, selon son rang sur le chemin.
 * Quatre cases consecutives sont donc allumees a tout instant — c'est le
 * serpent, et il avance sans que rien ne bouge.
 *
 * Le chemin est un zigzag, une ligne dans un sens, la suivante dans
 * l'autre : c'est le seul parcours d'une grille ou la case suivante touche
 * toujours la precedente, et donc le seul ou le serpent reste d'un tenant.
 * Un parcours en lecture — retour a la ligne compris — le couperait en deux
 * a chaque fin de ligne.
 *
 * Les segments sont des carres, pas des points : un serpent est fait de
 * cases qui se touchent, et un rond laisse des vides entre les segments.
 *
 * ## Un statut, pas un dessin
 *
 * L'element porte `role="status"` et un libelle pour les lecteurs d'ecran :
 * l'attente est une information, pas une decoration. La grille est retiree
 * de l'arbre d'accessibilite.
 *
 * Sous mouvement reduit, le serpent reste pose sur les quatre premieres
 * cases du chemin, la grille attenuee derriere lui : la figure se lit encore
 * comme un chargeur, seul le parcours s'arrete.
 *
 * @module
 */

import { mergePresentation, type Customisable } from '@odoro-cli/engine'
import type { CSSProperties, ReactElement } from 'react'

/** Identifiant de la feuille injectee. */
const STYLE_ID = 'o-snake'

/** Cote de la grille, en cases. */
const SIDE = 4

/** Nombre de cases, et donc de pas d'un parcours. */
const CELLS = SIDE * SIDE

/** Longueur du serpent, en cases. */
const LENGTH = 4

/** Pose la grille et l'allumage des cases, une fois par document. */
function ensureSnakeRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-snake]{',
    'display:inline-grid;grid-template-columns:repeat(4,var(--o-snake-size));',
    'gap:calc(var(--o-snake-size) * 0.35);',
    '}',
    '[data-o-snake-cell]{',
    'width:var(--o-snake-size);height:var(--o-snake-size);',
    'border-radius:calc(var(--o-snake-size) * 0.2);',
    'background:var(--o-snake-color);',
    'animation:o-snake-pass var(--o-snake-speed) steps(1,end) infinite;',
    'animation-delay:var(--o-snake-delay);',
    '}',
    // Une case reste allumee un quart du cycle — la longueur du serpent sur
    // seize cases — puis s'eteint d'un coup : `steps` evite tout fondu, un
    // serpent ne s'estompe pas.
    '@keyframes o-snake-pass{',
    '0%{opacity:1}',
    '25%,100%{opacity:0.12}',
    '}',
    // Le serpent pose sur ses quatre premieres cases : la figure se lit
    // encore, sans parcours.
    '@media (prefers-reduced-motion:reduce){',
    '[data-o-snake-cell]{animation:none;opacity:0.12}',
    '[data-o-snake-cell="rest"]{opacity:1}',
    '}',
  ].join('')
  document.head.append(style)
}

/** Proprietes propres au composant. */
export interface SnakeOwnProps {
  /** Cote d'un segment, en pixels. @defaultValue 7 */
  size?: number
  /** Duree d'un parcours complet de la grille, en millisecondes. @defaultValue 1600 */
  speed?: number
  /** Couleur des segments. @defaultValue la couleur du texte */
  color?: string
  /** Libelle annonce aux lecteurs d'ecran. @defaultValue 'Chargement' */
  label?: string
}

/** Toutes les proprietes. */
export type SnakeProps = Customisable<SnakeOwnProps, 'span'>

/**
 * Rang d'une case sur le chemin en zigzag.
 *
 * Les lignes paires se lisent de gauche a droite, les impaires de droite a
 * gauche : la case qui suit la derniere d'une ligne est juste en dessous.
 */
function rank(index: number): number {
  const row = Math.floor(index / SIDE)
  const col = index % SIDE
  return row * SIDE + (row % 2 === 0 ? col : SIDE - 1 - col)
}

/**
 * Signale une attente par un serpent qui parcourt une grille.
 *
 * @example
 * <Snake />
 *
 * @example
 * // Plus gros, plus lent, dans la teinte de marque.
 * <Snake size={12} speed={2400} color="var(--o-palette-brand-500)" />
 */
export function Snake({
  size = 7,
  speed = 1600,
  color = 'currentColor',
  label = 'Chargement',
  ...rest
}: SnakeProps): ReactElement {
  ensureSnakeRule()

  const { className, style } = mergePresentation({}, rest)

  const loaderStyle = {
    ...style,
    '--o-snake-size': `${String(size)}px`,
    '--o-snake-speed': `${String(speed)}ms`,
    '--o-snake-color': color,
  } as CSSProperties

  return (
    <span
      {...rest}
      className={className}
      style={loaderStyle}
      data-o-snake=""
      role="status"
    >
      <span className="o-sr-only">{label}</span>
      {Array.from({ length: CELLS }, (_, index) => {
        const step = rank(index)
        return (
          <span
            key={index}
            aria-hidden
            data-o-snake-cell={step < LENGTH ? 'rest' : ''}
            style={
              {
                // La premiere case du chemin a le plus d'avance, la derniere
                // part de zero : la tete avance d'un rang par pas, en negatif
                // pour que le serpent soit entier a la premiere image.
                '--o-snake-delay': `${String(Math.round((-speed * (CELLS - 1 - step)) / CELLS))}ms`,
              } as CSSProperties
            }
          />
        )
      })}
    </span>
  )
}

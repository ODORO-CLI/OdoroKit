/**
 * Texte en matrice de points : un mot dessine sur une grille de points 5x7,
 * dont les points s'allument de gauche a droite puis s'eteignent dans le
 * meme sens.
 *
 * ## La grille est visible, le mot s'y allume
 *
 * Tous les points de la grille sont dessines, eteints ; seuls ceux du mot
 * portent l'animation. C'est la grille qui fait l'afficheur : sans elle, on
 * verrait des lettres pixelisees, pas un panneau. Et parce que les points
 * eteints sont peints une fois pour toutes, le cout de l'animation ne
 * depend que des points du mot, pas de la surface.
 *
 * Chaque point allume porte le numero de sa colonne dans une variable, et
 * son delai en est deduit : un balayage de gauche a droite ne demande donc
 * qu'une seule animation, declaree une fois. Le delai est negatif, pour que
 * la premiere image soit deja au milieu du balayage plutot qu'une grille
 * vide qui attend.
 *
 * ## Une fonte de trente-cinq points
 *
 * Les glyphes sont une table de sept lignes de cinq bits. Elle couvre les
 * capitales, les chiffres et la ponctuation courante ; le texte est mis en
 * capitales et ses accents retires, parce qu'un accent n'a pas de place
 * dans sept lignes. Un caractere inconnu devient un point d'interrogation :
 * un trou dans le mot se lirait comme un point mort de l'afficheur.
 *
 * ## Un statut, pas un dessin
 *
 * L'element porte `role="status"` et un libelle pour les lecteurs d'ecran.
 * La grille est retiree de l'arbre d'accessibilite : des cercles ne se
 * lisent pas.
 *
 * Sous mouvement reduit, tous les points du mot sont allumes : le panneau
 * se lit encore, seul le balayage s'arrete.
 *
 * @module
 */

import { mergePresentation, type Customisable } from '@odoro-cli/engine'
import type { CSSProperties, ReactElement } from 'react'

/** Identifiant de la feuille injectee. */
const STYLE_ID = 'o-dot-matrix-text'

/** Colonnes et lignes d'un glyphe, et la colonne vide entre deux glyphes. */
const GLYPH_COLS = 5
const GLYPH_ROWS = 7
const PITCH = GLYPH_COLS + 1

/** Part du cycle sur laquelle le front d'allumage traverse le mot. */
const SWEEP_SHARE = 0.45

/**
 * Sept lignes de cinq bits par glyphe, le bit de poids fort a gauche.
 *
 * Une table plutot qu'une fonte : trente-cinq points suffisent a une
 * capitale, et c'est la contrainte qui donne au panneau son caractere.
 */
const FONT: Readonly<Record<string, readonly number[]>> = {
  A: [0x0e, 0x11, 0x11, 0x1f, 0x11, 0x11, 0x11],
  B: [0x1e, 0x11, 0x11, 0x1e, 0x11, 0x11, 0x1e],
  C: [0x0e, 0x11, 0x10, 0x10, 0x10, 0x11, 0x0e],
  D: [0x1c, 0x12, 0x11, 0x11, 0x11, 0x12, 0x1c],
  E: [0x1f, 0x10, 0x10, 0x1e, 0x10, 0x10, 0x1f],
  F: [0x1f, 0x10, 0x10, 0x1e, 0x10, 0x10, 0x10],
  G: [0x0e, 0x11, 0x10, 0x17, 0x11, 0x11, 0x0f],
  H: [0x11, 0x11, 0x11, 0x1f, 0x11, 0x11, 0x11],
  I: [0x0e, 0x04, 0x04, 0x04, 0x04, 0x04, 0x0e],
  J: [0x07, 0x02, 0x02, 0x02, 0x02, 0x12, 0x0c],
  K: [0x11, 0x12, 0x14, 0x18, 0x14, 0x12, 0x11],
  L: [0x10, 0x10, 0x10, 0x10, 0x10, 0x10, 0x1f],
  M: [0x11, 0x1b, 0x15, 0x15, 0x11, 0x11, 0x11],
  N: [0x11, 0x11, 0x19, 0x15, 0x13, 0x11, 0x11],
  O: [0x0e, 0x11, 0x11, 0x11, 0x11, 0x11, 0x0e],
  P: [0x1e, 0x11, 0x11, 0x1e, 0x10, 0x10, 0x10],
  Q: [0x0e, 0x11, 0x11, 0x11, 0x15, 0x12, 0x0d],
  R: [0x1e, 0x11, 0x11, 0x1e, 0x14, 0x12, 0x11],
  S: [0x0f, 0x10, 0x10, 0x0e, 0x01, 0x01, 0x1e],
  T: [0x1f, 0x04, 0x04, 0x04, 0x04, 0x04, 0x04],
  U: [0x11, 0x11, 0x11, 0x11, 0x11, 0x11, 0x0e],
  V: [0x11, 0x11, 0x11, 0x11, 0x11, 0x0a, 0x04],
  W: [0x11, 0x11, 0x11, 0x15, 0x15, 0x15, 0x0a],
  X: [0x11, 0x11, 0x0a, 0x04, 0x0a, 0x11, 0x11],
  Y: [0x11, 0x11, 0x11, 0x0a, 0x04, 0x04, 0x04],
  Z: [0x1f, 0x01, 0x02, 0x04, 0x08, 0x10, 0x1f],
  '0': [0x0e, 0x11, 0x13, 0x15, 0x19, 0x11, 0x0e],
  '1': [0x04, 0x0c, 0x04, 0x04, 0x04, 0x04, 0x0e],
  '2': [0x0e, 0x11, 0x01, 0x02, 0x04, 0x08, 0x1f],
  '3': [0x1f, 0x02, 0x04, 0x02, 0x01, 0x11, 0x0e],
  '4': [0x02, 0x06, 0x0a, 0x12, 0x1f, 0x02, 0x02],
  '5': [0x1f, 0x10, 0x1e, 0x01, 0x01, 0x11, 0x0e],
  '6': [0x06, 0x08, 0x10, 0x1e, 0x11, 0x11, 0x0e],
  '7': [0x1f, 0x01, 0x02, 0x04, 0x08, 0x08, 0x08],
  '8': [0x0e, 0x11, 0x11, 0x0e, 0x11, 0x11, 0x0e],
  '9': [0x0e, 0x11, 0x11, 0x0f, 0x01, 0x02, 0x0c],
  ' ': [0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00],
  '.': [0x00, 0x00, 0x00, 0x00, 0x00, 0x0c, 0x0c],
  ',': [0x00, 0x00, 0x00, 0x00, 0x0c, 0x04, 0x08],
  ':': [0x00, 0x0c, 0x0c, 0x00, 0x0c, 0x0c, 0x00],
  '-': [0x00, 0x00, 0x00, 0x1f, 0x00, 0x00, 0x00],
  '!': [0x04, 0x04, 0x04, 0x04, 0x04, 0x00, 0x04],
  '?': [0x0e, 0x11, 0x01, 0x02, 0x04, 0x00, 0x04],
  '%': [0x18, 0x19, 0x02, 0x04, 0x08, 0x13, 0x03],
  "'": [0x04, 0x04, 0x00, 0x00, 0x00, 0x00, 0x00],
}

/** Le glyphe d'un caractere : capitale sans accent, ou point d'interrogation. */
function glyphOf(char: string): readonly number[] {
  const key = char.normalize('NFD').replace(/\p{M}+/gu, '').toUpperCase()
  return FONT[key] ?? FONT['?'] ?? []
}

/** Pose la grille et son balayage, une fois par document. */
function ensureDotMatrixTextRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-dmt]{display:inline-block;line-height:0}',
    '[data-o-dmt] svg{display:block;overflow:visible}',
    '[data-o-dmt-cell]{fill:currentColor;opacity:0.12}',
    '[data-o-dmt-on]{',
    'animation:o-dmt-light var(--o-dmt-speed) linear infinite;',
    // Le delai est deduit de la colonne : une seule animation pour tout
    // le balayage, et un depart negatif pour ne jamais montrer la grille vide.
    'animation-delay:calc(var(--o-dmt-col) * var(--o-dmt-step) - var(--o-dmt-speed));',
    '}',
    '@keyframes o-dmt-light{0%,6%{opacity:0.12}10%,46%{opacity:1}52%,100%{opacity:0.12}}',
    '@media (prefers-reduced-motion:reduce){',
    '[data-o-dmt-on]{animation:none;opacity:1}',
    '}',
  ].join('')
  document.head.append(style)
}

/** Proprietes propres au composant. */
export interface DotMatrixTextOwnProps {
  /** Le texte dessine ; capitales, chiffres et ponctuation courante. @defaultValue 'Chargement' */
  text?: string
  /** Pas de la grille, d'un point au suivant, en pixels. @defaultValue 4 */
  size?: number
  /** Duree d'un cycle, allumage et extinction compris, en millisecondes. @defaultValue 2400 */
  speed?: number
  /** Couleur des points. @defaultValue la couleur du texte */
  color?: string
  /** Libelle annonce aux lecteurs d'ecran. @defaultValue 'Chargement' */
  label?: string
}

/** Toutes les proprietes. */
export type DotMatrixTextProps = Customisable<DotMatrixTextOwnProps, 'span'>

/**
 * Signale une attente par un mot qui s'allume sur une matrice de points.
 *
 * @example
 * <DotMatrixText />
 *
 * @example
 * // Plus grand, plus lent, dans la teinte de marque.
 * <DotMatrixText text="Envoi" size={6} speed={3200} color="var(--o-palette-brand-500)" />
 */
export function DotMatrixText({
  text = 'Chargement',
  size = 4,
  speed = 2400,
  color = 'currentColor',
  label = 'Chargement',
  ...rest
}: DotMatrixTextProps): ReactElement {
  ensureDotMatrixTextRule()

  const { className, style } = mergePresentation({}, rest)
  const chars = Array.from(text)
  const columns = Math.max(GLYPH_COLS, chars.length * PITCH - 1)
  const radius = size * 0.34

  const cells: { key: number; x: number; y: number; column: number; on: boolean }[] = []
  chars.forEach((char, index) => {
    const rows = glyphOf(char)
    for (let row = 0; row < GLYPH_ROWS; row += 1) {
      const bits = rows[row] ?? 0
      for (let col = 0; col < GLYPH_COLS; col += 1) {
        const column = index * PITCH + col
        cells.push({
          key: row * columns + column,
          x: (column + 0.5) * size,
          y: (row + 0.5) * size,
          column,
          on: ((bits >> (GLYPH_COLS - 1 - col)) & 1) === 1,
        })
      }
    }
  })

  const loaderStyle = {
    ...style,
    '--o-dmt-speed': `${String(speed)}ms`,
    '--o-dmt-step': `${((speed * SWEEP_SHARE) / columns).toFixed(2)}ms`,
    color,
  } as CSSProperties

  return (
    <span {...rest} className={className} style={loaderStyle} data-o-dmt="" role="status">
      <span className="o-sr-only">{label}</span>
      <svg
        aria-hidden
        viewBox={`0 0 ${String(columns * size)} ${String(GLYPH_ROWS * size)}`}
        width={columns * size}
        height={GLYPH_ROWS * size}
      >
        {cells.map((cell) => (
          <circle
            key={cell.key}
            cx={cell.x}
            cy={cell.y}
            r={radius}
            data-o-dmt-cell=""
            {...(cell.on ? { 'data-o-dmt-on': '' } : {})}
            style={cell.on ? ({ '--o-dmt-col': String(cell.column) } as CSSProperties) : undefined}
          />
        ))}
      </svg>
    </span>
  )
}

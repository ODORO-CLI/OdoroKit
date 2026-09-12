/**
 * Tetris : trois pieces tombent cran par cran dans un puits de quatre cases,
 * completent trois lignes qui clignotent, et le puits se vide.
 *
 * ## Une piece est un groupe, pas quatre cases
 *
 * Les cases d'une piece sont posees a leur place finale dans le puits, et
 * c'est le groupe entier qui est translate au-dessus du bord puis ramene
 * cran par cran par `steps()` : une case a la fois, sans interpolation. La
 * chute continue d'une animation lisse ne se lirait pas comme un Tetris ;
 * la saccade, si. Le puits coupe ce qui depasse, donc une piece n'existe
 * visuellement qu'a partir du moment ou elle entre.
 *
 * Trois pieces — un L, un J et un carre — suffisent a remplir exactement
 * trois lignes sur quatre colonnes : douze cases, sans trou. Les lignes
 * pleines clignotent une fois puis s'effacent, comme dans le jeu, et la
 * boucle recommence.
 *
 * Chaque piece connait sa fenetre dans le cycle, par une animation propre
 * ecrite une fois dans la feuille : l'ordre de chute et l'effacement commun
 * l'exigent.
 *
 * ## Un statut, pas un dessin
 *
 * L'element porte `role="status"` et un libelle pour les lecteurs d'ecran :
 * l'attente est une information, pas une decoration. Le puits et ses pieces
 * sont retires de l'arbre d'accessibilite.
 *
 * Sous mouvement reduit, le puits reste rempli : la figure se lit encore,
 * seules la chute et l'effacement s'arretent.
 *
 * @module
 */

import { mergePresentation, type Customisable } from '@odoro-cli/engine'
import type { CSSProperties, ReactElement } from 'react'

/** Identifiant de la feuille injectee. */
const STYLE_ID = 'o-tetris'

/** Cote du puits, en cases. */
const WELL = 4

/**
 * Les pieces, dans l'ordre de chute, comme listes de cases `[colonne, ligne]`
 * ou la ligne zero est en haut du puits.
 *
 * Un L a gauche, un J a droite, et le carre vient combler le milieu : les
 * trois lignes du bas sont pleines, sans trou.
 */
const PIECES: readonly (readonly (readonly [number, number])[])[] = [
  [
    [0, 1],
    [0, 2],
    [0, 3],
    [1, 3],
  ],
  [
    [3, 1],
    [3, 2],
    [3, 3],
    [2, 3],
  ],
  [
    [1, 1],
    [2, 1],
    [1, 2],
    [2, 2],
  ],
]

/** Part du cycle entre deux departs de chute, en pour cent. */
const STEP = 22

/** Duree d'une chute, en pour cent du cycle. */
const DROP = 18

/** Instant ou les lignes pleines commencent a clignoter, en pour cent. */
const CLEAR_AT = 84

/** Pose le puits, les cases et les chutes, une fois par document. */
function ensureTetrisRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    // Le puits : un carre attenue qui coupe ce qui tombe d'au-dessus.
    '[data-o-tetris]{',
    'position:relative;display:inline-block;overflow:hidden;',
    `width:calc(var(--o-tetris-size) * ${String(WELL)});height:calc(var(--o-tetris-size) * ${String(WELL)});`,
    'border-radius:calc(var(--o-tetris-size) / 4);',
    'background:color-mix(in oklab,var(--o-tetris-color) 12%,transparent);',
    '}',
    '[data-o-tetris-piece]{',
    'position:absolute;inset:0;',
    'animation-duration:var(--o-tetris-speed);animation-iteration-count:infinite;',
    '}',
    // Une bordure transparente rognee par le fond : le joint entre deux
    // cases, sans couleur ni calcul.
    '[data-o-tetris-cell]{',
    'position:absolute;width:var(--o-tetris-size);height:var(--o-tetris-size);',
    'box-sizing:border-box;border:1px solid transparent;background-clip:padding-box;',
    'background-color:var(--o-tetris-color);',
    'left:calc(var(--o-tetris-size) * var(--o-tetris-col));',
    'top:calc(var(--o-tetris-size) * var(--o-tetris-row));',
    '}',
    ...PIECES.map((_, piece) => {
      const start = piece * STEP
      const end = start + DROP
      return [
        `[data-o-tetris-piece="${String(piece)}"]{animation-name:o-tetris-${String(piece)}}`,
        `@keyframes o-tetris-${String(piece)}{`,
        // Quatre crans du bord jusqu'a la place finale, un cran a la fois.
        `0%,${String(start)}%{transform:translateY(calc(var(--o-tetris-size) * ${String(-WELL)}));opacity:1;animation-timing-function:steps(${String(WELL)},end)}`,
        `${String(end)}%,${String(CLEAR_AT)}%{transform:none;opacity:1}`,
        `${String(CLEAR_AT + 4)}%{opacity:0.3}`,
        `${String(CLEAR_AT + 8)}%{opacity:1}`,
        `${String(CLEAR_AT + 13)}%,100%{transform:none;opacity:0}`,
        '}',
      ].join('')
    }),
    // Un puits rempli : la figure est dite, sans chute.
    '@media (prefers-reduced-motion:reduce){',
    '[data-o-tetris-piece]{animation:none;transform:none;opacity:1}',
    '}',
  ].join('')
  document.head.append(style)
}

/** Proprietes propres au composant. */
export interface TetrisOwnProps {
  /** Cote d'une case, en pixels. @defaultValue 8 */
  size?: number
  /** Duree d'un cycle complet, en millisecondes. @defaultValue 2600 */
  speed?: number
  /** Couleur des pieces. @defaultValue la couleur du texte */
  color?: string
  /** Libelle annonce aux lecteurs d'ecran. @defaultValue 'Chargement' */
  label?: string
}

/** Toutes les proprietes. */
export type TetrisProps = Customisable<TetrisOwnProps, 'span'>

/**
 * Signale une attente par des pieces qui tombent dans un puits.
 *
 * @example
 * <Tetris />
 *
 * @example
 * // Plus grand, plus lent, dans la teinte de marque.
 * <Tetris size={12} speed={3600} color="var(--o-palette-brand-500)" />
 */
export function Tetris({
  size = 8,
  speed = 2600,
  color = 'currentColor',
  label = 'Chargement',
  ...rest
}: TetrisProps): ReactElement {
  ensureTetrisRule()

  const { className, style } = mergePresentation({}, rest)

  const loaderStyle = {
    ...style,
    '--o-tetris-size': `${String(size)}px`,
    '--o-tetris-speed': `${String(speed)}ms`,
    '--o-tetris-color': color,
  } as CSSProperties

  return (
    <span
      {...rest}
      className={className}
      style={loaderStyle}
      data-o-tetris=""
      role="status"
    >
      <span className="o-sr-only">{label}</span>
      {PIECES.map((cells, piece) => (
        <span key={piece} aria-hidden data-o-tetris-piece={String(piece)}>
          {cells.map(([col, row]) => (
            <span
              key={`${String(col)}-${String(row)}`}
              data-o-tetris-cell=""
              style={
                {
                  '--o-tetris-col': String(col),
                  '--o-tetris-row': String(row),
                } as CSSProperties
              }
            />
          ))}
        </span>
      ))}
    </span>
  )
}

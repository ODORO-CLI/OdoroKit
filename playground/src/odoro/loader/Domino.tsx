/**
 * Dominos : cinq dominos debout tombent l'un sur l'autre, de gauche a
 * droite, puis se relevent ensemble.
 *
 * ## La chute pivote sur le coin, pas sur le centre
 *
 * Un domino qui tombe ne tourne pas autour de son milieu : il bascule sur
 * son arete au sol. L'origine de rotation est donc le coin inferieur droit,
 * et la rotation est en `ease-in` — rien ne le retient, il accelere. Il
 * s'arrete a soixante-cinq degres, incline sur le suivant, et non a plat :
 * un domino tombe s'appuie sur son voisin, c'est ce qui fait lire une
 * chaine plutot qu'une rangee qui se couche.
 *
 * L'ecart entre deux dominos est calcule pour que le sommet d'un domino
 * incline atteigne juste le suivant : plus serre, ils se chevaucheraient ;
 * plus large, la chaine se casserait.
 *
 * Chaque domino connait sa fenetre dans le cycle, par une animation propre
 * ecrite une fois dans la feuille : la chaine a un ordre, et le relevement
 * est commun — la rangee se redresse d'un bloc, en `ease-out`, comme remise
 * en place par une main.
 *
 * ## Un statut, pas un dessin
 *
 * L'element porte `role="status"` et un libelle pour les lecteurs d'ecran :
 * l'attente est une information, pas une decoration. Les dominos sont
 * retires de l'arbre d'accessibilite.
 *
 * Sous mouvement reduit, la rangee reste debout : la figure se lit encore
 * comme des dominos, seule la chute s'arrete.
 *
 * @module
 */

import { mergePresentation, type Customisable } from '@odoro-cli/engine'
import type { CSSProperties, ReactElement } from 'react'

/** Identifiant de la feuille injectee. */
const STYLE_ID = 'o-domino'

/** Nombre de dominos. */
const TILES = 5

/** Hauteur d'un domino, en epaisseurs. */
const HEIGHT = 4

/** Angle de chute, en degres : incline sur le suivant, pas a plat. */
const ANGLE = 65

/**
 * Ecart entre deux dominos, en epaisseurs.
 *
 * Le sommet d'un domino incline avance de `HEIGHT * sin(ANGLE)` ; moins une
 * epaisseur, c'est l'ecart qui l'amene juste contre le suivant.
 */
const GAP = Number((HEIGHT * Math.sin((ANGLE * Math.PI) / 180) - 1).toFixed(2))

/** Part du cycle entre deux departs de chute, en pour cent. */
const STEP = 11

/** Duree d'une chute, en pour cent du cycle. */
const FALL = 12

/** Instant ou la rangee tombee commence a se relever, en pour cent. */
const RAISE_AT = 76

/** Pose les dominos et leurs chutes, une fois par document. */
function ensureDominoRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    // Une marge a droite : le dernier domino incline y deborde.
    '[data-o-domino]{',
    'display:inline-flex;align-items:flex-end;',
    `gap:calc(var(--o-domino-size) * ${String(GAP)});`,
    `height:calc(var(--o-domino-size) * ${String(HEIGHT)});`,
    `padding-right:calc(var(--o-domino-size) * ${String(GAP)});`,
    '}',
    '[data-o-domino-tile]{',
    `width:var(--o-domino-size);height:calc(var(--o-domino-size) * ${String(HEIGHT)});`,
    'border-radius:calc(var(--o-domino-size) / 3);background:var(--o-domino-color);',
    'transform-origin:bottom right;',
    'animation-duration:var(--o-domino-speed);animation-iteration-count:infinite;',
    '}',
    ...Array.from({ length: TILES }, (_, tile) => {
      const start = tile * STEP
      const end = start + FALL
      return [
        `[data-o-domino-tile="${String(tile)}"]{animation-name:o-domino-${String(tile)}}`,
        `@keyframes o-domino-${String(tile)}{`,
        `0%,${String(start)}%{transform:rotate(0);animation-timing-function:ease-in}`,
        `${String(end)}%,${String(RAISE_AT)}%{transform:rotate(${String(ANGLE)}deg);animation-timing-function:ease-out}`,
        `${String(RAISE_AT + 14)}%,100%{transform:rotate(0)}`,
        '}',
      ].join('')
    }),
    // Une rangee debout : la figure est dite, sans chute.
    '@media (prefers-reduced-motion:reduce){',
    '[data-o-domino-tile]{animation:none;transform:none}',
    '}',
  ].join('')
  document.head.append(style)
}

/** Proprietes propres au composant. */
export interface DominoOwnProps {
  /** Epaisseur d'un domino, en pixels. @defaultValue 5 */
  size?: number
  /** Duree d'un cycle complet, en millisecondes. @defaultValue 2000 */
  speed?: number
  /** Couleur des dominos. @defaultValue la couleur du texte */
  color?: string
  /** Libelle annonce aux lecteurs d'ecran. @defaultValue 'Chargement' */
  label?: string
}

/** Toutes les proprietes. */
export type DominoProps = Customisable<DominoOwnProps, 'span'>

/**
 * Signale une attente par une chaine de dominos qui tombent.
 *
 * @example
 * <Domino />
 *
 * @example
 * // Plus epais, plus lent, dans la teinte de marque.
 * <Domino size={8} speed={3000} color="var(--o-palette-brand-500)" />
 */
export function Domino({
  size = 5,
  speed = 2000,
  color = 'currentColor',
  label = 'Chargement',
  ...rest
}: DominoProps): ReactElement {
  ensureDominoRule()

  const { className, style } = mergePresentation({}, rest)

  const loaderStyle = {
    ...style,
    '--o-domino-size': `${String(size)}px`,
    '--o-domino-speed': `${String(speed)}ms`,
    '--o-domino-color': color,
  } as CSSProperties

  return (
    <span
      {...rest}
      className={className}
      style={loaderStyle}
      data-o-domino=""
      role="status"
    >
      <span className="o-sr-only">{label}</span>
      {Array.from({ length: TILES }, (_, tile) => (
        <span key={tile} aria-hidden data-o-domino-tile={String(tile)} />
      ))}
    </span>
  )
}

/**
 * Briques : dix briques se posent une a une, rangee par rangee et en
 * quinconce, jusqu'a former un mur qui s'efface et se rebatit.
 *
 * ## Le quinconce est un decalage de rangee, pas un calcul par brique
 *
 * Un mur se reconnait a ses joints decales. Plutot que de positionner chaque
 * brique, la rangee du milieu compte une brique de plus et se decale d'une
 * demi-brique vers la gauche ; le conteneur coupe ce qui depasse des deux
 * cotes. Trois rangees en flux normal, un seul decalage, et le motif est la.
 *
 * ## Une fenetre par brique
 *
 * La pose a un ordre — le bas d'abord, de gauche a droite — et une fin : le
 * mur tient un instant, puis s'efface d'un bloc. Chaque brique connait donc
 * sa fenetre dans le cycle, par une animation propre ecrite une fois dans la
 * feuille. Une brique arrive d'un peu au-dessus de sa place, en `ease-out` :
 * elle se pose, elle ne surgit pas.
 *
 * ## Un statut, pas un dessin
 *
 * L'element porte `role="status"` et un libelle pour les lecteurs d'ecran :
 * l'attente est une information, pas une decoration. Les briques sont
 * retirees de l'arbre d'accessibilite.
 *
 * Sous mouvement reduit, le mur reste complet : la figure se lit encore,
 * seule la pose s'arrete.
 *
 * @module
 */

import { mergePresentation, type Customisable } from '@odoro-cli/engine'
import type { CSSProperties, ReactElement } from 'react'

/** Identifiant de la feuille injectee. */
const STYLE_ID = 'o-bricks'

/** Nombre de briques par rangee, du bas vers le haut. */
const ROWS: readonly number[] = [3, 4, 3]

/** Nombre total de briques. */
const COUNT = ROWS.reduce((sum, row) => sum + row, 0)

/** Largeur d'une brique, en hauteurs de brique. */
const RATIO = 2.2

/** Joint entre deux briques, en hauteurs de brique. */
const JOINT = 0.25

/** Part du cycle entre deux poses, en pour cent. */
const STEP = 7.5

/** Duree d'une pose, en pour cent du cycle. */
const SETTLE = 6

/** Instant ou le mur complet commence a s'effacer, en pour cent. */
const CLEAR_AT = 86

/** Pose le mur et les fenetres de chaque brique, une fois par document. */
function ensureBricksRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    // Largeur de trois briques et deux joints : la rangee decalee deborde et
    // se fait couper, c'est ce qui dessine les demi-briques des bords.
    '[data-o-bricks]{',
    'display:inline-flex;flex-direction:column-reverse;overflow:hidden;',
    `gap:calc(var(--o-bricks-size) * ${String(JOINT)});`,
    `width:calc(var(--o-bricks-size) * ${String(3 * RATIO + 2 * JOINT)});`,
    '}',
    '[data-o-bricks-row]{',
    `display:flex;gap:calc(var(--o-bricks-size) * ${String(JOINT)});flex:none;`,
    '}',
    `[data-o-bricks-row="offset"]{margin-left:calc(var(--o-bricks-size) * ${String(-(RATIO + JOINT) / 2)})}`,
    '[data-o-brick]{',
    `flex:none;width:calc(var(--o-bricks-size) * ${String(RATIO)});height:var(--o-bricks-size);`,
    'border-radius:calc(var(--o-bricks-size) / 6);background:var(--o-bricks-color);',
    'animation-duration:var(--o-bricks-speed);animation-iteration-count:infinite;',
    '}',
    ...Array.from({ length: COUNT }, (_, brick) => {
      const start = brick * STEP
      const end = start + SETTLE
      return [
        `[data-o-brick="${String(brick)}"]{animation-name:o-bricks-${String(brick)}}`,
        `@keyframes o-bricks-${String(brick)}{`,
        `0%,${String(start)}%{opacity:0;transform:translateY(-60%);animation-timing-function:ease-out}`,
        `${String(end)}%,${String(CLEAR_AT)}%{opacity:1;transform:none}`,
        `${String(CLEAR_AT + 8)}%,100%{opacity:0;transform:none}`,
        '}',
      ].join('')
    }),
    // Un mur complet : la figure est dite, sans pose.
    '@media (prefers-reduced-motion:reduce){',
    '[data-o-brick]{animation:none;opacity:1;transform:none}',
    '}',
  ].join('')
  document.head.append(style)
}

/** Proprietes propres au composant. */
export interface BricksOwnProps {
  /** Hauteur d'une brique, en pixels. @defaultValue 6 */
  size?: number
  /** Duree d'un cycle complet, en millisecondes. @defaultValue 2400 */
  speed?: number
  /** Couleur des briques. @defaultValue la couleur du texte */
  color?: string
  /** Libelle annonce aux lecteurs d'ecran. @defaultValue 'Chargement' */
  label?: string
}

/** Toutes les proprietes. */
export type BricksProps = Customisable<BricksOwnProps, 'span'>

/**
 * Signale une attente par un mur de briques qui se batit et s'efface.
 *
 * @example
 * <Bricks />
 *
 * @example
 * // Plus grand, plus lent, dans la teinte de marque.
 * <Bricks size={10} speed={3600} color="var(--o-palette-brand-500)" />
 */
export function Bricks({
  size = 6,
  speed = 2400,
  color = 'currentColor',
  label = 'Chargement',
  ...rest
}: BricksProps): ReactElement {
  ensureBricksRule()

  const { className, style } = mergePresentation({}, rest)

  const loaderStyle = {
    ...style,
    '--o-bricks-size': `${String(size)}px`,
    '--o-bricks-speed': `${String(speed)}ms`,
    '--o-bricks-color': color,
  } as CSSProperties

  // L'ordre de pose suit l'ordre du DOM : la premiere rangee du DOM est en
  // bas, grace a la colonne inversee.
  let laid = 0

  return (
    <span
      {...rest}
      className={className}
      style={loaderStyle}
      data-o-bricks=""
      role="status"
    >
      <span className="o-sr-only">{label}</span>
      {ROWS.map((count, row) => (
        <span
          key={row}
          aria-hidden
          data-o-bricks-row={row % 2 === 1 ? 'offset' : ''}
        >
          {Array.from({ length: count }, () => {
            const brick = laid
            laid += 1
            return <span key={brick} data-o-brick={String(brick)} />
          })}
        </span>
      ))}
    </span>
  )
}

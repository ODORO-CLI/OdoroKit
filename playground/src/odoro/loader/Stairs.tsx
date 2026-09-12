/**
 * Escalier : cinq marches de hauteur croissante, et un carre qui les gravit
 * en sautant avant de reparaitre en bas.
 *
 * ## L'escalier est fixe, seul le carre bouge
 *
 * Faire monter les marches elles-memes donnerait une rangee de barres de
 * plus — c'est `bars-scale`. Ici l'escalier est un decor attenue, pose une
 * fois, et toute l'animation tient dans une seule translation : celle du
 * carre, qui saute de palier en palier. Une animation au lieu de six, et une
 * figure qui se lit au premier coup d'oeil, parce que le trajet a un sens.
 *
 * Chaque saut est deux demi-courbes : `ease-out` vers l'apex — le carre
 * s'eleve et ralentit — puis `ease-in` jusqu'au palier suivant — il retombe
 * en accelerant. Une seule courbe douce sur tout le saut se lirait comme un
 * glissement, pas comme un bond. Arrive en haut, le carre s'efface, reparait
 * en bas, et recommence : la boucle n'a pas de descente, on ne descend pas
 * un chargement.
 *
 * ## Un statut, pas un dessin
 *
 * L'element porte `role="status"` et un libelle pour les lecteurs d'ecran :
 * l'attente est une information, pas une decoration. Les marches et le
 * carre sont retires de l'arbre d'accessibilite.
 *
 * Sous mouvement reduit, le carre reste pose sur la marche du haut : la
 * figure se lit encore comme un escalier gravi, seul le saut s'arrete.
 *
 * @module
 */

import { mergePresentation, type Customisable } from '@odoro-cli/engine'
import type { CSSProperties, ReactElement } from 'react'

/** Identifiant de la feuille injectee. */
const STYLE_ID = 'o-stairs'

/** Nombre de marches. */
const STEPS = 5

/** Ecart entre deux marches, en largeurs de marche. */
const GAP = 0.25

/** Part du cycle consacree a la montee ; le reste est l'effacement et le retour. */
const CLIMB_SHARE = 0.68

/** Une position du carre : colonne et palier, en largeurs de marche. */
function at(column: number, level: number): string {
  return `transform:translate(calc(var(--o-stairs-size) * ${String(column)}),calc(var(--o-stairs-size) * ${String(-level)}))`
}

/** Pose l'escalier et le trajet du carre, une fois par document. */
function ensureStairsRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  // Un saut par marche a gravir ; chaque saut a un apex a mi-chemin.
  const hops = STEPS - 1
  const hopShare = (CLIMB_SHARE * 100) / hops
  const frames: string[] = []
  for (let hop = 0; hop < hops; hop += 1) {
    const from = hop * (1 + GAP)
    const to = (hop + 1) * (1 + GAP)
    const start = hop * hopShare
    frames.push(
      `${start.toFixed(2)}%{${at(from, hop + 1)};opacity:1;animation-timing-function:ease-out}`,
      `${(start + hopShare / 2).toFixed(2)}%{${at((from + to) / 2, hop + 2.7)};animation-timing-function:ease-in}`,
    )
  }
  const top = hops * (1 + GAP)
  frames.push(
    `${(CLIMB_SHARE * 100).toFixed(2)}%,82%{${at(top, STEPS)};opacity:1}`,
    // Effacement en haut, puis retour invisible en bas, puis reapparition.
    `88%{${at(top, STEPS)};opacity:0}`,
    `89%{${at(0, 1)};opacity:0}`,
    `100%{${at(0, 1)};opacity:1}`,
  )

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    // Deux paliers de marge en haut : l'apex du dernier saut monte dedans.
    '[data-o-stairs]{',
    'position:relative;display:inline-flex;align-items:flex-end;',
    `gap:calc(var(--o-stairs-size) * ${String(GAP)});`,
    `height:calc(var(--o-stairs-size) * ${String(STEPS + 2)});`,
    '}',
    '[data-o-stairs-step]{',
    'width:var(--o-stairs-size);height:calc(var(--o-stairs-size) * var(--o-stairs-level));',
    'border-radius:calc(var(--o-stairs-size) / 5) calc(var(--o-stairs-size) / 5) 0 0;',
    'background:var(--o-stairs-color);opacity:0.3;',
    '}',
    '[data-o-stairs-climber]{',
    'position:absolute;left:0;bottom:0;',
    'width:var(--o-stairs-size);height:var(--o-stairs-size);',
    'border-radius:calc(var(--o-stairs-size) / 5);background:var(--o-stairs-color);',
    'animation:o-stairs-climb var(--o-stairs-speed) infinite;',
    '}',
    `@keyframes o-stairs-climb{${frames.join('')}}`,
    // Le carre en haut de l'escalier : la figure est dite, sans saut.
    '@media (prefers-reduced-motion:reduce){',
    `[data-o-stairs-climber]{animation:none;${at(top, STEPS)}}`,
    '}',
  ].join('')
  document.head.append(style)
}

/** Proprietes propres au composant. */
export interface StairsOwnProps {
  /** Largeur d'une marche, en pixels. @defaultValue 8 */
  size?: number
  /** Duree d'une montee complete, en millisecondes. @defaultValue 2400 */
  speed?: number
  /** Couleur des marches et du carre. @defaultValue la couleur du texte */
  color?: string
  /** Libelle annonce aux lecteurs d'ecran. @defaultValue 'Chargement' */
  label?: string
}

/** Toutes les proprietes. */
export type StairsProps = Customisable<StairsOwnProps, 'span'>

/**
 * Signale une attente par un carre qui gravit un escalier.
 *
 * @example
 * <Stairs />
 *
 * @example
 * // Plus grand, plus lent, dans la teinte de marque.
 * <Stairs size={12} speed={3200} color="var(--o-palette-brand-500)" />
 */
export function Stairs({
  size = 8,
  speed = 2400,
  color = 'currentColor',
  label = 'Chargement',
  ...rest
}: StairsProps): ReactElement {
  ensureStairsRule()

  const { className, style } = mergePresentation({}, rest)

  const loaderStyle = {
    ...style,
    '--o-stairs-size': `${String(size)}px`,
    '--o-stairs-speed': `${String(speed)}ms`,
    '--o-stairs-color': color,
  } as CSSProperties

  return (
    <span
      {...rest}
      className={className}
      style={loaderStyle}
      data-o-stairs=""
      role="status"
    >
      <span className="o-sr-only">{label}</span>
      {Array.from({ length: STEPS }, (_, step) => (
        <span
          key={step}
          aria-hidden
          data-o-stairs-step=""
          style={{ '--o-stairs-level': String(step + 1) } as CSSProperties}
        />
      ))}
      <span aria-hidden data-o-stairs-climber="" />
    </span>
  )
}

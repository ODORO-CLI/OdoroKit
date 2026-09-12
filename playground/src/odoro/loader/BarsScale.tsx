/**
 * Barres en cascade : cinq barres poussent du sol l'une apres l'autre,
 * tiennent, puis retombent ensemble.
 *
 * ## Une fenetre par barre, pas un dephasage
 *
 * Un dephasage par delais negatifs donne une vague qui ne s'arrete jamais —
 * c'est `wave-bars`. Ici la figure a un debut et une fin : les barres
 * montent dans l'ordre, la rangee reste pleine un instant, puis tout retombe
 * d'un coup avant de recommencer. Cela demande que chaque barre connaisse
 * sa place dans le cycle, d'ou une animation par barre, ecrite une fois dans
 * la feuille, dont seules les images cles de montee different.
 *
 * La montee est en `ease-out` — la barre arrive et freine — et la chute en
 * `ease-in` — elle s'effondre en accelerant : c'est le contraste entre les
 * deux qui fait lire une construction, puis une chute, et non un va-et-vient.
 *
 * Les barres sont etirees par une echelle verticale depuis le sol, jamais
 * par une hauteur : rien ne recalcule la mise en page. Un socle de quelques
 * pour cent reste visible entre deux cycles : la rangee ne disparait jamais
 * completement.
 *
 * ## Un statut, pas un dessin
 *
 * L'element porte `role="status"` et un libelle pour les lecteurs d'ecran :
 * l'attente est une information, pas une decoration. Les barres sont
 * retirees de l'arbre d'accessibilite.
 *
 * Sous mouvement reduit, les cinq barres restent pleines, a leur hauteur de
 * fin de montee : la rangee construite se lit encore, seule la cascade
 * s'arrete.
 *
 * @module
 */

import { mergePresentation, type Customisable } from '@odoro-cli/engine'
import type { CSSProperties, ReactElement } from 'react'

/** Identifiant de la feuille injectee. */
const STYLE_ID = 'o-bars-scale'

/** Nombre de barres. */
const BARS = 5

/** Part du cycle entre deux departs de montee, en pour cent. */
const STEP = 14

/** Duree d'une montee, en pour cent du cycle. */
const RISE = 12

/** Instant ou la rangee pleine commence a retomber, en pour cent. */
const FALL_AT = 84

/** Pose les barres et leur cascade, une fois par document. */
function ensureBarsScaleRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-bars-scale]{',
    'display:inline-flex;align-items:flex-end;',
    'gap:calc(var(--o-bscale-size) * 0.8);height:calc(var(--o-bscale-size) * 7);',
    '}',
    '[data-o-bars-scale-bar]{',
    'width:var(--o-bscale-size);height:100%;',
    'border-radius:calc(var(--o-bscale-size) / 3);',
    'background:var(--o-bscale-color);transform-origin:bottom;',
    'animation-duration:var(--o-bscale-speed);animation-iteration-count:infinite;',
    '}',
    // Une fenetre de montee par barre ; la chute est commune a toutes.
    ...Array.from({ length: BARS }, (_, bar) => {
      const start = bar * STEP
      const end = start + RISE
      return [
        `[data-o-bars-scale-bar="${String(bar)}"]{animation-name:o-bars-scale-${String(bar)}}`,
        `@keyframes o-bars-scale-${String(bar)}{`,
        `0%,${String(start)}%{transform:scaleY(0.08);animation-timing-function:ease-out}`,
        `${String(end)}%,${String(FALL_AT)}%{transform:scaleY(1);animation-timing-function:ease-in}`,
        `${String(FALL_AT + 8)}%,100%{transform:scaleY(0.08)}`,
        '}',
      ].join('')
    }),
    // Une rangee pleine : la figure construite reste dite, sans cascade.
    '@media (prefers-reduced-motion:reduce){',
    '[data-o-bars-scale-bar]{animation:none;transform:scaleY(1)}',
    '}',
  ].join('')
  document.head.append(style)
}

/** Proprietes propres au composant. */
export interface BarsScaleOwnProps {
  /** Largeur d'une barre, en pixels. @defaultValue 5 */
  size?: number
  /** Duree d'un cycle complet, en millisecondes. @defaultValue 1800 */
  speed?: number
  /** Couleur des barres. @defaultValue la couleur du texte */
  color?: string
  /** Libelle annonce aux lecteurs d'ecran. @defaultValue 'Chargement' */
  label?: string
}

/** Toutes les proprietes. */
export type BarsScaleProps = Customisable<BarsScaleOwnProps, 'span'>

/**
 * Signale une attente par cinq barres qui poussent en cascade et retombent.
 *
 * @example
 * <BarsScale />
 *
 * @example
 * // Plus large, plus lent, dans la teinte de marque.
 * <BarsScale size={8} speed={2600} color="var(--o-palette-brand-500)" />
 */
export function BarsScale({
  size = 5,
  speed = 1800,
  color = 'currentColor',
  label = 'Chargement',
  ...rest
}: BarsScaleProps): ReactElement {
  ensureBarsScaleRule()

  const { className, style } = mergePresentation({}, rest)

  const loaderStyle = {
    ...style,
    '--o-bscale-size': `${String(size)}px`,
    '--o-bscale-speed': `${String(speed)}ms`,
    '--o-bscale-color': color,
  } as CSSProperties

  return (
    <span
      {...rest}
      className={className}
      style={loaderStyle}
      data-o-bars-scale=""
      role="status"
    >
      <span className="o-sr-only">{label}</span>
      {Array.from({ length: BARS }, (_, bar) => (
        <span key={bar} aria-hidden data-o-bars-scale-bar={String(bar)} />
      ))}
    </span>
  )
}

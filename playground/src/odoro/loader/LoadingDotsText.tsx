/**
 * Chargement, puis des points : le mot reste, trois points s'ajoutent l'un
 * apres l'autre, puis disparaissent ensemble.
 *
 * ## Les points s'ajoutent, ils ne clignotent pas
 *
 * La version naive fait clignoter chaque point a sa cadence : trois lueurs
 * independantes, qui ne racontent rien. Ici la sequence est celle qu'on
 * ecrirait a la main — « Chargement », « Chargement. », « Chargement.. »,
 * « Chargement... » — puis la ligne revient au mot seul. C'est une phrase
 * qui se complete, pas un signal qui bat.
 *
 * Chaque point porte sa propre animation par paliers : le premier s'allume
 * au quart du cycle, le deuxieme a la moitie, le troisieme aux trois quarts,
 * et tous s'eteignent a la fin. Trois jeux d'images-cles plutot qu'un seul
 * decale : un delai ne suffirait pas, parce que la duree d'allumage differe
 * d'un point a l'autre.
 *
 * Les points sont dans le flux, a leur largeur reelle, meme invisibles : la
 * ligne ne change pas de longueur, et ce qui suit ne bouge pas.
 *
 * ## Un statut, pas un dessin
 *
 * L'element porte `role="status"` et un libelle pour les lecteurs d'ecran.
 * Le texte peint est retire de l'arbre d'accessibilite : un lecteur d'ecran
 * qui suivrait les points annoncerait la ligne a chaque changement.
 *
 * Sous mouvement reduit, les trois points restent affiches : « Chargement... »
 * se lit encore comme une attente, seul le rythme s'arrete.
 *
 * @module
 */

import { mergePresentation, type Customisable } from '@odoro-cli/engine'
import type { CSSProperties, ReactElement } from 'react'

/** Identifiant de la feuille injectee. */
const STYLE_ID = 'o-loading-dots-text'

/** Pose la ligne et ses trois paliers, une fois par document. */
function ensureLoadingDotsTextRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-ldt]{',
    'display:inline-block;white-space:nowrap;',
    'font-size:var(--o-ldt-size);color:var(--o-ldt-color);',
    '}',
    '[data-o-ldt-dot]{',
    'display:inline-block;',
    'animation-duration:var(--o-ldt-speed);',
    'animation-timing-function:steps(1,end);',
    'animation-iteration-count:infinite;',
    '}',
    // Trois jeux d'images-cles : chaque point s'allume a son quart et reste
    // allume jusqu'a la fin du cycle. Un seul jeu decale ne convient pas,
    // la duree d'allumage n'est pas la meme pour les trois.
    '[data-o-ldt-dot="1"]{animation-name:o-ldt-dot-1}',
    '[data-o-ldt-dot="2"]{animation-name:o-ldt-dot-2}',
    '[data-o-ldt-dot="3"]{animation-name:o-ldt-dot-3}',
    '@keyframes o-ldt-dot-1{0%{opacity:0}25%,100%{opacity:1}}',
    '@keyframes o-ldt-dot-2{0%,25%{opacity:0}50%,100%{opacity:1}}',
    '@keyframes o-ldt-dot-3{0%,50%{opacity:0}75%,100%{opacity:1}}',
    '@media (prefers-reduced-motion:reduce){',
    '[data-o-ldt-dot]{animation:none;opacity:1}',
    '}',
  ].join('')
  document.head.append(style)
}

/** Proprietes propres au composant. */
export interface LoadingDotsTextOwnProps {
  /** Le mot affiche, avant les points. @defaultValue 'Chargement' */
  text?: string
  /** Corps du texte, en pixels. @defaultValue 16 */
  size?: number
  /** Duree d'un cycle, en millisecondes. @defaultValue 1600 */
  speed?: number
  /** Couleur du texte. @defaultValue la couleur du texte */
  color?: string
  /** Libelle annonce aux lecteurs d'ecran. @defaultValue 'Chargement' */
  label?: string
}

/** Toutes les proprietes. */
export type LoadingDotsTextProps = Customisable<LoadingDotsTextOwnProps, 'span'>

/**
 * Signale une attente par un mot que des points viennent completer.
 *
 * @example
 * <LoadingDotsText />
 *
 * @example
 * // Un autre mot, plus lent, dans la teinte de marque.
 * <LoadingDotsText text="Envoi" speed={2400} color="var(--o-palette-brand-500)" />
 */
export function LoadingDotsText({
  text = 'Chargement',
  size = 16,
  speed = 1600,
  color = 'currentColor',
  label = 'Chargement',
  ...rest
}: LoadingDotsTextProps): ReactElement {
  ensureLoadingDotsTextRule()

  const { className, style } = mergePresentation({}, rest)

  const loaderStyle = {
    ...style,
    '--o-ldt-size': `${String(size)}px`,
    '--o-ldt-speed': `${String(speed)}ms`,
    '--o-ldt-color': color,
  } as CSSProperties

  return (
    <span {...rest} className={className} style={loaderStyle} data-o-ldt="" role="status">
      <span className="o-sr-only">{label}</span>
      <span aria-hidden>
        {text}
        <span data-o-ldt-dot="1">.</span>
        <span data-o-ldt-dot="2">.</span>
        <span data-o-ldt-dot="3">.</span>
      </span>
    </span>
  )
}

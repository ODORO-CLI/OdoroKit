/**
 * Curseur qui frappe : un mot se tape caractere par caractere derriere un
 * curseur qui clignote, tient, puis s'efface.
 *
 * ## Une frappe sans minuteur
 *
 * La machine a ecrire de la categorie texte joue des phrases entieres avec un
 * minuteur, parce qu'elle possede un rythme et des etapes. Un chargeur n'a
 * besoin ni de l'un ni des autres : un seul mot, en boucle, dont la seule
 * information est « ca travaille ». Il tient donc en CSS.
 *
 * Le mecanisme est une largeur qui grandit par paliers, autant de paliers que
 * de caracteres, sur un texte qui ne coupe pas et deborde masque. Cela exige
 * une fonte a chasse fixe : c'est elle qui fait qu'un palier vaut exactement
 * un caractere, et que la largeur finale se calcule en `ch` sans mesurer
 * quoi que ce soit. La fonte mono du systeme est prise pour cela.
 *
 * Le curseur est la bordure droite du meme element : il suit la frappe sans
 * qu'on le positionne. Il clignote sur sa propre animation, plus courte que
 * le cycle, et continue pendant la tenue — c'est ce qui dit que rien n'est
 * fige.
 *
 * L'effacement se fait par les memes paliers, a rebours : la ligne rentre
 * comme elle est sortie, et le cycle se referme sur un curseur seul.
 *
 * ## Un statut, pas un dessin
 *
 * L'element porte `role="status"` et un libelle pour les lecteurs d'ecran.
 * Le texte peint est retire de l'arbre d'accessibilite : masque par sa
 * largeur, il serait lu tronque ou complet selon l'instant.
 *
 * Sous mouvement reduit, le mot est complet et le curseur fixe : la ligne
 * se lit encore comme une saisie en cours, seule la frappe s'arrete.
 *
 * @module
 */

import { mergePresentation, type Customisable } from '@odoro-cli/engine'
import type { CSSProperties, ReactElement } from 'react'

/** Identifiant de la feuille injectee. */
const STYLE_ID = 'o-typing-cursor'

/** Pose la ligne, sa frappe et son curseur, une fois par document. */
function ensureTypingCursorRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-tc]{',
    'display:inline-block;line-height:1.3;',
    'font-family:var(--o-font-mono);font-size:var(--o-tc-size);color:var(--o-tc-color);',
    '}',
    '[data-o-tc-line]{',
    'display:inline-block;overflow:hidden;white-space:nowrap;vertical-align:bottom;',
    'box-sizing:content-box;width:var(--o-tc-width);padding-right:0.1em;',
    'border-right:0.09em solid currentColor;',
    'animation-name:o-tc-type,o-tc-blink;',
    'animation-duration:var(--o-tc-speed),800ms;',
    // Un palier par caractere pour la frappe ; un seul cran pour le curseur,
    // qui est allume ou eteint, jamais entre les deux.
    'animation-timing-function:steps(var(--o-tc-steps),end),steps(1,end);',
    'animation-iteration-count:infinite,infinite;',
    '}',
    // Frappe sur le premier tiers et demi, tenue, puis effacement a rebours.
    '@keyframes o-tc-type{0%{width:0}45%,72%{width:var(--o-tc-width)}100%{width:0}}',
    '@keyframes o-tc-blink{0%,100%{border-color:currentColor}50%{border-color:transparent}}',
    '@media (prefers-reduced-motion:reduce){',
    '[data-o-tc-line]{animation:none;width:var(--o-tc-width)}',
    '}',
  ].join('')
  document.head.append(style)
}

/** Proprietes propres au composant. */
export interface TypingCursorOwnProps {
  /** Le texte frappe. @defaultValue 'Chargement' */
  text?: string
  /** Corps du texte, en pixels. @defaultValue 16 */
  size?: number
  /** Duree d'un cycle, frappe, tenue et effacement, en millisecondes. @defaultValue 3200 */
  speed?: number
  /** Couleur du texte et du curseur. @defaultValue la couleur du texte */
  color?: string
  /** Libelle annonce aux lecteurs d'ecran. @defaultValue 'Chargement' */
  label?: string
}

/** Toutes les proprietes. */
export type TypingCursorProps = Customisable<TypingCursorOwnProps, 'span'>

/**
 * Signale une attente par un mot qui se tape derriere un curseur.
 *
 * @example
 * <TypingCursor />
 *
 * @example
 * // Un autre mot, plus lent, dans la teinte de marque.
 * <TypingCursor text="Connexion" speed={4200} color="var(--o-palette-brand-500)" />
 */
export function TypingCursor({
  text = 'Chargement',
  size = 16,
  speed = 3200,
  color = 'currentColor',
  label = 'Chargement',
  ...rest
}: TypingCursorProps): ReactElement {
  ensureTypingCursorRule()

  const { className, style } = mergePresentation({}, rest)
  const count = Math.max(1, Array.from(text).length)

  const loaderStyle = {
    ...style,
    '--o-tc-size': `${String(size)}px`,
    '--o-tc-speed': `${String(speed)}ms`,
    '--o-tc-width': `${String(count)}ch`,
    '--o-tc-steps': String(count),
    '--o-tc-color': color,
  } as CSSProperties

  return (
    <span {...rest} className={className} style={loaderStyle} data-o-tc="" role="status">
      <span className="o-sr-only">{label}</span>
      <span aria-hidden data-o-tc-line="">
        {text}
      </span>
    </span>
  )
}

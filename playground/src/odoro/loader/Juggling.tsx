/**
 * Jonglage : trois balles passent d'une main a l'autre, une passe basse
 * dans un sens, un grand arc dans l'autre.
 *
 * ## Pourquoi une douche, et pas une cascade
 *
 * La figure classique — la cascade, ou chaque balle decrit le meme arc dans
 * les deux sens — ne se laisse pas rejouer par trois copies decalees d'une
 * meme animation : deux balles finissent par se croiser au meme point, a la
 * meme hauteur, et se traversent. La douche, elle, n'a pas ce probleme :
 * une main envoie haut, l'autre rend bas et vite, les deux trajets ne se
 * rencontrent jamais. C'est aussi la figure la plus lisible a cette taille,
 * parce que l'oeil suit un seul grand arc.
 *
 * Chaque balle porte deux animations sur deux elements emboites : le
 * deplacement horizontal, lineaire — rien ne freine une balle de cote — et
 * le deplacement vertical, en `ease-out` a la montee et `ease-in` a la
 * descente, ce qui est une parabole a peu de chose pres. Les separer permet
 * de leur donner des courbes differentes ; une seule animation devrait
 * choisir.
 *
 * Les balles restent un instant dans chaque main avant de repartir : sans
 * ce temps de prise, elles rebondiraient au lieu d'etre lancees.
 *
 * ## Un statut, pas un dessin
 *
 * L'element porte `role="status"` et un libelle pour les lecteurs d'ecran :
 * l'attente est une information, pas une decoration. Les balles sont
 * retirees de l'arbre d'accessibilite.
 *
 * Sous mouvement reduit, les trois balles sont posees en ligne, en bas : la
 * figure se lit encore, seul le lancer s'arrete.
 *
 * @module
 */

import { mergePresentation, type Customisable } from '@odoro-cli/engine'
import type { CSSProperties, ReactElement } from 'react'

/** Identifiant de la feuille injectee. */
const STYLE_ID = 'o-juggling'

/** Nombre de balles. */
const BALLS = 3

/** Distance entre les deux mains, en diametres de balle. */
const SPAN = 3

/** Hauteur du grand arc, en diametres de balle. */
const ARC = 3

/** Hauteur de la passe basse, en part du grand arc. */
const PASS = 0.35

/** Pose les balles et leurs deux trajets, une fois par document. */
function ensureJugglingRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-juggling]{',
    'position:relative;display:inline-block;',
    `width:calc(var(--o-juggle-size) * ${String(SPAN + 1)});`,
    `height:calc(var(--o-juggle-size) * ${String(ARC + 1)});`,
    '}',
    // L'element exterieur porte le trajet horizontal ; au repos, chaque
    // balle a sa place en bas, pour que les trois ne se superposent pas.
    '[data-o-juggle-path]{',
    'position:absolute;left:0;bottom:0;',
    'width:var(--o-juggle-size);height:var(--o-juggle-size);',
    'transform:translateX(var(--o-juggle-rest));',
    'animation:o-juggling-across var(--o-juggle-speed) linear infinite;',
    'animation-delay:var(--o-juggle-delay);',
    '}',
    // L'element interieur porte la hauteur, avec ses propres courbes.
    '[data-o-juggle-ball]{',
    'display:block;width:100%;height:100%;',
    'border-radius:50%;background:var(--o-juggle-color);',
    'animation:o-juggling-height var(--o-juggle-speed) infinite;',
    'animation-delay:var(--o-juggle-delay);',
    '}',
    // Passe basse de gauche a droite, prise, grand arc de droite a gauche,
    // prise. Le trajet est lineaire : rien ne freine une balle de cote.
    '@keyframes o-juggling-across{',
    '0%,6%{transform:translateX(0)}',
    `26%,36%{transform:translateX(calc(var(--o-juggle-size) * ${String(SPAN)}))}`,
    '92%,100%{transform:translateX(0)}',
    '}',
    // Montee en ralentissant, descente en accelerant : une parabole a peu
    // de chose pres, et deux hauteurs differentes selon le sens.
    '@keyframes o-juggling-height{',
    '0%,6%{transform:translateY(0);animation-timing-function:ease-out}',
    `16%{transform:translateY(calc(var(--o-juggle-size) * -${String(ARC * PASS)}));animation-timing-function:ease-in}`,
    '26%,36%{transform:translateY(0);animation-timing-function:ease-out}',
    `64%{transform:translateY(calc(var(--o-juggle-size) * -${String(ARC)}));animation-timing-function:ease-in}`,
    '92%,100%{transform:translateY(0)}',
    '}',
    // Trois balles posees en ligne : la figure est dite, sans lancer.
    '@media (prefers-reduced-motion:reduce){',
    '[data-o-juggle-path],[data-o-juggle-ball]{animation:none}',
    '[data-o-juggle-ball]{transform:none}',
    '}',
  ].join('')
  document.head.append(style)
}

/** Proprietes propres au composant. */
export interface JugglingOwnProps {
  /** Diametre d'une balle, en pixels. @defaultValue 10 */
  size?: number
  /** Duree d'un tour complet d'une balle, en millisecondes. @defaultValue 1800 */
  speed?: number
  /** Couleur des balles. @defaultValue la couleur du texte */
  color?: string
  /** Libelle annonce aux lecteurs d'ecran. @defaultValue 'Chargement' */
  label?: string
}

/** Toutes les proprietes. */
export type JugglingProps = Customisable<JugglingOwnProps, 'span'>

/**
 * Signale une attente par trois balles jonglees.
 *
 * @example
 * <Juggling />
 *
 * @example
 * // Plus grosses, plus lentes, dans la teinte de marque.
 * <Juggling size={14} speed={2600} color="var(--o-palette-brand-500)" />
 */
export function Juggling({
  size = 10,
  speed = 1800,
  color = 'currentColor',
  label = 'Chargement',
  ...rest
}: JugglingProps): ReactElement {
  ensureJugglingRule()

  const { className, style } = mergePresentation({}, rest)

  const loaderStyle = {
    ...style,
    '--o-juggle-size': `${String(size)}px`,
    '--o-juggle-speed': `${String(speed)}ms`,
    '--o-juggle-color': color,
  } as CSSProperties

  return (
    <span
      {...rest}
      className={className}
      style={loaderStyle}
      data-o-juggling=""
      role="status"
    >
      <span className="o-sr-only">{label}</span>
      {Array.from({ length: BALLS }, (_, ball) => (
        <span
          key={ball}
          aria-hidden
          data-o-juggle-path=""
          style={
            {
              // Un tiers de tour d'ecart, en negatif : les trois balles
              // sont en l'air ou en main des la premiere image.
              '--o-juggle-delay': `${String(Math.round((-speed * ball) / BALLS))}ms`,
              '--o-juggle-rest': `${String((size * SPAN * ball) / (BALLS - 1))}px`,
            } as CSSProperties
          }
        >
          <span data-o-juggle-ball="" />
        </span>
      ))}
    </span>
  )
}

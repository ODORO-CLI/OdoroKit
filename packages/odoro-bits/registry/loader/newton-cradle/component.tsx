/**
 * Pendule de Newton : cinq billes suspendues, celle de gauche frappe, celle
 * de droite s'envole, et retour.
 *
 * ## Deux billes bougent, trois ne bougent jamais
 *
 * C'est l'objet reel qui l'impose : dans un pendule de Newton, seules les
 * billes des extremites se balancent, les autres transmettent le choc sans
 * broncher. Le composant respecte cela — deux animations, pas cinq — et
 * c'est aussi ce qui le rend credible : un pendule ou tout bougerait ne
 * serait plus un pendule.
 *
 * Le cycle est un enchainement, pas une oscillation symetrique. La bille de
 * gauche tombe en accelerant et s'arrete net sur ses voisines ; a cet
 * instant precis la bille de droite part, ralentit au sommet, retombe. Les
 * courbes sont posees image cle par image cle : `ease-in` pour une chute,
 * `ease-out` pour une montee. Un `ease-in-out` global ferait flotter les
 * billes, et le choc — ce qui fait tout l'interet de la figure — n'aurait
 * plus lieu.
 *
 * Chaque bille pend a un fil, et tourne autour du point d'attache : la
 * rotation est celle du fil entier, la bille suit.
 *
 * ## Un statut, pas un dessin
 *
 * L'element porte `role="status"` et un libelle pour les lecteurs d'ecran :
 * l'attente est une information, pas une decoration. Le pendule est retire
 * de l'arbre d'accessibilite.
 *
 * Sous mouvement reduit, les cinq billes pendent alignees, au repos : c'est
 * l'etat ou le pendule revient a chaque choc, et la figure se reconnait
 * encore.
 *
 * @module
 */

import { mergePresentation, type Customisable } from '@odoro-cli/engine'
import type { CSSProperties, ReactElement } from 'react'

/** Identifiant de la feuille injectee. */
const STYLE_ID = 'o-newton-cradle'

/** Pose le pendule et ses deux balancements, une fois par document. */
function ensureCradleRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    // Le conteneur laisse de la marge de chaque cote : a trente-huit degres,
    // un fil de quatre billes de long s'ecarte d'environ deux billes et
    // demie, et la bille levee ne doit pas mordre sur ses voisins de page.
    '[data-o-newton-cradle]{',
    'position:relative;display:inline-flex;align-items:flex-start;',
    'padding:0 calc(var(--o-cradle-size) * 2.5);',
    'border-top:2px solid var(--o-cradle-color);',
    '}',
    // Un fil et sa bille tournent ensemble, autour du point d'attache.
    '[data-o-newton-arm]{',
    'display:flex;flex-direction:column;align-items:center;',
    'width:var(--o-cradle-size);transform-origin:50% 0;',
    'animation-duration:var(--o-cradle-speed);animation-iteration-count:infinite;',
    '}',
    '[data-o-newton-arm="left"]{animation-name:o-newton-cradle-left}',
    '[data-o-newton-arm="right"]{animation-name:o-newton-cradle-right}',
    '[data-o-newton-thread]{',
    'width:1px;height:calc(var(--o-cradle-size) * 3);',
    'background:var(--o-cradle-color);opacity:0.5;',
    '}',
    '[data-o-newton-ball]{',
    'width:var(--o-cradle-size);height:var(--o-cradle-size);',
    'border-radius:50%;background:var(--o-cradle-color);',
    '}',
    // Gauche : deja levee au depart, elle tombe (ease-in), attend le retour
    // du choc, et remonte (ease-out) pour recommencer.
    '@keyframes o-newton-cradle-left{',
    '0%{transform:rotate(38deg);animation-timing-function:ease-in}',
    '25%,75%{transform:rotate(0deg);animation-timing-function:ease-out}',
    '100%{transform:rotate(38deg)}',
    '}',
    // Droite : immobile jusqu'au choc, elle part (ease-out), culmine, et
    // retombe (ease-in) sur ses voisines.
    '@keyframes o-newton-cradle-right{',
    '0%,25%{transform:rotate(0deg);animation-timing-function:ease-out}',
    '50%{transform:rotate(-38deg);animation-timing-function:ease-in}',
    '75%,100%{transform:rotate(0deg)}',
    '}',
    // Cinq billes alignees : le pendule au repos, reconnaissable.
    '@media (prefers-reduced-motion:reduce){',
    '[data-o-newton-arm]{animation:none;transform:none}',
    '}',
  ].join('')
  document.head.append(style)
}

/** Proprietes propres au composant. */
export interface NewtonCradleOwnProps {
  /** Diametre d'une bille, en pixels. @defaultValue 10 */
  size?: number
  /** Duree d'un aller-retour complet, en millisecondes. @defaultValue 1400 */
  speed?: number
  /** Couleur des billes, des fils et de la barre. @defaultValue la couleur du texte */
  color?: string
  /** Libelle annonce aux lecteurs d'ecran. @defaultValue 'Chargement' */
  label?: string
}

/** Toutes les proprietes. */
export type NewtonCradleProps = Customisable<NewtonCradleOwnProps, 'span'>

/** Role de chaque bras : seules les extremites se balancent. */
const ARMS = ['left', 'still', 'still', 'still', 'right'] as const

/**
 * Signale une attente par un pendule de Newton.
 *
 * @example
 * <NewtonCradle />
 *
 * @example
 * // Plus gros, plus lent, dans la teinte de marque.
 * <NewtonCradle size={14} speed={2000} color="var(--o-palette-brand-500)" />
 */
export function NewtonCradle({
  size = 10,
  speed = 1400,
  color = 'currentColor',
  label = 'Chargement',
  ...rest
}: NewtonCradleProps): ReactElement {
  ensureCradleRule()

  const { className, style } = mergePresentation({}, rest)

  const loaderStyle = {
    ...style,
    '--o-cradle-size': `${String(size)}px`,
    '--o-cradle-speed': `${String(speed)}ms`,
    '--o-cradle-color': color,
  } as CSSProperties

  return (
    <span
      {...rest}
      className={className}
      style={loaderStyle}
      data-o-newton-cradle=""
      role="status"
    >
      <span className="o-sr-only">{label}</span>
      {ARMS.map((arm, index) => (
        <span key={index} aria-hidden data-o-newton-arm={arm}>
          <span data-o-newton-thread="" />
          <span data-o-newton-ball="" />
        </span>
      ))}
    </span>
  )
}

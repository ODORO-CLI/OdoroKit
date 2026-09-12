/**
 * Pales de ventilateur : des pales courbes tournent a vitesse constante
 * dans un carter circulaire, autour d'un moyeu.
 *
 * ## Une pale, dessinee une fois
 *
 * La pale est un seul trace : elle part du moyeu, s'evase en courbe vers
 * le carter et revient par une courbe plus tendue. Ce dessin en faucille
 * est ce qui la distingue d'un petale ou d'un triangle : une pale a un bord
 * d'attaque et un bord de fuite, et l'oeil lit le sens de rotation avant
 * meme qu'elle bouge. Les autres pales sont des copies tournees d'un
 * angle egal autour du moyeu.
 *
 * La rotation est lineaire, a dessein. Un ventilateur en marche ne
 * s'essouffle pas ; c'est `pinwheel` qui tourne par rafales. Le carter et
 * le moyeu ne bougent pas : ils donnent le cadre dans lequel la rotation se
 * mesure.
 *
 * Une seule animation, sur le groupe des pales, tenue par le compositeur.
 * Aucun JavaScript apres le premier rendu.
 *
 * ## Un statut, pas un dessin
 *
 * L'element porte `role="status"` et un libelle pour les lecteurs d'ecran :
 * l'attente est une information, pas une decoration. Le dessin est retire
 * de l'arbre d'accessibilite.
 *
 * Sous mouvement reduit, les pales restent immobiles dans leur carter : la
 * figure se lit encore comme un chargeur, seul le mouvement s'arrete.
 *
 * @module
 */

import { mergePresentation, type Customisable } from '@odoro-cli/engine'
import type { CSSProperties, ReactElement } from 'react'

/** Identifiant de la feuille injectee. */
const STYLE_ID = 'o-fan-blades'

/**
 * Une pale pointant vers le haut, du moyeu (50, 50) au carter, dans une
 * vue de 100 unites. Le bord d'attaque est la courbe large, le bord de
 * fuite la courbe tendue qui revient au moyeu.
 */
const BLADE = 'M 50 50 C 36 30 52 6 72 16 C 82 24 76 44 50 50 Z'

/** Pose le ventilateur et sa rotation, une fois par document. */
function ensureFanRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-fan-blades]{display:inline-block;line-height:0}',
    '[data-o-fan-blades] svg{display:block}',
    '[data-o-fan-rotor]{',
    'transform-box:view-box;transform-origin:50px 50px;',
    'animation:o-fan-blades-spin var(--o-fan-speed) linear infinite;',
    '}',
    '[data-o-fan-guard]{opacity:0.25}',
    '@keyframes o-fan-blades-spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}',
    '@media (prefers-reduced-motion:reduce){',
    '[data-o-fan-rotor]{animation:none;transform:none}',
    '}',
  ].join('')
  document.head.append(style)
}

/** Proprietes propres au composant. */
export interface FanBladesOwnProps {
  /** Diametre du carter, en pixels. @defaultValue 48 */
  size?: number
  /** Nombre de pales. @defaultValue 3 */
  blades?: number
  /** Duree d'un tour, en millisecondes. @defaultValue 1400 */
  speed?: number
  /** Couleur des pales, du moyeu et du carter. @defaultValue la couleur du texte */
  color?: string
  /** Libelle annonce aux lecteurs d'ecran. @defaultValue 'Chargement' */
  label?: string
}

/** Toutes les proprietes. */
export type FanBladesProps = Customisable<FanBladesOwnProps, 'span'>

/**
 * Signale une attente par des pales qui tournent dans leur carter.
 *
 * @example
 * <FanBlades />
 *
 * @example
 * // Cinq pales, plus vite, dans la teinte de marque.
 * <FanBlades blades={5} speed={900} color="var(--o-palette-brand-500)" />
 */
export function FanBlades({
  size = 48,
  blades = 3,
  speed = 1400,
  color = 'currentColor',
  label = 'Chargement',
  ...rest
}: FanBladesProps): ReactElement {
  ensureFanRule()

  const { className, style } = mergePresentation({}, rest)

  const count = Math.max(2, Math.round(blades))

  const loaderStyle = {
    ...style,
    width: `${String(size)}px`,
    height: `${String(size)}px`,
    color,
    '--o-fan-speed': `${String(speed)}ms`,
  } as CSSProperties

  return (
    <span
      {...rest}
      className={className}
      style={loaderStyle}
      data-o-fan-blades=""
      role="status"
    >
      <span className="o-sr-only">{label}</span>
      <svg aria-hidden viewBox="0 0 100 100" width="100%" height="100%">
        <circle
          data-o-fan-guard=""
          cx="50"
          cy="50"
          r="47"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
        />
        <g data-o-fan-rotor="">
          {Array.from({ length: count }, (_, index) => (
            <path
              key={index}
              d={BLADE}
              fill="currentColor"
              transform={`rotate(${String((index * 360) / count)} 50 50)`}
            />
          ))}
          <circle cx="50" cy="50" r="9" fill="currentColor" />
        </g>
      </svg>
    </span>
  )
}

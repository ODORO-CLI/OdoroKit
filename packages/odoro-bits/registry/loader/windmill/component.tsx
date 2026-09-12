/**
 * Moulin a vent : quatre ailes a claire-voie tournent sur leur tour, au
 * rythme d'un vent qui souffle par rafales.
 *
 * ## Le vent n'est pas constant, la tour ne bouge pas
 *
 * Un ventilateur tourne a vitesse constante parce qu'un moteur l'entraine.
 * Un moulin, lui, depend du vent, et le vent vient par bouffees : les
 * ailes prennent de l'elan, tiennent un moment, puis perdent leur vitesse
 * jusqu'a presque s'arreter, et la rafale suivante les relance. C'est ce
 * que posent les images cles d'un tour : une prise en `ease-in`, un
 * plateau lineaire, une fin en `ease-out`. La boucle se referme a vitesse
 * nulle des deux cotes, sans a-coup. Les ailes tournent dans le sens
 * inverse des aiguilles, comme celles des moulins qu'on voit de face.
 *
 * Chaque aile est une lame a claire-voie sur un cote de son bras : c'est
 * ce dessin, et non une simple croix, qui fait reconnaitre un moulin a
 * cette taille. Une seule aile est decrite, les trois autres sont ses
 * copies tournees d'un quart de tour autour du moyeu.
 *
 * Une animation de rotation sur un groupe SVG, tenue par le compositeur,
 * aucun JavaScript apres le premier rendu.
 *
 * ## Un statut, pas un dessin
 *
 * L'element porte `role="status"` et un libelle pour les lecteurs d'ecran :
 * l'attente est une information, pas une decoration. Le moulin est retire
 * de l'arbre d'accessibilite.
 *
 * Sous mouvement reduit, les ailes sont a l'arret, en croix droite : c'est
 * un moulin par temps calme, et la figure se reconnait encore.
 *
 * @module
 */

import { mergePresentation, type Customisable } from '@odoro-cli/engine'
import type { CSSProperties, ReactElement } from 'react'

/** Identifiant de la feuille injectee. */
const STYLE_ID = 'o-windmill'

/** Le moyeu, ou les ailes s'attachent, dans une vue de 100. */
const HUB = { x: 50, y: 42 }

/** Longueur d'un bras, du moyeu a son bout. */
const ARM = 36

/** La tour, un trapeze sous le moyeu. */
const TOWER = `M 41 96 L 59 96 L 55 ${String(HUB.y)} L 45 ${String(HUB.y)} Z`

/** Les quatre orientations des ailes, en degres. */
const SAILS = [0, 90, 180, 270] as const

/** Pose le moulin et sa rotation par rafales, une fois par document. */
function ensureWindmillRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-windmill]{display:inline-block;line-height:0}',
    '[data-o-windmill] svg{display:block}',
    '[data-o-windmill-sails]{',
    `transform-box:view-box;transform-origin:${String(HUB.x)}px ${String(HUB.y)}px;`,
    'animation:o-windmill-gust var(--o-windmill-speed) infinite;',
    '}',
    // Une rafale par tour : elan, plateau, puis les ailes s'eteignent.
    '@keyframes o-windmill-gust{',
    '0%{transform:rotate(0deg);animation-timing-function:ease-in}',
    '35%{transform:rotate(-150deg);animation-timing-function:linear}',
    '65%{transform:rotate(-270deg);animation-timing-function:ease-out}',
    '100%{transform:rotate(-360deg)}',
    '}',
    // Les ailes en croix droite : un moulin par temps calme.
    '@media (prefers-reduced-motion:reduce){',
    '[data-o-windmill-sails]{animation:none;transform:none}',
    '}',
  ].join('')
  document.head.append(style)
}

/** Proprietes propres au composant. */
export interface WindmillOwnProps {
  /** Hauteur du moulin, en pixels. @defaultValue 56 */
  size?: number
  /** Duree d'un tour des ailes, rafale comprise, en millisecondes. @defaultValue 2400 */
  speed?: number
  /** Couleur de la tour et des ailes. @defaultValue la couleur du texte */
  color?: string
  /** Libelle annonce aux lecteurs d'ecran. @defaultValue 'Chargement' */
  label?: string
}

/** Toutes les proprietes. */
export type WindmillProps = Customisable<WindmillOwnProps, 'span'>

/**
 * Signale une attente par un moulin dont les ailes tournent par rafales.
 *
 * @example
 * <Windmill />
 *
 * @example
 * // Plus grand, plus lent, dans la teinte de marque.
 * <Windmill size={96} speed={4000} color="var(--o-palette-brand-500)" />
 */
export function Windmill({
  size = 56,
  speed = 2400,
  color = 'currentColor',
  label = 'Chargement',
  ...rest
}: WindmillProps): ReactElement {
  ensureWindmillRule()

  const { className, style } = mergePresentation({}, rest)

  const loaderStyle = {
    ...style,
    width: `${String(size)}px`,
    height: `${String(size)}px`,
    color,
    '--o-windmill-speed': `${String(speed)}ms`,
  } as CSSProperties

  const tip = HUB.y - ARM

  return (
    <span
      {...rest}
      className={className}
      style={loaderStyle}
      data-o-windmill=""
      role="status"
    >
      <span className="o-sr-only">{label}</span>
      <svg aria-hidden viewBox="0 0 100 100" width="100%" height="100%">
        <path d={TOWER} fill="currentColor" fillOpacity={0.75} />
        <g data-o-windmill-sails="">
          {SAILS.map((angle) => (
            <g
              key={angle}
              transform={`rotate(${String(angle)} ${String(HUB.x)} ${String(HUB.y)})`}
            >
              {/* Le bras, du moyeu au bout. */}
              <line
                x1={HUB.x}
                y1={HUB.y}
                x2={HUB.x}
                y2={tip}
                stroke="currentColor"
                strokeWidth={2.5}
                strokeLinecap="round"
              />
              {/* La lame a claire-voie, sur un seul cote du bras. */}
              <rect
                x={HUB.x + 1.5}
                y={tip + 1}
                width={8}
                height={ARM * 0.68}
                fill="currentColor"
                fillOpacity={0.3}
                stroke="currentColor"
                strokeWidth={1.5}
              />
              {[0.25, 0.5, 0.75].map((fraction) => (
                <line
                  key={fraction}
                  x1={HUB.x + 1.5}
                  y1={tip + 1 + ARM * 0.68 * fraction}
                  x2={HUB.x + 9.5}
                  y2={tip + 1 + ARM * 0.68 * fraction}
                  stroke="currentColor"
                  strokeWidth={1}
                />
              ))}
            </g>
          ))}
        </g>
        <circle cx={HUB.x} cy={HUB.y} r={3.5} fill="currentColor" />
      </svg>
    </span>
  )
}

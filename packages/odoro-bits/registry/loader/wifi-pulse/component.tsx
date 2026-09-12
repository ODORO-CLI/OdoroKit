/**
 * Onde wifi : les arcs se tracent du plus proche au plus lointain, tiennent
 * un instant tous ensemble, puis s'effacent d'un coup.
 *
 * ## Une onde part de la source, elle n'apparait pas partout a la fois
 *
 * Chaque arc se dessine par son milieu — de gauche a droite le long du
 * chemin — au lieu d'apparaitre en fondu : une onde a une direction, et un
 * fondu n'en a aucune. Les arcs partent ensuite l'un apres l'autre, du plus
 * petit au plus grand, ce qui donne la propagation. C'est le meme trace
 * pour tous, decale d'une fraction du cycle : le nombre d'arcs ne change
 * rien a la feuille de style.
 *
 * Le chemin declare une longueur de cent : le tiret et son decalage se
 * lisent en pour cent, quel que soit le rayon de l'arc. Sans cela, chaque
 * arc demanderait ses propres valeurs, puisqu'ils n'ont pas la meme
 * longueur.
 *
 * Les trois arcs partagent le meme centre, celui du point d'emission, et
 * couvrent le meme secteur : ils sont donc concentriques a l'oeil, ce
 * qu'une suite d'arcs poses a la main ne serait pas.
 *
 * Le point ne clignote pas au rythme des arcs : il donne une seule impulsion
 * par cycle, au depart de l'onde. C'est la source, pas un quatrieme arc.
 *
 * Une animation CSS par arc, la meme, plus une pour le point, tenues par le
 * compositeur, aucun JavaScript apres le premier rendu.
 *
 * ## Un statut, pas un dessin
 *
 * L'element porte `role="status"` et un libelle pour les lecteurs d'ecran :
 * l'attente est une information, pas une decoration. Le dessin est retire
 * de l'arbre d'accessibilite.
 *
 * Sous mouvement reduit, tous les arcs sont traces et le point est pose :
 * c'est l'instant ou l'onde est complete, celui qui dit la figure.
 *
 * @module
 */

import { mergePresentation, type Customisable } from '@odoro-cli/engine'
import type { CSSProperties, ReactElement } from 'react'

/** Identifiant de la feuille injectee. */
const STYLE_ID = 'o-wifi-pulse'

/** Le point d'emission, dans une vue de 100 unites. */
const SOURCE = { x: 50, y: 80 }

/** Rayons des arcs, du plus proche au plus lointain. */
const RADII = [22, 38, 54] as const

/** Part du cycle qui separe deux arcs. */
const STAGGER = 0.12

/**
 * Un arc de quatre-vingt-dix degres centre sur la source, ouvert vers le
 * haut : de l'oblique gauche a l'oblique droite, en passant par le sommet.
 */
function arcAt(radius: number): string {
  const reach = radius * Math.SQRT1_2
  const from = `${(SOURCE.x - reach).toFixed(2)} ${(SOURCE.y - reach).toFixed(2)}`
  const to = `${(SOURCE.x + reach).toFixed(2)} ${(SOURCE.y - reach).toFixed(2)}`
  return `M ${from} A ${String(radius)} ${String(radius)} 0 0 1 ${to}`
}

/** Pose les arcs, leur propagation et le point, une fois par document. */
function ensureWifiRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-wifi-pulse]{display:inline-block;line-height:0}',
    '[data-o-wifi-pulse] svg{display:block}',
    '[data-o-wifi-arc]{',
    'stroke-dasharray:100 100;stroke-dashoffset:100;opacity:0;',
    'animation:o-wifi-pulse-arc var(--o-wifi-speed) infinite;',
    '}',
    '[data-o-wifi-dot]{',
    'transform-box:view-box;',
    `transform-origin:${String(SOURCE.x)}px ${String(SOURCE.y)}px;`,
    'animation:o-wifi-pulse-dot var(--o-wifi-speed) infinite;',
    '}',
    // L'arc se trace, tient le temps que les suivants le rejoignent, puis
    // toute l'onde s'efface ensemble.
    '@keyframes o-wifi-pulse-arc{',
    '0%{stroke-dashoffset:100;opacity:0;animation-timing-function:ease-out}',
    '12%{opacity:1}',
    '36%,68%{stroke-dashoffset:0;opacity:1;animation-timing-function:ease-in}',
    '86%,100%{stroke-dashoffset:0;opacity:0}',
    '}',
    // Une impulsion par cycle, au depart de l'onde.
    '@keyframes o-wifi-pulse-dot{',
    '0%{transform:scale(0.72);animation-timing-function:cubic-bezier(0.34,1.56,0.64,1)}',
    '18%,100%{transform:scale(1)}',
    '}',
    // Onde complete, point pose : la figure est dite, a l'arret.
    '@media (prefers-reduced-motion:reduce){',
    '[data-o-wifi-arc]{animation:none;stroke-dashoffset:0;opacity:1}',
    '[data-o-wifi-dot]{animation:none;transform:none}',
    '}',
  ].join('')
  document.head.append(style)
}

/** Proprietes propres au composant. */
export interface WifiPulseOwnProps {
  /** Cote du dessin, en pixels. @defaultValue 56 */
  size?: number
  /** Epaisseur des arcs, en pixels. @defaultValue 6 */
  thickness?: number
  /** Duree d'un cycle complet, en millisecondes. @defaultValue 1800 */
  speed?: number
  /** Couleur des arcs et du point. @defaultValue la couleur du texte */
  color?: string
  /** Libelle annonce aux lecteurs d'ecran. @defaultValue 'Chargement' */
  label?: string
}

/** Toutes les proprietes. */
export type WifiPulseProps = Customisable<WifiPulseOwnProps, 'span'>

/**
 * Signale une attente par une onde wifi qui se propage.
 *
 * @example
 * <WifiPulse />
 *
 * @example
 * // Plus grande, plus lente, dans la teinte de marque.
 * <WifiPulse size={88} speed={2600} color="var(--o-palette-brand-500)" />
 */
export function WifiPulse({
  size = 56,
  thickness = 6,
  speed = 1800,
  color = 'currentColor',
  label = 'Chargement',
  ...rest
}: WifiPulseProps): ReactElement {
  ensureWifiRule()

  const { className, style } = mergePresentation({}, rest)

  // Le dessin vit dans une vue de 100 unites : l'epaisseur demandee en
  // pixels est convertie pour que le trait garde sa mesure a toute taille.
  const stroke = Math.min((thickness / size) * 100, 16)

  const loaderStyle = {
    ...style,
    width: `${String(size)}px`,
    height: `${String(size)}px`,
    color,
    '--o-wifi-speed': `${String(speed)}ms`,
  } as CSSProperties

  return (
    <span
      {...rest}
      className={className}
      style={loaderStyle}
      data-o-wifi-pulse=""
      role="status"
    >
      <span className="o-sr-only">{label}</span>
      <svg aria-hidden viewBox="0 0 100 100" width="100%" height="100%">
        {RADII.map((radius, index) => (
          <path
            key={radius}
            data-o-wifi-arc=""
            d={arcAt(radius)}
            pathLength={100}
            fill="none"
            stroke="currentColor"
            strokeWidth={stroke}
            strokeLinecap="round"
            style={{ animationDelay: `${String(Math.round(speed * STAGGER * index))}ms` }}
          />
        ))}
        <circle
          data-o-wifi-dot=""
          cx={SOURCE.x}
          cy={SOURCE.y}
          r={stroke * 1.15}
          fill="currentColor"
        />
      </svg>
    </span>
  )
}

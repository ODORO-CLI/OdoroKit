/**
 * Points en spirale : quatorze points poses le long d'une spirale
 * s'allument tour a tour, du centre vers l'exterieur.
 *
 * ## Pourquoi un SVG
 *
 * Une spirale est une courbe : placer ses points en CSS demanderait de les
 * positionner un par un en pixels absolus, et la figure ne suivrait plus la
 * taille demandee. Dans un `viewBox`, les positions sont calculees une fois
 * en unites de dessin, et le navigateur met le tout a l'echelle.
 *
 * La spirale est d'Archimede : le rayon croit avec l'angle, a pas constant.
 * Les points grossissent en s'eloignant du centre, parce que l'espace entre
 * eux grandit aussi — des points de meme taille laisseraient la spirale se
 * deliter vers l'exterieur.
 *
 * ## Une seule animation, quatorze phases
 *
 * Chaque point joue la meme montee et la meme extinction, avec sa propre
 * avance : le centre a la plus grande, la peripherie part de zero. Le
 * signal semble courir le long du fil, alors qu'aucun point ne bouge.
 *
 * ## Un statut, pas un dessin
 *
 * L'element porte `role="status"` et un libelle pour les lecteurs d'ecran :
 * l'attente est une information, pas une decoration. Le dessin est retire
 * de l'arbre d'accessibilite.
 *
 * Sous mouvement reduit, la spirale reste dessinee, en degrade fixe du
 * centre pale a la peripherie pleine : la figure se lit encore comme un
 * chargeur, seul le parcours s'arrete.
 *
 * @module
 */

import { mergePresentation, type Customisable } from '@odoro-cli/engine'
import type { CSSProperties, ReactElement } from 'react'

/** Identifiant de la feuille injectee. */
const STYLE_ID = 'o-spiral-dots'

/** Nombre de points sur la spirale. */
const COUNT = 14

/** Pose l'allumage des points, une fois par document. */
function ensureSpiralRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-spiral-dots]{display:inline-block;line-height:0}',
    '[data-o-spiral-dot]{',
    'fill:var(--o-spiral-color);',
    // L'echelle se fait autour du point lui-meme, pas de l'origine du dessin.
    'transform-box:fill-box;transform-origin:center;',
    'animation:o-spiral-dots-light var(--o-spiral-speed) ease-in-out infinite;',
    'animation-delay:var(--o-spiral-delay);',
    '}',
    // Un point est allume un cinquieme du cycle : assez court pour qu'on
    // voie le signal courir, assez long pour que trois points se chevauchent.
    '@keyframes o-spiral-dots-light{',
    '0%,20%,100%{opacity:0.2;transform:scale(0.7)}',
    '10%{opacity:1;transform:scale(1.3)}',
    '}',
    // La spirale entiere, en degrade fixe : elle dit encore « attente ».
    '@media (prefers-reduced-motion:reduce){',
    '[data-o-spiral-dot]{animation:none;transform:none;opacity:var(--o-spiral-rest)}',
    '}',
  ].join('')
  document.head.append(style)
}

/** Proprietes propres au composant. */
export interface SpiralDotsOwnProps {
  /** Cote du dessin, en pixels. @defaultValue 48 */
  size?: number
  /** Duree d'un parcours complet, en millisecondes. @defaultValue 1600 */
  speed?: number
  /** Couleur des points. @defaultValue la couleur du texte */
  color?: string
  /** Libelle annonce aux lecteurs d'ecran. @defaultValue 'Chargement' */
  label?: string
}

/** Toutes les proprietes. */
export type SpiralDotsProps = Customisable<SpiralDotsOwnProps, 'span'>

/**
 * Points de la spirale, en unites du `viewBox` de cent sur cent.
 *
 * Un tour et demi, du centre a quelques unites du bord. Calcules une fois :
 * ils ne dependent ni de la taille ni de la vitesse.
 */
const DOTS = Array.from({ length: COUNT }, (_, index) => {
  const t = index / (COUNT - 1)
  const angle = t * 3 * Math.PI - Math.PI / 2
  const radius = 4 + t * 40
  return {
    x: 50 + Math.cos(angle) * radius,
    y: 50 + Math.sin(angle) * radius,
    r: 1.8 + t * 3.2,
    rest: 0.3 + t * 0.7,
  }
})

/**
 * Signale une attente par un signal qui court le long d'une spirale.
 *
 * @example
 * <SpiralDots />
 *
 * @example
 * // Plus grand, plus lent, dans la teinte de marque.
 * <SpiralDots size={96} speed={2600} color="var(--o-palette-brand-500)" />
 */
export function SpiralDots({
  size = 48,
  speed = 1600,
  color = 'currentColor',
  label = 'Chargement',
  ...rest
}: SpiralDotsProps): ReactElement {
  ensureSpiralRule()

  const { className, style } = mergePresentation({}, rest)

  const loaderStyle = {
    ...style,
    '--o-spiral-speed': `${String(speed)}ms`,
    '--o-spiral-color': color,
  } as CSSProperties

  return (
    <span
      {...rest}
      className={className}
      style={loaderStyle}
      data-o-spiral-dots=""
      role="status"
    >
      <span className="o-sr-only">{label}</span>
      <svg aria-hidden width={size} height={size} viewBox="0 0 100 100">
        {DOTS.map((dot, index) => (
          <circle
            key={index}
            data-o-spiral-dot=""
            cx={dot.x.toFixed(2)}
            cy={dot.y.toFixed(2)}
            r={dot.r.toFixed(2)}
            style={
              {
                // Le centre a le plus d'avance, la peripherie part de zero :
                // le signal court vers l'exterieur, en negatif pour etre
                // deja en route a la premiere image.
                '--o-spiral-delay': `${String(Math.round((-speed * (COUNT - 1 - index)) / COUNT))}ms`,
                '--o-spiral-rest': dot.rest.toFixed(2),
              } as CSSProperties
            }
          />
        ))}
      </svg>
    </span>
  )
}

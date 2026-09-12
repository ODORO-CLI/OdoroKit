/**
 * Triangle qui se trace : un triangle en trait se dessine sur sa piste
 * depuis le sommet, puis s'efface dans le meme sens.
 *
 * ## Un tiret aussi long que le perimetre
 *
 * Le trait est un unique tiret, de la longueur exacte du perimetre, suivi
 * d'un vide de la meme longueur. Faire glisser ce motif le long du chemin
 * — par le decalage des tirets — revient a faire apparaitre le trait
 * depuis le sommet, puis a le faire disparaitre par le meme sommet une fois
 * complet. Le crayon ne revient jamais en arriere : la fin du trait rattrape
 * son debut. C'est ce qui distingue ce chargeur d'un anneau qui tourne :
 * ici, rien ne tourne, un trait se dessine.
 *
 * Le perimetre est calcule a partir des sommets, pas mesure sur le chemin :
 * il n'y a donc rien a lire dans le DOM apres le premier rendu, et le tiret
 * est exact des la premiere image.
 *
 * La piste attenuee sous le trait n'est pas un ornement : sans elle, un
 * triangle a demi trace n'est qu'un angle, et l'oeil ne sait pas ce qui va
 * venir.
 *
 * ## Un statut, pas un dessin
 *
 * L'element porte `role="status"` et un libelle pour les lecteurs d'ecran :
 * l'attente est une information, pas une decoration. Le dessin est retire
 * de l'arbre d'accessibilite.
 *
 * Sous mouvement reduit, le triangle reste entierement trace : la figure se
 * lit encore comme un chargeur, seul le mouvement s'arrete.
 *
 * @module
 */

import { mergePresentation, type Customisable } from '@odoro-cli/engine'
import type { CSSProperties, ReactElement } from 'react'

/** Identifiant de la feuille injectee. */
const STYLE_ID = 'o-triangle-spinner'

/**
 * Sommets du triangle equilateral, pointe en haut, dans une vue de 100
 * unites. Le centre est celui du cercle circonscrit, un peu sous le milieu
 * de la vue pour que la figure paraisse centree.
 */
const RADIUS = 42
const VERTICES: ReadonlyArray<readonly [number, number]> = [0, 1, 2].map((index) => {
  const angle = ((2 * Math.PI) / 3) * index - Math.PI / 2
  return [50 + RADIUS * Math.cos(angle), 54 + RADIUS * Math.sin(angle)] as const
})

/** Le trace, du sommet dans le sens horaire. */
const PATH = `M ${VERTICES.map(([x, y]) => `${x.toFixed(2)} ${y.toFixed(2)}`).join(' L ')} Z`

/** Le perimetre : trois fois le cote. */
const PERIMETER = 3 * RADIUS * Math.sqrt(3)

/** Pose le triangle et son trace, une fois par document. */
function ensureTriangleRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-triangle-spinner]{display:inline-block;line-height:0}',
    '[data-o-triangle-spinner] svg{display:block}',
    '[data-o-triangle-track]{opacity:0.18}',
    '[data-o-triangle-stroke]{',
    'animation:o-triangle-spinner-draw var(--o-tri-speed) ease-in-out infinite;',
    '}',
    // De « tout vide » a « tout plein » a « tout vide », dans le meme sens :
    // le decalage parcourt deux perimetres et ne revient jamais en arriere.
    '@keyframes o-triangle-spinner-draw{',
    '0%{stroke-dashoffset:var(--o-tri-perimeter)}',
    '50%{stroke-dashoffset:0}',
    '100%{stroke-dashoffset:calc(var(--o-tri-perimeter) * -1)}',
    '}',
    '@media (prefers-reduced-motion:reduce){',
    '[data-o-triangle-stroke]{animation:none;stroke-dashoffset:0}',
    '}',
  ].join('')
  document.head.append(style)
}

/** Proprietes propres au composant. */
export interface TriangleSpinnerOwnProps {
  /** Largeur du triangle, en pixels. @defaultValue 44 */
  size?: number
  /** Epaisseur du trait, en pixels. @defaultValue 4 */
  thickness?: number
  /** Duree d'un cycle de trace et d'effacement, en millisecondes. @defaultValue 1800 */
  speed?: number
  /** Couleur du trait. @defaultValue la couleur du texte */
  color?: string
  /** Libelle annonce aux lecteurs d'ecran. @defaultValue 'Chargement' */
  label?: string
}

/** Toutes les proprietes. */
export type TriangleSpinnerProps = Customisable<TriangleSpinnerOwnProps, 'span'>

/**
 * Signale une attente par un triangle qui se trace puis s'efface.
 *
 * @example
 * <TriangleSpinner />
 *
 * @example
 * // Un trait fin, plus lent, dans la teinte de marque.
 * <TriangleSpinner thickness={2} speed={2600} color="var(--o-palette-brand-500)" />
 */
export function TriangleSpinner({
  size = 44,
  thickness = 4,
  speed = 1800,
  color = 'currentColor',
  label = 'Chargement',
  ...rest
}: TriangleSpinnerProps): ReactElement {
  ensureTriangleRule()

  const { className, style } = mergePresentation({}, rest)

  // Le dessin vit dans une vue de 100 unites : l'epaisseur demandee en
  // pixels est convertie pour que le trait garde sa mesure a toute taille.
  const stroke = Math.min((thickness / size) * 100, 20)

  const loaderStyle = {
    ...style,
    width: `${String(size)}px`,
    height: `${String(size)}px`,
    color,
    '--o-tri-speed': `${String(speed)}ms`,
    '--o-tri-perimeter': PERIMETER.toFixed(2),
  } as CSSProperties

  return (
    <span
      {...rest}
      className={className}
      style={loaderStyle}
      data-o-triangle-spinner=""
      role="status"
    >
      <span className="o-sr-only">{label}</span>
      <svg aria-hidden viewBox="0 0 100 100" width="100%" height="100%">
        <path
          data-o-triangle-track=""
          d={PATH}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          strokeLinejoin="round"
        />
        <path
          data-o-triangle-stroke=""
          d={PATH}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          strokeLinejoin="round"
          strokeLinecap="round"
          strokeDasharray={`${PERIMETER.toFixed(2)} ${PERIMETER.toFixed(2)}`}
        />
      </svg>
    </span>
  )
}

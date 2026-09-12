/**
 * Chargeur orbital : trois arcs concentriques tournent a contresens.
 *
 * ## Trois bordures, aucun JavaScript
 *
 * Chaque arc est un anneau dont une seule portion de bordure est peinte —
 * le reste est transparent — et que le compositeur fait tourner. Trois
 * rotations declarees une fois, a des vitesses et des sens alternes : le
 * croisement des arcs suffit a dire « quelque chose travaille », sans une
 * ligne de JavaScript apres le premier rendu.
 *
 * Ce chargeur ne compte rien, et ne pretend pas compter : c'est un signe
 * d'attente, pas une mesure. Quand il y a une vraie progression a montrer,
 * `counter-gate` est le bon outil.
 *
 * ## Un statut, pas un dessin
 *
 * L'element porte `role="status"` et un libelle pour les lecteurs d'ecran :
 * l'attente est une information, pas une decoration. Les arcs, eux, sont
 * retires de l'arbre d'accessibilite.
 *
 * Sous mouvement reduit, les arcs restent en place : la figure — trois
 * portions d'anneaux decalees — se lit encore comme un chargeur, seul le
 * mouvement s'arrete.
 *
 * @module
 */

import { mergePresentation, type Customisable } from '@odoro-cli/engine'
import { type CSSProperties, type ReactElement } from 'react'

/** Proprietes propres au composant. */
export interface OrbitLoaderOwnProps {
  /** Diametre de l'anneau exterieur, en pixels. @defaultValue 48 */
  size?: number
  /** Duree d'un tour de l'anneau exterieur, en millisecondes. @defaultValue 1200 */
  speed?: number
  /** Couleur des arcs. @defaultValue la couleur du texte */
  color?: string
  /** Libelle annonce aux lecteurs d'ecran. @defaultValue 'Chargement' */
  label?: string
}

/** Toutes les proprietes. */
export type OrbitLoaderProps = Customisable<OrbitLoaderOwnProps, 'span'>

/** Identifiant de la feuille injectee. */
const STYLE_ID = 'o-orbit-loader'

/** Pose les anneaux et leur rotation, une fois par document. */
function ensureLoaderRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-orbit-loader]{position:relative;display:inline-block}',
    '[data-o-orbit-ring]{',
    'position:absolute;inset:var(--o-loader-inset);',
    'border-radius:50%;',
    'border:2px solid transparent;',
    'border-top-color:var(--o-loader-color);',
    'opacity:var(--o-loader-opacity);',
    'animation:o-orbit-loader-spin var(--o-loader-speed) linear infinite;',
    'animation-direction:var(--o-loader-direction);',
    '}',
    '@keyframes o-orbit-loader-spin{from{transform:rotate(0turn)}to{transform:rotate(1turn)}}',
    // Les arcs figes restent decales d'un tiers de tour : la figure se lit
    // encore comme un chargeur.
    '@media (prefers-reduced-motion:reduce){',
    '[data-o-orbit-ring]{animation:none;transform:rotate(var(--o-loader-rest))}',
    '}',
  ].join('')
  document.head.append(style)
}

/**
 * Signale une attente par trois arcs qui tournent a contresens.
 *
 * @example
 * <OrbitLoader />
 *
 * @example
 * // Plus grand, plus lent, dans la teinte de marque.
 * <OrbitLoader size={72} speed={2000} color="var(--o-palette-brand-500)" />
 */
export function OrbitLoader({
  size = 48,
  speed = 1200,
  color = 'currentColor',
  label = 'Chargement',
  ...rest
}: OrbitLoaderProps): ReactElement {
  ensureLoaderRule()

  const { className, style } = mergePresentation({}, rest)

  const loaderStyle = {
    ...style,
    width: `${String(size)}px`,
    height: `${String(size)}px`,
    '--o-loader-color': color,
  } as CSSProperties

  // Trois anneaux : chacun plus petit, plus rapide, et a contresens du
  // precedent. L'inertie visuelle vient du croisement, pas de la vitesse.
  const rings = [0, 1, 2].map((ring) => ({
    inset: `${String(ring * 16)}%`,
    speed: Math.round(speed * (1 + ring * 0.5)),
    direction: ring % 2 === 1 ? 'reverse' : 'normal',
    opacity: 1 - ring * 0.25,
    rest: `${String(ring * 120)}deg`,
  }))

  return (
    <span
      {...rest}
      className={className}
      style={loaderStyle}
      data-o-orbit-loader=""
      role="status"
    >
      <span className="o-sr-only">{label}</span>
      {rings.map((ring, index) => (
        <span
          key={index}
          aria-hidden
          data-o-orbit-ring=""
          style={
            {
              '--o-loader-inset': ring.inset,
              '--o-loader-speed': `${String(ring.speed)}ms`,
              '--o-loader-direction': ring.direction,
              '--o-loader-opacity': String(ring.opacity),
              '--o-loader-rest': ring.rest,
            } as CSSProperties
          }
        />
      ))}
    </span>
  )
}

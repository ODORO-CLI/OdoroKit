/**
 * Boucle infinie : un trait court parcourt un huit couche, lent aux bouts
 * des boucles, rapide au croisement.
 *
 * ## Un huit qui se croise, pas deux ronds qui se touchent
 *
 * Le trace est une seule courbe fermee, en quatre segments cubiques, dont
 * les tangentes se raccordent au centre : le trait y passe en ligne droite
 * d'une boucle a l'autre, comme sur un vrai symbole d'infini. Deux cercles
 * accoles donneraient un point anguleux au milieu, ou le trait ferait un
 * demi-tour sur place.
 *
 * Le trait est un tiret sur ce chemin, deplace par son decalage. Le chemin
 * declare une longueur de cent : le tiret et son decalage se lisent alors
 * en pour cent du trace, quelle que soit sa longueur reelle, et les images
 * cles tombent juste. Le decalage avance par demi-tours en `ease-in-out`,
 * cales pour que le ralenti tombe au bout de chaque boucle et la pointe de
 * vitesse au croisement : c'est le mouvement d'une bille sur un rail en
 * huit, qui remonte en freinant et redescend en accelerant. Un decalage
 * lineaire — le choix par defaut — donnerait un trait sans poids.
 *
 * Une animation sur un element SVG, tenue par le compositeur, aucun
 * JavaScript apres le premier rendu.
 *
 * ## Un statut, pas un dessin
 *
 * L'element porte `role="status"` et un libelle pour les lecteurs d'ecran :
 * l'attente est une information, pas une decoration. Le trace est retire de
 * l'arbre d'accessibilite.
 *
 * Sous mouvement reduit, le trait est pose au bout d'une boucle, sur son
 * rail en trait clair : la figure se lit encore, seul le parcours s'arrete.
 *
 * @module
 */

import { mergePresentation, type Customisable } from '@odoro-cli/engine'
import type { CSSProperties, ReactElement } from 'react'

/** Identifiant de la feuille injectee. */
const STYLE_ID = 'o-infinity-loop'

/**
 * Le huit, dans une vue de 100 sur 56.
 *
 * Il part du centre vers la boucle droite, la parcourt, repasse au centre
 * dans le meme sens, parcourt la boucle gauche, et revient.
 */
const EIGHT =
  'M 50 28 C 64 0, 92 0, 92 28 C 92 56, 64 56, 50 28 C 36 0, 8 0, 8 28 C 8 56, 36 56, 50 28'

/** Longueur du tiret, en pour cent du trace. */
const DASH = 24

/**
 * Decalage de depart, en pour cent du trace.
 *
 * Le bout de la boucle droite est au quart du trace ; le tiret y est
 * centre a l'instant le plus lent, et le centre du tiret est a la moitie de
 * sa longueur derriere sa tete.
 */
const START = 25 - DASH / 2

/** Pose le rail, le tiret et son parcours, une fois par document. */
function ensureInfinityRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-infinity-loop]{display:inline-block;line-height:0}',
    '[data-o-infinity-loop] svg{display:block}',
    '[data-o-infinity-dash]{',
    `stroke-dasharray:${String(DASH)} ${String(100 - DASH)};`,
    `stroke-dashoffset:${String(-START)};`,
    'animation:o-infinity-loop-run var(--o-infinity-speed) infinite;',
    '}',
    // Deux demi-tours par cycle : ralenti au bout de chaque boucle, pointe
    // de vitesse au croisement.
    '@keyframes o-infinity-loop-run{',
    `0%{stroke-dashoffset:${String(-START)};animation-timing-function:ease-in-out}`,
    `50%{stroke-dashoffset:${String(-START - 50)};animation-timing-function:ease-in-out}`,
    `100%{stroke-dashoffset:${String(-START - 100)}}`,
    '}',
    // Le tiret pose au bout d'une boucle : la figure est dite, a l'arret.
    '@media (prefers-reduced-motion:reduce){',
    '[data-o-infinity-dash]{animation:none}',
    '}',
  ].join('')
  document.head.append(style)
}

/** Proprietes propres au composant. */
export interface InfinityLoopOwnProps {
  /** Largeur du huit, en pixels. @defaultValue 64 */
  size?: number
  /** Epaisseur du trait, en pixels. @defaultValue 4 */
  thickness?: number
  /** Duree d'un tour complet du huit, en millisecondes. @defaultValue 2000 */
  speed?: number
  /** Couleur du trait et du rail. @defaultValue la couleur du texte */
  color?: string
  /** Libelle annonce aux lecteurs d'ecran. @defaultValue 'Chargement' */
  label?: string
}

/** Toutes les proprietes. */
export type InfinityLoopProps = Customisable<InfinityLoopOwnProps, 'span'>

/**
 * Signale une attente par un trait qui parcourt un huit couche.
 *
 * @example
 * <InfinityLoop />
 *
 * @example
 * // Plus large, plus fin, plus lent, dans la teinte de marque.
 * <InfinityLoop size={96} thickness={3} speed={3000} color="var(--o-palette-brand-500)" />
 */
export function InfinityLoop({
  size = 64,
  thickness = 4,
  speed = 2000,
  color = 'currentColor',
  label = 'Chargement',
  ...rest
}: InfinityLoopProps): ReactElement {
  ensureInfinityRule()

  const { className, style } = mergePresentation({}, rest)

  // Le dessin vit dans une vue de 100 unites de large : l'epaisseur
  // demandee en pixels est convertie pour que le trait garde sa mesure a
  // toute taille. Le huit laisse huit unites de marge sur les cotes, ce qui
  // borne l'epaisseur.
  const stroke = Math.min((thickness / size) * 100, 14)

  const loaderStyle = {
    ...style,
    width: `${String(size)}px`,
    height: `${String(size * 0.56)}px`,
    color,
    '--o-infinity-speed': `${String(speed)}ms`,
  } as CSSProperties

  return (
    <span
      {...rest}
      className={className}
      style={loaderStyle}
      data-o-infinity-loop=""
      role="status"
    >
      <span className="o-sr-only">{label}</span>
      <svg aria-hidden viewBox="0 0 100 56" width="100%" height="100%">
        <path
          d={EIGHT}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          strokeOpacity={0.2}
          strokeLinecap="round"
        />
        <path
          data-o-infinity-dash=""
          d={EIGHT}
          pathLength={100}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          strokeLinecap="round"
        />
      </svg>
    </span>
  )
}

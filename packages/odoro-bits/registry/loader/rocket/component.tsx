/**
 * Fusee : une fusee se pose sur le pas de tir, allume sa poussee, puis
 * quitte la vue par le haut. La suivante arrive par le bas.
 *
 * ## Une acceleration, pas un aller-retour
 *
 * Un decollage n'a pas de vitesse constante et ne revient jamais. La montee
 * part donc lentement et finit vite — `ease-in` pousse a fond — et la fusee
 * sort du cadre au lieu de s'arreter en haut. Le cadre du SVG la coupe : il
 * n'y a rien a masquer, elle est simplement dehors.
 *
 * La boucle ne rembobine pas la meme fusee : elle en amene une autre par le
 * bas, qui monte en freinant jusqu'a son point d'arret — l'exact contraire
 * de la courbe du decollage. On lit deux gestes distincts, une arrivee et
 * un depart, la ou une seule courbe symetrique donnerait un yo-yo.
 *
 * Juste avant de partir, la fusee s'enfonce de quelques unites : c'est
 * l'appui qui annonce le mouvement, la meme raison qui fait qu'on plie les
 * genoux avant de sauter.
 *
 * ## Deux echelles de temps pour la flamme
 *
 * La flamme fait deux choses a la fois, a des rythmes qui n'ont rien a voir :
 * elle s'allonge quand la poussee monte — au rythme du cycle — et elle
 * vacille — dix fois plus vite. Les melanger dans une seule animation
 * obligerait a repeter les images cles du vacillement a chaque etape de la
 * poussee. Elles vivent donc sur deux groupes emboites, chacun avec sa
 * duree : leurs echelles se multiplient d'elles-memes.
 *
 * Trois animations CSS sur des elements SVG, tenues par le compositeur,
 * aucun JavaScript apres le premier rendu.
 *
 * ## Un statut, pas un dessin
 *
 * L'element porte `role="status"` et un libelle pour les lecteurs d'ecran :
 * l'attente est une information, pas une decoration. Le dessin est retire
 * de l'arbre d'accessibilite.
 *
 * Sous mouvement reduit, la fusee est posee au centre, flamme allumee et
 * stable : la figure se lit, seul le vol s'arrete.
 *
 * @module
 */

import { mergePresentation, type Customisable } from '@odoro-cli/engine'
import type { CSSProperties, ReactElement } from 'react'

/** Identifiant de la feuille injectee. */
const STYLE_ID = 'o-rocket'

/** Le fuselage, ogive comprise. */
const BODY = 'M 50 8 C 62 24, 68 40, 68 56 L 32 56 C 32 40, 38 24, 50 8 Z'

/** L'aileron gauche. */
const FIN_LEFT = 'M 32 38 L 19 62 L 32 57 Z'

/** L'aileron droit. */
const FIN_RIGHT = 'M 68 38 L 81 62 L 68 57 Z'

/** La tuyere, sous le fuselage. */
const NOZZLE = 'M 37 56 L 63 56 L 59 65 L 41 65 Z'

/** La flamme, accrochee a la levre de la tuyere. */
const FLAME = 'M 41 65 Q 50 96 59 65 Z'

/** Pose la fusee, son decollage et sa flamme, une fois par document. */
function ensureRocketRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-rocket]{display:inline-block;line-height:0}',
    '[data-o-rocket] svg{display:block}',
    '[data-o-rocket-body],[data-o-rocket-thrust],[data-o-rocket-flicker]{',
    'transform-box:view-box;',
    'animation-iteration-count:infinite;',
    '}',
    '[data-o-rocket-body]{',
    'transform-origin:50px 50px;',
    'animation-name:o-rocket-launch;animation-duration:var(--o-rocket-speed);',
    '}',
    // Les deux groupes de la flamme partagent la levre de la tuyere comme
    // origine : elle s'allonge et vacille par le bas, jamais par le milieu.
    '[data-o-rocket-thrust],[data-o-rocket-flicker]{transform-origin:50px 65px}',
    '[data-o-rocket-thrust]{',
    'animation-name:o-rocket-thrust;animation-duration:var(--o-rocket-speed);',
    '}',
    '[data-o-rocket-flicker]{',
    'animation-name:o-rocket-flicker;',
    'animation-duration:calc(var(--o-rocket-speed) / 14);',
    '}',
    // Arrivee en freinant par le bas, appui, puis depart en accelerant
    // jusqu'a sortir du cadre.
    '@keyframes o-rocket-launch{',
    '0%{transform:translateY(130px);animation-timing-function:cubic-bezier(0.2,0.8,0.3,1)}',
    '24%{transform:translateY(0)}',
    '42%{transform:translateY(8px);animation-timing-function:cubic-bezier(0.6,0,0.9,0.2)}',
    '100%{transform:translateY(-150px)}',
    '}',
    // La poussee se creuse pendant l'appui, puis s'allonge pour le depart.
    '@keyframes o-rocket-thrust{',
    '0%,24%{transform:scaleY(0.8);animation-timing-function:ease-in-out}',
    '42%{transform:scaleY(0.5);animation-timing-function:ease-out}',
    '56%,100%{transform:scaleY(1.35)}',
    '}',
    '@keyframes o-rocket-flicker{',
    '0%,100%{transform:scaleY(1) scaleX(1)}',
    '50%{transform:scaleY(0.72) scaleX(1.1)}',
    '}',
    // Fusee posee, flamme allumee et stable : la figure est dite, au sol.
    '@media (prefers-reduced-motion:reduce){',
    '[data-o-rocket-body],[data-o-rocket-thrust],[data-o-rocket-flicker]{',
    'animation:none;transform:none;',
    '}',
    '}',
  ].join('')
  document.head.append(style)
}

/** Proprietes propres au composant. */
export interface RocketOwnProps {
  /** Cote du dessin, en pixels. @defaultValue 72 */
  size?: number
  /** Duree d'un decollage complet, en millisecondes. @defaultValue 2200 */
  speed?: number
  /** Couleur de la fusee et de sa flamme. @defaultValue la couleur du texte */
  color?: string
  /** Libelle annonce aux lecteurs d'ecran. @defaultValue 'Chargement' */
  label?: string
}

/** Toutes les proprietes. */
export type RocketProps = Customisable<RocketOwnProps, 'span'>

/**
 * Signale une attente par une fusee qui decolle, sans fin.
 *
 * @example
 * <Rocket />
 *
 * @example
 * // Plus grande, plus lente, dans la teinte de marque.
 * <Rocket size={112} speed={3200} color="var(--o-palette-brand-500)" />
 */
export function Rocket({
  size = 72,
  speed = 2200,
  color = 'currentColor',
  label = 'Chargement',
  ...rest
}: RocketProps): ReactElement {
  ensureRocketRule()

  const { className, style } = mergePresentation({}, rest)

  const loaderStyle = {
    ...style,
    width: `${String(size)}px`,
    height: `${String(size)}px`,
    color,
    '--o-rocket-speed': `${String(speed)}ms`,
  } as CSSProperties

  return (
    <span
      {...rest}
      className={className}
      style={loaderStyle}
      data-o-rocket=""
      role="status"
    >
      <span className="o-sr-only">{label}</span>
      <svg aria-hidden viewBox="0 0 100 100" width="100%" height="100%">
        <g data-o-rocket-body="">
          <g data-o-rocket-thrust="">
            <g data-o-rocket-flicker="">
              <path d={FLAME} fill="currentColor" fillOpacity={0.45} />
            </g>
          </g>
          <path d={FIN_LEFT} fill="currentColor" fillOpacity={0.7} />
          <path d={FIN_RIGHT} fill="currentColor" fillOpacity={0.7} />
          <path d={NOZZLE} fill="currentColor" fillOpacity={0.7} />
          <path d={BODY} fill="currentColor" />
          {/* Le hublot est un trou dans le fuselage, pas une pastille
              posee dessus : c'est le fond qui se voit au travers. */}
          <circle cx={50} cy={34} r={8} fill="var(--o-theme-bg)" />
        </g>
      </svg>
    </span>
  )
}

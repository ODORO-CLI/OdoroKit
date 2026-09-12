/**
 * Balayage laser : un faisceau traverse le cadre en boucle.
 *
 * ## Ce qui le distingue du trait de bordure
 *
 * Le trait de bordure court **le long** du contour ; ce faisceau-ci traverse
 * la surface **de part en part**. L'un souligne une carte parmi ses voisines,
 * l'autre donne l'impression qu'une machine est en train de lire ce qu'elle
 * contient. Ils ne se remplacent pas, et se posent meme ensemble.
 *
 * ## Deux couches, parce qu'un laser n'est pas un trait
 *
 * Un seul rectangle clair donne un rendu de separateur, pas de lumiere. Ce
 * qui fait le laser, c'est le contraste entre un coeur net de deux pixels et
 * une nappe cent fois plus large, floue et pale, qui l'accompagne. Les deux
 * voyagent ensemble dans le meme rail.
 *
 * ## Pourquoi un rail plutot qu'un deplacement du faisceau
 *
 * Un pourcentage de `translate` se rapporte a l'element deplace. Anime sur le
 * faisceau — large de deux pixels — il faudrait des milliers de pourcents, et
 * la valeur dependrait de l'epaisseur reglee. Le rail, lui, fait exactement la
 * taille du cadre : le deplacer de moitie deplace le faisceau d'une demi-
 * largeur de cadre, quelle que soit son epaisseur.
 *
 * Sous mouvement reduit, aucun faisceau : un balayage n'a pas d'etat final,
 * seul son passage existe. Le filet de contour, lui, reste.
 *
 * @module
 */

import { mergePresentation, useMotionState, type Customisable } from '@odoro-cli/engine'
import { type CSSProperties, type ReactElement, type ReactNode } from 'react'

/** Proprietes propres au composant. */
export interface LaserFlowOwnProps {
  /** Contenu balaye. */
  children: ReactNode
  /** Duree d'une traversee, en millisecondes. @defaultValue 3200 */
  duration?: number
  /** Inclinaison du faisceau, en degres. @defaultValue 14 */
  angle?: number
  /** Epaisseur du trait net, en pixels. @defaultValue 2 */
  width?: number
  /** Largeur de la nappe diffuse, en pixels. @defaultValue 90 */
  glow?: number
  /** Couleur du faisceau. @defaultValue la teinte de marque */
  color?: string
  /** Allume aussi un filet sur le contour du cadre. @defaultValue true */
  frame?: boolean
}

/** Toutes les proprietes. */
export type LaserFlowProps = Customisable<LaserFlowOwnProps>

/** Identifiant de la feuille injectee. */
const STYLE_ID = 'o-laser-flow'

/** Pose les regles du faisceau, une fois par document. */
function ensureLaserRules(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-laser]{position:relative;isolation:isolate}',
    // Le rail fait la taille du cadre : un pourcent de son deplacement vaut
    // un pourcent de la largeur, et non de l'epaisseur du faisceau.
    '[data-o-laser-track]{',
    'position:absolute;inset:0;pointer-events:none;',
    'animation:o-laser var(--o-laser-duration) linear infinite',
    '}',
    '@keyframes o-laser{',
    'from{transform:translate3d(-58%,0,0)}',
    'to{transform:translate3d(58%,0,0)}',
    '}',
    // Les deux couches partent du milieu du rail et debordent en hauteur :
    // l'inclinaison ne doit jamais decouvrir leurs extremites.
    '[data-o-laser-beam]{',
    'position:absolute;top:-60%;height:220%;left:50%;',
    'transform:rotate(var(--o-laser-angle))',
    '}',
    '[data-o-laser-glow]{',
    'width:var(--o-laser-glow);margin-left:calc(var(--o-laser-glow) / -2);',
    'background:var(--o-laser-color);opacity:0.22;',
    'filter:blur(calc(var(--o-laser-glow) / 3))',
    '}',
    '[data-o-laser-core]{',
    'width:var(--o-laser-width);margin-left:calc(var(--o-laser-width) / -2);',
    'background:linear-gradient(to bottom,transparent,var(--o-laser-color) 25%,var(--o-laser-color) 75%,transparent)',
    '}',
    '[data-o-laser-frame]{',
    'position:absolute;inset:0;pointer-events:none;border-radius:inherit;',
    'box-shadow:inset 0 0 0 1px var(--o-laser-color);opacity:0.35',
    '}',
    '@media (prefers-reduced-motion:reduce){[data-o-laser-track]{display:none}}',
  ].join('')
  document.head.append(style)
}

/**
 * Fait traverser un faisceau sur son contenu.
 *
 * @example
 * <LaserFlow className="o-rounded-xl o-overflow-hidden o-p-8">
 *   <h3>Analyse en cours</h3>
 * </LaserFlow>
 *
 * @example
 * // Un balayage lent et large, sans filet de contour.
 * <LaserFlow duration={7000} glow={220} frame={false} angle={-24}>
 *   <pre>…</pre>
 * </LaserFlow>
 */
export function LaserFlow({
  children,
  duration = 3200,
  angle = 14,
  width = 2,
  glow = 90,
  color = 'var(--o-palette-brand-500)',
  frame = true,
  ...rest
}: LaserFlowProps): ReactElement {
  const { reduced } = useMotionState()
  ensureLaserRules()

  const { className, style } = mergePresentation(
    { className: 'o-overflow-hidden' },
    rest,
  )

  return (
    <div
      {...rest}
      className={className}
      style={
        {
          ...style,
          '--o-laser-duration': `${String(duration)}ms`,
          '--o-laser-angle': `${String(angle)}deg`,
          '--o-laser-width': `${String(width)}px`,
          '--o-laser-glow': `${String(glow)}px`,
          '--o-laser-color': color,
        } as CSSProperties
      }
      data-o-laser=""
    >
      {children}
      {reduced ? null : (
        <span aria-hidden data-o-laser-track="">
          <span data-o-laser-beam="" data-o-laser-glow="" />
          <span data-o-laser-beam="" data-o-laser-core="" />
        </span>
      )}
      {frame ? <span aria-hidden data-o-laser-frame="" /> : null}
    </div>
  )
}

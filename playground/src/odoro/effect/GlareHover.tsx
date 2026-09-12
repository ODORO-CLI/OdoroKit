/**
 * Reflet qui traverse le contenu au survol.
 *
 * ## Une bande, pas un halo
 *
 * Le halo de pointeur eclaire l'endroit ou se trouve la main ; ce reflet-ci
 * ne suit rien. Il traverse d'un bord a l'autre a vitesse constante, comme la
 * lumiere d'une vitrine sur une carte plastifiee : c'est un accuse de reception
 * du survol, pas une lampe. Les deux se posent d'ailleurs ensemble sans se
 * gener, l'un radial et sous le contenu, l'autre lineaire et par-dessus.
 *
 * ## Pourquoi le survol declenche depuis la feuille
 *
 * Le declenchement pourrait passer par un etat React sur `pointerenter`. Ce
 * serait deux rendus par carte survolee, pour une animation que `:hover`
 * lance seul. La regle est donc dans la feuille, et `:focus-within` s'y ajoute :
 * une carte qui contient un lien doit se signaler aussi au clavier.
 *
 * ## Ce que la bande traverse
 *
 * Le pseudo-element fait deux fois la taille de l'hote et deborde de moitie
 * dans chaque direction : quel que soit l'angle demande, la bande entre et
 * sort hors du cadre, sans jamais laisser voir son extremite.
 *
 * Sous mouvement reduit, aucune traversee : un reflet n'a pas d'etat final a
 * preserver, il n'apporte que son passage.
 *
 * @module
 */

import { mergePresentation, useMotionState, type Customisable } from '@odoro-cli/engine'
import { type CSSProperties, type ReactElement, type ReactNode } from 'react'

/** Proprietes propres au composant. */
export interface GlareHoverOwnProps {
  /** Contenu traverse par le reflet. */
  children: ReactNode
  /** Duree de la traversee, en millisecondes. @defaultValue 700 */
  duration?: number
  /** Inclinaison de la bande, en degres. @defaultValue 115 */
  angle?: number
  /** Demi-largeur de la bande, en pourcentage de la diagonale. @defaultValue 14 */
  width?: number
  /** Couleur du reflet. @defaultValue une encre tres diluee */
  color?: string
  /** Balaie en boucle, sans attendre le survol. @defaultValue false */
  loop?: boolean
}

/** Toutes les proprietes. */
export type GlareHoverProps = Customisable<GlareHoverOwnProps>

/** Identifiant de la feuille injectee. */
const STYLE_ID = 'o-glare-hover'

/** Pose les regles du reflet, une fois par document. */
function ensureGlareRules(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-glare]{position:relative;isolation:isolate;overflow:hidden}',
    // Deux fois la taille de l'hote, decale de moitie : la bande reste hors
    // cadre a ses deux extremites, quel que soit l'angle.
    '[data-o-glare]::after{',
    'content:"";position:absolute;top:-50%;left:-50%;width:200%;height:200%;',
    'pointer-events:none;opacity:0;transform:translate3d(-60%,0,0);',
    'background:linear-gradient(var(--o-glare-angle),',
    'transparent calc(50% - var(--o-glare-width)),',
    'var(--o-glare-color) 50%,',
    'transparent calc(50% + var(--o-glare-width)))',
    '}',
    '@keyframes o-glare{',
    'from{opacity:0;transform:translate3d(-60%,0,0)}',
    '20%{opacity:1}',
    '80%{opacity:1}',
    'to{opacity:0;transform:translate3d(60%,0,0)}',
    '}',
    '[data-o-glare]:hover::after,[data-o-glare]:focus-within::after{',
    'animation:o-glare var(--o-glare-duration) var(--o-ease-standard,ease-out) 1',
    '}',
    '[data-o-glare-loop]::after{',
    'animation:o-glare var(--o-glare-duration) var(--o-ease-standard,ease-out) infinite',
    '}',
    // Le composant retire deja l'attribut sous mouvement reduit ; la regle
    // couvre le cas ou la preference change apres le montage.
    '@media (prefers-reduced-motion:reduce){[data-o-glare]::after{animation:none;opacity:0}}',
  ].join('')
  document.head.append(style)
}

/**
 * Fait passer un reflet sur son contenu.
 *
 * @example
 * <GlareHover className="o-rounded-xl o-border-w-1 o-p-6">
 *   <h3>Une carte</h3>
 * </GlareHover>
 *
 * @example
 * // Une bande large et lente, en boucle, dans la teinte de marque.
 * <GlareHover loop duration={2400} width={26} color="var(--o-palette-brand-500)">
 *   <img src="/couverture.jpg" alt="" />
 * </GlareHover>
 */
export function GlareHover({
  children,
  duration = 700,
  angle = 115,
  width = 14,
  color = 'color-mix(in oklab, var(--o-theme-fg) 24%, transparent)',
  loop = false,
  ...rest
}: GlareHoverProps): ReactElement {
  const { reduced } = useMotionState()
  ensureGlareRules()

  const { className, style } = mergePresentation({}, rest)

  return (
    <div
      {...rest}
      className={className}
      style={
        {
          ...style,
          '--o-glare-duration': `${String(duration)}ms`,
          '--o-glare-angle': `${String(angle)}deg`,
          '--o-glare-width': `${String(width)}%`,
          '--o-glare-color': color,
        } as CSSProperties
      }
      data-o-glare={reduced ? undefined : ''}
      data-o-glare-loop={loop && !reduced ? '' : undefined}
    >
      {children}
    </div>
  )
}

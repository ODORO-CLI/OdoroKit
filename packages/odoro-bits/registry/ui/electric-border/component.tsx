/**
 * Bordure electrique : un contour qui crepite, des eclairs qui courent le
 * long du trait dans les deux sens, un halo qui vacille.
 *
 * ## Pourquoi pas une turbulence
 *
 * L'effet d'origine deforme le trait par un `feTurbulence` anime : le bruit
 * est recalcule a chaque image, sur toute la surface du cadre, et un
 * navigateur qui en affiche trois se met a bafouiller. Ce n'est pas un
 * reglage a baisser, c'est un cout par pixel et par image.
 *
 * L'electricite est donc ecrite autrement, avec ce qu'un moteur SVG anime
 * pour presque rien : le decalage d'un pointille. Deux traces du meme
 * rectangle portent chacune un motif de tirets irreguliers — courts, longs,
 * espaces sans regularite — et leur `stroke-dashoffset` defile, l'un dans
 * un sens, l'autre dans l'autre. Deux rangees d'eclairs qui se croisent
 * sur un coeur continu : la geometrie ne change pas, seule la phase avance.
 *
 * ## Le vacillement est par paliers
 *
 * Une lueur electrique ne s'eteint pas en fondu : elle saute. L'opacite du
 * halo suit donc une animation a `steps(1)`, avec des arrets a des instants
 * irreguliers — une baisse breve, un retour, une baisse plus longue. La
 * courbe a ete reglee a l'oeil : trop reguliere, elle fait clignotant ; trop
 * dense, elle fatigue.
 *
 * ## `pathLength` rend les tirets independants de la taille
 *
 * Le rectangle declare un perimetre de cent, quelle que soit sa taille
 * reelle. Un motif de tirets ecrit en centiemes de tour donne donc les memes
 * eclairs sur un bouton et sur une carte, sans rien mesurer.
 *
 * @module
 */

import { mergePresentation, useMotionState, type Customisable } from '@odoro-cli/engine'
import { type CSSProperties, type ReactElement, type ReactNode } from 'react'

/** Proprietes propres au composant. */
export interface ElectricBorderOwnProps {
  /** Contenu encadre. */
  children: ReactNode
  /**
   * Tokens du courant et des eclairs qui le parcourent.
   *
   * Deux, dans cet ordre. Le courant fait le halo et le coeur ; les eclairs
   * sont les tirets clairs qui defilent dessus.
   */
  colors?: readonly [string, string]
  /** Epaisseur du trait, en pixels. @defaultValue 2 */
  thickness?: number
  /** Rayon des angles du cadre, en pixels. @defaultValue 16 */
  radius?: number
  /** Duree d'un tour des eclairs, en millisecondes. @defaultValue 1400 */
  speed?: number
  /** Force du halo, de zero a un. @defaultValue 0.8 */
  intensity?: number
}

/** Toutes les proprietes. */
export type ElectricBorderProps = Customisable<ElectricBorderOwnProps>

/** Tokens employes par defaut. */
const DEFAULT_TOKENS = ['--o-palette-sky-400', '--o-palette-white'] as const

/**
 * Motifs de tirets des deux rangees d'eclairs, en centiemes de perimetre.
 *
 * Irreguliers a dessein : un motif regulier fait un pointille, pas un arc
 * electrique. Les deux sommes different pour que les rangees ne se
 * superposent jamais exactement.
 */
const ARC_A = '1 9 3 17 1 6 4 23 2 12'
const ARC_B = '2 14 1 7 3 19 1 11 2 27'

/** Identifiant de la feuille injectee. */
const STYLE_ID = 'o-electric-border'

/** Pose le cadre, les traces et leurs animations, une fois par document. */
function ensureElectricRules(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-elec]{position:relative;display:inline-block;isolation:isolate;',
    'border-radius:var(--o-elec-radius)}',
    '[data-o-elec-content]{position:relative;z-index:1;border-radius:inherit}',
    // Le SVG est rentre d'une demi-epaisseur : le trait, centre sur le bord
    // du rectangle, tombe alors exactement sur le bord du cadre.
    '[data-o-elec-svg]{',
    'position:absolute;z-index:0;pointer-events:none;overflow:visible;',
    'inset:calc(var(--o-elec-w) / 2);',
    'width:calc(100% - var(--o-elec-w));height:calc(100% - var(--o-elec-w));',
    '}',
    '[data-o-elec-svg] rect{fill:none;stroke-linejoin:round;stroke-linecap:round}',
    '[data-o-elec-trace="halo"]{stroke:var(--o-elec-current);stroke-width:calc(var(--o-elec-w) * 5);',
    'opacity:calc(var(--o-elec-intensity) * 0.3);',
    'animation:o-elec-flicker 2100ms steps(1,end) infinite}',
    '[data-o-elec-trace="core"]{stroke:var(--o-elec-current);stroke-width:var(--o-elec-w);',
    'opacity:0.9;animation:o-elec-flicker 2100ms steps(1,end) infinite reverse}',
    '[data-o-elec-trace="arc"]{stroke:var(--o-elec-spark);stroke-width:var(--o-elec-w);',
    'animation:o-elec-run var(--o-elec-speed) linear infinite}',
    '[data-o-elec-trace="arc"][data-o-elec-back]{animation-direction:reverse;opacity:0.7}',
    '@keyframes o-elec-run{to{stroke-dashoffset:-100}}',
    // Les paliers du vacillement, en fractions de l'intensite de repos.
    '@keyframes o-elec-flicker{',
    '0%,100%{opacity:calc(var(--o-elec-intensity) * 0.3)}',
    '7%{opacity:calc(var(--o-elec-intensity) * 0.16)}',
    '9%{opacity:calc(var(--o-elec-intensity) * 0.34)}',
    '31%{opacity:calc(var(--o-elec-intensity) * 0.26)}',
    '33%{opacity:calc(var(--o-elec-intensity) * 0.1)}',
    '36%{opacity:calc(var(--o-elec-intensity) * 0.32)}',
    '58%{opacity:calc(var(--o-elec-intensity) * 0.2)}',
    '60%{opacity:calc(var(--o-elec-intensity) * 0.36)}',
    '83%{opacity:calc(var(--o-elec-intensity) * 0.14)}',
    '85%{opacity:calc(var(--o-elec-intensity) * 0.3)}',
    '}',
    '@media (prefers-reduced-motion:reduce){[data-o-elec-svg] rect{animation:none}}',
  ].join('')
  document.head.append(style)
}

/**
 * Encadre un contenu d'un trait electrique.
 *
 * @example
 * <ElectricBorder className="o-p-6">
 *   <h3>Offre du moment</h3>
 * </ElectricBorder>
 *
 * @example
 * // Courant violet, trait plus epais, angles plus doux.
 * <ElectricBorder colors={['--o-palette-fuchsia-400', '--o-palette-white']} thickness={3} radius={24}>
 *   <button type="button" className="o-px-6 o-py-3">Activer</button>
 * </ElectricBorder>
 */
export function ElectricBorder({
  children,
  colors = DEFAULT_TOKENS,
  thickness = 2,
  radius = 16,
  speed = 1400,
  intensity = 0.8,
  ...rest
}: ElectricBorderProps): ReactElement {
  const { reduced } = useMotionState()
  ensureElectricRules()

  const { className, style } = mergePresentation({}, rest)

  // Le rectangle est rentre d'une demi-epaisseur : son rayon l'est aussi.
  const rx = Math.max(0, radius - thickness / 2)

  const trace = (kind: 'halo' | 'core' | 'arc', dash?: string, back = false): ReactElement => (
    <rect
      data-o-elec-trace={kind}
      data-o-elec-back={back ? '' : undefined}
      x="0"
      y="0"
      width="100%"
      height="100%"
      rx={rx}
      pathLength={100}
      strokeDasharray={dash}
    />
  )

  return (
    <div
      {...rest}
      data-o-elec=""
      className={className}
      style={
        {
          '--o-elec-current': `var(${colors[0]})`,
          '--o-elec-spark': `var(${colors[1]})`,
          '--o-elec-w': `${String(thickness)}px`,
          '--o-elec-radius': `${String(radius)}px`,
          '--o-elec-speed': `${String(speed)}ms`,
          '--o-elec-intensity': String(intensity),
          ...style,
        } as CSSProperties
      }
    >
      <svg aria-hidden="true" data-o-elec-svg="">
        {trace('halo')}
        {trace('core')}
        {/* Sous mouvement reduit les eclairs ne courent pas : le coeur suffit. */}
        {!reduced && trace('arc', ARC_A)}
        {!reduced && trace('arc', ARC_B, true)}
      </svg>
      <div data-o-elec-content="">{children}</div>
    </div>
  )
}

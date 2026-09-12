/**
 * Bouton verre liquide : une pastille de verre depoli, un reflet qui coule
 * au survol, une pression qui l'ecrase avant le retour elastique.
 *
 * ## Ce n'est pas le bouton a maree
 *
 * Le bouton a maree est opaque, et son mouvement est un calque qui monte
 * derriere le libelle. Ici la surface est translucide — le fond de la page se
 * devine a travers, flou et sature — et le mouvement est celui d'une matiere
 * molle : le reflet glisse d'un bord a l'autre comme une goutte, et la
 * pression deforme la pastille au lieu de la colorer.
 *
 * ## Le verre est une somme de bords, pas une image
 *
 * Un `backdrop-filter` seul donne un rectangle flou. Ce qui fait le verre,
 * c'est la lumiere sur ses aretes : un filet clair en haut, la ou la lumiere
 * frappe, un filet teinte en bas, la ou l'epaisseur retient la couleur, et un
 * halo porte de la teinte sous la pastille. Trois ombres internes et une
 * externe, toutes tirees de deux tokens.
 *
 * ## Le retour est plus lent que l'aller
 *
 * La pression est immediate : le doigt appuie, le verre cede. Le retour
 * prend sa duree et depasse sa cible avant de s'y poser — c'est cette
 * asymetrie qui fait la matiere liquide plutot que le ressort mecanique.
 *
 * ## Sous mouvement reduit
 *
 * Le reflet est deja a sa place d'arrivee, et la pression n'a plus de
 * rebond. Le verre reste du verre : l'information — translucide, en relief
 * — ne depend pas du mouvement.
 *
 * @module
 */

import { mergePresentation, useMotionState, type Customisable } from '@odoro-cli/engine'
import {
  type CSSProperties,
  type ElementType,
  type ReactElement,
  type ReactNode,
} from 'react'

/** Proprietes propres au composant. */
export interface LiquidGlassButtonOwnProps {
  /** Libelle du bouton. */
  children: ReactNode
  /** Cible du lien. Avec elle, le bouton est rendu comme un lien. */
  href?: string
  /**
   * Tokens de la teinte du verre et de sa lumiere.
   *
   * Deux, dans cet ordre. La teinte colore le verre et son halo ; la lumiere
   * fait les aretes et le reflet.
   */
  colors?: readonly [string, string]
  /** Flou du fond vu a travers le verre, en pixels. @defaultValue 14 */
  blur?: number
  /** Part de teinte dans le verre, de zero a un. @defaultValue 0.18 */
  tint?: number
  /** Duree du retour elastique apres la pression, en millisecondes. @defaultValue 600 */
  spring?: number
}

/** Toutes les proprietes. */
export type LiquidGlassButtonProps = Customisable<LiquidGlassButtonOwnProps, 'button'>

/** Tokens employes par defaut. */
const DEFAULT_TOKENS = ['--o-palette-brand-500', '--o-palette-white'] as const

/** Identifiant de la feuille injectee. */
const STYLE_ID = 'o-liquid-glass-button'

/** Pose le verre, ses aretes et son reflet, une fois par document. */
function ensureGlassRules(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-lglass]{',
    'position:relative;isolation:isolate;overflow:hidden;cursor:pointer;',
    'display:inline-flex;align-items:center;justify-content:center;gap:0.5em;',
    'border:1px solid color-mix(in oklab,var(--o-lglass-light) 35%,transparent);',
    'font:inherit;color:inherit;text-decoration:none;',
    'background:color-mix(in oklab,var(--o-lglass-tint) calc(var(--o-lglass-part) * 100%),transparent);',
    '-webkit-backdrop-filter:blur(var(--o-lglass-blur)) saturate(160%);',
    'backdrop-filter:blur(var(--o-lglass-blur)) saturate(160%);',
    // Les aretes : lumiere en haut, epaisseur teintee en bas, halo dessous.
    'box-shadow:inset 0 1px 0 color-mix(in oklab,var(--o-lglass-light) 60%,transparent),',
    'inset 0 -1px 0 color-mix(in oklab,var(--o-lglass-tint) 40%,transparent),',
    'inset 1px 0 0 color-mix(in oklab,var(--o-lglass-light) 20%,transparent),',
    '0 10px 30px -12px color-mix(in oklab,var(--o-lglass-tint) 55%,transparent);',
    // Aller sec, retour lent et depassant : voir l'en-tete du module.
    'transition:transform var(--o-lglass-spring) cubic-bezier(0.34,1.56,0.64,1),',
    'background-color var(--o-duration-slow) linear;',
    '}',
    '[data-o-lglass]:is(:hover,:focus-visible){',
    'background:color-mix(in oklab,var(--o-lglass-tint) calc(var(--o-lglass-part) * 100% + 8%),transparent)}',
    '[data-o-lglass]:focus-visible{outline:2px solid currentColor;outline-offset:3px}',
    '[data-o-lglass]:active{transform:scale(0.94,0.9);transition-duration:80ms}',
    '[data-o-lglass]:disabled,[data-o-lglass][aria-disabled="true"]{',
    'opacity:0.5;cursor:not-allowed;pointer-events:none}',

    // Le reflet : une goutte de lumiere, gare en haut a gauche, qui coule
    // vers le bas a droite au survol.
    '[data-o-lglass]::before{',
    'content:"";position:absolute;z-index:-1;pointer-events:none;',
    'inset:-40% auto auto -20%;width:80%;height:90%;border-radius:50%;',
    'background:radial-gradient(closest-side,color-mix(in oklab,var(--o-lglass-light) 55%,transparent),transparent);',
    'transition:translate var(--o-lglass-spring) cubic-bezier(0.34,1.3,0.64,1),',
    'scale var(--o-lglass-spring) cubic-bezier(0.34,1.3,0.64,1);',
    '}',
    '[data-o-lglass]:is(:hover,:focus-visible)::before{translate:70% 55%;scale:1.3 0.8}',
    '[data-o-lglass]>span{position:relative;z-index:1}',

    '@media (prefers-reduced-motion:reduce){',
    '[data-o-lglass],[data-o-lglass]::before{transition:none}',
    '[data-o-lglass]:active{transform:none}',
    '[data-o-lglass]::before{translate:70% 55%;scale:1.3 0.8}',
    '}',
  ].join('')
  document.head.append(style)
}

/**
 * Bouton de verre depoli, teinte et en relief.
 *
 * @example
 * <LiquidGlassButton onClick={reserver}>Reserver une place</LiquidGlassButton>
 *
 * @example
 * // Verre plus epais, teinte ciel, sur une image de fond.
 * <LiquidGlassButton
 *   href="/galerie"
 *   colors={['--o-palette-sky-400', '--o-palette-white']}
 *   blur={24}
 *   tint={0.3}
 * >
 *   Ouvrir la galerie
 * </LiquidGlassButton>
 */
export function LiquidGlassButton({
  children,
  href,
  colors = DEFAULT_TOKENS,
  blur = 14,
  tint = 0.18,
  spring = 600,
  ...rest
}: LiquidGlassButtonProps): ReactElement {
  const { reduced } = useMotionState()
  ensureGlassRules()

  const { className, style } = mergePresentation(
    { className: 'o-rounded-full o-px-6 o-py-3 o-font-medium' },
    rest,
  )

  const Tag = (href === undefined ? 'button' : 'a') as ElementType
  const { disabled, type, ...attributes } = rest

  return (
    <Tag
      {...(href === undefined
        ? { type: type ?? 'button', disabled }
        : { href, 'aria-disabled': disabled === true ? 'true' : undefined })}
      {...attributes}
      data-o-lglass=""
      className={className}
      style={
        {
          '--o-lglass-tint': `var(${colors[0]})`,
          '--o-lglass-light': `var(${colors[1]})`,
          '--o-lglass-blur': `${String(blur)}px`,
          '--o-lglass-part': String(tint),
          '--o-lglass-spring': `${String(reduced ? 0 : spring)}ms`,
          ...style,
        } as CSSProperties
      }
    >
      <span>{children}</span>
    </Tag>
  )
}

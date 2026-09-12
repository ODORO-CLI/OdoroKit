/**
 * Surface de verre : un panneau depoli pose sur la page, a travers lequel le
 * fond se devine.
 *
 * ## Le verre a besoin de quelque chose derriere lui
 *
 * `backdrop-filter` floute ce qui est **sous** l'element. Sur un fond uni,
 * flouter un aplat rend un aplat : le panneau parait cher a afficher et ne
 * montre rien. Une surface de verre se pose sur une image, un degrade, un
 * fond anime — sinon une carte ordinaire fait mieux le travail, pour rien.
 *
 * ## L'epaisseur se lit sur les aretes, pas dans le flou
 *
 * Un rectangle flou n'est pas du verre : c'est une photo mal prise. Ce qui
 * fait la plaque, c'est la lumiere sur ses bords — un filet clair en haut ou
 * elle frappe, un filet teinte en bas ou l'epaisseur retient la couleur, un
 * halo porte dessous, et un reflet diagonal fige. Quatre ombres et un
 * degrade, tous tires des deux memes tokens : changer la teinte change tout
 * l'ensemble d'un coup.
 *
 * ## Le repli n'est pas une degradation, c'est l'autre etat de la surface
 *
 * Sans flou de fond — un navigateur qui ne l'implemente pas, un reglage
 * d'economie, une capture d'ecran — un verre translucide devient un voile qui
 * laisse passer le texte du dessous, et le contenu du panneau devient
 * illisible. La regle de repli rend donc la surface **opaque** : le contraste
 * est retabli, les aretes restent, et l'on perd le fond entrevu — le seul
 * element qui n'etait pas porteur d'information.
 *
 * ## Ce n'est pas le bouton de verre liquide
 *
 * Le bouton est une pastille qui reagit : un reflet qui coule au survol, une
 * pression qui l'ecrase. Le panneau ne reagit a rien — il porte du contenu,
 * et un contenant qui s'anime sous le texte qu'il porte devient un
 * distracteur. Rien a animer, donc rien a retirer sous mouvement reduit.
 *
 * @module
 */

import { mergePresentation, type Customisable } from '@odoro-cli/engine'
import { type CSSProperties, type ReactElement, type ReactNode } from 'react'

/** Proprietes propres au composant. */
export interface GlassSurfaceOwnProps {
  /** Le contenu pose sur le verre. */
  children: ReactNode
  /**
   * Tokens de la teinte du verre et de sa lumiere.
   *
   * Deux, dans cet ordre. La teinte colore la masse et le halo ; la lumiere
   * fait les aretes et le reflet.
   */
  colors?: readonly [string, string]
  /** Flou du fond vu a travers le verre, en pixels. @defaultValue 16 */
  blur?: number
  /** Part de teinte dans la masse, de zero a un. @defaultValue 0.14 */
  tint?: number
  /** Force des aretes et du halo. @defaultValue 1 */
  thickness?: number
  /** Ajoute le reflet diagonal fige. @defaultValue true */
  sheen?: boolean
}

/** Toutes les proprietes. */
export type GlassSurfaceProps = Customisable<GlassSurfaceOwnProps>

/** Tokens employes par defaut. */
const DEFAULT_TOKENS = ['--o-palette-brand-500', '--o-palette-white'] as const

/** Identifiant de la feuille injectee. */
const STYLE_ID = 'o-glass-surface'

/** Pose la plaque, ses aretes, son reflet et son repli, une fois par document. */
function ensureSurfaceRules(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-gsurf]{',
    'position:relative;isolation:isolate;overflow:hidden;',
    'border:1px solid color-mix(in oklab,var(--o-gsurf-light) 30%,var(--o-theme-line));',
    'background:color-mix(in oklab,var(--o-gsurf-tint) calc(var(--o-gsurf-part) * 100%),transparent);',
    '-webkit-backdrop-filter:blur(var(--o-gsurf-blur)) saturate(170%);',
    'backdrop-filter:blur(var(--o-gsurf-blur)) saturate(170%);',
    // Lumiere en haut, epaisseur teintee en bas, un filet lateral, halo dessous.
    'box-shadow:inset 0 1px 0 color-mix(in oklab,var(--o-gsurf-light) calc(var(--o-gsurf-epaisseur) * 55%),transparent),',
    'inset 0 -1px 0 color-mix(in oklab,var(--o-gsurf-tint) calc(var(--o-gsurf-epaisseur) * 40%),transparent),',
    'inset 1px 0 0 color-mix(in oklab,var(--o-gsurf-light) calc(var(--o-gsurf-epaisseur) * 18%),transparent),',
    '0 18px 40px -24px color-mix(in oklab,var(--o-gsurf-tint) calc(var(--o-gsurf-epaisseur) * 60%),transparent);',
    '}',
    // Le reflet : une bande diagonale figee, posee sous le contenu.
    '[data-o-gsurf-reflet]::before{',
    'content:"";position:absolute;inset:0;z-index:-1;pointer-events:none;',
    'background:linear-gradient(112deg,',
    'color-mix(in oklab,var(--o-gsurf-light) 22%,transparent) 0%,',
    'transparent 38%,transparent 62%,',
    'color-mix(in oklab,var(--o-gsurf-light) 10%,transparent) 100%);',
    '}',
    // Sans flou de fond, la translucidite devient illisible : la plaque se
    // ferme. Voir l'en-tete du module.
    '@supports not ((backdrop-filter:blur(2px)) or (-webkit-backdrop-filter:blur(2px))){',
    '[data-o-gsurf]{',
    'background:var(--o-theme-surface);',
    'border-color:var(--o-theme-line);',
    '}',
    '}',
  ].join('')
  document.head.append(style)
}

/**
 * Panneau de verre depoli.
 *
 * @example
 * <GlassSurface className="o-rounded-2xl o-p-6">
 *   <h2>Prochaine seance</h2>
 *   <p>Jeudi 12 mars, vingt heures.</p>
 * </GlassSurface>
 *
 * @example
 * // Verre plus epais, teinte ciel, sur une affiche.
 * <GlassSurface
 *   colors={['--o-palette-sky-400', '--o-palette-white']}
 *   blur={26}
 *   tint={0.3}
 *   thickness={1.4}
 *   className="o-rounded-2xl o-p-8"
 * >
 *   {details}
 * </GlassSurface>
 */
export function GlassSurface({
  children,
  colors = DEFAULT_TOKENS,
  blur = 16,
  tint = 0.14,
  thickness = 1,
  sheen = true,
  ...rest
}: GlassSurfaceProps): ReactElement {
  ensureSurfaceRules()

  const { className, style } = mergePresentation(
    { className: 'o-rounded-2xl o-p-6' },
    rest,
  )

  return (
    <div
      {...rest}
      data-o-gsurf=""
      data-o-gsurf-reflet={sheen ? '' : undefined}
      className={className}
      style={
        {
          '--o-gsurf-tint': `var(${colors[0]})`,
          '--o-gsurf-light': `var(${colors[1]})`,
          '--o-gsurf-blur': `${String(blur)}px`,
          '--o-gsurf-part': String(tint),
          '--o-gsurf-epaisseur': String(thickness),
          ...style,
        } as CSSProperties
      }
    >
      {children}
    </div>
  )
}

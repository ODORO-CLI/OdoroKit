/**
 * Icones de verre : des pastilles depolies posees chacune sur une lueur
 * coloree, que le verre etale.
 *
 * ## La lueur est derriere le verre, pas dedans
 *
 * `backdrop-filter` ne floute que ce qui est deja peint **derriere**
 * l'element. La lueur est donc une soeur de la pastille, posee avant elle
 * dans le meme bouton : le verre la trouve dans son arriere-plan et l'etale.
 * Mise a l'interieur de la pastille, elle resterait nette — un rond de
 * couleur colle sur du verre, ce qui est exactement l'effet qu'on ne veut
 * pas.
 *
 * C'est aussi ce qui rend le flou utile ici, alors qu'une surface de verre
 * posee sur un aplat ne montre rien : la pastille a toujours quelque chose a
 * diffuser, meme sur une page unie.
 *
 * ## Le pivot est fixe, il ne suit pas le pointeur
 *
 * Une carte qui s'incline vers le pointeur demande une boucle, une mesure et
 * un amortissement — pour une cible de soixante-seize pixels, ou le pointeur
 * n'a la place de rien nuancer. Le pivot est donc un etat, pas un suivi :
 * une transition entre deux transformations, que le compositeur tient seul.
 * Le clavier obtient exactement le meme etat, ce qu'un suivi de pointeur ne
 * saurait pas faire.
 *
 * ## Ce n'est pas la barre a loupe
 *
 * La barre a loupe est un rang d'elements dont la taille depend de la
 * distance au pointeur : l'effet vit dans le voisinage. Ici chaque pastille
 * est seule — elle s'allume pour elle-meme, et se range en planche plutot
 * qu'en rang.
 *
 * ## Le libelle est du texte, sous la pastille
 *
 * Une icone seule n'est comprise que par qui la connait deja. Le libelle est
 * donc toujours affiche, dans le document, et l'icone est marquee comme
 * decorative : le lecteur d'ecran annonce le bouton une fois, avec son nom.
 *
 * ## Ce qui reste quand on retire le verre ou le mouvement
 *
 * Sans flou de fond, la pastille devient opaque et prend sa teinte : la
 * planche reste lisible et coloree. Sous mouvement reduit, elle s'allume sans
 * pivoter — l'etat d'arrivee, sans le trajet.
 *
 * @module
 */

import { mergePresentation, type Customisable } from '@odoro-cli/engine'
import { type CSSProperties, type ReactElement, type ReactNode } from 'react'

/** Une pastille de la planche. */
export interface GlassIconItem {
  /** Identifiant, unique dans la planche. */
  readonly id: string
  /** Libelle affiche sous la pastille. */
  readonly label: string
  /** Signe pose sur le verre. Il est decoratif : le nom est le libelle. */
  readonly icon: ReactNode
}

/** Proprietes propres au composant. */
export interface GlassIconsOwnProps {
  /** Les pastilles, dans l'ordre. */
  items: readonly GlassIconItem[]
  /** Nom de la planche pour les lecteurs d'ecran. */
  label: string
  /**
   * Appele au clic ou a Entree sur une pastille.
   *
   * Obligatoire : une planche de pastilles existe pour mener quelque part, et
   * un bouton qui ne fait rien promet une suite qui n'existe pas.
   */
  onSelect: (id: string) => void
  /** Tokens des lueurs, attribues dans l'ordre et en boucle. */
  colors?: readonly string[]
  /** Cote d'une pastille, en pixels. @defaultValue 76 */
  size?: number
  /** Flou du verre, en pixels. @defaultValue 10 */
  blur?: number
  /** Angle de trois quarts pris au survol, en degres. @defaultValue 16 */
  tilt?: number
}

/** Toutes les proprietes. */
export type GlassIconsProps = Customisable<GlassIconsOwnProps, 'ul'>

/** Tokens employes par defaut. */
const DEFAULT_TOKENS = [
  '--o-palette-brand-500',
  '--o-palette-fuchsia-500',
  '--o-palette-sky-500',
  '--o-palette-emerald-500',
] as const

/** Identifiant de la feuille injectee. */
const STYLE_ID = 'o-glass-icons'

/** Pose la planche, la lueur, le verre et leur repli, une fois par document. */
function ensureIconsRules(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-gicons]{',
    'display:flex;flex-wrap:wrap;justify-content:center;gap:1.25rem;',
    'margin:0;padding:0;list-style:none;',
    '}',
    '[data-o-gicons-cible]{',
    'display:flex;flex-direction:column;align-items:center;gap:0.55rem;',
    'position:relative;padding:0;border:0;background:none;font:inherit;color:inherit;',
    'cursor:pointer;perspective:520px;',
    '}',
    'button[data-o-gicons-cible]:focus-visible{outline:none}',
    // La lueur : peinte avant le verre, donc dans son arriere-plan.
    '[data-o-gicons-lueur]{',
    'position:absolute;top:0;left:50%;pointer-events:none;',
    'width:var(--o-gicons-cote);height:var(--o-gicons-cote);',
    'translate:-50% 0;border-radius:38%;',
    'background:radial-gradient(closest-side,var(--o-gicons-teinte),transparent);',
    'transition:scale var(--o-duration-slow) var(--o-ease-emphasized),',
    'opacity var(--o-duration-slow) linear;',
    'opacity:0.75;',
    '}',
    '[data-o-gicons-verre]{',
    'display:flex;align-items:center;justify-content:center;',
    'width:var(--o-gicons-cote);height:var(--o-gicons-cote);',
    'border-radius:30%;position:relative;',
    'border:1px solid color-mix(in oklab,var(--o-palette-white) 34%,var(--o-theme-line));',
    'background:color-mix(in oklab,var(--o-gicons-teinte) 10%,transparent);',
    '-webkit-backdrop-filter:blur(var(--o-gicons-flou)) saturate(180%);',
    'backdrop-filter:blur(var(--o-gicons-flou)) saturate(180%);',
    'box-shadow:inset 0 1px 0 color-mix(in oklab,var(--o-palette-white) 55%,transparent),',
    'inset 0 -1px 0 color-mix(in oklab,var(--o-gicons-teinte) 45%,transparent),',
    '0 12px 26px -16px var(--o-gicons-teinte);',
    'transform-style:preserve-3d;',
    'transition:transform var(--o-duration-slow) var(--o-ease-emphasized);',
    '}',
    '[data-o-gicons-signe]{display:flex;line-height:0;font-size:calc(var(--o-gicons-cote) * 0.4)}',
    '[data-o-gicons-nom]{font-size:0.8125em;color:var(--o-theme-muted);text-align:center}',
    // L'etat de survol et l'etat de focus sont le meme etat : ce que la souris
    // obtient, le clavier l'obtient aussi.
    '[data-o-gicons-cible]:is(:hover,:focus-visible) [data-o-gicons-verre]{',
    'transform:translateY(-6px) rotateX(calc(var(--o-gicons-pivot) * -0.7)) rotateY(var(--o-gicons-pivot));',
    '}',
    '[data-o-gicons-cible]:is(:hover,:focus-visible) [data-o-gicons-lueur]{scale:1.25;opacity:1}',
    '[data-o-gicons-cible]:focus-visible [data-o-gicons-verre]{',
    'outline:2px solid var(--o-gicons-teinte);outline-offset:4px;',
    '}',
    '[data-o-gicons-cible]:active [data-o-gicons-verre]{transform:translateY(-2px) scale(0.96)}',
    // Sans flou de fond, la lueur ne serait plus etalee mais posee en rond net
    // sous une plaque translucide : la pastille se ferme et prend la teinte.
    '@supports not ((backdrop-filter:blur(2px)) or (-webkit-backdrop-filter:blur(2px))){',
    '[data-o-gicons-verre]{background:color-mix(in oklab,var(--o-gicons-teinte) 20%,var(--o-theme-surface))}',
    '[data-o-gicons-lueur]{display:none}',
    '}',
    '@media (prefers-reduced-motion:reduce){',
    '[data-o-gicons-verre],[data-o-gicons-lueur]{transition:none}',
    '[data-o-gicons-cible]:is(:hover,:focus-visible) [data-o-gicons-verre]{transform:none}',
    '[data-o-gicons-cible]:active [data-o-gicons-verre]{transform:none}',
    '}',
  ].join('')
  document.head.append(style)
}

/**
 * Planche de pastilles de verre.
 *
 * @example
 * <GlassIcons
 *   label="Raccourcis"
 *   items={[
 *     { id: 'agenda', label: 'Agenda', icon: <Icon name="calendar" /> },
 *     { id: 'messages', label: 'Messages', icon: <Icon name="mail" /> },
 *   ]}
 *   onSelect={ouvrir}
 * />
 *
 * @example
 * // Pastilles larges, verre epais, deux teintes en alternance.
 * <GlassIcons
 *   label="Univers"
 *   items={rayons}
 *   colors={['--o-palette-violet-500', '--o-palette-amber-500']}
 *   size={110}
 *   blur={18}
 * />
 */
export function GlassIcons({
  items,
  label,
  onSelect,
  colors = DEFAULT_TOKENS,
  size = 76,
  blur = 10,
  tilt = 16,
  ...rest
}: GlassIconsProps): ReactElement {
  ensureIconsRules()

  const { className, style } = mergePresentation({}, rest)
  const teintes = colors.length === 0 ? DEFAULT_TOKENS : colors

  return (
    <ul
      {...rest}
      aria-label={label}
      data-o-gicons=""
      className={className}
      style={
        {
          '--o-gicons-cote': `${String(size)}px`,
          '--o-gicons-flou': `${String(blur)}px`,
          '--o-gicons-pivot': `${String(tilt)}deg`,
          ...style,
        } as CSSProperties
      }
    >
      {items.map((item, index) => (
        <li
          key={item.id}
          style={
            {
              '--o-gicons-teinte': `var(${teintes[index % teintes.length] ?? DEFAULT_TOKENS[0]})`,
            } as CSSProperties
          }
        >
          <button
            type="button"
            data-o-gicons-cible=""
            onClick={() => {
              onSelect(item.id)
            }}
          >
            <span data-o-gicons-lueur="" aria-hidden="true" />
            <span data-o-gicons-verre="">
              <span data-o-gicons-signe="" aria-hidden="true">
                {item.icon}
              </span>
            </span>
            <span data-o-gicons-nom="">{item.label}</span>
          </button>
        </li>
      ))}
    </ul>
  )
}

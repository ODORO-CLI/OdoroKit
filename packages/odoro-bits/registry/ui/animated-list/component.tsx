/**
 * Liste qui se remplit en cascade quand elle entre dans le champ, et dont la
 * ligne survolee s'allume.
 *
 * ## La cascade se declenche a l'arrivee, pas au montage
 *
 * Une liste posee en bas de page a fini son animation avant qu'on la voie :
 * il ne reste qu'un bloc deja en place, et le travail est perdu. L'observation
 * par `useInView` attend que la liste soit reellement regardee. Le retard de
 * chaque ligne est un index ecrit dans une variable — la feuille en fait un
 * `animation-delay`, et le composant ne pose aucune minuterie.
 *
 * ## Ce n'est pas une barre d'onglets
 *
 * Des onglets changent de vue et vivent dans un `tablist`. Ici on choisit une
 * ligne dans un inventaire : c'est un `listbox`, le choix suit le focus, et la
 * liste defile. Les fleches circulent, Origine et Fin sautent aux extremites,
 * une seule ligne est dans l'ordre de tabulation.
 *
 * ## Le voile des bords est un masque, pas un degrade pose dessus
 *
 * Un degrade superpose devrait connaitre la couleur du fond ; il se trahit des
 * que la page change de theme. Un `mask-image` retire de l'alpha : il marche
 * sur n'importe quel fond, et laisse les lignes du dessous cliquables.
 *
 * ## Mouvement reduit
 *
 * Aucune cascade : les lignes sont a leur place finale, visibles, des le
 * premier rendu — l'observation ne conditionne plus rien.
 *
 * @module
 */

import { mergePresentation, type Customisable } from '@odoro-cli/engine'
import { useInView } from '@registre/hooks/useInView'
import {
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type ReactElement,
} from 'react'

/** Une ligne de la liste. */
export interface AnimatedListItem {
  /** Identifiant, unique dans la liste. */
  readonly id: string
  /** Libelle affiche. */
  readonly label: string
  /** Precision affichee en sourdine, a droite du libelle. */
  readonly hint?: string
}

/** Proprietes propres au composant. */
export interface AnimatedListOwnProps {
  /** Les lignes, dans l'ordre d'affichage. */
  items: readonly AnimatedListItem[]
  /** Nom de la liste pour les lecteurs d'ecran. */
  label: string
  /** Ligne choisie, en mode controle. */
  value?: string
  /** Ligne choisie au montage, en mode non controle. */
  defaultValue?: string
  /** Appele quand le choix change. */
  onChange?: (id: string) => void
  /** Retard ajoute par ligne dans la cascade. @defaultValue 60 */
  stagger?: number
  /** Voile les bords haut et bas de la zone qui defile. @defaultValue true */
  fade?: boolean
}

/** Toutes les proprietes. */
export type AnimatedListProps = Customisable<AnimatedListOwnProps>

/** Identifiant de la feuille injectee. */
const STYLE_ID = 'o-animated-list'

/** Pose la zone de defilement, les lignes et leur cascade, une fois par document. */
function ensureListRules(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-alist]{',
    'display:flex;flex-direction:column;gap:6px;overflow-y:auto;overscroll-behavior:contain;',
    'padding:4px;scrollbar-width:thin;',
    '}',
    // Le voile est un masque : il ne connait pas la couleur du fond.
    '[data-o-alist][data-o-alist-fade]{',
    '-webkit-mask-image:linear-gradient(to bottom,transparent,currentColor 10%,currentColor 90%,transparent);',
    'mask-image:linear-gradient(to bottom,transparent,currentColor 10%,currentColor 90%,transparent);',
    '}',
    '[data-o-alist] [role="option"]{',
    'position:relative;display:flex;align-items:center;justify-content:space-between;gap:1rem;',
    'padding:0.6rem 0.9rem;border-radius:0.7rem;cursor:pointer;text-align:left;',
    'border:1px solid var(--o-theme-line);background:var(--o-theme-surface);',
    'font:inherit;color:inherit;',
    'transition:transform var(--o-duration-base) var(--o-ease-standard),',
    'background-color var(--o-duration-base) linear,border-color var(--o-duration-base) linear;',
    '}',
    // Le filet de gauche : c'est lui qui « allume » la ligne, pas un fond plein.
    '[data-o-alist] [role="option"]::before{',
    'content:"";position:absolute;left:0;top:50%;translate:0 -50%;',
    'width:3px;height:0;border-radius:999px;background:var(--o-alist-accent);',
    'transition:height var(--o-duration-base) var(--o-ease-standard);',
    '}',
    '[data-o-alist] [role="option"]:is(:hover,:focus-visible){',
    'transform:translateX(3px);',
    'background:color-mix(in oklab,var(--o-alist-accent) 7%,var(--o-theme-surface));',
    '}',
    '[data-o-alist] [role="option"]:is(:hover,:focus-visible)::before{height:45%}',
    '[data-o-alist] [role="option"][aria-selected="true"]{',
    'border-color:color-mix(in oklab,var(--o-alist-accent) 45%,transparent);',
    'background:color-mix(in oklab,var(--o-alist-accent) 10%,var(--o-theme-surface));',
    '}',
    '[data-o-alist] [role="option"][aria-selected="true"]::before{height:60%}',
    '[data-o-alist] [role="option"]:focus-visible{outline:2px solid var(--o-alist-accent);outline-offset:2px}',
    '[data-o-alist-hint]{opacity:0.55;font-size:0.875em;white-space:nowrap}',
    // Avant la cascade, les lignes sont retenues ; l'attribut de passage les libere.
    '[data-o-alist] [role="option"]{opacity:0}',
    '[data-o-alist][data-o-alist-vu] [role="option"]{',
    'animation:o-alist-in var(--o-duration-slow) var(--o-ease-entrance) both;',
    'animation-delay:calc(var(--o-alist-index) * var(--o-alist-stagger));',
    '}',
    // La cascade se joue sur `translate`, pas sur `transform` : une animation
    // remplie vers l'avant garderait la main sur `transform`, et le survol ne
    // pourrait plus decaler la ligne.
    '@keyframes o-alist-in{from{opacity:0;translate:0 12px}to{opacity:1;translate:none}}',
    // Mouvement reduit : etat final tout de suite, sans attendre le passage.
    '@media (prefers-reduced-motion:reduce){',
    '[data-o-alist] [role="option"]{opacity:1;animation:none;transition:none}',
    '[data-o-alist] [role="option"]::before{transition:none}',
    '}',
  ].join('')
  document.head.append(style)
}

/**
 * Liste dont les lignes entrent en cascade et s'allument au survol.
 *
 * @example
 * <AnimatedList
 *   label="Activite"
 *   items={[
 *     { id: 'a', label: 'Virement recu', hint: '120 EUR' },
 *     { id: 'b', label: 'Abonnement', hint: '9 EUR' },
 *   ]}
 *   defaultValue="a"
 *   className="o-max-h-64"
 * />
 *
 * @example
 * // Mode controle : la page decide de la ligne choisie.
 * <AnimatedList label="Dossiers" items={dossiers} value={choix} onChange={setChoix} stagger={40} />
 */
export function AnimatedList({
  items,
  label,
  value,
  defaultValue,
  onChange,
  stagger = 60,
  fade = true,
  ...rest
}: AnimatedListProps): ReactElement {
  const { ref, vu } = useInView<HTMLDivElement>({ amount: 0.15 })
  const [internal, setInternal] = useState<string | undefined>(defaultValue)
  ensureListRules()

  const current = value ?? internal ?? items[0]?.id
  const currentIndex = Math.max(
    0,
    items.findIndex((item) => item.id === current),
  )

  const choose = (id: string): void => {
    if (value === undefined) setInternal(id)
    onChange?.(id)
  }

  /** Le choix suit le focus : c'est un listbox a selection unique. */
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>): void => {
    const last = items.length - 1
    if (last < 0) return
    const moves: Readonly<Record<string, number | undefined>> = {
      ArrowDown: currentIndex >= last ? 0 : currentIndex + 1,
      ArrowUp: currentIndex <= 0 ? last : currentIndex - 1,
      Home: 0,
      End: last,
    }
    const target = moves[event.key]
    if (target === undefined) return
    event.preventDefault()
    const item = items[target]
    if (item === undefined) return
    choose(item.id)
    const option = ref.current?.querySelectorAll<HTMLButtonElement>('[role="option"]')[target]
    option?.focus()
    option?.scrollIntoView({ block: 'nearest' })
  }

  const { className, style } = mergePresentation({}, rest)

  return (
    <div
      {...rest}
      ref={ref}
      role="listbox"
      aria-label={label}
      data-o-alist=""
      data-o-alist-fade={fade ? '' : undefined}
      data-o-alist-vu={vu ? '' : undefined}
      className={className}
      style={
        {
          '--o-alist-accent': 'var(--o-palette-brand-500)',
          '--o-alist-stagger': `${String(stagger)}ms`,
          ...style,
        } as CSSProperties
      }
      onKeyDown={(event) => {
        onKeyDown(event)
        rest.onKeyDown?.(event)
      }}
    >
      {items.map((item, index) => (
        <button
          key={item.id}
          type="button"
          role="option"
          aria-selected={item.id === current}
          tabIndex={index === currentIndex ? 0 : -1}
          style={{ '--o-alist-index': index } as CSSProperties}
          onClick={() => {
            choose(item.id)
          }}
        >
          <span>{item.label}</span>
          {item.hint !== undefined && <span data-o-alist-hint="">{item.hint}</span>}
        </button>
      ))}
    </div>
  )
}

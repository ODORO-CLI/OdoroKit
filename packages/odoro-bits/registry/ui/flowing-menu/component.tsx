/**
 * Menu coulant : des lignes de menu dont le fond coule au survol. Une bande
 * inversee entre par le bord ou le pointeur est arrive, et ressort par celui
 * ou il s'en va, en faisant defiler le libelle.
 *
 * ## Le bord d'entree est lu sur le geste, pas devine
 *
 * Une bande qui entre toujours par le bas ment une fois sur deux : quand le
 * pointeur descend dans la liste, il arrive par le haut. A chaque entree la
 * position verticale du pointeur est comparee au centre de la ligne, et la
 * bande part du bord le plus proche. Meme lecture a la sortie. C'est ce qui
 * fait que le fond semble suivre la main plutot que reagir a elle.
 *
 * ## Changer de bord sans le montrer
 *
 * Le bord est une variable CSS, et la transformation en depend. Ecrire la
 * variable pendant que la bande est cachee la ferait traverser la ligne, de
 * bas en haut, avant meme d'entrer — la transition ne sait pas que ce trajet
 * n'est pas voulu. La transition est donc coupee le temps d'ecrire le bord,
 * une mise en page forcee la fait prendre, puis elle est rendue.
 *
 * ## Le defilement ne tourne que sur la ligne survolee
 *
 * Une animation d'images cles par ligne, en permanence, c'est autant de
 * calques composites qui vivent pour rien. L'animation n'est posee que
 * quand la bande est visible.
 *
 * ## Sous mouvement reduit
 *
 * La bande apparait en place, et ne defile pas : le libelle y est ecrit
 * plusieurs fois, immobile. Ce qui reste est un survol inverse — le sens
 * est entier, seul le trajet manque.
 *
 * @module
 */

import { mergePresentation, type Customisable } from '@odoro-cli/engine'
import {
  useRef,
  type CSSProperties,
  type FocusEvent,
  type KeyboardEvent,
  type PointerEvent,
  type ReactElement,
  type ReactNode,
} from 'react'

/** Un element de navigation. */
export interface NavItem {
  /** Libelle affiche. */
  readonly label: string
  /** Cible du lien. Sans cible, l'element est un bouton. */
  readonly href?: string
  /** Icone, employee comme separateur dans la bande. */
  readonly icon?: ReactNode
}

/** Proprietes propres au composant. */
export interface FlowingMenuOwnProps {
  /** Les lignes, dans l'ordre d'affichage. */
  items: readonly NavItem[]
  /** Duree d'un tour du defilement dans la bande, en secondes. @defaultValue 10 */
  speed?: number
  /** Nombre de fois que le libelle est repete dans la bande. @defaultValue 4 */
  repeat?: number
  /** Index de la page courante. */
  active?: number
  /** Appele quand l'utilisateur choisit une ligne. */
  onActiveChange?: (index: number) => void
  /** Nom du bloc pour les lecteurs d'ecran. @defaultValue 'Navigation' */
  label?: string
}

/** Toutes les proprietes. */
export type FlowingMenuProps = Customisable<FlowingMenuOwnProps, 'nav'>

/** Identifiant de la feuille injectee. */
const STYLE_ID = 'o-flowing-menu'

/** Pose les lignes, la bande et le defilement, une fois par document. */
function ensureFlowingRules(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-flow]{display:block}',
    '[data-o-flow] ul{margin:0;padding:0;list-style:none}',
    '[data-o-flow-row]{',
    'position:relative;overflow:hidden;',
    'border-top:1px solid var(--o-theme-line);',
    '}',
    '[data-o-flow-row]:last-child{border-bottom:1px solid var(--o-theme-line)}',
    '[data-o-flow-link]{',
    'display:block;width:100%;box-sizing:border-box;',
    'padding:0.6em 1.25rem;text-align:left;',
    'font-size:clamp(1.5rem,4vw,3rem);font-weight:600;letter-spacing:-0.02em;line-height:1.1;',
    'color:inherit;text-decoration:none;background:none;border:0;font-family:inherit;cursor:pointer;',
    '}',
    '[data-o-flow-link]:focus-visible{outline:2px solid currentColor;outline-offset:-4px}',
    '[data-o-flow-link][aria-current]{color:var(--o-palette-brand-500)}',
    // La bande : le theme inverse, posee par-dessus, jamais cliquable.
    '[data-o-flow-band]{',
    'position:absolute;inset:0;pointer-events:none;overflow:hidden;',
    'background:var(--o-theme-fg);color:var(--o-theme-bg);',
    'transform:translateY(var(--o-flow-edge));',
    'transition:transform calc(var(--o-duration-slow) * 1.4) cubic-bezier(0.2,0,0,1);',
    '}',
    '[data-o-flow-row][data-o-flow-on] [data-o-flow-band]{transform:none}',
    '[data-o-flow-track]{',
    'display:flex;align-items:center;height:100%;width:max-content;',
    'font-size:clamp(1.5rem,4vw,3rem);font-weight:600;letter-spacing:-0.02em;white-space:nowrap;',
    '}',
    '[data-o-flow-row][data-o-flow-on] [data-o-flow-track]{animation:o-flow-marquee var(--o-flow-speed) linear infinite}',
    '[data-o-flow-track]>span{display:inline-flex;align-items:center;gap:0.5em;padding-right:0.5em}',
    '[data-o-flow-dot]{width:0.35em;height:0.35em;border-radius:999px;background:var(--o-palette-brand-500);flex:none}',
    '@keyframes o-flow-marquee{to{transform:translateX(-50%)}}',
    '@media (prefers-reduced-motion:reduce){',
    '[data-o-flow-band]{transition:none}',
    '[data-o-flow-row][data-o-flow-on] [data-o-flow-track]{animation:none}',
    '}',
  ].join('')
  document.head.append(style)
}

/**
 * Lignes de menu dont le fond coule au survol.
 *
 * @example
 * <FlowingMenu
 *   items={[
 *     { label: 'Cuisine', href: '/cuisine' },
 *     { label: 'Terrasse', href: '/terrasse' },
 *     { label: 'Cave', href: '/cave' },
 *   ]}
 * />
 *
 * @example
 * // Defilement plus vif, libelle repete plus souvent.
 * <FlowingMenu items={liens} speed={6} repeat={6} />
 */
export function FlowingMenu({
  items,
  speed = 10,
  repeat = 4,
  active,
  onActiveChange,
  label = 'Navigation',
  ...rest
}: FlowingMenuProps): ReactElement {
  const hostRef = useRef<HTMLElement | null>(null)
  ensureFlowingRules()

  const links = (): HTMLElement[] =>
    Array.from(hostRef.current?.querySelectorAll<HTMLElement>('[data-o-flow-link]') ?? [])

  /** Bord le plus proche du pointeur : `-101%` pour le haut, `101%` pour le bas. */
  const edgeOf = (row: HTMLElement, clientY: number): string => {
    const box = row.getBoundingClientRect()
    return clientY < box.top + box.height / 2 ? '-101%' : '101%'
  }

  /** Ecrit le bord sans que la transition ne le montre. */
  const setEdge = (row: HTMLElement, edge: string): void => {
    const band = row.querySelector<HTMLElement>('[data-o-flow-band]')
    if (band === null) return
    band.style.transition = 'none'
    row.style.setProperty('--o-flow-edge', edge)
    void band.offsetHeight
    band.style.transition = ''
  }

  const enter = (event: PointerEvent<HTMLLIElement>): void => {
    const row = event.currentTarget
    if (!row.hasAttribute('data-o-flow-on')) setEdge(row, edgeOf(row, event.clientY))
    row.setAttribute('data-o-flow-on', '')
  }

  const leave = (event: PointerEvent<HTMLLIElement>): void => {
    const row = event.currentTarget
    // Ouverte, la bande est a zero : changer le bord ne la deplace pas, et la
    // fermeture partira vers ce nouveau bord.
    row.style.setProperty('--o-flow-edge', edgeOf(row, event.clientY))
    row.removeAttribute('data-o-flow-on')
  }

  // Au clavier il n'y a pas de geste a lire : la bande entre et sort par le
  // haut, comme si l'on descendait la liste.
  const focus = (event: FocusEvent<HTMLLIElement>): void => {
    const row = event.currentTarget
    setEdge(row, '-101%')
    row.setAttribute('data-o-flow-on', '')
  }

  const blur = (event: FocusEvent<HTMLLIElement>): void => {
    event.currentTarget.removeAttribute('data-o-flow-on')
  }

  const onKeyDown = (event: KeyboardEvent<HTMLElement>): void => {
    const all = links()
    const focused = all.findIndex((link) => link === document.activeElement)
    if (focused < 0) return
    const last = all.length - 1
    const moves: Readonly<Record<string, number | undefined>> = {
      ArrowDown: focused >= last ? 0 : focused + 1,
      ArrowUp: focused <= 0 ? last : focused - 1,
      Home: 0,
      End: last,
    }
    const target = moves[event.key]
    if (target === undefined) return
    event.preventDefault()
    all[target]?.focus()
  }

  const { className, style } = mergePresentation({}, rest)
  const copies = Math.max(2, Math.min(repeat, 8))

  return (
    <nav
      {...rest}
      ref={hostRef}
      aria-label={label}
      data-o-flow=""
      className={className}
      style={{ ...style, '--o-flow-speed': `${String(speed)}s` } as CSSProperties}
      onKeyDown={(event) => {
        onKeyDown(event)
        rest.onKeyDown?.(event)
      }}
    >
      <ul>
        {items.map((item, index) => {
          const isCurrent = index === active
          const separator =
            item.icon !== undefined ? (
              <span aria-hidden="true">{item.icon}</span>
            ) : (
              <span aria-hidden="true" data-o-flow-dot="" />
            )
          // Deux groupes identiques : le defilement d'une moitie ramene
          // exactement le second sur la place du premier, sans raccord.
          const group = (prefix: string): ReactElement[] =>
            Array.from({ length: copies }, (_, copy) => (
              <span key={`${prefix}${String(copy)}`}>
                {item.label}
                {separator}
              </span>
            ))
          return (
            <li
              key={`${item.label}-${String(index)}`}
              data-o-flow-row=""
              style={{ '--o-flow-edge': '101%' } as CSSProperties}
              onPointerEnter={enter}
              onPointerLeave={leave}
              onFocus={focus}
              onBlur={blur}
            >
              {item.href !== undefined ? (
                <a
                  href={item.href}
                  data-o-flow-link=""
                  aria-current={isCurrent ? 'page' : undefined}
                  onClick={() => onActiveChange?.(index)}
                >
                  {item.label}
                </a>
              ) : (
                <button
                  type="button"
                  data-o-flow-link=""
                  aria-current={isCurrent ? 'page' : undefined}
                  onClick={() => onActiveChange?.(index)}
                >
                  {item.label}
                </button>
              )}
              <span aria-hidden="true" data-o-flow-band="">
                <span data-o-flow-track="">
                  {group('a')}
                  {group('b')}
                </span>
              </span>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

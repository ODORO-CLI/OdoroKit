/**
 * Menu a bulles : un bouton rond dont les liens jaillissent en bulles sur un
 * arc, une a une, et rentrent dans l'ordre inverse.
 *
 * ## Chaque bulle connait sa place, et son tour
 *
 * La position d'une bulle est un angle sur un arc, converti en deux
 * variables CSS ; son tour est un index, converti en retard de transition.
 * L'ouverture n'est qu'un attribut pose sur l'hote : a partir de la, la
 * feuille fait sortir les bulles l'une apres l'autre, avec un leger
 * depassement qui les fait « atterrir ». La fermeture inverse les retards,
 * pour que la derniere sortie soit la premiere rentree — comme des bulles
 * qui se resorbent vers leur source.
 *
 * ## Fermees, les bulles sont vraiment absentes
 *
 * Une bulle a echelle nulle reste focalisable et reste annoncee. Elle est
 * donc rendue invisible par `visibility`, avec un retard egal a la duree de
 * la rentree : le trajet se voit, puis l'element quitte l'arbre
 * d'accessibilite.
 *
 * ## Le bouton dit son etat, et le focus lui revient
 *
 * `aria-expanded` sur le bouton, Echap pour fermer, le focus rendu au bouton
 * a la fermeture. A l'ouverture, le focus va a la premiere bulle des qu'elle
 * est visible ; les fleches passent de l'une a l'autre.
 *
 * @module
 */

import { mergePresentation, useMotionState, type Customisable } from '@odoro-cli/engine'
import {
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type ReactElement,
  type ReactNode,
} from 'react'

/** Un element de navigation. */
export interface NavItem {
  /** Libelle affiche. */
  readonly label: string
  /** Cible du lien. Sans cible, l'element est un bouton. */
  readonly href?: string
  /** Icone placee avant le libelle. */
  readonly icon?: ReactNode
}

/** Cote vers lequel l'arc se deploie. */
export type BubbleDirection = 'up' | 'right' | 'down' | 'left'

/** Proprietes propres au composant. */
export interface BubbleMenuOwnProps {
  /** Les liens, dans l'ordre de sortie. */
  items: readonly NavItem[]
  /** Cote vers lequel l'arc se deploie. @defaultValue 'up' */
  direction?: BubbleDirection
  /** Distance entre le bouton et les bulles, en pixels. @defaultValue 110 */
  radius?: number
  /** Ouverture de l'arc, en degres. @defaultValue 120 */
  spread?: number
  /** Decalage entre deux bulles, en millisecondes. @defaultValue 50 */
  stagger?: number
  /** Etat ouvert, en mode controle. */
  open?: boolean
  /** Appele quand l'utilisateur ouvre ou ferme. */
  onOpenChange?: (open: boolean) => void
  /** Index de la page courante. */
  active?: number
  /** Appele quand l'utilisateur choisit un lien. */
  onActiveChange?: (index: number) => void
  /** Intitule du bouton pour les lecteurs d'ecran. @defaultValue 'Menu' */
  label?: string
}

/** Toutes les proprietes. */
export type BubbleMenuProps = Customisable<BubbleMenuOwnProps>

/** Angle de depart de chaque direction, en degres, sens horaire depuis la droite. */
const BASE_ANGLE: Readonly<Record<BubbleDirection, number>> = {
  right: 0,
  down: 90,
  left: 180,
  up: 270,
}

/** Identifiant de la feuille injectee. */
const STYLE_ID = 'o-bubble-menu'

/** Pose le bouton, l'arc et les bulles, une fois par document. */
function ensureBubbleRules(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-bubble]{position:relative;display:inline-block;width:3rem;height:3rem}',
    '[data-o-bubble-trigger]{',
    'position:relative;z-index:2;width:3rem;height:3rem;border-radius:999px;',
    'display:inline-flex;align-items:center;justify-content:center;',
    'background:var(--o-theme-surface);border:1px solid var(--o-theme-line);',
    'color:inherit;cursor:pointer;padding:0;',
    'transition:transform var(--o-duration-slow) cubic-bezier(0.2,0,0,1.2);',
    '}',
    '[data-o-bubble-trigger]:focus-visible{outline:2px solid currentColor;outline-offset:2px}',
    '[data-o-bubble][data-o-bubble-open] [data-o-bubble-trigger]{transform:rotate(45deg)}',
    // La croix : deux barres en encre courante, qui font un plus ferme et une
    // croix ouverte par la rotation du bouton.
    '[data-o-bubble-cross]{position:relative;width:1rem;height:1rem;display:block}',
    '[data-o-bubble-cross]::before,[data-o-bubble-cross]::after{',
    'content:"";position:absolute;background:currentColor;border-radius:1px;',
    '}',
    '[data-o-bubble-cross]::before{left:0;right:0;top:calc(50% - 1px);height:2px}',
    '[data-o-bubble-cross]::after{top:0;bottom:0;left:calc(50% - 1px);width:2px}',
    '[data-o-bubble] ul{position:absolute;top:50%;left:50%;width:0;height:0;margin:0;padding:0;list-style:none;z-index:1}',
    '[data-o-bubble] li{position:absolute;top:0;left:0}',
    '[data-o-bubble-item]{',
    'position:absolute;top:0;left:0;',
    'display:inline-flex;align-items:center;gap:0.5em;white-space:nowrap;',
    'padding:0.5rem 0.9rem;border-radius:999px;',
    'background:var(--o-theme-surface);border:1px solid var(--o-theme-line);',
    'box-shadow:0 8px 24px -12px color-mix(in oklab,currentColor 40%,transparent);',
    'color:inherit;text-decoration:none;font:inherit;cursor:pointer;',
    'transform:translate(-50%,-50%) scale(0);opacity:0;visibility:hidden;',
    'transition:transform var(--o-duration-slow) cubic-bezier(0.2,0,0,1.2) var(--o-bubble-delay-in),',
    'opacity var(--o-duration-slow) linear var(--o-bubble-delay-in),',
    'visibility 0s linear calc(var(--o-duration-slow) + var(--o-bubble-delay-in));',
    '}',
    '[data-o-bubble-item]:focus-visible{outline:2px solid currentColor;outline-offset:2px}',
    '[data-o-bubble-item][aria-current]{color:var(--o-palette-brand-500)}',
    '[data-o-bubble][data-o-bubble-open] [data-o-bubble-item]{',
    'transform:translate(calc(-50% + var(--o-bubble-x)),calc(-50% + var(--o-bubble-y))) scale(1);',
    'opacity:1;visibility:visible;',
    'transition:transform var(--o-duration-slow) cubic-bezier(0.2,0,0,1.2) var(--o-bubble-delay-out),',
    'opacity var(--o-duration-slow) linear var(--o-bubble-delay-out),',
    'visibility 0s linear var(--o-bubble-delay-out);',
    '}',
    '@media (prefers-reduced-motion:reduce){',
    '[data-o-bubble-item],[data-o-bubble-trigger]{transition:none}',
    '}',
  ].join('')
  document.head.append(style)
}

/**
 * Bouton rond dont les liens jaillissent en bulles.
 *
 * @example
 * <BubbleMenu
 *   items={[
 *     { label: 'Accueil', href: '/' },
 *     { label: 'Galerie', href: '/galerie' },
 *     { label: 'Contact', href: '/contact' },
 *   ]}
 * />
 *
 * @example
 * // Vers la droite, sur un arc serre.
 * <BubbleMenu items={liens} direction="right" spread={70} radius={140} />
 */
export function BubbleMenu({
  items,
  direction = 'up',
  radius = 110,
  spread = 120,
  stagger = 50,
  open,
  onOpenChange,
  active,
  onActiveChange,
  label = 'Menu',
  ...rest
}: BubbleMenuProps): ReactElement {
  const { reduced } = useMotionState()
  const listId = useId()
  const hostRef = useRef<HTMLDivElement | null>(null)
  const triggerRef = useRef<HTMLButtonElement | null>(null)
  const [internal, setInternal] = useState(false)
  ensureBubbleRules()

  const isOpen = open ?? internal

  const setOpen = (next: boolean): void => {
    if (open === undefined) setInternal(next)
    onOpenChange?.(next)
  }

  const bubbles = (): HTMLElement[] =>
    Array.from(hostRef.current?.querySelectorAll<HTMLElement>('[data-o-bubble-item]') ?? [])

  // Ouvert : le focus va a la premiere bulle des qu'elle est visible. Un clic
  // hors du menu le referme. Ferme : le focus revient au bouton s'il etait
  // dans le menu, pour ne pas le laisser tomber sur le corps du document.
  useEffect(() => {
    const host = hostRef.current
    if (host === null) return

    if (!isOpen) {
      if (host.contains(document.activeElement) && document.activeElement !== triggerRef.current) {
        triggerRef.current?.focus()
      }
      return
    }

    const first = bubbles()[0]
    const wait = reduced ? 0 : 60
    const timer = window.setTimeout(() => first?.focus({ preventScroll: true }), wait)

    const onOutside = (event: PointerEvent): void => {
      if (event.target instanceof Node && !host.contains(event.target)) setOpen(false)
    }
    document.addEventListener('pointerdown', onOutside, { passive: true })

    return () => {
      window.clearTimeout(timer)
      document.removeEventListener('pointerdown', onOutside)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, reduced])

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>): void => {
    if (event.key === 'Escape') {
      if (!isOpen) return
      event.preventDefault()
      setOpen(false)
      triggerRef.current?.focus()
      return
    }

    const all = bubbles()
    const focused = all.findIndex((bubble) => bubble === document.activeElement)
    if (focused < 0) return
    const last = all.length - 1
    const moves: Readonly<Record<string, number | undefined>> = {
      ArrowRight: focused >= last ? 0 : focused + 1,
      ArrowDown: focused >= last ? 0 : focused + 1,
      ArrowLeft: focused <= 0 ? last : focused - 1,
      ArrowUp: focused <= 0 ? last : focused - 1,
      Home: 0,
      End: last,
    }
    const target = moves[event.key]
    if (target === undefined) return
    event.preventDefault()
    all[target]?.focus()
  }

  const count = items.length
  const base = BASE_ANGLE[direction]
  const step = count > 1 ? spread / (count - 1) : 0
  const delay = reduced ? 0 : stagger

  const { className, style } = mergePresentation({}, rest)

  return (
    <div
      {...rest}
      ref={hostRef}
      data-o-bubble=""
      {...(isOpen ? { 'data-o-bubble-open': '' } : {})}
      className={className}
      style={style as CSSProperties}
      onKeyDown={(event) => {
        onKeyDown(event)
        rest.onKeyDown?.(event)
      }}
    >
      <button
        ref={triggerRef}
        type="button"
        data-o-bubble-trigger=""
        aria-expanded={isOpen}
        aria-controls={listId}
        aria-label={label}
        onClick={() => setOpen(!isOpen)}
      >
        <span aria-hidden="true" data-o-bubble-cross="" />
      </button>
      <ul id={listId}>
        {items.map((item, index) => {
          const angle = ((base - spread / 2 + step * index) * Math.PI) / 180
          const x = Math.cos(angle) * radius
          const y = Math.sin(angle) * radius
          const isCurrent = index === active
          const vars = {
            '--o-bubble-x': `${x.toFixed(1)}px`,
            '--o-bubble-y': `${y.toFixed(1)}px`,
            '--o-bubble-delay-out': `${String(index * delay)}ms`,
            '--o-bubble-delay-in': `${String((count - 1 - index) * delay)}ms`,
          } as CSSProperties
          const content = (
            <>
              {item.icon !== undefined && <span aria-hidden="true">{item.icon}</span>}
              {item.label}
            </>
          )
          return (
            <li key={`${item.label}-${String(index)}`}>
              {item.href !== undefined ? (
                <a
                  href={item.href}
                  data-o-bubble-item=""
                  aria-current={isCurrent ? 'page' : undefined}
                  tabIndex={isOpen ? 0 : -1}
                  style={vars}
                  onClick={() => onActiveChange?.(index)}
                >
                  {content}
                </a>
              ) : (
                <button
                  type="button"
                  data-o-bubble-item=""
                  aria-current={isCurrent ? 'page' : undefined}
                  tabIndex={isOpen ? 0 : -1}
                  style={vars}
                  onClick={() => onActiveChange?.(index)}
                >
                  {content}
                </button>
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}

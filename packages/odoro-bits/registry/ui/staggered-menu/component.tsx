/**
 * Menu decale : un menu plein ecran ouvert par un bouton. Des bandes de
 * couleur balaient l'ecran, le panneau les suit, et les liens montent un a
 * un.
 *
 * ## Trois temps, un seul attribut
 *
 * L'ouverture est un attribut pose sur l'hote. A partir de la, la feuille
 * fait tout : chaque bande part avec un retard qui depend de son rang, le
 * panneau part apres la derniere bande, chaque lien apres le panneau. C'est
 * la meme mecanique que le chargeur a rideau — un plan qui en cache un autre
 * — mais lue de l'autre sens : ici les plans arrivent, et la page reste
 * derriere.
 *
 * A la fermeture les retards tombent : tout repart ensemble, vite. Un menu
 * qui met autant de temps a se fermer qu'a s'ouvrir fait attendre quelqu'un
 * qui a deja decide.
 *
 * ## Les liens montent depuis un masque
 *
 * Chaque lien est dans une ligne a `overflow: hidden`, et arrive par une
 * translation verticale : il semble sortir du papier plutot que d'apparaitre.
 * Le texte est dans le DOM des le depart ; seul le trajet est visuel.
 *
 * ## Ce qu'un menu plein ecran doit au clavier
 *
 * Le bouton porte `aria-expanded` et `aria-controls`. Ouvert, le focus va au
 * premier lien ; Tab tourne a l'interieur du menu, jamais derriere lui ;
 * Echap ferme ; le focus revient au bouton. Le defilement de la page est
 * bloque tant que le menu couvre la fenetre — et seulement dans ce cas : un
 * menu contenu dans un cadre ne touche pas au document.
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

/** Proprietes propres au composant. */
export interface StaggeredMenuOwnProps {
  /** Les liens, dans l'ordre d'affichage. */
  items: readonly NavItem[]
  /**
   * Tokens des bandes qui precedent le panneau, dans l'ordre de passage.
   *
   * @defaultValue marque, puis encre du theme
   */
  colors?: readonly string[]
  /** Bord par lequel bandes et panneau entrent. @defaultValue 'right' */
  side?: 'right' | 'left'
  /** Decalage entre deux liens, en millisecondes. @defaultValue 70 */
  stagger?: number
  /** Couvre le parent positionne plutot que la fenetre. @defaultValue false */
  contained?: boolean
  /** Etat ouvert, en mode controle. */
  open?: boolean
  /** Appele quand l'utilisateur ouvre ou ferme. */
  onOpenChange?: (open: boolean) => void
  /** Index de la page courante. */
  active?: number
  /** Appele quand l'utilisateur choisit un lien. */
  onActiveChange?: (index: number) => void
  /** Nom du bloc de navigation pour les lecteurs d'ecran. @defaultValue 'Menu' */
  label?: string
  /** Contenu du bouton. @defaultValue 'Menu' ferme, 'Fermer' ouvert */
  trigger?: ReactNode
  /** Ce qui occupe le bas du panneau : reseaux, mentions. */
  footer?: ReactNode
}

/** Toutes les proprietes. */
export type StaggeredMenuProps = Customisable<StaggeredMenuOwnProps>

/** Bandes par defaut : la marque, puis l'encre du theme. */
const DEFAULT_COLORS: readonly string[] = ['--o-palette-brand-500', '--o-theme-fg']

/** Identifiant de la feuille injectee. */
const STYLE_ID = 'o-staggered-menu'

/** Pose le bouton, le voile, les bandes, le panneau et les liens, une fois par document. */
function ensureStaggeredRules(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-stag]{display:inline-block}',
    '[data-o-stag-trigger]{',
    'display:inline-flex;align-items:center;gap:0.5em;',
    'padding:0.5rem 1rem;border-radius:999px;',
    'border:1px solid var(--o-theme-line);background:none;',
    'color:inherit;font:inherit;cursor:pointer;',
    '}',
    '[data-o-stag-trigger]:focus-visible{outline:2px solid currentColor;outline-offset:2px}',
    // Le bouton passe au-dessus du voile quand celui-ci est ouvert, pour
    // rester cliquable et lisible sur le panneau.
    '[data-o-stag][data-o-stag-open] [data-o-stag-trigger]{position:relative;z-index:1011;color:var(--o-theme-fg)}',
    '[data-o-stag-veil]{',
    'position:fixed;inset:0;z-index:1010;overflow:hidden;',
    'visibility:hidden;',
    'transition:visibility 0s linear calc(var(--o-duration-slow) * 1.6);',
    '}',
    '[data-o-stag][data-o-stag-contained] [data-o-stag-veil]{position:absolute}',
    '[data-o-stag][data-o-stag-open] [data-o-stag-veil]{visibility:visible;transition:none}',
    '[data-o-stag-band],[data-o-stag-panel]{',
    'position:absolute;inset:0;',
    'transform:translateX(var(--o-stag-from));',
    'transition:transform calc(var(--o-duration-slow) * 1.4) cubic-bezier(0.3,0,1,1);',
    '}',
    '[data-o-stag-band]{background:var(--o-stag-color)}',
    '[data-o-stag-panel]{',
    'display:flex;flex-direction:column;justify-content:center;',
    'padding:clamp(1.5rem,6vw,5rem);box-sizing:border-box;',
    'background:var(--o-theme-bg);color:var(--o-theme-fg);',
    '}',
    '[data-o-stag][data-o-stag-open] [data-o-stag-band],[data-o-stag][data-o-stag-open] [data-o-stag-panel]{',
    'transform:none;',
    'transition:transform calc(var(--o-duration-slow) * 2) cubic-bezier(0.2,0,0,1) var(--o-stag-delay);',
    '}',
    '[data-o-stag-panel] ul{margin:0;padding:0;list-style:none;display:flex;flex-direction:column;gap:0.2em}',
    '[data-o-stag-panel] li{overflow:hidden;line-height:1.1}',
    '[data-o-stag-link]{',
    'display:inline-flex;align-items:baseline;gap:0.5em;',
    'font-size:clamp(2rem,6vw,4.5rem);font-weight:600;letter-spacing:-0.02em;',
    'color:inherit;text-decoration:none;background:none;border:0;padding:0;font-family:inherit;cursor:pointer;',
    'transform:translateY(110%);',
    'transition:transform var(--o-duration-slow) cubic-bezier(0.3,0,1,1),opacity var(--o-duration-slow) linear;',
    '}',
    '[data-o-stag-link]:hover,[data-o-stag-link]:focus-visible{opacity:0.7}',
    '[data-o-stag-link]:focus-visible{outline:2px solid currentColor;outline-offset:4px}',
    '[data-o-stag-link][aria-current]{color:var(--o-palette-brand-500)}',
    '[data-o-stag-link] small{font-size:0.3em;font-weight:500;letter-spacing:0.1em;opacity:0.6}',
    '[data-o-stag][data-o-stag-open] [data-o-stag-link]{',
    'transform:none;',
    'transition:transform calc(var(--o-duration-slow) * 2) cubic-bezier(0.2,0,0,1) var(--o-stag-delay),',
    'opacity var(--o-duration-slow) linear;',
    '}',
    '[data-o-stag-footer]{margin-top:2rem;opacity:0;transition:opacity var(--o-duration-slow) linear}',
    '[data-o-stag][data-o-stag-open] [data-o-stag-footer]{opacity:1;transition-delay:var(--o-stag-delay)}',
    '@media (prefers-reduced-motion:reduce){',
    '[data-o-stag-veil],[data-o-stag-band],[data-o-stag-panel],[data-o-stag-link],[data-o-stag-footer]{transition:none!important}',
    '}',
  ].join('')
  document.head.append(style)
}

/** Ce qui peut recevoir le focus dans le voile. */
const FOCUSABLE = 'a[href],button:not([disabled]),[tabindex]:not([tabindex="-1"])'

/**
 * Menu plein ecran a bandes et liens decales.
 *
 * @example
 * <StaggeredMenu
 *   items={[
 *     { label: 'Accueil', href: '/' },
 *     { label: 'Projets', href: '/projets' },
 *     { label: 'Studio', href: '/studio' },
 *     { label: 'Contact', href: '/contact' },
 *   ]}
 * />
 *
 * @example
 * // Dans un cadre de maquette, entrant par la gauche.
 * <StaggeredMenu items={liens} contained side="left" colors={['--o-palette-sky-500']} />
 */
export function StaggeredMenu({
  items,
  colors = DEFAULT_COLORS,
  side = 'right',
  stagger = 70,
  contained = false,
  open,
  onOpenChange,
  active,
  onActiveChange,
  label = 'Menu',
  trigger,
  footer,
  ...rest
}: StaggeredMenuProps): ReactElement {
  const { reduced } = useMotionState()
  const veilId = useId()
  const hostRef = useRef<HTMLDivElement | null>(null)
  const veilRef = useRef<HTMLDivElement | null>(null)
  const triggerRef = useRef<HTMLButtonElement | null>(null)
  const [internal, setInternal] = useState(false)
  ensureStaggeredRules()

  const isOpen = open ?? internal

  const setOpen = (next: boolean): void => {
    if (open === undefined) setInternal(next)
    onOpenChange?.(next)
  }

  const links = (): HTMLElement[] =>
    Array.from(veilRef.current?.querySelectorAll<HTMLElement>('[data-o-stag-link]') ?? [])

  const bandDelay = reduced ? 0 : 80
  const panelDelay = bandDelay * colors.length
  const linkDelay = reduced ? 0 : stagger

  // Ouvert : le focus va au premier lien une fois le panneau arrive, et le
  // document ne defile plus si le menu couvre la fenetre. Ferme : tout est
  // rendu, focus compris.
  useEffect(() => {
    if (!isOpen) return

    const wait = reduced ? 0 : panelDelay + 400
    const timer = window.setTimeout(() => links()[0]?.focus({ preventScroll: true }), wait)

    const root = document.documentElement
    const previous = root.style.overflow
    if (!contained) root.style.overflow = 'hidden'

    return () => {
      window.clearTimeout(timer)
      if (!contained) root.style.overflow = previous

      // Les refs sont lues **a la fermeture**, et c'est voulu : on veut savoir
      // ou le focus se trouve maintenant, et le rendre au declencheur tel qu'il
      // est maintenant. Les copier a l'ouverture de l'effet, comme la regle le
      // suggere, rendrait le focus a un noeud qui n'est peut-etre plus dans le
      // document.
      // eslint-disable-next-line react-hooks/exhaustive-deps
      const host = hostRef.current
      // eslint-disable-next-line react-hooks/exhaustive-deps
      if (host !== null && host.contains(document.activeElement)) triggerRef.current?.focus()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, contained, reduced])

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>): void => {
    if (!isOpen) return

    if (event.key === 'Escape') {
      event.preventDefault()
      setOpen(false)
      return
    }

    // Tab tourne entre le bouton et le contenu du voile : rien derriere le
    // menu n'est atteignable tant qu'il est ouvert.
    if (event.key === 'Tab') {
      const inside = Array.from(veilRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? [])
      const ring = [triggerRef.current, ...inside].filter(
        (element): element is HTMLElement => element !== null,
      )
      if (ring.length === 0) return
      const index = ring.findIndex((element) => element === document.activeElement)
      const next = event.shiftKey
        ? ring[index <= 0 ? ring.length - 1 : index - 1]
        : ring[index >= ring.length - 1 ? 0 : index + 1]
      event.preventDefault()
      next?.focus()
      return
    }

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

  const from = side === 'right' ? '100%' : '-100%'
  const { className, style } = mergePresentation({}, rest)

  return (
    <div
      {...rest}
      ref={hostRef}
      data-o-stag=""
      {...(isOpen ? { 'data-o-stag-open': '' } : {})}
      {...(contained ? { 'data-o-stag-contained': '' } : {})}
      className={className}
      style={{ ...style, '--o-stag-from': from } as CSSProperties}
      onKeyDown={(event) => {
        onKeyDown(event)
        rest.onKeyDown?.(event)
      }}
    >
      <button
        ref={triggerRef}
        type="button"
        data-o-stag-trigger=""
        aria-expanded={isOpen}
        aria-controls={veilId}
        onClick={() => setOpen(!isOpen)}
      >
        {trigger ?? (isOpen ? 'Fermer' : 'Menu')}
      </button>
      <div id={veilId} ref={veilRef} data-o-stag-veil="">
        {colors.map((token, index) => (
          <span
            key={`${token}-${String(index)}`}
            aria-hidden="true"
            data-o-stag-band=""
            style={
              {
                '--o-stag-color': `var(${token})`,
                '--o-stag-delay': `${String(index * bandDelay)}ms`,
              } as CSSProperties
            }
          />
        ))}
        <div data-o-stag-panel="" style={{ '--o-stag-delay': `${String(panelDelay)}ms` } as CSSProperties}>
          <nav aria-label={label}>
            <ul>
              {items.map((item, index) => {
                const isCurrent = index === active
                const vars = {
                  '--o-stag-delay': `${String(panelDelay + 120 + index * linkDelay)}ms`,
                } as CSSProperties
                const content = (
                  <>
                    <small aria-hidden="true">{String(index + 1).padStart(2, '0')}</small>
                    {item.icon !== undefined && <span aria-hidden="true">{item.icon}</span>}
                    {item.label}
                  </>
                )
                return (
                  <li key={`${item.label}-${String(index)}`}>
                    {item.href !== undefined ? (
                      <a
                        href={item.href}
                        data-o-stag-link=""
                        aria-current={isCurrent ? 'page' : undefined}
                        tabIndex={isOpen ? 0 : -1}
                        style={vars}
                        onClick={() => {
                          onActiveChange?.(index)
                          setOpen(false)
                        }}
                      >
                        {content}
                      </a>
                    ) : (
                      <button
                        type="button"
                        data-o-stag-link=""
                        aria-current={isCurrent ? 'page' : undefined}
                        tabIndex={isOpen ? 0 : -1}
                        style={vars}
                        onClick={() => {
                          onActiveChange?.(index)
                          setOpen(false)
                        }}
                      >
                        {content}
                      </button>
                    )}
                  </li>
                )
              })}
            </ul>
          </nav>
          {footer !== undefined && (
            <div
              data-o-stag-footer=""
              style={{ '--o-stag-delay': `${String(panelDelay + 200 + items.length * linkDelay)}ms` } as CSSProperties}
            >
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

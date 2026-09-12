/**
 * Navigation a pilule : une pilule de surface suit le lien survole, et
 * revient se poser sous la page courante quand le pointeur s'en va.
 *
 * ## Ce qui la distingue des onglets a pastille
 *
 * Les onglets a pastille marquent une selection : la pastille est pleine, de
 * la teinte de marque, et ne bouge qu'au clic. Ici la pilule est une lueur
 * de surface qui suit le survol et le focus — elle dit « voici ou tu vas »
 * avant le clic — et la page courante est dite autrement, par l'encre de
 * marque et par `aria-current`. Un onglet change de vue et reste un bouton ;
 * un element de navigation change de page et reste un lien.
 *
 * ## La pilule est mesuree sur l'element vise
 *
 * Position et largeur viennent d'`offsetLeft` et d'`offsetWidth` du lien,
 * lues au moment ou il est vise. Une transition CSS fait le trajet : si le
 * pointeur change de cible en cours de route, la transition repart de la
 * position ou la pilule se trouve reellement, sans qu'il y ait rien a
 * memoriser.
 *
 * ## Tous les liens sont dans l'ordre de tabulation
 *
 * Ce ne sont pas des onglets : ce sont des liens, et un lien se tabule. Les
 * fleches sont un raccourci en plus — elles deplacent le focus dans la barre,
 * Home et End vont aux extremites — jamais un remplacement.
 *
 * @module
 */

import { mergePresentation, type Customisable } from '@odoro-cli/engine'
import {
  useEffect,
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
export interface PillNavOwnProps {
  /** Les liens, dans l'ordre d'affichage. */
  items: readonly NavItem[]
  /** Index de la page courante, en mode controle. */
  active?: number
  /** Page courante au montage, en mode non controle. @defaultValue 0 */
  defaultActive?: number
  /** Appele quand l'utilisateur choisit un lien. */
  onActiveChange?: (index: number) => void
  /** Nom du bloc pour les lecteurs d'ecran. @defaultValue 'Navigation' */
  label?: string
}

/** Toutes les proprietes. */
export type PillNavProps = Customisable<PillNavOwnProps, 'nav'>

/** Identifiant de la feuille injectee. */
const STYLE_ID = 'o-pill-nav'

/** Pose la barre et sa pilule, une fois par document. */
function ensurePillNavRules(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-pill-nav]{',
    'position:relative;display:inline-flex;align-items:center;',
    'padding:4px;border-radius:999px;',
    'background:var(--o-theme-surface);border:1px solid var(--o-theme-line);',
    '}',
    '[data-o-pill-nav] ul{display:contents;margin:0;padding:0;list-style:none}',
    '[data-o-pill-nav] [data-o-pill-link]{',
    'position:relative;z-index:1;display:inline-flex;align-items:center;gap:0.5em;',
    'border:0;background:none;cursor:pointer;border-radius:999px;',
    'font:inherit;color:inherit;text-decoration:none;white-space:nowrap;',
    'padding:0.5rem 1rem;opacity:0.7;',
    'transition:opacity var(--o-duration-slow) linear;',
    '}',
    '[data-o-pill-nav] [data-o-pill-link]:hover,',
    '[data-o-pill-nav] [data-o-pill-link]:focus-visible{opacity:1}',
    '[data-o-pill-nav] [data-o-pill-link]:focus-visible{outline:2px solid currentColor;outline-offset:-2px}',
    '[data-o-pill-nav] [data-o-pill-link][aria-current]{opacity:1;color:var(--o-palette-brand-500)}',
    '[data-o-pill-nav-pill]{',
    'position:absolute;inset-block:4px;left:0;z-index:0;width:0;',
    'border-radius:999px;',
    'background:color-mix(in oklab,currentColor 10%,transparent);',
    'transition:transform var(--o-duration-slow) cubic-bezier(0.2,0,0,1),',
    'width var(--o-duration-slow) cubic-bezier(0.2,0,0,1);',
    '}',
    '@media (prefers-reduced-motion:reduce){[data-o-pill-nav-pill]{transition:none}}',
  ].join('')
  document.head.append(style)
}

/**
 * Barre de navigation dont la pilule suit le lien vise.
 *
 * @example
 * <PillNav
 *   items={[
 *     { label: 'Accueil', href: '/' },
 *     { label: 'Travaux', href: '/travaux' },
 *     { label: 'Contact', href: '/contact' },
 *   ]}
 *   defaultActive={0}
 * />
 *
 * @example
 * // Mode controle : la page decide.
 * <PillNav items={liens} active={page} onActiveChange={setPage} label="Principale" />
 */
export function PillNav({
  items,
  active,
  defaultActive = 0,
  onActiveChange,
  label = 'Navigation',
  ...rest
}: PillNavProps): ReactElement {
  const hostRef = useRef<HTMLElement | null>(null)
  const pillRef = useRef<HTMLSpanElement | null>(null)
  const [internal, setInternal] = useState(defaultActive)
  ensurePillNavRules()

  const current = Math.min(Math.max(active ?? internal, 0), Math.max(items.length - 1, 0))

  const choose = (index: number): void => {
    if (active === undefined) setInternal(index)
    onActiveChange?.(index)
  }

  const links = (): HTMLElement[] =>
    Array.from(hostRef.current?.querySelectorAll<HTMLElement>('[data-o-pill-link]') ?? [])

  /** Pose la pilule sous un lien. Sans lien, elle se replie a largeur nulle. */
  const place = (target: HTMLElement | undefined): void => {
    const pill = pillRef.current
    if (pill === null) return
    if (target === undefined) {
      pill.style.width = '0px'
      return
    }
    pill.style.width = `${String(target.offsetWidth)}px`
    pill.style.transform = `translateX(${String(target.offsetLeft)}px)`
  }

  /** Retour sous la page courante. */
  const settle = (): void => place(links()[current])

  // La pilule se pose sous la page courante au montage et a chaque changement,
  // et se remesure si la barre change de taille : une police qui arrive tard
  // deplace tous les liens.
  useEffect(() => {
    settle()
    const host = hostRef.current
    if (host === null || typeof ResizeObserver === 'undefined') return
    const observer = new ResizeObserver(settle)
    observer.observe(host)
    return () => observer.disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current, items])

  const onKeyDown = (event: KeyboardEvent<HTMLElement>): void => {
    const all = links()
    const focused = all.findIndex((link) => link === document.activeElement)
    if (focused < 0) return
    const last = all.length - 1
    const moves: Readonly<Record<string, number | undefined>> = {
      ArrowRight: focused >= last ? 0 : focused + 1,
      ArrowLeft: focused <= 0 ? last : focused - 1,
      Home: 0,
      End: last,
    }
    const target = moves[event.key]
    if (target === undefined) return
    event.preventDefault()
    all[target]?.focus()
  }

  const linkUnder = (target: EventTarget): HTMLElement | null =>
    target instanceof HTMLElement ? target.closest<HTMLElement>('[data-o-pill-link]') : null

  const { className, style } = mergePresentation({}, rest)

  return (
    <nav
      {...rest}
      ref={hostRef}
      aria-label={label}
      data-o-pill-nav=""
      className={className}
      style={style as CSSProperties}
      onKeyDown={onKeyDown}
      onPointerOver={(event) => {
        const link = linkUnder(event.target)
        if (link !== null) place(link)
        rest.onPointerOver?.(event)
      }}
      onPointerLeave={(event) => {
        settle()
        rest.onPointerLeave?.(event)
      }}
      onFocus={(event) => {
        const link = linkUnder(event.target)
        if (link !== null) place(link)
        rest.onFocus?.(event)
      }}
      onBlur={(event) => {
        const next = event.relatedTarget
        if (!(next instanceof Node) || !hostRef.current?.contains(next)) settle()
        rest.onBlur?.(event)
      }}
    >
      <span ref={pillRef} aria-hidden="true" data-o-pill-nav-pill="" />
      <ul>
        {items.map((item, index) => {
          const isCurrent = index === current
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
                  data-o-pill-link=""
                  aria-current={isCurrent ? 'page' : undefined}
                  onClick={() => choose(index)}
                >
                  {content}
                </a>
              ) : (
                <button
                  type="button"
                  data-o-pill-link=""
                  aria-current={isCurrent ? 'page' : undefined}
                  onClick={() => choose(index)}
                >
                  {content}
                </button>
              )}
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

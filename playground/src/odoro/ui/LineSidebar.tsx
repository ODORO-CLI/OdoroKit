/**
 * Barre laterale en traits : une colonne de traits qui s'allongent a
 * l'approche du pointeur et decouvrent leur libelle. Le trait de la page
 * courante reste long, en teinte de marque.
 *
 * ## Ce qui la distingue de la barre a loupe
 *
 * La loupe grossit un element entier, vers le haut, dans une barre
 * horizontale. Ici rien ne grossit : un trait s'allonge, sur l'axe qui
 * s'eloigne du bord de l'ecran, et le libelle apparait a son bout. La
 * colonne ne bouge pas d'un pixel — un trait plus long n'a pas de largeur
 * de boite, puisqu'il est une echelle sur sa longueur. C'est la barre d'une
 * page longue : posee sur un bord, muette au repos, lisible des qu'on s'en
 * approche.
 *
 * ## La distance est lue sur un pointeur amorti
 *
 * Le pointeur vient du crochet amorti, dans une ref, lu dans la boucle du
 * moteur. Les traits suivent donc la main avec un leger retard, et se
 * couchent en glissant plutot qu'en sautant. Le profil est une cosinusoide
 * relevee, comme celui de la loupe, et pour la meme raison : plate aux
 * bords, elle ne fait sursauter aucun trait quand le pointeur entre dans son
 * rayon.
 *
 * ## Deux chemins pour la meme forme
 *
 * Hors de la barre, ou sans pointeur fin, ou sous mouvement reduit, les
 * traits ne sont pas ecrits par la boucle : le survol et le focus les
 * allongent par une transition CSS. Le libelle, lui, apparait toujours par
 * la feuille, sur survol, focus et page courante. L'etat final est le meme,
 * seul le trajet change.
 *
 * @module
 */

import {
  CLOCK_PRIORITY,
  clock,
  mergePresentation,
  useMotionState,
  type Customisable,
} from '@odoro-cli/engine'
import {
  useCallback,
  useEffect,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type ReactElement,
  type ReactNode,
} from 'react'

import { usePointerDamped } from '@/odoro/hooks/usePointerDamped'

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
export interface LineSidebarOwnProps {
  /** Les liens, de haut en bas. */
  items: readonly NavItem[]
  /** Bord de l'ecran ou la barre est posee : les traits partent de ce bord. @defaultValue 'left' */
  side?: 'left' | 'right'
  /** Allongement maximal d'un trait, atteint sous le pointeur. @defaultValue 2.4 */
  extend?: number
  /** Rayon d'influence du pointeur, en pixels. @defaultValue 90 */
  reach?: number
  /** Vitesse a laquelle les traits suivent le pointeur. Plus haut, plus sec. @defaultValue 10 */
  speed?: number
  /** Index de la page courante. */
  active?: number
  /** Appele quand l'utilisateur choisit un lien. */
  onActiveChange?: (index: number) => void
  /** Nom du bloc pour les lecteurs d'ecran. @defaultValue 'Navigation' */
  label?: string
}

/** Toutes les proprietes. */
export type LineSidebarProps = Customisable<LineSidebarOwnProps, 'nav'>

/** Identifiant de la feuille injectee. */
const STYLE_ID = 'o-line-sidebar'

/** Pose la colonne, les traits et les libelles, une fois par document. */
function ensureLineRules(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-lines]{display:inline-flex;flex-direction:column;gap:0.25rem;padding:0.5rem 0}',
    '[data-o-lines] ul{display:contents;margin:0;padding:0;list-style:none}',
    '[data-o-lines-item]{',
    'display:flex;align-items:center;gap:0.75rem;',
    'padding:0.4rem 0.75rem;background:none;border:0;',
    'color:inherit;text-decoration:none;font:inherit;cursor:pointer;',
    '}',
    '[data-o-lines][data-o-lines-right] [data-o-lines-item]{flex-direction:row-reverse}',
    '[data-o-lines-item]:focus-visible{outline:2px solid currentColor;outline-offset:2px;border-radius:2px}',
    // Le trait : une echelle sur sa longueur, depuis le bord. La transition
    // ne sert qu'au survol et au repos ; sous le pointeur, c'est la boucle.
    '[data-o-lines-bar]{',
    'display:block;width:1.25rem;height:2px;flex:none;border-radius:1px;',
    'background:currentColor;opacity:0.5;',
    'transform-origin:left center;',
    'transition:transform var(--o-duration-base) cubic-bezier(0.2,0,0,1),opacity var(--o-duration-base) linear;',
    '}',
    '[data-o-lines][data-o-lines-right] [data-o-lines-bar]{transform-origin:right center}',
    '[data-o-lines][data-o-lines-live] [data-o-lines-bar]{transition:opacity var(--o-duration-base) linear}',
    '[data-o-lines-item]:hover [data-o-lines-bar],[data-o-lines-item]:focus-visible [data-o-lines-bar]{',
    'transform:scaleX(var(--o-lines-extend));opacity:1;',
    '}',
    '[data-o-lines-item][aria-current] [data-o-lines-bar]{',
    'background:var(--o-palette-brand-500);opacity:1;',
    'transform:scaleX(var(--o-lines-extend));',
    '}',
    '[data-o-lines-label]{',
    'display:inline-flex;align-items:center;gap:0.4em;',
    'font-size:0.8rem;font-weight:500;letter-spacing:0.04em;text-transform:uppercase;white-space:nowrap;',
    'opacity:0;transform:translateX(-6px);',
    'transition:opacity var(--o-duration-base) linear,transform var(--o-duration-base) cubic-bezier(0.2,0,0,1);',
    '}',
    '[data-o-lines][data-o-lines-right] [data-o-lines-label]{transform:translateX(6px)}',
    '[data-o-lines-item]:hover [data-o-lines-label],',
    '[data-o-lines-item]:focus-visible [data-o-lines-label],',
    '[data-o-lines-item][aria-current] [data-o-lines-label],',
    '[data-o-lines-item][data-o-lines-near] [data-o-lines-label]{opacity:1;transform:none}',
    '[data-o-lines-item][aria-current] [data-o-lines-label]{color:var(--o-palette-brand-500)}',
    // Le filet du bord : la barre est posee contre lui.
    '[data-o-lines]{border-left:1px solid var(--o-theme-line)}',
    '[data-o-lines][data-o-lines-right]{border-left:0;border-right:1px solid var(--o-theme-line)}',
    '@media (prefers-reduced-motion:reduce){[data-o-lines-bar],[data-o-lines-label]{transition:none}}',
  ].join('')
  document.head.append(style)
}

/**
 * Colonne de traits qui s'allongent a l'approche du pointeur.
 *
 * @example
 * <LineSidebar
 *   items={[
 *     { label: 'Intro', href: '#intro' },
 *     { label: 'Methode', href: '#methode' },
 *     { label: 'Resultats', href: '#resultats' },
 *     { label: 'Suite', href: '#suite' },
 *   ]}
 *   active={1}
 * />
 *
 * @example
 * // Posee a droite, traits plus longs, rayon plus large.
 * <LineSidebar items={sections} side="right" extend={3} reach={140} />
 */
export function LineSidebar({
  items,
  side = 'left',
  extend = 2.4,
  reach = 90,
  speed = 10,
  active,
  onActiveChange,
  label = 'Navigation',
  ...rest
}: LineSidebarProps): ReactElement {
  const { reduced } = useMotionState()
  const [host, setHost] = useState<HTMLElement | null>(null)
  const pointer = usePointerDamped({ host, speed, name: 'traits : pointeur' })
  ensureLineRules()

  // Memoisee sur `host` : la fonction ne lit rien d'autre, et sans cela elle
  // serait recreee a chaque rendu. L'effet qui l'emploie se reabonnerait alors
  // a l'horloge et reposerait ses ecouteurs a chaque image — le contraire de ce
  // qu'un tableau de dependances est cense empecher.
  const links = useCallback(
    (): HTMLElement[] =>
      Array.from(host?.querySelectorAll<HTMLElement>('[data-o-lines-item]') ?? []),
    [host],
  )

  useEffect(() => {
    if (host === null || reduced) return
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return

    let inside = false

    const rest_ = (): void => {
      host.removeAttribute('data-o-lines-live')
      for (const link of links()) {
        link.removeAttribute('data-o-lines-near')
        const bar = link.querySelector<HTMLElement>('[data-o-lines-bar]')
        if (bar !== null) bar.style.transform = ''
      }
    }

    const onEnter = (): void => {
      inside = true
      host.setAttribute('data-o-lines-live', '')
    }
    const onLeave = (): void => {
      inside = false
      // Le repos est ecrit une fois ; la transition CSS ramene les traits.
      rest_()
    }

    const subscription = clock.subscribe(
      () => {
        if (!inside) return
        const box = host.getBoundingClientRect()
        const y = box.top + ((pointer.current.y + 1) / 2) * box.height

        for (const link of links()) {
          const bar = link.querySelector<HTMLElement>('[data-o-lines-bar]')
          if (bar === null) continue
          const own = link.getBoundingClientRect()
          const centre = own.top + own.height / 2
          const t = Math.min(1, Math.abs(y - centre) / reach)
          // Cosinusoide relevee : plate aux bords, arrondie au sommet.
          const bump = (Math.cos(t * Math.PI) + 1) / 2
          const k = 1 + (extend - 1) * bump
          bar.style.transform = `scaleX(${k.toFixed(3)})`
          if (bump > 0.55) link.setAttribute('data-o-lines-near', '')
          else link.removeAttribute('data-o-lines-near')
        }
      },
      { priority: CLOCK_PRIORITY.render, name: 'traits' },
    )

    host.addEventListener('pointerenter', onEnter, { passive: true })
    host.addEventListener('pointerleave', onLeave, { passive: true })

    return () => {
      host.removeEventListener('pointerenter', onEnter)
      host.removeEventListener('pointerleave', onLeave)
      subscription.unsubscribe()
      rest_()
    }
  }, [host, reduced, pointer, extend, reach, links])

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

  return (
    <nav
      {...rest}
      ref={setHost}
      aria-label={label}
      data-o-lines=""
      {...(side === 'right' ? { 'data-o-lines-right': '' } : {})}
      className={className}
      style={{ ...style, '--o-lines-extend': String(extend) } as CSSProperties}
      onKeyDown={(event) => {
        onKeyDown(event)
        rest.onKeyDown?.(event)
      }}
    >
      <ul>
        {items.map((item, index) => {
          const isCurrent = index === active
          const content = (
            <>
              <span aria-hidden="true" data-o-lines-bar="" />
              <span data-o-lines-label="">
                {item.icon !== undefined && <span aria-hidden="true">{item.icon}</span>}
                {item.label}
              </span>
            </>
          )
          return (
            <li key={`${item.label}-${String(index)}`}>
              {item.href !== undefined ? (
                <a
                  href={item.href}
                  data-o-lines-item=""
                  aria-current={isCurrent ? 'page' : undefined}
                  onClick={() => onActiveChange?.(index)}
                >
                  {content}
                </a>
              ) : (
                <button
                  type="button"
                  data-o-lines-item=""
                  aria-current={isCurrent ? 'page' : undefined}
                  onClick={() => onActiveChange?.(index)}
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

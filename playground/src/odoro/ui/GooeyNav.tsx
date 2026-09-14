/**
 * Navigation gluante : la pastille se detache en gouttes quand elle change
 * de lien, et un filtre SVG soude pastille et gouttes en une seule matiere.
 *
 * ## Le gluant est un seuil sur un flou
 *
 * Deux formes floues qui se rapprochent voient leurs bords se fondre ; un
 * seuil pose sur l'alpha rend a ce melange un contour net. C'est tout le
 * filtre : `feGaussianBlur` puis `feColorMatrix` qui multiplie l'alpha et le
 * decale, si bien que tout ce qui est en dessous d'un certain flou disparait
 * et tout ce qui est au-dessus devient plein. Deux gouttes qui se separent
 * tirent un pont entre elles avant de rompre — c'est ce pont qui fait la
 * matiere.
 *
 * ## Le filtre ne touche que le calque de la pastille
 *
 * Passer le texte par le meme filtre l'epaissirait et le rendrait illisible.
 * La pastille et ses gouttes vivent donc sur un calque a part, sous les
 * liens ; le calque est filtre, les liens ne le sont pas.
 *
 * ## Les gouttes sont posees dans le DOM et retirees a leur fin
 *
 * Elles ne passent pas par l'etat React : une douzaine d'elements qui
 * naissent et meurent en une seconde n'ont pas a faire rendre la barre.
 * Chacune recoit une animation d'images cles, et se retire elle-meme quand
 * celle-ci se termine.
 *
 * ## Sous mouvement reduit
 *
 * La pastille saute a sa place, sans goutte. L'etat final est le meme : un
 * lien marque, les autres non.
 *
 * @module
 */

import { mergePresentation, useMotionState, type Customisable } from '@odoro-cli/engine'
import {
  useId,
  useLayoutEffect,
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
export interface GooeyNavOwnProps {
  /** Les liens, dans l'ordre d'affichage. */
  items: readonly NavItem[]
  /** Index de la page courante, en mode controle. */
  active?: number
  /** Page courante au montage, en mode non controle. @defaultValue 0 */
  defaultActive?: number
  /** Appele quand l'utilisateur choisit un lien. */
  onActiveChange?: (index: number) => void
  /**
   * Tokens de couleur. Le premier remplit la pastille, tous colorent les
   * gouttes.
   *
   * @defaultValue marque, fuchsia, ciel
   */
  colors?: readonly string[]
  /** Nombre de gouttes projetees a chaque changement. @defaultValue 10 */
  drops?: number
  /** Portee des gouttes, en pixels. @defaultValue 48 */
  distance?: number
  /** Nom du bloc pour les lecteurs d'ecran. @defaultValue 'Navigation' */
  label?: string
}

/** Toutes les proprietes. */
export type GooeyNavProps = Customisable<GooeyNavOwnProps, 'nav'>

/** Couleurs par defaut : la marque pour la pastille, deux teintes en plus pour les gouttes. */
const DEFAULT_COLORS: readonly string[] = [
  '--o-palette-brand-500',
  '--o-palette-fuchsia-500',
  '--o-palette-sky-500',
]

/** Identifiant de la feuille injectee. */
const STYLE_ID = 'o-gooey-nav'

/** Pose la barre, le calque filtre et la pastille, une fois par document. */
function ensureGooeyRules(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-goo]{',
    'position:relative;display:inline-flex;align-items:center;gap:2px;',
    'padding:4px;border-radius:999px;border:1px solid var(--o-theme-line);',
    '}',
    '[data-o-goo] ul{display:contents;margin:0;padding:0;list-style:none}',
    '[data-o-goo] [data-o-goo-link]{',
    'position:relative;z-index:1;display:inline-flex;align-items:center;gap:0.5em;',
    'border:0;background:none;cursor:pointer;border-radius:999px;',
    'font:inherit;color:inherit;text-decoration:none;white-space:nowrap;',
    'padding:0.5rem 1rem;opacity:0.7;',
    'transition:color var(--o-duration-slow) linear,opacity var(--o-duration-slow) linear;',
    '}',
    '[data-o-goo] [data-o-goo-link]:hover,[data-o-goo] [data-o-goo-link]:focus-visible{opacity:1}',
    '[data-o-goo] [data-o-goo-link]:focus-visible{outline:2px solid currentColor;outline-offset:-2px}',
    '[data-o-goo] [data-o-goo-link][aria-current]{opacity:1;color:var(--o-goo-ink)}',
    // Le calque filtre : la pastille et ses gouttes, rien d'autre.
    '[data-o-goo-layer]{',
    'position:absolute;inset:0;z-index:0;pointer-events:none;overflow:visible;',
    'filter:var(--o-goo-filter);',
    '}',
    '[data-o-goo-pill]{',
    'position:absolute;inset-block:4px;left:0;width:0;',
    'border-radius:999px;background:var(--o-goo-fill);',
    'transition:transform calc(var(--o-duration-slow) * 1.6) cubic-bezier(0.2,0,0,1),',
    'width calc(var(--o-duration-slow) * 1.6) cubic-bezier(0.2,0,0,1);',
    '}',
    '[data-o-goo-drop]{position:absolute;border-radius:999px;top:50%;left:0}',
    '@media (prefers-reduced-motion:reduce){[data-o-goo-pill]{transition:none}}',
  ].join('')
  document.head.append(style)
}

/**
 * Barre de navigation dont la pastille se detache en gouttes.
 *
 * @example
 * <GooeyNav
 *   items={[
 *     { label: 'Studio', href: '/studio' },
 *     { label: 'Projets', href: '/projets' },
 *     { label: 'Journal', href: '/journal' },
 *   ]}
 * />
 *
 * @example
 * // Plus de gouttes, plus loin, d'autres teintes.
 * <GooeyNav items={liens} drops={16} distance={80} colors={['--o-palette-emerald-500', '--o-palette-sky-500']} />
 */
export function GooeyNav({
  items,
  active,
  defaultActive = 0,
  onActiveChange,
  colors = DEFAULT_COLORS,
  drops = 10,
  distance = 48,
  label = 'Navigation',
  ...rest
}: GooeyNavProps): ReactElement {
  const { reduced } = useMotionState()
  const filterId = useId()
  const hostRef = useRef<HTMLElement | null>(null)
  const layerRef = useRef<HTMLSpanElement | null>(null)
  const pillRef = useRef<HTMLSpanElement | null>(null)
  const settled = useRef(false)
  const [internal, setInternal] = useState(defaultActive)
  ensureGooeyRules()

  const current = Math.min(Math.max(active ?? internal, 0), Math.max(items.length - 1, 0))
  const fill = `var(${colors[0] ?? DEFAULT_COLORS[0] ?? ''})`

  const choose = (index: number): void => {
    if (active === undefined) setInternal(index)
    onActiveChange?.(index)
  }

  const links = (): HTMLElement[] =>
    Array.from(hostRef.current?.querySelectorAll<HTMLElement>('[data-o-goo-link]') ?? [])

  /** Projette des gouttes depuis le centre d'un lien. */
  const splash = (target: HTMLElement): void => {
    const layer = layerRef.current
    if (layer === null || drops <= 0) return

    const centreX = target.offsetLeft + target.offsetWidth / 2
    const count = Math.min(drops, 24)

    for (let index = 0; index < count; index += 1) {
      const drop = document.createElement('span')
      drop.setAttribute('data-o-goo-drop', '')
      const size = 6 + Math.random() * 10
      const angle = Math.random() * Math.PI * 2
      const reach = distance * (0.5 + Math.random() * 0.5)
      const token = colors[index % Math.max(colors.length, 1)] ?? DEFAULT_COLORS[0] ?? ''
      drop.style.width = `${size.toFixed(1)}px`
      drop.style.height = `${size.toFixed(1)}px`
      drop.style.background = `var(${token})`
      drop.style.marginTop = `${(-size / 2).toFixed(1)}px`
      drop.style.marginLeft = `${(centreX - size / 2).toFixed(1)}px`
      layer.append(drop)

      const dx = Math.cos(angle) * reach
      const dy = Math.sin(angle) * reach * 0.6
      const animation = drop.animate(
        [
          { transform: 'translate(0,0) scale(1)', opacity: 1 },
          {
            transform: `translate(${dx.toFixed(1)}px,${dy.toFixed(1)}px) scale(0)`,
            opacity: 1,
          },
        ],
        {
          duration: 500 + Math.random() * 400,
          easing: 'cubic-bezier(0.2, 0, 0, 1)',
          fill: 'forwards',
        },
      )
      animation.onfinish = () => drop.remove()
    }
  }

  /** Pose la pastille sous le lien courant, et projette les gouttes au changement. */
  const place = (burst: boolean): void => {
    const pill = pillRef.current
    const target = links()[current]
    if (pill === null || target === undefined) return
    pill.style.width = `${String(target.offsetWidth)}px`
    pill.style.transform = `translateX(${String(target.offsetLeft)}px)`
    if (burst && !reduced) splash(target)
  }

  // Au montage la pastille se pose sans eclat : il n'y a pas eu de geste. Aux
  // changements suivants, elle eclabousse. Une barre qui change de taille
  // remesure sans eclabousser non plus.
  useLayoutEffect(() => {
    place(settled.current)
    settled.current = true
    const host = hostRef.current
    if (host === null || typeof ResizeObserver === 'undefined') return
    const observer = new ResizeObserver(() => place(false))
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

  const { className, style } = mergePresentation({}, rest)

  return (
    <nav
      {...rest}
      ref={hostRef}
      aria-label={label}
      data-o-goo=""
      className={className}
      style={
        {
          ...style,
          '--o-goo-fill': fill,
          '--o-goo-ink': 'var(--o-palette-zinc-50)',
          '--o-goo-filter': reduced ? 'none' : `url(#${filterId})`,
        } as CSSProperties
      }
      onKeyDown={onKeyDown}
    >
      <svg aria-hidden="true" width="0" height="0" style={{ position: 'absolute' }}>
        <defs>
          <filter id={filterId} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="flou" />
            <feColorMatrix
              in="flou"
              type="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -9"
              result="goo"
            />
            <feComposite in="SourceGraphic" in2="goo" operator="atop" />
          </filter>
        </defs>
      </svg>
      <span ref={layerRef} aria-hidden="true" data-o-goo-layer="">
        <span ref={pillRef} data-o-goo-pill="" />
      </span>
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
                  data-o-goo-link=""
                  aria-current={isCurrent ? 'page' : undefined}
                  onClick={() => choose(index)}
                >
                  {content}
                </a>
              ) : (
                <button
                  type="button"
                  data-o-goo-link=""
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

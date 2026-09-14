/**
 * Menu infini : les liens sont poses sur une roue qui tourne a la molette et
 * au glisser, sans fin, et se cale toujours sur un cran.
 *
 * ## Une roue, pas une liste qui boucle
 *
 * Chaque lien occupe un angle fixe sur un cylindre couche, `rotateX` puis
 * `translateZ`, et la roue entiere a une seule rotation. Tourner d'un tour
 * complet ramene exactement le premier lien : l'infini n'est pas simule par
 * des copies, il est la geometrie. Ce qui est derriere la roue est cache par
 * son opacite — le cosinus de son angle — et retire des cibles de clic.
 *
 * ## La roue a une masse, et un cran
 *
 * Trois etats se succedent. Pendant le glisser, la rotation suit la main.
 * Au lacher, elle garde la vitesse mesuree sur les derniers mouvements et la
 * perd par frottement. Une fois lente, elle vise le cran le plus proche et
 * le rejoint par amortissement exponentiel — la meme formule que le pointeur
 * amorti, pour la meme raison : un mouvement identique quelle que soit la
 * cadence d'affichage. La molette, elle, ne pousse pas la roue : elle
 * deplace le cran vise, d'un lien par tranche de defilement. C'est ce qui
 * la rend precise a la molette et vivante a la main.
 *
 * ## Rien n'est ecrit quand rien ne bouge
 *
 * La boucle du moteur lit l'angle et ecrit une transformation par lien ; des
 * que la roue est calee, elle cesse d'ecrire. React ne rend qu'au montage et
 * au changement de props.
 *
 * ## Le lien de devant est le seul dans l'ordre de tabulation
 *
 * Tab entre sur le lien de devant ; les fleches tournent la roue et suivent
 * le focus ; Home et End vont aux extremites ; Entree suit le lien. Un lien
 * de derriere qui recoit le focus — par Maj+Tab par exemple — fait tourner
 * la roue jusqu'a lui.
 *
 * ## Sous mouvement reduit
 *
 * Pas d'elan, pas de lissage : la roue saute de cran en cran. Tourner reste
 * possible, parce que tourner est le seul moyen d'atteindre les liens.
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
export interface InfiniteMenuOwnProps {
  /** Les liens, dans l'ordre de la roue. Trois au moins pour que la roue ait un sens. */
  items: readonly NavItem[]
  /** Rayon de la roue, en pixels. @defaultValue 140 */
  radius?: number
  /** Vitesse a laquelle la roue rejoint son cran. Plus haut, plus sec. @defaultValue 8 */
  speed?: number
  /** Index de la page courante. */
  active?: number
  /** Appele quand l'utilisateur choisit un lien. */
  onActiveChange?: (index: number) => void
  /** Nom du bloc pour les lecteurs d'ecran. @defaultValue 'Navigation' */
  label?: string
}

/** Toutes les proprietes. */
export type InfiniteMenuProps = Customisable<InfiniteMenuOwnProps, 'nav'>

/** Identifiant de la feuille injectee. */
const STYLE_ID = 'o-infinite-menu'

/** Pose la scene, la roue et ses liens, une fois par document. */
function ensureWheelRules(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-wheel]{',
    'position:relative;display:block;min-height:14rem;overflow:hidden;',
    'perspective:900px;touch-action:none;cursor:grab;user-select:none;',
    '}',
    '[data-o-wheel][data-o-wheel-drag]{cursor:grabbing}',
    // Deux filets qui marquent le cran de devant : c'est la que la roue se
    // cale, et le seul endroit ou un lien est entierement lisible.
    '[data-o-wheel]::before,[data-o-wheel]::after{',
    'content:"";position:absolute;left:50%;width:min(60%,18rem);height:1px;',
    'background:var(--o-theme-line);transform:translateX(-50%);pointer-events:none;',
    '}',
    '[data-o-wheel]::before{top:calc(50% - var(--o-wheel-slot))}',
    '[data-o-wheel]::after{top:calc(50% + var(--o-wheel-slot))}',
    '[data-o-wheel] ul{',
    'position:absolute;top:50%;left:50%;width:0;height:0;margin:0;padding:0;list-style:none;',
    'transform-style:preserve-3d;',
    '}',
    '[data-o-wheel] li{position:absolute;top:0;left:0;transform-style:preserve-3d}',
    '[data-o-wheel-item]{',
    'position:absolute;top:0;left:0;',
    'display:inline-flex;align-items:center;gap:0.5em;white-space:nowrap;',
    'font-size:1.5rem;font-weight:600;letter-spacing:-0.01em;',
    'color:inherit;text-decoration:none;background:none;border:0;padding:0.25em 0.5em;font-family:inherit;cursor:pointer;',
    'backface-visibility:hidden;',
    '}',
    '[data-o-wheel-item]:focus-visible{outline:2px solid currentColor;outline-offset:2px}',
    '[data-o-wheel-item][aria-current]{color:var(--o-palette-brand-500)}',
  ].join('')
  document.head.append(style)
}

/** Ramene un angle dans ]-180, 180]. */
function wrap(angle: number): number {
  let value = angle % 360
  if (value > 180) value -= 360
  if (value <= -180) value += 360
  return value
}

/**
 * Roue de liens infinie, a la molette et au glisser.
 *
 * @example
 * <InfiniteMenu
 *   className="o-h-72"
 *   items={[
 *     { label: 'Expositions', href: '/expositions' },
 *     { label: 'Collections', href: '/collections' },
 *     { label: 'Visites', href: '/visites' },
 *     { label: 'Boutique', href: '/boutique' },
 *   ]}
 * />
 *
 * @example
 * // Une roue plus large, qui se cale plus sec.
 * <InfiniteMenu items={liens} radius={220} speed={14} />
 */
export function InfiniteMenu({
  items,
  radius = 140,
  speed = 8,
  active,
  onActiveChange,
  label = 'Navigation',
  ...rest
}: InfiniteMenuProps): ReactElement {
  const { reduced } = useMotionState()
  const [host, setHost] = useState<HTMLElement | null>(null)
  const angle = useRef(0)
  const target = useRef(0)
  const velocity = useRef(0)
  const dragging = useRef(false)
  const moved = useRef(false)
  const front = useRef(0)
  ensureWheelRules()

  const count = Math.max(items.length, 1)
  const step = 360 / count

  const links = (): HTMLElement[] =>
    Array.from(host?.querySelectorAll<HTMLElement>('[data-o-wheel-item]') ?? [])

  /** Vise le cran d'un lien, par le chemin le plus court. */
  const aim = (index: number): void => {
    const wanted = index * step
    const delta = wrap(wanted - (target.current % 360))
    target.current += delta
    velocity.current = 0
  }

  useEffect(() => {
    if (host === null) return

    let last = Number.NaN
    let accumulated = 0
    // React vient peut-etre de reposer les tabindex : le cran de devant est a
    // re-marquer, quel qu'il soit.
    front.current = -1
    let dragStartY = 0
    let dragStartAngle = 0
    let lastY = 0
    let lastTime = 0
    const pxPerStep = Math.max(40, 2 * radius * Math.sin((step * Math.PI) / 360))

    /** Ecrit une transformation par lien, et marque celui de devant. */
    const paint = (): void => {
      const elements = links()
      let nearest = 0
      let best = Number.POSITIVE_INFINITY
      elements.forEach((element, index) => {
        const phi = wrap(angle.current - index * step)
        const depth = Math.cos((phi * Math.PI) / 180)
        const distance = Math.abs(phi)
        if (distance < best) {
          best = distance
          nearest = index
        }
        element.style.transform = `translate(-50%,-50%) rotateX(${phi.toFixed(3)}deg) translateZ(${String(radius)}px)`
        element.style.opacity = Math.max(0, depth).toFixed(3)
        element.style.visibility = depth > 0.05 ? 'visible' : 'hidden'
        element.style.pointerEvents = depth > 0.5 ? 'auto' : 'none'
      })
      if (nearest !== front.current) {
        front.current = nearest
        elements.forEach((element, index) => {
          element.tabIndex = index === nearest ? 0 : -1
        })
      }
    }

    const subscription = clock.subscribe(
      ({ delta }) => {
        if (!dragging.current) {
          if (Math.abs(velocity.current) > 2) {
            // Elan : la roue garde sa vitesse et la perd par frottement.
            angle.current += velocity.current * delta
            velocity.current *= Math.exp(-3 * delta)
            target.current = Math.round(angle.current / step) * step
          } else if (reduced) {
            velocity.current = 0
            angle.current = target.current
          } else {
            velocity.current = 0
            const factor = 1 - Math.exp(-speed * delta)
            angle.current += (target.current - angle.current) * factor
          }
        }
        if (Math.abs(angle.current - last) < 0.005) return
        last = angle.current
        paint()
      },
      { priority: CLOCK_PRIORITY.render, name: 'menu infini' },
    )

    // La molette deplace le cran vise, jamais la roue elle-meme. Elle est
    // ecoutee sans passivite : sans cela, la page defilerait sous la roue a
    // chaque cran.
    const onWheel = (event: WheelEvent): void => {
      event.preventDefault()
      accumulated += event.deltaY
      if (Math.abs(accumulated) < 40) return
      target.current += Math.sign(accumulated) * step
      velocity.current = 0
      accumulated = 0
    }

    const onDown = (event: PointerEvent): void => {
      if (event.button !== 0) return
      dragging.current = true
      moved.current = false
      dragStartY = event.clientY
      lastY = event.clientY
      lastTime = event.timeStamp
      dragStartAngle = angle.current
      velocity.current = 0
      host.setAttribute('data-o-wheel-drag', '')
      host.setPointerCapture(event.pointerId)
    }

    const onMove = (event: PointerEvent): void => {
      if (!dragging.current) return
      const dy = event.clientY - dragStartY
      if (Math.abs(dy) > 4) moved.current = true
      angle.current = dragStartAngle - (dy / pxPerStep) * step
      const dt = Math.max(event.timeStamp - lastTime, 1) / 1000
      // Vitesse en degres par seconde, lissee sur les derniers mouvements.
      const instant = ((-(event.clientY - lastY) / pxPerStep) * step) / dt
      velocity.current = velocity.current * 0.6 + instant * 0.4
      lastY = event.clientY
      lastTime = event.timeStamp
    }

    const onUp = (event: PointerEvent): void => {
      if (!dragging.current) return
      dragging.current = false
      host.removeAttribute('data-o-wheel-drag')
      if (host.hasPointerCapture(event.pointerId))
        host.releasePointerCapture(event.pointerId)
      // Un lacher sans elan, ou sous mouvement reduit : cran le plus proche.
      if (reduced || Math.abs(velocity.current) < 60) {
        velocity.current = 0
        target.current = Math.round(angle.current / step) * step
      }
    }

    host.addEventListener('wheel', onWheel, { passive: false })
    host.addEventListener('pointerdown', onDown, { passive: true })
    host.addEventListener('pointermove', onMove, { passive: true })
    host.addEventListener('pointerup', onUp, { passive: true })
    host.addEventListener('pointercancel', onUp, { passive: true })
    paint()

    return () => {
      host.removeEventListener('wheel', onWheel)
      host.removeEventListener('pointerdown', onDown)
      host.removeEventListener('pointermove', onMove)
      host.removeEventListener('pointerup', onUp)
      host.removeEventListener('pointercancel', onUp)
      subscription.unsubscribe()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [host, radius, speed, step, reduced, items])

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
    const next = moves[event.key]
    if (next === undefined) return
    event.preventDefault()
    aim(next)
    all[next]?.focus({ preventScroll: true })
  }

  const { className, style } = mergePresentation({}, rest)
  const slot = `${String(Math.round(radius * Math.sin((step * Math.PI) / 360)))}px`

  return (
    <nav
      {...rest}
      ref={setHost}
      aria-label={label}
      data-o-wheel=""
      className={className}
      style={{ ...style, '--o-wheel-slot': slot } as CSSProperties}
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
              {item.icon !== undefined && <span aria-hidden="true">{item.icon}</span>}
              {item.label}
            </>
          )
          // Un clic qui suit un glisser n'est pas un choix ; un clic sur un
          // lien de cote amene ce lien devant, sans le suivre.
          const onClick = (event: { preventDefault: () => void }): void => {
            if (moved.current) {
              moved.current = false
              event.preventDefault()
              return
            }
            if (index !== front.current) {
              event.preventDefault()
              aim(index)
              return
            }
            onActiveChange?.(index)
          }
          const onFocus = (): void => {
            if (index !== front.current) aim(index)
          }
          return (
            <li key={`${item.label}-${String(index)}`}>
              {item.href !== undefined ? (
                <a
                  href={item.href}
                  data-o-wheel-item=""
                  aria-current={isCurrent ? 'page' : undefined}
                  tabIndex={index === 0 ? 0 : -1}
                  onClick={onClick}
                  onFocus={onFocus}
                >
                  {content}
                </a>
              ) : (
                <button
                  type="button"
                  data-o-wheel-item=""
                  aria-current={isCurrent ? 'page' : undefined}
                  tabIndex={index === 0 ? 0 : -1}
                  onClick={onClick}
                  onFocus={onFocus}
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

/**
 * Grille chromatique : des cartes teintees, rendues en gris, dont le pointeur
 * revele les couleurs dans un cercle amorti.
 *
 * ## Le gris est un voile, pas un etat des cartes
 *
 * Chaque carte a sa teinte, posee une fois, et ne change jamais. C'est un
 * voile au-dessus de la grille qui desature ce qu'il couvre — un filtre
 * d'arriere-plan — et un masque radial y perce un trou autour du pointeur.
 * Deplacer le trou ne touche aucune carte : deux variables sur le voile, et
 * toute la grille repond. Retirer le voile rend la grille en couleurs, ce
 * qui est exactement l'etat voulu la ou il n'y a pas de pointeur.
 *
 * ## Le trou s'ouvre et se ferme, il n'apparait pas
 *
 * Un masque ne se transitionne pas proprement. Le rayon du trou est donc
 * amorti comme la position, dans la meme boucle : a l'entree il grandit
 * depuis zero, a la sortie il se referme sur place. Le voile ne clignote
 * jamais.
 *
 * ## Les teintes se distribuent
 *
 * Les couleurs sont une liste de tokens, attribues aux cartes dans l'ordre et
 * en boucle. Quatre teintes suffisent a une grille de douze ; en donner une
 * par carte reste possible.
 *
 * ## Ce qui reste au doigt et sous mouvement reduit
 *
 * La grille en couleurs, sans voile. L'etat final, pas le gris.
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
  Children,
  useEffect,
  useState,
  type CSSProperties,
  type ReactElement,
  type ReactNode,
} from 'react'

import { usePointerDamped } from '@registre/hooks/usePointerDamped'

/** Teintes par defaut, distribuees en boucle. */
const DEFAULT_TOKENS: readonly string[] = [
  '--o-palette-brand-500',
  '--o-palette-fuchsia-500',
  '--o-palette-sky-500',
  '--o-palette-emerald-500',
]

/** Proprietes propres au composant. */
export interface ChromaGridOwnProps {
  /** Les cartes. */
  children: ReactNode
  /** Nombre de colonnes. @defaultValue 3 */
  columns?: number
  /** Tokens des teintes, attribues aux cartes dans l'ordre et en boucle. */
  colors?: readonly string[]
  /** Rayon du cercle revele, en pixels. @defaultValue 220 */
  radius?: number
  /** Vitesse a laquelle le cercle suit le pointeur. @defaultValue 6 */
  speed?: number
}

/** Toutes les proprietes. */
export type ChromaGridProps = Customisable<ChromaGridOwnProps>

/** Identifiant de la feuille injectee. */
const STYLE_ID = 'o-chroma-grid'

/** Pose la grille, les cartes et le voile, une fois par document. */
function ensureChromaRules(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-chroma]{',
    'position:relative;display:grid;',
    'grid-template-columns:repeat(var(--o-chroma-columns),minmax(0,1fr));',
    'gap:var(--o-chroma-gap);',
    '}',
    '[data-o-chroma-item]{',
    'position:relative;overflow:hidden;border-radius:var(--o-chroma-radius);',
    'background:var(--o-theme-surface);',
    'border:1px solid color-mix(in oklab,var(--o-chroma-tint) 40%,var(--o-theme-line));',
    '}',
    // La teinte : un degrade du coin superieur, sous le contenu.
    '[data-o-chroma-item]::before{',
    'content:"";position:absolute;inset:0;pointer-events:none;',
    'background:linear-gradient(160deg,',
    'color-mix(in oklab,var(--o-chroma-tint) 55%,transparent),',
    'color-mix(in oklab,var(--o-chroma-tint) 12%,transparent) 45%,',
    'transparent 75%);',
    '}',
    '[data-o-chroma-item]>*{position:relative}',
    // Le voile : desature ce qu'il couvre, perce autour du pointeur.
    '[data-o-chroma-veil]{',
    'position:absolute;inset:0;pointer-events:none;',
    '-webkit-backdrop-filter:grayscale(1);backdrop-filter:grayscale(1);',
    '-webkit-mask:radial-gradient(var(--o-chroma-r) circle at var(--o-chroma-x) var(--o-chroma-y),',
    'transparent 35%,currentColor 100%);',
    'mask:radial-gradient(var(--o-chroma-r) circle at var(--o-chroma-x) var(--o-chroma-y),',
    'transparent 35%,currentColor 100%);',
    '}',
  ].join('')
  document.head.append(style)
}

/**
 * Une grille de cartes teintees, revelees par le pointeur.
 *
 * @example
 * <ChromaGrid columns={3} className="o-gap-4">
 *   <article className="o-p-5">Une</article>
 *   <article className="o-p-5">Deux</article>
 *   <article className="o-p-5">Trois</article>
 * </ChromaGrid>
 *
 * @example
 * // Deux teintes seulement, cercle plus large.
 * <ChromaGrid colors={['--o-palette-amber-500', '--o-palette-rose-500']} radius={320}>
 *   {cartes}
 * </ChromaGrid>
 */
export function ChromaGrid({
  children,
  columns = 3,
  colors = DEFAULT_TOKENS,
  radius = 220,
  speed = 6,
  ...rest
}: ChromaGridProps): ReactElement {
  const { reduced } = useMotionState()
  const [host, setHost] = useState<HTMLElement | null>(null)
  const [veiled, setVeiled] = useState(false)
  const pointer = usePointerDamped({ host, speed, name: 'chroma : pointeur' })
  ensureChromaRules()

  useEffect(() => {
    if (host === null || reduced) return
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return

    // Le voile n'est pose qu'une fois sur d'avoir un pointeur fin : avant, la
    // grille est en couleurs, et elle le reste partout ailleurs.
    setVeiled(true)

    let on = false
    let hole = 0
    let lastX = -1
    let lastY = -1
    let lastHole = -1

    const onEnter = (): void => {
      on = true
    }
    const onLeave = (): void => {
      on = false
    }

    const subscription = clock.subscribe(
      ({ delta }) => {
        const x = ((pointer.current.x + 1) / 2) * 100
        const y = ((pointer.current.y + 1) / 2) * 100
        // Le rayon suit la meme loi que la position : voir l'en-tete.
        hole += ((on ? radius : 0) - hole) * (1 - Math.exp(-speed * delta))

        if (
          Math.abs(x - lastX) < 0.02 &&
          Math.abs(y - lastY) < 0.02 &&
          Math.abs(hole - lastHole) < 0.1
        ) {
          return
        }
        lastX = x
        lastY = y
        lastHole = hole
        host.style.setProperty('--o-chroma-x', `${x.toFixed(2)}%`)
        host.style.setProperty('--o-chroma-y', `${y.toFixed(2)}%`)
        host.style.setProperty('--o-chroma-r', `${hole.toFixed(1)}px`)
      },
      { priority: CLOCK_PRIORITY.render, name: 'chroma' },
    )

    host.addEventListener('pointerenter', onEnter, { passive: true })
    host.addEventListener('pointerleave', onLeave, { passive: true })

    return () => {
      host.removeEventListener('pointerenter', onEnter)
      host.removeEventListener('pointerleave', onLeave)
      subscription.unsubscribe()
      setVeiled(false)
    }
  }, [host, reduced, radius, speed, pointer])

  const { className, style } = mergePresentation({}, rest)
  const cards = Children.toArray(children)
  const tints = colors.length === 0 ? DEFAULT_TOKENS : colors

  return (
    <div
      {...rest}
      ref={setHost}
      className={className}
      style={
        {
          '--o-chroma-columns': String(Math.max(1, Math.round(columns))),
          '--o-chroma-gap': '1rem',
          '--o-chroma-radius': '0.75rem',
          '--o-chroma-x': '50%',
          '--o-chroma-y': '50%',
          '--o-chroma-r': '0px',
          ...style,
        } as CSSProperties
      }
      data-o-chroma=""
    >
      {cards.map((card, index) => (
        <div
          key={index}
          data-o-chroma-item=""
          style={
            {
              '--o-chroma-tint': `var(${tints[index % tints.length] ?? DEFAULT_TOKENS[0] ?? ''})`,
            } as CSSProperties
          }
        >
          {card}
        </div>
      ))}
      {veiled ? <div data-o-chroma-veil="" aria-hidden="true" /> : null}
    </div>
  )
}

/**
 * Transition en damier entre deux contenus.
 *
 * ## Recouvrir, echanger, decouvrir
 *
 * Faire passer un contenu a un autre par un masque de cases obligerait a
 * decouper le second en autant de morceaux — impossible des qu'il s'agit de
 * texte, de boutons ou d'une carte entiere.
 *
 * Le damier est donc **opaque** et joue en trois temps : il couvre le premier
 * contenu, l'echange a lieu derriere lui, puis il se retire. Ce sont deux
 * rendus React par passage, et rien entre les deux : les retards de chaque
 * case sont dans la feuille de style, pas dans une boucle.
 *
 * ## Pourquoi un damier et pas un balayage
 *
 * Les cases s'allument par diagonales, mais en deux passes : d'abord une case
 * sur deux, puis les autres. Le recouvrement se fait ainsi en deux vagues qui
 * s'entrelacent, ce qui evite le front rectiligne d'un simple balayage — on
 * reconnait un ecran qui se pixelise, pas un rideau qui se ferme.
 *
 * ## Les deux contenus restent dans le document
 *
 * Le contenu au repos occupe le flux et donne sa taille a la zone ; l'autre
 * est superpose. Celui qui n'est pas montre est cache par `visibility`, ce qui
 * le retire de l'ordre de tabulation et de la restitution vocale sans lui
 * prendre sa place — un contenu absent ferait sauter la mise en page a chaque
 * passage.
 *
 * Sous mouvement reduit, l'echange est immediat : c'est l'etat final, sans les
 * cases.
 *
 * @module
 */

import { mergePresentation, useMotionState, type Customisable } from '@odoro-cli/engine'
import {
  useEffect,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type ReactElement,
  type ReactNode,
} from 'react'

import { useInView } from '@registre/hooks/useInView'

/** Ce qui declenche le passage au second contenu. */
export type PixelTrigger = 'hover' | 'click' | 'view'

/** Proprietes propres au composant. */
export interface PixelTransitionOwnProps {
  /** Contenu au repos. Il donne sa taille a la zone. */
  from: ReactNode
  /** Contenu montre apres le passage. */
  to: ReactNode
  /** Nombre de colonnes. Les lignes suivent les proportions. @defaultValue 12 */
  cells?: number
  /** Duree du recouvrement, en millisecondes. @defaultValue 520 */
  duration?: number
  /** Ce qui declenche le passage. @defaultValue 'hover' */
  trigger?: PixelTrigger
  /** Couleur des cases. @defaultValue l'encre du theme */
  color?: string
}

/** Toutes les proprietes. */
export type PixelTransitionProps = Customisable<PixelTransitionOwnProps>

/** Duree du fondu d'une seule case, en millisecondes. */
const CELL_FADE = 140

/**
 * Echange deux contenus derriere un damier.
 *
 * @example
 * <PixelTransition
 *   from={<img src="/pochette.jpg" alt="Pochette de l album" />}
 *   to={<img src="/verso.jpg" alt="Liste des titres" />}
 *   className="o-w-64 o-rounded-xl"
 * />
 *
 * @example
 * // Au clic, en gros pixels, dans la teinte de marque.
 * <PixelTransition
 *   trigger="click"
 *   cells={6}
 *   color="var(--o-palette-brand-500)"
 *   from={<p>Le tarif</p>}
 *   to={<p>39 EUR par mois</p>}
 * />
 */
export function PixelTransition({
  from,
  to,
  cells = 12,
  duration = 520,
  trigger = 'hover',
  color = 'var(--o-theme-fg)',
  ...rest
}: PixelTransitionProps): ReactElement {
  const { reduced } = useMotionState()
  const { ref, vu } = useInView<HTMLDivElement>({ immediat: trigger !== 'view' })

  const [ratio, setRatio] = useState(0.6)
  const [target, setTarget] = useState<'from' | 'to'>('from')
  const [shown, setShown] = useState<'from' | 'to'>('from')
  const [covered, setCovered] = useState(false)

  // L'entree dans le champ est un declenchement comme un autre : elle pose la
  // meme cible que le survol ou le clic.
  useEffect(() => {
    if (trigger === 'view' && vu) setTarget('to')
  }, [trigger, vu])

  // Les proportions de la zone donnent le nombre de lignes : sans cette
  // mesure, les cases seraient des rectangles etires sur une zone large, et le
  // damier ne se lirait plus comme un damier.
  useEffect(() => {
    const host = ref.current
    if (host === null) return

    const observer = new ResizeObserver(() => {
      const rect = host.getBoundingClientRect()
      if (rect.width > 0) setRatio(rect.height / rect.width)
    })
    observer.observe(host)
    return () => observer.disconnect()
  }, [ref])

  const cover = Math.max(duration, 0) + CELL_FADE

  useEffect(() => {
    if (target === shown) return

    // Sans mouvement, il n'y a rien a couvrir : l'etat final est pose tout de
    // suite.
    if (reduced) {
      setShown(target)
      return
    }

    setCovered(true)
    const timer = setTimeout(() => {
      // L'echange a lieu derriere le damier plein, puis les cases se retirent
      // dans l'ordre inverse.
      setShown(target)
      setCovered(false)
    }, cover)

    return () => clearTimeout(timer)
  }, [target, shown, reduced, cover])

  const columns = Math.max(2, Math.round(cells))
  const rows = Math.max(2, Math.round(columns * ratio))
  const total = columns * rows
  const steps = columns + rows

  const { className, style } = mergePresentation(
    { className: 'o-relative o-overflow-hidden' },
    rest,
  )

  const layer = (visible: boolean): CSSProperties => ({
    visibility: visible ? 'visible' : 'hidden',
  })

  const toggle = (): void => setTarget((value) => (value === 'from' ? 'to' : 'from'))

  // Un declenchement au clic doit repondre au clavier : sans cela, le second
  // contenu serait hors d'atteinte de qui n'a pas de souris.
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>): void => {
    if (event.key !== 'Enter' && event.key !== ' ') return
    event.preventDefault()
    toggle()
  }

  return (
    <div
      {...rest}
      ref={ref}
      className={className}
      style={style}
      role={trigger === 'click' ? 'button' : undefined}
      tabIndex={trigger === 'click' ? 0 : undefined}
      onPointerEnter={trigger === 'hover' ? () => setTarget('to') : undefined}
      onPointerLeave={trigger === 'hover' ? () => setTarget('from') : undefined}
      onClick={trigger === 'click' ? toggle : undefined}
      onKeyDown={trigger === 'click' ? onKeyDown : undefined}
    >
      <div style={layer(shown === 'from')}>{from}</div>
      <div className="o-absolute o-inset-0" style={layer(shown === 'to')}>
        {to}
      </div>

      {reduced ? null : (
        <div
          aria-hidden
          className="o-absolute o-inset-0 o-grid o-pointer-events-none"
          style={{
            gridTemplateColumns: `repeat(${String(columns)}, 1fr)`,
            gridTemplateRows: `repeat(${String(rows)}, 1fr)`,
          }}
        >
          {Array.from({ length: total }, (_, index) => {
            const column = index % columns
            const row = Math.floor(index / columns)
            // Une case sur deux d'abord, les autres ensuite, chaque passe en
            // diagonale : deux vagues entrelacees plutot qu'un front droit.
            const pass = (column + row) % 2
            const rank = (pass * steps + column + row) / (2 * steps)
            const delay = (covered ? rank : 1 - rank) * duration

            return (
              <span
                key={index}
                style={{
                  backgroundColor: color,
                  opacity: covered ? 1 : 0,
                  transition: `opacity ${String(CELL_FADE)}ms linear ${delay.toFixed(0)}ms`,
                }}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}

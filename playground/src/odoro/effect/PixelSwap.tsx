/**
 * Echange de cellules entre deux images.
 *
 * ## Un echange, pas une transition
 *
 * La transition en pixels va d'un contenu a l'autre et s'arrete quand elle est
 * arrivee. Ici, rien n'arrive : une part reglee de la grille montre en
 * permanence la seconde image, et ce ne sont jamais les memes cellules. Le
 * resultat est un scintillement de mosaique, pas un passage — deux photos qui
 * se disputent le meme cadre.
 *
 * C'est pour cela que l'image de base est un vrai `img` du document : elle
 * reste le contenu, avec son texte de remplacement, et les cellules ne sont
 * qu'un ornement pose dessus.
 *
 * ## Le decoupage doit tomber juste
 *
 * Chaque cellule peint la seconde image en fond, decalee de sa propre position.
 * Le calcul du recouvrement — l'echelle et le centrage que ferait
 * `object-fit: cover` — est refait a la main, parce qu'un fond ne connait que
 * sa propre boite : sans cela, chaque cellule recadrerait l'image entiere dans
 * son carre, et la mosaique montrerait deux cents miniatures au lieu d'un
 * morceau d'image.
 *
 * ## Aucun rendu React pendant les echanges
 *
 * La boucle du moteur allume et eteint des cellules a la cadence reglee, en
 * ecrivant leur opacite. Le composant ne se rend qu'a trois occasions : au
 * montage, quand la seconde image a livre ses dimensions, et quand la zone
 * change de taille.
 *
 * Sous mouvement reduit, la grille n'est pas montee : reste l'image de base,
 * seule et nette.
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
import { useEffect, useRef, useState, type ReactElement } from 'react'

/** Proprietes propres au composant. */
export interface PixelSwapOwnProps {
  /** Image de base, celle qui reste dans le flux. */
  from: string
  /** Image dont les cellules viennent s'echanger. */
  to: string
  /** Texte de remplacement de l'image de base. */
  alt: string
  /** Nombre de colonnes. Les lignes suivent les proportions. @defaultValue 14 */
  cells?: number
  /** Echanges par seconde. @defaultValue 12 */
  rate?: number
  /** Part maximale de cellules montrant la seconde image. @defaultValue 0.16 */
  mix?: number
  /** Duree du fondu d'une cellule, en millisecondes. @defaultValue 240 */
  fade?: number
}

/** Toutes les proprietes. */
export type PixelSwapProps = Customisable<PixelSwapOwnProps>

/** Taille d'une boite, en pixels. */
interface Size {
  readonly width: number
  readonly height: number
}

/**
 * Recouvrement d'une image dans une boite, a la maniere de `object-fit: cover`.
 *
 * @param box Boite a couvrir.
 * @param natural Dimensions naturelles de l'image.
 */
function coverFit(
  box: Size,
  natural: Size,
): { width: number; height: number; left: number; top: number } {
  const scale = Math.max(box.width / natural.width, box.height / natural.height)
  const width = natural.width * scale
  const height = natural.height * scale
  return { width, height, left: (box.width - width) / 2, top: (box.height - height) / 2 }
}

/**
 * Fait echanger des cellules entre deux images.
 *
 * @example
 * <PixelSwap
 *   from="/avant.jpg"
 *   to="/apres.jpg"
 *   alt="La place, avant les travaux"
 *   className="o-aspect-video o-w-full o-rounded-xl"
 * />
 *
 * @example
 * // Une mosaique grossiere et lente, largement melangee.
 * <PixelSwap from="/a.jpg" to="/b.jpg" alt="La place" cells={8} rate={4} mix={0.45} />
 */
export function PixelSwap({
  from,
  to,
  alt,
  cells = 14,
  rate = 12,
  mix = 0.16,
  fade = 240,
  ...rest
}: PixelSwapProps): ReactElement {
  const { reduced } = useMotionState()
  const [host, setHost] = useState<HTMLDivElement | null>(null)
  const [box, setBox] = useState<Size | null>(null)
  const [natural, setNatural] = useState<Size | null>(null)
  const grid = useRef<HTMLDivElement | null>(null)

  // La taille de la zone commande le decoupage : elle est mesuree, pas devinee.
  useEffect(() => {
    if (host === null) return

    const observer = new ResizeObserver(() => {
      const rect = host.getBoundingClientRect()
      setBox({ width: Math.max(1, rect.width), height: Math.max(1, rect.height) })
    })
    observer.observe(host)
    return () => observer.disconnect()
  }, [host])

  // La seconde image n'est jamais affichee en entier ; ses dimensions
  // naturelles sont pourtant necessaires au recouvrement, d'ou ce chargement.
  useEffect(() => {
    setNatural(null)
    if (typeof Image === 'undefined') return

    const probe = new Image()
    let alive = true
    probe.addEventListener('load', () => {
      if (alive) setNatural({ width: probe.naturalWidth, height: probe.naturalHeight })
    })
    probe.src = to

    return () => {
      alive = false
    }
  }, [to])

  const columns = Math.max(2, Math.round(cells))
  const rows =
    box === null ? 0 : Math.max(2, Math.round((columns * box.height) / box.width))
  const total = columns * rows

  useEffect(() => {
    const container = grid.current
    if (container === null || reduced || total === 0) return

    const ceiling = Math.max(1, Math.floor(total * Math.min(Math.max(mix, 0), 1)))
    const period = 1 / Math.max(rate, 0.1)
    const queue: number[] = []
    const on = new Set<number>()
    let elapsed = 0

    const paint = (index: number, visible: boolean): void => {
      const cell = container.children[index]
      if (cell instanceof HTMLElement) cell.style.opacity = visible ? '1' : '0'
    }

    const subscription = clock.subscribe(
      ({ delta }) => {
        elapsed += delta
        if (elapsed < period) return
        elapsed = 0

        // Plafond atteint : la plus ancienne cellule rend sa place. La file
        // garde l'ordre d'arrivee, l'ensemble garde l'appartenance.
        if (queue.length >= ceiling) {
          const oldest = queue.shift()
          if (oldest !== undefined) {
            on.delete(oldest)
            paint(oldest, false)
          }
        }

        // Un tirage au sort, quelques essais au plus : parcourir la grille
        // pour trouver a coup sur une cellule libre couterait tout un balayage,
        // pour un echange qui n'a aucune raison d'etre exact.
        for (let attempt = 0; attempt < 8; attempt += 1) {
          const index = Math.floor(Math.random() * total)
          if (on.has(index)) continue
          on.add(index)
          queue.push(index)
          paint(index, true)
          return
        }
      },
      { priority: CLOCK_PRIORITY.default, name: 'echange de cellules' },
    )

    return () => {
      subscription.unsubscribe()
      for (const index of on) paint(index, false)
    }
  }, [reduced, total, mix, rate])

  const fit = box !== null && natural !== null ? coverFit(box, natural) : null

  const { className, style } = mergePresentation(
    { className: 'o-relative o-overflow-hidden' },
    rest,
  )

  return (
    <div {...rest} ref={setHost} className={className} style={style}>
      <img src={from} alt={alt} className="o-size-full o-object-cover" />

      {reduced || fit === null || box === null ? null : (
        <div
          aria-hidden
          ref={grid}
          className="o-absolute o-inset-0 o-grid o-pointer-events-none"
          style={{
            gridTemplateColumns: `repeat(${String(columns)}, 1fr)`,
            gridTemplateRows: `repeat(${String(rows)}, 1fr)`,
          }}
        >
          {Array.from({ length: total }, (_, index) => {
            const left = ((index % columns) * box.width) / columns
            const top = (Math.floor(index / columns) * box.height) / rows
            return (
              <span
                key={index}
                style={{
                  opacity: 0,
                  transition: `opacity ${String(fade)}ms linear`,
                  backgroundImage: `url(${to})`,
                  backgroundSize: `${fit.width.toFixed(1)}px ${fit.height.toFixed(1)}px`,
                  backgroundPosition: `${(fit.left - left).toFixed(1)}px ${(fit.top - top).toFixed(1)}px`,
                }}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}

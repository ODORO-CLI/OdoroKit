/**
 * Carte pixel : au survol, le bord se couvre de carres qui gagnent vers
 * l'interieur, puis se retirent quand le pointeur s'en va.
 *
 * ## Un canevas, pas une grille d'elements
 *
 * Une carte de taille ordinaire compte plusieurs centaines de cellules dans
 * sa bande de bord. Autant d'elements du document, chacun avec sa transition,
 * feraient de la carte la piece la plus lourde de la page. Un canevas les
 * dessine toutes en un seul passage, et ne coute rien tant que rien ne bouge.
 *
 * ## Chaque cellule a son seuil
 *
 * L'avancement va de zero a un a la vitesse reglee. Une cellule s'allume
 * quand l'avancement depasse son seuil, qui vient de sa distance au bord —
 * les plus proches d'abord — plus une part de hasard tiree une fois. Sans le
 * hasard, le bord avancerait comme un front rectiligne ; sans la distance, il
 * scintillerait sans direction. Le melange donne une pixelisation qui ronge.
 *
 * ## La couleur vient du document
 *
 * Un canevas ne lit pas les variables CSS. La couleur est donc posee sur
 * l'element canevas lui-meme, comme couleur de texte, puis relue calculee :
 * un token de palette devient une valeur que le canevas comprend, et suit le
 * theme si le token en depend.
 *
 * ## Ce qui reste au doigt et sous mouvement reduit
 *
 * Rien : le bord est un ornement du survol, sans etat final a preserver. La
 * carte garde sa surface et son filet, le canevas reste vide.
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
  type ReactElement,
  type ReactNode,
} from 'react'

/** Proprietes propres au composant. */
export interface PixelCardOwnProps {
  /** Contenu de la carte. */
  children: ReactNode
  /** Cote d'une cellule, en pixels. @defaultValue 8 */
  size?: number
  /** Profondeur de la bande pixelisee depuis le bord, en pixels. @defaultValue 56 */
  depth?: number
  /** Duree pour couvrir toute la bande, en millisecondes. @defaultValue 600 */
  duration?: number
  /** Couleur des cellules. @defaultValue teinte de marque */
  color?: string
}

/** Toutes les proprietes. */
export type PixelCardProps = Customisable<PixelCardOwnProps>

/** Identifiant de la feuille injectee. */
const STYLE_ID = 'o-pixel-card'

/** Une cellule de la bande : position et seuil d'apparition. */
interface Cell {
  readonly x: number
  readonly y: number
  readonly threshold: number
}

/** Pose la surface et le canevas, une fois par document. */
function ensurePixelRules(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-pixel]{',
    'position:relative;isolation:isolate;',
    'background:var(--o-theme-surface);',
    'border:1px solid var(--o-theme-line);',
    '}',
    // Le canevas prend l'arrondi de la carte : le navigateur decoupe ce qui
    // deborde, les coins restent nets.
    '[data-o-pixel-canvas]{',
    'position:absolute;inset:0;z-index:-1;pointer-events:none;',
    'width:100%;height:100%;border-radius:inherit;',
    '}',
  ].join('')
  document.head.append(style)
}

/**
 * Calcule les cellules de la bande de bord pour une taille donnee.
 *
 * Seules les cellules a moins de `depth` du bord existent : le centre de la
 * carte n'est jamais parcouru.
 */
function buildCells(width: number, height: number, size: number, depth: number): Cell[] {
  const cells: Cell[] = []
  const columns = Math.ceil(width / size)
  const rows = Math.ceil(height / size)

  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      const x = column * size
      const y = row * size
      const centreX = x + size / 2
      const centreY = y + size / 2
      const edge = Math.min(centreX, centreY, width - centreX, height - centreY)
      if (edge > depth) continue

      // Les cellules du bord partent en premier ; le hasard casse le front.
      const threshold = (edge / depth) * 0.7 + Math.random() * 0.3
      cells.push({ x, y, threshold })
    }
  }

  return cells
}

/**
 * Pixelise le bord d'une carte au survol.
 *
 * @example
 * <PixelCard className="o-rounded-xl o-p-6">
 *   <h3>Une carte</h3>
 * </PixelCard>
 *
 * @example
 * // Gros pixels, bande etroite, d'une autre teinte.
 * <PixelCard size={14} depth={36} color="var(--o-palette-emerald-500)">
 *   Contenu
 * </PixelCard>
 */
export function PixelCard({
  children,
  size = 8,
  depth = 56,
  duration = 600,
  color = 'var(--o-palette-brand-500)',
  ...rest
}: PixelCardProps): ReactElement {
  const { reduced } = useMotionState()
  const [host, setHost] = useState<HTMLElement | null>(null)
  const canvas = useRef<HTMLCanvasElement | null>(null)
  ensurePixelRules()

  useEffect(() => {
    const surface = canvas.current
    if (host === null || surface === null || reduced) return
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return

    const context = surface.getContext('2d')
    if (context === null) return

    let cells: Cell[] = []
    let width = 0
    let height = 0
    let progress = 0
    let target = 0
    let fill = ''

    const measure = (): void => {
      const box = host.getBoundingClientRect()
      const ratio = window.devicePixelRatio || 1
      width = Math.max(1, Math.round(box.width))
      height = Math.max(1, Math.round(box.height))
      surface.width = Math.round(width * ratio)
      surface.height = Math.round(height * ratio)
      context.setTransform(ratio, 0, 0, ratio, 0, 0)
      cells = buildCells(width, height, Math.max(2, size), Math.max(size, depth))
    }

    const draw = (): void => {
      context.clearRect(0, 0, width, height)
      if (progress <= 0) return
      context.fillStyle = fill
      for (const cell of cells) {
        const alpha = (progress - cell.threshold) / 0.12
        if (alpha <= 0) continue
        context.globalAlpha = Math.min(1, alpha)
        context.fillRect(cell.x, cell.y, size, size)
      }
      context.globalAlpha = 1
    }

    const subscription = clock.subscribe(
      ({ delta }) => {
        const step = delta * (1000 / Math.max(duration, 1))
        progress = target > progress ? Math.min(target, progress + step) : Math.max(target, progress - step)
        draw()
        // Arrive au repos, la boucle n'a plus rien a dessiner : elle se
        // suspend, et reprend au prochain survol.
        if (progress === target) subscription.setActive(false)
      },
      { priority: CLOCK_PRIORITY.render, name: 'carte pixel' },
    )
    subscription.setActive(false)

    const onEnter = (): void => {
      // La couleur est relue a chaque entree : le theme a pu changer.
      fill = window.getComputedStyle(surface).color
      target = 1
      subscription.setActive(true)
    }
    const onLeave = (): void => {
      target = 0
      subscription.setActive(true)
    }

    const observer = new ResizeObserver(() => {
      measure()
      draw()
    })
    observer.observe(host)
    measure()

    host.addEventListener('pointerenter', onEnter, { passive: true })
    host.addEventListener('pointerleave', onLeave, { passive: true })

    return () => {
      host.removeEventListener('pointerenter', onEnter)
      host.removeEventListener('pointerleave', onLeave)
      observer.disconnect()
      subscription.unsubscribe()
      context.clearRect(0, 0, width, height)
    }
  }, [host, reduced, size, depth, duration])

  const { className, style } = mergePresentation({}, rest)

  return (
    <div {...rest} ref={setHost} className={className} style={style} data-o-pixel="">
      <canvas
        ref={canvas}
        data-o-pixel-canvas=""
        aria-hidden="true"
        style={{ color } as CSSProperties}
      />
      {children}
    </div>
  )
}

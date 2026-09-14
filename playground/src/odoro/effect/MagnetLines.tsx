/**
 * Lignes magnetiques : un champ d'aiguilles qui se tournent vers le pointeur.
 *
 * ## Une boussole par cellule
 *
 * Chaque aiguille connait sa position dans le cadre et calcule l'angle qui la
 * separe du pointeur. Rien de plus : pas de champ vectoriel, pas de bruit. Le
 * dessin d'ensemble — les cercles concentriques d'orientation autour de la
 * main — sort de la geometrie seule, et c'est ce qui le rend lisible.
 *
 * ## Pourquoi les centres sont calcules, jamais mesures
 *
 * Une grille CSS aurait demande de lire `offsetLeft` sur chaque cellule pour
 * savoir ou elle est. Ici les centres se deduisent de la taille du cadre et du
 * nombre de rangees : une division, aucune mise en page. Ils sont recalcules
 * quand le cadre change de taille, jamais entre deux images.
 *
 * ## L'angle est amorti, et par le plus court chemin
 *
 * Sans amortissement, les aiguilles claquent d'une orientation a l'autre. Avec
 * un amortissement naif, celles qui passent par le demi-tour font un tour
 * complet a l'envers — l'ecart brut entre 179 et -179 degres vaut 358. L'ecart
 * est donc ramene dans l'intervalle d'un demi-tour avant d'etre parcouru, ce
 * qui fait toujours prendre le plus court chemin.
 *
 * ## La portee
 *
 * Au-dela de `reach`, l'aiguille revient a son angle de repos. Sans cette
 * limite, tout le champ pointe vers la main et le motif s'aplatit : c'est le
 * contraste entre la zone reglee et la zone au repos qui donne le relief.
 *
 * ## Sous mouvement reduit
 *
 * Le champ est rendu, fige a son angle de repos : c'est bien un etat final, et
 * un motif de lignes vaut par lui-meme. C'est la seule entree de la famille qui
 * laisse quelque chose a voir, parce qu'elle est la seule dont le dessin ne
 * depend pas du mouvement.
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
import { useEffect, useState, type CSSProperties, type ReactElement } from 'react'

import { usePointerDamped } from '@/odoro/hooks/usePointerDamped'

/** Proprietes propres au composant. */
export interface MagnetLinesOwnProps {
  /** Nombre de rangees. @defaultValue 9 */
  rows?: number
  /** Nombre de colonnes. @defaultValue 9 */
  columns?: number
  /** Longueur d une aiguille, en pixels. @defaultValue 26 */
  length?: number
  /** Epaisseur d une aiguille, en pixels. @defaultValue 2 */
  thickness?: number
  /** Portee de l aimant, en pixels. @defaultValue 260 */
  reach?: number
  /** Vitesse de rotation des aiguilles. Plus haut, plus sec. @defaultValue 10 */
  speed?: number
  /** Angle de repos, en degres. @defaultValue 0 */
  idle?: number
  /** Couleur des aiguilles. Une valeur, pas un role. @defaultValue la couleur du texte */
  color?: string
}

/** Toutes les proprietes. */
export type MagnetLinesProps = Customisable<MagnetLinesOwnProps>

/** Identifiant de la feuille injectee. */
const STYLE_ID = 'o-magnet-lines'

/** Au-dela, le champ ne se lit plus et chaque image coute pour rien. */
const MAX_NEEDLES = 400

/** Pose les regles du champ, une fois par document. */
function ensureMagnetLinesRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-magnet-layer]{position:absolute;inset:0;overflow:hidden;pointer-events:none}',
    '[data-o-magnet-line]{position:absolute;left:0;top:0;border-radius:9999px;will-change:transform}',
  ].join('')
  document.head.append(style)
}

/**
 * Pose un champ d aiguilles orientees par le pointeur.
 *
 * Le composant occupe la boite qu on lui donne : c'est a l appelant de la
 * dimensionner, comme pour un fond.
 *
 * @example
 * <div className="o-relative o-h-96">
 *   <MagnetLines className="o-absolute o-inset-0" />
 * </div>
 *
 * @example
 * // Champ dense, aiguilles courtes, portee reduite.
 * <MagnetLines rows={16} columns={16} length={16} reach={160} />
 */
export function MagnetLines({
  rows = 9,
  columns = 9,
  length = 26,
  thickness = 2,
  reach = 260,
  speed = 10,
  idle: restAngle = 0,
  color = 'currentColor',
  ...rest
}: MagnetLinesProps): ReactElement {
  const { reduced } = useMotionState()
  const [host, setHost] = useState<HTMLElement | null>(null)

  ensureMagnetLinesRule()

  // Le pointeur est amorti par le crochet du registre, dans le repere du
  // cadre : le champ n'a besoin de rien d'autre.
  const pointer = usePointerDamped({ host, speed: 12, name: 'magnet-lines : pointeur' })

  useEffect(() => {
    if (host === null) return
    if (typeof window === 'undefined') return

    const lines = Math.max(2, Math.round(rows))
    const cols = Math.max(2, Math.round(columns))
    // Le produit est plafonne, pas chaque cote : une grille tres large et
    // basse reste legitime.
    const step = Math.max(1, Math.ceil((lines * cols) / MAX_NEEDLES))

    const layer = document.createElement('div')
    layer.setAttribute('data-o-magnet-layer', '')
    layer.setAttribute('aria-hidden', 'true')
    host.append(layer)

    const needles: { node: HTMLElement; u: number; v: number; angle: number }[] = []
    for (let row = 0; row < lines; row += step) {
      for (let col = 0; col < cols; col += 1) {
        const node = document.createElement('span')
        node.setAttribute('data-o-magnet-line', '')
        node.style.width = `${String(length)}px`
        node.style.height = `${String(thickness)}px`
        node.style.margin = `${String(-thickness / 2)}px 0 0 ${String(-length / 2)}px`
        node.style.background = color
        layer.append(node)
        needles.push({
          // Position relative dans le cadre : elle ne depend pas de sa taille,
          // et survit donc a un redimensionnement.
          u: (col + 0.5) / cols,
          v: (row + 0.5) / lines,
          node,
          angle: restAngle,
        })
      }
    }

    let width = host.clientWidth
    let height = host.clientHeight

    /** Ecrit toutes les aiguilles a leur angle courant. */
    const paint = (): void => {
      for (const needle of needles) {
        const x = needle.u * width
        const y = needle.v * height
        needle.node.style.transform = `translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,0) rotate(${needle.angle.toFixed(1)}deg)`
      }
    }

    // Un observateur plutot que l'evenement de fenetre : le cadre peut changer
    // de taille sans que la fenetre bouge — une colonne qui se replie suffit.
    const observer = new ResizeObserver(() => {
      width = host.clientWidth
      height = host.clientHeight
      paint()
    })
    observer.observe(host)
    paint()

    // Sous mouvement reduit, le champ reste a son angle de repos : rien ne
    // s'abonne a la boucle. Voir l'en-tete du module.
    if (reduced) {
      return () => {
        observer.disconnect()
        layer.remove()
      }
    }

    const subscription = clock.subscribe(
      ({ delta }) => {
        const factor = 1 - Math.exp(-speed * delta)
        // Du repere du crochet (centre, [-1, 1]) vers les pixels du cadre.
        const pointerX = ((pointer.current.x + 1) / 2) * width
        const pointerY = ((pointer.current.y + 1) / 2) * height

        for (const needle of needles) {
          const x = needle.u * width
          const y = needle.v * height
          const dx = pointerX - x
          const dy = pointerY - y
          const distance = Math.hypot(dx, dy)
          const pull = distance > reach ? 0 : 1 - distance / Math.max(reach, 1)
          const aimed = (Math.atan2(dy, dx) * 180) / Math.PI

          // Melange entre l'angle de repos et l'angle vise, par la portee.
          let wanted = restAngle + shortest(aimed - restAngle) * pull
          wanted = needle.angle + shortest(wanted - needle.angle)
          needle.angle += (wanted - needle.angle) * factor

          needle.node.style.transform = `translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,0) rotate(${needle.angle.toFixed(1)}deg)`
        }
      },
      { name: 'magnet-lines : champ', priority: CLOCK_PRIORITY.default },
    )

    return () => {
      observer.disconnect()
      subscription.unsubscribe()
      layer.remove()
    }
  }, [
    host,
    reduced,
    rows,
    columns,
    length,
    thickness,
    reach,
    speed,
    restAngle,
    color,
    pointer,
  ])

  const { className, style } = mergePresentation(
    { className: 'o-relative o-overflow-hidden' },
    rest,
  )

  return (
    <div
      {...rest}
      ref={setHost}
      className={className}
      style={style as CSSProperties}
      aria-hidden
    />
  )
}

/** Ramene un ecart d angle dans un demi-tour, pour toujours prendre le plus court. */
function shortest(delta: number): number {
  return ((((delta + 180) % 360) + 360) % 360) - 180
}

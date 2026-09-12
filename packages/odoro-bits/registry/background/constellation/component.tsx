/**
 * Constellation : des points relies par un segment quand ils sont proches ;
 * le pointeur les attire.
 *
 * ## Pourquoi des points et des lignes, et pas un shader
 *
 * Les segments sont le coeur de l'effet, et un segment relie deux
 * particules : un shader de fragment, qui ne connait que le pixel courant,
 * devrait retrouver pour chaque pixel toutes les paires susceptibles de
 * passer par la — un cout en n carre par pixel. Sur le processeur, le meme n
 * carre se paie une fois par image, pour une centaine de points, et produit
 * une liste de segments que le moteur trace en un appel : un tampon de
 * lignes preallouee pour toutes les paires possibles, dont seule la plage
 * vivante est dessinee. C'est la technique la plus simple qui tienne la
 * cadence.
 *
 * ## Le mouvement
 *
 * Chaque point suit un point d'ancrage qui erre lentement — deux sinus de
 * frequences non multiples — par un ressort amorti. Le pointeur ajoute une
 * traction qui decroit avec la distance : les points s'inclinent vers lui,
 * puis reviennent a leur ancre. Sans l'ancre, ils finiraient tous sous le
 * curseur.
 *
 * ## Les couleurs
 *
 * L'intensite d'un segment decroit avec sa longueur, par un melange vers la
 * couleur du fond — pas vers le noir, qui sur un theme clair rendrait les
 * segments faibles plus sombres que les forts.
 *
 * @module
 */

import {
  mergePresentation,
  readTokenColour,
  useMotionState,
  type Customisable,
  type ShaderColour,
} from '@odoro-cli/engine'
import { useScene, type SceneContext } from '@odoro-cli/engine/three'
import { useEffect, useRef, useState, type ReactElement } from 'react'

import { usePointerDamped } from '@registre/hooks/usePointerDamped'
import { usePoster } from '@registre/hooks/usePoster'

/** Proprietes propres au composant. */
export interface ConstellationOwnProps {
  /** Nombre de points. @defaultValue 110 */
  count?: number
  /** Distance en dessous de laquelle deux points sont relies. @defaultValue 0.9 */
  distance?: number
  /** Force de traction du pointeur. Zero la coupe. @defaultValue 1 */
  attract?: number
  /** Vitesse de l'errance. @defaultValue 0.6 */
  speed?: number
  /** Tokens : le fond, les points, les segments. */
  colors?: readonly [string, string, string]
  /** Classes du repli. */
  poster?: string
}

/** Toutes les proprietes. */
export type ConstellationProps = Customisable<ConstellationOwnProps>

/** Tokens employes par defaut. */
const DEFAULT_TOKENS = ['--o-theme-bg', '--o-theme-fg', '--o-palette-brand-500'] as const

/** Repli par defaut : une teinte figee, dans les memes tons. */
const DEFAULT_POSTER = 'o-bg-zinc-50 dark:o-bg-zinc-950'

/**
 * Nombre de points en qualite basse.
 *
 * Le cout est en n carre : le diviser par deux divise le travail par quatre.
 */
const LOW_COUNT = 55

/** Demi-hauteur visible a la distance de la camera, en unites de scene. */
const HALF_HEIGHT = Math.tan((45 / 2) * (Math.PI / 180)) * 5

/** Un point : sa position, sa vitesse, et l'ancre qu'il suit. */
interface Node {
  x: number
  y: number
  vx: number
  vy: number
  /** Centre de l'errance de l'ancre. */
  ax: number
  ay: number
  /** Phases des deux sinus de l'errance. */
  p1: number
  p2: number
}

type Three = SceneContext['three']
type Attribute = InstanceType<Three['BufferAttribute']>
type Geometry = InstanceType<Three['BufferGeometry']>
type PointsMaterial = InstanceType<Three['PointsMaterial']>

/** Ce que la boucle reecrit a chaque image. */
interface Buffers {
  readonly points: Attribute
  readonly lines: Attribute
  readonly tints: Attribute
  readonly lineGeometry: Geometry
}

/**
 * Constellation.
 *
 * @example
 * <div className="o-relative o-h-96 o-overflow-hidden">
 *   <Constellation className="o-absolute o-inset-0" />
 *   <div className="o-relative">…</div>
 * </div>
 */
export function Constellation({
  count = 110,
  distance = 0.9,
  attract = 1,
  speed = 0.6,
  colors = DEFAULT_TOKENS,
  poster = DEFAULT_POSTER,
  ...rest
}: ConstellationProps): ReactElement {
  const { theme } = useMotionState()
  const [host, setHost] = useState<HTMLElement | null>(null)

  const pointer = usePointerDamped({ host, speed: 3, name: 'constellation : pointeur' })

  const nodes = useRef<Node[]>([])
  const buffers = useRef<Buffers | null>(null)
  const material = useRef<PointsMaterial | null>(null)
  const context = useRef<SceneContext | null>(null)

  /** Couleurs lues, partagees avec la boucle : le fond et les segments. */
  const shades = useRef<{ bg: ShaderColour; line: ShaderColour }>({
    bg: [0, 0, 0],
    line: [0, 0, 0],
  })

  const { ref, ready, refused } = useScene({
    name: 'constellation',
    setup: (scene) => {
      context.current = scene
      const { three, renderer, quality } = scene

      const [bg, dot, line] = colors.map((token) => readTokenColour(token, host))
      if (bg !== undefined && line !== undefined) shades.current = { bg, line }

      const bgColour = new three.Color(bg?.[0] ?? 0, bg?.[1] ?? 0, bg?.[2] ?? 0)
      renderer.setClearColor(bgColour.convertSRGBToLinear(), 1)

      const total = quality === 'low' ? Math.min(count, LOW_COUNT) : count
      const halfWidth = HALF_HEIGHT * scene.camera.aspect

      nodes.current = Array.from({ length: total }, () => {
        const ax = (Math.random() * 2 - 1) * halfWidth * 0.95
        const ay = (Math.random() * 2 - 1) * HALF_HEIGHT * 0.95
        return {
          x: ax,
          y: ay,
          vx: 0,
          vy: 0,
          ax,
          ay,
          p1: Math.random() * Math.PI * 2,
          p2: Math.random() * Math.PI * 2,
        }
      })

      const points = new three.BufferAttribute(new Float32Array(total * 3), 3)
      points.setUsage(three.DynamicDrawUsage)
      const pointGeometry = new three.BufferGeometry()
      pointGeometry.setAttribute('position', points)

      const dots = new three.PointsMaterial({
        size: 0.06,
        transparent: true,
        opacity: 0.95,
        depthWrite: false,
      })
      dots.color.setRGB(dot?.[0] ?? 0, dot?.[1] ?? 0, dot?.[2] ?? 0)
      material.current = dots

      // Toutes les paires possibles, allouees une fois : deux sommets par
      // segment, une couleur par sommet. Seule la plage vivante est tracee.
      const pairs = (total * (total - 1)) / 2
      const lines = new three.BufferAttribute(new Float32Array(pairs * 6), 3)
      lines.setUsage(three.DynamicDrawUsage)
      const tints = new three.BufferAttribute(new Float32Array(pairs * 6), 3)
      tints.setUsage(three.DynamicDrawUsage)
      const lineGeometry = new three.BufferGeometry()
      lineGeometry.setAttribute('position', lines)
      lineGeometry.setAttribute('color', tints)
      lineGeometry.setDrawRange(0, 0)

      const strokes = new three.LineBasicMaterial({
        vertexColors: true,
        transparent: true,
        opacity: 0.85,
        depthWrite: false,
      })

      buffers.current = { points, lines, tints, lineGeometry }

      const group = new three.Group()
      group.name = 'constellation'
      group.add(new three.Points(pointGeometry, dots))
      group.add(new three.LineSegments(lineGeometry, strokes))
      scene.scene.add(group)

      return () => {
        scene.scene.remove(group)
        buffers.current = null
        material.current = null
      }
    },

    frame: ({ camera }, { time, delta }) => {
      const live = buffers.current
      if (live === null) return

      const dt = Math.min(delta, 0.05)
      const t = time * speed
      const halfWidth = HALF_HEIGHT * camera.aspect
      const px = pointer.current.x * halfWidth
      const py = -pointer.current.y * HALF_HEIGHT

      const field = nodes.current
      let index = 0
      for (const node of field) {
        // L'ancre erre : deux sinus par axe, de frequences non multiples.
        const tx = node.ax + 0.35 * Math.sin(t * 0.41 + node.p1) + 0.18 * Math.sin(t * 0.97 + node.p2)
        const ty = node.ay + 0.35 * Math.cos(t * 0.37 + node.p2) + 0.18 * Math.cos(t * 0.83 + node.p1)

        // Ressort amorti vers l'ancre.
        let ax = (tx - node.x) * 3 - node.vx * 2
        let ay = (ty - node.y) * 3 - node.vy * 2

        // La traction du pointeur, nulle au-dela de deux unites.
        if (attract > 0) {
          const dx = px - node.x
          const dy = py - node.y
          const d = Math.hypot(dx, dy)
          if (d > 0.0001 && d < 2) {
            const pull = (1 - d / 2) * attract * 5
            ax += (dx / d) * pull
            ay += (dy / d) * pull
          }
        }

        node.vx += ax * dt
        node.vy += ay * dt
        node.x += node.vx * dt
        node.y += node.vy * dt

        live.points.setXYZ(index, node.x, node.y, 0)
        index += 1
      }
      live.points.needsUpdate = true

      // Les segments : une paire par couple a portee, colore selon la
      // longueur par un melange vers le fond.
      const { bg, line } = shades.current
      const reach2 = distance * distance
      let vertex = 0
      for (let i = 0; i < field.length; i += 1) {
        const a = field[i]
        if (a === undefined) continue
        for (let j = i + 1; j < field.length; j += 1) {
          const b = field[j]
          if (b === undefined) continue
          const dx = b.x - a.x
          const dy = b.y - a.y
          const d2 = dx * dx + dy * dy
          if (d2 > reach2) continue

          const strength = 1 - Math.sqrt(d2) / distance
          const r = bg[0] + (line[0] - bg[0]) * strength
          const g = bg[1] + (line[1] - bg[1]) * strength
          const bl = bg[2] + (line[2] - bg[2]) * strength

          live.lines.setXYZ(vertex, a.x, a.y, 0)
          live.tints.setXYZ(vertex, r, g, bl)
          live.lines.setXYZ(vertex + 1, b.x, b.y, 0)
          live.tints.setXYZ(vertex + 1, r, g, bl)
          vertex += 2
        }
      }
      live.lineGeometry.setDrawRange(0, vertex)
      live.lines.needsUpdate = true
      live.tints.needsUpdate = true
    },
  })

  // Le theme a bascule : les tokens sont relus et les couleurs repeintes en
  // place. La scene n'est pas reconstruite.
  useEffect(() => {
    const scene = context.current
    const dots = material.current
    if (scene === null || dots === null) return
    const [bg, dot, line] = colors.map((token) => readTokenColour(token, host))
    if (dot !== undefined) dots.color.setRGB(dot[0], dot[1], dot[2])
    if (bg !== undefined && line !== undefined) {
      shades.current = { bg, line }
      scene.renderer.setClearColor(
        new scene.three.Color(bg[0], bg[1], bg[2]).convertSRGBToLinear(),
        1,
      )
    }
  }, [theme, colors, host])

  const pending = usePoster({ ready, refused })

  const { className, style } = mergePresentation(
    { className: 'o-relative o-overflow-hidden' },
    rest,
  )

  return (
    <div
      {...rest}
      ref={(node) => {
        setHost(node)
        ref.current = node
      }}
      className={className}
      style={style}
      aria-hidden
    >
      {pending.visible ? (
        <div style={pending.style} className={`o-absolute o-inset-0 ${poster}`} />
      ) : null}
    </div>
  )
}

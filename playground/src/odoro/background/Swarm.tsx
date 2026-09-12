/**
 * Nuee : des points qui volent en groupe selon les regles des boids, et
 * evitent le pointeur.
 *
 * ## Pourquoi des points instancies, et pas un shader
 *
 * Un shader de fragment resout chaque particule la ou elle est, sans memoire
 * d'une image a l'autre : une derive, une chute, une explosion se decrivent
 * ainsi, par une formule du temps. Une nuee, non. Chaque boid depend de ses
 * voisins a l'image precedente — separation, alignement, cohesion — et cette
 * dependance est un etat qu'il faut conserver et integrer. La simulation vit
 * donc sur le processeur, dans deux tableaux plats, et le rendu est un seul
 * appel de dessin : un nuage de points dont on reecrit l'attribut de position
 * a chaque image. Quelques centaines de boids en n carre restent tres en
 * dessous d'une milliseconde, et c'est la technique la plus simple qui tienne
 * la cadence.
 *
 * ## A quoi ce fond reagit
 *
 * Au pointeur, avec amortissement : les boids qui l'approchent sont repousses
 * et la nuee s'ouvre autour de lui, puis se referme quand il s'eloigne.
 *
 * ## Ce que ce composant ne fait pas
 *
 * Il n'ouvre ni boucle d'animation, ni observateur de taille ou de
 * visibilite : `useScene` les porte. Il n'ecrit aucune couleur : le fond et
 * les boids sont lus dans les tokens, et repeints en place quand le theme
 * bascule.
 *
 * @module
 */

import {
  mergePresentation,
  readTokenColour,
  useMotionState,
  type Customisable,
} from '@odoro-cli/engine'
import { useScene, type SceneContext } from '@odoro-cli/engine/three'
import { useEffect, useRef, useState, type ReactElement } from 'react'

import { usePointerDamped } from '@/odoro/hooks/usePointerDamped'
import { usePoster } from '@/odoro/hooks/usePoster'

/** Proprietes propres au composant. */
export interface SwarmOwnProps {
  /** Nombre de boids. @defaultValue 240 */
  count?: number
  /** Vitesse de vol. @defaultValue 1 */
  speed?: number
  /** Rayon d'evitement du pointeur, en unites de scene. @defaultValue 0.9 */
  avoid?: number
  /** Tokens : le fond, les boids. */
  colors?: readonly [string, string]
  /** Classes du repli. */
  poster?: string
}

/** Toutes les proprietes. */
export type SwarmProps = Customisable<SwarmOwnProps>

/** Tokens employes par defaut. */
const DEFAULT_TOKENS = ['--o-theme-bg', '--o-palette-brand-500'] as const

/** Repli par defaut : une teinte figee, dans les memes tons. */
const DEFAULT_POSTER = 'o-bg-zinc-50 dark:o-bg-zinc-950'

/**
 * Nombre de boids en qualite basse.
 *
 * Le cout est en n carre : c'est le seul levier qui compte, et le diviser
 * par deux divise le travail par quatre.
 */
const LOW_COUNT = 100

/**
 * Demi-hauteur visible a la distance de la camera, en unites de scene :
 * tangente de la moitie de l'ouverture fois la distance.
 */
const HALF_HEIGHT = Math.tan((45 / 2) * (Math.PI / 180)) * 5

/** Rayon de perception d'un boid. */
const SIGHT = 0.55

/** Un boid : position et vitesse, dans le plan de la camera. */
interface Boid {
  x: number
  y: number
  vx: number
  vy: number
}

type Three = SceneContext['three']
type Attribute = InstanceType<Three['BufferAttribute']>
type PointsMaterial = InstanceType<Three['PointsMaterial']>

/**
 * Nuee.
 *
 * @example
 * <div className="o-relative o-h-96 o-overflow-hidden">
 *   <Swarm className="o-absolute o-inset-0" />
 *   <div className="o-relative">…</div>
 * </div>
 */
export function Swarm({
  count = 240,
  speed = 1,
  avoid = 0.9,
  colors = DEFAULT_TOKENS,
  poster = DEFAULT_POSTER,
  ...rest
}: SwarmProps): ReactElement {
  const { theme } = useMotionState()
  const [host, setHost] = useState<HTMLElement | null>(null)

  const pointer = usePointerDamped({ host, speed: 5, name: 'nuee : pointeur' })

  /** Ce que la boucle lit : la simulation, l'attribut a reecrire, le materiau. */
  const boids = useRef<Boid[]>([])
  const attribute = useRef<Attribute | null>(null)
  const material = useRef<PointsMaterial | null>(null)
  const context = useRef<SceneContext | null>(null)

  const { ref, ready, refused } = useScene({
    name: 'nuee',
    setup: (scene) => {
      context.current = scene
      const { three, renderer, quality } = scene

      const [bg, tint] = colors.map((token) => readTokenColour(token, host))
      const bgColour = new three.Color(bg?.[0] ?? 0, bg?.[1] ?? 0, bg?.[2] ?? 0)
      // Le token est en sRGB et le moteur encode sa couleur d'effacement du
      // lineaire vers le sRGB : sans la conversion inverse, le fond ressort
      // un cran plus clair que la page.
      renderer.setClearColor(bgColour.convertSRGBToLinear(), 1)

      const total = quality === 'low' ? Math.min(count, LOW_COUNT) : count
      const halfWidth = HALF_HEIGHT * scene.camera.aspect

      // Depart : positions et directions tirees au hasard, vitesses egales.
      boids.current = Array.from({ length: total }, () => {
        const heading = Math.random() * Math.PI * 2
        return {
          x: (Math.random() * 2 - 1) * halfWidth,
          y: (Math.random() * 2 - 1) * HALF_HEIGHT,
          vx: Math.cos(heading),
          vy: Math.sin(heading),
        }
      })

      const positions = new three.BufferAttribute(new Float32Array(total * 3), 3)
      positions.setUsage(three.DynamicDrawUsage)
      attribute.current = positions

      const geometry = new three.BufferGeometry()
      geometry.setAttribute('position', positions)

      const points = new three.PointsMaterial({
        size: 0.05,
        transparent: true,
        opacity: 0.9,
        depthWrite: false,
      })
      points.color.setRGB(tint?.[0] ?? 0, tint?.[1] ?? 0, tint?.[2] ?? 0)
      material.current = points

      const cloud = new three.Points(geometry, points)
      cloud.name = 'nuee'
      scene.scene.add(cloud)

      return () => {
        scene.scene.remove(cloud)
        attribute.current = null
        material.current = null
      }
    },

    frame: ({ camera }, { delta }) => {
      const positions = attribute.current
      if (positions === null) return

      // Un pas borne : une image longue — onglet revenu au premier plan — ne
      // doit pas projeter la nuee hors du cadre.
      const dt = Math.min(delta, 0.05)
      const halfWidth = HALF_HEIGHT * camera.aspect

      // Le pointeur en unites de scene, y vers le haut.
      const px = pointer.current.x * halfWidth
      const py = -pointer.current.y * HALF_HEIGHT

      const flock = boids.current
      const sight2 = SIGHT * SIGHT
      const cruise = 0.9 * speed
      const limit = 1.6 * speed

      let index = 0
      for (const boid of flock) {
        let sepX = 0
        let sepY = 0
        let aliX = 0
        let aliY = 0
        let cohX = 0
        let cohY = 0
        let seen = 0

        // Les trois regles, sur les voisins a portee de vue. En n carre :
        // pour quelques centaines de boids, bien en dessous d'une milliseconde.
        for (const other of flock) {
          if (other === boid) continue
          const dx = other.x - boid.x
          const dy = other.y - boid.y
          const d2 = dx * dx + dy * dy
          if (d2 > sight2 || d2 === 0) continue
          seen += 1
          // Separation : d'autant plus forte que le voisin est proche.
          sepX -= dx / d2
          sepY -= dy / d2
          aliX += other.vx
          aliY += other.vy
          cohX += dx
          cohY += dy
        }

        let ax = 0
        let ay = 0
        if (seen > 0) {
          ax += sepX * 0.06 + (aliX / seen - boid.vx) * 1.2 + (cohX / seen) * 0.9
          ay += sepY * 0.06 + (aliY / seen - boid.vy) * 1.2 + (cohY / seen) * 0.9
        }

        // L'evitement du pointeur : une poussee radiale qui decroit avec la
        // distance, nulle au-dela du rayon.
        const ex = boid.x - px
        const ey = boid.y - py
        const ed = Math.hypot(ex, ey)
        if (ed < avoid && ed > 0.0001) {
          const push = (1 - ed / avoid) * 14
          ax += (ex / ed) * push
          ay += (ey / ed) * push
        }

        // Les bords : un rappel doux vers l'interieur, pas un mur.
        const marginX = halfWidth * 0.85
        const marginY = HALF_HEIGHT * 0.85
        if (boid.x > marginX) ax -= (boid.x - marginX) * 6
        if (boid.x < -marginX) ax += (-marginX - boid.x) * 6
        if (boid.y > marginY) ay -= (boid.y - marginY) * 6
        if (boid.y < -marginY) ay += (-marginY - boid.y) * 6

        boid.vx += ax * dt
        boid.vy += ay * dt

        // Une nuee ne s'arrete ni ne s'emballe : la vitesse est ramenee
        // entre une vitesse de croisiere et un plafond.
        const v = Math.hypot(boid.vx, boid.vy) || 0.0001
        const clamped = Math.min(Math.max(v, cruise), limit)
        boid.vx = (boid.vx / v) * clamped
        boid.vy = (boid.vy / v) * clamped

        boid.x += boid.vx * dt
        boid.y += boid.vy * dt

        positions.setXYZ(index, boid.x, boid.y, 0)
        index += 1
      }

      positions.needsUpdate = true
    },
  })

  // Le theme a bascule : les tokens sont relus et les couleurs repeintes en
  // place. La scene n'est pas reconstruite.
  useEffect(() => {
    const scene = context.current
    const points = material.current
    if (scene === null || points === null) return
    const [bg, tint] = colors.map((token) => readTokenColour(token, host))
    if (tint !== undefined) points.color.setRGB(tint[0], tint[1], tint[2])
    if (bg !== undefined) {
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

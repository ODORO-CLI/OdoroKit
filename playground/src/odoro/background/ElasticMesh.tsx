/**
 * Maillage elastique : une nappe quadrillee que le pointeur tire vers lui, et
 * qui ondule en revenant a plat.
 *
 * ## Pourquoi une simulation, et pas une formule
 *
 * Un relief tire d'un bruit ou d'un sinus de la distance au pointeur suit le
 * curseur mais n'a pas de memoire : la nappe se remet a plat exactement quand
 * le curseur part, sans un pli de retard. Or c'est le retard qui fait
 * l'elastique. Chaque noeud garde donc une vitesse, et son acceleration a
 * trois termes : le laplacien de ses quatre voisins — qui propage l'onde de
 * proche en proche —, un rappel vers le plan, et la traction du pointeur.
 *
 * Le cout est lineaire en nombre de noeuds, et se paie sur le processeur ; il
 * est negligeable devant le dessin de la nappe, qui est un seul appel.
 *
 * ## Pourquoi le pas de temps est plafonne
 *
 * Un schema explicite diverge des que le pas depasse ce que la raideur
 * autorise. Apres un onglet en arriere-plan, la premiere image porte parfois
 * une seconde entiere : sans plafond, la nappe explose au retour et ne
 * revient jamais. Le plafond a trente millisecondes coute un ralenti d'une
 * image, et c'est tout.
 *
 * ## Les gouttes
 *
 * Sans pointeur, une nappe parfaitement plate est un ecran vide. Une
 * impulsion tombe donc de temps en temps sur un noeud tire au hasard, et son
 * onde traverse le maillage. C'est aussi ce qui rend l'elasticite visible
 * quand personne ne touche a rien.
 *
 * ## Sous mouvement reduit
 *
 * La scene est refusee par le moteur et le repli statique s'affiche.
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

import { usePointerDamped } from '@/odoro/hooks/usePointerDamped'
import { usePoster } from '@/odoro/hooks/usePoster'

/** Proprietes propres au composant. */
export interface ElasticMeshOwnProps {
  /** Noeuds par cote du maillage. @defaultValue 26 */
  density?: number
  /** Force de traction du pointeur. @defaultValue 1 */
  pull?: number
  /** Raideur de la nappe : plus haut, plus l onde court vite. @defaultValue 1 */
  springiness?: number
  /** Gouttes par minute quand le pointeur ne touche a rien. @defaultValue 12 */
  drops?: number
  /** Tokens : le fond, la nappe au repos, la nappe tendue. */
  colors?: readonly [string, string, string]
  /** Classes du repli. */
  poster?: string
}

/** Toutes les proprietes. */
export type ElasticMeshProps = Customisable<ElasticMeshOwnProps>

/** Tokens employes par defaut. */
const DEFAULT_TOKENS = [
  '--o-theme-bg',
  '--o-theme-line',
  '--o-palette-violet-400',
] as const

/** Repli par defaut : une teinte figee, dans les memes tons. */
const DEFAULT_POSTER =
  'o-bg-gradient-to-b o-from-zinc-50 dark:o-from-zinc-950 o-to-violet-100 dark:o-to-violet-950'

/**
 * Noeuds par cote en qualite basse.
 *
 * Le cout est le carre du cote, a la simulation comme au dessin.
 */
const LOW_DENSITY = 16

/** Demi-largeur de la nappe, en unites de scene. */
const HALF = 1.6

/** Portee de la traction du pointeur, en unites de scene. */
const GRIP = 0.55

/** Pas de temps maximal, en secondes. Au-dela, le schema explicite diverge. */
const MAX_STEP = 0.03

type Three = SceneContext['three']
type BufferAttribute = InstanceType<Three['BufferAttribute']>

/** Ce que la scene garde entre la construction et les images. */
interface Sheet {
  readonly side: number
  readonly position: BufferAttribute
  readonly colour: BufferAttribute
  /** Deplacement de chaque noeud hors du plan. */
  readonly height: Float32Array
  /** Vitesse de chaque noeud. */
  readonly speed: Float32Array
  /** Temps restant avant la prochaine goutte, en secondes. */
  nextDrop: number
  /** Teintes courantes, relues a chaque bascule de theme. */
  rest: ShaderColour
  strained: ShaderColour
}

/**
 * Maillage elastique.
 *
 * @example
 * <div className="o-relative o-h-96 o-overflow-hidden o-rounded-xl">
 *   <ElasticMesh className="o-absolute o-inset-0" />
 *   <div className="o-relative o-z-10">…</div>
 * </div>
 */
export function ElasticMesh({
  density = 26,
  pull = 1,
  springiness = 1,
  drops = 12,
  colors = DEFAULT_TOKENS,
  poster = DEFAULT_POSTER,
  ...rest
}: ElasticMeshProps): ReactElement {
  const { theme } = useMotionState()
  const [host, setHost] = useState<HTMLDivElement | null>(null)

  const sheet = useRef<Sheet | null>(null)
  const context = useRef<SceneContext | null>(null)

  const settings = useRef({ pull, springiness, drops })
  settings.current = { pull, springiness, drops }

  const pointer = usePointerDamped({ host, speed: 6, name: 'elastic-mesh : pointeur' })

  const { ref, ready, refused } = useScene<HTMLDivElement>({
    name: 'maillage-elastique',
    setup: (scene: SceneContext) => {
      context.current = scene
      const { three, renderer, camera, quality } = scene

      const [bg, calm, strained] = colors.map((token) => readTokenColour(token, ref.current))

      // Le fond de la scene est le fond de la page. Le token est en sRGB et
      // le moteur encode sa couleur d'effacement du lineaire vers le sRGB :
      // sans la conversion inverse, le fond ressort un cran plus clair.
      renderer.setClearColor(
        new three.Color(bg?.[0] ?? 0, bg?.[1] ?? 0, bg?.[2] ?? 0).convertSRGBToLinear(),
        1,
      )

      const side = quality === 'low' ? Math.min(density, LOW_DENSITY) : Math.max(density, 4)
      const count = side * side

      // La camera regarde la nappe de biais : de face, un deplacement hors du
      // plan ne se lirait qu'a la couleur.
      camera.position.set(0, -1.35, 1.95)
      camera.lookAt(0, 0.05, 0)

      const positions = new Float32Array(count * 3)
      const colours = new Float32Array(count * 3)
      for (let iy = 0; iy < side; iy += 1) {
        for (let ix = 0; ix < side; ix += 1) {
          const index = iy * side + ix
          positions[index * 3] = (ix / (side - 1)) * 2 * HALF - HALF
          positions[index * 3 + 1] = (iy / (side - 1)) * 2 * HALF - HALF
          positions[index * 3 + 2] = 0
        }
      }

      // Les segments sont indexes : chaque noeud n'existe qu'une fois, et une
      // seule ecriture de sa position deplace les quatre traits qui y menent.
      const indices: number[] = []
      for (let iy = 0; iy < side; iy += 1) {
        for (let ix = 0; ix < side; ix += 1) {
          const index = iy * side + ix
          if (ix + 1 < side) indices.push(index, index + 1)
          if (iy + 1 < side) indices.push(index, index + side)
        }
      }

      const geometry = new three.BufferGeometry()
      const position = new three.BufferAttribute(positions, 3)
      const colour = new three.BufferAttribute(colours, 3)
      position.setUsage(three.DynamicDrawUsage)
      colour.setUsage(three.DynamicDrawUsage)
      geometry.setAttribute('position', position)
      geometry.setAttribute('color', colour)
      geometry.setIndex(indices)

      const material = new three.LineBasicMaterial({
        vertexColors: true,
        transparent: true,
        opacity: 0.9,
      })
      const lines = new three.LineSegments(geometry, material)
      lines.name = 'maillage'
      scene.scene.add(lines)

      sheet.current = {
        side,
        position,
        colour,
        height: new Float32Array(count),
        speed: new Float32Array(count),
        nextDrop: 1,
        rest: calm ?? [0, 0, 0],
        strained: strained ?? [0, 0, 0],
      }

      return () => {
        scene.scene.remove(lines)
        sheet.current = null
      }
    },

    frame: (_, { deltaRaw }) => {
      const live = sheet.current
      if (live === null) return

      const { side, height, speed, position, colour } = live
      const { pull: force, springiness: stiff, drops: rate } = settings.current

      // Le pas est plafonne : un schema explicite diverge au-dela de ce que
      // la raideur autorise, et la premiere image apres un onglet cache en
      // porte facilement dix fois trop.
      const dt = Math.min(deltaRaw, MAX_STEP)

      // Le pointeur, du repere du hook vers celui de la nappe.
      const px = pointer.current.x * HALF * 1.1
      const py = -pointer.current.y * HALF * 1.1

      // La goutte : une impulsion sur un noeud tire au hasard.
      live.nextDrop -= dt
      if (rate > 0 && live.nextDrop <= 0) {
        live.nextDrop = 60 / rate
        const target = Math.floor(Math.random() * side * side)
        speed[target] = (speed[target] ?? 0) - 2.4
      }

      const k = 55 * Math.max(stiff, 0.05)
      const damping = Math.exp(-2.4 * dt)
      const positions = position.array as Float32Array

      for (let iy = 0; iy < side; iy += 1) {
        for (let ix = 0; ix < side; ix += 1) {
          const index = iy * side + ix

          // Les bords sont cloues : une nappe libre glisserait hors du cadre.
          if (ix === 0 || iy === 0 || ix === side - 1 || iy === side - 1) {
            height[index] = 0
            speed[index] = 0
            positions[index * 3 + 2] = 0
            continue
          }

          const here = height[index] ?? 0
          const laplacian =
            (height[index - 1] ?? 0) +
            (height[index + 1] ?? 0) +
            (height[index - side] ?? 0) +
            (height[index + side] ?? 0) -
            4 * here

          // La traction : une gaussienne de la distance au pointeur, dans le
          // plan de la nappe.
          const dx = (positions[index * 3] ?? 0) - px
          const dy = (positions[index * 3 + 1] ?? 0) - py
          const grip = Math.exp(-(dx * dx + dy * dy) / (GRIP * GRIP))

          const acceleration = k * laplacian - 7 * here + grip * force * 9
          const next = ((speed[index] ?? 0) + acceleration * dt) * damping
          speed[index] = next
          height[index] = here + next * dt
          positions[index * 3 + 2] = height[index] ?? 0
        }
      }

      // La teinte suit la tension : au repos le filet du theme, tendue la
      // couleur vive. Le carre resserre la couleur sur les plis marques.
      const colourArray = colour.array as Float32Array
      const [r0, g0, b0] = live.rest
      const [r1, g1, b1] = live.strained
      for (let index = 0; index < side * side; index += 1) {
        const strain = Math.min(Math.abs(height[index] ?? 0) * 2.4, 1)
        const share = strain * strain
        colourArray[index * 3] = r0 + (r1 - r0) * share
        colourArray[index * 3 + 1] = g0 + (g1 - g0) * share
        colourArray[index * 3 + 2] = b0 + (b1 - b0) * share
      }

      position.needsUpdate = true
      colour.needsUpdate = true
    },
  })

  // Le theme a bascule : les tokens sont relus et les teintes de reference
  // remplacees. La scene n'est pas reconstruite — la boucle repeint seule.
  useEffect(() => {
    const scene = context.current
    const live = sheet.current
    if (scene === null || live === null || host === null) return
    const [bg, calm, strained] = colors.map((token) => readTokenColour(token, host))
    live.rest = calm ?? live.rest
    live.strained = strained ?? live.strained
    scene.renderer.setClearColor(
      new scene.three.Color(bg?.[0] ?? 0, bg?.[1] ?? 0, bg?.[2] ?? 0).convertSRGBToLinear(),
      1,
    )
  }, [theme, colors, host, ready])

  const pending = usePoster({ ready, refused })

  const { className, style } = mergePresentation(
    { className: 'o-relative o-overflow-hidden' },
    rest,
  )

  return (
    <div
      {...rest}
      ref={(element) => {
        setHost(element)
        ref.current = element
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

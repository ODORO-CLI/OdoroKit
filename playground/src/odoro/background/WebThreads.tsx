/**
 * Toile de fils : des points relies a leurs voisins, une toile qui vibre sous le pointeur.
 *
 * ## Pourquoi une scene, et pas un shader plein ecran
 *
 * Un shader de fragment sait dessiner des lignes definies par une formule ;
 * il ne sait pas relier soixante points a leurs voisins les plus proches —
 * il faudrait que chaque fragment parcoure toutes les paires. Une scene
 * porte la toile comme une geometrie de segments, dont seuls les sommets
 * bougent : c'est le cas ou les lignes du moteur 3D coutent moins cher que
 * leur equivalent par fragment.
 *
 * ## Comment la toile est tissee
 *
 * Les points sont tires une fois, de facon deterministe, dans un rectangle
 * normalise ; chaque point est relie a ses voisins dans un rayon donne, avec
 * un plafond de liens par point pour que les zones denses ne deviennent pas
 * des taches. Les liens sont fixes : ce sont leurs extremites qui bougent.
 *
 * Le rectangle est mis a l'echelle du champ de la camera a chaque image :
 * la toile suit le cadre quand il se redimensionne, sans etre retissee.
 *
 * ## A quoi ce fond reagit
 *
 * Au deplacement du pointeur, avec amortissement : les points a portee sont
 * repousses et tremblent, et les fils qui les portent s'eclairent. A la
 * sortie du cadre, le hook ramene la cible au centre et la toile se detend.
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
export interface WebThreadsOwnProps {
  /** Nombre de points. @defaultValue 80 */
  points?: number
  /** Rayon de liaison entre points, en unites de scene. @defaultValue 1.1 */
  radius?: number
  /** Amplitude du tremblement au repos. @defaultValue 0.4 */
  vibration?: number
  /** Portee du pointeur, en unites de scene. @defaultValue 1.4 */
  reach?: number
  /** Tokens : le fond, les fils, les noeuds. */
  colors?: readonly [string, string, string]
  /** Classes du repli. */
  poster?: string
}

/** Toutes les proprietes. */
export type WebThreadsProps = Customisable<WebThreadsOwnProps>

/** Tokens employes par defaut. */
const DEFAULT_TOKENS = [
  '--o-theme-bg',
  '--o-theme-muted',
  '--o-palette-brand-500',
] as const

/** Repli par defaut : une teinte figee, dans les memes tons. */
const DEFAULT_POSTER = 'o-bg-zinc-50 dark:o-bg-zinc-950'

/**
 * Nombre de points en qualite basse.
 *
 * Le cout est dans les liens, et le nombre de liens croit plus vite que le
 * nombre de points. Diviser les points par deux divise les liens par pres de
 * quatre.
 */
const LOW_POINTS = 40

/** Liens au plus par point : au-dela, les zones denses deviennent des taches. */
const MAX_LINKS = 5

/** Hauteur visible a la distance de la camera, pour son angle de 45 degres. */
const VIEW_HEIGHT = 2 * 5 * Math.tan((45 / 2) * (Math.PI / 180))

/** Ce que la scene garde entre la construction et les images. */
interface Web {
  /** Positions normalisees, dans [-1, 1], tirees une fois. */
  readonly base: Float32Array
  /** Positions courantes, en unites de scene, amorties. */
  readonly current: Float32Array
  /** Paires d'indices de points, un lien par paire. */
  readonly links: Uint16Array
  /** Tampon de sommets des segments. */
  readonly linePositions: Float32Array
  /** Tampon de couleurs des segments. */
  readonly lineColours: Float32Array
  /** Tampon de sommets des noeuds. */
  readonly nodePositions: Float32Array
  readonly lineAttribute: { needsUpdate: boolean }
  readonly lineColourAttribute: { needsUpdate: boolean }
  readonly nodeAttribute: { needsUpdate: boolean }
  readonly nodeMaterial: { color: { setRGB: (r: number, g: number, b: number) => unknown } }
}

/** Nombre pseudo-aleatoire deterministe : la toile est la meme a chaque montage. */
function hash(seed: number): number {
  const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453
  return x - Math.floor(x)
}

/**
 * Toile de fils.
 *
 * @example
 * <div className="o-relative o-h-96 o-overflow-hidden o-rounded-xl">
 *   <WebThreads className="o-absolute o-inset-0" />
 *   <div className="o-relative o-z-10">…</div>
 * </div>
 */
export function WebThreads({
  points = 80,
  radius = 1.1,
  vibration = 0.4,
  reach = 1.4,
  colors = DEFAULT_TOKENS,
  poster = DEFAULT_POSTER,
  ...rest
}: WebThreadsProps): ReactElement {
  const { theme } = useMotionState()
  const [host, setHost] = useState<HTMLDivElement | null>(null)

  const pointer = usePointerDamped({ host, speed: 5, name: 'toile : pointeur' })

  const web = useRef<Web | null>(null)
  const context = useRef<SceneContext | null>(null)

  // Les couleurs sont lues par ref dans la boucle : un changement de theme
  // les remplace sans reconstruire la scene.
  const shades = useRef<readonly ShaderColour[]>([])

  const settings = useRef({ vibration, reach })
  settings.current = { vibration, reach }

  const { ref, ready, refused } = useScene<HTMLDivElement>({
    name: 'toile',
    setup: (scene: SceneContext) => {
      context.current = scene
      const { three, renderer, quality } = scene

      shades.current = colors.map((token) => readTokenColour(token, ref.current))
      const [bg, thread, node] = shades.current

      // Le fond de la scene est le fond de la page. Le token est en sRGB et
      // le moteur encode sa couleur d'effacement du lineaire vers le sRGB :
      // sans la conversion inverse, le fond ressort un cran plus clair.
      renderer.setClearColor(
        new three.Color(bg?.[0] ?? 0, bg?.[1] ?? 0, bg?.[2] ?? 0).convertSRGBToLinear(),
        1,
      )

      const count = quality === 'low' ? Math.min(points, LOW_POINTS) : points

      // Les points, tires une fois dans un rectangle normalise un peu plus
      // large que le cadre : la toile deborde, aucun bord n'est visible.
      const base = new Float32Array(count * 2)
      for (let index = 0; index < count; index += 1) {
        base[index * 2] = (hash(index + 1) * 2 - 1) * 1.15
        base[index * 2 + 1] = (hash(index + 101) * 2 - 1) * 1.15
      }

      // Les liens : chaque paire a portee, avec un plafond par point. Les
      // distances sont mesurees dans le repere de la scene au montage — la
      // toile n'est pas retissee au redimensionnement, seulement etiree.
      const hostElement = ref.current
      const aspect =
        hostElement === null
          ? 1
          : hostElement.clientWidth / Math.max(hostElement.clientHeight, 1) || 1
      const width = VIEW_HEIGHT * aspect
      const linkCount = new Uint8Array(count)
      const pairs: number[] = []
      for (let a = 0; a < count; a += 1) {
        for (let b = a + 1; b < count; b += 1) {
          if ((linkCount[a] ?? 0) >= MAX_LINKS || (linkCount[b] ?? 0) >= MAX_LINKS) continue
          const dx = ((base[a * 2] ?? 0) - (base[b * 2] ?? 0)) * width * 0.5
          const dy = ((base[a * 2 + 1] ?? 0) - (base[b * 2 + 1] ?? 0)) * VIEW_HEIGHT * 0.5
          if (dx * dx + dy * dy > radius * radius) continue
          pairs.push(a, b)
          linkCount[a] = (linkCount[a] ?? 0) + 1
          linkCount[b] = (linkCount[b] ?? 0) + 1
        }
      }
      const links = new Uint16Array(pairs)
      const segments = links.length / 2

      const linePositions = new Float32Array(segments * 2 * 3)
      const lineColours = new Float32Array(segments * 2 * 3)
      const lineGeometry = new three.BufferGeometry()
      const lineAttribute = new three.BufferAttribute(linePositions, 3)
      const lineColourAttribute = new three.BufferAttribute(lineColours, 3)
      lineAttribute.setUsage(three.DynamicDrawUsage)
      lineColourAttribute.setUsage(three.DynamicDrawUsage)
      lineGeometry.setAttribute('position', lineAttribute)
      lineGeometry.setAttribute('color', lineColourAttribute)

      // Les couleurs viennent des sommets : c'est ce qui permet d'eclairer un
      // fil pres du pointeur sans un materiau par fil.
      const lineMaterial = new three.LineBasicMaterial({
        vertexColors: true,
        transparent: true,
        opacity: 0.8,
        depthWrite: false,
      })

      const nodePositions = new Float32Array(count * 3)
      const nodeGeometry = new three.BufferGeometry()
      const nodeAttribute = new three.BufferAttribute(nodePositions, 3)
      nodeAttribute.setUsage(three.DynamicDrawUsage)
      nodeGeometry.setAttribute('position', nodeAttribute)
      const nodeMaterial = new three.PointsMaterial({
        size: 0.05,
        transparent: true,
        opacity: 0.95,
        depthWrite: false,
      })
      nodeMaterial.color.setRGB(node?.[0] ?? 0, node?.[1] ?? 0, node?.[2] ?? 0)

      const group = new three.Group()
      group.name = 'toile'
      group.add(new three.LineSegments(lineGeometry, lineMaterial))
      group.add(new three.Points(nodeGeometry, nodeMaterial))
      scene.scene.add(group)

      // Les fils prennent d'abord leur couleur de repos.
      for (let index = 0; index < segments * 2; index += 1) {
        lineColours[index * 3] = thread?.[0] ?? 0
        lineColours[index * 3 + 1] = thread?.[1] ?? 0
        lineColours[index * 3 + 2] = thread?.[2] ?? 0
      }

      // Les positions courantes partent des positions de repos : sans cela,
      // la toile convergerait depuis le centre a la premiere image.
      const current = new Float32Array(count * 2)
      for (let index = 0; index < count; index += 1) {
        current[index * 2] = (base[index * 2] ?? 0) * width * 0.5
        current[index * 2 + 1] = (base[index * 2 + 1] ?? 0) * VIEW_HEIGHT * 0.5
      }

      web.current = {
        base,
        current,
        links,
        linePositions,
        lineColours,
        nodePositions,
        lineAttribute,
        lineColourAttribute,
        nodeAttribute,
        nodeMaterial,
      }

      return () => {
        scene.scene.remove(group)
        web.current = null
      }
    },

    frame: ({ camera }, { time, delta }) => {
      const toile = web.current
      if (toile === null) return
      const { vibration: tremble, reach: portee } = settings.current
      const [, thread, node] = shades.current

      // L'echelle suit le cadre : la toile est etiree, jamais retissee.
      const halfWidth = (VIEW_HEIGHT * camera.aspect) / 2
      const halfHeight = VIEW_HEIGHT / 2

      // Le pointeur, du repere du hook (centre, y vers le bas) vers la scene.
      const px = pointer.current.x * halfWidth
      const py = -pointer.current.y * halfHeight

      const count = toile.base.length / 2
      const ease = 1 - Math.exp(-delta * 6)

      for (let index = 0; index < count; index += 1) {
        const bx = (toile.base[index * 2] ?? 0) * halfWidth
        const by = (toile.base[index * 2 + 1] ?? 0) * halfHeight

        // Le tremblement de repos : deux sinus de frequences propres au point,
        // jamais un tirage par image — ce dernier ne produirait que du bruit.
        const jx = Math.sin(time * (0.6 + hash(index + 7) * 0.8) + index) * 0.08 * tremble
        const jy = Math.cos(time * (0.5 + hash(index + 13) * 0.9) + index * 1.7) * 0.08 * tremble

        // Le pointeur repousse ce qui est a portee, et le fait vibrer.
        let ox = 0
        let oy = 0
        const dx = bx + jx - px
        const dy = by + jy - py
        const distance = Math.hypot(dx, dy)
        if (distance < portee && distance > 0.0001) {
          const near = 1 - distance / portee
          const push = near * near * 0.5
          const shiver = Math.sin(time * 38 + index * 2.3) * near * 0.05
          ox = (dx / distance) * push + shiver
          oy = (dy / distance) * push - shiver
        }

        const tx = bx + jx + ox
        const ty = by + jy + oy
        const cx = toile.current[index * 2] ?? tx
        const cy = toile.current[index * 2 + 1] ?? ty
        toile.current[index * 2] = cx + (tx - cx) * ease
        toile.current[index * 2 + 1] = cy + (ty - cy) * ease

        toile.nodePositions[index * 3] = toile.current[index * 2] ?? 0
        toile.nodePositions[index * 3 + 1] = toile.current[index * 2 + 1] ?? 0
        toile.nodePositions[index * 3 + 2] = 0
      }

      const segments = toile.links.length / 2
      for (let segment = 0; segment < segments; segment += 1) {
        const a = toile.links[segment * 2] ?? 0
        const b = toile.links[segment * 2 + 1] ?? 0
        const ax = toile.current[a * 2] ?? 0
        const ay = toile.current[a * 2 + 1] ?? 0
        const bx = toile.current[b * 2] ?? 0
        const by = toile.current[b * 2 + 1] ?? 0

        toile.linePositions[segment * 6] = ax
        toile.linePositions[segment * 6 + 1] = ay
        toile.linePositions[segment * 6 + 2] = 0
        toile.linePositions[segment * 6 + 3] = bx
        toile.linePositions[segment * 6 + 4] = by
        toile.linePositions[segment * 6 + 5] = 0

        // Le fil s'eclaire selon la proximite du pointeur a son milieu.
        const mx = (ax + bx) / 2 - px
        const my = (ay + by) / 2 - py
        const glow = Math.max(0, 1 - Math.hypot(mx, my) / portee)
        for (let end = 0; end < 2; end += 1) {
          const at = (segment * 2 + end) * 3
          toile.lineColours[at] = (thread?.[0] ?? 0) + ((node?.[0] ?? 0) - (thread?.[0] ?? 0)) * glow
          toile.lineColours[at + 1] = (thread?.[1] ?? 0) + ((node?.[1] ?? 0) - (thread?.[1] ?? 0)) * glow
          toile.lineColours[at + 2] = (thread?.[2] ?? 0) + ((node?.[2] ?? 0) - (thread?.[2] ?? 0)) * glow
        }
      }

      toile.lineAttribute.needsUpdate = true
      toile.lineColourAttribute.needsUpdate = true
      toile.nodeAttribute.needsUpdate = true
    },
  })

  // Le theme a bascule : les tokens sont relus et les couleurs remplacees en
  // place. Les fils lisent la ref a l'image suivante ; les noeuds et le fond
  // sont peints ici, parce qu'ils ne sont pas relus par image.
  useEffect(() => {
    const scene = context.current
    const toile = web.current
    if (scene === null || toile === null || host === null) return
    shades.current = colors.map((token) => readTokenColour(token, host))
    const [bg, , node] = shades.current
    toile.nodeMaterial.color.setRGB(node?.[0] ?? 0, node?.[1] ?? 0, node?.[2] ?? 0)
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

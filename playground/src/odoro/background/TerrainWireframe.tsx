/**
 * Relief en fil de fer : une nappe quadrillee dont les cretes defilent vers
 * la camera, et s'effacent dans le brouillard au loin.
 *
 * ## Pourquoi une scene, et pas un shader plein ecran
 *
 * Un shader de fragment peut projeter un sol en posant z = 1/y — c'est ce
 * que fait `night-drive` — mais pas un relief : il faudrait, pour chaque
 * pixel, chercher le point de la nappe qui se projette dessus, et cette
 * recherche n'a pas de forme close. Une scene porte la nappe comme une
 * geometrie de segments dont seules les hauteurs changent ; la projection
 * est faite par le pipeline, une fois par sommet. C'est le cas ou les lignes
 * du moteur 3D coutent moins cher que leur equivalent par fragment.
 *
 * ## Comment le relief defile
 *
 * Les sommets ne bougent pas en profondeur : c'est le bruit qui est lu a
 * une profondeur decalee du temps. Les cretes semblent avancer, la nappe
 * reste en place — aucun sommet ne franchit jamais le bord de la scene. Le
 * bruit est un bruit de valeur a deux octaves, evalue une fois par sommet
 * et par image ; quelques milliers de sommets, c'est une boucle courte.
 *
 * Une vallee centrale est menagee dans le relief : les cretes montent sur
 * les cotes, le centre reste plat. Sans elle, le regard buterait sur la
 * crete la plus proche.
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

import { usePoster } from '@/odoro/hooks/usePoster'

/** Proprietes propres au composant. */
export interface TerrainWireframeOwnProps {
  /** Colonnes de la nappe. Les rangees en valent la moitie. @defaultValue 80 */
  columns?: number
  /** Vitesse de defilement, en unites de scene par seconde. @defaultValue 1.2 */
  speed?: number
  /** Hauteur des cretes, en unites de scene. @defaultValue 1.6 */
  height?: number
  /** Largeur de la vallee centrale, entre zero et un. Zero la supprime. @defaultValue 0.6 */
  valley?: number
  /** Tokens : le fond et le brouillard, les lignes, les cretes. */
  colors?: readonly [string, string, string]
  /** Classes du repli. */
  poster?: string
}

/** Toutes les proprietes. */
export type TerrainWireframeProps = Customisable<TerrainWireframeOwnProps>

/** Tokens employes par defaut. */
const DEFAULT_TOKENS = [
  '--o-theme-bg',
  '--o-palette-teal-500',
  '--o-palette-teal-200',
] as const

/** Repli par defaut : une teinte figee, dans les memes tons. */
const DEFAULT_POSTER =
  'o-bg-gradient-to-t o-from-zinc-50 dark:o-from-zinc-950 o-to-teal-100 dark:o-to-teal-950'

/**
 * Colonnes en qualite basse.
 *
 * Le cout est dans la boucle de bruit, un appel par sommet et par image ;
 * diviser les colonnes par deux divise les sommets par quatre.
 */
const LOW_COLUMNS = 40

/** Largeur de la nappe, en unites de scene. */
const WIDTH = 18

/** Profondeur de la nappe, en unites de scene. */
const DEPTH = 16

/** Echelle du bruit : cretes par unite de scene. */
const SCALE = 0.35

type Three = SceneContext['three']
type Fog = InstanceType<Three['Fog']>

/** Ce que la scene garde entre la construction et les images. */
interface Relief {
  readonly columns: number
  readonly rows: number
  /** Tampon de sommets, x et z fixes, y reecrit par image. */
  readonly positions: Float32Array
  /** Tampon de couleurs, un melange lignes/cretes selon la hauteur. */
  readonly colours: Float32Array
  readonly positionAttribute: { needsUpdate: boolean }
  readonly colourAttribute: { needsUpdate: boolean }
  readonly fog: Fog
}

/** Nombre pseudo-aleatoire deterministe sur une grille entiere. */
function hash(x: number, y: number): number {
  const value = Math.sin(x * 127.1 + y * 311.7) * 43758.5453
  return value - Math.floor(value)
}

/** Bruit de valeur : quatre tirages interpoles en lissage cubique. */
function noise(x: number, y: number): number {
  const ix = Math.floor(x)
  const iy = Math.floor(y)
  const fx = x - ix
  const fy = y - iy
  const ux = fx * fx * (3 - 2 * fx)
  const uy = fy * fy * (3 - 2 * fy)
  const a = hash(ix, iy)
  const b = hash(ix + 1, iy)
  const c = hash(ix, iy + 1)
  const d = hash(ix + 1, iy + 1)
  return a + (b - a) * ux + (c - a) * uy + (a - b - c + d) * ux * uy
}

/**
 * Relief en fil de fer.
 *
 * @example
 * <div className="o-relative o-h-96 o-overflow-hidden o-rounded-xl">
 *   <TerrainWireframe className="o-absolute o-inset-0" />
 *   <div className="o-relative o-z-10">…</div>
 * </div>
 */
export function TerrainWireframe({
  columns = 80,
  speed = 1.2,
  height = 1.6,
  valley = 0.6,
  colors = DEFAULT_TOKENS,
  poster = DEFAULT_POSTER,
  ...rest
}: TerrainWireframeProps): ReactElement {
  const { theme } = useMotionState()
  const [host, setHost] = useState<HTMLDivElement | null>(null)

  const relief = useRef<Relief | null>(null)
  const context = useRef<SceneContext | null>(null)

  // Les couleurs sont lues par ref dans la boucle : un changement de theme
  // les remplace sans reconstruire la scene.
  const shades = useRef<readonly ShaderColour[]>([])

  const settings = useRef({ speed, height, valley })
  settings.current = { speed, height, valley }

  const { ref, ready, refused } = useScene<HTMLDivElement>({
    name: 'relief',
    setup: (scene: SceneContext) => {
      context.current = scene
      const { three, renderer, camera, quality } = scene

      shades.current = colors.map((token) => readTokenColour(token, ref.current))
      const [bg] = shades.current

      // Le fond de la scene est le fond de la page, et le brouillard a la
      // meme couleur : les cretes lointaines s'y effacent sans bord visible.
      // Le token est en sRGB et le moteur encode sa couleur d'effacement du
      // lineaire vers le sRGB : sans la conversion inverse, le fond ressort
      // un cran plus clair.
      const bgColour = new three.Color(bg?.[0] ?? 0, bg?.[1] ?? 0, bg?.[2] ?? 0).convertSRGBToLinear()
      renderer.setClearColor(bgColour, 1)
      const fog = new three.Fog(bgColour, 4, DEPTH + 2)
      scene.scene.fog = fog

      // La camera est basse et regarde loin devant : le relief se lit en
      // perspective, l'horizon dans le tiers superieur.
      camera.position.set(0, 1.8, 3.5)
      camera.lookAt(0, 0.2, -DEPTH)

      const cols = quality === 'low' ? Math.min(columns, LOW_COLUMNS) : Math.max(columns, 8)
      const rows = Math.max(Math.round(cols / 2), 4)
      const count = (cols + 1) * (rows + 1)

      // Les sommets : x et z sont fixes, y est reecrit par image.
      const positions = new Float32Array(count * 3)
      const colours = new Float32Array(count * 3)
      for (let row = 0; row <= rows; row += 1) {
        for (let col = 0; col <= cols; col += 1) {
          const at = (row * (cols + 1) + col) * 3
          positions[at] = (col / cols - 0.5) * WIDTH
          positions[at + 1] = 0
          positions[at + 2] = 2 - (row / rows) * DEPTH
        }
      }

      // Les segments : chaque sommet est relie a son voisin de droite et a
      // celui de derriere. Pas de diagonales : un quadrillage, pas des
      // triangles.
      const pairs: number[] = []
      for (let row = 0; row <= rows; row += 1) {
        for (let col = 0; col <= cols; col += 1) {
          const index = row * (cols + 1) + col
          if (col < cols) pairs.push(index, index + 1)
          if (row < rows) pairs.push(index, index + cols + 1)
        }
      }

      const geometry = new three.BufferGeometry()
      const positionAttribute = new three.BufferAttribute(positions, 3)
      const colourAttribute = new three.BufferAttribute(colours, 3)
      positionAttribute.setUsage(three.DynamicDrawUsage)
      colourAttribute.setUsage(three.DynamicDrawUsage)
      geometry.setAttribute('position', positionAttribute)
      geometry.setAttribute('color', colourAttribute)
      geometry.setIndex(pairs)

      // Les couleurs viennent des sommets : c'est ce qui permet d'eclaircir
      // une crete sans un materiau par segment.
      const material = new three.LineBasicMaterial({
        vertexColors: true,
        transparent: true,
        opacity: 0.85,
        depthWrite: false,
      })

      const lines = new three.LineSegments(geometry, material)
      lines.name = 'relief'
      scene.scene.add(lines)

      relief.current = {
        columns: cols,
        rows,
        positions,
        colours,
        positionAttribute,
        colourAttribute,
        fog,
      }

      return () => {
        scene.scene.remove(lines)
        scene.scene.fog = null
        relief.current = null
      }
    },

    frame: (_, { time }) => {
      const nappe = relief.current
      if (nappe === null) return
      const { speed: rate, height: amplitude, valley: hollow } = settings.current
      const [, line, peak] = shades.current
      const lr = line?.[0] ?? 0
      const lg = line?.[1] ?? 0
      const lb = line?.[2] ?? 0
      const pr = peak?.[0] ?? 0
      const pg = peak?.[1] ?? 0
      const pb = peak?.[2] ?? 0

      // Le bruit est lu a une profondeur decalee du temps : les cretes
      // avancent, les sommets restent.
      const offset = time * rate
      const count = (nappe.columns + 1) * (nappe.rows + 1)
      const halfValley = hollow * 3

      for (let index = 0; index < count; index += 1) {
        const at = index * 3
        const x = nappe.positions[at] ?? 0
        const z = nappe.positions[at + 2] ?? 0
        const sx = x * SCALE
        const sz = (z - offset) * SCALE

        // Deux octaves : la seconde, deux fois plus fine et deux fois plus
        // faible, casse la rondeur de la premiere.
        let bump = noise(sx, sz) * 0.7 + noise(sx * 2 + 17, sz * 2 + 31) * 0.3

        // La vallee : plat au centre, plein sur les cotes.
        if (halfValley > 0) {
          const edge = Math.min(Math.max((Math.abs(x) - halfValley) / 2.5, 0), 1)
          bump *= edge * edge * (3 - 2 * edge)
        }

        const y = bump * amplitude
        nappe.positions[at + 1] = y

        const share = Math.min(Math.max(y / Math.max(amplitude, 0.001), 0), 1)
        nappe.colours[at] = lr + (pr - lr) * share
        nappe.colours[at + 1] = lg + (pg - lg) * share
        nappe.colours[at + 2] = lb + (pb - lb) * share
      }

      nappe.positionAttribute.needsUpdate = true
      nappe.colourAttribute.needsUpdate = true
    },
  })

  // Le theme a bascule : les tokens sont relus et les couleurs remplacees en
  // place. Les lignes lisent la ref a l'image suivante ; le fond et le
  // brouillard sont peints ici, parce qu'ils ne sont pas relus par image.
  useEffect(() => {
    const scene = context.current
    const nappe = relief.current
    if (scene === null || nappe === null || host === null) return
    shades.current = colors.map((token) => readTokenColour(token, host))
    const [bg] = shades.current
    const bgColour = new scene.three.Color(bg?.[0] ?? 0, bg?.[1] ?? 0, bg?.[2] ?? 0).convertSRGBToLinear()
    scene.renderer.setClearColor(bgColour, 1)
    nappe.fog.color.copy(bgColour)
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

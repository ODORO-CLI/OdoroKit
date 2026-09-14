/**
 * Blocs de ville : un damier de blocs vus en isometrie, qui s'elevent et
 * redescendent en cascade diagonale.
 *
 * ## Pourquoi une scene instanciee, et pas un shader
 *
 * Des boites eclairees, vues d'en haut en biais, avec leurs faces ombrees
 * et leurs occlusions : un shader de fragment devrait lancer un rayon par
 * pixel a travers le damier. Une scene le fait dans le pipeline, et une
 * seule geometrie instanciee suffit : quelques centaines de blocs se
 * dessinent en un appel, la boucle ne reecrit que leurs matrices — une
 * echelle et une position par bloc. C'est la technique la moins couteuse
 * des deux, et la seule qui donne des faces eclairees sans les simuler.
 *
 * ## La cascade
 *
 * La hauteur de chaque bloc suit un sinus du temps decale de la somme de
 * ses deux indices : la vague traverse le damier en diagonale, celle que
 * la camera isometrique regarde de face. Chaque bloc a en plus une hauteur
 * de base tiree une fois, sans quoi la vague se lirait comme une nappe
 * lisse et non comme une ville.
 *
 * La camera n'est pas orthographique — le moteur fournit une perspective —
 * mais placee haut et loin, sur la diagonale : l'effet isometrique tient a
 * l'angle, pas a la projection. L'ensemble pivote tres lentement.
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
export interface CityBlocksOwnProps {
  /** Blocs par cote du damier. @defaultValue 14 */
  size?: number
  /** Vitesse de la cascade. @defaultValue 0.6 */
  speed?: number
  /** Hauteur maximale des blocs, en unites de scene. @defaultValue 2.4 */
  height?: number
  /** Espace entre les blocs, en fraction de bloc. @defaultValue 0.25 */
  gap?: number
  /** Tokens : le fond, les blocs bas, les blocs hauts. */
  colors?: readonly [string, string, string]
  /** Classes du repli. */
  poster?: string
}

/** Toutes les proprietes. */
export type CityBlocksProps = Customisable<CityBlocksOwnProps>

/** Tokens employes par defaut. */
const DEFAULT_TOKENS = [
  '--o-theme-bg',
  '--o-palette-indigo-500',
  '--o-palette-sky-300',
] as const

/** Repli par defaut : une teinte figee, dans les memes tons. */
const DEFAULT_POSTER =
  'o-bg-gradient-to-br o-from-zinc-50 dark:o-from-zinc-950 o-to-indigo-100 dark:o-to-indigo-950'

/**
 * Blocs par cote en qualite basse.
 *
 * Le cout est dans les matrices reecrites par image, une par bloc ; le
 * nombre de blocs est le carre du cote.
 */
const LOW_SIZE = 10

type Three = SceneContext['three']
type InstancedMesh = InstanceType<Three['InstancedMesh']>
type Object3D = InstanceType<Three['Object3D']>
type Group = InstanceType<Three['Group']>
type Colour = InstanceType<Three['Color']>

/** Ce que la scene garde entre la construction et les images. */
interface City {
  readonly side: number
  readonly mesh: InstancedMesh
  /** Objet de travail dont la matrice est recopiee dans chaque instance. */
  readonly proxy: Object3D
  readonly group: Group
  readonly colour: Colour
}

/** Nombre pseudo-aleatoire deterministe : la ville est la meme a chaque montage. */
function hash(seed: number): number {
  const value = Math.sin(seed * 12.9898 + 78.233) * 43758.5453
  return value - Math.floor(value)
}

/**
 * Blocs de ville.
 *
 * @example
 * <div className="o-relative o-h-96 o-overflow-hidden o-rounded-xl">
 *   <CityBlocks className="o-absolute o-inset-0" />
 *   <div className="o-relative o-z-10">…</div>
 * </div>
 */
export function CityBlocks({
  size = 14,
  speed = 0.6,
  height = 2.4,
  gap = 0.25,
  colors = DEFAULT_TOKENS,
  poster = DEFAULT_POSTER,
  ...rest
}: CityBlocksProps): ReactElement {
  const { theme } = useMotionState()
  const [host, setHost] = useState<HTMLDivElement | null>(null)

  const city = useRef<City | null>(null)
  const context = useRef<SceneContext | null>(null)

  const settings = useRef({ speed, height, gap })
  settings.current = { speed, height, gap }

  /** Peint chaque bloc entre les deux teintes, selon un tirage stable. */
  const paint = (
    ville: City,
    low: ShaderColour | undefined,
    high: ShaderColour | undefined,
  ): void => {
    const count = ville.side * ville.side
    for (let index = 0; index < count; index += 1) {
      const share = hash(index + 0.5)
      ville.colour.setRGB(
        (low?.[0] ?? 0) + ((high?.[0] ?? 0) - (low?.[0] ?? 0)) * share,
        (low?.[1] ?? 0) + ((high?.[1] ?? 0) - (low?.[1] ?? 0)) * share,
        (low?.[2] ?? 0) + ((high?.[2] ?? 0) - (low?.[2] ?? 0)) * share,
      )
      ville.mesh.setColorAt(index, ville.colour)
    }
    if (ville.mesh.instanceColor !== null) ville.mesh.instanceColor.needsUpdate = true
  }

  const { ref, ready, refused } = useScene<HTMLDivElement>({
    name: 'blocs',
    setup: (scene: SceneContext) => {
      context.current = scene
      const { three, renderer, camera, quality } = scene

      const [bg, low, high] = colors.map((token) => readTokenColour(token, ref.current))

      // Le fond de la scene est le fond de la page. Le token est en sRGB et
      // le moteur encode sa couleur d'effacement du lineaire vers le sRGB :
      // sans la conversion inverse, le fond ressort un cran plus clair.
      renderer.setClearColor(
        new three.Color(bg?.[0] ?? 0, bg?.[1] ?? 0, bg?.[2] ?? 0).convertSRGBToLinear(),
        1,
      )

      const side = quality === 'low' ? Math.min(size, LOW_SIZE) : Math.max(size, 2)
      const count = side * side

      // La camera, haute et loin sur la diagonale : l'isometrie tient a
      // l'angle. La distance suit le cote, pour que le damier remplisse
      // le cadre quel que soit son nombre de blocs.
      const distance = side * 0.95
      camera.position.set(distance, distance * 0.8, distance)
      camera.lookAt(0, height * 0.25, 0)

      // Une boite dont la base est a l'origine : l'echelle en y ne fait que
      // l'elever, sans l'enfoncer dans le sol.
      const geometry = new three.BoxGeometry(1, 1, 1)
      geometry.translate(0, 0.5, 0)

      const material = new three.MeshLambertMaterial()
      const mesh = new three.InstancedMesh(geometry, material, count)
      mesh.instanceMatrix.setUsage(three.DynamicDrawUsage)

      // Deux lumieres sans couleur propre : une ambiante pour que l'ombre
      // ne soit pas noire, une directionnelle en biais pour que les trois
      // faces visibles aient trois valeurs.
      const ambient = new three.AmbientLight(undefined, 0.9)
      const sun = new three.DirectionalLight(undefined, 2.2)
      sun.position.set(3, 6, 2)

      const group = new three.Group()
      group.name = 'blocs'
      group.add(mesh)
      group.add(ambient)
      group.add(sun)
      scene.scene.add(group)

      const ville: City = {
        side,
        mesh,
        proxy: new three.Object3D(),
        group,
        colour: new three.Color(),
      }
      paint(ville, low, high)
      city.current = ville

      return () => {
        scene.scene.remove(group)
        city.current = null
      }
    },

    frame: (_, { time, delta }) => {
      const ville = city.current
      if (ville === null) return
      const { speed: rate, height: peak, gap: space } = settings.current
      const { side, mesh, proxy } = ville

      const pitch = 1 + Math.max(space, 0)
      const half = (side - 1) / 2
      const phase = time * rate * 2

      for (let ix = 0; ix < side; ix += 1) {
        for (let iz = 0; iz < side; iz += 1) {
          const index = ix * side + iz

          // Une hauteur de base propre au bloc, et la vague en diagonale.
          const base = 0.35 + hash(index + 0.5) * 0.65
          const wave = 0.5 + 0.5 * Math.sin(phase - (ix + iz) * 0.55)
          const tall = Math.max(peak * base * (0.2 + 0.8 * wave), 0.05)

          proxy.position.set((ix - half) * pitch, 0, (iz - half) * pitch)
          proxy.scale.set(1, tall, 1)
          proxy.updateMatrix()
          mesh.setMatrixAt(index, proxy.matrix)
        }
      }
      mesh.instanceMatrix.needsUpdate = true

      // L'ensemble pivote tres lentement : la vue isometrique ne se fige pas.
      ville.group.rotation.y += delta * 0.04
    },
  })

  // Le theme a bascule : les tokens sont relus et les couleurs repeintes en
  // place. La scene n'est pas reconstruite.
  useEffect(() => {
    const scene = context.current
    const ville = city.current
    if (scene === null || ville === null || host === null) return
    const [bg, low, high] = colors.map((token) => readTokenColour(token, host))
    paint(ville, low, high)
    scene.renderer.setClearColor(
      new scene.three.Color(
        bg?.[0] ?? 0,
        bg?.[1] ?? 0,
        bg?.[2] ?? 0,
      ).convertSRGBToLinear(),
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

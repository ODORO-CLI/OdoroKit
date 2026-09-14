/**
 * Cristal : un solide a facettes qui tourne, et feint de refracter.
 *
 * ## Pourquoi une scene, et pas un shader plein ecran
 *
 * Des facettes plates dont chacune prend sa couleur selon l'angle qu'elle
 * fait avec l'oeil, des aretes vives, une profondeur ou l'arriere se voit a
 * travers l'avant : c'est une affaire de geometrie, pas de fragment.
 *
 * ## La geometrie n'est pas un solide du catalogue
 *
 * Deux anneaux de sommets et deux pointes, aux rayons legerement inegaux :
 * un prisme a pointes, comme une pointe de quartz, dont aucune facette n'est
 * exactement pareille a sa voisine. Les triangles ne partagent aucun sommet,
 * pour que chaque facette garde sa normale plate — c'est ce qui la fait
 * facette.
 *
 * ## Ce que le pointeur fait
 *
 * Le cristal s'incline vers le curseur, avec amortissement, et les facettes
 * changent de teinte en changeant d'angle. Le reglage `parallax` dose cette
 * inclinaison ; a zero, seule la rotation reste.
 *
 * ## Le repli
 *
 * Pendant le chargement de la scene, sans WebGL, sous mouvement reduit, ou si
 * l'arbitre refuse une seconde scene, un degrade flou prend la place — dans
 * les memes tons, sans bord dur.
 *
 * @module
 */

import {
  mergePresentation,
  readTokenColour,
  useMotionState,
  useOnReady,
  type Customisable,
  type ReadyCallback,
  type ShaderColour,
} from '@odoro-cli/engine'
import { useScene, type SceneContext } from '@odoro-cli/engine/three'
import { useEffect, useRef, useState, type ReactElement } from 'react'

import { usePointerDamped } from '@registre/hooks/usePointerDamped'
import { usePoster } from '@registre/hooks/usePoster'

import { CRYSTAL_FRAGMENT, CRYSTAL_VERTEX } from './crystal.shader.js'

/** Ce que l'echappatoire recoit. */
export interface CrystalControls {
  /** Contexte de la scene : objets, camera, moteur de rendu, module. */
  readonly scene: SceneContext
  /** Uniformes vivants : les modifier change le rendu a l'image suivante. */
  readonly uniforms: Record<string, { value: unknown }>
}

/** Proprietes propres au composant. */
export interface CrystalOwnProps {
  /** Nombre de faces laterales. @defaultValue 6 */
  facets?: number
  /** Vitesse de rotation, en tours par minute. @defaultValue 3 */
  rpm?: number
  /** Separation des couleurs sur les aretes, entre zero et un. @defaultValue 0.6 */
  dispersion?: number
  /** Inclinaison vers le pointeur. @defaultValue 0.25 */
  parallax?: number
  /** Tokens : le fond, la teinte basse, la teinte haute et les reflets. */
  colors?: readonly [string, string, string]
  /** Classes du repli. */
  poster?: string
  /** Echappatoire. */
  onReady?: ReadyCallback<CrystalControls>
}

/** Toutes les proprietes. */
export type CrystalProps = Customisable<CrystalOwnProps>

/** Tokens employes par defaut. */
const DEFAULT_TOKENS = [
  '--o-theme-bg',
  '--o-palette-sky-300',
  '--o-palette-violet-400',
] as const

/** Repli par defaut : un eclat fige, dans les memes tons. */
const DEFAULT_POSTER =
  'o-bg-gradient-to-tr o-from-zinc-50 dark:o-from-zinc-950 o-via-sky-200 dark:o-via-sky-900 o-to-violet-300 dark:o-to-violet-900 o-blur-2xl o-scale-110'

/** Proportions du cristal : demi-hauteur du fut, hauteur des pointes, rayon. */
const SHAPE = { body: 0.75, tip: 1.5, radius: 0.62 } as const

/** Ce que la boucle manipule, construit une fois par montage. */
interface World {
  readonly group: InstanceType<SceneContext['three']['Group']>
}

/** Nombre pseudo-aleatoire d'un indice, stable d'un montage a l'autre. */
function hash(index: number): number {
  const x = Math.sin(index * 127.1 + 311.7) * 43758.5453123
  return x - Math.floor(x)
}

/**
 * Construit le prisme a pointes, en triangles independants.
 *
 * L'orientation de chaque triangle est verifiee contre son centre : un
 * triangle dont la normale regarde vers l'interieur est retourne. C'est plus
 * sur que de raisonner sur le sens de parcours des anneaux, et cela ne coute
 * qu'un produit vectoriel par face, une fois.
 */
// Le type de retour est laisse a l'inference : ecrit a la main depuis le
// module, il prend le parametre generique par defaut, que `Mesh` refuse.
function crystalGeometry(three: SceneContext['three'], sides: number) {
  const count = Math.max(3, Math.round(sides))
  const lower: [number, number, number][] = []
  const upper: [number, number, number][] = []
  for (let index = 0; index < count; index += 1) {
    const angle = (index / count) * Math.PI * 2
    // Des rayons inegaux : aucune facette n'est la copie de sa voisine.
    const low = SHAPE.radius * (0.82 + hash(index * 3 + 1) * 0.36)
    const high = SHAPE.radius * (0.82 + hash(index * 3 + 2) * 0.36)
    lower.push([Math.cos(angle) * low, -SHAPE.body, Math.sin(angle) * low])
    upper.push([
      Math.cos(angle) * high,
      SHAPE.body + (hash(index) - 0.5) * 0.2,
      Math.sin(angle) * high,
    ])
  }
  const bottom: [number, number, number] = [0, -SHAPE.tip, 0]
  const top: [number, number, number] = [0.06, SHAPE.tip, -0.04]

  const triangles: [number, number, number][][] = []
  for (let index = 0; index < count; index += 1) {
    const next = (index + 1) % count
    const l0 = lower[index] ?? bottom
    const l1 = lower[next] ?? bottom
    const u0 = upper[index] ?? top
    const u1 = upper[next] ?? top
    triangles.push([bottom, l0, l1])
    triangles.push([l0, u0, u1], [l0, u1, l1])
    triangles.push([top, u1, u0])
  }

  const positions = new Float32Array(triangles.length * 9)
  triangles.forEach((triangle, face) => {
    const [a, b, c] = triangle
    if (a === undefined || b === undefined || c === undefined) return
    const abx = b[0] - a[0]
    const aby = b[1] - a[1]
    const abz = b[2] - a[2]
    const acx = c[0] - a[0]
    const acy = c[1] - a[1]
    const acz = c[2] - a[2]
    const nx = aby * acz - abz * acy
    const ny = abz * acx - abx * acz
    const nz = abx * acy - aby * acx
    const cx = (a[0] + b[0] + c[0]) / 3
    const cy = (a[1] + b[1] + c[1]) / 3
    const cz = (a[2] + b[2] + c[2]) / 3
    const outward = nx * cx + ny * cy + nz * cz >= 0
    const ordered = outward ? [a, b, c] : [a, c, b]
    ordered.forEach((vertex, corner) => {
      positions.set(vertex, face * 9 + corner * 3)
    })
  })

  const geometry = new three.BufferGeometry()
  geometry.setAttribute('position', new three.BufferAttribute(positions, 3))
  geometry.computeVertexNormals()
  return geometry
}

/**
 * Cristal.
 *
 * @example
 * <div className="o-relative o-h-96 o-overflow-hidden o-rounded-xl">
 *   <Crystal className="o-absolute o-inset-0" facets={8} />
 *   <div className="o-relative o-z-10">…</div>
 * </div>
 */
export function Crystal({
  facets = 6,
  rpm = 3,
  dispersion = 0.6,
  parallax = 0.25,
  colors = DEFAULT_TOKENS,
  poster = DEFAULT_POSTER,
  onReady,
  ...rest
}: CrystalProps): ReactElement {
  const { theme } = useMotionState()
  const [host, setHost] = useState<HTMLDivElement | null>(null)

  const pointer = usePointerDamped({ host, speed: 2.5, name: 'crystal : pointeur' })

  const uniforms = useRef<Record<string, { value: unknown }>>({})
  const context = useRef<SceneContext | null>(null)
  const world = useRef<World | null>(null)

  // Les reglages sont lus par ref dans la boucle : un changement de curseur
  // dans l'atelier prend effet a l'image suivante sans reconstruire la scene.
  const settings = useRef({ rpm, dispersion, parallax })
  settings.current = { rpm, dispersion, parallax }

  const { ref, ready, refused } = useScene<HTMLDivElement>({
    name: 'crystal',
    setup: (scene) => {
      context.current = scene
      const { three, camera, renderer } = scene

      const paint = (value: ShaderColour): InstanceType<typeof three.Color> =>
        new three.Color(value[0], value[1], value[2])
      const [background, low, high] = colors.map((token) => readTokenColour(token, host))

      // Le fond est la couleur du theme. Le token est en sRGB et le moteur
      // encode sa couleur d'effacement du lineaire vers le sRGB : sans la
      // conversion inverse, le fond ressort un cran plus clair que la page.
      renderer.setClearColor(paint(background ?? [0, 0, 0]).convertSRGBToLinear(), 1)

      // Les deux passes partagent leurs couleurs : les memes objets, pour
      // qu'un changement de theme les repeigne toutes les deux d'un coup.
      const shared = {
        uColorA: { value: paint(low ?? [0, 0, 0]) },
        uColorB: { value: paint(high ?? [0, 0, 0]) },
        uDispersion: { value: dispersion },
      }
      uniforms.current = { ...shared, uBack: { value: 0 } }
      const backUniforms = { ...shared, uBack: { value: 1 } }

      const geometry = crystalGeometry(three, facets)
      const back = new three.ShaderMaterial({
        vertexShader: CRYSTAL_VERTEX,
        fragmentShader: CRYSTAL_FRAGMENT,
        uniforms: backUniforms,
        transparent: true,
        depthWrite: false,
        side: three.BackSide,
      })
      const front = new three.ShaderMaterial({
        vertexShader: CRYSTAL_VERTEX,
        fragmentShader: CRYSTAL_FRAGMENT,
        uniforms: uniforms.current,
        transparent: true,
        depthWrite: false,
        side: three.FrontSide,
      })

      // L'arriere d'abord, l'avant par-dessus : l'ordre de rendu le garantit,
      // le tri par distance ne le ferait pas pour deux maillages confondus.
      const inner = new three.Mesh(geometry, back)
      inner.renderOrder = 0
      const outer = new three.Mesh(geometry, front)
      outer.renderOrder = 1

      const group = new three.Group()
      group.name = 'crystal'
      group.add(inner, outer)
      scene.scene.add(group)

      camera.position.set(0, 0, 4.2)
      camera.lookAt(0, 0, 0)

      world.current = { group }

      return () => {
        scene.scene.remove(group)
        geometry.dispose()
        back.dispose()
        front.dispose()
        world.current = null
      }
    },

    frame: (_scene, { time, delta }) => {
      const live = world.current
      if (live === null) return
      const { rpm: turns, dispersion: split, parallax: lean } = settings.current
      const { group } = live

      // La rotation est exprimee en fonction du temps ecoule : le meme
      // reglage donne la meme vitesse a soixante comme a cent vingt images.
      group.rotation.y += (delta * turns * Math.PI * 2) / 60

      // Une precession lente, et l'inclinaison vers le pointeur par-dessus.
      const targetZ = Math.sin(time * 0.3) * 0.12 - pointer.current.x * lean
      const targetX = Math.cos(time * 0.23) * 0.08 + pointer.current.y * lean * 0.6
      group.rotation.z += (targetZ - group.rotation.z) * Math.min(1, delta * 2.5)
      group.rotation.x += (targetX - group.rotation.x) * Math.min(1, delta * 2.5)

      const uniform = uniforms.current['uDispersion']
      if (uniform !== undefined) uniform.value = split
    },
  })

  // Le theme a bascule : les tokens sont relus et les couleurs mises a jour
  // en place. La scene n'est pas reconstruite — seules ses couleurs changent.
  useEffect(() => {
    const scene = context.current
    const live = uniforms.current
    if (scene === null || live['uColorA'] === undefined) return
    const [background, low, high] = colors.map((token) => readTokenColour(token, host))
    const paint = (key: string, value: ShaderColour | undefined): void => {
      const uniform = live[key]
      if (uniform === undefined || value === undefined) return
      ;(uniform.value as { setRGB: (r: number, g: number, b: number) => unknown }).setRGB(
        value[0],
        value[1],
        value[2],
      )
    }
    paint('uColorA', low)
    paint('uColorB', high)
    if (background !== undefined) {
      scene.renderer.setClearColor(
        new scene.three.Color(
          background[0],
          background[1],
          background[2],
        ).convertSRGBToLinear(),
        1,
      )
    }
  }, [theme, colors, host])

  const pending = usePoster({ ready, refused })

  useOnReady(
    onReady,
    ready && context.current !== null
      ? { scene: context.current, uniforms: uniforms.current }
      : null,
    host,
  )

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

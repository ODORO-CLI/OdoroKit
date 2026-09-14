/**
 * Formes flottantes : des solides simples qui derivent, tournent sur eux-memes
 * et se decalent en parallaxe sous le pointeur.
 *
 * ## Pourquoi la parallaxe est repartie sur la profondeur
 *
 * Faire pivoter la scene entiere sous le pointeur donne un mouvement de
 * camera, pas une profondeur : tout se deplace du meme angle, et l'oeil n'en
 * tire aucune information. Ici chaque solide se decale d'une fraction qui
 * depend de sa distance a la camera — les proches beaucoup, les lointains a
 * peine. C'est le seul indice qui separe reellement les plans.
 *
 * ## Cinq geometries, deux materiaux, autant de solides qu'on veut
 *
 * Les geometries et les materiaux sont construits une fois et partages : un
 * solide de plus ne coute qu'un appel de dessin, pas une allocation. La
 * moitie des solides est en fil de fer, ce qui donne au groupe deux registres
 * au lieu d'un et evite la soupe de volumes pleins.
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
export interface FloatingShapesOwnProps {
  /** Nombre de solides. @defaultValue 18 */
  shapes?: number
  /** Vitesse de derive et de rotation. @defaultValue 1 */
  speed?: number
  /** Amplitude de la parallaxe sous le pointeur. @defaultValue 1 */
  parallax?: number
  /** Tokens : le fond, les solides pleins, les solides en fil de fer. */
  colors?: readonly [string, string, string]
  /** Classes du repli. */
  poster?: string
}

/** Toutes les proprietes. */
export type FloatingShapesProps = Customisable<FloatingShapesOwnProps>

/** Tokens employes par defaut. */
const DEFAULT_TOKENS = [
  '--o-theme-bg',
  '--o-palette-brand-500',
  '--o-palette-purple-400',
] as const

/** Repli par defaut : une teinte figee, dans les memes tons. */
const DEFAULT_POSTER =
  'o-bg-gradient-to-br o-from-zinc-50 dark:o-from-zinc-950 o-to-purple-100 dark:o-to-purple-950'

/** Nombre de solides en qualite basse. */
const LOW_SHAPES = 9

type Three = SceneContext['three']
type Object3D = InstanceType<Three['Object3D']>
type Group = InstanceType<Three['Group']>
type Material = InstanceType<Three['MeshLambertMaterial']>

/** Ce qu'un solide garde entre les images. */
interface Floater {
  readonly mesh: Object3D
  /** Position de repos, avant parallaxe. */
  readonly home: readonly [number, number, number]
  /** Vitesse de rotation propre, en radians par seconde. */
  readonly spin: readonly [number, number]
  /** Phase et amplitude du flottement vertical. */
  readonly bob: readonly [number, number]
  /** Part de parallaxe, deduite de la profondeur. */
  readonly depth: number
}

/** Ce que la scene garde entre la construction et les images. */
interface Floating {
  readonly group: Group
  readonly items: readonly Floater[]
  readonly solid: Material
  readonly wire: Material
}

/** Nombre pseudo-aleatoire deterministe : la composition est la meme a chaque montage. */
function hash(seed: number): number {
  const value = Math.sin(seed * 12.9898 + 78.233) * 43758.5453
  return value - Math.floor(value)
}

/**
 * Formes flottantes.
 *
 * @example
 * <div className="o-relative o-h-96 o-overflow-hidden o-rounded-xl">
 *   <FloatingShapes className="o-absolute o-inset-0" />
 *   <div className="o-relative o-z-10">…</div>
 * </div>
 */
export function FloatingShapes({
  shapes = 18,
  speed = 1,
  parallax = 1,
  colors = DEFAULT_TOKENS,
  poster = DEFAULT_POSTER,
  ...rest
}: FloatingShapesProps): ReactElement {
  const { theme } = useMotionState()
  const [host, setHost] = useState<HTMLDivElement | null>(null)

  const floating = useRef<Floating | null>(null)
  const context = useRef<SceneContext | null>(null)

  const settings = useRef({ speed, parallax })
  settings.current = { speed, parallax }

  const pointer = usePointerDamped({
    host,
    speed: 2.5,
    name: 'floating-shapes : pointeur',
  })

  const { ref, ready, refused } = useScene<HTMLDivElement>({
    name: 'formes-flottantes',
    setup: (scene: SceneContext) => {
      context.current = scene
      const { three, renderer, camera, quality } = scene

      const [bg, full, wired] = colors.map((token) => readTokenColour(token, ref.current))

      // Le fond de la scene est le fond de la page. Le token est en sRGB et
      // le moteur encode sa couleur d'effacement du lineaire vers le sRGB :
      // sans la conversion inverse, le fond ressort un cran plus clair.
      renderer.setClearColor(
        new three.Color(bg?.[0] ?? 0, bg?.[1] ?? 0, bg?.[2] ?? 0).convertSRGBToLinear(),
        1,
      )

      camera.position.set(0, 0, 6)
      camera.lookAt(0, 0, 0)

      const count = quality === 'low' ? Math.min(shapes, LOW_SHAPES) : Math.max(shapes, 1)

      // Les geometries sont construites une fois et partagees : un solide de
      // plus ne coute qu'un appel de dessin.
      const library = [
        new three.BoxGeometry(0.6, 0.6, 0.6),
        new three.TetrahedronGeometry(0.45),
        new three.OctahedronGeometry(0.42),
        new three.IcosahedronGeometry(0.4),
        new three.TorusGeometry(0.32, 0.11, 8, 20),
      ] as const

      const solid = new three.MeshLambertMaterial({ transparent: true, opacity: 0.9 })
      solid.color.setRGB(full?.[0] ?? 0, full?.[1] ?? 0, full?.[2] ?? 0)
      const wire = new three.MeshLambertMaterial({
        wireframe: true,
        transparent: true,
        opacity: 0.8,
      })
      wire.color.setRGB(wired?.[0] ?? 0, wired?.[1] ?? 0, wired?.[2] ?? 0)

      // Deux lumieres sans couleur propre : une ambiante pour que l'ombre ne
      // soit pas noire, une directionnelle pour que les faces se distinguent.
      const group = new three.Group()
      group.name = 'formes'
      group.add(new three.AmbientLight(undefined, 0.7))
      const sun = new three.DirectionalLight(undefined, 1.5)
      sun.position.set(2, 3, 4)
      group.add(sun)

      const items: Floater[] = []
      for (let index = 0; index < count; index += 1) {
        const geometry = library[index % library.length]
        if (geometry === undefined) continue

        const mesh = new three.Mesh(geometry, index % 2 === 0 ? solid : wire)

        // La profondeur est tiree d'abord : elle commande la taille apparente,
        // la part de parallaxe, et l'ecartement lateral.
        const depth = hash(index + 0.5)
        const z = -4.5 + depth * 5.5
        const spread = 4.2 - depth * 1.4
        const home = [
          (hash(index + 1.5) - 0.5) * 2 * spread,
          (hash(index + 2.5) - 0.5) * 2 * spread * 0.62,
          z,
        ] as const

        mesh.position.set(home[0], home[1], home[2])
        mesh.scale.setScalar(0.7 + depth * 0.8)

        items.push({
          mesh,
          home,
          spin: [
            (hash(index + 3.5) - 0.5) * 0.7,
            (hash(index + 4.5) - 0.5) * 0.7,
          ] as const,
          bob: [hash(index + 5.5) * 6.283, 0.1 + hash(index + 6.5) * 0.22] as const,
          // Un solide proche se decale beaucoup, un lointain a peine.
          depth,
        })
        group.add(mesh)
      }

      scene.scene.add(group)
      floating.current = { group, items, solid, wire }

      return () => {
        scene.scene.remove(group)
        floating.current = null
      }
    },

    frame: (_, { time, delta }) => {
      const live = floating.current
      if (live === null) return
      const { speed: rate, parallax: shift } = settings.current

      // Le pointeur, du repere du hook vers celui de la scene.
      const px = pointer.current.x
      const py = -pointer.current.y

      for (const item of live.items) {
        const { mesh, home, spin, bob, depth } = item

        mesh.rotation.x += (spin[0] ?? 0) * rate * delta
        mesh.rotation.y += (spin[1] ?? 0) * rate * delta

        // La parallaxe : la part depend de la profondeur, pas de l'objet.
        const share = (0.15 + depth * 0.85) * shift
        mesh.position.x = (home[0] ?? 0) + px * share * 0.7
        mesh.position.y =
          (home[1] ?? 0) +
          py * share * 0.45 +
          Math.sin(time * rate * 0.6 + (bob[0] ?? 0)) * (bob[1] ?? 0)
      }
    },
  })

  // Le theme a bascule : les tokens sont relus et les materiaux repeints en
  // place. La scene n'est pas reconstruite.
  useEffect(() => {
    const scene = context.current
    const live = floating.current
    if (scene === null || live === null || host === null) return
    const [bg, full, wired] = colors.map((token) => readTokenColour(token, host))
    const paint = (material: Material, tint: ShaderColour | undefined): void => {
      material.color.setRGB(tint?.[0] ?? 0, tint?.[1] ?? 0, tint?.[2] ?? 0)
    }
    paint(live.solid, full)
    paint(live.wire, wired)
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

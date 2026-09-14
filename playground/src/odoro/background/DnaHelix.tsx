/**
 * Double helice : deux brins de points opposes, relies par des barreaux, qui
 * tournent autour de leur axe.
 *
 * ## Pourquoi des points, et deux nuages plutot qu'un
 *
 * Un tube plein cacherait le brin de derriere et l'helice se lirait comme un
 * ruban. Des points laissent voir a travers, ce qui est la seule facon de
 * comprendre qu'il y a deux brins et non un. Et les deux nuages sont separes
 * pour que chacun porte sa couleur : un seul nuage a couleurs par sommet
 * couterait un attribut de plus pour la meme image.
 *
 * ## Le pas de l'helice
 *
 * Le rayon est fixe ; ce qui change avec le nombre de tours, c'est le pas —
 * la hauteur gagnee par tour. Peu de tours donnent un ressort etire, beaucoup
 * une torsade serree. Les barreaux relient les deux brins a la meme hauteur,
 * un point sur `n` : tous les relier ferait un mur.
 *
 * ## Ce que ce composant ne fait pas
 *
 * Il n'ouvre ni boucle d'animation, ni observateur : `useScene` les porte.
 * La geometrie est construite une fois — la rotation est celle du groupe, pas
 * une reecriture des sommets.
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
export interface DnaHelixOwnProps {
  /** Nombre de tours de l'helice sur toute sa hauteur. @defaultValue 4 */
  turns?: number
  /** Points par brin. Retrograde en qualite basse. @defaultValue 220 */
  points?: number
  /** Vitesse de rotation, en tours par minute. @defaultValue 3 */
  rpm?: number
  /** Un barreau tous les combien de points. Zero les supprime. @defaultValue 6 */
  rungs?: number
  /** Tokens : le fond, le premier brin, le second brin. */
  colors?: readonly [string, string, string]
  /** Classes du repli. */
  poster?: string
}

/** Toutes les proprietes. */
export type DnaHelixProps = Customisable<DnaHelixOwnProps>

/** Tokens employes par defaut. */
const DEFAULT_TOKENS = [
  '--o-theme-bg',
  '--o-palette-sky-400',
  '--o-palette-rose-400',
] as const

/** Repli par defaut : une teinte figee, dans les memes tons. */
const DEFAULT_POSTER =
  'o-bg-gradient-to-b o-from-zinc-50 dark:o-from-zinc-950 o-via-sky-100 dark:o-via-sky-950 o-to-rose-100 dark:o-to-rose-950'

/** Points par brin en qualite basse. */
const LOW_POINTS = 90

/** Rayon de l'helice, en unites de scene. */
const RADIUS = 0.95

/** Hauteur de l'helice, en unites de scene. */
const HEIGHT = 3.0

type Three = SceneContext['three']
type Group = InstanceType<Three['Group']>
type PointsMaterial = InstanceType<Three['PointsMaterial']>
type LineMaterial = InstanceType<Three['LineBasicMaterial']>

/** Ce que la scene garde entre la construction et les images. */
interface Helix {
  readonly group: Group
  readonly first: PointsMaterial
  readonly second: PointsMaterial
  readonly bars: LineMaterial
  /** Vitesse angulaire, en radians par seconde. */
  readonly rate: number
}

/** Moyenne de deux teintes, employee pour les barreaux. */
function blend(
  one: ShaderColour | undefined,
  other: ShaderColour | undefined,
): ShaderColour {
  return [
    ((one?.[0] ?? 0) + (other?.[0] ?? 0)) / 2,
    ((one?.[1] ?? 0) + (other?.[1] ?? 0)) / 2,
    ((one?.[2] ?? 0) + (other?.[2] ?? 0)) / 2,
  ]
}

/**
 * Double helice.
 *
 * @example
 * <div className="o-relative o-h-96 o-overflow-hidden o-rounded-xl">
 *   <DnaHelix className="o-absolute o-inset-0" />
 *   <div className="o-relative o-z-10">…</div>
 * </div>
 */
export function DnaHelix({
  turns = 4,
  points = 220,
  rpm = 3,
  rungs = 6,
  colors = DEFAULT_TOKENS,
  poster = DEFAULT_POSTER,
  ...rest
}: DnaHelixProps): ReactElement {
  const { theme } = useMotionState()
  const [host, setHost] = useState<HTMLDivElement | null>(null)

  const helix = useRef<Helix | null>(null)
  const context = useRef<SceneContext | null>(null)

  const { ref, ready, refused } = useScene<HTMLDivElement>({
    name: 'double-helice',
    setup: (scene: SceneContext) => {
      context.current = scene
      const { three, renderer, camera, quality } = scene

      const [bg, one, other] = colors.map((token) => readTokenColour(token, ref.current))

      // Le fond de la scene est le fond de la page. Le token est en sRGB et
      // le moteur encode sa couleur d'effacement du lineaire vers le sRGB :
      // sans la conversion inverse, le fond ressort un cran plus clair.
      renderer.setClearColor(
        new three.Color(bg?.[0] ?? 0, bg?.[1] ?? 0, bg?.[2] ?? 0).convertSRGBToLinear(),
        1,
      )

      camera.position.set(0, 0, 4.2)
      camera.lookAt(0, 0, 0)

      const count =
        quality === 'low' ? Math.min(points, LOW_POINTS) : Math.max(points, 12)
      const spin = Math.max(turns, 0.25) * Math.PI * 2

      const firstPositions = new Float32Array(count * 3)
      const secondPositions = new Float32Array(count * 3)
      const barPositions: number[] = []
      const gap = Math.max(Math.round(rungs), 0)

      for (let index = 0; index < count; index += 1) {
        const share = index / Math.max(count - 1, 1)
        const angle = share * spin
        const y = (share - 0.5) * HEIGHT

        const ax = Math.cos(angle) * RADIUS
        const az = Math.sin(angle) * RADIUS
        firstPositions[index * 3] = ax
        firstPositions[index * 3 + 1] = y
        firstPositions[index * 3 + 2] = az

        // Le second brin est le premier tourne d'un demi-tour : c'est ce qui
        // fait une double helice plutot que deux helices independantes.
        secondPositions[index * 3] = -ax
        secondPositions[index * 3 + 1] = y
        secondPositions[index * 3 + 2] = -az

        if (gap > 0 && index % gap === 0) {
          barPositions.push(ax, y, az, -ax, y, -az)
        }
      }

      const makeCloud = (
        data: Float32Array,
        tint: ShaderColour | undefined,
      ): { material: PointsMaterial; cloud: InstanceType<Three['Points']> } => {
        const geometry = new three.BufferGeometry()
        geometry.setAttribute('position', new three.BufferAttribute(data, 3))
        const material = new three.PointsMaterial({
          size: 0.09,
          transparent: true,
          opacity: 0.95,
          depthWrite: false,
        })
        material.color.setRGB(tint?.[0] ?? 0, tint?.[1] ?? 0, tint?.[2] ?? 0)
        return { material, cloud: new three.Points(geometry, material) }
      }

      const first = makeCloud(firstPositions, one)
      const second = makeCloud(secondPositions, other)

      const barGeometry = new three.BufferGeometry()
      barGeometry.setAttribute(
        'position',
        new three.BufferAttribute(new Float32Array(barPositions), 3),
      )
      const bars = new three.LineBasicMaterial({ transparent: true, opacity: 0.35 })
      const mixed = blend(one, other)
      bars.color.setRGB(mixed[0], mixed[1], mixed[2])

      const group = new three.Group()
      group.name = 'helice'
      group.add(first.cloud)
      group.add(second.cloud)
      group.add(new three.LineSegments(barGeometry, bars))
      // L'axe est legerement incline : parfaitement vertical, la rotation ne
      // se lirait qu'aux barreaux.
      group.rotation.z = 0.18
      scene.scene.add(group)

      helix.current = {
        group,
        first: first.material,
        second: second.material,
        bars,
        rate: (rpm * Math.PI * 2) / 60,
      }

      return () => {
        scene.scene.remove(group)
        helix.current = null
      }
    },

    frame: (_, { time, delta }) => {
      const live = helix.current
      if (live === null) return
      // La rotation est exprimee en fonction du temps ecoule : le meme
      // reglage donne la meme vitesse apparente a toute cadence.
      live.group.rotation.y += live.rate * delta
      live.group.rotation.z = 0.18 + Math.sin(time * 0.25) * 0.06
    },
  })

  // Le theme a bascule : les tokens sont relus et les materiaux repeints en
  // place. La scene n'est pas reconstruite.
  useEffect(() => {
    const scene = context.current
    const live = helix.current
    if (scene === null || live === null || host === null) return
    const [bg, one, other] = colors.map((token) => readTokenColour(token, host))
    live.first.color.setRGB(one?.[0] ?? 0, one?.[1] ?? 0, one?.[2] ?? 0)
    live.second.color.setRGB(other?.[0] ?? 0, other?.[1] ?? 0, other?.[2] ?? 0)
    const mixed = blend(one, other)
    live.bars.color.setRGB(mixed[0], mixed[1], mixed[2])
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

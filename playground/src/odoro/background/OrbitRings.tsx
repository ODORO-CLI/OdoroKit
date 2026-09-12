/**
 * Anneaux orbitaux : des anneaux de points en orbite inclinee autour d'un
 * centre vide.
 *
 * ## Pourquoi des points instancies, et pas un shader
 *
 * Les positions sont analytiques — un cercle, une inclinaison, une rotation
 * — et rien ne depend de l'image precedente. Un shader de fragment pourrait
 * les resoudre, mais il devrait, pour chaque pixel, projeter des anneaux en
 * trois dimensions et trier leur profondeur. Un nuage de points par anneau
 * fait ce travail dans le pipeline : la geometrie est construite une fois, et
 * la boucle ne touche que des rotations — trois nombres par anneau, aucun
 * attribut reecrit. C'est la technique la plus simple qui tienne la cadence,
 * et la moins couteuse des deux.
 *
 * ## La composition
 *
 * Chaque anneau a son rayon, son inclinaison et son sens de rotation, en
 * alternance : deux anneaux voisins tournent en sens contraire, sans quoi
 * l'ensemble se lirait comme un seul disque. Le centre reste vide — c'est ce
 * qui le distingue d'une sphere ceinte d'anneaux — et l'ensemble precesse
 * lentement pour que les anneaux se croisent.
 *
 * ## Ce que ce composant ne fait pas
 *
 * Il n'ouvre ni boucle d'animation, ni observateur : `useScene` les porte. Il
 * n'ecrit aucune couleur : le fond et les anneaux sont lus dans les tokens,
 * et repeints en place quand le theme bascule.
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

import { usePoster } from '@/odoro/hooks/usePoster'

/** Proprietes propres au composant. */
export interface OrbitRingsOwnProps {
  /** Nombre d'anneaux. @defaultValue 5 */
  rings?: number
  /** Points par anneau. @defaultValue 320 */
  points?: number
  /** Vitesse de rotation du premier anneau, en tours par minute. @defaultValue 3 */
  rpm?: number
  /** Inclinaison de base des anneaux, en radians. @defaultValue 0.6 */
  tilt?: number
  /** Tokens : le fond, l'anneau interieur, l'anneau exterieur. */
  colors?: readonly [string, string, string]
  /** Classes du repli. */
  poster?: string
}

/** Toutes les proprietes. */
export type OrbitRingsProps = Customisable<OrbitRingsOwnProps>

/** Tokens employes par defaut. */
const DEFAULT_TOKENS = [
  '--o-theme-bg',
  '--o-palette-brand-500',
  '--o-palette-fuchsia-400',
] as const

/** Repli par defaut : un halo fige, dans les memes tons. */
const DEFAULT_POSTER =
  'o-bg-gradient-to-br o-from-zinc-50 dark:o-from-zinc-950 o-via-brand-100 dark:o-via-brand-950 o-to-zinc-50 dark:o-to-zinc-950'

/**
 * Points par anneau en qualite basse.
 *
 * Chaque point est un sommet : le cout croit lineairement avec leur nombre,
 * et c'est le seul levier qui compte ici.
 */
const LOW_POINTS = 140

type Three = SceneContext['three']
type Group = InstanceType<Three['Group']>
type PointsObject = InstanceType<Three['Points']>
type PointsMaterial = InstanceType<Three['PointsMaterial']>

/** Un anneau vivant : ce qui tourne, et a quelle cadence. */
interface Orbit {
  readonly ring: PointsObject
  readonly material: PointsMaterial
  /** Vitesse angulaire, en radians par seconde, signee. */
  readonly rate: number
  /** Part du chemin entre l'anneau interieur et l'exterieur, pour la teinte. */
  readonly mix: number
}

/**
 * Anneaux orbitaux.
 *
 * @example
 * <div className="o-relative o-h-96 o-overflow-hidden">
 *   <OrbitRings className="o-absolute o-inset-0" />
 *   <div className="o-relative">…</div>
 * </div>
 */
export function OrbitRings({
  rings = 5,
  points = 320,
  rpm = 3,
  tilt = 0.6,
  colors = DEFAULT_TOKENS,
  poster = DEFAULT_POSTER,
  ...rest
}: OrbitRingsProps): ReactElement {
  const { theme } = useMotionState()
  const [host, setHost] = useState<HTMLElement | null>(null)

  const orbits = useRef<Orbit[]>([])
  const cluster = useRef<Group | null>(null)
  const context = useRef<SceneContext | null>(null)

  const { ref, ready, refused } = useScene({
    name: 'anneaux-orbitaux',
    setup: (scene) => {
      context.current = scene
      const { three, renderer, camera, quality } = scene

      const [bg, inner, outer] = colors.map((token) => readTokenColour(token, host))
      const bgColour = new three.Color(bg?.[0] ?? 0, bg?.[1] ?? 0, bg?.[2] ?? 0)
      renderer.setClearColor(bgColour.convertSRGBToLinear(), 1)

      // La camera est un peu au-dessus du plan : vus de face, des anneaux
      // inclines ne seraient que des ellipses plates.
      camera.position.set(0, 1.4, 5.4)
      camera.lookAt(0, 0, 0)

      const perRing = quality === 'low' ? Math.min(points, LOW_POINTS) : points
      const total = Math.max(rings, 1)

      const group = new three.Group()
      group.name = 'anneaux'
      cluster.current = group
      orbits.current = []

      for (let index = 0; index < total; index += 1) {
        const radius = 1.1 + index * 0.32
        const share = total === 1 ? 0 : index / (total - 1)

        // Un cercle dans le plan XZ, epaissi d'un leger bruit : un anneau de
        // poussiere, pas un trait.
        const positions = new Float32Array(perRing * 3)
        for (let p = 0; p < perRing; p += 1) {
          const angle = (p / perRing) * Math.PI * 2
          const wobble = radius + (Math.random() - 0.5) * 0.05
          positions[p * 3] = Math.cos(angle) * wobble
          positions[p * 3 + 1] = (Math.random() - 0.5) * 0.03
          positions[p * 3 + 2] = Math.sin(angle) * wobble
        }
        const geometry = new three.BufferGeometry()
        geometry.setAttribute('position', new three.BufferAttribute(positions, 3))

        const material = new three.PointsMaterial({
          size: 0.022,
          transparent: true,
          opacity: 0.9,
          depthWrite: false,
        })
        const r = (inner?.[0] ?? 0) + ((outer?.[0] ?? 0) - (inner?.[0] ?? 0)) * share
        const g = (inner?.[1] ?? 0) + ((outer?.[1] ?? 0) - (inner?.[1] ?? 0)) * share
        const b = (inner?.[2] ?? 0) + ((outer?.[2] ?? 0) - (inner?.[2] ?? 0)) * share
        material.color.setRGB(r, g, b)

        const ring = new three.Points(geometry, material)

        // Le pivot porte l'inclinaison ; l'anneau tourne dans son propre plan.
        // Separer les deux evite de composer des rotations a chaque image.
        const pivot = new three.Group()
        pivot.rotation.x = tilt + index * 0.22 * (index % 2 === 0 ? 1 : -1)
        pivot.rotation.z = index * 0.45
        pivot.add(ring)
        group.add(pivot)

        // Sens alterne, et les anneaux exterieurs plus lents : comme des
        // orbites reelles.
        const direction = index % 2 === 0 ? 1 : -1
        const rate = ((rpm * Math.PI * 2) / 60) * direction * (1 - share * 0.5)
        orbits.current.push({ ring, material, rate, mix: share })
      }

      scene.scene.add(group)

      return () => {
        scene.scene.remove(group)
        orbits.current = []
        cluster.current = null
      }
    },

    frame: (_, { time, delta }) => {
      // Chaque anneau tourne dans son plan ; l'ensemble precesse lentement.
      for (const orbit of orbits.current) {
        orbit.ring.rotation.y += orbit.rate * delta
      }
      const group = cluster.current
      if (group === null) return
      group.rotation.y += delta * 0.05
      group.rotation.x = Math.sin(time * 0.1) * 0.1
    },
  })

  // Le theme a bascule : les tokens sont relus et les couleurs repeintes en
  // place. La scene n'est pas reconstruite.
  useEffect(() => {
    const scene = context.current
    if (scene === null || orbits.current.length === 0) return
    const [bg, inner, outer] = colors.map((token) => readTokenColour(token, host))
    if (inner !== undefined && outer !== undefined) {
      for (const orbit of orbits.current) {
        orbit.material.color.setRGB(
          inner[0] + (outer[0] - inner[0]) * orbit.mix,
          inner[1] + (outer[1] - inner[1]) * orbit.mix,
          inner[2] + (outer[2] - inner[2]) * orbit.mix,
        )
      }
    }
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

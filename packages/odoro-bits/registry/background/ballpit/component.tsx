/**
 * Piscine a balles : des balles qui tombent, rebondissent et fuient le
 * pointeur.
 *
 * ## Pourquoi une scene, et pas un shader plein ecran
 *
 * Des spheres eclairees qui se chevauchent, avec une ombre propre et un
 * reflet chacune, sont ce qu'un fragment plein ecran fait le plus mal : il
 * faudrait sommer toutes les balles a chaque pixel. Une geometrie instanciee
 * les dessine toutes en un seul appel, et la lumiere est gratuite.
 *
 * ## La physique est simple, et bornee
 *
 * Pesanteur, chocs contre le cadre, chocs par paires avec une correction de
 * position et une impulsion elastique amortie. Les paires sont testees en
 * n2 : avec cent soixante balles au plus, c'est moins de treize mille tests
 * par image, bien en dessous de ce qu'une grille d'acceleration meriterait.
 * Le pas de temps est plafonne : une image longue — un onglet qui revient —
 * ne catapulte pas les balles hors du cadre.
 *
 * La pesanteur penche lentement d'un cote puis de l'autre. Sans cela le tas
 * se fige en quelques secondes, et un fond fige est un fond mort.
 *
 * ## Le cadre suit la surface
 *
 * Les parois sont deduites de la camera a chaque image : la demi-hauteur
 * visible a la profondeur des balles, fois le rapport de la surface. Un
 * redimensionnement deplace donc les parois, et les balles s'y rangent a
 * l'image suivante.
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

/** Ce que l'echappatoire recoit. */
export interface BallpitControls {
  /** Contexte de la scene : objets, camera, moteur de rendu, module. */
  readonly scene: SceneContext
  /** Positions vivantes, trois flottants par balle. */
  readonly positions: Float32Array
  /** Vitesses vivantes, trois flottants par balle. */
  readonly velocities: Float32Array
}

/** Proprietes propres au composant. */
export interface BallpitOwnProps {
  /** Nombre de balles. @defaultValue 80 */
  count?: number
  /** Rayon moyen d'une balle, en unites de scene. @defaultValue 0.32 */
  size?: number
  /** Pesanteur. @defaultValue 6 */
  gravity?: number
  /** Restitution des chocs. @defaultValue 0.55 */
  bounce?: number
  /** Force avec laquelle le pointeur repousse les balles. @defaultValue 8 */
  push?: number
  /** Tokens des balles, distribues a tour de role. */
  colors?: readonly [string, string, string]
  /** Classes du repli. */
  poster?: string
  /** Echappatoire. */
  onReady?: ReadyCallback<BallpitControls>
}

/** Toutes les proprietes. */
export type BallpitProps = Customisable<BallpitOwnProps>

/** Tokens employes par defaut pour les balles. */
const DEFAULT_TOKENS = [
  '--o-palette-brand-500',
  '--o-palette-fuchsia-500',
  '--o-palette-sky-400',
] as const

/** Le fond de la scene suit toujours le theme. */
const BACKGROUND_TOKEN = '--o-theme-bg'

/** Repli par defaut : des taches floues, dans les memes tons. */
const DEFAULT_POSTER =
  'o-bg-gradient-to-tr o-from-brand-300 dark:o-from-brand-900 o-via-zinc-50 dark:o-via-zinc-950 o-to-sky-300 dark:o-to-sky-900 o-blur-2xl o-scale-110'

/**
 * Plafond du nombre de balles.
 *
 * Il borne les tests par paires : au-dela, le n2 cesserait d'etre
 * negligeable et il faudrait une grille. Le maillage instancie est alloue a
 * cette taille une fois pour toutes.
 */
const MAX_BALLS = 160

/** Nombre de balles en qualite basse. */
const LOW_BALLS = 32

/** Profondeur de la piscine, de part et d'autre du plan des balles. */
const DEPTH = 0.5

/** Distance de la camera au plan des balles. */
const CAMERA_DISTANCE = 6

/** Pas de temps maximal : une image longue ne catapulte rien. */
const MAX_STEP = 1 / 30

/** Portee de la poussee du pointeur, en unites de scene. */
const PUSH_REACH = 1.6

/** Ce que la boucle manipule, construit une fois par montage. */
interface World {
  readonly mesh: InstanceType<SceneContext['three']['InstancedMesh']>
  readonly positions: Float32Array
  readonly velocities: Float32Array
  readonly radii: Float32Array
  readonly count: number
}

/** Lecture bornee d'un tableau type : jamais `undefined`, jamais de garde. */
function at(array: Float32Array, index: number): number {
  return array[index] ?? 0
}

/** Nombre pseudo-aleatoire d'un indice, stable d'un montage a l'autre. */
function hash(index: number): number {
  const x = Math.sin(index * 127.1 + 311.7) * 43758.5453123
  return x - Math.floor(x)
}

/**
 * Piscine a balles.
 *
 * @example
 * <div className="o-relative o-h-96 o-overflow-hidden o-rounded-xl">
 *   <Ballpit className="o-absolute o-inset-0" />
 *   <div className="o-relative o-z-10">…</div>
 * </div>
 */
export function Ballpit({
  count = 80,
  size = 0.32,
  gravity = 6,
  bounce = 0.55,
  push = 8,
  colors = DEFAULT_TOKENS,
  poster = DEFAULT_POSTER,
  onReady,
  ...rest
}: BallpitProps): ReactElement {
  const { theme } = useMotionState()
  const [host, setHost] = useState<HTMLDivElement | null>(null)

  // Un rattrapage sec : la main qui ecarte les balles n'a pas d'inertie.
  const pointer = usePointerDamped({ host, speed: 6, name: 'ballpit : pointeur' })

  const world = useRef<World | null>(null)
  const context = useRef<SceneContext | null>(null)

  // Le hook ramene le pointeur au centre quand il quitte le cadre : sans ce
  // drapeau, la poussee creuserait un trou permanent au milieu du tas.
  const inside = useRef(false)

  useEffect(() => {
    if (host === null) return
    const onEnter = (): void => {
      inside.current = true
    }
    const onLeave = (): void => {
      inside.current = false
    }
    host.addEventListener('pointerenter', onEnter, { passive: true })
    host.addEventListener('pointerleave', onLeave, { passive: true })
    return () => {
      host.removeEventListener('pointerenter', onEnter)
      host.removeEventListener('pointerleave', onLeave)
    }
  }, [host])

  // Les reglages sont lus par ref dans la boucle : un changement de curseur
  // dans l'atelier prend effet a l'image suivante sans reconstruire la scene.
  const settings = useRef({ gravity, bounce, push })
  settings.current = { gravity, bounce, push }

  const { ref, ready, refused } = useScene<HTMLDivElement>({
    name: 'ballpit',
    setup: (scene) => {
      context.current = scene
      const { three, camera, renderer, quality } = scene

      const total = Math.min(quality === 'low' ? Math.min(count, LOW_BALLS) : count, MAX_BALLS)

      camera.position.set(0, 0, CAMERA_DISTANCE)
      camera.lookAt(0, 0, 0)

      // Le fond est la couleur du theme. Le token est en sRGB et le moteur
      // encode sa couleur d'effacement du lineaire vers le sRGB : sans la
      // conversion inverse, le fond ressort un cran plus clair que la page.
      const paint = (value: ShaderColour): InstanceType<typeof three.Color> =>
        new three.Color().setRGB(value[0], value[1], value[2], three.SRGBColorSpace)
      renderer.setClearColor(paint(readTokenColour(BACKGROUND_TOKEN, host)), 1)

      const geometry = new three.SphereGeometry(1, 24, 16)
      const material = new three.MeshStandardMaterial({ roughness: 0.38, metalness: 0.05 })
      const mesh = new three.InstancedMesh(geometry, material, MAX_BALLS)
      mesh.count = total
      mesh.name = 'ballpit'

      const positions = new Float32Array(MAX_BALLS * 3)
      const velocities = new Float32Array(MAX_BALLS * 3)
      const radii = new Float32Array(MAX_BALLS)

      const tints = colors.map((token) => paint(readTokenColour(token, host)))
      const dummy = new three.Object3D()

      for (let index = 0; index < total; index += 1) {
        // Les balles naissent au-dessus du cadre, etagees, pour tomber en
        // pluie plutot que d'apparaitre empilees.
        const radius = size * (0.7 + 0.6 * hash(index * 3 + 1))
        radii[index] = radius
        positions[index * 3] = (hash(index * 3 + 2) - 0.5) * 6
        positions[index * 3 + 1] = 3 + hash(index * 3 + 3) * 8
        positions[index * 3 + 2] = (hash(index * 3 + 4) - 0.5) * DEPTH

        dummy.position.set(at(positions, index * 3), at(positions, index * 3 + 1), at(positions, index * 3 + 2))
        dummy.scale.setScalar(radius)
        dummy.updateMatrix()
        mesh.setMatrixAt(index, dummy.matrix)
        mesh.setColorAt(index, tints[index % tints.length] ?? tints[0] ?? new three.Color())
      }
      mesh.instanceMatrix.needsUpdate = true
      if (mesh.instanceColor !== null) mesh.instanceColor.needsUpdate = true

      // Une lumiere principale, une de remplissage, une ambiance : de quoi
      // donner un volume aux spheres sans ombre portee.
      const key = new three.DirectionalLight()
      key.intensity = 2.4
      key.position.set(3, 5, 4)
      const fill = new three.DirectionalLight()
      fill.intensity = 0.7
      fill.position.set(-4, -2, 3)
      const ambient = new three.AmbientLight()
      ambient.intensity = 0.9

      const group = new three.Group()
      group.name = 'ballpit-groupe'
      group.add(mesh, key, fill, ambient)
      scene.scene.add(group)

      world.current = { mesh, positions, velocities, radii, count: total }

      return () => {
        scene.scene.remove(group)
        geometry.dispose()
        material.dispose()
        mesh.dispose()
        world.current = null
      }
    },

    frame: ({ camera, three }, { time, delta }) => {
      const live = world.current
      if (live === null) return
      const { positions, velocities, radii, count: total, mesh } = live
      const { gravity: g, bounce: restitution, push: force } = settings.current

      // Les parois : la demi-hauteur visible a la profondeur des balles,
      // fois le rapport de la surface. Lues a chaque image, elles suivent le
      // redimensionnement.
      const halfHeight = Math.tan((camera.fov * Math.PI) / 360) * CAMERA_DISTANCE
      const halfWidth = halfHeight * camera.aspect

      // La pesanteur penche lentement : le tas ne se fige jamais tout a fait.
      const gx = Math.sin(time * 0.25) * g * 0.12
      const gy = -g

      // Le pointeur, du repere du hook vers celui de la scene.
      const px = pointer.current.x * halfWidth
      const py = -pointer.current.y * halfHeight

      const dt = Math.min(delta, MAX_STEP)
      const drag = 1 - 0.08 * dt

      for (let index = 0; index < total; index += 1) {
        const base = index * 3
        let vx = at(velocities, base) + gx * dt
        let vy = at(velocities, base + 1) + gy * dt
        let vz = at(velocities, base + 2)

        // La poussee : une force qui decroit lineairement avec la distance au
        // pointeur, nulle au-dela de sa portee.
        const dx = at(positions, base) - px
        const dy = at(positions, base + 1) - py
        const distance = Math.hypot(dx, dy)
        if (inside.current && force > 0 && distance < PUSH_REACH && distance > 0.0001) {
          const weight = (1 - distance / PUSH_REACH) * force * dt
          vx += (dx / distance) * weight
          vy += (dy / distance) * weight
        }

        vx *= drag
        vy *= drag
        vz *= drag

        let x = at(positions, base) + vx * dt
        let y = at(positions, base + 1) + vy * dt
        let z = at(positions, base + 2) + vz * dt
        const radius = at(radii, index)

        // Les parois : la position est ramenee dans le cadre, et la vitesse
        // normale s'inverse, amortie par la restitution.
        if (x < -halfWidth + radius) {
          x = -halfWidth + radius
          vx = Math.abs(vx) * restitution
        } else if (x > halfWidth - radius) {
          x = halfWidth - radius
          vx = -Math.abs(vx) * restitution
        }
        if (y < -halfHeight + radius) {
          y = -halfHeight + radius
          vy = Math.abs(vy) * restitution
        } else if (y > halfHeight + 10) {
          // Rien ne retient les balles par le haut, sauf une limite lointaine
          // qui empeche une derive infinie si la pesanteur est nulle.
          y = halfHeight + 10
          vy = 0
        }
        if (z < -DEPTH + radius * 0.5) {
          z = -DEPTH + radius * 0.5
          vz = Math.abs(vz) * restitution
        } else if (z > DEPTH - radius * 0.5) {
          z = DEPTH - radius * 0.5
          vz = -Math.abs(vz) * restitution
        }

        positions[base] = x
        positions[base + 1] = y
        positions[base + 2] = z
        velocities[base] = vx
        velocities[base + 1] = vy
        velocities[base + 2] = vz
      }

      // Les chocs par paires : correction de position, puis impulsion le
      // long de la normale si les balles se rapprochent. La masse suit le
      // cube du rayon, pour qu'une grosse balle ecarte les petites.
      for (let i = 0; i < total; i += 1) {
        const bi = i * 3
        const ri = at(radii, i)
        for (let j = i + 1; j < total; j += 1) {
          const bj = j * 3
          const rj = at(radii, j)
          const dx = at(positions, bj) - at(positions, bi)
          const dy = at(positions, bj + 1) - at(positions, bi + 1)
          const dz = at(positions, bj + 2) - at(positions, bi + 2)
          const minimum = ri + rj
          const squared = dx * dx + dy * dy + dz * dz
          if (squared >= minimum * minimum || squared < 0.000001) continue

          const distance = Math.sqrt(squared)
          const nx = dx / distance
          const ny = dy / distance
          const nz = dz / distance
          const overlap = minimum - distance

          const mi = ri * ri * ri
          const mj = rj * rj * rj
          const share = mj / (mi + mj)

          positions[bi] = at(positions, bi) - nx * overlap * share
          positions[bi + 1] = at(positions, bi + 1) - ny * overlap * share
          positions[bi + 2] = at(positions, bi + 2) - nz * overlap * share
          positions[bj] = at(positions, bj) + nx * overlap * (1 - share)
          positions[bj + 1] = at(positions, bj + 1) + ny * overlap * (1 - share)
          positions[bj + 2] = at(positions, bj + 2) + nz * overlap * (1 - share)

          const rvx = at(velocities, bj) - at(velocities, bi)
          const rvy = at(velocities, bj + 1) - at(velocities, bi + 1)
          const rvz = at(velocities, bj + 2) - at(velocities, bi + 2)
          const closing = rvx * nx + rvy * ny + rvz * nz
          if (closing >= 0) continue

          const impulse = (-(1 + restitution) * closing) / (1 / mi + 1 / mj)
          velocities[bi] = at(velocities, bi) - (nx * impulse) / mi
          velocities[bi + 1] = at(velocities, bi + 1) - (ny * impulse) / mi
          velocities[bi + 2] = at(velocities, bi + 2) - (nz * impulse) / mi
          velocities[bj] = at(velocities, bj) + (nx * impulse) / mj
          velocities[bj + 1] = at(velocities, bj + 1) + (ny * impulse) / mj
          velocities[bj + 2] = at(velocities, bj + 2) + (nz * impulse) / mj
        }
      }

      // Les matrices : une translation et une echelle par balle, sans passer
      // par un objet intermediaire — c'est la seule ecriture par image.
      const matrix = new three.Matrix4()
      for (let index = 0; index < total; index += 1) {
        const base = index * 3
        const radius = at(radii, index)
        matrix.makeScale(radius, radius, radius)
        matrix.setPosition(at(positions, base), at(positions, base + 1), at(positions, base + 2))
        mesh.setMatrixAt(index, matrix)
      }
      mesh.instanceMatrix.needsUpdate = true
    },
  })

  // Le theme a bascule : les tokens sont relus et les couleurs mises a jour
  // en place. La scene n'est pas reconstruite — seules ses couleurs changent.
  useEffect(() => {
    const scene = context.current
    const live = world.current
    if (scene === null || live === null) return
    const { three, renderer } = scene
    const paint = (value: ShaderColour): InstanceType<typeof three.Color> =>
      new three.Color().setRGB(value[0], value[1], value[2], three.SRGBColorSpace)

    renderer.setClearColor(paint(readTokenColour(BACKGROUND_TOKEN, host)), 1)
    const tints = colors.map((token) => paint(readTokenColour(token, host)))
    for (let index = 0; index < live.count; index += 1) {
      const tint = tints[index % tints.length]
      if (tint !== undefined) live.mesh.setColorAt(index, tint)
    }
    if (live.mesh.instanceColor !== null) live.mesh.instanceColor.needsUpdate = true
  }, [theme, colors, host])

  const pending = usePoster({ ready, refused })

  useOnReady(
    onReady,
    ready && context.current !== null && world.current !== null
      ? {
          scene: context.current,
          positions: world.current.positions,
          velocities: world.current.velocities,
        }
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

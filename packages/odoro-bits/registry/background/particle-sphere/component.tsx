/**
 * Sphere de points : un nuage spherique qui tourne, et que le pointeur
 * souleve.
 *
 * ## A quoi ce fond reagit
 *
 * Au deplacement du pointeur, avec amortissement : la position du curseur
 * est projetee sur l'hemisphere qui fait face a la camera, puis ramenee dans
 * le repere de la sphere qui tourne — sans cela, la bosse tournerait avec
 * elle au lieu de rester sous le curseur. Les points proches de cette
 * direction sont souleves le long de leur normale et changent de teinte. A
 * la sortie du cadre, la bosse s'efface.
 *
 * Ce qui distingue cette entree de `orbital-sphere` : la-bas une sphere
 * decorative, ceinte d'anneaux et piquee de noeuds, qui ne fait que tourner ;
 * ici une surface de points qui se deforme sous la main.
 *
 * ## Ce qui se passe par image
 *
 * Aucun rendu React : la rotation, la direction du pointeur et la force de
 * la bosse sont ecrites dans des uniformes vivants depuis la boucle du
 * moteur. Les vecteurs et quaternions de travail sont alloues une fois, a la
 * construction.
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
  NOISE_FUNCTIONS_3D,
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

import { PARTICLE_SPHERE_FRAGMENT, PARTICLE_SPHERE_VERTEX } from './particle-sphere.shader.js'

/** Ce que l'echappatoire recoit. */
export interface ParticleSphereControls {
  /** Contexte de la scene : objets, camera, moteur de rendu, module. */
  readonly scene: SceneContext
  /** Uniformes vivants : les modifier change le rendu a l'image suivante. */
  readonly uniforms: Record<string, { value: unknown }>
}

/** Proprietes propres au composant. */
export interface ParticleSphereOwnProps {
  /** Nombre de points. @defaultValue 3000 */
  points?: number
  /** Taille d'un point, en pixels. @defaultValue 2.5 */
  size?: number
  /** Hauteur de la bosse sous le pointeur, en rayons. @defaultValue 0.35 */
  pull?: number
  /** Etendue de la bosse, entre zero et un. @defaultValue 0.45 */
  reach?: number
  /** Vitesse de rotation, en tours par minute. @defaultValue 1.5 */
  rpm?: number
  /** Tokens : le fond, les points, les points souleves. */
  colors?: readonly [string, string, string]
  /** Classes du repli. */
  poster?: string
  /** Echappatoire. */
  onReady?: ReadyCallback<ParticleSphereControls>
}

/** Toutes les proprietes. */
export type ParticleSphereProps = Customisable<ParticleSphereOwnProps>

/** Tokens employes par defaut. */
const DEFAULT_TOKENS = [
  '--o-theme-bg',
  '--o-palette-cyan-400',
  '--o-palette-amber-400',
] as const

/** Repli par defaut : un halo fige, dans les memes tons. */
const DEFAULT_POSTER =
  'o-bg-gradient-to-br o-from-zinc-50 dark:o-from-zinc-950 o-via-cyan-200 dark:o-via-cyan-900 o-to-zinc-50 dark:o-to-zinc-950 o-blur-2xl o-scale-110'

/** Nombre de points en qualite basse. */
const LOW_POINTS = 1200

/** Plafond du nombre de points : au-dela, le nuage n'est plus que du bruit. */
const MAX_POINTS = 8000

/** L'angle d'or, qui donne son pas a la spirale. */
const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5))

/** Ce que la boucle manipule, construit une fois par montage. */
interface World {
  readonly group: InstanceType<SceneContext['three']['Group']>
  readonly direction: InstanceType<SceneContext['three']['Vector3']>
  readonly inverse: InstanceType<SceneContext['three']['Quaternion']>
}

/** Nombre pseudo-aleatoire d'un indice, stable d'un montage a l'autre. */
function hash(index: number): number {
  const x = Math.sin(index * 127.1 + 311.7) * 43758.5453123
  return x - Math.floor(x)
}

/**
 * Sphere de points.
 *
 * @example
 * <div className="o-relative o-h-96 o-overflow-hidden o-rounded-xl">
 *   <ParticleSphere className="o-absolute o-inset-0" />
 *   <div className="o-relative o-z-10">…</div>
 * </div>
 */
export function ParticleSphere({
  points = 3000,
  size = 2.5,
  pull = 0.35,
  reach = 0.45,
  rpm = 1.5,
  colors = DEFAULT_TOKENS,
  poster = DEFAULT_POSTER,
  onReady,
  ...rest
}: ParticleSphereProps): ReactElement {
  const { theme } = useMotionState()
  const [host, setHost] = useState<HTMLDivElement | null>(null)

  const pointer = usePointerDamped({ host, speed: 4, name: 'particle-sphere : pointeur' })

  const uniforms = useRef<Record<string, { value: unknown }>>({})
  const context = useRef<SceneContext | null>(null)
  const world = useRef<World | null>(null)

  // Le hook ramene le pointeur au centre quand il quitte le cadre : sans ce
  // drapeau, la bosse resterait plantee au milieu de la sphere.
  const inside = useRef(false)
  const strength = useRef(0)

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
  const settings = useRef({ size, pull, reach, rpm })
  settings.current = { size, pull, reach, rpm }

  const { ref, ready, refused } = useScene<HTMLDivElement>({
    name: 'particle-sphere',
    setup: (scene) => {
      context.current = scene
      const { three, camera, renderer, quality } = scene

      const paint = (value: ShaderColour): InstanceType<typeof three.Color> =>
        new three.Color(value[0], value[1], value[2])
      const [background, tint, lifted] = colors.map((token) => readTokenColour(token, host))

      // Le fond est la couleur du theme. Le token est en sRGB et le moteur
      // encode sa couleur d'effacement du lineaire vers le sRGB : sans la
      // conversion inverse, le fond ressort un cran plus clair que la page.
      renderer.setClearColor(paint(background ?? [0, 0, 0]).convertSRGBToLinear(), 1)

      const total = Math.min(quality === 'low' ? Math.min(points, LOW_POINTS) : points, MAX_POINTS)

      // La spirale de Fibonacci repartit les points a distance egale ; un
      // leger tirage par point casse la regularite du reseau, qui se lirait
      // sinon comme des moires.
      const positions = new Float32Array(total * 3)
      for (let index = 0; index < total; index += 1) {
        const y = 1 - (index / Math.max(total - 1, 1)) * 2
        const ray = Math.sqrt(Math.max(0, 1 - y * y))
        const theta = GOLDEN_ANGLE * index + (hash(index) - 0.5) * 0.35
        const wobble = 1 + (hash(index * 7 + 3) - 0.5) * 0.02
        positions[index * 3] = Math.cos(theta) * ray * wobble
        positions[index * 3 + 1] = y * wobble
        positions[index * 3 + 2] = Math.sin(theta) * ray * wobble
      }

      const geometry = new three.BufferGeometry()
      geometry.setAttribute('position', new three.BufferAttribute(positions, 3))

      uniforms.current = {
        uTime: { value: 0 },
        uPointer: { value: new three.Vector3(0, 0, 1) },
        uPull: { value: 0 },
        uReach: { value: reach },
        uSize: { value: size },
        uPixelRatio: { value: renderer.getPixelRatio() },
        uColorA: { value: paint(tint ?? [0, 0, 0]) },
        uColorB: { value: paint(lifted ?? [0, 0, 0]) },
      }

      const material = new three.ShaderMaterial({
        vertexShader: `${NOISE_FUNCTIONS_3D}\n${PARTICLE_SPHERE_VERTEX}`,
        fragmentShader: PARTICLE_SPHERE_FRAGMENT,
        uniforms: uniforms.current,
        transparent: true,
        depthWrite: false,
      })

      const group = new three.Group()
      group.name = 'particle-sphere'
      group.add(new three.Points(geometry, material))
      scene.scene.add(group)

      camera.position.set(0, 0, 3.4)
      camera.lookAt(0, 0, 0)

      world.current = {
        group,
        direction: new three.Vector3(0, 0, 1),
        inverse: new three.Quaternion(),
      }

      return () => {
        scene.scene.remove(group)
        geometry.dispose()
        material.dispose()
        world.current = null
      }
    },

    frame: (_scene, { time, delta }) => {
      const live = world.current
      if (live === null) return
      const { group, direction, inverse } = live
      const { size: px, pull: height, reach: extent, rpm: turns } = settings.current
      const current = uniforms.current

      // La rotation est exprimee en fonction du temps ecoule : le meme
      // reglage donne la meme vitesse a soixante comme a cent vingt images.
      group.rotation.y += (delta * turns * Math.PI * 2) / 60
      group.rotation.x = Math.sin(time * 0.2) * 0.18

      // Le pointeur, projete sur l'hemisphere qui fait face a la camera :
      // dans le cadre, la direction pointe vers l'avant ; au bord, elle se
      // couche sur le contour.
      let x = pointer.current.x * 1.15
      let y = -pointer.current.y * 1.15
      const spread = Math.hypot(x, y)
      if (spread > 1) {
        x /= spread
        y /= spread
      }
      const z = Math.sqrt(Math.max(0, 1 - x * x - y * y))
      // Puis ramene dans le repere de la sphere, qui tourne sous le curseur.
      inverse.copy(group.quaternion).invert()
      direction.set(x, y, z).applyQuaternion(inverse)

      // La force monte et retombe en douceur : la bosse ne claque pas a
      // l'entree du cadre, et ne reste pas plantee a la sortie.
      const target = inside.current ? height : 0
      strength.current += (target - strength.current) * Math.min(1, delta * 6)

      const set = (key: string, value: unknown): void => {
        const uniform = current[key]
        if (uniform !== undefined) uniform.value = value
      }
      set('uTime', time)
      set('uPull', strength.current)
      set('uReach', extent)
      set('uSize', px)
      const target_ = current['uPointer']
      if (target_ !== undefined) {
        ;(target_.value as { copy: (v: unknown) => unknown }).copy(direction)
      }
    },
  })

  // Le theme a bascule : les tokens sont relus et les couleurs mises a jour
  // en place. La scene n'est pas reconstruite — seules ses couleurs changent.
  useEffect(() => {
    const scene = context.current
    const live = uniforms.current
    if (scene === null || live['uColorA'] === undefined) return
    const [background, tint, lifted] = colors.map((token) => readTokenColour(token, host))
    const paint = (key: string, value: ShaderColour | undefined): void => {
      const uniform = live[key]
      if (uniform === undefined || value === undefined) return
      ;(uniform.value as { setRGB: (r: number, g: number, b: number) => unknown }).setRGB(
        value[0],
        value[1],
        value[2],
      )
    }
    paint('uColorA', tint)
    paint('uColorB', lifted)
    if (background !== undefined) {
      scene.renderer.setClearColor(
        new scene.three.Color(background[0], background[1], background[2]).convertSRGBToLinear(),
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

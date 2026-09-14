/**
 * Gelee : une masse translucide qui tremble la ou on la touche.
 *
 * ## A quoi ce fond reagit
 *
 * Au clic — ou au toucher — n'importe ou dans le cadre. Le point d'appui est
 * lance en rayon depuis la camera : s'il touche la gelee, l'impact est la ;
 * sinon, c'est le point de la gelee le plus proche du rayon qui recoit le
 * coup, si bien qu'un clic a cote fait trembler le bord. Un tampon circulaire
 * de quatre impacts vit dans les uniformes ; le cinquieme clic remplace le
 * plus ancien.
 *
 * ## Le temps des impacts
 *
 * Le temps ecrit dans le tampon est celui de l'horloge du moteur, memorise
 * par une souscription en priorite d'entree : c'est le meme temps que celui
 * de la boucle de la scene, sans quoi l'age des impacts serait faux et la
 * gelee tremblerait avant ou apres le clic.
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
  CLOCK_PRIORITY,
  NOISE_FUNCTIONS_3D,
  clock,
  mergePresentation,
  readTokenColour,
  useMotionState,
  useOnReady,
  type Customisable,
  type QualityLevel,
  type ReadyCallback,
  type ShaderColour,
} from '@odoro-cli/engine'
import { useScene, type SceneContext } from '@odoro-cli/engine/three'
import { useEffect, useRef, useState, type ReactElement } from 'react'

import { usePoster } from '@registre/hooks/usePoster'

import { JELLY_FRAGMENT, JELLY_VERTEX } from './jelly.shader.js'

/** Ce que l'echappatoire recoit. */
export interface JellyControls {
  /** Contexte de la scene : objets, camera, moteur de rendu, module. */
  readonly scene: SceneContext
  /** Uniformes vivants : les modifier change le rendu a l'image suivante. */
  readonly uniforms: Record<string, { value: unknown }>
}

/** Proprietes propres au composant. */
export interface JellyOwnProps {
  /** Amplitude du tremblement, en rayons. @defaultValue 0.22 */
  wobble?: number
  /** Raideur : la frequence des ondes. @defaultValue 9 */
  stiffness?: number
  /** Amortissement : la vitesse a laquelle un coup s'eteint. @defaultValue 1.6 */
  damping?: number
  /** Vitesse de rotation, en tours par minute. @defaultValue 1 */
  rpm?: number
  /** Tokens : le fond, le corps, les reflets. */
  colors?: readonly [string, string, string]
  /** Classes du repli. */
  poster?: string
  /** Echappatoire. */
  onReady?: ReadyCallback<JellyControls>
}

/** Toutes les proprietes. */
export type JellyProps = Customisable<JellyOwnProps>

/** Tokens employes par defaut. */
const DEFAULT_TOKENS = [
  '--o-theme-bg',
  '--o-palette-lime-500',
  '--o-palette-lime-200',
] as const

/** Repli par defaut : une tache floue, dans les memes tons. */
const DEFAULT_POSTER =
  'o-bg-gradient-to-br o-from-zinc-50 dark:o-from-zinc-950 o-via-lime-300 dark:o-via-lime-900 o-to-zinc-50 dark:o-to-zinc-950 o-blur-2xl o-scale-110'

/** Nombre d'impacts vivants a la fois. Doit suivre la constante du shader. */
const SLOTS = 4

/** Rayon de la gelee, en unites de scene. */
const RADIUS = 1.15

/** Subdivision de l'icosaedre par palier de qualite. */
const DETAIL: Readonly<Record<QualityLevel, number>> = {
  low: 20,
  medium: 36,
  high: 52,
}

/** Ce que le clic manipule, construit une fois par montage. */
interface World {
  readonly mesh: InstanceType<SceneContext['three']['Mesh']>
  readonly raycaster: InstanceType<SceneContext['three']['Raycaster']>
  readonly sphere: InstanceType<SceneContext['three']['Sphere']>
  readonly ndc: InstanceType<SceneContext['three']['Vector2']>
  readonly point: InstanceType<SceneContext['three']['Vector3']>
  readonly impacts: InstanceType<SceneContext['three']['Vector4']>[]
}

/**
 * Gelee.
 *
 * @example
 * <div className="o-relative o-h-96 o-overflow-hidden o-rounded-xl">
 *   <Jelly className="o-absolute o-inset-0" />
 *   <div className="o-relative o-z-10">…</div>
 * </div>
 */
export function Jelly({
  wobble = 0.22,
  stiffness = 9,
  damping = 1.6,
  rpm = 1,
  colors = DEFAULT_TOKENS,
  poster = DEFAULT_POSTER,
  onReady,
  ...rest
}: JellyProps): ReactElement {
  const { theme } = useMotionState()
  const [host, setHost] = useState<HTMLDivElement | null>(null)

  const uniforms = useRef<Record<string, { value: unknown }>>({})
  const context = useRef<SceneContext | null>(null)
  const world = useRef<World | null>(null)

  // Le temps de l'horloge du moteur — le meme que celui de la boucle. C'est
  // lui qui date les impacts ; performance.now() donnerait une autre origine.
  const lastTime = useRef(0)

  useEffect(() => {
    const subscription = clock.subscribe(
      ({ time }) => {
        lastTime.current = time
      },
      { priority: CLOCK_PRIORITY.input, name: 'jelly : horloge' },
    )
    return () => subscription.unsubscribe()
  }, [])

  // Les reglages sont lus par ref dans la boucle : un changement de curseur
  // dans l'atelier prend effet a l'image suivante sans reconstruire la scene.
  const settings = useRef({ wobble, stiffness, damping, rpm })
  settings.current = { wobble, stiffness, damping, rpm }

  const { ref, ready, refused } = useScene<HTMLDivElement>({
    name: 'jelly',
    setup: (scene) => {
      context.current = scene
      const { three, camera, renderer, quality } = scene

      const paint = (value: ShaderColour): InstanceType<typeof three.Color> =>
        new three.Color(value[0], value[1], value[2])
      const [background, body, highlight] = colors.map((token) =>
        readTokenColour(token, host),
      )

      // Le fond est la couleur du theme. Le token est en sRGB et le moteur
      // encode sa couleur d'effacement du lineaire vers le sRGB : sans la
      // conversion inverse, le fond ressort un cran plus clair que la page.
      renderer.setClearColor(paint(background ?? [0, 0, 0]).convertSRGBToLinear(), 1)

      // Un depart a -1000 donne un age enorme, donc un impact eteint d'office.
      const impacts = Array.from(
        { length: SLOTS },
        () => new three.Vector4(0, 0, 1, -1000),
      )

      uniforms.current = {
        uTime: { value: 0 },
        uImpacts: { value: impacts },
        uWobble: { value: wobble },
        uStiffness: { value: stiffness },
        uDamping: { value: damping },
        uBody: { value: paint(body ?? [0, 0, 0]) },
        uHighlight: { value: paint(highlight ?? [0, 0, 0]) },
      }

      const geometry = new three.IcosahedronGeometry(1, DETAIL[quality])
      const material = new three.ShaderMaterial({
        vertexShader: `${NOISE_FUNCTIONS_3D}\n${JELLY_VERTEX}`,
        fragmentShader: JELLY_FRAGMENT,
        uniforms: uniforms.current,
        transparent: true,
      })
      const mesh = new three.Mesh(geometry, material)
      mesh.scale.setScalar(RADIUS)
      mesh.name = 'jelly'
      scene.scene.add(mesh)

      camera.position.set(0, 0.2, 3.8)
      camera.lookAt(0, 0, 0)

      world.current = {
        mesh,
        raycaster: new three.Raycaster(),
        sphere: new three.Sphere(new three.Vector3(0, 0, 0), RADIUS),
        ndc: new three.Vector2(),
        point: new three.Vector3(),
        impacts,
      }

      return () => {
        scene.scene.remove(mesh)
        geometry.dispose()
        material.dispose()
        world.current = null
      }
    },

    frame: (_scene, { time, delta }) => {
      const live = world.current
      if (live === null) return
      const {
        wobble: amplitude,
        stiffness: frequency,
        damping: decay,
        rpm: turns,
      } = settings.current
      const current = uniforms.current

      // La rotation est exprimee en fonction du temps ecoule : le meme
      // reglage donne la meme vitesse a soixante comme a cent vingt images.
      live.mesh.rotation.y += (delta * turns * Math.PI * 2) / 60

      const set = (key: string, value: number): void => {
        const uniform = current[key]
        if (uniform !== undefined) uniform.value = value
      }
      set('uTime', time)
      set('uWobble', amplitude)
      set('uStiffness', frequency)
      set('uDamping', decay)
    },
  })

  // Le clic : un rayon depuis la camera, un point sur la gelee, un impact
  // dans le tampon.
  useEffect(() => {
    if (host === null) return

    const onDown = (event: PointerEvent): void => {
      const live = world.current
      const scene = context.current
      if (live === null || scene === null) return

      const bounds = host.getBoundingClientRect()
      live.ndc.set(
        ((event.clientX - bounds.left) / Math.max(bounds.width, 1)) * 2 - 1,
        -((event.clientY - bounds.top) / Math.max(bounds.height, 1)) * 2 + 1,
      )
      live.raycaster.setFromCamera(live.ndc, scene.camera)

      // Touchee, ou pas : dans le second cas, le point le plus proche du
      // rayon recoit le coup, et le bord tremble.
      const hit = live.raycaster.ray.intersectSphere(live.sphere, live.point)
      if (hit === null)
        live.raycaster.ray.closestPointToPoint(live.sphere.center, live.point)

      // Du monde vers la gelee, qui tourne : l'impact est fixe a sa surface.
      live.mesh.worldToLocal(live.point).normalize()

      // Tampon circulaire : tout se decale d'un cran, le nouvel impact en tete.
      for (let index = SLOTS - 1; index > 0; index -= 1) {
        const previous = live.impacts[index - 1]
        const slot = live.impacts[index]
        if (previous !== undefined && slot !== undefined) slot.copy(previous)
      }
      live.impacts[0]?.set(live.point.x, live.point.y, live.point.z, lastTime.current)
    }

    host.addEventListener('pointerdown', onDown)
    return () => host.removeEventListener('pointerdown', onDown)
  }, [host])

  // Le theme a bascule : les tokens sont relus et les couleurs mises a jour
  // en place. La scene n'est pas reconstruite — seules ses couleurs changent.
  useEffect(() => {
    const scene = context.current
    const live = uniforms.current
    if (scene === null || live['uBody'] === undefined) return
    const [background, body, highlight] = colors.map((token) =>
      readTokenColour(token, host),
    )
    const paint = (key: string, value: ShaderColour | undefined): void => {
      const uniform = live[key]
      if (uniform === undefined || value === undefined) return
      ;(uniform.value as { setRGB: (r: number, g: number, b: number) => unknown }).setRGB(
        value[0],
        value[1],
        value[2],
      )
    }
    paint('uBody', body)
    paint('uHighlight', highlight)
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

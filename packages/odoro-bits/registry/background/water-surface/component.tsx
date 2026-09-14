/**
 * Surface d'eau : une nappe de vagues de Gerstner vue en rasant, qui
 * reflete le ciel et fait scintiller le soleil.
 *
 * ## Pourquoi une scene, et pas un shader plein ecran
 *
 * Un reflet rasant est une affaire d'angle entre la surface et l'oeil : il
 * faut une vraie surface, une vraie camera, et une normale qui change d'un
 * point a l'autre. Un fragment plein ecran ne connait ni l'une ni l'autre.
 *
 * Ce qui distingue cette entree de `hero/tide` : la maree est une houle de
 * bruit, eclairee comme un relief et teintee par la hauteur ; ici les vagues
 * sont des vagues — des sinusoides qui se pincent aux cretes — et la couleur
 * vient du fresnel, de face l'eau, au ras le ciel.
 *
 * ## Ce que le pointeur fait
 *
 * La camera glisse lateralement en suivant le curseur, avec amortissement :
 * le reflet se deplace sur l'eau comme quand on penche la tete. Le reglage
 * `parallax` dose ce glissement ; a zero, la camera ne bouge pas.
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
  type QualityLevel,
  type ReadyCallback,
  type ShaderColour,
} from '@odoro-cli/engine'
import { useScene, type SceneContext } from '@odoro-cli/engine/three'
import { useEffect, useRef, useState, type ReactElement } from 'react'

import { usePointerDamped } from '@registre/hooks/usePointerDamped'
import { usePoster } from '@registre/hooks/usePoster'

import { WATER_SURFACE_FRAGMENT, WATER_SURFACE_VERTEX } from './water-surface.shader.js'

/** Ce que l'echappatoire recoit. */
export interface WaterSurfaceControls {
  /** Contexte de la scene : objets, camera, moteur de rendu, module. */
  readonly scene: SceneContext
  /** Uniformes vivants : les modifier change le rendu a l'image suivante. */
  readonly uniforms: Record<string, { value: unknown }>
}

/** Proprietes propres au composant. */
export interface WaterSurfaceOwnProps {
  /** Hauteur de la vague principale, en unites de scene. @defaultValue 0.12 */
  amplitude?: number
  /** Longueur de la vague principale, en unites de scene. @defaultValue 1.6 */
  wavelength?: number
  /** Pincement des cretes, entre zero et un. @defaultValue 0.6 */
  choppiness?: number
  /** Vitesse des vagues. @defaultValue 1 */
  speed?: number
  /** Intensite du soleil sur l'eau. @defaultValue 1 */
  sun?: number
  /** Glissement de la camera sous le pointeur. @defaultValue 0.15 */
  parallax?: number
  /** Tokens : le fond et la brume, l'eau, le ciel reflechi. */
  colors?: readonly [string, string, string]
  /** Classes du repli. */
  poster?: string
  /** Echappatoire. */
  onReady?: ReadyCallback<WaterSurfaceControls>
}

/** Toutes les proprietes. */
export type WaterSurfaceProps = Customisable<WaterSurfaceOwnProps>

/** Tokens employes par defaut. */
const DEFAULT_TOKENS = [
  '--o-theme-bg',
  '--o-palette-sky-600',
  '--o-palette-sky-200',
] as const

/** Repli par defaut : l'eau figee en degrade flou, dans les memes tons. */
const DEFAULT_POSTER =
  'o-bg-gradient-to-t o-from-sky-600 o-via-sky-300 dark:o-via-sky-900 o-to-zinc-50 dark:o-to-zinc-950 o-blur-2xl o-scale-110'

/** Subdivision de la nappe par palier de qualite. */
const SEGMENTS: Readonly<Record<QualityLevel, number>> = {
  low: 90,
  medium: 160,
  high: 220,
}

/** Distance de la camera au-dessus de l'eau et en retrait. */
const CAMERA = { height: 0.55, back: 3.2 } as const

/**
 * Surface d'eau.
 *
 * @example
 * <section className="o-relative o-min-h-screen">
 *   <WaterSurface className="o-absolute o-inset-0" />
 *   <h1 className="o-relative">Odoro</h1>
 * </section>
 */
export function WaterSurface({
  amplitude = 0.12,
  wavelength = 1.6,
  choppiness = 0.6,
  speed = 1,
  sun = 1,
  parallax = 0.15,
  colors = DEFAULT_TOKENS,
  poster = DEFAULT_POSTER,
  onReady,
  ...rest
}: WaterSurfaceProps): ReactElement {
  const { theme } = useMotionState()
  const [host, setHost] = useState<HTMLElement | null>(null)

  const pointer = usePointerDamped({ host, speed: 2, name: 'water-surface : pointeur' })

  /** Uniformes vivants, partages entre la construction et la boucle. */
  const uniforms = useRef<Record<string, { value: unknown }>>({})
  const context = useRef<SceneContext | null>(null)

  // Les reglages sont lus par ref dans la boucle : un changement de curseur
  // dans l'atelier prend effet a l'image suivante sans reconstruire la scene.
  const settings = useRef({ amplitude, wavelength, choppiness, speed, sun, parallax })
  settings.current = { amplitude, wavelength, choppiness, speed, sun, parallax }

  const { ref, ready, refused } = useScene({
    name: 'water-surface',
    setup: (scene) => {
      context.current = scene
      const { three, camera, renderer } = scene

      const paint = (value: ShaderColour): InstanceType<typeof three.Color> =>
        new three.Color(value[0], value[1], value[2])
      const [deep, water, sky] = colors.map((token) => readTokenColour(token, host))

      // Le fond de la scene est la couleur de brume. Le token est en sRGB et
      // le moteur de rendu encode sa couleur d'effacement du lineaire vers le
      // sRGB : sans la conversion inverse, le fond ressort un cran plus
      // clair que la page qui l'entoure.
      const deepColour = paint(deep ?? [0, 0, 0])
      renderer.setClearColor(deepColour.clone().convertSRGBToLinear(), 1)

      uniforms.current = {
        uTime: { value: 0 },
        uAmplitude: { value: amplitude },
        uWavelength: { value: wavelength },
        uChop: { value: choppiness },
        uSpeed: { value: speed },
        uSun: { value: sun },
        uDeep: { value: deepColour },
        uWater: { value: paint(water ?? [0, 0, 0]) },
        uSky: { value: paint(sky ?? [0, 0, 0]) },
      }

      // Un plan large et profond : la brume l'efface bien avant ses bords.
      const segments = SEGMENTS[scene.quality]
      const geometry = new three.PlaneGeometry(
        24,
        30,
        segments,
        Math.round(segments * 1.25),
      )
      const material = new three.ShaderMaterial({
        vertexShader: WATER_SURFACE_VERTEX,
        fragmentShader: `${NOISE_FUNCTIONS_3D}\n${WATER_SURFACE_FRAGMENT}`,
        uniforms: uniforms.current,
      })
      const mesh = new three.Mesh(geometry, material)
      // Le plan est couche : on le voit en rasant, ce qui fait tout le reflet.
      mesh.rotation.x = -Math.PI / 2
      mesh.position.y = -0.6
      mesh.position.z = -6
      mesh.name = 'water-surface'
      scene.scene.add(mesh)

      camera.position.set(0, CAMERA.height, CAMERA.back)
      camera.lookAt(0, -0.35, -4)

      return () => {
        scene.scene.remove(mesh)
        geometry.dispose()
        material.dispose()
      }
    },

    frame: ({ camera }, { time, delta }) => {
      const live = uniforms.current
      const {
        amplitude: a,
        wavelength: l,
        choppiness: c,
        speed: s,
        sun: brightness,
        parallax: lean,
      } = settings.current
      const set = (key: string, value: number): void => {
        const uniform = live[key]
        if (uniform !== undefined) uniform.value = value
      }
      set('uTime', time)
      set('uAmplitude', a)
      set('uWavelength', l)
      set('uChop', c)
      set('uSpeed', s)
      set('uSun', brightness)

      // La camera glisse avec le pointeur : lue ici, jamais par un rendu
      // React — la valeur change a chaque image.
      const targetX = pointer.current.x * lean * 2
      const targetY = CAMERA.height - pointer.current.y * lean * 0.6
      camera.position.x += (targetX - camera.position.x) * Math.min(1, delta * 3)
      camera.position.y += (targetY - camera.position.y) * Math.min(1, delta * 3)
      camera.lookAt(camera.position.x * 0.4, -0.35, -4)
    },
  })

  // Le theme a bascule : les tokens sont relus et les uniformes mis a jour en
  // place. La scene n'est pas reconstruite — seules ses couleurs changent.
  useEffect(() => {
    const scene = context.current
    const live = uniforms.current
    if (scene === null || live['uDeep'] === undefined) return
    const [deep, water, sky] = colors.map((token) => readTokenColour(token, host))
    const paint = (key: string, value: ShaderColour | undefined): void => {
      const uniform = live[key]
      if (uniform === undefined || value === undefined) return
      ;(uniform.value as { setRGB: (r: number, g: number, b: number) => unknown }).setRGB(
        value[0],
        value[1],
        value[2],
      )
    }
    paint('uDeep', deep)
    paint('uWater', water)
    paint('uSky', sky)
    if (deep !== undefined) {
      scene.renderer.setClearColor(
        new scene.three.Color(deep[0], deep[1], deep[2]).convertSRGBToLinear(),
        1,
      )
    }
  }, [theme, colors, host])

  const fallback = usePoster({ ready, refused })

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
      {fallback.visible ? (
        <div style={fallback.style} className={`o-absolute o-inset-0 ${poster}`} />
      ) : null}
    </div>
  )
}

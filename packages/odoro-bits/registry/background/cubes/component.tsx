/**
 * Cubes : un champ de cubes qui montent et descendent en vague.
 *
 * ## Pourquoi une scene, et pourquoi instanciee
 *
 * Des cubes vus de biais, avec des faces eclairees differemment, c'est de la
 * geometrie et une camera : le backend leger ne sait pas le faire sans
 * reconstruire un lancer de rayons par fragment. Une scene le fait pour rien.
 *
 * Mais un maillage par cube, c'est un appel de dessin par cube — plusieurs
 * centaines par image. Une seule geometrie instanciee les rend en un appel :
 * chaque cube n'est qu'une matrice dans un tampon ecrit au montage.
 *
 * ## La vague vit dans le shader de sommets
 *
 * La hauteur de chaque cube est une somme de sinus de sa position et du
 * temps. La calculer sur le processeur obligerait a reecrire toutes les
 * matrices a chaque image ; le shader de sommets, lui, lit la translation de
 * l'instance et decale les sommets. La boucle n'ecrit qu'un temps.
 *
 * ## Ce que ce composant ne fait pas
 *
 * Il n'ouvre ni boucle, ni observateur : `useScene` les porte. Il n'ecrit
 * aucune couleur : fond, creux et cretes sont lus dans les tokens, et
 * repeints en place quand le theme bascule.
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

import { usePoster } from '@registre/hooks/usePoster'

/** Proprietes propres au composant. */
export interface CubesOwnProps {
  /** Cubes par cote. @defaultValue 18 */
  grid?: number
  /** Hauteur de la vague, en cotes de cube. @defaultValue 0.8 */
  amplitude?: number
  /** Vitesse de la vague. @defaultValue 0.8 */
  speed?: number
  /** Frequence spatiale de la vague. @defaultValue 0.9 */
  frequency?: number
  /** Espace entre deux cubes, en fraction du pas. @defaultValue 0.2 */
  gap?: number
  /** Tokens : le fond, les creux, les cretes. */
  colors?: readonly [string, string, string]
  /** Classes du repli. */
  poster?: string
}

/** Toutes les proprietes. */
export type CubesProps = Customisable<CubesOwnProps>

/** Tokens employes par defaut. */
const DEFAULT_TOKENS = [
  '--o-theme-bg',
  '--o-palette-violet-500',
  '--o-palette-brand-500',
] as const

/** Repli par defaut : un degrade fige, dans les memes tons. */
const DEFAULT_POSTER =
  'o-bg-gradient-to-br o-from-zinc-50 dark:o-from-zinc-950 o-via-violet-100 dark:o-via-violet-950 o-to-zinc-50 dark:o-to-zinc-950'

/** Cubes par cote en qualite basse. */
const LOW_GRID = 10

/**
 * Cubes par cote au maximum.
 *
 * Le tampon d'instances est alloue une fois a cette taille : changer la
 * grille reecrit des matrices, jamais la geometrie ni le materiau.
 */
const MAX_GRID = 36

/**
 * Shader de sommets : la vague.
 *
 * `instanceMatrix` est declare par le moteur de scene quand le maillage est
 * instancie ; sa translation est la position du cube dans le champ, et c'est
 * elle qui donne la phase de la vague. La hauteur est une somme de trois
 * sinus de frequences non multiples : une seule onde se lirait comme un
 * tapis qui glisse.
 */
const CUBES_VERTEX = /* glsl */ `
uniform float uTime;
uniform float uSpeed;
uniform float uAmplitude;
uniform float uFrequency;
uniform float uExtent;

varying float vHeight;
varying vec3 vNormal;
varying float vFade;

void main() {
  #ifdef USE_INSTANCING
  vec4 origin = instanceMatrix * vec4(0.0, 0.0, 0.0, 1.0);
  #else
  vec4 origin = vec4(0.0, 0.0, 0.0, 1.0);
  #endif

  float t = uTime * uSpeed;
  float k = uFrequency;
  float h = sin(origin.x * k + t) * cos(origin.z * k * 0.8 - t * 0.7);
  h += 0.5 * sin((origin.x + origin.z) * k * 1.7 + t * 1.3);
  h /= 1.5;

  vec3 shifted = position;
  shifted.y += h * uAmplitude;

  #ifdef USE_INSTANCING
  vec4 world = instanceMatrix * vec4(shifted, 1.0);
  #else
  vec4 world = vec4(shifted, 1.0);
  #endif

  vHeight = h * 0.5 + 0.5;
  vNormal = normalize(normalMatrix * normal);
  // Les cubes du bord se fondent dans le fond : le champ n'a pas de lisiere.
  vFade = smoothstep(uExtent, uExtent * 0.55, length(origin.xz));

  gl_Position = projectionMatrix * modelViewMatrix * world;
}
`

/**
 * Shader de fragments : une lumiere fixe, la teinte par hauteur.
 *
 * Les couleurs arrivent deja en sRGB, telles que lues dans les tokens ; elles
 * sont ecrites sans conversion, ce qui est exactement ce que la page attend.
 */
const CUBES_FRAGMENT = /* glsl */ `
precision highp float;

uniform vec3 uBg;
uniform vec3 uLow;
uniform vec3 uHigh;

varying float vHeight;
varying vec3 vNormal;
varying float vFade;

void main() {
  vec3 light = normalize(vec3(0.4, 1.0, 0.6));
  float lambert = 0.45 + 0.55 * max(dot(vNormal, light), 0.0);
  vec3 tint = mix(uLow, uHigh, smoothstep(0.1, 0.9, vHeight));
  vec3 colour = mix(uBg, tint * lambert, vFade);
  gl_FragColor = vec4(colour, 1.0);
}
`

type Three = SceneContext['three']
type InstancedMesh = InstanceType<Three['InstancedMesh']>

/** Ce que la scene garde entre le montage et les images. */
interface Field {
  readonly mesh: InstancedMesh
  readonly uniforms: Record<string, { value: unknown }>
}

/**
 * Ecrit les matrices d'instances pour une grille donnee.
 *
 * Le champ est centre sur l'origine et son pas vaut un : la position d'un
 * cube est directement sa phase dans la vague. Rend le demi-cote du champ.
 */
function layout(three: Three, mesh: InstancedMesh, side: number, gap: number): number {
  const matrix = new three.Matrix4()
  const scale = Math.max(0.05, 1 - gap)
  const half = (side - 1) / 2
  let index = 0
  for (let x = 0; x < side; x += 1) {
    for (let z = 0; z < side; z += 1) {
      matrix.makeScale(scale, scale, scale)
      matrix.setPosition(x - half, 0, z - half)
      mesh.setMatrixAt(index, matrix)
      index += 1
    }
  }
  mesh.count = index
  mesh.instanceMatrix.needsUpdate = true
  return half + 0.5
}

/** Place la camera de biais, a une distance qui cadre le champ entier. */
function frameCamera(camera: SceneContext['camera'], side: number): void {
  // Vue de biais, comme une maquette : de face, la vague ne se lirait que
  // par la couleur.
  camera.position.set(side * 0.45, side * 0.6, side * 0.7)
  camera.lookAt(0, -0.3, 0)
}

/**
 * Cubes.
 *
 * @example
 * <div className="o-relative o-h-96 o-overflow-hidden">
 *   <Cubes className="o-absolute o-inset-0" />
 *   <div className="o-relative">…</div>
 * </div>
 */
export function Cubes({
  grid = 18,
  amplitude = 0.8,
  speed = 0.8,
  frequency = 0.9,
  gap = 0.2,
  colors = DEFAULT_TOKENS,
  poster = DEFAULT_POSTER,
  ...rest
}: CubesProps): ReactElement {
  const { theme, quality } = useMotionState()
  const [host, setHost] = useState<HTMLElement | null>(null)

  const field = useRef<Field | null>(null)
  const context = useRef<SceneContext | null>(null)

  // Les reglages sont lus par ref dans la boucle : un curseur qui bouge ne
  // remonte pas la scene, il change une valeur d'uniforme a l'image suivante.
  const live = useRef({ amplitude, speed, frequency })
  live.current = { amplitude, speed, frequency }

  const side = Math.min(
    MAX_GRID,
    Math.max(2, Math.round(quality === 'low' ? Math.min(grid, LOW_GRID) : grid)),
  )

  const { ref, ready, refused } = useScene({
    name: 'cubes',
    setup: (scene) => {
      context.current = scene
      const { three, renderer, camera } = scene

      const [bg, low, high] = colors.map((token) => readTokenColour(token, host))
      const toColour = (
        value: readonly number[] | undefined,
      ): InstanceType<Three['Color']> =>
        new three.Color(value?.[0] ?? 0, value?.[1] ?? 0, value?.[2] ?? 0)

      // Le token est en sRGB et le moteur encode sa couleur d'effacement du
      // lineaire vers le sRGB : sans la conversion inverse, le fond ressort
      // un cran plus clair que la page.
      renderer.setClearColor(toColour(bg).convertSRGBToLinear(), 1)

      const uniforms: Record<string, { value: unknown }> = {
        uTime: { value: 0 },
        uSpeed: { value: speed },
        uAmplitude: { value: amplitude },
        uFrequency: { value: frequency },
        uExtent: { value: side / 2 },
        uBg: { value: toColour(bg) },
        uLow: { value: toColour(low) },
        uHigh: { value: toColour(high) },
      }

      const mesh = new three.InstancedMesh(
        new three.BoxGeometry(1, 1, 1),
        new three.ShaderMaterial({
          vertexShader: CUBES_VERTEX,
          fragmentShader: CUBES_FRAGMENT,
          uniforms,
        }),
        MAX_GRID * MAX_GRID,
      )
      mesh.name = 'cubes'
      const extent = uniforms['uExtent']
      if (extent !== undefined) extent.value = layout(three, mesh, side, gap)
      field.current = { mesh, uniforms }
      scene.scene.add(mesh)

      frameCamera(camera, side)

      return () => {
        scene.scene.remove(mesh)
        field.current = null
      }
    },

    frame: (_, { time }) => {
      const current = field.current
      if (current === null) return
      const { uniforms } = current
      const set = (key: string, value: number): void => {
        const uniform = uniforms[key]
        if (uniform !== undefined) uniform.value = value
      }
      set('uTime', time)
      set('uSpeed', live.current.speed)
      set('uAmplitude', live.current.amplitude)
      set('uFrequency', live.current.frequency)
    },
  })

  // La grille ou l'espacement changent : les matrices sont reecrites dans le
  // tampon existant, et la camera recule d'autant. Rien n'est reconstruit.
  useEffect(() => {
    const scene = context.current
    const current = field.current
    if (scene === null || current === null) return
    const extent = layout(scene.three, current.mesh, side, gap)
    const uniform = current.uniforms['uExtent']
    if (uniform !== undefined) uniform.value = extent
    frameCamera(scene.camera, side)
  }, [side, gap])

  // Le theme a bascule : les tokens sont relus et les couleurs repeintes en
  // place. La scene n'est pas reconstruite.
  useEffect(() => {
    const scene = context.current
    const current = field.current
    if (scene === null || current === null) return
    const [bg, low, high] = colors.map((token) => readTokenColour(token, host))
    const paint = (key: string, value: readonly number[] | undefined): void => {
      const uniform = current.uniforms[key]
      if (uniform === undefined || value === undefined) return
      ;(uniform.value as { setRGB: (r: number, g: number, b: number) => unknown }).setRGB(
        value[0] ?? 0,
        value[1] ?? 0,
        value[2] ?? 0,
      )
    }
    paint('uBg', bg)
    paint('uLow', low)
    paint('uHigh', high)
    if (bg !== undefined) {
      scene.renderer.setClearColor(
        new scene.three.Color(bg[0] ?? 0, bg[1] ?? 0, bg[2] ?? 0).convertSRGBToLinear(),
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

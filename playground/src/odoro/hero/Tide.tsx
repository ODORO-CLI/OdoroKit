/**
 * Maree : une nappe lumineuse en trois dimensions.
 *
 * ## Pourquoi une scene, et pas un shader plein ecran
 *
 * Le backend leger peint des fragments : il sait faire une nappe vue de face,
 * pas une nappe vue en rasant, avec une profondeur, une lumiere qui glisse
 * dessus et un horizon qui se fond. C'est exactement ce que le heros veut, et
 * c'est la seule raison de payer une scene.
 *
 * ## Ce que le defilement fait
 *
 * La camera recule et monte pendant que le cadre defile : la nappe s'eloigne
 * et s'aplatit, comme si l'on quittait le rivage. Le reglage `scroll` dose ce
 * recul ; a zero, la nappe ignore la page.
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
} from '@odoro-cli/engine'
import { useScene, type SceneContext } from '@odoro-cli/engine/three'
import { useEffect, useRef, useState, type ReactElement } from 'react'

import { usePointerDamped } from '@/odoro/hooks/usePointerDamped'
import { usePoster } from '@/odoro/hooks/usePoster'

import { TIDE_FRAGMENT, TIDE_VERTEX } from './tide.shader.js'

/** Ce que l'echappatoire recoit. */
export interface TideControls {
  /** Contexte de la scene : objets, camera, moteur de rendu, module. */
  readonly scene: SceneContext
  /** Uniformes vivants : les modifier change le rendu a l'image suivante. */
  readonly uniforms: Record<string, { value: unknown }>
}

/** Proprietes propres au composant. */
export interface TideOwnProps {
  /** Hauteur de la houle. @defaultValue 0.45 */
  amplitude?: number
  /** Frequence du bruit. @defaultValue 0.55 */
  frequency?: number
  /** Vitesse de la houle. @defaultValue 0.18 */
  speed?: number
  /** Intensite du reflet et du lisere de crete. @defaultValue 0.9 */
  shine?: number
  /** Inclinaison sous le pointeur. @defaultValue 0.2 */
  parallax?: number
  /** Recul de la camera pendant le defilement du cadre. @defaultValue 1 */
  scroll?: number
  /** Tokens : le fond, la houle, les cretes. */
  colors?: readonly [string, string, string]
  /** Classes du repli. */
  poster?: string
  /** Echappatoire. */
  onReady?: ReadyCallback<TideControls>
}

/** Toutes les proprietes. */
export type TideProps = Customisable<TideOwnProps>

/** Tokens employes par defaut. */
const DEFAULT_TOKENS = [
  '--o-theme-bg',
  '--o-palette-brand-500',
  '--o-palette-fuchsia-300',
] as const

/** Repli par defaut : la houle figee en degrade flou, dans les memes tons. */
const DEFAULT_POSTER =
  'o-bg-gradient-to-t o-from-zinc-50 dark:o-from-zinc-950 o-via-brand-100 dark:o-via-brand-950 o-to-brand-500 o-blur-2xl o-scale-110'

/** Subdivision de la nappe et octaves du bruit, par palier de qualite. */
const DETAIL: Readonly<Record<QualityLevel, { segments: number; octaves: number }>> = {
  low: { segments: 80, octaves: 2 },
  medium: { segments: 140, octaves: 3 },
  high: { segments: 200, octaves: 4 },
}

/**
 * Maree.
 *
 * @example
 * <section className="o-relative o-min-h-screen o-bg-zinc-50 dark:o-bg-zinc-950">
 *   <Tide className="o-absolute o-inset-0" />
 *   <h1 className="o-relative">Odoro</h1>
 * </section>
 */
export function Tide({
  amplitude = 0.45,
  frequency = 0.55,
  speed = 0.18,
  shine = 0.9,
  parallax = 0.2,
  scroll = 1,
  colors = DEFAULT_TOKENS,
  poster = DEFAULT_POSTER,
  onReady,
  ...rest
}: TideProps): ReactElement {
  const { quality, theme } = useMotionState()
  const [host, setHost] = useState<HTMLElement | null>(null)

  const pointer = usePointerDamped({ host, speed: 2.5, name: 'maree : pointeur' })

  /** Uniformes vivants, partages entre la construction et la boucle. */
  const uniforms = useRef<Record<string, { value: unknown }>>({})
  const context = useRef<SceneContext | null>(null)
  const progress = useRef(0)

  const grade = DETAIL[quality]

  const { ref, ready, refused } = useScene({
    name: 'maree',
    setup: (scene) => {
      context.current = scene
      const { three, camera, renderer } = scene

      const [deep, mid, crest] = colors.map((token) => readTokenColour(token, host))
      const toColour = (
        value: readonly number[] | undefined,
        fallback: readonly [number, number, number],
      ): InstanceType<typeof three.Color> =>
        new three.Color(
          value?.[0] ?? fallback[0],
          value?.[1] ?? fallback[1],
          value?.[2] ?? fallback[2],
        )

      const deepColour = toColour(deep, [0.05, 0.05, 0.07])
      // Le fond de la scene est la couleur de brume : sans cela, le plan se
      // decouperait sur du noir la ou la brume l'a deja efface. Le token est
      // deja en sRGB et le moteur de rendu encode sa couleur d'effacement du
      // lineaire vers le sRGB : sans la conversion inverse, le fond ressort
      // gris, un cran plus clair que la page qui l'entoure.
      renderer.setClearColor(deepColour.clone().convertSRGBToLinear(), 1)

      uniforms.current = {
        uTime: { value: 0 },
        uAmplitude: { value: amplitude },
        uFrequency: { value: frequency },
        uSpeed: { value: speed },
        uOctaves: { value: grade.octaves },
        uShine: { value: shine },
        uDeep: { value: deepColour },
        uMid: { value: toColour(mid, [0.45, 0.4, 0.95]) },
        uCrest: { value: toColour(crest, [0.95, 0.6, 0.95]) },
      }

      // Un plan large et profond : la brume l'efface bien avant ses bords.
      const mesh = new three.Mesh(
        new three.PlaneGeometry(18, 20, grade.segments, Math.round(grade.segments * 1.1)),
        new three.ShaderMaterial({
          vertexShader: `${NOISE_FUNCTIONS_3D}\n${TIDE_VERTEX}`,
          fragmentShader: TIDE_FRAGMENT,
          uniforms: uniforms.current,
        }),
      )
      // Le plan est couche, legerement releve vers la camera : on le voit en
      // rasant, ce qui fait tout le relief.
      mesh.rotation.x = -Math.PI / 2 + 0.12
      mesh.position.y = -0.9

      const group = new three.Group()
      group.name = 'maree'
      group.add(mesh)
      scene.scene.add(group)

      camera.position.set(0, 0.7, 4.4)
      camera.lookAt(0, -0.15, 0)
    },

    frame: ({ scene, camera }, { time, delta }) => {
      const time_ = uniforms.current['uTime']
      if (time_ !== undefined) time_.value = time

      const group = scene.getObjectByName('maree')
      if (group === undefined) return

      // Le defilement du cadre eloigne la camera : lu ici, jamais par un
      // rendu React — la valeur change a chaque image.
      const height = host?.clientHeight ?? 1
      const target =
        scroll === 0 ? 0 : Math.min(1, Math.max(0, window.scrollY / Math.max(height, 1)))
      progress.current += (target - progress.current) * Math.min(1, delta * 4)
      const away = progress.current * scroll

      camera.position.set(0, 0.7 + away * 1.4, 4.4 + away * 1.8)
      camera.lookAt(0, -0.15 - away * 0.3, 0)

      if (parallax === 0) return
      const lean = pointer.current
      group.rotation.z += (-lean.x * parallax * 0.5 - group.rotation.z) * delta * 2
      group.rotation.x += (lean.y * parallax * 0.3 - group.rotation.x) * delta * 2
    },
  })

  // Le theme a bascule : les tokens sont relus et les uniformes mis a jour en
  // place. La scene n'est pas reconstruite — seules ses couleurs changent.
  useEffect(() => {
    const scene = context.current
    const live = uniforms.current
    if (scene === null || live['uDeep'] === undefined) return
    const [deep, mid, crest] = colors.map((token) => readTokenColour(token, host))
    const paint = (key: string, value: readonly number[] | undefined): void => {
      const uniform = live[key]
      if (uniform === undefined || value === undefined) return
      ;(uniform.value as { setRGB: (r: number, g: number, b: number) => unknown }).setRGB(
        value[0] ?? 0,
        value[1] ?? 0,
        value[2] ?? 0,
      )
    }
    paint('uDeep', deep)
    paint('uMid', mid)
    paint('uCrest', crest)
    if (deep !== undefined) {
      scene.renderer.setClearColor(
        new scene.three.Color(
          deep[0] ?? 0,
          deep[1] ?? 0,
          deep[2] ?? 0,
        ).convertSRGBToLinear(),
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

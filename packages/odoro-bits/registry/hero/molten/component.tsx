/**
 * Molten — une masse en fusion qui respire.
 *
 * ## Ce que ce composant coute
 *
 * Environ cent trente kilo-octets compresses au premier affichage, contre
 * treize pour le backend leger. C'est le composant le plus cher du registre,
 * et la CLI l'annonce avant d'ecrire quoi que ce soit.
 *
 * La contrepartie est ce qu'une scene 3D permet et qu'un shader plein ecran ne
 * permet pas : une camera, une profondeur, une silhouette qui reagit au
 * pointeur. Si l'effet recherche n'a besoin d'aucun des trois, l'aurore fait
 * le meme travail pour un dixieme du poids.
 *
 * ## Le repli est la moitie du composant
 *
 * Il est affiche pendant le telechargement du backend — plusieurs centaines de
 * millisecondes sur une connexion ordinaire, a l'endroit le plus visible de la
 * page — puis fondu. Il sert aussi quand la scene ne viendra jamais : sans
 * WebGL, sous mouvement reduit, ou quand l'arbitre refuse la surface.
 *
 * ## Ce que la qualite change
 *
 * La subdivision de la sphere et le nombre d'octaves. Ce sont les deux
 * reglages qui pesent, et ce sont les deux qui se degradent le mieux : la
 * silhouette reste la, seul le detail s'efface. Baisser la definition du rendu
 * a la place aurait donne une image floue, ce qui se remarque bien davantage.
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
} from '@odoro/engine'
import { useScene, type SceneContext } from '@odoro/engine/three'
import { useMemo, useRef, useState, type ReactElement } from 'react'

import { usePointerDamped } from '@registre/hooks/usePointerDamped'
import { usePoster } from '@registre/hooks/usePoster'

import { MOLTEN_FRAGMENT, MOLTEN_VERTEX } from './molten.shader.js'

/** Ce que l'echappatoire recoit. */
export interface MoltenControls {
  /** Contexte de la scene : objets, camera, moteur de rendu, module. */
  readonly scene: SceneContext
  /** Uniformes vivants du materiau, modifiables en place. */
  readonly uniforms: Record<string, { value: unknown }>
}

/** Proprietes propres au composant. */
export interface MoltenOwnProps {
  /** Profondeur de la deformation, en rayons. @defaultValue 0.28 */
  amplitude?: number
  /** Echelle du bruit. @defaultValue 1.6 */
  frequency?: number
  /** Vitesse de la respiration. @defaultValue 0.25 */
  speed?: number
  /** Intensite du halo de bord. @defaultValue 0.8 */
  glow?: number
  /** Amplitude du suivi du pointeur. Zero pour l'immobiliser. @defaultValue 0.25 */
  parallax?: number
  /** Tokens du coeur et de la croute. */
  colors?: readonly [string, string]
  /** Classes du repli. */
  poster?: string
  /** Echappatoire. */
  onReady?: ReadyCallback<MoltenControls>
}

/** Toutes les proprietes. */
export type MoltenProps = Customisable<MoltenOwnProps>

/** Tokens employes par defaut. */
const DEFAULT_TOKENS = ['--o-palette-brand-600', '--o-palette-fuchsia-600'] as const

/** Repli par defaut : un degrade radial dans les memes tons. */
const DEFAULT_POSTER =
  'o-bg-gradient-to-br o-from-brand-600 dark:o-from-brand-400 o-via-fuchsia-600 dark:o-via-fuchsia-400 o-to-zinc-50 dark:o-to-zinc-900 o-blur-2xl o-scale-110'

/** Subdivision de la sphere et octaves du bruit, par palier de qualite. */
const DETAIL: Readonly<Record<QualityLevel, { detail: number; octaves: number }>> = {
  low: { detail: 24, octaves: 2 },
  medium: { detail: 48, octaves: 3 },
  high: { detail: 96, octaves: 4 },
}

/**
 * Masse en fusion, en scene 3D.
 *
 * @example
 * <section className="o-relative o-h-screen">
 *   <Molten className="o-absolute o-inset-0" />
 *   <h1 className="o-relative">Odoro</h1>
 * </section>
 *
 * @example
 * // Niveau 5 : la scene elle-meme, pour ce que l API n a pas prevu.
 * <Molten
 *   onReady={({ handle }) => {
 *     handle.uniforms.uGlow.value = 2
 *     handle.scene.camera.position.z = 4
 *   }}
 * />
 */
export function Molten({
  amplitude = 0.28,
  frequency = 1.6,
  speed = 0.25,
  glow = 0.8,
  parallax = 0.25,
  colors = DEFAULT_TOKENS,
  poster = DEFAULT_POSTER,
  onReady,
  ...rest
}: MoltenProps): ReactElement {
  const { quality } = useMotionState()
  const [host, setHost] = useState<HTMLElement | null>(null)

  const pointer = usePointerDamped({ host, speed: 3, name: 'molten : pointeur' })

  /** Uniformes vivants, partages entre la construction et la boucle. */
  const uniforms = useRef<Record<string, { value: unknown }>>({})
  const context = useRef<SceneContext | null>(null)

  const grade = DETAIL[quality]

  const { ref, ready, refused } = useScene({
    name: 'molten',
    setup: (scene) => {
      context.current = scene
      const { three, camera } = scene

      const [core, crust] = colors.map((token) => readTokenColour(token, host))

      uniforms.current = {
        uTime: { value: 0 },
        uAmplitude: { value: amplitude },
        uFrequency: { value: frequency },
        uSpeed: { value: speed },
        uOctaves: { value: grade.octaves },
        uGlow: { value: glow },
        uCore: { value: new three.Color(core?.[0] ?? 1, core?.[1] ?? 1, core?.[2] ?? 1) },
        uCrust: {
          value: new three.Color(crust?.[0] ?? 0, crust?.[1] ?? 0, crust?.[2] ?? 0),
        },
      }

      const mesh = new three.Mesh(
        // Un icosaedre subdivise repartit ses sommets bien plus regulierement
        // qu'une sphere en latitude et longitude, qui les entasse aux poles —
        // la ou la deformation serait alors plus fine qu'ailleurs, sans raison.
        new three.IcosahedronGeometry(1, grade.detail),
        new three.ShaderMaterial({
          // Le bruit vient du moteur : le recopier ici en ferait une seconde
          // version a maintenir.
          vertexShader: `${NOISE_FUNCTIONS_3D}\n${MOLTEN_VERTEX}`,
          fragmentShader: MOLTEN_FRAGMENT,
          uniforms: uniforms.current,
        }),
      )

      scene.scene.add(mesh)
      camera.position.z = 2.6
    },

    frame: ({ scene }, { time, delta }) => {
      const time_ = uniforms.current['uTime']
      if (time_ !== undefined) time_.value = time

      if (parallax === 0) return
      // Le pointeur incline la masse, il ne la deplace pas : une rotation se
      // lit comme un volume qui se presente, une translation comme une image
      // qui glisse.
      const target = pointer.current
      scene.rotation.y += (target.x * parallax - scene.rotation.y) * delta * 2
      scene.rotation.x += (-target.y * parallax - scene.rotation.x) * delta * 2
    },
  })

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

  const detail = useMemo(() => String(grade.detail), [grade.detail])

  return (
    <div
      {...rest}
      ref={(element) => {
        setHost(element)
        ref.current = element
      }}
      className={className}
      style={style}
      data-o-detail={detail}
      aria-hidden
    >
      {fallback.visible ? (
        <div style={fallback.style} className={`o-absolute o-inset-0 ${poster}`} />
      ) : null}
    </div>
  )
}

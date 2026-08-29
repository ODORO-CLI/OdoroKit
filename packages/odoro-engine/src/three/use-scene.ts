/**
 * Scenes 3D.
 *
 * ## Le poids, et pourquoi il commande la conception
 *
 * Le moteur de scene 3D pese entre 120 et 140 kilo-octets compresses, dont
 * l'essentiel dans son moteur de rendu — qui ne se secoue pas. C'est un ordre
 * de grandeur au-dessus du backend leger.
 *
 * Il n'entre donc **jamais** dans le bundle initial. L'entree
 * `@odoro-cli/engine/three` est un point de rupture, et le moteur lui-meme n'est
 * charge qu'a l'interieur de ce hook, par import dynamique. Un site qui
 * n'affiche qu'une animation de texte n'en telecharge pas une ligne. Ce n'est
 * pas une optimisation a faire plus tard : c'est ce qui dicte l'architecture
 * de ce fichier.
 *
 * ## Consequence pour l'appelant
 *
 * Le repli est affiche **d'abord**, la scene monte ensuite. Il n'existe aucun
 * instant ou l'ecran est vide en attendant le telechargement.
 *
 * @module
 */

import { type RefObject, useEffect, useRef, useState } from 'react'
import type * as ThreeModule from 'three'
import type { PerspectiveCamera, Scene, WebGLRenderer, WebGLRenderTarget } from 'three'

import { CLOCK_PRIORITY, clock } from '../core/clock.js'
import { type QualityLevel, motionPolicy } from '../core/motion-policy.js'
import { type RefusalReason, surfaceManager } from '../gl/surface-manager.js'
import { disposeScene } from './dispose.js'

/** Ce que recoit la construction de scene. */
export interface SceneContext {
  /** Scene a peupler. */
  readonly scene: Scene
  /** Camera, deja placee et orientee vers l'origine. */
  readonly camera: PerspectiveCamera
  /** Moteur de rendu. */
  readonly renderer: WebGLRenderer
  /** Module complet, pour construire geometries et materiaux. */
  readonly three: typeof ThreeModule
  /** Qualite retenue au montage. */
  readonly quality: QualityLevel
  /**
   * Cibles de rendu a liberer au demontage. Y inscrire toute cible creee dans
   * la construction : elles ne sont pas atteignables par le parcours de la
   * scene.
   */
  readonly targets: WebGLRenderTarget[]
}

/** Ce que recoit la mise a jour par image. */
export interface SceneFrame {
  /** Temps ecoule depuis le demarrage, en secondes. */
  readonly time: number
  /** Duree de l'image precedente, en secondes, lissee. */
  readonly delta: number
  /** Duree reelle de l'image precedente, en secondes. */
  readonly deltaRaw: number
}

/** Options de {@link useScene}. */
export interface SceneOptions {
  /** Construit le contenu de la scene. */
  setup: (context: SceneContext) => void | (() => void)
  /** Met a jour la scene a chaque image. */
  frame?: (context: SceneContext, frame: SceneFrame) => void
  /** Suspend le rendu quand la surface sort de l'ecran. @defaultValue true */
  pauseOffscreen?: boolean
  /** Nom affiche dans le panneau de diagnostic. */
  name?: string
}

/** Etat rendu par {@link useScene}. */
export interface SceneHandle<T extends HTMLElement> {
  /** Ref a poser sur l'element hote du canevas. */
  readonly ref: RefObject<T | null>
  /** `true` une fois la scene construite et la premiere image rendue. */
  readonly ready: boolean
  /**
   * Motif du refus, s'il y en a un. Sa presence signifie que le repli doit
   * rester affiche.
   */
  readonly refused: RefusalReason | 'mouvement-reduit' | undefined
}

/** Plafonds de densite de pixels par niveau de qualite. */
const DPR_CAP: Readonly<Record<QualityLevel, number>> = { low: 1, medium: 1.5, high: 2 }

/**
 * Monte une scene 3D dans une surface arbitree.
 *
 * @example
 * const { ref, refused } = useScene({
 *   name: 'molten',
 *   setup: ({ scene, three, camera }) => {
 *     const mesh = new three.Mesh(
 *       new three.IcosahedronGeometry(1, 32),
 *       new three.MeshStandardMaterial({ metalness: 1, roughness: 0.2 }),
 *     )
 *     scene.add(mesh, new three.DirectionalLight(0xffffff, 2))
 *     camera.position.z = 3
 *   },
 *   frame: ({ scene }, { time }) => {
 *     scene.rotation.y = time * 0.2
 *   },
 * })
 *
 * if (refused !== undefined) return <Poster />
 * return <div ref={ref} className="o-absolute o-inset-0" />
 */
export function useScene<T extends HTMLElement = HTMLDivElement>(
  options: SceneOptions,
): SceneHandle<T> {
  const { setup, frame, pauseOffscreen = true, name = 'scene' } = options

  const ref = useRef<T | null>(null)
  const setupRef = useRef(setup)
  const frameRef = useRef(frame)
  setupRef.current = setup
  frameRef.current = frame

  const [ready, setReady] = useState(false)
  const [refused, setRefused] = useState<SceneHandle<T>['refused']>(undefined)

  useEffect(() => {
    const host = ref.current
    if (host === null) return

    const state = motionPolicy.state
    if (state.reduced) {
      setRefused('mouvement-reduit')
      return
    }

    const result = surfaceManager.acquire({ backend: 'three', name, host })
    if (!result.ok) {
      setRefused(result.reason)
      return
    }

    const { surface } = result
    let disposed = false
    let teardown: (() => void) | undefined

    void import('three')
      .then((three) => {
        if (disposed) return

        const cap = DPR_CAP[state.quality]
        const renderer = new three.WebGLRenderer({
          canvas: surface.canvas,
          antialias: state.quality === 'high',
          alpha: false,
          powerPreference: state.quality === 'low' ? 'low-power' : 'high-performance',
        })
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, cap))
        // Espace colorimetrique et report de tons explicites : leurs valeurs
        // par defaut ont change d'une version a l'autre, et s'en remettre a
        // elles rendrait l'apparence dependante de la version installee.
        renderer.outputColorSpace = three.SRGBColorSpace
        renderer.toneMapping = three.ACESFilmicToneMapping

        const scene = new three.Scene()
        const camera = new three.PerspectiveCamera(45, 1, 0.1, 100)
        camera.position.set(0, 0, 5)
        camera.lookAt(0, 0, 0)

        const targets: WebGLRenderTarget[] = []
        const context: SceneContext = {
          scene,
          camera,
          renderer,
          three,
          quality: state.quality,
          targets,
        }

        const custom = setupRef.current(context)

        const resize = (): void => {
          const width = host.clientWidth || 1
          const height = host.clientHeight || 1
          renderer.setSize(width, height, false)
          camera.aspect = width / height
          camera.updateProjectionMatrix()
        }

        resize()
        // L'anti-rebond est assure par la boucle : le redimensionnement ne fait
        // que marquer, la frame suivante applique.
        let pendingResize = false
        const observer = new ResizeObserver(() => {
          pendingResize = true
        })
        observer.observe(host)

        const subscription = clock.subscribe(
          ({ time, delta, deltaRaw }) => {
            if (pendingResize) {
              pendingResize = false
              resize()
            }
            frameRef.current?.(context, { time, delta, deltaRaw })
            renderer.render(scene, camera)
          },
          { priority: CLOCK_PRIORITY.render, name },
        )

        renderer.render(scene, camera)
        setReady(true)

        let visibility: IntersectionObserver | undefined
        if (pauseOffscreen && typeof IntersectionObserver !== 'undefined') {
          visibility = new IntersectionObserver((entries) => {
            subscription.setActive(entries[0]?.isIntersecting ?? true)
          })
          visibility.observe(host)
        }

        teardown = () => {
          subscription.unsubscribe()
          observer.disconnect()
          visibility?.disconnect()
          custom?.()
          disposeScene({ scene, renderer, targets })
        }
      })
      .catch((cause: unknown) => {
        console.error(`[odoro] scene "${name}" : chargement impossible`, cause)
        setRefused('webgl-indisponible')
      })

    return () => {
      disposed = true
      teardown?.()
      surface.release()
      setReady(false)
    }
    // `setup` et `frame` sont lus par ref : les comparer par identite
    // reconstruirait la scene entiere a chaque rendu.
  }, [name, pauseOffscreen])

  return { ref, ready, refused }
}

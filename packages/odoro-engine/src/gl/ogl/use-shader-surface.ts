/**
 * Effets plein ecran en shader de fragment.
 *
 * ## Pourquoi ce backend plutot que l'autre
 *
 * La question a se poser pour chaque effet : **une camera et un eclairage
 * sont-ils reellement necessaires ?** Un degrade anime, un champ de bruit, une
 * grille en perspective, une distorsion — non. Tout cela se calcule par
 * fragment, sans geometrie ni transformation. Un fond anime confie a un moteur
 * de scene 3D coute un ordre de grandeur de plus pour un rendu que douze
 * kilo-octets produisent.
 *
 * Ce backend n'expose donc ni scene, ni camera : un triangle couvrant l'ecran
 * et un shader de fragment. Ce qui ne rentre pas dans ce cadre releve de
 * l'autre backend.
 *
 * @module
 */

import { type RefObject, useEffect, useRef, useState } from 'react'

import { CLOCK_PRIORITY, clock } from '../../core/clock.js'
import { motionPolicy } from '../../core/motion-policy.js'
import { type RefusalReason, surfaceManager } from '../surface-manager.js'
import { FULLSCREEN_VERTEX } from './shaders.js'

/** Valeur acceptee pour un uniform. */
export type UniformValue = number | readonly number[]

/** Options de {@link useShaderSurface}. */
export interface ShaderSurfaceOptions {
  /** Source du shader de fragment. */
  fragment: string
  /**
   * Valeurs transmises au shader. `uTime` et `uResolution` sont fournis
   * d'office et n'ont pas a etre declares ici.
   */
  uniforms?: Readonly<Record<string, UniformValue>>
  /**
   * Densite de pixels. `auto` la deduit de l'ecran et de la qualite retenue
   * par la politique de mouvement.
   *
   * @defaultValue 'auto'
   */
  dpr?: 'auto' | number
  /**
   * Suspend le rendu quand la surface sort de l'ecran.
   *
   * @defaultValue true
   */
  pauseOffscreen?: boolean
  /** Nom affiche dans le panneau de diagnostic. */
  name?: string
  /**
   * Rend une image unique puis s'arrete. Utile pour un motif fixe dont seule
   * la composition depend du shader.
   *
   * @defaultValue false
   */
  still?: boolean
}

/** Etat rendu par {@link useShaderSurface}. */
export interface ShaderSurfaceHandle<T extends HTMLElement> {
  /** Ref a poser sur l'element hote du canevas. */
  readonly ref: RefObject<T | null>
  /** `true` une fois la surface prete et la premiere image rendue. */
  readonly ready: boolean
  /**
   * Motif du refus, s'il y en a un. Sa presence signifie que l'appelant doit
   * afficher son repli statique.
   */
  readonly refused: RefusalReason | 'mouvement-reduit' | undefined
}

/** Plafonds de densite de pixels par niveau de qualite. */
const DPR_CAP: Readonly<Record<'low' | 'medium' | 'high', number>> = {
  low: 1,
  medium: 1.5,
  high: 2,
}

/**
 * Rend un effet plein ecran dans une surface arbitree.
 *
 * Le rendu passe par la boucle unique du moteur : aucune boucle d'animation
 * n'est ouverte ici, et la priorite basse garantit que l'image est produite
 * apres toutes les mises a jour de la frame.
 *
 * @example
 * const { ref, refused } = useShaderSurface({
 *   fragment: AURORA_FRAGMENT,
 *   uniforms: { uColorA: [0.1, 0.2, 0.9], uSpeed: 0.4, uScale: 3, uOctaves: 4 },
 *   name: 'aurora',
 * })
 *
 * if (refused !== undefined) return <Poster />
 * return <div ref={ref} className="o-absolute o-inset-0" />
 */
export function useShaderSurface<T extends HTMLElement = HTMLDivElement>(
  options: ShaderSurfaceOptions,
): ShaderSurfaceHandle<T> {
  const {
    fragment,
    uniforms,
    dpr = 'auto',
    pauseOffscreen = true,
    name = 'surface',
    still = false,
  } = options

  const ref = useRef<T | null>(null)
  const uniformsRef = useRef(uniforms)
  uniformsRef.current = uniforms

  const [ready, setReady] = useState(false)
  const [refused, setRefused] = useState<ShaderSurfaceHandle<T>['refused']>(undefined)

  useEffect(() => {
    const host = ref.current
    if (host === null) return

    const state = motionPolicy.state
    if (state.reduced) {
      // Un fond anime n'a pas d'etat final a preserver : il n'apporte rien
      // d'autre que son mouvement. On ne le rend donc pas du tout, et
      // l'appelant affiche son repli.
      setRefused('mouvement-reduit')
      return
    }

    const result = surfaceManager.acquire({ backend: 'ogl', name, host })
    if (!result.ok) {
      setRefused(result.reason)
      return
    }

    const { surface } = result
    let disposed = false
    let subscription: ReturnType<typeof clock.subscribe> | undefined
    let observer: ResizeObserver | undefined
    let visibility: IntersectionObserver | undefined
    let dispose: (() => void) | undefined

    void import('ogl')
      .then(({ Renderer, Program, Mesh, Triangle }) => {
        if (disposed) return

        const cap = DPR_CAP[state.quality]
        const density =
          dpr === 'auto'
            ? Math.min(window.devicePixelRatio || 1, cap)
            : Math.min(dpr, cap)

        const renderer = new Renderer({
          canvas: surface.canvas,
          dpr: density,
          alpha: false,
        })
        const gl = renderer.gl

        // `fwidth` exige WebGL 2, ou l'extension correspondante en WebGL 1 :
        // sans cette declaration, le shader ne compile pas sur les anciennes
        // plateformes et l'effet disparait sans message.
        const isWebgl2 =
          'drawBuffers' in gl && typeof WebGL2RenderingContext !== 'undefined'
        const source =
          isWebgl2 || !fragment.includes('fwidth')
            ? fragment
            : `#extension GL_OES_standard_derivatives : enable\n${fragment}`

        const declared: Record<string, { value: UniformValue }> = {
          uTime: { value: 0 },
          uResolution: { value: [1, 1] },
        }
        for (const [key, value] of Object.entries(uniformsRef.current ?? {})) {
          declared[key] = { value }
        }

        const geometry = new Triangle(gl)
        const program = new Program(gl, {
          vertex: FULLSCREEN_VERTEX,
          fragment: source,
          uniforms: declared,
        })
        const mesh = new Mesh(gl, { geometry, program })

        const resize = (): void => {
          const width = host.clientWidth || 1
          const height = host.clientHeight || 1
          renderer.setSize(width, height)
          declared['uResolution'] = { value: [gl.canvas.width, gl.canvas.height] }
          program.uniforms['uResolution'] = declared['uResolution']
        }

        resize()
        observer = new ResizeObserver(resize)
        observer.observe(host)

        const draw = (time: number): void => {
          program.uniforms['uTime'] = { value: time }
          // Les valeurs fournies par l'appelant sont relues a chaque image :
          // changer une prop suffit a modifier le rendu, sans remontage.
          for (const [key, value] of Object.entries(uniformsRef.current ?? {})) {
            program.uniforms[key] = { value }
          }
          renderer.render({ scene: mesh })
        }

        draw(0)
        setReady(true)

        if (!still) {
          subscription = clock.subscribe(({ time }) => draw(time), {
            priority: CLOCK_PRIORITY.render,
            name,
          })

          if (pauseOffscreen && typeof IntersectionObserver !== 'undefined') {
            visibility = new IntersectionObserver((entries) => {
              const visible = entries[0]?.isIntersecting ?? true
              // L'abonnement est suspendu, pas retire : il conserve sa place
              // dans l'ordre de la frame et son etat.
              subscription?.setActive(visible)
            })
            visibility.observe(host)
          }
        }

        dispose = () => {
          // Chaque ressource graphique doit etre relachee explicitement : rien
          // n'est libere automatiquement, et un oubli se paie en memoire qui
          // ne redescend jamais.
          geometry.remove()
          program.remove()
          const lose = gl.getExtension('WEBGL_lose_context') as {
            loseContext?: () => void
          } | null
          lose?.loseContext?.()
        }
      })
      .catch((cause: unknown) => {
        console.error(`[odoro] surface "${name}" : chargement impossible`, cause)
        setRefused('webgl-indisponible')
      })

    return () => {
      disposed = true
      subscription?.unsubscribe()
      observer?.disconnect()
      visibility?.disconnect()
      dispose?.()
      surface.release()
      setReady(false)
    }
    // `uniforms` est relu par ref a chaque image : le comparer par identite
    // reconstruirait la surface a chaque rendu.
  }, [fragment, dpr, pauseOffscreen, name, still])

  return { ref, ready, refused }
}

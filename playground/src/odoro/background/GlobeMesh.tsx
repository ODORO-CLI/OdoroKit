/**
 * Globe : une boule de points dans une cage filaire qui scintille.
 *
 * Trois dessins partagent une rotation :
 *
 * - **les points**, une sphère de Fibonacci où chaque point ne porte qu'une
 *   direction et une graine. Son rayon, sa taille et sa couleur sont dérivés
 *   dans le shader ; plusieurs milliers coûtent donc un appel de dessin, et
 *   rien n'est écrit par image ;
 * - **la cage**, les arêtes d'un icosaèdre subdivisé, parcourues par un éclat
 *   qui court le long de chaque fil ou traverse la boule d'une bande ;
 * - **les panneaux**, les faces du même icosaèdre, invisibles jusqu'à ce que le
 *   pointeur arrive.
 *
 * ## Ce que le portage a changé, et pourquoi
 *
 * **Le shader ne compilait pas.** Le fragment de la cage écrivait
 * `float head = fract(vSeed + uTime * uShimmer)` sans point-virgule. WebGL ne
 * lève rien qu'on voie : la cage était simplement absente.
 *
 * **Les réglages étaient recalculés à chaque image.** `settingsFor` était
 * appelée depuis la boucle *et* depuis le calcul du pointeur, allouant deux
 * objets par image pour des valeurs qui ne changent qu'à l'édition d'une prop.
 * Elles sont désormais mémorisées.
 *
 * **La boucle, l'observateur de taille et la caméra étaient tenus à la main.**
 * Le moteur les porte déjà : `useScene` arbitre la surface, suit le
 * redimensionnement, suspend hors du champ et s'abonne à la boucle unique. Un
 * `requestAnimationFrame` de plus, c'est deux boucles concurrentes sur la page.
 *
 * **Les couleurs étaient écrites en dur** — un blanc, un vert, un lilas, deux
 * teintes de vague. Elles viennent de la palette.
 *
 * ## Le pointeur est une direction, pas une position
 *
 * Son rayon est intersecté avec la boule, et le point touché est repoussé à
 * travers la rotation du groupe, dans l'espace objet. C'est ce qui permet à un
 * panneau allumé de rester sur la même face pendant que le globe tourne.
 * Comparer des positions d'écran laisse au contraire la tache immobile pendant
 * que la géométrie glisse dessous.
 *
 * @module
 */

import {
  mergePresentation,
  readTokenColour,
  useMotionState,
  type Customisable,
} from '@odoro-cli/engine'
import { useScene, type SceneContext, type SceneFrame } from '@odoro-cli/engine/three'
import { useEffect, useMemo, useRef, useState, type ReactElement } from 'react'

import { usePoster } from '@/odoro/hooks/usePoster'

import {
  GLOBE_CAGE_FRAGMENT,
  GLOBE_CAGE_VERTEX,
  GLOBE_PANEL_FRAGMENT,
  GLOBE_PANEL_VERTEX,
  GLOBE_POINT_FRAGMENT,
  GLOBE_POINT_VERTEX,
  GLOBE_SOURCES,
} from './globe-mesh.shader.js'

/** Style de l'eclat qui parcourt la cage. */
export type GlobeShimmer = 'edge' | 'sweep'

/** Proprietes propres au composant. */
export interface GlobeMeshOwnProps {
  /** Densite du nuage, de 1 a 20. @defaultValue 14 */
  density?: number
  /** Vitesse de rotation, de 0 a 20. Zero n'arrete que la derive propre. @defaultValue 8 */
  spin?: number
  /** Sens de rotation. @defaultValue 'right' */
  spinDir?: 'left' | 'right'
  /** Subdivision de la cage, de 0 a 3. @defaultValue 1 */
  detail?: number
  /** Style de l'eclat. @defaultValue 'sweep' */
  shimmer?: GlobeShimmer
  /** Angle du balayage, en degres. @defaultValue 90 */
  sweepAngle?: number
  /** Reagit au pointeur. @defaultValue true */
  interactive?: boolean
  /** Tokens des points, de la cage, de l'eclat et des deux vagues. */
  colors?: readonly [string, string, string, string, string]
  /** Classes du repli. */
  poster?: string
}

/** Toutes les proprietes. */
export type GlobeMeshProps = Customisable<GlobeMeshOwnProps>

/** Tokens employes par defaut. */
const DEFAULT_TOKENS = [
  '--o-palette-zinc-50',
  '--o-palette-emerald-400',
  '--o-palette-violet-300',
  '--o-palette-sky-400',
  '--o-palette-rose-400',
] as const

/** Repli par defaut. */
const DEFAULT_POSTER = 'o-bg-gradient-to-br o-from-zinc-900 o-to-zinc-950'

/** Distance de la cage au nuage de points. */
const CAGE = 1.18

/** Sensibilite du glissement, en radians par pixel. */
const DRAG = 0.021

/** Borne une valeur. */
function clamp(value: number, low: number, high: number): number {
  return Math.max(low, Math.min(high, Number.isFinite(value) ? value : low))
}

/**
 * Globe de points dans une cage filaire.
 *
 * @example
 * <div className="o-relative o-h-96">
 *   <GlobeMesh className="o-absolute o-inset-0" />
 * </div>
 *
 * @example
 * // L'eclat court le long des aretes plutot que de balayer la boule.
 * <GlobeMesh shimmer="edge" detail={2} />
 */
export function GlobeMesh({
  density = 14,
  spin = 8,
  spinDir = 'right',
  detail = 1,
  shimmer = 'sweep',
  sweepAngle = 90,
  interactive = true,
  colors = DEFAULT_TOKENS,
  poster = DEFAULT_POSTER,
  ...rest
}: GlobeMeshProps): ReactElement {
  const { quality, reduced } = useMotionState()
  const [element, setElement] = useState<HTMLElement | null>(null)

  const tokenList = colors.join(' ')
  const [shades, setShades] = useState<readonly (readonly number[])[]>([])

  useEffect(() => {
    if (element === null) return
    setShades(tokenList.split(' ').map((token) => readTokenColour(token, element)))
  }, [element, tokenList, reduced, quality])

  // Les reglages ne dependent que des props : les recalculer par image, comme
  // le faisait l'original, alloue deux objets pour des valeurs immobiles.
  const settings = useMemo(() => {
    const level = clamp(density, 1, 20)
    return {
      points: Math.round(300 + level * level * 22),
      detail: Math.round(clamp(detail, 0, 3)),
      edgeMix: shimmer === 'sweep' ? 0 : 1,
      sweepMix: shimmer === 'sweep' ? 1 : 0,
      sweepAxis: clamp(sweepAngle, 0, 360) * (Math.PI / 180),
      spin: clamp(spin, 0, 20) * 0.055 * (spinDir === 'left' ? -1 : 1),
    }
  }, [density, detail, shimmer, sweepAngle, spin, spinDir])

  const shadesRef = useRef(shades)
  shadesRef.current = shades
  const settingsRef = useRef(settings)
  settingsRef.current = settings

  /** Ce que le pointeur vise, et la confiance qu'on lui accorde. */
  const aim = useRef({ x: 0, y: 0, grip: 0, target: 0 })
  /** Rotation accumulee : la derive propre, puis le glissement. */
  const turn = useRef({ angle: 0, dragX: 0, dragY: 0, velX: 0, velY: 0 })
  const dragging = useRef(false)
  const last = useRef({ x: 0, y: 0 })

  const { ref, ready, refused } = useScene<HTMLDivElement>({
    name: 'globe',
    setup: (context: SceneContext) => {
      const { scene, camera, three, quality: level } = context
      const tints = shadesRef.current
      if (tints.length < 5) return

      const s = settingsRef.current
      const colour = (index: number): InstanceType<typeof three.Color> => {
        const rgb = tints[index] ?? [1, 1, 1]
        return new three.Color(rgb[0] ?? 1, rgb[1] ?? 1, rgb[2] ?? 1)
      }

      camera.position.set(0, 0, 6.7)

      const group = new three.Group()
      group.name = 'globe'
      scene.add(group)

      // Trois directions ni coplanaires ni voisines, chacune tournant autour
      // de son propre axe. Des departs au hasard donnaient un bon resultat une
      // fois sur trois et des amas les autres fois.
      const sources = [
        new three.Vector3(-0.6, -0.45, 0.65).normalize(),
        new three.Vector3(0.72, 0.35, 0.6).normalize(),
        new three.Vector3(0.1, 0.9, -0.42).normalize(),
      ]
      const axes = [
        new three.Vector3(0.2, 1, 0.1).normalize(),
        new three.Vector3(-0.8, 0.4, 0.3).normalize(),
        new three.Vector3(0.3, -0.5, 0.9).normalize(),
      ]

      const waveA = colour(3)
      const waveB = colour(4)

      // Un seul jeu d'uniformes partage : les points, la cage et les panneaux
      // ne peuvent alors pas se desynchroniser d'une image.
      const shared = {
        uTime: { value: 0 },
        uSpread: { value: 0.525 },
        uIntensity: { value: 0.825 },
        uWave: { value: 0.77 },
        uSource: { value: sources.map((v) => v.clone()) },
        uSourceColor: {
          value: [waveA.clone(), waveB.clone(), waveA.clone().lerp(waveB, 0.35)],
        },
        uHoverDir: { value: new three.Vector3(0, 0, 1) },
        uHover: { value: 0 },
        uHoverArc: { value: 0.745 },
      }
      const cageColours = {
        uNet: { value: colour(1) },
        uShimmerColor: { value: colour(2) },
        uShimmer: { value: 0.27 },
        uEdgeMix: { value: s.edgeMix },
        uSweepMix: { value: s.sweepMix },
        uSweepAxis: { value: s.sweepAxis },
        uSweepWidth: { value: 0.204 },
      }

      const count = level === 'low' ? Math.round(s.points * 0.4) : s.points
      const golden = Math.PI * (3 - Math.sqrt(5))
      const dirs = new Float32Array(count * 3)
      const seeds = new Float32Array(count)
      for (let index = 0; index < count; index += 1) {
        const y = 1 - (index / Math.max(1, count - 1)) * 2
        const radius = Math.sqrt(Math.max(0, 1 - y * y))
        const theta = golden * index
        dirs[index * 3] = Math.cos(theta) * radius
        dirs[index * 3 + 1] = y
        dirs[index * 3 + 2] = Math.sin(theta) * radius
        seeds[index] = Math.abs(Math.sin(index * 127.1 + 311.7) * 43758.5453) % 1
      }

      const cloud = new three.BufferGeometry()
      // `position` est exige par three meme si le shader reconstruit le point
      // depuis `aDir` : sans lui la plage de dessin est nulle.
      cloud.setAttribute('position', new three.BufferAttribute(dirs, 3))
      cloud.setAttribute('aDir', new three.BufferAttribute(dirs, 3))
      cloud.setAttribute('aSeed', new three.BufferAttribute(seeds, 1))
      cloud.boundingSphere = new three.Sphere(new three.Vector3(), 2)

      const pointMaterial = new three.ShaderMaterial({
        vertexShader: GLOBE_POINT_VERTEX,
        fragmentShader: GLOBE_POINT_FRAGMENT,
        uniforms: {
          ...shared,
          uRadius: { value: 1 },
          uDotSize: { value: 0.0144 },
          uWobble: { value: 0.033 },
          uFlicker: { value: 0.294 },
          uViewHeight: { value: 600 },
          uDot: { value: colour(0) },
        },
        transparent: true,
        blending: three.AdditiveBlending,
        depthWrite: false,
        depthTest: false,
      })

      const points = new three.Points(cloud, pointMaterial)
      // Le shader deplace les points hors de la surface : le calcul de culling
      // de three ne peut pas savoir ou ils sont reellement.
      points.frustumCulled = false
      group.add(points)

      // La cage et ses panneaux, tires du meme icosaedre.
      const solid = new three.IcosahedronGeometry(CAGE, s.detail)
      const edges = new three.EdgesGeometry(solid)
      const edgePos = edges.attributes['position']
      if (edgePos !== undefined) {
        const total = edgePos.count
        const param = new Float32Array(total)
        const edgeSeed = new Float32Array(total)
        for (let index = 0; index < total; index += 2) {
          param[index] = 0
          param[index + 1] = 1
          const mx = (edgePos.getX(index) + edgePos.getX(index + 1)) * 0.5
          const my = (edgePos.getY(index) + edgePos.getY(index + 1)) * 0.5
          const mz = (edgePos.getZ(index) + edgePos.getZ(index + 1)) * 0.5
          const seed =
            Math.abs(Math.sin(mx * 127.1 + my * 311.7 + mz * 74.7) * 43758.5453) % 1
          edgeSeed[index] = seed
          edgeSeed[index + 1] = seed
        }
        edges.setAttribute('aEdge', new three.BufferAttribute(param, 1))
        edges.setAttribute('aSeed', new three.BufferAttribute(edgeSeed, 1))
      }

      // L'icosaedre sort non indexe : les positions sont deja en triplets, et
      // le centre de chaque face est a trois sommets d'ecart.
      const facePos = solid.attributes['position']
      if (facePos !== undefined) {
        const total = facePos.count
        const centre = new Float32Array(total * 3)
        const faceSeed = new Float32Array(total)
        for (let index = 0; index < total; index += 3) {
          let cx = 0
          let cy = 0
          let cz = 0
          for (let k = 0; k < 3; k += 1) {
            cx += facePos.getX(index + k)
            cy += facePos.getY(index + k)
            cz += facePos.getZ(index + k)
          }
          cx /= 3
          cy /= 3
          cz /= 3
          const seed =
            Math.abs(Math.sin(cx * 269.5 + cy * 183.3 + cz * 246.1) * 43758.5453) % 1
          for (let k = 0; k < 3; k += 1) {
            centre[(index + k) * 3] = cx
            centre[(index + k) * 3 + 1] = cy
            centre[(index + k) * 3 + 2] = cz
            faceSeed[index + k] = seed
          }
        }
        solid.setAttribute('aFace', new three.BufferAttribute(centre, 3))
        solid.setAttribute('aSeed', new three.BufferAttribute(faceSeed, 1))
      }

      const cageMaterial = new three.ShaderMaterial({
        vertexShader: GLOBE_CAGE_VERTEX,
        fragmentShader: GLOBE_CAGE_FRAGMENT,
        uniforms: {
          ...shared,
          ...cageColours,
          uNetGlow: { value: 0.825 },
          uHoverGlow: { value: 0.99 },
        },
        transparent: true,
        blending: three.AdditiveBlending,
        depthWrite: false,
        depthTest: false,
      })

      const panelMaterial = new three.ShaderMaterial({
        vertexShader: GLOBE_PANEL_VERTEX,
        fragmentShader: GLOBE_PANEL_FRAGMENT,
        uniforms: { ...shared, ...cageColours, uFill: { value: 0.063 } },
        transparent: true,
        blending: three.AdditiveBlending,
        depthWrite: false,
        depthTest: false,
        // Les deux faces : un panneau du fond doit se voir a travers la boule
        // plutot que d'etre un trou dans le remplissage.
        side: three.DoubleSide,
      })

      const cage = new three.LineSegments(edges, cageMaterial)
      const panels = new three.Mesh(solid, panelMaterial)
      cage.frustumCulled = false
      panels.frustumCulled = false
      group.add(panels)
      group.add(cage)

      // Le pointeur : son rayon coupe la boule, et le point touche revient
      // dans l'espace du groupe.
      const hit = new three.Vector3()
      const readAim = (): void => {
        const { x, y } = aim.current
        const half = 3.2
        let dx = x * half
        let dy = y * half
        let dz = -6.7
        const length = Math.hypot(dx, dy, dz) || 1
        dx /= length
        dy /= length
        dz /= length

        const b = 6.7 * dz
        const c = 6.7 * 6.7 - CAGE * CAGE
        const disc = b * b - c
        // Un rate se rabat sur le point d'approche la plus proche : la tache
        // glisse alors le long du bord au lieu de rester collee.
        const t = disc > 0 ? -b - Math.sqrt(disc) : -b

        hit.set(dx * t, dy * t, 6.7 + dz * t)
        group.updateMatrixWorld()
        group.worldToLocal(hit)
        if (hit.lengthSq() > 1e-8) {
          const target = shared.uHoverDir.value
          target.copy(hit.normalize())
        }
      }

      // La boucle du moteur pilote tout : rien n'est ouvert ici.
      const advance = (frame: SceneFrame): void => {
        const delta = Math.min(frame.delta, 0.05)
        shared.uTime.value = frame.time

        for (let index = 0; index < GLOBE_SOURCES; index += 1) {
          const source = sources[index]
          const axis = axes[index]
          const live = (shared.uSource.value as InstanceType<typeof three.Vector3>[])[
            index
          ]
          if (source === undefined || axis === undefined || live === undefined) continue
          source.applyAxisAngle(axis, delta * 0.77 * (0.35 + index * 0.12)).normalize()
          live.copy(source)
        }

        const state = turn.current
        if (!dragging.current) {
          const decay = Math.exp(-delta * 3)
          state.dragY += state.velY
          state.dragX += state.velX
          state.velX *= decay
          state.velY *= decay
          state.angle += settingsRef.current.spin * delta
        }

        group.rotation.y = state.angle + state.dragY
        // Basculee au-dela, la boule perd sa vue de trois quarts et la cage
        // s'ecrase en anneaux concentriques.
        group.rotation.x = clamp(state.dragX * 0.5, -1, 1)

        const pointer = aim.current
        pointer.grip += (pointer.target - pointer.grip) * (1 - Math.exp(-delta * 5))
        shared.uHover.value = pointer.grip
        if (pointer.grip > 0.001) readAim()

        pointMaterial.uniforms['uViewHeight'] = {
          value: context.renderer.domElement.height,
        }
      }

      // La fonction d'avance est rangee sur le groupe : `frame` la retrouve
      // sans qu'une ref supplementaire ait a la porter.
      group.userData['advance'] = advance

      return () => {
        scene.remove(group)
        cloud.dispose()
        edges.dispose()
        solid.dispose()
        pointMaterial.dispose()
        cageMaterial.dispose()
        panelMaterial.dispose()
      }
    },
    frame: ({ scene }, frame) => {
      const group = scene.getObjectByName('globe')
      const advance = group?.userData['advance']
      if (typeof advance === 'function') advance(frame)
    },
  })

  // Le pointeur : lu sur l'hote, jamais sur la fenetre entiere.
  useEffect(() => {
    if (element === null || !interactive || reduced) return

    const move = (event: PointerEvent): void => {
      const box = element.getBoundingClientRect()
      if (box.width > 0 && box.height > 0) {
        aim.current.x = ((event.clientX - box.left) / box.width) * 2 - 1
        aim.current.y = -(((event.clientY - box.top) / box.height) * 2 - 1)
      }
      if (!dragging.current) return
      const dx = event.clientX - last.current.x
      const dy = event.clientY - last.current.y
      last.current = { x: event.clientX, y: event.clientY }
      turn.current.dragY += dx * DRAG
      turn.current.dragX += dy * DRAG
      // Conserve pour que le globe continue de tourner apres le relachement.
      turn.current.velY = dx * DRAG
      turn.current.velX = dy * DRAG
    }

    const down = (event: PointerEvent): void => {
      dragging.current = true
      last.current = { x: event.clientX, y: event.clientY }
      turn.current.velX = 0
      turn.current.velY = 0
    }
    const up = (): void => {
      dragging.current = false
    }
    // `enter` et `leave`, pas `over` et `out` : ces derniers se declenchent
    // aussi quand le pointeur passe d'un enfant a l'autre.
    const enter = (): void => {
      aim.current.target = 1
    }
    const leave = (): void => {
      aim.current.target = 0
      up()
    }

    element.addEventListener('pointerdown', down)
    element.addEventListener('pointerenter', enter)
    element.addEventListener('pointerleave', leave)
    element.addEventListener('pointercancel', leave)
    window.addEventListener('pointermove', move, { passive: true })
    window.addEventListener('pointerup', up)

    return () => {
      element.removeEventListener('pointerdown', down)
      element.removeEventListener('pointerenter', enter)
      element.removeEventListener('pointerleave', leave)
      element.removeEventListener('pointercancel', leave)
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
    }
  }, [element, interactive, reduced])

  const waiting = usePoster({ ready, refused })

  const { className, style } = mergePresentation(
    { className: 'o-relative o-overflow-hidden' },
    rest,
  )

  return (
    <div
      {...rest}
      ref={(node) => {
        setElement(node)
        ref.current = node
      }}
      className={className}
      style={{ touchAction: 'none', ...style }}
      role="img"
      aria-label="Globe de points dans une cage filaire"
    >
      {waiting.visible ? (
        <div style={waiting.style} className={`o-absolute o-inset-0 ${poster}`} />
      ) : null}
    </div>
  )
}

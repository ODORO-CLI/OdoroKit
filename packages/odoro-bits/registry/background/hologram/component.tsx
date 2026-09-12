/**
 * Hologramme : une sphere en lignes de latitude et de longitude, projetee
 * au-dessus d'un socle, qui tourne, scintille et se fait balayer.
 *
 * ## Pourquoi des lignes, et un programme a part
 *
 * Une sphere en lignes est une geometrie fixe : des cercles, construits une
 * fois. Ce qui la fait hologramme n'est pas dans la geometrie mais dans la
 * facon de la peindre — la face arriere qui s'efface, la bande qui monte,
 * les stries — et cela tient dans un programme de fragment de dix lignes,
 * nourri par la hauteur et l'orientation de chaque point. Un materiau
 * ordinaire n'en donnerait qu'une couleur plate.
 *
 * ## Le scintillement
 *
 * Il est hache par paliers, jamais continu : a chaque palier, un tirage
 * fixe la luminance, et pendant les rafales — un palier lent sur quatre —
 * l'image entiere saute de quelques millimetres de cote. Un hologramme de
 * cinema tremble, il ne respire pas.
 *
 * Ce qui distingue cette entree de `globe-mesh` : pas de nuage de points,
 * pas de cage d'icosaedre, pas de pointeur — des meridiens et des
 * paralleles, un socle, et une bande qui balaie ; et de `orbital-sphere` :
 * une sphere vide, pas un nuage ceint d'anneaux.
 *
 * ## Ce que ce composant ne fait pas
 *
 * Il n'ouvre ni boucle d'animation, ni observateur : `useScene` les porte.
 * Il n'ecrit aucune couleur : le fond, les lignes et la bande sont lus dans
 * les tokens, et repeints en place quand le theme bascule.
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

import { HOLOGRAM_FRAGMENT, HOLOGRAM_VERTEX } from './hologram.shader.js'

/** Proprietes propres au composant. */
export interface HologramOwnProps {
  /** Nombre de meridiens. @defaultValue 12 */
  meridians?: number
  /** Nombre de paralleles. @defaultValue 7 */
  parallels?: number
  /** Vitesse de rotation, en tours par minute. @defaultValue 4 */
  rpm?: number
  /** Force du scintillement et des sauts. Zero les coupe. @defaultValue 0.5 */
  flicker?: number
  /** Tokens : le fond, les lignes, la bande de balayage. */
  colors?: readonly [string, string, string]
  /** Classes du repli. */
  poster?: string
}

/** Toutes les proprietes. */
export type HologramProps = Customisable<HologramOwnProps>

/** Tokens employes par defaut. */
const DEFAULT_TOKENS = [
  '--o-theme-bg',
  '--o-palette-cyan-500',
  '--o-theme-fg',
] as const

/** Repli par defaut : un halo fige, dans les memes tons. */
const DEFAULT_POSTER =
  'o-bg-gradient-to-b o-from-zinc-50 dark:o-from-zinc-950 o-via-cyan-100 dark:o-via-cyan-950 o-to-zinc-50 dark:o-to-zinc-950'

/** Rayon de la sphere, en unites de scene. */
const RADIUS = 1.25

/** Hauteur du socle sous le centre de la sphere. */
const BASE_DEPTH = 1.75

/**
 * Segments par cercle, selon la qualite.
 *
 * Chaque segment est deux sommets : le cout croit lineairement avec leur
 * nombre, et c'est le seul levier qui compte ici.
 */
const SEGMENTS = { high: 96, medium: 72, low: 40 } as const

/** Nombre pseudo-aleatoire, stable par palier. */
function hash(step: number): number {
  const x = Math.sin(step * 12.9898) * 43758.5453
  return x - Math.floor(x)
}

type Three = SceneContext['three']
type Group = InstanceType<Three['Group']>
type ShaderMaterial = InstanceType<Three['ShaderMaterial']>
type LineMaterial = InstanceType<Three['LineBasicMaterial']>
type PointsMaterial = InstanceType<Three['PointsMaterial']>

/** Ce que la boucle touche : le groupe, et les materiaux a repeindre. */
interface Living {
  readonly group: Group
  readonly sphere: Group
  readonly lines: ShaderMaterial
  readonly base: LineMaterial
  readonly dots: PointsMaterial
  /** Vitesse angulaire, en radians par seconde. */
  readonly rate: number
  /** Dernier palier de scintillement applique. */
  step: number
}

/**
 * Un cercle de rayon donne, dans un plan, en paires de sommets.
 *
 * @param push Recoit chaque sommet.
 * @param place Position d'un angle sur le cercle.
 */
function circle(
  segments: number,
  push: (x: number, y: number, z: number) => void,
  place: (angle: number) => readonly [number, number, number],
): void {
  for (let s = 0; s < segments; s += 1) {
    const a = (s / segments) * Math.PI * 2
    const b = ((s + 1) / segments) * Math.PI * 2
    push(...place(a))
    push(...place(b))
  }
}

/**
 * Hologramme.
 *
 * @example
 * <div className="o-relative o-h-96 o-overflow-hidden">
 *   <Hologram className="o-absolute o-inset-0" />
 *   <div className="o-relative">…</div>
 * </div>
 */
export function Hologram({
  meridians = 12,
  parallels = 7,
  rpm = 4,
  flicker = 0.5,
  colors = DEFAULT_TOKENS,
  poster = DEFAULT_POSTER,
  ...rest
}: HologramProps): ReactElement {
  const { theme } = useMotionState()
  const [host, setHost] = useState<HTMLElement | null>(null)

  const living = useRef<Living | null>(null)
  const context = useRef<SceneContext | null>(null)

  const { ref, ready, refused } = useScene({
    name: 'hologramme',
    setup: (scene) => {
      context.current = scene
      const { three, renderer, camera, quality } = scene

      const [bg, line, scan] = colors.map((token) => readTokenColour(token, host))
      renderer.setClearColor(
        new three.Color(bg?.[0] ?? 0, bg?.[1] ?? 0, bg?.[2] ?? 0).convertSRGBToLinear(),
        1,
      )

      // La camera est un peu au-dessus du socle : de face, le socle ne
      // serait qu'un trait.
      camera.position.set(0, 0.7, 4.4)
      camera.lookAt(0, -0.2, 0)

      const segments = SEGMENTS[quality]
      const meridianCount = Math.max(Math.round(meridians), 2)
      const parallelCount = Math.max(Math.round(parallels), 1)

      // Les meridiens : des cercles complets dans des plans tournes autour
      // de l'axe vertical. Les paralleles : des cercles horizontaux, a
      // latitudes regulieres.
      const positions: number[] = []
      const push = (x: number, y: number, z: number): void => {
        positions.push(x, y, z)
      }
      for (let m = 0; m < meridianCount; m += 1) {
        const phi = (m / meridianCount) * Math.PI
        circle(segments, push, (angle) => [
          Math.cos(angle) * Math.cos(phi) * RADIUS,
          Math.sin(angle) * RADIUS,
          Math.cos(angle) * Math.sin(phi) * RADIUS,
        ])
      }
      const latitudes: number[] = []
      for (let k = 1; k <= parallelCount; k += 1) {
        const latitude = -Math.PI / 2 + (Math.PI * k) / (parallelCount + 1)
        latitudes.push(latitude)
        const r = Math.cos(latitude) * RADIUS
        const y = Math.sin(latitude) * RADIUS
        circle(segments, push, (angle) => [Math.cos(angle) * r, y, Math.sin(angle) * r])
      }

      const geometry = new three.BufferGeometry()
      geometry.setAttribute(
        'position',
        new three.BufferAttribute(new Float32Array(positions), 3),
      )

      const lines = new three.ShaderMaterial({
        vertexShader: HOLOGRAM_VERTEX,
        fragmentShader: HOLOGRAM_FRAGMENT,
        transparent: true,
        depthWrite: false,
        uniforms: {
          uTime: { value: 0 },
          uLine: { value: new three.Color(line?.[0] ?? 0, line?.[1] ?? 0, line?.[2] ?? 0) },
          uScan: { value: new three.Color(scan?.[0] ?? 0, scan?.[1] ?? 0, scan?.[2] ?? 0) },
          uScanPos: { value: 0 },
          uFlick: { value: 1 },
          uOpacity: { value: 0.75 },
        },
      })

      // Les noeuds : un point a chaque croisement d'un meridien et d'un
      // parallele. Ce sont eux qui donnent la sphere a lire quand les
      // lignes de dos s'effacent.
      const dotPositions: number[] = []
      for (let m = 0; m < meridianCount * 2; m += 1) {
        const phi = (m / meridianCount) * Math.PI
        for (const latitude of latitudes) {
          const r = Math.cos(latitude) * RADIUS
          dotPositions.push(Math.cos(phi) * r, Math.sin(latitude) * RADIUS, Math.sin(phi) * r)
        }
      }
      const dotGeometry = new three.BufferGeometry()
      dotGeometry.setAttribute(
        'position',
        new three.BufferAttribute(new Float32Array(dotPositions), 3),
      )
      const dots = new three.PointsMaterial({
        size: 0.035,
        transparent: true,
        opacity: 0.85,
        depthWrite: false,
      })
      dots.color.setRGB(line?.[0] ?? 0, line?.[1] ?? 0, line?.[2] ?? 0)

      const sphere = new three.Group()
      sphere.add(new three.LineSegments(geometry, lines))
      sphere.add(new three.Points(dotGeometry, dots))

      // Le socle : trois anneaux concentriques a plat, sous la sphere. Ils
      // ne tournent pas — c'est le projecteur, pas la projection.
      const basePositions: number[] = []
      const pushBase = (x: number, y: number, z: number): void => {
        basePositions.push(x, y, z)
      }
      for (const r of [0.55, 0.85, 1.15]) {
        circle(segments, pushBase, (angle) => [
          Math.cos(angle) * r,
          -BASE_DEPTH,
          Math.sin(angle) * r,
        ])
      }
      const baseGeometry = new three.BufferGeometry()
      baseGeometry.setAttribute(
        'position',
        new three.BufferAttribute(new Float32Array(basePositions), 3),
      )
      const base = new three.LineBasicMaterial({
        transparent: true,
        opacity: 0.45,
        depthWrite: false,
      })
      base.color.setRGB(line?.[0] ?? 0, line?.[1] ?? 0, line?.[2] ?? 0)

      const group = new three.Group()
      group.name = 'hologramme'
      group.add(sphere)
      group.add(new three.LineSegments(baseGeometry, base))
      scene.scene.add(group)

      living.current = {
        group,
        sphere,
        lines,
        base,
        dots,
        rate: (rpm * Math.PI * 2) / 60,
        step: -1,
      }

      return () => {
        scene.scene.remove(group)
        living.current = null
      }
    },

    frame: (_, { time, delta }) => {
      const live = living.current
      if (live === null) return

      live.sphere.rotation.y += live.rate * delta
      live.sphere.position.y = Math.sin(time * 0.8) * 0.06

      const uniforms = live.lines.uniforms
      const timeUniform = uniforms['uTime']
      const scanUniform = uniforms['uScanPos']
      const flickUniform = uniforms['uFlick']
      if (timeUniform !== undefined) timeUniform.value = time
      if (scanUniform !== undefined) {
        // La bande monte a travers la sphere et la depasse aux deux bouts,
        // pour ne pas sembler rebondir.
        scanUniform.value = (-1.3 + 2.6 * ((time * 0.3) % 1)) * RADIUS
      }

      // Le scintillement, par paliers : un tirage fixe la luminance, et
      // pendant les rafales l'image saute de cote.
      const step = Math.floor(time * 20)
      if (step !== live.step) {
        live.step = step
        const burst = hash(Math.floor(time * 2) + 0.5) > 0.7 ? 1 : 0
        const level = 1 - flicker * (0.35 * hash(step) + 0.3 * burst * hash(step + 0.25))
        if (flickUniform !== undefined) flickUniform.value = level
        live.dots.opacity = 0.85 * level
        live.group.position.x = burst * flicker * (hash(step + 0.75) - 0.5) * 0.12
      }
    },
  })

  // Le theme a bascule : les tokens sont relus et les couleurs repeintes en
  // place. La scene n'est pas reconstruite.
  useEffect(() => {
    const scene = context.current
    const live = living.current
    if (scene === null || live === null) return
    const [bg, line, scan] = colors.map((token) => readTokenColour(token, host))
    if (line !== undefined) {
      const lineUniform = live.lines.uniforms['uLine']
      if (lineUniform !== undefined) lineUniform.value.setRGB(line[0], line[1], line[2])
      live.base.color.setRGB(line[0], line[1], line[2])
      live.dots.color.setRGB(line[0], line[1], line[2])
    }
    if (scan !== undefined) {
      const scanUniform = live.lines.uniforms['uScan']
      if (scanUniform !== undefined) scanUniform.value.setRGB(scan[0], scan[1], scan[2])
    }
    if (bg !== undefined) {
      scene.renderer.setClearColor(
        new scene.three.Color(bg[0], bg[1], bg[2]).convertSRGBToLinear(),
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

/**
 * Noeud torique : un tore noue en fil de fer, qui tourne, et le long duquel
 * courent quelques impulsions.
 *
 * ## Pourquoi un solide opaque sous le fil de fer
 *
 * Un fil de fer seul montre ses arretes de dos autant que celles de face, et
 * un noeud torique en a assez pour que le volume devienne illisible — on voit
 * une pelote, pas un noeud. Le meme solide est donc dessine dessous, opaque,
 * de la couleur du fond : il masque ce qui passe derriere sans rien ajouter a
 * l'image. C'est le trace en lignes cachees, obtenu par la profondeur au lieu
 * d'un calcul.
 *
 * Le decalage de polygone existe pour ce cas precis : sans lui, l'arrete et
 * la face qui la porte sont a la meme profondeur, et le fil clignote.
 *
 * ## Les impulsions
 *
 * Elles suivent la courbe guide du noeud, celle-la meme dont la geometrie est
 * tiree : deux cosinus et un sinus, la formule tient en cinq lignes. Elles
 * donnent le sens du parcours, qu'une rotation seule ne dit pas. Leur rayon
 * depasse celui du tube, sans quoi le solide masquant les avalerait.
 *
 * ## Sous mouvement reduit
 *
 * La scene est refusee par le moteur et le repli statique s'affiche.
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
export interface TorusKnotOwnProps {
  /** Nombre de tours autour de l'axe de revolution. @defaultValue 2 */
  p?: number
  /** Nombre de tours autour du coeur du tore. @defaultValue 3 */
  q?: number
  /** Epaisseur du tube, en unites de scene. @defaultValue 0.3 */
  tube?: number
  /** Vitesse de rotation, en tours par minute. @defaultValue 3 */
  rpm?: number
  /** Nombre d'impulsions qui courent le long du noeud. @defaultValue 4 */
  pulses?: number
  /** Tokens : le fond et le solide masquant, le fil de fer, les impulsions. */
  colors?: readonly [string, string, string]
  /** Classes du repli. */
  poster?: string
}

/** Toutes les proprietes. */
export type TorusKnotProps = Customisable<TorusKnotOwnProps>

/** Tokens employes par defaut. */
const DEFAULT_TOKENS = [
  '--o-theme-bg',
  '--o-palette-emerald-400',
  '--o-palette-lime-400',
] as const

/** Repli par defaut : une teinte figee, dans les memes tons. */
const DEFAULT_POSTER =
  'o-bg-gradient-to-br o-from-zinc-50 dark:o-from-zinc-950 o-to-emerald-100 dark:o-to-emerald-950'

/** Rayon du noeud, en unites de scene. */
const RADIUS = 1.15

/**
 * Segments le long du tube, selon la qualite.
 *
 * Le fil de fer en tire toutes ses arretes : c'est le seul levier qui compte.
 */
const TUBULAR = { high: 180, medium: 130, low: 70 } as const

/** Segments autour du tube, selon la qualite. */
const RADIAL = { high: 10, medium: 8, low: 6 } as const

type Three = SceneContext['three']
type Group = InstanceType<Three['Group']>
type Object3D = InstanceType<Three['Object3D']>
type BasicMaterial = InstanceType<Three['MeshBasicMaterial']>
type LineMaterial = InstanceType<Three['LineBasicMaterial']>

/** Ce que la scene garde entre la construction et les images. */
interface Knot {
  readonly group: Group
  readonly pulses: readonly Object3D[]
  readonly hidden: BasicMaterial
  readonly wire: LineMaterial
  readonly spark: BasicMaterial
  /** Vitesse angulaire, en radians par seconde. */
  readonly rate: number
  readonly p: number
  readonly q: number
}

/**
 * Un point de la courbe guide du noeud.
 *
 * C'est la meme parametrisation que celle dont la geometrie est tiree : le
 * parametre avance de `p` tours pendant que le second angle en fait `q`.
 */
function onCurve(u: number, p: number, q: number): readonly [number, number, number] {
  const quOverP = (q / p) * u
  const swell = RADIUS * (2 + Math.cos(quOverP)) * 0.5
  return [swell * Math.cos(u), swell * Math.sin(u), RADIUS * Math.sin(quOverP) * 0.5]
}

/**
 * Noeud torique.
 *
 * @example
 * <div className="o-relative o-h-96 o-overflow-hidden o-rounded-xl">
 *   <TorusKnot className="o-absolute o-inset-0" />
 *   <div className="o-relative o-z-10">…</div>
 * </div>
 */
export function TorusKnot({
  p = 2,
  q = 3,
  tube = 0.3,
  rpm = 3,
  pulses = 4,
  colors = DEFAULT_TOKENS,
  poster = DEFAULT_POSTER,
  ...rest
}: TorusKnotProps): ReactElement {
  const { theme } = useMotionState()
  const [host, setHost] = useState<HTMLDivElement | null>(null)

  const knot = useRef<Knot | null>(null)
  const context = useRef<SceneContext | null>(null)

  const { ref, ready, refused } = useScene<HTMLDivElement>({
    name: 'noeud-torique',
    setup: (scene: SceneContext) => {
      context.current = scene
      const { three, renderer, camera, quality } = scene

      const [bg, line, spark] = colors.map((token) => readTokenColour(token, ref.current))

      // Le fond de la scene est le fond de la page. Le token est en sRGB et
      // le moteur encode sa couleur d'effacement du lineaire vers le sRGB :
      // sans la conversion inverse, le fond ressort un cran plus clair.
      renderer.setClearColor(
        new three.Color(bg?.[0] ?? 0, bg?.[1] ?? 0, bg?.[2] ?? 0).convertSRGBToLinear(),
        1,
      )

      camera.position.set(0, 0, 5.9)
      camera.lookAt(0, 0, 0)

      const turns = Math.max(Math.round(p), 1)
      const loops = Math.max(Math.round(q), 1)

      const geometry = new three.TorusKnotGeometry(
        RADIUS,
        Math.max(tube, 0.02),
        TUBULAR[quality],
        RADIAL[quality],
        turns,
        loops,
      )

      // Le solide masquant : de la couleur du fond, il n'ajoute rien a
      // l'image mais retire ce qui passe derriere. Le decalage de polygone
      // ecarte la face de l'arrete qui la borde, sans quoi le fil clignote.
      const hidden = new three.MeshBasicMaterial({
        polygonOffset: true,
        polygonOffsetFactor: 1,
        polygonOffsetUnits: 1,
      })
      hidden.color.setRGB(bg?.[0] ?? 0, bg?.[1] ?? 0, bg?.[2] ?? 0)

      const wire = new three.LineBasicMaterial({ transparent: true, opacity: 0.85 })
      wire.color.setRGB(line?.[0] ?? 0, line?.[1] ?? 0, line?.[2] ?? 0)

      // Le fil de fer est construit sur la grille de sommets de la geometrie,
      // pas par `WireframeGeometry` : celle-ci sort toutes les aretes des
      // triangles, diagonales comprises, et le noeud se lit alors comme un
      // filet. Ici seules les lignes de la grille sont tracees — les anneaux
      // autour du tube, et les generatrices le long.
      const along = TUBULAR[quality]
      const around = RADIAL[quality]
      const grid: number[] = []
      for (let i = 0; i < along; i += 1) {
        for (let j = 0; j < around; j += 1) {
          const here = i * (around + 1) + j
          grid.push(here, here + around + 1)
          grid.push(here, here + 1)
        }
      }
      const wireGeometry = new three.BufferGeometry()
      wireGeometry.setAttribute('position', geometry.getAttribute('position'))
      wireGeometry.setIndex(grid)

      const group = new three.Group()
      group.name = 'noeud'
      group.add(new three.Mesh(geometry, hidden))
      group.add(new three.LineSegments(wireGeometry, wire))

      // Les impulsions : de petites spheres posees sur la courbe guide.
      const sparkMaterial = new three.MeshBasicMaterial()
      sparkMaterial.color.setRGB(spark?.[0] ?? 0, spark?.[1] ?? 0, spark?.[2] ?? 0)
      // Les billes debordent du tube : posees sur la courbe guide, elles
      // seraient entierement cachees par le solide masquant.
      const sparkGeometry = new three.SphereGeometry(Math.max(tube, 0.02) * 1.2, 12, 12)

      const beads: Object3D[] = []
      for (let index = 0; index < Math.max(Math.round(pulses), 0); index += 1) {
        const bead = new three.Mesh(sparkGeometry, sparkMaterial)
        group.add(bead)
        beads.push(bead)
      }

      scene.scene.add(group)

      knot.current = {
        group,
        pulses: beads,
        hidden,
        wire,
        spark: sparkMaterial,
        rate: (rpm * Math.PI * 2) / 60,
        p: turns,
        q: loops,
      }

      return () => {
        scene.scene.remove(group)
        knot.current = null
      }
    },

    frame: (_, { time, delta }) => {
      const live = knot.current
      if (live === null) return

      // La rotation est exprimee en fonction du temps ecoule : le meme
      // reglage donne la meme vitesse apparente a toute cadence.
      live.group.rotation.y += live.rate * delta
      live.group.rotation.x = Math.sin(live.group.rotation.y * 0.4) * 0.28

      // Les impulsions parcourent la courbe guide, reparties a pas egal.
      const total = live.pulses.length
      for (const [index, bead] of live.pulses.entries()) {
        const share = (time * 0.14 + index / Math.max(total, 1)) % 1
        const [x, y, z] = onCurve(share * live.p * Math.PI * 2, live.p, live.q)
        bead.position.set(x, y, z)
      }
    },
  })

  // Le theme a bascule : les tokens sont relus et les materiaux repeints en
  // place. La scene n'est pas reconstruite.
  useEffect(() => {
    const scene = context.current
    const live = knot.current
    if (scene === null || live === null || host === null) return
    const [bg, line, spark] = colors.map((token) => readTokenColour(token, host))
    live.hidden.color.setRGB(bg?.[0] ?? 0, bg?.[1] ?? 0, bg?.[2] ?? 0)
    live.wire.color.setRGB(line?.[0] ?? 0, line?.[1] ?? 0, line?.[2] ?? 0)
    live.spark.color.setRGB(spark?.[0] ?? 0, spark?.[1] ?? 0, spark?.[2] ?? 0)
    scene.renderer.setClearColor(
      new scene.three.Color(
        bg?.[0] ?? 0,
        bg?.[1] ?? 0,
        bg?.[2] ?? 0,
      ).convertSRGBToLinear(),
      1,
    )
  }, [theme, colors, host, ready])

  const pending = usePoster({ ready, refused })

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

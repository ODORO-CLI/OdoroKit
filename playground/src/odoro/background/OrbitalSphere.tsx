/**
 * Sphère de particules, ceinte d'anneaux et piquée de nœuds lumineux.
 *
 * ## Ce fichier n'est pas un portage
 *
 * L'implémentation dont il s'inspire déléguait tout à un
 * `createOrbitalSphereRenderer` qui n'accompagnait pas le composant. La scène
 * est donc écrite ici, depuis sa description : une sphère de points, trois
 * anneaux inclinés, quelques nœuds plus brillants.
 *
 * ## Ce qu'elle ne fait pas, contrairement à l'original
 *
 * Elle n'ouvre ni `requestAnimationFrame`, ni `ResizeObserver`, ni
 * `IntersectionObserver`. Les trois vivent déjà dans le moteur : `useScene`
 * arbitre la surface, suit le redimensionnement, suspend le rendu hors du champ
 * et s'abonne à la boucle unique. Les rouvrir ici donnerait deux boucles
 * concurrentes sur une même page, et le tremblement irrégulier que la boucle
 * unique existe pour supprimer.
 *
 * L'original appliquait aussi sa teinte par `filter: hue-rotate()` sur le
 * canevas. C'est un filtre plein écran à chaque image, pour un résultat que les
 * couleurs des matériaux donnent gratuitement — et qui, lui, suit la palette.
 *
 * ## La répartition des points n'est pas aléatoire
 *
 * Tirer une latitude et une longitude au hasard accumule les points aux pôles :
 * les parallèles y sont plus courts, mais reçoivent autant de tirages. La
 * spirale de Fibonacci répartit au contraire les points à distance égale, ce
 * qui est ce qu'on veut d'une sphère de particules — et ce qui se voit
 * immédiatement si on s'en passe.
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

import { usePoster } from '@/odoro/hooks/usePoster'

/** Proprietes propres au composant. */
export interface OrbitalSphereOwnProps {
  /** Nombre de points sur la sphere. @defaultValue 2400 */
  points?: number
  /** Nombre d'anneaux. @defaultValue 3 */
  rings?: number
  /** Nombre de noeuds lumineux. @defaultValue 12 */
  nodes?: number
  /** Vitesse de rotation, en tours par minute. @defaultValue 2 */
  rpm?: number
  /** Tokens de la sphere, des anneaux et des noeuds. */
  colors?: readonly [string, string, string]
  /** Classes du repli. */
  poster?: string
}

/** Toutes les proprietes. */
export type OrbitalSphereProps = Customisable<OrbitalSphereOwnProps>

/** Tokens employes par defaut. */
const DEFAULT_TOKENS = [
  '--o-palette-violet-500',
  '--o-palette-violet-300',
  '--o-palette-fuchsia-400',
] as const

/** Repli par defaut : un halo fige, dans les memes tons. */
const DEFAULT_POSTER =
  'o-bg-gradient-to-br o-from-violet-950 o-via-zinc-950 o-to-fuchsia-950'

/**
 * Nombre de points en qualite basse.
 *
 * Chaque point est un sommet, et le cout d'un nuage de points croit lineairement
 * avec leur nombre. C'est le seul levier qui compte ici — les anneaux et les
 * noeuds sont negligeables a cote.
 */
const LOW_POINTS = 900

/** L'angle d'or, qui donne son pas a la spirale. */
const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5))

/**
 * Sphere de particules en rotation.
 *
 * @example
 * <div className="o-relative o-h-96 o-overflow-hidden o-rounded-xl">
 *   <OrbitalSphere className="o-absolute o-inset-0" />
 *   <div className="o-relative o-z-10">…</div>
 * </div>
 *
 * @example
 * // Les couleurs suivent la palette : trois tokens, pas trois valeurs.
 * <OrbitalSphere colors={[
 *   '--o-palette-sky-500',
 *   '--o-palette-sky-300',
 *   '--o-palette-cyan-400',
 * ]} />
 */
export function OrbitalSphere({
  points = 2400,
  rings = 3,
  nodes = 12,
  rpm = 2,
  colors = DEFAULT_TOKENS,
  poster = DEFAULT_POSTER,
  ...rest
}: OrbitalSphereProps): ReactElement {
  const { quality, reduced } = useMotionState()
  const [element, setElement] = useState<HTMLElement | null>(null)

  // Les tokens entrent par leur texte : un littéral ecrit dans le JSX est un
  // tableau neuf a chaque rendu, et une lecture qui pose un etat bouclerait.
  const tokenList = colors.join(' ')
  const [shades, setShades] = useState<readonly (readonly number[])[]>([])

  useEffect(() => {
    if (element === null) return
    setShades(tokenList.split(' ').map((token) => readTokenColour(token, element)))
  }, [element, tokenList, reduced, quality])

  // La scene lit les couleurs par ref : elle est construite une fois, et un
  // changement de theme met a jour les materiaux sans la reconstruire.
  const shadesRef = useRef(shades)
  shadesRef.current = shades

  const { ref, ready, refused } = useScene<HTMLDivElement>({
    name: 'sphere-orbitale',
    setup: (context: SceneContext) => {
      const { scene, camera, three, quality: level } = context
      const [sphereTint, ringTint, nodeTint] = shadesRef.current
      if (sphereTint === undefined || ringTint === undefined || nodeTint === undefined) {
        return
      }

      camera.position.set(0, 0, 3.4)

      const group = new three.Group()
      scene.add(group)

      const count = level === 'low' ? LOW_POINTS : points

      // La sphere de points, repartis par la spirale de Fibonacci.
      const positions = new Float32Array(count * 3)
      for (let index = 0; index < count; index += 1) {
        // La hauteur balaie l'intervalle a pas constant ; l'angle avance de
        // l'angle d'or. C'est ce couple qui egalise les distances.
        const y = 1 - (index / Math.max(count - 1, 1)) * 2
        const ray = Math.sqrt(Math.max(0, 1 - y * y))
        const theta = GOLDEN_ANGLE * index
        positions[index * 3] = Math.cos(theta) * ray
        positions[index * 3 + 1] = y
        positions[index * 3 + 2] = Math.sin(theta) * ray
      }

      const cloud = new three.BufferGeometry()
      cloud.setAttribute('position', new three.BufferAttribute(positions, 3))
      const cloudMaterial = new three.PointsMaterial({
        size: 0.016,
        transparent: true,
        opacity: 0.85,
        depthWrite: false,
        blending: three.AdditiveBlending,
      })
      cloudMaterial.color.setRGB(
        sphereTint[0] ?? 0,
        sphereTint[1] ?? 0,
        sphereTint[2] ?? 0,
      )
      group.add(new three.Points(cloud, cloudMaterial))

      // Les anneaux, inclines regulierement autour de l'axe.
      const ringMaterial = new three.MeshBasicMaterial({
        transparent: true,
        opacity: 0.35,
        side: three.DoubleSide,
        blending: three.AdditiveBlending,
        depthWrite: false,
      })
      ringMaterial.color.setRGB(ringTint[0] ?? 0, ringTint[1] ?? 0, ringTint[2] ?? 0)

      for (let index = 0; index < rings; index += 1) {
        const geometry = new three.TorusGeometry(1.25 + index * 0.14, 0.004, 6, 180)
        const torus = new three.Mesh(geometry, ringMaterial)
        torus.rotation.x = Math.PI / 2 + (index / Math.max(rings, 1)) * 0.9
        torus.rotation.y = (index / Math.max(rings, 1)) * Math.PI
        group.add(torus)
      }

      // Les noeuds : de petites spheres pleines, posees sur la meme spirale.
      const nodeGeometry = new three.SphereGeometry(0.028, 12, 12)
      const nodeMaterial = new three.MeshBasicMaterial({
        transparent: true,
        opacity: 0.95,
        blending: three.AdditiveBlending,
        depthWrite: false,
      })
      nodeMaterial.color.setRGB(nodeTint[0] ?? 0, nodeTint[1] ?? 0, nodeTint[2] ?? 0)

      for (let index = 0; index < nodes; index += 1) {
        const y = 1 - (index / Math.max(nodes - 1, 1)) * 2
        const ray = Math.sqrt(Math.max(0, 1 - y * y))
        const theta = GOLDEN_ANGLE * index * 7
        const node = new three.Mesh(nodeGeometry, nodeMaterial)
        node.position.set(Math.cos(theta) * ray, y, Math.sin(theta) * ray)
        node.scale.setScalar(1.15)
        group.add(node)
      }

      // Ce qui tourne est le groupe, pas la camera : une camera qui orbite
      // ferait tourner aussi le repere des noeuds si on venait a les ancrer.
      const spin = group

      // La construction rend sa fonction de nettoyage. Les geometries et les
      // materiaux sont liberes par le parcours de la scene ; ce qui est cree
      // ici et n'y figure pas ne l'est pas, et il n'y en a aucun.
      return () => {
        scene.remove(group)
        spin.clear()
      }
    },
    frame: ({ scene }, { delta }) => {
      const group = scene.children.find((child) => child.type === 'Group')
      if (group === undefined) return
      // La rotation est exprimee en fonction du temps ecoule : le meme reglage
      // donne la meme vitesse apparente a soixante comme a cent vingt images.
      group.rotation.y += (delta * rpm * Math.PI * 2) / 60
      group.rotation.x = Math.sin(group.rotation.y * 0.3) * 0.12
    },
  })

  const pending = usePoster({ ready, refused })

  const { className, style } = mergePresentation(
    { className: 'o-relative o-overflow-hidden o-bg-zinc-950' },
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
      style={style}
      aria-hidden
    >
      {pending.visible ? (
        <div style={pending.style} className={`o-absolute o-inset-0 ${poster}`} />
      ) : null}
    </div>
  )
}

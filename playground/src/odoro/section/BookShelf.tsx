/**
 * Étagère : des volumes rangés, qu'on fait tourner et qu'on tire du rayon.
 *
 * ## Ce que ce composant rend, et ce qu'il laisse à la page
 *
 * Il rend **la scène**, et rien d'autre : les planches, les tranches, les
 * volumes, la rotation, le survol et la sélection. Le panneau de détail, le
 * bandeau de catalogue, l'en-tête — toute la chrome autour — appartiennent à la
 * page, qui les rend avec ses propres composants et son propre routeur.
 *
 * La frontière passe par `onSelect` : la scène dit quel volume est ouvert, la
 * page décide de ce qu'elle en affiche. Un composant 3D qui rendrait aussi le
 * texte imposerait sa typographie, sa langue et sa mise en page à toute page
 * qui l'installe.
 *
 * ## Les couleurs sont des tokens, pas des valeurs
 *
 * Chaque volume porte trois teintes — le dos, la toile des plats, la tranche —
 * et chacune est un **nom de variable**, lue dans la palette au montage et
 * relue quand le thème change. Écrites en dur, elles resteraient identiques
 * dans un thème clair, où une reliure noire sur un mur crème ne veut rien dire.
 *
 * ## Le survol et la sélection sont deux gestes différents
 *
 * Le survol soulève le volume de quelques millimètres : c'est ce qui dit qu'il
 * est saisissable. La sélection le tire du rayon et le présente de trois
 * quarts. Confondre les deux — tout sortir au survol — rend le rayon illisible
 * dès que le pointeur le traverse.
 *
 * ## Ce qui n'est pas ouvert ici
 *
 * Ni boucle d'animation, ni observateur de taille, ni observateur de
 * visibilité. `useScene` les porte : il arbitre la surface, suit le
 * redimensionnement, suspend le rendu hors du champ et s'abonne à la boucle
 * unique du moteur.
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
import { useEffect, useRef, useState, type ReactElement } from 'react'

import { usePoster } from '@/odoro/hooks/usePoster'

/** Un volume du rayon. */
export interface ShelfVolume {
  /** Identifiant, unique dans l'etagere. */
  readonly id: string
  /** Titre, transmis a `onSelect`. */
  readonly title: string
  /** Rayon sur lequel il est pose, en partant du haut. */
  readonly shelf: number
  /** Position sur ce rayon, en partant de la gauche. */
  readonly slot: number
  /** Token du dos. */
  readonly spine: string
  /** Token de la toile des plats. */
  readonly cloth: string
  /** Token de la tranche. */
  readonly edge: string
}

/** Proprietes propres au composant. */
export interface BookShelfOwnProps {
  /** Les volumes. Le registre n'en embarque aucun : c'est le catalogue du projet. */
  volumes: readonly ShelfVolume[]
  /** Identifiant du volume ouvert, impose par l'application. */
  selected?: string | null
  /** Appele quand un volume est choisi, ou refermé — `null` alors. */
  onSelect?: (id: string | null) => void
  /** Tokens des planches et du mur du fond. */
  colors?: readonly [string, string]
  /** Classes du repli. */
  poster?: string
}

/** Toutes les proprietes. */
export type BookShelfProps = Customisable<BookShelfOwnProps, 'section'>

/** Tokens employes par defaut pour le meuble. */
const DEFAULT_TOKENS = ['--o-palette-stone-700', '--o-palette-stone-900'] as const

/** Repli par defaut. */
const DEFAULT_POSTER = 'o-bg-gradient-to-b o-from-stone-800 o-to-stone-950'

/**
 * Les mesures du meuble.
 *
 * Le format des volumes est un deux-tiers : c'est celui des livres de planches,
 * et c'est ce qui fait qu'un rayon se lit comme une bibliotheque plutot que
 * comme une rangee de boites.
 */
const M = {
  width: 0.887,
  height: 1.33,
  depth: 0.17,
  /** Inclinaison au repos, en radians. Un rayon parfaitement droit sonne faux. */
  lean: -0.2,
  /** Pas entre deux volumes. */
  pitch: 0.235,
  /** Hauteur des deux rayons. */
  shelves: [0.251, -1.241],
  plankHalf: 1.34,
  plankThick: 0.105,
  plankDepth: 0.8,
  wallZ: -0.43,
  bookZ: -0.18,
  /** Soulevement au survol. */
  lift: 0.045,
  /** Sortie du volume choisi. */
  pull: 0.52,
} as const

/** Borne une valeur. */
function clamp(value: number, low: number, high: number): number {
  return Math.max(low, Math.min(high, value))
}

/**
 * Etagere de volumes.
 *
 * @example
 * <BookShelf
 *   volumes={catalogue}
 *   selected={ouvert}
 *   onSelect={setOuvert}
 *   className="o-h-screen"
 * />
 */
export function BookShelf({
  volumes,
  selected = null,
  onSelect,
  colors = DEFAULT_TOKENS,
  poster = DEFAULT_POSTER,
  ...rest
}: BookShelfProps): ReactElement {
  const { quality, reduced } = useMotionState()
  const [element, setElement] = useState<HTMLElement | null>(null)

  // Toutes les teintes en une seule lecture : celles du meuble, puis trois par
  // volume. Elles entrent par leur texte, jamais par l'identite du tableau.
  const tokenList = [
    ...colors,
    ...volumes.flatMap((v) => [v.spine, v.cloth, v.edge]),
  ].join(' ')
  const [shades, setShades] = useState<readonly (readonly number[])[]>([])

  useEffect(() => {
    if (element === null) return
    setShades(tokenList.split(' ').map((token) => readTokenColour(token, element)))
  }, [element, tokenList, reduced, quality])

  const shadesRef = useRef(shades)
  shadesRef.current = shades
  const volumesRef = useRef(volumes)
  volumesRef.current = volumes
  const selectedRef = useRef(selected)
  selectedRef.current = selected

  /** Ce que le pointeur vise, en coordonnees normalisees. */
  const aim = useRef({ x: 0, y: 0, inside: false })
  /** Identifiant survole, ecrit par la scene, lu par le curseur. */
  const hovered = useRef<string | null>(null)
  /** Rotation du meuble, accumulee par le glissement. */
  const turn = useRef({ angle: 0, velocity: 0 })
  const dragging = useRef(false)
  const lastX = useRef(0)
  const moved = useRef(0)

  // `HTMLElement` et non `HTMLDivElement` : la racine est une `section`, et une
  // ref typee sur le div refuserait de la recevoir.
  const { ref, ready, refused } = useScene<HTMLElement>({
    name: 'etagere',
    setup: (context: SceneContext) => {
      const { scene, camera, three } = context
      const tints = shadesRef.current
      const list = volumesRef.current
      if (tints.length < 2 + list.length * 3) return

      const colour = (index: number): InstanceType<typeof three.Color> => {
        const rgb = tints[index] ?? [0.5, 0.5, 0.5]
        return new three.Color(rgb[0] ?? 0.5, rgb[1] ?? 0.5, rgb[2] ?? 0.5)
      }

      camera.position.set(0, -0.4, 4.6)
      camera.lookAt(0, -0.4, 0)

      scene.add(new three.AmbientLight(0xffffff, 1.15))
      const key = new three.DirectionalLight(0xffffff, 1.5)
      key.position.set(2.2, 3.4, 3.6)
      scene.add(key)

      const group = new three.Group()
      group.name = 'etagere'
      scene.add(group)

      // Le mur du fond, puis les planches.
      const wall = new three.Mesh(
        new three.PlaneGeometry(M.plankHalf * 2.6, 5.4),
        new three.MeshStandardMaterial({ color: colour(1), roughness: 0.95 }),
      )
      wall.position.set(0, -0.4, M.wallZ)
      group.add(wall)

      const plankMaterial = new three.MeshStandardMaterial({
        color: colour(0),
        roughness: 0.72,
      })
      for (const y of M.shelves) {
        const plank = new three.Mesh(
          new three.BoxGeometry(M.plankHalf * 2, M.plankThick, M.plankDepth),
          plankMaterial,
        )
        plank.position.set(0, y - M.height / 2 - M.plankThick / 2, M.bookZ)
        group.add(plank)
      }

      // Les volumes. Chacun est une boite dont les six faces ne portent pas la
      // meme teinte : le dos se voit de face, la tranche sur le cote, la toile
      // au-dessus. Un materiau unique donnerait un bloc de couleur.
      const geometry = new three.BoxGeometry(M.width, M.height, M.depth)
      const books: {
        mesh: InstanceType<typeof three.Mesh>
        id: string
        title: string
        home: { x: number; y: number }
      }[] = []

      list.forEach((volume, index) => {
        const spine = colour(2 + index * 3)
        const cloth = colour(3 + index * 3)
        const edge = colour(4 + index * 3)

        const make = (c: InstanceType<typeof three.Color>, rough: number) =>
          new three.MeshStandardMaterial({ color: c, roughness: rough })

        // L'ordre des faces d'une boite : +x, -x, +y, -y, +z, -z.
        const materials = [
          make(edge, 0.55),
          make(edge, 0.55),
          make(cloth, 0.9),
          make(cloth, 0.9),
          make(spine, 0.78),
          make(cloth, 0.9),
        ]

        const mesh = new three.Mesh(geometry, materials)
        const row = clamp(volume.shelf, 0, M.shelves.length - 1)
        const y = M.shelves[row] ?? 0
        const x = (volume.slot - (list.length / (M.shelves.length * 2) - 0.5)) * M.pitch

        mesh.position.set(x, y, M.bookZ)
        mesh.rotation.z = M.lean
        mesh.userData['id'] = volume.id
        group.add(mesh)
        books.push({ mesh, id: volume.id, title: volume.title, home: { x, y } })
      })

      const raycaster = new three.Raycaster()
      const pointer = new three.Vector2()

      const advance = (frame: SceneFrame): void => {
        const delta = Math.min(frame.delta, 0.05)

        // La rotation : le glissement la pousse, l'inertie la prolonge.
        const state = turn.current
        if (!dragging.current) {
          state.angle += state.velocity
          state.velocity *= Math.exp(-delta * 3)
        }
        group.rotation.y = clamp(state.angle, -0.55, 0.55)

        // Le survol : un seul rayon par image, sur la liste des volumes.
        let over: string | null = null
        if (aim.current.inside) {
          pointer.set(aim.current.x, aim.current.y)
          raycaster.setFromCamera(pointer, camera)
          const hit = raycaster.intersectObjects(
            books.map((b) => b.mesh),
            false,
          )[0]
          const id = hit?.object.userData['id']
          if (typeof id === 'string') over = id
        }
        hovered.current = over

        // Chaque volume rejoint sa place : au rayon, souleve, ou sorti.
        const open = selectedRef.current
        for (const book of books) {
          const isOpen = book.id === open
          const isOver = book.id === over && open === null

          const targetX = isOpen ? book.home.x - 0.35 : book.home.x
          const targetY = book.home.y + (isOver ? M.lift : 0)
          const targetZ = M.bookZ + (isOpen ? M.pull : 0)
          const targetLean = isOpen ? 0.075 : M.lean
          const targetYaw = isOpen ? 0.285 : 0

          // Rattrapage exponentiel en fonction du temps ecoule : le meme
          // reglage donne la meme course a soixante comme a cent vingt images.
          const factor = 1 - Math.exp(-8 * delta)
          book.mesh.position.x += (targetX - book.mesh.position.x) * factor
          book.mesh.position.y += (targetY - book.mesh.position.y) * factor
          book.mesh.position.z += (targetZ - book.mesh.position.z) * factor
          book.mesh.rotation.z += (targetLean - book.mesh.rotation.z) * factor
          book.mesh.rotation.y += (targetYaw - book.mesh.rotation.y) * factor
        }
      }

      group.userData['advance'] = advance

      return () => {
        scene.remove(group)
        geometry.dispose()
      }
    },
    frame: ({ scene }, frame) => {
      const group = scene.getObjectByName('etagere')
      const advance = group?.userData['advance']
      if (typeof advance === 'function') advance(frame)
    },
  })

  // Le pointeur : vise, glisse, choisit. Lu sur l'hote, jamais sur la fenetre.
  useEffect(() => {
    if (element === null) return

    const read = (event: PointerEvent): void => {
      const box = element.getBoundingClientRect()
      if (box.width <= 0 || box.height <= 0) return
      aim.current.x = ((event.clientX - box.left) / box.width) * 2 - 1
      aim.current.y = -(((event.clientY - box.top) / box.height) * 2 - 1)
    }

    const move = (event: PointerEvent): void => {
      read(event)
      if (!dragging.current || reduced) return
      const dx = event.clientX - lastX.current
      lastX.current = event.clientX
      moved.current += Math.abs(dx)
      turn.current.angle += dx * 0.0035
      turn.current.velocity = dx * 0.0035
      element.style.cursor = 'grabbing'
    }

    const down = (event: PointerEvent): void => {
      dragging.current = true
      lastX.current = event.clientX
      moved.current = 0
      turn.current.velocity = 0
    }

    // Un clic est un relachement qui n'a pas glisse. Sans ce seuil, toute
    // rotation terminee sur un volume l'ouvrirait.
    const up = (): void => {
      const wasDrag = moved.current > 6
      dragging.current = false
      element.style.cursor = hovered.current === null ? '' : 'pointer'
      if (wasDrag) return
      const id = hovered.current
      onSelect?.(id === null || id === selectedRef.current ? null : id)
    }

    const enter = (): void => {
      aim.current.inside = true
    }
    const leave = (): void => {
      aim.current.inside = false
      dragging.current = false
      element.style.cursor = ''
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
  }, [element, reduced, onSelect])

  const waiting = usePoster({ ready, refused })

  const { className, style } = mergePresentation(
    { className: 'o-relative o-overflow-hidden' },
    rest,
  )

  return (
    <section
      {...rest}
      ref={(node) => {
        setElement(node)
        ref.current = node
      }}
      className={className}
      style={{ touchAction: 'pan-y', ...style }}
    >
      {waiting.visible ? (
        <div style={waiting.style} className={`o-absolute o-inset-0 ${poster}`} />
      ) : null}

      {/* Le rayon est une image pour l'oeil : la liste des volumes reste
          atteignable au clavier, et c'est elle qui porte le choix. Sans elle,
          une scene 3D est un cul-de-sac pour qui ne peut pas viser. */}
      <ul className="o-sr-only">
        {volumes.map((volume) => (
          <li key={volume.id}>
            <button
              type="button"
              aria-pressed={volume.id === selected}
              onClick={() => onSelect?.(volume.id === selected ? null : volume.id)}
            >
              {volume.title}
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}

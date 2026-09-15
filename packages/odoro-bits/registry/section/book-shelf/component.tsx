/**
 * Bookshelf: stored volumes, that can be turned and pulled off the shelf.
 *
 * ## What this component renders, and what it leaves to the page
 *
 * It renders **the scene**, and nothing else: the planks, the edges, the
 * volumes, the rotation, the hover and the selection. The detail panel, the
 * catalog banner, the header — all the chrome around it — belong to the page,
 * which renders them with its own components and its own router.
 *
 * The border runs through `onSelect`: the scene says which volume is open, the
 * page decides what it displays of it. A 3D component that also rendered the
 * text would impose its typography, its language and its layout on every page
 * that installs it.
 *
 * ## The colors are tokens, not values
 *
 * Every volume carries three hues — the spine, the cloth of the boards, the
 * edge — and each one is a **variable name**, read from the palette on mount
 * and read again when the theme changes. Hard-coded, they would stay identical
 * in a light theme, where a black binding on a cream wall means nothing.
 *
 * ## Hover and selection are two different gestures
 *
 * Hover lifts the volume by a few millimeters: that is what says it can be
 * grabbed. Selection pulls it off the shelf and presents it three quarters on.
 * Mixing the two — taking everything out on hover — makes the shelf unreadable
 * as soon as the pointer crosses it.
 *
 * ## What is not opened here
 *
 * No animation loop, no size observer, no visibility observer. `useScene`
 * carries them: it arbitrates the surface, follows the resizing, suspends the
 * render out of view and subscribes to the single loop of the engine.
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

import { usePoster } from '@registre/hooks/usePoster'

/** One volume of the shelf. */
export interface ShelfVolume {
  /** Identifier, unique within the bookshelf. */
  readonly id: string
  /** Title, passed on to `onSelect`. */
  readonly title: string
  /** Shelf it is placed on, counting from the top. */
  readonly shelf: number
  /** Position on that shelf, counting from the left. */
  readonly slot: number
  /** Token of the spine. */
  readonly spine: string
  /** Token of the cloth of the boards. */
  readonly cloth: string
  /** Token of the edge. */
  readonly edge: string
}

/** Props specific to the component. */
export interface BookShelfOwnProps {
  /** The volumes. The registry ships none: this is the catalog of the project. */
  volumes: readonly ShelfVolume[]
  /** Identifier of the open volume, imposed by the application. */
  selected?: string | null
  /** Called when a volume is chosen, or closed again — `null` then. */
  onSelect?: (id: string | null) => void
  /** Tokens of the planks and of the back wall. */
  colors?: readonly [string, string]
  /** Classes of the fallback. */
  poster?: string
}

/** All the props. */
export type BookShelfProps = Customisable<BookShelfOwnProps, 'section'>

/** Tokens used by default for the furniture. */
const DEFAULT_TOKENS = ['--o-palette-stone-700', '--o-palette-stone-900'] as const

/** Default fallback. */
const DEFAULT_POSTER = 'o-bg-gradient-to-b o-from-stone-800 o-to-stone-950'

/**
 * The measurements of the furniture.
 *
 * The format of the volumes is a two-thirds: it is the one of plate books, and
 * it is what makes a shelf read like a library rather than like a row of
 * boxes.
 */
const M = {
  width: 0.887,
  height: 1.33,
  depth: 0.17,
  /** Tilt at rest, in radians. A perfectly straight shelf rings false. */
  lean: -0.2,
  /** Step between two volumes. */
  pitch: 0.235,
  /** Height of the two shelves. */
  shelves: [0.251, -1.241],
  plankHalf: 1.34,
  plankThick: 0.105,
  plankDepth: 0.8,
  wallZ: -0.43,
  bookZ: -0.18,
  /** Lift on hover. */
  lift: 0.045,
  /** Pull-out of the chosen volume. */
  pull: 0.52,
} as const

/** Bounds a value. */
function clamp(value: number, low: number, high: number): number {
  return Math.max(low, Math.min(high, value))
}

/**
 * Bookshelf of volumes.
 *
 * @example
 * <BookShelf
 *   volumes={catalog}
 *   selected={open}
 *   onSelect={setOpen}
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

  // Every hue in a single read: those of the furniture, then three per volume.
  // They come in by their text, never by the identity of the array.
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

  /** What the pointer aims at, in normalized coordinates. */
  const aim = useRef({ x: 0, y: 0, inside: false })
  /** Hovered identifier, written by the scene, read by the cursor. */
  const hovered = useRef<string | null>(null)
  /** Rotation of the furniture, accumulated by the drag. */
  const turn = useRef({ angle: 0, velocity: 0 })
  const dragging = useRef(false)
  const lastX = useRef(0)
  const moved = useRef(0)

  // `HTMLElement` and not `HTMLDivElement`: the root is a `section`, and a ref
  // typed on the div would refuse to receive it.
  const { ref, ready, refused } = useScene<HTMLElement>({
    name: 'shelf',
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
      group.name = 'shelf'
      scene.add(group)

      // The back wall, then the planks.
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

      // The volumes. Each one is a box whose six faces do not carry the same
      // hue: the spine is seen from the front, the edge on the side, the cloth
      // above. A single material would give a block of color.
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

        // The order of the faces of a box: +x, -x, +y, -y, +z, -z.
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

        // The rotation: the drag pushes it, the inertia prolongs it.
        const state = turn.current
        if (!dragging.current) {
          state.angle += state.velocity
          state.velocity *= Math.exp(-delta * 3)
        }
        group.rotation.y = clamp(state.angle, -0.55, 0.55)

        // The hover: a single ray per frame, over the list of volumes.
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

        // Every volume joins its place: on the shelf, lifted, or pulled out.
        const open = selectedRef.current
        for (const book of books) {
          const isOpen = book.id === open
          const isOver = book.id === over && open === null

          const targetX = isOpen ? book.home.x - 0.35 : book.home.x
          const targetY = book.home.y + (isOver ? M.lift : 0)
          const targetZ = M.bookZ + (isOpen ? M.pull : 0)
          const targetLean = isOpen ? 0.075 : M.lean
          const targetYaw = isOpen ? 0.285 : 0

          // Exponential catch-up based on the elapsed time: the same setting
          // gives the same travel at sixty as at a hundred and twenty frames.
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
      const group = scene.getObjectByName('shelf')
      const advance = group?.userData['advance']
      if (typeof advance === 'function') advance(frame)
    },
  })

  // The pointer: aims, drags, chooses. Read on the host, never on the window.
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

    // A click is a release that has not dragged. Without that threshold, any
    // rotation ended on a volume would open it.
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

      {/* The shelf is an image for the eye: the list of volumes stays reachable
          from the keyboard, and it is the one that carries the choice. Without
          it, a 3D scene is a dead end for whoever cannot aim. */}
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

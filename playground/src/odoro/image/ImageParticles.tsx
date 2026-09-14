/**
 * Image en particules : la photo est echantillonnee dans un canevas hors du
 * document, puis rendue en points colores qui se rassemblent pour la former.
 *
 * ## Pourquoi une scene, et pas un shader plein cadre
 *
 * Le backend leger peint des fragments : il n'a pas de sommets a deplacer. Or
 * ici, tout l'effet est dans le trajet de chaque point vers sa place — une
 * geometrie de plusieurs milliers de sommets, dispersee puis rassemblee dans
 * le shader de sommet. C'est la seule raison de payer une scene.
 *
 * ## L'image reelle est dessous, et elle sert de repli
 *
 * L'element `img` est pose sous le canevas, en position absolue : il porte le
 * texte de remplacement, il s'affiche pendant le telechargement du moteur de
 * rendu, et il reste seul quand la scene ne viendra pas — sans WebGL, sous
 * mouvement reduit, ou quand l'arbitre refuse la surface. Il n'y a donc aucun
 * repli a dessiner : la photo **est** le repli, et c'est le meilleur possible.
 *
 * ## Ce que la couleur des points doit a l'image, et le fond au theme
 *
 * Chaque point prend la couleur de sa cellule : les teintes viennent de la
 * photo, pas de la palette. Ce qui vient de la palette, c'est le fond du
 * canevas — sans lui, la scene se decouperait sur du noir au milieu d'une page
 * claire. Il est relu a chaque bascule de theme, sans reconstruire la scene.
 *
 * ## La lecture des pixels peut echouer
 *
 * Une image d'un autre domaine sans en-tete d'autorisation teinte le canevas
 * et la lecture leve. Les points restent alors a zero, invisibles, et la photo
 * reste affichee dessous.
 *
 * @module
 */

import {
  mergePresentation,
  readTokenColour,
  useMotionState,
  type Customisable,
  type QualityLevel,
} from '@odoro-cli/engine'
import { useScene, type SceneContext } from '@odoro-cli/engine/three'
import { useEffect, useRef, useState, type ReactElement } from 'react'

import { usePointerDamped } from '@/odoro/hooks/usePointerDamped'

import {
  IMAGE_PARTICLES_FRAGMENT,
  IMAGE_PARTICLES_VERTEX,
} from './image-particles.shader.js'

/** Part de la densite demandee retenue par palier de qualite. */
const GRADE: Readonly<Record<QualityLevel, number>> = {
  low: 0.55,
  medium: 0.78,
  high: 1,
}

/** Demi-hauteur du plan, en unites de scene. Le reste en decoule. */
const HALF = 1

/** Ce qu'un echantillon rend : une place et une couleur par cellule. */
interface Sample {
  readonly positions: Float32Array
  readonly tints: Float32Array
}

/** Proprietes propres au composant. */
export interface ImageParticlesOwnProps {
  /** Source de l'image. */
  src: string
  /** Texte de remplacement. Chaine vide si l'image est purement decorative. */
  alt: string
  /** Rapport largeur sur hauteur du cadre. @defaultValue 1.777 */
  ratio?: number
  /**
   * Nombre de points sur la largeur, avant reduction par la qualite.
   *
   * Borne a deux cent vingt : au-dela, chaque point pese moins d'un pixel et
   * l'image redevient une image, en plus couteuse.
   *
   * @defaultValue 140
   */
  density?: number
  /** Taille d'un point, en cellules. Au-dela de un, les points se touchent. @defaultValue 1.1 */
  size?: number
  /** Distance de dispersion au depart, en unites de scene. @defaultValue 0.7 */
  scatter?: number
  /** Duree du rassemblement, en millisecondes. @defaultValue 1600 */
  duration?: number
  /** Vitesse de la respiration, une fois l'image formee. @defaultValue 0.6 */
  speed?: number
  /** Inclinaison du nuage sous le pointeur. Zero la fige. @defaultValue 0.16 */
  parallax?: number
  /** Token dont la couleur peint le fond de la scene. */
  background?: string
}

/** Toutes les proprietes : les siennes, plus celles d'une image. */
export type ImageParticlesProps = Customisable<ImageParticlesOwnProps, 'img'>

/**
 * Rend une image en nuage de points colores.
 *
 * @example
 * <ImageParticles src="/portrait.jpg" alt="Portrait de l equipe" />
 *
 * @example
 * // Plus grossier, dispersion large, rassemblement lent.
 * <ImageParticles
 *   src="/portrait.jpg"
 *   alt=""
 *   density={90}
 *   scatter={1.4}
 *   duration={2600}
 * />
 */
export function ImageParticles({
  src,
  alt,
  ratio = 1.777,
  density = 140,
  size = 1.1,
  scatter = 0.7,
  duration = 1600,
  speed = 0.6,
  parallax = 0.16,
  background = '--o-theme-bg',
  ...rest
}: ImageParticlesProps): ReactElement {
  const { quality, theme } = useMotionState()
  const [host, setHost] = useState<HTMLElement | null>(null)

  const pointer = usePointerDamped({
    host,
    speed: 2.5,
    name: 'image en particules : pointeur',
  })

  const cols = Math.round(Math.min(220, Math.max(24, density * GRADE[quality])))
  const rows = Math.max(2, Math.round(cols / Math.max(ratio, 0.1)))
  const count = cols * rows

  /** Echantillon pret a etre verse dans la geometrie, ou rien. */
  const sample = useRef<Sample | null>(null)
  /** Verse l'echantillon dans les attributs. Existe des que la scene est la. */
  const pour = useRef<((data: Sample) => void) | null>(null)
  /** Avancement du rassemblement, de zero a un. */
  const assembly = useRef(0)
  /** Uniformes vivants : les modifier change le rendu a l'image suivante. */
  const uniforms = useRef<Record<string, { value: number }>>({})
  const context = useRef<SceneContext | null>(null)

  // L'echantillonnage est independant de la scene : il peut aboutir avant
  // qu'elle existe — le moteur de rendu pese plus lourd qu'une image — ou
  // apres. La ref sert de rendez-vous entre les deux.
  useEffect(() => {
    if (typeof document === 'undefined') return

    let cancelled = false
    const source = new Image()
    // Voir l'en-tete : sans cet attribut, une image d'un autre domaine teinte
    // le canevas et la lecture leve.
    source.crossOrigin = 'anonymous'
    source.decoding = 'async'

    const read = (): void => {
      if (cancelled) return

      try {
        const canvas = document.createElement('canvas')
        canvas.width = cols
        canvas.height = rows
        const paint = canvas.getContext('2d')
        if (paint === null) return

        // Cadrage « cover » : la partie de l'image qui remplit la grille sans
        // la deformer, exactement comme l'element `img` pose dessous.
        const nw = source.naturalWidth
        const nh = source.naturalHeight
        if (nw === 0 || nh === 0) return
        const scale = Math.max(cols / nw, rows / nh)
        const sw = cols / scale
        const sh = rows / scale
        paint.drawImage(source, (nw - sw) / 2, (nh - sh) / 2, sw, sh, 0, 0, cols, rows)

        const pixels = paint.getImageData(0, 0, cols, rows).data
        const positions = new Float32Array(count * 3)
        const tints = new Float32Array(count * 3)

        const width = HALF * 2 * ratio
        const height = HALF * 2

        for (let y = 0; y < rows; y += 1) {
          for (let x = 0; x < cols; x += 1) {
            const cell = y * cols + x
            const at = cell * 3
            const px = cell * 4

            // Le centre de la cellule, ramene au repere de la scene : l'axe
            // vertical y monte, celui de l'image descend.
            positions[at] = ((x + 0.5) / cols) * width - width / 2
            positions[at + 1] = height / 2 - ((y + 0.5) / rows) * height
            positions[at + 2] = 0

            // Les couleurs de l'image sont en sRGB, la scene travaille en
            // lineaire : sans cette conversion, le nuage sort delave.
            tints[at] = ((pixels[px] ?? 0) / 255) ** 2.2
            tints[at + 1] = ((pixels[px + 1] ?? 0) / 255) ** 2.2
            tints[at + 2] = ((pixels[px + 2] ?? 0) / 255) ** 2.2
          }
        }

        const data: Sample = { positions, tints }
        sample.current = data
        assembly.current = 0
        pour.current?.(data)
      } catch {
        // Canevas teinte : la photo reste seule, sans nuage.
        sample.current = null
      }
    }

    source.addEventListener('load', read)
    source.src = src
    if (source.complete && source.naturalWidth > 0) read()

    return () => {
      cancelled = true
      source.removeEventListener('load', read)
    }
  }, [src, cols, rows, count, ratio])

  const { ref } = useScene({
    name: 'image en particules',
    setup: (scene) => {
      context.current = scene
      const { three, camera, renderer } = scene

      const ground = readTokenColour(background, host)
      renderer.setClearColor(
        new three.Color(
          ground?.[0] ?? 0.98,
          ground?.[1] ?? 0.98,
          ground?.[2] ?? 0.98,
        ).convertSRGBToLinear(),
        1,
      )

      const positions = new Float32Array(count * 3)
      const tints = new Float32Array(count * 3)
      const seeds = new Float32Array(count * 3)
      for (let index = 0; index < count * 3; index += 1) {
        seeds[index] = Math.random() * 2 - 1
      }

      const geometry = new three.BufferGeometry()
      geometry.setAttribute('position', new three.BufferAttribute(positions, 3))
      geometry.setAttribute('aTint', new three.BufferAttribute(tints, 3))
      geometry.setAttribute('aSeed', new three.BufferAttribute(seeds, 3))

      uniforms.current = {
        uTime: { value: 0 },
        uScatter: { value: Math.max(0, scatter) },
        uAssembly: { value: 0 },
        uCell: { value: ((HALF * 2) / rows) * Math.max(0.2, size) },
        uProjection: { value: 500 },
      }

      const points = new three.Points(
        geometry,
        new three.ShaderMaterial({
          vertexShader: IMAGE_PARTICLES_VERTEX,
          fragmentShader: IMAGE_PARTICLES_FRAGMENT,
          uniforms: uniforms.current,
        }),
      )
      // Les places arrivent apres la construction : la sphere englobante
      // calculee sur des zeros ferait disparaitre le nuage entier des que la
      // camera bouge.
      points.frustumCulled = false

      const group = new three.Group()
      group.name = 'nuage'
      group.add(points)
      scene.scene.add(group)

      // Le plan fait deux unites de haut : place la camera a cette distance,
      // il occupe exactement la hauteur du champ.
      camera.position.set(0, 0, HALF / Math.tan((45 * Math.PI) / 360))
      camera.lookAt(0, 0, 0)

      // Le rendez-vous : si l'echantillon est deja la, il est verse tout de
      // suite ; sinon, la lecture appellera cette fonction en aboutissant.
      pour.current = (data) => {
        positions.set(data.positions)
        tints.set(data.tints)
        geometry.getAttribute('position').needsUpdate = true
        geometry.getAttribute('aTint').needsUpdate = true
      }
      if (sample.current !== null) pour.current(sample.current)

      return () => {
        pour.current = null
      }
    },

    frame: ({ scene, camera, renderer }, { time, delta }) => {
      const live = uniforms.current
      const clock = live['uTime']
      if (clock !== undefined) clock.value = time * Math.max(0, speed)

      // La taille d'un point se calcule en pixels du tampon : elle depend de
      // la hauteur reelle du canevas et de l'ouverture de la camera.
      const projection = live['uProjection']
      if (projection !== undefined) {
        const height = renderer.domElement.height
        projection.value = height / (2 * Math.tan((camera.fov * Math.PI) / 360))
      }

      // Le rassemblement n'avance que lorsqu'il y a quelque chose a
      // rassembler, et se termine en douceur : une arrivee lineaire aurait
      // l'air d'un arret net.
      const state = live['uAssembly']
      if (state !== undefined && sample.current !== null && assembly.current < 1) {
        assembly.current = Math.min(
          1,
          assembly.current + (delta * 1000) / Math.max(120, duration),
        )
        const t = assembly.current
        state.value = 1 - (1 - t) ** 3
      }

      const group = scene.getObjectByName('nuage')
      if (group === undefined) return

      // Cadrage « cover » du plan : si le cadre est plus large que l'image,
      // le nuage grandit pour le remplir plutot que de laisser des bandes.
      group.scale.setScalar(Math.max(1, camera.aspect / Math.max(ratio, 0.1)))

      if (parallax === 0) return
      const lean = pointer.current
      group.rotation.y += (lean.x * parallax - group.rotation.y) * delta * 3
      group.rotation.x += (lean.y * parallax * 0.6 - group.rotation.x) * delta * 3
    },
  })

  // Le theme a bascule : le fond de la scene est relu, la scene n'est pas
  // reconstruite.
  useEffect(() => {
    const scene = context.current
    if (scene === null) return
    const ground = readTokenColour(background, host)
    if (ground === undefined) return
    scene.renderer.setClearColor(
      new scene.three.Color(
        ground[0] ?? 0,
        ground[1] ?? 0,
        ground[2] ?? 0,
      ).convertSRGBToLinear(),
      1,
    )
  }, [theme, background, host])

  const { className, style } = mergePresentation(
    { className: 'o-relative o-overflow-hidden' },
    rest,
  )

  return (
    <div className={className} style={{ ...style, aspectRatio: String(ratio) }}>
      <img
        loading="lazy"
        decoding="async"
        {...rest}
        src={src}
        alt={alt}
        className="o-absolute o-inset-0 o-size-full o-object-cover"
      />

      {/* La surface de la scene : posee sur la photo, decorative, opaque des
          qu'elle rend. Sans elle, la photo est tout ce qu'il y a. */}
      <div
        aria-hidden
        ref={(element) => {
          setHost(element)
          ref.current = element
        }}
        className="o-absolute o-inset-0"
      />
    </div>
  )
}

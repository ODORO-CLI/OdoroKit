/**
 * Particules : le titre s'assemble depuis une nuee, puis redevient du texte.
 *
 * ## Le canevas est un echafaudage, pas le rendu final
 *
 * La nuee est peinte sur un canevas pose au-dessus du titre, pendant la duree
 * de l'assemblage — quelques secondes — puis elle s'efface et le texte reel
 * reprend sa place. Rien ne reste a la charge du navigateur ensuite : ni
 * boucle, ni surface, ni contexte.
 *
 * C'est pour cela que le titre reel est ecrit dans le flux et qu'il donne sa
 * boite au composant. Il n'est rendu transparent **que pendant** la nuee : si
 * le canevas manque, si le contexte 2D est refuse, si la mesure echoue, le
 * titre est simplement la.
 *
 * ## Les cibles viennent du texte lui-meme
 *
 * Le titre est dessine une fois hors champ, dans sa propre police et a sa
 * propre taille, et le canal alpha est echantillonne au pas demande : chaque
 * point couvert devient la destination d'une particule. Aucune forme n'est
 * decrite a la main — changer la police change la nuee.
 *
 * ## Le fondu final n'est pas une coquetterie
 *
 * Une nuee de carres, meme parfaitement rangee, n'est pas un glyphe : le
 * passage de l'une a l'autre serait un saut. Les deux se croisent donc sur
 * deux dixiemes de seconde, ce qui rend le raccord invisible sans rien devoir
 * mesurer au pixel pres.
 *
 * ## Une ligne, un titre
 *
 * L'echantillonnage suppose un texte qui tient sur une ligne : c'est le cas
 * d'usage — un titre. Un paragraphe donnerait des dizaines de milliers de
 * particules pour un effet illisible.
 *
 * ## Mouvement reduit
 *
 * Aucune nuee, aucun canevas : le titre est la, assemble. C'est l'etat
 * d'arrivee.
 *
 * @module
 */

import {
  CLOCK_PRIORITY,
  clock,
  mergePresentation,
  useMotionState,
  type ClockSubscription,
  type Customisable,
} from '@odoro-cli/engine'
import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ElementType,
  type ReactElement,
} from 'react'

import { useInView } from '@registre/hooks/useInView'

/** Ce qui declenche l'assemblage. */
export type ParticleTextDeclenchement = 'montage' | 'vue' | 'survol'

/** Proprietes propres au composant. */
export interface ParticleTextOwnProps {
  /** Texte a assembler. Une chaine, tenant sur une ligne. */
  children: string
  /** Balise rendue. @defaultValue 'span' */
  as?: ElementType
  /** Pas d'echantillonnage, en pixels. Plus bas, plus dense. @defaultValue 5 */
  step?: number
  /** Duree du vol d'une particule, en millisecondes. @defaultValue 1400 */
  duration?: number
  /** Etalement des departs, en millisecondes. @defaultValue 600 */
  spread?: number
  /**
   * Quand assembler.
   *
   * @defaultValue 'vue'
   */
  declenchement?: ParticleTextDeclenchement
}

/** Toutes les proprietes. */
export type ParticleTextProps = Customisable<ParticleTextOwnProps, 'span'>

/** Identifiant de la feuille injectee. */
const STYLE_ID = 'o-particle-text'

/** Plafond de particules : au-dela, le cout croit sans que l'oeil y gagne. */
const PARTICULES_MAX = 2400

/** Duree du croisement entre la nuee et le texte, en millisecondes. */
const FONDU_MS = 240

/** Pose les regles du calque, une fois par document. */
function ensureParticleRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-particle]{position:relative;display:inline-block}',
    '[data-o-particle-source]{display:inline-block}',
    // L'original n'est transparent que pendant la nuee.
    '[data-o-particle-hidden]{color:transparent}',
    '[data-o-particle-layer]{',
    'position:absolute;inset:0;width:100%;height:100%;pointer-events:none;',
    '}',
  ].join('')
  document.head.append(style)
}

/** Sortie franche puis amortie : la particule arrive, elle ne freine pas. */
function amorti(t: number): number {
  const reste = 1 - t
  return 1 - reste * reste * reste
}

/**
 * Assemble un titre depuis une nuee de particules.
 *
 * @example
 * <ParticleText as="h1" className="o-text-6xl o-font-black">
 *   Odoro
 * </ParticleText>
 *
 * @example
 * // Une nuee dense et lente, rejouee a chaque survol.
 * <ParticleText step={3} duration={2400} declenchement="survol">Atelier</ParticleText>
 */
export function ParticleText({
  children,
  as: Tag = 'span',
  step = 5,
  duration = 1400,
  spread = 600,
  declenchement = 'vue',
  ...rest
}: ParticleTextProps): ReactElement {
  const { reduced } = useMotionState()
  const { ref: refHote, vu } = useInView<HTMLElement>({
    immediat: declenchement === 'montage',
  })

  const refSource = useRef<HTMLSpanElement | null>(null)
  const refCanevas = useRef<HTMLCanvasElement | null>(null)
  const [enCours, setEnCours] = useState(false)

  ensureParticleRule()

  useEffect(() => {
    if (reduced) return

    const hote = refHote.current
    const source = refSource.current
    const canevas = refCanevas.current
    if (hote === null || source === null || canevas === null) return

    let abonnement: ClockSubscription | null = null

    const arreter = (): void => {
      abonnement?.unsubscribe()
      abonnement = null
      const ctx = canevas.getContext('2d')
      ctx?.clearRect(0, 0, canevas.width, canevas.height)
      setEnCours(false)
    }

    const jouer = (): void => {
      abonnement?.unsubscribe()
      abonnement = null

      const boite = source.getBoundingClientRect()
      if (boite.width < 8 || boite.height < 8) return

      const ctx = canevas.getContext('2d', { willReadFrequently: true })
      if (ctx === null) return

      // Deux fois la resolution suffit : au-dela, on peint quatre fois plus de
      // pixels pour une difference que l'ecran ne montre pas.
      const echelle = Math.min(2, window.devicePixelRatio || 1)
      const largeur = Math.max(1, Math.round(boite.width * echelle))
      const hauteur = Math.max(1, Math.round(boite.height * echelle))
      canevas.width = largeur
      canevas.height = hauteur

      const habillage = getComputedStyle(source)
      const encre = habillage.color
      const corps = Number.parseFloat(habillage.fontSize) * echelle

      ctx.setTransform(1, 0, 0, 1, 0, 0)
      ctx.globalAlpha = 1
      ctx.clearRect(0, 0, largeur, hauteur)
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.font = `${habillage.fontStyle} ${habillage.fontWeight} ${String(corps)}px ${habillage.fontFamily}`
      ctx.fillStyle = encre
      ctx.fillText(children, largeur / 2, hauteur / 2)

      const pixels = ctx.getImageData(0, 0, largeur, hauteur).data
      ctx.clearRect(0, 0, largeur, hauteur)

      const pas = Math.max(2, Math.round(step * echelle))
      const cibles: number[] = []
      for (let y = 0; y < hauteur; y += pas) {
        for (let x = 0; x < largeur; x += pas) {
          if ((pixels[(y * largeur + x) * 4 + 3] ?? 0) > 128) cibles.push(x, y)
        }
      }

      const total = cibles.length / 2
      if (total === 0) return

      // Un pas sur deux, sur trois… plutot qu'un tirage : la nuee garde sa
      // repartition, elle ne se troue pas par endroits.
      const saut = Math.max(1, Math.ceil(total / PARTICULES_MAX))
      const compte = Math.floor((total + saut - 1) / saut)

      const cible = new Float32Array(compte * 2)
      const depart = new Float32Array(compte * 2)
      const retard = new Float32Array(compte)

      const rayon = Math.max(largeur, hauteur)
      for (let index = 0; index < compte; index += 1) {
        const lu = index * saut * 2
        cible[index * 2] = cibles[lu] ?? 0
        cible[index * 2 + 1] = cibles[lu + 1] ?? 0

        const angle = Math.random() * Math.PI * 2
        const distance = rayon * (0.6 + Math.random() * 0.7)
        depart[index * 2] = largeur / 2 + Math.cos(angle) * distance
        depart[index * 2 + 1] = hauteur / 2 + Math.sin(angle) * distance
        retard[index] = Math.random() * spread
      }

      const taille = Math.max(1, pas * 0.72)
      const debut = performance.now()
      let revele = false
      let instantFondu = 0

      setEnCours(true)

      abonnement = clock.subscribe(
        () => {
          const ecoule = performance.now() - debut

          if (!revele && ecoule > spread + duration) {
            revele = true
            instantFondu = ecoule
            // Le texte reel revient pendant que la nuee s'efface : les deux se
            // croisent, et le raccord ne se voit pas.
            setEnCours(false)
          }

          const opacite = revele ? 1 - (ecoule - instantFondu) / FONDU_MS : 1
          if (opacite <= 0) {
            arreter()
            return
          }

          ctx.clearRect(0, 0, largeur, hauteur)
          ctx.globalAlpha = opacite
          ctx.fillStyle = encre

          for (let index = 0; index < compte; index += 1) {
            const avance = Math.min(
              1,
              Math.max(0, (ecoule - (retard[index] ?? 0)) / duration),
            )
            const part = amorti(avance)
            const ax = depart[index * 2] ?? 0
            const ay = depart[index * 2 + 1] ?? 0
            const bx = cible[index * 2] ?? 0
            const by = cible[index * 2 + 1] ?? 0
            ctx.fillRect(ax + (bx - ax) * part, ay + (by - ay) * part, taille, taille)
          }
        },
        { name: 'titre en particules', priority: CLOCK_PRIORITY.default },
      )
    }

    if (declenchement === 'survol') {
      const entrer = (): void => {
        jouer()
      }
      hote.addEventListener('pointerenter', entrer)
      return () => {
        hote.removeEventListener('pointerenter', entrer)
        arreter()
      }
    }

    if (vu) jouer()
    return arreter
  }, [refHote, reduced, vu, children, step, duration, spread, declenchement])

  const { className, style } = mergePresentation({}, rest)

  return (
    <Tag
      {...rest}
      ref={refHote}
      className={className}
      style={style as CSSProperties}
      data-o-particle=""
    >
      <span
        ref={refSource}
        data-o-particle-source=""
        {...(enCours ? { 'data-o-particle-hidden': '' } : {})}
      >
        {children}
      </span>
      <canvas ref={refCanevas} aria-hidden="true" data-o-particle-layer="" />
    </Tag>
  )
}

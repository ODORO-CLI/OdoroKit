/**
 * Fusion : un mot se coule dans le suivant au lieu de se substituer a lui.
 *
 * ## Ce que le filtre fait, et pourquoi un fondu ne suffit pas
 *
 * Deux mots superposes dont l'un s'efface pendant que l'autre apparait, c'est
 * un fondu croise : au milieu du chemin on voit deux textes a moitie
 * transparents l'un sur l'autre, et l'oeil lit deux mots.
 *
 * Le filtre change la nature du passage. Chaque mot est d'abord noye dans un
 * flou, puis une matrice de couleur multiplie fortement l'alpha et le decale
 * vers le bas : tout ce qui etait a demi transparent redevient franchement
 * opaque ou franchement vide. Le seuil retaille un contour net autour des
 * deux halos melanges. La ou les lettres des deux mots se recouvrent, la
 * matiere se soude ; la ou elles s'ecartent, un cou s'amincit et casse.
 *
 * Au milieu du chemin on ne voit donc plus deux mots, mais une seule forme en
 * train de se defaire — ce qui est exactement le propos.
 *
 * ## Le repli est l'etat de base, pas une branche
 *
 * Le fondu croise est ecrit en premier : les deux couches changent d'opacite
 * quoi qu'il arrive. Le filtre est **ajoute** par-dessus quand le navigateur
 * sait le rendre, et le flou de chaque couche est ramene a zero quand il ne
 * le sait pas — sans quoi le repli serait un fondu entre deux taches floues.
 *
 * Le filtre est aussi retire en couleurs forcees, ou il effacerait le
 * contraste que ce mode vient justement d'imposer.
 *
 * ## L'etat est porte par le rendu, l'animation ne fait que le rejoindre
 *
 * L'opacite de repos de chaque couche se deduit de l'indice courant. Les
 * animations tiennent leur valeur finale, puis sont annulees une fois le
 * rendu suivant pose : a aucun moment la valeur affichee ne differe de la
 * valeur calculee, et rien ne s'accumule au fil des tours.
 *
 * ## L'espace reserve
 *
 * Les mots sont empiles dans la meme cellule de grille : la boite prend la
 * taille du plus long et ne bouge plus. Une boite qui se redimensionnerait
 * pendant la fusion ferait respirer toute la ligne.
 *
 * ## Mouvement reduit
 *
 * Le premier mot, sans filtre et sans fusion. Une boucle n'a pas d'etat
 * d'arrivee : son repos, c'est son point de depart.
 *
 * @module
 */

import { mergePresentation, useMotionState, type Customisable } from '@odoro-cli/engine'
import {
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type ReactElement,
} from 'react'

/** Proprietes propres au composant. */
export interface MorphTextOwnProps {
  /** Mots fondus l'un dans l'autre, en boucle. Au moins deux. */
  mots: readonly string[]
  /** Temps pendant lequel un mot reste lisible, en millisecondes. @defaultValue 1400 */
  hold?: number
  /** Duree d'une fusion, en millisecondes. @defaultValue 900 */
  morph?: number
  /** Flou traverse par chaque mot pendant la fusion, en pixels. @defaultValue 12 */
  flou?: number
  /** Force du soudage, en pixels d'etalement. @defaultValue 4 */
  fusion?: number
}

/** Toutes les proprietes. */
export type MorphTextProps = Customisable<MorphTextOwnProps, 'span'>

/** Identifiant de la feuille injectee. */
const STYLE_ID = 'o-morph-text'

/**
 * Matrice de seuil : les couleurs passent telles quelles, l'alpha est
 * multiplie puis abaisse. Le produit vaut un au-dela d'environ un demi et
 * zero en deca : le degrade du flou redevient un bord.
 */
const SEUIL = '1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -10'

/**
 * Corps minimal, en pixels, sous lequel la soudure est abandonnee.
 *
 * Le seuil ne garde que ce qui reste au-dessus d'un alpha de 0,5 apres le
 * flou. Un jambage de texte courant — deux pixels a vingt de corps — n'y
 * survit pas, et le mot disparait **entierement**, sans erreur et sans trace.
 * Quarante-quatre pixels est le seuil mesure a partir duquel un jambage de
 * grotesque ordinaire tient.
 */
const CORPS_MINIMAL = 44

/** Pose l'empilement des mots, une fois par document. */
function ensureMorphRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-morph]{position:relative;display:inline-grid}',
    '[data-o-morph-layer]{grid-area:1/1}',
  ].join('')
  document.head.append(style)
}

/**
 * Dit si le navigateur sait souder deux formes par un filtre.
 *
 * Deux conditions, et elles ne se recouvrent pas : la matrice de couleur doit
 * exister, et le mode a couleurs forcees doit etre absent — il neutralise les
 * filtres, et le seuil rendrait alors le texte illisible plutot que soude.
 */
function saitSouder(): boolean {
  if (typeof window === 'undefined') return false
  if (typeof SVGFEColorMatrixElement === 'undefined') return false
  return !window.matchMedia('(forced-colors: active)').matches
}

/**
 * Fait fondre une suite de mots les uns dans les autres.
 *
 * @example
 * <MorphText mots={['penser', 'faire']} className="o-text-5xl o-font-bold" />
 *
 * @example
 * // Fusion lente et tres coulante.
 * <MorphText mots={['eau', 'air', 'feu']} morph={1600} flou={22} fusion={7} />
 */
export function MorphText({
  mots,
  hold = 1400,
  morph = 900,
  flou = 12,
  fusion,
  ...rest
}: MorphTextProps): ReactElement {
  const { reduced } = useMotionState()
  const hote = useRef<HTMLElement | null>(null)
  const [index, setIndex] = useState(0)
  const [soude, setSoude] = useState(false)
  // Le corps rendu, lu une fois : c'est lui qui decide si la soudure est
  // possible, et de combien on floute.
  const [corps, setCorps] = useState(0)

  ensureMorphRule()

  // Un identifiant par instance : deux fusions sur la meme page ne doivent
  // pas se partager un filtre.
  const filtre = `o-morph-text-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`

  const total = mots.length

  useEffect(() => {
    const element = hote.current
    const taille =
      element === null ? 0 : Number.parseFloat(getComputedStyle(element).fontSize)
    setCorps(Number.isFinite(taille) ? taille : 0)
    // CORPS_MINIMAL : en deca, le seuil mangerait les jambages et le mot
    // disparaitrait. Le fondu croise prend alors le relais — il est ecrit en
    // premier, justement pour cela.
    setSoude(!reduced && saitSouder() && taille >= CORPS_MINIMAL)
  }, [reduced])

  // Le flou du filtre suit le corps : fixe, il efface un texte courant et ne
  // se voit pas sur un titre de deux cents pixels.
  const fusionUtile = fusion ?? Math.max(1.5, corps * 0.05)

  useEffect(() => {
    const element = hote.current
    if (element === null || reduced || total < 2) return

    const couches = [...element.querySelectorAll<HTMLElement>('[data-o-morph-layer]')]
    const sortante = couches[index]
    const entrante = couches[(index + 1) % total]
    if (sortante === undefined || entrante === undefined) return

    // Sans filtre, le flou n'aide plus : il ne resterait qu'un fondu entre
    // deux taches. Voir l'en-tete du module.
    const traverse = soude ? flou : 0

    const sortie = sortante.animate(
      [
        { opacity: 1, filter: 'blur(0px)' },
        { opacity: 0, filter: `blur(${String(traverse)}px)` },
      ],
      { duration: morph, delay: hold, easing: 'ease-in', fill: 'forwards' },
    )
    const entree = entrante.animate(
      [
        { opacity: 0, filter: `blur(${String(traverse)}px)` },
        { opacity: 1, filter: 'blur(0px)' },
      ],
      { duration: morph, delay: hold, easing: 'ease-out', fill: 'forwards' },
    )

    entree.onfinish = (): void => {
      setIndex((precedent) => (precedent + 1) % total)
    }

    // Annulees seulement au rendu suivant, une fois que l'opacite calculee a
    // pris la meme valeur : rien ne clignote entre les deux.
    return () => {
      sortie.cancel()
      entree.cancel()
    }
  }, [reduced, soude, index, total, hold, morph, flou])

  const { className, style } = mergePresentation({}, rest)

  const courant = total === 0 ? 0 : index % total

  const styleRacine = {
    ...style,
    // Le filtre ne s'applique qu'a la pile : l'appliquer a l'element entier
    // engloberait ce que l'appelant met autour.
    ...(soude ? { filter: `url(#${filtre})` } : {}),
  } as CSSProperties

  return (
    <span {...rest} ref={hote} className={className} style={styleRacine} data-o-morph="">
      {/* Zone du filtre elargie d'un cinquieme : par defaut elle serre la
          boite englobante de trop pres, et le flou serait coupe net. */}
      <svg
        aria-hidden
        width="0"
        height="0"
        style={{ position: 'absolute', width: 0, height: 0 }}
      >
        <defs>
          <filter id={filtre} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur in="SourceGraphic" stdDeviation={fusionUtile} result="halo" />
            <feColorMatrix in="halo" type="matrix" values={SEUIL} />
          </filter>
        </defs>
      </svg>

      {mots.map((mot, position) => (
        <span
          key={`${mot}-${String(position)}`}
          data-o-morph-layer=""
          aria-hidden={position !== courant}
          style={{ opacity: position === courant ? 1 : 0 }}
        >
          {mot}
        </span>
      ))}
    </span>
  )
}

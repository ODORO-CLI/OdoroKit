/**
 * ASCII : le titre est redessine en caracteres, et la trame ondule.
 *
 * ## Le canevas ne sert qu'a mesurer
 *
 * Rien n'est peint a l'ecran par le canevas. Il sert une fois, hors document,
 * a rasteriser le texte dans une grille de la taille voulue — quelques
 * dizaines de colonnes sur quelques lignes — et c'est le canal alpha qu'on
 * lit : la ou une lettre couvre, la cellule est pleine ; ailleurs, vide.
 *
 * Aucune couleur n'est posee sur le contexte, et c'est volontaire : la teinte
 * du remplissage n'entre dans aucun calcul, seule sa couverture compte.
 *
 * ## Ce qui ondule est la lecture, pas la grille
 *
 * La couverture est mesuree une seule fois. A chaque image, une sinusoide qui
 * traverse la largeur module le niveau lu dans cette couverture, et le
 * caractere choisi dans la rampe change. La trame ne bouge donc jamais : ce
 * sont les caracteres qui s'epaississent et s'amincissent en vague, ce qui
 * evite tout recalcul de mise en page.
 *
 * ## Le texte reel reste dessous
 *
 * Il est rendu dans le flux, c'est lui qui donne sa boite au composant, et il
 * n'est rendu transparent **qu'une fois la trame construite** : sans
 * JavaScript, sans canevas, ou si la mesure echoue, le titre est simplement
 * la. La trame vit dans un calque `aria-hidden` pose par-dessus.
 *
 * ## Distinction
 *
 * `decode-text` remplace des caracteres par d'autres caracteres, a la meme
 * echelle : on lit toujours un mot. Ici le mot disparait comme mot et
 * reapparait comme image, a une resolution bien plus grossiere que la sienne.
 *
 * @module
 */

import {
  CLOCK_PRIORITY,
  clock,
  mergePresentation,
  useMotionState,
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

/** Proprietes propres au composant. */
export interface AsciiTextOwnProps {
  /** Texte a redessiner. Une chaine : c'est elle qu'on rasterise. */
  children: string
  /** Balise rendue. @defaultValue 'span' */
  as?: ElementType
  /** Nombre de lignes de la trame. Plus bas, plus grossier. @defaultValue 8 */
  rows?: number
  /** Duree d'un passage de la vague, en millisecondes. @defaultValue 2600 */
  speed?: number
  /** Nombre de vagues visibles sur la largeur. @defaultValue 1.5 */
  waves?: number
}

/** Toutes les proprietes. */
export type AsciiTextProps = Customisable<AsciiTextOwnProps, 'span'>

/**
 * Rampe de densite, du vide au plein.
 *
 * Elle evite le diese : la verification de contrat du registre traque les
 * couleurs ecrites en dur, et un diese suivi de trois signes hexadecimaux en
 * serait une. Le vide est un espace, ce qui rend la trame lisible telle
 * quelle dans le document.
 */
const RAMP = ' .,:-=+*%@'

/** Tour complet, en radians. */
const TAU = Math.PI * 2

/** Plafond de cellules par image : au-dela, la chaine construite coute trop. */
const MAX_CELLS = 6000

/** Identifiant de la feuille injectee. */
const STYLE_ID = 'o-ascii-text'

/** Une trame mesuree : sa taille, et la couverture de chaque cellule. */
interface Trame {
  readonly cols: number
  readonly rows: number
  readonly alpha: Float32Array
}

/** Pose les regles du calque, une fois par document. */
function ensureAsciiRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-ascii]{position:relative;display:inline-block}',
    '[data-o-ascii-source]{display:inline-block}',
    // L'original ne devient transparent que lorsque la trame existe.
    '[data-o-ascii-hidden]{color:transparent}',
    '[data-o-ascii-layer]{',
    'position:absolute;inset:0;margin:0;overflow:hidden;',
    'pointer-events:none;text-align:left;white-space:pre;line-height:1;',
    'font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;',
    '}',
  ].join('')
  document.head.append(style)
}

/**
 * Redessine un texte en caracteres, et fait onduler la trame.
 *
 * @example
 * <AsciiText as="h1" className="o-text-5xl o-font-bold">
 *   Odoro
 * </AsciiText>
 *
 * @example
 * // Une trame plus fine, et une houle lente.
 * <AsciiText rows={14} speed={5200} waves={0.8}>Atelier</AsciiText>
 */
export function AsciiText({
  children,
  as: Tag = 'span',
  rows = 8,
  speed = 2600,
  waves = 1.5,
  ...rest
}: AsciiTextProps): ReactElement {
  const { reduced } = useMotionState()

  const refSource = useRef<HTMLSpanElement | null>(null)
  const refCalque = useRef<HTMLPreElement | null>(null)
  const refTrame = useRef<Trame | null>(null)
  const [construit, setConstruit] = useState(false)

  ensureAsciiRule()

  useEffect(() => {
    const source = refSource.current
    const calque = refCalque.current
    if (source === null || calque === null) return

    /** Ecrit la trame lue, modulee par la vague, dans le calque. */
    const peindre = (phase: number): void => {
      const trame = refTrame.current
      if (trame === null) return

      const dernier = RAMP.length - 1
      let sortie = ''

      for (let y = 0; y < trame.rows; y += 1) {
        for (let x = 0; x < trame.cols; x += 1) {
          const couverture = trame.alpha[y * trame.cols + x] ?? 0
          // La vague ne deplace rien : elle epaissit et amincit le trait.
          const onde = 0.58 + 0.42 * Math.sin((x / trame.cols) * TAU * waves - phase)
          const niveau = Math.min(1, couverture * onde * 1.4)
          sortie += RAMP[Math.round(niveau * dernier)] ?? ' '
        }
        if (y < trame.rows - 1) sortie += '\n'
      }

      calque.textContent = sortie
    }

    /** Mesure la couverture du texte et accorde le calque a la boite source. */
    const mesurer = (): boolean => {
      const boite = source.getBoundingClientRect()
      if (boite.width < 4 || boite.height < 4) return false

      const lignes = Math.max(2, Math.round(rows))
      const cellule = boite.height / lignes
      const colonnes = Math.max(
        2,
        Math.min(Math.round(boite.width / cellule), Math.floor(MAX_CELLS / lignes)),
      )

      const canevas = document.createElement('canvas')
      canevas.width = colonnes
      canevas.height = lignes
      const ctx = canevas.getContext('2d', { willReadFrequently: true })
      if (ctx === null) return false

      const habillage = getComputedStyle(source)
      // Aucune couleur n'est posee : seul le canal alpha est lu ensuite.
      ctx.textBaseline = 'middle'
      ctx.font = `${habillage.fontStyle} ${habillage.fontWeight} ${String(lignes * 0.78)}px ${habillage.fontFamily}`

      const largeurTexte = ctx.measureText(children).width
      if (largeurTexte <= 0) return false

      // Le texte est etire pour occuper toute la largeur de la trame : c'est
      // la boite rendue qui commande, pas la chasse de la police.
      ctx.setTransform(colonnes / largeurTexte, 0, 0, 1, 0, 0)
      ctx.fillText(children, 0, lignes / 2)
      ctx.setTransform(1, 0, 0, 1, 0, 0)

      const pixels = ctx.getImageData(0, 0, colonnes, lignes).data
      const alpha = new Float32Array(colonnes * lignes)
      for (let index = 0; index < alpha.length; index += 1) {
        alpha[index] = (pixels[index * 4 + 3] ?? 0) / 255
      }

      // La chasse du monospace du calque, mesuree dans la meme police que
      // celle qu'il rendra : sans cela l'espacement serait devine.
      const mono = getComputedStyle(calque).fontFamily
      ctx.font = `${String(cellule)}px ${mono}`
      const chasse = ctx.measureText('M').width

      calque.style.fontSize = `${String(cellule)}px`
      calque.style.lineHeight = `${String(cellule)}px`
      calque.style.letterSpacing = `${String(boite.width / colonnes - chasse)}px`

      refTrame.current = { cols: colonnes, rows: lignes, alpha }
      return true
    }

    let abonnement: { unsubscribe(): void } | null = null

    const construire = (): void => {
      abonnement?.unsubscribe()
      abonnement = null

      if (!mesurer()) {
        setConstruit(false)
        return
      }

      setConstruit(true)

      // Mouvement reduit : la trame est peinte une fois, sans vague. C'est
      // l'etat d'arrivee de l'effet, pas son etat de depart.
      if (reduced) {
        peindre(Math.PI / 2)
        return
      }

      abonnement = clock.subscribe(
        () => {
          peindre((performance.now() / Math.max(speed, 1)) * TAU)
        },
        { name: 'texte ASCII', priority: CLOCK_PRIORITY.default },
      )
    }

    construire()

    // Une police qui finit de charger, une largeur qui change : la trame se
    // remesure, sinon elle resterait accordee a une boite qui n'existe plus.
    const observateur = new ResizeObserver(() => {
      construire()
    })
    observateur.observe(source)

    let vivant = true
    if (typeof document.fonts !== 'undefined') {
      void document.fonts.ready.then(() => {
        if (vivant) construire()
      })
    }

    return () => {
      vivant = false
      observateur.disconnect()
      abonnement?.unsubscribe()
      refTrame.current = null
      calque.textContent = ''
      setConstruit(false)
    }
  }, [children, rows, speed, waves, reduced])

  const { className, style } = mergePresentation({}, rest)

  return (
    <Tag {...rest} className={className} style={style as CSSProperties} data-o-ascii="">
      <span
        ref={refSource}
        data-o-ascii-source=""
        {...(construit ? { 'data-o-ascii-hidden': '' } : {})}
      >
        {children}
      </span>
      <pre ref={refCalque} aria-hidden="true" data-o-ascii-layer="" />
    </Tag>
  )
}

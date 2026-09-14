/**
 * Mots qui se retournent : un tambour de mots en 3D, dont le mot courant
 * bascule vers le bas pendant que le suivant descend a sa place.
 *
 * ## Un tambour, pas une pile de cartes
 *
 * Faire tourner chaque mot separement demande autant d'animations que de
 * mots, et leurs images-cles dependent toutes du nombre total : le mot trois
 * doit entrer quand le mot deux sort. Ici les mots sont les faces d'un prisme
 * dont l'axe est horizontal, et c'est le prisme qui tourne. Une seule
 * animation, un seul objet, et les faces se relaient d'elles-memes par la
 * geometrie.
 *
 * Le rayon du prisme est calcule pour que les faces se touchent par leurs
 * bords : chaque face est a la distance du centre qui fait qu'un polygone
 * regulier a autant de cotes se referme. Deux mots donnent une piece a deux
 * faces, dos a dos ; trois, un prisme triangulaire ; et ainsi de suite. Les
 * faces tournees vers l'arriere sont cachees, et le cadre rogne ce qui
 * depasse de la ligne : on ne voit jamais qu'un mot, et le passage de l'un
 * a l'autre.
 *
 * Le tambour tourne par crans, avec une pause sur chaque mot : sans les
 * paliers, on ne lirait jamais un mot entier. Les images-cles dependent du
 * nombre de faces, elles sont donc engendrees une fois par nombre de faces
 * rencontre, et non par composant.
 *
 * ## Un statut, pas un dessin
 *
 * L'element porte `role="status"` et un libelle pour les lecteurs d'ecran.
 * Les faces sont retirees de l'arbre d'accessibilite : elles sont toutes
 * dans le document, et un lecteur d'ecran les enchainerait en une phrase.
 *
 * Sous mouvement reduit, le tambour est a l'arret sur son premier mot : il
 * se lit encore comme une attente, seule la bascule s'arrete.
 *
 * @module
 */

import { mergePresentation, type Customisable } from '@odoro-cli/engine'
import type { CSSProperties, ReactElement } from 'react'

/** Identifiant de la feuille injectee. */
const STYLE_ID = 'o-word-flip'

/** Part de chaque cran passee a l'arret sur le mot. */
const HOLD_SHARE = 0.68

/** Hauteur d'une face, en em du corps. */
const LINE = 1.4

/** Pose le cadre, le tambour et ses faces, une fois par document. */
function ensureWordFlipRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-wf]{',
    'display:inline-block;overflow:hidden;white-space:nowrap;vertical-align:middle;',
    'font-weight:600;font-size:var(--o-wf-size);color:var(--o-wf-color);',
    // Le point de fuite est proche : un tambour vu de loin se lirait comme
    // un simple glissement vertical.
    'perspective:calc(var(--o-wf-h) * 5);',
    '}',
    '[data-o-wf-drum]{',
    'position:relative;display:block;height:var(--o-wf-h);',
    'transform-style:preserve-3d;',
    'animation:var(--o-wf-drum) var(--o-wf-cycle) cubic-bezier(0.65,0,0.35,1) infinite;',
    '}',
    // Le plus long des mots, invisible, tient la largeur : les faces sont
    // hors flux et ne mesurent rien.
    '[data-o-wf-sizer]{display:block;height:var(--o-wf-h);visibility:hidden;padding:0 0.15em}',
    '[data-o-wf-face]{',
    'position:absolute;inset:0;display:flex;align-items:center;justify-content:center;',
    'backface-visibility:hidden;',
    'transform:rotateX(var(--o-wf-angle)) translateZ(var(--o-wf-r));',
    '}',
    '@media (prefers-reduced-motion:reduce){',
    '[data-o-wf-drum]{animation:none;transform:none}',
    '}',
  ].join('')
  document.head.append(style)
}

/**
 * Pose les images-cles d'un tambour a `faces` faces, une fois par document
 * et par nombre de faces.
 *
 * Chaque cran : un palier sur le mot, puis un tour d'un n-ieme jusqu'au
 * suivant. Le dernier cran ramene a un tour complet, et la boucle est
 * invisible.
 */
function ensureWordFlipDrumRule(faces: number): void {
  if (typeof document === 'undefined') return
  const id = `${STYLE_ID}-${String(faces)}`
  if (document.getElementById(id) !== null) return

  const stops: string[] = []
  for (let index = 0; index < faces; index += 1) {
    const angle = (-(360 / faces) * index).toFixed(2)
    const start = ((index / faces) * 100).toFixed(2)
    const hold = (((index + HOLD_SHARE) / faces) * 100).toFixed(2)
    stops.push(`${start}%,${hold}%{transform:rotateX(${angle}deg)}`)
  }
  stops.push('100%{transform:rotateX(-360deg)}')

  const style = document.createElement('style')
  style.id = id
  style.textContent = `@keyframes ${id}{${stops.join('')}}`
  document.head.append(style)
}

/** Proprietes propres au composant. */
export interface WordFlipOwnProps {
  /** Le premier mot du tambour, celui affiche au repos. @defaultValue 'Chargement' */
  text?: string
  /** Les mots suivants, separes par des virgules. @defaultValue 'Un instant,Presque la' */
  words?: string
  /** Corps du texte, en pixels. @defaultValue 18 */
  size?: number
  /** Temps passe sur chaque mot, la bascule comprise, en millisecondes. @defaultValue 1400 */
  speed?: number
  /** Couleur du texte. @defaultValue la couleur du texte */
  color?: string
  /** Libelle annonce aux lecteurs d'ecran. @defaultValue 'Chargement' */
  label?: string
}

/** Toutes les proprietes. */
export type WordFlipProps = Customisable<WordFlipOwnProps, 'span'>

/**
 * Signale une attente par des mots qui se relaient sur un tambour.
 *
 * @example
 * <WordFlip />
 *
 * @example
 * // Ses propres etapes, plus lentes, dans la teinte de marque.
 * <WordFlip text="Envoi" words="Verification,Termine" speed={2000} color="var(--o-palette-brand-500)" />
 */
export function WordFlip({
  text = 'Chargement',
  words = 'Un instant,Presque la',
  size = 18,
  speed = 1400,
  color = 'currentColor',
  label = 'Chargement',
  ...rest
}: WordFlipProps): ReactElement {
  const faces = [
    text,
    ...words
      .split(',')
      .map((word) => word.trim())
      .filter((word) => word.length > 0),
  ]
  // Une seule face ne peut pas se relayer : on la double, et le tambour
  // devient une piece qui montre deux fois le meme mot.
  if (faces.length < 2) faces.push(text)

  ensureWordFlipRule()
  ensureWordFlipDrumRule(faces.length)

  const { className, style } = mergePresentation({}, rest)

  const lineHeight = size * LINE
  // Le rayon qui referme le polygone : deux faces sont dos a dos, sans
  // epaisseur ; au-dela, chaque face est a la distance de l'apotheme.
  const radius =
    faces.length === 2 ? 0 : lineHeight / 2 / Math.tan(Math.PI / faces.length)
  const longest = faces.reduce((a, b) => (b.length > a.length ? b : a), '')

  const loaderStyle = {
    ...style,
    '--o-wf-size': `${String(size)}px`,
    '--o-wf-h': `${lineHeight.toFixed(2)}px`,
    '--o-wf-r': `${radius.toFixed(2)}px`,
    '--o-wf-cycle': `${String(speed * faces.length)}ms`,
    '--o-wf-drum': `${STYLE_ID}-${String(faces.length)}`,
    '--o-wf-color': color,
  } as CSSProperties

  return (
    <span {...rest} className={className} style={loaderStyle} data-o-wf="" role="status">
      <span className="o-sr-only">{label}</span>
      <span aria-hidden data-o-wf-drum="">
        <span data-o-wf-sizer="">{longest}</span>
        {faces.map((word, index) => (
          <span
            key={index}
            data-o-wf-face=""
            style={
              {
                '--o-wf-angle': `${((360 / faces.length) * index).toFixed(2)}deg`,
              } as CSSProperties
            }
          >
            {word}
          </span>
        ))}
      </span>
    </span>
  )
}

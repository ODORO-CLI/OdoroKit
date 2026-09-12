/**
 * Soulignement dessine : un trait a main levee qui se trace sous le texte.
 *
 * ## `pathLength`, la normalisation gratuite
 *
 * Se dessiner, pour un trait SVG, c'est animer `stroke-dashoffset` d'un tiret
 * long comme le trace. La longueur reelle du chemin depend de ses courbes —
 * mais `pathLength="1"` la declare egale a 1, et le tiret comme le decalage
 * deviennent des constantes. Aucune mesure, aucun JavaScript de calcul.
 *
 * Le trait est volontairement irregulier — deux courbes qui ondulent — parce
 * qu'un soulignement parfaitement droit qui se dessine ressemble a une barre
 * de progression. `vector-effect: non-scaling-stroke` garde l'epaisseur en
 * pixels quel que soit l'etirement du SVG sous le mot.
 *
 * ## Deux declencheurs, une seule mecanique
 *
 * Au survol, c'est une transition CSS que le `:hover` arme et desarme — le
 * trait s'efface en reculant quand on ressort, gratuitement. A l'entree dans
 * le champ, un observateur pose le meme attribut une fois pour toutes. Dans
 * les deux cas, la transition fait le travail.
 *
 * Le trait est un ornement : le SVG est cache a l'arbre d'accessibilite, le
 * texte reste un texte. Sous mouvement reduit, le trait est simplement la,
 * deja trace.
 *
 * @module
 */

import { mergePresentation, useMotionState, type Customisable } from '@odoro-cli/engine'
import {
  useEffect,
  useRef,
  type CSSProperties,
  type ElementType,
  type ReactElement,
} from 'react'

/** Proprietes propres au composant. */
export interface UnderlineDrawOwnProps {
  /** Texte a souligner. */
  children: string
  /** Balise rendue. @defaultValue 'span' */
  as?: ElementType
  /**
   * Ce qui declenche le trace.
   *
   * `view` dessine une fois, a l'entree dans le champ. `hover` dessine au
   * survol ou au focus — du texte lui-meme, ou du lien qui l'enveloppe — et
   * s'efface au retour.
   *
   * @defaultValue 'view'
   */
  trigger?: 'view' | 'hover'
  /** Epaisseur du trait, en pixels. @defaultValue 3 */
  thickness?: number
  /** Duree du trace, en millisecondes. @defaultValue 700 */
  duration?: number
  /** Couleur du trait. @defaultValue brand-400 de la palette */
  color?: string
}

/** Toutes les proprietes. */
export type UnderlineDrawProps = Customisable<UnderlineDrawOwnProps, 'span'>

/** Identifiant de la feuille injectee. */
const STYLE_ID = 'o-underline-draw'

/** Pose les regles du trait, une fois par document. */
function ensureUnderlineRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-underline]{position:relative;display:inline-block}',
    '[data-o-underline] svg{',
    'position:absolute;left:0;right:0;bottom:-0.18em;width:100%;height:0.32em;',
    'overflow:visible;pointer-events:none;',
    '}',
    // Grace a pathLength=1, le tiret et son decalage sont des constantes.
    '[data-o-underline] path{',
    'stroke-dasharray:1;stroke-dashoffset:1;',
    'transition:stroke-dashoffset var(--o-underline-duration) cubic-bezier(0.2,0,0,1);',
    '}',
    '[data-o-underline-on] path{stroke-dashoffset:0}',
    // Le survol du texte, ou celui du lien qui l'enveloppe : le trait des
    // menus se dessine des que le pointeur touche la zone cliquable.
    '[data-o-underline-trigger="hover"]:hover path,',
    '[data-o-underline-trigger="hover"]:focus-visible path,',
    ':where(a,button):hover [data-o-underline-trigger="hover"] path,',
    ':where(a,button):focus-visible [data-o-underline-trigger="hover"] path{',
    'stroke-dashoffset:0;',
    '}',
  ].join('')
  document.head.append(style)
}

/**
 * Dessine un soulignement irregulier sous un texte.
 *
 * @example
 * <p className="o-text-3xl o-font-bold">
 *   Un choix <UnderlineDraw>assume</UnderlineDraw>.
 * </p>
 *
 * @example
 * // Dans un lien : le trait se dessine au survol, s'efface au depart.
 * <a href="/tarifs">
 *   <UnderlineDraw trigger="hover">Voir les tarifs</UnderlineDraw>
 * </a>
 */
export function UnderlineDraw({
  children,
  as: Tag = 'span',
  trigger = 'view',
  thickness = 3,
  duration = 700,
  color = 'var(--o-palette-brand-400)',
  ...rest
}: UnderlineDrawProps): ReactElement {
  const { reduced } = useMotionState()
  const host = useRef<HTMLElement | null>(null)
  ensureUnderlineRule()

  useEffect(() => {
    const element = host.current
    if (element === null || reduced || trigger !== 'view') return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.every((entry) => !entry.isIntersecting)) return
        // L'attribut arme la transition ; l'observateur a fini son travail.
        element.setAttribute('data-o-underline-on', '')
        observer.disconnect()
      },
      { threshold: 0.6 },
    )

    observer.observe(element)
    return () => {
      observer.disconnect()
      element.removeAttribute('data-o-underline-on')
    }
  }, [reduced, trigger])

  const { className, style } = mergePresentation({}, rest)

  const underlineStyle = {
    ...style,
    '--o-underline-duration': `${String(duration)}ms`,
  } as CSSProperties

  return (
    <Tag
      {...rest}
      ref={host}
      className={className}
      style={underlineStyle}
      data-o-underline=""
      data-o-underline-trigger={trigger}
      // Mouvement reduit : le trait est deja trace au premier rendu, et comme
      // il nait a sa valeur finale, la transition n'a rien a jouer.
      {...(reduced ? { 'data-o-underline-on': '' } : {})}
    >
      {children}
      <svg aria-hidden viewBox="0 0 100 10" preserveAspectRatio="none">
        {/* Deux courbes legerement desaccordees : le trait d'un feutre, pas
            une regle. */}
        <path
          d="M 3 7 Q 25 2.5 50 5.5 Q 75 8.5 97 4"
          pathLength={1}
          fill="none"
          stroke={color}
          strokeWidth={thickness}
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    </Tag>
  )
}

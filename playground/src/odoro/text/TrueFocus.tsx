/**
 * Mise au point : un cadre d'angles saute de mot en mot, et le mot vise
 * redevient net pendant que les autres restent flous.
 *
 * ## Un viseur, pas une revelation
 *
 * `blur-reveal` va du flou vers le net une fois pour toutes ; ici le flou est
 * l'etat normal du texte, et un seul mot en sort a la fois. L'effet ne raconte
 * pas une arrivee, il raconte une lecture : quelque chose regarde le texte, et
 * on voit ou il regarde.
 *
 * Le cadre est fait de quatre angles ouverts, pas d'un rectangle plein : un
 * rectangle enfermerait le mot, quatre angles le designent.
 *
 * ## Le flou n'est pose que si le viseur existe
 *
 * Le piege de tous les effets qui cachent : si le JavaScript ne vient jamais,
 * le texte reste dans son etat initial. Un paragraphe entierement flou serait
 * pire qu'un paragraphe absent — il a l'air d'un bug.
 *
 * Le flou est donc porte par un attribut pose depuis un effet. Sans lui, tout
 * le texte est net et le cadre n'existe pas.
 *
 * ## Le cadre est place, pas dessine
 *
 * Sa position et sa taille sont relevees sur le mot vise, en coordonnees de
 * l'element — `offsetLeft` et compagnie, qui n'obligent a aucune conversion.
 * Le deplacement lui-meme est une transition CSS : rien n'est anime en
 * JavaScript, et le cadre traverse la ligne, voire change de ligne, sans un
 * seul calcul de trajectoire.
 *
 * ## Le survol prend la main
 *
 * Pointer un mot le met au point et suspend le cycle. C'est la seule reponse
 * juste : sans elle, le mot qu'on vient de designer se ferait voler la mise
 * au point une seconde plus tard.
 *
 * ## Le decoupage est un artifice d'affichage
 *
 * Le texte complet figure une fois, d'un seul tenant ; les mots sont retires
 * de l'arbre d'accessibilite.
 *
 * ## Mouvement reduit
 *
 * Aucun flou, aucun cadre : tout le texte est net. C'est l'etat ou tout se
 * lit, et c'est bien l'etat d'arrivee de chaque passage du viseur.
 *
 * @module
 */

import { mergePresentation, useMotionState, type Customisable } from '@odoro-cli/engine'
import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ElementType,
  type ReactElement,
} from 'react'

/** Proprietes propres au composant. */
export interface TrueFocusOwnProps {
  /** Texte a mettre au point. Une chaine : elle est decoupee en mots. */
  children: string
  /** Balise rendue. @defaultValue 'p' */
  as?: ElementType
  /** Flou d'un mot hors mise au point, en pixels. @defaultValue 5 */
  blur?: number
  /** Opacite d'un mot hors mise au point, de 0 a 1. @defaultValue 0.55 */
  attenue?: number
  /** Temps passe sur un mot, en millisecondes. @defaultValue 1400 */
  hold?: number
  /** Duree du deplacement du cadre, en millisecondes. @defaultValue 600 */
  course?: number
  /** Couleur du cadre. @defaultValue la teinte de marque */
  couleur?: string
}

/** Toutes les proprietes. */
export type TrueFocusProps = Customisable<TrueFocusOwnProps, 'p'>

/** Identifiant de la feuille injectee. */
const STYLE_ID = 'o-true-focus'

/** Jeu laisse entre le mot et son cadre, en pixels. */
const MARGE = 6

/** Longueur d'un angle du cadre, en pixels. */
const ANGLE = 10

/** Epaisseur du trait du cadre, en pixels. */
const TRAIT = 2

/** Pose le viseur et le flou, une fois par document. */
function ensureFocusRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-focus]{position:relative}',
    '[data-o-focus-word]{display:inline-block}',
    // Le flou n'existe que sous l'attribut pose par l'effet : voir l'en-tete.
    '[data-o-focus="pret"] [data-o-focus-word]{',
    'filter:blur(var(--o-focus-flou));opacity:var(--o-focus-attenue);',
    'transition:filter var(--o-focus-course) ease,opacity var(--o-focus-course) ease;',
    '}',
    '[data-o-focus="pret"] [data-o-focus-word][data-o-focus-vise]{',
    'filter:blur(0);opacity:1;',
    '}',
    '[data-o-focus-frame]{',
    'position:absolute;left:0;top:0;opacity:0;pointer-events:none;',
    'transition:transform var(--o-focus-course) cubic-bezier(0.22,1,0.36,1),',
    'width var(--o-focus-course) cubic-bezier(0.22,1,0.36,1),',
    'height var(--o-focus-course) cubic-bezier(0.22,1,0.36,1),',
    'opacity var(--o-focus-course) ease;',
    '}',
    '[data-o-focus="pret"] [data-o-focus-frame]{opacity:1}',
    '[data-o-focus-corner]{',
    'position:absolute;width:var(--o-focus-angle);height:var(--o-focus-angle);',
    'border:var(--o-focus-trait) solid var(--o-focus-couleur);',
    '}',
    '[data-o-focus-corner="hg"]{top:0;left:0;border-right:0;border-bottom:0}',
    '[data-o-focus-corner="hd"]{top:0;right:0;border-left:0;border-bottom:0}',
    '[data-o-focus-corner="bg"]{bottom:0;left:0;border-right:0;border-top:0}',
    '[data-o-focus-corner="bd"]{bottom:0;right:0;border-left:0;border-top:0}',
  ].join('')
  document.head.append(style)
}

/**
 * Fait sauter une mise au point de mot en mot.
 *
 * @example
 * <TrueFocus as="h2" className="o-text-4xl o-font-bold">
 *   Chaque mot a son tour
 * </TrueFocus>
 *
 * @example
 * // Viseur lent, flou marque, cadre dans la couleur du texte.
 * <TrueFocus hold={2600} blur={9} couleur="currentColor">Lentement</TrueFocus>
 */
export function TrueFocus({
  children,
  as: Tag = 'p',
  blur = 5,
  attenue = 0.55,
  hold = 1400,
  course = 600,
  couleur = 'var(--o-palette-brand-500)',
  ...rest
}: TrueFocusProps): ReactElement {
  const { reduced } = useMotionState()
  const hote = useRef<HTMLElement | null>(null)
  const [index, setIndex] = useState(0)
  const [pret, setPret] = useState(false)
  const [fige, setFige] = useState(false)

  ensureFocusRule()

  const mots = children.split(' ').filter((mot) => mot.length > 0)
  const total = mots.length

  // Le flou arrive apres le premier rendu, et jamais sous mouvement reduit.
  useEffect(() => {
    setPret(!reduced)
  }, [reduced])

  useEffect(() => {
    if (reduced || fige || total < 2) return

    // Une horloge, pas la boucle du moteur : un mot toutes les secondes et
    // demie, c'est un changement toutes les quatre-vingt-dix images.
    const minuteur = setTimeout(() => {
      setIndex((precedent) => (precedent + 1) % total)
    }, hold)

    return () => clearTimeout(minuteur)
  }, [reduced, fige, index, hold, total])

  useEffect(() => {
    const element = hote.current
    if (element === null || reduced) return

    const cadre = element.querySelector<HTMLElement>('[data-o-focus-frame]')
    if (cadre === null) return

    const placer = (): void => {
      const vise = element.querySelectorAll<HTMLElement>('[data-o-focus-word]')[index]
      if (vise === undefined) return
      // `offset*` est deja exprime dans le repere de l'element positionne :
      // aucune boite a convertir, aucune position de defilement a retrancher.
      cadre.style.width = `${String(vise.offsetWidth + MARGE * 2)}px`
      cadre.style.height = `${String(vise.offsetHeight + MARGE * 2)}px`
      cadre.style.transform = `translate(${String(vise.offsetLeft - MARGE)}px, ${String(vise.offsetTop - MARGE)}px)`
    }
    placer()

    // La ligne se recompose, le cadre suit : sans cela, il resterait sur la
    // place que le mot occupait avant le changement de largeur.
    const observateur = new ResizeObserver(placer)
    observateur.observe(element)
    return () => observateur.disconnect()
  }, [reduced, index, children])

  const { className, style } = mergePresentation({}, rest)

  const styleRacine = {
    ...style,
    '--o-focus-flou': `${String(blur)}px`,
    '--o-focus-attenue': Math.min(1, Math.max(0, attenue)),
    '--o-focus-course': `${String(course)}ms`,
    '--o-focus-couleur': couleur,
    '--o-focus-angle': `${String(ANGLE)}px`,
    '--o-focus-trait': `${String(TRAIT)}px`,
  } as CSSProperties

  return (
    <Tag
      {...rest}
      ref={hote}
      className={className}
      style={styleRacine}
      data-o-focus={pret ? 'pret' : ''}
      onPointerLeave={() => {
        setFige(false)
      }}
    >
      {/* Le texte complet, d'un seul tenant, pour les lecteurs d'ecran. */}
      <span className="o-sr-only">{children}</span>
      <span aria-hidden>
        {mots.map((mot, position) => (
          <span key={`${mot}-${String(position)}`}>
            <span
              data-o-focus-word=""
              data-o-focus-vise={position === index ? '' : undefined}
              onPointerEnter={() => {
                setIndex(position)
                setFige(true)
              }}
            >
              {mot}
            </span>
            {position < total - 1 ? ' ' : null}
          </span>
        ))}
        <span data-o-focus-frame="">
          <span data-o-focus-corner="hg" />
          <span data-o-focus-corner="hd" />
          <span data-o-focus-corner="bg" />
          <span data-o-focus-corner="bd" />
        </span>
      </span>
    </Tag>
  )
}

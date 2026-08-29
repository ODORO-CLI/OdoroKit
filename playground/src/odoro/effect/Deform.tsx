/**
 * Deformation : un filtre de deplacement pose sur n'importe quel contenu.
 *
 * ## Pourquoi un filtre SVG et pas une texture
 *
 * La facon evidente de deformer du contenu serait de le rendre dans une
 * texture, puis de la tordre dans un shader. C'est ce que font les
 * demonstrations WebGL, et c'est une impasse des que le contenu est du DOM :
 * capturer du HTML en image demande une bibliotheque tierce, echoue sur les
 * polices distantes, ignore une partie des pseudo-elements, et casse
 * completement des qu'une image vient d'une autre origine.
 *
 * Un filtre de deplacement fait le meme travail, nativement. Le navigateur
 * rasterise l'element — ce qu'il fait de toute facon — puis decale chaque
 * pixel selon un champ de bruit. Aucune capture, aucune dependance, et cela
 * s'applique indifferemment a un fond, a du texte ou a une image.
 *
 * ## Les bords, et pourquoi ils sont recolles par defaut
 *
 * Un deplacement va chercher chaque pixel ailleurs. Au bord de l'element, cet
 * ailleurs est en dehors : le filtre y trouve du vide, et la silhouette part
 * en lambeaux. C'est correct au sens du calcul, et illisible a l'oeil — cela
 * ressemble a un defaut d'affichage, pas a un effet.
 *
 * Le resultat est donc redecoupe sur l'opacite d'origine : la forme reste
 * exactement celle qu'elle etait, et seul l'interieur ondule. C'est ce que
 * `edges: 'clean'` fait, et c'est le defaut.
 *
 * `edges: 'organic'` laisse la silhouette se deformer. C'est le bon choix pour
 * une tache de couleur ou un fond, ou il n'y a pas de forme a respecter — et
 * le mauvais pour une carte, dont les angles droits sont precisement ce qu'on
 * remarque.
 *
 * ## Ce que ce choix coute
 *
 * Trois limites, qu'il vaut mieux connaitre avant de poser le composant.
 *
 * Le texte est **rasterise**. A faible amplitude cela ne se voit pas ; au-dela
 * d'une dizaine de pixels, les lettres perdent leur nettete. C'est inherent :
 * un filtre travaille sur des pixels, pas sur des glyphes.
 *
 * Un filtre cree un **contexte d'empilement** et un bloc conteneur. Un enfant
 * en `position: fixed` a l'interieur se positionnera par rapport au conteneur
 * deforme, pas par rapport a la fenetre.
 *
 * Et la turbulence est **calculee une fois**, pas a chaque image. Animer sa
 * frequence obligerait le navigateur a la recalculer entierement, ce qui
 * effondre la cadence. Le mouvement vient donc du deplacement du champ, pas de
 * sa regeneration — moins riche, et cent fois moins cher.
 *
 * @module
 */

import {
  CLOCK_PRIORITY,
  clock,
  mergePresentation,
  useMotionState,
  type Customisable,
} from 'odoro-engine'
import { useEffect, useId, useRef, type ReactElement, type ReactNode } from 'react'

/** Proprietes propres au composant. */
export interface DeformOwnProps {
  /** Contenu deforme : conteneur, texte, image, n'importe quoi. */
  children: ReactNode
  /** Amplitude du deplacement, en pixels. @defaultValue 12 */
  amount?: number
  /** Finesse du bruit. Plus haut, plus serre. @defaultValue 0.012 */
  frequency?: number
  /** Vitesse de derive du champ. Zero pour figer. @defaultValue 0.15 */
  speed?: number
  /**
   * Nombre d'octaves du bruit. Une seule donne une ondulation lisse ; au-dela,
   * le detail fin hache le deplacement.
   *
   * @defaultValue 1
   */
  octaves?: number
  /**
   * Traitement des bords.
   *
   * - `clean` redecoupe le resultat sur la forme d'origine : elle est
   *   preservee, seul l'interieur ondule.
   * - `organic` laisse la silhouette se deformer.
   *
   * @defaultValue 'clean'
   */
  edges?: 'clean' | 'organic'
  /** Amplifie la deformation au survol. @defaultValue false */
  onHover?: boolean
}

/** Toutes les proprietes. */
export type DeformProps = Customisable<DeformOwnProps>

/**
 * Deforme son contenu.
 *
 * @example
 * // Un conteneur ordinaire, fond et texte compris.
 * <Deform amount={8}>
 *   <section className="o-rounded-xl o-bg-brand-600 o-p-8">
 *     <h2>Un titre</h2>
 *   </section>
 * </Deform>
 *
 * @example
 * // Une image, deformee seulement au survol.
 * <Deform amount={0} onHover className="o-rounded-lg o-overflow-hidden">
 *   <img src="/photo.jpg" alt="" />
 * </Deform>
 */
export function Deform({
  children,
  amount = 12,
  frequency = 0.012,
  speed = 0.15,
  octaves = 1,
  edges = 'clean',
  onHover = false,
  ...rest
}: DeformProps): ReactElement {
  const { reduced, quality } = useMotionState()
  const id = useId().replace(/:/g, '')
  const displacement = useRef<SVGFEDisplacementMapElement | null>(null)
  const offset = useRef<SVGFEOffsetElement | null>(null)
  const hovering = useRef(false)

  // En qualite basse, une seule octave : c'est le reglage qui pese, et la
  // deformation reste lisible avec moins de detail.
  const grade = quality === 'low' ? 1 : octaves

  useEffect(() => {
    if (reduced || speed === 0) return

    const subscription = clock.subscribe(
      ({ time }) => {
        // Le champ est translate, jamais regenere : animer la frequence de la
        // turbulence obligerait le navigateur a la recalculer a chaque image.
        const shift = time * speed * 60
        offset.current?.setAttribute('dx', (Math.sin(shift * 0.017) * 30).toFixed(1))
        offset.current?.setAttribute('dy', (Math.cos(shift * 0.013) * 30).toFixed(1))

        if (onHover) {
          const target = hovering.current ? amount : 0
          const current = Number(displacement.current?.getAttribute('scale') ?? 0)
          displacement.current?.setAttribute(
            'scale',
            (current + (target - current) * 0.12).toFixed(2),
          )
        }
      },
      { name: 'deformation', priority: CLOCK_PRIORITY.render },
    )

    return () => subscription.unsubscribe()
  }, [reduced, speed, onHover, amount])

  const { className, style } = mergePresentation({ className: 'o-relative' }, rest)

  return (
    <div
      {...rest}
      className={className}
      style={{ ...style, filter: reduced ? undefined : `url(#${id})` }}
      onPointerEnter={() => (hovering.current = true)}
      onPointerLeave={() => (hovering.current = false)}
    >
      {/*
        Le filtre vit dans le document, pas dans une feuille : il porte des
        valeurs qui changent, et un attribut se met a jour la ou une regle CSS
        devrait etre reecrite.
      */}
      <svg aria-hidden className="o-absolute o-size-0" focusable="false">
        <filter id={id} colorInterpolationFilters="sRGB">
          <feTurbulence
            type="fractalNoise"
            baseFrequency={frequency}
            numOctaves={grade}
            seed={7}
            result="bruit"
          />
          <feOffset ref={offset} in="bruit" dx="0" dy="0" result="champ" />
          <feDisplacementMap
            ref={displacement}
            in="SourceGraphic"
            in2="champ"
            scale={onHover ? 0 : amount}
            xChannelSelector="R"
            yChannelSelector="G"
            result="deplace"
          />
          {edges === 'clean' ? (
            // Le resultat est redecoupe sur l'opacite d'origine : la forme
            // reste intacte, seul son interieur ondule.
            <feComposite in="deplace" in2="SourceAlpha" operator="in" />
          ) : null}
        </filter>
      </svg>

      {children}
    </div>
  )
}

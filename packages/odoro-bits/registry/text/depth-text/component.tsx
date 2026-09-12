/**
 * Profondeur : le titre est extrude en couches, et le bloc tourne sur lui-meme.
 *
 * ## Une extrusion, pas une ombre portee
 *
 * Une ombre portee est plate : elle ne revele rien quand l'objet tourne. Ici
 * chaque copie est reculee **en profondeur** — `translate3d` sur l'axe Z, dans
 * un contexte `preserve-3d` — de sorte que la rotation lente decouvre la
 * tranche du bloc, puis la referme. C'est la rotation qui rend l'epaisseur
 * credible ; sans elle, on ne verrait qu'un decalage.
 *
 * ## Rien ne s'execute
 *
 * Les copies sont posees au rendu, leur decalage vient d'une variable
 * multipliee par leur rang, et la rotation est une animation CSS. Le
 * compositeur anime **un seul** element — la pile — et les copies suivent
 * parce qu'elles vivent dans son espace 3D. Un JavaScript par image serait du
 * gaspillage pour un mouvement qui ne depend de rien.
 *
 * ## L'ordre du document sert de repli
 *
 * Les copies sont ecrites de la plus lointaine a la plus proche, la face
 * veritable en dernier. La ou `preserve-3d` n'existe pas, l'ordre de peinture
 * donne deja le bon empilement : le titre reste au-dessus de son extrusion.
 *
 * ## Distinction
 *
 * `echo-text` pose lui aussi des copies, mais attenuees, en deux dimensions,
 * et elles suivent le pointeur avec du retard : c'est une trainee. Ici les
 * copies sont solides, soudees au titre, et rien ne suit le pointeur.
 *
 * ## Mouvement reduit
 *
 * La rotation s'arrete, l'extrusion reste. C'est bien l'etat d'arrivee :
 * l'epaisseur est la forme du titre, pas son animation.
 *
 * @module
 */

import { mergePresentation, type Customisable } from '@odoro-cli/engine'
import { type CSSProperties, type ElementType, type ReactElement } from 'react'

/** Proprietes propres au composant. */
export interface DepthTextOwnProps {
  /** Texte a extruder. Une chaine : elle est copiee couche par couche. */
  children: string
  /** Balise rendue. @defaultValue 'span' */
  as?: ElementType
  /** Nombre de couches d'extrusion. @defaultValue 8 */
  depth?: number
  /** Decalage d'une couche a la suivante, en pixels. @defaultValue 2 */
  step?: number
  /**
   * Couleur de la tranche.
   *
   * Une valeur, pas un role : l'epaisseur est un parti pris graphique, et la
   * lier a l'encre du theme la rendrait invisible.
   *
   * @defaultValue une teinte de la palette de marque
   */
  couleur?: string
  /** Amplitude de la rotation, en degres. @defaultValue 16 */
  angle?: number
  /** Duree d'un aller-retour complet, en millisecondes. @defaultValue 6000 */
  speed?: number
  /** Distance de fuite, en pixels. Plus bas, plus marque. @defaultValue 600 */
  perspective?: number
}

/** Toutes les proprietes. */
export type DepthTextProps = Customisable<DepthTextOwnProps, 'span'>

/** Identifiant de la feuille injectee. */
const STYLE_ID = 'o-depth-text'

/** Plafond de couches : au-dela, l'epaisseur ne se lit plus, elle empate. */
const COUCHES_MAX = 32

/** Pose les regles de l'extrusion, une fois par document. */
function ensureDepthRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-depth]{display:inline-block;perspective:var(--o-depth-fuite)}',
    '[data-o-depth-stack]{',
    'position:relative;display:inline-block;transform-style:preserve-3d;',
    'animation:o-depth-turn var(--o-depth-speed) ease-in-out infinite;',
    '}',
    // Les copies occupent exactement la boite de la face : meme largeur, donc
    // meme composition des lignes.
    '[data-o-depth-layer]{',
    'position:absolute;left:0;top:0;width:100%;',
    'color:var(--o-depth-colour);pointer-events:none;',
    'transform:translate3d(',
    'calc(var(--o-depth-rang) * var(--o-depth-step)),',
    'calc(var(--o-depth-rang) * var(--o-depth-step)),',
    'calc(var(--o-depth-rang) * var(--o-depth-step) * -1));',
    '}',
    '[data-o-depth-face]{position:relative;display:inline-block}',
    '@keyframes o-depth-turn{',
    '0%,100%{transform:rotateY(calc(var(--o-depth-angle) * -1)) rotateX(calc(var(--o-depth-angle) / 3))}',
    '50%{transform:rotateY(var(--o-depth-angle)) rotateX(calc(var(--o-depth-angle) / -3))}',
    '}',
    // Sans mouvement, le bloc s'immobilise de face : l'epaisseur reste.
    '@media (prefers-reduced-motion:reduce){[data-o-depth-stack]{animation:none}}',
  ].join('')
  document.head.append(style)
}

/**
 * Extrude un titre en couches et le fait tourner lentement.
 *
 * @example
 * <DepthText as="h1" className="o-text-5xl o-font-extrabold">
 *   Volume
 * </DepthText>
 *
 * @example
 * // Une epaisseur profonde et sombre, presque immobile.
 * <DepthText depth={18} step={3} angle={6} speed={12000} couleur="var(--o-palette-indigo-700)">
 *   Relief
 * </DepthText>
 */
export function DepthText({
  children,
  as: Tag = 'span',
  depth = 8,
  step = 2,
  couleur = 'var(--o-palette-brand-500)',
  angle = 16,
  speed = 6000,
  perspective = 600,
  ...rest
}: DepthTextProps): ReactElement {
  ensureDepthRule()

  const { className, style } = mergePresentation({}, rest)

  const couches = Math.max(0, Math.min(COUCHES_MAX, Math.round(depth)))

  const styleRacine = {
    ...style,
    '--o-depth-fuite': `${String(perspective)}px`,
    '--o-depth-step': `${String(step)}px`,
    '--o-depth-colour': couleur,
    '--o-depth-angle': `${String(angle)}deg`,
    '--o-depth-speed': `${String(speed)}ms`,
  } as CSSProperties

  // De la plus lointaine a la plus proche : voir l'en-tete, l'ordre du
  // document sert de repli la ou la profondeur n'est pas composee.
  const rangs = Array.from({ length: couches }, (_, index) => couches - index)

  return (
    <Tag {...rest} className={className} style={styleRacine} data-o-depth="">
      <span data-o-depth-stack="">
        {rangs.map((rang) => (
          <span
            key={rang}
            aria-hidden
            data-o-depth-layer=""
            style={{ '--o-depth-rang': rang } as CSSProperties}
          >
            {children}
          </span>
        ))}
        {/* La face : le texte veritable, expose une seule fois. */}
        <span data-o-depth-face="">{children}</span>
      </span>
    </Tag>
  )
}

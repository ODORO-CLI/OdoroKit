/**
 * Degrade en mouvement : une nappe de couleur traverse le texte, en boucle.
 *
 * ## Zero JavaScript a l'execution
 *
 * Le texte est peint par son fond — un degrade plus large que lui, dont la
 * position est animee. Le compositeur du navigateur fait tout : aucune
 * boucle, aucun abonnement, aucun rendu React apres le premier.
 *
 * Le degrade fait trois fois la largeur du texte et boucle sur lui-meme :
 * la couleur de depart est aussi celle d'arrivee, donc le raccord du cycle
 * est invisible.
 *
 * ## La contrepartie du decoupage
 *
 * `background-clip: text` suppose de rendre la couleur du texte
 * transparente. Un navigateur qui ne saurait pas decouper afficherait donc
 * un texte invisible. La regle est enfermee dans une requete de support :
 * sans elle, le texte garde sa couleur heritee et perd seulement son
 * degrade, ce qui est le bon sens de la degradation.
 *
 * Sous mouvement reduit, le degrade reste : c'est la couleur du texte, pas
 * un geste. Seul son deplacement s'arrete.
 *
 * @module
 */

import { mergePresentation, type Customisable } from '@odoro-cli/engine'
import { type CSSProperties, type ElementType, type ReactElement } from 'react'

/** Proprietes propres au composant. */
export interface GradientFlowOwnProps {
  /** Texte a peindre. */
  children: string
  /** Balise rendue. @defaultValue 'span' */
  as?: ElementType
  /** Duree d'un cycle, en millisecondes. @defaultValue 4000 */
  speed?: number
  /** Angle du degrade, en degres. @defaultValue 90 */
  angle?: number
  /** Premiere couleur. @defaultValue teinte de marque */
  from?: string
  /** Seconde couleur. @defaultValue fuchsia de la palette */
  to?: string
}

/** Toutes les proprietes. */
export type GradientFlowProps = Customisable<GradientFlowOwnProps, 'span'>

/** Identifiant de la feuille injectee. */
const STYLE_ID = 'o-gradient-flow'

/** Pose le degrade et son mouvement, une fois par document. */
function ensureFlowRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '@keyframes o-gradient-flow{from{background-position:0% 50%}to{background-position:-200% 50%}}',
    '@supports (background-clip:text) or (-webkit-background-clip:text){',
    '[data-o-gradient-flow]{',
    // Quatre jalons dont le premier et le dernier partagent la couleur : le
    // motif se repete sans couture quand la position boucle.
    'background-image:linear-gradient(var(--o-flow-angle),var(--o-flow-from),var(--o-flow-to),var(--o-flow-from));',
    'background-size:200% 100%;',
    '-webkit-background-clip:text;background-clip:text;',
    'color:transparent;-webkit-text-fill-color:transparent;',
    'animation:o-gradient-flow var(--o-flow-speed) linear infinite;',
    '}}',
    '@media (prefers-reduced-motion:reduce){[data-o-gradient-flow]{animation:none;background-position:0% 50%}}',
  ].join('')
  document.head.append(style)
}

/**
 * Fait couler un degrade a travers un texte.
 *
 * @example
 * <GradientFlow as="h1" className="o-text-5xl o-font-extrabold">
 *   Construire en couleur
 * </GradientFlow>
 *
 * @example
 * // Les couleurs sont libres : ce sont des valeurs, pas des roles.
 * <GradientFlow from="var(--o-palette-sky-400)" to="var(--o-palette-emerald-300)">
 *   Odoro
 * </GradientFlow>
 */
export function GradientFlow({
  children,
  as: Tag = 'span',
  speed = 4000,
  angle = 90,
  from = 'var(--o-palette-brand-500)',
  to = 'var(--o-palette-fuchsia-500)',
  ...rest
}: GradientFlowProps): ReactElement {
  ensureFlowRule()

  const { className, style } = mergePresentation({}, rest)

  const flowStyle = {
    ...style,
    '--o-flow-from': from,
    '--o-flow-to': to,
    '--o-flow-angle': `${String(angle)}deg`,
    '--o-flow-speed': `${String(speed)}ms`,
  } as CSSProperties

  // Le mouvement reduit est traite par la feuille, pas par le rendu : le
  // degrade est la couleur du texte et doit rester, seul son deplacement
  // s'arrete. Retirer l'attribut retirerait la couleur avec.
  return (
    <Tag {...rest} className={className} style={flowStyle} data-o-gradient-flow="">
      {children}
    </Tag>
  )
}

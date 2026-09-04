/**
 * Surligneur : un trait se trace derriere le texte, comme au feutre.
 *
 * ## Il ne decoupe rien
 *
 * C'est ce qui le distingue des autres animations de texte de ce registre :
 * aucun fragment, aucun calque, aucune mesure. Le texte reste exactement le
 * noeud qu'il etait — un lien reste un lien, une emphase reste une emphase, et
 * la selection se comporte normalement.
 *
 * Ce qui bouge est un fond, derriere les lettres. C'est aussi pourquoi il
 * fonctionne sur plusieurs lignes sans rien de special : le fond suit les
 * boites de ligne, que le navigateur sait deja composer.
 *
 * ## Pourquoi `background-size` et non `width`
 *
 * Animer la largeur d'un element declencherait une mise en page a chaque
 * image. `background-size` n'affecte que la peinture — le compositeur s'en
 * charge, et rien ne se recalcule.
 *
 * ## Il se pose derriere, jamais devant
 *
 * `background-image` peint sous le texte par construction. Un pseudo-element
 * superpose demanderait un `z-index` negatif et un contexte d'empilement, ce
 * qui casse des que le parent en cree un. Le fond n'a pas ce probleme.
 *
 * ## En mouvement reduit, le trait reste
 *
 * Il ne s'anime pas, mais il s'affiche : c'est une mise en valeur, pas une
 * decoration. La retirer changerait le sens de la phrase, la ou supprimer un
 * mouvement ne retire rien.
 *
 * @module
 */

import { mergePresentation, useMotionState, type Customisable } from '@odoro-cli/engine'
import { type CSSProperties, type ElementType, type ReactElement } from 'react'

import { useInView } from '@registre/hooks/useInView'

/** Proprietes propres au composant. */
export interface HighlightSweepOwnProps {
  /** Texte a surligner. */
  children: React.ReactNode
  /** Balise rendue. @defaultValue 'span' */
  as?: ElementType
  /**
   * Couleur du trait.
   *
   * Une valeur, pas un role : le surlignage est un choix de mise en page, et
   * l'imposer depuis les jetons de theme priverait de la moitie des usages.
   *
   * @defaultValue une teinte de la palette de marque
   */
  colour?: string
  /**
   * Epaisseur du trait, en part de la hauteur de ligne.
   *
   * @defaultValue 0.35
   */
  thickness?: number
  /** Duree du trace, en millisecondes. @defaultValue 600 */
  duration?: number
  /** Retard avant le trace, en millisecondes. @defaultValue 0 */
  delay?: number
  /**
   * Quand partir.
   *
   * @defaultValue 'vue'
   */
  declenchement?: 'vue' | 'montage'
}

/** Toutes les proprietes. */
export type HighlightSweepProps = Customisable<HighlightSweepOwnProps, 'span'>

/** Identifiant de la feuille injectee. */
const STYLE_ID = 'o-highlight-sweep'

/** Pose les regles du surligneur, une fois par document. */
function ensureHighlightRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-highlight]{',
    'background-image:linear-gradient(var(--o-highlight-colour),var(--o-highlight-colour));',
    'background-repeat:no-repeat;',
    // Ancre en bas a gauche : le trait pousse vers la droite, comme une main.
    'background-position:0 88%;',
    'background-size:0% var(--o-highlight-thickness);',
    'transition:background-size var(--o-highlight-duration) cubic-bezier(0.65,0,0.35,1) var(--o-highlight-delay);',
    // La marge negative laisse le trait deborder un peu du texte, ce qui rend
    // le geste moins mecanique.
    'padding:0 0.08em;margin:0 -0.08em;',
    '}',
    '[data-o-highlight-trace]{background-size:100% var(--o-highlight-thickness)}',
    // Sans mouvement, le trait est simplement la : c'est une mise en valeur,
    // pas une decoration, et la retirer changerait le sens de la phrase.
    '@media (prefers-reduced-motion:reduce){[data-o-highlight]{transition:none}}',
  ].join('')
  document.head.append(style)
}

/**
 * Trace un surligneur derriere un texte.
 *
 * @example
 * <p>
 *   Un moteur <HighlightSweep>cent pour cent maison</HighlightSweep>, et rien
 *   qui ne vous appartienne pas.
 * </p>
 *
 * @example
 * // Un trait fin et clair, trace des le montage.
 * <HighlightSweep colour="var(--o-palette-amber-200)" thickness={0.2} declenchement="montage">
 *   nouveaute
 * </HighlightSweep>
 */
export function HighlightSweep({
  children,
  as: Tag = 'span',
  colour = 'var(--o-palette-brand-200)',
  thickness = 0.35,
  duration = 600,
  delay = 0,
  declenchement = 'vue',
  ...rest
}: HighlightSweepProps): ReactElement {
  const { reduced } = useMotionState()
  const { ref: refVue, vu } = useInView<HTMLElement>({
    immediat: declenchement === 'montage',
  })

  ensureHighlightRule()

  const { className, style } = mergePresentation({}, rest)

  const styleTrait = {
    ...style,
    '--o-highlight-colour': colour,
    '--o-highlight-thickness': `${String(Math.round(thickness * 100))}%`,
    '--o-highlight-duration': `${String(duration)}ms`,
    '--o-highlight-delay': `${String(delay)}ms`,
  } as CSSProperties

  // En mouvement reduit, le trait est pose d'emblee : la transition est
  // neutralisee par la feuille, il n'y a donc rien a attendre.
  const trace = reduced || vu

  return (
    <Tag
      {...rest}
      ref={refVue}
      className={className}
      style={styleTrait}
      data-o-highlight=""
      {...(trace ? { 'data-o-highlight-trace': '' } : {})}
    >
      {children}
    </Tag>
  )
}

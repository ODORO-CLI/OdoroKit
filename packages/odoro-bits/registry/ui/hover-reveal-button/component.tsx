/**
 * Bouton dont le fond se déploie depuis un point au survol.
 *
 * ## Le libellé est écrit deux fois, et c'est voulu
 *
 * Une copie sort par la droite, l'autre entre par la gauche. Les deux occupent
 * la même place, si bien que la largeur du bouton ne change pas pendant la
 * bascule — ce qu'un seul texte changé en place ne permettrait pas sans
 * mesurer, ni sans faire sauter la mise en page des voisins.
 *
 * La copie entrante est retirée de l'arbre d'accessibilité : un lecteur d'écran
 * annoncerait sinon deux fois le même libellé pour un seul bouton.
 *
 * ## La pastille n'est pas décorative
 *
 * C'est elle qui devient le fond. Au repos, un point de huit pixels ; au
 * survol, elle s'étend à tout le bouton et grandit encore un peu, ce qui donne
 * l'impression que la couleur déborde. Un simple changement de
 * `background-color` donnerait la même couleur finale sans l'origine du
 * mouvement.
 *
 * ## Ce qui a changé par rapport à l'implémentation d'origine
 *
 * Sa largeur était figée à `w-32`, ce qui coupait tout libellé de plus de dix
 * caractères. Elle est désormais déduite du contenu, avec un minimum.
 *
 * Et l'icône était importée d'une librairie tierce. Ici c'est un emplacement :
 * le projet passe la sienne, ou rien.
 *
 * @module
 */

import { mergePresentation, type Customisable } from '@odoro-cli/engine'
import { type ReactElement, type ReactNode } from 'react'

/** Proprietes propres au composant. */
export interface HoverRevealButtonOwnProps {
  /** Libelle du bouton. */
  children: ReactNode
  /**
   * Ce qui accompagne le libelle une fois le fond deploye.
   *
   * Emplacement plutot qu'icone imposee : le registre ne depend d'aucun jeu de
   * pictogrammes, et le projet a le sien.
   */
  adornment?: ReactNode
  /** Tokens du fond deploye et du texte sur ce fond. */
  colors?: readonly [string, string]
}

/** Toutes les proprietes. */
export type HoverRevealButtonProps = Customisable<HoverRevealButtonOwnProps, 'button'>

/** Tokens employes par defaut. */
const DEFAULT_TOKENS = ['--o-palette-brand-600', '--o-palette-zinc-50'] as const

/** Identifiant de la feuille injectee. */
const STYLE_ID = 'o-hover-reveal-button'

/** Pose les regles du bouton, une fois par document. */
function ensureRevealRules(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-reveal]{position:relative;overflow:hidden;cursor:pointer;',
    'border-radius:360px;isolation:isolate}',

    // La pastille, qui devient le fond.
    '[data-o-reveal] [data-o-reveal-blob]{position:absolute;left:20%;top:40%;',
    'width:0.5rem;height:0.5rem;border-radius:0.5rem;z-index:-1;',
    'background-color:var(--o-reveal-bg);',
    'transition:all var(--o-duration-slow) var(--o-ease-standard)}',
    '[data-o-reveal]:is(:hover,:focus-visible) [data-o-reveal-blob]{',
    'left:0;top:0;width:100%;height:100%;scale:1.8}',

    // Les deux copies du libelle, qui se croisent sans changer la largeur.
    '[data-o-reveal] [data-o-reveal-out]{display:inline-block;translate:0.25rem 0;',
    'transition:translate var(--o-duration-slow) var(--o-ease-standard),',
    'opacity var(--o-duration-slow) var(--o-ease-standard)}',
    '[data-o-reveal]:is(:hover,:focus-visible) [data-o-reveal-out]{',
    'translate:3rem 0;opacity:0}',

    '[data-o-reveal] [data-o-reveal-in]{position:absolute;inset:0;display:flex;',
    'align-items:center;justify-content:center;gap:0.5rem;',
    'color:var(--o-reveal-fg);translate:3rem 0;opacity:0;',
    'transition:translate var(--o-duration-slow) var(--o-ease-standard),',
    'opacity var(--o-duration-slow) var(--o-ease-standard)}',
    '[data-o-reveal]:is(:hover,:focus-visible) [data-o-reveal-in]{',
    'translate:-0.25rem 0;opacity:1}',

    // Sous mouvement reduit, l'etat final est applique sans course : le fond
    // est deploye et le libelle lisible des le survol, sans glissement.
    '@media (prefers-reduced-motion:reduce){',
    '[data-o-reveal] [data-o-reveal-blob],[data-o-reveal] [data-o-reveal-out],',
    '[data-o-reveal] [data-o-reveal-in]{transition:none}',
    '[data-o-reveal]:is(:hover,:focus-visible) [data-o-reveal-out]{translate:0.25rem 0}}',
  ].join('')
  document.head.append(style)
}

/**
 * Bouton dont le fond se deploie au survol.
 *
 * @example
 * <HoverRevealButton>Nous ecrire</HoverRevealButton>
 *
 * @example
 * // L'ornement est un emplacement : le projet passe son icone.
 * <HoverRevealButton adornment={<Icon icon={ArrowRight} size={16} />}>
 *   Continuer
 * </HoverRevealButton>
 */
export function HoverRevealButton({
  children,
  adornment,
  colors = DEFAULT_TOKENS,
  ...rest
}: HoverRevealButtonProps): ReactElement {
  ensureRevealRules()

  const { className, style } = mergePresentation(
    {
      className:
        'o-min-w-32 o-border-w-1 o-border-zinc-200 o-bg-transparent o-p-2 o-text-center o-font-semibold dark:o-border-zinc-800',
    },
    rest,
  )

  return (
    <button
      type="button"
      {...rest}
      data-o-reveal
      className={className}
      style={{
        ['--o-reveal-bg' as string]: `var(${colors[0]})`,
        ['--o-reveal-fg' as string]: `var(${colors[1]})`,
        ...style,
      }}
    >
      <span data-o-reveal-out>{children}</span>
      {/* La copie entrante porte le meme texte : elle ne doit pas etre
          annoncee une seconde fois. */}
      <span aria-hidden data-o-reveal-in>
        <span>{children}</span>
        {adornment}
      </span>
      <span aria-hidden data-o-reveal-blob />
    </button>
  )
}

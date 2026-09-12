/**
 * Bouton a lettres qui tombent : au survol, chaque lettre du libelle tombe
 * hors du bouton, et une seconde rangee descend prendre sa place.
 *
 * ## Deux rangees, un seul libelle
 *
 * Le libelle est ecrit trois fois dans le DOM, et une seule compte pour
 * l'accessibilite : une copie lisible, hors ecran, que les lecteurs
 * annoncent. Les deux rangees visibles sont decoupees en lettres et retirees
 * de l'arbre d'accessibilite — vingt `span` pour un mot de six lettres, c'est
 * une lecture insupportable, et le libelle entier est deja la.
 *
 * Le bouton a fond deploye croise lui aussi deux copies, mais a l'horizontale
 * et en bloc ; ici la chute est verticale, et lettre par lettre.
 *
 * ## Le decalage est une variable par lettre
 *
 * Chaque lettre porte son index dans `--o-fall-i`, et la feuille en fait un
 * retard : `index x ecart`. Le survol ne change qu'un selecteur ; il n'y a
 * ni boucle, ni etat, ni JavaScript a l'evenement. L'ordre est le meme a
 * l'aller et au retour : les lettres remontent comme elles sont tombees,
 * de gauche a droite.
 *
 * ## La largeur ne bouge pas
 *
 * La seconde rangee est posee par-dessus la premiere, en absolu, avec les
 * memes lettres : le bouton mesure toujours son libelle, et les voisins ne
 * sautent pas quand il s'anime. Les espaces sont des espaces insecables,
 * pour qu'un `inline-block` ne les avale pas.
 *
 * @module
 */

import { mergePresentation, useMotionState, type Customisable } from '@odoro-cli/engine'
import { type CSSProperties, type ElementType, type ReactElement } from 'react'

/** Proprietes propres au composant. */
export interface TextFallButtonOwnProps {
  /** Libelle du bouton, en texte : il est decoupe en lettres. */
  children: string
  /** Cible du lien. Avec elle, le bouton est rendu comme un lien. */
  href?: string
  /** Duree de la chute d'une lettre, en millisecondes. @defaultValue 380 */
  duration?: number
  /** Ecart entre deux lettres voisines, en millisecondes. @defaultValue 22 */
  stagger?: number
  /** La rangee qui descend prend la teinte de marque. @defaultValue true */
  accent?: boolean
}

/** Toutes les proprietes. */
export type TextFallButtonProps = Customisable<TextFallButtonOwnProps, 'button'>

/** Identifiant de la feuille injectee. */
const STYLE_ID = 'o-text-fall-button'

/** Pose les deux rangees et leur chute, une fois par document. */
function ensureFallRules(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-fall]{',
    'position:relative;overflow:hidden;cursor:pointer;',
    'display:inline-flex;align-items:center;justify-content:center;',
    'border:1px solid color-mix(in oklab,currentColor 25%,transparent);',
    'background:transparent;font:inherit;color:inherit;text-decoration:none;',
    'transition:border-color var(--o-fall-duration) linear;',
    '}',
    '[data-o-fall]:is(:hover,:focus-visible){border-color:var(--o-fall-accent)}',
    '[data-o-fall]:focus-visible{outline:2px solid currentColor;outline-offset:3px}',
    '[data-o-fall]:disabled,[data-o-fall][aria-disabled="true"]{',
    'opacity:0.5;cursor:not-allowed;pointer-events:none}',

    // La copie lisible : hors ecran, jamais cachee aux lecteurs.
    '[data-o-fall-label]{position:absolute;width:1px;height:1px;overflow:hidden;',
    'clip-path:inset(50%);white-space:nowrap}',

    '[data-o-fall-row]{display:inline-block;white-space:nowrap}',
    '[data-o-fall-row="next"]{position:absolute;inset:0;',
    'display:inline-flex;align-items:center;justify-content:center;',
    'padding:inherit;color:var(--o-fall-next)}',
    '[data-o-fall-letter]{',
    'display:inline-block;',
    'transition:transform var(--o-fall-duration) cubic-bezier(0.4,0,0.7,0.2),',
    'opacity var(--o-fall-duration) linear;',
    'transition-delay:calc(var(--o-fall-i) * var(--o-fall-stagger));',
    '}',
    // La rangee du dessus attend au-dessus du bouton ; elle descend avec
    // une courbe qui freine, la premiere tombe avec une courbe qui accelere.
    '[data-o-fall-row="next"] [data-o-fall-letter]{',
    'transform:translateY(-130%) rotate(-6deg);opacity:0;',
    'transition-timing-function:cubic-bezier(0.2,0.8,0.3,1),linear}',
    '[data-o-fall]:is(:hover,:focus-visible) [data-o-fall-row="first"] [data-o-fall-letter]{',
    'transform:translateY(130%) rotate(8deg);opacity:0}',
    '[data-o-fall]:is(:hover,:focus-visible) [data-o-fall-row="next"] [data-o-fall-letter]{',
    'transform:translateY(0) rotate(0);opacity:1}',

    // Mouvement reduit : la seconde rangee est deja en place au survol, la
    // premiere s'efface sans tomber.
    '@media (prefers-reduced-motion:reduce){',
    '[data-o-fall-letter]{transition:none}',
    '}',
  ].join('')
  document.head.append(style)
}

/** Une rangee de lettres, retiree de l'arbre d'accessibilite. */
function Row({ text, role }: { text: string; role: 'first' | 'next' }): ReactElement {
  return (
    <span aria-hidden="true" data-o-fall-row={role}>
      {Array.from(text).map((char, index) => (
        <span
          key={index}
          data-o-fall-letter=""
          style={{ '--o-fall-i': String(index) } as CSSProperties}
        >
          {char === ' ' ? '\u00A0' : char}
        </span>
      ))}
    </span>
  )
}

/**
 * Bouton dont les lettres tombent au survol.
 *
 * @example
 * <TextFallButton onClick={telecharger}>Telecharger</TextFallButton>
 *
 * @example
 * // Un lien, chute plus lente et sans changement de teinte.
 * <TextFallButton href="/journal" duration={600} stagger={35} accent={false}>
 *   Lire le journal
 * </TextFallButton>
 */
export function TextFallButton({
  children,
  href,
  duration = 380,
  stagger = 22,
  accent = true,
  ...rest
}: TextFallButtonProps): ReactElement {
  const { reduced } = useMotionState()
  ensureFallRules()

  const { className, style } = mergePresentation(
    { className: 'o-rounded-full o-px-6 o-py-3 o-font-medium' },
    rest,
  )

  const Tag = (href === undefined ? 'button' : 'a') as ElementType
  const { disabled, type, ...attributes } = rest

  return (
    <Tag
      {...(href === undefined
        ? { type: type ?? 'button', disabled }
        : { href, 'aria-disabled': disabled === true ? 'true' : undefined })}
      {...attributes}
      data-o-fall=""
      className={className}
      style={
        {
          '--o-fall-duration': `${String(reduced ? 0 : duration)}ms`,
          '--o-fall-stagger': `${String(reduced ? 0 : stagger)}ms`,
          '--o-fall-accent': 'var(--o-palette-brand-500)',
          '--o-fall-next': accent ? 'var(--o-palette-brand-500)' : 'currentColor',
          ...style,
        } as CSSProperties
      }
    >
      <span data-o-fall-label="">{children}</span>
      <Row text={children} role="first" />
      <Row text={children} role="next" />
    </Tag>
  )
}

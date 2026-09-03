/**
 * Bouton a liseré tournant, en CSS seul.
 *
 * ## Aucun JavaScript n'anime quoi que ce soit
 *
 * Le liseré est un dégradé conique dont l'angle est une propriété enregistrée
 * par `@property`. Sans cet enregistrement, `--gradient-angle` serait une
 * chaîne pour le navigateur, et une chaîne ne s'interpole pas : l'animation
 * sauterait de zéro à trois cent soixante degrés d'un coup. Déclarée comme
 * `<angle>`, elle devient une valeur animable, et le compositeur s'en charge.
 *
 * C'est la seule raison pour laquelle ce bouton n'ouvre pas de boucle.
 *
 * ## Ce qui a été retiré de l'implémentation d'origine
 *
 * Un `@import` de Google Fonts, posé dans la feuille du composant. Il coûtait
 * une requête bloquante à la première peinture, pour imposer une police que le
 * projet n'a pas forcément choisie. La police vient donc du token `--o-font-sans`.
 *
 * Et les couleurs, écrites en dur — un noir, un blanc, un bleu nommé. Elles
 * sont maintenant lues dans la palette, ce qui les fait suivre le thème.
 *
 * ## L'animation est en pause au repos
 *
 * Les trois couches tournent, mais `animation-play-state: paused` les fige tant
 * que le bouton n'est ni survolé ni au focus. Un liseré qui tourne en
 * permanence sur une page qui en compte cinq occupe le compositeur sans que
 * personne ne le regarde.
 *
 * @module
 */

import { mergePresentation, type Customisable } from '@odoro-cli/engine'
import { type ReactElement, type ReactNode } from 'react'

/** Proprietes propres au composant. */
export interface ShinyButtonOwnProps {
  /** Contenu du bouton. */
  children: ReactNode
  /**
   * Tokens du fond, du texte, du liseré et de son éclat au survol.
   *
   * Quatre, dans cet ordre. Le troisième porte la couleur qui tourne ; le
   * quatrième celle qui la remplace quand le bouton s'éveille.
   */
  colors?: readonly [string, string, string, string]
  /** Durée d'un tour du liseré, en millisecondes. @defaultValue 3000 */
  spin?: number
}

/** Toutes les proprietes. */
export type ShinyButtonProps = Customisable<ShinyButtonOwnProps, 'button'>

/** Tokens employes par defaut. */
const DEFAULT_TOKENS = [
  '--o-palette-zinc-950',
  '--o-palette-zinc-50',
  '--o-palette-brand-500',
  '--o-palette-brand-300',
] as const

/** Identifiant de la feuille injectee. */
const STYLE_ID = 'o-shiny-button'

/**
 * Pose les regles du bouton, une fois par document.
 *
 * ## Pourquoi `@property` est indispensable ici
 *
 * Une variable CSS ordinaire n'a pas de type : le navigateur la traite comme du
 * texte, et deux textes ne s'interpolent pas. L'animation existerait, mais elle
 * passerait d'une valeur a l'autre sans transition — un liseré qui claque au
 * lieu de tourner.
 *
 * `@property` donne un type, une valeur initiale et une regle d'heritage. C'est
 * ce qui rend `--gradient-angle` animable, et donc tout ce fichier possible.
 *
 * La valeur initiale de l'éclat est `transparent` et non une couleur nommée :
 * `initial-value` n'accepte pas `var()`, et y écrire un blanc figerait une
 * couleur hors de la palette. L'élément la remplace immédiatement par son token.
 */
function ensureShinyRules(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '@property --o-shiny-angle{syntax:"<angle>";initial-value:0deg;inherits:false}',
    '@property --o-shiny-offset{syntax:"<angle>";initial-value:0deg;inherits:false}',
    '@property --o-shiny-percent{syntax:"<percentage>";initial-value:5%;inherits:false}',
    '@property --o-shiny-shine{syntax:"<color>";initial-value:transparent;inherits:false}',

    '[data-o-shiny]{',
    '--o-shiny-spin:3000ms;',
    'isolation:isolate;position:relative;overflow:hidden;cursor:pointer;',
    'outline-offset:4px;border:1px solid transparent;border-radius:360px;',
    'font-family:var(--o-font-sans);font-size:1.125rem;line-height:1.2;font-weight:500;',
    'color:var(--o-shiny-fg);',
    'background:linear-gradient(var(--o-shiny-bg),var(--o-shiny-bg)) padding-box,',
    'conic-gradient(from calc(var(--o-shiny-angle) - var(--o-shiny-offset)),transparent,',
    'var(--o-shiny-edge) var(--o-shiny-percent),',
    'var(--o-shiny-shine) calc(var(--o-shiny-percent) * 2),',
    'var(--o-shiny-edge) calc(var(--o-shiny-percent) * 3),',
    'transparent calc(var(--o-shiny-percent) * 4)) border-box;',
    'box-shadow:inset 0 0 0 1px color-mix(in oklch,var(--o-shiny-fg) 10%,transparent);',
    'transition:--o-shiny-offset var(--o-duration-slower) var(--o-ease-standard),',
    '--o-shiny-percent var(--o-duration-slower) var(--o-ease-standard),',
    '--o-shiny-shine var(--o-duration-slower) var(--o-ease-standard)}',

    '[data-o-shiny]::before,[data-o-shiny]::after,[data-o-shiny]>span::before{',
    'content:"";pointer-events:none;position:absolute;',
    'inset-inline-start:50%;inset-block-start:50%;translate:-50% -50%;z-index:-1}',

    '[data-o-shiny]:active{translate:0 1px}',

    // Semis de points, masque par un secteur tournant.
    '[data-o-shiny]::before{--size:calc(100% - 6px);width:var(--size);height:var(--size);',
    'background:radial-gradient(circle at 2px 2px,var(--o-shiny-fg) 0.5px,transparent 0) padding-box;',
    'background-size:4px 4px;background-repeat:space;',
    '-webkit-mask-image:conic-gradient(from calc(var(--o-shiny-angle) + 45deg),black,transparent 10% 90%,black);',
    'mask-image:conic-gradient(from calc(var(--o-shiny-angle) + 45deg),black,transparent 10% 90%,black);',
    'border-radius:inherit;opacity:0.4;z-index:-1}',

    // Reflet interne, qui tourne dans l'autre sens.
    '[data-o-shiny]::after{width:100%;aspect-ratio:1;',
    'background:linear-gradient(-50deg,transparent,var(--o-shiny-edge),transparent);',
    '-webkit-mask-image:radial-gradient(circle at bottom,transparent 40%,black);',
    'mask-image:radial-gradient(circle at bottom,transparent 40%,black);opacity:0.6}',

    '[data-o-shiny]>span{position:relative;z-index:1}',
    '[data-o-shiny]>span::before{--size:calc(100% + 1rem);width:var(--size);height:var(--size);',
    'box-shadow:inset 0 -1ex 2rem 4px var(--o-shiny-edge);opacity:0;',
    'transition:opacity var(--o-duration-slower) var(--o-ease-standard);',
    'animation:calc(var(--o-shiny-spin) * 1.5) o-shiny-breathe linear infinite}',

    // Les trois couches tournent, et restent en pause tant qu'on ne les regarde pas.
    '[data-o-shiny],[data-o-shiny]::before,[data-o-shiny]::after{',
    'animation:o-shiny-turn linear infinite var(--o-shiny-spin),',
    'o-shiny-turn linear infinite calc(var(--o-shiny-spin) / 0.4) reverse paused;',
    'animation-composition:add}',

    '[data-o-shiny]:is(:hover,:focus-visible){',
    '--o-shiny-percent:20%;--o-shiny-offset:95deg;--o-shiny-shine:var(--o-shiny-glow)}',
    '[data-o-shiny]:is(:hover,:focus-visible),',
    '[data-o-shiny]:is(:hover,:focus-visible)::before,',
    '[data-o-shiny]:is(:hover,:focus-visible)::after{animation-play-state:running}',
    '[data-o-shiny]:is(:hover,:focus-visible)>span::before{opacity:1}',

    '@keyframes o-shiny-turn{to{--o-shiny-angle:360deg}}',
    '@keyframes o-shiny-breathe{from,to{scale:1}50%{scale:1.2}}',

    // Le liseré est un agrement : sous mouvement reduit il ne tourne plus, et
    // le bouton garde son etat final — visible, lisible, cliquable.
    '@media (prefers-reduced-motion:reduce){',
    '[data-o-shiny],[data-o-shiny]::before,[data-o-shiny]::after,',
    '[data-o-shiny]>span::before{animation:none}}',
  ].join('')
  document.head.append(style)
}

/**
 * Bouton dont le liseré tourne au survol.
 *
 * @example
 * <ShinyButton onClick={souscrire}>Acceder sans limite</ShinyButton>
 *
 * @example
 * // Les quatre couleurs viennent de la palette : fond, texte, lisere, eclat.
 * <ShinyButton colors={[
 *   '--o-palette-zinc-950',
 *   '--o-palette-zinc-50',
 *   '--o-palette-emerald-500',
 *   '--o-palette-emerald-300',
 * ]}>
 *   Publier
 * </ShinyButton>
 */
export function ShinyButton({
  children,
  colors = DEFAULT_TOKENS,
  spin = 3000,
  ...rest
}: ShinyButtonProps): ReactElement {
  ensureShinyRules()

  const { className, style } = mergePresentation({ className: 'o-px-10 o-py-5' }, rest)

  return (
    <button
      type="button"
      {...rest}
      data-o-shiny
      className={className}
      style={{
        // Les quatre tokens deviennent les variables que la feuille consomme.
        // Elles sont posees en ligne parce qu'elles dependent des props, et
        // qu'une feuille unique par document ne peut pas les porter.
        ['--o-shiny-bg' as string]: `var(${colors[0]})`,
        ['--o-shiny-fg' as string]: `var(${colors[1]})`,
        ['--o-shiny-edge' as string]: `var(${colors[2]})`,
        ['--o-shiny-glow' as string]: `var(${colors[3]})`,
        ['--o-shiny-spin' as string]: `${String(spin)}ms`,
        ...style,
      }}
    >
      <span>{children}</span>
    </button>
  )
}

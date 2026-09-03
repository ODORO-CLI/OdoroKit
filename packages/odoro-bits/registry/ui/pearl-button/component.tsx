/**
 * Bouton en nacre : un volume obtenu par empilement d'ombres.
 *
 * ## Ce que les cinq ombres font
 *
 * Il n'y a ni image, ni dégradé de fond, ni filtre. Le relief vient de cinq
 * ombres superposées, et chacune joue un rôle qu'on ne peut pas retirer sans
 * aplatir l'objet :
 *
 * 1. une lueur interne haute — la lumière qui entre par le dessus ;
 * 2. une ombre interne basse, courte et sombre — l'épaisseur du bord ;
 * 3. une seconde lueur interne basse, large — le rebond de la lumière au fond ;
 * 4. une ombre portée large et lointaine — la distance au sol ;
 * 5. une ombre portée courte et resserrée — le contact.
 *
 * Retirer la quatrième colle le bouton à la page ; retirer la troisième le
 * rend creux au lieu de bombé.
 *
 * ## Les couleurs viennent de la palette
 *
 * L'implémentation d'origine écrivait dix couleurs en dur, canal alpha compris.
 * Chacune est
 * désormais un mélange du token de lumière ou d'ombre, ce qui les fait suivre
 * le thème — et rend le bouton utilisable sur un fond clair, ce qu'il n'était
 * pas.
 *
 * ## Le glyphe change au survol
 *
 * Deux caractères sont rendus, un seul est affiché. C'est plus court qu'un état
 * React, et surtout cela ne provoque aucun rendu : la bascule est une règle CSS.
 *
 * @module
 */

import { mergePresentation, type Customisable } from '@odoro-cli/engine'
import { type ReactElement, type ReactNode } from 'react'

/** Proprietes propres au composant. */
export interface PearlButtonOwnProps {
  /** Libelle du bouton. */
  children: ReactNode
  /** Glyphe au repos. @defaultValue '✧' */
  glyph?: string
  /** Glyphe au survol. @defaultValue '✦' */
  glyphHover?: string
  /**
   * Tokens du corps, de la lumiere et de l'ombre.
   *
   * Trois, dans cet ordre. La lumiere sert aux reflets internes et au texte ;
   * l'ombre aux ombres internes et portees.
   */
  colors?: readonly [string, string, string]
}

/** Toutes les proprietes. */
export type PearlButtonProps = Customisable<PearlButtonOwnProps, 'button'>

/** Tokens employes par defaut. */
const DEFAULT_TOKENS = [
  '--o-palette-zinc-950',
  '--o-palette-zinc-50',
  '--o-palette-zinc-900',
] as const

/** Identifiant de la feuille injectee. */
const STYLE_ID = 'o-pearl-button'

/** Pose les regles du bouton, une fois par document. */
function ensurePearlRules(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  /** Un melange du token de lumiere, a l'opacite demandee. */
  const light = (percent: number): string =>
    `color-mix(in oklch,var(--o-pearl-light) ${String(percent)}%,transparent)`

  /** Un melange du token d'ombre. */
  const dark = (percent: number): string =>
    `color-mix(in oklch,var(--o-pearl-dark) ${String(percent)}%,transparent)`

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-pearl]{outline:none;cursor:pointer;border:0;position:relative;',
    'border-radius:360px;background-color:var(--o-pearl-body);',
    'transition:box-shadow var(--o-duration-base) var(--o-ease-standard),',
    'transform var(--o-duration-base) var(--o-ease-standard);',
    `box-shadow:inset 0 0.3rem 0.9rem ${light(30)},`,
    `inset 0 -0.1rem 0.3rem ${dark(70)},`,
    `inset 0 -0.4rem 0.9rem ${light(50)},`,
    `0 3rem 3rem ${dark(30)},`,
    `0 1rem 1rem -0.6rem ${dark(80)}}`,

    '[data-o-pearl] [data-o-pearl-wrap]{display:block;font-size:1.5rem;font-weight:500;',
    `color:${light(70)};padding:2rem 2.8rem;border-radius:inherit;`,
    'position:relative;overflow:hidden}',

    '[data-o-pearl] [data-o-pearl-line]{display:flex;align-items:center;gap:0.75rem;margin:0;',
    'transform:translateY(2%);',
    'transition:transform var(--o-duration-base) var(--o-ease-standard);',
    '-webkit-mask-image:linear-gradient(to bottom,black 40%,transparent);',
    'mask-image:linear-gradient(to bottom,black 40%,transparent)}',

    '[data-o-pearl] [data-o-pearl-wrap]::before,[data-o-pearl] [data-o-pearl-wrap]::after{',
    'content:"";position:absolute;',
    'transition:transform var(--o-duration-slow) var(--o-ease-standard),',
    'opacity var(--o-duration-slow) var(--o-ease-standard)}',

    // La grande tache de lumiere, qui deborde largement en haut.
    `[data-o-pearl] [data-o-pearl-wrap]::before{left:-15%;right:-15%;bottom:25%;top:-100%;`,
    `border-radius:50%;background-color:${light(12)}}`,

    // Le reflet superieur, un rectangle a coins hauts arrondis.
    '[data-o-pearl] [data-o-pearl-wrap]::after{left:6%;right:6%;top:12%;bottom:40%;',
    `border-radius:22px 22px 0 0;box-shadow:inset 0 10px 8px -10px ${light(80)};`,
    `background:linear-gradient(180deg,${light(30)} 0%,transparent 50%,transparent 100%)}`,

    '[data-o-pearl] [data-o-pearl-glyph="hover"]{display:none}',
    '[data-o-pearl]:hover [data-o-pearl-glyph="rest"]{display:none}',
    '[data-o-pearl]:hover [data-o-pearl-glyph="hover"]{display:inline-block}',

    `[data-o-pearl]:hover{box-shadow:inset 0 0.3rem 0.5rem ${light(40)},`,
    `inset 0 -0.1rem 0.3rem ${dark(70)},`,
    `inset 0 -0.4rem 0.9rem ${light(70)},`,
    `0 3rem 3rem ${dark(30)},`,
    `0 1rem 1rem -0.6rem ${dark(80)}}`,
    '[data-o-pearl]:hover [data-o-pearl-wrap]::before{transform:translateY(-5%)}',
    '[data-o-pearl]:hover [data-o-pearl-wrap]::after{opacity:0.4;transform:translateY(5%)}',
    '[data-o-pearl]:hover [data-o-pearl-line]{transform:translateY(-4%)}',

    '[data-o-pearl]:active{transform:translateY(4px);',
    `box-shadow:inset 0 0.3rem 0.5rem ${light(50)},`,
    `inset 0 -0.1rem 0.3rem ${dark(80)},`,
    `inset 0 -0.4rem 0.9rem ${light(40)},`,
    `0 3rem 3rem ${dark(30)},`,
    `0 1rem 1rem -0.6rem ${dark(80)}}`,

    // Les deplacements sont un agrement ; l'enfoncement au clic, un retour.
    // Seul le premier est neutralise : sans retour, on ne sait pas si le clic
    // a ete pris.
    '@media (prefers-reduced-motion:reduce){',
    '[data-o-pearl],[data-o-pearl] [data-o-pearl-line],',
    '[data-o-pearl] [data-o-pearl-wrap]::before,[data-o-pearl] [data-o-pearl-wrap]::after{',
    'transition:none}',
    '[data-o-pearl]:hover [data-o-pearl-wrap]::before,',
    '[data-o-pearl]:hover [data-o-pearl-wrap]::after,',
    '[data-o-pearl]:hover [data-o-pearl-line]{transform:none}}',
  ].join('')
  document.head.append(style)
}

/**
 * Bouton en nacre.
 *
 * @example
 * <PearlButton>Commencer</PearlButton>
 *
 * @example
 * // Sur un fond clair, la lumiere et l'ombre s'echangent.
 * <PearlButton colors={[
 *   '--o-palette-zinc-100',
 *   '--o-palette-zinc-950',
 *   '--o-palette-zinc-400',
 * ]}>
 *   Commencer
 * </PearlButton>
 */
export function PearlButton({
  children,
  glyph = '✧',
  glyphHover = '✦',
  colors = DEFAULT_TOKENS,
  ...rest
}: PearlButtonProps): ReactElement {
  ensurePearlRules()

  const { className, style } = mergePresentation({ className: '' }, rest)

  return (
    <button
      type="button"
      {...rest}
      data-o-pearl
      className={className}
      style={{
        ['--o-pearl-body' as string]: `var(${colors[0]})`,
        ['--o-pearl-light' as string]: `var(${colors[1]})`,
        ['--o-pearl-dark' as string]: `var(${colors[2]})`,
        ...style,
      }}
    >
      <span data-o-pearl-wrap>
        {/* Deux `span` et non un `div` contenant un `p` : le contenu d'un
            bouton est du contenu de phrase, et le balisage d'origine etait
            invalide. Le `display` vient de la feuille. */}
        <span data-o-pearl-line>
          {/* Les deux glyphes sont rendus, un seul est affiche : la bascule est
              une regle CSS, donc elle ne provoque aucun rendu React. */}
          <span aria-hidden data-o-pearl-glyph="rest">
            {glyph}
          </span>
          <span aria-hidden data-o-pearl-glyph="hover">
            {glyphHover}
          </span>
          {children}
        </span>
      </span>
    </button>
  )
}

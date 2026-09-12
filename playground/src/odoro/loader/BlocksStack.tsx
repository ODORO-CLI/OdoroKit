/**
 * Blocs empiles : quatre blocs tombent l'un sur l'autre en colonne, la pile
 * tient un instant, puis bascule et s'effondre.
 *
 * ## Deux animations qui ne se connaissent pas
 *
 * La chute est propre a chaque bloc : il part du haut du conteneur, en
 * `ease-in` — la gravite accelere — et s'arrete net sur le bloc precedent.
 * L'effondrement, lui, est porte par la colonne entiere, qui pivote autour
 * de son coin inferieur droit et s'efface. Les blocs ne savent rien de la
 * bascule, la colonne ne sait rien des chutes : deux animations simples au
 * lieu d'une seule qui devrait tout coordonner, et une figure lisible — on
 * construit, puis tout tombe.
 *
 * Chaque bloc connait sa fenetre dans le cycle, par une animation propre
 * ecrite une fois dans la feuille ; c'est ce qui permet a la pile de tenir
 * entiere avant de tomber, la ou un simple dephasage donnerait une chute
 * perpetuelle.
 *
 * Le conteneur ne mesure qu'un bloc de large : la colonne renversee deborde
 * a droite le temps de s'effacer, sans toucher a la mise en page.
 *
 * ## Un statut, pas un dessin
 *
 * L'element porte `role="status"` et un libelle pour les lecteurs d'ecran :
 * l'attente est une information, pas une decoration. Les blocs sont retires
 * de l'arbre d'accessibilite.
 *
 * Sous mouvement reduit, la pile reste complete et debout : la figure se
 * lit encore, seules la chute et la bascule s'arretent.
 *
 * @module
 */

import { mergePresentation, type Customisable } from '@odoro-cli/engine'
import type { CSSProperties, ReactElement } from 'react'

/** Identifiant de la feuille injectee. */
const STYLE_ID = 'o-blocks-stack'

/** Nombre de blocs. */
const BLOCKS = 4

/** Hauteur du conteneur, en blocs : la pile plus la marge d'ou ils tombent. */
const HEIGHT = BLOCKS + 2

/** Part du cycle entre deux departs de chute, en pour cent. */
const STEP = 13

/** Duree d'une chute, en pour cent du cycle. */
const DROP = 11

/** Instant ou la pile complete commence a basculer, en pour cent. */
const TOPPLE_AT = 66

/** Pose la colonne, les chutes et la bascule, une fois par document. */
function ensureBlocksStackRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-blocks-stack]{',
    'display:inline-flex;align-items:flex-end;',
    `width:var(--o-bstack-size);height:calc(var(--o-bstack-size) * ${String(HEIGHT)});`,
    '}',
    '[data-o-blocks-stack-column]{',
    'display:flex;flex-direction:column-reverse;',
    'gap:calc(var(--o-bstack-size) * 0.15);transform-origin:bottom right;',
    'animation:o-blocks-stack-topple var(--o-bstack-speed) infinite;',
    '}',
    '[data-o-blocks-stack-block]{',
    'width:var(--o-bstack-size);height:var(--o-bstack-size);flex:none;',
    'border-radius:calc(var(--o-bstack-size) / 5);background:var(--o-bstack-color);',
    'animation-duration:var(--o-bstack-speed);animation-iteration-count:infinite;',
    '}',
    // Une chute par bloc : il part du haut du conteneur, invisible, et
    // apparait en route pour ne pas surgir d'un coup.
    ...Array.from({ length: BLOCKS }, (_, block) => {
      const start = block * STEP
      const end = start + DROP
      const fall = HEIGHT - 1 - block
      return [
        `[data-o-blocks-stack-block="${String(block)}"]{animation-name:o-blocks-stack-${String(block)}}`,
        `@keyframes o-blocks-stack-${String(block)}{`,
        `0%,${String(start)}%{transform:translateY(calc(var(--o-bstack-size) * ${String(-fall)}));opacity:0;animation-timing-function:ease-in}`,
        `${String(start + 2)}%{opacity:1}`,
        `${String(end)}%,100%{transform:none;opacity:1}`,
        '}',
      ].join('')
    }),
    // La colonne pivote sur son coin inferieur droit et s'efface au sol.
    '@keyframes o-blocks-stack-topple{',
    `0%,${String(TOPPLE_AT)}%{transform:none;opacity:1;animation-timing-function:ease-in}`,
    `${String(TOPPLE_AT + 14)}%{transform:rotate(90deg);opacity:1}`,
    `${String(TOPPLE_AT + 20)}%,100%{transform:rotate(90deg);opacity:0}`,
    '}',
    // Une pile debout : la figure est dite, sans chute ni bascule.
    '@media (prefers-reduced-motion:reduce){',
    '[data-o-blocks-stack-column]{animation:none;transform:none;opacity:1}',
    '[data-o-blocks-stack-block]{animation:none;transform:none;opacity:1}',
    '}',
  ].join('')
  document.head.append(style)
}

/** Proprietes propres au composant. */
export interface BlocksStackOwnProps {
  /** Cote d'un bloc, en pixels. @defaultValue 10 */
  size?: number
  /** Duree d'un cycle complet, en millisecondes. @defaultValue 2200 */
  speed?: number
  /** Couleur des blocs. @defaultValue la couleur du texte */
  color?: string
  /** Libelle annonce aux lecteurs d'ecran. @defaultValue 'Chargement' */
  label?: string
}

/** Toutes les proprietes. */
export type BlocksStackProps = Customisable<BlocksStackOwnProps, 'span'>

/**
 * Signale une attente par des blocs qui s'empilent puis s'effondrent.
 *
 * @example
 * <BlocksStack />
 *
 * @example
 * // Plus grand, plus lent, dans la teinte de marque.
 * <BlocksStack size={14} speed={3000} color="var(--o-palette-brand-500)" />
 */
export function BlocksStack({
  size = 10,
  speed = 2200,
  color = 'currentColor',
  label = 'Chargement',
  ...rest
}: BlocksStackProps): ReactElement {
  ensureBlocksStackRule()

  const { className, style } = mergePresentation({}, rest)

  const loaderStyle = {
    ...style,
    '--o-bstack-size': `${String(size)}px`,
    '--o-bstack-speed': `${String(speed)}ms`,
    '--o-bstack-color': color,
  } as CSSProperties

  return (
    <span
      {...rest}
      className={className}
      style={loaderStyle}
      data-o-blocks-stack=""
      role="status"
    >
      <span className="o-sr-only">{label}</span>
      <span aria-hidden data-o-blocks-stack-column="">
        {Array.from({ length: BLOCKS }, (_, block) => (
          <span key={block} data-o-blocks-stack-block={String(block)} />
        ))}
      </span>
    </span>
  )
}

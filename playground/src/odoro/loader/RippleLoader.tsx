/**
 * Ondes concentriques : quatre anneaux fixes qu'une crete traverse du
 * centre vers le bord.
 *
 * ## Ce qui bouge, c'est la crete, pas l'anneau
 *
 * Un chargeur d'ondes se fait d'ordinaire d'anneaux qui grandissent et
 * quittent le cadre — c'est ce que fait `pulse-dot`, et la lecture y est
 * celle d'une emission. Ici la structure est immobile : les quatre anneaux
 * restent ou ils sont, toujours visibles a faible encre, et ce qui se
 * deplace est le passage — chacun s'eclaire et se gonfle a son tour, du
 * plus petit au plus grand.
 *
 * La difference n'est pas cosmetique. Un anneau qui grandit dit « quelque
 * chose part d'ici » ; une crete qui traverse une structure qui reste dit
 * « quelque chose parcourt ». Le second se pose mieux au milieu d'une
 * interface, parce qu'il n'a pas de bord ou disparaitre.
 *
 * Une seule regle d'animation, quatre delais decales d'un huitieme de cycle.
 * Ils sont negatifs : un delai positif ferait attendre les anneaux
 * exterieurs au premier rendu, et l'onde semblerait demarrer en retard.
 *
 * Il n'y a volontairement pas de point central : le vide au milieu est ce
 * qui empeche de lire la figure comme une source.
 *
 * ## Un statut, pas un dessin
 *
 * L'element porte `role="status"` et un libelle pour les lecteurs d'ecran :
 * l'attente est une information, pas une decoration. Les anneaux sont
 * retires de l'arbre d'accessibilite.
 *
 * Sous mouvement reduit, les quatre anneaux restent poses a une encre
 * moyenne : la figure d'une onde arretee, sans passage.
 *
 * @module
 */

import { mergePresentation, type Customisable } from '@odoro-cli/engine'
import type { CSSProperties, ReactElement } from 'react'

/** Identifiant de la feuille injectee. */
const STYLE_ID = 'o-ripple-loader'

/** Retraits des quatre anneaux, du plus petit au plus grand. */
const INSETS = [42, 28, 14, 0] as const

/** Pose les anneaux et la crete qui les traverse, une fois par document. */
function ensureRippleRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-ripple-loader]{',
    'position:relative;display:inline-block;',
    'width:var(--o-ripple-size);height:var(--o-ripple-size);',
    '}',
    '[data-o-ripple-ring]{',
    'position:absolute;inset:var(--o-ripple-inset);border-radius:50%;',
    'border:var(--o-ripple-line) solid var(--o-ripple-color);',
    'animation:o-ripple-loader-crest var(--o-ripple-speed) ease-in-out infinite;',
    'animation-delay:var(--o-ripple-delay);',
    '}',
    // Le passage occupe le premier tiers du cycle ; le reste est le repos,
    // qui laisse a la crete le temps d'atteindre le bord avant de repartir.
    '@keyframes o-ripple-loader-crest{',
    '0%{transform:scale(1);opacity:0.16}',
    '14%{transform:scale(1.06);opacity:1}',
    '32%{transform:scale(0.98);opacity:0.32}',
    '48%,100%{transform:scale(1);opacity:0.16}',
    '}',
    '@media (prefers-reduced-motion:reduce){',
    '[data-o-ripple-ring]{animation:none;transform:none;opacity:0.4}',
    '}',
  ].join('')
  document.head.append(style)
}

/** Proprietes propres au composant. */
export interface RippleLoaderOwnProps {
  /** Diametre de l'anneau exterieur, en pixels. @defaultValue 56 */
  size?: number
  /** Duree d'un passage complet de la crete, en millisecondes. @defaultValue 2000 */
  speed?: number
  /** Couleur des anneaux. @defaultValue la couleur du texte */
  color?: string
  /** Libelle annonce aux lecteurs d'ecran. @defaultValue 'Chargement' */
  label?: string
}

/** Toutes les proprietes. */
export type RippleLoaderProps = Customisable<RippleLoaderOwnProps, 'span'>

/**
 * Signale une attente par une crete qui traverse quatre anneaux fixes.
 *
 * @example
 * <RippleLoader />
 *
 * @example
 * // Plus grand, plus lent, dans la teinte de marque.
 * <RippleLoader size={88} speed={2800} color="var(--o-palette-brand-500)" />
 */
export function RippleLoader({
  size = 56,
  speed = 2000,
  color = 'currentColor',
  label = 'Chargement',
  ...rest
}: RippleLoaderProps): ReactElement {
  ensureRippleRule()

  const { className, style } = mergePresentation({}, rest)

  const loaderStyle = {
    ...style,
    '--o-ripple-size': `${String(size)}px`,
    '--o-ripple-speed': `${String(speed)}ms`,
    '--o-ripple-color': color,
    // Le trait suit la taille : un filet d'un pixel sur un grand anneau
    // disparaitrait, quatre sur un petit le boucheraient.
    '--o-ripple-line': `${String(Math.max(1, Math.round(size / 28)))}px`,
  } as CSSProperties

  return (
    <span
      {...rest}
      className={className}
      style={loaderStyle}
      data-o-ripple-loader=""
      role="status"
    >
      <span className="o-sr-only">{label}</span>
      {INSETS.map((inset, index) => (
        <span
          key={inset}
          aria-hidden
          data-o-ripple-ring=""
          style={
            {
              '--o-ripple-inset': `${String(inset)}%`,
              // Un huitieme de cycle entre deux anneaux, en negatif : la
              // crete est deja en chemin a la premiere image.
              '--o-ripple-delay': `${String(Math.round((index / 8 - 1) * speed))}ms`,
            } as CSSProperties
          }
        />
      ))}
    </span>
  )
}

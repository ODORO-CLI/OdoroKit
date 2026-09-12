/**
 * Egaliseur : six barres ancrees au sol montent et descendent chacune a son
 * rythme, comme les vumetres d'un egaliseur.
 *
 * ## Six partitions, six durees
 *
 * Une seule animation dephasee par des delais donnerait une vague — c'est
 * `wave-bars`. Un egaliseur ne fait pas de vague : chaque barre suit sa
 * propre suite de niveaux, ecrite dans une table, et joue a une duree
 * legerement differente de ses voisines. Les cycles ne retombent en phase
 * qu'au bout de plusieurs dizaines de secondes : l'oeil n'y voit jamais de
 * motif, ce qui est exactement l'impression d'un signal.
 *
 * Les niveaux sont fixes, pas tires au sort : le rendu est identique d'un
 * chargement a l'autre, et le premier niveau de chaque suite est aussi le
 * dernier, pour que la boucle ne saute pas.
 *
 * Les barres sont etirees par une echelle verticale depuis le sol, jamais
 * par une hauteur : rien ne recalcule la mise en page.
 *
 * ## Un statut, pas un dessin
 *
 * L'element porte `role="status"` et un libelle pour les lecteurs d'ecran :
 * l'attente est une information, pas une decoration. Les barres sont
 * retirees de l'arbre d'accessibilite.
 *
 * Sous mouvement reduit, chaque barre se fige a son premier niveau : le
 * spectre inegal se lit encore comme un egaliseur, seul le mouvement
 * s'arrete.
 *
 * @module
 */

import { mergePresentation, type Customisable } from '@odoro-cli/engine'
import type { CSSProperties, ReactElement } from 'react'

/** Identifiant de la feuille injectee. */
const STYLE_ID = 'o-equalizer'

/**
 * Suites de niveaux, une par barre, en fraction de la hauteur maximale.
 *
 * Le premier et le dernier niveau sont egaux : la boucle se referme sans
 * saut. Les suites sont decalees entre elles pour qu'aucune paire de barres
 * voisines ne monte au meme moment.
 */
const LEVELS: readonly (readonly number[])[] = [
  [0.3, 0.9, 0.5, 1, 0.4, 0.7, 0.3],
  [0.6, 0.2, 0.8, 0.5, 1, 0.3, 0.6],
  [0.9, 0.5, 0.3, 0.7, 0.2, 0.8, 0.9],
  [0.4, 1, 0.6, 0.3, 0.7, 0.5, 0.4],
  [0.7, 0.3, 1, 0.6, 0.5, 0.9, 0.7],
  [0.5, 0.7, 0.2, 0.9, 0.3, 1, 0.5],
]

/**
 * Facteur de duree de chaque barre.
 *
 * Des durees toutes differentes et sans rapport simple entre elles : les
 * cycles ne se realignent pas a l'echelle d'une attente.
 */
const TEMPO: readonly number[] = [1, 1.17, 0.89, 1.31, 1.07, 0.83]

/** Nombre de barres, deduit de la table. */
const BARS = LEVELS.length

/** Pose les barres et leurs six partitions, une fois par document. */
function ensureEqualizerRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-equalizer]{',
    'display:inline-flex;align-items:flex-end;',
    'gap:calc(var(--o-eq-size) * 0.6);height:calc(var(--o-eq-size) * 6);',
    '}',
    '[data-o-equalizer-bar]{',
    'width:var(--o-eq-size);height:100%;',
    'border-radius:calc(var(--o-eq-size) / 3) calc(var(--o-eq-size) / 3) 0 0;',
    'background:var(--o-eq-color);transform-origin:bottom;',
    'animation-timing-function:ease-in-out;animation-iteration-count:infinite;',
    'animation-duration:var(--o-eq-duration);animation-delay:var(--o-eq-delay);',
    '}',
    // Une partition par barre : les images cles sont reparties a egale
    // distance sur le cycle, le dernier niveau rejoignant le premier.
    ...LEVELS.flatMap((levels, bar) => [
      `[data-o-equalizer-bar="${String(bar)}"]{animation-name:o-equalizer-${String(bar)}}`,
      `@keyframes o-equalizer-${String(bar)}{`,
      ...levels.map(
        (level, index) =>
          `${String(Math.round((index / (levels.length - 1)) * 100))}%{transform:scaleY(${String(level)})}`,
      ),
      '}',
    ]),
    // Un spectre fige : les barres gardent leur premier niveau, inegal.
    '@media (prefers-reduced-motion:reduce){',
    '[data-o-equalizer-bar]{animation:none;transform:scaleY(var(--o-eq-rest))}',
    '}',
  ].join('')
  document.head.append(style)
}

/** Proprietes propres au composant. */
export interface EqualizerOwnProps {
  /** Largeur d'une barre, en pixels. @defaultValue 5 */
  size?: number
  /** Duree de reference d'un cycle, en millisecondes. @defaultValue 1200 */
  speed?: number
  /** Couleur des barres. @defaultValue la couleur du texte */
  color?: string
  /** Libelle annonce aux lecteurs d'ecran. @defaultValue 'Chargement' */
  label?: string
}

/** Toutes les proprietes. */
export type EqualizerProps = Customisable<EqualizerOwnProps, 'span'>

/**
 * Signale une attente par six barres de vumetre qui dansent.
 *
 * @example
 * <Equalizer />
 *
 * @example
 * // Plus large, plus lent, dans la teinte de marque.
 * <Equalizer size={8} speed={1800} color="var(--o-palette-brand-500)" />
 */
export function Equalizer({
  size = 5,
  speed = 1200,
  color = 'currentColor',
  label = 'Chargement',
  ...rest
}: EqualizerProps): ReactElement {
  ensureEqualizerRule()

  const { className, style } = mergePresentation({}, rest)

  const loaderStyle = {
    ...style,
    '--o-eq-size': `${String(size)}px`,
    '--o-eq-color': color,
  } as CSSProperties

  return (
    <span
      {...rest}
      className={className}
      style={loaderStyle}
      data-o-equalizer=""
      role="status"
    >
      <span className="o-sr-only">{label}</span>
      {LEVELS.map((levels, bar) => (
        <span
          key={bar}
          aria-hidden
          data-o-equalizer-bar={String(bar)}
          style={
            {
              '--o-eq-duration': `${String(Math.round(speed * (TEMPO[bar] ?? 1)))}ms`,
              // Chaque barre demarre a un point different de sa partition,
              // en negatif : le spectre est complet des la premiere image.
              '--o-eq-delay': `${String(Math.round((-speed * bar) / BARS))}ms`,
              '--o-eq-rest': String(levels[0] ?? 0.5),
            } as CSSProperties
          }
        />
      ))}
    </span>
  )
}

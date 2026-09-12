/**
 * Rond, carre, triangle : une forme pleine passe de l'un a l'autre et
 * revient, par interpolation d'un seul chemin SVG.
 *
 * ## Trois formes, une seule grammaire
 *
 * Un navigateur ne sait interpoler deux traces que s'ils ont exactement la
 * meme suite de commandes. Les trois formes sont donc ecrites avec quatre
 * courbes cubiques chacune, meme quand la forme n'en a pas besoin. Le carre
 * est quatre courbes dont les points de controle sont alignes sur les
 * cotes ; le triangle en a une de trop, posee sur son cote gauche comme un
 * sommet plat. Le rond est le seul a les employer toutes vraiment.
 *
 * C'est ce qui permet a la forme de couler d'un etat a l'autre au lieu de
 * sauter : les angles du carre naissent des tangentes du rond, le quatrieme
 * sommet du triangle s'aplatit dans son cote.
 *
 * L'interpolation est confiee a SMIL, natif dans le SVG : aucun JavaScript
 * apres le premier rendu, et pas de filtre. Chaque forme tient un temps
 * avant la transition suivante : sans les paliers, l'oeil ne verrait jamais
 * une forme nette.
 *
 * ## Un statut, pas un dessin
 *
 * L'element porte `role="status"` et un libelle pour les lecteurs d'ecran :
 * l'attente est une information, pas une decoration. Le dessin est retire
 * de l'arbre d'accessibilite.
 *
 * SMIL ignore la preference de mouvement reduit : c'est donc le composant
 * qui la lit, et qui n'insere pas l'animation quand elle est active. Il
 * reste un rond plein, la premiere forme du cycle.
 *
 * @module
 */

import { mergePresentation, useMotionState, type Customisable } from '@odoro-cli/engine'
import type { CSSProperties, ReactElement } from 'react'

/** Identifiant de la feuille injectee. */
const STYLE_ID = 'o-shape-morph'

/**
 * Les trois traces, dans une vue de 100 unites.
 *
 * Tous partent du coin haut droit et tournent dans le sens horaire, avec
 * quatre courbes cubiques : c'est la condition de l'interpolation.
 */
const CIRCLE =
  'M 78.28 21.72 C 93.9 37.34 93.9 62.66 78.28 78.28 C 62.66 93.9 37.34 93.9 21.72 78.28 C 6.1 62.66 6.1 37.34 21.72 21.72 C 37.34 6.1 62.66 6.1 78.28 21.72 Z'
const SQUARE =
  'M 82 18 C 82 39.33 82 60.67 82 82 C 60.67 82 39.33 82 18 82 C 18 60.67 18 39.33 18 18 C 39.33 18 60.67 18 82 18 Z'
const TRIANGLE =
  'M 50 20 C 62 40.67 74 61.33 86 82 C 62 82 38 82 14 82 C 20 71.67 26 61.33 32 51 C 38 40.67 44 30.33 50 20 Z'

/** La suite des formes et des paliers, de 0 a 1 sur le cycle. */
const VALUES = [CIRCLE, CIRCLE, SQUARE, SQUARE, TRIANGLE, TRIANGLE, CIRCLE].join(';')
const KEY_TIMES = '0;0.22;0.33;0.55;0.66;0.88;1'
/** Une acceleration douce sur chaque transition, y compris les paliers. */
const KEY_SPLINES = Array.from({ length: 6 }, () => '0.4 0 0.2 1').join(';')

/** Pose le cadre, une fois par document. */
function ensureShapeMorphRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-shape-morph]{display:inline-block;line-height:0}',
    '[data-o-shape-morph] svg{display:block}',
  ].join('')
  document.head.append(style)
}

/** Proprietes propres au composant. */
export interface ShapeMorphOwnProps {
  /** Cote de la zone de dessin, en pixels. @defaultValue 40 */
  size?: number
  /** Duree d'un cycle complet, en millisecondes. @defaultValue 2400 */
  speed?: number
  /** Couleur de la forme. @defaultValue la couleur du texte */
  color?: string
  /** Libelle annonce aux lecteurs d'ecran. @defaultValue 'Chargement' */
  label?: string
}

/** Toutes les proprietes. */
export type ShapeMorphProps = Customisable<ShapeMorphOwnProps, 'span'>

/**
 * Signale une attente par une forme qui passe du rond au carre au triangle.
 *
 * @example
 * <ShapeMorph />
 *
 * @example
 * // Plus grand, plus lent, dans la teinte de marque.
 * <ShapeMorph size={64} speed={3600} color="var(--o-palette-brand-500)" />
 */
export function ShapeMorph({
  size = 40,
  speed = 2400,
  color = 'currentColor',
  label = 'Chargement',
  ...rest
}: ShapeMorphProps): ReactElement {
  ensureShapeMorphRule()
  const { reduced } = useMotionState()

  const { className, style } = mergePresentation({}, rest)

  const loaderStyle = {
    ...style,
    width: `${String(size)}px`,
    height: `${String(size)}px`,
    color,
  } as CSSProperties

  return (
    <span
      {...rest}
      className={className}
      style={loaderStyle}
      data-o-shape-morph=""
      role="status"
    >
      <span className="o-sr-only">{label}</span>
      <svg aria-hidden viewBox="0 0 100 100" width="100%" height="100%">
        <path d={CIRCLE} fill="currentColor">
          {reduced ? null : (
            <animate
              attributeName="d"
              values={VALUES}
              keyTimes={KEY_TIMES}
              keySplines={KEY_SPLINES}
              calcMode="spline"
              dur={`${String(speed)}ms`}
              repeatCount="indefinite"
            />
          )}
        </path>
      </svg>
    </span>
  )
}

/**
 * Enveloppe : le rabat s'ouvre, la lettre sort, redescend, et le rabat se
 * referme.
 *
 * ## Un rabat se retourne, il ne se plie pas en deux
 *
 * Le rabat n'a pas besoin de perspective pour s'ouvrir. Vu de face, un
 * rabat qui bascule autour de sa charniere n'est rien d'autre que le meme
 * triangle retourne autour de cette ligne : une symetrie verticale, dont
 * l'origine est posee sur la charniere. `scaleY(-1)` fait exactement cela,
 * et le passage de un a moins un donne le mouvement d'ouverture — le
 * triangle s'aplatit sur la charniere a mi-course, comme un rabat vu de
 * profil. Une rotation en trois dimensions couterait une couche de
 * composition pour le meme resultat.
 *
 * La lettre ne sort pas de nulle part : elle est decoupee sur la ligne de
 * la charniere, et glisse vers le haut derriere cette decoupe. Rien ne la
 * cache — il n'y a simplement rien a voir en dessous. La decoupe est posee
 * sur un groupe distinct de celui qui bouge : sur le meme, elle suivrait le
 * mouvement, et la lettre serait toujours coupee au meme endroit d'elle.
 *
 * La lettre est peinte dans la couleur de surface du theme, celle d'une
 * feuille posee sur la page : c'est ce qui la fait passer devant le rabat
 * ouvert au lieu de se confondre avec lui.
 *
 * Deux animations CSS sur des elements SVG, tenues par le compositeur,
 * aucun JavaScript apres le premier rendu.
 *
 * ## Un statut, pas un dessin
 *
 * L'element porte `role="status"` et un libelle pour les lecteurs d'ecran :
 * l'attente est une information, pas une decoration. Le dessin est retire
 * de l'arbre d'accessibilite.
 *
 * Sous mouvement reduit, l'enveloppe est ouverte et la lettre sortie : de
 * tous les moments du cycle, c'est celui qui dit ce que fait la figure.
 *
 * @module
 */

import { mergePresentation, type Customisable } from '@odoro-cli/engine'
import { useId, type CSSProperties, type ReactElement } from 'react'

/** Identifiant de la feuille injectee. */
const STYLE_ID = 'o-envelope'

/** Hauteur de la charniere, dans une vue de 100 unites. */
const HINGE = 34

/** Course de la lettre, en unites de la vue. */
const RISE = 32

/** Le corps de l'enveloppe. */
const BODY = 'M 12 34 L 88 34 L 88 84 Q 88 88 84 88 L 16 88 Q 12 88 12 84 Z'

/** Le rabat, ferme : un triangle qui pointe vers le bas. */
const FLAP = 'M 12 34 L 50 62 L 88 34'

/** Pose l'enveloppe, son rabat et sa lettre, une fois par document. */
function ensureEnvelopeRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-envelope]{display:inline-block;line-height:0}',
    '[data-o-envelope] svg{display:block}',
    '[data-o-envelope-flap],[data-o-envelope-letter]{',
    'transform-box:view-box;',
    'animation-duration:var(--o-envelope-speed);animation-iteration-count:infinite;',
    '}',
    `[data-o-envelope-flap]{transform-origin:50px ${String(HINGE)}px;animation-name:o-envelope-flap}`,
    '[data-o-envelope-letter]{transform-origin:50px 50px;animation-name:o-envelope-letter}',
    // Le rabat bascule autour de sa charniere : de un a moins un, en
    // passant par zero, ou il est vu de profil.
    '@keyframes o-envelope-flap{',
    '0%{transform:scaleY(1);animation-timing-function:ease-in-out}',
    '18%,82%{transform:scaleY(-1);animation-timing-function:ease-in-out}',
    '100%{transform:scaleY(1)}',
    '}',
    // La lettre attend que le rabat soit ouvert, monte d'un trait, tient,
    // puis redescend avant que le rabat ne se referme sur elle.
    '@keyframes o-envelope-letter{',
    '0%,18%{transform:translateY(0);animation-timing-function:cubic-bezier(0.2,0.8,0.3,1)}',
    `38%,62%{transform:translateY(-${String(RISE)}px);animation-timing-function:ease-in}`,
    '82%,100%{transform:translateY(0)}',
    '}',
    // Enveloppe ouverte, lettre sortie : le moment qui dit tout le cycle.
    '@media (prefers-reduced-motion:reduce){',
    '[data-o-envelope-flap]{animation:none;transform:scaleY(-1)}',
    `[data-o-envelope-letter]{animation:none;transform:translateY(-${String(RISE)}px)}`,
    '}',
  ].join('')
  document.head.append(style)
}

/** Proprietes propres au composant. */
export interface EnvelopeOwnProps {
  /** Cote du dessin, en pixels. @defaultValue 64 */
  size?: number
  /** Duree d'un cycle complet, en millisecondes. @defaultValue 2600 */
  speed?: number
  /** Couleur des traits de l'enveloppe. @defaultValue la couleur du texte */
  color?: string
  /** Libelle annonce aux lecteurs d'ecran. @defaultValue 'Chargement' */
  label?: string
}

/** Toutes les proprietes. */
export type EnvelopeProps = Customisable<EnvelopeOwnProps, 'span'>

/**
 * Signale une attente par une enveloppe qui s'ouvre et livre sa lettre.
 *
 * @example
 * <Envelope />
 *
 * @example
 * // Plus grande, plus lente, dans la teinte de marque.
 * <Envelope size={96} speed={3600} color="var(--o-palette-brand-500)" />
 */
export function Envelope({
  size = 64,
  speed = 2600,
  color = 'currentColor',
  label = 'Chargement',
  ...rest
}: EnvelopeProps): ReactElement {
  ensureEnvelopeRule()

  // La decoupe est referencee par identifiant dans le document : deux
  // enveloppes sur la meme page ne doivent pas se partager le meme.
  const id = useId().replace(/[^a-zA-Z0-9_-]/g, '')
  const mouth = `o-envelope-mouth-${id}`

  const { className, style } = mergePresentation({}, rest)

  const loaderStyle = {
    ...style,
    width: `${String(size)}px`,
    height: `${String(size)}px`,
    color,
    '--o-envelope-speed': `${String(speed)}ms`,
  } as CSSProperties

  return (
    <span
      {...rest}
      className={className}
      style={loaderStyle}
      data-o-envelope=""
      role="status"
    >
      <span className="o-sr-only">{label}</span>
      <svg aria-hidden viewBox="0 0 100 100" width="100%" height="100%">
        <defs>
          <clipPath id={mouth}>
            {/* Tout ce qui est au-dessus de la charniere : la lettre n'est
                visible que sortie. */}
            <rect x={0} y={0} width={100} height={HINGE} />
          </clipPath>
        </defs>
        <path
          d={BODY}
          fill="none"
          stroke="currentColor"
          strokeWidth={4}
          strokeLinejoin="round"
        />
        <path
          data-o-envelope-flap=""
          d={FLAP}
          fill="none"
          stroke="currentColor"
          strokeWidth={4}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        <g clipPath={`url(#${mouth})`}>
          <g data-o-envelope-letter="">
            {/* La lettre est plus etroite que le rabat : ses deux obliques
                restent visibles de part et d'autre, sinon l'ouverture
                passerait entierement derriere la feuille. */}
            <rect
              x={30}
              y={HINGE}
              width={40}
              height={44}
              rx={3}
              fill="var(--o-theme-surface)"
              stroke="currentColor"
              strokeWidth={4}
            />
            <line x1={38} y1={44} x2={62} y2={44} stroke="currentColor" strokeWidth={4} />
            <line x1={38} y1={54} x2={62} y2={54} stroke="currentColor" strokeWidth={4} />
          </g>
        </g>
      </svg>
    </span>
  )
}

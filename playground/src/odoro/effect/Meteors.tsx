/**
 * Meteores : des traits obliques tombent en boucle a travers la zone.
 *
 * ## Un hasard qui n'en est pas un
 *
 * Position, delai et duree de chaque meteore paraissent aleatoires, mais
 * sont derives de son index par une suite deterministe. `Math.random()` au
 * rendu ferait deux pluies differentes entre le serveur et le client — une
 * erreur d'hydratation par meteore — et une pluie nouvelle a chaque rendu
 * du parent. La graine par index donne la meme pluie partout, toujours.
 *
 * ## Le compositeur fait tomber la pluie
 *
 * Chaque meteore est une seule animation CSS — translation le long de sa
 * pente et fondu — qui boucle avec un delai negatif : la pluie est deja en
 * cours au premier regard, personne n'assiste au depart groupe.
 *
 * La zone est purement decorative : elle est retiree de l'arbre
 * d'accessibilite, et sous mouvement reduit elle n'est pas rendue du tout.
 *
 * @module
 */

import { mergePresentation, useMotionState, type Customisable } from '@odoro-cli/engine'
import { type CSSProperties, type ReactElement } from 'react'

/** Proprietes propres au composant. */
export interface MeteorsOwnProps {
  /** Nombre de meteores. @defaultValue 12 */
  count?: number
  /** Angle de la chute, en degres. @defaultValue 215 */
  angle?: number
  /** Couleur des traits. @defaultValue la couleur du texte */
  color?: string
}

/** Toutes les proprietes. */
export type MeteorsProps = Customisable<MeteorsOwnProps>

/** Identifiant de la feuille injectee. */
const STYLE_ID = 'o-meteors'

/**
 * Valeur pseudo-aleatoire dans [0, 1), stable pour un couple index-canal.
 *
 * Une congruence suffit : il ne s'agit pas de cryptographie, seulement de
 * casser les alignements visibles entre meteores voisins.
 */
function seeded(index: number, channel: number): number {
  const value = Math.sin(index * 127.1 + channel * 311.7) * 43758.5453
  return value - Math.floor(value)
}

/** Pose la chute, une fois par document. */
function ensureMeteorRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-meteors]{position:absolute;inset:0;overflow:hidden;pointer-events:none}',
    '[data-o-meteor]{',
    'position:absolute;top:-10%;width:var(--o-meteor-length);height:1px;',
    // Le trait est un degrade : tete pleine, queue qui s'efface.
    'background:linear-gradient(90deg,var(--o-meteor-color),transparent);',
    'rotate:var(--o-meteor-angle);',
    'animation:o-meteor-fall var(--o-meteor-duration) linear infinite;',
    'animation-delay:var(--o-meteor-delay);',
    'opacity:0;',
    '}',
    // La translation suit l'axe du trait : `rotate` a deja oriente le
    // repere, tomber revient a avancer sur son propre X.
    '@keyframes o-meteor-fall{',
    '0%{transform:translateX(0);opacity:0}',
    '8%{opacity:var(--o-meteor-opacity)}',
    '75%{opacity:var(--o-meteor-opacity)}',
    '100%{transform:translateX(var(--o-meteor-travel));opacity:0}',
    '}',
  ].join('')
  document.head.append(style)
}

/**
 * Remplit sa zone d'une pluie de meteores.
 *
 * Le parent doit etre en position relative : la pluie epouse ses bords.
 *
 * @example
 * <div className="o-relative o-overflow-hidden o-rounded-xl o-p-8">
 *   <Meteors />
 *   <h3>Un coin de ciel</h3>
 * </div>
 *
 * @example
 * // Une pluie dense, presque verticale.
 * <Meteors count={24} angle={245} />
 */
export function Meteors({
  count = 12,
  angle = 215,
  color = 'currentColor',
  ...rest
}: MeteorsProps): ReactElement | null {
  const { reduced } = useMotionState()
  ensureMeteorRule()

  // Purement decoratif : sous mouvement reduit, une pluie figee ne serait
  // qu'un bruit de traits. Rien n'est rendu.
  if (reduced) return null

  const { className, style } = mergePresentation({}, rest)

  const zoneStyle = {
    ...style,
    '--o-meteor-color': color,
    '--o-meteor-angle': `${String(angle)}deg`,
  } as CSSProperties

  return (
    <div {...rest} aria-hidden className={className} style={zoneStyle} data-o-meteors="">
      {Array.from({ length: count }, (_, index) => {
        const duration = 2400 + seeded(index, 1) * 3200
        return (
          <span
            key={index}
            data-o-meteor=""
            style={
              {
                left: `${String(seeded(index, 0) * 100)}%`,
                '--o-meteor-duration': `${String(Math.round(duration))}ms`,
                // Delai negatif : chaque meteore est deja quelque part sur
                // sa course au premier rendu.
                '--o-meteor-delay': `${String(-Math.round(seeded(index, 2) * duration))}ms`,
                '--o-meteor-length': `${String(Math.round(60 + seeded(index, 3) * 90))}px`,
                '--o-meteor-travel': `${String(Math.round(400 + seeded(index, 4) * 400))}px`,
                '--o-meteor-opacity': String(0.35 + seeded(index, 5) * 0.55),
              } as CSSProperties
            }
          />
        )
      })}
    </div>
  )
}

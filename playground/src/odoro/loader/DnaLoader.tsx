/**
 * Helice d'ADN : deux brins de points tournent l'un autour de l'autre,
 * relies par des barreaux qui s'allongent et se resserrent.
 *
 * ## Une helice vue de cote est un sinus, et une profondeur
 *
 * Chaque point tourne sur un cercle vu par la tranche : sa hauteur est un
 * sinus du temps, et sa distance a l'oeil un cosinus. Le second n'est pas
 * un detail : c'est lui qui fait lire une helice plutot que deux vagues
 * qui se croisent. Un point qui passe devant est grand et plein, un point
 * qui passe derriere est petit et pale, et l'ordre de superposition change
 * au passage — sans quoi le point de derriere viendrait couvrir celui de
 * devant a chaque croisement.
 *
 * Une seule animation, echantillonnee tous les trente degres, en lineaire :
 * une courbe d'acceleration ne peut pas servir a la fois le sinus de la
 * hauteur et le cosinus de la profondeur, alors le sinus est trace par
 * points, assez serres pour que l'oeil ne voie pas les segments. Chaque
 * colonne joue la meme animation avec un decalage de phase ; le second brin
 * a un demi-tour de retard sur le premier ; le barreau entre les deux est
 * aussi long que leur ecart, c'est-a-dire la valeur absolue du meme sinus.
 *
 * Les phases sont posees en negatif : l'helice est complete des la premiere
 * image, et sa forme au repos — calculee ici, colonne par colonne — est
 * exactement une image de son mouvement.
 *
 * ## Un statut, pas un dessin
 *
 * L'element porte `role="status"` et un libelle pour les lecteurs d'ecran :
 * l'attente est une information, pas une decoration. Les brins sont retires
 * de l'arbre d'accessibilite.
 *
 * Sous mouvement reduit, l'helice reste figee dans sa forme : chaque point
 * garde la hauteur et la profondeur de sa phase, et la figure se lit encore
 * comme une helice.
 *
 * @module
 */

import { mergePresentation, type Customisable } from '@odoro-cli/engine'
import type { CSSProperties, ReactElement } from 'react'

/** Identifiant de la feuille injectee. */
const STYLE_ID = 'o-dna-loader'

/** Amplitude de la hauteur, en diametres de point. */
const AMPLITUDE = 1.6

/** Echantillons par tour : un tous les trente degres. */
const STEPS = 12

/** Ce qu'un point montre a une phase donnee. */
interface Pose {
  /** Hauteur, en part de l'amplitude. */
  readonly y: number
  /** Echelle : pleine devant, reduite derriere. */
  readonly scale: number
  /** Opacite : pleine devant, palie derriere. */
  readonly opacity: number
  /** Ordre de superposition : devant ou derriere le barreau. */
  readonly layer: number
}

/** Position d'un point a une phase, en radians. */
function poseAt(phase: number): Pose {
  const depth = Math.cos(phase)
  // Le point est devant sur la moitie du tour centree sur la phase zero ;
  // la bascule tombe entre deux echantillons, pas dessus.
  const degrees = (((phase * 180) / Math.PI) % 360 + 360) % 360
  return {
    y: Math.sin(phase),
    scale: 0.75 + 0.25 * depth,
    opacity: 0.7 + 0.3 * depth,
    layer: degrees < 105 || degrees >= 285 ? 2 : 1,
  }
}

/** Pose les brins, les barreaux et leur rotation, une fois par document. */
function ensureDnaRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const turn = Array.from({ length: STEPS + 1 }, (_, step) => {
    const pose = poseAt((2 * Math.PI * step) / STEPS)
    return `${((step * 100) / STEPS).toFixed(3)}%{transform:translateY(calc(var(--o-dna-amp) * ${pose.y.toFixed(3)})) scale(${pose.scale.toFixed(3)});opacity:${pose.opacity.toFixed(3)};z-index:${String(pose.layer)}}`
  })
  const rung = Array.from({ length: STEPS + 1 }, (_, step) => {
    const length = Math.abs(Math.sin((2 * Math.PI * step) / STEPS))
    return `${((step * 100) / STEPS).toFixed(3)}%{transform:scaleY(${length.toFixed(3)})}`
  })

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-dna-loader]{',
    'display:inline-flex;align-items:center;',
    'gap:calc(var(--o-dna-size) * 0.7);',
    `height:calc(var(--o-dna-size) * ${String(2 * AMPLITUDE + 1)});`,
    '}',
    '[data-o-dna-pair]{',
    'position:relative;width:var(--o-dna-size);height:100%;',
    '}',
    // Le barreau est centre et s'etire depuis son milieu : ses deux bouts
    // suivent les deux points.
    '[data-o-dna-rung]{',
    'position:absolute;left:50%;top:50%;',
    'width:calc(var(--o-dna-size) * 0.18);',
    `height:calc(var(--o-dna-size) * ${String(2 * AMPLITUDE)});`,
    'margin-left:calc(var(--o-dna-size) * -0.09);',
    `margin-top:calc(var(--o-dna-size) * ${String(-AMPLITUDE)});`,
    'background:var(--o-dna-color);opacity:0.35;',
    'transform:scaleY(var(--o-dna-rung));',
    'animation:o-dna-loader-rung var(--o-dna-speed) linear infinite;',
    'animation-delay:var(--o-dna-delay);',
    '}',
    // Au repos, chaque point tient sa pose de phase ; en mouvement,
    // l'animation la remplace image par image.
    '[data-o-dna-dot]{',
    'position:absolute;left:0;top:50%;',
    'width:var(--o-dna-size);height:var(--o-dna-size);',
    'margin-top:calc(var(--o-dna-size) * -0.5);',
    'border-radius:50%;background:var(--o-dna-color);',
    'transform:translateY(calc(var(--o-dna-amp) * var(--o-dna-y))) scale(var(--o-dna-s));',
    'opacity:var(--o-dna-o);z-index:var(--o-dna-z);',
    'animation:o-dna-loader-turn var(--o-dna-speed) linear infinite;',
    'animation-delay:var(--o-dna-delay);',
    '}',
    `@keyframes o-dna-loader-turn{${turn.join('')}}`,
    `@keyframes o-dna-loader-rung{${rung.join('')}}`,
    // L'helice figee dans sa forme : chaque point garde sa pose.
    '@media (prefers-reduced-motion:reduce){',
    '[data-o-dna-dot],[data-o-dna-rung]{animation:none}',
    '}',
  ].join('')
  document.head.append(style)
}

/** Proprietes propres au composant. */
export interface DnaLoaderOwnProps {
  /** Diametre d'un point, en pixels. @defaultValue 6 */
  size?: number
  /** Nombre de paires de points, soit de barreaux. Un tour d'helice les traverse tous. @defaultValue 8 */
  pairs?: number
  /** Duree d'un tour complet, en millisecondes. @defaultValue 1600 */
  speed?: number
  /** Couleur des points et des barreaux. @defaultValue la couleur du texte */
  color?: string
  /** Libelle annonce aux lecteurs d'ecran. @defaultValue 'Chargement' */
  label?: string
}

/** Toutes les proprietes. */
export type DnaLoaderProps = Customisable<DnaLoaderOwnProps, 'span'>

/** Variables de pose d'un point, pour son etat au repos. */
function poseVars(phase: number): CSSProperties {
  const pose = poseAt(phase)
  return {
    '--o-dna-y': pose.y.toFixed(3),
    '--o-dna-s': pose.scale.toFixed(3),
    '--o-dna-o': pose.opacity.toFixed(3),
    '--o-dna-z': String(pose.layer),
  } as CSSProperties
}

/**
 * Signale une attente par une helice d'ADN qui tourne.
 *
 * @example
 * <DnaLoader />
 *
 * @example
 * // Plus de paires, plus lent, dans la teinte de marque.
 * <DnaLoader pairs={12} speed={2400} color="var(--o-palette-brand-500)" />
 */
export function DnaLoader({
  size = 6,
  pairs = 8,
  speed = 1600,
  color = 'currentColor',
  label = 'Chargement',
  ...rest
}: DnaLoaderProps): ReactElement {
  ensureDnaRule()

  const { className, style } = mergePresentation({}, rest)

  const count = Math.max(2, Math.round(pairs))

  const loaderStyle = {
    ...style,
    '--o-dna-size': `${String(size)}px`,
    '--o-dna-amp': `${String(size * AMPLITUDE)}px`,
    '--o-dna-speed': `${String(speed)}ms`,
    '--o-dna-color': color,
  } as CSSProperties

  return (
    <span
      {...rest}
      className={className}
      style={loaderStyle}
      data-o-dna-loader=""
      role="status"
    >
      <span className="o-sr-only">{label}</span>
      {Array.from({ length: count }, (_, pair) => {
        // Une part de tour par colonne, en negatif : l'helice est la des la
        // premiere image, et sa pose au repos coincide avec sa phase.
        const phase = (2 * Math.PI * pair) / count
        const delay = Math.round((-speed * pair) / count)
        return (
          <span key={pair} aria-hidden data-o-dna-pair="">
            <span
              data-o-dna-rung=""
              style={
                {
                  '--o-dna-delay': `${String(delay)}ms`,
                  '--o-dna-rung': Math.abs(Math.sin(phase)).toFixed(3),
                } as CSSProperties
              }
            />
            <span
              data-o-dna-dot=""
              style={{ ...poseVars(phase), '--o-dna-delay': `${String(delay)}ms` } as CSSProperties}
            />
            <span
              data-o-dna-dot=""
              style={
                {
                  ...poseVars(phase + Math.PI),
                  '--o-dna-delay': `${String(delay - Math.round(speed / 2))}ms`,
                } as CSSProperties
              }
            />
          </span>
        )
      })}
    </span>
  )
}

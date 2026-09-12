/**
 * Coche de reussite : la coche se dessine en boucle pendant l'attente, se
 * pose pour de bon au succes, et cede la place a une croix a l'echec.
 *
 * ## Le meme geste, du debut a la fin
 *
 * La plupart des chargeurs a etats changent de figure au moment de la
 * reponse : un anneau qui tourne, puis une coche. Celui-ci ne change
 * jamais de figure — c'est la meme coche qui s'ebauche pendant l'attente et
 * qui s'arrete de s'effacer quand la reponse arrive. L'utilisateur voit
 * donc, des la premiere seconde, ce qu'il est en train d'attendre.
 *
 * Le trait est un tiret aussi long que le chemin, deplace par son
 * decalage : la coche se dessine de la pointe basse vers le haut, dans
 * l'ordre ou une main la tracerait. Le chemin declare une longueur de cent,
 * ce qui rend les images cles independantes de sa longueur reelle — et la
 * croix, qui est deux traits d'un seul chemin, se dessine avec exactement
 * les memes images cles.
 *
 * Pendant l'attente, la coche se trace, tient, puis s'efface en fondu et
 * recommence : une ebauche, jamais une affirmation. A la reponse,
 * l'animation devient unique et se fige sur sa derniere image — c'est la
 * seule difference entre « peut-etre » et « oui ».
 *
 * Le disque derriere le trait n'apparait qu'a la reponse : il donne au
 * resultat un poids que l'attente n'a pas.
 *
 * ## Un statut qui parle
 *
 * L'element porte `role="status"` : le libelle hors ecran change avec
 * l'etat, et le changement est annonce sans voler le focus. C'est le seul
 * canal par lequel un lecteur d'ecran apprend que l'operation a reussi —
 * une couleur et une forme ne se lisent pas a voix haute. Le dessin, lui,
 * est retire de l'arbre d'accessibilite.
 *
 * Sous mouvement reduit, la marque est entierement tracee dans chaque etat,
 * disque compris : c'est l'etat final, celui qui informe.
 *
 * @module
 */

import { mergePresentation, type Customisable } from '@odoro-cli/engine'
import type { CSSProperties, ReactElement } from 'react'

/** Identifiant de la feuille injectee. */
const STYLE_ID = 'o-checkmark-success'

/** La coche, de la pointe basse vers le haut. */
const CHECK = 'M 26 52 L 43 69 L 76 32'

/** La croix, deux traits d'un seul chemin : le trace les enchaine. */
const CROSS = 'M 34 34 L 66 66 M 66 34 L 34 66'

/** Etats possibles du composant. */
export type CheckmarkState = 'chargement' | 'succes' | 'echec'

/** Pose la marque, son trace et ses etats, une fois par document. */
function ensureCheckmarkRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-checkmark]{display:inline-block;line-height:0}',
    '[data-o-checkmark] svg{display:block}',
    '[data-o-checkmark-mark]{stroke-dasharray:100 100;stroke-dashoffset:100}',
    '[data-o-checkmark-halo]{opacity:0;transform-box:view-box;transform-origin:50px 50px}',
    '[data-o-checkmark-shake]{transform-box:view-box;transform-origin:50px 50px}',
    // Attente : la coche s'ebauche sans fin.
    '[data-o-checkmark="chargement"] [data-o-checkmark-mark]{',
    'animation:o-checkmark-loop var(--o-check-speed) infinite;',
    '}',
    // Reponse : un seul trace, fige sur sa derniere image.
    '[data-o-checkmark="succes"] [data-o-checkmark-mark],',
    '[data-o-checkmark="echec"] [data-o-checkmark-mark]{',
    'animation:o-checkmark-draw var(--o-check-speed) cubic-bezier(0.65,0,0.35,1) forwards;',
    '}',
    '[data-o-checkmark="succes"] [data-o-checkmark-halo],',
    '[data-o-checkmark="echec"] [data-o-checkmark-halo]{',
    'animation:o-checkmark-pop var(--o-check-speed) cubic-bezier(0.34,1.56,0.64,1) forwards;',
    '}',
    // Un refus se secoue la tete : deux allers-retours courts, apres le
    // trace, jamais pendant.
    '[data-o-checkmark="echec"] [data-o-checkmark-shake]{',
    'animation:o-checkmark-shake calc(var(--o-check-speed) * 0.5) ease-in-out calc(var(--o-check-speed) * 0.7) 1;',
    '}',
    '@keyframes o-checkmark-loop{',
    '0%{stroke-dashoffset:100;opacity:1;animation-timing-function:cubic-bezier(0.65,0,0.35,1)}',
    '46%,72%{stroke-dashoffset:0;opacity:1;animation-timing-function:ease-in}',
    '100%{stroke-dashoffset:0;opacity:0}',
    '}',
    '@keyframes o-checkmark-draw{to{stroke-dashoffset:0}}',
    '@keyframes o-checkmark-pop{',
    '0%{opacity:0;transform:scale(0.6)}',
    '100%{opacity:1;transform:scale(1)}',
    '}',
    '@keyframes o-checkmark-shake{',
    '0%,100%{transform:translateX(0)}',
    '25%{transform:translateX(-5px)}',
    '60%{transform:translateX(5px)}',
    '85%{transform:translateX(-2px)}',
    '}',
    // Marque entierement tracee, disque pose au besoin : l'etat final.
    //
    // Les selecteurs y sont aussi precis que ceux des etats : une requete de
    // media n'ajoute aucune specificite, et une regle plus courte perdrait
    // contre `[data-o-checkmark="chargement"] [data-o-checkmark-mark]` —
    // l'animation continuerait de tourner sous mouvement reduit.
    '@media (prefers-reduced-motion:reduce){',
    '[data-o-checkmark] [data-o-checkmark-mark]{animation:none;stroke-dashoffset:0;opacity:1}',
    '[data-o-checkmark] [data-o-checkmark-shake]{animation:none;transform:none}',
    '[data-o-checkmark] [data-o-checkmark-halo]{animation:none;transform:none}',
    '[data-o-checkmark="succes"] [data-o-checkmark-halo],',
    '[data-o-checkmark="echec"] [data-o-checkmark-halo]{opacity:1}',
    '}',
  ].join('')
  document.head.append(style)
}

/** Proprietes propres au composant. */
export interface CheckmarkSuccessOwnProps {
  /** Cote du dessin, en pixels. @defaultValue 56 */
  size?: number
  /** Epaisseur du trait, en pixels. @defaultValue 6 */
  thickness?: number
  /** Duree d'un trace, en millisecondes. @defaultValue 900 */
  speed?: number
  /** Etat de l'operation. @defaultValue 'chargement' */
  state?: CheckmarkState
  /** Couleur de la marque. @defaultValue la couleur du texte */
  color?: string
  /** Libelle annonce pendant l'attente. @defaultValue 'Chargement' */
  label?: string
  /** Libelle annonce au succes. @defaultValue 'Termine' */
  labelSucces?: string
  /** Libelle annonce a l'echec. @defaultValue 'Echec' */
  labelEchec?: string
}

/** Toutes les proprietes. */
export type CheckmarkSuccessProps = Customisable<CheckmarkSuccessOwnProps, 'span'>

/**
 * Signale une attente puis son issue par une coche qui se dessine.
 *
 * @example
 * <CheckmarkSuccess state={enCours ? 'chargement' : 'succes'} />
 *
 * @example
 * // Un refus, plus grand, dans une teinte d'alerte.
 * <CheckmarkSuccess state="echec" size={80} color="var(--o-palette-red-500)" />
 */
export function CheckmarkSuccess({
  size = 56,
  thickness = 6,
  speed = 900,
  state = 'chargement',
  color = 'currentColor',
  label = 'Chargement',
  labelSucces = 'Termine',
  labelEchec = 'Echec',
  ...rest
}: CheckmarkSuccessProps): ReactElement {
  ensureCheckmarkRule()

  const { className, style } = mergePresentation({}, rest)

  // Le dessin vit dans une vue de 100 unites : l'epaisseur demandee en
  // pixels est convertie pour que le trait garde sa mesure a toute taille.
  const stroke = Math.min((thickness / size) * 100, 20)

  // La croix ne partage pas la coche : c'est le contraire du succes, pas sa
  // variante. Le trace, lui, est exactement le meme.
  const mark = state === 'echec' ? CROSS : CHECK

  const spoken =
    state === 'succes' ? labelSucces : state === 'echec' ? labelEchec : label

  const loaderStyle = {
    ...style,
    width: `${String(size)}px`,
    height: `${String(size)}px`,
    color,
    '--o-check-speed': `${String(speed)}ms`,
  } as CSSProperties

  return (
    <span
      {...rest}
      className={className}
      style={loaderStyle}
      data-o-checkmark={state}
      role="status"
    >
      <span className="o-sr-only">{spoken}</span>
      <svg aria-hidden viewBox="0 0 100 100" width="100%" height="100%">
        <g data-o-checkmark-shake="">
          <circle
            data-o-checkmark-halo=""
            cx={50}
            cy={50}
            r={46}
            fill="currentColor"
            fillOpacity={0.12}
          />
          <path
            data-o-checkmark-mark=""
            // La cle force React a remonter un chemin neuf quand la figure
            // change : l'animation repart du debut au lieu de continuer sur
            // l'ancienne, ce qui montrerait une croix a demi tracee.
            key={state === 'echec' ? 'croix' : 'coche'}
            d={mark}
            pathLength={100}
            fill="none"
            stroke="currentColor"
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
      </svg>
    </span>
  )
}

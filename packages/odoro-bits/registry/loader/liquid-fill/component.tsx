/**
 * Remplissage liquide : un bocal rond ou le niveau monte, la surface prise
 * par deux nappes qui derivent en sens contraires.
 *
 * ## Deux nappes valent mieux qu'une
 *
 * Une seule sinusoide qui glisse se lit comme une image qui defile : la
 * crete revient au meme endroit a chaque periode, et l'oeil attrape la
 * boucle. Deux nappes de meme periode mais de vitesses et de sens
 * differents ne se recroisent qu'au bout d'un temps long ; leur somme
 * visuelle n'a plus de motif reconnaissable, et la surface se met a
 * ressembler a de l'eau plutot qu'a un ruban.
 *
 * La nappe du fond est plus claire et plus lente, celle de devant plus
 * dense et plus rapide : la difference d'opacite donne une epaisseur au
 * liquide, la difference de vitesse une parallaxe.
 *
 * Chaque nappe est un trace de quatre periodes, plus large que la vue,
 * translate d'exactement une periode : la boucle est invisible parce que la
 * position d'arrivee redonne le dessin de depart.
 *
 * ## Deux modes, deux honnetetes
 *
 * Le mode determine recoit `value` et pose le niveau ou il faut : le bocal
 * est un `role="progressbar"` complet, valeur comprise. Le niveau glisse
 * d'une valeur a l'autre par une transition, jamais par un saut.
 *
 * Le mode `indeterminate` ne pretend rien mesurer : le niveau monte et
 * redescend sans fin comme une maree, et le `progressbar` est declare
 * **sans** valeur — c'est ainsi que la specification decrit une progression
 * inconnue.
 *
 * Sous mouvement reduit, les nappes s'immobilisent, la valeur saute sans
 * transition, et la maree indeterminee reste a mi-hauteur : le bocal se lit
 * encore, seul le mouvement s'arrete.
 *
 * @module
 */

import { mergePresentation, type Customisable } from '@odoro-cli/engine'
import { useId, type CSSProperties, type ReactElement } from 'react'

/** Identifiant de la feuille injectee. */
const STYLE_ID = 'o-liquid-fill'

/** Largeur d'une periode de vague, en unites de la vue. */
const PERIOD = 50

/** Hauteur de la crete au-dessus du niveau moyen, en unites de la vue. */
const AMPLITUDE = 3.5

/**
 * Trace d'une nappe : une sinusoide en quadratiques, prolongee vers le bas.
 *
 * Le trace commence une periode avant la vue et en couvre quatre : apres la
 * translation d'une periode, il reste de la matiere des deux cotes du
 * bocal. Une quadratique dont le point de controle est a deux fois
 * l'amplitude passe exactement par la crete voulue a mi-chemin.
 */
function wavePath(): string {
  const parts: string[] = [`M ${String(-PERIOD)} 0`]
  for (let index = 0; index < 4; index += 1) {
    parts.push(
      `q ${String(PERIOD / 4)} ${String(-AMPLITUDE * 2)} ${String(PERIOD / 2)} 0`,
      `q ${String(PERIOD / 4)} ${String(AMPLITUDE * 2)} ${String(PERIOD / 2)} 0`,
    )
  }
  parts.push(`L ${String(PERIOD * 3)} 160`, `L ${String(-PERIOD)} 160`, 'Z')
  return parts.join(' ')
}

/** Le trace, calcule une fois au chargement du module. */
const WAVE = wavePath()

/**
 * Hauteur du niveau moyen, en unites de la vue, pour une valeur de 0 a 100.
 *
 * A zero la surface est sous le fond du bocal, a cent elle est au-dessus du
 * bord : la crete ne depasse jamais d'un cote sans que le bocal soit
 * vraiment vide ou vraiment plein.
 */
function levelOf(value: number): number {
  return 98 - (value / 100) * 96
}

/** Pose le bocal, ses nappes et sa maree, une fois par document. */
function ensureLiquidRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-liquid-fill]{display:inline-block;line-height:0}',
    '[data-o-liquid-fill] svg{display:block}',
    // Le niveau glisse d'une valeur a l'autre ; il ne saute pas.
    '[data-o-liquid-level]{',
    'transition:transform var(--o-duration-base) var(--o-ease-standard);',
    '}',
    '[data-o-liquid-indeterminate] [data-o-liquid-level]{',
    'transition:none;',
    'animation:o-liquid-fill-tide var(--o-liquid-tide) ease-in-out infinite;',
    '}',
    '@keyframes o-liquid-fill-tide{',
    '0%,100%{transform:translateY(74px)}',
    '50%{transform:translateY(26px)}',
    '}',
    '[data-o-liquid-wave]{',
    'animation:o-liquid-fill-drift var(--o-liquid-drift) linear infinite;',
    '}',
    // La nappe du fond derive en sens inverse : les deux cretes se croisent
    // au lieu de se suivre.
    '[data-o-liquid-wave-back]{animation-direction:reverse}',
    '@keyframes o-liquid-fill-drift{',
    'from{transform:translateX(0)}',
    `to{transform:translateX(${String(-PERIOD)}px)}`,
    '}',
    '@media (prefers-reduced-motion:reduce){',
    '[data-o-liquid-wave]{animation:none;transform:none}',
    '[data-o-liquid-level]{transition:none}',
    '[data-o-liquid-indeterminate] [data-o-liquid-level]{animation:none;transform:translateY(50px)}',
    '}',
  ].join('')
  document.head.append(style)
}

/** Proprietes propres au composant. */
export interface LiquidFillOwnProps {
  /** Niveau, de 0 a 100. Ignore en mode indetermine. @defaultValue 62 */
  value?: number
  /** Maree sans valeur, quand rien n'est mesurable. @defaultValue false */
  indeterminate?: boolean
  /** Diametre du bocal, en pixels. @defaultValue 88 */
  size?: number
  /** Duree d'une derive de nappe, en millisecondes. @defaultValue 2600 */
  speed?: number
  /** Couleur du liquide et du bocal. @defaultValue la couleur du texte */
  color?: string
  /** Libelle annonce aux lecteurs d'ecran. @defaultValue 'Chargement' */
  label?: string
}

/** Toutes les proprietes. */
export type LiquidFillProps = Customisable<LiquidFillOwnProps, 'span'>

/**
 * Bocal rond dont le niveau de liquide dit la progression.
 *
 * @example
 * // Progression reelle.
 * <LiquidFill value={(sent / total) * 100} />
 *
 * @example
 * // Attente sans mesure, dans la teinte de marque.
 * <LiquidFill indeterminate color="var(--o-palette-brand-500)" />
 */
export function LiquidFill({
  value = 62,
  indeterminate = false,
  size = 88,
  speed = 2600,
  color = 'currentColor',
  label = 'Chargement',
  ...rest
}: LiquidFillProps): ReactElement {
  ensureLiquidRule()

  // Un identifiant par instance : deux bocaux sur la meme page ne doivent
  // pas se partager un decoupage.
  const clip = `o-liquid-fill-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`

  const clamped = Math.min(100, Math.max(0, value))

  const { className, style } = mergePresentation({}, rest)

  const hostStyle = {
    ...style,
    width: `${String(size)}px`,
    height: `${String(size)}px`,
    color,
    '--o-liquid-drift': `${String(speed)}ms`,
    // La maree est bien plus lente que la derive : elle raconte une
    // progression, pas un clapot.
    '--o-liquid-tide': `${String(speed * 3)}ms`,
  } as CSSProperties

  return (
    <span
      {...rest}
      className={className}
      style={hostStyle}
      data-o-liquid-fill=""
      data-o-liquid-indeterminate={indeterminate ? '' : undefined}
      role="progressbar"
      aria-label={label}
      // Un progressbar sans aria-valuenow est indetermine : c'est la maniere
      // normative de dire « j'avance, mais je ne sais pas de combien ».
      aria-valuemin={indeterminate ? undefined : 0}
      aria-valuemax={indeterminate ? undefined : 100}
      aria-valuenow={indeterminate ? undefined : Math.round(clamped)}
    >
      <svg aria-hidden viewBox="0 0 100 100" width="100%" height="100%">
        <defs>
          <clipPath id={clip}>
            <circle cx="50" cy="50" r="44" />
          </clipPath>
        </defs>
        <circle
          cx="50"
          cy="50"
          r="46"
          fill="none"
          stroke="currentColor"
          strokeWidth={3}
          opacity={0.25}
        />
        <g clipPath={`url(#${clip})`}>
          <g
            data-o-liquid-level=""
            style={
              indeterminate
                ? undefined
                : { transform: `translateY(${levelOf(clamped).toFixed(2)}px)` }
            }
          >
            <g data-o-liquid-wave="" data-o-liquid-wave-back="">
              <path d={WAVE} fill="currentColor" fillOpacity={0.3} />
            </g>
            <g data-o-liquid-wave="">
              <path d={WAVE} fill="currentColor" fillOpacity={0.72} />
            </g>
          </g>
        </g>
      </svg>
    </span>
  )
}

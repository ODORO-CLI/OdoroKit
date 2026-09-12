/**
 * Dossier : un carton ferme qui s'ouvre sur ses fiches.
 *
 * ## C'est un bouton qui ouvre une zone, pas une image qui reagit au survol
 *
 * Le rabat est un vrai bouton, avec `aria-expanded` et `aria-controls` : un
 * lecteur d'ecran annonce « replie » ou « deplie » et sait ou mene
 * l'ouverture. Ouvrir au survol paraitrait plus vif, et rendrait le dossier
 * inutilisable au doigt comme au clavier — le survol n'existe ni sur l'un ni
 * sur l'autre.
 *
 * ## Fermees, les fiches n'existent pas
 *
 * Elles sortent de l'ordre de tabulation et de l'arbre d'accessibilite. Une
 * fiche seulement cachee par une transformation reste focusable : le focus
 * disparaitrait derriere le carton, et l'on tabulerait dans le vide. C'est le
 * defaut le plus courant des contenus qui se replient.
 *
 * Elles restent dans le document plutot que d'etre montees a l'ouverture :
 * une fiche montee au moment ou elle doit deja se deplacer n'a pas d'etat de
 * depart, et saute au lieu de sortir.
 *
 * ## Le rabat est devant, les fiches sortent par-dessus
 *
 * Trois plans : le dos du carton, les fiches, puis le rabat. Les fiches
 * montent au-dela du bord superieur du rabat, si bien que la partie visible
 * est aussi la partie cliquable — ce qui est cache est cache par le carton,
 * pas par une zone morte.
 *
 * ## La teinte est un tirage, pas un aplat
 *
 * Le carton est un melange de la teinte et de la surface du theme plutot que
 * la teinte pure : le dossier suit le theme clair comme sombre, et le texte
 * qu'il porte garde son contraste sans avoir a choisir une encre a la main.
 * Le dos est plus charge que le rabat — c'est ce decalage qui donne
 * l'epaisseur.
 *
 * ## Mouvement reduit
 *
 * Aucune transition : l'eventail est ouvert ou ferme, jamais en chemin.
 *
 * @module
 */

import { mergePresentation, type Customisable } from '@odoro-cli/engine'
import {
  useId,
  useState,
  type CSSProperties,
  type ReactElement,
} from 'react'

/** Une fiche rangee dans le dossier. */
export interface FolderItem {
  /** Identifiant, unique dans le dossier. */
  readonly id: string
  /** Libelle affiche sur la fiche. */
  readonly label: string
  /** Precision affichee en sourdine, a droite du libelle. */
  readonly hint?: string
}

/** Proprietes propres au composant. */
export interface FolderOwnProps {
  /** Les fiches, dans l'ordre de l'eventail. */
  items: readonly FolderItem[]
  /** Nom du dossier, ecrit sur le rabat. */
  label: string
  /** Etat du dossier, en mode controle. */
  open?: boolean
  /** Etat du dossier au montage, en mode non controle. @defaultValue false */
  defaultOpen?: boolean
  /** Appele quand le dossier s'ouvre ou se referme. */
  onOpenChange?: (open: boolean) => void
  /** Appele au clic ou a Entree sur une fiche sortie. */
  onSelect?: (id: string) => void
  /** Tokens de la teinte du carton et de la couleur des fiches. */
  colors?: readonly [string, string]
  /** Largeur du dossier, en pixels. @defaultValue 220 */
  width?: number
  /** Angle entre deux fiches sorties, en degres. @defaultValue 8 */
  spread?: number
  /** Hauteur de sortie des fiches, en pourcentage. @defaultValue 62 */
  rise?: number
}

/** Toutes les proprietes. */
export type FolderProps = Customisable<FolderOwnProps>

/** Tokens employes par defaut. */
const DEFAULT_TOKENS = ['--o-palette-brand-500', '--o-theme-surface'] as const

/** Identifiant de la feuille injectee. */
const STYLE_ID = 'o-folder'

/** Pose le carton, ses trois plans et l'eventail, une fois par document. */
function ensureFolderRules(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-folder]{',
    'position:relative;display:block;width:var(--o-folder-largeur);',
    'aspect-ratio:5 / 4;perspective:900px;',
    '}',
    // Le dos : plus charge en teinte que le rabat, avec sa languette.
    '[data-o-folder-dos]{',
    'position:absolute;inset:14% 0 0;border-radius:0.6rem;',
    'background:color-mix(in oklab,var(--o-folder-carton) 42%,var(--o-theme-surface));',
    'box-shadow:0 0 0 1px color-mix(in oklab,var(--o-folder-carton) 30%,var(--o-theme-line));',
    '}',
    '[data-o-folder-dos]::before{',
    'content:"";position:absolute;left:0;top:-11%;width:44%;height:14%;',
    'border-radius:0.5rem 0.5rem 0 0;background:inherit;',
    '}',
    // Les fiches : ancrees en bas du carton, elles montent en eventail.
    '[data-o-folder-fiches]{',
    'position:absolute;inset:26% 7% 12%;margin:0;padding:0;list-style:none;z-index:2;',
    'pointer-events:none;',
    '}',
    '[data-o-folder][data-o-folder-ouvert] [data-o-folder-fiches]{pointer-events:auto}',
    '[data-o-folder-fiches]>li{position:absolute;inset:auto 0 0}',
    '[data-o-folder-fiche]{',
    'display:flex;align-items:center;justify-content:space-between;gap:0.75rem;width:100%;',
    'padding:0.45rem 0.65rem;border-radius:0.45rem;text-align:start;cursor:pointer;',
    'font:inherit;color:inherit;font-size:0.8125em;',
    'background:var(--o-folder-fiche);',
    'border:1px solid var(--o-theme-line);',
    'box-shadow:0 8px 18px -14px currentColor;',
    'transform-origin:50% 100%;opacity:0;transform:translateY(8%) scale(0.94);',
    'transition:transform var(--o-duration-slow) var(--o-ease-emphasized),',
    'opacity var(--o-duration-slow) linear;',
    '}',
    // L'eventail est un arc : les fiches des bords montent moins haut que
    // celle du milieu. Sans cet arc, trois fiches a la meme hauteur se
    // recouvrent et l'on ne lit plus que la derniere.
    '[data-o-folder][data-o-folder-ouvert] [data-o-folder-fiche]{',
    'opacity:1;',
    'transform:translateY(calc(var(--o-folder-monte) * -1 + var(--o-folder-arc)))',
    ' translateX(calc(var(--o-folder-rang) * 20%))',
    ' rotate(calc(var(--o-folder-rang) * var(--o-folder-ecart)));',
    '}',
    '[data-o-folder-fiche]:focus-visible{outline:2px solid var(--o-folder-carton);outline-offset:2px}',
    '[data-o-folder-indice]{color:var(--o-theme-muted);white-space:nowrap}',
    // Le rabat : le plan de devant, et la commande d'ouverture.
    '[data-o-folder-rabat]{',
    'position:absolute;inset:auto 0 0;height:64%;z-index:3;',
    'display:flex;flex-direction:column;align-items:flex-start;justify-content:flex-end;gap:0.15rem;',
    'padding:0.7rem 0.9rem;border-radius:0.6rem;cursor:pointer;text-align:start;',
    'font:inherit;color:inherit;',
    'background:color-mix(in oklab,var(--o-folder-carton) 20%,var(--o-theme-surface));',
    'border:1px solid color-mix(in oklab,var(--o-folder-carton) 40%,var(--o-theme-line));',
    'transform-origin:50% 100%;',
    'transition:transform var(--o-duration-slow) var(--o-ease-emphasized);',
    '}',
    '[data-o-folder][data-o-folder-ouvert] [data-o-folder-rabat]{transform:rotateX(-28deg)}',
    '[data-o-folder-rabat]:focus-visible{outline:2px solid var(--o-folder-carton);outline-offset:3px}',
    '[data-o-folder-nom]{font-weight:600}',
    '[data-o-folder-compte]{font-size:0.8125em;color:var(--o-theme-muted)}',
    '@media (prefers-reduced-motion:reduce){',
    '[data-o-folder-fiche],[data-o-folder-rabat]{transition:none}',
    '}',
  ].join('')
  document.head.append(style)
}

/**
 * Dossier qui s'ouvre sur ses fiches, au clic comme au clavier.
 *
 * @example
 * <Folder
 *   label="Dossier client"
 *   items={[
 *     { id: 'contrat', label: 'Contrat signe', hint: 'PDF' },
 *     { id: 'devis', label: 'Devis de mars', hint: 'PDF' },
 *     { id: 'photos', label: 'Photos du chantier', hint: '48 fichiers' },
 *   ]}
 *   onSelect={ouvrirFiche}
 * />
 *
 * @example
 * // Mode controle, eventail large, teinte ardoise.
 * <Folder
 *   label="Archives 2025"
 *   items={pieces}
 *   open={ouvert}
 *   onOpenChange={setOuvert}
 *   colors={['--o-palette-slate-500', '--o-theme-surface']}
 *   spread={16}
 * />
 */
export function Folder({
  items,
  label,
  open,
  defaultOpen = false,
  onOpenChange,
  onSelect,
  colors = DEFAULT_TOKENS,
  width = 220,
  spread = 8,
  rise = 62,
  ...rest
}: FolderProps): ReactElement {
  const [interne, setInterne] = useState(defaultOpen)
  const panneau = useId()
  ensureFolderRules()

  const ouvert = open ?? interne
  const milieu = (items.length - 1) / 2

  const basculer = (): void => {
    if (open === undefined) setInterne(!ouvert)
    onOpenChange?.(!ouvert)
  }

  const { className, style } = mergePresentation({}, rest)

  return (
    <div
      {...rest}
      data-o-folder=""
      data-o-folder-ouvert={ouvert ? '' : undefined}
      className={className}
      style={
        {
          '--o-folder-carton': `var(${colors[0]})`,
          '--o-folder-fiche': `var(${colors[1]})`,
          '--o-folder-largeur': `${String(width)}px`,
          '--o-folder-ecart': `${String(spread)}deg`,
          // Une longueur, pas un pourcentage : un pourcentage de `translateY`
          // se rapporte a la hauteur de la fiche, qui n'a rien a voir avec la
          // hauteur du dossier. La sortie est donc calculee ici, sur la
          // hauteur reelle du carton.
          '--o-folder-monte': `${String(Math.round(((width * 4) / 5) * (rise / 100)))}px`,
          ...style,
        } as CSSProperties
      }
    >
      <span data-o-folder-dos="" aria-hidden="true" />

      <ul id={panneau} data-o-folder-fiches="" aria-hidden={ouvert ? undefined : true}>
        {items.map((item, index) => (
          <li
            key={item.id}
            // Le rang signe : negatif a gauche du centre, positif a droite.
            // C'est lui qui decide de l'inclinaison et du decalage.
            style={
              {
                '--o-folder-rang': index - milieu,
                '--o-folder-arc': `${String(Math.abs(index - milieu) * 12)}px`,
                zIndex: index + 1,
              } as CSSProperties
            }
          >
            <button
              type="button"
              data-o-folder-fiche=""
              tabIndex={ouvert ? 0 : -1}
              onClick={() => {
                onSelect?.(item.id)
              }}
            >
              <span>{item.label}</span>
              {item.hint === undefined ? null : (
                <span data-o-folder-indice="">{item.hint}</span>
              )}
            </button>
          </li>
        ))}
      </ul>

      <button
        type="button"
        data-o-folder-rabat=""
        aria-expanded={ouvert}
        aria-controls={panneau}
        onClick={basculer}
      >
        <span data-o-folder-nom="">{label}</span>
        <span data-o-folder-compte="">
          {items.length} {items.length > 1 ? 'fiches' : 'fiche'}
        </span>
      </button>
    </div>
  )
}

/**
 * Onglets de fonctionnalites, avec un visuel par onglet.
 *
 * ## Des onglets, pas des boutons
 *
 * Le motif est decrit par les pratiques ARIA, et il ne se resume pas a
 * `role="tab"`. Trois regles font la difference entre un jeu d'onglets et une
 * rangee de boutons qui y ressemble :
 *
 * 1. **Un seul arret de tabulation.** La liste entiere se traverse d'une
 *    pression, et les fleches circulent a l'interieur. Sinon, huit onglets
 *    coutent huit pressions avant d'atteindre le contenu.
 * 2. **Les fleches bouclent.** Arrive au dernier, la fleche droite revient au
 *    premier ; `Origine` et `Fin` vont aux extremites.
 * 3. **Le panneau est nomme par son onglet.** `aria-labelledby` relie les
 *    deux : sans lui, le contenu est annonce sans qu'on sache de quoi il parle.
 *
 * ## Le panneau inactif n'existe pas
 *
 * Il n'est pas cache par un style : il est retire du document. Un panneau
 * masque en CSS reste atteignable au clavier et lisible par la recherche dans
 * la page, ce qui envoie le focus dans du contenu invisible — le defaut le
 * plus courant de ce motif.
 *
 * ## Le changement se voit, sans qu'on le refasse a la main
 *
 * Le panneau porte une cle : React remonte l'element a chaque changement
 * d'onglet, et l'animation d'entree rejoue d'elle-meme. Sans cette cle, le
 * contenu changerait sans aucun signal, et l'oeil manquerait la moitie des
 * bascules.
 *
 * ## Le trait sous l'onglet actif
 *
 * Il glisse d'un onglet a l'autre parce que sa position est une variable, pas
 * un element deplace par mesure : chaque onglet declare sa part de la largeur,
 * et le trait s'y translate. Aucune mesure, donc aucune resynchronisation a
 * faire quand la police charge ou que la fenetre change de taille.
 *
 * @module
 */

import { mergePresentation, useMotionState, type Customisable } from '@odoro-cli/engine'
import {
  useId,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type ReactElement,
  type ReactNode,
} from 'react'

import { useInView } from '@/odoro/hooks/useInView'

/** Une fonctionnalite presentee. */
export interface Feature {
  /** Intitule de l'onglet. */
  readonly title: string
  /** Ce que la fonctionnalite fait. */
  readonly body: ReactNode
  /** Une precision sous l'intitule, dans l'onglet. */
  readonly hint?: string
}

/** Proprietes propres au composant. */
export interface FeatureTabsOwnProps {
  /** Les fonctionnalites, dans l'ordre des onglets. */
  features: readonly Feature[]
  /** Rend le visuel de l'onglet actif. */
  render: (index: number) => ReactNode
  /** Nom du jeu d'onglets, annonce aux technologies d'assistance. */
  label: string
  /** Onglet ouvert au premier rendu. @defaultValue 0 */
  initial?: number
}

/** Toutes les proprietes. */
export type FeatureTabsProps = Customisable<FeatureTabsOwnProps, 'section'>

/** Identifiant de la feuille injectee. */
const STYLE_ID = 'o-feature-tabs'

/** Pose les regles des onglets, une fois par document. */
function ensureTabsRules(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-ftabs-liste]{position:relative;display:flex;gap:0.25rem;overflow-x:auto}',
    // Le trait glisse par translation : sa largeur est une fraction du total,
    // son deplacement un multiple de cette fraction. Rien n'est mesure.
    '[data-o-ftabs-trait]{',
    'position:absolute;bottom:0;left:0;height:2px;',
    'width:calc(100% / var(--o-ftabs-nombre));',
    'transform:translateX(calc(100% * var(--o-ftabs-actif)));',
    'transition:transform var(--o-duration-base) var(--o-ease-standard)}',

    '[data-o-ftabs-panneau]{animation:o-ftabs-entree var(--o-duration-slower) var(--o-ease-entrance) both}',
    '@keyframes o-ftabs-entree{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}',

    '@media (prefers-reduced-motion:reduce){',
    '[data-o-ftabs-trait]{transition:none}',
    '[data-o-ftabs-panneau]{animation:none}}',
  ].join('')
  document.head.append(style)
}

/**
 * Onglets de fonctionnalites.
 *
 * @example
 * <FeatureTabs
 *   label="Ce que fait la CLI"
 *   features={[
 *     { title: 'Ajouter', body: <p>Les fichiers sont copies dans le projet.</p> },
 *     { title: 'Comparer', body: <p>Les retouches locales sont signalees.</p> },
 *   ]}
 *   render={(index) => <Capture etape={index} />}
 * />
 */
export function FeatureTabs({
  features,
  render,
  label,
  initial = 0,
  ...rest
}: FeatureTabsProps): ReactElement {
  const { reduced } = useMotionState()
  const { ref, vu } = useInView<HTMLElement>({ amount: 0.15 })
  const base = useId().replace(/[^a-zA-Z0-9]/g, '')
  const [actif, setActif] = useState(Math.min(Math.max(0, initial), features.length - 1))
  const boutons = useRef<(HTMLButtonElement | null)[]>([])

  ensureTabsRules()

  /** Deplace la selection et emmene le focus avec elle. */
  const aller = (index: number): void => {
    const cible = (index + features.length) % features.length
    setActif(cible)
    boutons.current[cible]?.focus()
  }

  const auClavier = (event: KeyboardEvent<HTMLDivElement>): void => {
    const touches: Readonly<Record<string, number>> = {
      ArrowRight: actif + 1,
      ArrowLeft: actif - 1,
      Home: 0,
      End: features.length - 1,
    }
    const cible = touches[event.key]
    if (cible === undefined) return
    // Les fleches pilotent la liste : les laisser au navigateur ferait defiler
    // la page pendant qu'on change d'onglet.
    event.preventDefault()
    aller(cible)
  }

  const { className, style } = mergePresentation(
    { className: 'o-flex o-flex-col o-gap-6' },
    rest,
  )

  return (
    <section
      {...rest}
      ref={ref}
      aria-label={label}
      className={className}
      style={
        {
          ...style,
          opacity: reduced || vu ? 1 : 0,
          transition: 'opacity var(--o-duration-slower) var(--o-ease-entrance)',
        } as CSSProperties
      }
    >
      <div
        role="tablist"
        aria-label={label}
        data-o-ftabs-liste=""
        onKeyDown={auClavier}
        style={
          {
            '--o-ftabs-nombre': String(features.length),
            '--o-ftabs-actif': String(actif),
            borderBottom: '1px solid var(--o-theme-line)',
          } as CSSProperties
        }
      >
        {features.map((feature, index) => (
          <button
            key={feature.title}
            ref={(element) => {
              boutons.current[index] = element
            }}
            type="button"
            role="tab"
            id={`${base}-onglet-${String(index)}`}
            aria-selected={index === actif}
            aria-controls={`${base}-panneau-${String(index)}`}
            // Un seul arret de tabulation pour toute la liste : les fleches
            // font le reste, et le contenu est a une pression de touche.
            tabIndex={index === actif ? 0 : -1}
            onClick={() => {
              setActif(index)
            }}
            className="o-flex-1 o-whitespace-nowrap o-px-4 o-py-3 o-text-left o-text-sm focus:o-ring"
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: index === actif ? 'var(--o-theme-fg)' : 'var(--o-theme-muted)',
              fontWeight: index === actif ? 600 : 400,
            }}
          >
            {feature.title}
            {feature.hint !== undefined && (
              <span
                className="o-block o-text-xs o-font-normal"
                style={{ color: 'var(--o-theme-muted)' }}
              >
                {feature.hint}
              </span>
            )}
          </button>
        ))}

        <span
          aria-hidden
          data-o-ftabs-trait=""
          style={{ backgroundColor: 'var(--o-palette-brand-500)' }}
        />
      </div>

      {/*
        Un seul panneau dans le document : celui des autres onglets n'est pas
        masque, il n'existe pas. La cle le fait remonter a chaque bascule, ce
        qui rejoue l'entree sans qu'aucun etat ne la declenche.
      */}
      <div
        key={actif}
        role="tabpanel"
        id={`${base}-panneau-${String(actif)}`}
        aria-labelledby={`${base}-onglet-${String(actif)}`}
        data-o-ftabs-panneau=""
        tabIndex={0}
        className="o-grid o-gap-6 md:o-grid-cols-2 o-items-center focus:o-ring"
      >
        <div
          className="o-text-sm o-leading-relaxed"
          style={{ color: 'var(--o-theme-fg)' }}
        >
          {features[actif]?.body}
        </div>
        <div
          className="o-overflow-hidden o-rounded-xl"
          style={{ border: '1px solid var(--o-theme-line)' }}
        >
          {render(actif)}
        </div>
      </div>
    </section>
  )
}

/**
 * Etapes numerotees : le trait se remplit derriere l'avancee, et le panneau
 * glisse du cote ou l'on va.
 *
 * ## Les fleches deplacent le focus, pas l'etape
 *
 * Ailleurs dans le registre — onglets a pastille, controle segmente — les
 * fleches deplacent le choix lui-meme, parce que changer d'option ne coute
 * rien. Ici, changer d'etape remplace le contenu de la page : parcourir un
 * formulaire en cinq etapes du clavier ferait alors defiler quatre panneaux
 * pour en regarder un. Les fleches promenent donc le focus, Entree valide.
 * C'est le motif d'un menu, pas celui d'un groupe de boutons radio.
 *
 * ## Le trait est un remplissage, pas une largeur
 *
 * Le segment entre deux etapes porte un enfant en `scaleX(0)` qui passe a 1
 * quand l'etape est franchie : une transformation, donc composee, la ou une
 * largeur animee redisposerait la barre a chaque image.
 *
 * ## Le panneau connait le sens de la marche
 *
 * Avancer et reculer ne se ressemblent pas : le panneau entre du cote d'ou
 * l'on vient. Le sens est deduit de l'ecart entre l'ancienne etape et la
 * nouvelle, et pose en attribut ; la clef React force la reprise de
 * l'animation, sans quoi un retour au meme panneau ne montrerait rien.
 *
 * ## Mouvement reduit
 *
 * Le trait est rempli d'un coup et le panneau parait sans glisser : l'etat
 * final, jamais l'etat de depart.
 *
 * @module
 */

import { mergePresentation, type Customisable } from '@odoro-cli/engine'
import {
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type ReactElement,
  type ReactNode,
} from 'react'

/** Une etape. */
export interface StepperStep {
  /** Identifiant, unique dans le parcours. */
  readonly id: string
  /** Libelle affiche sous le jeton. */
  readonly label: string
  /** Precision affichee en sourdine. */
  readonly hint?: string
}

/** Ce que l'on peut atteindre en cliquant. */
export type StepperReach = 'done' | 'all' | 'none'

/** Proprietes propres au composant. */
export interface StepperOwnProps {
  /** Les etapes, dans l'ordre du parcours. */
  steps: readonly StepperStep[]
  /** Nom du parcours pour les lecteurs d'ecran. */
  label: string
  /** Index de l'etape courante, en mode controle. */
  value?: number
  /** Index de l'etape courante au montage, en mode non controle. @defaultValue 0 */
  defaultValue?: number
  /** Appele avec l'index de l'etape choisie. */
  onChange?: (index: number) => void
  /** Contenu de l'etape courante, anime a chaque changement. */
  children?: ReactNode
  /** Sens de lecture du rail. @defaultValue 'horizontal' */
  orientation?: 'horizontal' | 'vertical'
  /**
   * Ce que l'on peut atteindre : les etapes franchies, toutes, ou aucune —
   * dans ce dernier cas la page seule decide.
   *
   * @defaultValue 'done'
   */
  reach?: StepperReach
}

/** Toutes les proprietes. */
export type StepperProps = Customisable<StepperOwnProps>

/** Identifiant de la feuille injectee. */
const STYLE_ID = 'o-stepper'

/** Pose le rail, les jetons, le trait et le panneau, une fois par document. */
function ensureStepperRules(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-stepper]{display:flex;flex-direction:column;gap:1.25rem}',
    '[data-o-step-rail]{display:flex;margin:0;padding:0;list-style:none}',
    '[data-o-step-rail] > li{display:flex;flex:1 1 0;min-width:0}',
    '[data-o-step-rail] > li:last-child{flex:none}',
    '[data-o-stepper][data-o-stepper-vertical] [data-o-step-rail]{flex-direction:column;gap:0}',
    '[data-o-stepper][data-o-stepper-vertical] [data-o-step-rail] > li{flex-direction:column;flex:none}',
    '[data-o-step]{',
    'display:flex;align-items:center;gap:0.6rem;flex:none;',
    'border:0;background:transparent;font:inherit;color:inherit;cursor:pointer;',
    'padding:0.25rem;border-radius:0.6rem;text-align:left;',
    '}',
    '[data-o-step][aria-disabled="true"]{cursor:default;opacity:0.45}',
    '[data-o-step]:focus-visible{outline:2px solid var(--o-step-accent);outline-offset:2px}',
    // Le jeton : creux tant que l'etape est devant, plein des qu'elle est atteinte.
    '[data-o-step-token]{',
    'display:grid;place-items:center;flex:none;width:2rem;height:2rem;border-radius:999px;',
    'border:1px solid var(--o-theme-line);background:var(--o-theme-surface);',
    'font-size:0.8125em;font-weight:600;font-variant-numeric:tabular-nums;',
    'transition:background-color var(--o-duration-base) linear,',
    'border-color var(--o-duration-base) linear,color var(--o-duration-base) linear,',
    'scale var(--o-duration-slow) var(--o-ease-emphasized);',
    '}',
    '[data-o-step][data-o-step-state="done"] [data-o-step-token]{',
    'background:var(--o-step-accent);border-color:var(--o-step-accent);color:var(--o-step-ink)}',
    '[data-o-step][data-o-step-state="current"] [data-o-step-token]{',
    'border-color:var(--o-step-accent);scale:1.12;',
    'box-shadow:0 0 0 4px color-mix(in oklab,var(--o-step-accent) 20%,transparent)}',
    '[data-o-step-text]{display:flex;flex-direction:column;min-width:0}',
    '[data-o-step-hint]{font-size:0.8125em;opacity:0.55}',
    // Le segment entre deux etapes, et son remplissage en transformation.
    '[data-o-step-line]{',
    'position:relative;flex:1 1 auto;align-self:center;height:2px;margin:0 0.5rem;',
    'border-radius:999px;background:var(--o-theme-line);overflow:hidden;',
    '}',
    '[data-o-stepper][data-o-stepper-vertical] [data-o-step-line]{',
    'width:2px;height:1.4rem;flex:none;align-self:flex-start;margin:0.25rem 0 0.25rem 1rem}',
    '[data-o-step-line] span{',
    'position:absolute;inset:0;background:var(--o-step-accent);',
    'transform:scaleX(0);transform-origin:left center;',
    'transition:transform var(--o-duration-slower) var(--o-ease-standard);',
    '}',
    '[data-o-stepper][data-o-stepper-vertical] [data-o-step-line] span{',
    'transform:scaleY(0);transform-origin:center top}',
    '[data-o-step-line][data-o-step-filled] span{transform:none}',
    // Le panneau : il entre du cote d'ou l'on vient.
    '[data-o-step-panel]{animation:o-step-next var(--o-duration-slow) var(--o-ease-standard) both}',
    '[data-o-step-panel][data-o-step-back]{animation-name:o-step-prev}',
    '@keyframes o-step-next{from{opacity:0;translate:24px 0}to{opacity:1;translate:none}}',
    '@keyframes o-step-prev{from{opacity:0;translate:-24px 0}to{opacity:1;translate:none}}',
    '@media (prefers-reduced-motion:reduce){',
    '[data-o-step-panel]{animation:none}',
    '[data-o-step-line] span,[data-o-step-token]{transition:none}',
    '}',
  ].join('')
  document.head.append(style)
}

/**
 * Parcours en etapes, avec un panneau par etape.
 *
 * @example
 * <Stepper
 *   label="Commande"
 *   steps={[
 *     { id: 'panier', label: 'Panier' },
 *     { id: 'livraison', label: 'Livraison' },
 *     { id: 'paiement', label: 'Paiement' },
 *   ]}
 * >
 *   <p>Contenu de l etape courante.</p>
 * </Stepper>
 *
 * @example
 * // Mode controle : la page avance quand son formulaire est valide.
 * <Stepper label="Inscription" steps={etapes} value={etape} onChange={setEtape} reach="none" />
 */
export function Stepper({
  steps,
  label,
  value,
  defaultValue = 0,
  onChange,
  children,
  orientation = 'horizontal',
  reach = 'done',
  ...rest
}: StepperProps): ReactElement {
  const railRef = useRef<HTMLOListElement | null>(null)
  const [internal, setInternal] = useState(defaultValue)
  const [focusIndex, setFocusIndex] = useState(defaultValue)
  ensureStepperRules()

  const current = Math.min(Math.max(0, value ?? internal), Math.max(0, steps.length - 1))

  // Le sens de la marche se deduit de l'ecart, et se retient en etat plutot
  // qu'en reference : ecrire une reference pendant le rendu donnerait deux
  // resultats differents selon que React le rejoue ou non.
  const [seen, setSeen] = useState(current)
  const [back, setBack] = useState(false)
  if (seen !== current) {
    setBack(current < seen)
    setSeen(current)
  }

  const reachable = (index: number): boolean =>
    reach === 'all' || (reach === 'done' && index <= current)

  const go = (index: number): void => {
    if (index === current || !reachable(index)) return
    if (value === undefined) setInternal(index)
    setFocusIndex(index)
    onChange?.(index)
  }

  /** Les fleches promenent le focus ; c'est Entree qui change d'etape. */
  const onKeyDown = (event: KeyboardEvent<HTMLOListElement>): void => {
    const last = steps.length - 1
    const forward = orientation === 'vertical' ? 'ArrowDown' : 'ArrowRight'
    const backward = orientation === 'vertical' ? 'ArrowUp' : 'ArrowLeft'
    const moves: Readonly<Record<string, number | undefined>> = {
      [forward]: focusIndex >= last ? 0 : focusIndex + 1,
      [backward]: focusIndex <= 0 ? last : focusIndex - 1,
      Home: 0,
      End: last,
    }
    const target = moves[event.key]
    if (target === undefined) return
    event.preventDefault()
    setFocusIndex(target)
    railRef.current?.querySelectorAll<HTMLButtonElement>('[data-o-step]')[target]?.focus()
  }

  const { className, style } = mergePresentation({}, rest)

  return (
    <div
      {...rest}
      data-o-stepper=""
      data-o-stepper-vertical={orientation === 'vertical' ? '' : undefined}
      className={className}
      style={
        {
          '--o-step-accent': 'var(--o-palette-brand-500)',
          '--o-step-ink': 'var(--o-palette-zinc-50)',
          ...style,
        } as CSSProperties
      }
    >
      <ol ref={railRef} data-o-step-rail="" aria-label={label} onKeyDown={onKeyDown}>
        {steps.map((step, index) => {
          const state = index === current ? 'current' : index < current ? 'done' : 'todo'
          return (
            <li key={step.id}>
              <button
                type="button"
                data-o-step=""
                data-o-step-state={state}
                aria-current={index === current ? 'step' : undefined}
                aria-disabled={reachable(index) ? undefined : 'true'}
                tabIndex={index === focusIndex ? 0 : -1}
                onClick={() => {
                  go(index)
                }}
              >
                <span data-o-step-token="" aria-hidden="true">
                  {state === 'done' ? '✓' : index + 1}
                </span>
                <span data-o-step-text="">
                  <span>{step.label}</span>
                  {step.hint !== undefined && (
                    <span data-o-step-hint="">{step.hint}</span>
                  )}
                </span>
              </button>
              {index < steps.length - 1 && (
                <span
                  data-o-step-line=""
                  data-o-step-filled={index < current ? '' : undefined}
                  aria-hidden="true"
                >
                  <span />
                </span>
              )}
            </li>
          )
        })}
      </ol>
      {children !== undefined && (
        <div
          key={current}
          data-o-step-panel=""
          data-o-step-back={back ? '' : undefined}
          role="group"
          aria-label={steps[current]?.label ?? label}
        >
          {children}
        </div>
      )}
    </div>
  )
}

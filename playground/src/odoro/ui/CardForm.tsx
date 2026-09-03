/**
 * Formulaire de carte, avec un aperçu qui se retourne.
 *
 * ## À lire avant de le brancher sur un paiement réel
 *
 * Ce composant rend des champs ordinaires. Les numéros saisis passent donc par
 * le document et par le JavaScript de la page, et cela a une conséquence qui ne
 * se voit pas dans le code : **l'application entre dans le périmètre complet de
 * PCI-DSS**. Un formulaire hébergé par le prestataire de paiement — un champ
 * dans une iframe qui rend un jeton — laisse au contraire l'application hors du
 * périmètre, parce que les données de carte ne la traversent jamais.
 *
 * L'écart entre les deux se compte en audits, pas en lignes de code.
 *
 * Ce composant a donc sa place pour un aperçu, une maquette, un formulaire de
 * démonstration, ou une saisie que l'on remet immédiatement à un client de
 * tokenisation. Il n'en a aucune comme point d'entrée d'un vrai encaissement.
 * `onSubmit` rend l'état et sa validité ; il n'envoie rien, et c'est voulu.
 *
 * ## La validation refuse ce qui est faux, pas ce qui est incomplet
 *
 * L'implémentation d'origine annonçait un contrôle de Luhn dans ses
 * commentaires et n'en faisait aucun : elle se contentait de compter treize
 * chiffres. Or Luhn est ce qui distingue une faute de frappe d'un numéro
 * plausible, et c'est tout l'intérêt d'un contrôle côté client — signaler la
 * coquille avant l'aller-retour réseau. Il est ici, et il est court.
 *
 * ## Ce que le retournement ne fait pas
 *
 * Il ne cache rien. La face arrière est masquée par `backface-visibility`, ce
 * qui la retire de la peinture mais **pas** du document : son contenu reste
 * lisible par un lecteur d'écran et atteignable au clavier. C'est pour cela que
 * l'aperçu entier est `aria-hidden` — les champs du formulaire portent déjà
 * l'information, et l'annoncer deux fois n'aide personne.
 *
 * @module
 */

import { mergePresentation, type Customisable } from '@odoro-cli/engine'
import { useId, useMemo, useState, type FormEvent, type ReactElement } from 'react'

/** Ce que le formulaire tient. */
export interface CardFormState {
  /** Chiffres du numero, sans espaces. */
  readonly number: string
  /** Nom du porteur, en majuscules. */
  readonly holder: string
  /** Mois d'expiration, de `01` a `12`. */
  readonly month: string
  /** Annee d'expiration, sur quatre chiffres. */
  readonly year: string
  /** Code de verification, trois ou quatre chiffres. */
  readonly cvv: string
}

/** Ce que la validation dit de chaque champ. */
export interface CardFormValidity {
  /** Longueur plausible **et** somme de Luhn correcte. */
  readonly number: boolean
  readonly holder: boolean
  readonly expiry: boolean
  readonly cvv: boolean
  /** Vrai si les quatre le sont. */
  readonly all: boolean
}

/** Proprietes propres au composant. */
export interface CardFormOwnProps {
  /** Valeurs de depart. */
  defaultValue?: Partial<CardFormState>
  /** Masque les chiffres du milieu sur l'apercu. @defaultValue true */
  maskMiddle?: boolean
  /** Affiche le bouton d'envoi. @defaultValue true */
  showSubmit?: boolean
  /** Libelle du bouton d'envoi. */
  submitLabel?: string
  /** Tokens des deux halos de la carte. */
  colors?: readonly [string, string]
  /** Appele a chaque frappe. */
  onValueChange?: (state: CardFormState, validity: CardFormValidity) => void
  /** Appele a l'envoi. Ne transmet rien : c'est a l'application de le faire. */
  onSubmit?: (state: CardFormState, validity: CardFormValidity) => void
}

/** Toutes les proprietes. */
export type CardFormProps = Customisable<CardFormOwnProps, 'section'>

/** Tokens employes par defaut. */
const DEFAULT_TOKENS = ['--o-palette-fuchsia-500', '--o-palette-brand-500'] as const

/** Identifiant de la feuille injectee. */
const STYLE_ID = 'o-card-form'

/** Nombre de cases affichees sur l'apercu. */
const SLOTS = 16

/**
 * Somme de Luhn.
 *
 * ## Le principe
 *
 * En partant de la droite, un chiffre sur deux est double ; si le double
 * depasse neuf, on lui retire neuf — ce qui revient a additionner ses deux
 * chiffres. La somme de tous les chiffres ainsi obtenus doit etre un multiple
 * de dix.
 *
 * Le controle attrape toute erreur d'un seul chiffre et presque toutes les
 * transpositions de deux chiffres voisins, c'est-a-dire les deux fautes de
 * frappe reelles. Il ne dit rien de l'existence du compte : ce n'est pas son
 * role, et aucun controle local ne peut le faire.
 *
 * @param digits Chiffres du numero, sans espaces.
 *
 * @example
 * luhn('4242424242424242') // true
 */
export function luhn(digits: string): boolean {
  if (!/^\d+$/.test(digits)) return false

  let sum = 0
  let double = false

  for (let index = digits.length - 1; index >= 0; index -= 1) {
    let value = digits.charCodeAt(index) - 48
    if (double) {
      value *= 2
      if (value > 9) value -= 9
    }
    sum += value
    double = !double
  }

  return sum % 10 === 0
}

/** Ne retient que les chiffres, et borne la longueur. */
function digitsOf(value: string, max: number): string {
  return value.replace(/\D/g, '').slice(0, max)
}

/** Groupe le numero par quatre, pour la saisie. */
function grouped(digits: string): string {
  return digits.replace(/(\d{4})(?=\d)/g, '$1 ')
}

/** Pose les regles du formulaire, une fois par document. */
function ensureCardRules(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-card]{position:relative;transform-style:preserve-3d;',
    'transition:transform var(--o-duration-slowest) var(--o-ease-standard)}',
    '[data-o-card="back"]{transform:rotateY(180deg)}',

    '[data-o-card-face]{backface-visibility:hidden;-webkit-backface-visibility:hidden;',
    'position:relative;overflow:hidden}',
    '[data-o-card-face="back"]{position:absolute;inset:0;transform:rotateY(180deg)}',

    // Les deux halos, flous, qui donnent sa profondeur a la carte.
    '[data-o-card-face]::before,[data-o-card-face]::after{content:"";position:absolute;',
    'border-radius:100%;height:300px;width:300px;filter:blur(13px);pointer-events:none}',
    '[data-o-card-face]::before{border:16px solid var(--o-card-ring-a);left:-17%;top:-45px}',
    '[data-o-card-face]::after{border:16px solid var(--o-card-ring-b);left:-200px;top:55%}',

    // Chaque case du numero contient deux lignes ; elle glisse d'une hauteur
    // pour reveler le chiffre. C'est ce qui donne l'impression que le chiffre
    // tombe en place au lieu d'apparaitre.
    '[data-o-card-slot]{display:inline-flex;height:2rem;overflow:hidden}',
    '[data-o-card-slot]>span{display:flex;flex-direction:column;height:2rem;',
    'line-height:2rem;transition:transform var(--o-duration-base) var(--o-ease-standard)}',
    '[data-o-card-slot="filled"]>span{transform:translateY(-2rem)}',
    '[data-o-card-slot]>span>span{height:2rem;display:block}',

    '@media (prefers-reduced-motion:reduce){',
    '[data-o-card],[data-o-card-slot]>span{transition:none}}',
  ].join('')
  document.head.append(style)
}

/**
 * Formulaire de carte avec apercu.
 *
 * @example
 * <CardForm onSubmit={(etat, validite) => tokeniser(etat)} />
 *
 * @example
 * // Sans bouton : l'envoi est porte par le formulaire qui l'entoure.
 * <CardForm showSubmit={false} onValueChange={setEtat} />
 */
export function CardForm({
  defaultValue,
  maskMiddle = true,
  showSubmit = true,
  submitLabel = 'Valider',
  colors = DEFAULT_TOKENS,
  onValueChange,
  onSubmit,
  ...rest
}: CardFormProps): ReactElement {
  const ids = useId()
  const [state, setState] = useState<CardFormState>(() => ({
    number: digitsOf(defaultValue?.number ?? '', 19),
    holder: (defaultValue?.holder ?? '').toUpperCase(),
    month: defaultValue?.month ?? '',
    year: defaultValue?.year ?? '',
    cvv: digitsOf(defaultValue?.cvv ?? '', 4),
  }))
  const [focused, setFocused] = useState<'cvv' | 'other' | null>(null)

  ensureCardRules()

  const years = useMemo(() => {
    const first = new Date().getFullYear()
    return Array.from({ length: 10 }, (_, index) => String(first + index))
  }, [])

  const validity = useMemo<CardFormValidity>(() => {
    const number = state.number.length >= 13 && luhn(state.number)
    const holder = state.holder.trim().length >= 2

    // L'expiration se juge d'un bloc : un mois sans annee ne veut rien dire, et
    // un mois passe de l'annee courante est expire alors que chaque champ,
    // pris seul, semble correct.
    const now = new Date()
    const month = Number(state.month)
    const year = Number(state.year)
    const expiry =
      month >= 1 &&
      month <= 12 &&
      year >= now.getFullYear() &&
      (year > now.getFullYear() || month >= now.getMonth() + 1)

    const cvv = /^\d{3,4}$/.test(state.cvv)

    return { number, holder, expiry, cvv, all: number && holder && expiry && cvv }
  }, [state])

  /** Ecrit un champ, et previent l'appelant. */
  const write = (patch: Partial<CardFormState>): void => {
    const next = { ...state, ...patch }
    setState(next)
    // La validite est recalculee au rendu suivant ; l'appelant recoit celle du
    // rendu courant, ce qui suffit pour un apercu et evite de la dupliquer.
    onValueChange?.(next, validity)
  }

  const submit = (event: FormEvent): void => {
    event.preventDefault()
    onSubmit?.(state, validity)
  }

  // Les cases de l'apercu : seize, remplies par la gauche.
  const slots = Array.from({ length: SLOTS }, (_, index) => {
    const digit = state.number[index]
    if (digit === undefined) return { text: '#', filled: false }
    const hidden = maskMiddle && index >= 4 && index <= 11
    return { text: hidden ? '•' : digit, filled: true }
  })

  const { className, style } = mergePresentation(
    { className: 'o-grid o-gap-6 md:o-grid-cols-2' },
    rest,
  )

  return (
    <section {...rest} className={className} style={style}>
      {/* L'apercu est decoratif : les champs portent deja l'information, et la
          face arriere reste dans le document malgre le retournement. */}
      <div
        aria-hidden
        className="o-mx-auto o-w-full o-max-w-md"
        style={{ perspective: 1000 }}
      >
        <div
          data-o-card={focused === 'cvv' ? 'back' : 'front'}
          style={
            {
              ['--o-card-ring-a' as string]: `var(${colors[0]})`,
              ['--o-card-ring-b' as string]: `var(${colors[1]})`,
            } as Record<string, string>
          }
        >
          <div
            data-o-card-face="front"
            className="o-flex o-h-56 o-flex-col o-justify-between o-rounded-2xl o-bg-gradient-to-br o-from-zinc-700 o-to-zinc-950 o-p-6 o-text-zinc-50 o-shadow-xl"
          >
            <p className="o-relative o-font-semibold">Carte</p>

            <p className="o-relative o-flex o-text-2xl">
              {slots.map((slot, index) => (
                <span
                  key={index}
                  data-o-card-slot={slot.filled ? 'filled' : 'empty'}
                  className={index % 4 === 3 ? 'o-mr-2' : ''}
                >
                  <span>
                    <span>#</span>
                    <span>{slot.text}</span>
                  </span>
                </span>
              ))}
            </p>

            <span className="o-relative o-flex o-items-end o-justify-between o-gap-4">
              <span className="o-flex o-flex-col">
                <span className="o-text-xs o-font-semibold o-uppercase o-text-zinc-400">
                  Porteur
                </span>
                <span className="o-uppercase">{state.holder || 'NOM SUR LA CARTE'}</span>
              </span>
              <span className="o-flex o-flex-col">
                <span className="o-text-xs o-font-semibold o-uppercase o-text-zinc-400">
                  Expire
                </span>
                <span>
                  {state.month || 'MM'}/{state.year ? state.year.slice(-2) : 'AA'}
                </span>
              </span>
            </span>
          </div>

          <div
            data-o-card-face="back"
            className="o-flex o-h-56 o-flex-col o-rounded-2xl o-bg-gradient-to-br o-from-zinc-700 o-to-zinc-950 o-pt-6 o-text-zinc-50 o-shadow-xl"
          >
            <span className="o-relative o-h-10 o-w-full o-bg-zinc-800" />
            <span className="o-relative o-mt-6 o-flex o-flex-col o-items-end o-gap-1 o-px-8">
              <span className="o-text-xs o-font-semibold o-uppercase">Code</span>
              <span className="o-flex o-h-11 o-w-full o-items-center o-justify-end o-rounded-lg o-bg-zinc-50 o-px-3 o-text-2xl o-text-zinc-950">
                {'•'.repeat(state.cvv.length)}
              </span>
            </span>
          </div>
        </div>
      </div>

      <form
        onSubmit={submit}
        noValidate
        className="o-grid o-gap-3 o-rounded-xl o-border-w-1 o-border-zinc-200 o-p-6 dark:o-border-zinc-800"
      >
        <div>
          <label htmlFor={`${ids}-number`} className="o-mb-1 o-block o-font-medium">
            Numero de carte
          </label>
          <input
            id={`${ids}-number`}
            inputMode="numeric"
            autoComplete="cc-number"
            placeholder="1234 5678 9012 3456"
            value={grouped(state.number)}
            onChange={(event) => write({ number: digitsOf(event.target.value, 19) })}
            onFocus={() => setFocused('other')}
            onBlur={() => setFocused(null)}
            aria-invalid={state.number.length >= 13 && !validity.number}
            aria-describedby={validity.number ? undefined : `${ids}-number-error`}
            className="o-h-12 o-w-full o-rounded-lg o-border-w-1 o-border-zinc-300 o-bg-transparent o-px-4 focus:o-border-zinc-500 focus:o-outline-none dark:o-border-zinc-700"
          />
          {/* L'erreur n'apparait qu'une fois le numero assez long : la signaler
              a la premiere frappe reprocherait a l'utilisateur de ne pas avoir
              fini de taper. */}
          <p
            id={`${ids}-number-error`}
            className={
              state.number.length >= 13 && !validity.number
                ? 'o-mt-1 o-text-xs o-text-red-600 dark:o-text-red-400'
                : 'o-sr-only'
            }
          >
            {state.number.length >= 13 && !validity.number
              ? 'Ce numero comporte une erreur de saisie.'
              : ''}
          </p>
        </div>

        <div>
          <label htmlFor={`${ids}-holder`} className="o-mb-1 o-block o-font-medium">
            Nom du porteur
          </label>
          <input
            id={`${ids}-holder`}
            type="text"
            autoComplete="cc-name"
            placeholder="JEANNE MARTIN"
            value={state.holder}
            onChange={(event) => write({ holder: event.target.value.toUpperCase() })}
            onFocus={() => setFocused('other')}
            onBlur={() => setFocused(null)}
            aria-invalid={!validity.holder}
            className="o-h-12 o-w-full o-rounded-lg o-border-w-1 o-border-zinc-300 o-bg-transparent o-px-4 focus:o-border-zinc-500 focus:o-outline-none dark:o-border-zinc-700"
          />
        </div>

        <div className="o-grid o-gap-4 sm:o-grid-cols-3">
          <div className="sm:o-col-span-2">
            <span className="o-mb-1 o-block o-font-medium">Expiration</span>
            <div className="o-grid o-grid-cols-2 o-gap-3">
              <label className="o-sr-only" htmlFor={`${ids}-month`}>
                Mois d expiration
              </label>
              <select
                id={`${ids}-month`}
                value={state.month}
                onChange={(event) => write({ month: event.target.value })}
                onFocus={() => setFocused('other')}
                onBlur={() => setFocused(null)}
                aria-invalid={!validity.expiry}
                className="o-h-12 o-w-full o-rounded-lg o-border-w-1 o-border-zinc-300 o-bg-transparent o-px-4 focus:o-border-zinc-500 focus:o-outline-none dark:o-border-zinc-700"
              >
                <option value="">Mois</option>
                {Array.from({ length: 12 }, (_, index) =>
                  String(index + 1).padStart(2, '0'),
                ).map((month) => (
                  <option key={month} value={month}>
                    {month}
                  </option>
                ))}
              </select>

              <label className="o-sr-only" htmlFor={`${ids}-year`}>
                Annee d expiration
              </label>
              <select
                id={`${ids}-year`}
                value={state.year}
                onChange={(event) => write({ year: event.target.value })}
                onFocus={() => setFocused('other')}
                onBlur={() => setFocused(null)}
                aria-invalid={!validity.expiry}
                className="o-h-12 o-w-full o-rounded-lg o-border-w-1 o-border-zinc-300 o-bg-transparent o-px-4 focus:o-border-zinc-500 focus:o-outline-none dark:o-border-zinc-700"
              >
                <option value="">Annee</option>
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor={`${ids}-cvv`} className="o-mb-1 o-block o-font-medium">
              Code
            </label>
            <input
              id={`${ids}-cvv`}
              inputMode="numeric"
              autoComplete="cc-csc"
              placeholder="123"
              value={state.cvv}
              onChange={(event) => write({ cvv: digitsOf(event.target.value, 4) })}
              // Le focus sur ce champ retourne la carte : c'est la seule
              // raison pour laquelle l'etat de focus existe.
              onFocus={() => setFocused('cvv')}
              onBlur={() => setFocused(null)}
              aria-invalid={!validity.cvv}
              className="o-h-12 o-w-full o-rounded-lg o-border-w-1 o-border-zinc-300 o-bg-transparent o-px-4 focus:o-border-zinc-500 focus:o-outline-none dark:o-border-zinc-700"
            />
          </div>
        </div>

        {showSubmit ? (
          <button
            type="submit"
            disabled={!validity.all}
            className="o-mt-2 o-h-12 o-rounded-lg o-bg-zinc-950 o-font-semibold o-text-zinc-50 disabled:o-opacity-50 dark:o-bg-zinc-50 dark:o-text-zinc-950"
          >
            {validity.all ? submitLabel : 'Completez les champs'}
          </button>
        ) : null}
      </form>
    </section>
  )
}

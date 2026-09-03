/**
 * Parcours de connexion en trois ecrans : adresse, code, confirmation.
 *
 * ## Ce que ce composant n'est pas
 *
 * Ce n'est pas un client d'authentification. Il ne connait ni jeton, ni
 * session, ni fournisseur : il enchaine trois ecrans et previent l'application
 * a chaque etape. Ce qui part sur le reseau, ce qui revient, et ce qu'il faut
 * en faire regarde l'application — qui posera son message d'erreur par `error`
 * et bloquera l'envoi par `pending`.
 *
 * La frontiere est volontaire. Un composant qui appellerait lui-meme une API
 * imposerait sa forme de reponse, ses codes d'erreur et sa gestion de session
 * a tout projet qui l'installe, alors qu'il est copie precisement pour etre
 * possede.
 *
 * ## Pourquoi l'entree seule est animee
 *
 * L'implementation d'origine faisait sortir un ecran avant d'entrer le
 * suivant, avec une machine de presence. Il n'y en a pas ici : le registre ne
 * depend que du moteur, et la librairie qui porte `usePresence` est facultative
 * pour un projet d'accueil.
 *
 * L'ecran sortant est donc retire, et l'entrant anime. La perte est reelle et
 * elle est petite ; la dependance evitee, elle, aurait ete portee par tous.
 *
 * ## Le champ de code
 *
 * Six champs d'un caractere sont un piege d'accessibilite classique : sans
 * etiquette, un lecteur d'ecran annonce six zones anonymes. Chacun porte donc
 * la sienne, le premier declare `one-time-code` pour que le remplissage
 * automatique du systeme fonctionne, et un collage se repartit sur toute la
 * rangee — le cas le plus courant, et celui qu'on oublie.
 *
 * @module
 */

import { mergePresentation, useMotionState, type Customisable } from '@odoro-cli/engine'
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ClipboardEvent,
  type CSSProperties,
  type FormEvent,
  type KeyboardEvent,
  type ReactElement,
  type ReactNode,
} from 'react'

import { DotMatrix } from '@/odoro/background/DotMatrix'

/** Etape courante du parcours. */
export type SignInStep = 'email' | 'code' | 'success'

/** Proprietes propres au composant. */
export interface SignInOwnProps {
  /** Nombre de caracteres du code. @defaultValue 6 */
  codeLength?: number
  /** Titre du premier ecran. */
  title?: ReactNode
  /** Sous-titre du premier ecran. */
  subtitle?: ReactNode
  /**
   * Fournisseurs externes, rendus au-dessus du separateur.
   *
   * C'est un emplacement plutot qu'une liste de props : un bouton de
   * fournisseur porte une marque, un libelle et un appel qui n'appartiennent
   * qu'a l'application.
   */
  providers?: ReactNode
  /** Mentions legales, rendues sous le formulaire. */
  legal?: ReactNode
  /** Message d'erreur affiche sous le champ actif. */
  error?: string
  /** Suspend les envois pendant un appel en cours. @defaultValue false */
  pending?: boolean
  /** Appele quand l'adresse est soumise. */
  onEmailSubmit?: (email: string) => void
  /** Appele quand le code est complet. */
  onCodeSubmit?: (code: string) => void
  /** Appele quand un nouvel envoi est demande. */
  onResend?: () => void
  /** Appele a chaque changement d'ecran. */
  onStepChange?: (step: SignInStep) => void
  /** Appele depuis le dernier ecran. */
  onDone?: () => void
}

/** Toutes les proprietes. */
export type SignInProps = Customisable<SignInOwnProps, 'section'>

/** Identifiant de la feuille injectee. */
const STYLE_ID = 'o-sign-in'

/**
 * Pose l'animation d'entree, une fois par document.
 *
 * Le mouvement reduit est traite dans la feuille plutot qu'en JavaScript : une
 * requete media n'a pas besoin d'etre reevaluee, et la regle reste vraie meme
 * si le reglage change apres le montage.
 */
function ensureSignInRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '@keyframes o-sign-in-enter{from{opacity:0;transform:translate3d(var(--o-sign-in-from),0,0)}',
    'to{opacity:1;transform:none}}',
    '[data-o-sign-in-panel]{animation:o-sign-in-enter var(--o-duration-slow) var(--o-ease-entrance) both}',
    '@media (prefers-reduced-motion:reduce){[data-o-sign-in-panel]{animation:none}}',
  ].join('')
  document.head.append(style)
}

/** Ne retient que les chiffres d'une chaine collee. */
function digitsOf(value: string): string {
  return value.replace(/\D/g, '')
}

/**
 * Parcours de connexion.
 *
 * @example
 * <SignIn
 *   onEmailSubmit={(adresse) => envoyerCode(adresse)}
 *   onCodeSubmit={(code) => verifier(code)}
 *   error={probleme}
 *   pending={enCours}
 * />
 *
 * @example
 * // Les fournisseurs et les mentions sont des emplacements : ils appartiennent
 * // a l'application, avec son routeur et ses marques.
 * <SignIn
 *   providers={<button onClick={google}>Continuer avec Google</button>}
 *   legal={<Link to="/conditions">Conditions</Link>}
 * />
 */
export function SignIn({
  codeLength = 6,
  title = 'Content de vous revoir',
  subtitle = 'Entrez votre adresse pour recevoir un code.',
  providers,
  legal,
  error,
  pending = false,
  onEmailSubmit,
  onCodeSubmit,
  onResend,
  onStepChange,
  onDone,
  ...rest
}: SignInProps): ReactElement {
  const { reduced } = useMotionState()
  const [step, setStep] = useState<SignInStep>('email')
  const [email, setEmail] = useState('')
  const [code, setCode] = useState<readonly string[]>(() =>
    Array.from({ length: codeLength }, () => ''),
  )
  const inputs = useRef<(HTMLInputElement | null)[]>([])

  ensureSignInRule()

  const goTo = useCallback(
    (next: SignInStep): void => {
      setStep(next)
      onStepChange?.(next)
    },
    [onStepChange],
  )

  // Le premier champ du code recoit le focus a l'arrivee sur l'ecran. Sans
  // cela, il faut viser une case de huit pixels de large pour commencer a
  // taper — et au clavier seul, tabuler jusqu'a elle.
  useEffect(() => {
    if (step !== 'code') return
    inputs.current[0]?.focus()
  }, [step])

  const submitEmail = (event: FormEvent): void => {
    event.preventDefault()
    if (pending || email.trim() === '') return
    onEmailSubmit?.(email)
    goTo('code')
  }

  /** Ecrit la rangee, et signale le code des qu'il est complet. */
  const commit = (next: readonly string[]): void => {
    setCode(next)
    if (next.some((digit) => digit === '')) return
    onCodeSubmit?.(next.join(''))
    // La trame s'inverse pendant que l'ecran final arrive : le retour dure le
    // temps de la propagation, pas celui d'un delai arbitraire.
    goTo('success')
  }

  const changeAt = (index: number, value: string): void => {
    const digit = digitsOf(value).slice(-1)
    const next = [...code]
    next[index] = digit
    if (digit !== '' && index < codeLength - 1) inputs.current[index + 1]?.focus()
    commit(next)
  }

  const keyAt = (index: number, event: KeyboardEvent<HTMLInputElement>): void => {
    if (event.key === 'Backspace' && code[index] === '' && index > 0) {
      inputs.current[index - 1]?.focus()
      return
    }
    if (event.key === 'ArrowLeft' && index > 0) {
      event.preventDefault()
      inputs.current[index - 1]?.focus()
      return
    }
    if (event.key === 'ArrowRight' && index < codeLength - 1) {
      event.preventDefault()
      inputs.current[index + 1]?.focus()
    }
  }

  /**
   * Un code arrive presque toujours par collage, depuis un courriel ou une
   * notification. Colle dans la premiere case, il n'y laisserait qu'un
   * caractere : la rangee entiere doit l'absorber.
   */
  const pasteAt = (index: number, event: ClipboardEvent<HTMLInputElement>): void => {
    const pasted = digitsOf(event.clipboardData.getData('text'))
    if (pasted === '') return
    event.preventDefault()

    const next = [...code]
    for (
      let offset = 0;
      offset < pasted.length && index + offset < codeLength;
      offset += 1
    ) {
      next[index + offset] = pasted[offset] ?? ''
    }
    const landing = Math.min(index + pasted.length, codeLength - 1)
    inputs.current[landing]?.focus()
    commit(next)
  }

  const back = (): void => {
    setCode(Array.from({ length: codeLength }, () => ''))
    goTo('email')
  }

  const { className, style } = mergePresentation(
    { className: 'o-relative o-flex o-min-h-screen o-flex-col o-bg-zinc-950' },
    rest,
  )

  // L'ecran entrant glisse depuis le cote d'ou il vient : en arriere pour le
  // retour, en avant pour la suite. Sous mouvement reduit, il n'y a pas de
  // cote — la feuille neutralise l'animation, et la variable ne sert plus.
  const from = step === 'email' ? '-2rem' : '2rem'

  return (
    <section {...rest} className={className} style={style}>
      <DotMatrix
        className="o-absolute o-inset-0"
        reverse={step === 'success'}
        speed={step === 'success' ? 0.9 : 0.6}
      />

      {/* Assombrissement des bords : le texte se lit sur la trame sans qu'elle
          disparaisse. */}
      <div
        aria-hidden
        className="o-absolute o-inset-0 o-bg-gradient-to-b o-from-zinc-950 o-via-transparent o-to-zinc-950 o-pointer-events-none"
      />

      <div className="o-relative o-flex o-flex-1 o-items-center o-justify-center o-px-6 o-py-16">
        <div
          key={step}
          data-o-sign-in-panel
          style={{ '--o-sign-in-from': reduced ? '0' : from } as CSSProperties}
          className="o-w-full o-max-w-sm o-text-center"
        >
          {step === 'email' ? (
            <div className="o-flex o-flex-col o-gap-6">
              <div className="o-flex o-flex-col o-gap-2">
                <h1 className="o-text-4xl o-font-bold o-tracking-tight o-text-zinc-50">
                  {title}
                </h1>
                <p className="o-text-base o-text-zinc-400">{subtitle}</p>
              </div>

              {providers === undefined ? null : (
                <div className="o-flex o-flex-col o-gap-3">
                  {providers}
                  <div className="o-flex o-items-center o-gap-4">
                    <span aria-hidden className="o-h-px o-flex-1 o-bg-zinc-800" />
                    <span className="o-text-sm o-text-zinc-500">ou</span>
                    <span aria-hidden className="o-h-px o-flex-1 o-bg-zinc-800" />
                  </div>
                </div>
              )}

              <form onSubmit={submitEmail} className="o-flex o-flex-col o-gap-3">
                <label htmlFor="o-sign-in-email" className="o-sr-only">
                  Adresse electronique
                </label>
                <div className="o-relative">
                  <input
                    id="o-sign-in-email"
                    type="email"
                    name="email"
                    autoComplete="email"
                    required
                    disabled={pending}
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    aria-invalid={error !== undefined}
                    aria-describedby={error === undefined ? undefined : 'o-sign-in-error'}
                    placeholder="vous@exemple.fr"
                    className="o-w-full o-rounded-full o-border-w-1 o-border-zinc-800 o-bg-transparent o-py-3 o-pl-5 o-pr-14 o-text-center o-text-zinc-50 focus:o-border-zinc-500 focus:o-outline-none"
                  />
                  <button
                    type="submit"
                    disabled={pending}
                    className="o-absolute o-right-1.5 o-top-1.5 o-flex o-h-9 o-w-9 o-items-center o-justify-center o-rounded-full o-bg-zinc-800 o-text-zinc-50 hover:o-bg-zinc-700 focus:o-outline-none disabled:o-opacity-50"
                  >
                    <span className="o-sr-only">Continuer</span>
                    <span aria-hidden>&rarr;</span>
                  </button>
                </div>
              </form>

              {legal === undefined ? null : (
                <p className="o-text-xs o-text-zinc-500">{legal}</p>
              )}
            </div>
          ) : null}

          {step === 'code' ? (
            <div className="o-flex o-flex-col o-gap-6">
              <div className="o-flex o-flex-col o-gap-2">
                <h1 className="o-text-4xl o-font-bold o-tracking-tight o-text-zinc-50">
                  Un code vous attend
                </h1>
                <p className="o-text-base o-text-zinc-400">
                  Envoye a <span className="o-text-zinc-200">{email}</span>.
                </p>
              </div>

              <div
                role="group"
                aria-label={`Code de connexion, ${String(codeLength)} chiffres`}
                className="o-flex o-items-center o-justify-center o-gap-2 o-rounded-full o-border-w-1 o-border-zinc-800 o-px-5 o-py-4"
              >
                {code.map((digit, index) => (
                  <input
                    // Les cases n'ont pas d'identite propre : leur position est
                    // leur seule cle, et la rangee ne se reordonne jamais.
                    key={index}
                    ref={(element) => {
                      inputs.current[index] = element
                    }}
                    type="text"
                    inputMode="numeric"
                    autoComplete={index === 0 ? 'one-time-code' : 'off'}
                    maxLength={1}
                    disabled={pending}
                    value={digit}
                    aria-label={`Chiffre ${String(index + 1)}`}
                    onChange={(event) => changeAt(index, event.target.value)}
                    onKeyDown={(event) => keyAt(index, event)}
                    onPaste={(event) => pasteAt(index, event)}
                    className="o-w-8 o-bg-transparent o-text-center o-text-xl o-text-zinc-50 focus:o-outline-none"
                  />
                ))}
              </div>

              <div className="o-flex o-gap-3">
                <button
                  type="button"
                  onClick={back}
                  className="o-rounded-full o-border-w-1 o-border-zinc-800 o-px-6 o-py-3 o-text-zinc-300 hover:o-text-zinc-50"
                >
                  Retour
                </button>
                <button
                  type="button"
                  onClick={onResend}
                  disabled={pending}
                  className="o-flex-1 o-rounded-full o-bg-zinc-50 o-px-6 o-py-3 o-font-medium o-text-zinc-950 hover:o-bg-zinc-200 disabled:o-opacity-50"
                >
                  Renvoyer le code
                </button>
              </div>

              {legal === undefined ? null : (
                <p className="o-text-xs o-text-zinc-500">{legal}</p>
              )}
            </div>
          ) : null}

          {step === 'success' ? (
            <div className="o-flex o-flex-col o-gap-6">
              <div className="o-flex o-flex-col o-gap-2">
                <h1 className="o-text-4xl o-font-bold o-tracking-tight o-text-zinc-50">
                  Vous y etes
                </h1>
                <p className="o-text-base o-text-zinc-400">Bienvenue.</p>
              </div>
              <button
                type="button"
                onClick={onDone}
                className="o-w-full o-rounded-full o-bg-zinc-50 o-px-6 o-py-3 o-font-medium o-text-zinc-950 hover:o-bg-zinc-200"
              >
                Continuer
              </button>
            </div>
          ) : null}

          {/* Le changement d'ecran et l'erreur sont annonces : sans cela, une
              navigation au clavier ne signale rien du tout. */}
          <p
            id="o-sign-in-error"
            role="status"
            aria-live="polite"
            className={
              error === undefined ? 'o-sr-only' : 'o-mt-4 o-text-sm o-text-red-400'
            }
          >
            {error ?? `Etape : ${step}`}
          </p>
        </div>
      </div>
    </section>
  )
}

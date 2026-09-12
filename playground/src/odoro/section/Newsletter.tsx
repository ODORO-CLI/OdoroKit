/**
 * Inscription a une lettre, avec ses quatre etats.
 *
 * ## Les quatre etats existent, et ils sont nommes
 *
 * Repos, envoi, succes, erreur. La plupart des formulaires n'en implementent
 * que deux — avant et apres — et laissent le troisieme au hasard du reseau :
 * on clique, rien ne bouge, on reclique, et deux inscriptions partent. L'etat
 * d'envoi n'est donc pas une decoration : c'est lui qui empeche le second clic.
 *
 * L'erreur est le quatrieme, et elle est distincte du repos : revenir au repos
 * apres un echec efface la seule information utile de la seconde precedente.
 *
 * ## La region d'annonce existe avant le message
 *
 * C'est le detail qui fait echouer la moitie des implementations : une region
 * `role="status"` **inseree** en meme temps que son contenu n'est pas annoncee.
 * Le navigateur doit l'observer avant qu'elle change. Elle est donc toujours
 * dans le document, vide au repos, et c'est son texte qui change.
 *
 * ## La validation est celle du navigateur, pas une expression reguliere
 *
 * `type="email"` et `required` valident deja — mieux, et dans la langue de
 * l'utilisateur. Le composant lit `validity` plutot que de reecrire une regle
 * qui refusera un jour une adresse parfaitement valide. Il retient seulement
 * l'envoi par defaut, pour montrer le message a sa place plutot que dans une
 * bulle native qui disparait au premier clic.
 *
 * ## Une reponse en retard ne doit pas ecraser l'etat courant
 *
 * Deux envois successifs, le premier plus lent que le second : sans garde, la
 * reponse du premier arrive apres et remplace le resultat du second. Chaque
 * envoi porte donc un numero, et seule la reponse du dernier est retenue.
 *
 * @module
 */

import { mergePresentation, useMotionState, type Customisable } from '@odoro-cli/engine'
import {
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type FormEvent,
  type ReactElement,
  type ReactNode,
} from 'react'

import { useInView } from '@/odoro/hooks/useInView'

/** Etat du formulaire. */
export type NewsletterStatus = 'repos' | 'envoi' | 'succes' | 'erreur'

/** Les phrases affichees dans la region d'annonce. */
export interface NewsletterMessages {
  /** Pendant l'envoi. */
  readonly envoi?: string
  /** Apres une inscription reussie. */
  readonly succes?: string
  /** Apres un echec du service. */
  readonly erreur?: string
  /** Quand l'adresse saisie n'est pas valide. */
  readonly invalide?: string
}

/** Proprietes propres au composant. */
export interface NewsletterOwnProps {
  /**
   * Envoie l'adresse. La promesse rejetee vaut echec, et son message est
   * affiche s'il y en a un.
   *
   * Sans cette fonction, le formulaire n'aboutit jamais : c'est voulu, un
   * faux succes serait pire qu'un bouton inerte.
   */
  onSubmit?: (email: string) => void | Promise<void>
  /** Titre de la section. */
  title?: ReactNode
  /** Ce que la lettre contient, et a quelle frequence. */
  body?: ReactNode
  /** Libelle du champ. @defaultValue 'Adresse e-mail' */
  fieldLabel?: string
  /** Ce qui est ecrit sur le bouton. @defaultValue 'S inscrire' */
  cta?: string
  /** Les phrases affichees dans la region d'annonce. */
  messages?: NewsletterMessages
  /** Mention sous le formulaire : frequence, desinscription, donnees. */
  note?: ReactNode
  /** Nom de la section, annonce aux technologies d'assistance. */
  label?: string
}

/** Toutes les proprietes. */
export type NewsletterProps = Customisable<NewsletterOwnProps, 'section'>

/** Identifiant de la feuille injectee. */
const STYLE_ID = 'o-newsletter'

/** Phrases par defaut, remplacables une a une. */
const PAR_DEFAUT: Required<NewsletterMessages> = {
  envoi: 'Envoi en cours',
  succes: 'C est fait : verifiez votre boite pour confirmer.',
  erreur: 'L inscription n a pas abouti. Reessayez dans un instant.',
  invalide: 'Cette adresse ne semble pas valide.',
}

/** Pose les regles du formulaire, une fois par document. */
function ensureNewsletterRules(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-news-ligne]{display:flex;flex-wrap:wrap;gap:0.5rem}',
    '[data-o-news-champ]{flex:1 1 14rem;min-width:0}',

    // Le disque qui tourne pendant l'envoi. Il est decoratif : c'est la region
    // d'annonce qui dit ce qui se passe.
    '[data-o-news-rouet]{',
    'display:inline-block;width:0.85em;height:0.85em;border-radius:9999px;',
    'border:2px solid currentColor;border-top-color:transparent;',
    'animation:o-news-tourne 0.7s linear infinite}',
    '@keyframes o-news-tourne{to{transform:rotate(1turn)}}',

    '[data-o-news-annonce]{min-height:1.25rem}',

    '@media (prefers-reduced-motion:reduce){',
    // Sans rotation, le disque garde sa forme : il reste le signe visible que
    // quelque chose est en cours, ce que retirer l'element supprimerait.
    '[data-o-news-rouet]{animation:none;border-top-color:currentColor;opacity:0.5}}',
  ].join('')
  document.head.append(style)
}

/**
 * Formulaire d'inscription a une lettre.
 *
 * @example
 * <Newsletter
 *   title="La lettre du registre"
 *   body="Une fois par mois, les entrees ajoutees et ce qu elles ont appris."
 *   onSubmit={async (email) => { await api.inscrire(email) }}
 * />
 */
export function Newsletter({
  onSubmit,
  title,
  body,
  fieldLabel = 'Adresse e-mail',
  cta = 'S inscrire',
  messages,
  note,
  label,
  ...rest
}: NewsletterProps): ReactElement {
  const { reduced } = useMotionState()
  const { ref, vu } = useInView<HTMLElement>({ amount: 0.2 })
  const base = useId().replace(/[^a-zA-Z0-9]/g, '')
  const [etat, setEtat] = useState<NewsletterStatus>('repos')
  const [annonce, setAnnonce] = useState('')
  const champ = useRef<HTMLInputElement | null>(null)

  // Chaque envoi porte un numero : une reponse en retard ne peut pas ecraser
  // le resultat d'un envoi plus recent.
  const envoi = useRef(0)
  const monte = useRef(true)

  ensureNewsletterRules()

  useEffect(() => {
    monte.current = true
    return () => {
      monte.current = false
    }
  }, [])

  const phrases = { ...PAR_DEFAUT, ...messages }

  const soumettre = (event: FormEvent<HTMLFormElement>): void => {
    // Retenu pour montrer le message a sa place : la bulle native disparait au
    // premier clic et ne laisse rien derriere elle.
    event.preventDefault()
    const element = champ.current
    if (element === null) return

    if (!element.validity.valid) {
      setEtat('erreur')
      setAnnonce(phrases.invalide)
      element.focus()
      return
    }

    const adresse = element.value.trim()
    const numero = envoi.current + 1
    envoi.current = numero

    setEtat('envoi')
    setAnnonce(phrases.envoi)

    void Promise.resolve(onSubmit?.(adresse)).then(
      () => {
        if (!monte.current || envoi.current !== numero) return
        setEtat('succes')
        setAnnonce(phrases.succes)
        element.value = ''
      },
      (raison: unknown) => {
        if (!monte.current || envoi.current !== numero) return
        setEtat('erreur')
        setAnnonce(
          raison instanceof Error && raison.message !== ''
            ? raison.message
            : phrases.erreur,
        )
      },
    )
  }

  const teinte =
    etat === 'succes'
      ? 'color-mix(in oklab, var(--o-palette-emerald-600) 70%, var(--o-theme-fg))'
      : 'color-mix(in oklab, var(--o-palette-rose-600) 70%, var(--o-theme-fg))'

  const { className, style } = mergePresentation(
    { className: 'o-flex o-flex-col o-gap-5' },
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
          transform: reduced || vu ? 'none' : 'translateY(12px)',
          transition:
            'opacity var(--o-duration-slower) var(--o-ease-entrance), transform var(--o-duration-slower) var(--o-ease-entrance)',
        } as CSSProperties
      }
    >
      {title === undefined ? null : (
        <h2
          className="o-text-2xl o-font-semibold o-tracking-tight"
          style={{ color: 'var(--o-theme-fg)' }}
        >
          {title}
        </h2>
      )}

      {body !== undefined && (
        <p
          className="o-max-w-xl o-text-sm o-leading-relaxed"
          style={{ color: 'var(--o-theme-muted)' }}
        >
          {body}
        </p>
      )}

      {/*
        `noValidate` ne desactive que la bulle native, jamais le calcul : le
        champ garde son `validity`, que le composant lit pour afficher le
        message a un endroit qui ne disparait pas au premier clic.
      */}
      <form onSubmit={soumettre} noValidate data-o-news-ligne="">
        <div data-o-news-champ="">
          <label
            htmlFor={`${base}-email`}
            className="o-mb-1 o-block o-text-xs o-font-medium"
            style={{ color: 'var(--o-theme-muted)' }}
          >
            {fieldLabel}
          </label>
          <input
            ref={champ}
            id={`${base}-email`}
            name="email"
            type="email"
            required
            autoComplete="email"
            inputMode="email"
            placeholder="prenom@exemple.fr"
            disabled={etat === 'envoi'}
            aria-invalid={etat === 'erreur'}
            aria-describedby={`${base}-annonce`}
            className="o-w-full o-rounded-lg o-px-3 o-py-2 o-text-sm focus:o-ring"
            style={{
              backgroundColor: 'var(--o-theme-surface)',
              border: `1px solid ${
                etat === 'erreur' ? 'var(--o-palette-rose-600)' : 'var(--o-theme-line)'
              }`,
              color: 'var(--o-theme-fg)',
            }}
          />
        </div>

        <button
          type="submit"
          // Le seul role de l'etat d'envoi : empecher le second clic, et donc
          // la seconde inscription.
          disabled={etat === 'envoi'}
          className="o-inline-flex o-items-center o-gap-2 o-self-end o-rounded-lg o-px-5 o-py-2 o-text-sm o-font-medium focus:o-ring"
          style={{
            backgroundColor: 'var(--o-palette-brand-600)',
            color: 'var(--o-palette-white)',
            border: '1px solid transparent',
            cursor: etat === 'envoi' ? 'progress' : 'pointer',
            opacity: etat === 'envoi' ? 0.75 : 1,
          }}
        >
          {etat === 'envoi' && <span aria-hidden data-o-news-rouet="" />}
          {cta}
        </button>
      </form>

      {/*
        Toujours presente, vide au repos : une region inseree en meme temps que
        son message ne serait pas annoncee.
      */}
      <p
        id={`${base}-annonce`}
        role="status"
        data-o-news-annonce=""
        className="o-text-xs"
        style={{ color: etat === 'repos' ? 'var(--o-theme-muted)' : teinte }}
      >
        {annonce}
      </p>

      {note !== undefined && (
        <p className="o-text-xs" style={{ color: 'var(--o-theme-muted)' }}>
          {note}
        </p>
      )}
    </section>
  )
}

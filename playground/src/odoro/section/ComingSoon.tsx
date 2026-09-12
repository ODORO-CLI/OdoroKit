/**
 * Page « bientot disponible », avec un compte a rebours.
 *
 * ## Un compte a rebours ne doit pas etre lu a voix haute
 *
 * C'est la faute qui rend ces pages inutilisables : des chiffres qui changent
 * chaque seconde dans une region annoncee, et un lecteur d'ecran qui recite le
 * temps restant sans jamais laisser lire le reste. Les chiffres sont donc
 * masques aux technologies d'assistance, et la date d'ouverture est donnee a
 * cote, une fois, dans un `<time>` qu'une machine sait lire.
 *
 * L'information n'est pas perdue : elle est dite mieux.
 *
 * ## Pourquoi la boucle du moteur plutot qu'un minuteur
 *
 * Un `setInterval` d'une seconde derive : les minuteurs sont ralentis dans un
 * onglet en arriere-plan, et le compte a rebours accuse plusieurs minutes de
 * retard au retour. La boucle unique du moteur donne l'heure a chaque image,
 * et le texte n'est reecrit que lorsque la seconde change — soit une fois par
 * seconde, quelle que soit la cadence de l'ecran.
 *
 * ## Aucun rendu React par seconde
 *
 * Les quatre nombres vivent dans des elements, et la boucle ecrit leur texte.
 * Les passer par un etat provoquerait un rendu complet de la section toutes
 * les secondes, pour quatre chaines de deux caracteres.
 *
 * Le premier affichage, lui, est calcule au rendu : une page qui montrerait
 * quatre zeros pendant une image avant de se corriger se remarquerait.
 *
 * @module
 */

import {
  clock,
  mergePresentation,
  useMotionState,
  type Customisable,
} from '@odoro-cli/engine'
import {
  useEffect,
  useMemo,
  useRef,
  type CSSProperties,
  type ReactElement,
  type ReactNode,
} from 'react'

import { useInView } from '@/odoro/hooks/useInView'

/** Proprietes propres au composant. */
export interface ComingSoonOwnProps {
  /** Date d'ouverture, en ISO 8601 ou en `Date`. */
  date: string | Date
  /** Titre de la page. */
  title: ReactNode
  /** Ce qui se prepare, en une ou deux phrases. */
  message?: ReactNode
  /** Ce qu'on peut faire en attendant : liens, bouton, formulaire. */
  actions?: ReactNode
  /** Langue du formatage de la date. Par defaut, celle du navigateur. */
  locale?: string
  /** Nom de la section, annonce aux technologies d'assistance. */
  label?: string
}

/** Toutes les proprietes. */
export type ComingSoonProps = Customisable<ComingSoonOwnProps, 'section'>

/** Identifiant de la feuille injectee. */
const STYLE_ID = 'o-coming-soon'

/** Les quatre paliers du compte a rebours, du plus grand au plus petit. */
const PALIERS = [
  { cle: 'jours', libelle: 'jours', diviseur: 86400000 },
  { cle: 'heures', libelle: 'heures', diviseur: 3600000 },
  { cle: 'minutes', libelle: 'minutes', diviseur: 60000 },
  { cle: 'secondes', libelle: 'secondes', diviseur: 1000 },
] as const

/** Pose les regles de la page, une fois par document. */
function ensureComingSoonRules(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-cs-compte]{display:flex;gap:0.75rem;list-style:none;margin:0;padding:0}',
    '[data-o-cs-palier]{min-width:4.5rem;text-align:center}',
    // La chasse fixe des chiffres : sans elle, un « 1 » plus etroit qu'un « 8 »
    // fait respirer toute la rangee une fois par seconde.
    '[data-o-cs-valeur]{font-variant-numeric:tabular-nums;line-height:1}',

    '[data-o-cs-point]{animation:o-cs-pouls 2.4s var(--o-ease-standard) infinite}',
    '@keyframes o-cs-pouls{0%,100%{opacity:1}50%{opacity:0.35}}',

    '@media (prefers-reduced-motion:reduce){[data-o-cs-point]{animation:none}}',
  ].join('')
  document.head.append(style)
}

/** Repartit un reste de millisecondes sur les quatre paliers. */
function decouper(reste: number): readonly number[] {
  let restant = Math.max(0, reste)
  return PALIERS.map((palier) => {
    const valeur = Math.floor(restant / palier.diviseur)
    restant -= valeur * palier.diviseur
    return valeur
  })
}

/** Deux chiffres au minimum : la rangee garde alors la meme largeur. */
function deuxChiffres(valeur: number): string {
  return String(valeur).padStart(2, '0')
}

/**
 * Une page « bientot disponible » avec compte a rebours.
 *
 * @example
 * <ComingSoon
 *   date="2026-03-12T09:00:00Z"
 *   title="Le registre public ouvre bientot"
 *   message="Trois cents entrees, un index, et la commande qui les installe."
 *   locale="fr-FR"
 * />
 */
export function ComingSoon({
  date,
  title,
  message,
  actions,
  locale,
  label,
  ...rest
}: ComingSoonProps): ReactElement {
  const { reduced } = useMotionState()
  const { ref, vu } = useInView<HTMLElement>({ amount: 0.2 })
  const valeurs = useRef<(HTMLSpanElement | null)[]>([])

  ensureComingSoonRules()

  const cible = useMemo(
    () => (typeof date === 'string' ? new Date(date) : date).getTime(),
    [date],
  )

  // Le premier affichage est calcule au rendu : quatre zeros corriges une image
  // plus tard se remarqueraient, et le rendu serveur donnerait une page fausse.
  const depart = decouper(cible - Date.now())

  useEffect(() => {
    if (Number.isNaN(cible)) return

    let derniereSeconde = -1

    const subscription = clock.subscribe(
      () => {
        const reste = cible - Date.now()
        const seconde = Math.floor(Math.max(0, reste) / 1000)
        // Une seule ecriture par seconde, quelle que soit la cadence de l'ecran.
        if (seconde === derniereSeconde) return
        derniereSeconde = seconde

        decouper(reste).forEach((valeur, index) => {
          const element = valeurs.current[index]
          if (element !== null && element !== undefined) {
            element.textContent = deuxChiffres(valeur)
          }
        })
      },
      { name: 'compte a rebours' },
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [cible])

  const lisible = useMemo(() => {
    if (Number.isNaN(cible)) return null
    return new Intl.DateTimeFormat(locale, {
      dateStyle: 'long',
      timeStyle: 'short',
    }).format(new Date(cible))
  }, [cible, locale])

  const { className, style } = mergePresentation(
    {
      className:
        'o-flex o-flex-col o-items-center o-justify-center o-gap-8 o-px-6 o-py-20 o-text-center',
    },
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
      <p
        className="o-flex o-items-center o-gap-2 o-text-xs o-font-medium o-uppercase o-tracking-wider"
        style={{ color: 'var(--o-theme-muted)' }}
      >
        <span
          aria-hidden
          data-o-cs-point=""
          className="o-inline-block o-size-2 o-rounded-full"
          style={{ backgroundColor: 'var(--o-palette-brand-500)' }}
        />
        Bientot disponible
      </p>

      <h1
        className="o-max-w-2xl o-text-4xl o-font-bold o-tracking-tight o-text-balance"
        style={{ color: 'var(--o-theme-fg)' }}
      >
        {title}
      </h1>

      {message !== undefined && (
        <p
          className="o-max-w-xl o-text-base o-leading-relaxed"
          style={{ color: 'var(--o-theme-muted)' }}
        >
          {message}
        </p>
      )}

      {/*
        Les chiffres sont decoratifs : c'est la date, juste dessous, qui porte
        l'information. Les annoncer chaque seconde rendrait la page inecoutable.
      */}
      <ul aria-hidden data-o-cs-compte="">
        {PALIERS.map((palier, index) => (
          <li
            key={palier.cle}
            data-o-cs-palier=""
            className="o-rounded-xl o-px-3 o-py-4"
            style={{
              backgroundColor: 'var(--o-theme-surface)',
              border: '1px solid var(--o-theme-line)',
            }}
          >
            <span
              ref={(element) => {
                valeurs.current[index] = element
              }}
              data-o-cs-valeur=""
              className="o-block o-text-3xl o-font-bold"
              style={{ color: 'var(--o-theme-fg)' }}
            >
              {deuxChiffres(depart[index] ?? 0)}
            </span>
            <span
              className="o-mt-1 o-block o-text-xs o-uppercase o-tracking-wider"
              style={{ color: 'var(--o-theme-muted)' }}
            >
              {palier.libelle}
            </span>
          </li>
        ))}
      </ul>

      {lisible !== null && (
        <p className="o-text-sm" style={{ color: 'var(--o-theme-muted)' }}>
          Ouverture le{' '}
          <time
            dateTime={new Date(cible).toISOString()}
            className="o-font-medium"
            style={{ color: 'var(--o-theme-fg)' }}
          >
            {lisible}
          </time>
        </p>
      )}

      {actions}
    </section>
  )
}

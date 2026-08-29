/**
 * Questions frequentes.
 *
 * ## Le repliage est natif, et ce n'est pas une facilite
 *
 * `<details>` apporte gratuitement ce qu'une version en JavaScript doit
 * reconstruire : l'ouverture au clavier, l'etat annonce aux technologies
 * d'assistance, et — le point que presque tout le monde manque — la
 * **recherche dans la page**. Un navigateur ouvre un `<details>` ferme quand le
 * texte cherche s'y trouve. Une reponse cachee derriere un `useState` reste
 * introuvable.
 *
 * ## L'ouverture unique se fait sans etat
 *
 * Un attribut `name` partage suffit : le navigateur ferme alors les autres de
 * lui-meme, exactement comme des boutons radio. C'est recent, et la degradation
 * est douce — la ou il n'est pas compris, plusieurs reponses restent ouvertes,
 * ce qui n'a jamais empeche personne de lire.
 *
 * ## L'animation de hauteur
 *
 * Elle passe par `interpolate-size`, qui permet d'animer vers `auto`. La ou
 * elle manque, le repliage est instantane — et c'est tres bien : mesurer la
 * hauteur a la main pour l'animer demande un observateur, un rendu supplementaire
 * et une resynchronisation a chaque changement de contenu.
 *
 * @module
 */

import { mergePresentation, type Customisable } from '@odoro-cli/engine'
import { useId, type ReactElement, type ReactNode } from 'react'

/** Une question et sa reponse. */
export interface FaqItem {
  /** Question posee. */
  readonly question: string
  /** Reponse. */
  readonly answer: ReactNode
}

/** Proprietes propres au composant. */
export interface FaqOwnProps {
  /** Les questions, dans l'ordre d'affichage. */
  items: readonly FaqItem[]
  /** N'ouvre qu'une question a la fois. @defaultValue false */
  single?: boolean
  /** Intitule de la section. */
  title?: ReactNode
}

/** Toutes les proprietes. */
export type FaqProps = Customisable<FaqOwnProps, 'section'>

/** Identifiant de la feuille injectee. */
const STYLE_ID = 'o-faq'

/** Pose l'animation de hauteur, une fois par document. */
function ensureFaqRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    // `interpolate-size` autorise l'animation vers `auto`. Sans lui, la regle
    // est simplement sans effet et le repliage est instantane.
    '@supports (interpolate-size: allow-keywords){',
    '[data-o-faq]{interpolate-size:allow-keywords}',
    '[data-o-faq] details::details-content{',
    'block-size:0;overflow:hidden;',
    'transition:block-size var(--o-duration-fast) var(--o-ease-standard),',
    'content-visibility var(--o-duration-fast) allow-discrete}',
    '[data-o-faq] details[open]::details-content{block-size:auto}}',
    '@media (prefers-reduced-motion:reduce){',
    '[data-o-faq] details::details-content{transition:none}}',
  ].join('')
  document.head.append(style)
}

/**
 * Liste de questions repliables.
 *
 * @example
 * <Faq
 *   title="Questions frequentes"
 *   single
 *   items={[
 *     { question: 'Pourquoi copier plutot que dependre ?', answer: <p>Parce que…</p> },
 *   ]}
 * />
 */
export function Faq({ items, single = false, title, ...rest }: FaqProps): ReactElement {
  const group = useId().replace(/[^a-zA-Z0-9]/g, '')
  ensureFaqRule()

  const { className, style } = mergePresentation(
    { className: 'o-flex o-flex-col o-gap-6' },
    rest,
  )

  return (
    <section {...rest} className={className} style={style} data-o-faq="">
      {title === undefined ? null : (
        <h2 className="o-text-2xl o-font-semibold o-tracking-tight">{title}</h2>
      )}

      <div className="o-flex o-flex-col">
        {items.map((item) => (
          <details
            key={item.question}
            // Un `name` partage suffit a n'en ouvrir qu'une : le navigateur
            // ferme les autres, sans qu'aucun etat ne soit tenu.
            name={single ? group : undefined}
            className="o-border-b o-border-zinc-200 dark:o-border-zinc-800"
          >
            <summary className="o-flex o-cursor-pointer o-items-center o-justify-between o-gap-4 o-py-4 o-text-left o-font-medium focus:o-ring">
              {item.question}
              <span
                aria-hidden
                className="o-shrink-0 o-text-zinc-400 dark:o-text-zinc-500"
              >
                +
              </span>
            </summary>
            <div className="o-pb-4 o-text-zinc-500 dark:o-text-zinc-400">
              {item.answer}
            </div>
          </details>
        ))}
      </div>
    </section>
  )
}

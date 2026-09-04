/**
 * Champ de saisie qui se déplie, avec pièces jointes et dictée.
 *
 * ## Ce qui a été retiré, et pourquoi
 *
 * L'implémentation d'origine, faute de micro, **simulait la dictée** : elle
 * écrivait mot à mot une phrase d'exemple, avec un visualiseur nourri de
 * nombres au hasard. C'est acceptable dans une démonstration ; dans un
 * composant qu'on installe, c'est un champ qui se remplit tout seul d'un texte
 * que personne n'a dit. Sans micro, le bouton est simplement absent.
 *
 * Ses icônes de modèles venaient aussi d'un CDN. Un composant du registre ne
 * fait pas dépendre une page d'une adresse qu'elle ne contrôle pas : le
 * sélecteur est un **emplacement**, et l'application y met ce qu'elle veut.
 *
 * ## La hauteur est mesurée, jamais devinée
 *
 * Un `textarea` qui grandit demande de lire `scrollHeight`, et `scrollHeight`
 * ne veut rien dire tant que la hauteur courante est posée : elle est donc
 * remise à zéro le temps de la mesure, puis rétablie. Sans cette remise à zéro,
 * le champ ne redescend jamais quand on efface — il ne fait que grandir.
 *
 * La transition est coupée pendant la mesure, sinon chaque frappe déclenche une
 * animation vers une valeur qu'on va aussitôt remplacer.
 *
 * ## Les URL d'objet sont révoquées
 *
 * Chaque vignette tient une `blob:` créée pour elle. Ne pas la révoquer garde
 * l'image en mémoire pour toute la vie de l'onglet — un défaut qui ne se voit
 * qu'après une heure d'usage, et jamais en développement.
 *
 * @module
 */

import { mergePresentation, type Customisable } from '@odoro-cli/engine'
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type KeyboardEvent,
  type ReactElement,
  type ReactNode,
} from 'react'

/** Une piece jointe. */
export interface PromptAttachment {
  /** Identifiant, unique dans la liste. */
  readonly id: string
  /** Le fichier lui-meme. */
  readonly file: File
  /** URL d'objet, revoquee au retrait. */
  readonly url: string
  /** Nom affiche. */
  readonly name: string
}

/** Proprietes propres au composant. */
export interface PromptInputOwnProps {
  /** Texte d'invite du champ. @defaultValue 'Posez votre question' */
  placeholder?: string
  /** Nombre maximum de pieces jointes. @defaultValue 6 */
  maxAttachments?: number
  /** Types acceptes par le selecteur de fichiers. @defaultValue 'image/*' */
  accept?: string
  /**
   * Reglages rendus dans la barre basse — modele, effort, ce que l'application
   * veut. Emplacement : le registre ne connait ni les modeles ni leurs marques.
   */
  controls?: ReactNode
  /** Appele a l'envoi. */
  onSubmit?: (value: string, attachments: readonly File[]) => void
  /** Appele quand une vignette est ouverte. */
  onPreview?: (attachment: PromptAttachment) => void
}

/** Toutes les proprietes. */
export type PromptInputProps = Customisable<PromptInputOwnProps>

/** Identifiant de la feuille injectee. */
const STYLE_ID = 'o-prompt-input'

/** Hauteurs du champ, en pixels. */
const MIN_HEIGHT = 68
const MAX_HEIGHT = 160

/** Pose les regles du champ, une fois par document. */
function ensurePromptRules(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-prompt]{transition:max-width var(--o-duration-slow) var(--o-ease-emphasized)}',
    '[data-o-prompt-field]{resize:none;outline:none;background:transparent;',
    'transition:height var(--o-duration-fast) var(--o-ease-standard)}',
    '[data-o-prompt-shelf]{overflow:hidden;',
    'transition:height var(--o-duration-slow) var(--o-ease-emphasized)}',
    '@media (prefers-reduced-motion:reduce){',
    '[data-o-prompt],[data-o-prompt-field],[data-o-prompt-shelf]{transition:none}}',
  ].join('')
  document.head.append(style)
}

/**
 * La reconnaissance vocale du navigateur, si elle existe.
 *
 * Decrite ici plutot qu'importee d'un type global : elle n'est pas standard,
 * les deux noms coexistent, et la declarer globalement obligerait chaque projet
 * d'accueil a en faire autant.
 */
interface SpeechLike {
  continuous: boolean
  interimResults: boolean
  start: () => void
  stop: () => void
  onresult:
    | ((event: {
        resultIndex: number
        results: ArrayLike<ArrayLike<{ transcript: string }> & { isFinal: boolean }>
      }) => void)
    | null
  onend: (() => void) | null
  onerror: (() => void) | null
}

/** Rend le constructeur de reconnaissance vocale, s'il y en a un. */
function speechFactory(): (new () => SpeechLike) | undefined {
  if (typeof window === 'undefined') return undefined
  const scope = window as unknown as Record<string, unknown>
  const found = scope['SpeechRecognition'] ?? scope['webkitSpeechRecognition']
  return typeof found === 'function' ? (found as new () => SpeechLike) : undefined
}

/**
 * Champ de saisie qui se deplie.
 *
 * @example
 * <PromptInput onSubmit={(texte, fichiers) => envoyer(texte, fichiers)} />
 *
 * @example
 * // Les reglages sont un emplacement : modele, effort, ce que la page veut.
 * <PromptInput controls={<SelecteurDeModele />} />
 */
export function PromptInput({
  placeholder = 'Posez votre question',
  maxAttachments = 6,
  accept = 'image/*',
  controls,
  onSubmit,
  onPreview,
  ...rest
}: PromptInputProps): ReactElement {
  const [value, setValue] = useState('')
  const [open, setOpen] = useState(false)
  const [attachments, setAttachments] = useState<readonly PromptAttachment[]>([])
  const [listening, setListening] = useState(false)

  const field = useRef<HTMLTextAreaElement | null>(null)
  const picker = useRef<HTMLInputElement | null>(null)
  const speech = useRef<SpeechLike | null>(null)

  ensurePromptRules()

  const hasContent = value.trim() !== '' || attachments.length > 0

  // La hauteur du champ, mesuree a chaque frappe.
  useEffect(() => {
    const element = field.current
    if (element === null) return

    // La mesure exige une hauteur nulle : `scrollHeight` ne descend jamais
    // en dessous de la hauteur posee, et le champ ne se refermerait pas.
    const previous = element.style.height
    element.style.transition = 'none'
    element.style.height = '0px'
    const needed = element.scrollHeight
    element.style.height = previous
    // Une lecture forcee, pour que la remise a zero ne soit pas fondue avec la
    // valeur suivante par le navigateur.
    void element.offsetHeight
    element.style.transition = ''
    element.style.height = `${String(Math.max(MIN_HEIGHT, Math.min(needed, MAX_HEIGHT)))}px`
  }, [value, open])

  // Les URL d'objet meurent avec le composant, et seulement avec lui.
  //
  // Le nettoyage passe par une ref, pas par la liste : depend-il de la liste,
  // il s'execute a chaque ajout et revoque les URL des vignettes encore
  // affichees. Elles deviennent alors des images cassees, et seulement a
  // partir de la deuxieme — ce qui ne se voit pas en essayant une seule fois.
  const liveRef = useRef(attachments)
  liveRef.current = attachments

  useEffect(
    () => () => {
      for (const item of liveRef.current) URL.revokeObjectURL(item.url)
      speech.current?.stop()
    },
    [],
  )

  const send = useCallback((): void => {
    if (!hasContent) return
    onSubmit?.(
      value,
      attachments.map((item) => item.file),
    )
    for (const item of attachments) URL.revokeObjectURL(item.url)
    setAttachments([])
    setValue('')
    setOpen(false)
  }, [hasContent, onSubmit, value, attachments])

  const keyDown = (event: KeyboardEvent<HTMLTextAreaElement>): void => {
    // Entrée envoie, Maj+Entrée passe à la ligne : c'est la convention d'un
    // champ de conversation, et l'inverse surprend tout le monde.
    if (event.key !== 'Enter' || event.shiftKey) return
    event.preventDefault()
    send()
  }

  const choose = (event: ChangeEvent<HTMLInputElement>): void => {
    const files = [...(event.target.files ?? [])]
    // Le champ est vide pour que choisir deux fois le meme fichier declenche
    // bien un second evenement.
    event.target.value = ''
    if (files.length === 0) return

    const room = Math.max(0, maxAttachments - attachments.length)
    const added = files.slice(0, room).map((file) => ({
      id: `${file.name}-${String(file.lastModified)}-${String(Math.random()).slice(2, 8)}`,
      file,
      url: URL.createObjectURL(file),
      name: file.name,
    }))

    setAttachments((current) => [...current, ...added])
    setOpen(true)
  }

  const drop = (id: string): void => {
    setAttachments((current) => {
      const target = current.find((item) => item.id === id)
      if (target !== undefined) URL.revokeObjectURL(target.url)
      return current.filter((item) => item.id !== id)
    })
  }

  const dictate = (): void => {
    if (listening) {
      speech.current?.stop()
      return
    }

    const Factory = speechFactory()
    if (Factory === undefined) return

    const engine = new Factory()
    engine.continuous = true
    engine.interimResults = true

    let settled = value
    engine.onresult = (event) => {
      let pending = ''
      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        const result = event.results[index]
        const text = result?.[0]?.transcript ?? ''
        if (result?.isFinal === true) settled += (settled === '' ? '' : ' ') + text
        else pending += text
      }
      setValue((settled + (pending === '' ? '' : ` ${pending}`)).trim())
    }
    const finish = (): void => {
      setListening(false)
      speech.current = null
    }
    engine.onend = finish
    engine.onerror = finish

    speech.current = engine
    setListening(true)
    setOpen(true)
    engine.start()
  }

  const { className, style } = mergePresentation(
    { className: 'o-relative o-flex o-w-full o-flex-col' },
    rest,
  )

  const canDictate = speechFactory() !== undefined

  return (
    <div
      {...rest}
      data-o-prompt
      className={className}
      style={{ maxWidth: open ? 480 : 320, ...style }}
      onBlur={(event) => {
        if (event.currentTarget.contains(event.relatedTarget)) return
        if (!hasContent && !listening) setOpen(false)
      }}
    >
      <input
        ref={picker}
        type="file"
        accept={accept}
        multiple
        onChange={choose}
        className="o-hidden"
        tabIndex={-1}
        aria-hidden
      />

      {/* L'etagere des vignettes, qui monte de derriere le champ. */}
      <div
        data-o-prompt-shelf
        style={{ height: attachments.length > 0 && open ? 68 : 0 }}
        className="o-relative o-w-full"
      >
        <ul className="o-flex o-list-none o-gap-2 o-overflow-x-auto o-p-2">
          {attachments.map((item) => (
            <li key={item.id} className="o-relative o-flex-none">
              <button
                type="button"
                onClick={() => onPreview?.(item)}
                className="o-block o-h-12 o-w-12 o-overflow-hidden o-rounded-xl o-border-w-1 o-border-zinc-200 dark:o-border-zinc-800"
              >
                <img
                  src={item.url}
                  alt={item.name}
                  className="o-h-full o-w-full o-object-cover"
                  draggable={false}
                />
              </button>
              <button
                type="button"
                onClick={() => drop(item.id)}
                className="o-absolute o-right-0 o-top-0 o-flex o-h-4 o-w-4 o-items-center o-justify-center o-rounded-full o-bg-zinc-950 o-text-xs o-text-zinc-50"
              >
                <span className="o-sr-only">Retirer {item.name}</span>
                <span aria-hidden>&times;</span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="o-relative o-rounded-3xl o-border-w-1 o-border-zinc-200 o-bg-zinc-50 o-p-3 dark:o-border-zinc-800 dark:o-bg-zinc-900">
        <label htmlFor="o-prompt-field" className="o-sr-only">
          {placeholder}
        </label>
        <textarea
          id="o-prompt-field"
          ref={field}
          data-o-prompt-field
          rows={1}
          value={value}
          placeholder={placeholder}
          onFocus={() => setOpen(true)}
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={keyDown}
          className="o-w-full o-text-base o-text-zinc-950 dark:o-text-zinc-50"
          style={{ minHeight: MIN_HEIGHT }}
        />

        <div className="o-mt-2 o-flex o-items-center o-gap-2">
          <button
            type="button"
            onClick={() => picker.current?.click()}
            disabled={attachments.length >= maxAttachments}
            className="o-flex o-h-8 o-w-8 o-items-center o-justify-center o-rounded-full o-border-w-1 o-border-zinc-200 o-text-zinc-600 disabled:o-opacity-50 dark:o-border-zinc-700 dark:o-text-zinc-300"
          >
            <span className="o-sr-only">Joindre un fichier</span>
            <span aria-hidden>+</span>
          </button>

          {controls}

          <span className="o-flex-1" />

          {/* Un seul bouton, trois etats : envoyer, dicter, arreter. Trois
              boutons cote a cote demanderaient de lire lequel est actif. */}
          {hasContent || !canDictate ? (
            <button
              type="button"
              onClick={send}
              disabled={!hasContent}
              className="o-flex o-h-8 o-w-8 o-items-center o-justify-center o-rounded-full o-bg-zinc-950 o-text-zinc-50 disabled:o-opacity-40 dark:o-bg-zinc-50 dark:o-text-zinc-950"
            >
              <span className="o-sr-only">Envoyer</span>
              <span aria-hidden>&uarr;</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={dictate}
              aria-pressed={listening}
              className="o-flex o-h-8 o-w-8 o-items-center o-justify-center o-rounded-full o-border-w-1 o-border-zinc-200 o-text-zinc-600 dark:o-border-zinc-700 dark:o-text-zinc-300"
            >
              <span className="o-sr-only">
                {listening ? 'Arreter la dictee' : 'Dicter'}
              </span>
              <span aria-hidden>{listening ? '■' : '●'}</span>
            </button>
          )}
        </div>
      </div>

      {/* L'etat de la dictee est annonce : sans cela, rien ne dit que le micro
          ecoute a qui ne voit pas le bouton changer. */}
      <p role="status" aria-live="polite" className="o-sr-only">
        {listening ? 'Dictee en cours.' : ''}
      </p>
    </div>
  )
}

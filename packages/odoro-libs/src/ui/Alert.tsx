/**
 * Encart de message contextuel.
 *
 * @module
 */

import {
  type HTMLAttributes,
  type ReactElement,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from 'react'

import { usePresence } from '../motion/usePresence.js'
import { cx, variants } from '../styles/cx.js'

/** Registre visuel d'un encart. */
export type AlertTone = 'info' | 'success' | 'warning' | 'danger'

/**
 * Classes de l'encart, exposees pour habiller un conteneur equivalent.
 *
 * @example
 * <section className={alertClasses({ tone: 'warning' })}>...</section>
 */
export const alertClasses = variants({
  base: 'o-flex o-items-start o-gap-3 o-rounded-md o-border-w-1 o-p-4 o-text-zinc-900 dark:o-text-zinc-50',
  variants: {
    tone: {
      info: 'o-bg-sky-50 dark:o-bg-sky-950 o-border-sky-200 dark:o-border-sky-800',
      success:
        'o-bg-emerald-50 dark:o-bg-emerald-950 o-border-emerald-200 dark:o-border-emerald-800',
      warning:
        'o-bg-amber-50 dark:o-bg-amber-950 o-border-amber-200 dark:o-border-amber-800',
      danger: 'o-bg-red-50 dark:o-bg-red-950 o-border-red-200 dark:o-border-red-800',
    },
  },
  defaults: { tone: 'info' },
})

/** Couleur de l'icone par registre. */
const ICON_TONE_CLASSES: Readonly<Record<AlertTone, string>> = {
  info: 'o-text-sky-600 dark:o-text-sky-400',
  success: 'o-text-emerald-600 dark:o-text-emerald-400',
  warning: 'o-text-amber-600 dark:o-text-amber-400',
  danger: 'o-text-red-600 dark:o-text-red-400',
}

/** Traces des icones par registre : i cercle, coche cercle, triangle, octogone. */
const ICON_PATHS: Readonly<Record<AlertTone, ReactElement>> = {
  info: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5" strokeLinecap="round" />
      <path d="M12 8h.01" strokeLinecap="round" />
    </>
  ),
  success: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="m8.5 12.5 2.5 2.5 4.5-5" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  warning: (
    <>
      <path d="M12 3 2.5 20h19L12 3Z" strokeLinejoin="round" />
      <path d="M12 10v4" strokeLinecap="round" />
      <path d="M12 17h.01" strokeLinecap="round" />
    </>
  ),
  danger: (
    <>
      <path
        d="M8.2 3h7.6L21 8.2v7.6L15.8 21H8.2L3 15.8V8.2L8.2 3Z"
        strokeLinejoin="round"
      />
      <path d="M12 8v5" strokeLinecap="round" />
      <path d="M12 16h.01" strokeLinecap="round" />
    </>
  ),
}

/** Icone par defaut du registre demande. */
function ToneIcon({ tone }: { tone: AlertTone }): ReactElement {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
      focusable="false"
      className={cx('o-shrink-0', ICON_TONE_CLASSES[tone])}
    >
      {ICON_PATHS[tone]}
    </svg>
  )
}

/** Proprietes de {@link Alert}. */
export interface AlertProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'className' | 'title'
> {
  /** Registre visuel. @defaultValue 'info' */
  tone?: AlertTone
  /** Titre court, en gras au-dessus du corps. */
  title?: ReactNode
  /** Corps du message. */
  children?: ReactNode
  /**
   * Icone en tete d'encart. Non fournie : une icone par defaut assortie au
   * registre. `null` : aucune icone.
   */
  icon?: ReactNode
  /**
   * Rend l'encart fermable : un bouton de fermeture apparait et l'encart
   * disparait avec une animation de sortie avant que ce rappel ne soit
   * invoque.
   */
  onClose?: () => void
  /** Classes additionnelles. */
  className?: string
}

/**
 * Encart de message.
 *
 * Le registre `danger` porte `role="alert"`, qui interrompt la lecture en
 * cours ; les autres registres se contentent de `role="status"`.
 *
 * @example
 * <Alert tone="success" title="Enregistre" onClose={() => setSaved(false)}>
 *   Le projet a bien ete enregistre.
 * </Alert>
 */
export function Alert({
  tone = 'info',
  title,
  children,
  icon,
  onClose,
  className,
  ...rest
}: AlertProps): ReactElement | null {
  const [visible, setVisible] = useState(true)
  const { ref, isMounted } = usePresence<HTMLDivElement>(visible, {
    enter: { opacity: 0, transform: 'scale(0.98)' },
    duration: 'fast',
  })

  const closeRef = useRef(onClose)
  closeRef.current = onClose

  // L'appelant n'est prevenu qu'une fois l'animation de sortie terminee :
  // c'est a lui de retirer l'encart de son arbre.
  useEffect(() => {
    if (isMounted || visible) return
    closeRef.current?.()
  }, [isMounted, visible])

  if (!isMounted) return null

  return (
    <div
      {...rest}
      ref={ref}
      role={tone === 'danger' ? 'alert' : 'status'}
      className={cx(alertClasses({ tone }), className)}
    >
      {icon === undefined ? <ToneIcon tone={tone} /> : icon}

      <div className="o-flex o-flex-col o-gap-1 o-flex-1 o-min-w-0">
        {title === undefined ? null : (
          <p className="o-text-sm o-font-semibold">{title}</p>
        )}
        {children === undefined ? null : <div className="o-text-sm">{children}</div>}
      </div>

      {onClose === undefined ? null : (
        <button
          type="button"
          onClick={() => setVisible(false)}
          aria-label="Fermer le message"
          className="o-shrink-0 o-cursor-pointer o-rounded-sm o-text-zinc-500 dark:o-text-zinc-400 hover:o-text-zinc-900 dark:hover:o-text-zinc-50 o-transition"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            aria-hidden="true"
            focusable="false"
          >
            <path
              d="M6 6l12 12M18 6L6 18"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>
      )}
    </div>
  )
}

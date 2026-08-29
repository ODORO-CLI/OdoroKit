/**
 * Panneau lateral modal.
 *
 * Meme fondation que `Dialog` : l'element `<dialog>` natif ouvert en mode
 * modal fournit le piegeage du focus, la fermeture par Echap, l'inertie du
 * reste de la page et la couche superieure. Seule change la geometrie — le
 * panneau est cale a un bord et glisse depuis celui-ci.
 *
 * Le `<dialog>` natif se centre par defaut via ses marges automatiques : le
 * calage au bord passe par un style inline (`position: fixed`, `inset`,
 * `margin: 0`), la feuille utilitaire n'ayant pas de classe pour chaque
 * combinaison.
 *
 * @module
 */

import {
  type CSSProperties,
  type HTMLAttributes,
  type MouseEvent,
  type ReactElement,
  type ReactNode,
  type SyntheticEvent,
  useCallback,
  useEffect,
  useId,
  useRef,
} from 'react'

import { usePresence } from '../motion/usePresence.js'
import { cx } from '../styles/cx.js'

/** Bord d'ancrage du panneau. */
export type DrawerSide = 'right' | 'left' | 'bottom'

/** Proprietes de {@link Drawer}. */
export interface DrawerProps extends Omit<
  HTMLAttributes<HTMLDialogElement>,
  'className' | 'title'
> {
  /** Etat d'ouverture, pilote par l'application. */
  open: boolean
  /**
   * Appele lorsque l'utilisateur demande la fermeture : croix, touche Echap,
   * ou clic sur l'arriere-plan.
   */
  onClose: () => void
  /** Titre du panneau, annonce a l'ouverture via `aria-labelledby`. */
  title: ReactNode
  /** Description facultative, annoncee apres le titre. */
  description?: ReactNode
  /** Contenu. */
  children?: ReactNode
  /** Pied du panneau, typiquement des boutons d'action. */
  footer?: ReactNode
  /** Bord d'ancrage. @defaultValue 'right' */
  side?: DrawerSide
  /**
   * Largeur maximale pour les cotes lateraux. Sans effet pour `bottom`, dont
   * la hauteur suit le contenu.
   *
   * @defaultValue 'md'
   */
  size?: 'sm' | 'md' | 'lg'
  /** Ferme le panneau au clic sur l'arriere-plan. @defaultValue true */
  closeOnBackdrop?: boolean
  /** Classes additionnelles appliquees a l'element `<dialog>`. */
  className?: string
}

/** Etat hors champ de depart et d'arrivee, par bord. */
const OFFSCREEN: Readonly<Record<DrawerSide, { transform: string }>> = {
  right: { transform: 'translateX(100%)' },
  left: { transform: 'translateX(-100%)' },
  bottom: { transform: 'translateY(100%)' },
}

/** Calage au bord, par bord. `100dvh` suit la barre d'adresse mobile. */
const POSITION: Readonly<Record<DrawerSide, CSSProperties>> = {
  right: {
    position: 'fixed',
    inset: '0 0 0 auto',
    margin: 0,
    height: '100dvh',
    maxHeight: 'none',
  },
  left: {
    position: 'fixed',
    inset: '0 auto 0 0',
    margin: 0,
    height: '100dvh',
    maxHeight: 'none',
  },
  bottom: {
    position: 'fixed',
    inset: 'auto 0 0 0',
    margin: 0,
    width: '100%',
    maxWidth: 'none',
  },
}

/** Bordure cote page, par bord. */
const BORDER: Readonly<Record<DrawerSide, string>> = {
  right: 'o-border-l',
  left: 'o-border-r',
  bottom: 'o-border-t',
}

/** Largeur maximale des panneaux lateraux, par taille. */
const SIZE: Readonly<Record<'sm' | 'md' | 'lg', string>> = {
  sm: 'o-max-w-sm',
  md: 'o-max-w-md',
  lg: 'o-max-w-lg',
}

/**
 * Panneau lateral modal accessible.
 *
 * @example
 * <Drawer
 *   open={open}
 *   onClose={() => setOpen(false)}
 *   title="Filtres"
 *   footer={<Button onClick={apply}>Appliquer</Button>}
 * >
 *   <FilterForm />
 * </Drawer>
 */
export function Drawer({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  side = 'right',
  size = 'md',
  closeOnBackdrop = true,
  className,
  ...rest
}: DrawerProps): ReactElement | null {
  const { ref, isMounted } = usePresence<HTMLDialogElement>(open, {
    enter: OFFSCREEN[side],
    duration: 'base',
  })

  const titleId = useId()
  const descriptionId = useId()
  const closeRef = useRef(onClose)
  closeRef.current = onClose

  // `showModal()` ne peut etre appele qu'une fois l'element dans le document.
  useEffect(() => {
    const dialog = ref.current
    if (dialog === null || !isMounted) return
    if (typeof dialog.showModal !== 'function') return
    if (!dialog.open) dialog.showModal()
    return () => {
      if (dialog.open) dialog.close()
    }
  }, [ref, isMounted])

  // La touche Echap declenche l'evenement `cancel` du natif : on l'intercepte
  // pour passer par l'etat applicatif, sinon le panneau se fermerait sans
  // animation et sans que l'application le sache.
  const handleCancel = useCallback((event: SyntheticEvent<HTMLDialogElement>) => {
    event.preventDefault()
    closeRef.current()
  }, [])

  const handleClick = useCallback(
    (event: MouseEvent<HTMLDialogElement>) => {
      if (!closeOnBackdrop) return
      // Un clic sur l'arriere-plan a pour cible le `<dialog>` lui-meme : le
      // contenu est dans un enfant, donc tout clic interieur a une autre cible.
      if (event.target === ref.current) closeRef.current()
    },
    [closeOnBackdrop, ref],
  )

  if (!isMounted) return null

  return (
    <dialog
      {...rest}
      ref={ref}
      style={POSITION[side]}
      aria-labelledby={titleId}
      aria-describedby={description === undefined ? undefined : descriptionId}
      onCancel={handleCancel}
      onClick={handleClick}
      className={cx(
        'o-w-full o-bg-white dark:o-bg-zinc-800 o-text-zinc-900 dark:o-text-zinc-50 o-shadow-lg o-p-0',
        'o-border-zinc-200 dark:o-border-zinc-800',
        BORDER[side],
        side === 'bottom' ? null : SIZE[size],
        className,
      )}
    >
      <div className="o-relative o-flex o-flex-col o-gap-4 o-p-6 o-h-full">
        <button
          type="button"
          aria-label="Fermer"
          onClick={() => closeRef.current()}
          className={cx(
            'o-absolute o-top-3 o-right-3 o-cursor-pointer o-rounded-sm o-p-1',
            'o-text-zinc-500 dark:o-text-zinc-400 hover:o-text-zinc-900 dark:hover:o-text-zinc-50 o-transition',
          )}
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

        <div className="o-flex o-flex-col o-gap-1">
          <h2 id={titleId} className="o-text-lg o-font-semibold">
            {title}
          </h2>
          {description === undefined ? null : (
            <p
              id={descriptionId}
              className="o-text-sm o-text-zinc-500 dark:o-text-zinc-400"
            >
              {description}
            </p>
          )}
        </div>

        {/* Le contenu defile seul quand il depasse : le panneau, lui, reste
            cale sur toute la hauteur du bord. */}
        <div className="o-flex-1 o-min-w-0 o-overflow-y-auto">{children}</div>

        {footer === undefined ? null : (
          <div className="o-flex o-justify-end o-gap-2">{footer}</div>
        )}
      </div>
    </dialog>
  )
}

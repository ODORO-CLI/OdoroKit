/**
 * Infobulle au survol et au focus.
 *
 * Le panneau est positionne en absolu par rapport a une enveloppe `o-relative`
 * qui entoure le declencheur : aucune mesure ni calcul de position, le flux
 * CSS suffit. Les classes de placement (`o-translate-center-*`) vivent sur une
 * enveloppe distincte du panneau anime, car `usePresence` pilote la propriete
 * `transform` et ecraserait le centrage pendant l'animation.
 *
 * @module
 */

import {
  type KeyboardEvent,
  type ReactElement,
  type ReactNode,
  cloneElement,
  isValidElement,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react'

import { usePresence } from '../motion/usePresence.js'
import { cx } from '../styles/cx.js'

/** Cote d'apparition de l'infobulle. */
export type TooltipPlacement = 'top' | 'bottom' | 'left' | 'right'

/** Proprietes de {@link Tooltip}. */
export interface TooltipProps {
  /** Contenu de l'infobulle. Court : une phrase, pas un paragraphe. */
  content: ReactNode
  /** Element declencheur, survole ou focalise. */
  children: ReactNode
  /** Cote d'apparition. @defaultValue 'top' */
  placement?: TooltipPlacement
  /**
   * Delai avant apparition, en millisecondes. Evite le clignotement quand le
   * pointeur ne fait que traverser l'element.
   *
   * @defaultValue 300
   */
  delay?: number
  /** Classes additionnelles pour le panneau. */
  className?: string
}

/** Classes de placement de l'enveloppe positionnee, par cote. */
const PLACEMENT_CLASSES: Readonly<Record<TooltipPlacement, string>> = {
  top: 'o-bottom-full o-left-1/2 o-translate-center-x o-mb-1',
  bottom: 'o-top-full o-left-1/2 o-translate-center-x o-mt-1',
  left: 'o-right-full o-top-1/2 o-translate-center-y o-mr-1',
  right: 'o-left-full o-top-1/2 o-translate-center-y o-ml-1',
}

/**
 * Infobulle accessible.
 *
 * Apparait au survol comme au focus clavier, disparait a la sortie, au blur et
 * sur Echap. Le declencheur est decrit par `aria-describedby` tant que
 * l'infobulle est visible.
 *
 * @example
 * <Tooltip content="Copier dans le presse-papiers">
 *   <Button tone="ghost">Copier</Button>
 * </Tooltip>
 */
export function Tooltip({
  content,
  children,
  placement = 'top',
  delay = 300,
  className,
}: TooltipProps): ReactElement {
  const tooltipId = useId()
  const [visible, setVisible] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  const { ref, isMounted } = usePresence<HTMLSpanElement>(visible, {
    enter: { opacity: 0 },
    duration: 'fast',
    initial: true,
  })

  const show = useCallback(() => {
    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => setVisible(true), delay)
  }, [delay])

  const hide = useCallback(() => {
    clearTimeout(timerRef.current)
    setVisible(false)
  }, [])

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLSpanElement>) => {
      if (event.key === 'Escape') hide()
    },
    [hide],
  )

  useEffect(() => () => clearTimeout(timerRef.current), [])

  // Le declencheur porte `aria-describedby` quand c'est un element unique ;
  // sinon la description est posee sur l'enveloppe, faute de mieux.
  const describedBy = isMounted ? tooltipId : undefined
  const trigger = isValidElement<{ 'aria-describedby'?: string }>(children)
    ? cloneElement(children, { 'aria-describedby': describedBy })
    : children

  return (
    <span
      className="o-relative o-inline-block"
      aria-describedby={trigger === children ? describedBy : undefined}
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
      onKeyDown={handleKeyDown}
    >
      {trigger}
      {isMounted ? (
        <span className={cx('o-absolute o-z-overlay', PLACEMENT_CLASSES[placement])}>
          <span
            ref={ref}
            role="tooltip"
            id={tooltipId}
            className={cx(
              'o-block o-bg-fg o-text-fg-inverted o-text-sm o-whitespace-nowrap',
              'o-rounded-md o-shadow-md o-px-2 o-py-1 o-pointer-events-none',
              className,
            )}
          >
            {content}
          </span>
        </span>
      ) : null}
    </span>
  )
}

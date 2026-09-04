/**
 * Enveloppe autour d'un fond de `@designcodeio/threeui`.
 *
 * ## Ce que ce fichier est, et ce qu'il n'est pas
 *
 * Ce n'est pas un portage : le rendu appartient au paquet tiers, dont la source
 * ne fait pas partie de ce dépôt. Ce fichier est une **porte** — il décide
 * *quand* le paquet est chargé, et *si* il doit l'être.
 *
 * C'est ce qui manque presque toujours à un fond décoratif importé tel quel :
 *
 * **Il ne charge rien avant qu'on le voie.** Un fond en pied de page téléchargé
 * au montage fait payer son poids à quelqu'un qui ne le verra jamais. Le
 * chargement attend l'approche du champ.
 *
 * **Il respecte le mouvement réduit.** Un fond animé n'a pas d'état final à
 * préserver : il n'apporte rien d'autre que son mouvement. Sous mouvement
 * réduit il n'est donc pas monté du tout, et le paquet n'est jamais téléchargé.
 *
 * **Il porte un repli.** Pendant le chargement, sans WebGL, et pour toujours si
 * le mouvement est réduit.
 *
 * ## L'avertissement qui compte
 *
 * Ce composant ouvre sa propre surface WebGL, hors de l'arbitre du moteur. Une
 * page qui l'emploie **et** un fond du registre ouvre deux contextes ; le
 * navigateur en plafonne le nombre et perd silencieusement le plus ancien.
 * Un seul de ces deux fonds par page.
 *
 * @module
 */

import { mergePresentation, useMotionState, type Customisable } from '@odoro-cli/engine'
import {
  Suspense,
  lazy,
  useEffect,
  useState,
  type ComponentType,
  type ReactElement,
  type ReactNode,
} from 'react'

/**
 * La surface du paquet que ce composant emploie.
 *
 * Décrite ici plutôt qu'importée : le paquet est une dépendance du projet
 * d'accueil, proposée par `odoro add` au moment de la copie. Un import statique
 * en ferait une dépendance de compilation du registre lui-même.
 */
interface AshenPressComponentProps {
  className?: string
}

/**
 * Le fond, chargé séparément du reste.
 *
 * Déclaré au niveau du module : un `lazy` reconstruit à chaque rendu perdrait
 * son cache et redemanderait le paquet.
 */
const Press = lazy(async () => {
  const specifier = '@designcodeio/threeui'
  const loaded = (await import(/* @vite-ignore */ specifier)) as {
    AshenPress: ComponentType<AshenPressComponentProps>
  }
  return { default: loaded.AshenPress }
})

/** Proprietes propres au composant. */
export interface AshenPressOwnProps {
  /**
   * Marge de declenchement du chargement.
   *
   * Le paquet arrive avant que le cadre n'entre dans le champ : sans avance, on
   * regarde le repli pendant que le moteur se telecharge.
   *
   * @defaultValue '200px'
   */
  rootMargin?: string
  /** Ce qui occupe le cadre tant que le fond n'est pas la. */
  fallback?: ReactNode
  /** Classes du repli par defaut. */
  poster?: string
}

/** Toutes les proprietes. */
export type AshenPressProps = Customisable<AshenPressOwnProps>

/** Repli par defaut : un degrade fige, dans les memes tons cendres. */
const DEFAULT_POSTER = 'o-bg-gradient-to-br o-from-stone-800 o-to-stone-950'

/**
 * Fond `AshenPress`, charge a l'approche du champ.
 *
 * @example
 * <div className="o-relative o-h-96 o-overflow-hidden o-rounded-xl">
 *   <AshenPress className="o-absolute o-inset-0" />
 * </div>
 *
 * @example
 * // Le repli peut etre une image, tant que le fond n'est pas la — et pour
 * // toujours si le mouvement est reduit.
 * <AshenPress fallback={<img src="/apercu.jpg" alt="" />} />
 */
export function AshenPress({
  rootMargin = '200px',
  fallback,
  poster = DEFAULT_POSTER,
  ...rest
}: AshenPressProps): ReactElement {
  const { reduced } = useMotionState()
  const [host, setHost] = useState<HTMLElement | null>(null)
  const [approaching, setApproaching] = useState(false)

  useEffect(() => {
    if (host === null) return
    // Sous mouvement reduit, le fond ne viendra pas : rien a observer, et
    // surtout rien a telecharger.
    if (reduced) return

    if (typeof IntersectionObserver === 'undefined') {
      setApproaching(true)
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting !== true) return
        setApproaching(true)
        observer.disconnect()
      },
      { rootMargin },
    )
    observer.observe(host)
    return () => observer.disconnect()
  }, [host, reduced, rootMargin])

  const { className, style } = mergePresentation(
    { className: 'o-relative o-overflow-hidden' },
    rest,
  )

  const waiting = fallback ?? <div className={`o-absolute o-inset-0 ${poster}`} />

  return (
    <div {...rest} ref={setHost} className={className} style={style} aria-hidden>
      {approaching ? (
        <Suspense fallback={waiting}>
          <Press className="o-absolute o-inset-0" />
        </Suspense>
      ) : (
        waiting
      )}
    </div>
  )
}

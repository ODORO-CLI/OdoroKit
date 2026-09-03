/**
 * Scène Spline, chargée à la demande.
 *
 * ## Ce composant est une porte, pas un moteur
 *
 * Il n'y a rien à rendre ici : Spline apporte son propre moteur et son propre
 * format. Ce fichier ne fait que trois choses, et chacune répond à un défaut de
 * l'implémentation d'origine.
 *
 * **Il ne charge rien avant qu'on le voie.** L'original montait la scène au
 * montage du composant. Le runtime Spline pèse plus de six cents kilo-octets
 * compressés, et la scène elle-même se compte en mégaoctets : une page qui en
 * place une en pied de page les téléchargeait pour personne. Le chargement
 * attend donc l'entrée dans le champ.
 *
 * **Il respecte le mouvement réduit.** L'original ne consultait rien. Une scène
 * Spline anime en permanence, souvent avec un suivi du pointeur ; c'est
 * exactement ce qu'un réglage de mouvement réduit demande d'éteindre. Le repli
 * est alors affiché, et le runtime n'est jamais téléchargé.
 *
 * **Il dit ce qu'il attend.** `scene` est une URL que le projet possède, sur
 * son propre compte Spline. Aucune valeur par défaut : une adresse d'exemple
 * codée en dur ferait dépendre les pages de quelqu'un d'un fichier qui ne lui
 * appartient pas, et qui peut disparaître.
 *
 * ## Pourquoi il reste dans le registre malgré sa dépendance
 *
 * Parce qu'il est copié, pas installé : un projet qui n'appelle jamais ce
 * composant n'installe pas Spline. La dépendance est déclarée dans le `meta`,
 * et `odoro add` la propose au moment de la copie — pas avant.
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
 * La surface de Spline que ce composant emploie.
 *
 * Décrite ici plutôt qu'importée. Le paquet est une dépendance du **projet
 * d'accueil**, déclarée dans le `meta` et proposée par `odoro add` au moment de
 * la copie — pas une dépendance de ce dépôt. Un import statique en ferait une
 * dépendance de compilation ici, et la vérification des types échouerait sur un
 * paquet que personne n'a demandé.
 */
interface SplineComponentProps {
  scene: string
  className?: string
}

/**
 * Le composant Spline, chargé séparément du reste.
 *
 * Déclaré au niveau du module et non dans le corps du composant : un `lazy`
 * reconstruit à chaque rendu perdrait son cache et redemanderait le module.
 *
 * Le spécificateur passe par une variable pour la même raison que le type :
 * écrit en clair, il serait résolu à la compilation.
 */
const Spline = lazy(async () => {
  const specifier = '@splinetool/react-spline'
  const loaded = (await import(/* @vite-ignore */ specifier)) as {
    default: ComponentType<SplineComponentProps>
  }
  return { default: loaded.default }
})

/** Proprietes propres au composant. */
export interface SplineSceneOwnProps {
  /**
   * URL de la scene, sur le compte Spline du projet.
   *
   * Obligatoire, et sans valeur par defaut : une adresse d'exemple ferait
   * dependre la page d'un fichier qui ne lui appartient pas.
   */
  scene: string
  /**
   * Marge de declenchement du chargement.
   *
   * Le chargement commence quand la scene approche du champ, pas quand elle y
   * entre : sans avance, on regarde le repli pendant que le runtime arrive.
   *
   * @defaultValue '200px'
   */
  rootMargin?: string
  /** Ce qui occupe le cadre tant que la scene n'est pas la. */
  fallback?: ReactNode
  /** Classes du repli par defaut. */
  poster?: string
}

/** Toutes les proprietes. */
export type SplineSceneProps = Customisable<SplineSceneOwnProps>

/** Repli par defaut : un degrade fige. */
const DEFAULT_POSTER = 'o-bg-gradient-to-br o-from-zinc-900 o-to-zinc-950'

/**
 * Scene Spline chargee a l'approche du champ.
 *
 * @example
 * <SplineScene
 *   scene="https://prod.spline.design/VOTRE-SCENE/scene.splinecode"
 *   className="o-h-96 o-w-full"
 * />
 *
 * @example
 * // Le repli peut etre une image, tant que la scene n'est pas la — et pour
 * // toujours si le mouvement est reduit.
 * <SplineScene scene={adresse} fallback={<img src="/apercu.jpg" alt="" />} />
 */
export function SplineScene({
  scene,
  rootMargin = '200px',
  fallback,
  poster = DEFAULT_POSTER,
  ...rest
}: SplineSceneProps): ReactElement {
  const { reduced } = useMotionState()
  const [host, setHost] = useState<HTMLElement | null>(null)
  const [approaching, setApproaching] = useState(false)

  useEffect(() => {
    if (host === null) return
    // Sous mouvement reduit, la scene ne viendra pas : rien a observer, et
    // surtout rien a telecharger.
    if (reduced) return

    if (typeof IntersectionObserver === 'undefined') {
      // Sans observateur, on charge : mieux vaut le poids que le cadre vide.
      setApproaching(true)
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting !== true) return
        setApproaching(true)
        // Une fois charge, il n'y a plus rien a surveiller.
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
    <div {...rest} ref={setHost} className={className} style={style}>
      {approaching ? (
        <Suspense fallback={waiting}>
          <Spline scene={scene} className="o-h-full o-w-full" />
        </Suspense>
      ) : (
        waiting
      )}
    </div>
  )
}

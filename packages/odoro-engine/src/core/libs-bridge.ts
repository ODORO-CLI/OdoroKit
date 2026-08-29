/**
 * Le pont vers `@odoro/libs`, quand il est present.
 *
 * ## Pourquoi un pont plutot qu'une dependance
 *
 * Le moteur ne depend d'aucun paquet Odoro. C'est voulu : il s'emploie seul,
 * dans un projet qui n'a pas la librairie, et l'obliger a la tirer pour lire
 * une preference systeme serait une dependance imposee par une commodite.
 *
 * Mais quand les deux sont la, deux choses doivent cesser d'exister en double.
 *
 * ## La boucle
 *
 * `@odoro/libs/motion` ouvre une boucle a un seul endroit : la mesure de
 * progression du defilement, qui se lit a l'image et non a l'evenement. Le
 * moteur en a une aussi — celle de GSAP, qui pilote tout le reste.
 *
 * Deux boucles concurrentes lisent et ecrivent la mise en page dans un ordre
 * que l'autre ignore. Le resultat est un tremblement qui ne se reproduit pas a
 * la demande, et qu'on attribue au moteur alors qu'il vient de leur
 * coexistence. Le pont installe donc le ticker de GSAP comme ordonnanceur de
 * la librairie, et le rend au demontage.
 *
 * ## La decision d'animer
 *
 * `prefers-reduced-motion` etait lu des deux cotes. Tant que personne ne force
 * le reglage, les deux lectures s'accordent ; elles divergent des qu'un projet
 * decide de l'ignorer sur une page. Le pont fait suivre le reglage du moteur a
 * la librairie, pour que la reponse soit la meme partout.
 *
 * ## L'import est dynamique, et son echec est normal
 *
 * `@odoro/libs` est une dependance optionnelle. Son absence n'est pas une
 * erreur : c'est le cas d'un projet qui n'emploie que le moteur. Le pont se
 * contente alors de ne rien faire.
 *
 * @module
 */

import gsap from 'gsap'

/** Ce que le pont installe, et sait defaire. */
export type BridgeTeardown = () => void

/** Forme minimale de ce que le pont consomme dans la librairie. */
interface LibsMotionPolicy {
  setFrameScheduler: (next: (task: () => void) => () => void) => () => void
  setReducedMotion: (setting: 'respect' | 'force' | 'ignore') => void
}

/**
 * Branche le moteur sur la librairie, si elle est la.
 *
 * @returns De quoi defaire le branchement. Rend une fonction inerte quand la
 *   librairie est absente.
 *
 * @example
 * useEffect(() => {
 *   let undo: BridgeTeardown = () => undefined
 *   void bridgeToLibs(reducedMotion).then((fn) => (undo = fn))
 *   return () => undo()
 * }, [reducedMotion])
 */
export async function bridgeToLibs(
  reducedMotion: 'respect' | 'force' | 'ignore',
): Promise<BridgeTeardown> {
  let libs: LibsMotionPolicy
  try {
    libs = (await import('@odoro/libs/motion-policy')) as unknown as LibsMotionPolicy
  } catch {
    // La librairie n'est pas installee : c'est un cas ordinaire, pas un echec.
    return () => undefined
  }

  // Le ticker de GSAP, avec `once` : la tache est retiree apres son
  // execution, ce qui reproduit exactement la semantique d'un
  // `requestAnimationFrame` — une image, pas un abonnement.
  const restoreScheduler = libs.setFrameScheduler((task) => {
    const run = (): void => {
      gsap.ticker.remove(run)
      task()
    }
    gsap.ticker.add(run)
    return () => gsap.ticker.remove(run)
  })

  libs.setReducedMotion(reducedMotion)

  return () => {
    restoreScheduler()
    // La librairie retrouve la preference systeme : le moteur parti, plus rien
    // ne justifie qu'elle suive un reglage qu'il avait impose.
    libs.setReducedMotion('respect')
  }
}

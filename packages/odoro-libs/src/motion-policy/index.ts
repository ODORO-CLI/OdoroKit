/**
 * Politique de mouvement : une seule decision, pour tout ce qui anime.
 *
 * ## Pourquoi ce module existe separement
 *
 * `prefers-reduced-motion` etait consulte par chaque composant de `motion`, et
 * une seconde fois, independamment, par le moteur d'animation. Deux lectures
 * de la meme preference systeme, qui repondent la meme chose tant que
 * personne ne la force — et divergent des qu'un projet decide de l'ignorer sur
 * une page precise.
 *
 * La decision vit donc ici, dans un module qui ne depend de rien : ni React,
 * ni le moteur. `@odoro-cli/libs/motion` le consulte, et `@odoro-cli/engine` peut le
 * consulter aussi, sans qu'aucun des deux ne depende de l'autre.
 *
 * ## La boucle est cedable
 *
 * Une animation par la Web Animations API est pilotee par le compositeur :
 * aucune boucle JavaScript n'est ouverte. Certaines mesures en demandent une
 * malgre tout — une progression de defilement se lit a l'image, pas a
 * l'evenement, sous peine de recalculer la mise en page des dizaines de fois
 * par seconde.
 *
 * Cette boucle-la est **cedable**. Par defaut elle emploie
 * `requestAnimationFrame` ; quand `@odoro-cli/engine` est present, il installe son
 * propre ordonnanceur et tout passe par le ticker unique de GSAP.
 *
 * Deux boucles concurrentes produisent un tremblement qu'on n'attribue jamais
 * a la bonne cause : chacune lit et ecrit la mise en page dans un ordre que
 * l'autre ignore, et le defaut ne se reproduit pas a la demande.
 *
 * @module
 */

/** Ce qu'un projet peut imposer par-dessus la preference systeme. */
export type ReducedMotionSetting =
  /** Suit la preference du systeme. Le defaut, et le bon. */
  | 'respect'
  /** Anime comme si la preference etait activee, quoi qu'en dise le systeme. */
  | 'force'
  /**
   * Ignore la preference.
   *
   * A n'employer que sur une animation qui porte du sens et n'a pas
   * d'equivalent statique — une demonstration de ce que fait le moteur, par
   * exemple. Jamais par confort esthetique.
   */
  | 'ignore'

/** Media query interrogee. */
const QUERY = '(prefers-reduced-motion: reduce)'

/** Recupere la MediaQueryList, ou `null` hors navigateur. */
function mediaQuery(): MediaQueryList | null {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return null
  }
  return window.matchMedia(QUERY)
}

/** Reglage impose, s'il y en a un. */
let setting: ReducedMotionSetting = 'respect'

/** Abonnes aux changements, systeme ou impose. */
const listeners = new Set<() => void>()

/** Desabonnement de la media query, quand quelqu'un ecoute. */
let detach: (() => void) | undefined

/** Previent les abonnes. */
function notify(): void {
  for (const listener of listeners) listener()
}

/**
 * Indique si les animations doivent etre reduites.
 *
 * Utilisable hors composant. Rend `false` cote serveur, ou l'animation n'a de
 * toute facon pas lieu.
 *
 * @example
 * const duration = prefersReducedMotion() ? 0 : 300
 */
export function prefersReducedMotion(): boolean {
  if (setting === 'force') return true
  if (setting === 'ignore') return false
  return mediaQuery()?.matches ?? false
}

/**
 * Impose un reglage, ou revient a la preference systeme.
 *
 * @example
 * // Sur une page de demonstration du moteur, et nulle part ailleurs.
 * setReducedMotion('ignore')
 */
export function setReducedMotion(next: ReducedMotionSetting): void {
  if (next === setting) return
  setting = next
  notify()
}

/** Le reglage courant. */
export function reducedMotionSetting(): ReducedMotionSetting {
  return setting
}

/**
 * Abonne un ecouteur aux changements de la politique.
 *
 * @returns De quoi se desabonner.
 */
export function subscribeMotion(listener: () => void): () => void {
  listeners.add(listener)

  // La media query n'est ecoutee que tant que quelqu'un s'y interesse : un
  // ecouteur pose au chargement et jamais retire est une fuite qu'on ne voit
  // pas, parce qu'elle ne coute qu'un objet.
  if (detach === undefined) {
    const query = mediaQuery()
    if (query !== null) {
      query.addEventListener('change', notify)
      detach = () => query.removeEventListener('change', notify)
    }
  }

  return () => {
    listeners.delete(listener)
    if (listeners.size === 0) {
      detach?.()
      detach = undefined
    }
  }
}

/* -------------------------------------------------------------------------- */
/* L'ordonnanceur cedable                                                     */
/* -------------------------------------------------------------------------- */

/** Programme un travail pour la prochaine image, et rend de quoi l'annuler. */
export type FrameScheduler = (task: () => void) => () => void

/** Ordonnanceur par defaut : une image du navigateur. */
const rafScheduler: FrameScheduler = (task) => {
  if (typeof requestAnimationFrame !== 'function') {
    // Hors navigateur, la tache s'execute une fois, tout de suite : c'est ce
    // qui fait qu'un rendu serveur produit une valeur plutot qu'un vide.
    task()
    return () => undefined
  }
  const handle = requestAnimationFrame(task)
  return () => cancelAnimationFrame(handle)
}

let scheduler: FrameScheduler = rafScheduler

/**
 * Remplace l'ordonnanceur de la librairie.
 *
 * Appele par `@odoro-cli/engine` a son montage, pour que les mesures de la
 * librairie passent par le meme ticker que les animations du moteur. Sans
 * cela, deux boucles lisent et ecrivent la mise en page dans un ordre que
 * l'autre ignore.
 *
 * @returns De quoi rendre l'ordonnanceur precedent, au demontage du moteur.
 *
 * @example
 * // Cote moteur :
 * const restore = setFrameScheduler((task) => {
 *   const wrapped = () => task()
 *   gsap.ticker.add(wrapped, true)
 *   return () => gsap.ticker.remove(wrapped)
 * })
 */
export function setFrameScheduler(next: FrameScheduler): () => void {
  const previous = scheduler
  scheduler = next
  return () => {
    scheduler = previous
  }
}

/**
 * Programme un travail sur la prochaine image.
 *
 * Passe par l'ordonnanceur courant : celui du navigateur, ou celui du moteur
 * quand il est present.
 */
export function onFrame(task: () => void): () => void {
  return scheduler(task)
}

/** Remet la politique dans son etat initial. Reserve aux tests. */
export function resetMotionPolicy(): void {
  setting = 'respect'
  listeners.clear()
  detach?.()
  detach = undefined
  scheduler = rafScheduler
}

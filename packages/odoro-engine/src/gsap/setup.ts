/**
 * Enregistrement des plugins d'animation.
 *
 * ## Idempotent, et pourquoi cela compte
 *
 * Enregistrer deux fois le meme plugin est un bug classique en mode strict de
 * React : chaque effet y est execute deux fois au montage, et un enregistrement
 * naif produit alors des declencheurs de defilement en double — qui se
 * declenchent deux fois, se rafraichissent deux fois, et laissent la moitie
 * d'entre eux orphelins au demontage. Le symptome ne se voit qu'en
 * developpement, jamais en production, ce qui en fait un excellent piege.
 *
 * Chaque plugin n'est donc charge et enregistre **qu'une seule fois**, et les
 * demandes concurrentes partagent la meme promesse.
 *
 * ## Jamais cote serveur
 *
 * Les plugins touchent au document a leur enregistrement. Sur un rendu serveur,
 * la demande est simplement ignoree : elle sera honoree au montage.
 *
 * ## Charges a la demande
 *
 * Un projet qui n'anime que du texte ne telecharge pas le declencheur de
 * defilement. C'est une contrainte de conception, pas une optimisation
 * ulterieure : les imports sont dynamiques et le decoupage en decoule.
 *
 * @module
 */

import gsap from 'gsap'

/** Plugins que le moteur sait charger. */
export type PluginName = 'ScrollTrigger' | 'SplitText' | 'Observer' | 'ScrollSmoother'

/** Chargement en cours ou termine, par plugin. */
const loading = new Map<PluginName, Promise<boolean>>()

/** Plugins effectivement enregistres. */
const registered = new Set<PluginName>()

/**
 * Valeurs des plugins resolus.
 *
 * Les types de ces plugins sont declares globalement par la bibliotheque, mais
 * leur **valeur** n'existe qu'apres le chargement dynamique : elle est donc
 * conservee ici, et lue par les accesseurs typés plus bas.
 */
const values = new Map<PluginName, unknown>()

/** Indique si l'environnement peut accueillir un plugin. */
function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof document !== 'undefined'
}

/**
 * Charge le module d'un plugin.
 *
 * Le `switch` est deliberement explicite plutot qu'un import calcule : un
 * chemin construit dynamiquement empeche tout outil de compilation de decouper
 * le code, et la promesse d'un chargement a la demande serait vide.
 */
async function importPlugin(name: PluginName): Promise<unknown> {
  switch (name) {
    case 'ScrollTrigger':
      return (await import('gsap/ScrollTrigger')).ScrollTrigger
    case 'SplitText':
      return (await import('gsap/SplitText')).SplitText
    case 'Observer':
      return (await import('gsap/Observer')).Observer
    case 'ScrollSmoother':
      return (await import('gsap/ScrollSmoother')).ScrollSmoother
  }
}

/**
 * Garantit qu'un plugin est charge et enregistre.
 *
 * @returns `true` si le plugin est utilisable, `false` hors navigateur ou si
 *   le chargement a echoue. Un echec n'est jamais fatal : l'appelant retombe
 *   sur un comportement sans animation.
 *
 * @example
 * if (await ensurePlugin('ScrollTrigger')) {
 *   ScrollTrigger.create({ ... })
 * }
 */
export function ensurePlugin(name: PluginName): Promise<boolean> {
  if (!isBrowser()) return Promise.resolve(false)

  const existing = loading.get(name)
  if (existing !== undefined) return existing

  const pending = importPlugin(name)
    .then((plugin) => {
      // `registerPlugin` est lui-meme tolerant aux doublons, mais s'y fier
      // laisserait le compte des plugins enregistres faux pour le diagnostic.
      if (!registered.has(name)) {
        gsap.registerPlugin(plugin as Parameters<typeof gsap.registerPlugin>[0])
        registered.add(name)
      }
      values.set(name, plugin)
      return true
    })
    .catch((cause: unknown) => {
      console.error(`[odoro] chargement du plugin "${name}" impossible`, cause)
      // Le retrait autorise une nouvelle tentative : un echec reseau ponctuel
      // ne doit pas condamner le plugin pour la duree de la session.
      loading.delete(name)
      return false
    })

  loading.set(name, pending)
  return pending
}

/**
 * Charge plusieurs plugins en parallele.
 *
 * @returns `true` si **tous** sont utilisables.
 *
 * @example
 * await ensurePlugins(['ScrollTrigger', 'SplitText'])
 */
export async function ensurePlugins(names: readonly PluginName[]): Promise<boolean> {
  const results = await Promise.all(names.map((name) => ensurePlugin(name)))
  return results.every(Boolean)
}

/**
 * Indique si un plugin est deja enregistre, sans rien declencher.
 *
 * @example
 * isPluginRegistered('ScrollTrigger')
 */
export function isPluginRegistered(name: PluginName): boolean {
  return registered.has(name)
}

/** Plugins enregistres, pour le panneau de diagnostic. */
export function registeredPlugins(): readonly PluginName[] {
  return [...registered]
}

/**
 * Charge le declencheur de defilement et rend sa valeur.
 *
 * @returns La classe, ou `null` hors navigateur ou si le chargement echoue.
 *
 * @example
 * const ScrollTriggerClass = await loadScrollTrigger()
 * ScrollTriggerClass?.create({ trigger: element })
 */
export async function loadScrollTrigger(): Promise<typeof ScrollTrigger | null> {
  const ready = await ensurePlugin('ScrollTrigger')
  if (!ready) return null
  return (values.get('ScrollTrigger') as typeof ScrollTrigger | undefined) ?? null
}

/**
 * Charge le decoupeur de texte et rend sa valeur.
 *
 * @returns La classe, ou `null` hors navigateur ou si le chargement echoue.
 *
 * @example
 * const SplitTextClass = await loadSplitText()
 */
export async function loadSplitText(): Promise<typeof SplitText | null> {
  const ready = await ensurePlugin('SplitText')
  if (!ready) return null
  return (values.get('SplitText') as typeof SplitText | undefined) ?? null
}

/**
 * Oublie les enregistrements. Reserve aux tests : les plugins restent
 * enregistres aupres de la bibliotheque, seul le suivi est remis a zero.
 *
 * @internal
 */
export function resetPluginRegistry(): void {
  loading.clear()
  registered.clear()
  values.clear()
}

/**
 * Fournisseur React du moteur.
 *
 * ## Il est optionnel, et c'est un choix
 *
 * Un composant utilise hors du fournisseur fonctionne avec les reglages par
 * defaut. Rien ne casse, rien ne se tait : un avertissement est emis **une
 * seule fois, en developpement**, indiquant ce qui manque et pourquoi cela
 * peut compter.
 *
 * La raison est pratique : un composant copie depuis le registre atterrit dans
 * un projet qui n'a peut-etre pas encore monte le fournisseur. Le faire
 * echouer serait le meilleur moyen de faire croire que le composant est casse.
 *
 * ## Ce que le fournisseur fait reellement
 *
 * Il configure des singletons de module — l'horloge, la politique,
 * l'inventaire — plutot que de creer des instances. L'unicite de la boucle de
 * rendu est la garantie centrale du moteur ; deux fournisseurs imbriques ne
 * doivent pas produire deux boucles.
 *
 * @module
 */

import {
  type ReactElement,
  type ReactNode,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
} from 'react'

import { type ClockInstance, clock } from './clock.js'
import {
  type MotionPolicyInstance,
  type MotionState,
  type QualitySetting,
  type ReducedMotionSetting,
  motionPolicy,
} from './motion-policy.js'
import { type ResourceRegistryInstance, registry } from './registry.js'

/** Valeur exposee par le contexte. */
export interface EngineContextValue {
  /** Boucle de rendu unique. */
  readonly clock: ClockInstance
  /** Politique de mouvement. */
  readonly policy: MotionPolicyInstance
  /** Inventaire des ressources vivantes. */
  readonly registry: ResourceRegistryInstance
  /** Nombre maximum de surfaces WebGL simultanees. */
  readonly maxSurfaces: number
  /** `true` si un fournisseur est reellement monte au-dessus. */
  readonly provided: boolean
}

/** Valeurs employees hors fournisseur. */
const FALLBACK: EngineContextValue = {
  clock,
  policy: motionPolicy,
  registry,
  maxSurfaces: 2,
  provided: false,
}

const EngineContext = createContext<EngineContextValue>(FALLBACK)
EngineContext.displayName = 'OdoroEngine'

/** Proprietes de {@link OdoroEngine}. */
export interface OdoroEngineProps {
  /** Application. */
  children?: ReactNode
  /**
   * Qualite des rendus couteux. `auto` retrograde d'elle-meme quand la charge
   * mesuree l'exige.
   *
   * @defaultValue 'auto'
   */
  quality?: QualitySetting
  /**
   * Conduite face a `prefers-reduced-motion`. `force` neutralise les
   * animations en toutes circonstances ; `ignore` ne doit servir qu'a des fins
   * de demonstration.
   *
   * @defaultValue 'respect'
   */
  reducedMotion?: ReducedMotionSetting
  /**
   * Nombre maximum de surfaces WebGL simultanees. Les navigateurs plafonnent
   * les contextes disponibles et perdent silencieusement le plus ancien
   * au-dela.
   *
   * @defaultValue 2
   */
  maxSurfaces?: number
}

/**
 * Configure le moteur pour l'application.
 *
 * @example
 * <OdoroEngine quality="auto" reducedMotion="respect" maxSurfaces={2}>
 *   <App />
 * </OdoroEngine>
 */
export function OdoroEngine({
  children,
  quality = 'auto',
  reducedMotion = 'respect',
  maxSurfaces = 2,
}: OdoroEngineProps): ReactElement {
  // La configuration passe en couche layout : un composant enfant qui
  // interroge la politique a son montage doit deja voir les bons reglages.
  useEffect(() => {
    motionPolicy.configure({ quality, reducedMotion })
  }, [quality, reducedMotion])

  const value = useMemo<EngineContextValue>(
    () => ({ clock, policy: motionPolicy, registry, maxSurfaces, provided: true }),
    [maxSurfaces],
  )

  return <EngineContext.Provider value={value}>{children}</EngineContext.Provider>
}

/** Avertissements deja emis, pour ne pas les repeter a chaque rendu. */
const warned = new Set<string>()

/**
 * Accede au moteur.
 *
 * Fonctionne hors fournisseur, avec les reglages par defaut.
 *
 * @param requester Nom du composant appelant, cite dans l'avertissement.
 *
 * @example
 * const { clock, policy } = useEngine('Aurora')
 */
export function useEngine(requester = 'un composant'): EngineContextValue {
  const value = useContext(EngineContext)

  if (
    !value.provided &&
    process.env['NODE_ENV'] !== 'production' &&
    !warned.has(requester)
  ) {
    warned.add(requester)
    console.warn(
      [
        `[odoro] ${requester} est utilise hors de <OdoroEngine>.`,
        'Les reglages par defaut s appliquent : qualite automatique, animations',
        'reduites respectees, deux surfaces au plus. Monter le fournisseur a la',
        'racine permet de les ajuster et donne acces au panneau de diagnostic.',
      ].join('\n'),
    )
  }

  return value
}

/**
 * Suit l'etat de la politique de mouvement.
 *
 * Le composant se re-rend quand la preference systeme change, quand l'onglet
 * passe en arriere-plan, ou quand la qualite est ajustee sous la charge.
 *
 * @example
 * const { reduced, quality } = useMotionState()
 * if (reduced) return <PosterStatique />
 */
export function useMotionState(): MotionState {
  return useSyncExternalStore(
    (listener) => motionPolicy.subscribe(listener),
    () => motionPolicy.state,
    () => motionPolicy.state,
  )
}

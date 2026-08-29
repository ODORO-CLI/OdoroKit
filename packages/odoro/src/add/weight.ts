/**
 * Ce que coute reellement une installation.
 *
 * ## Pourquoi avertir
 *
 * Une commande d'installation ne montre normalement rien du poids de ce
 * qu'elle apporte. C'est sans consequence pour un utilitaire de quelques
 * kilo-octets ; ce n'en est pas une quand un seul composant ajoute cent trente
 * kilo-octets compresses au premier chargement de la page.
 *
 * Le chiffre n'est pas la pour dissuader. Il est la pour que la decision soit
 * prise **avant** l'installation plutot que trois semaines plus tard devant un
 * rapport de performance, quand le composant est deja integre et que le retirer
 * coute une journee.
 *
 * ## Les chiffres
 *
 * Ils sont mesures, pas estimes : une scene minimale — geometrie, materiau,
 * lumiere, rendu — compilee et compressee. Un projet reel depassera ces
 * valeurs, jamais l'inverse ; ce sont des planchers.
 *
 * @module
 */

import type { PublishedEntry } from '../registry/index.js'

/** Poids compresse d'un backend, en kilo-octets. */
export const BACKEND_WEIGHT = {
  /** Scene 3D minimale : geometrie, materiau standard, lumiere directionnelle. */
  three: 130,
  /** Rendu plein ecran : contexte, programme, triangle. */
  ogl: 13,
} as const

/** Un avertissement a montrer avant d'ecrire. */
export interface WeightWarning {
  /** Backend concerne. */
  readonly backend: keyof typeof BACKEND_WEIGHT
  /** Poids compresse ajoute, en kilo-octets. */
  readonly kilobytes: number
  /** Entrees qui le reclament. */
  readonly entries: readonly string[]
  /** Phrase complete, prete a etre affichee. */
  readonly message: string
}

/**
 * Calcule ce qu'un ensemble d'entrees ajoute au premier chargement.
 *
 * Un backend n'est compte qu'une fois, meme reclame par cinq composants : il
 * n'est charge qu'une fois. Compter cinq fois cent trente kilo-octets serait
 * un mensonge dans l'autre sens, et un avertissement qu'on apprend a ignorer
 * ne sert plus a rien.
 *
 * @example
 * const warnings = weighEntries(entries)
 * for (const warning of warnings) log.warn(warning.message)
 */
export function weighEntries(entries: readonly PublishedEntry[]): WeightWarning[] {
  const byBackend = new Map<keyof typeof BACKEND_WEIGHT, string[]>()

  for (const entry of entries) {
    const backend = entry.perf.backend
    if (backend === false) continue
    const list = byBackend.get(backend) ?? []
    list.push(entry.id)
    byBackend.set(backend, list)
  }

  const warnings: WeightWarning[] = []
  for (const [backend, ids] of byBackend) {
    const kilobytes = BACKEND_WEIGHT[backend]
    const which = ids.length === 1 ? ids[0] : `${String(ids.length)} composants`

    warnings.push({
      backend,
      kilobytes,
      entries: ids,
      message:
        backend === 'three'
          ? `${String(which)} charge une scene 3D : environ ${String(kilobytes)} Ko compresses au premier affichage. Le backend leger en demande ${String(BACKEND_WEIGHT.ogl)}, si un effet plein ecran suffit.`
          : `${String(which)} charge le backend leger : environ ${String(kilobytes)} Ko compresses.`,
    })
  }

  // Le plus lourd en premier : c'est celui sur lequel la decision porte.
  return warnings.sort((a, b) => b.kilobytes - a.kilobytes)
}

/**
 * Paquets npm que les entrees reclament, en plus de leurs `dependencies`.
 *
 * Les backends graphiques ne figurent pas dans `dependencies` : ils sont
 * reclames par `engine.gl`, parce que c'est le moteur qui les charge, pas le
 * composant. La CLI doit malgre tout les proposer a l'installation.
 *
 * @example
 * requiredPackages(entries) // ['gsap', 'three']
 */
export function requiredPackages(entries: readonly PublishedEntry[]): string[] {
  const packages = new Set<string>()

  for (const entry of entries) {
    for (const dependency of entry.dependencies) packages.add(dependency)
    if (entry.engine.gl !== false) packages.add(entry.engine.gl)
    if (entry.engine.gsap.length > 0) packages.add('gsap')
  }

  return [...packages].sort()
}

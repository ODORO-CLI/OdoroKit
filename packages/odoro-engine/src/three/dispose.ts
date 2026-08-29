/**
 * Liberation des ressources d'une scene 3D.
 *
 * ## Rien n'est libere automatiquement
 *
 * Le ramasse-miettes de JavaScript ignore la memoire de la carte graphique.
 * Une geometrie, un materiau, une texture ou une cible de rendu abandonnes
 * conservent leurs tampons cote pilote jusqu'a la fermeture de l'onglet.
 *
 * Le symptome n'est pas une erreur : c'est une degradation lente. La premiere
 * visite est fluide, la dixieme rame, et rien dans la console ne l'explique.
 * C'est la premiere cause de fuite dans ce type de projet, et la raison pour
 * laquelle ce module existe separement — il doit etre lisible, teste, et
 * appele sans exception.
 *
 * ## Ce qui est parcouru
 *
 * L'arbre entier de la scene, y compris les objets qu'un chargeur de modele y
 * a places sans qu'on les ait nommes. Un materiau peut porter une dizaine de
 * textures sous des noms differents : plutot que d'en tenir la liste — qui
 * changera —, on inspecte chacune de ses proprietes et on libere tout ce qui
 * ressemble a une texture.
 *
 * @module
 */

import type { Material, Object3D, Texture, WebGLRenderer, WebGLRenderTarget } from 'three'

/** Ce qui a ete libere, pour l'assertion d'un test de fuite. */
export interface DisposalReport {
  /** Geometries liberees. */
  geometries: number
  /** Materiaux liberes. */
  materials: number
  /** Textures liberees. */
  textures: number
  /** Cibles de rendu liberees. */
  renderTargets: number
}

/** Tout ce qui expose une methode de liberation. */
interface Disposable {
  dispose: () => void
}

/** Reconnait un objet liberable. */
function isDisposable(value: unknown): value is Disposable {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as Disposable).dispose === 'function'
  )
}

/** Reconnait une texture, par sa signature plutot que par son nom de classe. */
function isTexture(value: unknown): value is Texture {
  return (
    isDisposable(value) && 'image' in (value as object) && 'wrapS' in (value as object)
  )
}

/**
 * Libere un materiau et toutes les textures qu'il porte.
 *
 * @returns Le nombre de textures liberees.
 */
export function disposeMaterial(material: Material, seen: Set<unknown>): number {
  let textures = 0

  // Les noms de proprietes portant une texture varient d'un materiau a l'autre
  // et d'une version a l'autre : on inspecte plutot que d'enumerer.
  for (const value of Object.values(material as unknown as Record<string, unknown>)) {
    if (!isTexture(value) || seen.has(value)) continue
    seen.add(value)
    value.dispose()
    textures += 1
  }

  material.dispose()
  return textures
}

/**
 * Libere tout ce qu'un arbre d'objets 3D retient.
 *
 * Les ressources partagees entre plusieurs objets ne sont liberees qu'une
 * fois : un materiau reutilise par cinquante instances ne doit pas etre
 * libere cinquante fois, ce qui produirait des avertissements et masquerait de
 * vraies anomalies.
 *
 * @example
 * const rapport = disposeObject(scene)
 * console.log(`${rapport.geometries} geometries liberees`)
 */
export function disposeObject(root: Object3D): DisposalReport {
  const report: DisposalReport = {
    geometries: 0,
    materials: 0,
    textures: 0,
    renderTargets: 0,
  }
  const seen = new Set<unknown>()

  root.traverse((object) => {
    const candidate = object as Object3D & {
      geometry?: Disposable
      material?: Material | Material[]
    }

    if (candidate.geometry !== undefined && !seen.has(candidate.geometry)) {
      seen.add(candidate.geometry)
      candidate.geometry.dispose()
      report.geometries += 1
    }

    const material = candidate.material
    if (material === undefined) return

    for (const entry of Array.isArray(material) ? material : [material]) {
      if (seen.has(entry)) continue
      seen.add(entry)
      report.textures += disposeMaterial(entry, seen)
      report.materials += 1
    }
  })

  // Le contenu est detache apres coup : detacher pendant le parcours
  // interromprait celui-ci.
  root.clear()

  return report
}

/**
 * Libere une scene, ses cibles de rendu et son moteur de rendu.
 *
 * `forceContextLoss` relache l'emplacement de contexte aupres du navigateur.
 * Sans lui, l'emplacement reste occupe jusqu'au ramassage du canevas, et une
 * page qui monte et demonte plusieurs scenes finit par epuiser le quota — le
 * navigateur perdant alors silencieusement la plus ancienne.
 *
 * @example
 * disposeScene({ scene, renderer, targets: [depthTarget] })
 */
export function disposeScene(input: {
  scene: Object3D
  renderer?: WebGLRenderer
  targets?: readonly WebGLRenderTarget[]
}): DisposalReport {
  const report = disposeObject(input.scene)

  for (const target of input.targets ?? []) {
    target.dispose()
    report.renderTargets += 1
  }

  if (input.renderer !== undefined) {
    input.renderer.dispose()
    input.renderer.forceContextLoss()
  }

  return report
}

/**
 * Backend de scene 3D.
 *
 * ## Un point de rupture, pas un simple sous-module
 *
 * Cette entree est separee de l'entree principale pour une raison mesurable :
 * le moteur de rendu 3D pese entre 120 et 140 kilo-octets compresses, un ordre
 * de grandeur au-dessus du backend leger. Un site qui n'affiche qu'une
 * animation de texte ne doit pas en telecharger une ligne.
 *
 * La separation est doublee d'un import dynamique a l'interieur meme du hook :
 * importer ce module ne suffit pas a faire entrer le moteur de rendu dans le
 * fragment initial. Un test verifie les deux garanties sur le bundle produit.
 *
 * ## Quand l'employer
 *
 * La question a se poser : **une camera et un eclairage sont-ils reellement
 * necessaires ?** Si la reponse est non — un degrade anime, un champ de bruit,
 * une distorsion plein ecran — le backend leger suffit, pour douze
 * kilo-octets.
 *
 * @example
 * import { useScene, useCameraRig } from 'odoro-engine/three'
 *
 * @module
 */

export {
  useScene,
  type SceneContext,
  type SceneFrame,
  type SceneHandle,
  type SceneOptions,
} from './use-scene.js'

export { useCameraRig, type CameraRigOptions } from './use-camera-rig.js'

export {
  useScrollCamera,
  type CameraKeyframe,
  type ScrollCameraOptions,
} from './use-scroll-camera.js'

export {
  disposeMaterial,
  disposeObject,
  disposeScene,
  type DisposalReport,
} from './dispose.js'

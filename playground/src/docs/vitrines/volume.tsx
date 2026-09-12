/**
 * Le volume : les objets en trois dimensions des vitrines.
 *
 * ## Pourquoi une piece de plus, et pas un fond de plus
 *
 * Le registre a vingt fonds en three.js, et ce sont des **decors** : ils
 * remplissent un cadre, on passe devant. Ce module sert l inverse — un
 * **objet** qu on regarde, qu on tourne, dont on fait le tour au defilement.
 * Une bague, un flacon, une maquette de batiment. C est ce qu attend une page
 * de produit en 2026, et aucun fond ne le remplace.
 *
 * ## Ce que l arbitre autorise
 *
 * Le moteur accorde **deux surfaces graphiques par page, une par technologie**.
 * Une vitrine qui porte deja un fond en shader — Crystal, LiquidChrome,
 * WaterSurface — peut donc recevoir en plus un objet en three.js. Une vitrine
 * dont le fond est deja en three.js — Cubes, Ballpit, OrbitRings — doit
 * choisir : le decor ou l objet. En pratique l objet gagne, parce qu il porte
 * le propos.
 *
 * ## Le repli n est pas une option
 *
 * Sous mouvement reduit, sans WebGL, ou quand le plafond est atteint, la scene
 * est **refusee** et `repli` est rendu a sa place. Une page dont le sujet
 * disparait avec la 3D n a pas de sujet : le repli doit montrer la meme chose,
 * en image ou en dessin.
 *
 * @module
 */

import {
  useScene,
  useScrollCamera,
  type CameraKeyframe,
  type SceneContext,
  type SceneFrame,
} from '@odoro-cli/engine/three'
import { useState, type CSSProperties, type ReactElement, type ReactNode } from 'react'

/** Ce qu une scene rend a la page qui la porte. */
export interface Piece {
  /** Ce qui tourne : le groupe racine de l objet. */
  readonly objet: unknown
}

/**
 * Un objet en trois dimensions, arbitre, replie et pilotable au defilement.
 *
 * @example
 * <Volume
 *   nom="gemme"
 *   className="o-absolute o-inset-0"
 *   piste={piste}
 *   trajectoire={[
 *     { at: 0, position: [0, 0.6, 4.2] },
 *     { at: 1, position: [2.4, -0.4, 2.6] },
 *   ]}
 *   construire={({ scene, three }) => {
 *     scene.add(new three.Mesh(geometrie, matiere))
 *   }}
 *   animer={({ scene }, { delta }) => {
 *     scene.rotation.y += delta * 0.3
 *   }}
 *   repli={<img src={photo('cobalt-atelier')} alt="La piece, de trois quarts" />}
 * />
 */
export function Volume({
  construire,
  animer,
  trajectoire,
  piste,
  debut,
  fin,
  repli,
  nom,
  className,
  style,
}: {
  /** Monte l objet. Peut rendre une fonction de demontage. */
  readonly construire: (contexte: SceneContext) => void | (() => void)
  /** Appele a chaque image, dans la meme frame que le rendu. */
  readonly animer?: (contexte: SceneContext, image: SceneFrame) => void
  /**
   * Trajectoire de camera pilotee par le defilement. Sans elle, la camera
   * reste ou `construire` l a posee.
   */
  readonly trajectoire?: readonly CameraKeyframe[]
  /**
   * L element dont le defilement pilote la trajectoire.
   *
   * **A donner des qu on emploie `trajectoire`.** Par defaut c est l enveloppe
   * du canevas — et elle fait la taille de l ecran, puisque c est elle qui
   * dimensionne le rendu. Sa course vaut alors `hauteur - fenetre`, soit zero
   * ou moins : la camera ne bouge jamais. Il faut donc designer la **piste**,
   * c est-a-dire l element plus haut qu un ecran qui porte la scene collee —
   * typiquement l enveloppe d une section epinglee. On la tient par un etat :
   * `const [piste, setPiste] = useState<HTMLElement | null>(null)`, puis
   * `<div ref={setPiste}>`.
   */
  readonly piste?: HTMLElement | null
  /** Debut de la plage observee sur la piste. @defaultValue 'top top' */
  readonly debut?: string
  /** Fin de la plage observee sur la piste. @defaultValue 'bottom bottom' */
  readonly fin?: string
  /** Ce qui prend la place de la scene quand elle est refusee. */
  readonly repli: ReactNode
  /** Nom affiche dans le panneau de diagnostic du moteur. */
  readonly nom: string
  readonly className?: string
  readonly style?: CSSProperties
}): ReactElement {
  // La camera et l hote passent par l etat : `useScrollCamera` les recoit en
  // dependances, et une ref lue au montage serait encore vide.
  const [camera, setCamera] = useState<Parameters<typeof useScrollCamera>[0]['camera']>(null)
  const [hote, setHote] = useState<HTMLDivElement | null>(null)

  const { ref, refused } = useScene<HTMLDivElement>({
    name: nom,
    setup: (contexte) => {
      setCamera(contexte.camera)
      return construire(contexte)
    },
    frame: animer,
  })

  useScrollCamera({
    camera: trajectoire === undefined ? null : camera,
    host: piste ?? hote,
    keyframes: trajectoire ?? [],
    start: debut,
    end: fin,
    name: `camera ${nom}`,
  })

  if (refused !== undefined) {
    return (
      <div className={className} style={style}>
        {repli}
      </div>
    )
  }

  return (
    <div
      ref={(element) => {
        ref.current = element
        setHote(element)
      }}
      className={className}
      style={style}
      aria-hidden="true"
    />
  )
}

/* ============================ Les matieres ============================= */

/**
 * Trois lumieres qui font lire un volume : une cle, une de remplissage plus
 * froide, une de contour derriere. C est l eclairage de studio le plus court
 * qui donne encore du relief — sans lui, une forme metallique est une tache.
 *
 * Les couleurs sont des entiers, pas des jetons : une lumiere n est pas du
 * texte, elle ne se relit pas au theme. Les teintes de la vitrine passent par
 * la matiere de l objet, elle.
 */
export function eclairer(
  contexte: SceneContext,
  { cle = 0xffffff, remplissage = 0x8899bb, contour = 0xffffff, force = 1 } = {},
): void {
  const { scene, three } = contexte

  const ambiante = new three.AmbientLight(0xffffff, 0.35 * force)

  const principale = new three.DirectionalLight(cle, 2.6 * force)
  principale.position.set(2.5, 3.5, 2.5)

  const douce = new three.DirectionalLight(remplissage, 1.1 * force)
  douce.position.set(-3, -0.5, 1.5)

  const derriere = new three.DirectionalLight(contour, 2.2 * force)
  derriere.position.set(-1.5, 2, -3.5)

  scene.add(ambiante, principale, douce, derriere)
}

/**
 * La couleur d un jeton de palette, lue **une fois** au montage, pour une
 * matiere three.js.
 *
 * Une scene ne relit pas le CSS a chaque image : la valeur est resolue au
 * moment ou l objet est construit. Une vitrine qui change de teinte en cours
 * de route remonte la scene, ce que fait deja le selecteur de palette.
 */
export function teinte(jeton: string, repli = '#888888'): string {
  if (typeof window === 'undefined') return repli
  const valeur = getComputedStyle(document.documentElement).getPropertyValue(jeton).trim()
  if (valeur === '') return repli
  // Une couleur peut arriver en `oklch()` : le canevas la convertit, pas
  // three.js. On passe donc par un contexte de dessin, comme l audit de
  // contraste le fait deja.
  const pot = document.createElement('canvas').getContext('2d')
  if (pot === null) return valeur
  pot.fillStyle = '#000000'
  pot.fillStyle = valeur
  return pot.fillStyle
}

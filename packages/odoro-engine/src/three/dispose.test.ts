import type { Material, Object3D, Texture, WebGLRenderer, WebGLRenderTarget } from 'three'
import { describe, expect, it, vi } from 'vitest'

import { disposeObject, disposeScene } from './dispose.js'

/**
 * Doublure de texture.
 *
 * La reconnaissance se fait par signature — une methode de liberation, une
 * image, un mode d'enroulement — plutot que par nom de classe : les noms
 * changent d'une version a l'autre, la forme non.
 */
function fakeTexture(): Texture & { dispose: ReturnType<typeof vi.fn> } {
  return {
    dispose: vi.fn(),
    image: {},
    wrapS: 1000,
  } as unknown as Texture & { dispose: ReturnType<typeof vi.fn> }
}

/** Doublure de materiau, portant les textures qu'on lui donne. */
function fakeMaterial(
  textures: Record<string, Texture> = {},
): Material & { dispose: ReturnType<typeof vi.fn> } {
  return {
    dispose: vi.fn(),
    ...textures,
  } as unknown as Material & { dispose: ReturnType<typeof vi.fn> }
}

/** Doublure d'objet 3D, avec un parcours d'arbre minimal. */
function fakeObject(options: {
  geometry?: { dispose: ReturnType<typeof vi.fn> }
  material?: Material | Material[]
  children?: Object3D[]
}): Object3D {
  const children = options.children ?? []
  const self = {
    geometry: options.geometry,
    material: options.material,
    children,
    clear: vi.fn(),
    traverse(visit: (object: Object3D) => void) {
      visit(self as unknown as Object3D)
      for (const child of children) child.traverse(visit)
    },
  }
  return self as unknown as Object3D
}

describe('disposeObject', () => {
  it('libere geometrie, materiau et textures', () => {
    const geometry = { dispose: vi.fn() }
    const map = fakeTexture()
    const material = fakeMaterial({ map })

    const report = disposeObject(fakeObject({ geometry, material }))

    expect(geometry.dispose).toHaveBeenCalledTimes(1)
    expect(material.dispose).toHaveBeenCalledTimes(1)
    expect(map.dispose).toHaveBeenCalledTimes(1)
    expect(report).toMatchObject({ geometries: 1, materials: 1, textures: 1 })
  })

  it('trouve les textures quel que soit le nom de leur propriete', () => {
    // Les noms varient d'un materiau a l'autre et d'une version a l'autre :
    // en tenir la liste reviendrait a l'oublier a jour.
    const textures = {
      map: fakeTexture(),
      normalMap: fakeTexture(),
      envMap: fakeTexture(),
      uneTextureAuNomInattendu: fakeTexture(),
    }
    const material = fakeMaterial(textures)

    const report = disposeObject(fakeObject({ material }))

    for (const texture of Object.values(textures)) {
      expect(texture.dispose).toHaveBeenCalledTimes(1)
    }
    expect(report.textures).toBe(4)
  })

  it('descend dans tout l arbre', () => {
    const enfant = { dispose: vi.fn() }
    const petitEnfant = { dispose: vi.fn() }

    const report = disposeObject(
      fakeObject({
        children: [
          fakeObject({
            geometry: enfant,
            children: [fakeObject({ geometry: petitEnfant })],
          }),
        ],
      }),
    )

    expect(enfant.dispose).toHaveBeenCalled()
    expect(petitEnfant.dispose).toHaveBeenCalled()
    expect(report.geometries).toBe(2)
  })

  it('libere un tableau de materiaux', () => {
    const premier = fakeMaterial()
    const second = fakeMaterial()

    const report = disposeObject(fakeObject({ material: [premier, second] }))

    expect(premier.dispose).toHaveBeenCalled()
    expect(second.dispose).toHaveBeenCalled()
    expect(report.materials).toBe(2)
  })

  it('ne libere qu une fois une ressource partagee', () => {
    // Un materiau reutilise par cinquante instances ne doit pas etre libere
    // cinquante fois : les avertissements qui en resulteraient masqueraient de
    // vraies anomalies.
    const partage = fakeMaterial({ map: fakeTexture() })
    const geometrie = { dispose: vi.fn() }

    const report = disposeObject(
      fakeObject({
        geometry: geometrie,
        material: partage,
        children: [
          fakeObject({ geometry: geometrie, material: partage }),
          fakeObject({ geometry: geometrie, material: partage }),
        ],
      }),
    )

    expect(partage.dispose).toHaveBeenCalledTimes(1)
    expect(geometrie.dispose).toHaveBeenCalledTimes(1)
    expect(report).toMatchObject({ geometries: 1, materials: 1, textures: 1 })
  })

  it('detache le contenu apres le parcours', () => {
    const root = fakeObject({})
    disposeObject(root)
    expect(
      (root as unknown as { clear: ReturnType<typeof vi.fn> }).clear,
    ).toHaveBeenCalled()
  })

  it('tolere un objet sans ressource', () => {
    expect(() => disposeObject(fakeObject({}))).not.toThrow()
  })
})

describe('disposeScene', () => {
  it('libere les cibles de rendu, invisibles au parcours de la scene', () => {
    const cible = { dispose: vi.fn() } as unknown as WebGLRenderTarget

    const report = disposeScene({ scene: fakeObject({}), targets: [cible] })

    expect(cible.dispose).toHaveBeenCalledTimes(1)
    expect(report.renderTargets).toBe(1)
  })

  it('relache l emplacement de contexte aupres du navigateur', () => {
    // Sans cela, l'emplacement reste occupe jusqu'au ramassage du canevas, et
    // une page qui monte plusieurs scenes epuise le quota — le navigateur
    // perdant alors silencieusement la plus ancienne.
    const renderer = {
      dispose: vi.fn(),
      forceContextLoss: vi.fn(),
    } as unknown as WebGLRenderer

    disposeScene({ scene: fakeObject({}), renderer })

    expect(renderer.dispose).toHaveBeenCalledTimes(1)
    expect(renderer.forceContextLoss).toHaveBeenCalledTimes(1)
  })

  it('ne laisse rien vivre apres cent cycles', () => {
    let liberees = 0

    for (let i = 0; i < 100; i += 1) {
      const geometry = {
        dispose: vi.fn(() => {
          liberees += 1
        }),
      }
      disposeScene({ scene: fakeObject({ geometry, material: fakeMaterial() }) })
    }

    expect(liberees).toBe(100)
  })
})

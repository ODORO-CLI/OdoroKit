import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { describe, expect, it } from 'vitest'

import { inspectDependency, renderInteropProxy } from './interop.js'
import { depFileName } from './transform.js'

/** Racine du monorepo, ou react et esbuild sont reellement installes. */
const MONOREPO = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..', '..', '..')

describe('depFileName', () => {
  it('aplatit les sous-chemins', () => {
    // C'est ce qui rend l'URL servie exempte de segment de dossier : un module
    // servi sous `/@deps/react-dom/client` resoudrait son propre
    // `import './chunk-X.js'` en `/@deps/react-dom/chunk-X.js`, alors que le
    // fragment vit a la racine du cache.
    expect(depFileName('react-dom/client')).toBe('react-dom_client.js')
    expect(depFileName('react/jsx-dev-runtime')).toBe('react_jsx-dev-runtime.js')
  })

  it('ne laisse aucun separateur dans le nom produit', () => {
    for (const specifier of ['react', '@scope/paquet', 'a/b/c', 'odoro-libs/router']) {
      expect(depFileName(specifier)).not.toContain('/')
    }
  })
})

describe('inspectDependency', () => {
  it('detecte un paquet CommonJS et enumere ses exports nommes', () => {
    const info = inspectDependency('react', MONOREPO)

    expect(info.needsInterop).toBe(true)
    // Sans ces noms declares a la frontiere du module, le navigateur refuse de
    // lier `import { useState } from '/@deps/react.js'`.
    expect(info.namedExports).toContain('useState')
    expect(info.namedExports).toContain('useEffect')
    expect(info.namedExports).toContain('createElement')
  })

  it('n exige aucun intermediaire pour un module natif', () => {
    const info = inspectDependency('odoro-libs/router', MONOREPO)
    expect(info.needsInterop).toBe(false)
    expect(info.namedExports).toEqual([])
  })

  it('absorbe un specificateur introuvable', () => {
    const info = inspectDependency('paquet-qui-n-existe-pas', MONOREPO)
    expect(info.needsInterop).toBe(false)
  })

  it('remonte l arborescence comme le fait Node', () => {
    // La resolution ne s'arrete pas a la racine indiquee : elle remonte
    // jusqu'a trouver un `node_modules`. Un sous-dossier inexistant du
    // monorepo trouve donc quand meme react, et c'est bien le comportement
    // attendu — un projet imbrique herite des dependances de son parent.
    const info = inspectDependency('react', join(MONOREPO, 'sous-dossier', 'absent'))
    expect(info.needsInterop).toBe(true)
  })

  it('absorbe un sous-chemin non expose par le paquet', () => {
    const info = inspectDependency('react/interne-non-expose', MONOREPO)
    expect(info.needsInterop).toBe(false)
  })

  it('ecarte les cles qui ne sont pas des identifiants valides', () => {
    const info = inspectDependency('react', MONOREPO)
    for (const name of info.namedExports) {
      expect(name).toMatch(/^[A-Za-z_$][A-Za-z0-9_$]*$/)
      expect(name).not.toBe('default')
    }
  })
})

describe('renderInteropProxy', () => {
  it('re-exporte le defaut et les noms detectes', () => {
    const proxy = renderInteropProxy({
      specifier: 'react',
      needsInterop: true,
      namedExports: ['useState', 'useEffect'],
    })

    expect(proxy).toContain('import cjs from "react"')
    expect(proxy).toContain('export default cjs')
    expect(proxy).toContain('export const { useState, useEffect } = cjs')
  })

  it('omet la destructuration quand aucun nom n est detecte', () => {
    const proxy = renderInteropProxy({
      specifier: 'muet',
      needsInterop: true,
      namedExports: [],
    })

    expect(proxy).toContain('export default cjs')
    expect(proxy).not.toContain('export const {')
  })

  it('echappe correctement un specificateur a sous-chemin', () => {
    const proxy = renderInteropProxy({
      specifier: 'react-dom/client',
      needsInterop: true,
      namedExports: ['createRoot'],
    })

    expect(proxy).toContain('import cjs from "react-dom/client"')
  })
})

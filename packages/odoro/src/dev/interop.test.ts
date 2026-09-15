import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { describe, expect, it } from 'vitest'

import { inspectDependency, renderInteropProxy } from './interop.js'
import { depFileName } from './transform.js'

/** Root of the monorepo, where react and esbuild are really installed. */
const MONOREPO = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..', '..', '..')

describe('depFileName', () => {
  it('flattens the subpaths', () => {
    // That is what makes the served URL free of any directory segment: a module
    // served under `/@deps/react-dom/client` would resolve its own
    // `import './chunk-X.js'` to `/@deps/react-dom/chunk-X.js`, whereas the
    // chunk lives at the root of the cache.
    expect(depFileName('react-dom/client')).toBe('react-dom_client.js')
    expect(depFileName('react/jsx-dev-runtime')).toBe('react_jsx-dev-runtime.js')
  })

  it('leaves no separator in the produced name', () => {
    for (const specifier of [
      'react',
      '@scope/package',
      'a/b/c',
      '@odoro-cli/libs/router',
    ]) {
      expect(depFileName(specifier)).not.toContain('/')
    }
  })
})

describe('inspectDependency', () => {
  it('detects a CommonJS package and enumerates its named exports', () => {
    const info = inspectDependency('react', MONOREPO)

    expect(info.needsInterop).toBe(true)
    // Without those names declared at the module boundary, the browser refuses
    // to link `import { useState } from '/@deps/react.js'`.
    expect(info.namedExports).toContain('useState')
    expect(info.namedExports).toContain('useEffect')
    expect(info.namedExports).toContain('createElement')
  })

  it('requires no intermediate for a native module', () => {
    const info = inspectDependency('@odoro-cli/libs/router', MONOREPO)
    expect(info.needsInterop).toBe(false)
    expect(info.namedExports).toEqual([])
  })

  it('absorbs a specifier that cannot be found', () => {
    const info = inspectDependency('package-that-does-not-exist', MONOREPO)
    expect(info.needsInterop).toBe(false)
  })

  it('climbs the tree the way Node does', () => {
    // Resolution does not stop at the given root: it climbs until it finds a
    // `node_modules`. A non-existent subdirectory of the monorepo therefore
    // still finds react, and that is indeed the expected behaviour — a nested
    // project inherits the dependencies of its parent.
    const info = inspectDependency('react', join(MONOREPO, 'subdirectory', 'missing'))
    expect(info.needsInterop).toBe(true)
  })

  it('absorbs a subpath the package does not expose', () => {
    const info = inspectDependency('react/internal-not-exposed', MONOREPO)
    expect(info.needsInterop).toBe(false)
  })

  it('rejects the keys that are not valid identifiers', () => {
    const info = inspectDependency('react', MONOREPO)
    for (const name of info.namedExports) {
      expect(name).toMatch(/^[A-Za-z_$][A-Za-z0-9_$]*$/)
      expect(name).not.toBe('default')
    }
  })
})

describe('renderInteropProxy', () => {
  it('re-exports the default and the detected names', () => {
    const proxy = renderInteropProxy({
      specifier: 'react',
      needsInterop: true,
      namedExports: ['useState', 'useEffect'],
    })

    expect(proxy).toContain('import cjs from "react"')
    expect(proxy).toContain('export default cjs')
    expect(proxy).toContain('export const { useState, useEffect } = cjs')
  })

  it('omits the destructuring when no name is detected', () => {
    const proxy = renderInteropProxy({
      specifier: 'silent',
      needsInterop: true,
      namedExports: [],
    })

    expect(proxy).toContain('export default cjs')
    expect(proxy).not.toContain('export const {')
  })

  it('escapes a subpath specifier correctly', () => {
    const proxy = renderInteropProxy({
      specifier: 'react-dom/client',
      needsInterop: true,
      namedExports: ['createRoot'],
    })

    expect(proxy).toContain('import cjs from "react-dom/client"')
  })
})

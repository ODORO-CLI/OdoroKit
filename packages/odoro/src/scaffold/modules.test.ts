import { describe, expect, it } from 'vitest'

import {
  MODULES,
  DEFAULT_MODULES,
  MODULE_IDS,
  keepsRoutes,
  readModules,
  packagesFor,
  resolveModules,
  variantsFor,
} from './modules.js'

describe('the catalogue says what each box does', () => {
  it('ticks the libraries, the router and the icons', () => {
    expect(DEFAULT_MODULES).toEqual(['libs', 'router', 'icons'])
  })

  it('only promises a package for what is one', () => {
    // The router is a subpath of the libraries, the registry is copied by
    // `odoro add`: neither of them is a dependency.
    const withPackage = MODULES.filter((m) => m.packageName !== undefined).map(
      (m) => m.id,
    )
    expect(withPackage).toEqual(['libs', 'icons', 'engine'])
  })

  it('only announces packages of the family', () => {
    for (const module of MODULES) {
      if (module.packageName === undefined) continue
      expect(module.packageName.startsWith('@odoro-cli/')).toBe(true)
    }
  })
})

describe('the resolution makes the selection coherent', () => {
  it('lets a complete selection through', () => {
    const { modules, warnings } = resolveModules(['libs', 'router', 'icons'])
    expect(modules).toEqual(['libs', 'router', 'icons'])
    expect(warnings).toEqual([])
  })

  it('removes the router when the libraries go, and says so', () => {
    const { modules, warnings } = resolveModules(['router', 'icons'])
    expect(modules).toEqual(['icons'])
    expect(warnings).toHaveLength(1)
    expect(warnings[0]).toContain('@odoro-cli/libs/router')
  })

  it('always returns the catalogue order, whatever the input', () => {
    // Two identical selections must produce the same manifest: without a stable
    // order, the typing order would end up in the file.
    expect(resolveModules(['icons', 'libs']).modules).toEqual(
      resolveModules(['libs', 'icons']).modules,
    )
  })

  it('accepts an empty selection', () => {
    expect(resolveModules([]).modules).toEqual([])
  })
})

describe('the packages follow the selection', () => {
  it('adds nothing for the router, which comes with the libraries', () => {
    expect(packagesFor(['libs', 'router'])).toEqual(['@odoro-cli/libs'])
  })

  it('adds nothing for the registry, which is copied', () => {
    expect(packagesFor(['registre'])).toEqual([])
  })

  it('adds the engine when it is kept', () => {
    expect(packagesFor(['libs', 'engine'])).toEqual([
      '@odoro-cli/libs',
      '@odoro-cli/engine',
    ])
  })
})

describe('the variants follow from the three choices that touch the files', () => {
  it('keeps the template as it is with libraries and router', () => {
    expect(variantsFor(['libs', 'router', 'icons'])).toEqual([])
  })

  it('lays the variant without the router', () => {
    expect(variantsFor(['libs', 'icons'])).toEqual(['without-router'])
  })

  it('lays the variant without the libraries, router or not', () => {
    expect(variantsFor(['icons'])).toEqual(['without-libs'])
    expect(variantsFor([])).toEqual(['without-libs'])
  })

  it('adds the engine background when it is kept', () => {
    expect(variantsFor(['libs', 'router', 'engine'])).toEqual(['with-engine'])
  })

  it('lays the engine background last, so that it wins', () => {
    // A variant laid later overwrites what a previous one wrote at the same
    // path: the engine background must therefore come afterwards.
    expect(variantsFor(['libs', 'engine'])).toEqual(['without-router', 'with-engine'])
    expect(variantsFor(['engine'])).toEqual(['without-libs', 'with-engine'])
  })

  it('only keeps the routes when the router is there', () => {
    expect(keepsRoutes(['libs', 'router'])).toBe(true)
    expect(keepsRoutes(['libs'])).toBe(false)
  })
})

describe('the reading of --modules', () => {
  it('reads a comma-separated list', () => {
    expect(readModules('libs,router')).toEqual({ modules: ['libs', 'router'] })
  })

  it('tolerates spaces and empty entries', () => {
    expect(readModules(' libs , , icons ')).toEqual({ modules: ['libs', 'icons'] })
  })

  it('understands "none" as a choice, and not as an empty input', () => {
    expect(readModules('none')).toEqual({ modules: [] })
    expect(readModules('aucun')).toEqual({ modules: [] })
  })

  it('refuses an unknown name while saying which ones exist', () => {
    const read = readModules('libs,bits')
    expect(read.error).toContain('"bits"')
    expect(read.error).toContain(MODULE_IDS.join(', '))
  })
})

describe('the registry pulls in the engine', () => {
  it('adds the engine, and says so', () => {
    // 455 of the 461 entries import it: without it, `odoro add` would write
    // files the project would not know how to build.
    const { modules, warnings } = resolveModules(['libs', 'router', 'registre'])
    expect(modules).toContain('engine')
    expect(warnings.some((warning) => warning.includes('@odoro-cli/engine'))).toBe(true)
  })

  it('says nothing when the engine was already ticked', () => {
    const { modules, warnings } = resolveModules(['libs', 'engine', 'registre'])
    expect(modules).toContain('engine')
    expect(warnings).toEqual([])
  })

  it('leaves the engine alone when the registry is not kept', () => {
    expect(resolveModules(['libs', 'router']).modules).not.toContain('engine')
  })
})

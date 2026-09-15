import { describe, expect, it } from 'vitest'

import { readSuffix, urlModule, textModule, workerModule } from './suffixes.js'

describe('readSuffix', () => {
  it('separates the suffix from the path', () => {
    expect(readSuffix('./compute.ts?worker')).toEqual({
      suffix: 'worker',
      path: './compute.ts',
    })
  })

  it('recognises the three suffixes', () => {
    expect(readSuffix('./a.md?raw')?.suffix).toBe('raw')
    expect(readSuffix('./a.svg?url')?.suffix).toBe('url')
    expect(readSuffix('./a.ts?worker')?.suffix).toBe('worker')
  })

  it('sees nothing on an ordinary path', () => {
    expect(readSuffix('./a.ts')).toBeUndefined()
  })

  it('does not fire on an unknown suffix', () => {
    expect(readSuffix('./a.ts?inline')).toBeUndefined()
  })

  it('only fires at the end of the specifier', () => {
    // `?raw` in the middle of a path designates nothing: taking it for a suffix
    // would make the engine look for a file that does not exist.
    expect(readSuffix('./a.ts?raw&other')).toBeUndefined()
  })
})

describe('textModule', () => {
  it('escapes what would break the module', () => {
    const rendered = textModule('a "quote"\non two lines')
    expect(rendered).toBe('export default "a \\"quote\\"\\non two lines"\n')
  })
})

describe('urlModule', () => {
  it('returns the address as the default export', () => {
    expect(urlModule('/assets/logo-A1B2.svg')).toBe(
      'export default "/assets/logo-A1B2.svg"\n',
    )
  })
})

describe('workerModule', () => {
  it('returns a class, and not an instance', () => {
    // A worker is expensive and cannot be shared: returning the instance would
    // let the first caller decide for all the others.
    const rendered = workerModule('/assets/compute-A1B2.js')
    expect(rendered).toContain('export default class')
    expect(rendered).toContain('extends Worker')
  })

  it('loads the worker as a module', () => {
    // The file is served as a module: a classic worker could not read its first
    // `import`.
    expect(workerModule('/a.js')).toContain("type: 'module'")
  })

  it('lets the caller override the options', () => {
    expect(workerModule('/a.js')).toContain('...options')
  })
})

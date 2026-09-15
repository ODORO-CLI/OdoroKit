/**
 * The resolution of the stylesheet provider.
 *
 * ## Why these tests exist
 *
 * Because the flaw they close was **silent**. The engine looked for the
 * generator with `createRequire(...).resolve()`, which applies the CommonJS
 * resolution and requires a `require` condition in the `exports` field. A pure
 * ESM package declares none: the call threw, the engine read it as "no
 * generator installed", and fell back on pruning.
 *
 * Nothing failed. The build succeeded, the stylesheet was correct, and the
 * generation path was simply never taken. It took looking at the output of a
 * real deployment to notice.
 *
 * Hence the shape of these tests: they build packages on disk and check that
 * the resolution succeeds — a provider that is found must really be found, and
 * an absence must stay silent.
 *
 * @module
 */

import { mkdtemp, mkdir, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'

import { cssProviderFor } from './css-provider.js'

/** A throwaway project, with a package installed in its `node_modules`. */
async function project(options: {
  readonly exports?: unknown
  readonly body?: string
}): Promise<string> {
  const root = await mkdtemp(join(tmpdir(), 'odoro-provider-'))
  await writeFile(join(root, 'package.json'), JSON.stringify({ name: 'project' }))

  const packageDir = join(root, 'node_modules', '@odoro-cli', 'libs')
  await mkdir(packageDir, { recursive: true })

  await writeFile(
    join(packageDir, 'package.json'),
    JSON.stringify({
      name: '@odoro-cli/libs',
      version: '0.0.0',
      type: 'module',
      exports: {
        './package.json': './package.json',
        ...(options.exports === undefined ? {} : { './generator': options.exports }),
      },
    }),
  )

  if (options.body !== undefined) {
    await writeFile(join(packageDir, 'generator.js'), options.body)
  }

  return root
}

const RENDER = `export function renderUtilitiesFor(classes) {
  return [...classes].map((c) => '.' + c + '{}').join('\\n')
}`

afterEach(() => {
  // The temporary directories are left to the system: erasing them here would
  // slow the suite down without proving anything.
})

describe('the resolution', () => {
  it('finds a pure ESM package', async () => {
    // The flaw this file closes. An export without a `require` condition is the
    // **normal** case of a modern package, and it was precisely the one the old
    // resolution could not read.
    const root = await project({
      exports: { types: './generator.d.ts', import: './generator.js' },
      body: RENDER,
    })

    const provider = await cssProviderFor(root)

    expect(provider).toBeDefined()
    expect(provider?.renderUtilitiesFor(new Set(['o-flex']))).toBe('.o-flex{}')
  })

  it('accepts an export written as a string', async () => {
    const root = await project({ exports: './generator.js', body: RENDER })

    expect(await cssProviderFor(root)).toBeDefined()
  })

  it('accepts the `default` condition', async () => {
    const root = await project({
      exports: { default: './generator.js' },
      body: RENDER,
    })

    expect(await cssProviderFor(root)).toBeDefined()
  })
})

describe('an absence stays silent', () => {
  // The "package not installed at all" case is not exercised here, and that is
  // not an oversight: resolution climbs the parent directories, and under the
  // test runner an empty temporary directory still finds the workspace package.
  // The test would pass or fail depending on where the suite is run from —
  // which is worth less than no test at all.
  //
  // The cases below stay valid: a local `node_modules` masks the workspace one,
  // and it is indeed the local version that is read.

  it('returns undefined when the package does not expose the generator', async () => {
    const root = await project({})

    expect(await cssProviderFor(root)).toBeUndefined()
  })

  it('returns undefined when the expected function is missing', async () => {
    // Too old a version. Throwing here would break a build that worked
    // yesterday; pruning takes over.
    const root = await project({
      exports: { import: './generator.js' },
      body: 'export const somethingElse = 1',
    })

    expect(await cssProviderFor(root)).toBeUndefined()
  })

  it('returns undefined when the announced file does not exist', async () => {
    const root = await project({ exports: { import: './absent.js' } })

    expect(await cssProviderFor(root)).toBeUndefined()
  })
})

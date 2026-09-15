import { describe, expect, it } from 'vitest'

import {
  type OdoroPlugin,
  esbuildPluginsFrom,
  transformWith,
  transformHtmlWith,
} from './plugins.js'

const context = { id: '/project/src/a.ts', dev: true, ssr: false }

describe('transformWith', () => {
  it('returns nothing when no plugin answers', async () => {
    const plugins: OdoroPlugin[] = [{ name: 'silent', transform: () => null }]
    expect(await transformWith(plugins, 'const a = 1', context)).toBeUndefined()
  })

  it('returns nothing when no plugin transforms', async () => {
    expect(
      await transformWith([{ name: 'empty' }], 'const a = 1', context),
    ).toBeUndefined()
  })

  it('chains the plugins in declared order', async () => {
    const plugins: OdoroPlugin[] = [
      { name: 'one', transform: (code) => `${code}\n// one` },
      { name: 'two', transform: (code) => `${code}\n// two` },
    ]

    expect(await transformWith(plugins, 'a', context)).toBe('a\n// one\n// two')
  })

  it('keeps the chain alive through a silent plugin', async () => {
    const plugins: OdoroPlugin[] = [
      { name: 'one', transform: (code) => `${code}!` },
      { name: 'silent', transform: () => undefined },
      { name: 'two', transform: (code) => `${code}?` },
    ]

    expect(await transformWith(plugins, 'a', context)).toBe('a!?')
  })

  it('passes the context through', async () => {
    let seen: string | undefined
    const plugins: OdoroPlugin[] = [
      {
        name: 'probe',
        transform: (code, received) => {
          seen = received.id
          return code
        },
      },
    ]

    await transformWith(plugins, 'a', context)
    expect(seen).toBe('/project/src/a.ts')
  })

  it('names the faulty plugin in the error', async () => {
    // A trace that does not say which plugin failed forces you to remove them
    // one by one to find out which.
    const plugins: OdoroPlugin[] = [
      {
        name: 'broken',
        transform: () => {
          throw new Error('failed')
        },
      },
    ]

    await expect(transformWith(plugins, 'a', context)).rejects.toThrow(/"broken"/)
  })

  it('names the offending file too', async () => {
    const plugins: OdoroPlugin[] = [
      {
        name: 'broken',
        transform: () => {
          throw new Error('failed')
        },
      },
    ]

    await expect(transformWith(plugins, 'a', context)).rejects.toThrow(/a\.ts/)
  })

  it('accepts an asynchronous plugin', async () => {
    const plugins: OdoroPlugin[] = [
      { name: 'slow', transform: (code) => Promise.resolve(`${code}.`) },
    ]

    expect(await transformWith(plugins, 'a', context)).toBe('a.')
  })
})

describe('transformHtmlWith', () => {
  const page = { dev: false, route: '/' }

  it('returns the document untouched when nothing applies', async () => {
    expect(await transformHtmlWith([], '<html></html>', page)).toBe('<html></html>')
  })

  it('chains the transformations', async () => {
    const plugins: OdoroPlugin[] = [
      { name: 'one', transformIndexHtml: (html) => `${html}<!--1-->` },
      { name: 'two', transformIndexHtml: (html) => `${html}<!--2-->` },
    ]

    expect(await transformHtmlWith(plugins, 'x', page)).toBe('x<!--1--><!--2-->')
  })

  it('passes the route through', async () => {
    const plugins: OdoroPlugin[] = [
      { name: 'route', transformIndexHtml: (html, ctx) => `${html}${ctx.route}` },
    ]

    expect(await transformHtmlWith(plugins, 'x', { dev: false, route: '/a' })).toBe('x/a')
  })

  it('names the faulty plugin', async () => {
    const plugins: OdoroPlugin[] = [
      {
        name: 'broken',
        transformIndexHtml: () => {
          throw new Error('failed')
        },
      },
    ]

    await expect(transformHtmlWith(plugins, 'x', page)).rejects.toThrow(/"broken"/)
  })
})

describe('esbuildPluginsFrom', () => {
  it('gathers the declared escape hatches', () => {
    const plugins: OdoroPlugin[] = [
      { name: 'a', esbuild: [{ name: 'a1', setup: () => undefined }] },
      { name: 'b' },
      { name: 'c', esbuild: [{ name: 'c1', setup: () => undefined }] },
    ]

    expect(esbuildPluginsFrom(plugins).map((plugin) => plugin.name)).toEqual(['a1', 'c1'])
  })

  it('returns an empty list with no plugin', () => {
    expect(esbuildPluginsFrom([])).toEqual([])
  })
})

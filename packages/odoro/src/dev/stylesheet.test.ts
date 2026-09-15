import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { assembleStylesheet } from './stylesheet.js'

describe('assembleStylesheet', () => {
  let root: string

  beforeEach(() => {
    root = mkdtempSync(join(tmpdir(), 'odoro-css-'))
    mkdirSync(join(root, 'src', 'theme'), { recursive: true })
  })

  afterEach(() => {
    rmSync(root, { recursive: true, force: true })
  })

  const write = (path: string, content: string): string => {
    const full = join(root, path)
    writeFileSync(full, content, 'utf8')
    return full
  }

  it('inlines a relative import', async () => {
    write('src/theme/base.css', ':root { --a: 1 }')
    const stylesheet = write(
      'src/styles.css',
      "@import './theme/base.css';\nbody { margin: 0 }",
    )

    const { css } = await assembleStylesheet(stylesheet, root)
    expect(css).toContain('--a: 1')
    expect(css).toContain('margin: 0')
    expect(css).not.toContain('@import')
  })

  it('rewrites a relative address into a server URL', async () => {
    // Injected into a `<style>` tag, a relative address resolves against the
    // one of the page: `./background.png` written two directories down would be
    // looked up at the root of the site, and would paint nothing while
    // reporting nothing.
    write('src/theme/background.png', 'x')
    const stylesheet = write(
      'src/theme/card.css',
      'div { background: url(./background.png) }',
    )

    const { css } = await assembleStylesheet(stylesheet, root)
    expect(css).toContain('url(/src/theme/background.png)')
  })

  it('rewrites the addresses of the inlined stylesheet against its own directory', async () => {
    write('src/theme/background.png', 'x')
    write('src/theme/base.css', 'div { background: url(./background.png) }')
    const stylesheet = write('src/styles.css', "@import './theme/base.css';")

    const { css } = await assembleStylesheet(stylesheet, root)
    expect(css).toContain('url(/src/theme/background.png)')
  })

  it('leaves a remote address alone', async () => {
    const stylesheet = write(
      'src/styles.css',
      'div { background: url(https://example.dev/a.png) }',
    )

    const { css } = await assembleStylesheet(stylesheet, root)
    expect(css).toContain('url(https://example.dev/a.png)')
  })

  it('leaves a data address alone', async () => {
    const stylesheet = write(
      'src/styles.css',
      'div { background: url(data:image/gif;base64,AA) }',
    )

    const { css } = await assembleStylesheet(stylesheet, root)
    expect(css).toContain('url(data:image/gif;base64,AA)')
  })

  it('leaves a remote import as it is', async () => {
    // A remote font remains the browser's business: inlining it would mean
    // downloading it on every request.
    const stylesheet = write(
      'src/styles.css',
      "@import 'https://fonts.example.dev/a.css';\nbody { margin: 0 }",
    )

    const { css } = await assembleStylesheet(stylesheet, root)
    expect(css).toContain('@import')
  })

  it('keeps the conditions of a conditional import', async () => {
    // Losing them would apply rules written for print to the whole screen.
    write('src/theme/paper.css', 'body { color: black }')
    const stylesheet = write('src/styles.css', "@import './theme/paper.css' print;")

    const { css } = await assembleStylesheet(stylesheet, root)
    expect(css).toContain('@media print')
    expect(css).toContain('color: black')
  })

  it('does not loop on two stylesheets that import each other', async () => {
    // A common typo, which blocked the whole server.
    write('src/theme/a.css', "@import './b.css';\n.a { color: red }")
    write('src/theme/b.css', "@import './a.css';\n.b { color: blue }")
    const stylesheet = join(root, 'src', 'theme', 'a.css')

    const { css } = await assembleStylesheet(stylesheet, root)
    expect(css).toContain('.a')
    expect(css).toContain('.b')
  })

  it('names the files read, the stylesheet first', async () => {
    write('src/theme/base.css', ':root { --a: 1 }')
    const stylesheet = write('src/styles.css', "@import './theme/base.css';")

    const { files } = await assembleStylesheet(stylesheet, root)
    expect(files).toHaveLength(2)
    expect(files[0]).toBe(stylesheet)
  })

  it('leaves an unresolvable import as it is rather than failing', async () => {
    const stylesheet = write(
      'src/styles.css',
      "@import './missing.css';\nbody { margin: 0 }",
    )

    const { css } = await assembleStylesheet(stylesheet, root)
    expect(css).toContain('@import')
    expect(css).toContain('margin: 0')
  })
})

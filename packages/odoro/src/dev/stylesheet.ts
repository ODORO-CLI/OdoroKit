/**
 * Assembling a stylesheet, on the development side.
 *
 * ## Why it has to be assembled
 *
 * A stylesheet imported by a module is injected into a `<style>` tag. But a
 * `<style>` tag has no address: its relative paths resolve against the address
 * of **the page**, not against that of the file. An image written
 * `url(./background.png)` in `src/theme/card.css` was therefore looked up at
 * the root of the site, and an `@import './base.css'` pointed at an address
 * that did not exist.
 *
 * Nothing reported it: a rule that cannot find its image raises no error, it
 * just paints nothing. And the production build resolved correctly — the flaw
 * only existed in development, which is the worst shape it can take.
 *
 * The imports are therefore inlined, and the addresses rewritten as server
 * URLs.
 *
 * @module
 */

import { existsSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { dirname, resolve } from 'node:path'

import { fileToUrl, isBareSpecifier } from './transform.js'

/** An import, with its possible conditions. */
const IMPORT = /@import\s+(?:url\(\s*)?(['"])([^'"]+)\1\s*\)?\s*([^;]*);/g

/** An address inside a value. */
const URL_VALUE = /url\(\s*(['"]?)([^'")]+)\1\s*\)/g

/** What an address is not: a file to resolve. */
function isExternal(address: string): boolean {
  return (
    address.startsWith('data:') ||
    address.startsWith('http:') ||
    address.startsWith('https:') ||
    address.startsWith('//') ||
    address.startsWith('#')
  )
}

/**
 * Resolves a path written in a stylesheet.
 *
 * A relative path resolves against the file; a bare specifier goes through
 * package resolution, because a library stylesheet is imported like a module —
 * `@import '@odoro-cli/libs/styles.css'`.
 */
function resolveReference(reference: string, from: string): string | undefined {
  if (reference.startsWith('/')) return undefined

  if (isBareSpecifier(reference)) {
    try {
      return createRequire(from).resolve(reference)
    } catch {
      return undefined
    }
  }

  const path = resolve(dirname(from), reference)
  return existsSync(path) ? path : undefined
}

/** What the assembly produced. */
export interface Stylesheet {
  /** The CSS, imports inlined and addresses rewritten. */
  readonly css: string
  /** The files read, as absolute paths — the first is the stylesheet itself. */
  readonly files: readonly string[]
}

/**
 * Assembles a stylesheet: inlines its imports, rewrites its addresses.
 *
 * @param file Absolute path of the stylesheet.
 * @param root Project root, to convert the paths into URLs.
 *
 * @example
 * const { css, files } = await assembleStylesheet('/p/src/a.css', '/p')
 */
export async function assembleStylesheet(
  file: string,
  root: string,
): Promise<Stylesheet> {
  const files: string[] = []
  const seen = new Set<string>()

  const read = async (path: string): Promise<string> => {
    // An import cycle is not a rare project error: two stylesheets importing
    // each other are a common typo. The infinite loop that resulted from it,
    // on the other hand, blocked the whole server.
    if (seen.has(path)) return ''
    seen.add(path)
    files.push(path)

    const source = await readFile(path, 'utf8')
    const pieces: string[] = []
    let cursor = 0

    for (const found of source.matchAll(IMPORT)) {
      const reference = found[2]
      const conditions = (found[3] ?? '').trim()
      if (reference === undefined) continue

      pieces.push(source.slice(cursor, found.index))
      cursor = found.index + found[0].length

      const target = isExternal(reference) ? undefined : resolveReference(reference, path)

      if (target === undefined) {
        // Nothing to inline: the import is left as it is. A remote font or a
        // missing stylesheet remain the browser's business.
        pieces.push(found[0])
        continue
      }

      const content = await read(target)
      // A conditional import keeps its conditions: losing them would apply
      // rules written for print or for a breakpoint to the whole screen.
      pieces.push(conditions === '' ? content : `@media ${conditions} {\n${content}\n}`)
    }

    pieces.push(source.slice(cursor))

    return pieces.join('').replace(URL_VALUE, (whole, quote: string, address: string) => {
      if (isExternal(address) || address.startsWith('/')) return whole
      const target = resolveReference(address, path)
      if (target === undefined) return whole
      return `url(${quote}${fileToUrl(target, root)}${quote})`
    })
  }

  return { css: await read(file), files }
}
